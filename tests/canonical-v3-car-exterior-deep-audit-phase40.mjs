import assert from "node:assert/strict";
import fs from "node:fs";
import {
  getCarExteriorLightingOptions,
  getCarExteriorLocationOptions,
  getCarExteriorPoseOptions,
  resolveCarExteriorSelection
} from "../js/car-exterior-authority.js";
import { resolveClothingText } from "../js/clothing-authority.js";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";
import {
  buildOpenAIImagePrompt,
  IDENTITY_STRICT_LOCK,
  SELFIE_ARM_LOCK
} from "../js/canonical/openai-image-adapter-phase36.js";
import { resolvePromptEngineSelection, shouldUseCanonicalV3 } from "../js/canonical/engine-feature-flag.js";

const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const firstSentence = (value) => String(value ?? "").match(/^[^.!?]+[.!?]/u)?.[0]?.trim() || "";
const sentenceParts = (value) => String(value ?? "").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map((part) => part.replace(/\s+/gu, " ").trim()).filter(Boolean) || [];
const withoutSelfieLock = (value) => String(value ?? "").replace(SELFIE_ARM_LOCK, "");
const assertNoExactDuplicateSentences = (prompt) => assert.equal(new Set(sentenceParts(prompt)).size, sentenceParts(prompt).length, "Phase 40: duplicate sentence found");

assert.equal(shouldUseCanonicalV3("carExterior", resolvePromptEngineSelection()), true, "carExterior must always use hardened Canonical V3 even when global default is legacy");

const locations = getCarExteriorLocationOptions();
const poses = getCarExteriorPoseOptions();
assert.equal(locations.length, 6, "carExterior must expose all six location choices");
assert.ok(poses.length >= 7, "carExterior must retain the physically valid pose catalog");
assert.equal(poses.some((item) => item.value === "key-fob"), false, "key-fob must not be selectable in a strict one-arm selfie because it occupies the free hand");

const dayLights = getCarExteriorLightingOptions({ time:"day", location:"villa", pose:"door-open" });
assert.equal(dayLights.length, 3, "all three day lighting choices must remain available");
const incompatibleNight = getCarExteriorLightingOptions({ time:"night", location:"parking", pose:"front-grille" });
assert.equal(incompatibleNight.some((item) => item.value === "villa-porch"), false, "villa porch lighting must not appear away from a villa");
assert.equal(incompatibleNight.some((item) => item.value === "interior-spill"), false, "interior spill must not appear with a closed-door pose");
const compatibleNight = getCarExteriorLightingOptions({ time:"night", location:"villa", pose:"door-open" });
assert.equal(compatibleNight.some((item) => item.value === "villa-porch"), true, "villa porch lighting must remain available at a villa");
assert.equal(compatibleNight.some((item) => item.value === "interior-spill"), true, "interior spill must remain available when the driver door is open");

const invalidSelection = resolveCarExteriorSelection({
  time:"night",
  carExteriorLocation:"parking",
  carExteriorPose:"key-fob",
  carExteriorLighting:"interior-spill"
});
assert.equal(invalidSelection.location, "parking");
assert.equal(invalidSelection.pose, "door-lean", "forbidden selfie pose must fall back deterministically");
assert.notEqual(invalidSelection.lighting, "interior-spill", "incompatible lighting must fall back to a compatible option");

