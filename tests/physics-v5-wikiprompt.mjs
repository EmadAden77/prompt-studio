import assert from "node:assert/strict";
import {
  DEFAULT_STATE,
  buildPromptPack,
  getClothingOptions,
  getCompatibleBedroomWindowOptions,
  getCompositionOptions,
  getHairOptions,
  getLightingOptions,
  getPoseFamilyOptions,
  getPoseOptions,
  getSelfieAngleOptions,
  isBedroomScene,
  isTextRoomReference,
  normalizeState
} from "../js/physics-prompt-engine-v5.js";
import { WikiPromptService } from "../js/services/wikiPromptService.js";

assert.equal(DEFAULT_STATE.mode, "selfie");
assert.equal(DEFAULT_STATE.scene, "my_bedroom_text");
assert.equal(isBedroomScene("my_bedroom_text"), true);
assert.equal(isTextRoomReference("my_bedroom_text"), true);

const bedroomFamilies = getPoseFamilyOptions("my_bedroom_text").map((item) => item.value);
assert.ok(bedroomFamilies.includes("lying"), "Bedroom must expose the expanded lying family");
assert.ok(bedroomFamilies.includes("seated"));
assert.ok(bedroomFamilies.includes("standing"));
assert.ok(bedroomFamilies.includes("activity"));

const lyingPoses = getPoseOptions("my_bedroom_text", "lying");
assert.ok(lyingPoses.length >= 10, "Bed lying catalog must be substantially expanded");
for (const pose of lyingPoses) {
  assert.ok(getSelfieAngleOptions(pose.value).length > 0, `Pose needs compatible selfie angles: ${pose.value}`);
  assert.ok(getCompositionOptions(pose.value).length > 0, `Pose needs compatible compositions: ${pose.value}`);
}

assert.ok(getHairOptions().length >= 15, "Hair catalog must be expanded while density remains locked");
assert.ok(getClothingOptions("my_bedroom_text").length >= 20, "Bedroom clothing catalog must be expanded");
assert.ok(getClothingOptions("rangeRover").length >= 15, "Car clothing catalog must be expanded");
assert.ok(getLightingOptions("my_bedroom_text", "night").length >= 10, "Night bedroom lighting must be expanded");
assert.ok(getLightingOptions("my_bedroom_text", "day").length >= 10, "Day bedroom lighting must be expanded");

const incompatibleWindow = normalizeState({
  ...DEFAULT_STATE,
  time:"day",
  lighting:"day-direct-sun",
  bedroomWindow:"day-charcoal-closed"
});
assert.notEqual(incompatibleWindow.bedroomWindow, "day-charcoal-closed", "Direct sun must reject a closed-curtain state");
assert.ok(
  getCompatibleBedroomWindowOptions("day", "day-direct-sun").some((item) => item.value === incompatibleWindow.bedroomWindow),
  "Normalized window must come from the lighting-compatible window set"
);

const rightSidePack = buildPromptPack({
  ...DEFAULT_STATE,
  time:"day",
  poseFamily:"lying",
  pose:"lying-right-close",
  lighting:"day-soft-window",
  bedroomWindow:"day-charcoal-parted-soft",
  hair:"bedhead",
  clothing:"sleep-cotton-short",
  hasReference:true
});

