import { hierarchyAsPromptText } from "../policies/authorityPolicy.js";
import { MASTER_POLICY } from "../policies/masterPolicy.js";

const BED_SELFIE_ARM_STRATEGIES = new Set([
  "lying_back",
  "lying_stomach",
  "lying_right_side",
  "lying_left_side",
  "semi_reclining"
]);

export class PromptEngine {
  constructor({ identityEngine, roomLockEngine, poseEngine, cameraEngine, lightingEngine }) {
    this.identityEngine = identityEngine;
    this.roomLockEngine = roomLockEngine;
    this.poseEngine = poseEngine;
    this.cameraEngine = cameraEngine;
    this.lightingEngine = lightingEngine;
  }

  isBedSelfiePose(pose) {
    return Boolean(pose?.placement === "bed" && BED_SELFIE_ARM_STRATEGIES.has(pose.arm_strategy));
  }

  getPlacementRule(pose, scene) {
    const rules = {
      bed: "Place the subject strictly within the existing bed area defined by IMAGE B. Mattress contact, edge contact, or bedside floor contact must follow the selected pose; never relocate the subject onto another object.",
      sofa: "Place the subject at the exact existing sofa. Any seated pelvis must remain within a real seat-cushion boundary, and any standing contact must use the real armrest without shifting it.",
      chair: "Place the pelvis fully within the existing chair seat boundary, with feet and back aligned to the actual chair geometry.",
      vanity: "Place the subject in front of the same vanity mirror visible in IMAGE B. Preserve the real mirror boundary and use geometrically accurate reflected scale, handedness, gaze, phone position, and occlusion.",
      wardrobe: "Place the subject inside the visible wardrobe zone without changing door positions, contents, reflections, or object arrangement.",
      floor: "Place the subject on an unobstructed visible floor area without intersecting the bed, rug edge, tables, or other furniture.",
      center: "Place the subject on the existing floor near the room center while preserving furniture clearance and the original room circulation space."
    };
    const base = rules[pose?.placement] ?? "Place the subject only in a physically available region shown by IMAGE B.";
    return `${base}\nSelected reference region: ${scene?.region?.replaceAll("_", " ") ?? "the visible IMAGE B region"}.`;
  }

  getBedSelfieSpatialAnchor(pose, scene) {
    if (!this.isBedSelfiePose(pose)) return "";
    const region = scene?.region?.replaceAll("_", " ") ?? "the selected bed region";
    return `BED SELFIE SPATIAL ANCHOR — BODY FIRST, CAMERA SECOND
This is a new reachable selfie viewpoint inside the same room, not a reconstruction of IMAGE B as a different bedroom.
1. Anchor the body first to the real mattress and pillow geometry in ${region}. Keep the torso, pelvis, head, and legs at a plausible scale relative to the known bed dimensions and surrounding furniture.
2. Preserve the subject's location on the bed after placement. Do not pull, enlarge, slide, or rotate the whole body toward the camera merely to create a tighter selfie composition.
3. Only after the body and all support contacts are solved, derive the phone position from the specified shoulder, elbow, wrist, and arm reach. The camera must move to the reachable hand position; the body must not move to satisfy the camera.
4. The holding forearm may become large near a wide phone lens only as a natural near-field perspective effect. This must not make the head or torso unnaturally oversized relative to the pillow, mattress, headboard, nightstand, or room.
5. Keep the same bed identity, headboard, pillow family, bedding, nearby furniture, clutter, walls, ceiling, and room scale from IMAGE B. A new crop may hide objects, but it must never relocate them.
6. If the requested crop cannot be reached without breaking anatomy or room continuity, widen or loosen the crop while preserving the body placement and physical camera reach.`;
  }

  getReferenceName(upload, fallback) {
    const safeFilename = upload?.name && /^[\x20-\x7E]+$/u.test(upload.name) ? upload.name : null;
    return safeFilename ? `“${safeFilename}”` : `the attached ${fallback}`;
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
      uploads
    } = config;

    const taskVerb = roomMode === "EDIT"
      ? "edit IMAGE B in place as an immutable base photograph and insert the person from IMAGE A"
      : "generate one new photograph of the same room represented by IMAGE B and place the person from IMAGE A inside it";

    const sections = [];

    sections.push(`CHATGPT IMAGE TASK
ChatGPT, ${taskVerb}. Produce one ordinary, coherent, physically believable photograph. Use one camera, one reachable viewpoint, one exposure, one lighting event, and one image-processing pipeline. Return only the final image.`);

    sections.push(`MASTER PROMPT ENGINEERING DIRECTIVE
${MASTER_POLICY.eventRule}
Check consistency across ${MASTER_POLICY.conflictDomains.join(", ")}.
Resolve any minor conflict through the authority hierarchy below instead of blending incompatible instructions. If a lower-priority request conflicts with a higher-priority physical or reference constraint, preserve the higher-priority constraint. Do not disclose this reasoning and do not introduce an unrequested visual style.
${MASTER_POLICY.realismRule}`);

