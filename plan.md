# DEFORT AI — Implementation Plan

## Scope
نسخة أولى قابلة للتشغيل من منصة DEFORT AI: شاشة دخول برمز وصول يتحقق على الخادم، جلسة موقعة محدودة، مساحة عمل محادثة حقيقية عبر Manus LLM، أوضاع تنفيذ واضحة، عرض نشاط العقل المركزي، سجل محادثات ومشاريع محلي، وإفصاح صريح عن الميزات المنفذة أو التي تحتاج تكاملًا خارجيًا.

## Assumptions and boundaries
- الأسماء المرجعية للنماذج في الطلب توجّه الرؤية فقط؛ لا تُعامل كواجهات API موجودة.
- نستخدم خدمة Manus LLM المدمجة عبر `MANUS_API_URL`/`MANUS_API_KEY` من الخادم، دون اختراع مزود أو مفتاح.
- البحث الخارجي، تنفيذ الكود، الوكلاء المتوازيون، الملفات، الألعاب و3D تعرض كمسارات جاهزة/حالات غير متصلة حتى تُربط بأدوات فعلية.
- رمز الوصول وسر الجلسة محفوظان كأسرار مشروع، لا في المصدر.

## Design
- **Design movement:** Cybernetic editorial / premium dark command center.
- **Core principles:** كثافة معلومات محسوبة، تباين هادئ، إشارات حالة واضحة، وحركة وظيفية قصيرة.
- **Color philosophy:** أسود فحمي كمساحة تفكير، فضي للنظام، بنفسجي كهربائي للقدرات، وأزرق سماوي للإشارات الحية.
- **Layout paradigm:** لوحة قيادة ثلاثية المناطق: rail للمشاريع، command canvas للمحادثة، وinspector للسياق/الوكلاء؛ على الهاتف تتحول إلى طبقات قابلة للفتح.
- **Signature elements:** شبكة ضوء شعاعية، شارة نبض للعقل المركزي، وخط زمني للمهام.
- **Interaction:** كل زر يغير حالة مرئية أو يشرح سبب عدم توفر المسار؛ لا عناصر شكلية بلا سلوك.
- **Animation:** fade/slide خفيفان، pulse محدود لحالة التفكير، احترام `prefers-reduced-motion`.
- **Typography:** Inter للنصوص وSpace Grotesk للعناوين والعلامة.
- **Brand essence:** غرفة عمليات ذكاء اصطناعي للفرق التي تريد التفكير والبناء في مساحة واحدة. الصفات: جريء، دقيق، هندسي.
- **Voice:** مباشر ومطمئن وغير متضخم. مثال: “Direct the intelligence.” و“Every decision leaves a trace.”
- **Wordmark:** رمز حرف D مبني من مسارين متقاطعين مع نقطة مركزية تمثل الـCore.
- **Signature color:** `#8B5CF6` electric violet.

## Architecture
- Frontend: React + TypeScript + Tailwind, route `/`.
- Backend: Express custom routes for access verification, session check, and LLM chat; existing tRPC/OAuth starter remains available for later account auth.
- Session: HMAC-signed, HttpOnly cookie `defort_access_session`, SameSite=None/Secure on public HTTPS Preview, short expiry, in-memory throttling.
- LLM: server-only call through existing `invokeLLM`; mode-specific system instructions and model metadata returned to UI.
- Data: managed MySQL is enabled; v1 stores UI history in localStorage while durable conversation/project tables remain a documented next increment.
- Files: `server/_core/index.ts`, `server/routers.ts` untouched except integration hooks; `client/src/pages/Home.tsx`, `client/src/index.css`, `client/src/App.tsx`, route manifest and docs.

## Open items
- Real access-code values are stored through protected input and are not visible to source review.
- Public deployment is not authorized; no publish action is taken.
- Durable database conversation schema, external search, sandboxed code runner, multi-agent execution, and provider management require the next implementation stage and/or additional platform integrations.
