import { useEffect, useMemo, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import {
  Activity,
  ArrowUpRight,
  Blocks,
  BrainCircuit,
  ChevronDown,
  CircleHelp,
  Code2,
  Compass,
  Cpu,
  FileCode2,
  FolderKanban,
  Gamepad2,
  Globe2,
  Hexagon,
  Layers3,
  Lightbulb,
  LogOut,
  Menu,
  MoreHorizontal,
  Network,
  PanelLeft,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  X,
  Zap,
} from "lucide-react";

type ModeKey = "instant" | "thinking" | "research" | "coding" | "engineering" | "web" | "game" | "threeD" | "autonomous" | "cipher";
type Language = "en" | "ar";
type AccessRole = "president" | "vip" | null;
type Message = { role: "user" | "assistant"; content: string; meta?: string };
type Attachment = { name: string; mimeType: string; url: string; textPreview?: string };
type Project = { id: string; name: string; detail: string; color: string };

const copy = {
  en: {
    privateBeta: "PRIVATE BETA · V1.0", coreNode: "CORE NODE / 01", encrypted: "ENCRYPTED CHANNEL", system: "DEFORT INTELLIGENCE SYSTEM", enter: "Enter the future", intelligence: "of intelligence.", landingDesc: "A command center for reasoning, research, engineering, and creation — orchestrated in one place.", accessCode: "Access code", accessPlaceholder: "Enter your private code", sessionNote: "Your session is encrypted and expires automatically.", beyond: "BEYOND ORDINARY INTELLIGENCE.", thinkBuild: "THINK BEYOND. BUILD EVERYTHING.", commandCenter: "Command center", workspace: "WORKSPACE", newProject: "New project", researchThreads: "Research threads", codeLab: "Code lab", agentRuns: "Agent runs", systemPosture: "System posture", ready: "Ready for direction", connected: "LLM core connected · 1 active node", lock: "Lock workspace", focus: "Focus mode", coreOnline: "Core online", liveThread: "LIVE THREAD", clear: "Clear", search: "Search", think: "Think", attach: "Attach", webConnector: "Web connector is not connected yet; this route will not claim live sources.", shiftEnter: "SHIFT + ENTER FOR NEW LINE", disclaimer: "DEFORT may make mistakes. Verify important outputs.", intelligenceLayer: "INTELLIGENCE LAYER", online: "ONLINE", orchestration: "Orchestration layer", activeSpecialists: "ACTIVE SPECIALISTS", assemble: "Assemble a specialist team", capability: "CAPABILITY LEDGER", details: "Details", modelReasoning: "Model reasoning", webResearch: "Web research", codeExecution: "Code execution", projectMemory: "Project memory", lastDecision: "LAST DECISION", privateWorkspace: "Private workspace", modePath: "path", direct: "Direct the", central: "Central intelligence · active", newThread: "New command thread", localHistory: "Thread settings are intentionally lightweight in v1. History is stored locally in this browser.", privateBetaNotice: "Private beta workspace · session is protected by the DEFORT access gate.", helpNotice: "DEFORT CORE is the central layer. Use the mode strip to route a request, and the capability ledger to see what is live versus connector-dependent.", inspectorNotice: "Inspector surfaces the current live path and connector-dependent capabilities.", ledgerNotice: "Model reasoning is live. Web research and code execution require their connectors. Project memory is local in v1.", fileNotice: "File inputs are planned for the next connector stage.", accessDenied: "Access denied.",
  },
  ar: {
    privateBeta: "نسخة تجريبية خاصة · 1.0", coreNode: "العقدة المركزية / 01", encrypted: "قناة مشفّرة", system: "منظومة DEFORT للذكاء", enter: "ادخل إلى مستقبل", intelligence: "الذكاء.", landingDesc: "مركز قيادة للتفكير والبحث والهندسة والإبداع — منسّق في مساحة واحدة.", accessCode: "رمز الوصول", accessPlaceholder: "أدخل رمزك الخاص", sessionNote: "جلستك مشفّرة وتنتهي تلقائيًا.", beyond: "ما وراء الذكاء الاعتيادي.", thinkBuild: "فكّر أبعد. ابنِ كل شيء.", commandCenter: "مركز القيادة", workspace: "مساحة العمل", newProject: "مشروع جديد", researchThreads: "مسارات البحث", codeLab: "مختبر البرمجة", agentRuns: "تشغيل الوكلاء", systemPosture: "حالة النظام", ready: "جاهز لتوجيهك", connected: "نواة LLM متصلة · عقدة نشطة واحدة", lock: "قفل مساحة العمل", focus: "وضع التركيز", coreOnline: "النواة متصلة", liveThread: "مسار حي", clear: "مسح", search: "بحث", think: "تفكير", attach: "إرفاق", webConnector: "موصل الويب غير متصل بعد؛ هذا المسار لن يدّعي وجود مصادر حية.", shiftEnter: "SHIFT + ENTER لسطر جديد", disclaimer: "قد يخطئ DEFORT. تحقّق من المخرجات المهمة.", intelligenceLayer: "طبقة الذكاء", online: "متصل", orchestration: "طبقة التنسيق", activeSpecialists: "الخبراء النشطون", assemble: "تجميع فريق خبراء", capability: "سجل القدرات", details: "التفاصيل", modelReasoning: "استدلال النموذج", webResearch: "بحث الويب", codeExecution: "تنفيذ الأكواد", projectMemory: "ذاكرة المشروع", lastDecision: "آخر قرار", privateWorkspace: "مساحة خاصة", modePath: "المسار", direct: "وجّه", central: "الذكاء المركزي · نشط", newThread: "مسار أوامر جديد", localHistory: "إعدادات المسار مبسطة في النسخة الأولى. يُحفظ السجل محليًا في هذا المتصفح.", privateBetaNotice: "مساحة تجريبية خاصة · الجلسة محمية ببوابة DEFORT.", helpNotice: "DEFORT CORE هي الطبقة المركزية. استخدم شريط الأوضاع لتوجيه الطلب وسجل القدرات لمعرفة ما هو متاح وما يحتاج موصلًا.", inspectorNotice: "يعرض المفتش المسار النشط والقدرات التي تعتمد على موصلات خارجية.", ledgerNotice: "استدلال النموذج متاح. بحث الويب وتنفيذ الأكواد يحتاجان موصلاتهما. ذاكرة المشروع محلية في النسخة الأولى.", fileNotice: "إرفاق الملفات مخطط له في مرحلة الموصلات القادمة.", accessDenied: "تم رفض الوصول.",
  },
} as const;

function t(language: Language, key: keyof typeof copy.en) {
  return copy[language][key];
}

const modes: Array<{ key: ModeKey; label: string; labelAr: string; icon: typeof Zap; description: string; capability: string }> = [
  { key: "instant", label: "Instant", labelAr: "فوري", icon: Zap, description: "Fast answers for focused tasks.", capability: "Live LLM" },
  { key: "thinking", label: "Thinking", labelAr: "تفكير", icon: BrainCircuit, description: "Layered reasoning with explicit assumptions.", capability: "Live LLM" },
  { key: "research", label: "Deep Research", labelAr: "بحث عميق", icon: Globe2, description: "Source-led research when web tools are connected.", capability: "Needs web connector" },
  { key: "coding", label: "Coding", labelAr: "برمجة", icon: Code2, description: "Code review, architecture, and implementation plans.", capability: "Live LLM" },
  { key: "cipher", label: "Secure Cipher Lab", labelAr: "مختبر الشيفرات الآمن", icon: ShieldCheck, description: "Authorized encoding, crypto metadata, and Lua/Luau analysis.", capability: "Safety-scoped analysis" },
  { key: "engineering", label: "Engineering", labelAr: "هندسة", icon: Blocks, description: "Systems thinking, contracts, and execution plans.", capability: "Live LLM" },
  { key: "web", label: "Web Builder", labelAr: "بناء المواقع", icon: Layers3, description: "Product flows and real web implementation guidance.", capability: "Live LLM" },
  { key: "game", label: "Game Builder", labelAr: "بناء الألعاب", icon: Gamepad2, description: "Game systems, loops, and engine-aware planning.", capability: "Planning mode" },
  { key: "threeD", label: "3D Creator", labelAr: "إنشاء 3D", icon: Hexagon, description: "Assets, scenes, materials, and optimization.", capability: "Needs 3D tool" },
  { key: "autonomous", label: "Autonomous", labelAr: "ذاتي", icon: Network, description: "A staged expert workflow with honest handoffs.", capability: "Orchestration preview" },
];

const starterProjects: Project[] = [
  { id: "defort", name: "DEFORT AI", detail: "Core workspace", color: "violet" },
  { id: "atlas", name: "Atlas Research", detail: "Deep research lab", color: "blue" },
  { id: "nexus", name: "Nexus OS", detail: "Systems architecture", color: "teal" },
];

const starterMessage: Message = {
  role: "assistant",
  content: "## Intelligence online\n\nI’m DEFORT CORE — the central layer for thinking, planning, and building.\n\nChoose an operating mode, then give me a goal. I’ll keep the path honest: live model work is available now; search, code execution, and specialist orchestration are surfaced as explicit next-stage capabilities until their real connectors are enabled.",
  meta: "DEFORT CORE · READY",
};

const starterMessageAr: Message = {
  role: "assistant",
  content: "## الذكاء متصل\n\nأنا DEFORT CORE — الطبقة المركزية للتفكير والتخطيط والبناء.\n\nاختر وضع التشغيل ثم أعطني هدفك. سأحافظ على مسار صادق: عمل النموذج متاح الآن، بينما البحث وتنفيذ الأكواد وتنسيق الخبراء تظهر كقدرات تحتاج موصلاتها الفعلية.",
  meta: "DEFORT CORE · جاهز",
};

function LogoMark({ small = false }: { small?: boolean }) {
  return (
    <div className={`logo-mark ${small ? "logo-mark--small" : ""}`} aria-hidden="true">
      <span className="logo-mark__orbit" />
      <span className="logo-mark__core" />
    </div>
  );
}

function CapabilityPill({ text, tone = "muted" }: { text: string; tone?: "muted" | "live" | "violet" }) {
  return <span className={`cap-pill cap-pill--${tone}`}><span className="cap-pill__dot" />{text}</span>;
}

function Landing({ onSuccess, language, onLanguageChange }: { onSuccess: () => void; language: Language; onLanguageChange: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/access/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Access denied.");
      onSuccess();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Access denied.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="landing-shell" dir={language === "ar" ? "rtl" : "ltr"} lang={language}>
      <div className="landing-glow landing-glow--one" />
      <div className="landing-glow landing-glow--two" />
      <header className="landing-topbar"><div className="brand-lockup"><LogoMark /><span>DEFORT <em>AI</em></span></div><div className="landing-topbar__actions"><button className="language-toggle" onClick={onLanguageChange} aria-label="Switch language">{language === "ar" ? "EN" : "ع"}</button><span className="landing-topbar__status"><i /> {t(language, "privateBeta")}</span></div></header>
      <section className="landing-card">
        <div className="landing-card__visual">
          <div className="visual-grid" />
          <div className="core-orb"><span className="core-orb__ring core-orb__ring--outer" /><span className="core-orb__ring core-orb__ring--inner" /><span className="core-orb__dot" /></div>
          <div className="visual-caption"><span>{t(language, "coreNode")}</span><span>{t(language, "encrypted")}</span></div>
        </div>
        <div className="landing-card__copy">
          <p className="eyebrow"><span className="eyebrow__line" /> {t(language, "system")}</p>
          <h1>{t(language, "enter")}<br /><span>{t(language, "intelligence")}</span></h1>
          <p className="landing-card__description">{t(language, "landingDesc")}</p>
          <form onSubmit={submit} className="access-form">
            <label htmlFor="access-code">{t(language, "accessCode")}</label>
            <div className={`access-input ${error ? "access-input--error" : ""}`}><ShieldCheck size={17} /><input id="access-code" type="password" autoComplete="off" value={code} onChange={(event) => setCode(event.target.value)} placeholder={t(language, "accessPlaceholder")} aria-describedby={error ? "access-error" : undefined} /><button type="submit" disabled={loading || !code.trim()} aria-label="Enter DEFORT AI">{loading ? <Activity className="spin" size={17} /> : <ArrowUpRight size={18} />}</button></div>
            {error && <p id="access-error" className="form-error" role="alert">{error}</p>}
            <p className="access-note"><ShieldCheck size={14} /> {t(language, "sessionNote")}</p>
          </form>
          <div className="landing-card__footer"><span>{t(language, "beyond")}</span><span>03 / 09 / 26</span></div>
        </div>
      </section>
      <footer className="landing-footer"><span>{t(language, "thinkBuild")}</span><span>DEFORT SYSTEMS © 2026</span></footer>
    </main>
  );
}

export default function Home() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [accessRole, setAccessRole] = useState<AccessRole>(null);
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem("defort-language") === "ar" ? "ar" : "en");
  const [mode, setMode] = useState<ModeKey>("instant");
  const [messages, setMessages] = useState<Message[]>(() => {
    try { return JSON.parse(localStorage.getItem("defort-messages") || "null") || [starterMessage]; } catch { return [starterMessage]; }
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    try { return JSON.parse(localStorage.getItem("defort-projects") || "null") || starterProjects; } catch { return starterProjects; }
  });
  const [activeProject, setActiveProject] = useState("defort");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [lastModel, setLastModel] = useState("platform default");
  const [panelNotice, setPanelNotice] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [githubRepo, setGithubRepo] = useState(() => localStorage.getItem("defort-github-repo") || "");
  const [githubBranch, setGithubBranch] = useState(() => localStorage.getItem("defort-github-branch") || "main");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cipherLanguage, setCipherLanguage] = useState("Lua / Luau");
  const [cipherInput, setCipherInput] = useState("");
  const [cipherResult, setCipherResult] = useState("");
  const [cipherBusy, setCipherBusy] = useState(false);

  const activeMode = useMemo(() => modes.find((item) => item.key === mode) ?? modes[0], [mode]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem("defort-language", language); } catch { /* language preference is optional */ }
    if (messages.length === 1 && (messages[0].content === starterMessage.content || messages[0].content === starterMessageAr.content)) {
      setMessages([language === "ar" ? starterMessageAr : starterMessage]);
    }
  }, [language]);

  async function refreshSession() {
    try {
      const response = await fetch("/api/access/status");
      const data = await response.json();
      setAuthenticated(Boolean(data.authenticated));
      setAccessRole(data.role === "president" || data.role === "vip" ? data.role : null);
    } catch {
      setAuthenticated(false);
      setAccessRole(null);
    }
  }

  useEffect(() => { void refreshSession(); }, []);

  useEffect(() => { try { localStorage.setItem("defort-messages", JSON.stringify(messages.slice(-50))); } catch { /* local persistence is optional */ } }, [messages]);
  useEffect(() => { try { localStorage.setItem("defort-projects", JSON.stringify(projects)); } catch { /* local persistence is optional */ } }, [projects]);

  async function sendMessage(content = input) {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;
    setError("");
    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode, language, attachments, messages: nextMessages.map(({ role, content: text }) => ({ role, content: text })) }) });
      const data = await response.json();
      if (response.status === 401) { setAuthenticated(false); throw new Error(data.message); }
      if (!response.ok) throw new Error(data.message || "The intelligence service is unavailable.");
      setLastModel(data.model || "platform default");
      setMessages((current) => [...current, { role: "assistant", content: data.content, meta: `${String(language === "ar" ? activeMode.labelAr : activeMode.label).toUpperCase()} · ${data.model || "PLATFORM DEFAULT"}` }]);
      setAttachments([]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally { setIsLoading(false); }
  }

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 6);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: Attachment[] = [];
      for (const file of files) {
        if (file.size > 15 * 1024 * 1024) throw new Error(language === "ar" ? "حجم الملف يجب أن يكون أقل من 15 ميغابايت." : "Each file must be smaller than 15 MB.");
        const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("file_read_failed")); reader.readAsDataURL(file); });
        const response = await fetch("/api/ai/upload", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: file.name, mimeType: file.type || "application/octet-stream", data }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || (language === "ar" ? "تعذر رفع الملف." : "The file could not be uploaded."));
        uploaded.push(result);
      }
      setAttachments((current) => [...current, ...uploaded].slice(0, 6));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : (language === "ar" ? "تعذر رفع الملف." : "The file could not be uploaded."));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function saveGithubSettings() {
    const normalized = githubRepo.trim();
    if (normalized && !/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(normalized)) {
      setPanelNotice(language === "ar" ? "أدخل رابط مستودع GitHub بصيغة https://github.com/owner/repository" : "Enter a repository URL like https://github.com/owner/repository");
      return;
    }
    localStorage.setItem("defort-github-repo", normalized);
    localStorage.setItem("defort-github-branch", githubBranch.trim() || "main");
    setPanelNotice(language === "ar" ? "تم حفظ إعدادات GitHub محليًا. الربط الفعلي يحتاج موصل GitHub مصرحًا به." : "GitHub settings saved locally. A connected GitHub authorization is still required for actual pushes.");
  }

  async function runCipherLab() {
    const trimmed = cipherInput.trim();
    if (!trimmed || cipherBusy) return;
    setCipherBusy(true);
    setCipherResult("");
    setError("");
    const safetyBrief = language === "ar"
      ? `أنت داخل Secure Cipher Lab. حلّل مدخلًا مصرّحًا به فقط، وحدد هل هو كود أو ترميز قابل للعكس أو بيانات مشفّرة. اللغة المستهدفة: ${cipherLanguage}. يمكنك شرح أو فك Base64 وHex وURL encoding وJSON وJWT metadata عندما لا يتطلب ذلك سرًا. ممنوع كسر كلمات المرور، brute force، استخراج المفاتيح، تجاوز DRM أو فك تشفير بيانات محمية. إذا كان المطلوب كسر حماية، ارفض ذلك وقدم بديلًا تعليميًا آمنًا. أعد: التصنيف، الملاحظات، كود Lua/Luau آمن إن كان مناسبًا، وخطوات تحقق محلية.`
      : `You are inside Secure Cipher Lab. Analyze only authorized input and classify it as source code, reversible encoding, or protected ciphertext. Target language: ${cipherLanguage}. You may explain or decode Base64, Hex, URL encoding, JSON, and JWT metadata when no secret is required. Do not crack passwords, brute-force, extract keys, bypass DRM, or decrypt protected data. If the request is for breaking protection, refuse and offer a safe educational alternative. Return: classification, findings, safe Lua/Luau code when useful, and local verification steps.`;
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: "cipher", language, messages: [{ role: "user", content: `${safetyBrief}\n\nINPUT:\n${trimmed.slice(0, 12000)}` }] }) });
      const data = await response.json();
      if (response.status === 401) { await refreshSession(); throw new Error(language === "ar" ? "انتهت جلسة DEFORT." : "Your DEFORT session has expired."); }
      if (!response.ok) throw new Error(data.message || (language === "ar" ? "تعذر تشغيل مختبر الشيفرات." : "The cipher lab is unavailable."));
      setCipherResult(data.content || "");
      setLastModel(data.model || "platform default");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : (language === "ar" ? "تعذر تشغيل مختبر الشيفرات." : "The cipher lab is unavailable."));
    } finally {
      setCipherBusy(false);
    }
  }

  function createProject() {
    const id = `project-${Date.now()}`;
    setProjects((current) => [...current, { id, name: language === "ar" ? `مشروع جديد ${current.length - 2}` : `Untitled project ${current.length - 2}`, detail: t(language, "newThread"), color: "violet" }]);
    setActiveProject(id);
    setMessages([language === "ar" ? starterMessageAr : starterMessage]);
  }

  async function logout() {
    try {
      const response = await fetch("/api/access/logout", { method: "POST" });
      if (response.ok) setAuthenticated(false);
      else setPanelNotice("The workspace could not be locked. Try again.");
    } catch {
      setPanelNotice("The workspace could not be reached. Try again.");
    }
  }

  if (authenticated === null) return <div className="loading-screen" role="status" aria-live="polite"><LogoMark /><span>INITIALIZING DEFORT CORE</span></div>;
  if (!authenticated) return <Landing onSuccess={() => void refreshSession()} language={language} onLanguageChange={() => setLanguage(language === "ar" ? "en" : "ar")} />;

  return (
    <main className={`app-shell ${sidebarOpen ? "app-shell--sidebar-open" : ""} ${focusMode ? "app-shell--focus" : ""}`}>
      <button className="mobile-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />
      <aside className="app-rail">
        <div className="rail-top"><div className="brand-lockup brand-lockup--app"><LogoMark small /><span>DEFORT <em>AI</em></span></div><button className="icon-button rail-close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={17} /></button></div>
        <div className="rail-label">{t(language, "workspace")} <button onClick={createProject} aria-label={t(language, "newProject")}><Plus size={14} /></button></div>
        <div className="project-list">{projects.map((project) => <button className={`project-row ${activeProject === project.id ? "project-row--active" : ""}`} key={project.id} onClick={() => { setActiveProject(project.id); setSidebarOpen(false); }}><span className={`project-dot project-dot--${project.color}`} /><span><strong>{project.name}</strong><small>{project.detail}</small></span>{activeProject === project.id && <span className="project-row__active" />}</button>)}</div>
        <button className="new-project" onClick={createProject}><Plus size={16} /> {t(language, "newProject")}</button>
        <div className="rail-divider" />
        <nav className="rail-nav" aria-label={t(language, "workspace")}><button className="rail-nav__item rail-nav__item--active"><Compass size={17} /><span>{t(language, "commandCenter")}</span><kbd>⌘ 1</kbd></button><button className="rail-nav__item" onClick={() => setMode("research")}><Search size={17} /><span>{t(language, "researchThreads")}</span></button><button className="rail-nav__item" onClick={() => setMode("coding")}><TerminalSquare size={17} /><span>{t(language, "codeLab")}</span></button><button className="rail-nav__item" onClick={() => setMode("autonomous")}><Network size={17} /><span>{t(language, "agentRuns")}</span></button></nav>
        <div className="rail-bottom"><div className="posture-card"><div className="posture-card__head"><span><i className="status-dot status-dot--live" /> {t(language, "systemPosture")}</span><MoreHorizontal size={16} /></div><strong>{t(language, "ready")}</strong><small>{t(language, "connected")}</small></div><button className="rail-nav__item" onClick={() => setFocusMode(!focusMode)}><PanelLeft size={17} /><span>{focusMode ? (language === "ar" ? "الخروج من التركيز" : "Exit focus mode") : t(language, "focus")}</span></button><button className="rail-nav__item" onClick={logout}><LogOut size={17} /><span>{t(language, "lock")}</span></button></div>
      </aside>

      <section className="workspace">
        <header className="workspace-header"><div className="workspace-header__left"><button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={19} /></button><div><p className="breadcrumb"><span>DEFORT AI</span><ChevronDown size={13} /><span className="breadcrumb__muted">{projects.find((project) => project.id === activeProject)?.name || t(language, "workspace")}</span></p><h2>{t(language, "commandCenter")}</h2></div></div><div className="workspace-header__right"><span className={`role-badge role-badge--${accessRole || "vip"}`}>{accessRole === "president" ? (language === "ar" ? "الرئيس" : "PRESIDENT") : (language === "ar" ? "عضو VIP" : "VIP MEMBER")}</span><button className="language-toggle language-toggle--app" onClick={() => setLanguage(language === "ar" ? "en" : "ar")} aria-label="Switch language">{language === "ar" ? "EN" : "ع"}</button><div className="header-status"><span className="status-dot status-dot--live" /> {t(language, "coreOnline")}</div><button className="icon-button" onClick={() => setPanelNotice(t(language, "helpNotice"))} aria-label="Open help"><CircleHelp size={18} /></button><button className="avatar-button" onClick={() => setPanelNotice(t(language, "privateBetaNotice"))} aria-label="Open user settings">MN</button></div></header>
        <div className="workspace-body">
          {panelNotice && <div className="panel-notice" role="status"><CircleHelp size={15} /><span>{panelNotice}</span><button onClick={() => setPanelNotice("")} aria-label="Dismiss notice"><X size={14} /></button></div>}
          <section className="command-canvas">
            <div className="canvas-intro"><div><p className="eyebrow"><span className="eyebrow__line" /> {activeMode.capability.toUpperCase()}</p><h1>{t(language, "direct")} <span>{language === "ar" ? "الذكاء." : "intelligence."}</span></h1><p className="canvas-intro__copy">{language === "ar" ? "أعطِ DEFORT هدفًا، وسيحدد أقصر مسار صادق من النية إلى التنفيذ." : "Give DEFORT a goal. It will map the shortest honest path from intent to execution."}</p></div><div className="canvas-intro__node"><div className="mini-orb"><span /></div><div><strong>DEFORT CORE</strong><small>{t(language, "central")}</small></div></div></div>
            <section className="cipher-lab" aria-labelledby="cipher-lab-title"><div className="cipher-lab__head"><div><span className="live-label"><i className="status-dot status-dot--live" /> {language === "ar" ? "مختبر آمن" : "SAFE LAB"}</span><h3 id="cipher-lab-title">{language === "ar" ? "محلل الشيفرات واللغات" : "Cipher & Language Intelligence"}</h3><p>{language === "ar" ? "حلّل كود Lua/Luau، الترميزات القابلة للعكس، وبيانات التشفير المصرّح بها — دون كسر كلمات المرور أو استخراج المفاتيح." : "Analyze Lua/Luau code, reversible encodings, and authorized crypto metadata — without cracking passwords or extracting keys."}</p></div><ShieldCheck size={22} /></div><div className="cipher-lab__controls"><select value={cipherLanguage} onChange={(event) => setCipherLanguage(event.target.value)} aria-label={language === "ar" ? "لغة التحليل" : "Analysis language"}><option>Lua / Luau</option><option>Python</option><option>JavaScript / TypeScript</option><option>C / C++</option><option>Rust</option><option>Base64 / Hex / JWT</option></select><button className="cipher-lab__run" onClick={() => void runCipherLab()} disabled={cipherBusy || !cipherInput.trim()}>{cipherBusy ? (language === "ar" ? "يحلل…" : "Analyzing…") : (language === "ar" ? "حلّل بأمان" : "Analyze safely")} <ArrowUpRight size={15} /></button></div><textarea className="cipher-lab__input" value={cipherInput} onChange={(event) => setCipherInput(event.target.value)} placeholder={language === "ar" ? "ألصق كود Lua/Luau أو Base64/Hex أو وصفًا تقنيًا…" : "Paste Lua/Luau, Base64/Hex, or a technical description…"} rows={3} aria-label={language === "ar" ? "مدخل المختبر" : "Cipher lab input"} />{cipherResult && <div className="cipher-lab__result"><div className="message-meta">{language === "ar" ? "نتيجة المختبر" : "LAB RESULT"}<span>{lastModel}</span></div><div className="markdown-body"><Streamdown>{cipherResult}</Streamdown></div></div>}</section>
            <section className="github-bridge" aria-labelledby="github-bridge-title"><div><span className="live-label"><i className="status-dot status-dot--live" /> GITHUB BRIDGE</span><h3 id="github-bridge-title">{language === "ar" ? "ربط الموقع أو البوت بـ GitHub" : "Connect the site or bot to GitHub"}</h3><p>{language === "ar" ? "احفظ المستودع والفرع لتجهيز مسار التصدير. الدفع الفعلي يحتاج تفويض GitHub، ولا نطلب رمزك داخل DEFORT." : "Save a repository and branch for the export path. Actual pushes require GitHub authorization; DEFORT never asks for your token."}</p></div><div className="github-bridge__form"><input value={githubRepo} onChange={(event) => setGithubRepo(event.target.value)} placeholder="https://github.com/owner/repository" aria-label="GitHub repository URL" /><input value={githubBranch} onChange={(event) => setGithubBranch(event.target.value)} placeholder="main" aria-label="GitHub branch" /><button onClick={saveGithubSettings}>{language === "ar" ? "حفظ الربط" : "Save link"}</button></div></section>
            <div className="mode-strip" role="tablist" aria-label="AI operating modes">{modes.map((item) => { const Icon = item.icon; return <button role="tab" aria-selected={mode === item.key} className={`mode-tab ${mode === item.key ? "mode-tab--active" : ""}`} key={item.key} onClick={() => setMode(item.key)}><Icon size={15} /><span>{language === "ar" ? item.labelAr : item.label}</span></button>; })}</div>
            <div className="conversation-card"><div className="conversation-card__head"><div><span className="live-label"><i className="status-dot status-dot--live" /> {t(language, "liveThread")}</span><span className="thread-title">{language === "ar" ? activeMode.labelAr : activeMode.label} {language === "ar" ? "جلسة" : "session"} <small>/{lastModel}</small></span></div><div className="thread-actions"><button className="text-button" onClick={() => setMessages([language === "ar" ? starterMessageAr : starterMessage])}>{t(language, "clear")}</button><button className="icon-button" onClick={() => setPanelNotice(t(language, "localHistory"))} aria-label="Open thread settings"><Settings2 size={17} /></button></div></div><div className="messages" aria-live="polite" aria-busy={isLoading}>{messages.map((message, index) => <article className={`message message--${message.role}`} key={`${message.role}-${index}`}><div className="message-avatar">{message.role === "assistant" ? <LogoMark small /> : "MN"}</div><div className="message-content"><div className="message-meta">{message.role === "assistant" ? message.meta || "DEFORT CORE" : "YOU"}<span>{message.role === "assistant" ? "" : "NOW"}</span></div>{message.role === "assistant" ? <div className="markdown-body"><Streamdown>{message.content}</Streamdown></div> : <p>{message.content}</p>}</div></article>)}{isLoading && <article className="message message--assistant"><div className="message-avatar"><LogoMark small /></div><div className="message-content"><div className="message-meta">DEFORT CORE <span>THINKING</span></div><div className="thinking-indicator" role="status" aria-live="polite"><i /><i /><i /><span>Mapping the next move…</span></div></div></article>}</div><div className="composer"><div className="composer__tools"><input ref={fileInputRef} type="file" hidden multiple accept="image/*,.pdf,.txt,.md,.json,.lua,.luau,.js,.ts,.tsx,.jsx,.py,.rs,.cpp,.h" onChange={handleFiles} /><button className="composer-tool" onClick={() => fileInputRef.current?.click()} disabled={uploading}><Paperclip size={16} /> {uploading ? (language === "ar" ? "يرفع…" : "Uploading…") : t(language, "attach")} <span className="tool-state">{attachments.length ? attachments.length : ""}</span></button><button className="composer-tool" onClick={() => setMode("research")}><Search size={16} /> {t(language, "search")} <span className="tool-state">{mode === "research" ? "ON" : ""}</span></button><button className={`composer-tool ${mode === "thinking" ? "composer-tool--active" : ""}`} onClick={() => setMode(mode === "thinking" ? "instant" : "thinking")}><BrainCircuit size={16} /> {t(language, "think")}</button></div>{attachments.length > 0 && <div className="attachment-list">{attachments.map((attachment) => <span className="attachment-chip" key={attachment.url}>{attachment.name}<button onClick={() => setAttachments((current) => current.filter((item) => item.url !== attachment.url))} aria-label={`Remove ${attachment.name}`}><X size={12} /></button></span>)}</div>}{mode === "research" && <div className="connector-note"><Globe2 size={13} /> {t(language, "webConnector")}</div>}<div className="composer__input"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder={language === "ar" ? `وجّه DEFORT في وضع ${(activeMode.labelAr || activeMode.label).toLowerCase()}…` : `Direct DEFORT in ${activeMode.label.toLowerCase()} mode…`} rows={1} aria-label="Message DEFORT AI" /><button className="send-button" onClick={() => void sendMessage()} disabled={isLoading || !input.trim()} aria-label="Send message"><Send size={17} /></button></div><div className="composer__footer"><span>{t(language, "shiftEnter")}</span><span><Sparkles size={12} /> {t(language, "disclaimer")}</span></div></div></div>{error && <div className="inline-error" role="alert"><Activity size={15} /> {error}<button onClick={() => setError("")} aria-label="Dismiss error"><X size={14} /></button></div>}
          </section>

          <aside className="inspector"><div className="inspector__header"><span>{t(language, "intelligenceLayer")}</span><button className="icon-button" onClick={() => setPanelNotice(t(language, "inspectorNotice"))} aria-label="Open inspector options"><MoreHorizontal size={16} /></button></div><div className="core-status-card"><div className="core-status-card__top"><div className="core-status-card__orb"><div className="mini-orb mini-orb--large"><span /></div></div><div><span className="live-label"><i className="status-dot status-dot--live" /> {t(language, "online")}</span><h3>DEFORT CORE</h3><p>{t(language, "orchestration")}</p></div></div><div className="core-metrics"><div><strong>01</strong><span>{language === "ar" ? "عقدة نشطة" : "active node"}</span></div><div><strong>09</strong><span>{language === "ar" ? "أوضاع تشغيل" : "operating modes"}</span></div><div><strong>∞</strong><span>{language === "ar" ? "سياق مستمر" : "context window"}</span></div></div></div><div className="inspector-section"><div className="section-label"><span>{t(language, "activeSpecialists")}</span><span>01 / 45</span></div><div className="specialist-row"><div className="specialist-icon"><BrainCircuit size={16} /></div><div><strong>{language === "ar" ? "رئيس الذكاء" : "Chief Intelligence"}</strong><small>{language === "ar" ? "القرار والتنسيق" : "Decision & coordination"}</small></div><span className="specialist-live"><i /> live</span></div><button className="ghost-row" onClick={() => setMode("autonomous")}><Plus size={15} /> {t(language, "assemble")} <ArrowUpRight size={14} /></button></div><div className="inspector-section"><div className="section-label"><span>{t(language, "capability")}</span><button className="text-button" onClick={() => setPanelNotice(t(language, "ledgerNotice"))}>{t(language, "details")}</button></div><div className="ledger-row"><span><Cpu size={15} /> {t(language, "modelReasoning")}</span><CapabilityPill text="live" tone="live" /></div><div className="ledger-row"><span><Globe2 size={15} /> {t(language, "webResearch")}</span><CapabilityPill text="connector" /></div><div className="ledger-row"><span><FileCode2 size={15} /> {t(language, "codeExecution")}</span><CapabilityPill text="sandbox" tone="violet" /></div><div className="ledger-row"><span><FolderKanban size={15} /> {t(language, "projectMemory")}</span><CapabilityPill text="local" /></div></div><div className="decision-card"><div className="decision-card__icon"><Lightbulb size={16} /></div><div><span>{t(language, "lastDecision")}</span><p>{language === "ar" ? "وجّه الطلبات القصيرة مباشرة، واستخدم الأوضاع الأعمق عندما تضيف قيمة." : "Route short requests directly. Use deeper modes only when they add signal."}</p><small>{language === "ar" ? "سياسة · ذكاء متكيف" : "Policy · Adaptive intelligence"}</small></div></div><div className="inspector-footer"><span><ShieldCheck size={14} /> {t(language, "privateWorkspace")}</span><span><Activity size={14} /> {language === "ar" ? activeMode.labelAr : activeMode.label} {t(language, "modePath")}</span></div></aside>
        </div>
      </section>
    </main>
  );
}
