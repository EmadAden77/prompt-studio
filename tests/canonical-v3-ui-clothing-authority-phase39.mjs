import assert from "node:assert/strict";
import fs from "node:fs";
import {
  CLOTHING_CATALOG,
  CLOTHING_TOP_OPTIONS,
  getClothingOptions,
  resolveClothingText
} from "../js/clothing-authority.js";
import {
  garmentOptionsForSection,
  shouldShowCustomClothing
} from "../js/phase22-ui-runtime.js";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";

const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const uiSource = fs.readFileSync(new URL("../js/phase22-ui-runtime.js", import.meta.url), "utf8");
const pipelineSource = fs.readFileSync(new URL("../js/canonical/canonical-v3-pipeline.js", import.meta.url), "utf8");
const fullOptions = getClothingOptions();

assert.ok(fullOptions.length >= 90, `authority catalog must expose 90+ options, got ${fullOptions.length}`);
assert.equal(CLOTHING_TOP_OPTIONS[0]?.value, "custom", "custom must remain the first top-level clothing option");
for (const section of CLOTHING_CATALOG) {
  assert.ok(section.id && section.label && Array.isArray(section.options), `${section.id || "unknown"}: invalid catalog structure`);
}

for (const section of ["bedroom", "gym", "street", "carExterior"]) {
  const options = garmentOptionsForSection(section, "");
  assert.ok(options.length >= 90, `${section}: clothing select must expose the 90+ authority catalog`);
  assert.equal(options[0]?.value, "custom", `${section}: custom must be the first option`);
  assert.ok(options.some((option) => option.value === "sport-tracksuit-olive"), `${section}: authority outfit missing`);
}

assert.equal(shouldShowCustomClothing("custom"), true, "selecting custom must show the custom clothing input");
assert.equal(shouldShowCustomClothing("sport-tracksuit-olive"), false, "normal outfit must hide the custom clothing input");
assert.match(uiSource, /id\s*=\s*"custom-clothing-field"/u, "Phase 22 UI must create the custom input field");
assert.match(uiSource, /field\.hidden\s*=\s*!shouldShowCustomClothing/u, "custom field visibility must be driven by the selected clothing value");
assert.match(uiSource, /CLOTHING_CATALOG\s+as\s+UNIFIED_CLOTHING_CATALOG/u, "UI must import the authority catalog directly");
assert.match(uiSource, /getClothingOptions\s+as\s+getUnifiedClothingOptions/u, "UI must import the authority option helper directly");
assert.match(uiSource, /let\s+rememberedClothingValue\s*=\s*""/u, "mobile/native select choice must have an authority-backed remembered value");
assert.match(uiSource, /event\.target\?\.id\s*!==\s*"clothing"[\s\S]*rememberedClothingValue\s*=\s*event\.target\.value[\s\S]*\},\s*true\);/u, "clothing choice must be captured before legacy target listeners can repopulate the select");
assert.match(uiSource, /const\s+preferred\s*=\s*rememberedClothingValue\s*\|\|\s*select\.value/u, "authority select refresh must restore the remembered mobile choice");
assert.match(uiSource, /else\s+setTimeout\(\(\)\s*=>\s*\{[\s\S]*syncGarmentSelect\(\)/u, "non-clothing field changes must not erase the selected authority outfit");
assert.doesNotMatch(uiSource, /phase30-clothing-catalog\.js/u, "UI must not import Phase 30 legacy catalog");
assert.doesNotMatch(pipelineSource, /phase30-clothing-catalog\.js/u, "pipeline must not import Phase 30 legacy catalog");
assert.equal(fs.existsSync(new URL("../js/phase30-clothing-catalog.js", import.meta.url)), false, "legacy Phase 30 catalog file must be deleted");

const outfitValue = "sport-tracksuit-olive";
const outfitText = resolveClothingText(outfitValue, { clothing:outfitValue });
assert.equal(outfitText, "olive training hoodie with matching olive jogger pants");

const sampleInput = {
  studioSection:"carExterior",
  clothing:outfitValue,
  time:"day",
  carExteriorLocation:"villa",
  carExteriorPose:"door-lean",
  hasReference:true
};
const runs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(sampleInput));
assert.ok(runs.every((item) => item.prompt === runs[0].prompt), "Phase 39 output must be deterministic 10/10");
assert.ok(runs[0].prompt.includes(outfitText), "selected authority outfit English text must flow into the prompt");
assert.ok(words(runs[0].prompt) <= 250, `Phase 39 prompt exceeds 250 words (${words(runs[0].prompt)})`);

const control = buildCanonicalV3UserOutput({ ...sampleInput, clothing:"thobe-white" });
assert.deepEqual(
  runs[0].canonical.hard_constraints,
  control.canonical.hard_constraints,
  "UI clothing authority unification must not alter hard constraints"
);

console.log(`PHASE39_OPTIONS=${fullOptions.length}`);
console.log(`PHASE39_SAMPLE_WORDS=${words(runs[0].prompt)}`);
console.log(`PHASE39_SAMPLE_PROMPT=${runs[0].prompt}`);
console.log("PHASE39_DETERMINISM=10/10");
console.log("PHASE40_MOBILE_CLOTHING_PERSISTENCE=PASS");
console.log("✓ Phase 39 unified UI clothing authority passed with Phase 40 mobile selection persistence");
