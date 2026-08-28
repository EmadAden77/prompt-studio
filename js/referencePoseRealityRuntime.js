const VERSION = "v1.8";
const MARKER_START = "PHYSICAL REALITY ENGINE — v1.8";
const MARKER_END = "END PHYSICAL REALITY ENGINE";

const LOW_LIGHT = new Set([
  "phone_pure_dark","soft_screen_fill","single_candle","multi_candle","tv_monitor_glow",
  "fairy_string_lights","salt_lamp_glow","subtle_neon","streetlight_blinds",
  "door_gap_hallway","subtle_rim_semidark","star_nebula_projector"
]);
const SUPPORT_POSES = new Set(["sitting_chair","sitting_edge","leaning_wall","leaning_surface","lying_back","lying_side"]);
const LYING_POSES = new Set(["lying_back","lying_side"]);

let writing = false;
let observer = null;
const $ = (id) => document.getElementById(id);

function poseId() { return $("targetPoseSelect")?.value || "smart_auto"; }
function lightId() { return $("nightLightingSelect")?.value || ""; }
function frameId() { return $("framingSelect")?.value || "auto"; }
function scopeId() { return document.querySelector('input[name="preserveScope"]:checked')?.value || "identity"; }
function boldnessId() { return $("poseBoldnessSelect")?.value || "medium"; }

function contactBlock() {
  const pose = poseId();
  if (pose === "smart_auto") return `CONTACT / PRESSURE SOLVER — REQUIRED
- After classifying the reference pose and selecting the new pose, identify every real load-bearing contact before rendering body appearance.
- Solve body weight through actual support points only. Where skin, clothing, hair, bedding, furniture, wall or floor contact occurs, create proportionate compression, attached contact shadow, occlusion and local material deformation.
- Unsupported regions remain unsupported; never create invisible cushions, rails, walls or surfaces to make the pose work.
- For reclining, sitting or leaning results, support deformation must be visible wherever the camera can resolve it. For standing results, feet must carry weight through a plausible base of support.`;
  if (LYING_POSES.has(pose)) return `CONTACT / PRESSURE SOLVER — LYING POSE
- Establish mattress/pillow/support contact before facial and clothing appearance. Head, shoulder, ribcage, pelvis and any visible limbs must form one coherent load path.
- Bedding compresses under load and rebounds away from pressure zones; folds radiate from real compression/tension points rather than appearing decorative.
- Any cheek or soft-tissue contact deforms locally with pressure while skull, jaw, eye, nose and lip identity geometry remain unchanged.
- Hair spreads, flattens or bunches only at real support/friction regions. No floating head, hovering shoulder or uncompressed pillow beneath visible weight.`;
  if (SUPPORT_POSES.has(pose)) return `CONTACT / PRESSURE SOLVER — SUPPORTED POSE
- Identify the exact existing support surface and route body weight into it through anatomically plausible contact points.
- Contact creates local clothing/soft-tissue compression, attached shadow, occlusion and surface response on BOTH contacting sides where resolvable.
- Do not invent a support object or let the torso/limbs hover a few centimeters above the declared support.`;
  return `CONTACT / PRESSURE SOLVER — GROUNDED POSE
- Keep center of mass over a plausible base of support. Feet, floor contact, knee state, pelvis and torso counterbalance must agree.
- Any hand, hip, shoulder or back contact with an existing surface must produce attached shadow and local fabric/soft-tissue deformation. No floating limbs or weightless stance.`;
}

function gravityBlock() {
  return `GRAVITY FIELD LOCK — ONE WORLD DIRECTION
- Use one consistent gravity direction for body, face soft tissue, hair, clothing, bedding and loose materials.
- Do not paste an upright facial soft-tissue pattern onto a reclined body. Gravity may subtly redistribute cheeks, lips, eyelids, neck soft tissue and hair, but it may not alter stable identity geometry.
- Hair roots remain anchored to the reference hairline while free strands fall, spread, compress or bunch according to body orientation, support, friction and movement.
- Clothing hangs from real suspension points and folds around joints/contact according to tension, compression and fabric weight. No evenly distributed decorative wrinkles.
- Bedding and soft furnishings sag/compress under actual load. Every deformation must have a mechanical cause.`;
}