const uiSource = fs.readFileSync(new URL("../js/phase22-ui-runtime.js", import.meta.url), "utf8");
assert.match(uiSource, /car-exterior-authority\.js/u, "carExterior UI must use the dedicated de-conflict authority");
assert.match(uiSource, /getCarExteriorLocationOptions/u);
assert.match(uiSource, /getCarExteriorPoseOptions/u);
assert.match(uiSource, /getCarExteriorLightingOptions/u);
assert.match(uiSource, /setControlFieldState\(document\.querySelector\("#lighting"\), active\)/u, "generic lighting must be hidden/disabled in carExterior");
assert.match(uiSource, /setFieldState\("#custom-scene-field", true\)/u, "custom scene field must not masquerade as active in carExterior");
assert.match(uiSource, /setFieldState\('\[aria-labelledby="realism-core-title"\]', active\)/u, "legacy Realism Core UI must be disabled in hardened carExterior while adapter realism remains automatic");
assert.match(uiSource, /setFieldState\('\[aria-labelledby="advanced-realism-title"\]', active\)/u, "legacy Advanced Realism UI must be disabled in hardened carExterior");
assert.match(uiSource, /setControlFieldState\(document\.querySelector\("#hair"\), active\)/u, "hair styling control must not compete with the reference identity in carExterior");
assert.match(uiSource, /setControlFieldState\(document\.querySelector\("#skin"\), active\)/u, "skin styling control must not compete with the reference identity in carExterior");
assert.doesNotMatch(uiSource, /makeCatalogSelect\("car-exterior-clothing"/u, "there must be only one visible clothing authority");

const base = {
  studioSection:"carExterior",
  hasReference:true,
  expression:"neutral",
  clothing:"sport-tracksuit-olive",
  fabric:"technical-poly",
  fabricWeight:"light",
  ironState:"lightly-unpressed",
  wearState:"normal-day",
  clothingFit:"regular",
  selfieAngle:"eye",
  composition:"close"
};

const visibleOutfit = resolveClothingText(base.clothing, base);
const staleLegacy = buildCanonicalV3UserOutput({
  ...base,
  carExteriorClothing:"thobe-redshemagh-iqal",
  time:"night",
  carExteriorLocation:"villa",
  carExteriorPose:"door-lean",
  carExteriorLighting:"streetlight-reflection"
});
assert.ok(staleLegacy.prompt.includes(visibleOutfit), "visible unified clothing selection must beat stale legacy carExteriorClothing");
assert.doesNotMatch(staleLegacy.prompt, /red-and-white fine checkered shemagh|black doubled-cord iqal/iu, "stale hidden carExterior clothing must not override the visible selection");

const legacyFallback = buildCanonicalV3UserOutput({
  ...base,
  clothing:"",
  carExteriorClothing:"thobe-white",
  time:"day",
  carExteriorLocation:"villa",
  carExteriorPose:"door-lean",
  carExteriorLighting:"harsh-noon"
});
assert.match(legacyFallback.prompt, /white(?:\s+Saudi)?\s+thobe/iu, "historical payloads without the unified clothing key must retain fallback compatibility");

const identityFields = [
  "facial_structure", "head_shape", "apparent_age", "skin_tone", "natural_asymmetry", "eyes", "eyebrows", "nose", "lips", "jaw", "chin", "ears", "hairline", "hair_density", "facial_hair_pattern", "moustache_pattern", "reference_linked_eyewear"
];

let matrixCases = 0;
let maxWords = 0;
for (const time of ["day", "night"]) {
  for (const location of locations) {
    for (const pose of poses) {
      const lights = getCarExteriorLightingOptions({ time, location:location.value, pose:pose.value });
      for (const lighting of lights) {
        const input = {
          ...base,
          time,
          carExteriorLocation:location.value,
          carExteriorPose:pose.value,
          carExteriorLighting:lighting.value
        };
        const output = buildCanonicalV3UserOutput(input);
        matrixCases += 1;
        maxWords = Math.max(maxWords, words(output.prompt));

        assert.equal(firstSentence(output.prompt), "A candid direct selfie.", `${time}/${location.value}/${pose.value}/${lighting.value}: selfie opening drifted`);
        assert.ok(output.prompt.includes(SELFIE_ARM_LOCK), `${time}/${location.value}/${pose.value}/${lighting.value}: SELFIE_ARM_LOCK missing`);
        assert.ok(output.prompt.includes(IDENTITY_STRICT_LOCK), `${time}/${location.value}/${pose.value}/${lighting.value}: strict identity lock missing`);
        assert.doesNotMatch(withoutSelfieLock(output.prompt), /both\s+hands?\s+(?:in\s+)?(?:the\s+)?pockets?|arms?\s+crossed|crossed\s+arms?|both\s+hands?\s+(?:are\s+)?occupied/iu, `${time}/${location.value}/${pose.value}/${lighting.value}: impossible two-hand selfie pose leaked`);
        assert.equal(output.canonical.identity.reference_mode, "single_reference");
        for (const field of identityFields) assert.ok(output.canonical.identity.preserve.includes(field), `${field}: reference-preservation field missing`);
        assert.equal(output.canonical.capture.type, "direct_front_camera_selfie");
        assert.equal(output.canonical.capture.operator, "subject");
        assert.equal(output.canonical.scene.id, "carExterior");
        assert.equal(output.canonical.scene.facts.carExteriorLocation, location.value);
        assert.equal(output.canonical.scene.facts.carExteriorPose, pose.value);
        assert.equal(output.canonical.scene.facts.carExteriorLighting, lighting.value);
        assert.match(output.prompt, /2017 Range Rover Sport Autobiography Dynamic L494/iu);
        assert.match(output.prompt, /Fuji White/iu);
        assert.ok(output.prompt.includes(location.text), `${time}/${location.value}/${pose.value}/${lighting.value}: selected location text missing`);
        assert.ok(output.prompt.includes(pose.text), `${time}/${location.value}/${pose.value}/${lighting.value}: selected pose text missing`);
        assert.ok(output.prompt.includes(lighting.text), `${time}/${location.value}/${pose.value}/${lighting.value}: selected lighting text missing`);
        assert.ok(output.prompt.includes(visibleOutfit), `${time}/${location.value}/${pose.value}/${lighting.value}: selected outfit missing`);
        assert.doesNotMatch(output.prompt, /ring light|softbox|studio lighting/iu, `${time}/${location.value}/${pose.value}/${lighting.value}: studio-light artifact leaked`);
        assertNoExactDuplicateSentences(output.prompt);
        assert.ok(words(output.prompt) <= 250, `${time}/${location.value}/${pose.value}/${lighting.value}: exceeds 250 words (${words(output.prompt)})`);
      }
    }
  }
}

const determinismInput = {
  ...base,
  time:"night",
  carExteriorLocation:"villa",
  carExteriorPose:"door-open",
  carExteriorLighting:"interior-spill"
};
const deterministic = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(determinismInput));
assert.ok(deterministic.every((item) => item.prompt === deterministic[0].prompt), "carExterior output must remain deterministic 10/10");

