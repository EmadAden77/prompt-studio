// js/data/bedTemplatesData.js — قوالب سيلفي غرفة النوم الواقعية (v2.1-bed)
// الأقفال (BEDDING_PHYSICS, GROUNDING, CAMERA_EMULATOR, LIGHTING_PHYSICS,
// SINGLE_PIPELINE, IMPERFECTION) تُحقن تلقائيًا من realismLocks.js حسب العائلة.

export const BED_CATEGORIES = [
  { id: "lb",  name_ar: "استلقاء على الظهر", icon: "🛏️" },
  { id: "ls",  name_ar: "استلقاء جانبي",    icon: "🔄" },
  { id: "lp",  name_ar: "استلقاء على البطن", icon: "🙃" },
  { id: "sr",  name_ar: "نصف استلقاء",      icon: "⛅" },
  { id: "st",  name_ar: "جلوس",             icon: "🪑" },
  { id: "sd",  name_ar: "وقوف",             icon: "🧍" },
  { id: "mr",  name_ar: "مرآة التسريحة",    icon: "🪞" }
];

export const BED_TEMPLATES = [
  { id: "lb_topdown", cat: "lb", ar: "من الأعلى كلاسيكي", en: "Top-down classic", angle: "top-down 75–85°", dist: "60–80cm", frame: "face 40%, bed/room 60%", gaze: "into lens", mood: "استرخاء تام",
    anatomy: "head sinks 4–6cm into pillow; hair spread radially on pillowcase; blanket edge at waist; knees may tent the blanket",
    light: "per selected lighting; pillow rim bulge + contact-shadow ring visible",
    anti: "flat untouched pillow = INVALID; lying face (cheek tissue falls back), not standing face" },
  { id: "lb_tight", cat: "lb", ar: "من الأعلى محكم", en: "Top-down tight", angle: "top-down 80°", dist: "45–60cm", frame: "face 70%, pillow rim around head", gaze: "into lens", mood: "حميمي",
    anatomy: "pillow rim bulge frames the head; individual hair strands at spread edge; ear free both sides",
    light: "screen/lamp catchlights crisp; pores resolved at this range",
    anti: "nose mild protrusion from near-field; no fisheye" },
  { id: "lb_dutch", cat: "lb", ar: "من الأعلى بميلان", en: "Top-down dutch", angle: "top-down + roll 20–30°", dist: "60–80cm", frame: "face 45%, lamp side visible", gaze: "into lens", mood: "كسول ليلي",
    anatomy: "tilt toward pillow; hair falls to one side by gravity",
    light: "lamp-side warm pool if lamp selected; else cool screen",
    anti: "frame tilt 2–4° extra handheld; off-center subject" },

  { id: "ls_right", cat: "ls", ar: "الجانب الأيمن (جهة الأباجورة)", en: "Right side, lamp side", angle: "dutch 25–35° toward pillow", dist: "35–45cm", frame: "head + one shoulder", gaze: "into lens", mood: "دافئ",
    anatomy: "TRUE LATERAL: right shoulder stacked under head; right ear/cheek pressed into pillow; left leg over right; LEFT hand selfie, elbow on mattress; lower RIGHT arm never through torso",
    light: "lamp side warm key; contact-side hair flattened",
    anti: "semi-reclined hybrid = INVALID; pillow compressed 4–6cm" },
  { id: "ls_left", cat: "ls", ar: "الجانب الأيسر (جهة التسريحة)", en: "Left side, vanity side", angle: "dutch 25–35° opposite", dist: "30–40cm", frame: "intimate close-up", gaze: "into lens", mood: "هادئ",
    anatomy: "mirror of right: LEFT shoulder down; RIGHT hand selfie; lower LEFT arm forward",
    light: "cooler side; vanity direction background",
    anti: "lower arm never penetrates ribcage" },
  { id: "ls_tight", cat: "ls", ar: "جانبي محكم (أذن على المخدة)", en: "Side tight, ear on pillow", angle: "dutch 30°, very close", dist: "25–35cm", frame: "face 80%, ear pressed", gaze: "into lens", mood: "حميمي جدًا",
    anatomy: "contact ear folded flat; cheek pushed up a few mm; free-side hair falls",
    light: "single key from free side; deep shadow on contact side",
    anti: "soft-tissue press visible; bone structure unchanged" },

  { id: "lp_prone", cat: "lp", ar: "على البطن مرتكز على المرفقين", en: "Prone on elbows", angle: "low at mattress level, up 15–20°", dist: "30–40cm", frame: "face 70%, foreground sheets blurred", gaze: "into lens", mood: "عفوي",
    anatomy: "chest/abdomen/pelvis depress mattress; elbows sink 2–3cm; neck extended",
    light: "lamp lower-right warm or window soft",
    anti: "foreground sheets out of focus (phone DoF), face sharp" },
  { id: "lp_chin", cat: "lp", ar: "على البطن والذقن على اليد", en: "Prone, chin on hand", angle: "low, eye-level with mattress", dist: "30–40cm", frame: "face 65%, hand under chin", gaze: "into lens", mood: "تأملي",
    anatomy: "one hand supports chin with real pressure (cheek slightly pushed); other holds phone",
    light: "soft frontal",
    anti: "hand contact shadow on cheek; no floating hand" },

  { id: "sr_headboard", cat: "sr", ar: "مسند على اللوح", en: "Propped on headboard", angle: "low from chest, up 30–45°", dist: "50–70cm", frame: "chest, shoulders, face; headboard behind", gaze: "down into lens", mood: "واثق مرتاح",
    anatomy: "torso 45–60°; pillows compressed behind shoulder blades; legs extended, knee bend; blanket over thighs",
    light: "split lighting from window or lamp side",
    anti: "broad shoulders from forced perspective; pillow compression visible" },
  { id: "sr_pillows", cat: "sr", ar: "مخدات مكدسة", en: "Stacked pillows", angle: "looking down 15–20°", dist: "40–55cm", frame: "face 65%, stacked pillows behind", gaze: "up into lens", mood: "كسول",
    anatomy: "head on top pillow with slight forward neck flexion; blanket pooled at waist",
    light: "soft top light limited (sunroof-of-bedroom = none; use lamp/window)",
    anti: "stacked pillows each compressed differently" },

  { id: "st_bededge", cat: "st", ar: "حافة السرير", en: "Bed edge", angle: "eye level to slightly below", dist: "50–60cm", frame: "head, torso, thighs; seat edge + floor", gaze: "into lens", mood: "صباحي",
    anatomy: "sit bones load mattress edge 4–6cm; slight forward lean; feet on floor with contact shadows",
    light: "window morning or ceiling",
    anti: "mattress depression under sitting area; shirt gathers at waist" },
  { id: "st_chair", cat: "st", ar: "الكرسي", en: "Chair", angle: "eye level seated", dist: "50–60cm", frame: "upper body; chair back frames", gaze: "into lens", mood: "مرتب",
    anatomy: "knees 90°, feet flat with shadows; hard seat contact shadow",
    light: "ceiling or window",
    anti: "no mannequin; natural slight slouch" },
  { id: "st_floor", cat: "st", ar: "الأرض", en: "Floor", angle: "slightly above eye level", dist: "40–60cm", frame: "upper body; floor + rug + bed behind", gaze: "into lens", mood: "عفوي",
    anatomy: "legs crossed or extended; weight on buttocks; optional lean on hands",
    light: "window low or lamp",
    anti: "rug/floor texture under body; contact shadow" },

  { id: "sd_center", cat: "sd", ar: "وسط الغرفة", en: "Room center", angle: "eye level ~1.5m", dist: "45–60cm", frame: "upper body; room readable behind", gaze: "into lens", mood: "كاجوال",
    anatomy: "contrapposto; feet flat with floor shadows; clothing vertical drape",
    light: "ceiling or window",
    anti: "body cast shadow matches light; vertical lines nearly vertical" },
  { id: "sd_bedside", cat: "sd", ar: "بجانب السرير", en: "Beside bed", angle: "eye level", dist: "45–60cm", frame: "upper body; bed + nightstand to one side", gaze: "into lens", mood: "مرتخي",
    anatomy: "one palm on mattress edge, fingers spread, slight dip; weight on far leg",
    light: "lamp + screen blend",
    anti: "hand contact shadow on bedding" },
  { id: "sd_wardrobe", cat: "sd", ar: "عند الدولاب", en: "At wardrobe", angle: "eye level", dist: "45–60cm", frame: "upper body; wardrobe doors behind", gaze: "into lens", mood: "اختيار ملابس",
    anatomy: "one hand on wardrobe door handle, fingers curled, shoulder raised slightly",
    light: "ceiling",
    anti: "wardrobe vertical lines straight; door reflection faint" },

  { id: "mr_vanity", cat: "mr", ar: "سيلفي المرآة", en: "Vanity mirror selfie", angle: "pointing at mirror", dist: "60–80cm", frame: "upper body in reflection", gaze: "at phone in mirror", gaze_note: "eyes look at phone screen in reflection", mood: "مرتب",
    anatomy: "standing/sitting facing mirror; phone at chest/face level; reflection geometrically accurate, one ray path, correct handedness",
    light: "vanity bulbs or window",
    anti: "phone visible in reflection at true position; back of head reflected correctly; NO impossible angles" },
  { id: "mr_full", cat: "mr", ar: "مرآة كامل الجسم", en: "Full-body mirror", angle: "pointing at mirror, wider", dist: "1–1.5m", frame: "full body in reflection", gaze: "at phone in mirror", mood: "إطلالة",
    anatomy: "full body reflected; feet on floor with shadow in reflection; outfit fully visible",
    light: "ceiling + window",
    anti: "mirror frame + vanity visible; reflection scale consistent" }
];

export const getBedTemplatesByCat = (cat) => BED_TEMPLATES.filter(t => t.cat === cat);

if (typeof window !== "undefined")
  Object.assign(window, { BED_CATEGORIES, BED_TEMPLATES, getBedTemplatesByCat });
