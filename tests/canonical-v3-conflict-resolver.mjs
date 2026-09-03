import assert from "node:assert/strict";
import { resolveAuthorityClaims, hasSingleAuthorityPerField } from "../js/canonical/authority-resolver.js";
import { resolveCanonicalConflicts } from "../js/canonical/conflict-resolver.js";

const claims = resolveAuthorityClaims([
  { field: "camera", owner: "scene_contract", value: { yaw: 45 }, source: "scene" },
  { field: "camera", owner: "camera_contract", value: { yaw: 12 }, source: "camera" },
  { field: "camera", owner: "aesthetic_preference", value: { yaw: 3 }, source: "aesthetic" }
]);

assert.equal(hasSingleAuthorityPerField(claims), true);
assert.equal(claims.owners.camera, "scene_contract", "priority table must deterministically choose the highest owner among supplied claims");
assert.equal(claims.authority_collisions, 2);
assert.equal(claims.rejected_claims.length, 2);
assert.deepEqual(claims.conflicts.map(({ winner, loser }) => ({ winner, loser })), [
  { winner: "scene_contract", loser: "camera_contract" },
  { winner: "scene_contract", loser: "aesthetic_preference" }
]);

const raw = {
  studioSection: "accidental",
  captureMode: "accidental",
  accidentalDevice: "iphone",
  hasReference: true,
  referenceId: "identity-ref",
  identityNotes: "make the face younger",
  selfieAngle: "eye",
  composition: "close",
  selfieDistanceCm: 120,
  selfieYawDeg: 60,
  sceneFacts: {
    identity: { apparent_age: 22 },
    camera: { yaw_deg: 45 },
    lighting: { source_type: "custom" },
    drive_configuration: "right_hand_drive",
    harmless_scene_detail: "dark wood trim"
  }
};
const original = structuredClone(raw);
const result = resolveCanonicalConflicts(raw, raw.sceneFacts);

assert.deepEqual(raw, original, "resolver must not mutate raw input");
assert.equal(result.scene_leakage_detected, true);
assert.equal(result.cleanInput.identityNotes, undefined, "rejected identity override must be removed from active input");
assert.equal(result.cleanInput.selfieAngle, undefined, "accidental capture must remove deliberate selfie angle authority");
assert.equal(result.cleanInput.composition, undefined, "accidental capture must remove deliberate composition authority");
assert.equal(result.cleanInput.selfieDistanceCm, undefined, "accidental capture owns camera behavior before camera envelope resolution");
assert.equal(result.cleanInput.sceneFacts.harmless_scene_detail, "dark wood trim", "scene facts remain inert read-only scene data");
assert.equal(result.cleanInput.sceneFacts.camera.yaw_deg, 45, "rejected scene claims remain preserved as read-only evidence");
assert.ok(result.conflicts.some((item) => item.property === "scene.facts.camera" && item.winner === "camera_contract" && item.loser === "scene_contract"));
assert.ok(result.conflicts.some((item) => item.property === "scene.facts.drive_configuration" && item.winner === "hard_constraint"));
assert.ok(result.conflicts.some((item) => item.property === "identity" && item.winner === "identity_reference"));
assert.ok(result.conflicts.some((item) => item.property === "capture.accidental_vs_selfie_camera" && item.winner === "capture_contract"));

const cameraResult = resolveCanonicalConflicts({
  studioSection: "car",
  selfieDistanceCm: 120,
  selfieYawDeg: -80,
  selfiePitchDeg: 40,
  selfieRollDeg: 20
});
assert.equal(cameraResult.cleanInput.selfieDistanceCm, 80);
assert.equal(cameraResult.cleanInput.selfieYawDeg, -45);
assert.equal(cameraResult.cleanInput.selfiePitchDeg, 25);
assert.equal(cameraResult.cleanInput.selfieRollDeg, 10);
assert.equal(cameraResult.conflicts.filter((item) => item.resolution === "physical_feasibility").length, 4);

const multiSource = resolveCanonicalConflicts({
  authorityClaims: [
    { field: "lighting", owner: "lighting_contract", value: "window" },
    { field: "lighting", owner: "generator_adapter", value: "studio" }
  ]
});
assert.equal(multiSource.authority_owners.lighting, "lighting_contract");
assert.equal(multiSource.rejected_claims[0].owner, "generator_adapter");
assert.equal(multiSource.cleanInput.authorityClaims, undefined);

console.log("✓ canonical-v3 conflict resolver and authority resolver passed");
