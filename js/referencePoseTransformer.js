const VERSION = "v1.5";

const SMART_AUTO_POSE = `SMART POSE SELECTION — ANALYZE REFERENCE FIRST
- Before choosing the new pose, inspect the attached reference image and classify the CURRENT visible body state conservatively: standing / sitting / reclining / lying / walking-pause / partial-body / ambiguous.
- Also inspect only what is visibly supportable: torso yaw, shoulder asymmetry, head orientation, weight distribution, visible support/contact, limb visibility, crop coverage, and whether the scene contains usable support surfaces.
- Do NOT infer hidden limbs, exact height, unseen musculature, or unsupported environment geometry from the reference.
- Select ONE new pose that is clearly different from the current pose but requires the smallest safe anatomical transition and the least unsupported reconstruction.
- Prefer conservative transitions over dramatic ones. If the reference is partial-body, prefer standing micro-variation, mild torso yaw, shoulder asymmetry, or a subtle weight shift instead of full-body sitting/lying poses.
- If the subject is already standing, prefer a different standing balance state, slight torso turn, grounded pocket-hand pose only when a real pocket exists, or a mild supported lean only when a real support exists.
- If the subject is sitting, prefer a different seated balance/torso orientation or a conservative stand-up result only when enough lower-body information can be plausibly continued.
- If the subject is reclining or lying, prefer a modest change of side/support orientation or semi-reclined transition rather than inventing a remote standing composition.
- If the scene is being preserved, the chosen pose MUST fit existing floor, furniture, walls, seats, bed or support geometry. Never move or invent support objects.
- If several poses are plausible, choose the one with the lowest identity risk, lowest hidden-anatomy burden, strongest physical support, and clearest visual difference from the original.
- Never repeat the original pose with only cosmetic arm movement and call it a new pose.
- State the chosen pose internally and then execute it consistently through body mechanics, contact, framing and the mandatory front-camera selfie perspective.`;

const POSES = Object.freeze({
  smart_auto: SMART_AUTO_POSE,
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
  auto: "Choose the tightest framing that fully supports the selected new pose while remaining physically reachable as a hand-held front-camera selfie and without inventing unseen anatomy or unnecessary environment.",
  close: "Use a close front-camera selfie crop; include only the anatomy needed to prove the requested pose and preserve natural near-field perspective.",
  half: "Use a natural half-body front-camera selfie crop, keeping limb origins and torso mechanics anatomically continuous.",
  three_quarter: "Use a three-quarter front-camera selfie crop only when a realistic arm-length camera distance and available reference anatomy support it.",
  full: "Use full-body framing only if it remains physically plausible for a subject-held front-camera selfie; otherwise loosen the interpretation rather than inventing impossible camera distance or arm length."
});

