# دليل ملفات DEFORT AI من الألف إلى الياء

هذا الدليل يشرح بنية مشروع DEFORT AI الحالي كما هو موجود في المستودع. المشروع تطبيق ويب مبني على React وTypeScript في الواجهة، وExpress وTypeScript في الخادم، مع Drizzle لقاعدة MySQL، وVite للبناء، وManus LLM للذكاء الاصطناعي.

## 1. كيف يعمل المشروع ككل؟

عند تشغيل `pnpm dev` يبدأ الخادم من `server/_core/index.ts` على المنفذ 3000. الخادم يشغّل Express، يسجل مسارات الصحة والمصادقة وDEFORT وOAuth وtRPC، ثم يشغّل Vite في وضع التطوير. Vite يخدم واجهة React من مجلد `client`.

المتصفح يفتح `client/src/main.tsx`، ثم `client/src/App.tsx`. المسار الرئيسي يعرض `client/src/pages/Home.tsx`. في البداية تتحقق الواجهة من جلسة DEFORT عبر `/api/access/status`. إذا لم توجد جلسة تظهر شاشة الرمز، وإذا نجح الرمز تظهر لوحة القيادة.

عند إرسال رسالة، ترسل الواجهة الطلب إلى `/api/ai/chat`. الخادم يتحقق من جلسة الرمز، يضيف تعليمات الوضع واللغة، ثم يستدعي `invokeLLM` في `server/_core/llm.ts`. النتيجة تعود إلى الواجهة وتُعرض بواسطة `Streamdown`.

## 2. أوامر التشغيل الأساسية

- `pnpm dev`: تشغيل التطوير مع إعادة تحميل تلقائي.
- `pnpm build`: بناء الواجهة وتجميع الخادم داخل `dist`.
- `pnpm start`: تشغيل نسخة الإنتاج من `dist/index.js`.
- `pnpm check`: فحص TypeScript بدون إخراج ملفات.
- `pnpm test`: تشغيل اختبارات Vitest.
- `pnpm db:migrate`: تطبيق migrations موجودة.
- `pnpm db:push`: توليد migration وتطبيق تغييرات Drizzle.

## 3. ملفات الجذر

### `.dockerignore`
يحدد الملفات التي لا تدخل إلى صورة Docker، مثل `node_modules` وملفات Git والملفات المؤقتة. الهدف تقليل حجم الصورة ومنع تسريب ملفات محلية.

### `.gitignore`
يحدد الملفات التي لا تُحفظ في Git، مثل الأسرار وملفات البيئة و`node_modules` ونتائج البناء.

### `.manus-starter-init.json`
بيانات تهيئة القالب الأصلي الخاص بمشروع Manus. يفيد في معرفة أن المشروع بدأ من قالب Web DB User.

### `.prettierignore` و`.prettierrc`
إعدادات وأثناءات Prettier لتنسيق الكود. لا تغيّر منطق التطبيق؛ تؤثر في شكل الملفات فقط.

### `Dockerfile`
تعليمات بناء نسخة الإنتاج:

1. استخدام Node 22.
2. تفعيل pnpm 10.18.
3. نسخ ملفات الاعتماديات.
4. تثبيت الحزم بقفل `pnpm-lock.yaml`.
5. نسخ المصدر.
6. تشغيل `pnpm build`.
7. تشغيل `dist/index.js` على المنفذ 3000.

### `README.md`
تعريف سريع بالمشروع وأوامر التشغيل. هو نقطة البداية للمطور الجديد.

### `TODO.md`
قائمة الميزات وحالتها. توضح ما اكتمل، مثل الدخول بالرمز، تعدد اللغات، Secure Cipher Lab، رفع الملفات، وأدوار الرئيس وVIP، وما يزال مفتوحًا مثل البحث الحقيقي وتنفيذ الكود المعزول.

### `PROJECT_GUIDE_AR.md`
هذا الملف؛ دليل عربي لبنية المشروع ووظيفة ملفاته.

### `app.config.ts`
إعدادات شعار المشروع. يحتوي على `logoUrl` المستخدم في metadata الخاصة بمنصة Manus. لا تضع فيه أسرارًا.

### `components.json`
إعدادات مكونات واجهة Radix/shadcn ومسارات aliases الخاصة بالواجهة.

