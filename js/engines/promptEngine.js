import { hierarchyAsPromptText } from "../policies/authorityPolicy.js";
import { MASTER_POLICY } from "../policies/masterPolicy.js";

export class PromptEngine {
  constructor({ identityEngine, roomLockEngine, poseEngine, cameraEngine, lightingEngine }) {
    this.identityEngine = identityEngine;
    this.roomLockEngine = roomLockEngine;
    this.poseEngine = poseEngine;
    this.cameraEngine = cameraEngine;
    this.lightingEngine = lightingEngine;
  }

  getReferenceName(upload, fallback) {
    const safeFilename = upload?.name && /^[\x20-\x7E]+$/u.test(upload.name) ? upload.name : null;
    return safeFilename ? `“${safeFilename}”` : `the attached ${fallback}`;
  }

  buildSpatialMap(engineering) {
    if (!engineering?.spatialMap) return "";
    const map = engineering.spatialMap;
    return `BED SPATIAL MAP
- Side reference rule: ${map.frame_rule}
- Head direction: ${map.head_direction}.
- Foot direction: ${map.foot_direction}.
- Subject's RIGHT side: ${map.person_right_side}.
- Subject's LEFT side: ${map.person_left_side}.
- LAMP SIDE: ${map.lamp_side}.
- VANITY SIDE: ${map.vanity_side}.
- Window/daylight: ${map.window_daylight}.
- Pillows: ${map.pillows}.
- IMAGE B viewpoint rule: ${map.image_b_camera_rule}.
- Ambiguity rule: ${map.ambiguity_rule}.
Always describe sides relative to the subject's own body, never as left/right of the image.`;
  }

  getPlacementRule(config) {
    const { pose, scene, autoEngineering } = config;
    const region = scene?.region?.replaceAll("_", " ") ?? "the selected bed region";
    if (pose?.placement === "vanity") {
      return `Place the subject inside the actual vanity/mirror zone shown by IMAGE B. Keep the real mirror boundary and room geometry unchanged. Selected reference region: ${region}.`;
    }
    return `Place the subject strictly on the real bed/mattress geometry represented by IMAGE B. Anchor the body before solving the camera. Do not pull, enlarge, slide, or rotate the whole body toward the lens merely to improve composition. Selected reference region: ${region}.
Deterministic orientation: ${autoEngineering?.orientation ?? "follow the selected pose and support surfaces"}`;
  }