const EXPRESSIONS = Object.freeze({
  preserve_reference: `ANATOMICAL FACIAL EXPRESSION — PRESERVE REFERENCE
- Preserve the reference facial muscle state as closely as the new head angle, gravity and selfie perspective allow.
- Do not freeze skin mechanically. Allow only the minimum soft-tissue response required by the new pose and viewpoint.`,
  subtle_authentic_smile: `ANATOMICAL FACIAL EXPRESSION — AUTHENTIC DUCHENNE SMILE
- Natural zygomaticus major activation lifts the mouth corners subtly while orbicularis oculi engagement creates delicate lower-lid response and small crow's-feet only where age, skin and camera resolution support them.
- Cheeks elevate naturally, nasolabial depth responds without changing cheekbone geometry, and the jaw remains relaxed.`,
  serene_relaxed_gaze: `ANATOMICAL FACIAL EXPRESSION — SERENE RELAXED GAZE
- Resting facial tonus is low; eyelids settle at their natural relaxed aperture with only mild gravity-led droop.
- Corrugator tension releases, masseter stays neutral, lips may part by about 1–2 mm without changing lip volume, and gaze remains calm and coherent with the front-camera lens.`,
  playful_smirk: `ANATOMICAL FACIAL EXPRESSION — SUBTLE PLAYFUL SMIRK
- Small unilateral risorius/zygomatic contribution lifts one mouth corner while the other stays near baseline.
- A shallow dimple may appear only if consistent with the reference face; one brow may rise by only a few millimeters. Asymmetry is muscular, never skeletal.`,
  cozy_sleepy_warmth: `ANATOMICAL FACIAL EXPRESSION — COZY SLEEPY WARMTH
- Upper eyelids rest noticeably lower from fatigue while eye size and canthus geometry stay fixed.
- Frontalis, temporalis and masseter remain relaxed; lips rest softly with quiet-breathing posture. Any cheek warmth must come from plausible physiology/lighting, never invented blush.`,
  subtle_thoughtful_pout: `ANATOMICAL FACIAL EXPRESSION — SUBTLE THOUGHTFUL LIP COMPRESSION
- Gentle orbicularis oris contraction creates slight lip compression without protrusion or duck-face distortion.
- Mentalis tension stays minimal, jaw remains relaxed, and the gaze is contemplative and directed toward the actual front-camera position.`,
  gentle_laughter_breath: `ANATOMICAL FACIAL EXPRESSION — GENTLE MID-BREATH LAUGH
- A soft mid-breath laugh parts the lips naturally; a small irregular glimpse of upper incisors is allowed with non-perfect enamel response.
- Cheeks lift and lower lids form natural crescent folds without shrinking eye geometry; jaw opening remains modest.`,
  curious_quizzical_gaze: `ANATOMICAL FACIAL EXPRESSION — CURIOUS QUIZZICAL GAZE
- One brow rises subtly through unilateral frontalis activity while the opposite eye may narrow only minimally from conversational focus.
- Any head micro-tilt stays within the selected pose mechanics and must not reshape the jaw or face outline.`,
  intimate_pillow_rest: `ANATOMICAL FACIAL EXPRESSION — INTIMATE PILLOW REST
- Facial muscles remain tranquil and unposed.
- When the selected pose actually places a cheek on a pillow/support, local compressible soft tissue may displace with pressure and gravity while skull, jaw, nose, eye and lip geometry remain identity-locked. Outside a pillow-contact pose, omit pillow-specific deformation.`
});

const REFERENCE_CAPTURE_OVERRIDE = `REFERENCE CAPTURE OVERRIDE — DO NOT PRESERVE THE ORIGINAL PHONE/CAMERA LOGIC
- The reference image may show a phone in the subject's hand, a mirror, a photographer's viewpoint, a tripod-like viewpoint, or any other non-selfie capture geometry. None of those capture cues are authoritative for the final image.
- If a phone is visibly held in the reference, treat that visible device as an obsolete prop from the source capture. REMOVE it completely from the final composition.
- After removing a visible reference phone, anatomically re-solve the affected hand, wrist, forearm, elbow and shoulder. Do not leave a gripping pose around empty space and do not replace the removed phone with another visible device.
- The hand that held the visible reference phone may become a natural free hand only if the selected pose and crop support it; otherwise keep it naturally occluded or outside the frame. Never preserve the old phone-holding gesture merely because it appears in the reference.
- The actual Xiaomi 15 Ultra used for the final selfie is a separate off-frame camera device at reachable selfie distance. It must never be copied from the visible phone in the reference.
- If the reference was photographed by another person, discard that observer viewpoint and rebuild perspective from the subject's own reachable front-camera position.
- If the reference was a mirror selfie, discard the mirror capture path. A mirror may remain only as part of the environment when scene preservation requires it, but the final capture itself is NOT through the mirror.
- Preserve identity, body type, allowed clothing, allowed environment, support/contact and pose information from the reference. Do NOT preserve its camera operator, visible camera/phone, mirror-ray path, or observer-camera placement.`;

