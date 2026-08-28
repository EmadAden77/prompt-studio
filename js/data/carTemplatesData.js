// js/data/carTemplatesData.js — مكتبة قوالب سيلفي السيارة الكاملة (v1.22)
// بيانات فقط — الأقفال تُحقن من carEngine.js حسب zone

const CAR_CATEGORIES = [
  { id: "front_cu",  name_ar: "سيلفي أمامي كلوز أب", icon: "🤳", zone: "indoor" },
  { id: "side",      name_ar: "سيلفي جانبي",        icon: "↔️", zone: "indoor" },
  { id: "high",      name_ar: "من الأعلى",          icon: "⬆️", zone: "indoor" },
  { id: "low",       name_ar: "من الأسفل",          icon: "⬇️", zone: "indoor" },
  { id: "dutch",     name_ar: "ميلان عفوي",         icon: "↩️", zone: "indoor" },
  { id: "mirror",    name_ar: "تفقد المرآة",        icon: "🪞", zone: "indoor" },
  { id: "wheel",     name_ar: "يد على المقود",      icon: "🛞", zone: "indoor" },
  { id: "passenger", name_ar: "مقعد الراكب",        icon: "💺", zone: "indoor" },
  { id: "door",      name_ar: "بجوار الباب",        icon: "🚪", zone: "outdoor" },
  { id: "lean",      name_ar: "متكئ على السيارة",   icon: "🪑", zone: "outdoor" },
  { id: "window",    name_ar: "نافذة مفتوحة",       icon: "🪟", zone: "mixed" },
  { id: "station",   name_ar: "محطة وقود",          icon: "⛽", zone: "mixed" },
  { id: "night",     name_ar: "ليلي مظلم",          icon: "🌙", zone: "mixed" }
];

