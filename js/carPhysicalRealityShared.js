const CONTACT_POSES = new Set([
  "seatbelt_pause",
  "door_armrest_rest",
  "whl_hand8",
  "whl_two",
  "whl_console",
  "hand_roof",
  "door_handle_pause",
  "shoulder_door_lean",
  "hip_fender_lean",
  "open_door_pause",
  "mirror_reflection_selfie",
  "doorframe_half_sit",
  "fender_corner_lean",
  "casual_key_interaction"
]);

const NIGHT_STATES = new Set(["N1", "N2", "N3", "N5", "N6", "mall_night", "underground", "dusk_open"]);

function absoluteReferenceIdentityLock() {
  return `ABSOLUTE REFERENCE-FACE IDENTITY LOCK — PRIMARY RULE / IMAGE A
- IMAGE A is the sole and highest authority for the subject's facial identity. The output must depict the exact same person, never a look-alike, averaged reconstruction, beautified interpretation or identity-adjacent face.
- Preserve the invariant facial geometry from IMAGE A: cranial proportions; face width-to-length ratio; forehead/temple shape; zygomatic width and projection; cheek volume pattern; jaw angle, breadth and mandibular contour; chin width, height and projection; intercanthal distance; eye size, shape, tilt and canthus placement; upper/lower eyelid anatomy and fold; eyebrow position, thickness and arch; nose root, bridge, dorsum, tip, alar width and nostril geometry; philtrum length/depth; mouth width; upper/lower lip volume and contour; ear position, size and cartilage silhouette; hairline geometry; beard boundaries, density pattern and age-specific facial structure.
- Preserve stable natural asymmetry exactly as identity evidence. Do not symmetrize the eyes, brows, cheeks, jaw, nostrils, lips or ears.
- CAMERA / POSE COMPENSATION ONLY: viewpoint, head rotation, perspective and expression may change the projected appearance of landmarks, but they may not alter the underlying identity geometry. Wide-angle near-field perspective is allowed to project the same face differently; it is never permission to redesign the face.
- EXPRESSION IS MUSCLE STATE ONLY: the selected expression may change eyelid aperture, brow tension, cheek lift, lip-corner position and jaw muscle state within anatomically plausible limits, but may not resize the eyes, change inter-eye distance, reshape the nose, narrow/widen the jaw, alter chin projection, change lip volume, move the ears or modify the hairline.
- DERMAL APPEARANCE IS NOT GEOMETRY: lighting, exposure, skin sheen, pore visibility, shadow depth and color contamination may change naturally, but none may be used to disguise or reinterpret facial structure.
- LANDMARK CONSISTENCY TEST: after compensating only for camera perspective, head pose and selected expression, the eyes, brows, nose, mouth, jaw, chin, ears and hairline must remain mutually consistent with IMAGE A. If normalized landmark alignment would fail, reject the result and restore IMAGE A facial geometry.
- IDENTITY OVERRIDES EVERYTHING: if template framing, pose styling, lighting, aesthetics, vehicle visibility or scene composition conflicts with preserving the exact face from IMAGE A, preserve IMAGE A identity and sacrifice the conflicting aesthetic choice.`;
}

function physicalStateLanguage(mode) {
  if (mode === "exterior") {
    return `PHYSICAL STATE AUTHORITY — POSITIVE FIRST
Describe and solve the required physical state directly before relying on rejection language: a real subject-held front-camera viewpoint, world-space human/vehicle scale, load-bearing stance, real asphalt contact, source-driven lighting, clearcoat with curvature-dependent reflections, glass with angle-dependent transmission/reflection, and one ordinary smartphone ISP pipeline. Negative rules remain only as a final failure gate; they must not replace the positive physical solution.`;
  }
  return `PHYSICAL STATE AUTHORITY — POSITIVE FIRST
Describe and solve the required physical state directly before relying on rejection language: a real subject-held front-camera viewpoint, seated load paths, seat/headrest pressure response, reachable joints, perspective-correct cabin depth, source-driven lighting, material-specific response and one ordinary smartphone ISP pipeline. Negative rules remain only as a final failure gate; they must not replace the positive physical solution.`;
}

