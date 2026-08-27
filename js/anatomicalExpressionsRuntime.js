export const ANATOMICAL_EXPRESSIONS = Object.freeze([
  Object.freeze({ id:"subtle_authentic_smile", name_ar:"ابتسامة دوشين العفوية (تشريحية كاملة)", name_en:"AUTHENTIC DUCHENNE SMILE", muscle:"natural zygomaticus major activation lifts the mouth corners subtly while orbicularis oculi engagement creates delicate lower-lid response and small crow's-feet only where age/skin and camera resolution support them; cheeks elevate naturally, nasolabial depth responds without changing cheekbone geometry, jaw remains relaxed" }),
  Object.freeze({ id:"serene_relaxed_gaze", name_ar:"استرخاء سريري هادئ (نظرة تأملية)", name_en:"SERENE RELAXED GAZE", muscle:"resting facial tonus is low; eyelids settle at their natural relaxed aperture with only mild gravity-led droop, corrugator tension releases, masseter stays neutral, lips may part by about 1–2 mm without changing lip volume, gaze remains calm and directly coherent with the lens" }),
  Object.freeze({ id:"playful_smirk", name_ar:"ابتسامة جانبية خفيفة (عفوية وغير متماثلة)", name_en:"SUBTLE PLAYFUL SMIRK", muscle:"small unilateral risorius/zygomatic contribution lifts one mouth corner while the other stays near baseline; a shallow dimple may appear only if consistent with the reference face; one brow may rise by only a few millimeters; asymmetry remains muscular, not skeletal" }),
  Object.freeze({ id:"cozy_sleepy_warmth", name_ar:"نعاس لطيف ودافئ (صباحي / مسائي)", name_en:"COZY SLEEPY WARMTH", muscle:"upper eyelids rest noticeably lower from fatigue while eye size and canthus geometry stay fixed; frontalis, temporalis and masseter remain relaxed; lips rest softly with quiet breathing posture; mild cheek warmth may appear only as a lighting/physiology-compatible tonal shift, never as invented blush" }),
  Object.freeze({ id:"subtle_thoughtful_pout", name_ar:"تأمل هادئ بزم شفاه طفيف وطبيعي", name_en:"SUBTLE THOUGHTFUL LIP COMPRESSION", muscle:"gentle orbicularis oris contraction creates slight lip compression without protrusion or duck-face distortion; mentalis tension stays minimal; jaw remains relaxed and the gaze is contemplative and lens-directed" }),
  Object.freeze({ id:"gentle_laughter_breath", name_ar:"ضحكة خفيفة منتصف التنفس (حركة واقعية)", name_en:"GENTLE MID-BREATH LAUGH", muscle:"a soft mid-breath laugh parts the lips naturally; a small irregular glimpse of upper incisors is allowed with non-perfect enamel response; cheeks lift and lower lids form natural crescent folds without shrinking eye geometry; jaw opening remains modest" }),
  Object.freeze({ id:"curious_quizzical_gaze", name_ar:"نظرة فضولية وتفاعل عفوي مع الكاميرا", name_en:"CURIOUS QUIZZICAL GAZE", muscle:"one brow rises subtly through unilateral frontalis activity while the opposite eye may narrow only minimally from conversational focus; any head micro-tilt stays within the selected pose mechanics and must not reshape the jaw or face outline" }),
  Object.freeze({ id:"intimate_pillow_rest", name_ar:"استسلام للاسترخاء مع ضغط الوسادة", name_en:"INTIMATE PILLOW REST", muscle:"facial muscles remain tranquil and unposed; when the selected bedroom pose actually places a cheek on the pillow, local compressible soft tissue may displace with pressure and gravity while skull, jaw, nose, eye and lip geometry remain identity-locked; outside a pillow-contact pose, omit pillow-specific deformation" })
]);

const BY_ID = Object.freeze(Object.fromEntries(ANATOMICAL_EXPRESSIONS.map((item) => [item.id, item])));
const MARKER_START = "ANATOMICAL EXPRESSION & COMPUTATIONAL CAPTURE AUTHORITY — SHARED";
const MARKER_END = "END ANATOMICAL EXPRESSION & COMPUTATIONAL CAPTURE AUTHORITY";
const STORAGE_KEY = "prompt-studio:anatomical-expression";
const observedOutputs = new WeakSet();
let writing = false;

export function getAnatomicalExpression(id) {
  return BY_ID[id] || null;
}

function selectedExpression() {
  const id = document.querySelector("#expressionSelect")?.value || "";
  return getAnatomicalExpression(id);
}

