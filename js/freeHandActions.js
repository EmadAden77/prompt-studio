import { PromptEngine } from "./engines/promptEngine.js";

const STORAGE_KEY = "ai-selfie-prompt-studio:free-hand-action";
const SELECT_ID = "freeHandActionSelect";
const patchFlag = Symbol.for("promptStudio.freeHandActions.patched");

const ACTIONS = Object.freeze([
  Object.freeze({ id:"auto", name_ar:"تلقائي حسب الوضعية", families:["bed","sitting","standing"], prompt:"AUTO: choose the simplest anatomically natural free-hand action for the selected pose. Prefer resting contact over gesturing. Never invent an object." }),
  Object.freeze({ id:"relaxed_side", name_ar:"مرتاحة بجانب الجسم", families:["standing","sitting"], prompt:"Let the non-camera hand hang or rest naturally beside the body with a relaxed wrist and slightly unequal finger curvature. No deliberate posing." }),
  Object.freeze({ id:"thigh_rest", name_ar:"مرتاحة على الفخذ", families:["sitting"], prompt:"Rest the free hand naturally on the real thigh. Palm pressure is light; fingers curve independently and contact clothing with small local compression." }),
  Object.freeze({ id:"mattress_rest", name_ar:"مرتاحة على المرتبة", families:["bed","sitting"], prompt:"Rest the free palm or ulnar edge lightly on the real mattress. Show local bedding compression, occlusion and a small attached contact shadow." }),
  Object.freeze({ id:"pillow_edge", name_ar:"عند طرف الوسادة", families:["bed"], prompt:"Place the free hand partly beside or under the EDGE of the pillow, not under the head. Fingers remain simple and visible only where anatomy and crop permit." }),
  Object.freeze({ id:"blanket_hold", name_ar:"تمسك طرف البطانية بخفة", families:["bed"], prompt:"Lightly pinch or hold the real blanket edge with thumb plus two or three fingers. Use minimal grip force; fabric gathers locally around the contact. No clenched fist." }),
  Object.freeze({ id:"abdomen_rest", name_ar:"مرتاحة على أعلى البطن", families:["bed"], prompt:"Rest the free palm softly on the upper abdomen over clothing or bedding. The wrist stays neutral; fingers relax with slight spacing variation and create only mild fabric compression." }),
  Object.freeze({ id:"forearm_abdomen", name_ar:"الساعد فوق البطن", families:["bed"], prompt:"Lay the free forearm naturally across the abdomen with the shoulder relaxed. The elbow and wrist follow one continuous chain; no torso penetration or rigid symmetry." }),
  Object.freeze({ id:"beside_face_pillow", name_ar:"على الوسادة قرب الوجه", families:["bed"], prompt:"Rest the free hand on the pillow BESIDE the face without supporting, squeezing or reshaping the cheek. Keep fingers simple and partly occluded if needed." }),
  Object.freeze({ id:"pocket_half", name_ar:"نصف اليد في الجيب", families:["standing","sitting"], prompt:"Place only part of the free hand casually in a real clothing pocket, with thumb outside or a few fingers outside. Do not force full-hand insertion or distort the garment." }),
  Object.freeze({ id:"waistband_thumb", name_ar:"الإبهام عند حافة البنطال", families:["standing"], prompt:"Hook only the free thumb lightly at the waistband or pocket edge while the other fingers remain relaxed. Keep the wrist and elbow ordinary and close to the body." }),
  Object.freeze({ id:"shirt_adjust", name_ar:"تعديل خفيف لطرف القميص", families:["standing","sitting"], prompt:"Use the free hand for a tiny natural adjustment of the shirt hem or collar using a simple pinch. No dramatic tug, no fabric stretching, no staged fashion gesture." }),
  Object.freeze({ id:"beard_touch", name_ar:"لمسة خفيفة أسفل اللحية", families:["standing","sitting"], prompt:"Touch the lower beard/chin area lightly with two or three fingertips. Do not cover facial landmarks, push the jaw, reshape the beard or create a thinking-pose stereotype." }),
  Object.freeze({ id:"hair_adjust", name_ar:"تعديل خصلة شعر", families:["standing","sitting"], prompt:"Use two or three fingertips to make a small adjustment near the temple or front hairline. Do not bury fingers deeply in hair, change hairstyle density, or create complex finger overlap." }),
  Object.freeze({ id:"sofa_cushion_rest", name_ar:"مرتاحة على وسادة الأريكة", families:["sitting"], placements:["sofa"], prompt:"Rest the free hand on the real sofa cushion with mild pressure and a small local cushion/fabric response. Do not invent an armrest or cushion outside the room reference." })
]);

const ACTION_BY_ID = Object.freeze(Object.fromEntries(ACTIONS.map((item) => [item.id, item])));

function familyFromPoseId(id = "") {
  if (id.startsWith("standing")) return "standing";
  if (id.startsWith("sitting")) return "sitting";
  return "bed";
}

function placementFromPose(pose = {}) {
  return pose?.placement || "";
}

function actionCompatible(action, pose = {}) {
  if (!action?.families?.includes(familyFromPoseId(pose?.id))) return false;
  if (action.placements?.length && !action.placements.includes(placementFromPose(pose))) return false;
  return true;
}

function automaticAction(pose = {}) {
  const family = familyFromPoseId(pose?.id);
  if (family === "bed") return ACTION_BY_ID.abdomen_rest;
  if (family === "sitting") return ACTION_BY_ID.thigh_rest;
  return ACTION_BY_ID.relaxed_side;
}

function storedId() {
  try { return localStorage.getItem(STORAGE_KEY) || "auto"; } catch { return "auto"; }
}

