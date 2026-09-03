import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const index = readFileSync(resolve(root, "index.html"), "utf8");
assert.match(index, /WikiPrompt Selfie Studio/u);
assert.match(index, /id="prompt-form"/u);
assert.match(index, /id="reference-image"/u);
assert.match(index, /id="scene"/u);
assert.match(index, /id="pose"/u);

assert.match(index, /id="expression"/u);
assert.match(index, /id="lighting"/u);
assert.match(index, /id="selfie-angle"/u);
assert.match(index, /id="composition"/u);
assert.match(index, /id="json-prompt"/u);
assert.match(index, /JSON SPECIFICATION/u);
assert.match(index, /<script type="module" src="js\/physics-app-v7\.js(?:\?[^"]+)?"><\/script>/u);

const app = readFileSync(resolve(root, "js/physics-app-v7.js"), "utf8");
assert.match(app, /buildStructuredPromptSpec/u);
assert.match(app, /renderStructuredJson/u);
assert.match(app, /normalizeState/u);

assert.match(app, /getCompatibleBedroomWindowOptions/u);
assert.doesNotMatch(app, /bedroomLighting/u, "Parallel bedroom-lighting state must stay removed");

const engineText = readFileSync(resolve(root, "js/physics-prompt-engine-v5.js"), "utf8");
assert.match(engineText, /CANONICAL PROMPT ENGINE/u);
assert.match(engineText, /single_authority_per_field/u);
assert.match(engineText, /vehicle-relative relations/u);
assert.match(engineText, /camera_to_face_distance_cm/u);
assert.match(engineText, /json_only/u);
assert.doesNotMatch(engineText, /mandatory thin steering-wheel/iu);
assert.doesNotMatch(engineText, /LEFT FRONT DRIVER'S SEAT LOCK/u);
assert.doesNotMatch(engineText, /Do not mirror, swap or reinterpret the subject's seat/u);
assert.doesNotMatch(engineText, /physics-data-v4\.js/u);
assert.doesNotMatch(engineText, /physicsPolicy\.js/u);

const engineUrl = `${pathToFileURL(resolve(root, "js/physics-prompt-engine-v5.js")).href}?canonical-test=${Date.now()}`;
const { buildStructuredPromptSpec, normalizeState } = await import(engineUrl);

const driverState = normalizeState({
  studioSection:"car",
  scene:"rangeRover",
  time:"day",
  poseFamily:"car",
  pose:"car-driver-close",
  selfieAngle:"three-quarter",
  composition:"close",
  lighting:"car-day-window",
  clothing:"thobe-white",
  expression:"soft-smile",
  visualSelfieMonitor:"on"
});

const driverSpec = buildStructuredPromptSpec(driverState, { wikiPromptGuidance:"candid smartphone realism" });
assert.equal(driverSpec.schema_version, "realistic-image-generator/v2-canonical");
assert.equal(driverSpec.task.input_contract, "json_only");
assert.equal(driverSpec.task.capture_type, "subject_held_driver_selfie");
assert.equal(driverSpec.authority.policy, "single_authority_per_field");
assert.equal(driverSpec.scene.vehicle_geometry.drive_configuration, "left_hand_drive");
assert.match(driverSpec.scene.vehicle_geometry.spatial_relations.center_console, /driver's physical right/u);
assert.match(driverSpec.scene.vehicle_geometry.spatial_relations.driver_door_and_window, /driver's physical left/u);
assert.match(driverSpec.scene.vehicle_geometry.spatial_relations.projection_rule, /not image-left\/image-right placement/iu);
assert.match(driverSpec.scene.vehicle_geometry.visual_evidence_policy, /Do not force a complete steering wheel/u);
assert.equal(typeof driverSpec.photography.camera_geometry.camera_to_face_distance_cm, "number");
assert.equal(driverSpec.generator.wiki_prompt_calibration.override_permission, false);
assert.ok(!("positive" in driverSpec), "Canonical JSON must not embed a positive prompt");
assert.ok(!("negative" in driverSpec), "Canonical JSON must not embed a negative prompt");
assert.ok(!("qa" in driverSpec), "Canonical JSON must not embed UI QA");

const driverSerialized = JSON.stringify(driverSpec);
assert.doesNotMatch(driverSerialized, /mandatory.*steering/iu);
assert.doesNotMatch(driverSerialized, /right_hand_drive/iu);

const bedroomState = normalizeState({
  studioSection:"bedroom",
  scene:"bedroom",
  poseFamily:"lying",
  pose:"lying-right-close",
  time:"night",
  lighting:"night-bedside-3000",
  bedroomWindow:"night-charcoal-closed"
});
const bedroomSpec = buildStructuredPromptSpec(bedroomState);
assert.equal(bedroomSpec.scene.vehicle_geometry, null);


console.log("✓ canonical deployment contract: single authority, scene isolation and LHD driver geometry passed");
