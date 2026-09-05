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
import { buildCanonicalV3 } from "../js/canonical-v3-engine.js";
import { buildOpenAIImagePrompt } from "../js/canonical/openai-image-adapter.js";
import { STUDIO_SECTION_OPTIONS } from "../js/studio-section-engine-v1.js";
import { VISIBLE_SCENE_KEYS } from "../js/phase22-ui-runtime.js";

assert.equal(ENGINE_STORAGE_KEY, "wikiprompt-selfie-studio:engine");
assert.deepEqual(resolvePromptEngineSelection(), { engine: LEGACY_ENGINE, source: "default", defaulted: true });
assert.deepEqual(resolvePromptEngineSelection({ search:"?engine=canonical-v3" }), { engine: CANONICAL_V3_ENGINE, source:"url", defaulted:false });
assert.deepEqual(resolvePromptEngineSelection({ storageValue:"canonical-v3" }), { engine: CANONICAL_V3_ENGINE, source:"localStorage", defaulted:false });
assert.deepEqual(resolvePromptEngineSelection({ search:"?engine=legacy", storageValue:"canonical-v3" }), { engine: LEGACY_ENGINE, source:"url", defaulted:false });
assert.deepEqual(resolvePromptEngineSelection({ search:"?engine=unknown", storageValue:"canonical-v3" }), { engine: CANONICAL_V3_ENGINE, source:"localStorage", defaulted:false });

const canonicalSelection = resolvePromptEngineSelection({ search:"?engine=canonical-v3" });
for (const [section, intent] of [
  ["solo", "selfie"], ["selfie", "selfie"], ["studio", "selfie"], ["car", "car"], ["carExterior", "carExterior"], ["group", "group"], ["accidental", "accidental"], ["bedroom", "room"], ["room", "room"], ["gym", "selfie"], ["street", "selfie"]
]) {
  assert.equal(isCanonicalV3Section(section), true, `${section} must be Canonical V3-capable`);
  assert.equal(canonicalIntentForSection(section), intent);
  assert.equal(shouldUseCanonicalV3(section, canonicalSelection), true);
}
for (const section of ["custom", ""]) assert.equal(isCanonicalV3Section(section), false, `${section || "empty"} must remain on legacy fallback`);
assert.equal(shouldUseCanonicalV3("gym", resolvePromptEngineSelection()), true, "gym auto-enables Canonical V3");
assert.equal(shouldUseCanonicalV3("street", resolvePromptEngineSelection()), true, "street auto-enables Canonical V3");
assert.equal(shouldUseCanonicalV3("car", resolvePromptEngineSelection()), false, "legacy is the default");

assert.equal(STUDIO_SECTION_OPTIONS.some((item) => item.value === "carExterior" && /سيلفي بجانب السيارة/u.test(item.label)), true);
assert.deepEqual(VISIBLE_SCENE_KEYS, ["bedroom","gym","street","rangeRover","majlis","kashta","barbershop","grocery","rooftop","streetFootball","gasStation"]);

