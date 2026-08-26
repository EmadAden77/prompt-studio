import { PromptEngine } from "./engines/promptEngine.js";
import { getActiveCarTemplate } from "./carTemplates.js";

const patchFlag = Symbol.for("promptStudio.carDriverGeometryRuntime.patched");
const CURRENT_CAR_REFERENCE_FILENAME = "1000206961.png";
const LEGACY_CAR_REFERENCE_FILENAME = "1000206938.jpg";

const NATURAL_PHOTOGRAPHIC_REALISM = `NATURAL PHOTOGRAPHIC REALISM — ORDINARY PHONE CAPTURE
- Preserve small, physically justified imperfections instead of forcing decorative defects: slight exposure imbalance, mild white-balance error, restrained shadow noise, natural skin micro-texture, a few irregular hair strands, non-uniform fabric folds, and ordinary phone sharpening/compression.
- Do not manufacture dust, fingerprints, scratches, fake timestamps, fake metadata, fake sensor fingerprints, or arbitrary defects merely to imitate authenticity.
- Skin keeps pores, beard gaps, natural asymmetry, local oil/sheen variation, and small tonal differences from the actual light event. No beauty filter, skin smoothing, symmetry correction, tooth perfection, or cosmetic relighting.
- Car materials remain material-correct: leather/plastic/fabric/metal/glass should show physically plausible texture, contact creasing, soft wear variation only where supported, and reflections driven by the real scene rather than generic studio highlights.
- Background detail follows the same phone pipeline as the subject. Distant parked vehicles and people lose micro-detail naturally through distance, optics, exposure, demosaicing, denoising, and compression rather than artificial blur.
- Mixed lighting may create modest warm/cool imbalance across the scene when real sources justify it. Do not force cinematic grading or perfectly neutral color.
- A distant walking person may show tiny physically plausible motion softness, but parked vehicles remain stationary and must not show driving motion.
- Bright window edges or reflective trim may clip slightly; deep cabin shadows may retain sensor noise. Do not equalize every tonal region into a studio-perfect result.
- Natural asymmetry is preferred over perfect centering or mirrored composition, but never introduce anatomical or geometric errors as a fake imperfection.
- The goal is a coherent ordinary smartphone photograph, not a claim about forensic origin or detector performance.`;

function list(value) {
  return Array.isArray(value) && value.length ? value.join(", ") : "none beyond the general physical rules";
}

