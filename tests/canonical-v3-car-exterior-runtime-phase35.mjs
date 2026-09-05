import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";
import { resolveClothingText } from "../js/phase30-clothing-catalog.js";

const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;

const phase30Source = readFileSync(new URL("../js/phase30-clothing-catalog.js", import.meta.url), "utf8");
const phase22Source = readFileSync(new URL("../js/phase22-ui-runtime.js", import.meta.url), "utf8");
const pipelineSource = readFileSync(new URL("../js/canonical/canonical-v3-pipeline.js", import.meta.url), "utf8");

assert.doesNotMatch(
  phase30Source,
  /canonical-v3-pipeline|canonical\/canonical-v3-pipeline/iu,
  "Phase 35: phase30 clothing catalog must not import the canonical pipeline"
);
assert.match(phase30Source, /from\s+["']\.\/data\.js["']/u, "Phase 35: phase30 must depend only on the data leaf for scene lookup");

for (const sample of [undefined, null, "", "missing-value", {}, [], 0, false]) {
  assert.doesNotThrow(() => resolveClothingText(sample, {}), "Phase 35: resolveClothingText must never throw for malformed selections");
  assert.ok(String(resolveClothingText(sample, {})).trim(), "Phase 35: resolver fallback must always be non-empty");
}
assert.doesNotThrow(() => resolveClothingText("custom", null), "Phase 35: custom resolver must tolerate null raw input");

assert.match(phase22Source, /id,\s*name,\s*title,\s*catalog/iu, "Phase 35: dedicated catalog select factory missing");
assert.match(phase22Source, /"car-exterior-clothing",\s*"carExteriorClothing"/u, "Phase 35: dedicated carExterior clothing select missing");
assert.match(phase22Source, /standardClothing\.disabled\s*=\s*active/u, "Phase 35: standard clothing select must be disabled in carExterior");
assert.match(phase22Source, /carClothing\.disabled\s*=\s*!active/u, "Phase 35: carExterior clothing select enablement missing");
assert.match(phase22Source, /standardClothingField\.hidden\s*=\s*active/u, "Phase 35: standard clothing field must be hidden in carExterior");
assert.match(phase22Source, /carClothingField\.hidden\s*=\s*!active/u, "Phase 35: dedicated clothing field must be visible only in carExterior");
assert.match(phase22Source, /CAR_EXTERIOR_LOCATIONS/u, "Phase 35: location control lost");
assert.match(phase22Source, /CAR_EXTERIOR_POSES/u, "Phase 35: pose control lost");
assert.match(phase22Source, /carLightingOptions\(\)/u, "Phase 35: lighting control lost");

assert.match(pipelineSource, /studioSection:\s*"carExterior"/u, "Phase 35: phase22Input must retain carExterior studio section");
assert.match(pipelineSource, /scene:\s*"carExterior"/u, "Phase 35: phase22Input must force scene=carExterior");
assert.match(pipelineSource, /raw\.carExteriorClothing\s*\|\|\s*raw\.clothing/u, "Phase 35: carExterior clothing precedence missing");

const smokeInput = {
  studioSection:"carExterior",
  scene:"carExterior",
  intentType:"selfie",
  time:"night",
  hasReference:true,
  expression:"neutral",
  clothing:"home-sleep-white-gray",
  carExteriorClothing:"thobe-redshemagh-iqal",
  carExteriorLocation:"reststop",
  carExteriorPose:"front-grille",
  carExteriorLighting:"streetlight-reflection",
  fabric:"cotton",
  fabricWeight:"light",
  ironState:"lightly-unpressed",
  wearState:"normal-day",
  clothingFit:"regular"
};

const outputs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(smokeInput));
const first = outputs[0];
assert.ok(first.prompt.trim(), "Phase 35: carExterior smoke prompt must be non-empty");
assert.ok(outputs.every((output) => output.prompt === first.prompt), "Phase 35: determinism must be 10/10");
assert.match(first.prompt, /2017 Range Rover Sport Autobiography Dynamic/iu, "Phase 35: 2017 Range Rover spec missing");
assert.match(first.prompt, /Fuji White/iu, "Phase 35: Fuji White missing");
assert.match(first.prompt, /white thobe/iu, "Phase 35: resolved white thobe missing");
assert.match(first.prompt, /red-and-white fine checkered shemagh/iu, "Phase 35: shemagh headwear lock missing");
assert.match(first.prompt, /black doubled-cord iqal/iu, "Phase 35: iqal headwear lock missing");
assert.doesNotMatch(first.prompt, /sleep/iu, "Phase 35: hidden sleep clothing leaked into carExterior prompt");
assert.ok(words(first.prompt) <= 250, `Phase 35: smoke prompt exceeds 250 words (${words(first.prompt)})`);
assert.equal(first.canonical.scene.id, "carExterior", "Phase 35: canonical scene must remain carExterior");

console.log(`PHASE35_SMOKE_WORDS=${words(first.prompt)}`);
console.log("PHASE35_DETERMINISM=10/10");
console.log(`PHASE35_SMOKE_PROMPT=${first.prompt}`);
console.log("✓ Phase 35 carExterior runtime repair smoke contracts passed");