const exteriorOutput = buildCanonicalV3UserOutput({
  studioSection:"carExterior",
  intentType:"carExterior",
  hasReference:true,
  carExteriorLocation:"grocery",
  carExteriorPose:"door-open",
  carExteriorLighting:"interior-spill",
  carExteriorClothing:"white-thobe",
  time:"night"
});
assert.equal(exteriorOutput.canonical.scene.id, "carExterior");
assert.equal(exteriorOutput.canonical.scene.facts.carExteriorLocation, "grocery");
assert.equal(exteriorOutput.canonical.scene.facts.carExteriorPose, "door-open");
assert.match(exteriorOutput.prompt, /Fuji White/iu);
assert.match(exteriorOutput.prompt, /small grocery/iu);
assert.match(exteriorOutput.prompt, /open driver door/iu);
assert.ok(exteriorOutput.prompt.trim().split(/\s+/u).filter(Boolean).length <= 250);

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
assert.equal(carOutput.canonical.scene.vehicle.make, "Land Rover");
assert.equal(carOutput.canonical.scene.vehicle.model, "Range Rover Sport Autobiography Dynamic");
assert.equal(carOutput.canonical.scene.vehicle.year, 2017);
assert.equal(carOutput.canonical.scene.vehicle.state, "stationary");
assert.deepEqual(carOutput.canonical.scene.facts, {
  exterior_color: "Fuji White",
  interior: "Ebony/Ivory luxury",
  seats: "Ivory perforated leather",
  console_trim: "dark wood veneer center console and door trim",
  steering_wheel: "black and Ivory leather multifunction",
  roof: "panoramic glass"
});
assert.match(carOutput.prompt, /Autobiography Dynamic/iu);
assert.match(carOutput.prompt, /Fuji White/iu);
assert.match(carOutput.prompt, /Ivory perforated leather/iu);
assert.match(carOutput.prompt, /dark wood veneer/iu);
assert.match(carOutput.prompt, /panoramic glass roof/iu);
assert.match(carOutput.prompt, /LHD vehicle-relative/iu);
assert.match(carOutput.prompt, /steering directly ahead of torso/iu);
assert.match(carOutput.prompt, /driver's door and side window appear on the right side of the image/iu);
assert.match(carOutput.prompt, /center console on the left side of the image/iu);
assert.equal(/\b2022\b/u.test(carOutput.prompt), false, "Range Rover prompt must not contain the superseded 2022 spec");
assert.equal(/\b2022\b/u.test(JSON.stringify(carOutput.canonical.scene)), false, "Range Rover canonical scene must not contain the superseded 2022 spec");

const golden = JSON.parse(fs.readFileSync(new URL("./golden/current-engine/legacy-v2-semantic-goldens.json", import.meta.url), "utf8"));
const goldenIds = ["car_lhd_driver_selfie","car_tight_crop","bedroom_direct_selfie","mirror_selfie","group_selfie","accidental_capture","identity_and_eyewear"];
const wordCount = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
for (const id of goldenIds) {
  const canonical = buildCanonicalV3(structuredClone(golden.cases[id].input));
  const beforeHardConstraints = JSON.stringify(canonical.hard_constraints);
  const prompt = buildOpenAIImagePrompt(canonical);
  assert.ok(wordCount(prompt) <= 250, `${id}: prompt exceeds 250 words (${wordCount(prompt)})`);
  assert.equal(JSON.stringify(canonical.hard_constraints), beforeHardConstraints, `${id}: hard constraints changed`);
  assert.equal(Object.isFrozen(canonical.hard_constraints), true, `${id}: hard constraints must remain frozen`);
  const repeated = Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical));
  assert.equal(repeated.every((value) => value === repeated[0]), true, `${id}: determinism failed`);
}

const gateSource = fs.readFileSync(new URL("../js/canonical/engine-gate.js", import.meta.url), "utf8");
assert.match(gateSource, /buildCanonicalV3UserOutput\(rawState, rawState\.sceneFacts\)/u, "UI gate must call the canonical resolver/build/adapter pipeline");
assert.match(gateSource, /await import\("\.\.\/physics-app-v7\.js\?v=20260903-json-clean2"\)/u, "legacy application must remain loaded and available");
assert.match(gateSource, /event\.stopImmediatePropagation\(\)/u, "canonical submit must prevent the legacy submit renderer from replacing canonical output");

const indexSource = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
assert.match(indexSource, /js\/canonical\/engine-gate\.js\?v=20260903-phase6/u, "live page must load the Phase 6 gate");
assert.equal(/<script type="module" src="js\/physics-app-v7\.js\?v=20260903-json-clean2"><\/script>/u.test(indexSource), false, "index must not bypass the gate");

console.log("✓ canonical-v3 feature flag, Phase 22 UI routing, and 2017 Range Rover spec contract passed");