assert.match(rightSidePack.positive, /^\[SELFIE TASK\]/u);
assert.match(rightSidePack.positive, /SINGLE-REFERENCE IDENTITY LOCK/u);
assert.match(rightSidePack.positive, /HAIR DENSITY LOCK/u);
assert.match(rightSidePack.positive, /right cheek and shoulder/u);
assert.match(rightSidePack.positive, /subject physically holds the phone/u);
assert.match(rightSidePack.positive, /21mm-equivalent f\/2\.0/u);
assert.match(rightSidePack.positive, /SELFIE PRIORITY/u);
assert.match(rightSidePack.positive, /does NOT require every listed item to appear/u);
assert.match(rightSidePack.positive, /Do not force height, weight, hands, legs or full-body visibility/u);
assert.doesNotMatch(rightSidePack.positive, /183 cm and 82 kg/u, "Close crops must not carry irrelevant full-body dimensions");
assert.doesNotMatch(rightSidePack.positive, /Leica Authentic|23mm-equivalent|sheer white curtains|phone and person visible in reflection/u);
assert.doesNotMatch(rightSidePack.positive, /rug pile compressed where seated|overhead shots cast the phone's shadow/u);

const carPoses = getPoseOptions("rangeRover", "car");
assert.ok(carPoses.some((pose) => pose.value === "car-driver-close"));
assert.equal(getPoseOptions("my_bedroom_text", "car").length, 0, "Car-only poses must not leak into bedroom choices");

const carPack = buildPromptPack({
  ...DEFAULT_STATE,
  scene:"rangeRover",
  time:"night",
  poseFamily:"car",
  pose:"car-driver-side",
  lighting:"car-night-parking-led",
  clothing:"thobe-white",
  messiness:"busy"
});
assert.match(carPack.positive, /fully stationary and safely parked/u);
assert.match(carPack.positive, /left-hand-drive/u);
assert.match(carPack.positive, /supporting context only/u);
assert.match(carPack.positive, /do not invent loose clutter/u);
assert.match(carPack.positive, /never duplicate controls/u);
assert.match(carPack.negative, /moving vehicle/u);
assert.match(carPack.negative, /invented cabin clutter/u);

const carDirectSun = getLightingOptions("rangeRover", "day").find((item) => /direct sun/i.test(item.text));
assert.ok(carDirectSun, "Car daylight options must include direct sun");
const carDirectSunPack = buildPromptPack({
  ...DEFAULT_STATE,
  scene:"rangeRover",
  time:"day",
  poseFamily:"car",
  pose:"car-driver-close",
  lighting:carDirectSun.value,
  clothing:"tee-black",
  composition:"close"
});
assert.match(carDirectSunPack.positive, /Do not flatten the contrast with HDR/u);
assert.match(carDirectSunPack.positive, /exterior highlights may clip/u);
assert.doesNotMatch(carDirectSunPack.positive, /183 cm and 82 kg/u);

const localRecords = [
  {
    slug:"realistic-selfie",
    title:"Realistic smartphone selfie",
    description:"Identity-preserving candid front-camera photography with natural practical light and authentic imperfections.",
    tags:["selfie","smartphone","identity","front-camera","photorealistic"]
  },
  {
    slug:"cinematic-render",
    title:"Cinematic 16K studio render",
    description:"Masterpiece studio lighting and extreme HDR.",
    tags:["16k","cinematic"]
  }
];

const fetchImpl = async () => ({
  ok:true,
  status:200,
  async json() {
    return { updated_at:"2026-08-31", records:localRecords };
  }
});

const wiki = new WikiPromptService({
  fetchImpl,
  localUrl:"https://example.test/data/wikiprompt-realism.json"
});
const guidance = await wiki.sync({
  scene:{ id:"bedroom" },
  pose:{ id:"lying-right-close" },
  lighting:{ id:"day-soft-window" },
  mode:"selfie",
  composition:"close",
  selfieAngle:"eye"
});
assert.match(guidance, /^Use WikiPrompt only as a realism calibration layer:/u);
assert.doesNotMatch(guidance, /Cinematic 16K studio render/u);
assert.ok(guidance.length < 400);
assert.equal(wiki.getStatus().state, "synced");

const blockedFetch = async () => { throw new TypeError("Failed to fetch"); };
const fallbackWiki = new WikiPromptService({
  fetchImpl:blockedFetch,
  localUrl:"https://example.test/data/wikiprompt-realism.json"
});
const fallbackGuidance = await fallbackWiki.sync({
  scene:{ id:"bedroom" },
  pose:{ id:"lying-right-close" },
  lighting:{ id:"day-soft-window" }
});
assert.match(fallbackGuidance, /^Use WikiPrompt only as a realism calibration layer:/u);
assert.equal(fallbackWiki.getStatus().state, "synced-fallback");

console.log("✓ WikiPrompt-first selfie engine passed");
console.log("✓ expanded clothing, hair, lighting and pose catalogs passed");
console.log("✓ pose/angle/composition/window contradiction guards passed");
console.log("✓ close-crop pruning and hard-light exposure guards passed");
console.log("✓ WikiPrompt local + fallback integration passed");
