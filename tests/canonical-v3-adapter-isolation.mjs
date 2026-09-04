import assert from "node:assert/strict";
import { buildCanonicalV3 } from "../js/canonical-v3-engine.js";
import { buildOpenAIImagePrompt } from "../js/canonical/openai-image-adapter.js";

function count(text, needle) {
  return text.split(needle).length - 1;
}

const canonical = buildCanonicalV3({
  studioSection: "car",
  scene: "rangeRover",
  hasReference: true,
  referenceId: "identity-ref",
  time: "day",
  lighting: "car-day-window",
  selfieAngle: "three-quarter",
  composition: "close"
});

const beforeCanonical = JSON.stringify(canonical);
const beforeHardConstraints = JSON.stringify(canonical.hard_constraints);

assert.equal(Object.isFrozen(canonical), true);
assert.equal(Object.isFrozen(canonical.hard_constraints), true);
assert.equal(Object.isFrozen(canonical.hard_constraints.vehicle_geometry), true);

const prompt = buildOpenAIImagePrompt(canonical);

const afterCanonical = JSON.stringify(canonical);
const afterHardConstraints = JSON.stringify(canonical.hard_constraints);

assert.equal(typeof prompt, "string");
assert.ok(prompt.length > 0, "adapter must return a non-empty image prompt");
assert.equal(afterCanonical, beforeCanonical, "adapter must not mutate canonical state");
assert.equal(afterHardConstraints, beforeHardConstraints, "adapter must not mutate hard constraints");

assert.equal(canonical.hard_constraints.identity.adapter_can_modify, false);
assert.equal(canonical.hard_constraints.anatomy.adapter_can_modify, false);
assert.equal(canonical.hard_constraints.capture_physics.adapter_can_modify, false);
assert.equal(canonical.hard_constraints.selfie_geometry.adapter_can_modify, false);
assert.equal(canonical.hard_constraints.camera_geometry.adapter_can_modify, false);
assert.equal(canonical.hard_constraints.vehicle_geometry.adapter_can_modify, false);
assert.equal(canonical.validation.adapter_mutation_detected, false);

for (const forbidden of [
  /\bDO NOT\b/iu,
  /\bMUST\b/iu,
  /\bIMPORTANT\b/iu,
  /\bNEVER\b/iu,
  /hard_constraints/iu,
  /adapter_can_modify/iu,
  /authority_collisions/iu,
  /scene_leakage_detected/iu,
  /\bconflicts?\b/iu,
  /\bwinner\b/iu,
  /\bloser\b/iu
]) {
  assert.equal(forbidden.test(prompt), false, `prompt contains forbidden adapter/debug marker: ${forbidden}`);
}

assert.match(prompt, /supplied identity reference/iu);
assert.equal(/beautif|younger|older|perfect symmetry|more symmetrical|face slim/iu.test(prompt), false, "identity wording must stay preserve-reference only");
assert.match(prompt, /natural asymmetry/iu, "reference-preservation may retain natural asymmetry from the canonical identity contract");

for (const phrase of [
  "LHD vehicle-relative",
  "steering directly ahead of torso",
  "driver's door and side window appear on the right side of the image",
  "center console on the left side of the image"
]) {
  assert.equal(count(prompt, phrase), 1, `vehicle relation must appear exactly once: ${phrase}`);
}

assert.equal(/center console is at the driver's physical/iu.test(prompt), false, "projected console relation must not be duplicated in vehicle-relative wording");
assert.equal(/driver door\/window is at the driver's physical/iu.test(prompt), false, "projected door relation must not be duplicated in vehicle-relative wording");
assert.equal(count(prompt, "supplied identity reference"), 1, "identity reference instruction must appear exactly once");

console.log("✓ canonical-v3 OpenAI adapter isolation contract passed");
