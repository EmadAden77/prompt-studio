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

const CAR_ARM_GEOMETRY = Object.freeze({
  driver_classic: `CLASSIC CABIN ARM GEOMETRY
- RIGHT hand rests lightly on the steering wheel around 8 o'clock with relaxed fingers and zero steering effort.
- LEFT hand holds the phone at roughly 35–50cm, near eye level; the left elbow uses the real center-console/armrest or another reachable support surface.
- A small portion of the left forearm/phone-side shoulder may enter an extreme edge and appear modestly enlarged by near-field perspective.
- Gaze goes into the front-camera lens. Use about 3 degrees of natural handheld roll.`,
  driver_low_angle: `LOW-ANGLE CABIN ARM GEOMETRY
- Phone sits around lower-chest to chest level within normal cabin reach and points upward roughly 30–40 degrees only if anatomy and dashboard clearance allow it.
- Chin lowers slightly toward the lens; headliner may enter the upper edge.
- The holding forearm may occupy a small lower-edge foreground area with modest near-field enlargement and mild micro-motion softness.
- Elbow is supported on thigh/console where physically reachable. Gaze goes into the lens.`,
  driver_high_angle: `HIGH-ANGLE CABIN ARM GEOMETRY
- Phone is raised above eye level within a real confined-cabin reach. Target about 45–55cm; if the requested composition would require more reach, loosen the crop or reduce the angle instead of lengthening the arm.
- Holding-side shoulder rises visibly but naturally; elbow may open toward roughly 145–165 degrees without locking or intersecting the roof/A-pillar.
- Dashboard and wheel become more prominent below; face can sit in the upper third. Gaze goes upward into the lens.`,
  driver_side_angle: `SIDE-ANGLE CABIN ARM GEOMETRY
- Phone approaches from a side-biased angle, roughly 35–45 degrees off frontal, at about 40–55cm only if reachable.
- Holding elbow is supported on the real center console/armrest when possible.
- Passenger-seat context may appear behind the subject according to the real cabin geometry.
- Face remains three-quarter, pelvis stays planted in the driver seat, and gaze goes into the lens.`,
  driver_mirror_check: `MIRROR-CHECK CABIN ARM GEOMETRY
- Head turns only about 30–40 degrees toward the REAL rearview mirror while torso/pelvis remain seat-aligned.
- Phone stays lower, around chest level, within natural reach; holding elbow supported on a real cabin surface.
- CANDID GAZE EXCEPTION: eyes look at the rearview mirror, not the lens.
- Rearview mirror shows ONLY the rear cabin/rear scene consistent with the vehicle; it must never show the selfie phone or invent a second camera.`,
  driver_window_lean: `WINDOW-SIDE LEAN CABIN ARM GEOMETRY
- Preserve the exact window state shown by IMAGE B. Do NOT open, close, lower, raise, or remove glass to accommodate the pose.
- The free LEFT forearm may rest on the real door armrest/window-side support surface only where that surface exists.
- RIGHT hand holds the phone about 35–50cm from the face; right elbow uses console/thigh support when reachable.
- Outside context is seen only through the real window state. Gaze goes into the lens.`,
  driver_two_hand_wheel: `TWO-HAND PHONE ABOVE WHEEL — PARKED ONLY
- Vehicle remains fully parked and stationary.
- Both forearms/elbows may lightly brace on the top region of the real steering wheel if the wheel height and body geometry permit.
- BOTH hands hold the phone just above the wheel rim; the phone itself is behind the front-camera optical center and therefore not directly visible.
- No hand is simultaneously gripping the wheel and phone. Do not duplicate hands. Zero arm stretch; gaze goes into the lens.`,
  driver_wheel_prominent: `WHEEL-PROMINENT PARKED SELFIE
- Keep the real steering wheel large and readable in the lower foreground while the phone remains subject-held and physically reachable.
- If both forearms can lightly brace near the wheel top without intersecting the rim, allow that support; otherwise use one camera hand and one relaxed free hand on the wheel.
- Never convert this into a mounted-phone, dashcam, or third-person view.`,
  driver_relaxed_recline: `RELAXED SEAT SELFIE
- Preserve the exact seatback recline shown by IMAGE B. Do NOT change the seatback to 15–20 degrees unless that is already the real reference state.
- Head may rest naturally against the real headrest; phone sits above chest within natural reach and may look down about 15–20 degrees.
- Holding elbow uses a real armrest/console/thigh support where reachable. Gaze goes up into the lens.`,
  car_driver_relaxed: `RELAXED PARKED DRIVER
- Preserve seat-wheel-body alignment. One hand holds the phone within 35–50cm; the other rests on thigh, console, or wheel.
- Allow only a small edge-near portion of the camera-side forearm/shoulder when composition requires it.`,
  car_driver_wheel_rest: `PARKED DRIVER — FREE HAND ON WHEEL
- Camera hand stays within natural reach; free hand rests lightly on the real wheel without steering effort.
- Near-field arm enlargement may occur only at an extreme frame edge and only on the camera side.`,
  car_driver_console_rest: `PARKED DRIVER — CONSOLE SUPPORT
- Camera-side elbow/forearm uses the real console/armrest where reachable. Do not float the elbow or move the console.
- Free arm rests naturally on thigh/console.`,
  car_driver_side_glance: `PARKED DRIVER — SIDE GLANCE
- Camera remains handheld inside the cabin. Head/eyes may glance toward side context then return near the lens; torso rotation remains within the seat-solver limit.`,
  car_driver_close: `CLOSE PARKED DRIVER SELFIE
- Keep phone within natural cabin reach; use tighter face/shoulder framing instead of lengthening the arm.
- A tiny portion of camera-side shoulder may enlarge near an edge; do not introduce a giant forearm.`,
  car_driver_high_angle: `MILD HIGH PARKED DRIVER SELFIE
- Raise phone only within the roof boundary and normal shoulder reach. If more height is needed, loosen crop rather than extending the limb.`,
  car_driver_low_angle: `MILD LOW PARKED DRIVER SELFIE
- Lower phone modestly toward chest level; keep elbow/thigh/console support physically plausible and dashboard clearance intact.`,
  car_driver_sunroof: `SUNROOF-CONTEXT PARKED SELFIE
- Use the real sunroof only as background context. Camera remains subject-held; never enlarge or alter roof geometry to fit the frame.`,
  car_driver_pre_exit: `PRE-EXIT PARKED SELFIE
- Stay fully seated; door remains exactly as in IMAGE B. Camera remains subject-held inside the cabin with only a small natural body turn.`,
  car_driver_candid_pause: `CANDID PARKED SELFIE
- Use mild handheld roll and off-center framing; preserve a reachable camera-hand path and ordinary relaxed free-hand contact.`
});

