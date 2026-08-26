export const ARM_PERSPECTIVE_LEVELS = Object.freeze(["natural", "enhanced", "extreme"]);

function readArmPerspectiveSelection() {
  if (typeof document === "undefined") return "enhanced";
  const value = document.querySelector("#armPerspectiveSelect")?.value;
  return ARM_PERSPECTIVE_LEVELS.includes(value) ? value : "enhanced";
}

export function selfieCameraEmulator(armPerspective = "enhanced") {
  const perspectiveText = armPerspective === "extreme"
    ? "The selfie arm may use a deliberately severe 0.5x/fisheye-like foreground stretch and forced perspective, while the face, torso, bed, furniture, and room geometry remain coherent and are not globally warped."
    : armPerspective === "natural"
      ? "Keep the selfie arm within ordinary natural wide-angle proportions, with only normal near-field enlargement."
      : "Use noticeable but coherent near-field forced perspective on the selfie arm so it reads longer and more foreground-dominant than normal, while the face, torso, bed, furniture, and room remain physically coherent.";

  return `[Camera Emulator]: Xiaomi 15 Ultra - Front-Facing Camera (Selfie Mode)

[Optical Physics & Lens Specs]:
- Focal Length: 22–24mm equivalent wide-angle front lens.
- Perspective Constraints: obey the pose-specific SELFIE VIEWPOINT LOCK distance exactly; ordinary mapped reach is typically about 0.45–0.70 m, with only explicitly mapped extensions such as the supine 0.45–0.75 m case. Preserve natural center-face protrusion. ${perspectiveText}
- Sensor Characteristics: mobile micro-sensor dynamics with subtle high-ISO grain and raw chroma noise in shadow areas when the selected exposure requires it.
- Lighting & Exposure: use only the declared selected lighting event. Highlights, shadow direction, white balance, and falloff must follow that source geometry; do not bake in a generic harsh face-light pattern when the selected light is diffuse.

[Texture & Processing Execution - STRICT NO AI POLISH]:
- Absolutely eliminate all smooth waxy or overly processed skin textures.
- Force raw physical imperfections: visible pores, asymmetric peach fuzz, microscopic sweat glints where illumination supports them, uneven pigmentation, and true skin micro-contrast.
- Mobile artifacts: subtle software edge sharpening combined with restrained micro-motion blur on genuinely moving extremities such as loose hair; never apply blur as a decorative effect.

[Depth of Field]: natural phone depth of field; only if computational portrait mode is implied, show restrained edge-detection imperfections around hair/shoulders rather than perfect DSLR falloff.`;
}

export class CameraEngine {
  constructor(cameraSpecs, lenses, armStrategies) {
    this.cameraSpecs = cameraSpecs;
    this.lenses = [...lenses];
    this.armStrategies = armStrategies;
  }

  getCamera(cameraType) {
    return this.cameraSpecs[cameraType] ?? this.cameraSpecs.front;
  }

  getLens(lensType) {
    return this.lenses.find((lens) => lens.id === lensType) ?? this.lenses[0];
  }

  getLensesForCamera(cameraType) {
    return this.lenses.filter((lens) => lens.camera === cameraType);
  }

  normalizeLens(cameraType, lensType) {
    const available = this.getLensesForCamera(cameraType);
    return available.some((lens) => lens.id === lensType) ? lensType : available[0]?.id;
  }

  getArmRule(pose, cameraType) {
    if (cameraType === "rear") return this.armStrategies.rear_camera;
    return this.armStrategies[pose.arm_strategy] ?? this.armStrategies.standing;
  }

  resolveArmPerspective(pose, requestedLevel = null) {
    const requested = ARM_PERSPECTIVE_LEVELS.includes(requestedLevel)
      ? requestedLevel
      : readArmPerspectiveSelection();
    if (pose?.id === "mirror_selfie") {
      return { requested, effective: "natural", constrained: requested !== "natural", reason: "mirror" };
    }
    const family = pose?.id?.startsWith("standing")
      ? "standing"
      : pose?.id?.startsWith("sitting")
        ? "sitting"
        : "bed";
    if (family === "bed" && requested === "extreme") {
      return { requested, effective: "enhanced", constrained: true, reason: "bed" };
    }
    return { requested, effective: requested, constrained: false, reason: null };
  }

