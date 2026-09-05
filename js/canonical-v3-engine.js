import { HOUR_TO_MOOD } from "./data.js";

const SCHEMA_VERSION = "realistic-image-generator/canonical-v3";
const INTENT_TYPES = Object.freeze(["selfie", "car", "group", "accidental", "room"]);
const INTENT_SET = new Set(INTENT_TYPES);
const FALLBACK_THRESHOLD = 0.6;
const INTENT_TIE_BREAK = Object.freeze(["accidental", "group", "car", "room", "selfie"]);
const INTENT_SOURCE_ORDER = Object.freeze([
  "explicit_user",
  "explicit_ui",
  "capture_evidence",
  "scene_evidence",
  "deterministic_fallback"
]);
const STREET_MOOD_SET = new Set(["dawn","rush","normal","school","prayer","cafe","latenight","dust","souq","event","alley","construction","bufia"]);

export const CANONICAL_V3_AUTHORITY_PRIORITY = Object.freeze([
  Object.freeze({ owner: "hard_constraint", priority: 100 }),
  Object.freeze({ owner: "identity_reference", priority: 90 }),
  Object.freeze({ owner: "explicit_user", priority: 80 }),
  Object.freeze({ owner: "scene_contract", priority: 70 }),
  Object.freeze({ owner: "capture_contract", priority: 60 }),
  Object.freeze({ owner: "camera_contract", priority: 50 }),
  Object.freeze({ owner: "lighting_contract", priority: 40 }),
  Object.freeze({ owner: "realism_resolver", priority: 30 }),
  Object.freeze({ owner: "generator_adapter", priority: 20 }),
  Object.freeze({ owner: "aesthetic_preference", priority: 10 })
]);

const PRIORITY_BY_OWNER = Object.freeze(Object.fromEntries(
  CANONICAL_V3_AUTHORITY_PRIORITY.map(({ owner, priority }) => [owner, priority])
));

const IDENTITY_PRESERVE_FIELDS = Object.freeze([
  "facial_structure",
  "head_shape",
  "apparent_age",
  "skin_identity",
  "skin_tone",
  "natural_asymmetry",
  "eyes",
  "eyebrows",
  "nose",
  "lips",
  "jaw",
  "chin",
  "ears",
  "hairline",
  "hair_density",
  "hair_texture",
  "facial_hair_pattern",
  "moustache_pattern",
  "reference_linked_eyewear"
]);

const SCENE_DESCRIPTIONS = Object.freeze({
  rangeRover: "inside a stationary 2017 Range Rover Sport Autobiography Dynamic (L494) in Fuji White with coherent left-hand-drive geometry",
  my_bedroom_text: "the fixed referenced bedroom",
  bedroom: "an ordinary lived-in bedroom",
  street: "an ordinary outdoor street or parking environment",
  gym: "an ordinary gym environment",
  custom: "a user-defined scene"
});