function list(value) {
  return Array.isArray(value) && value.length ? value.join(", ") : "none beyond the general physical rules";
}

function buildDriverSeatSolver(pose) {
  if (!pose || pose.category !== "car") return "";

  return `DRIVER OCCUPANCY LOCK — HARD SPATIAL AUTHORITY
The subject is physically occupying the actual LEFT-FRONT DRIVER SEAT of a LEFT-HAND-DRIVE vehicle. This is a 3D occupancy constraint, not merely a left/right labeling rule. Solve seat and vehicle geometry BEFORE pose styling and BEFORE camera placement.

DRIVER SEAT SOLVER — CAMERA LAST
1. DRIVER-SEAT OCCUPANCY FIRST
- The driver's pelvis is centered on the actual left-front driver-seat cushion.
- The driver's spine, sternum and torso rise from that same driver-seat centerline.
- The seatback and headrest supporting the subject belong to this same driver seat, never the passenger seat.
- The passenger seat is across the center console and must never visually support the subject.

2. STEERING SYSTEM AXIS
- The steering-column axis projects toward the centerline of the driver's torso.
- The steering wheel is physically in front of the driver's lower chest/upper abdomen, never beside the body.
- The instrument cluster is farther forward, directly behind the steering wheel.
- Never use a detached or floating steering-wheel fragment as proof of driver occupancy.
- Any visible steering-wheel arc must belong to the real wheel/column/dashboard depth chain.

3. LATERAL CABIN ANCHORS
- The center console begins immediately beside the driver's RIGHT hip and continues forward on the driver's RIGHT side.
- The driver door, driver window and driver-side A-pillar are immediately beside the driver's LEFT shoulder.
- Do not infer seat position from screen-left or screen-right. Construct the unmirrored LHD cabin in physical vehicle coordinates first.

4. LEGS BEFORE TORSO
- Solve pelvis, thighs, knees, and footwell direction before rotating the upper body.
- Thighs project forward/downward toward the real pedal area beneath the steering wheel.
- Knees remain directionally consistent with the hips and vehicle centerline; they must not stretch sideways toward the passenger seat or door.
- If legs are cropped, their hidden continuation must still point toward the driver footwell.

5. TORSO / HEAD
- Torso rotation toward the selfie camera is limited to a natural approximately 20–30 degrees at the waist/ribcage, with additional small neck/eye turn as needed.
- A 90-degree chest rotation while the pelvis remains driving-forward is forbidden.
- The real driver headrest stays centered behind the subject's head/upper neck on the same seat centerline.
- Never move the headrest to make an incorrect seat look plausible.

6. CAMERA ORIGIN
- The smartphone front camera is held by the driver himself and must remain inside the reachable arm-volume originating from the shoulder of the body seated in this exact driver seat.
- The camera must NOT originate from the passenger seat, center console, dashboard, windshield, outside the vehicle, a mount, or a third-person photographer.
- Camera placement adapts to solved driver occupancy. Driver occupancy never adapts to a prettier camera angle.

7. ARMS / CONTACT / CLOTHING
- Every arm follows one continuous shoulder→upper-arm→elbow→forearm→wrist→hand path.
- The non-camera arm may rest on the real console, thigh, door armrest, or steering wheel only where a real contact surface exists.
- Both sleeves retain the same intentional garment state; folds differ only because of pose/contact.
- Seat cushion and seatback show subtle body-weight compression only.

MANDATORY DRIVER PROOF — TWO-ANCHOR RULE
The crop must contain enough connected geometry to prove the subject is behind the steering system, not merely next to a wheel.
A. Required: steering wheel / steering-column geometry physically centered in front of the subject's torso.
B. Plus at least one coherent lateral anchor: center-console boundary immediately beside the subject's right side OR driver-door/window/A-pillar geometry immediately beside the subject's left shoulder.
A steering-wheel rim alone is NOT sufficient proof.
If a tight crop cannot preserve these anchors, slightly widen or lower the crop while preserving the same subject-held camera origin. Correct driver occupancy outranks an artificially tight crop.

FINAL SPATIAL CHAIN
The following must exist as one continuous 3D relationship:
DRIVER SEAT → SUBJECT PELVIS → SUBJECT TORSO → STEERING WHEEL → STEERING COLUMN → INSTRUMENT CLUSTER.
The center console must remain beside the driver's right hip and the driver door beside the driver's left shoulder.

HARD FAIL — REJECT AND RECONSTRUCT
- subject visually supported by the passenger seat;
- center console separates the subject from the steering wheel;
- steering wheel beside the subject instead of in front;
- steering wheel appears only as an unrelated foreground fragment;
- pelvis centered in one seat while chest aligns to another seat's wheel;
- headrest belongs visually to the wrong seat;
- right-hand-drive or horizontally mirrored cabin geometry;
- camera viewpoint requiring the phone to originate from the passenger side;
- knees/thighs inconsistent with driver footwell;
- arm emerging from mid-torso or passing through cabin geometry;
- any seat, wheel, console, headrest, door, or window moved to accommodate the pose.

PRIORITY RULE
DRIVER OCCUPANCY is a hard constraint. If the selected pose, close crop, variation, camera angle or aesthetic preference conflicts with it, modify the lower-priority element. Never sacrifice the driver-seat/body/steering-system chain.`;
}

