import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";
import { resolveClothingText } from "../js/phase30-clothing-catalog.js";

const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const phase30Source = readFileSync(new URL("../js/phase30-clothing-catalog.js", import.meta.url), "utf8");
const phase22Source = readFileSync(new URL("../js/phase22-ui-runtime.js", import.meta.url), "utf8");
const pipelineSource = readFileSync(new URL("../js/canonical/canonical-v3-pipeline.js", import.meta.url), "utf8");

assert.doesNotMatch(phase30Source, /canonical-v3-pipeline|canonical\/canonical-v3-pipeline/iu);
assert.match(phase30Source, /from\s+["']\.\/data\.js["']/u);
for (const sample of [undefined, null, "", "missing-value", {}, [], 0, false]) {
  assert.doesNotThrow(() => resolveClothingText(sample, {}));
  assert.ok(String(resolveClothingText(sample, {})).trim());
}
assert.doesNotThrow(() => resolveClothingText("custom", null));

assert.match(phase22Source, /CLOTHING_CATALOG/u, "Phase 37 authority-backed clothing catalog missing");
assert.doesNotMatch(phase22Source, /makeCatalogSelect\("car-exterior-clothing"/u, "Phase 37 must not recreate the duplicate carExterior clothing select");
assert.match(phase22Source, /CAR_EXTERIOR_LOCATIONS/u);
assert.match(phase22Source, /CAR_EXTERIOR_POSES/u);
assert.match(phase22Source, /carLightingOptions\(\)/u);
assert.match(pipelineSource, /studioSection:\s*"carExterior"/u);
assert.match(pipelineSource, /scene:\s*"carExterior"/u);
assert.match(pipelineSource, /raw\.carExteriorClothing\s*\|\|\s*raw\.clothing/u);

const smokeInput = {
  studioSection:"carExterior", scene:"carExterior", time:"night", hasReference:true, expression:"neutral",
  clothing:"home-sleep-white-gray", carExteriorClothing:"thobe-redshemagh-iqal",
  carExteriorLocation:"reststop", carExteriorPose:"front-grille", carExteriorLighting:"streetlight-reflection",
  fabric:"cotton", fabricWeight:"light", ironState:"lightly-unpressed", wearState:"normal-day", clothingFit:"regular"
};
const outputs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(smokeInput));
const first = outputs[0];
assert.ok(first.prompt.trim());
assert.ok(outputs.every((output) => output.prompt === first.prompt));
assert.match(first.prompt, /2017 Range Rover Sport Autobiography Dynamic/iu);
assert.match(first.prompt, /Fuji White/iu);
assert.match(first.prompt, /white thobe/iu);
assert.match(first.prompt, /red-and-white fine checkered shemagh/iu);
assert.match(first.prompt, /black doubled-cord iqal/iu);
assert.doesNotMatch(first.prompt, /sleep/iu);
assert.ok(words(first.prompt) <= 250);
assert.equal(first.canonical.scene.id, "carExterior");
console.log(`PHASE35_SMOKE_WORDS=${words(first.prompt)}`);
console.log("PHASE35_DETERMINISM=10/10");
console.log("✓ Phase 35 runtime smoke preserved under Phase 37 UI de-conflict");
