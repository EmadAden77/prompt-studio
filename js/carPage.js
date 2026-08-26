import { CAR_CATEGORIES, CAR_TEMPLATES, ANGLE_ANATOMY } from "./carPosesData.js";
import { HAIR_OPTIONS } from "./data/hairData.js";
import { EXPRESSION_OPTIONS } from "./data/expressionsData.js";
import { CLOTHING_OPTIONS } from "./data/clothingData.js";

const STORAGE_KEY = "prompt-studio:car-v1.17";

const LIGHTING_OPTIONS = Object.freeze([
  { id:"N1", name_ar:"N1 صوديوم + LED", prompt:"N1 — NIGHT SODIUM + LED: warm sodium-vapor spill from one exterior direction plus cooler white LED parking light from another real direction; mixed white balance, localized highlights, deep cabin shadows, realistic small-sensor noise." },
  { id:"N2", name_ar:"N2 لوحات محلات", prompt:"N2 — SHOP-SIGN SPILL: irregular colored storefront/sign spill through real glass, subordinate to ordinary street practicals; no readable invented signs, no neon studio key, and no uniform cinematic color wash." },
  { id:"N3", name_ar:"N3 محطة وقود", prompt:"N3 — GAS-STATION PRACTICALS: bright overhead canopy fixtures outside the parked car, cooler top/side spill through glass, localized reflections on trim and windows, realistic highlight clipping, no showroom lighting." },
  { id:"N4", name_ar:"N4 ظهيرة", prompt:"N4 — MIDDAY: strong Saudi daylight through windshield, side glass and sunroof only; bright exterior, deeper cabin exposure, restrained phone HDR, natural hard/soft transitions and no studio fill." },
  { id:"N5", name_ar:"N5 غسق", prompt:"N5 — DUSK: cool ambient sky with sparse warm practicals beginning to dominate; realistic mixed color temperature, modest underexposure in cabin corners, natural glass reflections." },
  { id:"N6", name_ar:"N6 موقف تحت أرضي", prompt:"N6 — UNDERGROUND PARKING: localized fluorescent/LED ceiling practicals, concrete bounce, darker gaps between fixtures, mild green/cool cast where plausible, visible shadow noise and restrained highlight clipping." },
  { id:"D2", name_ar:"D2 مظلة نهار", prompt:"D2 — SHADED DAYLIGHT: vehicle parked beneath a real shade canopy; open-sky daylight enters indirectly with brighter exterior slices, soft top-side fill, realistic contrast and no artificial beauty lighting." }
]);

const CAR_CORE = `CAR CORE — v1.17
- Generate ONE ordinary, physically coherent, photorealistic smartphone selfie inside a fully stationary parked vehicle in Saudi Arabia.
- IMAGE A is REQUIRED and is the sole identity authority for the real subject: preserve face shape, facial proportions, skin tone/texture, hairline, hair density, beard pattern, age, build, and natural asymmetry. Do not create a look-alike.
- IMAGE A controls identity only. The selected template controls pose, camera angle, framing and gaze.
- IMAGE B / CABIN REFERENCE is OPTIONAL. If supplied, it becomes the immutable environment authority for all visible cabin geometry, materials, colors, controls, seat shapes, dashboard, wheel, console, doors, mirrors, pillars, roof, sunroof and window state.
- If no cabin reference is supplied, use the project default vehicle: a coherent white 2022 Range Rover Sport, Saudi left-hand drive, with realistic light-beige cabin materials and authentic continuous front/rear cabin architecture. Do not mix generations or invent decorative controls.
- Vehicle remains parked and stationary for the complete photographic event. No driving, road motion, steering effort, acceleration or braking.`;

const CABIN_SELFIE_CAMERA_LOCK = `CABIN SELFIE CAMERA LOCK — SUBJECT-HELD FRONT CAMERA
- Use one physically reachable subject-held smartphone front-camera viewpoint only; no third-person photographer, dashboard camera, passenger-held camera, tripod, outside-car camera or rear-camera portrait.
- Use ordinary 22–24 mm equivalent front-wide perspective at approximately f/2.0, with natural near-field face geometry and restrained edge distortion.
- The phone position must remain within the selected template distance. Camera placement is solved only AFTER seated-body anatomy.
- Preserve a single exposure, focus/depth solution, white balance, HDR behavior, sensor-noise character, sharpening and compression pipeline across subject, cabin, glass and exterior.`;

