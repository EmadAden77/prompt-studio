const VERSION = "v1.0";

const POSES = Object.freeze({
  standing_relaxed: "Stand naturally with both feet grounded, pelvis neutral, shoulders slightly asymmetric, arms relaxed without staged symmetry.",
  standing_weight_shift: "Stand with a mild natural weight shift onto one leg; the opposite knee relaxes slightly, pelvis and shoulders counterbalance subtly, both feet remain physically grounded.",
  standing_pocket: "Stand casually with one non-camera hand resting naturally in a real pocket if the preserved clothing contains one; otherwise keep that hand relaxed at the side rather than inventing a pocket.",
  standing_side_turn: "Stand with a restrained 15–25 degree torso yaw relative to the camera while the head returns naturally toward the lens; keep neck, shoulder and ribcage rotation anatomically continuous.",
  sitting_chair: "Sit naturally on a real chair or seat supported by the visible/preserved scene; pelvis bears weight on the seat, feet contact the floor when visible, spine and shoulders remain relaxed.",
  sitting_edge: "Sit on the edge of an existing physically suitable support; pelvis compression, support contact, thigh angle and foot placement must all agree with gravity.",
  leaning_wall: "Use a light, believable lean against a real wall only if the preserved scene contains one at the required location; shoulder/back contact produces attached contact shadow and slight clothing compression.",
  leaning_surface: "Use a mild lean against an existing stable surface only if that surface is visibly supported by the reference scene; never invent a table, rail or counter solely to support the pose.",
  lying_back: "Lie naturally on the back on an existing physically suitable support; gravity redistributes soft tissue, hair and clothing toward the support and contact deformation must be visible where resolvable.",
  lying_side: "Lie naturally on one side on an existing physically suitable support; shoulder, ribcage, hip and head support must form one coherent load path with local soft-tissue and fabric compression.",
  walking_pause: "Capture a natural pause during walking: one foot may be slightly advanced, body mass stays balanced over a plausible base of support, arms and shoulders retain ordinary gait asymmetry."
});

const SCOPES = Object.freeze({
  identity: `PRESERVATION SCOPE — PERSON ONLY
- Preserve the same person: exact stable facial identity, head shape, hairline, hair type, beard/moustache boundaries, visible body proportions, skin tone, apparent age and distinctive marks.
- Clothing and environment may change only as required by the requested pose, but never use them to alter identity or body type.`,
  identity_clothes: `PRESERVATION SCOPE — PERSON + CLOTHING
- Preserve the same person and the same visible clothing design, garment type, material family, colors, graphics, seams and accessories from the reference.
- Re-drape clothing according to the new pose using gravity, stretch, compression, folds and contact. Do not copy old folds onto the new pose and do not redesign the garment.`,
  identity_clothes_scene: `PRESERVATION SCOPE — PERSON + CLOTHING + ENVIRONMENT
- Preserve the same person, visible clothing and the same environment geometry, object count, materials, layout and distinctive clutter.
- The new pose must fit the existing scene. Never move furniture, widen the room, add support objects, mirror the layout, or alter architecture just to make the pose easier.
- If the requested pose cannot physically fit the preserved environment, simplify the pose rather than modifying the environment.`
});

const FRAMING = Object.freeze({
  auto: "Choose the tightest framing that fully supports the new pose without inventing unseen anatomy or unnecessary environment.",
  close: "Use a close portrait crop; include only the anatomy needed to prove the requested pose. Do not imply full-body information that the crop cannot show.",
  half: "Use a natural half-body crop, keeping limb origins and torso mechanics anatomically continuous.",
  three_quarter: "Use a three-quarter crop only when the reference provides enough body information or conservative anatomical continuation can be made without changing body type.",
  full: "Use full-body framing only with conservative anatomical continuation for regions absent from the reference; preserve inferred body type and proportions without exaggerated musculature or altered limb lengths."
});