### `drizzle.config.ts`
يربط Drizzle بمخطط قاعدة البيانات وملفات migrations وإعدادات اتصال MySQL.

### `package.json`
اسم المشروع، أوامر التشغيل، الاعتماديات، وإصدارات أدوات التطوير. أهم الاعتماديات: React، Express، Drizzle، tRPC، Vite، Vitest، Streamdown، Lucide، وZod.

### `pnpm-lock.yaml`
القفل الدقيق لإصدارات كل الحزم غير المباشرة. لا تعدله يدويًا؛ يتغير عند تثبيت أو تحديث حزمة عبر pnpm.

### `pnpm-workspace.yaml`
إعداد Workspace الخاص بـ pnpm. يحدد شكل المشروع متعدد الحزم إذا توسع لاحقًا.

### `template.json`
بيانات القالب والـ starter الأصلي. ليس ملف منطق أعمال أساسيًا.

### `titan-records.md`
سجل قرارات وتنفيذ Titan Web Forge، مثل ما تم بناؤه وما تم التحقق منه.

### `plan.md`
خطة المشروع الأصلية: النطاق، التصميم، المعمارية، الحدود، وما يحتاج تكاملات مستقبلية.

### `quality_report.md`
تقرير جودة يحتوي على أدلة الفحص والاختبارات، مثل نجاح TypeScript والبناء واختبارات الرموز ورفع Luau.

### `tsconfig.json`
إعداد TypeScript، مثل strict mode، aliases، الملفات المشمولة، وطريقة التحويل.

### `vite.config.ts`
إعداد Vite للواجهة: React plugin، aliases، ودمج التطوير مع خادم Express.

### `vite.config.ts.bak`
نسخة احتياطية من إعداد Vite. لا تستخدمها أثناء التشغيل العادي.

### `vitest.config.ts`
إعدادات Vitest ومكان الاختبارات وبيئة تشغيلها.

### `patches/wouter@3.7.1.patch`
Patch محلي لحزمة Wouter، غالبًا لمعالجة توافق مع نسخة القالب. يطبّقها pnpm أثناء التثبيت حسب إعداد المشروع.

## 4. الواجهة Frontend

### `client/index.html`
صفحة HTML الأساسية التي يحقن فيها Vite تطبيق React. تحتوي على root element وmetadata والعنوان.

### `client/public/.gitkeep`
ملف فارغ يحافظ على مجلد public في Git.

### `client/public/manus-routes.json`
Manifest لمسارات صفحات الموقع. حاليًا المسار الأساسي `/`. هذا الملف تستخدمه منصة Manus لاكتشاف مسارات الصفحات، وليس مسارات API.

### `client/public/__manus__/debug-collector.js`
أداة debug خاصة بالمعاينة. تجمع معلومات تشخيصية أثناء Preview، وليست منطقًا تجاريًا للموقع.

### `client/src/App.tsx`
نقطة تركيب التطبيق داخل React. يحدد تخطيط التطبيق أو يمرر الصفحة الأساسية ومكونات الأخطاء.

### `client/src/main.tsx`
نقطة الدخول الفعلية للمتصفح. تنشئ React root، تربط providers، وتتعامل مع أخطاء عدم التصريح في مسارات القالب.

### `client/src/pages/Home.tsx`
أهم ملف واجهة في DEFORT. يحتوي على:

- شاشة الدخول بالرمز.
- التبديل بين العربية والإنجليزية.
- اتجاه RTL/LTR.
- أدوار الرئيس وVIP.
- لوحة المشاريع.
- أوضاع Instant وThinking وResearch وCoding وEngineering وغيرها.
- محادثة LLM.
- Secure Cipher Lab.
- رفع الصور وPDF وLua/Luau وملفات الكود.
- GitHub Bridge لحفظ مستودع وفرع.
- حفظ المحادثات والمشاريع محليًا في localStorage.
- القفل وتسجيل الخروج.

هذا الملف كبير لأنه يجمع تجربة DEFORT الأساسية. عند التوسع يفضل تقسيمه إلى مكونات أصغر مثل `AccessGate` و`ChatWorkspace` و`AttachmentPicker` و`GitHubBridge`.

