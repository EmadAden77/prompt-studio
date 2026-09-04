const RESERVED_SCENE_FACT_KEYS = new Set([
  "identity",
  "scene",
  "capture",
  "subjects",
  "camera",
  "camera_geometry",
  "lighting",
  "vehicle_geometry",
  "anatomy",
  "realism",
  "aesthetic",
  "drive_configuration",
  "driver_position",
  "steering_relation",
  "cluster_relation",
  "console_relation",
  "door_window_relation",
  "coordinate_system",
  "mirror_may_swap_physical_sides",
  "source"
]);

const IDENTITY_LABELS = Object.freeze({
  facial_structure: "facial structure",
  head_shape: "head shape",
  apparent_age: "apparent age",
  skin_identity: "skin identity",
  skin_tone: "skin tone",
  natural_asymmetry: "natural asymmetry",
  eyes: "eyes",
  eyebrows: "eyebrows",
  nose: "nose",
  lips: "lips",
  jaw: "jaw",
  chin: "chin",
  ears: "ears",
  hairline: "hairline",
  hair_density: "hair density",
  hair_texture: "hair texture",
  facial_hair_pattern: "facial-hair pattern",
  moustache_pattern: "moustache pattern",
  reference_linked_eyewear: "reference-linked eyewear"
});

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function humanize(value) {
  return text(value).replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function naturalList(items) {
  const values = items.filter(Boolean);
  if (values.length === 0) return "";
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function sentence(value) {
  const valueText = text(value);
  if (!valueText) return "";
  return /[.!?]$/u.test(valueText) ? valueText : `${valueText}.`;
}

function describeCapture(canonical) {
  const capture = canonical.capture ?? {};
  switch (capture.type) {
    case "subject_held_driver_selfie":
      return "A candid driver selfie.";
    case "direct_front_camera_selfie":
      return "A candid direct selfie.";
    case "group_selfie":
      return "A candid group selfie.";
    case "accidental_front_camera_capture": {
      const trigger = humanize(capture.trigger);
      return trigger ? `A candid accidental smartphone capture triggered during ${trigger}.` : "A candid accidental smartphone capture.";
    }
    case "mirror_selfie":
      return "A candid mirror selfie.";
    case "third_person":
      return "A candid third-person photograph.";
    default:
      return "A candid physically coherent photograph.";
  }
}

function describeIdentity(canonical) {
  const identity = canonical.identity ?? {};
  const hardIdentity = canonical.hard_constraints?.identity ?? {};
  if (identity.reference_mode !== "single_reference" || hardIdentity.preserve_reference_identity !== true) return "";
  const fields = Array.isArray(identity.preserve)
    ? identity.preserve.map((field) => IDENTITY_LABELS[field] ?? humanize(field)).filter(Boolean)
    : [];
  const preserved = naturalList(fields);
  return preserved
    ? `The primary subject preserves the supplied identity reference for ${preserved}.`
    : "The primary subject preserves the supplied identity reference.";
}

function describeClothing(clothing) {
  if (!isObject(clothing)) return "";
  const garment = humanize(clothing.garment);
  if (!garment || garment === "unspecified garment") return "";
  const details = [
    humanize(clothing.fabric),
    humanize(clothing.fabric_weight),
    humanize(clothing.fit),
    humanize(clothing.wear_state),
    humanize(clothing.custom_modifier)
  ].filter(Boolean);
  return details.length ? `${garment} with ${naturalList(details)}` : garment;
}

function describePrimarySubject(canonical) {
  const primary = canonical.subjects?.primary;
  if (!isObject(primary)) return "";
  const facts = [];
  const pose = humanize(primary.pose);
  const expression = humanize(primary.expression);
  const clothing = describeClothing(primary.clothing);
  if (pose) facts.push(`a ${pose} pose`);
  if (expression) facts.push(`a ${expression} expression`);
  if (clothing) facts.push(`wearing ${clothing}`);

  const body = primary.body_scale;
  if (isObject(body)) {
    if (Number.isFinite(body.height_cm)) facts.push(`${body.height_cm} cm height`);
    if (Number.isFinite(body.weight_kg)) facts.push(`${body.weight_kg} kg body weight`);
    if (body.preserve_environment_scale === true) facts.push("body scale consistent with the surrounding environment");
  }

  return facts.length ? `The primary subject has ${naturalList(facts)}.` : "";
}

/**
 * Add a sparse, deterministic layer of naturally occurring visual detail.
 * The adapter reads canonical facts only; it never writes to Canonical V3.
 */
export function describeNaturalImperfections(canonical) {
  if (!isObject(canonical)) return "";

  const primary = canonical.subjects?.primary;
  const referenceIdentityIsPreserved = canonical.identity?.reference_mode === "single_reference"
    && canonical.hard_constraints?.identity?.preserve_reference_identity === true;
  const preservedIdentityFields = Array.isArray(canonical.identity?.preserve)
    ? canonical.identity.preserve
    : [];
  const preservedHairIdentity = referenceIdentityIsPreserved
    && ["hairline", "hair_density", "hair_texture"].some((field) => preservedIdentityFields.includes(field));
  const clothing = primary?.clothing;
  const bodyScale = primary?.body_scale;
  const phrases = [];

  if (referenceIdentityIsPreserved) {
    phrases.push("Subtle skin texture with natural pores.");
  }
  if (preservedHairIdentity) {
    phrases.push("Natural hair flyaways and loose strands.");
  }
  if (isObject(clothing) && text(clothing.garment) && text(clothing.garment) !== "unspecified garment" && text(clothing.fabric)) {
    phrases.push("Natural fabric wrinkles and folds.");
  }
  if (isObject(bodyScale) && bodyScale.preserve_environment_scale === true) {
    phrases.push("Natural body proportions consistent with the environment.");
  }

  return phrases.slice(0, 3).join(" ");
}

function describeGroup(canonical) {
  const subjects = canonical.subjects ?? {};
  if (!Number.isInteger(subjects.count) || subjects.count <= 1) return "";
  return `${subjects.count} people are present in the group composition.`;
}

function describeVehicleScene(scene) {
  const vehicle = scene?.vehicle;
  if (!isObject(vehicle)) return "";
  const parts = [];
  if (text(vehicle.state)) parts.push(humanize(vehicle.state));
  if (Number.isInteger(vehicle.year)) parts.push(String(vehicle.year));
  if (text(vehicle.make)) parts.push(text(vehicle.make));
  if (text(vehicle.model)) parts.push(text(vehicle.model));
  const base = parts.length ? `Inside a ${parts.join(" ")}.` : "Inside the selected vehicle.";
  const interior = text(vehicle.interior_description);
  return interior ? `${base} The interior has ${interior}.` : base;
}

function describeScene(canonical) {
  const scene = canonical.scene ?? {};
  if (scene.type === "vehicle") return describeVehicleScene(scene);
  if (scene.type === "room" && isObject(scene.room) && text(scene.room.description)) {
    return sentence(scene.room.description);
  }
  return sentence(scene.description);
}

function describeSceneFacts(canonical) {
  const facts = canonical.scene?.facts;
  if (!isObject(facts)) return "";
  const phrases = [];
  for (const [key, value] of Object.entries(facts)) {
    if (RESERVED_SCENE_FACT_KEYS.has(key)) continue;
    if (typeof value === "string" && text(value)) {
      phrases.push(`${humanize(key)} is ${text(value)}`);
    } else if (typeof value === "number" && Number.isFinite(value)) {
      phrases.push(`${humanize(key)} is ${value}`);
    } else if (typeof value === "boolean") {
      phrases.push(`${humanize(key)} is ${value ? "present" : "absent"}`);
    }
  }
  return phrases.length ? `Scene details: ${naturalList(phrases)}.` : "";
}

function describeCamera(canonical) {
  const camera = canonical.camera ?? {};
  const geometry = camera.geometry ?? {};
  const device = text(camera.device_profile) || "selected camera";
  const mode = text(camera.camera_type);
  const deviceIncludesMode = mode === "front_camera" && /front camera/iu.test(device);
  const modePhrase = !deviceIncludesMode && mode ? ` in ${humanize(mode)} mode` : "";
  const details = [];
  if (Number.isFinite(geometry.distance_cm)) details.push(`${geometry.distance_cm} cm subject distance`);
  if (Number.isFinite(geometry.yaw_deg)) details.push(`${geometry.yaw_deg}° yaw`);
  if (Number.isFinite(geometry.pitch_deg)) details.push(`${geometry.pitch_deg}° pitch`);
  if (Number.isFinite(geometry.roll_deg)) details.push(`${geometry.roll_deg}° roll`);
  if (Number.isFinite(geometry.focal_length_equivalent_mm)) details.push(`${geometry.focal_length_equivalent_mm} mm equivalent focal length`);
  if (text(geometry.crop)) details.push(`${humanize(geometry.crop)} crop`);
  return details.length
    ? `Captured with the ${device}${modePhrase}, using ${naturalList(details)}.`
    : `Captured with the ${device}${modePhrase}.`;
}

const CAMERA_ARTIFACT_PHRASES = Object.freeze({
  edge_softness: "Slight lens softness is visible toward the frame edges.",
  sensor_noise: "Natural sensor noise is visible in shadow areas.",
  micro_blur: "Natural micro-blur is visible on moving elements."
});

function hasRealDeviceProfile(canonical) {
  const profile = text(canonical.camera?.device_profile);
  return /xiaomi\s+15\s+ultra|iphone\s+15\s+pro\s+max|\breal\s+camera\b/iu.test(profile);
}

function hasLowLightCapture(canonical) {
  const lighting = canonical.lighting ?? {};
  const source = text(lighting.source_type).toLowerCase();
  const conditions = [lighting.description, lighting.intensity]
    .map((value) => text(value).toLowerCase())
    .filter(Boolean)
    .join(" ");
  return source === "phone_screen" || /\bnight\b|\blow[- ]?light\b|\bdim\b|\bdark\b/iu.test(conditions);
}

/**
 * Describe up to two device-, light-, or motion-causal camera artifacts.
 * The adapter reads canonical facts only; it never changes camera values or authorities.
 */
export function describeCameraArtifacts(canonical) {
  if (!isObject(canonical) || !hasRealDeviceProfile(canonical)) return "";

  const phrases = [];
  if (hasLowLightCapture(canonical)) phrases.push(CAMERA_ARTIFACT_PHRASES.sensor_noise);
  if (canonical.capture?.type === "accidental_front_camera_capture") phrases.push(CAMERA_ARTIFACT_PHRASES.micro_blur);
  if (phrases.length < 2) phrases.push(CAMERA_ARTIFACT_PHRASES.edge_softness);

  return phrases.slice(0, 2).join(" ");
}

function describeLighting(canonical) {
  const lighting = canonical.lighting ?? {};
  const parts = [];
  const source = humanize(lighting.source_type);
  const description = humanize(lighting.description);
  if (source) parts.push(source);
  if (description && description !== source) parts.push(`the selected ${description} setup`);
  if (Number.isInteger(lighting.color_temperature_k)) parts.push(`${lighting.color_temperature_k} K color temperature`);
  if (text(lighting.direction)) parts.push(`${humanize(lighting.direction)} direction`);
  if (text(lighting.intensity)) parts.push(`${humanize(lighting.intensity)} intensity`);
  return parts.length ? `Lighting uses ${naturalList(parts)}.` : "";
}

const LIGHTING_PHYSICS_BY_SOURCE = Object.freeze({
  daylight: "Gentle directional contrast creates gradual shadow falloff across the scene.",
  practical: "Localized highlights transition gradually into adjacent shadows.",
  mixed: "Subtle color variation follows the overlapping illumination across the scene.",
  phone_screen: "Concentrated illumination falls off across the nearby subject.",
  ambient: "Soft low-contrast transitions extend across the scene."
});

/**
 * Describe one causal lighting outcome from the already-resolved lighting source.
 * The adapter reads canonical facts only; it never changes lighting authority or values.
 */
export function describeLightingPhysics(canonical) {
  if (!isObject(canonical)) return "";
  const source = text(canonical.lighting?.source_type);
  return LIGHTING_PHYSICS_BY_SOURCE[source] ?? "";
}

function describeAnatomy(canonical) {
  const anatomy = canonical.hard_constraints?.anatomy;
  if (!isObject(anatomy) || anatomy.physically_possible !== true) return "";
  const details = [];
  if (anatomy.limb_ownership_integrity === true) details.push("consistent limb ownership");
  if (anatomy.contact_consistency === true) details.push("physical contact");
  if (anatomy.gravity_consistency === true) details.push("gravity");
  if (anatomy.occlusion_consistency === true) details.push("occlusion");
  return details.length
    ? `Human anatomy is physically plausible, with ${naturalList(details)}.`
    : "Human anatomy is physically plausible.";
}

function describeCapturePhysics(canonical) {
  const physics = canonical.hard_constraints?.capture_physics;
  const selfie = canonical.hard_constraints?.selfie_geometry;
  if (!isObject(physics)) return "";

  if (isObject(selfie) && selfie.applicable === true && selfie.subject_operated_camera === true) {
    const holder = canonical.capture?.operator === "group_member" ? "The camera-holding group member" : "The subject";
    const reach = selfie.phone_position_physically_reachable === true || physics.physically_possible_arm_reach === true
      ? " from a physically reachable arm position"
      : "";
    const event = physics.single_capture_event === true ? " in one physically possible capture event" : "";
    return `${holder} operates the camera${reach}${event}.`;
  }

  const facts = [];
  if (physics.physically_possible_camera_position === true) facts.push("a physically possible camera position");
  if (physics.physically_possible_operator === true) facts.push("a physically possible camera operator");
  if (physics.single_capture_event === true) facts.push("one coherent capture event");
  return facts.length ? `The capture uses ${naturalList(facts)}.` : "";
}

function describeVehicleGeometry(canonical) {
  const vehicle = canonical.hard_constraints?.vehicle_geometry;
  if (!isObject(vehicle) || vehicle.applicable !== true) return "";

  if (vehicle.drive_configuration === "left_hand_drive"
      && vehicle.driver_position === "vehicle_left"
      && vehicle.steering_relation === "ahead_of_driver_torso"
      && vehicle.cluster_relation === "behind_steering_wheel"
      && vehicle.console_relation === "driver_physical_right"
      && vehicle.door_window_relation === "driver_physical_left"
      && vehicle.coordinate_system === "vehicle_relative") {
    return "Left-hand-drive geometry uses vehicle-relative coordinates: the driver occupies the vehicle-left driving position, the steering wheel is directly ahead of the driver's torso, the instrument cluster is behind the steering wheel, the center console is at the driver's physical right, and the driver door/window is at the driver's physical left.";
  }

  const relations = [];
  if (text(vehicle.drive_configuration)) relations.push(`${humanize(vehicle.drive_configuration)} configuration`);
  if (text(vehicle.driver_position)) relations.push(`driver position ${humanize(vehicle.driver_position)}`);
  if (text(vehicle.steering_relation)) relations.push(`steering wheel ${humanize(vehicle.steering_relation)}`);
  if (text(vehicle.cluster_relation)) relations.push(`instrument cluster ${humanize(vehicle.cluster_relation)}`);
  if (text(vehicle.console_relation)) relations.push(`center console ${humanize(vehicle.console_relation)}`);
  if (text(vehicle.door_window_relation)) relations.push(`driver door/window ${humanize(vehicle.door_window_relation)}`);
  if (text(vehicle.coordinate_system)) relations.push(`${humanize(vehicle.coordinate_system)} coordinates`);
  return relations.length ? `Vehicle geometry follows ${naturalList(relations)}.` : "";
}

function describePreferences(canonical) {
  const preferences = canonical.preferences;
  if (!isObject(preferences)) return "";
  const items = [];
  const crop = text(canonical.camera?.geometry?.crop);
  if (text(preferences.composition) && text(preferences.composition) !== crop) {
    items.push(`composition is ${humanize(preferences.composition)}`);
  }
  if (text(preferences.background_visibility)) items.push(`background visibility is ${humanize(preferences.background_visibility)}`);
  if (text(preferences.realism)) items.push(`realism is ${humanize(preferences.realism)}`);
  if (text(preferences.imperfection_level)) items.push(`imperfection level is ${humanize(preferences.imperfection_level)}`);
  if (text(preferences.aesthetic)) items.push(`aesthetic is ${humanize(preferences.aesthetic)}`);
  return items.length ? `Visual preferences: ${naturalList(items)}.` : "";
}

/**
 * Serialize a frozen Canonical V3 state into a concise image-model prompt.
 * This function is read-only: it never mutates the canonical object or its hard constraints.
 */
export function buildOpenAIImagePrompt(canonical) {
  if (!isObject(canonical) || canonical.schema_version !== "realistic-image-generator/canonical-v3") {
    throw new TypeError("buildOpenAIImagePrompt expects a Canonical V3 state");
  }

  return [
    describeCapture(canonical),
    describeIdentity(canonical),
    describeGroup(canonical),
    describePrimarySubject(canonical),
    describeNaturalImperfections(canonical),
    describeScene(canonical),
    describeSceneFacts(canonical),
    describeCamera(canonical),
    describeCameraArtifacts(canonical),
    describeLighting(canonical),
    describeLightingPhysics(canonical),
    describeAnatomy(canonical),
    describeCapturePhysics(canonical),
    describeVehicleGeometry(canonical),
    describePreferences(canonical)
  ].filter(Boolean).join(" ");
}

export default buildOpenAIImagePrompt;
