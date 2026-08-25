export const LIGHTING_OPTIONS = Object.freeze([
  // ── شاشة الهاتف ──
  {
    id: "phone_screen_only",
    name_ar: "شاشة الهاتف فقط (المصدر الوحيد)",
    name_en: "phone screen as the ONLY light source",
    category: "screen",
    kelvin: "~6500K",
    quality: "close, weak, cool",
    iso: "ISO 1600–3200",
    physics: "The phone screen is the only light in the room. Cool light at 30–45cm from the face with inverse-square falloff: face lit, everything beyond ~1m falls to near darkness. Slightly below-frontal direction creates soft upward shadows under brows and chin. Room stays dark; NO ceiling or lamp light added. Any visible bedside lamp, lamp shade, or bulb is an unlit decorative prop: it emits ZERO light, with no warm glow, no inner illumination, no warm wall/headboard spill, and no warm eye catchlight.",
    shadows: "soft upward under-brow/chin shadows; background near black",
    catchlights: "rectangular screen glow in both eyes",
    room_effect: "room barely readable, heavy shadow noise",
    required_features: [],
    portable_sources: ["phone_screen"],
    room_dark: true,
    disable_visible_lamps: true
  },

  // ── السقف ──
  {
    id: "ceiling_white",
    name_ar: "سقف الغرفة — إنارة بيضاء",
    name_en: "single white LED ceiling light",
    category: "ceiling",
    kelvin: "4000–5000K",
    quality: "overhead, neutral, semi-hard",
    iso: "ISO 400–800",
    physics: "One white LED ceiling source directly overhead. Downward shadows under brows, nose and chin; eye sockets slightly darker; even top light on hair and shoulders; gentle wall falloff with distance.",
    shadows: "downward under facial features",
    catchlights: "small round overhead glint at top of iris",
    room_effect: "whole room readable, corners slightly darker",
    required_features: ["ceiling_light"],
    portable_sources: [],
    room_dark: false
  },
  {
    id: "ceiling_warm",
    name_ar: "سقف الغرفة — لمبة دافئة",
    name_en: "single warm ceiling bulb",
    category: "ceiling",
    kelvin: "2700–3000K",
    quality: "overhead, warm, softer contrast",
    iso: "ISO 400–800",
    physics: "One warm ceiling bulb overhead; same downward geometry as white ceiling but warm cast and softer perceived contrast; cozy yellow pool on bedding.",
    shadows: "downward, warm-tinted",
    catchlights: "warm round glint",
    room_effect: "warm room, darker corners",
    required_features: ["ceiling_light"],
    portable_sources: [],
    room_dark: false
  },
  {
    id: "all_spots",
    name_ar: "جميع سبوتات السقف",
    name_en: "all ceiling spotlights on",
    category: "ceiling",
    kelvin: "3500–4500K",
    quality: "multiple overhead points",
    iso: "ISO 200–640",
    physics: "Several small overhead spots: overlapping soft shadows with slightly different directions, more even illumination, mild multi-catchlights; least dramatic ceiling option.",
    shadows: "multiple soft overlapping",
    catchlights: "2–3 small glints",
    room_effect: "evenly lit room",
    required_features: ["ceiling_spots"],
    portable_sources: [],
    room_dark: false
  },

  // ── الأباجورة ──
  {
    id: "lamp_only",
    name_ar: "الأباجورة فقط",
    name_en: "warm bedside lamp only",
    category: "lamp",
    kelvin: "~2700K",
    quality: "lateral, warm, hard falloff",
    iso: "ISO 800–1600",
    physics: "Warm bedside lamp from its real recorded position. One side of the face brightly warm, the other in deep shadow; strong lateral falloff across the bed; warm pool on headboard and nightstand; room beyond the pool dark.",
    shadows: "strong lateral; deep shadow side",
    catchlights: "round bulb in near eye, faint/none in far eye",
    room_effect: "warm pool, dark room edges",
    required_features: ["lamp"],
    portable_sources: [],
    room_dark: true
  },
  {
    id: "lamp_and_phone",
    name_ar: "الأباجورة + شاشة الهاتف",
    name_en: "bedside lamp + phone screen blend",
    category: "lamp",
    kelvin: "2700K side + 6500K frontal",
    quality: "mixed two-source, one exposure",
    iso: "ISO 800–1600",
    physics: "Two real sources in one coherent exposure: warm lamp laterally + cool screen frontally close. Skin neutral-cool at center with warm rim from lamp side; shadows partially filled but directionally consistent.",
    shadows: "lateral warm shadow softened by cool fill",
    catchlights: "round warm + rectangular cool",
    room_effect: "lamp pool visible, rest dim",
    required_features: ["lamp"],
    portable_sources: ["phone_screen"],
    room_dark: false
  },

  // ── النهار ──
  {
    id: "window_daylight",
    name_ar: "ضوء نافذة نهاري",
    name_en: "directional window daylight",
    category: "daylight",
    kelvin: "5500–6500K",
    quality: "directional, moderately hard",
    iso: "ISO 100–400",
    physics: "Daylight entering from the window side; clear lit/shadow split on the face; large soft rectangular catchlights; gentle fill from wall bounce; crisp detail, minimal noise.",
    shadows: "one clean directional shadow side",
    catchlights: "large soft window rectangle",
    room_effect: "bright near window, gradual falloff",
    required_features: ["daylight_access"],
    portable_sources: [],
    room_dark: false
  },
  {
    id: "overcast_flat",
    name_ar: "نهار غائم — ضوء منتشر",
    name_en: "overcast diffuse daylight",
    category: "daylight",
    kelvin: "6500K",
    quality: "flat, even, cool",
    iso: "ISO 200–640",
    physics: "Overcast sky through the window: flat even cool light with only micro-shadows defining jaw and brows; low contrast; soft oversized catchlights.",
    shadows: "micro-shadows only",
    catchlights: "very large soft",
    room_effect: "evenly lit, cool cast",
    required_features: ["daylight_access"],
    portable_sources: [],
    room_dark: false
  },
  {
    id: "golden_hour",
    name_ar: "شمس منخفضة (ساعة ذهبية)",
    name_en: "low warm sun through window",
    category: "daylight",
    kelvin: "3000–3500K",
    quality: "hard, low-angle, warm",
    iso: "ISO 100–200",
    physics: "Low sun raking through the window: long hard shadows across the bed; strong warm rim on one side of face and hair; high contrast with blown highlights on lit skin and crushed shadows elsewhere.",
    shadows: "long hard lateral",
    catchlights: "intense small sun glint",
    room_effect: "bright warm streaks, dark elsewhere",
    required_features: ["daylight_access"],
    portable_sources: [],
    room_dark: false
  },

  // ── مختلطة ──
  {
    id: "ceiling_and_lamp",
    name_ar: "سقف أبيض + أباجورة",
    name_en: "ceiling light + bedside lamp",
    category: "mixed",
    kelvin: "4500K top + 2700K side",
    quality: "two temperature zones",
    iso: "ISO 400–800",
    physics: "Overhead neutral base exposure plus warm lamp from the side; overhead feature shadows softened by warm lateral fill; two color zones coherent in one exposure.",
    shadows: "downward softened by lateral warm fill",
    catchlights: "round overhead + round warm",
    room_effect: "fully readable room with warm corner",
    required_features: ["ceiling_light", "lamp"],
    portable_sources: [],
    room_dark: false
  },
  {
    id: "ceiling_and_phone",
    name_ar: "سقف + شاشة الهاتف",
    name_en: "ceiling light + phone screen fill",
    category: "mixed",
    kelvin: "4500K top + 6500K frontal",
    quality: "base + close cool fill",
    iso: "ISO 400–800",
    physics: "Ceiling light sets the room exposure; cool screen adds close frontal fill making the face slightly cooler and brighter than the room; under-chin shadow reduced but ceiling shadows still readable.",
    shadows: "downward with reduced under-chin",
    catchlights: "round overhead + rectangular screen",
    room_effect: "readable room, face slightly privileged (physically explained)",
    required_features: ["ceiling_light"],
    portable_sources: ["phone_screen"],
    room_dark: false
  },

  // ── ليلية ──
  {
    id: "night_city_window",
    name_ar: "ليل: إضاءة مدينة خافتة + شاشة",
    name_en: "faint night window ambient + phone screen",
    category: "night",
    kelvin: "~6500K screen + faint cool ambient",
    quality: "near-dark, screen-dominant",
    iso: "ISO 1600–3200",
    physics: "Night: barely-readable cool ambient from the window plus phone screen as the main face light; room nearly black with shapes just discernible; heavy shadow noise; rectangular catchlights.",
    shadows: "screen-direction soft shadows; room in darkness",
    catchlights: "rectangular screen",
    room_effect: "near-black room, visible sensor noise",
    required_features: ["daylight_access"],
    portable_sources: ["phone_screen"],
    room_dark: true
  },
  {
    id: "curtain_lamp",
    name_ar: "ستارة مسدلة + أباجورة فقط",
    name_en: "closed blackout curtain + lamp only",
    category: "night",
    kelvin: "~2700K",
    quality: "enclosed warm pool",
    iso: "ISO 800–1600",
    physics: "Blackout curtain closed: the lamp creates an enclosed warm pool; walls fall to darkness fast; cozy high contrast with deep surrounding shadow; no window contribution at all.",
    shadows: "strong lateral warm, black surroundings",
    catchlights: "round warm bulb",
    room_effect: "warm island in darkness",
    required_features: ["lamp"],
    portable_sources: [],
    room_dark: true
  }
]);

export const LIGHTING_BY_ID = Object.freeze(Object.fromEntries(LIGHTING_OPTIONS.map((item) => [item.id, item])));

export const LIGHTING_REALISM_BLOCK = `LIGHTING REALISM (anti-AI):
- Every shadow, catchlight, highlight, and gradient traces to a declared source; no hidden fill, no softbox, no cinematic grading.
- Inverse-square falloff for close sources; with the screen as the only light the room goes dark within ~1m.
- Catchlight shape matches the source: rectangular screen, round bulb, large soft window rectangle.
- Mixed sources = slightly imperfect white balance: one source dominates, the other tints edges.
- Noise follows the light level: dark scenes show real sensor noise; bright daylight stays clean.
- Skin specular response matches source hardness: harsh close light gives T-zone highlights; diffuse light stays matte.`;

