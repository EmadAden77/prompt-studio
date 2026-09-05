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
  },
  rooftop: {
    label: "سطح المنزل",
    environment: "a Saudi home rooftop with water tanks, satellite dishes, a low perimeter wall, and the generic city skyline in the distance",
    clothing: [
      { value: "thobe-evening", label: "ثوب مسائي", text: "light evening thobe with breathable weave and natural wind-shaped folds" },
      { value: "tee-jeans", label: "تيشيرت وجينز", text: "cotton T-shirt with denim jeans showing natural knee creasing and daily wear" },
      { value: "hoodie-night", label: "هودي ليلي", text: "midweight hoodie with softened cuffs and natural shoulder folds" },
      { value: "shorts-casual", label: "شورت كاجوال", text: "casual cotton tee with relaxed shorts and natural fabric compression" },
      { value: "tracksuit", label: "بدلة رياضية", text: "matte technical tracksuit with natural elbow and knee creasing" },
      { value: "overshirt", label: "أوفرشيرت", text: "light cotton overshirt with visible weave and wind-softened sleeve folds" }
    ]
  },
  streetFootball: {
    label: "ملعب حارة",
    environment: "a Saudi neighborhood street football area with worn artificial turf, chain-link fence, low floodlights, and distant generic apartment buildings",
    clothing: [
      { value: "red-jersey", label: "قميص أحمر", text: "red football jersey with breathable mesh, light sweat darkening and natural wear" },
      { value: "green-jersey", label: "قميص أخضر", text: "green football jersey with textured mesh, light sweat marks and natural creasing" },
      { value: "white-training", label: "تدريب أبيض", text: "white training top with technical fabric, mild sweat shading and natural folds" },
      { value: "black-tracksuit", label: "بدلة سوداء", text: "black training tracksuit with matte technical fabric and worn knee creasing" },
      { value: "blue-jersey", label: "قميص أزرق", text: "blue football jersey with breathable weave, light sweat darkening and natural wear" },
      { value: "grey-training", label: "تدريب رمادي", text: "grey training set with soft technical fabric, mild sweat shading and ground dust" }
    ]
  },
  gasStation: {
    label: "محطة وقود",
    environment: "a Saudi gas station with fuel pumps, an overhead canopy with bright lighting, and a small convenience store with generic branding and glass front",
    clothing: [
      { value: "thobe-stop", label: "ثوب للتوقف", text: "everyday white thobe with breathable weave and natural standing folds" },
      { value: "tee-quick", label: "تيشيرت سريع", text: "casual cotton T-shirt with visible knit and natural torso creasing" },
      { value: "polo", label: "بولو", text: "cotton piqué polo with subtle texture and relaxed waist folds" },
      { value: "hoodie-night", label: "هودي ليلي", text: "midweight hoodie with softened cuffs and natural pocket creasing" },
      { value: "tracksuit", label: "بدلة رياضية", text: "matte technical tracksuit with natural elbow and knee folds" },
      { value: "jacket", label: "جاكيت", text: "light casual jacket with textured shell, softened edges and natural sleeve creasing" }
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
  },
  rooftop: {
    day: [
      { value: "clear-noon-sun", label: "شمس الظهر", text: "clear noon sun creates crisp rooftop contrast across the wall, tanks and dishes with natural heat-softened distance" },
      { value: "late-afternoon-gold", label: "ذهبي بعد العصر", text: "late afternoon golden light rakes across dusty concrete and rooftop fixtures with elongated soft-edged shadows" }
    ],
    night: [
      { value: "distant-city-glow", label: "وهج المدينة البعيد", text: "distant generic city glow provides low ambient light while rooftop surfaces remain softly dimensional" },
      { value: "rooftop-practical-city", label: "لمبة سطح مع وهج المدينة", text: "a rooftop practical light mixes with distant city glow, producing uneven warm and cool illumination" }
    ]
  },
  streetFootball: {
    day: [
      { value: "overhead-sun", label: "شمس علوية", text: "overhead sun reveals flattened turf fibers, fence texture and ground dust with short natural shadows" },
      { value: "open-shade", label: "ظل مفتوح", text: "open shade gives soft directional contrast across the worn turf, jerseys and chain-link fence" }
    ],
    night: [
      { value: "floodlights", label: "كشافات الملعب", text: "cool floodlights create bright pools across the turf with darker gaps near the fence edges" },
      { value: "floodlights-streetlight", label: "كشافات مع إنارة شارع", text: "cool floodlights mix with nearby streetlight color, creating natural uneven illumination across turf and clothing" }
    ]
  },
  gasStation: {
    day: [
      { value: "canopy-shade-sun", label: "ظل المظلة مع الشمس", text: "canopy shade mixes with bright sun beyond the pump area, preserving concrete texture and natural contrast" },
      { value: "overcast-soft-light", label: "ضوء غائم ناعم", text: "overcast daylight spreads soft even illumination across pumps, concrete and the glass storefront" }
    ],
    night: [
      { value: "bright-canopy-leds", label: "LED مظلة ساطع", text: "bright canopy LEDs cast clean white light over the pumps, subject and marked concrete with soft-edged shadows" },
      { value: "canopy-store-glow", label: "المظلة مع وهج المتجر", text: "white canopy light mixes with the convenience-store glow for natural layered illumination across glass and concrete" }
    ]
  }
});

export const MAJLIS_MOODS = Object.freeze([
  { value: "hosting", label: "استضافة ضيوف" }, { value: "family", label: "جلسة عائلية" }, { value: "reading", label: "قراءة هادئة" }, { value: "after-meal", label: "بعد الوجبة" }, { value: "night-chat", label: "سمر ليلي" }
]);
export const KASHTA_MOODS = Object.freeze([
  { value: "fire-night", label: "ليلة حول النار" }, { value: "dawn", label: "فجر البر" }, { value: "sunset", label: "غروب" }, { value: "foggy", label: "ضباب خفيف" }
]);
export const BARBERSHOP_MOODS = Object.freeze([
  { value: "fresh-cut", label: "بعد الحلاقة" }, { value: "waiting", label: "انتظار" }, { value: "styling", label: "ترتيب الشعر" }
]);
export const GROCERY_MOODS = Object.freeze([
  { value: "quick-stop", label: "توقف سريع" }, { value: "browsing", label: "تصفح الرفوف" }, { value: "paying", label: "عند الكاونتر" }
]);
export const ROOFTOP_MOODS = Object.freeze([
  { value: "sunset", label: "غروب" }, { value: "night-chat", label: "جلسة ليلية" }, { value: "morning-coffee", label: "قهوة صباحية" }
]);
export const STREET_FOOTBALL_MOODS = Object.freeze([
  { value: "playing", label: "لعب" }, { value: "resting", label: "استراحة" }, { value: "post-game", label: "بعد المباراة" }
]);
export const GAS_STATION_MOODS = Object.freeze([
  { value: "fueling", label: "تعبئة" }, { value: "convenience", label: "توقف للمتجر" }, { value: "night-stop", label: "توقف ليلي" }
]);