const FRONT_SELFIE_LOCK = `XIAOMI 15 ULTRA FRONT-CAMERA SELFIE LOCK — ABSOLUTE
- Convert the final result into a genuine subject-held selfie captured ONLY with the Xiaomi 15 Ultra front-facing camera, regardless of whether the reference image was originally a mirror selfie, rear-camera photograph, tripod image, screenshot, or photograph taken by another person.
- Treat approximately 22–24mm full-frame-equivalent and around f/2.0 as the front-camera optical perspective assumption. Do not import rear-camera Leica lens behavior or main-camera focal lengths into this mode.
- The phone is physically present outside the finished crop at a reachable hand-held distance. Preserve believable near-field perspective, mild wide-angle facial/body scale change with depth, and ordinary front-camera small-sensor depth behavior.
- The camera-holding arm must be anatomically solved from shoulder to hand, but the phone, hand, wrist, forearm, elbow and upper arm used to hold the phone must remain COMPLETELY OUTSIDE the final image crop.
- Never reveal the Xiaomi 15 Ultra body, screen, camera cutout, case, hand gripping it, reflection of the phone, or any edge of the device in the final image.
- Do not use a mirror ray path. Do not show a reflected phone. Do not preserve observer-camera geometry from the reference. Do not frame the result as if another person took the photo.
- Preserve a true selfie through reachable camera distance, gaze toward the actual front-camera optical position, natural shoulder asymmetry, near-field parallax and plausible subject-to-background perspective.
- No fisheye stretching, 0.5x look, elongated forearm, oversized near-lens hand, impossible shoulder reach or floating camera viewpoint.
- Use one coherent front-camera processing pipeline across the whole frame: finite HDR, realistic highlight headroom, illumination-dependent sensor noise, restrained denoise, modest sharpening/compression, natural skin rendering and no beauty smoothing.
- If the requested crop cannot be achieved at a physically reachable selfie distance, loosen the crop or reduce the pose angle. Never lengthen the arm or move the virtual camera to an observer position.`;

