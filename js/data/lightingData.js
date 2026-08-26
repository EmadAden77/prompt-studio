export const LIGHTING_OPTIONS = Object.freeze([
  // ── شاشة الهاتف ──
  {
    id: "phone_screen_only",
    name_ar: "شاشة الهاتف فقط — الغرفة شبه سوداء",
    name_en: "phone screen as the ONLY light source in a near-black bedroom",
    category: "screen",
    kelvin: "5000–6500K adaptive screen white",
    quality: "small close frontal source near optical axis; rapid inverse-square falloff",
    iso: "ISO 1600–3200 equivalent low-light phone exposure",
    physics: "The phone screen is the only light in the room. The same phone is also the front-camera capture device, so the screen-to-face distance stays physically consistent with arm's-length selfie reach at about 45–70 cm. The screen produces cool-to-neutral close frontal light near the optical axis. Face is readable; neck, shoulders and bedding darken quickly; the room beyond roughly 1 m approaches near black. NO ceiling, bedside-lamp, window, hidden fill, studio source or synthetic ambient glow. Any visible lamp remains fully unlit and emits zero warm spill.",
    shadows: "subtle upward-biased under-brow and under-chin shadow; deep room shadows",
    catchlights: "rectangular screen glow in both eyes when geometry permits, orientation matching the phone",
    room_effect: "near-black bedroom; only nearby shapes survive exposure; realistic shadow noise",
    required_features: [],
    portable_sources: ["phone_screen"],
    room_dark: true,
    disable_visible_lamps: true
  },
  {
    id: "phone_screen_faint_bounce",
    name_ar: "شاشة الهاتف + ارتداد غرفة خافت جدًا",
    name_en: "phone screen dominant with physically weak room bounce only",
    category: "screen",
    kelvin: "5200–6500K screen with weak material-tinted bounce",
    quality: "screen-dominant close light with only secondary diffuse bounce from real nearby surfaces",
    iso: "ISO 1250–2500",
    physics: "The phone screen is the dominant and only direct source on the face. Permit only weak secondary bounce from real nearby bedding, wall or furniture surfaces already illuminated by the screen. The bounce must be dimmer, broader and color-shifted by those real materials. No independent ambient light is invented. The room remains very dark and only the nearest surfaces become faintly readable.",
    shadows: "screen-led soft upward bias, slightly softened by weak local bounce",
    catchlights: "rectangular screen only",
    room_effect: "very dark room with faint local material bounce, no broad ambient lift",
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
  {
    id: "ceiling_spots_dim",
    name_ar: "سبوتات السقف — خافتة ليلية",
    name_en: "dimmed ceiling spotlights at night",
    category: "ceiling",
    kelvin: "3200–4200K",
    quality: "weak overhead multi-point practical light",
    iso: "ISO 800–1600",
    physics: "Use the existing ceiling spotlights at a genuinely low dimmed output. The room remains dim rather than evenly bright. Hair and upper facial planes receive weak overhead illumination, eye sockets and lower face remain darker, corners carry visible sensor noise, and no additional face fill is introduced.",
    shadows: "weak overlapping downward shadows with dark eye-socket and under-chin regions",
    catchlights: "small faint overhead points, not beauty-light circles",
    room_effect: "dim practical bedroom, readable only in major shapes",
    required_features: ["ceiling_spots"],
    portable_sources: [],
    room_dark: true
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
    kelvin: "2700K side + 5200–6500K frontal",
    quality: "mixed two-source, one exposure",
    iso: "ISO 800–1600",
    physics: "Two real sources in one coherent exposure: warm lamp laterally + cool/neutral screen frontally close. Skin may carry a physically plausible mixed-color split. The lamp controls the warm side and nearby furniture pool; the screen controls close facial fill. No third source and no local face relighting.",
    shadows: "lateral warm shadow softened only where the screen physically reaches",
    catchlights: "one warm practical plus one rectangular screen reflection when geometry permits",
    room_effect: "lamp pool visible, rest dim; mixed white balance remains imperfect",
    required_features: ["lamp"],
    portable_sources: ["phone_screen"],
    room_dark: false
  },
  {
    id: "lamp_and_phone_low",
    name_ar: "أباجورة خافتة + شاشة الهاتف",
    name_en: "very dim bedside lamp plus phone screen dominant",
    category: "lamp",
    kelvin: "2600–2900K weak side + 5200–6500K dominant screen",
    quality: "screen-dominant close light with faint warm lateral practical",
    iso: "ISO 1000–2200",
    physics: "The phone screen is the dominant facial light. The real bedside lamp remains on but at a weak practical level, creating only a small warm lateral trace on the near wall/headboard and a faint warm edge on the lamp-facing side of the subject. Preserve mixed white balance, noisy shadows and limited room visibility. No hidden third fill.",
    shadows: "mostly screen-driven, with a faint warm lateral modification only near the lamp side",
    catchlights: "rectangular screen dominant; faint warm practical glint only if physically visible",
    room_effect: "dark bedroom with a small weak warm pool and screen-lit face",
    required_features: ["lamp"],
    portable_sources: ["phone_screen"],
    room_dark: true
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
    room_effect: "readable room, face slightly privileged only because of the real close screen",
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
  },
  {
    id: "curtain_leak_screen",
    name_ar: "تسرب ليلي من الستارة + شاشة الهاتف",
    name_en: "faint curtain-edge night spill plus phone screen",
    category: "night",
    kelvin: "5200–6500K screen + faint cooler exterior spill",
    quality: "screen-dominant with a very weak distant directional leak",
    iso: "ISO 1400–3000",
    physics: "The phone screen remains the dominant face light. Permit only a very faint exterior night leak at an existing curtain edge/window direction, enough to separate a curtain fold or room edge but not enough to light the face cleanly. The leak is distant, cooler, and far weaker than the screen. Preserve deep shadows and low-light sensor noise.",
    shadows: "screen-led facial shadows; faint distant directional room separation",
    catchlights: "rectangular screen dominant; exterior spill normally too weak for a second catchlight",
    room_effect: "near-black room with one faint curtain-edge separation and noisy deep shadows",
    required_features: ["daylight_access"],
    portable_sources: ["phone_screen"],
    room_dark: true
  },
  {
    id: "night_ceiling_low",
    name_ar: "ليل — سقف خافت جدًا",
    name_en: "very low ceiling practical at night",
    category: "night",
    kelvin: "3300–4300K",
    quality: "weak overhead practical with realistic underexposure",
    iso: "ISO 1000–2200",
    physics: "Use one existing ceiling light at very low output. Do not expose the room as daylight-bright. Hair and forehead catch the weak top light first; eyes, lower cheeks and torso remain darker. Corners and dark furniture carry visible luminance/chroma noise. No screen fill unless separately selected by another preset.",
    shadows: "soft but visible downward shadows, dark lower facial planes",
    catchlights: "small faint overhead practical glint",
    room_effect: "dim room with incomplete shadow detail and ordinary phone underexposure",
    required_features: ["ceiling_light"],
    portable_sources: [],
    room_dark: true
  }
]);

export const LIGHTING_BY_ID = Object.freeze(Object.fromEntries(LIGHTING_OPTIONS.map((item) => [item.id, item])));

export const LIGHTING_REALISM_BLOCK = `LIGHTING REALISM (anti-AI) — anti-synthetic capture discipline:
- Every shadow, catchlight, highlight, and gradient traces to a declared physical source; no hidden fill, no softbox, no ring light, no cinematic grading.
- Inverse-square falloff for close sources; with the screen as the only direct source the room becomes genuinely dark beyond the near field.
- Catchlight shape matches the source: rectangular screen, round practical bulb, large soft window rectangle.
- Mixed sources keep slightly imperfect white balance: one source dominates while the other tints only physically reached surfaces.
- Noise follows illumination: dark regions show more luminance noise and restrained chroma noise; bright regions remain cleaner but not artificially perfect.
- Skin specular response matches source size and direction; no separate beauty treatment.
- One phone exposure, one white balance, one sharpening/denoise pipeline and one tone curve apply to face, clothing, bedding and room together.
- Never add simulated forensic artifacts, fake sensor fingerprints or detector-targeting noise. Realism comes from ordinary optics, light, exposure and material behavior.`;

