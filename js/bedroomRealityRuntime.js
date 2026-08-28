const VERSION = "v1.0";
const MARKER_START = "BEDROOM PHYSICAL REALITY ENGINE — v1.0";
const MARKER_END = "END BEDROOM PHYSICAL REALITY ENGINE";

const $ = (id) => document.getElementById(id);
let writing = false;
let observer = null;

const BED_POSE_HINTS = ["bed", "lying", "recline", "headboard", "duvet", "pillow", "edge"];
const FLOOR_STANDING_HINTS = ["standing", "stand", "wardrobe", "vanity", "center", "bedside"];
const LOW_LIGHT_IDS = new Set(["phone_screen_only", "lamp_only", "lamp_and_phone", "ceiling_spots_dim"]);
const SOURCE_DEPENDENT_IDS = new Set(["lamp_only", "lamp_and_phone", "window_daylight", "ceiling_spots_dim", "ceiling_white", "ceiling_warm"]);

function selectedValue(id) { return $(id)?.value || ""; }
function selectedText(id) { return $(id)?.selectedOptions?.[0]?.textContent?.trim() || ""; }
function lower(value) { return String(value || "").toLowerCase(); }
function poseToken() { return `${selectedValue("poseSelect")} ${selectedText("poseSelect")}`.toLowerCase(); }
function lightingId() { return selectedValue("lightingSelect"); }
function sceneText() { return `${$("sceneName")?.textContent || ""} ${$("sceneRegion")?.textContent || ""}`.toLowerCase(); }
function activeTemplateId() { return document.documentElement.dataset.activeBedroomTemplate || document.documentElement.dataset.activeRoomScenario || selectedValue("templateSelect") || ""; }

function hasAny(text, hints) { return hints.some((hint) => text.includes(hint)); }
function isBedPose() { return hasAny(poseToken(), BED_POSE_HINTS) || /سرير|استلق|وساد|لحاف|حافة/.test(poseToken()); }
function isStandingPose() { return hasAny(poseToken(), FLOOR_STANDING_HINTS) || /وقوف|دولاب|تسريحة|وسط/.test(poseToken()); }
function isBedZone() { return /bed|سرير|pillow|وساد|headboard|مرتبة/.test(sceneText()) || isBedPose(); }

function supportMapBlock() {
  if (isBedPose()) {
    return `BEDROOM SUPPORT MAP — BED / SOFT SUPPORT
- Solve the subject's weight before surface appearance. Identify which head, shoulder, back/ribcage, pelvis, thigh, elbow, forearm, knee or calf regions actually bear load in the selected pose.
- Mattress and pillow compression must occur directly beneath real load-bearing regions, with believable depth and a smooth deformation gradient into uncompressed areas.
- If the head rests on a pillow, the pillow supports the skull through a real contact patch; local cheek/hair deformation may occur only on the supported side while stable facial identity geometry remains unchanged.
- Limbs not touching the bed must not create dents or contact shadows. No hovering torso, floating elbow, or support compression disconnected from body weight.`;
  }
  if (isStandingPose()) {
    return `BEDROOM SUPPORT MAP — FLOOR-GROUNDED STANCE
- Route body weight through the real floor: both feet or the declared supporting foot must contact the floor with plausible heel/forefoot loading, knee state, pelvis shift and torso counterbalance.
- Any optional hand/hip/shoulder contact with bed, wardrobe, vanity or wall is valid only when that real surface exists at the contact point in the MASTER REFERENCE.
- Do not bend or disturb bedding merely because the subject stands near the bed.`;
  }
  return `BEDROOM SUPPORT MAP — GENERAL
- Identify all real load-bearing contacts from the selected bedroom pose and existing MASTER REFERENCE geometry before rendering soft materials.
- Pressure, occlusion and contact shadow must attach to actual contact points only. Never invent an unseen support surface to make the pose easier.`;
}