const SCENE_FACT_AUTHORITY_TARGETS = Object.freeze({
  identity: "identity_reference",
  scene: "scene_contract",
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

function deepClone(value) {
  if (value === undefined) return undefined;
  if (typeof structuredClone === "function") {
    try { return structuredClone(value); } catch { /* fall through */ }
  }
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function cleanString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const result = value.trim();
  return result || fallback;
}

function finiteNumber(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, minimum, maximum, fallback = null) {
  const number = finiteNumber(value, fallback);
  if (number === null) return null;
  return Math.min(maximum, Math.max(minimum, number));
}

function boundedOrNull(value, minimum, maximum) {
  const number = finiteNumber(value, null);
  if (number === null || number < minimum || number > maximum) return null;
  return number;
}

export function hourToMood(hour) {
  const numeric = Number(hour);
  if (!Number.isInteger(numeric) || numeric < 0 || numeric > 23) return "normal";
  return HOUR_TO_MOOD[numeric] ?? "normal";
}

function normalizeIntentName(value) {
  const key = cleanString(value).toLowerCase().replace(/[\s-]+/g, "_");
  const aliases = {
    selfie: "selfie",
    direct_selfie: "selfie",
    front_camera_selfie: "selfie",
    car: "car",
    vehicle: "car",
    driver: "car",
    driver_selfie: "car",
    group: "group",
    group_selfie: "group",
    accidental: "accidental",
    accidental_capture: "accidental",
    room: "room",
    bedroom: "room"
  };
  return aliases[key] ?? (INTENT_SET.has(key) ? key : null);
}

function sectionIntent(raw) {
  const section = cleanString(raw.studioSection).toLowerCase();
  if (section === "car") return "car";
  if (section === "group") return "group";
  if (section === "accidental") return "accidental";
  if (section === "bedroom" || section === "room") return "room";
  if (section === "selfie") return "selfie";
  return null;
}

function captureEvidence(raw) {
  const intents = [];
  if (cleanString(raw.captureMode).toLowerCase() === "accidental") intents.push("accidental");
  if (cleanString(raw.groupMode).toLowerCase() === "group") intents.push("group");
  const captureType = cleanString(raw.captureType).toLowerCase();
  if (captureType.includes("accidental")) intents.push("accidental");
  if (captureType.includes("group")) intents.push("group");
  if (captureType.includes("driver") || captureType.includes("car")) intents.push("car");
  if (captureType.includes("selfie") || raw.mirrorSelfie === true || cleanString(raw.mode).toLowerCase() === "mirror") intents.push("selfie");
  return [...new Set(intents)];
}

function sceneEvidence(raw) {
  const scene = cleanString(raw.scene).toLowerCase();
  if (/range.?rover|vehicle|(?:^|[-_])car(?:[-_]|$)/u.test(scene)) return "car";
  if (/bedroom|room/u.test(scene)) return "room";
  if (scene) return "selfie";
  return null;
}

function routeIntent(raw) {
  const evidence = [];
  const explicit = normalizeIntentName(raw.intentType ?? raw.intent);
  if (explicit) evidence.push({ intent: explicit, source: "explicit_user", score: 1, reason: "explicit intent selection" });

  const ui = sectionIntent(raw);
  if (ui) evidence.push({ intent: ui, source: "explicit_ui", score: 0.95, reason: "active UI section" });

  for (const intent of captureEvidence(raw)) {
    evidence.push({ intent, source: "capture_evidence", score: 0.85, reason: "capture-specific fields" });
  }

  const scene = sceneEvidence(raw);
  if (scene) evidence.push({ intent: scene, source: "scene_evidence", score: 0.7, reason: "selected scene" });

  const sourceRank = Object.fromEntries(INTENT_SOURCE_ORDER.map((source, index) => [source, index]));
  const tieRank = Object.fromEntries(INTENT_TIE_BREAK.map((intent, index) => [intent, index]));
  const sorted = [...evidence].sort((a, b) => {
    const sourceDelta = sourceRank[a.source] - sourceRank[b.source];
    if (sourceDelta !== 0) return sourceDelta;
    const scoreDelta = b.score - a.score;
    if (scoreDelta !== 0) return scoreDelta;
    return tieRank[a.intent] - tieRank[b.intent];
  });

  const chosen = sorted[0] ?? null;
  const distinct = new Set(evidence.map((item) => item.intent));
  const ambiguous = distinct.size > 1 || !chosen || chosen.score < FALLBACK_THRESHOLD;
  const fallbackApplied = !chosen || chosen.score < FALLBACK_THRESHOLD;

  return {
    type: fallbackApplied ? "selfie" : chosen.intent,
    confidence: fallbackApplied ? FALLBACK_THRESHOLD : chosen.score,
    source: fallbackApplied ? "deterministic_fallback" : chosen.source,
    ambiguous,
    evidence,
    fallback: {
      applied: fallbackApplied,
      confidence_threshold: FALLBACK_THRESHOLD,
      default_intent: "selfie",
      selection_order: [...INTENT_SOURCE_ORDER],
      tie_break_order: [...INTENT_TIE_BREAK],
      reason: fallbackApplied ? "No supported intent evidence reached the 0.6 confidence threshold." : null
    }
  };
}

function authority(owner, adapterCanModify = false) {
  return {
    owner,
    priority: PRIORITY_BY_OWNER[owner],
    adapter_can_modify: adapterCanModify
  };
}

function buildAuthorities(hasReference) {
  return {
    identity: authority(hasReference ? "identity_reference" : "explicit_user"),
    scene: authority("scene_contract"),
    capture: authority("capture_contract"),
    subjects: authority("explicit_user"),
    camera: authority("camera_contract"),
    lighting: authority("lighting_contract"),
    vehicle_geometry: authority("hard_constraint"),
    anatomy: authority("hard_constraint"),
    realism: authority("realism_resolver"),
    aesthetic: authority("aesthetic_preference")
  };
}

function conflict(property, winner, loser, resolution = "higher_authority") {
  return { property, winner, loser, resolution };
}

function inspectSceneFacts(facts, conflicts) {
  let leaked = false;
  for (const key of Object.keys(facts)) {
    const winner = SCENE_FACT_AUTHORITY_TARGETS[key];
    if (!winner || key === "scene") continue;
    leaked = true;
    conflicts.push(conflict(`scene.facts.${key}`, winner, "scene_contract", winner === "hard_constraint" ? "hard_constraint" : "higher_authority"));
  }
  return leaked;
}

function resolveScene(raw, intent, conflicts) {
  const id = cleanString(raw.scene) || null;
  let type = "unspecified";
  if (intent.type === "car" || id === "rangeRover") type = "vehicle";
  else if (intent.type === "room" || id === "bedroom" || id === "my_bedroom_text") type = "room";
  else if (id === "street") type = "outdoor";
  else if (/store|optical/u.test(id || "") || /store|optical/u.test(cleanString(raw.customScene))) type = "store";
  else if (id === "custom" || cleanString(raw.customScene)) type = "custom";
  else if (id) type = "outdoor";

  const rangeRoverFacts = id === "rangeRover" ? {
    exterior_color: "Fuji White",
    interior: "Ebony/Ivory luxury",
    seats: "Ivory perforated leather",
    console_trim: "dark wood veneer center console and door trim",
    steering_wheel: "black and Ivory leather multifunction",
    roof: "panoramic glass"
  } : {};
  const suppliedFacts = raw.sceneFacts && typeof raw.sceneFacts === "object" && !Array.isArray(raw.sceneFacts)
    ? deepClone(raw.sceneFacts)
    : {};
  const requestedStreetMood = id === "street" ? cleanString(raw.streetMood).toLowerCase() : "";
  const resolvedStreetMood = requestedStreetMood === "auto"
    ? hourToMood(raw.streetHour)
    : STREET_MOOD_SET.has(requestedStreetMood) ? requestedStreetMood : null;
  const streetFacts = resolvedStreetMood ? { street_mood: resolvedStreetMood } : {};
  const facts = { ...suppliedFacts, ...streetFacts, ...rangeRoverFacts };
  const sceneLeakageDetected = inspectSceneFacts(facts, conflicts);

  const description = cleanString(
    raw.customScene,
    SCENE_DESCRIPTIONS[id] ?? (id ? `selected scene: ${id}` : "unspecified scene")
  );

  const vehicle = type === "vehicle" ? {
    make: id === "rangeRover" ? "Land Rover" : null,
    model: id === "rangeRover" ? "Range Rover Sport Autobiography Dynamic" : null,
    year: id === "rangeRover" ? 2017 : null,
    state: "stationary",
    interior_description: cleanString(raw.vehicleInteriorDescription) || null
  } : null;

  const room = type === "room" ? {
    reference_id: cleanString(raw.roomReferenceId) || null,
    topology_locked: id === "my_bedroom_text",
    description
  } : null;

  return {
    scene: {
      type,
      id,
      description,
      facts,
      vehicle,
      room,
      street_mood_request: id === "street" ? (requestedStreetMood || null) : null
    },
    sceneLeakageDetected
  };
}

function isMirrorCapture(raw) {
  return raw.mirrorSelfie === true || cleanString(raw.mode).toLowerCase() === "mirror" || cleanString(raw.captureType).toLowerCase() === "mirror_selfie";
}

function resolveCapture(raw, intent) {
  if (intent.type === "accidental") {
    return {
      type: "accidental_front_camera_capture",
      operator: "unintentional_subject",
      intentional: false,
      single_capture_event: true,
      trigger: cleanString(raw.accidentalTrigger) || null
    };
  }
  if (isMirrorCapture(raw)) {
    return { type: "mirror_selfie", operator: "subject", intentional: true, single_capture_event: true, trigger: null };
  }
  if (intent.type === "group") {
    return { type: "group_selfie", operator: "group_member", intentional: true, single_capture_event: true, trigger: null };
  }
  if (intent.type === "car") {
    return { type: "subject_held_driver_selfie", operator: "subject", intentional: true, single_capture_event: true, trigger: null };
  }
  return { type: "direct_front_camera_selfie", operator: "subject", intentional: true, single_capture_event: true, trigger: null };
}

function driverPreset(angle, crop) {
  const key = cleanString(angle, "eye").toLowerCase().replace(/_/g, "-");
  let preset = { distance: 42, yaw: 0, pitch: -3, roll: 2 };
  if (key === "three-quarter") preset = { distance: 44, yaw: 12, pitch: -4, roll: 2 };
  else if (key === "side-close") preset = { distance: 44, yaw: 16, pitch: -3, roll: 2 };
  else if (key === "slight-high") preset = { distance: 45, yaw: 0, pitch: -9, roll: 2 };
  else if (key === "slight-low") preset = { distance: 43, yaw: 0, pitch: 6, roll: 2 };
  const adjustment = crop === "tight" ? -2 : crop === "upper" ? 4 : crop === "medium" ? 6 : 0;
  return { ...preset, distance: Math.max(40, Math.min(80, preset.distance + adjustment)) };
}

function resolveCamera(raw, intent, capture, conflicts, sceneFacts) {
  const accidental = capture.type === "accidental_front_camera_capture";
  const monitorOn = raw.visualSelfieMonitor === "on" || raw.visualSelfieMonitor === true;
  const crop = accidental ? null : (cleanString(raw.composition) || null);
  const deviceProfile = accidental && cleanString(raw.accidentalDevice).toLowerCase() === "iphone"
    ? "iPhone 15 Pro Max front camera"
    : "Xiaomi 15 Ultra front camera";

  let geometry;
  if (accidental) {
    geometry = {
      distance_cm: null,
      yaw_deg: null,
      pitch_deg: null,
      roll_deg: null,
      focal_length_equivalent_mm: deviceProfile.startsWith("iPhone") ? 24 : 21,
      crop: null
    };
    const deliberateKeys = ["selfieAngle", "composition", "selfieDistanceCm", "selfieYawDeg", "selfiePitchDeg", "selfieRollDeg", "visualSelfieMonitor"];
    if (deliberateKeys.some((key) => raw[key] !== undefined && raw[key] !== null && raw[key] !== "")) {
      conflicts.push(conflict("capture.accidental_vs_selfie_camera", "capture_contract", "camera_contract"));
    }
  } else if (intent.type === "car" && !monitorOn) {
    const preset = driverPreset(raw.selfieAngle, crop);
    geometry = {
      distance_cm: preset.distance,
      yaw_deg: preset.yaw,
      pitch_deg: preset.pitch,
      roll_deg: preset.roll,
      focal_length_equivalent_mm: 21,
      crop
    };
  } else {
    const requested = {
      distance: finiteNumber(raw.selfieDistanceCm, 50),
      yaw: finiteNumber(raw.selfieYawDeg, 0),
      pitch: finiteNumber(raw.selfiePitchDeg, 0),
      roll: finiteNumber(raw.selfieRollDeg, 2)
    };
    const resolved = {
      distance: clamp(requested.distance, 35, 80, 50),
      yaw: clamp(requested.yaw, -45, 45, 0),
      pitch: clamp(requested.pitch, -25, 25, 0),
      roll: clamp(requested.roll, -10, 10, 2)
    };
    if (Object.keys(requested).some((key) => requested[key] !== resolved[key])) {
      conflicts.push(conflict("camera.geometry.physical_envelope", "hard_constraint", "camera_contract", "physical_feasibility"));
    }
    geometry = {
      distance_cm: resolved.distance,
      yaw_deg: resolved.yaw,
      pitch_deg: resolved.pitch,
      roll_deg: resolved.roll,
      focal_length_equivalent_mm: 21,
      crop
    };
  }

  if (sceneFacts && typeof sceneFacts === "object") {
    if (sceneFacts.camera || sceneFacts.camera_geometry) {
      if (!conflicts.some((item) => item.property === "scene.facts.camera" || item.property === "scene.facts.camera_geometry")) {
        conflicts.push(conflict("camera.geometry.scene_fact_claim", "camera_contract", "scene_contract"));
      }
    }
  }

  return {
    device_profile: deviceProfile,
    camera_type: capture.type === "mirror_selfie" ? "mirror_capture" : "front_camera",
    geometry,
    sensor_behavior: {}
  };
}

function inferLightingSource(raw) {
  const value = cleanString(raw.lighting).toLowerCase();
  if (/phone/u.test(value)) return "phone_screen";
  if (/mixed|lamp-phone|window-ceiling|led.*screen|screen.*led/u.test(value)) return "mixed";
  if (/day|window|sun|overcast|morning|afternoon|shade|roof-light|reflected/u.test(value)) return "daylight";
  if (/ambient/u.test(value)) return "ambient";
  if (value) return "practical";
  return cleanString(raw.time).toLowerCase() === "day" ? "daylight" : "practical";
}

function resolveLighting(raw) {
  return {
    source_type: inferLightingSource(raw),
    description: cleanString(raw.lighting, "available practical light"),
    color_temperature_k: boundedOrNull(raw.colorTemperatureK, 1500, 12000),
    direction: cleanString(raw.lightDirection) || null,
    intensity: cleanString(raw.lightIntensity) || null
  };
}

function clothing(raw) {
  return {
    garment: cleanString(raw.clothing, "unspecified garment"),
    fabric: cleanString(raw.fabric) || null,
    fabric_weight: cleanString(raw.fabricWeight) || null,
    fit: cleanString(raw.clothingFit) || null,
    wear_state: cleanString(raw.wearState) || null,
    custom_modifier: cleanString(raw.clothingCustom) || null
  };
}

function bodyScale(raw) {
  return {
    height_cm: boundedOrNull(raw.heightCm ?? raw.subjectHeightCm, 100, 250),
    weight_kg: boundedOrNull(raw.weightKg ?? raw.subjectWeightKg, 25, 250),
    preserve_environment_scale: raw.preserveEnvironmentScale !== false
  };
}

function subject(raw, referenceId = null) {
  return {
    reference_id: referenceId,
    pose: cleanString(raw.pose, "relaxed-close"),
    expression: cleanString(raw.expression, "neutral"),
    clothing: clothing(raw),
    body_scale: bodyScale(raw)
  };
}

function resolveSubjects(raw, intent, referenceId) {
  const count = intent.type === "group" ? Math.max(1, Math.min(5, Math.trunc(finiteNumber(raw.groupCount, 3)))) : 1;
  const primary = subject(raw, referenceId);
  const additional = [];
  for (let index = 1; index < count; index += 1) {
    additional.push(subject({ ...raw, pose: raw.pose || "group-natural", expression: raw.expression || "neutral" }, null));
  }
  return { count, primary, additional };
}

function buildHardConstraints(hasReference, sceneType, capture, camera) {
  const selfieApplicable = capture.type !== "accidental_front_camera_capture" && capture.type !== "third_person";
  const vehicleApplicable = sceneType === "vehicle" || capture.type === "subject_held_driver_selfie";
  return {
    identity: {
      preserve_reference_identity: hasReference,
      allow_beautification_override: false,
      allow_age_override: false,
      allow_identity_transfer: false,
      adapter_can_modify: false
    },
    anatomy: {
      physically_possible: true,
      limb_ownership_integrity: true,
      contact_consistency: true,
      gravity_consistency: true,
      occlusion_consistency: true,
      adapter_can_modify: false
    },
    capture_physics: {
      physically_possible_camera_position: true,
      physically_possible_operator: true,
      physically_possible_arm_reach: selfieApplicable ? true : null,
      single_capture_event: true,
      adapter_can_modify: false
    },
    selfie_geometry: {
      applicable: selfieApplicable,
      subject_operated_camera: selfieApplicable ? true : null,
      arm_reach_required: selfieApplicable ? true : null,
      phone_position_physically_reachable: selfieApplicable ? camera.geometry.distance_cm !== null : null,
      adapter_can_modify: false
    },
    camera_geometry: {
      preserve_resolved_geometry: true,
      adapter_can_modify: false
    },
    vehicle_geometry: {
      applicable: vehicleApplicable,
      drive_configuration: vehicleApplicable ? "left_hand_drive" : null,
      driver_position: vehicleApplicable ? "vehicle_left" : null,
      steering_relation: vehicleApplicable ? "ahead_of_driver_torso" : null,
      cluster_relation: vehicleApplicable ? "behind_steering_wheel" : null,
      console_relation: vehicleApplicable ? "driver_physical_right" : null,
      door_window_relation: vehicleApplicable ? "driver_physical_left" : null,
      coordinate_system: vehicleApplicable ? "vehicle_relative" : null,
      mirror_may_swap_physical_sides: false,
      adapter_can_modify: false
    }
  };
}

function identityConflictFromExplicitNotes(raw, hasReference, conflicts) {
  if (!hasReference || !cleanString(raw.identityNotes)) return;
  conflicts.push(conflict("identity.explicit_override_attempt", "identity_reference", "explicit_user"));
}

function resolveIdentity(raw, hasReference, conflicts) {
  identityConflictFromExplicitNotes(raw, hasReference, conflicts);
  return {
    reference_mode: hasReference ? "single_reference" : "none",
    reference_id: hasReference ? (cleanString(raw.referenceId) || "attached_reference_image") : null,
    preserve: hasReference ? [...IDENTITY_PRESERVE_FIELDS] : []
  };
}

function preferences(raw) {
  return {
    composition: cleanString(raw.composition) || null,
    background_visibility: cleanString(raw.backgroundVisibility) || null,
    realism: cleanString(raw.realism) || null,
    imperfection_level: cleanString(raw.imperfectionLevel) || null,
    aesthetic: cleanString(raw.aesthetic) || null
  };
}

export function buildCanonicalV3(rawInput = {}) {
  const raw = rawInput && typeof rawInput === "object" ? rawInput : {};
  const conflicts = [];
  const intent = routeIntent(raw);
  const hasReference = raw.hasReference === true || Boolean(cleanString(raw.referenceId));
  const authorities = buildAuthorities(hasReference);
  const identity = resolveIdentity(raw, hasReference, conflicts);
  const { scene, sceneLeakageDetected } = resolveScene(raw, intent, conflicts);
  const capture = resolveCapture(raw, intent);
  const camera = resolveCamera(raw, intent, capture, conflicts, scene.facts);
  const lighting = resolveLighting(raw);
  const subjects = resolveSubjects(raw, intent, identity.reference_id);
  const hardConstraints = buildHardConstraints(hasReference, scene.type, capture, camera);

  const canonical = {
    schema_version: SCHEMA_VERSION,
    intent,
    authorities,
    identity,
    scene,
    capture,
    subjects,
    camera,
    lighting,
    hard_constraints: hardConstraints,
    preferences: preferences(raw),
    resolution: {
      authority_priority: CANONICAL_V3_AUTHORITY_PRIORITY.map((item) => ({ ...item })),
      conflicts,
      resolved: true
    },
    validation: {
      schema_valid: true,
      hard_constraints_valid: true,
      authority_collisions: conflicts.length,
      scene_leakage_detected: sceneLeakageDetected,
      adapter_mutation_detected: false,
      errors: [],
      warnings: intent.fallback.applied ? ["intent resolved by deterministic fallback"] : []
    }
  };

  return deepFreeze(canonical);
}

export default buildCanonicalV3;