function parallaxCalibration(mode) {
  if (mode === "exterior") {
    return `3D PARALLAX CALIBRATION
- Preserve the subject's true 195 cm world-space height and the Range Rover's real parked dimensions while allowing the 22–24mm near-field selfie projection to change apparent screen size naturally.
- The face and upper torso are normally much closer to the front camera than most vehicle surfaces, so near-field perspective expansion may make the subject appear proportionally larger on screen. This is physically correct and must not be compensated by shrinking the person, enlarging the SUV or moving the phone beyond arm reach.
- Subject, vehicle, curbs, wheels and background share one perspective solution and one ground plane. Apparent size changes only through real distance, orientation and lens projection.`;
  }
  return `3D PARALLAX CALIBRATION
- The Xiaomi front camera sits within a physically reachable near-field arc from the seated subject. Face, shoulder, steering wheel, seat, dashboard, pillars, mirrors and exterior objects occupy different real depths and therefore different apparent scales.
- Preserve ordinary 22–24mm near-field expansion without flattening the cabin into telephoto compression or enlarging distant cabin objects to match the face.
- Moving the camera angle changes relative parallax between near anatomy, seat/headrest, cabin frames, glass reflections and exterior layers; all must update together under one perspective solution.`;
}

function selfieArmKinematics(mode) {
  return mode === "exterior"
    ? `SELFIE ARM KINEMATICS
- The camera-holding shoulder, clavicle and upper torso subtly respond to arm elevation and forward reach even when the arm itself is cropped out. The reachable phone arc is solved from real shoulder position, not from an invisible floating camera.
- High-angle or side-angle selfies may raise or protract the camera-side shoulder slightly; low-angle selfies may depress it. These changes remain small and anatomically continuous with neck and torso posture.
- Framing asymmetry may arise naturally from one-handed capture, but never by breaking shoulder width, neck alignment or arm length.`
    : `SELFIE ARM KINEMATICS
- The camera-holding shoulder, clavicle and upper torso respond subtly to the reachable seated selfie arc even when the phone and arm are off-frame.
- Camera height and lateral offset must remain compatible with seat position, torso rotation and cabin clearance. Never place the camera through glass, roof liner, seatback or another occupant position.`;
}

function contactBothSides() {
  return `BILATERAL CONTACT RESPONSE — CONTACT CHANGES BOTH SIDES
Whenever real contact exists, both participants in the contact must respond coherently. The body side shows joint load, local skin/clothing compression, wrinkle redirection and an attached contact shadow; the contacted surface side shows the physically appropriate occlusion, shadow interruption, reflection interruption or tiny soft-material deflection when that material can actually deform. Rigid painted metal does not dent from a casual lean, and glass does not deform. Contact may never be indicated on only one side.`;
}

function mirrorRayGeometry(poseId, mode) {
  if (mode !== "exterior" || poseId !== "mirror_reflection_selfie") return "";
  return `SIDE-MIRROR RAY GEOMETRY
The selfie is composed through the real driver-side mirror. The visible reflection must come from one camera-to-mirror-to-subject/vehicle ray solution with correct handedness, crop, occlusion and mirror curvature. The mirror housing and glass edge occlude the reflected scene correctly. Background depth in the mirror differs from the direct scene according to reflection geometry. Dust specks, faint water marks or surface haze are optional and sparse only if physically plausible; they never replace correct reflection geometry.`;
}