  buildArmPerspectiveLock(pose, requestedLevel = null) {
    const resolved = this.resolveArmPerspective(pose, requestedLevel);
    if (pose?.id === "mirror_selfie") {
      return `SELFIE ARM PERSPECTIVE — MIRROR SAFETY OVERRIDE
ARM PERSPECTIVE LEVEL: NATURAL.
For a mirror selfie, keep the phone-holding arm at believable reflected proportions. Do not apply elongated foreground-arm distortion because the camera sees the subject through the mirror ray path rather than from the hand-to-face foreground geometry.`;
    }

    const levelText = resolved.effective === "extreme"
      ? `ARM PERSPECTIVE LEVEL: EXTREME
Use intentionally dramatic ultra-wide / 0.5x fisheye-like forced perspective on the phone-holding arm. The selfie arm must appear strongly elongated, enlarged, and stretched toward the viewer and may dominate an extreme foreground corner. Do not normalize or shorten its apparent perspective. Keep the face and body farther back and comparatively smaller. The exaggeration is optical and compositional only, not skeletal mutation.`
      : resolved.effective === "natural"
        ? `ARM PERSPECTIVE LEVEL: NATURAL
Use an ordinary handheld smartphone selfie perspective. The phone-holding arm is visibly involved in the composition and slightly enlarged by near-field wide-angle perspective, but remains within believable natural apparent proportions.`
        : `ARM PERSPECTIVE LEVEL: ENHANCED
Use noticeable wide-angle forced perspective. The phone-holding arm appears longer, closer, and more prominent in the extreme foreground than in a conventional selfie, while remaining visually coherent as one continuous arm. Preserve the face and room without global fisheye warping.`;

    const constraint = resolved.constrained && resolved.reason === "bed"
      ? "BED SAFETY OVERRIDE: EXTREME was requested, but bed/lying poses are capped at ENHANCED so shoulder support, elbow reach, pillow contact, and torso anatomy remain physically solvable."
      : "";

    return `SELFIE ARM PERSPECTIVE LOCK — GLOBAL
This lock is an optical-perspective requirement for every front-camera selfie in the application.
${levelText}
${constraint}
ANATOMY SAFETY LOCK: show exactly one continuous selfie arm with one shoulder, one upper arm, one elbow, one forearm, one wrist, and one hand relationship. The apparent elongation must come from camera proximity, foreshortening, foreground magnification, and selected lens perspective. Do not create extra arms, duplicate hands, detached shoulders, disconnected wrists, impossible elbow count, mirrored limb fragments, or rubber-like skeletal stretching.
The selected arm-perspective effect applies to the phone-holding arm only. Do not globally stretch the face, skull, torso, furniture, doors, walls, bed, sofa, or room geometry.`;
  }

  selfieViewpointLock({ camera, pose, autoEngineering = null, armPerspectiveLevel = null } = {}) {
    if (!camera?.selfie || camera.type !== "front" || !pose) return "";

    const profile = autoEngineering?.selfieViewpoint ?? {};
    const holdingHand = profile.holdingHand ?? "RIGHT";
    const otherHand = profile.otherHand ?? (holdingHand === "LEFT" ? "RIGHT" : "LEFT");
    const distance = profile.distance ?? camera.distance ?? "within natural arm reach";
    const angle = profile.angle ?? "a physically reachable front-camera selfie angle";
    const tilt = profile.tilt ?? "a small natural handheld roll only";
    const armVisual = profile.armVisual ?? `The ${holdingHand} selfie arm must originate from the matching shoulder and follow a physically reachable path toward the camera.`;
    const family = pose.id.startsWith("sitting") ? "sitting"
      : pose.id.startsWith("standing") ? "standing" : "bed";
    const armPerspectiveLock = this.buildArmPerspectiveLock(pose, armPerspectiveLevel);

    const forbiddenFamily = family === "sitting"
      ? `- standing-height observer viewpoint for a seated subject
- crop that hides the only seat/support evidence`
      : family === "standing"
        ? `- full-body distant selfie when upper-body arm-length framing is required
- camera height inconsistent with the subject's standing eye level`
        : `- camera at the foot of the bed
- wide room shot, full-body distant shot, or composition showing the whole bed as the subject`;

    const framing = family === "sitting"
      ? `- The frame must immediately read as a real arm's-length seated phone selfie.
- Show head + torso + enough support geometry to prove sitting. For sofa/chair, part of the seat plus armrest/backrest must remain visible; for floor sitting, enough pelvis/leg/floor support must remain visible.
- Camera remains at the subject's real seated eye height: about 1.1–1.2 m for chair/sofa, lower for floor sitting. The background must read from seated height, never standing height.
- ${armVisual}
- The ${holdingHand} hand's ONLY job is holding the phone near face level with a relaxed elbow.
- The opposite ${otherHand} arm rests on a real armrest, thigh, knee, mattress edge, or floor support as the pose permits; no floating forearm and no extra shoulder.
- The seat/support, subject, and background share one coherent near-field perspective. Do not hide the support with an impossible crop.`
      : family === "standing"
        ? `- The frame must immediately read as a real arm's-length standing phone selfie.
- Use upper-body framing with the room readable behind. Solve the full standing body and floor contacts before crop even when the feet fall outside frame.
- Camera remains around the subject's standing eye height (~1.5 m). Doors, wardrobe edges, wall corners, and mirror frames stay nearly vertical except for perspective convergence physically justified by the selected arm-perspective level.
- ${armVisual}
- The ${holdingHand} hand's ONLY job is holding the phone near face level with a relaxed elbow.
- The opposite ${otherHand} arm rests naturally by the thigh, in a pocket, on the hip, or on a real nearby support surface. No floating arm and no extra shoulder.
- Background equals the fixed bedroom as seen from the subject's true standing location at arm's length, never an across-the-room observer view.`
        : `- The frame must immediately read as a real arm's-length phone selfie.
- Face occupies approximately 40–60% of frame height. Show head and upper torso only; chest and one or both shoulders may appear as anatomy requires, but never the full body or whole bed.
- ${armVisual}
- The ${holdingHand} hand's ONLY job is holding the phone. It must not prop the head, rest under the cheek, or become a posing hand.
- The lower/opposite ${otherHand} arm rests naturally according to the pose and must never cross through, merge into, or penetrate the torso.
- Background equals the bedroom as seen FROM the subject's actual position on the bed at arm's length. The bed, pillow, headboard, lamp, and nearby room details are only near background, never an across-the-room composition.
- Near-field stretch may emphasize the closest visible part of the selfie arm according to the selected arm-perspective level; do not enlarge the head, torso, bed, or room unnaturally.`;

    const invalidCheck = family === "sitting"
      ? "If the camera reads as standing-height, the seat/support is hidden, the subject appears to float above the support, or the camera is farther away than the mapped arm reach, the render is INVALID."
      : family === "standing"
        ? "If the camera reads as a room observer, the upper-body framing becomes a distant full-body shot, room geometry bends without a selected-lens reason, or the camera is farther away than the mapped arm reach, the render is INVALID."
        : "If the frame reads as though the camera is farther away than the mapped arm reach, shows the whole bed, shows most of the body, or looks like another person took the picture, the render is INVALID.";

    return `SELFIE VIEWPOINT LOCK — HIGHEST PRIORITY FOR CAMERA GEOMETRY
This image IS a handheld front-camera selfie taken BY THE SUBJECT HIMSELF.
Within camera viewpoint, framing, and photographer geometry, this lock overrides every lower-priority instruction.
The ONLY allowed camera viewpoint is the subject's own front-facing phone held in his ${holdingHand} hand at ${distance} from his face.
Camera angle: ${angle}; ${tilt}.
"Physically reachable viewpoint" means ONLY this phone-in-hand viewpoint. It never means a camera placed elsewhere in the room.

${armPerspectiveLock}

FORBIDDEN VIEWPOINTS
- third-person observer camera
- camera across the room
- doorway view
- tripod or remote camera
- another person taking the photo
- any viewpoint farther from the face than the mapped arm-reach distance
${forbiddenFamily}

SELFIE FRAMING LOCK
${framing}
- The phone is behind the camera plane and therefore is NOT visible in the finished image; at most, a few fingertips or a tiny edge-contact cue may appear at the extreme frame boundary if physically unavoidable.

SELFIE DISTANCE CHECK
${invalidCheck} Re-render from the subject's mapped front-camera phone-in-hand viewpoint without moving the body off its real support surfaces.`;
  }

