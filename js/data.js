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