const NIGHT_LIGHTING = Object.freeze({
  phone_pure_dark: `SELECTED NIGHT LIGHTING — PHONE SCREEN GLOW / PURE DARK
- The off-frame Xiaomi phone screen is the ONLY active light source.
- Use very low scene illuminance, short-range inverse-square falloff, brightest exposure on the near face planes and rapid darkness beyond them.
- Keep screen light soft but weak, with realistic underexposed background, visible sensor noise in shadows, restrained highlight rolloff and no hidden fill light.
- The phone remains outside the crop even though its screen illuminates the subject.`,
  soft_screen_fill: `SELECTED NIGHT LIGHTING — SOFT SCREEN FILL LIGHT
- Use the off-frame Xiaomi phone screen as a small near-axis white fill source for the face.
- Keep the effect gentle and localized, with subtle catchlights, soft facial shadow lift and fast falloff toward the torso/background.
- Do not add a second key light, beauty light or cinematic rim. The phone itself remains invisible.`,
  direct_front_flash: `SELECTED NIGHT LIGHTING — DIRECT FRONT FLASH EFFECT IN DARKNESS
- Use one direct near-axis front-camera flash/screen-flash effect from the off-frame Xiaomi device in an otherwise dark room.
- Expect flatter frontal facial illumination, small hard-edged cast shadows behind nearby forms, stronger specular response on skin and reflective surfaces, fast background falloff, and ordinary phone auto-exposure behavior.
- No studio bounce, no invisible softbox and no secondary fill. The device remains outside the crop.`,
  cool_moonlight_window: `SELECTED NIGHT LIGHTING — COOL MOONLIGHT THROUGH WINDOW
- Use one cool, low-intensity natural moonlit window source entering from the physically visible window direction.
- Preserve broad directional softness, low luminance, cool-biased highlights, deep but not crushed shadows, and gradual falloff across the room.
- Do not invent a visible moon beam if the window geometry does not support it.`,
  dim_warm_bedside: `SELECTED NIGHT LIGHTING — DIM WARM BEDSIDE LAMP
- Use one warm, dim bedside lamp as the declared source.
- Light should fall off locally from the lamp position, producing warm near-side illumination, softer darker opposite-side planes, warm reflections on nearby surfaces and stronger underexposure with distance.
- No hidden ceiling fill or cool rim light.`,
  focused_reading_beam: `SELECTED NIGHT LIGHTING — FOCUSED READING LIGHT BEAM
- Use one narrow reading-lamp beam with a physically plausible cone and visible intensity gradient.
- Keep the illuminated zone localized, with stronger center illumination, softer penumbra at the beam edges and darker surrounding room regions.
- Do not convert it into a theatrical spotlight or add unrelated ambient fill.`,
  warm_indirect_led: `SELECTED NIGHT LIGHTING — WARM/SUBTLE INDIRECT LED STRIPS
- Use only warm or subtly tinted hidden LED strip emission from behind the bed or wall edge.
- The source itself may remain mostly hidden; illumination should appear as soft indirect wall/ceiling bounce with low contrast and physically plausible distance falloff.
- Avoid neon saturation, glowing skin or impossible wraparound light.`,
  single_candle: `SELECTED NIGHT LIGHTING — SINGLE CANDLELIGHT
- Use one small warm candle flame as the only intentional source.
- Produce very low warm illumination, short falloff, soft moving shadow variation and restrained specular highlights near the source.
- Flicker must remain subtle and physically plausible, never frozen as dramatic stage lighting.`,
  multi_candle: `SELECTED NIGHT LIGHTING — MULTI-CANDLE AMBIENT GLOW
- Use several low-intensity warm candle sources only.
- Combine their local pools of light realistically, with overlapping warm gradients, multiple very soft shadow directions and strong overall low-light exposure.
- Keep each source weak; do not let the combined effect become studio-bright.`,
  tv_monitor_glow: `SELECTED NIGHT LIGHTING — TV/MONITOR AMBIENT GLOW
- Use one television or monitor as the dominant room source.
- Illumination should be broad, low-level and screen-directional, with mild color variation consistent with screen emission, weak reflected fill and shadow noise in darker room areas.
- Do not add extra lamps unless they are explicitly part of the selected source, which they are not.`,
  fairy_string_lights: `SELECTED NIGHT LIGHTING — WARM FAIRY/STRING LIGHTS
- Use only small warm decorative string lights as practical sources.
- Individual bulbs should create tiny local highlights while the overall room receives weak accumulated warm ambient illumination.
- Preserve realistic exposure: bulbs may clip slightly while faces/background remain comparatively dim.`,
  salt_lamp_glow: `SELECTED NIGHT LIGHTING — HIMALAYAN SALT LAMP GLOW
- Use one very dim deep-orange salt lamp source.
- Keep its influence local, warm and low-contrast with strong falloff, subtle orange reflected color on nearby surfaces and significant shadow-region noise.
- Do not brighten the whole room or add white fill.`,
  subtle_neon: `SELECTED NIGHT LIGHTING — SUBTLE DIM NEON SIGN
- Use one dim wall neon source in a single declared hue.
- Apply restrained colored spill only to surfaces within realistic reach, preserve inverse-square falloff and keep skin color contamination physically plausible rather than uniformly tinted.
- No second neon color, no cyberpunk atmosphere and no synthetic glow halo beyond optics/exposure.`,
  streetlight_blinds: `SELECTED NIGHT LIGHTING — STREETLIGHT LEAK THROUGH BLINDS
- Use warm/yellow streetlight entering only through physically plausible blind or curtain gaps.
- Create directional narrow leaks or soft bands consistent with the opening geometry, with rapid attenuation inside the room and warmer illumination on receiving surfaces.
- Do not invent exterior headlights or additional window sources.`,
  door_gap_hallway: `SELECTED NIGHT LIGHTING — DOOR GAP HALLWAY LIGHT LEAK
- Use only hallway light leaking through the physically plausible gap beneath or around a closed door.
- Keep the bright region concentrated near the floor/door boundary, with weak indirect bounce upward and rapid loss of intensity across the room.
- The subject should not receive impossible frontal illumination from this low source.`,
  subtle_rim_semidark: `SELECTED NIGHT LIGHTING — SUBTLE RIM IN SEMI-DARKNESS
- Use one physically motivated off-axis edge source that creates only a restrained rim on the silhouette-facing edge.
- Keep most facial and torso planes genuinely dim; the rim must follow actual source geometry and surface orientation.
- Do not add a frontal beauty fill, cinematic halo or full-body outline.`,
  soft_ceiling_bounce: `SELECTED NIGHT LIGHTING — SOFT INDIRECT CEILING BOUNCE
- Use one warm source aimed toward a low ceiling so the visible illumination arrives mainly as broad indirect ceiling bounce.
- Produce soft overhead ambient light, gentle shadow transitions, lower contrast and physically believable brightness loss from ceiling reflection efficiency.
- No direct hidden key light.`,
  star_nebula_projector: `SELECTED NIGHT LIGHTING — STAR/NEBULA PROJECTOR
- Use one low-power night projector as the only decorative source.
- Keep projected points/clouds dim, spatially coherent with the projector direction and softly blurred where focus or surface angle requires it.
- The projection may tint nearby surfaces subtly but must not become bright volumetric fantasy lighting.`
});

