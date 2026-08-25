export function selfieCameraEmulator() {
  return `[Camera Emulator]: Xiaomi 15 Ultra - Front-Facing Camera (Selfie Mode)

[Optical Physics & Lens Specs]:
- Focal Length: 22–24mm equivalent wide-angle front lens.
- Perspective Constraints: close-quarters distance (0.4–0.7 m from subject) enforcing natural center-face protrusion and distinct perspective distortion at the frame edges.
- Sensor Characteristics: mobile micro-sensor dynamics enforcing subtle high-ISO grain and raw chroma noise in shadow areas.
- Lighting & Exposure: physical ambient lighting interacting naturally with skin; uneven light falloff typical of arm-length selfies with direct harsh highlights on the T-zone.

[Texture & Processing Execution - STRICT NO AI POLISH]:
- Absolutely eliminate all smooth waxy or overly processed skin textures.
- Force raw physical imperfections: visible pores, asymmetric peach fuzz, microscopic sweat glints, uneven pigmentation, and true skin micro-contrast.
- Mobile artifacts: subtle software over-sharpening on edges combined with micro-motion blur on extremities like loose hair to mimic handheld instability.

[Depth of Field]: natural phone depth of field; only if computational portrait mode is implied, show intentional slight edge-detection flaws around hair/shoulders rather than perfect DSLR falloff.`;
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

  buildPrompt({ camera, lens, pose, cameraAngle, cameraDistance }) {
    if (camera?.selfie && camera.type === "front") return selfieCameraEmulator();

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
