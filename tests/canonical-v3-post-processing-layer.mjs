import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { buildCanonicalV3 } from "../js/canonical-v3-engine.js";
import { buildOpenAIImagePrompt, describePostProcessing } from "../js/canonical/openai-image-adapter.js";

const GOLDEN_URL = new URL("./golden/current-engine/legacy-v2-semantic-goldens.json", import.meta.url);
const golden = JSON.parse(fs.readFileSync(fileURLToPath(GOLDEN_URL), "utf8"));
const IDS = ["car_lhd_driver_selfie","car_tight_crop","bedroom_direct_selfie","mirror_selfie","group_selfie","accidental_capture","identity_and_eyewear"];

const P = Object.freeze({
  dynamic: "Realistic dynamic range with natural highlight rolloff.",
  white_balance: "Authentic white balance matched to the dominant light source.",
  texture: "Minimal retouching preserves natural skin and fabric texture."
});
const FORBIDDEN = [/\bDO NOT\b/iu,/\bMUST\b/iu,/\bIMPORTANT\b/iu,/\bNEVER\b/iu,/\bHDR\b/iu,/beauty[- ]?filter/iu,/smooth(?:ing|ed)?/iu,/\bwithout\b/iu];
const count = (value, needle) => String(value).split(needle).length - 1;
const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const signals = (value) => Object.values(P).filter((phrase) => String(value).includes(phrase));

for (const id of IDS) {
  const canonical = buildCanonicalV3(structuredClone(golden.cases[id].input));
  const before = {
    canonical: JSON.stringify(canonical),
    hard: JSON.stringify(canonical.hard_constraints),
    authorities: JSON.stringify(canonical.authorities),
    camera: JSON.stringify(canonical.camera),
    identity: JSON.stringify(canonical.identity)
  };
  const helper = describePostProcessing(canonical);
  const prompt = buildOpenAIImagePrompt(canonical);
  const selected = signals(helper);
  const limit = canonical.scene?.type === "vehicle" ? 1 : canonical.scene?.type === "room" ? 2 : 2;

  assert.ok(selected.length <= limit, `${id}: scene-specific phrase cap exceeded`);
  for (const phrase of selected) {
    assert.equal(count(helper, phrase), 1, `${id}: helper phrase duplicated`);
    assert.equal(count(prompt, phrase), 1, `${id}: prompt phrase duplicated`);
  }
  assert.equal(JSON.stringify(canonical), before.canonical, `${id}: canonical mutated`);
  assert.equal(JSON.stringify(canonical.hard_constraints), before.hard, `${id}: hard constraints mutated`);
  assert.equal(JSON.stringify(canonical.authorities), before.authorities, `${id}: authorities mutated`);
  assert.equal(JSON.stringify(canonical.camera), before.camera, `${id}: camera mutated`);
  assert.equal(JSON.stringify(canonical.identity), before.identity, `${id}: identity mutated`);
  assert.ok(words(prompt) <= 250, `${id}: prompt exceeds 250 words (${words(prompt)})`);
  for (const forbidden of FORBIDDEN) {
    assert.equal(forbidden.test(helper), false, `${id}: forbidden post-processing wording ${forbidden}`);
    assert.equal(forbidden.test(prompt), false, `${id}: forbidden prompt wording ${forbidden}`);
  }
  const repeated = Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical));
  assert.equal(repeated.every((value) => value === repeated[0]), true, `${id}: determinism failed`);
}

const base = (input) => buildCanonicalV3({ intentType:"selfie", scene:"street", lighting:"daylight", time:"day", ...input });
const vehicle = base({ intentType:"car", scene:"rangeRover" });
assert.deepEqual(signals(describePostProcessing(vehicle)), [P.dynamic], "vehicle scenes get exactly one highest-priority phrase");

const room = base({ intentType:"room", scene:"bedroom" });
assert.deepEqual(signals(describePostProcessing(room)), [P.dynamic, P.white_balance], "room scenes get the first two applicable phrases by priority");

const noDevice = structuredClone(base({}));
noDevice.camera.device_profile = "synthetic preview profile";
assert.deepEqual(signals(describePostProcessing(noDevice)), [P.white_balance], "lighting-only canonical uses white balance phrase");

const noLightSource = structuredClone(base({}));
noLightSource.lighting.source_type = null;
assert.deepEqual(signals(describePostProcessing(noLightSource)), [P.dynamic, P.texture], "preserved identity may supply texture phrase when white balance is unavailable");

const minimal = structuredClone(base({}));
minimal.camera.device_profile = "synthetic preview profile";
minimal.lighting.source_type = null;
minimal.identity.reference_mode = "none";
minimal.hard_constraints.identity.preserve_reference_identity = false;
assert.equal(describePostProcessing(minimal), "", "helper skips when no supported evidence exists");

console.log("✓ canonical-v3 post-processing layer contract passed");
