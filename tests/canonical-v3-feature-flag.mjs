import assert from "node:assert/strict";
import fs from "node:fs";
import {
  CANONICAL_V3_ENGINE,
  ENGINE_STORAGE_KEY,
  LEGACY_ENGINE,
  canonicalIntentForSection,
  isCanonicalV3Section,
  resolvePromptEngineSelection,
  shouldUseCanonicalV3
} from "../js/canonical/engine-feature-flag.js";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";

assert.equal(ENGINE_STORAGE_KEY, "wikiprompt-selfie-studio:engine");
assert.deepEqual(resolvePromptEngineSelection(), { engine: LEGACY_ENGINE, source: "default", defaulted: true });
assert.deepEqual(resolvePromptEngineSelection({ search:"?engine=canonical-v3" }), { engine: CANONICAL_V3_ENGINE, source:"url", defaulted:false });
assert.deepEqual(resolvePromptEngineSelection({ storageValue:"canonical-v3" }), { engine: CANONICAL_V3_ENGINE, source:"localStorage", defaulted:false });
assert.deepEqual(resolvePromptEngineSelection({ search:"?engine=legacy", storageValue:"canonical-v3" }), { engine: LEGACY_ENGINE, source:"url", defaulted:false });
assert.deepEqual(resolvePromptEngineSelection({ search:"?engine=unknown", storageValue:"canonical-v3" }), { engine: CANONICAL_V3_ENGINE, source:"localStorage", defaulted:false });

const canonicalSelection = resolvePromptEngineSelection({ search:"?engine=canonical-v3" });
for (const [section, intent] of [
  ["solo", "selfie"], ["selfie", "selfie"], ["studio", "selfie"], ["car", "car"], ["group", "group"], ["accidental", "accidental"], ["bedroom", "room"], ["room", "room"]
]) {
  assert.equal(isCanonicalV3Section(section), true, `${section} must be Canonical V3-capable`);
  assert.equal(canonicalIntentForSection(section), intent);
  assert.equal(shouldUseCanonicalV3(section, canonicalSelection), true);
}
for (const section of ["gym", "street", "custom", ""]) assert.equal(isCanonicalV3Section(section), false, `${section || "empty"} must remain on legacy fallback`);
assert.equal(shouldUseCanonicalV3("car", resolvePromptEngineSelection()), false, "legacy is the default");

const carOutput = buildCanonicalV3UserOutput({
  studioSection:"car",
  intentType:"car",
  scene:"rangeRover",
  hasReference:true,
  selfieAngle:"three-quarter",
  composition:"close",
  lighting:"car-day-window"
});
assert.equal(carOutput.canonical.schema_version, "realistic-image-generator/canonical-v3");
assert.equal(carOutput.canonical.intent.type, "car");
assert.equal(Object.isFrozen(carOutput.canonical), true);
assert.equal(carOutput.canonical.hard_constraints.vehicle_geometry.adapter_can_modify, false);
assert.match(carOutput.prompt, /LHD vehicle-relative/iu);
assert.match(carOutput.prompt, /steering directly ahead of torso/iu);
assert.match(carOutput.prompt, /Ivory cream leather/iu);
assert.match(carOutput.prompt, /dark walnut/iu);
assert.match(carOutput.prompt, /driver's door and side window appear on the right side of the image/iu);
assert.match(carOutput.prompt, /center console on the left side of the image/iu);

const gateSource = fs.readFileSync(new URL("../js/canonical/engine-gate.js", import.meta.url), "utf8");
assert.match(gateSource, /buildCanonicalV3UserOutput\(rawState, rawState\.sceneFacts\)/u, "UI gate must call the canonical resolver/build/adapter pipeline");
assert.match(gateSource, /await import\("\.\.\/physics-app-v7\.js\?v=20260903-json-clean2"\)/u, "legacy application must remain loaded and available");
assert.match(gateSource, /event\.stopImmediatePropagation\(\)/u, "canonical submit must prevent the legacy submit renderer from replacing canonical output");

const indexSource = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
assert.match(indexSource, /js\/canonical\/engine-gate\.js\?v=20260903-phase6/u, "live page must load the Phase 6 gate");
assert.equal(/<script type="module" src="js\/physics-app-v7\.js\?v=20260903-json-clean2"><\/script>/u.test(indexSource), false, "index must not bypass the gate");

console.log("✓ canonical-v3 feature flag and parallel UI gate passed");