const CAMERA = Object.freeze({
  preserve: "Preserve the reference image's physically plausible camera logic, perspective class and viewing height unless that would make the requested pose impossible.",
  front_selfie: "Use a genuine subject-held smartphone front-camera selfie at reachable arm length, approximately 22–24mm full-frame-equivalent around f/2.0. Keep the camera-holding arm outside crop unless unavoidable; no fisheye limb stretching.",
  mirror_selfie: "Use one physically valid mirror ray path: subject → mirror → camera. Preserve mirror handedness, phone/reflection geometry and reflected background consistency; do not mix direct-selfie perspective with mirror perspective.",
  observer: "Use an ordinary handheld smartphone photograph from another person's plausible position, with natural phone perspective and no studio-camera look."
});

const els = {};
let activeFile = null;
let objectUrl = null;

function $(id) { return document.getElementById(id); }

function init() {
  ["poseReferenceInput","poseReferenceDropzone","poseReferencePreview","poseReferenceEmpty","poseReferenceMeta","targetPoseSelect","customPoseField","customPoseInput","framingSelect","cameraModeSelect","buildPosePromptBtn","resetPoseTransformerBtn","posePromptOutput","posePromptWordCount","posePromptStatus","copyPosePromptBtn"].forEach((id) => { els[id] = $(id); });
  els.poseReferenceInput?.addEventListener("change", onFile);
  els.targetPoseSelect?.addEventListener("change", () => { if (els.customPoseField) els.customPoseField.hidden = els.targetPoseSelect.value !== "custom"; buildPrompt(); });
  document.querySelectorAll('input[name="preserveScope"]').forEach((node) => node.addEventListener("change", buildPrompt));
  [els.customPoseInput, els.framingSelect, els.cameraModeSelect].forEach((node) => node?.addEventListener("input", buildPrompt));
  els.buildPosePromptBtn?.addEventListener("click", buildPrompt);
  els.resetPoseTransformerBtn?.addEventListener("click", reset);
  els.copyPosePromptBtn?.addEventListener("click", copyPrompt);
}