const els = {};
let activeFile = null;
let objectUrl = null;

function $(id) { return document.getElementById(id); }

function init() {
  ["poseReferenceInput","poseReferenceDropzone","poseReferencePreview","poseReferenceEmpty","poseReferenceMeta","targetPoseSelect","customPoseField","customPoseInput","framingSelect","expressionSelect","nightLightingSelect","buildPosePromptBtn","resetPoseTransformerBtn","posePromptOutput","posePromptWordCount","posePromptStatus","copyPosePromptBtn","smartPoseNote"].forEach((id) => { els[id] = $(id); });
  els.poseReferenceInput?.addEventListener("change", onFile);
  els.targetPoseSelect?.addEventListener("change", () => {
    const custom = els.targetPoseSelect.value === "custom";
    if (els.customPoseField) els.customPoseField.hidden = !custom;
    if (els.smartPoseNote) els.smartPoseNote.hidden = els.targetPoseSelect.value !== "smart_auto";
    buildPrompt();
  });
  document.querySelectorAll('input[name="preserveScope"]').forEach((node) => node.addEventListener("change", buildPrompt));
  [els.customPoseInput, els.framingSelect, els.expressionSelect, els.nightLightingSelect].forEach((node) => node?.addEventListener("input", buildPrompt));
  els.buildPosePromptBtn?.addEventListener("click", buildPrompt);
  els.resetPoseTransformerBtn?.addEventListener("click", reset);
  els.copyPosePromptBtn?.addEventListener("click", copyPrompt);
  buildPrompt();
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
  return POSES[els.targetPoseSelect?.value] ?? SMART_AUTO_POSE;
}

function expressionInstruction() {
  const id = els.expressionSelect?.value ?? "preserve_reference";
  const selected = EXPRESSIONS[id] ?? EXPRESSIONS.preserve_reference;
  return `${selected}\n\nFACIAL IDENTITY / MUSCLE-ONLY AUTHORITY — ABSOLUTE\n- The selected expression is a MUSCLE STATE ONLY. It may move brows, lids, cheeks and mouth through anatomically plausible facial action, but it may not redesign bone structure, slim/widen the face, sharpen the jaw, resize eyes, reshape the nose, alter lip volume or create a different person.\n- After compensating only for front-camera perspective, head pose, gravity/contact soft-tissue displacement and the selected muscle action, stable facial landmarks must remain consistent with the reference image.\n- Expression must follow the selected night lighting. Do not invent a private face light, fake catchlight or beauty relight to emphasize the expression.\n- Skin detail stays camera-resolvable and sensor-limited. No beauty smoothing, pore stamping, waxy skin or exaggerated microtexture.`;
}

