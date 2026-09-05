import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BASE_SKIN_TEXTURE as LEGACY_BASE_SKIN_TEXTURE,
  BASE_TEMPLATES,
  SCENES,
  STREET_MOODS
} from "../js/data-base-phase16.js";
import { CAR_EXTERIOR_SPEC } from "../js/data.js";
import { UNIFIED_CLOTHING_CATALOG, UNIFIED_CLOTHING_OPTIONS } from "../js/phase30-clothing-catalog.js";
import {
  BASE_SKIN_TEXTURE as CANONICAL_BASE_SKIN_TEXTURE,
  buildOpenAIImagePrompt,
  describeEnvironmentScale
} from "../js/canonical/openai-image-adapter.js";
import {
  LEGACY_ENGINE,
  canonicalIntentForSection,
  shouldUseCanonicalV3
} from "../js/canonical/engine-feature-flag.js";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;

// 1) Range Rover contract is 2017/Ivory everywhere that owns the vehicle spec.
assert.equal(SCENES.rangeRover.label, "رنج روفر 2017");
assert.equal(SCENES.rangeRover.environment, "inside a stationary 2017 Range Rover Sport Autobiography Dynamic, Ivory perforated leather, dark wood veneer, LHD");
assert.doesNotMatch(SCENES.rangeRover.label, /2022|beige/iu);
assert.doesNotMatch(SCENES.rangeRover.environment, /2022|beige/iu);
for (const [key, template] of Object.entries(BASE_TEMPLATES).filter(([key]) => key.startsWith("rangeRover:"))) {
  const value = `${template.title ?? ""} ${template.text ?? template}`;
  assert.doesNotMatch(value, /2022|beige/iu, `${key}: stale Range Rover generation wording`);
}
for (const relative of ["js/data-base-phase16.js", "js/wiki-selfie-data-v1.js", "js/data.js", "js/canonical-v3-engine.js"]) {
  const source = read(relative);
  const staleLines = source.split(/\r?\n/u).filter((line) => /Range Rover|rangeRover|رنج روفر/u.test(line) && /2022/u.test(line));
  assert.deepEqual(staleLines, [], `${relative}: stale 2022 Range Rover source remains`);
}

// 2/3) One unified clothing select/catalog; carExterior hides the standard field.
const indexSource = read("index.html");
const uiSource = read("js/phase22-ui-runtime.js");
assert.equal((indexSource.match(/id="clothing"/gu) || []).length, 1, "exactly one standard clothing select must exist");
assert.match(uiSource, /field\.hidden = activeSection\(\) === "carExterior"/u, "carExterior must hide the standard clothing field");
assert.equal(UNIFIED_CLOTHING_CATALOG.length, 6);
assert.deepEqual(UNIFIED_CLOTHING_CATALOG.map((group) => group.label), ["منزل", "كاجوال", "رسمي", "رياضي", "تقليدي", "خارجي"]);
assert.ok(UNIFIED_CLOTHING_OPTIONS.length >= 15, "unified clothing catalog must contain at least 15 mapped garments");
assert.equal(UNIFIED_CLOTHING_OPTIONS.every((item) => item.value && item.text), true, "all unified clothing values must map to prompt text");

// 4) gym/street are Canonical-enabled even when stored engine is legacy.
const legacySelection = { engine: LEGACY_ENGINE };
for (const section of ["gym", "street"]) {
  assert.equal(shouldUseCanonicalV3(section, legacySelection), true, `${section}: canonical-v3 should auto-enable`);
  assert.equal(canonicalIntentForSection(section), "selfie", `${section}: canonical intent must be selfie`);
}

// 5) Special places are explicit moods; normal/rush/cafe are not hidden place aliases.
const moodValues = new Set(STREET_MOODS.map((item) => item.value));
for (const mood of ["alley", "construction", "bufia"]) assert.ok(moodValues.has(mood), `${mood}: explicit mood missing`);
const finalAdapterSource = read("js/canonical/openai-image-adapter.js");
assert.match(finalAdapterSource, /alley:\s*"old_service_alley"/u);
assert.match(finalAdapterSource, /construction:\s*"street_construction"/u);
assert.match(finalAdapterSource, /bufia:\s*"saudi_bufia"/u);
assert.doesNotMatch(finalAdapterSource, /normal:\s*"old_service_alley"/u);
assert.doesNotMatch(finalAdapterSource, /rush:\s*"street_construction"/u);
assert.doesNotMatch(finalAdapterSource, /cafe:\s*"saudi_bufia"/u);

const streetRaw = (streetMood) => ({
  studioSection:"street", intentType:"selfie", scene:"street", streetMood,
  time:"day", hasReference:true, clothing:"tee-black", fabric:"cotton-jersey",
  fabricWeight:"light", ironState:"lightly-unpressed", wearState:"normal-day",
  clothingFit:"regular", pose:"standing-relaxed", expression:"neutral"
});
const normalPrompt = buildCanonicalV3UserOutput(streetRaw("normal")).prompt;
assert.doesNotMatch(normalPrompt, /service alley|street construction|bufia cafe/iu, "normal street must not secretly become a special place");
assert.match(buildCanonicalV3UserOutput(streetRaw("alley")).prompt, /service alley/iu);
assert.match(buildCanonicalV3UserOutput(streetRaw("construction")).prompt, /street construction/iu);
assert.match(buildCanonicalV3UserOutput(streetRaw("bufia")).prompt, /bufia cafe/iu);

