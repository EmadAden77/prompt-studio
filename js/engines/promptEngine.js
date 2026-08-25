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

  getReferenceName(upload, fallback, { selected = false } = {}) {
    const safeFilename = upload?.name && /^[\x20-\x7E]+$/u.test(upload.name) ? upload.name : null;
    if (safeFilename) return `“${safeFilename}”`;
    return selected
      ? `the user-selected built-in room reference “${fallback}”`
      : `the attached ${fallback}`;
  }

  buildNaturalBrief(c) {
    const personDescription = this.identityEngine.fixedData?.person?.description
      ?? "Middle Eastern man, 35 years old, 183 cm tall, 82 kg, with a lightly athletic build";
    const sceneName = c.scene?.name_en ?? "the selected bedroom reference";
    const poseName = c.pose?.name_en?.toLowerCase() ?? "positioned naturally in the selected scene";
    const lightingName = c.lighting?.name_en?.toLowerCase() ?? "the selected physically motivated lighting";
    const aspect = ["9:16", "1:1", "16:9"].includes(c.aspect) ? c.aspect : "9:16";
    const aspectLabel = aspect === "9:16"
      ? "vertical phone selfie"
      : aspect === "1:1"
        ? "square phone selfie"
        : "horizontal phone selfie";
    const cameraPhrase = c.camera?.type === "rear"
      ? "the Xiaomi 15 Ultra rear camera toward the real mirror with ordinary phone processing"
      : "the Xiaomi 15 Ultra front camera at arm's length with mild wide-angle perspective and ordinary phone processing";

    return `PHOTOGRAPHIC BRIEF — NATURAL LANGUAGE (read this first)
Create a photorealistic, ordinary smartphone selfie photograph, not a studio shot.
The subject is the exact real man from IMAGE A, who is a ${personDescription}, with the same face, skin tone, hair, and beard, photographed again rather than recreated as a look-alike.
The setting is ${sceneName}, exactly the same room as IMAGE B with the same furniture, materials, layout, and visible clutter.
He is ${poseName}, with the pose reading naturally and physically supported by the real surface or floor shown in the room.
The result should feel like a candid, unedited phone photo with ordinary imperfections, no beauty filter, no CGI feel, and no cinematic grading.
Use ${lightingName} with physically believable light behavior, captured on ${cameraPhrase}.
Aspect ratio: ${aspect} ${aspectLabel}.`;
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

  familyOf(pose) {
    if (pose?.id?.startsWith("sitting")) return "sitting";
    if (pose?.id?.startsWith("standing")) return "standing";
    return "bed";
  }

  getPlacementRule(config) {
    const { pose, scene, autoEngineering } = config;
    const region = scene?.region?.replaceAll("_", " ") ?? "the selected room region";
    const orientation = autoEngineering?.orientation ?? "follow the selected pose and support surfaces";

    if (pose?.id === "mirror_selfie") {
      return `Place the subject inside the actual vanity/mirror zone shown by IMAGE B. Keep the real mirror boundary and room geometry unchanged. Selected reference region: ${region}.`;
    }
    if (pose?.id === "standing_vanity") {
      return `Place the subject on the real floor in front of the vanity zone shown by IMAGE B. Keep the vanity, mirror, floor, and room geometry fixed. This is the front-camera standing pose, not the separate mirror-selfie pose. Selected reference region: ${region}.\nDeterministic orientation: ${orientation}`;
    }
    if (pose?.id === "standing_bedside") {
      return `Place the subject on the real floor beside the bed represented by IMAGE B. The bed remains nearby room geometry, not the body's primary support surface. Selected reference region: ${region}.\nDeterministic orientation: ${orientation}`;
    }
    if (pose?.placement === "sofa") {
      const action = pose.id.startsWith("sitting") ? "on the real sofa seat" : "on the real floor in the sofa zone";
      return `Place the subject strictly ${action} represented by IMAGE B. Preserve the sofa identity, scale, orientation, cushions, armrests, and surrounding room geometry. Selected reference region: ${region}.\nDeterministic orientation: ${orientation}`;
    }
    if (pose?.placement === "chair") {
      return `Place the subject strictly on the real chair seat represented by IMAGE B. Preserve the chair boundaries, backrest, floor, and surrounding room geometry. Selected reference region: ${region}.\nDeterministic orientation: ${orientation}`;
    }
    if (pose?.placement === "floor" || pose?.placement === "center") {
      return `Place the subject strictly on the real room floor represented by IMAGE B at the selected room location. Preserve all nearby furniture and fixed geometry. Selected reference region: ${region}.\nDeterministic orientation: ${orientation}`;
    }
    if (pose?.placement === "wardrobe") {
      return `Place the subject on the real floor in the wardrobe zone represented by IMAGE B. Preserve wardrobe doors, state, scale, orientation, verticals, and surrounding geometry. Selected reference region: ${region}.\nDeterministic orientation: ${orientation}`;
    }
    if (pose?.placement === "vanity") {
      return `Place the subject inside the actual vanity/mirror zone shown by IMAGE B. Keep the real mirror boundary and room geometry unchanged. Selected reference region: ${region}.`;
    }
    return `Place the subject strictly on the real bed/mattress geometry represented by IMAGE B. Anchor the body before solving the camera. Do not pull, enlarge, slide, or rotate the whole body toward the lens merely to improve composition. Selected reference region: ${region}.
Deterministic orientation: ${orientation}`;
  }

  getBodyFirstRule(pose) {
    const family = this.familyOf(pose);
    if (family === "sitting") {
      return "BODY FIRST, CAMERA SECOND: solve the entire seated body, seat/floor contacts, support geometry, scale, and room-relative placement before deriving phone position. Soft supports compress only where loaded; hard supports prove weight through contact shadows and pressure. If framing would hide the only evidence of sitting or break anatomy, loosen the crop instead of moving the body off its support.";
    }
    if (family === "standing") {
      return "BODY FIRST, CAMERA SECOND: solve the full standing body, both foot-floor contacts, weight shift, scale, and room-relative placement before deriving phone position. The floor remains rigid; grounding is proven by sole contact, contact shadow, stance asymmetry, and a light-consistent cast shadow. If upper-body framing would otherwise break anatomy or room continuity, loosen the crop without moving the feet.";
    }
    return "BODY FIRST, CAMERA SECOND: solve the entire body, mattress/pillow contacts, scale, and room-relative placement before deriving phone position. If framing would otherwise break anatomy or room continuity, loosen the crop instead of moving the body off its correct support surfaces.";
  }

  getRealismSupportText(pose) {
    const family = this.familyOf(pose);
    if (family === "sitting") {
      return "real seated support response with seat/floor contact shadows, soft-cushion compression only where applicable, gravity-driven clothing folds, natural seated asymmetry";
    }
    if (family === "standing") {
      return "real foot-floor grounding, sole contact shadows, natural contrapposto, gravity-driven clothing folds, light-consistent floor shadow";
    }
    return "local mattress and pillow compression, gravity-driven clothing folds";
  }

  buildFinalPhysicalCheck(pose) {
    const family = this.familyOf(pose);
    if (family === "sitting") {
      return `FINAL PHYSICAL CHECK
- IMAGE A controls identity only; its expression, clothing, lighting, pose, and camera viewpoint do not transfer.
- IMAGE B controls the same room and the selected real seat/support location only.
- Subject placement is solved before camera placement.
- For front-camera selfies, the final frame must pass the SELFIE DISTANCE CHECK and visibly read as subject-held at arm's length, never as an observer or room camera.
- Seated support surfaces visibly carry weight: soft cushions compress under load; hard seat/floor contacts show tight contact shadows and no floating gaps.
- Knees/legs/feet remain physically supported according to the selected seated pose, and shoulders stay naturally asymmetric.
- Arms, hands, phone reach, and optical axis are anatomically possible.
- Mirror reflections, if present, preserve one ray path and correct handedness.
- Camera, lens, perspective, exposure, depth of field, noise, and processing form one compatible capture.
- No furniture, clutter, doors, windows, mirrors, fixtures, or room dimensions are moved, cleaned, mirrored, resized, or redesigned.`;
    }
    if (family === "standing") {
      return `FINAL PHYSICAL CHECK
- IMAGE A controls identity only; its expression, clothing, lighting, pose, and camera viewpoint do not transfer.
- IMAGE B controls the same room and the selected real standing location only.
- Subject placement is solved before camera placement.
- For front-camera selfies, the final frame must pass the SELFIE DISTANCE CHECK and visibly read as subject-held at arm's length, never as an observer or room camera.
- Both feet are physically grounded on the real floor with sole-hugging contact shadows; weight shifts naturally to one leg without mannequin symmetry.
- Vertical room lines remain nearly vertical except for mild physically plausible wide-angle convergence.
- Arms, hands, phone reach, and optical axis are anatomically possible.
- Mirror reflections, if present, preserve one ray path and correct handedness.
- Camera, lens, perspective, exposure, depth of field, noise, and processing form one compatible capture.
- No furniture, clutter, doors, windows, mirrors, fixtures, or room dimensions are moved, cleaned, mirrored, resized, or redesigned.`;
    }
    return `FINAL PHYSICAL CHECK
- IMAGE A controls identity only; its expression, clothing, lighting, pose, and camera viewpoint do not transfer.
- IMAGE B controls the same room and bed only.
- Subject placement is solved before camera placement.
- The selected body side is defined relative to the subject, not the image.
- For side-lying poses, the loaded shoulder, ribcage, hip, pillow contact, upper selfie arm, and lower support arm all agree with the same body side.
- For front-camera selfies, the final frame must pass the SELFIE DISTANCE CHECK and visibly read as subject-held at arm's length, never as an observer or room camera.
- Support surfaces visibly carry weight and compress locally.
- Arms, hands, phone reach, and optical axis are anatomically possible.
- Mirror reflections, if present, preserve one ray path and correct handedness.
- Camera, lens, perspective, exposure, depth of field, noise, and processing form one compatible capture.
- No furniture, clutter, doors, windows, mirrors, fixtures, or room dimensions are moved, cleaned, mirrored, resized, or redesigned.`;
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
    const imageBName = this.getReferenceName(uploads?.imageB, scene?.image_filename ?? "IMAGE B room photograph", { selected: true });
    const poseSections = pose
      ? this.poseEngine.engineer({ pose, expression, hair, clothing, autoEngineering })
      : null;
    const selfieViewpointLock = this.cameraEngine.selfieViewpointLock({
      camera,
      pose,
      autoEngineering
    });
    const sections = [];

    sections.push(`CHATGPT IMAGE TASK
ChatGPT, ${taskVerb}. Produce one ordinary, coherent, physically believable smartphone photograph. Use one camera, one reachable viewpoint, one exposure, one lighting event, and one image-processing pipeline. Return only the final image.`);

    sections.push(this.buildNaturalBrief(config));

    if (selfieViewpointLock) sections.push(selfieViewpointLock);

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
${this.getBodyFirstRule(pose)}`);

    sections.push(poseSections?.posePhysics ?? `POSE & PHYSICS
Keep anatomy, gravity, support, and pressure physically possible.`);

    if (poseSections?.trueLateral) sections.push(poseSections.trueLateral);

    sections.push(`CAMERA AND ARM STRATEGY
${this.cameraEngine.buildPrompt({ camera, lens, pose, cameraAngle, cameraDistance })}
Fine camera engineering: ${autoEngineering?.cameraFine ?? "Use the mapped reachable viewpoint."}
${poseSections?.armStrategy ?? "Keep every shoulder, elbow, wrist, and hand anatomically reachable."}
The phone position is derived after body placement. If framing would force impossible anatomy, loosen the crop instead of moving the body or lengthening the arm. For front-camera selfies, this section must remain subordinate to the earlier SELFIE VIEWPOINT LOCK.`);

    sections.push(poseSections?.expression ?? `EXPRESSION LOCK
Change facial muscle state only; preserve identity geometry and natural asymmetry from IMAGE A.`);

    sections.push(poseSections?.hair ?? `HAIR LOCK
Preserve original length, density, wave pattern, and hairline from IMAGE A.`);

    sections.push(poseSections?.clothing ?? `CLOTHING LOCK
Use the selected clothing and never copy garments from IMAGE A.`);

    sections.push(this.lightingEngine.buildPrompt(lighting));

    sections.push(`CAMERA PROCESSING
Apply one ordinary Xiaomi phone-camera pipeline to the entire frame. Use restrained sharpening, modest noise reduction, mild compression, realistic shadow noise, slight white-balance imperfection where physically expected, and natural phone depth of field. No fake DSLR bokeh. Face, neck, body, clothing, bedding, and room must share the same exposure, sharpness, noise, and compression logic unless depth or illumination physically explains a difference.`);

    sections.push(`REALISM
Preserve natural facial asymmetry, real pores and skin-color variation, natural beard gaps, plausible hair clumps and stray strands, ${this.getRealismSupportText(pose)}, anatomically possible arm reach, mild smartphone perspective distortion, and physically motivated light falloff. Never improve one part of the frame into a cleaner or sharper rendering style than the rest.`);

    sections.push(this.buildFinalPhysicalCheck(pose));

    sections.push(`FORBIDDEN RESULTS
No cartoon, illustration, painting, CGI, 3D-render appearance, beauty filter, facial reshaping, forced symmetry, plastic or waxy skin, artificial pore maps, painted beard, wire hair, extra fingers, extra limbs, fused limbs, impossible joints, torso penetration, floating body, unsupported contact, broken reflection, third-person observer viewpoint, camera across the room, camera at the foot of the bed, doorway view, tripod shot, photo taken by another person, full-body distant selfie, whole-bed composition, hand propping the head during a selfie, fake DSLR bokeh, anamorphic distortion, destructive ISO noise, extreme motion blur, fake 8K detail, unmotivated lens flare, cinematic grading, studio softbox, EXIF spoofing, C2PA removal, PRNU simulation, forensic countermeasures, unrequested text, or logos.`);

    const familyNegatives = poseSections?.familyNegative?.length
      ? `, ${poseSections.familyNegative.join(", ")}`
      : "";
    sections.push(`NEGATIVE PROMPT
cartoon, illustration, painting, CGI, 3D render, plastic skin, beauty filter, face smoothing, over-sharpened pores, painted beard, wire hair, extra fingers, extra arm, fused hand, impossible elbow, wrong selfie hand, torso penetration, floating shoulder, semi-reclined side-lying hybrid, face-up side pose, third-person view, observer camera, wide room shot, camera at foot of bed, doorway camera, photo taken by another person, full-body distant view, whole bed visible, hand propping head, posing hand under cheek, tripod shot, broken anatomy, fake bokeh, cinematic lighting, studio softbox, extreme HDR, artificial glow, fake 8K, exaggerated wide-angle distortion, EXIF manipulation, C2PA removal, PRNU simulation${familyNegatives}`);

    return sections.filter(Boolean).join("\n\n");
  }
}
