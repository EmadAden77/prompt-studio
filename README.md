# Prompt Studio

تطبيق ويب عربي لإنشاء Prompts احترافية للصور مخصصة لـ ChatGPT وGemini.

## المميزات

- واجهة عربية متجاوبة للجوال والكمبيوتر.
- إنشاء وتعديل Prompts للصور.
- دعم ChatGPT وGemini.
- إعدادات للواقعية، المكان، الوقت، الملابس، الكاميرا، المقاس، زاوية السيلفي، الوضعية، التعبير، اتجاه النظر، الإضاءة والخلفية.
- رفع صورة مرجعية ومعاينتها محليًا داخل المتصفح.
- تثبيت صارم للهوية للشخص المرجعي.
- وضع تلقائي ذكي اختياري.
- FINAL PROMPT وNEGATIVE PROMPT بالإنجليزية.
- نسخ منفصل أو نسخ الكل.
- حفظ الإعدادات محليًا باستخدام localStorage.

## التشغيل محليًا

افتح ملف `index.html` مباشرة في المتصفح.

## GitHub Pages

المستودع يحتوي على workflow في `.github/workflows/pages.yml` للنشر التلقائي إلى GitHub Pages.

تم تفعيل GitHub Pages على مصدر GitHub Actions.

إذا لم يبدأ النشر تلقائيًا:

1. افتح Settings في المستودع.
2. افتح Pages.
3. تأكد أن Build and deployment مضبوط على GitHub Actions.
4. افتح Actions وشغّل workflow باسم `Deploy Prompt Studio to GitHub Pages` إذا لزم.

بعد نجاح النشر سيكون الموقع على:

`https://emadaden77.github.io/prompt-studio/`