function sensorBlock() {
  const light = lightId();
  if (!light) return `XIAOMI FRONT SENSOR / EXPOSURE MODEL — WAITING FOR USER LIGHTING
- Do not invent exposure behavior until the user selects a lighting preset.`;
  const low = LOW_LIGHT.has(light);
  if (low) return `XIAOMI 15 ULTRA FRONT SENSOR / EXPOSURE MODEL — LOW LIGHT
- Treat this as a real handheld front-camera low-light exposure, not a studio-clean render. Preserve finite highlight headroom, underexposed distant regions, illumination-dependent chroma/luma noise and some loss of fine detail in deep shadows.
- Multi-frame HDR/denoise may reduce noise only to a believable smartphone degree. Do not erase texture selectively from the face or recover impossible shadow detail.
- Sharpening and compression remain restrained and whole-frame coherent. Darker regions may look slightly softer/noisier than well-lit regions.
- White balance may partially neutralize the selected source but must retain a plausible residual color cast from that real source. Do not force neutral skin while leaving the room strongly tinted through unrelated local correction.
- Small-sensor depth behavior keeps much of the room structurally readable unless true focus distance and geometry justify blur. No synthetic portrait-mask bokeh.`;
  return `XIAOMI 15 ULTRA FRONT SENSOR / EXPOSURE MODEL — MODERATE LIGHT
- Use ordinary front-camera auto exposure with finite HDR, realistic highlight clipping risk, modest shadow noise, restrained denoise and moderate sharpening/compression.
- Do not equalize every surface to perfect exposure. Bright practical sources may approach clipping while darker room regions retain lower signal-to-noise.
- Apply one white-balance/tone-mapping pipeline to skin, clothing and environment. Preserve a plausible residual source color cast rather than neutralizing all lighting character.
- Keep small-sensor depth behavior physically plausible; the background normally remains readable without synthetic portrait-mask blur.`;
}

function framingRealityBlock() {
  return `SELFIE REACH / NEAR-FIELD GEOMETRY GATE
- Camera position must remain reachable by the subject's real arm while the complete camera-holding limb and phone stay outside the final crop.
- Preserve natural near-field parallax: closer facial/body planes may appear mildly larger only because of distance. Never "correct" this into telephoto geometry and never let perspective alter actual anatomy.
- If pose + requested framing cannot fit a real arm-length front-camera capture, reduce pose angle or loosen/tighten crop as needed. Do not move the virtual camera to an observer position, lengthen the arm or create an impossible full-body selfie.
- Full-body framing is a high-risk request and is allowed only when a physically credible capture geometry can be maintained.`;
}

function realityBlock() {
  return `${MARKER_START}
${contactBlock()}

${gravityBlock()}

${sensorBlock()}

${framingRealityBlock()}

WHOLE-FRAME PHYSICAL COHERENCE
- Skin, hair, fabric, glass, painted wall, wood, bedding and other materials must respond differently according to their real diffuse/specular properties, but all remain under the SAME selected light sources and camera pipeline.
- No face-only relight, face-only denoise, selective beauty HDR, isolated sharpness boost or locally invented catchlight.
- Reject decorative "realism" artifacts with no physical cause: random lens dirt, arbitrary chromatic aberration, fake film grain, excessive pores or uniform microtexture.

FINAL PHYSICAL GATE
Reject and correct: unsupported body weight; missing support compression; inconsistent gravity; floating limbs; hair falling in the wrong direction; clothing folds without load paths; impossible selfie reach; observer-camera perspective; excessive synthetic bokeh; face cleaner/sharper than the rest without optical cause; shadow direction inconsistent with selected lighting; material reflections that ignore source geometry.
${MARKER_END}`;
}

function stripBlock(text) {
  const start = text.indexOf(MARKER_START);
  if (start < 0) return text;
  const end = text.indexOf(MARKER_END, start);
  if (end < 0) return text.slice(0, start).trimEnd();
  return `${text.slice(0, start)}${text.slice(end + MARKER_END.length)}`.replace(/\n{3,}/g, "\n\n").trim();
}

