import assert from "node:assert/strict";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";
import { FULL_OUTFITS, TRADITIONAL, resolveClothingText } from "../js/clothing-authority.js";

const sections = ["solo", "selfie", "bedroom", "gym", "street", "carExterior", "car", "group", "accidental"];
const colored = FULL_OUTFITS.flatMap((group) => group.options || []).filter((item) => item?.value && item.value !== "custom").slice(0, 6);
const traditional = Object.entries(TRADITIONAL).map(([value, text]) => ({ value, text }));
const exactCount = (text, needle) => String(text).split(needle).length - 1;
const words = (text) => String(text).trim().split(/\s+/u).filter(Boolean).length;

assert.ok(colored.length >= 6, "Phase 38 requires representatives from the six colored outfit groups");
assert.ok(traditional.length >= 4, "Traditional clothing catalog must remain available");

for (const section of sections) {
  for (const item of colored) {
    const expected = resolveClothingText(item.value, { clothing:item.value });
    const input = {
      studioSection:section,
      clothing:item.value,
      scene:section === "car" ? "rangeRover" : section === "bedroom" ? "bedroom" : section === "gym" ? "gym" : "street",
      time:"day",
      carExteriorLocation:"villa",
      carExteriorPose:"front-grille"
    };
    const first = buildCanonicalV3UserOutput(input);
    const second = buildCanonicalV3UserOutput(input);
    assert.ok(first.prompt.includes(expected), `${section}: colored clothing must survive final prompt routing (${item.value})`);
    assert.equal(first.prompt, second.prompt, `${section}: output must be deterministic (${item.value})`);
    assert.doesNotMatch(first.prompt, /selected\s+[\w-]+/iu, `${section}: generic selected-X fallback must never return`);
  }
}

const customText = "a user-authored charcoal overshirt over a muted olive cotton T-shirt with straight black trousers";
for (const section of sections) {
  const result = buildCanonicalV3UserOutput({
    studioSection:section,
    clothing:"custom",
    customClothing:customText,
    scene:section === "car" ? "rangeRover" : "street",
    time:"day",
    carExteriorLocation:"villa",
    carExteriorPose:"door-lean"
  });
  assert.ok(result.prompt.includes(customText), `${section}: customClothing must survive verbatim`);
}

for (const item of traditional) {
  const result = buildCanonicalV3UserOutput({ studioSection:"carExterior", clothing:item.value, time:"day", carExteriorLocation:"villa", carExteriorPose:"door-lean" });
  assert.ok(result.prompt.includes(item.text), `carExterior: traditional clothing must resolve (${item.value})`);
}

const night = buildCanonicalV3UserOutput({
  studioSection:"carExterior",
  clothing:colored[0].value,
  time:"night",
  carExteriorLocation:"villa",
  carExteriorPose:"front-grille"
});
assert.equal(night.canonical?.scene?.id, "carExterior", "carExterior route must remain canonical");
assert.ok(night.canonical?.lighting, "night carExterior must retain canonical lighting data");
assert.ok(String(night.prompt).toLowerCase().includes("light"), "night carExterior final prompt must retain lighting language");
assert.ok(words(night.prompt) <= 280, "carExterior final prompt must remain within the exported 280-word hard ceiling");

const grilleSentence = "standing beside the front grille";
assert.ok(exactCount(night.prompt, grilleSentence) <= 1, "carExterior pose sentence must not duplicate");

const legacy = buildCanonicalV3UserOutput({
  studioSection:"carExterior",
  clothing:colored[0].value,
  carExteriorClothing:colored[1].value,
  time:"day",
  carExteriorLocation:"villa",
  carExteriorPose:"door-lean"
});
const legacyExpected = resolveClothingText(colored[1].value, { clothing:colored[0].value, carExteriorClothing:colored[1].value });
assert.ok(legacy.prompt.includes(legacyExpected), "legacy carExteriorClothing compatibility must remain explicit until intentionally retired");

console.log("Phase 38 post-Phase-37 output audit passed");
