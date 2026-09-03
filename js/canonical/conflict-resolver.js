import { resolveAuthorityClaims } from "./authority-resolver.js";

const SCENE_FACT_TARGETS = Object.freeze({
  identity: "identity_reference",
  capture: "capture_contract",
  subjects: "explicit_user",
  camera: "camera_contract",
  camera_geometry: "camera_contract",
  lighting: "lighting_contract",
  vehicle_geometry: "hard_constraint",
  anatomy: "hard_constraint",
  realism: "realism_resolver",
  aesthetic: "aesthetic_preference",
  drive_configuration: "hard_constraint",
  driver_position: "hard_constraint",
  steering_relation: "hard_constraint",
  cluster_relation: "hard_constraint",
  console_relation: "hard_constraint",
  door_window_relation: "hard_constraint",
  coordinate_system: "hard_constraint",
  mirror_may_swap_physical_sides: "hard_constraint"
});

const SELFIE_CAMERA_KEYS = Object.freeze([
  "selfieAngle",
  "composition",
  "selfieDistanceCm",
  "selfieYawDeg",
  "selfiePitchDeg",
  "selfieRollDeg",
  "visualSelfieMonitor"
]);

const DIRECT_VEHICLE_CLAIMS = Object.freeze({
  driveConfiguration: "vehicle.drive_configuration",
  driverPosition: "vehicle.driver_position",
  steeringRelation: "vehicle.steering_relation",
  clusterRelation: "vehicle.cluster_relation",
  consoleRelation: "vehicle.console_relation",
  doorWindowRelation: "vehicle.door_window_relation",
  coordinateSystem: "vehicle.coordinate_system",
  mirrorMaySwapPhysicalSides: "vehicle.mirror_may_swap_physical_sides"
});

function deepClone(value) {
  if (value === undefined) return undefined;
  if (typeof structuredClone === "function") {
    try { return structuredClone(value); } catch { /* fall through */ }
  }
  return JSON.parse(JSON.stringify(value));
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clamp(number, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, number));
}

function isAccidental(raw) {
  const captureType = cleanString(raw.captureType).toLowerCase();
  return cleanString(raw.studioSection).toLowerCase() === "accidental"
    || cleanString(raw.captureMode).toLowerCase() === "accidental"
    || captureType.includes("accidental");
}

function hasReference(raw) {
  return raw.hasReference === true || Boolean(cleanString(raw.referenceId));
}

function pushResolution(target, claims, expectedOwners = undefined) {
  const result = resolveAuthorityClaims(claims, expectedOwners ? { expectedOwners } : undefined);
  target.conflicts.push(...result.conflicts);
  target.rejected_claims.push(...result.rejected_claims);
  Object.assign(target.authority_owners, result.owners);
}

function resolveSceneClaims(raw, sceneData, state) {
  if (!isObject(sceneData)) return;

  for (const key of Object.keys(sceneData)) {
    const targetOwner = SCENE_FACT_TARGETS[key];
    if (!targetOwner) continue;
    const resolvedOwner = key === "identity" && !hasReference(raw) ? "explicit_user" : targetOwner;
    const property = `scene.facts.${key}`;
    pushResolution(state, [
      { field: property, owner: resolvedOwner, source: "canonical owner" },
      { field: property, owner: "scene_contract", source: "scene.facts", value: sceneData[key] }
    ], { [property]: resolvedOwner });
    state.scene_leakage_detected = true;
  }
}

function resolveIdentityClaims(raw, cleanInput, state) {
  if (!hasReference(raw) || !cleanString(raw.identityNotes)) return;
  pushResolution(state, [
    { field: "identity", owner: "identity_reference", source: "identity reference" },
    { field: "identity", owner: "explicit_user", source: "identityNotes", value: raw.identityNotes }
  ]);
  delete cleanInput.identityNotes;
}

function resolveAccidentalCameraClaims(raw, cleanInput, state) {
  if (!isAccidental(raw)) return;
  const present = SELFIE_CAMERA_KEYS.filter((key) => raw[key] !== undefined && raw[key] !== null && raw[key] !== "");
  if (!present.length) return;

  pushResolution(state, [
    { field: "capture.accidental_vs_selfie_camera", owner: "capture_contract", source: "accidental capture" },
    { field: "capture.accidental_vs_selfie_camera", owner: "camera_contract", source: present.join(",") }
  ]);

  for (const key of present) delete cleanInput[key];
}

