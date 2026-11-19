import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";

const COOKIE_NAME = "defort_access_session";
const SESSION_TTL_MS = 1000 * 60 * 30;
const WINDOW_MS = 1000 * 60;
const MAX_ATTEMPTS = 6;

type Attempt = { count: number; resetAt: number };
export type AccessRole = "president" | "vip";
type SessionPayload = { sub: string; iat: number; exp: number; role: AccessRole };

const attempts = new Map<string, Attempt>();

const isPublicPreview = Boolean(process.env.MANUS_PROJECT_ID);
const cookieOptions = {
  httpOnly: true,
  sameSite: (isPublicPreview ? "none" : "lax") as "none" | "lax",
  secure: isPublicPreview,
  path: "/",
};

function getSecret() {
  const secret = process.env.DEFORT_SESSION_SECRET;
  if (!secret) throw new Error("DEFORT_SESSION_SECRET is not configured");
  return secret;
}

function base64url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function createSession(role: AccessRole) {
  const now = Date.now();
  const payload: SessionPayload = {
    sub: `access-${randomBytes(12).toString("hex")}`,
    iat: now,
    exp: now + SESSION_TTL_MS,
    role,
  };
  const encoded = base64url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

function parseCookies(header: string | undefined) {
  const result: Record<string, string> = {};
  for (const part of (header ?? "").split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) result[key] = decodeURIComponent(value);
  }
  return result;
}

function verifySession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.exp || payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function clientKey(req: Request) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function canAttempt(req: Request) {
  const now = Date.now();
  const key = clientKey(req);
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 0, resetAt: now + WINDOW_MS });
    return true;
  }
  return current.count < MAX_ATTEMPTS;
}

function recordAttempt(req: Request) {
  const key = clientKey(req);
  const current = attempts.get(key) ?? { count: 0, resetAt: Date.now() + WINDOW_MS };
  current.count += 1;
  attempts.set(key, current);
}

function clearAttempts(req: Request) {
  attempts.delete(clientKey(req));
}

export function hasAccess(req: Request) {
  return Boolean(verifySession(parseCookies(req.headers.cookie)[COOKIE_NAME]));
}

export function getAccessRole(req: Request): AccessRole | null {
  return verifySession(parseCookies(req.headers.cookie)[COOKIE_NAME])?.role ?? null;
}

function matchesSecret(submitted: string, expected: string) {
  const submittedBuffer = Buffer.from(submitted);
  const expectedBuffer = Buffer.from(expected);
  return Boolean(expected) && submittedBuffer.length === expectedBuffer.length && timingSafeEqual(submittedBuffer, expectedBuffer);
}

export const requireDefortAccess: RequestHandler = (req, res, next) => {
  if (!hasAccess(req)) {
    res.status(401).json({ error: "AUTH_REQUIRED", message: "Your DEFORT session has expired. Re-enter the access code." });
    return;
  }
  next();
};

export function registerDefortAccessRoutes(app: { post: Function; get: Function }) {
  app.post("/api/access/verify", (req: Request, res: Response) => {
    if (!canAttempt(req)) {
      res.status(429).json({ error: "TOO_MANY_ATTEMPTS", message: "Too many attempts. Try again in a minute." });
      return;
    }

    const submitted = typeof req.body?.code === "string" ? req.body.code.trim() : "";
    const presidentCode = process.env.DEFORT_ACCESS_CODE ?? "";
    const vipCode = process.env.DEFORT_VIP_ACCESS_CODE ?? "";
    recordAttempt(req);
    const role: AccessRole | null = matchesSecret(submitted, presidentCode)
      ? "president"
      : matchesSecret(submitted, vipCode)
        ? "vip"
        : null;

    if (!role) {
      res.status(401).json({ error: "INVALID_ACCESS_CODE", message: "The access code was not accepted." });
      return;
    }

    clearAttempts(req);
    const maxAge = SESSION_TTL_MS;
    res.cookie(COOKIE_NAME, createSession(role), { ...cookieOptions, maxAge });
    res.json({ ok: true, role, expiresAt: Date.now() + maxAge });
  });

  app.get("/api/access/status", (req: Request, res: Response) => {
    const session = verifySession(parseCookies(req.headers.cookie)[COOKIE_NAME]);
    res.json({ authenticated: Boolean(session), role: session?.role ?? null, expiresAt: session?.exp ?? null });
  });

  app.post("/api/access/logout", (_req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.json({ ok: true });
  });
}

export function withDefortAccess(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    requireDefortAccess(req, res, (error?: unknown) => {
      if (error) return next(error);
      return handler(req, res, next);
    });
  };
}

export function cleanupAccessAttempts() {
  const now = Date.now();
  for (const [key, value] of attempts.entries()) {
    if (value.resetAt <= now) attempts.delete(key);
  }
}

setInterval(cleanupAccessAttempts, WINDOW_MS).unref();
