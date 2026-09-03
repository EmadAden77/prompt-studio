import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const engineUrl = new URL("../js/canonical-v3-engine.js", import.meta.url);
if (!fs.existsSync(fileURLToPath(engineUrl))) {
  console.log("○ Phase 1 contract test pending: canonical-v3 engine not implemented yet");
  process.exit(0);
}

const { buildCanonicalV3 } = await import(engineUrl.href);

const canonical = buildCanonicalV3({
  studioSection: "bedroom",
  scene: "bedroom",
  hasReference: true,
  referenceId: "identity-ref",
  identityNotes: "make the face slimmer, younger and more symmetrical",
  sceneFacts: {
    identity: {
      apparent_age: 22,
      face_shape: "slim",
      symmetry: "perfect"
    }
  }
});

assert.equal(canonical.authorities.identity.owner, "identity_reference");
assert.equal(canonical.identity.reference_id, "identity-ref");
assert.equal(canonical.hard_constraints.identity.preserve_reference_identity, true);
assert.equal(canonical.hard_constraints.identity.allow_beautification_override, false);
assert.equal(canonical.hard_constraints.identity.allow_age_override, false);
assert.equal(canonical.hard_constraints.identity.allow_identity_transfer, false);
assert.equal(canonical.hard_constraints.identity.adapter_can_modify, false);
assert.ok(canonical.identity.preserve.includes("facial_structure"));
assert.ok(canonical.identity.preserve.includes("apparent_age"));
assert.ok(canonical.identity.preserve.includes("natural_asymmetry"));

console.log("✓ canonical-v3 identity override contract passed");
