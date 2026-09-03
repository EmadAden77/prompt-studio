import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const engineUrl = new URL("../js/canonical-v3-engine.js", import.meta.url);
const adapterUrl = new URL("../js/openai-image-adapter-v1.js", import.meta.url);
if (!fs.existsSync(fileURLToPath(engineUrl)) || !fs.existsSync(fileURLToPath(adapterUrl))) {
  console.log("○ Phase 1 contract test pending: OpenAI adapter is not implemented until Phase 4");
  process.exit(0);
}

const { buildCanonicalV3 } = await import(engineUrl.href);
const { adaptCanonicalV3ToOpenAI } = await import(adapterUrl.href);

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
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

const before = JSON.stringify(canonical.hard_constraints);
deepFreeze(canonical);
const payload = adaptCanonicalV3ToOpenAI(canonical);
const after = JSON.stringify(canonical.hard_constraints);

assert.ok(payload, "adapter must return a payload");
assert.equal(after, before, "adapter must not mutate hard constraints");
assert.equal(canonical.hard_constraints.identity.adapter_can_modify, false);
assert.equal(canonical.hard_constraints.camera_geometry.adapter_can_modify, false);
assert.equal(canonical.hard_constraints.vehicle_geometry.adapter_can_modify, false);
assert.equal(canonical.validation.adapter_mutation_detected, false);

console.log("✓ canonical-v3 OpenAI adapter isolation contract passed");