function lightingInstruction() {
  const id = els.nightLightingSelect?.value ?? "";
  if (!id || !NIGHT_LIGHTING[id]) {
    return `NIGHT LIGHTING — USER SELECTION REQUIRED\n- Do not choose lighting automatically. The user must select one night-lighting preset before final use.`;
  }
  return `${NIGHT_LIGHTING[id]}\n\nUSER-SELECTED LIGHTING AUTHORITY — ABSOLUTE\n- This selected lighting preset is the ONLY lighting authority for the result.\n- Do not add, substitute, infer or blend any additional key, fill, rim, ceiling, window, lamp, flash, screen, candle, LED, neon or environmental light source.\n- Simulate physically realistic direction, intensity, inverse-square falloff, occlusion, contact shadow, penumbra, surface reflectance, color spill, specular response, white balance, exposure and illumination-dependent sensor noise for this source only.\n- Lighting may change illumination and exposure only. It must not alter facial geometry, body proportions, room geometry, materials or object positions.\n- No face-only relighting, hidden beauty fill, selective denoise or synthetic cinematic enhancement.`;
}

function buildPrompt() {
  const fileReady = Boolean(activeFile);
  const smartMode = els.targetPoseSelect?.value === "smart_auto";
  const lightingReady = Boolean(els.nightLightingSelect?.value);
  const prompt = `REFERENCE POSE TRANSFORMER ${VERSION}\n\nREFERENCE IMAGE AUTHORITY — ABSOLUTE\n- Use the attached reference image as the visual authority for the same person's identity and every preservation category selected below.\n- Preserve stable facial identity 1:1: skull/face geometry, jaw/chin, eye shape and spacing, eyelids, nose structure, mouth/lip proportions, ears, hairline, facial hair boundaries, skin tone, apparent age, natural asymmetry and distinctive marks.\n- Expression, head angle, gravity, contact and perspective may change soft-tissue appearance only. They must not redesign stable facial landmarks or bone structure.\n- Preserve the visible body type and proportions. Do not make the subject taller, shorter, leaner, broader, more muscular or differently proportioned merely to satisfy the new pose.\n\nMANDATORY REFERENCE-CAPTURE OVERRIDE\n${REFERENCE_CAPTURE_OVERRIDE}\n\nMANDATORY CAPTURE CONVERSION\n${FRONT_SELFIE_LOCK}\n\n${smartMode ? "SMART ANALYSIS + POSE CHANGE — PRIMARY EDIT" : "POSE CHANGE ONLY — PRIMARY EDIT"}\n${poseInstruction()}\n- Reconstruct only the body regions required by the selected new pose. For regions hidden or outside the reference crop, use conservative anatomically plausible continuation consistent with the visible body type.\n- Never claim exact hidden anatomy from the reference. Do not invent exaggerated musculature, altered limb lengths, extra fingers, missing joints or impossible support.\n- Maintain real balance, center of mass, joint limits, gravity, pressure, occlusion, contact shadows and local material deformation.\n\n${SCOPES[currentScope()]}\n\nFACIAL EXPRESSION — USER CONTROLLED\n${expressionInstruction()}\n\nLIGHTING / ILLUMINATION — USER CONTROLLED\n${lightingInstruction()}\n\nFRAMING / FRONT-CAMERA PERSPECTIVE\n${FRAMING[els.framingSelect?.value] ?? FRAMING.auto}\n- All framing decisions remain subordinate to the Xiaomi 15 Ultra front-camera selfie lock.\n- Use one coherent optical model across face, body and environment. Perspective may change apparent scale with distance, but never actual anatomy.\n\nMATERIAL / SKIN / HAIR REALISM\n- Preserve camera-resolvable skin texture only. No decorative pore stamping, wax skin, beauty smoothing or synthetic hyper-detail.\n- Hair follows the reference hair type and hairline, then reorients only as gravity, movement, support and friction require for the new pose.\n- Clothing, if preserved, must re-drape from the new body mechanics instead of inheriting old folds.\n\nFINAL VALIDATION GATE\nReject and correct the result before output if any of the following occurs: identity drift; changed facial geometry; expression-driven bone/landmark drift; altered body type; repeated original pose when smart mode requested a genuinely different pose; impossible joints; unsupported pose; floating limbs; incorrect contact; invented support objects; duplicated fingers; clothing redesign when clothing preservation is selected; environment changes when scene preservation is selected; any lighting source other than the user-selected night preset; preserved visible phone from the reference; empty phone-gripping hand pose; replacement visible phone; mirror-selfie geometry; rear-camera or observer-camera viewpoint; visible Xiaomi phone; visible phone reflection; visible camera-holding hand, wrist, forearm, elbow or upper arm; impossible selfie reach; fisheye limb stretch; synthetic portrait blur; inconsistent face/background processing; or perspective that changes anatomy instead of apparent distance.\n\nOUTPUT INTENT\nProduce one physically plausible Xiaomi 15 Ultra FRONT-camera selfie of the same person in the selected new pose, using the selected anatomical facial expression and the user's selected night lighting. Convert any reference capture type into this front-selfie viewpoint. Any phone visible in the source reference is removed and its holding limb is anatomically re-solved. The actual selfie phone and camera-holding limb remain outside the finished frame; identity remains the anchor; expression changes muscle state only; lighting follows the user's selection exactly.`;

  if (els.posePromptOutput) els.posePromptOutput.textContent = prompt;
  const count = prompt.trim().split(/\s+/).filter(Boolean).length;
  if (els.posePromptWordCount) els.posePromptWordCount.textContent = `${count} كلمة`;
  if (els.posePromptStatus) {
    if (!lightingReady) els.posePromptStatus.textContent = "اختر الإضاءة الليلية أولًا. تعبير الوجه تشريحي ويحافظ على هندسة الهوية.";
    else if (!fileReady) els.posePromptStatus.textContent = "تم تحديد التعبير والإضاءة. أرفق الصورة المرجعية عند الاستخدام.";
    else if (smartMode) els.posePromptStatus.textContent = "جاهز: الوضعية تُختار بذكاء، التعبير تشريحي حسب اختيارك، والتصوير سيلفي أمامي Xiaomi 15 Ultra.";
    else els.posePromptStatus.textContent = "جاهز: الوضعية والتعبير والإضاءة حسب اختياراتك، والتقاط Xiaomi 15 Ultra الأمامي إلزامي.";
  }
  return prompt;
}

