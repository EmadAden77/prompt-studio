import { PromptEngine } from "./engines/promptEngine.js";

const patchFlag = Symbol.for("promptStudio.opticalBioRealismRuntime.patched");

const LYING_POSE_IDS = new Set([
  "lying_back",
  "lying_stomach",
  "lying_right_side",
  "lying_left_side",
  "semi_reclining"
]);

function isFrontSelfie(config = {}) {
  return config.camera?.type === "front" || config.cameraType === "front" || config.autoEngineering?.cameraType === "front";
}

function isBedroomCapture(config = {}) {
  const poseId = config.pose?.id || config.poseId || "";
  return Boolean(config.scene || poseId.startsWith("lying_") || poseId.startsWith("sitting_") || poseId.startsWith("standing_") || poseId === "semi_reclining" || poseId === "mirror_selfie");
}

function frontCameraOpticsBlock(config = {}) {
  if (!isFrontSelfie(config)) return "";
  return `FRONT CAMERA OPTICAL REALISM LOCK — XIAOMI 15 ULTRA FRONT SELFIE
- Preserve the app's established front-camera model around 22–24 mm full-frame equivalent and approximately f/2.0. Do not silently replace it with a 35/50/85 mm portrait lens, DSLR perspective, rear-camera optics, or an observer camera.
- Subject-to-phone distance must remain physically reachable at arm's length and agree with the selected pose/template camera lock. Near-field perspective may make the closest facial plane slightly more prominent, but identity geometry remains unchanged.
- Permit only mild physically plausible wide-angle edge stretch or barrel tendency near the frame perimeter. Keep the central face coherent; never warp the skull, eyes, jaw, ears, or shoulders to advertise lens distortion.
- Do not force a fixed ISO or shutter speed across all lighting presets. Exposure parameters follow the declared light level: bright daylight stays low-gain and clean; dim practical/night scenes use higher gain, more shadow noise, longer computational exposure behavior, and finite motion tolerance.
- Depth of field must match a small-sensor front camera at selfie distance: usually broad enough that the room retains recognizable structure. Never impose DSLR-like shallow focus or synthetic portrait-mask bokeh unless an explicitly selected capture mode supports computational portrait blur.
- Preserve ordinary phone limitations: finite highlight headroom, restrained sharpening halos, mild edge softness, realistic compression, and no beauty-filter skin smoothing or local face HDR.`;
}

function lyingSoftTissueBlock(config = {}) {
  const poseId = config.pose?.id || config.poseId || "";
  if (!LYING_POSE_IDS.has(poseId)) return "";

  const variant = poseId === "lying_back"
    ? "Supine: gravity may let cheek and lower-face soft tissue settle subtly backward/outward, making the face read fractionally wider/flatter without altering skull width, jaw bones, nose, eyes, or identity landmarks."
    : poseId === "lying_right_side"
      ? "Right side-lying: only the contact-side RIGHT cheek/ear and nearby soft tissue compress locally toward the pillow; unsupported tissue may settle slightly toward gravity."
      : poseId === "lying_left_side"
        ? "Left side-lying: only the contact-side LEFT cheek/ear and nearby soft tissue compress locally toward the pillow; unsupported tissue may settle slightly toward gravity."
        : poseId === "lying_stomach"
          ? "Prone: if the cheek touches the pillow, deformation is local to that real contact zone; if the head is supported by forearms, solve those load paths instead of inventing cheek pressure."
          : "Semi-reclining: soft-tissue gravity response follows the real head/neck angle and pillow support, between upright and fully supine behavior.";

  return `LYING SOFT-TISSUE GRAVITY LOCK — IDENTITY BONES FROZEN
- IMAGE A remains the sole authority for stable facial geometry. Face width/length, cranial shape, jaw/chin bones, nose geometry, eye size/spacing, lip volume, ears, hairline and beard pattern do not change.
- Gravity and support may deform ONLY compressible soft tissue locally: cheek pad, lip resting tension, eyelid resting tension, ear cartilage contact, neck skin and hair contact.
- ${variant}
- Never paste an upright/standing face onto a horizontal body. The expression remains the selected muscle state, then gravity/contact add only small mechanically caused soft-tissue changes.
- No beautification, slimming, jaw sharpening, hollow cheeks, enlarged eyes, swollen-face effect, or generalized puffiness.`;
}

function eyeOpticsBlock() {
  return `EYE OPTICS & TEAR-LINE LOCK
- Preserve the exact eye geometry from IMAGE A: iris size, eye spacing, canthus positions, eyelid shape and baseline asymmetry remain identity-locked.
- Corneal catchlights are reflections of the declared physical sources only. Their shape, relative position, brightness and multiplicity must agree with the selected lighting: window shapes read broad/rectangular, phone screen reflections read rectangular near-axis, practical lamps read small localized highlights.
- Maintain a thin physically plausible tear meniscus along the lower lid where resolution and light permit. It is a subtle wet specular line, not a glowing outline.
- Sclera is off-white with restrained natural vascular detail only where the phone camera can actually resolve it; never paint dense red veins or porcelain-white eyes.
- Cornea remains glossy while iris/sclera remain beneath it; do not place catchlights independently inside the iris texture or duplicate reflections between eyes when source geometry would not support them.
- Eyelid tension follows the selected expression plus gravity/contact state. No cosmetic eye enlargement, artificial sharpening, or selective eye brightening.`;
}