### `client/src/index.css`
نظام التصميم الكامل: الألوان الداكنة، البنفسجي الكهربائي، التخطيط، البطاقات، المحادثة، RTL، responsive mobile، Secure Cipher Lab، المرفقات، وشارة VIP/الرئيس.

### `client/src/pages/NotFound.tsx`
صفحة 404 للمسارات غير الموجودة.

### `client/src/pages/ComponentShowcase.tsx`
صفحة عرض لمكونات القالب UI. ليست جزءًا رئيسيًا من تجربة DEFORT، وتفيد في اختبار المكونات المرئية.

### `client/src/const.ts`
ثوابت الواجهة الخاصة بالمسارات العامة، إعداد OAuth، وروابط Manus عند استخدام مصادقة القالب.

### `client/src/platform.d.ts`
تعريفات TypeScript لمتغيرات وإعدادات منصة Manus التي يحقنها runtime في المتصفح.

### `client/src/lib/trpc.ts`
عميل tRPC للواجهة. يستخدم عند استدعاء router الخادم من React.

### `client/src/lib/utils.ts`
دوال مساعدة للواجهة، مثل دمج class names أو تنسيق props.

### `client/src/contexts/ThemeContext.tsx`
Context عام للثيم. DEFORT يستخدم تصميمًا داكنًا ثابتًا عمليًا، لكن القالب يحتفظ بهذا السياق للتوسع.

### `client/src/hooks/useComposition.ts`
Hook للتعامل مع إدخال النص في اللغات التي تستخدم IME، مثل العربية وبعض لوحات المفاتيح الآسيوية.

### `client/src/hooks/useMobile.tsx`
Hook لمعرفة ما إذا كانت الشاشة صغيرة وتغيير سلوك الواجهة.

### `client/src/hooks/usePersistFn.ts`
Hook يحافظ على مرجع ثابت لدالة مع تحديث منطقها الداخلي.

### `client/src/_core/hooks/useAuth.ts`
Hook مصادقة القالب Manus OAuth/tRPC. DEFORT الأساسي يستخدم رمز الجلسة الخاص به في `Home.tsx`، لذلك هذا الملف متاح لتكاملات القالب المستقبلية ولا يمثل بوابة DEFORT الحالية.

## 5. مكونات الواجهة

### `client/src/components/AIChatBox.tsx`
مكوّن محادثة عام من القالب. تجربة DEFORT الحالية تستخدم محادثة مخصصة داخل `Home.tsx`، لكن هذا المكوّن يصلح لإعادة الاستخدام.

### `client/src/components/DashboardLayout.tsx`
تخطيط Dashboard عام يعتمد على مصادقة Manus OAuth. ليس التخطيط الرئيسي لـ DEFORT.

### `client/src/components/DashboardLayoutSkeleton.tsx`
Skeleton يظهر أثناء تحميل Dashboard.

### `client/src/components/ErrorBoundary.tsx`
يمسك أخطاء React بدل انهيار الصفحة كاملة، ويعرض واجهة خطأ مناسبة.

### `client/src/components/ManusDialog.tsx`
حوار جاهز من القالب يعرض رسائل مرتبطة بتسجيل Manus أو الإجراءات التي تحتاج حسابًا.

### `client/src/components/Map.tsx`
مكوّن خرائط عام يعتمد على Google Maps proxy. ليس مستخدمًا في مساحة DEFORT الحالية.

### ملفات `client/src/components/ui/*`
هذه مكتبة مكونات UI جاهزة مبنية غالبًا على Radix وTailwind. وظيفة كل ملف:

