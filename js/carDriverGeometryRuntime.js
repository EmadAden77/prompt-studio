import { PromptEngine } from "./engines/promptEngine.js";
import { getActiveCarTemplate } from "./carTemplates.js";

const patchFlag = Symbol.for("promptStudio.carDriverGeometryRuntime.patched");

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
    if (!pose || pose.category !== "car" || !pose.camera_geometry || typeof result !== "string") return result;

    return `${result}\n\n${buildDriverSelfieGeometry(pose)}\n\n${NATURAL_PHOTOGRAPHIC_REALISM}`.trim();
  };

  proto[patchFlag] = true;
}

patchPromptEngine();
