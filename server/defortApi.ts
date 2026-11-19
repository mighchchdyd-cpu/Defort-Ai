import type { Request, Response } from "express";
import { invokeLLM, listLLMModels, type Message } from "./_core/llm";
import { withDefortAccess } from "./_core/defortAccess";
import { storageGetSignedUrl, storagePut } from "./storage";

const modeInstructions: Record<string, string> = {
  instant: "Answer directly and concisely. Do not invent tools, sources, or completed actions.",
  thinking: "Analyze in clear stages, surface assumptions, and distinguish conclusions from uncertainty. Do not reveal hidden chain-of-thought; provide a concise rationale summary.",
  research: "Act as a research planner. State what would need web access, distinguish verified facts from hypotheses, and never fabricate citations or links.",
  coding: "Act as a principal software engineer. Provide production-minded code or a precise implementation plan, explain tradeoffs, and never claim to have run code unless it was actually run.",
  cipher: "Act as a safety-scoped code, encoding, and cryptography analyst. Classify input as source code, reversible encoding, hash, or protected ciphertext. You may explain and decode non-secret Base64, Hex, URL encoding, JSON, and JWT metadata. Never crack passwords, brute-force secrets, recover keys, bypass DRM, or decrypt protected data. For Lua and Luau, provide idiomatic, runnable examples and explain sandbox or runtime constraints. If the request asks to break protection, refuse that portion and offer a defensive or educational alternative.",
  engineering: "Act as a systems architect. Break the problem into contracts, dependencies, risks, and an executable next step.",
  web: "Act as a web product architect. Convert the request into user flows, components, responsive behavior, and an implementation sequence.",
  game: "Act as a game systems designer. Discuss mechanics, progression, technical constraints, and what requires an actual engine or asset pipeline.",
  threeD: "Act as a 3D technical director. Describe the asset or scene pipeline, formats, optimization, and what requires a real generation tool.",
  autonomous: "Act as DEFORT CORE. Choose the shortest honest path, delegate conceptually to the relevant specialists, describe their handoffs, and state which actions are actually available in this session.",
};
const allowedModes = new Set(Object.keys(modeInstructions));
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const allowedUploadTypes = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf", "text/plain", "text/markdown", "application/json", "text/javascript", "application/javascript", "text/x-lua", "text/x-lua-bytecode"]);
const codeExtensions = new Set(["lua", "luau", "js", "ts", "tsx", "jsx", "py", "rs", "cpp", "h", "json", "md", "txt"]);

type DefortAttachment = { name: string; mimeType: string; url: string; textPreview?: string };

function extractText(content: Message["content"]) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((part) => (typeof part === "object" && part.type === "text" ? part.text : "[non-text input]")).join("\n");
  return content.type === "text" ? content.text : "[non-text input]";
}

function normalizeMessages(input: unknown): Message[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((message): message is { role: "user" | "assistant"; content: Message["content"] } => {
      return Boolean(message && typeof message === "object" && (message as { role?: string }).role && ["user", "assistant"].includes((message as { role: string }).role) && ((typeof (message as { content?: unknown }).content === "string") || Array.isArray((message as { content?: unknown }).content)));
    })
    .slice(-24)
    .map((message) => ({ role: message.role, content: typeof message.content === "string" ? message.content.slice(0, 12000) : message.content }));
}

function safeAttachment(value: unknown): DefortAttachment | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<DefortAttachment>;
  if (typeof item.name !== "string" || typeof item.mimeType !== "string" || typeof item.url !== "string" || !item.url.startsWith("/manus-storage/")) return null;
  return { name: item.name.slice(0, 160), mimeType: item.mimeType, url: item.url, textPreview: typeof item.textPreview === "string" ? item.textPreview.slice(0, 20000) : undefined };
}

