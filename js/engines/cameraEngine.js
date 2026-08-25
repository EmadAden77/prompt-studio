export function selfieCameraEmulator() {
  return `[Camera Emulator]: Xiaomi 15 Ultra - Front-Facing Camera (Selfie Mode)

[Optical Physics & Lens Specs]:
- Focal Length: 22–24mm equivalent wide-angle front lens.
- Perspective Constraints: obey the pose-specific SELFIE VIEWPOINT LOCK distance exactly; ordinary mapped reach is typically about 0.45–0.70 m, with only explicitly mapped extensions such as the supine 0.45–0.75 m case. Enforce natural center-face protrusion and mild perspective stretch only near the frame edges.
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

  selfieViewpointLock({ camera, pose, autoEngineering = null } = {}) {
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
- Camera remains around the subject's standing eye height (~1.5 m). Doors, wardrobe edges, wall corners, and mirror frames stay nearly vertical with only mild wide-angle convergence near the frame edges.
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
- Mild near-field wide-angle stretch is allowed only on the closest visible part of the selfie arm; do not enlarge the head, torso, bed, or room unnaturally.`;

    const invalidCheck = family === "sitting"
      ? "If the camera reads as standing-height, the seat/support is hidden, the subject appears to float above the support, or the camera is farther away than the mapped arm reach, the render is INVALID."
      : family === "standing"
        ? "If the camera reads as a room observer, the upper-body framing becomes a distant full-body shot, vertical room lines bend without lens reason, or the camera is farther away than the mapped arm reach, the render is INVALID."
        : "If the frame reads as though the camera is farther away than the mapped arm reach, shows the whole bed, shows most of the body, or looks like another person took the picture, the render is INVALID.";

    return `SELFIE VIEWPOINT LOCK — HIGHEST PRIORITY FOR CAMERA GEOMETRY
This image IS a handheld front-camera selfie taken BY THE SUBJECT HIMSELF.
Within camera viewpoint, framing, and photographer geometry, this lock overrides every lower-priority instruction.
The ONLY allowed camera viewpoint is the subject's own front-facing phone held in his ${holdingHand} hand at ${distance} from his face.
Camera angle: ${angle}; ${tilt}.
"Physically reachable viewpoint" means ONLY this phone-in-hand viewpoint. It never means a camera placed elsewhere in the room.

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
- Camera: ${camera.name_en}.
- Lens: ${lens.name_en}, ${lens.focal_length}.
- Aperture behavior: ${camera.aperture}.
- Camera position: ${cameraAngle.replaceAll("_", " ")}; framing distance: ${cameraDistance}.
- The phone is visible only through the mirror reflection at its true hand-held position, with one physically consistent subject → mirror → rear-camera ray path.
- Reflection handedness, gaze, body scale, phone occlusion, back-of-head/shoulder visibility, and mirror-frame perspective must all agree with the same ray geometry.
- The holding elbow remains close to the body in a natural grip; the opposite arm rests naturally at the side, pocket, hip, or another explicitly mapped support.
- Keep mirror and room verticals physically straight except for mild lens-perspective convergence. Never create a duplicated phone, duplicated reflected arm, impossible reflection angle, or a camera outside the subject's hand.`;
  }

  buildPrompt({ camera, lens, pose, cameraAngle, cameraDistance }) {
    if (camera?.selfie && camera.type === "front") return selfieCameraEmulator();

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