function gripMechanics(poseId, mode) {
  if (!CONTACT_POSES.has(poseId)) {
    return `CONTACT MECHANICS — CONDITIONAL
No extra hand contact is invented. If the selected crop contains a real support/contact point, fingers, wrist, elbow, fabric and surface occlusion must solve continuously with a small attached contact shadow and pressure response appropriate to the material.`;
  }

  if (poseId === "door_handle_pause" || poseId === "casual_key_interaction") {
    return `GRIP MECHANICS — DOOR HANDLE / KEY INTERACTION
When the free hand uses the actual driver-door handle, finger pads wrap its real volume, proximal/intermediate finger joints flex in sequence, the thumb opposes the fingers, knuckles follow one anatomical arc, and the handle occludes the correct finger segments. If a key/fob is present, it is held by a simple natural pinch or loose grip and never duplicates or floats. Add only a small attached contact shadow and subtle local skin compression where pressure exists. The hand remains separate from paint and never melts into the handle or door skin.`;
  }

  if (poseId === "seatbelt_pause") {
    return `GRIP MECHANICS — SEATBELT
If visible, the free fingers pinch or guide the real belt with coherent finger flexion, thumb opposition, belt tension and local fabric indentation. The belt follows its anchor path and casts a small attached contact shadow; it does not float through the hand or clothing.`;
  }

  if (poseId === "hand_roof") {
    return `GRIP / PALM CONTACT — ROOF EDGE
The free hand rests rather than clamps: palm/finger pads meet the roof edge at reachable angles, finger joints remain relaxed, the wrist follows forearm rotation, and a small contact shadow plus mild skin/fabric compression marks the support point.`;
  }

  if (poseId === "doorframe_half_sit") {
    return `HALF-SIT LOAD PATH
Pelvis load is shared between the seat edge and the grounded foot. The seat cushion compresses locally under the supported hip/thigh, the grounded leg carries real partial weight, the second leg remains plausibly inside the cabin, and the open door/doorframe never intersects the body. Torso balance follows this split support rather than hovering between inside and outside.`;
  }

  if (poseId === "fender_corner_lean" || poseId === "hip_fender_lean") {
    return `FENDER / CORNER LEAN LOAD PATH
Use only a light hip/pelvis lean on a structurally plausible fender or body-edge zone, not full seated body weight on the hood. The supporting legs remain the primary load path; pelvis counter-shifts, torso angle follows, clothing compresses locally and the rigid body panel keeps its real shape.`;
  }

  return `CONTACT / GRIP MECHANICS
Any visible free-hand or forearm support uses continuous shoulder–elbow–wrist–finger anatomy. Finger curl, knuckle orientation, occlusion, pressure, local clothing deformation and attached contact shadow all follow the actual support geometry. Contact is load-driven rather than decorative.`;
}

function mobileImperfections(stateId) {
  const lowLight = NIGHT_STATES.has(stateId);
  return `CONDITIONAL MOBILE SENSOR / LENS IMPERFECTIONS
- Keep uncorrected-looking but plausible smartphone ISP character: finite dynamic range, restrained computational sharpening, mild edge softness, compression and illumination-dependent noise.
- ${lowLight ? "This low-light state supports visible shadow luminance noise, restrained chroma noise, slightly softer fine detail, imperfect mixed white balance and occasional modest highlight clipping." : "This brighter state should remain comparatively clean; sensor noise and clipping stay subtle and proportional to actual exposure."}
- A faint localized fingerprint/smudge haze, source-shaped bloom or tiny lens flare is OPTIONAL only when a bright source, incidence angle and plausible lens contamination support it. It must never become mandatory global fog, repeated halo or decorative flare.
- Small-sensor front-camera depth behavior remains mostly readable. Any background softness is optical/focus-driven and modest; never impose synthetic portrait-mask bokeh.
- Imperfections affect the whole optical capture consistently. Do not place special noise, blur or haze only on the face or only in empty background regions.`;
}

export function buildCarUniversalPhysicalReality({ mode, poseId, stateId }) {
  const mirror = mirrorRayGeometry(poseId, mode);
  return `${absoluteReferenceIdentityLock()}\n\n${physicalStateLanguage(mode)}\n\n${parallaxCalibration(mode)}\n\n${selfieArmKinematics(mode)}\n\n${gripMechanics(poseId, mode)}\n\n${contactBothSides()}${mirror ? `\n\n${mirror}` : ""}\n\n${mobileImperfections(stateId)}`;
}