const locationA = buildCanonicalV3UserOutput({ ...determinismInput, carExteriorLocation:"villa", carExteriorLighting:"streetlight-reflection" });
const locationB = buildCanonicalV3UserOutput({ ...determinismInput, carExteriorLocation:"parking", carExteriorLighting:"streetlight-reflection" });
assert.notEqual(locationA.prompt, locationB.prompt, "changing location must change the final prompt");
const poseA = buildCanonicalV3UserOutput({ ...determinismInput, carExteriorPose:"door-open", carExteriorLighting:"streetlight-reflection" });
const poseB = buildCanonicalV3UserOutput({ ...determinismInput, carExteriorPose:"front-grille", carExteriorLighting:"streetlight-reflection" });
assert.notEqual(poseA.prompt, poseB.prompt, "changing pose must change the final prompt");
const lightA = buildCanonicalV3UserOutput({ ...determinismInput, carExteriorLighting:"interior-spill" });
const lightB = buildCanonicalV3UserOutput({ ...determinismInput, carExteriorLighting:"villa-porch" });
assert.notEqual(lightA.prompt, lightB.prompt, "changing a compatible lighting choice must change the final prompt");

const hardBefore = JSON.stringify(deterministic[0].canonical.hard_constraints);
void buildOpenAIImagePrompt(deterministic[0].canonical);
assert.equal(JSON.stringify(deterministic[0].canonical.hard_constraints), hardBefore, "adapter must not mutate hard constraints");

const customText = "light beige overshirt over a plain white cotton T-shirt with charcoal trousers";
const custom = buildCanonicalV3UserOutput({ ...determinismInput, clothing:"custom", customClothing:customText });
assert.ok(custom.prompt.includes(customText), "custom clothing must survive verbatim in carExterior");
assert.ok(words(custom.prompt) <= 250);
const traditional = buildCanonicalV3UserOutput({ ...determinismInput, clothing:"thobe-redshemagh-iqal" });
assert.match(traditional.prompt, /red-and-white fine checkered shemagh/iu);
assert.match(traditional.prompt, /black doubled-cord iqal/iu);
assert.ok(words(traditional.prompt) <= 250);

console.log(`PHASE40_CAR_EXTERIOR_MATRIX=${matrixCases}`);
console.log(`PHASE40_CAR_EXTERIOR_MAX_WORDS=${maxWords}`);
console.log(`PHASE40_CAR_EXTERIOR_LOCATIONS=${locations.length}`);
console.log(`PHASE40_CAR_EXTERIOR_POSES=${poses.length}`);
console.log("PHASE40_CAR_EXTERIOR_DETERMINISM=10/10");
console.log(`PHASE40_CAR_EXTERIOR_SAMPLE=${deterministic[0].prompt}`);
console.log("✓ Phase 40 carExterior deep audit passed");
