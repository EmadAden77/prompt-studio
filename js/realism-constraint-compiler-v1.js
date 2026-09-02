// REALISM CONSTRAINT COMPILER v1
// Resolves active authorities before generator-specific prompt adaptation.
// The compiler is intentionally deterministic: one active value per governed property.

export const REALISM_CONSTRAINT_COMPILER_VERSION = "1.0.0";

export const CONSTRAINT_LEVELS = Object.freeze({
  HARD:"HARD",
  STRUCTURAL:"STRUCTURAL",
  SOFT:"SOFT"
});

const HARD_FIELDS = Object.freeze([
  "referenceIdentity",
  "identityBoundAccessories",
  "captureType",
  "anatomy",
  "driverOccupancy"
]);

const STRUCTURAL_FIELDS = Object.freeze([
  "cameraReach",
  "contact",
  "occlusion",
  "lightingGeometry",
  "environmentContinuity"
]);

function isDriverState(state = {}) {
  const section = String(state.studioSection || "").toLowerCase();
  const scene = String(state.scene || "").toLowerCase();
  return String(state.carSeat || "") === "driver-left"
    && (section === "car" || /range.?rover|(?:^|[-_])car(?:[-_]|$)/u.test(scene));
}

function signed(value) {
  const n = Number(value) || 0;
  return `${n > 0 ? "+" : ""}${n}°`;
}

export function buildSpatialConstraintGraph(state = {}) {
  if (!isDriverState(state)) return "";
  return `[SPATIAL CONSTRAINT GRAPH — DRIVER OCCUPANCY / HARD]
Solve this graph as one continuous unmirrored LHD cabin before composition or aesthetics:
DRIVER_SEAT → supports → SUBJECT_PELVIS → aligns → SUBJECT_TORSO → behind → STEERING_WHEEL → connected_to → STEERING_COLUMN → in_front_of → INSTRUMENT_CLUSTER
SUBJECT_DRIVER → LEFT → DRIVER_DOOR / DRIVER_WINDOW / DRIVER_A_PILLAR
SUBJECT_DRIVER → RIGHT → CENTER_CONSOLE → PASSENGER_SEAT

The passenger seat must never support the subject. The center console must not separate the subject from the steering system. A visible wheel fragment alone is not proof of driver occupancy. Camera origin must remain inside the reachable arm volume of the subject seated in DRIVER_SEAT.`;
}

export function compileActiveCameraState(state = {}) {
  const driver = isDriverState(state);
  const distance = Number(state.selfieDistanceCm) || (driver ? 42 : 50);
  const yaw = Number(state.selfieYawDeg) || 0;
  const pitch = Number(state.selfiePitchDeg) || (driver ? -3 : 0);
  const roll = Number(state.selfieRollDeg) || 2;
  const faceYaw = Number(state.faceYawDeg) || 0;
  const composition = state.monitorComposition && state.monitorComposition !== "auto"
    ? state.monitorComposition
    : (state.composition || "close");
  return `[ACTIVE CAMERA STATE — SINGLE AUTHORITY]
Seat: ${driver ? "LEFT-FRONT DRIVER [HARD]" : (state.carSeat || "scene-defined")}
Capture: DIRECT FRONT-CAMERA SELFIE [HARD]
Distance: ${distance} cm
Phone yaw: ${signed(yaw)}
Phone pitch: ${signed(pitch)}
Phone roll: ${signed(roll)}
Face yaw: ${signed(faceYaw)}
Composition: ${composition}

These are the final active camera values. Earlier generic camera wording, presets or variation descriptions are descriptive history only and must not compete with this resolved vector.`;
}

export function buildConstraintHierarchy(state = {}) {
  const driverLine = isDriverState(state) ? "- Driver occupancy and LHD spatial graph [HARD]" : "";
  return `[CONSTRAINT HIERARCHY]
HARD — may never be traded for aesthetics:
- Reference identity and identity-bound accessories
- Capture type and physically coherent anatomy
${driverLine}
STRUCTURAL — must remain physically coherent:
- Camera reach, contact, occlusion, lighting geometry and environment continuity
SOFT — optimize only after HARD and STRUCTURAL pass:
- Imperfection amount, composition naturalness, smartphone processing and aesthetics

SCORING RULE: any failed HARD constraint caps the total realism score at 60/100. A beautiful image with a failed HARD constraint is still invalid.`.replace(/\n\n+/g,"\n\n");
}

export function buildLockedPromptEnhancerPolicy() {
  return `[LOCKED PROMPT ENHANCER]
Enhancement may improve clarity, attribute binding, spatial relationships, physical causality and generator comprehension only.
It has NO authority to modify reference identity, identity-bound accessories, apparent age, facial anatomy, selected clothing, selected expression, capture type, resolved camera state, scene authority, selected lighting or any locked field.
Do not add cinematic styling, beauty treatment, professional-camera behavior or decorative realism. If rewriting creates a conflict, preserve the higher constraint and delete the conflicting rewrite.`;
}

export function buildFailureDirectedRegenerationPolicy(state = {}) {
  const driver = isDriverState(state);
  return `[FAILURE-DIRECTED REGENERATION]
When validation reports a failure, preserve all passing HARD/locked fields and reconstruct only the failed dependency chain plus the minimum geometry required to make it coherent.
PRESERVE: identity, identity-bound accessories, selected clothing, expression when locked, scene/vehicle identity, lighting event and overall selfie intent.
${driver ? "DRIVER OCCUPANCY FAILURE TARGET: reconstruct driver seat → pelvis → torso → steering wheel → steering column → instrument cluster, plus console/right and driver-door/left anchors. Do not patch the error by pasting a steering-wheel fragment into the foreground." : "Do not globally redesign the scene to repair a local structural failure."}
Regeneration order: VALIDATE → DIAGNOSE → PRESERVE PASSING LOCKS → RECONSTRUCT FAILED CHAIN → VALIDATE AGAIN.`;
}

export function compileRealismConstraints(state = {}) {
  return [
    buildConstraintHierarchy(state),
    buildSpatialConstraintGraph(state),
    compileActiveCameraState(state),
    buildLockedPromptEnhancerPolicy(),
    buildFailureDirectedRegenerationPolicy(state)
  ].filter(Boolean).join("\n\n");
}

export function validateConstraintState(state = {}, checks = {}) {
  const driver = isDriverState(state);
  const hard = {
    referenceIdentity:checks.referenceIdentity !== false,
    identityBoundAccessories:checks.identityBoundAccessories !== false,
    captureType:checks.captureType !== false,
    anatomy:checks.anatomy !== false,
    driverOccupancy:driver ? checks.driverOccupancy !== false : true
  };
  const structural = Object.fromEntries(STRUCTURAL_FIELDS.map((key) => [key, checks[key] !== false]));
  const failedHard = HARD_FIELDS.filter((key) => hard[key] === false);
  const failedStructural = STRUCTURAL_FIELDS.filter((key) => structural[key] === false);
  const rawScore = Number.isFinite(Number(checks.score)) ? Math.max(0,Math.min(100,Number(checks.score))) : 100;
  const score = failedHard.length ? Math.min(60,rawScore) : rawScore;
  return {
    hard,
    structural,
    failedHard,
    failedStructural,
    score,
    valid:failedHard.length === 0,
    regenerationRequired:failedHard.length > 0 || failedStructural.length > 0
  };
}
