import assert from "node:assert/strict";
import {
  FULL_OUTFITS,
  CLOTHING_CATALOG,
  getClothingOptions,
  resolveClothingText
} from "../js/clothing-authority.js";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";

const COLOR_WORD = /\b(?:black|white|gray|grey|navy|beige|brown|blue|red|olive)\b/iu;
const ARABIC = /[\u0600-\u06FF]/u;
const ENGLISH_START = /^[A-Za-z]/u;
const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;

const allFullOutfits = Object.values(FULL_OUTFITS).flat();
assert.equal(allFullOutfits.length, 90, "Phase 38 requires all 90 full outfits");

for (const item of allFullOutfits) {
  assert.match(item.text, ENGLISH_START, `${item.value}: prompt text must start with an English letter`);
  assert.match(item.text, COLOR_WORD, `${item.value}: prompt text must retain at least one explicit English color word`);
  assert.match(item.label, ARABIC, `${item.value}: UI label must remain Arabic`);
}

assert.equal(getClothingOptions()[0]?.value, "custom", "custom clothing must be the first top-level option");
assert.ok(
  CLOTHING_CATALOG.every((section) => section.options.every((option) => option.value !== "custom")),
  "custom clothing must not be nested inside any section"
);

// Required translation examples remain exact in the authority catalog.
assert.equal(
  resolveClothingText("casual-tee-black-jeans-blue", { clothing:"casual-tee-black-jeans-blue" }),
  "heavy black cotton T-shirt with dark blue jeans"
);
assert.equal(
  resolveClothingText("formal-poplin-white-suit-black", { clothing:"formal-poplin-white-suit-black" }),
  "pressed white poplin shirt with black suit trousers"
);

// Use an outfit whose punctuation is untouched by the legacy adapter's humanizer so the
// final-prompt containment assertion is byte-for-byte, not merely semantic.
const outfitValue = "sport-tracksuit-olive";
const outfitText = resolveClothingText(outfitValue, { clothing:outfitValue });
assert.equal(outfitText, "olive training hoodie with matching olive jogger pants");

const input = {
  studioSection:"carExterior",
  clothing:outfitValue,
  time:"day",
  carExteriorLocation:"villa",
  carExteriorPose:"door-lean",
  hasReference:true
};

const runs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(input));
assert.ok(runs.every((item) => item.prompt === runs[0].prompt), "Phase 38 output must be deterministic 10/10");
assert.ok(runs[0].prompt.includes(outfitText), "carExterior final prompt must contain the English full-outfit text");
assert.ok(words(runs[0].prompt) <= 250, "Phase 38 carExterior prompt must remain <=250 words");

const control = buildCanonicalV3UserOutput({ ...input, clothing:"thobe-white" });
assert.deepEqual(
  runs[0].canonical.hard_constraints,
  control.canonical.hard_constraints,
  "English outfit prompt text must not alter hard constraints"
);

console.log(`PHASE38_FULL_OUTFITS=${allFullOutfits.length}`);
console.log(`PHASE38_SAMPLE_WORDS=${words(runs[0].prompt)}`);
console.log(`PHASE38_SAMPLE_PROMPT=${runs[0].prompt}`);
console.log("PHASE38_DETERMINISM=10/10");
console.log("✓ Phase 38 English outfit prompt texts with Arabic UI labels passed");