const ARM_FREE_FRAMING_LOCK = `ARM-FREE FRAMING LOCK — THE SELFIE ARM NEVER APPEARS (non-negotiable)
- The phone, the hand, and the ENTIRE selfie arm are strictly OUTSIDE the frame; the crop begins just beyond the phone-side shoulder.
- The phone-side shoulder shows a natural slight elevation and forward rotation consistent with holding a phone at arm's length; the deltoid line is complete and exits the frame edge cleanly.
- NO stump, NO cropped forearm entering any frame edge, NO floating sleeve, NO hand or phone visible anywhere, NO sleeve ending in mid-air.
- Authenticity comes from near-field wide-angle face geometry, frame tilt 2–4° when compatible, off-center subject, subtle rectangular screen catchlights when physically supported, and correct shoulder mechanics — not from a visible selfie arm.
- The OTHER arm stays visible and natural on the wheel, console, thigh, or window-side support with correct anatomy; resting forearms on the wheel top are allowed only when the selected template calls for them. Only the arm extended toward the lens is forbidden from frame.`;

const DRIVER_SEAT_SOLVER = `1) SEAT–WHEEL AXIS: hips centered on the driver seat; chest on the steering-wheel axis; wheel rim in front of the torso and crossing the lower frame when framing allows.
2) LEGS: thighs forward toward pedals beneath the wheel; knees directionally under the rim; never stretched sideways; feet follow pedal-floor contact logic even when cropped.
3) TORSO BY CAMERA ANGLE: frontal → 20–30° waist turn max | side → 30–45° with hip pivot and far shoulder rolled forward | high → torso lean 5–10° to phone side, shoulders slightly raised | low → chest opened slightly upward, shoulders relaxed down | wheel → torso forward 10–15° over rim | passenger → up to 40°, relaxed slouch allowed.
4) HEAD BY CAMERA ANGLE: frontal → straight, tilt 3–5° | high → neck extended up, chin tucked | low → chin down, neck flexed | mirror → rotated 30–40° with visible neck muscle tension | dutch → head tilts 5–8° with frame roll.
5) HEADREST directly behind the head on the seat centerline with approximately 2–5 cm gap or light contact when geometry permits.
6) BOTH sleeves identical in cuff/roll/button state; seat cushion/backrest show subtle compression; shirt bunches naturally at the seated waist; seatbelt only if supported by the selected/reference variant.
7) KSA LEFT-HAND DRIVE: driver seat left; console to the driver's right; wheel, pedals, mirrors, doors and dashboard mutually consistent.
FORBIDDEN: 90° chest twist, wheel off-axis, knees/hips mismatch, headrest offset sideways, mismatched sleeves, floating seat contact, or camera geometry that breaks solved anatomy.`;

const STREET_LIFE = `STREET LIFE — SECONDARY, NATURAL
- Exterior glimpses through glass must read as an ordinary Saudi parking/street environment appropriate to the selected lighting: irregular parked vehicles, sparse distant people only when natural, curbs, columns, shade structures, pavement, restrained landscaping and unbranded architecture.
- No cloned cars, staged crowds, readable invented license plates, fake shop names, or background people staring at the camera.`;

const GLASS_REFLECTION = `GLASS & REFLECTION LOCK
- Windshield, side glass, mirrors, glossy trim, eyes and metal obey one coherent reflection field tied to the selected real lighting sources.
- Pillars and frames occlude exterior objects correctly. Mirrors preserve handedness and viewing direction. No pasted duplicate cabin, impossible reflection, giant flare or decorative anamorphic streak.`;

const SINGLE_PIPELINE = `SINGLE PIPELINE LOCK
- Face, hair, clothing, cabin, glass, exterior vehicles, people, pavement and sky pass through the same smartphone capture and processing event.
- Never make the face cleaner, sharper, brighter, smoother or less noisy than the surrounding cabin without a physical reason. No DSLR bokeh, beauty filter, selective face denoising or cinematic grade.`;

const ANATOMY_AR = Object.freeze({
  frontal:"الجذع 20–30° كحد أقصى، الركب باتجاه الدواسات والرأس على محور المقعد.",
  side:"دوران 30–45° مع ارتكاز الحوض، الكتف البعيد للأمام والورك القريب محمّل.",
  high:"الرقبة تمتد للأعلى والذقن للداخل قليلًا، الكتفان أعلى قليلًا وميل 5–10°.",
  low:"الذقن لأسفل، الرقبة مثنية، الصدر مفتوح قليلًا للأعلى والكتفان منخفضان.",
  dutch:"الجسم ثابت؛ الرأس يميل 5–8° مع ميل الإطار بانثناء جانبي طبيعي.",
  mirror:"الرأس يدور 30–40° نحو المرآة مع شد رقبة طبيعي، والجذع 10–15° فقط.",
  wheel:"الجذع للأمام 10–15° فوق المقود، الأكتاف مستديرة والساعد الحر يرتكز طبيعيًا.",
  passenger:"لا قيد لمحور المقود؛ يمكن تقاطع ساق واحدة ودوران الجذع حتى 40° بصورة طبيعية."
});

