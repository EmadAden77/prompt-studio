import { SCENES, LIGHTING_OPTIONS } from "./data-base-phase16.js";

export * from "./data-base-phase16.js";

Object.assign(SCENES, {
  majlis: {
    label: "مجلس سعودي",
    environment: "a Saudi majlis with cream walls, low velvet seating, brass dallah and incense burner, warm hidden lighting",
    clothing: [
      { value: "luxury-thobe", label: "ثوب فاخر", text: "luxury white Saudi thobe with fine weave and natural seated drape" },
      { value: "thobe-bisht", label: "ثوب مع بشت", text: "white thobe with brown bisht draped over shoulders, natural fabric folds" },
      { value: "thobe-redshemagh", label: "ثوب مع شماغ أحمر", text: "white thobe with red shemagh loosely arranged, natural head drape" },
      { value: "arabic-shirt", label: "قميص عربي مطرز", text: "embroidered Arabic cotton shirt with natural collar drape" },
      { value: "home-thobe", label: "ثوب منزلي", text: "relaxed home thobe with soft fabric and natural seated compression" },
      { value: "thobe-whiteghutra", label: "ثوب مع غترة بيضاء", text: "casual thobe with white ghutra, natural folds and drape" }
    ]
  },
  kashta: {
    label: "كشتة بر",
    environment: "a desert camp with a campfire, sandy ground, distant 4x4 vehicles, open starry or dusky sky",
    clothing: [
      { value: "hoodie-jeans", label: "هودي مع جينز", text: "heavy hoodie with dark jeans, sand dust on lower panels" },
      { value: "leather-jacket", label: "جاكيت جلدي", text: "brown leather jacket with natural wear and creasing" },
      { value: "casual-thobe", label: "ثوب كاجوال", text: "casual thobe with relaxed fit and natural outdoor drape" },
      { value: "shemagh-head", label: "شماغ على الرأس", text: "shemagh wrapped around head with casual tee underneath" },
      { value: "cap-tee", label: "قبعة مع تيشيرت", text: "cotton cap with relaxed T-shirt and casual trousers" },
      { value: "desert-athletic", label: "طقم رياضي صحراوي", text: "desert-toned athletic set with breathable technical fabric" }
    ]
  },
  barbershop: {
    label: "صالون حلاقة سعودي",
    environment: "a Saudi barbershop with a large mirror, chrome-and-leather barber chair, wall-mounted tool rack, and checkered floor tiles",
    clothing: [
      { value: "classic-shirt", label: "قميص كلاسيكي", text: "classic cotton button-up shirt with visible weave and natural elbow creasing" },
      { value: "polo-smart", label: "بولو أنيق", text: "smart piqué cotton polo with soft collar roll and natural torso folds" },
      { value: "thobe-casual", label: "ثوب كاجوال", text: "casual white thobe with breathable weave and relaxed seated drape" },
      { value: "hoodie-relaxed", label: "هودي مريح", text: "relaxed midweight cotton hoodie with softened cuffs and natural folds" },
      { value: "tee-casual", label: "تيشيرت كاجوال", text: "casual cotton T-shirt with slight collar wear and natural shoulder drape" },
      { value: "overshirt", label: "أوفرشيرت", text: "light cotton overshirt with textured weave and natural sleeve creasing" }
    ]
  },
  grocery: {
    label: "بقالة سعودية",
    environment: "a small Saudi grocery store with product shelves, a glass beverage cooler with soft interior light, a counter with a scale and stacked goods, and a checkered floor",
    clothing: [
      { value: "casual-tee", label: "تيشيرت كاجوال", text: "casual cotton T-shirt with visible knit and natural torso creasing" },
      { value: "thobe-quick", label: "ثوب خفيف", text: "light everyday thobe with breathable weave and relaxed errand drape" },
      { value: "hoodie-errand", label: "هودي خفيف", text: "lightweight hoodie with softened cuffs and natural pocket folds" },
      { value: "polo", label: "بولو", text: "cotton piqué polo with subtle texture and natural waist creasing" },
      { value: "shorts-tee", label: "تيشيرت وشورت", text: "cotton T-shirt with casual shorts, natural fabric folds and slight daily wear" },
      { value: "tracksuit", label: "بدلة رياضية", text: "light tracksuit with matte technical fabric and natural knee and elbow creasing" }
    ]
  }
});