- `accordion.tsx`: أقسام قابلة للفتح والإغلاق.
- `alert-dialog.tsx`: حوار تأكيد حساس.
- `alert.tsx`: رسائل تنبيه.
- `aspect-ratio.tsx`: الحفاظ على نسبة أبعاد.
- `avatar.tsx`: صور أو أحرف المستخدم.
- `badge.tsx`: شارات صغيرة.
- `breadcrumb.tsx`: مسار تنقل.
- `button.tsx`: زر موحد.
- `button-group.tsx`: مجموعة أزرار.
- `calendar.tsx`: تقويم.
- `card.tsx`: بطاقة محتوى.
- `carousel.tsx`: شرائح أفقية.
- `chart.tsx`: أساس مكونات الرسوم البيانية.
- `checkbox.tsx`: مربع اختيار.
- `collapsible.tsx`: محتوى قابل للطي.
- `command.tsx`: لوحة أوامر وبحث.
- `context-menu.tsx`: قائمة بزر الفأرة الأيمن.
- `dialog.tsx`: نافذة حوار.
- `drawer.tsx`: لوحة تسحب من طرف الشاشة.
- `dropdown-menu.tsx`: قائمة منسدلة.
- `empty.tsx`: حالة عدم وجود محتوى.
- `field.tsx`: أغلفة الحقول والنماذج.
- `form.tsx`: مكونات نماذج وربط validation.
- `hover-card.tsx`: بطاقة تظهر عند المرور.
- `input-group.tsx`: حقل مع أدوات جانبية.
- `input-otp.tsx`: إدخال رمز متعدد الخانات.
- `input.tsx`: حقل نصي.
- `item.tsx`: عنصر قائمة عام.
- `kbd.tsx`: عرض اختصار لوحة المفاتيح.
- `label.tsx`: تسمية حقل.
- `menubar.tsx`: شريط قوائم.
- `navigation-menu.tsx`: قائمة تنقل.
- `pagination.tsx`: صفحات.
- `popover.tsx`: نافذة منبثقة صغيرة.
- `progress.tsx`: شريط تقدم.
- `radio-group.tsx`: اختيارات أحادية.
- `resizable.tsx`: مناطق قابلة لتغيير الحجم.
- `scroll-area.tsx`: منطقة تمرير مخصصة.
- `select.tsx`: اختيار من قائمة.
- `separator.tsx`: فاصل مرئي.
- `sheet.tsx`: لوحة جانبية.
- `sidebar.tsx`: شريط جانبي.
- `skeleton.tsx`: شكل تحميل مؤقت.
- `slider.tsx`: شريط قيمة.
- `sonner.tsx`: إشعارات toast.
- `spinner.tsx`: مؤشر انتظار.
- `switch.tsx`: مفتاح تشغيل/إيقاف.
- `table.tsx`: جدول.
- `tabs.tsx`: تبويبات.
- `textarea.tsx`: حقل نص متعدد الأسطر.
- `toggle-group.tsx`: مجموعة مفاتيح.
- `toggle.tsx`: مفتاح تبديل.
- `tooltip.tsx`: تلميح صغير.

## 6. الخادم Backend

### `server/_core/index.ts`
نقطة تشغيل Express. يسجل JSON body parser، health endpoint، public platform config، DEFORT access routes، DEFORT AI routes، OAuth، tRPC، Vite أو الملفات الثابتة، ثم يبدأ الاستماع على `PORT`.

### `server/defortApi.ts`
مسارات الذكاء الخاصة بـ DEFORT:

- `POST /api/ai/upload`: يستقبل base64، يتحقق من النوع والحجم، ويرفع إلى Manus Storage.
- `POST /api/ai/chat`: يرسل الرسائل والمرفقات إلى LLM بعد التحقق من الجلسة.
- `GET /api/ai/models`: يعرض كتالوج النماذج.

يحتوي أيضًا على تعليمات الأوضاع، دعم العربية والإنجليزية، Secure Cipher Lab، ودعم الصور وPDF وملفات النص والكود.

### `server/_core/defortAccess.ts`
نظام دخول DEFORT الخاص، وليس OAuth:

- يتحقق من رمز الرئيس من `DEFORT_ACCESS_CODE`.
- يتحقق من رمز VIP من `DEFORT_VIP_ACCESS_CODE`.
- ينشئ cookie موقعة HMAC باسم `defort_access_session`.
- يضيف الدور `president` أو `vip` إلى الجلسة.
- يطبق انتهاء الجلسة وتحديد محاولات الدخول.
- يدعم `SameSite=None; Secure` عند العمل عبر HTTPS العام.

القيم نفسها لا توجد في Git أو JavaScript؛ تأتي من Secrets runtime.

### `server/_core/llm.ts`
عميل Manus LLM. يعرّف أنواع الرسائل، النصوص، الصور، والملفات، ثم ينفذ طلب OpenAI-compatible إلى خدمة Manus. يدعم reasoning، النماذج، الأدوات، structured output، والنتائج.

