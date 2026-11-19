# DEFORT AI TODO

## دخول آمن برمز وصول — Complete for v1
- عند زيارة الموقع تظهر شاشة `DEFORT AI` و`Enter the Future of Intelligence.` وحقل رمز الوصول.
- يتحقق الخادم من الرمز ولا يُضمّن القيمة في JavaScript أو HTML.
- عند النجاح تُنشأ جلسة HttpOnly موقعة ومحدودة الصلاحية.
- المحاولات المتكررة تُبطّأ وتعيد رسالة عامة دون كشف السر.

## مساحة العمل الأساسية — Complete for v1
- واجهة متجاوبة داكنة تجمع rail للمشاريع، chat canvas، وinspector للسياق.
- يدعم الموقع العربية والإنجليزية مع مفتاح تبديل، حفظ اللغة، واتجاه RTL/LTR.
- أوضاع Instant / Thinking / Deep Research / Coding / Engineering / Web Builder / Game Builder / 3D Creator / Autonomous ظاهرة وقابلة للاختيار.
- لكل وضع وصف حالة يميز المنفذ فعليًا عن المسارات التي تحتاج تكاملًا.
- عرض أدوات العقل المركزي، الوكلاء، الخط الزمني، وحالة الاتصال.

## LLM Chat — Complete for v1
- إرسال الرسائل إلى الخادم عبر مسار محمي.
- استدعاء Manus LLM الحقيقي مع تعليمات الوضع المختار.
- عرض حالات الانتظار والخطأ وإمكانية إعادة المحاولة.
- إظهار النموذج/المزود كما يعيده الخادم، دون اختراع اسم نموذج.
- Secure Cipher Lab يحلل Lua/Luau والكود والترميزات القابلة للعكس ضمن نطاق آمن.
- لا ينفذ كسر كلمات المرور أو brute force أو استخراج المفاتيح أو تجاوز DRM.
- رفع الصور وPDF وملفات Lua/Luau والكود إلى تخزين DEFORT مع تمرير الصور/الـPDF للنموذج ومحتوى النصوص للتحليل.
- GitHub Bridge يحفظ رابط المستودع والفرع محليًا ويمنع طلب رموز GitHub داخل الموقع؛ الدفع الفعلي يحتاج تفويض GitHub.

## Access roles — Complete for v1
- رمز الرئيس يتحقق عبر `DEFORT_ACCESS_CODE` الموجود كسر محمي.
- رمز VIP يتحقق عبر `DEFORT_VIP_ACCESS_CODE` الموجود كسر محمي.
- الجلسة تعرض الدور على الخادم وفي شارة مساحة العمل دون كشف الرموز في المصدر.

## مشاريع وسجل محلي — Partial / local-only for v1
- إنشاء مشروع محلي في الواجهة.
- حفظ المحادثات والمشاريع في localStorage للنسخة الأولى.
- إبقاء تصميم الترحيل لقاعدة البيانات موثقًا قبل الكتابة الدائمة.

## تكاملات مستقبلية — Open / needs external capability
- Deep Research بمصادر وروابط فعلية.
- Code Engine داخل بيئة تنفيذ معزولة.
- Orchestrated multi-agent execution and handoffs.
- File/image upload, model router, provider settings, game and 3D pipelines.
- Durable database-backed conversations and project memory.

## Release constraints
- لا نشر عام دون تفويض صريح.
- يجب أن يمر `pnpm check`, `pnpm build`, وhealth endpoint قبل checkpoint.
