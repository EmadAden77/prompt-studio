import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";
import { resolveClothingText } from "../js/clothing-authority.js";

const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const phase22Source = readFileSync(new URL("../js/phase22-ui-runtime.js", import.meta.url), "utf8");
const pipelineSource = readFileSync(new URL("../js/canonical/canonical-v3-pipeline.js", import.meta.url), "utf8");
const authoritySource = readFileSync(new URL("../js/clothing-authority.js", import.meta.url), "utf8");
const carAuthoritySource = readFileSync(new URL("../js/car-exterior-authority.js", import.meta.url), "utf8");

assert.equal(existsSync(new URL("../js/phase30-clothing-catalog.js", import.meta.url)), false, "Phase 30 clothing facade must stay deleted");
assert.doesNotMatch(authoritySource, /canonical-v3-pipeline|canonical\/canonical-v3-pipeline/iu);
for (const sample of [undefined, null, "", "missing-value", {}, [], 0, false]) {
  assert.doesNotThrow(() => resolveClothingText(sample, {}));
  assert.equal(typeof resolveClothingText(sample, {}), "string");
}
assert.doesNotThrow(() => resolveClothingText("custom", null));

assert.match(phase22Source, /CLOTHING_CATALOG/u, "authority-backed clothing catalog missing");
assert.doesNotMatch(phase22Source, /makeCatalogSelect\("car-exterior-clothing"/u, "must not recreate the duplicate carExterior clothing select");
assert.match(phase22Source, /getCarExteriorLocationOptions/u);
assert.match(phase22Source, /getCarExteriorPoseOptions/u);
assert.match(phase22Source, /getCarExteriorLightingOptions/u);
assert.match(carAuthoritySource, /CAR_EXTERIOR_LOCATIONS/u);
assert.match(carAuthoritySource, /CAR_EXTERIOR_POSES/u);
assert.match(pipelineSource, /studioSection:\s*"carExterior"/u);
assert.match(pipelineSource, /scene:\s*"carExterior"/u);
assert.match(pipelineSource, /raw\.clothing\s*\|\|\s*\(raw\.studioSection\s*===\s*"carExterior"\s*\?\s*raw\.carExteriorClothing/u, "visible clothing must be authoritative with legacy fallback only");
assert.doesNotMatch(pipelineSource, /phase30-clothing-catalog\.js/u);

const smokeInput = {
  studioSection:"carExterior", scene:"carExterior", time:"night", hasReference:true, expression:"neutral",
  clothing:"thobe-redshemagh-iqal", carExteriorClothing:"home-sleep-white-gray",
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
console.log("✓ Phase 35 runtime smoke preserved under Phase 40 carExterior authority");