function buildDriverSeatSolver(pose) {
  if (!pose || pose.category !== "car") return "";

  return `DRIVER SEAT ANATOMY LOCK — HIGHEST PRIORITY
Solve the driver's body in this exact order. Seat and vehicle geometry are solved BEFORE pose styling and BEFORE camera placement.

DRIVER SEAT SOLVER — CAMERA LAST
1. SEAT–WHEEL AXIS FIRST
- Define the driver seat from the real steering-wheel centerline in IMAGE B.
- Hips remain centered on the real driver-seat cushion so pelvis, sternum, and chest stay broadly aligned with the steering-wheel axis.
- The steering wheel must read physically in front of the driver's lower chest/upper abdomen region according to the reference perspective, never displaced beside the torso as if it belonged to another seat.
- Never move the seat, steering wheel, steering column, dashboard, or camera viewpoint to fake this alignment.

2. LEGS BEFORE TORSO
- Solve pelvis, thighs, knees, and footwell direction before rotating the upper body.
- Thighs project forward/downward toward the real pedal area beneath the steering wheel.
- Knees remain directionally consistent with the hips and vehicle centerline; they must not stretch sideways toward the passenger seat or door.
- If legs are partially cropped, their hidden continuation must still point toward the real footwell.

3. TORSO ROTATION LIMIT
- Torso rotation toward the selfie camera is limited to a natural approximately 20–30 degrees at the waist/ribcage, with additional small neck/eye turn as needed.
- A 90-degree chest rotation while the pelvis and legs remain driving-forward is forbidden.
- Preserve seated spinal support, natural ribcage orientation, and plausible shoulder asymmetry.

4. HEAD & HEADREST
- The real headrest stays centered behind the subject's head/upper neck on the seat centerline.
- Maintain a plausible small gap or light contact, roughly 2–5cm when geometry permits.
- The head may tilt or turn toward the camera, but it must not drift laterally so far that the headrest appears attached to another seat.
- Never move, widen, narrow, rotate, or reposition the headrest.

5. ARMS FROM SHOULDER
- Every arm originates anatomically from the shoulder joint with a continuous shoulder→upper-arm→elbow→forearm→wrist path.
- The camera-holding arm remains physically solvable from the holding-side shoulder to the phone position, but stays completely outside the final crop under the global no-arm rule.
- Do not let the camera arm appear to grow from the chest, ribs, abdomen, or mid-torso.
- The non-camera arm may rest naturally on the real center console, thigh, door armrest, or steering wheel only where a real contact surface exists.

6. CLOTHING CONSISTENCY & CONTACT
- Both sleeves must remain in the identical intentional state: same roll height, cuff state, button state, and garment construction. Natural fold shapes may differ only because the arms bend differently.
- No sleeve may randomly become shorter, tighter, rolled higher, or buttoned differently from the other unless the selected clothing itself is intentionally asymmetric.
- Preserve seated shirt bunching at the waist/abdomen, fabric tension at bent elbows, and compression/contact folds where clothing meets the seat or console.
- Seat cushion and seatback show only subtle physically plausible body-weight compression; never reshape the seat.

7. KSA LEFT-HAND-DRIVE GEOMETRY
- Treat this reference as left-hand drive: driver seat on the vehicle's left side, steering wheel in front of the driver, center console to the driver's right.
- Keep door, console, wheel, seat, pedals, mirrors, and dashboard mutually consistent with that left-hand-drive layout.

FORBIDDEN — REJECT AND CORRECT
- steering wheel visibly off-axis beside the driver's body;
- pelvis centered in one seat while chest aligns to another seat's wheel;
- knees or thighs pointing in a direction inconsistent with the hips/footwell;
- 90-degree torso twist;
- headrest offset sideways behind the wrong shoulder;
- mismatched sleeve roll/cuff/button state;
- arm emerging from mid-torso;
- floating pelvis, back, thigh, elbow, or forearm contact;
- any seat, wheel, console, headrest, door, or window state changed to accommodate the pose;
- camera geometry that can only work by breaking the solved seated anatomy.

PRIORITY RULE
If the selected car pose or camera angle conflicts with this solver, preserve DRIVER SEAT ANATOMY LOCK and reduce/modify the pose or camera angle. Never sacrifice seat-wheel-body anatomy to preserve a more dramatic selfie angle.`;
}