function beddingPhysicsBlock() {
  if (!isBedZone()) {
    return `BEDDING PHYSICS — PRESERVE WHEN NOT TOUCHED
- If the selected pose does not physically touch the bed, preserve mattress, pillows, sheet and duvet state from the MASTER REFERENCE. Do not add decorative dents, folds or displaced bedding.`;
  }
  return `BEDDING PHYSICS — LOAD-DRIVEN ONLY
- Treat mattress, sheet, pillowcases and duvet as different layered materials. Mattress deformation is broad and compliant; sheets create finer tension/compression folds; pillows deform locally around head/arm load; duvet volume changes through gravity, trapped air, friction and body contact.
- Every new fold must have a mechanical cause: compression, tension between anchor points, friction, body displacement or gravity. No evenly distributed decorative wrinkles and no copied fold map from an incompatible source pose.
- Folds should radiate or bunch from real load/contact zones and decay with distance. Do not make every fold equally sharp.
- Preserve existing bedding color, material family, object count and overall arrangement from the MASTER REFERENCE. Pose interaction may deform only the portions physically contacted by the subject.
- Contact affects BOTH sides: body/clothing compress locally and bedding responds beneath them with matching occlusion and attached shadow.
- Hair resting on pillow or sheet follows the same support, friction and gravity solution; do not float strands above the surface without cause.`;
}

function lightingValidationBlock() {
  const id = lightingId();
  const label = selectedText("lightingSelect") || id || "not selected";
  const sourceDependent = SOURCE_DEPENDENT_IDS.has(id);
  const low = LOW_LIGHT_IDS.has(id);
  return `BEDROOM LIGHTING SOURCE VALIDATION — SELECTED: ${label}
- Lighting must originate only from the selected preset and from physically corresponding source geometry in the bedroom. Never add a private face fill, beauty light, rim light, softbox or invisible ceiling source.
${sourceDependent ? "- This preset depends on a real room fixture or opening. Do not fabricate a lamp, ceiling fixture, window, LED strip or other source that is absent from the MASTER REFERENCE. If the named source is not physically supported by the reference geometry, treat the preset as incompatible rather than inventing hardware." : "- Keep source geometry consistent with the declared preset and visible room surfaces; do not create extra practical lights."}
- Shadows, catchlights, specular highlights and reflected color must all point back to the same declared source geometry. A bright surface reflection cannot exist without a source that can physically reach it.
- Bedsheet, skin, hair, wood, painted wall, glass and mirror must respond according to their own diffuse/specular properties under the same source.
${low ? "- This is a low-light bedroom condition: accept darker distant regions, illumination-dependent sensor noise, reduced fine detail and finite HDR instead of silently brightening the room." : "- Keep exposure finite: bright practicals may approach clipping while remote shadow regions remain lower signal-to-noise."}
- White balance may partially adapt to the selected source but must preserve a believable residual warm/cool cast. No face-only color correction.`;
}

function masterGeometryBlock() {
  return `MASTER BEDROOM GEOMETRY LOCK
- MASTER REFERENCE remains the authority for room layout, bed orientation, furniture positions, wall planes, mirrors, wardrobe, vanity, curtains, floor, object count, materials and perspective relationships.
- Subject pose and camera framing must adapt to the room. Never widen the room, move furniture, rotate the bed, create a new support, open/close wardrobe doors or relocate clutter to accommodate the pose.
- Near-field selfie parallax may change apparent relative scale only as expected from camera position; it must not alter actual room dimensions.`;
}

function realityBlock() {
  return `${MARKER_START}\n${supportMapBlock()}\n\n${beddingPhysicsBlock()}\n\n${lightingValidationBlock()}\n\n${masterGeometryBlock()}\n\nBEDROOM FINAL PHYSICAL GATE\nReject and correct before output: missing mattress/pillow compression under visible load; dents with no body contact; floating limbs; unsupported head or torso; hair inconsistent with gravity/support; decorative bedding folds without load paths; invented furniture or lighting fixtures; lighting direction inconsistent with the selected source; mirror/reflection geometry inconsistent with the room; face-only denoise/relight; or a selfie viewpoint that requires moving the camera outside reachable front-camera geometry.\n\nTarget: ordinary physically coherent bedroom smartphone capture. Realism comes from support, gravity, materials, light and sensor limitations agreeing with each other. CAPTURED, NOT RENDERED.\n${MARKER_END}`;
}

function stripBlock(text) {
  const start = text.indexOf(MARKER_START);
  if (start < 0) return text;
  const end = text.indexOf(MARKER_END, start);
  if (end < 0) return text.slice(0, start).trimEnd();
  return `${text.slice(0, start)}${text.slice(end + MARKER_END.length)}`.replace(/\n{3,}/g, "\n\n").trim();
}

