import assert from "node:assert/strict";
import fs from "node:fs";
import { createSceneState, serializeSceneState, isDeeplyFrozen, SCENE_STATE_FIELDS } from "../js/architecture/sceneState.js";
import { CONSTRAINT_PRIORITY } from "../js/architecture/constraintPriority.js";
import { VALIDATION_CATEGORIES, createValidationIssue, validateSceneState, FUTURE_IMPERFECTION_POLICY } from "../js/architecture/validation.js";
import { createSerializerAdapter, SERIALIZER_FOUNDATION_POLICY } from "../js/architecture/serializers.js";

const inputA = {
  section: "car",
  identity: { reference: "IMAGE A", preserve: true },
  scene: { id: "rangeRover" },
  pose: { id: "driver-close-armless" },
  clothing: { id: "formal-shirt-gray-trouser-black" },
  expression: { id: "neutral" },
  camera: { id: "xiaomi15-ultra-front", distanceCm: 44 },
  lighting: { id: "car-night" },
  topology: { driveSide: "LHD", driver: "vehicle-left" },
  contactSupport: { seat: true },
  materials: { wood: { finish: "polished" }, glass: { transparent: true } },
  generatorTarget: "chatgpt-images",
  selectedControls: { aspect: "9:16" },
  reflection: { mode: "direct-selfie" }
};

const inputB = {
  reflection: { mode: "direct-selfie" },
  selectedControls: { aspect: "9:16" },
  generatorTarget: "chatgpt-images",
  materials: { glass: { transparent: true }, wood: { finish: "polished" } },
  contactSupport: { seat: true },
  topology: { driver: "vehicle-left", driveSide: "LHD" },
  lighting: { id: "car-night" },
  camera: { distanceCm: 44, id: "xiaomi15-ultra-front" },
  expression: { id: "neutral" },
  clothing: { id: "formal-shirt-gray-trouser-black" },
  pose: { id: "driver-close-armless" },
  scene: { id: "rangeRover" },
  identity: { preserve: true, reference: "IMAGE A" },
  section: "car"
};

const stateA = createSceneState(inputA);
const stateB = createSceneState(inputB);
assert.equal(serializeSceneState(stateA), serializeSceneState(stateB), "canonical serialization must ignore input key order");
assert.ok(isDeeplyFrozen(stateA), "SceneState must be deeply immutable");
assert.deepEqual(Object.keys(stateA).sort(), [...SCENE_STATE_FIELDS].sort(), "SceneState field contract drifted");

const originalPose = stateA.pose.id;
try { stateA.pose.id = "mutated"; } catch {}
assert.equal(stateA.pose.id, originalPose, "nested mutation changed SceneState");

assert.throws(() => createSceneState({ section: "car", generatedPrompt: "prose" }), /generated prose/u);
assert.throws(() => createSceneState({ section: "car", nested: { prompt: "prose" } }), /generated prose/u);

assert.deepEqual(CONSTRAINT_PRIORITY, [
  "Reference identity and reference-linked attributes",
  "Explicit user-selected attributes",
  "Physical and anatomical plausibility",
  "Scene topology and spatial orientation",
  "Contact/load physics",
  "Camera optics and viewing geometry",
  "Lighting and material physics",
  "Contextual realism",
  "Natural imperfections",
  "Aesthetic preferences"
]);
assert.ok(Object.isFrozen(CONSTRAINT_PRIORITY), "priority order must be frozen");

assert.equal(VALIDATION_CATEGORIES.length, 11);
const check = () => ({ category: "topology-conflict", code: "TOPOLOGY_EXAMPLE", message: "reserved foundation check" });
const validationA = validateSceneState(stateA, [check]);
const validationB = validateSceneState(stateA, [check]);
assert.deepEqual(validationA, validationB, "validation must be deterministic");
assert.ok(Object.isFrozen(validationA) && Object.isFrozen(validationA.issues), "validation result must be immutable");
assert.equal(validationA.valid, false);
assert.equal(createValidationIssue({ category: "identity-conflict", code: "IDENTITY_EXAMPLE" }).category, "identity-conflict");
assert.match(FUTURE_IMPERFECTION_POLICY, /normally 1–3 physically justified artifacts/u);

const legacyPrompt = "  exact legacy prompt\nwith spacing.  ";
for (const target of ["chatgpt-images", "gemini", "future"]) {
  const adapter = createSerializerAdapter({ target, legacySerialize: (_state, text) => text });
  assert.equal(adapter.serialize(stateA, legacyPrompt), legacyPrompt, `${target}: serializer foundation altered legacy bytes`);
}
assert.equal(SERIALIZER_FOUNDATION_POLICY.activeProductionRoutingChanged, false);
assert.equal(SERIALIZER_FOUNDATION_POLICY.transformsExistingPromptStrings, false);

const activeSources = [
  "../js/engines/promptEngine.js",
  "../js/canonical/canonical-v3-phase53.js"
];
for (const relative of activeSources) {
  const source = fs.readFileSync(new URL(relative, import.meta.url), "utf8");
  assert.doesNotMatch(source, /architecture\//u, `${relative}: foundation must not be wired into production yet`);
}

console.log("PHASE63_SCENESTATE_DETERMINISTIC=PASS");
console.log("PHASE63_SCENESTATE_DEEP_IMMUTABILITY=PASS");
console.log("PHASE63_CANONICAL_SERIALIZATION=PASS");
console.log("PHASE63_CONSTRAINT_PRIORITY_FROZEN=PASS");
console.log("PHASE63_VALIDATION_INTERFACE=PASS");
console.log("PHASE63_SERIALIZER_ZERO_TRANSFORM=PASS");
console.log("PHASE63_PRODUCTION_ROUTING_UNCHANGED=PASS");
console.log("Phase 63 layered architecture foundation: PASS");