const catAnatomy = (tpl) => ({ front_cu:"frontal", side:"side", high:"high", low:"low", dutch:"dutch", mirror:"mirror", wheel:"wheel", passenger:"passenger" }[tpl.cat] ?? "frontal");

function buildLightingSection(id) {
  const item = LIGHTING_OPTIONS.find((x) => x.id === id) ?? LIGHTING_OPTIONS[0];
  return `SELECTED LIGHTING — ${item.name_ar}\n${item.prompt}`;
}

function imperfectionManifest(cfg) {
  const dark = ["N1","N2","N3","N5","N6"].includes(cfg.lighting);
  return `IMPERFECTION MANIFEST — ORDINARY PHONE CAPTURE\n- Preserve slight handheld roll, small framing imbalance, realistic edge softness, restrained sharpening halos, JPEG/computational compression, natural skin micro-texture and non-uniform fabric folds.\n- ${dark ? "Low-light state: visible restrained luminance/chroma noise in cabin shadows, imperfect white balance, modest highlight clipping, mild local motion softness where physically justified." : "Daylight state: lower sensor gain but still ordinary front-camera micro-contrast, restrained HDR, realistic highlight roll-off and no fake hyper-detailed 8K rendering."}\n- Do not manufacture dust, fake timestamps, metadata, scratches or forensic artifacts.`;
}

function clothingPrompt(item) {
  if (!item) return "Selected clothing: ordinary physically plausible clothing.";
  const fabric = item.fabric ?? {};
  return `Selected clothing: ${item.name_en ?? item.name_ar}. Garments: ${item.pieces ?? item.name_en ?? item.name_ar}. Fabric: ${fabric.type ?? "material-correct"}; sheen: ${fabric.sheen ?? "realistic"}; drape/folds follow seated gravity, joint bending and seat contact. Both sleeves must remain identical in intentional cuff/roll/button state.`;
}

function choicesLine(cfg) {
  return `CHOICES\nHAIR: ${cfg.hair?.prompt ?? "Preserve IMAGE A hair exactly."}\nEXPRESSION: ${cfg.expression?.prompt ?? "Natural relaxed expression."}\nCLOTHING: ${clothingPrompt(cfg.clothing)}\nCABIN REFERENCE: ${cfg.hasCabin ? "IMAGE B supplied — immutable environment lock." : "No IMAGE B supplied — build the coherent default white 2022 Range Rover Sport cabin."}`;
}

function buildCarPrompt(tpl, cfg) {
  const anatomyKey = catAnatomy(tpl);
  return [
    CAR_CORE,
    CABIN_SELFIE_CAMERA_LOCK,
    ARM_FREE_FRAMING_LOCK,
    `DRIVER SEAT ANATOMY SOLVER — solve the seated body BEFORE the camera:\n${DRIVER_SEAT_SOLVER}\nANGLE-SPECIFIC: ${ANGLE_ANATOMY[anatomyKey]}`,
    `TEMPLATE: ${tpl.name_ar} — camera ${tpl.angle}; distance ${tpl.distance}; framing ${tpl.framing}; gaze ${tpl.gaze}; mood ${tpl.mood}. ${tpl.note || ""}`,
    buildLightingSection(cfg.lighting),
    `${STREET_LIFE}\n\n${GLASS_REFLECTION}\n\n${SINGLE_PIPELINE}\n\n${imperfectionManifest(cfg)}`,
    choicesLine(cfg)
  ].join("\n\n");
}

const $ = (q) => document.querySelector(q);
const state = { category:"front_cu", templateId:null, lighting:"N1", hairId:"same", expressionId:"relaxed", clothingId:null, imageA:null, cabin:null };
let imageAUrl = null;
let cabinUrl = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    Object.assign(state, saved, { imageA:null, cabin:null });
  } catch {}
  const allowedCats = new Set(CAR_CATEGORIES.map((x) => x.id));
  if (!allowedCats.has(state.category)) state.category = "front_cu";
  if (!LIGHTING_OPTIONS.some((x) => x.id === state.lighting)) state.lighting = "N1";
  if (!HAIR_OPTIONS.some((x) => x.id === state.hairId)) state.hairId = "same";
  if (!EXPRESSION_OPTIONS.some((x) => x.id === state.expressionId)) state.expressionId = "relaxed";
}