function transform(text) {
  const clean = stripBlock(text || "");
  if (!clean.trim()) return clean;
  const anchors = ["FINAL VALIDATION", "FINAL REJECTION", "OUTPUT INTENT"];
  for (const anchor of anchors) {
    const index = clean.indexOf(anchor);
    if (index >= 0) return `${clean.slice(0, index).trimEnd()}\n\n${realityBlock()}\n\n${clean.slice(index)}`;
  }
  return `${clean}\n\n${realityBlock()}`.trim();
}

function scoreModel() {
  let geometry = 10;
  let support = 9;
  let bedding = 9;
  let lighting = lightingId() ? 9 : 5;
  let selfie = 9;
  const notes = [];

  if (isBedPose()) { support = 10; bedding = 10; }
  if (isStandingPose() && !isBedZone()) bedding = 10;
  if (SOURCE_DEPENDENT_IDS.has(lightingId())) {
    lighting = 8;
    notes.push("الإضاءة المختارة تعتمد على وجود مصدر فعلي مطابق داخل MASTER REFERENCE؛ المحرك يمنع اختراع المصدر.");
  }
  if (!lightingId()) notes.push("لم تُحدد الإضاءة بعد، لذلك فحص مصدر الضوء غير مكتمل.");
  const pose = lower(selectedValue("poseSelect"));
  if (pose.includes("mirror")) {
    selfie = 7;
    notes.push("وجود المرآة يحتاج فصلًا صارمًا بين انعكاس الغرفة ومسار التقاط السيلفي الأمامي.");
  }
  if (!activeTemplateId()) {
    geometry = 8;
    notes.push("لم يُحدد قالب غرفة نشط؛ تقييم هندسة منطقة التفاعل أقل ثقة.");
  }

  const total = Math.round(((geometry + support + bedding + lighting + selfie) / 5) * 10) / 10;
  return { geometry, support, bedding, lighting, selfie, total, notes };
}

function ensureScoreUi() {
  let box = $("bedroomRealityScore");
  if (box) return box;
  const validation = $("validationSummary")?.parentElement;
  if (!validation) return null;
  box = document.createElement("div");
  box.id = "bedroomRealityScore";
  box.className = "validation-summary";
  box.style.marginTop = "10px";
  box.setAttribute("aria-live", "polite");
  validation.insertBefore(box, $("conflictsList") || null);
  return box;
}

function renderScore() {
  const box = ensureScoreUi();
  if (!box) return;
  const s = scoreModel();
  box.innerHTML = `<strong>Bedroom Reality Score: ${s.total}/10</strong><br>هندسة الغرفة: ${s.geometry}/10 · التلامس/الدعم: ${s.support}/10 · فيزياء الفراش: ${s.bedding}/10 · مصدر الإضاءة: ${s.lighting}/10 · هندسة السيلفي: ${s.selfie}/10${s.notes.length ? `<br><span>${s.notes.join(" ")}</span>` : "<br><span>لا توجد مخاطر إعداد واضحة في القالب الحالي.</span>"}`;
  box.dataset.score = String(s.total);
}

function apply() {
  const output = $("finalPrompt");
  if (!output || writing) { renderScore(); return; }
  const next = transform(output.textContent || "");
  if (next !== output.textContent) {
    writing = true;
    output.textContent = next;
    const count = next.trim().split(/\s+/).filter(Boolean).length;
    if ($("promptWordCount")) $("promptWordCount").textContent = `${count} كلمة`;
    queueMicrotask(() => { writing = false; });
  }
  renderScore();
}

function install() {
  ["templateSelect", "poseSelect", "lightingSelect", "expressionSelect", "clothingSelect", "aspectSelect"].forEach((id) => $(id)?.addEventListener("change", () => queueMicrotask(apply)));
  ["sceneName", "sceneRegion"].forEach((id) => {
    const node = $(id);
    if (node) new MutationObserver(() => queueMicrotask(apply)).observe(node, { childList: true, characterData: true, subtree: true });
  });
  document.addEventListener("bedroom-template-hub-built", () => queueMicrotask(apply));
  document.addEventListener("room-scenario-changed", () => queueMicrotask(apply));
  const output = $("finalPrompt");
  if (output) {
    observer = new MutationObserver(() => queueMicrotask(apply));
    observer.observe(output, { childList: true, characterData: true, subtree: true });
  }
  apply();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
else install();