// 6) Glass contract uses transparent wording and never the stale rear-tint phrase.
assert.match(CAR_EXTERIOR_SPEC, /transparent glass/iu);
assert.doesNotMatch(CAR_EXTERIOR_SPEC, /tinted rear glass/iu);
for (const relative of ["js/data.js", "js/canonical/openai-image-adapter.js", "js/canonical/openai-image-adapter-phase23.js"]) {
  assert.doesNotMatch(read(relative), /tinted rear glass/iu, `${relative}: stale tinted rear glass wording remains`);
}

// 7) Dead villa environment-scale branch is gone.
assert.equal(describeEnvironmentScale({ scene:{ id:"villa", type:"custom" } }), "");
assert.doesNotMatch(read("js/canonical/openai-image-adapter-base-phase16.js"), /sceneId === "villa"/u);

// 8) Canonical and legacy share the exact same 13-item skin authority; anatomy stays elsewhere.
assert.equal(LEGACY_BASE_SKIN_TEXTURE.length, 13);
assert.deepEqual(CANONICAL_BASE_SKIN_TEXTURE, LEGACY_BASE_SKIN_TEXTURE);
assert.equal(LEGACY_BASE_SKIN_TEXTURE.some((line) => /\bbody\b/iu.test(line)), false, "BASE_SKIN_TEXTURE must contain no body line");

// Canonical car fixture: validate the real resolved vehicle contract directly, without UI fallback noise.
const rangeRoverCanonical = {
  schema_version:"realistic-image-generator/canonical-v3",
  identity:{ reference_mode:"none", preserve:[] },
  capture:{ type:"subject_held_driver_selfie", operator:"subject" },
  subjects:{ count:1, primary:{ pose:"relaxed upright", expression:"neutral", clothing:{ garment:"plain black cotton T-shirt", fabric:"cotton" }, body_scale:{ preserve_environment_scale:true } } },
  scene:{ id:"rangeRover", type:"vehicle", description:SCENES.rangeRover.environment, facts:{}, vehicle:{ state:"stationary", year:2017, make:"Land Rover", model:"Range Rover Sport Autobiography Dynamic" } },
  camera:{ device_profile:"Xiaomi 15 Ultra front camera", camera_type:"front_camera", geometry:{ distance_cm:50, yaw_deg:0, pitch_deg:0, roll_deg:2, focal_length_equivalent_mm:21, crop:"close" } },
  lighting:{ source_type:"daylight", description:"soft natural daylight" },
  hard_constraints:{
    identity:{ preserve_reference_identity:false },
    anatomy:{ physically_possible:true, limb_ownership_integrity:true, contact_consistency:true, gravity_consistency:true, occlusion_consistency:true },
    selfie_geometry:{ applicable:true, subject_operated_camera:true, phone_position_physically_reachable:true },
    capture_physics:{ physically_possible_camera_position:true, physically_possible_operator:true, physically_possible_arm_reach:true, single_capture_event:true },
    vehicle_geometry:{ applicable:true, drive_configuration:"left_hand_drive", driver_position:"vehicle_left", steering_relation:"ahead_of_driver_torso" }
  }
};
const rangeRoverOutputs = Array.from({ length:10 }, () => buildOpenAIImagePrompt(rangeRoverCanonical));
assert.equal(rangeRoverOutputs.every((value) => value === rangeRoverOutputs[0]), true, "rangeRover: determinism failed");
assert.ok(words(rangeRoverOutputs[0]) <= 250, `rangeRover: prompt exceeds 250 words (${words(rangeRoverOutputs[0])})`);
assert.doesNotMatch(rangeRoverOutputs[0], /2022|beige/iu);

// Final UI-pipeline prompt budget and deterministic generation 10/10.
const auditCases = [
  streetRaw("normal"),
  streetRaw("alley"),
  { studioSection:"gym", intentType:"selfie", scene:"gym", time:"day", hasReference:true, clothing:"sport-tech-tee-pants", fabric:"technical-poly", fabricWeight:"light", ironState:"lightly-unpressed", wearState:"post-workout", clothingFit:"regular" },
  { studioSection:"carExterior", intentType:"selfie", scene:"carExterior", time:"night", hasReference:true, carExteriorLocation:"parking", carExteriorPose:"door-open", carExteriorLighting:"interior-spill", clothing:"white-thobe", fabric:"cotton-poplin", fabricWeight:"medium", ironState:"normal-pressed", wearState:"normal-day", clothingFit:"regular" }
];
for (const raw of auditCases) {
  const outputs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(raw).prompt);
  assert.equal(outputs.every((value) => value === outputs[0]), true, `${raw.scene}: determinism failed`);
  assert.ok(words(outputs[0]) <= 250, `${raw.scene}: prompt exceeds 250 words (${words(outputs[0])})`);
  if (raw.scene === "carExterior") assert.doesNotMatch(outputs[0], /tinted rear glass/iu);
}

console.log(`PHASE31_UNIFIED_CLOTHING=${UNIFIED_CLOTHING_OPTIONS.length}`);
console.log(`PHASE31_RANGE_ROVER_WORDS=${words(rangeRoverOutputs[0])}`);
console.log("PHASE31_DETERMINISM=10/10");
console.log("✓ Phase 31 full audit de-conflict contracts passed");