const CAR_TEMPLATES = [
  // ═══ 🤳 أمامي كلوز أب (indoor) ═══
  { id: "cu_classic", cat: "front_cu", zone: "indoor", ar: "كلوز أب كلاسيكي", en: "Classic front close-up", angle: "frontal eye level", dist: "30–40cm", frame: "face 70%", gaze: "into lens", mood: "واثق مرتاح", anatomy: "torso 20–30° waist turn; head on seat centerline", light: "per selected lighting" },
  { id: "cu_tight", cat: "front_cu", zone: "indoor", ar: "كلوز أب محكم", en: "Tight face close-up", angle: "frontal", dist: "25–35cm", frame: "face 85%", gaze: "into lens", mood: "حميمي", anatomy: "same as classic; nose mild protrusion, ears recede slightly", light: "pores and beard micro-contrast resolved" },
  { id: "cu_win_key", cat: "front_cu", zone: "indoor", ar: "كلوز أب بضوء النافذة", en: "Close-up with window key", angle: "frontal", dist: "30–40cm", frame: "face 70%", gaze: "into lens", mood: "درامي طبيعي", anatomy: "elbow on window-side armrest", light: "side-window key splits the face; cabin falls to shadow" },

  // ═══ ↔️ جانبي (indoor) ═══
  { id: "side_34", cat: "side", zone: "indoor", ar: "ثلاثة أرباع جانبي", en: "Three-quarter side", angle: "45° side", dist: "35–50cm", frame: "face 65%", gaze: "into lens", mood: "عفوي", anatomy: "torso 30–45° hip pivot; far shoulder rolled forward", light: "per selected lighting" },
  { id: "side_win", cat: "side", zone: "indoor", ar: "متكئ على النافذة", en: "Leaning on window", angle: "side toward window", dist: "35–50cm", frame: "face 65%", gaze: "into lens", mood: "كسول", anatomy: "left forearm on window frame", light: "outside slice visible through glass" },
  { id: "side_shoulder", cat: "side", zone: "indoor", ar: "نظرة عبر الكتف", en: "Over-the-shoulder glance", angle: "body frontal, head turned 60°", dist: "35–50cm", frame: "face 60%", gaze: "into lens over shoulder", mood: "سينمائي عفوي", anatomy: "neck rotation with visible muscle tension", light: "per selected lighting" },

  // ═══ ⬆️ من الأعلى (indoor) ═══
  { id: "high_slim", cat: "high", zone: "indoor", ar: "أعلى نحيف", en: "High slimming", angle: "10–15° above", dist: "30–45cm", frame: "face 70%", gaze: "up into lens", mood: "مرتب", anatomy: "neck extended up; chin tucked; shoulders slightly raised", light: "headliner at top edge" },
  { id: "high_dash", cat: "high", zone: "indoor", ar: "أعلى مع التابلوه", en: "High with dash", angle: "20° above", dist: "45–60cm", frame: "face 55% + dash below", gaze: "up into lens", mood: "سياقي", anatomy: "same as high_slim", light: "dash and wheel prominent below" },

  // ═══ ⬇️ من الأسفل (indoor) ═══
  { id: "low_jaw", cat: "low", zone: "indoor", ar: "أسفل فك بارز", en: "Low jaw emphasis", angle: "10–20° up", dist: "30–45cm", frame: "face 70%", gaze: "down into lens", mood: "واثق", anatomy: "chin down; neck flexed; shoulders relaxed down", light: "headliner enters top" },
  { id: "low_power", cat: "low", zone: "indoor", ar: "أسفل أكتاف عريضة", en: "Low broad shoulders", angle: "30–40° up", dist: "40–60cm", frame: "face 55%, shoulders broad", gaze: "down into lens", mood: "قوي", anatomy: "chest opened slightly upward", light: "forced perspective broadens shoulders" },

  // ═══ ↩️ ميلان عفوي (indoor) ═══
  { id: "dutch_lazy", cat: "dutch", zone: "indoor", ar: "ميلان كسول", en: "Lazy roll tilt", angle: "frontal + roll 10–20°", dist: "30–40cm", frame: "face 70%", gaze: "into lens", mood: "ليلي عفوي", anatomy: "head tilts 5–8° with frame roll", light: "per selected lighting" },
  { id: "dutch_a", cat: "dutch", zone: "indoor", ar: "ميلان مع عمود A", en: "Roll with A-pillar", angle: "frontal + roll 15°", dist: "35–45cm", frame: "face 65%", gaze: "into lens", mood: "ديناميكي", anatomy: "A-pillar diagonal in background", light: "per selected lighting" },

  // ═══ 🪞 تفقد المرآة (indoor) ═══
  { id: "mir_rear", cat: "mirror", zone: "indoor", ar: "تفقد المرآة الداخلية", en: "Rearview mirror check", angle: "frontal body, head to mirror", dist: "35–50cm", frame: "face 60%", gaze: "AT MIRROR (candid)", mood: "لقطة صادقة", anatomy: "head rotated 30–40°; neck muscle tension", light: "per selected lighting" },
  { id: "mir_side", cat: "mirror", zone: "indoor", ar: "تفقد المرآة الجانبية", en: "Side mirror check", angle: "head to side mirror", dist: "35–50cm", frame: "face 60%", gaze: "AT SIDE MIRROR", mood: "قبل الانطلاق", anatomy: "head rotated toward door mirror", light: "per selected lighting" },

  // ═══ 🛞 يد على المقود (indoor) ═══
  { id: "whl_hand8", cat: "wheel", zone: "indoor", ar: "كلوز أب + يد على المقود", en: "Close-up + hand at 8 o'clock", angle: "frontal", dist: "30–40cm", frame: "face 60% + right hand on wheel", gaze: "into lens", mood: "سائق مرتاح", anatomy: "right hand grips wheel at 8 o'clock, natural finger spread", light: "per selected lighting" },
  { id: "whl_two", cat: "wheel", zone: "indoor", ar: "مرفقان على المقود (متوقفة)", en: "Both elbows on wheel (parked)", angle: "frontal", dist: "30–40cm", frame: "face 70%, forearms on rim", gaze: "into lens", mood: "استراحة", anatomy: "torso forward 10–15°; resting forearms allowed", light: "sharpest handheld of the set" },
  { id: "whl_console", cat: "wheel", zone: "indoor", ar: "مرفق على الكونسول", en: "Elbow on console", angle: "frontal", dist: "35–45cm", frame: "face 65%", gaze: "into lens", mood: "هادئ", anatomy: "left elbow on console; right hand on wheel", light: "per selected lighting" },

  // ═══ 💺 مقعد الراكب (indoor) ═══
  { id: "pass_classic", cat: "passenger", zone: "indoor", ar: "راكب كلاسيكي", en: "Classic passenger", angle: "frontal", dist: "35–50cm", frame: "face 65%", gaze: "into lens", mood: "مرتخي", anatomy: "no wheel constraint; one leg may cross; torso turn up to 40°", light: "per selected lighting" },
  { id: "pass_win", cat: "passenger", zone: "indoor", ar: "راكب نحو النافذة", en: "Passenger toward window", angle: "side toward window", dist: "35–50cm", frame: "face 65%", gaze: "into lens", mood: "تأملي", anatomy: "lean toward window side", light: "window key from the side" },
  { id: "pass_recl", cat: "passenger", zone: "indoor", ar: "راكب مقعد مرجع", en: "Reclined passenger", angle: "looking down 15–20°", dist: "40–55cm", frame: "face 65%", gaze: "up into lens", mood: "كسول ليلي", anatomy: "seatback reclined 15–20°; head on headrest", light: "per selected lighting" },

  // ═══  بجوار الباب (outdoor) ═══
  { id: "door_open_stand", cat: "door", zone: "outdoor", ar: "وقوف والباب مفتوح", en: "Standing with door open behind", angle: "frontal", dist: "45–65cm", frame: "face 55%, open door + interior behind", gaze: "into lens", mood: "نزلت لتوّي", anatomy: "feet on asphalt with contact shadows; door 70° behind shoulder; cream interior visible; optional hand on door top edge", light: "door interior catches key light; hinge shadow on panel" },
  { id: "door_lean_back", cat: "door", zone: "outdoor", ar: "متكئ بالظهر على الباب", en: "Leaning back on open door", angle: "frontal", dist: "45–60cm", frame: "face 55%, door edge + roof line", gaze: "into lens", mood: "استراحة", anatomy: "back on inner door panel; one leg crossed; clothing compressed at lean zone", light: "door bounces key light onto near torso side" },
  { id: "door_half_in", cat: "door", zone: "outdoor", ar: "نصف داخل نصف خارج", en: "Half in half out", angle: "frontal slight low", dist: "40–55cm", frame: "face 60%, one leg in one out", gaze: "into lens", mood: "على وشك الركوب", anatomy: "one foot on ground, knee on sill; hand on roof grab; torso 20° twist", light: "sharp brightness split interior/exterior" },

  // ═══ 🪑 متكئ على السيارة (outdoor) ═══
  { id: "hood_lean", cat: "lean", zone: "outdoor", ar: "متكئ على غطاء المحرك", en: "Leaning on closed hood", angle: "frontal", dist: "50–70cm", frame: "face 50%, hood + windshield behind", gaze: "into lens", mood: "كاجوال", anatomy: "hip on hood edge; feet crossed at ankles; hood shows sky/palm reflections", light: "hood bounces light up under chin" },
  { id: "fender_lean", cat: "lean", zone: "outdoor", ar: "متكئ على الرفارف", en: "Leaning on front fender", angle: "frontal 30° side", dist: "45–65cm", frame: "face 55%, fender + headlight + wheel arch", gaze: "into lens", mood: "عفوي", anatomy: "hip on fender; one foot forward one back; headlight specular glint", light: "fender curve makes light-to-shadow gradient" },
  { id: "tailgate_sit", cat: "lean", zone: "outdoor", ar: "جالس على الصندوق الخلفي", en: "Sitting on open tailgate", angle: "frontal slight low", dist: "50–70cm", frame: "face 50%, legs dangling, lot below", gaze: "into lens", mood: "مسترخي", anatomy: "buttocks on tailgate lip; legs hang; hands on edge beside hips", light: "overhead light on head/shoulders; legs in overhang shadow" },

  // ═══  نافذة مفتوحة (mixed) ═══
  { id: "window_frame", cat: "window", zone: "mixed", ar: "إطار النافذة المفتوحة", en: "Open window framing face", angle: "frontal", dist: "35–50cm", frame: "face 65%, half interior half exterior", gaze: "into lens", mood: "هادئ", anatomy: "seated (solver applies); elbow on open sill; glass fully down; 2–5 wind strands", light: "bright outside vs darker inside; WB warm out / cool in" },
  { id: "window_sunset", cat: "window", zone: "mixed", ar: "نافذة مفتوحة وقت الغسق", en: "Open window at dusk", angle: "frontal", dist: "35–50cm", frame: "face 65%, warm sky through window", gaze: "into lens", mood: "ذهبي", anatomy: "forearm on sill; warm sky rims face from side", light: "golden/magenta rim + cool screen fill; WB imperfect" },
  { id: "window_rain", cat: "window", zone: "mixed", ar: "بعد المطر والنافذة مفتوحة", en: "Open window after rain", angle: "frontal", dist: "35–50cm", frame: "face 65%, droplets on sill, wet asphalt reflections", gaze: "into lens", mood: "منتعش", anatomy: "3–5 droplets on sill and door edge; humidity haze on near glass", light: "wet surfaces double every light as reflections" },

  // ═══ ⛽ محطة وقود (mixed) ═══
  { id: "pump_inside", cat: "station", zone: "indoor", ar: "من الداخل والمضخة خلف الزجاج", en: "Inside, pump through window", angle: "frontal", dist: "35–50cm", frame: "face 65%, pump + canopy through window", gaze: "into lens", mood: "استراحة طريق", anatomy: "seated (solver applies); nozzle + hose through glass; attendant distant and soft", light: "even canopy 5000–6000K; short soft shadows; bloom on tubes" },
  { id: "pump_outside", cat: "station", zone: "outdoor", ar: "خارج السيارة عند المضخة", en: "Outside near the pump", angle: "frontal", dist: "50–70cm", frame: "face 50%, pump + car side + canopy", gaze: "into lens", mood: "عابر", anatomy: "standing by rear door; fuel cap open; optional nozzle in hand (real grip)", light: "even overhead canopy; under-chin fill from ground bounce" },

  // ═══ 🌙 ليلي مظلم (mixed) ═══
  { id: "night_pillar", cat: "night", zone: "outdoor", ar: "ليل عمود إنارة بعيد", en: "Night, distant lamp pole", angle: "frontal", dist: "45–65cm", frame: "face 55%, dark lot, one sodium pole", gaze: "into lens", mood: "هادئ ليلي", anatomy: "leaning lightly on closed door; faint ground shadow from pole", light: "screen = main cool key; faint warm rim; ISO 1600–3200; heavy noise; car near-silhouette" },
  { id: "night_cabin_glow", cat: "night", zone: "indoor", ar: "ليل داخل السيارة بضوء الشاشة", en: "Night inside, screen only", angle: "frontal", dist: "35–45cm", frame: "face 70%, dark cabin, faint street", gaze: "into lens", mood: "حميمي ليلي", anatomy: "seated (solver applies); engine off; dash dark; windows = weak mirrors", light: "screen ONLY source; ISO 2000–3200; FORBIDDEN: any lamp/dash/ceiling light" }
];