function buildCabinSelfieLock(pose) {
  if (!pose || pose.category !== "car") return "";
  const specific = CAR_ARM_GEOMETRY[pose.id] ?? `DEFAULT CAR ARM GEOMETRY
- One hand holds the phone within normal confined-cabin reach while the other rests on a real support surface.
- A small edge-near camera-side forearm/shoulder segment may appear when physically required; never invent limb length.`;

  return `XIAOMI 15 ULTRA FRONT-CAMERA CABIN SELFIE LOCK — ALL CAR TEMPLATES
VIEWPOINT — NON-NEGOTIABLE
- This image IS a selfie taken BY the subject himself with the Xiaomi 15 Ultra FRONT camera.
- The ONLY camera viewpoint is the real phone in the subject's hand inside the cabin.
- FORBIDDEN: dashcam, mounted phone, dashboard camera, camera outside the car, through-glass observer shot, drone, tripod, third-person photographer, passenger-held camera, rear-camera look, telephoto portrait viewpoint.

FRONT-WIDE LENS BEHAVIOR — 22–24MM EQUIVALENT, APPROX F/2.0
- Mild near-field magnification is visible only where geometry justifies it: the camera-side shoulder and any edge-near forearm segment may appear slightly larger because they are closer to the lens.
- Face center may protrude mildly in the ordinary way of a close front-wide selfie; never caricature the nose or skull.
- Straight cabin lines such as A-pillar, window frame, dashboard edge, and wheel rim remain mostly straight through the main image and may bend subtly only at extreme edges. No global barrel/fisheye warp.

REACH PHYSICS
- Normal confined-cabin selfie reach is approximately 35–50cm from face to phone.
- Solve a real shoulder→upper-arm→elbow→forearm→wrist→hand path first. Use console, door armrest, thigh, or wheel-top support only when physically reachable.
- If a requested angle needs more reach, LOOSEN THE CROP, reduce the angle, or move the phone closer within the same cabin. Never lengthen the arm, add a shoulder, detach an elbow, or move solid cabin geometry.

HANDHELD CAPTURE EVIDENCE
- Use a small natural frame roll around 2–4 degrees unless the selected pose physically calls for a straighter frame.
- Keep the subject slightly off-center rather than mechanically centered.
- Keep the face as the primary focus target. If an edge-near forearm/hand is moving slightly during capture, allow tiny physically plausible micro-motion softness there while the face remains sharper. Do not manufacture decorative blur.
- Dark headliner/corner regions may retain modest sensor noise, denoising texture, and compression artifacts appropriate to the selected exposure.

EYES & SCREEN
- When phone-screen brightness and eye angle physically support it, allow tiny soft rectangular/rounded-rect screen catchlights in both eyes, consistent in position and perspective. Do not paste bright rectangles if the selected lighting would overpower them.
- The phone screen may contribute only a WEAK cool frontal fill, subordinate to the selected real lighting event and processed through the same exposure/white-balance solution.

PHONE & MIRROR VISIBILITY
- The phone body sits behind the front-camera optical center and is NOT directly visible in the image.
- A faint, low-contrast reflection of the raised arm/phone MAY appear on glossy console trim or side glass only when reflection geometry actually supports it.
- The rearview mirror shows ONLY the real rear-cabin/rear scene. NEVER place the selfie phone in the rearview mirror.
- Side mirrors show the physically consistent scene behind/alongside the parked vehicle, never a duplicated subject or impossible camera.

SINGLE PHONE PIPELINE
- Face, hair, clothing, cabin, glass, mirrors, and outside parking/street context share one exposure event, one HDR behavior, one white balance, one focus/depth solution, one sensor-noise character, one sharpening/denoising behavior, and one compression pipeline.
- Outside context is never cleaner, sharper, differently lit, or processed like a second photograph.

PER-POSE CABIN GEOMETRY
${specific}`;
}