  generate(config) {
    const {
      pose,
      scene,
      camera,
      lens,
      expression,
      hair,
      clothing,
      lighting,
      roomMode,
      bodyDirection,
      cameraAngle,
      cameraDistance,
      uploads,
      autoEngineering
    } = config;

    const taskVerb = roomMode === "EDIT"
      ? "edit IMAGE B in place as the immutable room plate and insert the person from IMAGE A"
      : "generate one new photograph from a physically reachable viewpoint inside the same three-dimensional room represented by IMAGE B, using IMAGE A only for identity";

    const imageAName = this.getReferenceName(uploads?.imageA, "IMAGE A identity photograph");
    const imageBName = this.getReferenceName(uploads?.imageB, scene?.image_filename ?? "IMAGE B room photograph");
    const poseSections = pose
      ? this.poseEngine.engineer({ pose, expression, hair, clothing, autoEngineering })
      : null;
    const sections = [];

    sections.push(`CHATGPT IMAGE TASK
ChatGPT, ${taskVerb}. Produce one ordinary, coherent, physically believable smartphone photograph. Use one camera, one reachable viewpoint, one exposure, one lighting event, and one image-processing pipeline. Return only the final image.`);

    sections.push(`PROMPT ENGINEERING POLICY
${MASTER_POLICY.eventRule}
Check consistency across ${MASTER_POLICY.conflictDomains.join(", ")}.
Resolve minor conflicts through the authority hierarchy below instead of blending incompatible instructions. Preserve the higher-priority physical or reference constraint whenever a lower-priority request conflicts with it. Do not disclose this reasoning. Realism must come from anatomy, pressure, gravity, optics, light falloff, sensor limitations, and ordinary phone processing. Never use EXIF spoofing, C2PA removal, PRNU simulation, or forensic countermeasures.`);

    sections.push(`AUTHORITY HIERARCHY — LOWER NUMBER WINS
${hierarchyAsPromptText()}`);

    sections.push(`REFERENCE AUTHORITY
IMAGE A — IDENTITY ONLY: Use ${imageAName} exclusively for identity.
${this.identityEngine.buildLockText()}

IMAGE B — ROOM ONLY: Use ${imageBName} as the sole room reference${scene ? ` for the ${scene.region.replaceAll("_", " ")} region` : ""}.
${this.roomLockEngine.buildAuthorityText()}`);

    sections.push(`IDENTITY LOCK
${this.identityEngine.buildPersonText()}
Depict the exact same real person photographed again, not a look-alike. Preserve natural asymmetry, real skin-tone variation, normal pores, beard gaps, imperfect hairline, and apparent age. Do not beautify, symmetrize, reshape, or clean the face more than the neck, clothing, bedding, or room.`);

    if (poseSections?.subject) sections.push(poseSections.subject);

    sections.push(`ROOM LOCK
${this.roomLockEngine.buildLockText(roomMode)}`);

    if (autoEngineering) sections.push(this.buildSpatialMap(autoEngineering));

    sections.push(`SUBJECT PLACEMENT
${this.getPlacementRule(config)}
BODY FIRST, CAMERA SECOND: solve the entire body, mattress/pillow contacts, scale, and room-relative placement before deriving phone position. If framing would otherwise break anatomy or room continuity, loosen the crop instead of moving the body off its correct support surfaces.`);

    sections.push(poseSections?.posePhysics ?? `POSE & PHYSICS
Keep anatomy, gravity, support, and pressure physically possible.`);

    if (poseSections?.trueLateral) sections.push(poseSections.trueLateral);

    sections.push(`CAMERA AND ARM STRATEGY
${this.cameraEngine.buildPrompt({ camera, lens, pose, cameraAngle, cameraDistance })}
Fine camera engineering: ${autoEngineering?.cameraFine ?? "Use the mapped reachable viewpoint."}
${poseSections?.armStrategy ?? "Keep every shoulder, elbow, wrist, and hand anatomically reachable."}
The phone position is derived after body placement. If framing would force impossible anatomy, loosen the crop instead of moving the body or lengthening the arm.`);

    sections.push(poseSections?.expression ?? `EXPRESSION LOCK
Change facial muscle state only; preserve identity geometry and natural asymmetry from IMAGE A.`);

    sections.push(poseSections?.hair ?? `HAIR LOCK
Preserve original length, density, wave pattern, and hairline from IMAGE A.`);

    sections.push(poseSections?.clothing ?? `CLOTHING LOCK
Use the selected clothing and never copy garments from IMAGE A.`);

    sections.push(`LIGHTING
${this.lightingEngine.buildPrompt(lighting)}
Every cast shadow, contact shadow, catchlight, reflection, and brightness gradient must trace back to a selected or reference-supported source. No cinematic fill, hidden softbox, or unexplained room brightening.`);

    sections.push(`CAMERA PROCESSING
Apply one ordinary Xiaomi phone-camera pipeline to the entire frame. Use restrained sharpening, modest noise reduction, mild compression, realistic shadow noise, slight white-balance imperfection where physically expected, and natural phone depth of field. No fake DSLR bokeh. Face, neck, body, clothing, bedding, and room must share the same exposure, sharpness, noise, and compression logic unless depth or illumination physically explains a difference.`);

    sections.push(`REALISM
Preserve natural facial asymmetry, real pores and skin-color variation, natural beard gaps, plausible hair clumps and stray strands, local mattress and pillow compression, gravity-driven clothing folds, anatomically possible arm reach, mild smartphone perspective distortion, and physically motivated light falloff. Never improve one part of the frame into a cleaner or sharper rendering style than the rest.`);

    sections.push(`FINAL PHYSICAL CHECK
- IMAGE A controls identity only; its expression, clothing, lighting, pose, and camera viewpoint do not transfer.
- IMAGE B controls the same room and bed only.
- Subject placement is solved before camera placement.
- The selected body side is defined relative to the subject, not the image.
- For side-lying poses, the loaded shoulder, ribcage, hip, pillow contact, upper selfie arm, and lower support arm all agree with the same body side.
- Support surfaces visibly carry weight and compress locally.
- Arms, hands, phone reach, and optical axis are anatomically possible.
- Mirror reflections, if present, preserve one ray path and correct handedness.
- Camera, lens, perspective, exposure, depth of field, noise, and processing form one compatible capture.
- No furniture, clutter, doors, windows, mirrors, fixtures, or room dimensions are moved, cleaned, mirrored, resized, or redesigned.`);

    sections.push(`FORBIDDEN RESULTS
No cartoon, illustration, painting, CGI, 3D-render appearance, beauty filter, facial reshaping, forced symmetry, plastic or waxy skin, artificial pore maps, painted beard, wire hair, extra fingers, extra limbs, fused limbs, impossible joints, torso penetration, floating body, unsupported contact, broken reflection, fake DSLR bokeh, anamorphic distortion, destructive ISO noise, extreme motion blur, fake 8K detail, unmotivated lens flare, cinematic grading, studio softbox, EXIF spoofing, C2PA removal, PRNU simulation, forensic countermeasures, unrequested text, or logos.`);

    sections.push(`NEGATIVE PROMPT
cartoon, illustration, painting, CGI, 3D render, plastic skin, beauty filter, face smoothing, over-sharpened pores, painted beard, wire hair, extra fingers, extra arm, fused hand, impossible elbow, wrong selfie hand, torso penetration, floating shoulder, semi-reclined side-lying hybrid, face-up side pose, broken anatomy, fake bokeh, cinematic lighting, studio softbox, extreme HDR, artificial glow, fake 8K, exaggerated wide-angle distortion, EXIF manipulation, C2PA removal, PRNU simulation`);

    return sections.filter(Boolean).join("\n\n");
  }
}