function onFile(event) {
  const file = event.target.files?.[0] ?? null;
  activeFile = file;
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = null;
  if (!file) return resetPreview();
  if (!file.type.startsWith("image/")) {
    activeFile = null;
    els.posePromptStatus.textContent = "الملف المختار ليس صورة مدعومة.";
    return resetPreview();
  }
  objectUrl = URL.createObjectURL(file);
  els.poseReferencePreview.src = objectUrl;
  els.poseReferencePreview.hidden = false;
  els.poseReferenceEmpty.hidden = true;
  els.poseReferenceMeta.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`;
  buildPrompt();
}

function resetPreview() {
  if (els.poseReferencePreview) {
    els.poseReferencePreview.hidden = true;
    els.poseReferencePreview.removeAttribute("src");
  }
  if (els.poseReferenceEmpty) els.poseReferenceEmpty.hidden = false;
  if (els.poseReferenceMeta) els.poseReferenceMeta.textContent = "";
}

function currentScope() {
  return document.querySelector('input[name="preserveScope"]:checked')?.value ?? "identity";
}

function poseInstruction() {
  if (els.targetPoseSelect?.value === "custom") {
    const text = els.customPoseInput?.value?.trim();
    return text ? `CUSTOM TARGET POSE: ${text}\nInterpret this conservatively through real joint limits, support, balance, gravity and contact.` : "CUSTOM TARGET POSE: not described yet.";
  }
  return POSES[els.targetPoseSelect?.value] ?? POSES.standing_relaxed;
}

function buildPrompt() {
  const fileReady = Boolean(activeFile);
  const prompt = `REFERENCE POSE TRANSFORMER ${VERSION}\n\nREFERENCE IMAGE AUTHORITY — ABSOLUTE\n- Use the attached reference image as the visual authority for the same person's identity and every preservation category selected below.\n- Preserve stable facial identity 1:1: skull/face geometry, jaw/chin, eye shape and spacing, eyelids, nose structure, mouth/lip proportions, ears, hairline, facial hair boundaries, skin tone, apparent age, natural asymmetry and distinctive marks.\n- Expression, head angle, gravity, contact and perspective may change soft-tissue appearance only. They must not redesign stable facial landmarks or bone structure.\n- Preserve the visible body type and proportions. Do not make the subject taller, shorter, leaner, broader, more muscular or differently proportioned merely to satisfy the new pose.\n\nPOSE CHANGE ONLY — PRIMARY EDIT\n${poseInstruction()}\n- Reconstruct only the body regions required by the new pose. For regions hidden or outside the reference crop, use conservative anatomically plausible continuation consistent with the visible body type.\n- Never claim exact hidden anatomy from the reference. Do not invent exaggerated musculature, altered limb lengths, extra fingers, missing joints or impossible support.\n- Maintain real balance, center of mass, joint limits, gravity, pressure, occlusion, contact shadows and local material deformation.\n\n${SCOPES[currentScope()]}\n\nCAMERA / PERSPECTIVE\n${CAMERA[els.cameraModeSelect?.value] ?? CAMERA.preserve}\n${FRAMING[els.framingSelect?.value] ?? FRAMING.auto}\n- Use one coherent optical model across face, body and environment. Perspective is allowed to change apparent scale with distance, but not actual anatomy.\n- Keep ordinary smartphone HDR, white balance, denoise, sharpening, compression and illumination-dependent sensor noise coherent across the entire frame. No face-only cleanup or selective relighting.\n\nMATERIAL / SKIN / HAIR REALISM\n- Preserve camera-resolvable skin texture only. No decorative pore stamping, wax skin, beauty smoothing or synthetic hyper-detail.\n- Hair follows the reference hair type and hairline, then reorients only as gravity, movement, support and friction require for the new pose.\n- Clothing, if preserved, must re-drape from the new body mechanics instead of inheriting old folds.\n\nFINAL VALIDATION GATE\nReject and correct the result before output if any of the following occurs: identity drift; changed facial geometry; altered body type; impossible joints; unsupported pose; floating limbs; incorrect contact; invented support objects; duplicated fingers; clothing redesign when clothing preservation is selected; environment changes when scene preservation is selected; synthetic portrait blur; inconsistent face/background processing; or perspective that changes anatomy instead of apparent distance.\n\nOUTPUT INTENT\nProduce one physically plausible photographic result of the same person in the requested new pose. The new pose is the edit; identity remains the anchor.`;

  if (els.posePromptOutput) els.posePromptOutput.textContent = prompt;
  const count = prompt.trim().split(/\s+/).filter(Boolean).length;
  if (els.posePromptWordCount) els.posePromptWordCount.textContent = `${count} كلمة`;
  if (els.posePromptStatus) els.posePromptStatus.textContent = fileReady ? "جاهز: أرفق نفس الصورة المرجعية مع هذا الـPrompt." : "يمكن معاينة الـPrompt الآن، لكن يجب إرفاق صورة مرجعية عند الاستخدام.";
  return prompt;
}

async function copyPrompt() {
  const text = buildPrompt();
  try {
    await navigator.clipboard.writeText(text);
    els.posePromptStatus.textContent = "تم نسخ الـPrompt.";
  } catch {
    els.posePromptStatus.textContent = "تعذر النسخ التلقائي. حدّد النص وانسخه يدويًا.";
  }
}

function reset() {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = null;
  activeFile = null;
  if (els.poseReferenceInput) els.poseReferenceInput.value = "";
  if (els.targetPoseSelect) els.targetPoseSelect.value = "standing_relaxed";
  if (els.customPoseInput) els.customPoseInput.value = "";
  if (els.customPoseField) els.customPoseField.hidden = true;
  if (els.framingSelect) els.framingSelect.value = "auto";
  if (els.cameraModeSelect) els.cameraModeSelect.value = "preserve";
  const first = document.querySelector('input[name="preserveScope"][value="identity"]');
  if (first) first.checked = true;
  resetPreview();
  buildPrompt();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();