function identityAndExpressionBlock(expression) {
  if (!expression) return "";
  return `${MARKER_START}
PRIMARY IDENTITY RULE — IMAGE A OVERRIDES EVERYTHING
- IMAGE A is the sole authority for stable facial identity. Preserve exact cranial and facial proportions, face width/length, forehead/temples, zygomatic structure, cheek fullness, jaw angle/breadth, chin dimensions/projection, eye size/spacing/canthus positions, eyelid geometry, eyebrow placement, nose bridge/root/tip/alar geometry, philtrum, lip width/volume, ears, hairline, beard boundaries/density, age markers and stable natural asymmetry.
- The selected expression is MUSCLE STATE ONLY. It may move brows, lids, cheeks and mouth through anatomically plausible facial action, but it may not redesign bone structure, slim/widen the face, sharpen the jaw, resize eyes, reshape the nose, alter lip volume or create a different person.
- Selected expression: ${expression.name_en}. ${expression.muscle}.
- LANDMARK CONSISTENCY TEST: after compensating only for camera perspective, head pose, gravity/contact soft-tissue displacement and the selected muscle action, stable facial landmarks must plausibly superimpose on IMAGE A. If not, restore IMAGE A geometry.
- Skin remains real and sensor-limited: irregular regional pores, follicle openings, fine creases, beard transitions, subtle vellus hair and local hydration/specular response only where distance, focus and illumination can resolve them. Subsurface transmission is subtle and source-dependent, never a global red/orange glow. No beauty smoothing, pore stamping, waxy skin or forensic over-detail.

XIAOMI 15 ULTRA FRONT-CAMERA CAPTURE AUTHORITY
- Use the app's established Xiaomi 15 Ultra front-camera model at ordinary arm length, approximately 22–24 mm full-frame equivalent and approximately f/2.0. Do not substitute DSLR/telephoto perspective or an observer camera.
- Mild wide-angle edge stretch/barrel tendency and subtle chromatic fringing may appear only where real high-contrast edge geometry and lens position support them; never warp the central identity-critical face to demonstrate optics.
- Use small-sensor depth behavior: the environment normally remains structurally readable. No artificial DSLR bokeh or portrait-mask cutout unless explicitly selected elsewhere.
- Computational HDR, denoise, sharpening, tone mapping, compression, highlight clipping and shadow noise form one whole-frame pipeline. Darker regions may be noisier/softer; no face-only cleanup, local beauty HDR or synthetic skin denoise.
${document.body?.dataset.page === "car" ? `
CAR CONTACT / ENVIRONMENT COHERENCE
- The expression and face identity remain independent of whether the subject is seated inside or standing outside the car. Seat/headrest, steering wheel, door, paint, glass, mirror and ground contacts obey their existing physical load/contact rules without deforming identity bones.
- The user's current lighting selection remains the lighting authority. Expression anatomy follows that light; it may not invent a private face light, fake catchlight or separate color grade.` : `
BEDROOM GRAVITY / CONTACT / REFERENCE COHERENCE
- For lying poses, solve gravity and support before facial appearance: pillow/mattress compression, cheek/head contact, hair spreading, fabric friction and local soft-tissue displacement must follow the actual support side. Never paste an upright face onto a horizontal body.
- IMAGE B remains the authority for bedroom architecture, headboard, bedding, wall tones, furniture, decor and perspective. Do not redesign the room to fit the subject.
- Existing bedroom light sources and any physically plausible weak phone-screen bounce determine shadows and catchlights. A phone-screen catchlight must follow real near-axis screen geometry and remain subordinate to the selected lighting preset; never invent a beauty fill.`}
${MARKER_END}`;
}

function stripExisting(text) {
  const start = text.indexOf(MARKER_START);
  if (start < 0) return text;
  const end = text.indexOf(MARKER_END, start);
  if (end < 0) return text.slice(0, start).trimEnd();
  return `${text.slice(0, start)}${text.slice(end + MARKER_END.length)}`.trim();
}

function applyToOutput(output) {
  if (!output || writing) return;
  const expression = selectedExpression();
  let text = stripExisting(output.textContent || "");
  if (expression) text = `${text}\n\n${identityAndExpressionBlock(expression)}`.trim();
  if (output.textContent === text) return;
  writing = true;
  output.textContent = text;
  queueMicrotask(() => { writing = false; });
}

function applyAll() {
  applyToOutput(document.querySelector("#finalPrompt"));
  applyToOutput(document.querySelector("#exteriorPrompt"));
}

function observeOutput(output) {
  if (!output || observedOutputs.has(output)) return;
  observedOutputs.add(output);
  new MutationObserver(() => queueMicrotask(applyAll)).observe(output, { childList:true, characterData:true, subtree:true });
}

function discoverOutputs() {
  observeOutput(document.querySelector("#finalPrompt"));
  observeOutput(document.querySelector("#exteriorPrompt"));
  applyAll();
}

function injectOptions() {
  const select = document.querySelector("#expressionSelect");
  if (!select) return false;
  ANATOMICAL_EXPRESSIONS.forEach((item) => {
    if ([...select.options].some((option) => option.value === item.id)) return;
    select.append(new Option(item.name_ar, item.id));
  });
  let stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch {}
  if (stored && BY_ID[stored]) select.value = stored;
  if (!select.dataset.anatomicalExpressionsBound) {
    select.dataset.anatomicalExpressionsBound = "true";
    select.addEventListener("change", () => {
      if (BY_ID[select.value]) {
        try { localStorage.setItem(STORAGE_KEY, select.value); } catch {}
      }
      queueMicrotask(applyAll);
    });
  }
  return true;
}

function install() {
  injectOptions();
  discoverOutputs();
  const select = document.querySelector("#expressionSelect");
  if (select) new MutationObserver(() => queueMicrotask(injectOptions)).observe(select, { childList:true });
  if (document.body) {
    new MutationObserver(() => queueMicrotask(discoverOutputs)).observe(document.body, { childList:true, subtree:true });
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once:true });
  else install();
}