export function registerDefortApi(app: { post: Function; get: Function }) {
  app.post("/api/ai/upload", withDefortAccess(async (req: Request, res: Response) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim().slice(0, 160) : "attachment";
    const mimeType = typeof req.body?.mimeType === "string" ? req.body.mimeType.toLowerCase() : "";
    const encoded = typeof req.body?.data === "string" ? req.body.data : "";
    const raw = encoded.replace(/^data:[^;]+;base64,/, "");
    const extension = name.toLowerCase().split(".").pop() ?? "";
    if (!raw || !mimeType || (!allowedUploadTypes.has(mimeType) && !codeExtensions.has(extension))) {
      res.status(415).json({ error: "UNSUPPORTED_FILE", message: "Upload an image, PDF, text file, or supported code file." });
      return;
    }
    const data = Buffer.from(raw, "base64");
    if (!data.length || data.length > MAX_UPLOAD_BYTES) {
      res.status(413).json({ error: "FILE_TOO_LARGE", message: "Files must be smaller than 15 MB." });
      return;
    }
    try {
      const stored = await storagePut(`defort/uploads/${name.replace(/[^a-zA-Z0-9._-]/g, "_")}`, data, mimeType || "application/octet-stream");
      const isText = mimeType.startsWith("text/") || mimeType === "application/json" || codeExtensions.has(extension);
      res.json({ name, mimeType, url: stored.url, textPreview: isText ? data.toString("utf8", 0, Math.min(data.length, 20000)) : undefined });
    } catch (error) {
      console.error("[DEFORT] upload failed", error);
      res.status(502).json({ error: "UPLOAD_FAILED", message: "The file could not be stored. Try again." });
    }
  }));

  app.post("/api/ai/chat", withDefortAccess(async (req: Request, res: Response) => {
    const messages = normalizeMessages(req.body?.messages);
    const attachments = Array.isArray(req.body?.attachments) ? req.body.attachments.map(safeAttachment).filter(Boolean) as DefortAttachment[] : [];
    const requestedMode = typeof req.body?.mode === "string" ? req.body.mode : "instant";
    const mode = allowedModes.has(requestedMode) ? requestedMode : "instant";
    const language = req.body?.language === "ar" ? "ar" : "en";
    const prompt = messages.at(-1);
    if (!prompt || prompt.role !== "user") {
      res.status(400).json({ error: "INVALID_MESSAGES", message: "Add a user message before sending." });
      return;
    }

    const system = [
      "You are DEFORT AI, the honest central intelligence of an engineering command center.",
      "You are a real model call, but this application must not claim that unavailable tools, agents, web sources, code execution, or files were used.",
      "If a capability needs an external integration, say so plainly and provide the next useful artifact or plan.",
      "Use the selected operating mode below.",
      modeInstructions[mode] ?? modeInstructions.instant,
      language === "ar" ? "Respond in clear Modern Standard Arabic unless the user explicitly asks for another language." : "Respond in clear English unless the user explicitly asks for another language.",
      "Keep responses structured and useful. Prefer short headings and bullets when they improve clarity.",
    ].join("\n\n");

    try {
      const attachmentParts: Message["content"] = [];
      for (const attachment of attachments.slice(0, 6)) {
        if (attachment.textPreview) {
          attachmentParts.push({ type: "text", text: `Attached file: ${attachment.name}\n\n${attachment.textPreview}` });
        } else if (attachment.mimeType.startsWith("image/")) {
          const signedUrl = await storageGetSignedUrl(attachment.url.replace(/^\/manus-storage\//, ""));
          attachmentParts.push({ type: "image_url", image_url: { url: signedUrl, detail: "auto" } });
        } else if (attachment.mimeType === "application/pdf") {
          const signedUrl = await storageGetSignedUrl(attachment.url.replace(/^\/manus-storage\//, ""));
          attachmentParts.push({ type: "file_url", file_url: { url: signedUrl, mime_type: "application/pdf" } });
        }
      }
      const llmMessages = [{ role: "system" as const, content: system }, ...messages];
      if (attachmentParts.length && llmMessages.length) {
        const last = llmMessages[llmMessages.length - 1];
        const baseParts = typeof last.content === "string" ? [{ type: "text" as const, text: last.content }] : Array.isArray(last.content) ? last.content : [last.content];
        last.content = [...baseParts, ...attachmentParts];
      }
      const result = await invokeLLM({
        messages: llmMessages,
        maxTokens: 1600,
        ...(mode === "thinking" || mode === "engineering" ? { reasoning: { effort: "medium" } } : {}),
      });
      const choice = result.choices?.[0]?.message;
      const content = choice ? extractText(choice.content) : "";
      if (!content.trim()) {
        res.status(502).json({ error: "EMPTY_MODEL_RESPONSE", message: "The model returned no usable text. Try the same request again." });
        return;
      }
      res.json({ content, model: result.model || "platform-default", usage: result.usage ?? null, mode });
    } catch (error) {
      console.error("[DEFORT] LLM request failed", error);
      res.status(502).json({ error: "LLM_UNAVAILABLE", message: "The intelligence service is unavailable right now. Your message was not lost; retry when the service is ready." });
    }
  }));

  app.get("/api/ai/models", withDefortAccess(async (_req: Request, res: Response) => {
    try {
      const result = await listLLMModels();
      res.json({ models: result.data ?? [] });
    } catch (error) {
      console.error("[DEFORT] model catalog failed", error);
      res.status(502).json({ error: "MODEL_CATALOG_UNAVAILABLE", message: "The live model catalog is not available." });
    }
  }));
}