function saveState() {
  const copy = { category:state.category, templateId:state.templateId, lighting:state.lighting, hairId:state.hairId, expressionId:state.expressionId, clothingId:state.clothingId };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(copy)); } catch {}
}

function setOptions(select, items, selected) {
  select.replaceChildren(...items.map((item) => new Option(item.name_ar, item.id, false, item.id === selected)));
  if (selected) select.value = selected;
}

function carClothingOptions() {
  return CLOTHING_OPTIONS.filter((item) => ["casual","sport","winter","traditional"].includes(item.category));
}

function renderCategories() {
  const bar = $("#carCategoryBar");
  bar.replaceChildren(...CAR_CATEGORIES.map((cat) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `car-chip${cat.id === state.category ? " is-active" : ""}`;
    button.dataset.category = cat.id;
    button.textContent = `${cat.icon} ${cat.name_ar}`;
    button.addEventListener("click", () => {
      state.category = cat.id;
      const first = CAR_TEMPLATES.find((tpl) => tpl.cat === cat.id);
      state.templateId = first?.id ?? null;
      saveState();
      renderCategories();
      renderTemplates();
      updatePrompt();
    });
    return button;
  }));
}

function renderTemplates() {
  const grid = $("#carTemplateGrid");
  const items = CAR_TEMPLATES.filter((tpl) => tpl.cat === state.category);
  if (!items.some((x) => x.id === state.templateId)) state.templateId = items[0]?.id ?? null;
  grid.replaceChildren(...items.map((tpl) => {
    const key = catAnatomy(tpl);
    const card = document.createElement("button");
    card.type = "button";
    card.className = `car-pose-card${tpl.id === state.templateId ? " is-active" : ""}`;
    card.innerHTML = `<strong>${tpl.name_ar}</strong><span><b>الزاوية:</b> ${tpl.angle}</span><span><b>المسافة:</b> ${tpl.distance}</span><span><b>الإطار:</b> ${tpl.framing}</span><span><b>النظر:</b> ${tpl.gaze}</span><small><b>تشريح الجلوس:</b> ${ANATOMY_AR[key]}</small>`;
    card.addEventListener("click", () => {
      state.templateId = tpl.id;
      saveState();
      renderTemplates();
      updatePrompt();
    });
    return card;
  }));
}

function selectedTemplate() { return CAR_TEMPLATES.find((x) => x.id === state.templateId) ?? null; }
function selectedHair() { return HAIR_OPTIONS.find((x) => x.id === state.hairId) ?? HAIR_OPTIONS[0]; }
function selectedExpression() { return EXPRESSION_OPTIONS.find((x) => x.id === state.expressionId) ?? EXPRESSION_OPTIONS[0]; }
function selectedClothing() { const list = carClothingOptions(); return list.find((x) => x.id === state.clothingId) ?? list[0]; }

function updatePrompt() {
  const tpl = selectedTemplate();
  const output = $("#finalPrompt");
  const copyBtn = $("#copyBtn");
  const downloadBtn = $("#downloadBtn");
  const status = $("#carStatus");
  if (!tpl) {
    output.textContent = "اختر قالب سيارة.";
    copyBtn.disabled = true;
    downloadBtn.disabled = true;
    return;
  }
  const prompt = buildCarPrompt(tpl, { lighting:state.lighting, hair:selectedHair(), expression:selectedExpression(), clothing:selectedClothing(), hasCabin:Boolean(state.cabin) });
  output.textContent = prompt;
  $("#promptWordCount").textContent = `${prompt.trim().split(/\s+/).length} كلمة`;
  $("#promptSummary").textContent = `🚗 ${tpl.name_ar} · ${LIGHTING_OPTIONS.find((x) => x.id === state.lighting)?.name_ar} · ${selectedHair().name_ar} · ${selectedExpression().name_ar} · ${selectedClothing().name_ar}`;
  const ready = Boolean(state.imageA);
  copyBtn.disabled = !ready;
  downloadBtn.disabled = !ready;
  status.textContent = ready ? (state.cabin ? "جاهز · IMAGE A + قفل مقصورة اختياري" : "جاهز · IMAGE A + مقصورة افتراضية") : "IMAGE A إلزامي قبل النسخ أو التنزيل";
  status.className = `validation-status${ready ? " is-valid" : ""}`;
}

