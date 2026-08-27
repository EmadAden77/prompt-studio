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
  "open_door_pause"
]);

const NIGHT_STATES = new Set(["N1", "N2", "N3", "N5", "N6", "mall_night", "underground", "dusk_open"]);

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
- Preserve the subject's true 193 cm world-space height and the Range Rover's real parked dimensions while allowing the 22–24mm near-field selfie projection to change apparent screen size naturally.
- The face and upper torso are normally much closer to the front camera than most vehicle surfaces, so near-field perspective expansion may make the subject appear proportionally larger on screen. This is physically correct and must not be compensated by shrinking the person, enlarging the SUV or moving the phone beyond arm reach.
- Subject, vehicle, curbs, wheels and background share one perspective solution and one ground plane. Apparent size changes only through real distance, orientation and lens projection.`;
  }
  return `3D PARALLAX CALIBRATION
- The Xiaomi front camera sits within a physically reachable near-field arc from the seated subject. Face, shoulder, steering wheel, seat, dashboard, pillars, mirrors and exterior objects occupy different real depths and therefore different apparent scales.
- Preserve ordinary 22–24mm near-field expansion without flattening the cabin into telephoto compression or enlarging distant cabin objects to match the face.
- Moving the camera angle changes relative parallax between near anatomy, seat/headrest, cabin frames, glass reflections and exterior layers; all must update together under one perspective solution.`;
}

function gripMechanics(poseId, mode) {
  if (!CONTACT_POSES.has(poseId)) {
    return `CONTACT MECHANICS — CONDITIONAL
No extra hand contact is invented. If the selected crop contains a real support/contact point, fingers, wrist, elbow, fabric and surface occlusion must solve continuously with a small attached contact shadow and pressure response appropriate to the material.`;
  }

  if (poseId === "door_handle_pause") {
    return `GRIP MECHANICS — DOOR HANDLE
The free hand forms a real grip around the actual driver-door handle: finger pads wrap the handle volume, proximal/intermediate finger joints flex in sequence, the thumb opposes the fingers, knuckles follow one anatomical arc, and the handle occludes the correct finger segments. Add only a small attached contact shadow and subtle local skin compression where pressure exists. The hand remains separate from paint and never melts into the handle or door skin.`;
  }

  if (poseId === "seatbelt_pause") {
    return `GRIP MECHANICS — SEATBELT
If visible, the free fingers pinch or guide the real belt with coherent finger flexion, thumb opposition, belt tension and local fabric indentation. The belt follows its anchor path and casts a small attached contact shadow; it does not float through the hand or clothing.`;
  }

  if (poseId === "hand_roof") {
    return `GRIP / PALM CONTACT — ROOF EDGE
The free hand rests rather than clamps: palm/finger pads meet the roof edge at reachable angles, finger joints remain relaxed, the wrist follows forearm rotation, and a small contact shadow plus mild skin/fabric compression marks the support point.`;
  }

  return `CONTACT / GRIP MECHANICS
Any visible free-hand or forearm support uses continuous shoulder–elbow–wrist–finger anatomy. Finger curl, knuckle orientation, occlusion, pressure, local clothing deformation and attached contact shadow all follow the actual support geometry. Contact is load-driven rather than decorative.`;
}

function mobileImperfections(stateId) {
  const lowLight = NIGHT_STATES.has(stateId);
  return `CONDITIONAL MOBILE SENSOR / LENS IMPERFECTIONS
- Keep uncorrected-looking but plausible smartphone ISP character: finite dynamic range, restrained computational sharpening, mild edge softness, compression and illumination-dependent noise.
- ${lowLight ? "This low-light state supports visible shadow luminance noise, restrained chroma noise, slightly softer fine detail, imperfect mixed white balance and occasional modest highlight clipping." : "This brighter state should remain comparatively clean; sensor noise and clipping stay subtle and proportional to actual exposure."}
- A faint localized fingerprint/smudge haze or small source-shaped bloom is OPTIONAL only when a bright practical light, grazing incidence and plausible lens contamination support it. It must never be a mandatory global fog, repeated halo or decorative flare.
- Imperfections affect the whole optical capture consistently. Do not place special noise, blur or haze only on the face or only in empty background regions.`;
}

export function buildCarUniversalPhysicalReality({ mode, poseId, stateId }) {
  return `${physicalStateLanguage(mode)}\n\n${parallaxCalibration(mode)}\n\n${gripMechanics(poseId, mode)}\n\n${mobileImperfections(stateId)}`;
}