### `server/storage.ts`
مساعد التخزين:

- يحصل على رابط رفع presigned.
- يرفع bytes إلى التخزين.
- يرجع مسارًا ثابتًا مثل `/manus-storage/...`.
- يحصل على رابط signed مؤقت عند الحاجة لإرساله إلى LLM.

### `server/_core/storageProxy.ts`
يوفر redirect من مسارات التخزين إلى رابط التنزيل الموقّع. في النشر، منصة Manus تتعامل مع `/manus-storage` أيضًا.

### `server/_core/env.ts`
يقرأ متغيرات البيئة runtime مثل `MANUS_API_URL` و`MANUS_API_KEY` وقيم الخدمات. لا يضع القيم الحساسة داخل المصدر.

### `server/_core/publicConfig.ts`
يجهز فقط القيم المسموح ظهورها في المتصفح. لا يعرض مفاتيح الخادم.

### `server/_core/context.ts`
يبني سياق tRPC لكل request، مثل المستخدم المصادق وSDK.

### `server/_core/trpc.ts`
إعداد tRPC middleware وprotected procedures.

### `server/routers.ts`
تعريف إجراءات tRPC الخاصة بالتطبيق والقالب، مثل auth وsystem. DEFORT AI الأساسي يستخدم routes صريحة في `defortApi.ts`.

### `server/db.ts`
دوال قاعدة البيانات، مثل جلب المستخدم وإنشائه وتحديث آخر تسجيل دخول.

### `server/_core/oauth.ts`
مسار callback لمصادقة Manus OAuth. هو جزء من قالب Manus، وليس مطلوبًا للدخول برمز DEFORT.

### `server/_core/sdk.ts`
SDK الخادم للتعامل مع OAuth وManus API وقراءة هوية المستخدم.

### `server/_core/cookies.ts`
مساعدات cookie الخاصة بمسارات القالب.

### `server/_core/systemRouter.ts`
إجراءات نظام عامة من القالب، مثل معلومات البيئة أو الوظائف القياسية.

### `server/_core/dataApi.ts`
عميل API عام للتكاملات الخارجية والطلبات multipart.

### `server/_core/imageGeneration.ts`
مساعد توليد الصور عبر خدمة المنصة، مع حفظ ناتج URL أو الأصل في التخزين عند الحاجة.

### `server/_core/voiceTranscription.ts`
مساعد تحويل الصوت إلى نص. ليس جزءًا من محادثة DEFORT الحالية لكنه جاهز للتوسع.

### `server/_core/map.ts`
مساعد Google Maps proxy.

### `server/_core/notification.ts`
مساعد إرسال إشعارات عبر خدمة Manus.

### `server/_core/heartbeat.ts`
وظائف heartbeat أو اتصال دوري بخدمات المنصة.

### `server/_core/vite.ts`
يربط Vite مع Express في التطوير، ويخدم الملفات المبنية في الإنتاج.

### `server/_core/types/manusTypes.ts`
أنواع TypeScript لهوية مستخدم Manus وبيانات OAuth.

### `server/_core/types/cookie.d.ts`
توسعة تعريفات TypeScript الخاصة بالـ cookies في Express.

## 7. قاعدة البيانات وDrizzle

### `drizzle/schema.ts`
المخطط الحالي يحتوي جدول `users`:

- `id`: رقم المستخدم.
- `openId`: معرف Manus OAuth الفريد.
- `name`: الاسم.
- `email`: البريد.
- `loginMethod`: طريقة الدخول.
- `role`: user أو admin.
- `createdAt` و`updatedAt` و`lastSignedIn`.

المحادثات والمشاريع والمرفقات لا تُحفظ في جداول دائمة حاليًا؛ المحادثات والمشاريع في localStorage، والملفات في Manus Storage.

### `drizzle/relations.ts`
تعريف علاقات Drizzle بين الجداول. حاليًا بسيط لأن المشروع لا يحتوي جداول أعمال كثيرة.

### `drizzle/0000_initial_users.sql`
Migration SQL الأولى لإنشاء جدول users.

### `drizzle/meta/0000_snapshot.json`
Snapshot داخلي يستخدمه Drizzle لمعرفة حالة schema.