function buildDriverSelfieGeometry(pose) {
  if (!pose || pose.category !== "car" || !pose.camera_geometry || !pose.arm_strategy) return "";

  const anti = pose.anti_distortion ?? {};
  const arm = pose.arm_strategy ?? {};
  const camera = pose.camera_geometry ?? {};
  const physics = pose.physics ?? {};

  const elbowSupport = anti.elbow_must_be_supported
    ? "MUST be physically supported by the specified real surface, even if that support point remains outside the crop"
    : "may be unsupported only where the pose explicitly requires an upward reachable arm extension";

  return `DRIVER SELFIE GEOMETRY — XIAOMI 15 ULTRA FRONT CAMERA
IMPORTANT: apply this camera geometry only AFTER the DRIVER SEAT ANATOMY LOCK has been solved. Camera placement must adapt to the solved body, not the reverse.
- Template: ${pose.name_en ?? pose.name_ar}.
- Camera: Xiaomi 15 Ultra front-facing camera only; app optical model ${camera.focal_length ?? "22-24mm equivalent"}, ${camera.aperture ?? "approximately f/2.0"}.
- Selfie distance: ${camera.distance ?? "35-55cm"}.
- Camera angle: ${camera.angle ?? "reachable front-camera angle"}.
- Composition: ${camera.frame_composition ?? "face primary with enough immutable car context to prove the same vehicle"}.
- Holding side: ${arm.holding_hand ?? "one hand"}; phone position: ${arm.position ?? "within natural selfie reach"}.
- Holding-arm support: ${arm.support ?? "use a real reachable support surface when required"}.
- Non-camera arm: ${arm.other_arm ?? "rests naturally on a real surface"}.
- Critical arm rule: ${arm.critical_rules ?? "preserve one continuous shoulder-to-elbow-to-wrist-to-hand anatomy path"}.

ARM DISTORTION PREVENTION — NON-NEGOTIABLE
- Intended elbow range: ${anti.min_elbow_angle ?? 80}° to ${anti.max_elbow_angle ?? 130}°.
- Elbow ${elbowSupport}.
- Phone height: ${anti.phone_height_range ?? "eye level within natural reach"}.
- Forbidden geometry: ${list(anti.forbidden)}.
- The camera-holding arm, wrist, hand, fingertips, and phone remain completely OUTSIDE the finished crop in every car selfie. This is achieved by reachable composition, never by erasing, shortening, disconnecting, hiding behind impossible geometry, or amputating anatomy.
- The hidden holding arm must still be physically solvable from the visible shoulder position to the real phone location. Preserve subtle holding-side shoulder asymmetry when appropriate.
- No arm may pass through steering wheel, dashboard, seat, console, door, glass, headrest, roof, A-pillar, or the subject's torso.
- No impossible wrist reversal, fused fingers, duplicated hands, floating elbows, or shoulder dislocation.
- Do not force a 0.5x/fisheye look to fit the pose. Keep restrained near-field front-camera perspective.

CAR CONTACT PHYSICS
- Weight distribution: ${physics.weight_distribution ?? "pelvis and upper thighs supported by the real seat"}.
- Seat response: ${physics.seat_compression ?? "subtle natural body-weight compression only"}.
- Spine/neck/torso behavior: ${physics.spine ?? physics.neck ?? physics.torso_rotation ?? "natural and supported by the selected pose"}.
- Seatbelt: ${physics.seatbelt ?? "do not invent or reposition; use only when supported by IMAGE B or explicitly requested"}.
- Seat, headrest, window, door, mirror, sunroof, steering wheel, dashboard, console, and controls remain in the exact state shown by IMAGE B.
- Any visible free-hand contact produces believable finger placement, tiny pressure, and contact shadow on a real surface.

FINAL DRIVER-GEOMETRY GATE
Reject and correct the image if the phone position cannot be reached by a normal human arm from the seated shoulder location; if the holding arm would have to cross solid vehicle geometry; if the elbow support contradicts the real interior; if the seat/window/door state changes to accommodate the pose; or if the result becomes a third-person, mounted-camera, or passenger-held photograph.`;
}

function patchPromptEngine() {
  const proto = PromptEngine?.prototype;
  if (!proto || proto[patchFlag] || typeof proto.generate !== "function") return;

  const originalGenerate = proto.generate;
  proto.generate = function generateWithDriverGeometry(config = {}) {
    const result = originalGenerate.call(this, config);
    const pose = getActiveCarTemplate();
    if (!pose || pose.category !== "car" || typeof result !== "string") return result;

    const normalizedResult = result.replaceAll(LEGACY_CAR_REFERENCE_FILENAME, CURRENT_CAR_REFERENCE_FILENAME);
    const seatSolver = buildDriverSeatSolver(pose);
    const cameraGeometry = buildDriverSelfieGeometry(pose);
    return `${normalizedResult}\n\n${seatSolver}${cameraGeometry ? `\n\n${cameraGeometry}` : ""}\n\n${NATURAL_PHOTOGRAPHIC_REALISM}`.trim();
  };

  proto[patchFlag] = true;
}

patchPromptEngine();