function buildDriverSelfieGeometry(pose) {
  if (!pose || pose.category !== "car" || !pose.camera_geometry || !pose.arm_strategy) return "";
  const anti = pose.anti_distortion ?? {};
  const arm = pose.arm_strategy ?? {};
  const camera = pose.camera_geometry ?? {};
  const physics = pose.physics ?? {};
  const elbowSupport = anti.elbow_must_be_supported
    ? "MUST be physically supported by the specified real surface when that surface is reachable"
    : "may be unsupported only where the pose explicitly requires a reachable upward arm extension";

  return `DRIVER SELFIE GEOMETRY — XIAOMI 15 ULTRA FRONT CAMERA
IMPORTANT: apply this camera geometry only AFTER DRIVER OCCUPANCY LOCK and CABIN SELFIE LOCK have been solved. Camera placement must adapt to the solved body, not the reverse.
- Template: ${pose.name_en ?? pose.name_ar}.
- Camera: Xiaomi 15 Ultra front-facing camera only; app optical model ${camera.focal_length ?? "22-24mm equivalent"}, ${camera.aperture ?? "approximately f/2.0"}.
- Selfie distance: ${camera.distance ?? "35-55cm"}. If this conflicts with the cabin reach lock, obey the cabin reach lock and loosen crop rather than lengthen the arm.
- Camera angle: ${camera.angle ?? "reachable front-camera angle"}.
- Composition: ${camera.frame_composition ?? "face primary with enough immutable car context to prove the same vehicle"}.
- Holding side: ${arm.holding_hand ?? "one hand"}; phone position: ${arm.position ?? "within natural selfie reach"}.
- Holding-arm support: ${arm.support ?? "use a real reachable support surface when required"}.
- Non-camera arm: ${arm.other_arm ?? "rests naturally on a real surface"}.
- Critical arm rule: ${arm.critical_rules ?? "preserve one continuous shoulder-to-elbow-to-wrist-to-hand anatomy path"}.

ARM DISTORTION PREVENTION — NON-NEGOTIABLE
- Intended elbow range: ${anti.min_elbow_angle ?? 80}° to ${anti.max_elbow_angle ?? 130}° where compatible with the selected pose and cabin lock.
- Elbow ${elbowSupport}.
- Phone height: ${anti.phone_height_range ?? "eye level within natural reach"}.
- Forbidden geometry: ${list(anti.forbidden)}.
- A small, continuous camera-side shoulder/forearm/hand segment may enter an extreme edge only when the selected car pose physically requires it. The phone itself remains directly invisible.
- Never use bone elongation, rubber-arm deformation, an extra shoulder, duplicated hands, or global fisheye warp to create near-field perspective.
- No arm may pass through steering wheel, dashboard, seat, console, door, glass, headrest, roof, A-pillar, or the subject's torso.

CAR CONTACT PHYSICS
- Weight distribution: ${physics.weight_distribution ?? "pelvis and upper thighs supported by the real driver seat"}.
- Seat response: ${physics.seat_compression ?? "subtle natural body-weight compression only"}.
- Spine/neck/torso behavior: ${physics.spine ?? physics.neck ?? physics.torso_rotation ?? "natural and supported by the selected pose"}.
- Seatbelt: ${physics.seatbelt ?? "do not invent or reposition; use only when supported by IMAGE B or explicitly requested"}.
- Seat, headrest, window, door, mirror, sunroof, steering wheel, dashboard, console, and controls remain in the exact state shown by IMAGE B.

FINAL DRIVER-OCCUPANCY GATE — HARD FAIL
Before accepting the composition, verify the continuous chain DRIVER SEAT → PELVIS → TORSO → STEERING WHEEL → STEERING COLUMN → INSTRUMENT CLUSTER and preserve at least one lateral anchor: console beside the driver's right hip or driver door/window/A-pillar beside the left shoulder. A visible steering-wheel fragment by itself does not pass validation. Reject and reconstruct any passenger-seat occupancy, wheel-beside-body geometry, mirrored/RHD mapping, passenger-origin camera, or disconnected steering-wheel token. If occupancy cannot be proved in the selected crop, loosen/lower the crop rather than faking a wheel fragment.`;
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
    const cabinLock = buildCabinSelfieLock(pose);
    const cameraGeometry = buildDriverSelfieGeometry(pose);
    return `${normalizedResult}\n\n${seatSolver}\n\n${cabinLock}${cameraGeometry ? `\n\n${cameraGeometry}` : ""}\n\n${NATURAL_PHOTOGRAPHIC_REALISM}`.trim();
  };
  proto[patchFlag] = true;
}

patchPromptEngine();