### `drizzle/meta/_journal.json`
سجل migrations المطبقة.

### `drizzle/migrations/.gitkeep`
يحافظ على مجلد migrations حتى لو لم توجد ملفات إضافية.

## 8. ملفات الاختبارات

### `server/platform.test.ts`
اختبارات تكامل للمنصة، مثل SDK والجلسات والتخزين.

### `server/auth.logout.test.ts`
يتحقق من أن تسجيل الخروج يمسح جلسة auth بطريقة صحيحة.

التحقق الذي تم أثناء التطوير شمل أيضًا `pnpm check` و`pnpm build` وطلبات فعلية لمسارات الرمز ورفع Luau وLLM.

## 9. GitHub والنشر

المستودع الحالي على GitHub هو:

`https://github.com/mighchchdyd-cpu/Defort-Ai`

GitHub يحتوي على نسخة المصدر، لكنه لا يحتوي على رموز DEFORT أو أسرار Manus. رموز الرئيس وVIP وسر الجلسة محفوظة في Secrets runtime داخل إعدادات المشروع.

ملف GitHub Bridge في `Home.tsx` يحفظ رابط المستودع والفرع محليًا في المتصفح. النقل الأولي للمصدر تم عبر GitHub connector. أي Push لاحق يحتاج تفويض GitHub صالحًا.

النشر العام شيء منفصل عن GitHub. الموقع المنشور على Manus، وGitHub هو مستودع المصدر.

## 10. ملفات السجلات والتشخيص

### `.manus-logs/browserConsole.log`
أخطاء وتحذيرات console من المعاينة.

### `.manus-logs/networkRequests.log`
طلبات الشبكة أثناء المعاينة.

### `.manus-logs/sessionReplay.log`
سجل إعادة تشغيل الجلسة أو التفاعل لأغراض التشخيص.

هذه الملفات مفيدة للتصحيح، ولا ينبغي وضع أسرار فيها أو مشاركتها علنًا.

## 11. ما الذي تعدله عادةً؟

- تصميم وتجربة DEFORT: `client/src/pages/Home.tsx` و`client/src/index.css`.
- مسارات الذكاء والمرفقات: `server/defortApi.ts`.
- الدخول والأدوار: `server/_core/defortAccess.ts`.
- تخزين الملفات: `server/storage.ts`.
- نماذج قاعدة البيانات: `drizzle/schema.ts` ثم migration.
- أوامر البناء: `package.json` و`Dockerfile`.
- metadata والشعار: `app.config.ts`.
- التوثيق: `README.md` و`TODO.md` و`quality_report.md`.

## 12. ما الذي لا ينبغي تعديله بلا سبب؟

- `pnpm-lock.yaml`: لا تعدله يدويًا.
- `drizzle/meta/*`: يولده Drizzle.
- `client/src/components/ui/*`: مكونات قالب؛ عدلها فقط عند الحاجة.
- `server/_core/sdk.ts` و`oauth.ts`: تغييرها قد يكسر OAuth القالب.
- `vite.config.ts` و`server/_core/vite.ts`: تغييرهما قد يكسر Preview أو build.
- الأسرار: لا تضعها في `.env` داخل Git أو في React أو الرسائل.
- ملفات `.manus-logs`: لا تضف فيها بيانات حساسة.

## 13. دورة تطوير آمنة

1. عدل المصدر.
2. شغّل `pnpm check`.
3. شغّل `pnpm test`.
4. شغّل `pnpm build`.
5. اختبر المسار المتأثر عبر HTTP أو الواجهة.
6. نفذ `git diff --check`.
7. ارفع commit إلى `main`.
8. انشر فقط عند وجود طلب صريح للنشر.

## 14. حدود النسخة الحالية

- لا يوجد تنفيذ كود Lua/Luau حقيقي داخل Sandbox؛ LLM يحلل ويولد الكود.
- Secure Cipher Lab لا يكسر حماية MoonSec أو IronBrew أو أي حماية للغير.
- لا يوجد حفظ دائم للمحادثات والمشاريع في قاعدة البيانات.
- GitHub Bridge يحفظ إعداد المستودع في المتصفح، أما Push الفعلي فيحتاج تفويض GitHub.
- البحث الخارجي الحقيقي يحتاج موصل Web/Search.