async function copyPrompt() {
  if (!els.nightLightingSelect?.value) {
    els.posePromptStatus.textContent = "اختر الإضاءة الليلية قبل نسخ الـPrompt.";
    els.nightLightingSelect?.focus();
    return;
  }
  const text = buildPrompt();
  try {
    await navigator.clipboard.writeText(text);
    els.posePromptStatus.textContent = "تم نسخ الـPrompt مع التعبير التشريحي وقفل سيلفي Xiaomi 15 Ultra الأمامي.";
  } catch {
    els.posePromptStatus.textContent = "تعذر النسخ التلقائي. حدّد النص وانسخه يدويًا.";
  }
}

function reset() {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = null;
  activeFile = null;
  if (els.poseReferenceInput) els.poseReferenceInput.value = "";
  if (els.targetPoseSelect) els.targetPoseSelect.value = "smart_auto";
  if (els.customPoseInput) els.customPoseInput.value = "";
  if (els.customPoseField) els.customPoseField.hidden = true;
  if (els.smartPoseNote) els.smartPoseNote.hidden = false;
  if (els.framingSelect) els.framingSelect.value = "auto";
  if (els.expressionSelect) els.expressionSelect.value = "preserve_reference";
  if (els.nightLightingSelect) els.nightLightingSelect.value = "";
  const first = document.querySelector('input[name="preserveScope"][value="identity"]');
  if (first) first.checked = true;
  resetPreview();
  buildPrompt();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();