function skinMicrotopographyBlock() {
  return `SKIN MICROTOPOGRAPHY & LIGHT TRANSPORT LOCK
- Preserve real skin as a multi-scale surface, not a uniform procedural pore layer: broad anatomical form first, then subtle pores, follicle openings, beard-stubble transitions, fine creases and small local irregularities only at resolution supported by the camera distance and illumination.
- Pores must vary naturally with facial region and perspective. Never stamp identical pore size or contrast across forehead, cheeks, nose and neck.
- Skin specular response follows local oil/moisture and the real source size. Highlights must move with surface normals and lighting, not appear as painted glossy patches.
- Subsurface light transport is subtle and conditional: ears, nostril rims and thin skin edges may show mild warm transmission only when a real bright source is behind or strongly lateral to them. Do not add a global red/orange SSS glow.
- Fine lines follow actual facial folds and expression mechanics. Do not invent age lines, erase existing texture, or add exaggerated forensic micro-detail.
- Face, beard, neck and ears receive the same focus, exposure, white balance, sharpening, denoise and compression as the rest of the frame. No face-only microcontrast enhancement or cleanup.`;
}

function pillowHairBlock(config = {}) {
  const poseId = config.pose?.id || config.poseId || "";
  if (!LYING_POSE_IDS.has(poseId)) return "";
  return `PILLOW-CONTACT HAIR DYNAMICS LOCK
- Hair density, hairline, total volume, color and cut remain locked to IMAGE A. Contact changes arrangement only.
- Where the head loads the pillow, hair between scalp and fabric flattens into irregular clumps and spreads outward along the real friction/contact direction. The pillow cannot remain visually untouched beneath a loaded head.
- Interior hair mass stays clump-based and sensor-limited. Resolve individual fine strands mainly at the hairline, pillow-contact fringe, flyaways, separated tips and source-driven highlight glints. Do not render every strand with equal sharpness.
- Contact-side strands may bend, cross, disappear under the head, or emerge from beneath compressed zones. Avoid radial starburst hair, repeated strand spacing, painted black masses, duplicated curls or floating fibers.
- Hair highlights are anisotropic only insofar as real fiber orientation and the declared source support them; no decorative studio sheen or uniformly glossy hair.`;
}

function lightingTraceabilityBlock(config = {}) {
  const lightingName = config.lighting?.name_en || "the selected lighting preset";
  return `DAYLIGHT / PRACTICAL LIGHT SOURCE TRACEABILITY
- Active setup: ${lightingName}. Every visible light effect must trace back to the physical source(s) declared by that preset and to real reflecting surfaces in the selected room reference.
- Direct light establishes the primary shadow direction and catchlight geometry. Secondary bounce is always weaker, broader and tinted by the actual wall, bedding, floor or furniture material that reflects it.
- Daylight entering through a real window/curtain opening must preserve directional logic, curtain occlusion, distance falloff through the room, plausible highlight clipping near the opening, and progressively lower exposure deeper inside the room.
- Practical lamps and ceiling fixtures illuminate from their recorded positions only. A visible but switched-off fixture emits no light.
- No hidden frontal fill, beauty source, rim light, softbox, fake volumetric beam, cinematic haze or room-wide ambient lift may be invented to rescue the face.
- Contact shadows stay attached beneath the head, hair, body, hands, clothing and bedding wherever real contact occurs. Ambient occlusion is a consequence of blocked real light, never an arbitrary dark outline.`;
}

function onePipelineBlock() {
  return `ONE PIPELINE SENSOR CONSISTENCY — FINAL CAPTURE GATE
- The entire frame is one smartphone capture event: one lens model, one focus state, one exposure decision, one white-balance solution, one HDR/computational merge behavior, one denoise pass, one sharpening behavior, one tone curve and one compression path.
- Face, eyes, hair, beard, clothing, skin, bedding, furniture, mirrors and background may differ only because their materials, distance, motion and illumination differ physically. They may not receive separate quality levels.
- Darker regions naturally carry more luminance noise and restrained chroma noise; brighter regions are cleaner. Noise does not stop at face boundaries and is not added as a decorative overlay.
- Bright windows or bulbs may clip modestly; deep shadows may lose detail. Do not recover every highlight and shadow simultaneously with impossible local HDR.
- Preserve ordinary handheld micro-motion when exposure requires it, but do not blur identity landmarks selectively.
- Final rejection conditions: waxy skin, plastic fabric, perfectly uniform pores, over-resolved hair, duplicated catchlights, isolated face relighting, synthetic portrait blur, conflicting shadow directions, mismatched noise/denoise across the frame, or any background geometry change caused by lighting.
- Target: an ordinary physically coherent smartphone photograph. CAPTURED, NOT RENDERED.`;
}

function buildRuntimeBlock(config = {}) {
  const parts = [
    frontCameraOpticsBlock(config),
    lyingSoftTissueBlock(config),
    eyeOpticsBlock(),
    skinMicrotopographyBlock(),
    pillowHairBlock(config),
    lightingTraceabilityBlock(config),
    onePipelineBlock()
  ].filter(Boolean);
  return parts.join("\n\n");
}

function patchPromptEngine() {
  const proto = PromptEngine?.prototype;
  if (!proto || proto[patchFlag] || typeof proto.generate !== "function") return;
  const originalGenerate = proto.generate;

  proto.generate = function generateWithOpticalBioRealism(config = {}) {
    const raw = originalGenerate.call(this, config);
    if (typeof raw !== "string" || !isBedroomCapture(config)) return raw;
    return `${raw}\n\n${buildRuntimeBlock(config)}`.trim();
  };

  proto[patchFlag] = true;
}

patchPromptEngine();
