export const LIGHTING_OPTIONS = Object.freeze([
  {
    id: "phone_screen_only",
    name_ar: "شاشة الهاتف فقط",
    name_en: "Phone screen light only",
    physics: "Use one weak, close cool-white source from the phone screen. Illumination is strongest on the central face and nearest fingers, falls off rapidly across the neck and bedding, and leaves the room predominantly dark. Do not introduce a hidden ceiling or fill light.",
    exposure: "Low-light automatic phone exposure with visible but restrained shadow noise, modest noise reduction, and slight white-balance uncertainty; preserve detail without pretending the scene is brightly lit.",
    required_features: [],
    room_dark: true
  },
  {
    id: "lamp_only",
    name_ar: "الأباجورة فقط",
    name_en: "Bedside lamp only",
    physics: "Use the bedside lamp at its actual IMAGE B position as the sole dominant source. Warm directional light follows the lamp-to-subject vector; the nearer facial plane is brighter and the opposite plane falls into a soft, physically continuous shadow.",
    exposure: "Automatic indoor phone exposure with warm highlights, moderate shadow noise, and no invented frontal fill.",
    required_features: ["lamp"],
    room_dark: false
  },
  {
    id: "lamp_and_phone",
    name_ar: "الأباجورة مع شاشة الهاتف",
    name_en: "Bedside lamp and phone screen",
    physics: "Blend two real sources in one exposure: warm bedside light from its recorded position and weaker cool screen light near the face. Each source creates directionally consistent falloff and catchlights; do not flatten the face into even studio illumination.",
    exposure: "Automatic mixed-light phone exposure with slightly imperfect white balance, controlled warm highlights, and natural low-light noise in the room.",
    required_features: ["lamp"],
    room_dark: false
  },
  {
    id: "single_ceiling",
    name_ar: "لمبة سقف واحدة",
    name_en: "Single ceiling light",
    physics: "Use one real overhead fixture position. Light travels downward and produces plausible shadows beneath brows, nose, chin, arms, and furniture. Other ceiling sources remain off.",
    exposure: "Automatic indoor exposure with restrained highlight clipping and ordinary phone-camera shadow recovery.",
    required_features: ["ceiling_light"],
    room_dark: false
  },
  {
    id: "all_ceiling_spots",
    name_ar: "جميع سبوتات السقف",
    name_en: "All visible ceiling spotlights",
    physics: "Illuminate from the actual visible ceiling-spot positions. Multiple sources create overlapping but subdued shadows and spatially consistent pools of light; they do not behave as one frontal softbox.",
    exposure: "Automatic bright-indoor phone exposure with low-to-moderate noise and natural local highlight roll-off.",
    required_features: ["ceiling_spots"],
    room_dark: false
  },
  {
    id: "daylight_semidark",
    name_ar: "نهاري وشبه ظلام",
    name_en: "Directional daylight with a dim interior",
    physics: "Use natural daylight only from a visible or reference-supported window or curtain direction. Keep corners and occluded areas darker, with broad soft-edged shadows and gradual distance falloff. Do not add a ceiling light.",
    exposure: "Automatic daylight exposure that protects window-side highlights while retaining realistic darker interior values.",
    required_features: ["daylight_access"],
    room_dark: false
  }
]);

export const LIGHTING_BY_ID = Object.freeze(Object.fromEntries(LIGHTING_OPTIONS.map((item) => [item.id, item])));