// تشريح الجلوس حسب عائلة الزاوية (يُحقن من المحرك)
const ANGLE_ANATOMY = {
  frontal: "torso 20–30° waist turn max; knees stay to pedals; head on centerline",
  side: "torso 30–45° hip pivot; far shoulder rolled forward; near hip loaded",
  high: "neck extended up; chin tucked; shoulders slightly raised; lean 5–10°",
  low: "chin down; neck flexed; chest opened slightly upward; shoulders down",
  dutch: "body unchanged; head tilts 5–8° with frame roll",
  mirror: "head rotated 30–40°; neck muscle tension visible; torso 10–15° only",
  wheel: "torso forward 10–15° over rim; resting forearms; shoulders rounded",
  passenger: "no wheel constraint; one leg may cross; torso turn up to 40°"
};

// مساعدات
const getCarTemplatesByCat = (cat) => CAR_TEMPLATES.filter(t => t.cat === cat);
const getCarCategory = (id) => CAR_CATEGORIES.find(c => c.id === id);

if (typeof module !== "undefined" && module.exports)
  module.exports = { CAR_CATEGORIES, CAR_TEMPLATES, ANGLE_ANATOMY, getCarTemplatesByCat, getCarCategory };
if (typeof window !== "undefined")
  Object.assign(window, { CAR_CATEGORIES, CAR_TEMPLATES, ANGLE_ANATOMY, getCarTemplatesByCat, getCarCategory });
