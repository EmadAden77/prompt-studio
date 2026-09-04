import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { buildCanonicalV3 } from "../js/canonical-v3-engine.js";
import {
  buildOpenAIImagePrompt,
  describeNaturalImperfections
} from "../js/canonical/openai-image-adapter.js";

const GOLDEN_URL = new URL("./golden/current-engine/legacy-v2-semantic-goldens.json", import.meta.url);
const golden = JSON.parse(fs.readFileSync(fileURLToPath(GOLDEN_URL), "utf8"));

const GOLDEN_CASE_IDS = [
  "car_lhd_driver_selfie",
  "car_tight_crop",
  "bedroom_direct_selfie",
  "mirror_selfie",
  "group_selfie",
  "accidental_capture",
  "identity_and_eyewear"
];

const REALISM_PHRASES = [
  "Subtle skin texture with natural pores.",
  "Natural hair flyaways and loose strands.",
  "Natural fabric wrinkles and folds.",
  "Natural body proportions consistent with the environment."
];

const FORBIDDEN_NEGATIVE_PHRASES = [
  /\bDO NOT\b/iu,
  /\bMUST\b/iu,
  /\bIMPORTANT\b/iu,
  /\bNEVER\b/iu,
  /\bQA\b/iu,
  /\bdebug\b/iu,
  /hard_constraints/iu,
  /adapter_can_modify/iu
];

function count(value, needle) {
  return String(value).split(needle).length - 1;
}

function wordCount(value) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized.split(/\s+/u).length : 0;
}

function realismSignals(value) {
  return REALISM_PHRASES.filter((phrase) => String(value).includes(phrase));
}

for (const id of GOLDEN_CASE_IDS) {
  const input = golden.cases[id]?.input;
  assert.ok(input, `${id}: missing golden input`);

  const canonical = buildCanonicalV3(structuredClone(input));
  const beforeCanonical = JSON.stringify(canonical);
  const beforeHardConstraints = JSON.stringify(canonical.hard_constraints);
  const helperOutput = describeNaturalImperfections(canonical);
  const prompt = buildOpenAIImagePrompt(canonical);

  assert.equal(JSON.stringify(canonical), beforeCanonical, `${id}: adapter must not mutate Canonical V3 state`);
  assert.equal(JSON.stringify(canonical.hard_constraints), beforeHardConstraints, `${id}: adapter must not mutate hard constraints`);
  assert.equal(Object.isFrozen(canonical.hard_constraints), true, `${id}: hard constraints must remain frozen`);

  const signals = realismSignals(helperOutput);
  assert.ok(signals.length >= 1, `${id}: imperfection helper must emit a realism signal`);
  assert.ok(signals.length <= 3, `${id}: imperfection helper must stay sparse`);
  assert.deepEqual(realismSignals(prompt), signals, `${id}: prompt must include the helper's realism signals exactly once`);
  for (const phrase of signals) {
    assert.equal(count(helperOutput, phrase), 1, `${id}: helper must emit each realism phrase once`);
    assert.equal(count(prompt, phrase), 1, `${id}: prompt must emit each realism phrase once`);
  }

  assert.ok(wordCount(prompt) <= 250, `${id}: prompt must stay at or below 250 words`);
  for (const forbidden of FORBIDDEN_NEGATIVE_PHRASES) {
    assert.equal(forbidden.test(prompt), false, `${id}: prompt contains forbidden negative or debug text: ${forbidden}`);
  }

  const repeated = Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical));
  assert.equal(repeated.filter((value) => value === repeated[0]).length, 10, `${id}: adapter output must be deterministic 10/10`);
}

const noApplicableCanonical = structuredClone(buildCanonicalV3({
  intentType: "selfie",
  scene: "street",
  clothing: "",
  preserveEnvironmentScale: false
}));
noApplicableCanonical.subjects.primary.clothing = {
  garment: "unspecified garment",
  fabric: null,
  fabric_weight: null,
  fit: null,
  wear_state: null,
  custom_modifier: null
};
assert.equal(describeNaturalImperfections(noApplicableCanonical), "", "helper must omit itself when no imperfection category applies");

const fabricCanonical = buildCanonicalV3({
  intentType: "selfie",
  scene: "street",
  clothing: "shirt",
  fabric: "cotton"
});
assert.match(describeNaturalImperfections(fabricCanonical), /Natural fabric wrinkles and folds\./u, "fabric wording requires an explicit fabric field");

const denseCanonical = buildCanonicalV3({
  intentType: "selfie",
  scene: "street",
  hasReference: true,
  clothing: "shirt",
  fabric: "cotton"
});
assert.equal(realismSignals(describeNaturalImperfections(denseCanonical)).length, 3, "helper must cap all applicable categories at three phrases");

const noReferenceCanonical = buildCanonicalV3({
  intentType: "selfie",
  scene: "street",
  clothing: "shirt"
});
const noReferenceImperfections = describeNaturalImperfections(noReferenceCanonical);
assert.equal(noReferenceImperfections.includes("Subtle skin texture with natural pores."), false, "skin texture wording requires a preserved identity reference");
assert.equal(noReferenceImperfections.includes("Natural hair flyaways and loose strands."), false, "hair wording requires preserved hair identity");
assert.equal(noReferenceImperfections.includes("Natural fabric wrinkles and folds."), false, "fabric wording requires an explicit fabric field");

console.log("✓ canonical-v3 natural imperfection layer contract passed");