function transform(text) {
  let clean = stripBlock(text || "");
  clean = clean.replace(/REFERENCE POSE TRANSFORMER v1\.[0-9]+/, `REFERENCE POSE TRANSFORMER ${VERSION}`);
  const anchor = "\n\nFINAL VALIDATION GATE";
  if (clean.includes(anchor)) return clean.replace(anchor, `\n\n${realityBlock()}${anchor}`);
  return `${clean}\n\n${realityBlock()}`.trim();
}

function scoreModel() {
  let camera = 10;
  let contact = 9;
  let lighting = lightId() ? 9 : 4;
  let framing = 9;
  const risks = [];
  const pose = poseId();
  const frame = frameId();
  const scope = scopeId();
  const bold = boldnessId();

  if (pose === "smart_auto") contact = 8;
  if (LYING_POSES.has(pose)) contact = 10;
  if (SUPPORT_POSES.has(pose) && scope !== "identity_clothes_scene") {
    contact -= 1;
    risks.push("الوضعية تعتمد على سطح داعم؛ مرجع المكان المحفوظ يقلل احتمال اختراع الدعم.");
  }
  if (frame === "full") {
    framing = 5;
    camera = 7;
    risks.push("الكادر الكامل عالي المخاطرة لسيلفي بذراع واحدة وسيُقيّد بقفل مسافة السيلفي.");
  } else if (frame === "three_quarter") framing = 8;
  if (bold === "clear") {
    contact = Math.max(6, contact - 1);
    framing = Math.max(6, framing - 1);
    risks.push("جرأة «واضح» تزيد عبء إعادة بناء التشريح والتلامس.");
  }
  if (!lightId()) risks.push("لم تُحدد الإضاءة بعد، لذلك تقييم الحساس والتعريض غير مكتمل.");
  if (lightId() && LOW_LIGHT.has(lightId())) lighting = 10;

  const total = Math.round((camera + contact + lighting + framing) / 4 * 10) / 10;
  return { camera, contact, lighting, framing, total, risks };
}

function renderScore() {
  const box = $("realityValidationScore");
  if (!box) return;
  const s = scoreModel();
  box.innerHTML = `<strong>تقييم اتساق الإعدادات: ${s.total}/10</strong><br>الكاميرا: ${s.camera}/10 · التلامس والجاذبية: ${s.contact}/10 · الإضاءة/الحساس: ${s.lighting}/10 · قابلية كادر السيلفي: ${s.framing}/10${s.risks.length ? `<br><span>${s.risks.join(" ")}</span>` : "<br><span>لا توجد مخاطر إعداد واضحة حاليًا.</span>"}`;
  box.dataset.score = String(s.total);
}

function apply() {
  const output = $("posePromptOutput");
  if (!output || writing) return;
  const next = transform(output.textContent || "");
  if (next !== output.textContent) {
    writing = true;
    output.textContent = next;
    const count = next.trim().split(/\s+/).filter(Boolean).length;
    if ($("posePromptWordCount")) $("posePromptWordCount").textContent = `${count} كلمة`;
    queueMicrotask(() => { writing = false; });
  }
  renderScore();
}

function install() {
  ["targetPoseSelect","poseBoldnessSelect","nightLightingSelect","framingSelect","clothingSelect","expressionSelect"].forEach((id) => $(id)?.addEventListener("input", apply));
  document.querySelectorAll('input[name="preserveScope"]').forEach((node) => node.addEventListener("change", apply));
  $("buildPosePromptBtn")?.addEventListener("click", () => queueMicrotask(apply));
  $("resetPoseTransformerBtn")?.addEventListener("click", () => queueMicrotask(apply));
  const output = $("posePromptOutput");
  if (output) {
    observer = new MutationObserver(() => queueMicrotask(apply));
    observer.observe(output, { childList:true, characterData:true, subtree:true });
  }
  apply();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once:true });
else install();