Object.assign(LIGHTING_OPTIONS, {
  majlis: {
    night: [
      { value: "warm-sconces", label: "أباليك دافئة", text: "warm wall sconces create uneven pools of amber light across cream walls and low velvet seating, with soft falloff between fixtures" },
      { value: "incense-glow", label: "وهج بخور دافئ", text: "low warm practical light gathers around the incense burner and brass dallah, producing restrained metallic highlights and gentle room falloff" },
      { value: "mixed-warm", label: "إضاءة دافئة مختلطة", text: "warm sconces mix with hidden cove lighting, forming naturally uneven light pools across velvet, brass and plaster surfaces" }
    ],
    day: [
      { value: "window-daylight", label: "ضوء نافذة", text: "soft window daylight crosses the majlis from one side, revealing velvet weave, cream plaster texture and natural shadow depth" },
      { value: "open-shade", label: "ظل مفتوح", text: "open-shade daylight from the room opening creates gentle directional contrast across the seating and brass surfaces" }
    ]
  },
  kashta: {
    night: [
      { value: "campfire", label: "نار المخيم", text: "campfire light is the dominant warm source, flickering across nearby fabric and sand while the surrounding desert remains naturally dim" },
      { value: "starlight", label: "ضوء النجوم", text: "deep starlight shapes the open desert while a low campfire adds localized warm highlights near the seating area" },
      { value: "fire-stars", label: "نار ونجوم", text: "warm campfire flicker mixes with a clear starry sky, producing uneven light across faces, blankets, sand and vehicle surfaces" }
    ],
    day: [
      { value: "golden-sunset", label: "غروب ذهبي", text: "low golden sunset light rakes across dunes and fabric surfaces, revealing sand texture, tire tracks and long soft-edged shadows" },
      { value: "cold-dawn", label: "فجر بارد", text: "cool dawn light spreads low across the desert with long directional shadows and subtle warm color near the horizon" },
      { value: "hazy-morning", label: "صباح ضبابي", text: "hazy morning sunlight diffuses through fine desert dust, softening distant contrast while preserving texture on nearby sand and fabric" }
    ]
  },
  barbershop: {
    day: [
      { value: "overhead-led", label: "LED سقفي", text: "neutral overhead LED light spreads evenly across the mirror, chrome chair and checkered floor with gentle edge falloff" },
      { value: "window-daylight", label: "ضوء نافذة", text: "window daylight mixes with the interior light, revealing fabric weave, chrome reflections and natural mirror contrast" }
    ],
    night: [
      { value: "overhead-fluorescent", label: "فلورسنت سقفي", text: "cool overhead fluorescent light covers the room evenly with restrained reflections on chrome and mirror glass" },
      { value: "mixed-warm-fixtures", label: "إضاءة دافئة مختلطة", text: "cool ceiling light mixes with warmer wall fixtures, creating natural color variation across the mirror and chair" }
    ]
  },
  grocery: {
    day: [
      { value: "ceiling-fluorescent", label: "فلورسنت سقفي", text: "cool ceiling fluorescent light reaches the shelves, counter and checkered floor with soft practical falloff" },
      { value: "window-interior", label: "نافذة مع إضاءة داخلية", text: "window daylight blends with interior fixtures and the cooler glow for natural mixed illumination" }
    ],
    night: [
      { value: "cooler-warm-counter", label: "إضاءة مبرد مع كاونتر دافئ", text: "soft cooler light mixes with a warmer counter bulb while the shelves remain under subdued ceiling light" },
      { value: "fluorescent-only", label: "فلورسنت فقط", text: "cool fluorescent ceiling light provides practical even coverage across shelves, cooler glass and counter surfaces" }
    ]
  }
});

export const MAJLIS_MOODS = Object.freeze([
  { value: "hosting", label: "استضافة ضيوف" },
  { value: "family", label: "جلسة عائلية" },
  { value: "reading", label: "قراءة هادئة" },
  { value: "after-meal", label: "بعد الوجبة" },
  { value: "night-chat", label: "سمر ليلي" }
]);

export const KASHTA_MOODS = Object.freeze([
  { value: "fire-night", label: "ليلة حول النار" },
  { value: "dawn", label: "فجر البر" },
  { value: "sunset", label: "غروب" },
  { value: "foggy", label: "ضباب خفيف" }
]);

export const BARBERSHOP_MOODS = Object.freeze([
  { value: "fresh-cut", label: "بعد الحلاقة" },
  { value: "waiting", label: "انتظار" },
  { value: "styling", label: "ترتيب الشعر" }
]);

export const GROCERY_MOODS = Object.freeze([
  { value: "quick-stop", label: "توقف سريع" },
  { value: "browsing", label: "تصفح الرفوف" },
  { value: "paying", label: "عند الكاونتر" }
]);