function resolveCameraEnvelope(raw, cleanInput, state) {
  if (isAccidental(raw)) return;
  const limits = {
    selfieDistanceCm: [35, 80],
    selfieYawDeg: [-45, 45],
    selfiePitchDeg: [-25, 25],
    selfieRollDeg: [-10, 10]
  };

  for (const [key, [minimum, maximum]] of Object.entries(limits)) {
    if (raw[key] === undefined || raw[key] === null || raw[key] === "") continue;
    const number = finiteNumber(raw[key]);
    if (number === null) continue;
    const resolved = clamp(number, minimum, maximum);
    if (resolved === number) continue;

    const field = `camera.geometry.${key}`;
    const result = resolveAuthorityClaims([
      { field, owner: "hard_constraint", source: "physical envelope", value: resolved, resolution: "physical_feasibility" },
      { field, owner: "camera_contract", source: "requested camera geometry", value: number }
    ]);
    for (const conflict of result.conflicts) conflict.resolution = "physical_feasibility";
    state.conflicts.push(...result.conflicts);
    state.rejected_claims.push(...result.rejected_claims);
    Object.assign(state.authority_owners, result.owners);
    cleanInput[key] = resolved;
  }
}

function resolveVehicleClaims(raw, cleanInput, state) {
  for (const [key, field] of Object.entries(DIRECT_VEHICLE_CLAIMS)) {
    if (raw[key] === undefined || raw[key] === null || raw[key] === "") continue;
    pushResolution(state, [
      { field, owner: "hard_constraint", source: "vehicle geometry lock" },
      { field, owner: "explicit_user", source: key, value: raw[key] }
    ]);
    delete cleanInput[key];
  }
}

function resolveInjectedAuthorityClaims(raw, cleanInput, state) {
  if (!Array.isArray(raw.authorityClaims)) return;
  const result = resolveAuthorityClaims(raw.authorityClaims);
  state.conflicts.push(...result.conflicts);
  state.rejected_claims.push(...result.rejected_claims);
  Object.assign(state.authority_owners, result.owners);
  state.invalid_claims.push(...result.invalid_claims);
  delete cleanInput.authorityClaims;
}

function dedupeConflicts(conflicts) {
  const seen = new Set();
  return conflicts.filter((item) => {
    const key = `${item.property}|${item.winner}|${item.loser}|${item.resolution}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Pre-build conflict resolution for Canonical V3.
 * The returned cleanInput can be passed directly to buildCanonicalV3().
 * sceneData remains inert/read-only evidence; it is never promoted to a higher authority.
 */
export function resolveCanonicalConflicts(rawInput = {}, sceneData = undefined) {
  const raw = isObject(rawInput) ? rawInput : {};
  const cleanInput = deepClone(raw);
  const facts = isObject(sceneData) ? sceneData : (isObject(raw.sceneFacts) ? raw.sceneFacts : {});
  const state = {
    conflicts: [],
    rejected_claims: [],
    invalid_claims: [],
    authority_owners: {},
    scene_leakage_detected: false
  };

  resolveSceneClaims(raw, facts, state);
  resolveIdentityClaims(raw, cleanInput, state);
  resolveAccidentalCameraClaims(raw, cleanInput, state);
  resolveCameraEnvelope(raw, cleanInput, state);
  resolveVehicleClaims(raw, cleanInput, state);
  resolveInjectedAuthorityClaims(raw, cleanInput, state);

  const conflicts = dedupeConflicts(state.conflicts);
  return {
    cleanInput,
    conflicts,
    authority_collisions: conflicts.length,
    authority_owners: { ...state.authority_owners },
    rejected_claims: deepClone(state.rejected_claims),
    invalid_claims: deepClone(state.invalid_claims),
    scene_leakage_detected: state.scene_leakage_detected
  };
}

export default resolveCanonicalConflicts;