function selectedAction(pose = {}) {
  const domId = typeof document !== "undefined" ? document.querySelector(`#${SELECT_ID}`)?.value : null;
  const requested = ACTION_BY_ID[domId || storedId()] || ACTION_BY_ID.auto;
  if (requested.id === "auto") return automaticAction(pose);
  return actionCompatible(requested, pose) ? requested : automaticAction(pose);
}

function freeHandBlock(pose = {}) {
  const action = selectedAction(pose);
  return `FREE-HAND ACTION — NON-CAMERA HAND ONLY
Selected action: ${action.name_ar}.
${action.prompt}

FREE-HAND ANATOMY LOCK
- This section controls ONLY the arm/hand that is NOT holding the phone. The camera-holding arm remains governed by the global selfie-arm policy and stays outside crop where required.
- Shoulder, upper arm, elbow, forearm, wrist, palm, thumb and fingers form one continuous anatomically possible chain from the real torso.
- Keep shoulder rotation, elbow flexion, forearm pronation/supination and wrist deviation inside ordinary comfortable ranges for the selected pose.
- Fingers are NOT evenly spaced, mirrored or identically curved. Preserve small natural asymmetry in flexion, spacing and contact.
- Contact with mattress, pillow, clothing, sofa, thigh or a real room object creates physically attached pressure, occlusion, fabric/cushion response and contact shadow.
- Never add a prop merely to give the hand something to do. Existing objects may be touched only if the active room reference visibly supports that exact object and reachable location.
- The hand must never penetrate the torso, pass through bedding, merge with fabric, grow extra fingers, duplicate a wrist, detach from the forearm, or arrive from the wrong side of the body.
- If the selected action conflicts with framing, support physics, room continuity or clean anatomy, simplify it to a relaxed resting hand rather than forcing the gesture.
- The free hand remains secondary. It must not cover identity-defining facial landmarks or become a foreground forced-perspective feature.`;
}

function xiaomiNightBlock() {
  if (typeof document === "undefined") return "";
  const mode = document.querySelector("#xiaomiCaptureModeSelect")?.value;
  if (mode !== "night" && mode !== "low_light") return "";
  return `XIAOMI 15 ULTRA FRONT-CAMERA LOW-LIGHT EXECUTION
- Preserve the existing front-camera optical lock around 22–24 mm full-frame equivalent and approximately f/2.0. Do not substitute rear-camera optics, telephoto compression, DSLR depth rendering or a remote observer viewpoint.
- Low-light computational processing may combine a small number of temporally adjacent frames only in a way consistent with a handheld selfie. It may improve exposure stability but must NOT erase natural skin texture, beard gaps, hair clumping, fabric texture or dark-room noise.
- Keep realistic front-camera limitations: elevated gain, luminance noise in shadows, restrained chroma noise in the deepest tones, slight edge softness, modest sharpening halos, finite dynamic range and small handheld micro-motion where physically justified.
- Bright practical sources may clip modestly. Dark room regions remain dark. Do not lift black furniture or curtains into clean HDR detail merely to show the room.
- Face and room use the SAME denoise, sharpening, white-balance and tone-mapping event. No face-only night enhancement, beauty mode, skin cleanup or local relighting.
- Perspective, facial scale and edge distortion must remain consistent with the same close front wide selfie lens.`;
}

function patchPromptEngine() {
  const proto = PromptEngine?.prototype;
  if (!proto || proto[patchFlag] || typeof proto.generate !== "function") return;
  const originalGenerate = proto.generate;
  proto.generate = function generateWithFreeHand(config = {}) {
    const raw = originalGenerate.call(this, config);
    if (typeof raw !== "string") return raw;
    return `${raw}\n\n${freeHandBlock(config.pose)}${xiaomiNightBlock() ? `\n\n${xiaomiNightBlock()}` : ""}`.trim();
  };
  proto[patchFlag] = true;
}

function rebuildOptions() {
  if (typeof document === "undefined") return;
  const select = document.querySelector(`#${SELECT_ID}`);
  if (!select) return;
  const poseId = document.querySelector("#poseSelect")?.value || "";
  const family = familyFromPoseId(poseId);
  const current = select.value || storedId();
  const available = ACTIONS.filter((action) => action.id === "auto" || action.families.includes(family));
  select.replaceChildren(...available.map((action) => new Option(action.name_ar, action.id)));
  select.value = available.some((action) => action.id === current) ? current : "auto";
}

function installControl() {
  if (typeof document === "undefined" || document.querySelector(`#${SELECT_ID}`)) return;
  const form = document.querySelector("#optionsForm");
  if (!form) return;

  const field = document.createElement("div");
  field.className = "field field--wide";
  field.dataset.freeHandActions = "true";

  const label = document.createElement("label");
  label.htmlFor = SELECT_ID;
  label.textContent = "🤚 حركة اليد الأخرى";

  const select = document.createElement("select");
  select.id = SELECT_ID;
  select.name = "freeHandAction";
  field.append(label, select);

  const hint = document.createElement("small");
  hint.textContent = "تعرض فقط الحركات المناسبة لنوع الوضعية. عند أي تعارض تشريحي يعود المحرك تلقائيًا إلى يد مرتاحة.";
  field.appendChild(hint);
  form.appendChild(field);

  rebuildOptions();
  const initial = storedId();
  if ([...select.options].some((option) => option.value === initial)) select.value = initial;

  select.addEventListener("change", () => {
    try { localStorage.setItem(STORAGE_KEY, select.value); } catch {}
    document.querySelector("#rebuildBtn")?.click();
  });

  document.querySelector("#poseSelect")?.addEventListener("change", () => {
    rebuildOptions();
    document.querySelector("#rebuildBtn")?.click();
  });
}

patchPromptEngine();

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installControl, { once:true });
  else installControl();
}