    sections.push(`AUTHORITY HIERARCHY — LOWER NUMBER WINS
${hierarchyAsPromptText()}`);

    const imageAName = this.getReferenceName(uploads?.imageA, "IMAGE A identity photograph");
    const imageBName = this.getReferenceName(uploads?.imageB, scene?.image_filename ?? "IMAGE B room photograph");

    sections.push(`REFERENCE AUTHORITY
IMAGE A — IDENTITY ONLY: Use ${imageAName} exclusively for the person's identity.
${this.identityEngine.buildLockText()}

IMAGE B — ROOM ONLY: Use ${imageBName} as the sole room reference${scene ? ` for the ${scene.region.replaceAll("_", " ")} region` : ""}.
${this.roomLockEngine.buildAuthorityText()}`);

    sections.push(`ROOM CONTINUITY
${this.roomLockEngine.buildLockText(roomMode)}`);

    sections.push(`SUBJECT AND PLACEMENT
${this.identityEngine.buildPersonText()}
${this.getPlacementRule(pose, scene)}`);

    if (roomMode === "GENERATE" && this.isBedSelfiePose(pose)) {
      sections.push(this.getBedSelfieSpatialAnchor(pose, scene));
    }

    sections.push(`POSE AND BODY PHYSICS
Pose: ${pose?.name_en ?? "Natural pose selected by the user"}.
Body direction: ${bodyDirection.replaceAll("_", " ")}.
${pose ? this.poseEngine.buildPhysicsText(pose) : "Keep anatomy and support physically possible."}
Maintain correct joint order, limb count, hand structure, weight distribution, pressure response, contact shadows, and non-intersection between the body and nearby objects.`);

    sections.push(`CAMERA AND ARM GEOMETRY
${this.cameraEngine.buildPrompt({ camera, lens, pose, cameraAngle, cameraDistance })}
The crop must follow the reachable camera position. Do not reveal a camera position that the stated arm, photographer, room boundary, or mirror geometry cannot physically support.`);

    sections.push(`FACIAL EXPRESSION
${expression.prompt}
Expression changes only facial muscle state; preserve the identity geometry and natural asymmetry defined by IMAGE A.`);

    sections.push(`HAIR
${hair.prompt}
Where the head touches a pillow or cushion, compress only the contact-side hair according to pressure and friction. Do not change haircut, hairline, density, or growth pattern.`);

    sections.push(`CLOTHING
${clothing.prompt}
Fabric follows gravity, body curvature, pressure, friction, and the selected pose. Produce irregular, load-driven folds appropriate to material thickness. Avoid repeated texture stamps, melted edges, or geometry that ignores contact surfaces.`);

    sections.push(`LIGHTING AND EXPOSURE
${this.lightingEngine.buildPrompt(lighting)}
Light must interact consistently with face, hair, beard, neck, clothing, bedding, furniture, mirrors, and nearby surfaces. Every cast shadow, contact shadow, catchlight, reflection, and brightness gradient must trace back to a selected or reference-supported source.`);

    sections.push(`PHONE-CAMERA PROCESSING
- Apply one ordinary Xiaomi phone-camera pipeline to the entire frame.
- Use restrained sharpening, noise reduction, tone mapping, and compression appropriate to the selected light level.
- Preserve natural phone depth of field; do not add DSLR-style blur, broken portrait segmentation, or artificial edge separation around hair.
- Allow mild, physically expected white-balance imperfection under mixed light without stylized color grading.
- Face, neck, body, clothing, and room must share the same exposure logic, noise character, resolution, sharpness, and compression unless depth or illumination physically explains a difference.
- Retain realistic material response: skin is neither waxy nor over-detailed; hair is neither wire-like nor sculpted; beard edges are neither painted nor uniformly dense.`);

    sections.push(`FINAL PHYSICAL CHECK
- The person is the exact IMAGE A identity under new conditions.
- The room obeys IMAGE B and ${roomMode} mode.
- The selected support surfaces exist and visibly respond to body weight.
- Arms, hands, phone reach, and camera optical axis are anatomically and geometrically possible.
- For bed selfies, body placement on the mattress is solved before camera placement and must not shift to satisfy framing.
- Mirror reflections, if present, preserve one consistent ray path and handedness.
- Camera, lens, distance, perspective, depth of field, exposure, and processing form one compatible capture.
- No furniture or clutter is added, removed, moved, cleaned, mirrored, resized, or redesigned.`);

    sections.push(`FORBIDDEN RESULTS
No cartoon, illustration, painting, 3D-render appearance, beauty filter, facial reshaping, forced symmetry, plastic or waxy skin, artificial pore maps, painted beard, wire hair, extra fingers, extra limbs, fused limbs, impossible joints, torso penetration, floating body, unsupported contact, broken reflection, fake DSLR bokeh, anamorphic distortion, destructive ISO noise, extreme motion blur, fake 8K detail, unmotivated lens flare, cinematic grading, studio softbox, EXIF spoofing, C2PA removal, PRNU simulation, forensic countermeasures, or unrequested text and logos.`);

    return sections.join("\n\n");
  }
}