  buildMirrorSelfiePrompt({ camera, lens, cameraAngle, cameraDistance }) {
    return `MIRROR SELFIE CAMERA — REAR CAMERA, SUBJECT-HELD
This is a real mirror selfie taken by the subject himself. The subject holds the phone and points the Xiaomi 15 Ultra rear camera at the real vanity mirror; no second photographer, tripod, remote camera, or observer viewpoint exists.
- ARM PERSPECTIVE LEVEL: NATURAL only for mirror capture; do not apply elongated foreground-arm distortion through the reflection.
- Camera: ${camera.name_en}.
- Lens: ${lens.name_en}, ${lens.focal_length}.
- Aperture behavior: ${camera.aperture}.
- Camera position: ${cameraAngle.replaceAll("_", " ")}; framing distance: ${cameraDistance}.
- The phone is visible only through the mirror reflection at its true hand-held position, with one physically consistent subject → mirror → rear-camera ray path.
- Reflection handedness, gaze, body scale, phone occlusion, back-of-head/shoulder visibility, and mirror-frame perspective must all agree with the same ray geometry.
- The holding elbow remains close to the body in a natural grip; the opposite arm rests naturally at the side, pocket, hip, or another explicitly mapped support.
- Keep mirror and room verticals physically straight except for mild lens-perspective convergence. Never create a duplicated phone, duplicated reflected arm, impossible reflection angle, or a camera outside the subject's hand.`;
  }

  buildPrompt({ camera, lens, pose, cameraAngle, cameraDistance, armPerspectiveLevel = null }) {
    if (camera?.selfie && camera.type === "front") {
      const effective = this.resolveArmPerspective(pose, armPerspectiveLevel).effective;
      return selfieCameraEmulator(effective);
    }

    if (camera?.type === "rear" && pose?.id === "mirror_selfie") {
      return this.buildMirrorSelfiePrompt({ camera, lens, cameraAngle, cameraDistance });
    }

    return `This is not a selfie; another person or a stable tripod operates the rear camera.
- Camera: ${camera.name_en}.
- Lens: ${lens.name_en}, ${lens.focal_length}.
- Aperture behavior: ${camera.aperture}.
- Camera position: ${cameraAngle.replaceAll("_", " ")}; framing distance: ${cameraDistance}.
- Subject distance: ${camera.distance}.
- Perspective: ${camera.distortion}.
- Depth of field: ${camera.dof}.
- Arm geometry: ${this.getArmRule(pose, camera.type)}`;
  }
}