function handleImage(kind, file) {
  if (!file) return;
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return;
  if (kind === "imageA") {
    if (imageAUrl) URL.revokeObjectURL(imageAUrl);
    imageAUrl = URL.createObjectURL(file);
    state.imageA = { name:file.name, size:file.size };
    $("#imageAPreview").src = imageAUrl;
    $("#imageAPreview").hidden = false;
    $("#imageAMeta").textContent = `${file.name} · ${(file.size/1048576).toFixed(2)} MB`;
    $("#imageARemove").hidden = false;
  } else {
    if (cabinUrl) URL.revokeObjectURL(cabinUrl);
    cabinUrl = URL.createObjectURL(file);
    state.cabin = { name:file.name, size:file.size };
    $("#cabinPreview").src = cabinUrl;
    $("#cabinPreview").hidden = false;
    $("#cabinMeta").textContent = `${file.name} · ${(file.size/1048576).toFixed(2)} MB · سيصبح IMAGE B قفل البيئة`;
    $("#cabinRemove").hidden = false;
  }
  updatePrompt();
}

function clearImage(kind) {
  if (kind === "imageA") {
    if (imageAUrl) URL.revokeObjectURL(imageAUrl);
    imageAUrl = null; state.imageA = null; $("#imageAInput").value = ""; $("#imageAPreview").hidden = true; $("#imageAPreview").removeAttribute("src"); $("#imageAMeta").textContent = ""; $("#imageARemove").hidden = true;
  } else {
    if (cabinUrl) URL.revokeObjectURL(cabinUrl);
    cabinUrl = null; state.cabin = null; $("#cabinInput").value = ""; $("#cabinPreview").hidden = true; $("#cabinPreview").removeAttribute("src"); $("#cabinMeta").textContent = ""; $("#cabinRemove").hidden = true;
  }
  updatePrompt();
}

async function copyPrompt() {
  const text = $("#finalPrompt").textContent;
  try { await navigator.clipboard.writeText(text); $("#carStatus").textContent = "تم نسخ الأمر ✓"; }
  catch {
    const area = document.createElement("textarea"); area.value = text; document.body.append(area); area.select(); document.execCommand("copy"); area.remove(); $("#carStatus").textContent = "تم نسخ الأمر ✓";
  }
}

function downloadPrompt() {
  const blob = new Blob([$("#finalPrompt").textContent], { type:"text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `car-${state.templateId || "template"}-v1.17.txt`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function bind() {
  $("#imageAInput").addEventListener("change", (e) => handleImage("imageA", e.target.files?.[0]));
  $("#cabinInput").addEventListener("change", (e) => handleImage("cabin", e.target.files?.[0]));
  $("#imageARemove").addEventListener("click", () => clearImage("imageA"));
  $("#cabinRemove").addEventListener("click", () => clearImage("cabin"));
  $("#lightingSelect").addEventListener("change", (e) => { state.lighting = e.target.value; saveState(); updatePrompt(); });
  $("#hairSelect").addEventListener("change", (e) => { state.hairId = e.target.value; saveState(); updatePrompt(); });
  $("#expressionSelect").addEventListener("change", (e) => { state.expressionId = e.target.value; saveState(); updatePrompt(); });
  $("#clothingSelect").addEventListener("change", (e) => { state.clothingId = e.target.value; saveState(); updatePrompt(); });
  $("#copyBtn").addEventListener("click", copyPrompt);
  $("#downloadBtn").addEventListener("click", downloadPrompt);
}

function init() {
  loadState();
  const clothes = carClothingOptions();
  if (!clothes.some((x) => x.id === state.clothingId)) state.clothingId = clothes[0]?.id ?? null;
  const categoryTemplates = CAR_TEMPLATES.filter((x) => x.cat === state.category);
  if (!categoryTemplates.some((x) => x.id === state.templateId)) state.templateId = categoryTemplates[0]?.id ?? null;
  setOptions($("#lightingSelect"), LIGHTING_OPTIONS, state.lighting);
  setOptions($("#hairSelect"), HAIR_OPTIONS, state.hairId);
  setOptions($("#expressionSelect"), EXPRESSION_OPTIONS, state.expressionId);
  setOptions($("#clothingSelect"), clothes, state.clothingId);
  renderCategories();
  renderTemplates();
  bind();
  updatePrompt();
}

init();
