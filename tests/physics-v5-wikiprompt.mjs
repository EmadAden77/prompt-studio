import assert from "node:assert/strict";
import {
  DEFAULT_STATE,
  buildPromptPack,
  getBackgroundVisibility,
  getCarSeatOptions,
  getClothingOptions,
  getCompatibleBedroomWindowOptions,
  getCompositionOptions,
  getHairOptions,
  getLightingOptions,
  getPoseFamilyOptions,
  getPoseOptions,
  getSelfieAngleOptions,
  isBedroomScene,
  isCarScene,
  isTextRoomReference,
  normalizeState
} from "../js/physics-prompt-engine-v5.js";
import { WikiPromptService } from "../js/services/wikiPromptService.js";

assert.equal(DEFAULT_STATE.mode, "selfie");
assert.equal(DEFAULT_STATE.scene, "my_bedroom_text");
assert.equal(DEFAULT_STATE.carSeat, "driver-left");
assert.equal(isBedroomScene("my_bedroom_text"), true);
assert.equal(isCarScene("rangeRover"), true);
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
assert.match(rightSidePack.positive, /BEDROOM TOPOLOGY LOCK — NON-NEGOTIABLE/u);
assert.match(rightSidePack.positive, /bed occupies the left side/u);
assert.match(rightSidePack.positive, /wardrobe remains fixed along the right wall/u);
assert.match(rightSidePack.positive, /Cropping and occlusion are preferred over moving furniture/u);
assert.match(rightSidePack.negative, /moved bedroom furniture/u);
assert.match(rightSidePack.negative, /mirrored bedroom layout/u);
assert.match(rightSidePack.negative, /invented bedroom sofa/u);
assert.match(rightSidePack.positive, /Do not force height, weight, hands, legs or full-body visibility/u);
assert.match(rightSidePack.positive, /sole identity source\. Describe only anatomy/u);
assert.doesNotMatch(rightSidePack.positive, /183 cm and 82 kg/u, "Close crops must not carry irrelevant full-body dimensions");
assert.doesNotMatch(rightSidePack.positive, /Leica Authentic|23mm-equivalent|sheer white curtains|phone and person visible in reflection/u);
assert.doesNotMatch(rightSidePack.positive, /rug pile compressed where seated|overhead shots cast the phone's shadow/u);
assert.doesNotMatch(rightSidePack.positive, /\[BACKGROUND REALISM\]/u, "Bedroom prompts must not inject street realism");
assert.equal(getBackgroundVisibility(rightSidePack.state), "none");
assert.equal(rightSidePack.state.carSeat, "", "Non-car scenes must clear car-seat state");

const carPoses = getPoseOptions("rangeRover", "car");
assert.ok(carPoses.some((pose) => pose.value === "car-driver-close"));
assert.equal(getPoseOptions("my_bedroom_text", "car").length, 0, "Car-only poses must not leak into bedroom choices");
assert.equal(getCarSeatOptions("rangeRover", "waiting-relaxed").length, 4, "Generic car poses may use any real seat");
assert.deepEqual(
  getCarSeatOptions("rangeRover", "car-driver-close").map((item) => item.value),
  ["driver-left"],
  "Driver-labeled poses must expose only the left-front driver seat"
);
assert.equal(getCarSeatOptions("my_bedroom_text", "waiting-relaxed").length, 0);

const carPack = buildPromptPack({
  ...DEFAULT_STATE,
  scene:"rangeRover",
  time:"night",
  poseFamily:"car",
  pose:"car-driver-side",
  carSeat:"passenger-front-right",
  lighting:"car-night-parking-led",
  clothing:"thobe-white",
  messiness:"busy"
});
assert.equal(carPack.state.carSeat, "driver-left", "Driver pose must override a contradictory passenger-seat request");
assert.match(carPack.positive, /\[CAR SEAT POSITION\]/u);
assert.match(carPack.positive, /LEFT FRONT DRIVER'S SEAT LOCK/u);
assert.match(carPack.positive, /driver door and side window are on the subject's left/u);
assert.match(carPack.positive, /center console is on the subject's right/u);
assert.match(carPack.positive, /thin upper steering-wheel arc is mandatory/u);
assert.match(carPack.positive, /CAR DRIVER SELFIE GEOMETRY — SOLE AUTHORITY/u, "Driver prompts must name one camera-geometry authority");
assert.doesNotMatch(carPack.positive, /40–70cm reach rule/u, "Driver prompts must not retain a competing generic reach range");
assert.match(carPack.positive, /fully stationary and safely parked/u);
assert.match(carPack.positive, /left-hand-drive/u);
assert.match(carPack.positive, /supporting context only/u);
assert.match(carPack.positive, /do not invent loose clutter/u);
assert.match(carPack.positive, /never duplicate controls/u);
assert.match(carPack.positive, /\[BACKGROUND REALISM\]/u);
assert.match(carPack.positive, /Saudi street or parking slice/u);
assert.match(carPack.positive, /Sparse pedestrians may appear only where the angle truly exposes public space/u);
assert.match(carPack.positive, /localized parking or street-light pools/u);
assert.match(carPack.negative, /moving vehicle/u);
assert.match(carPack.negative, /invented cabin clutter/u);
assert.match(carPack.negative, /subject seated in front passenger seat/u);
assert.match(carPack.negative, /swapped driver and passenger positions/u);
assert.match(carPack.negative, /staged crowd/u);
assert.match(carPack.negative, /identical duplicated cars/u);
assert.ok(carPack.qa.some((item) => item.label === "المقعد" && /السائق الأمامي الأيسر/u.test(item.value)));
assert.ok(carPack.qa.some((item) => item.label === "الخلفية" && /سيارات أو أشخاص/u.test(item.value)));

const waitingDriverPack = buildPromptPack({
  ...DEFAULT_STATE,
  scene:"rangeRover",
  time:"day",
  poseFamily:"activity",
  pose:"waiting-relaxed",
  carSeat:"driver-left",
  lighting:"car-day-roof-light",
  clothing:"work-blue-navy",
  composition:"close",
  selfieAngle:"eye"
});
assert.match(waitingDriverPack.positive, /LEFT FRONT DRIVER'S SEAT LOCK/u);
assert.match(waitingDriverPack.positive, /The front-camera viewpoint originates from this exact seat position/u);
assert.match(waitingDriverPack.positive, /lower-body clothing may remain outside frame/u);
assert.match(waitingDriverPack.positive, /Use the selected selfie angle to decide whether a side window/u);
assert.match(waitingDriverPack.positive, /varied everyday vehicles/u);
assert.match(waitingDriverPack.negative, /passenger-side subject position/u);
assert.equal(getBackgroundVisibility(waitingDriverPack.state), "conditional");

const wideDriverPack = buildPromptPack({
  ...DEFAULT_STATE,
  scene:"rangeRover",
  time:"day",
  poseFamily:"car",
  pose:"car-driver-side",
  carSeat:"driver-left",
  lighting:"car-day-open-shade",
  clothing:"tee-black",
  composition:"upper",
  selfieAngle:"three-quarter"
});
assert.equal(getBackgroundVisibility(wideDriverPack.state), "open");
assert.match(wideDriverPack.positive, /wider or more lateral selfie angle can support meaningful exterior context/u);
assert.match(wideDriverPack.positive, /ordinary atmospheric haze/u);
assert.match(wideDriverPack.positive, /correctly scaled and unaware of the selfie/u);
assert.match(wideDriverPack.positive, /background activity may appear only where the selected front-camera angle and crop physically reveal it/i);

const waitingPassengerPack = buildPromptPack({
  ...DEFAULT_STATE,
  scene:"rangeRover",
  time:"day",
  poseFamily:"activity",
  pose:"waiting-relaxed",
  carSeat:"passenger-front-right",
  lighting:"car-day-roof-light",
  clothing:"work-blue-navy",
  composition:"close"
});
assert.equal(waitingPassengerPack.state.carSeat, "passenger-front-right");
assert.match(waitingPassengerPack.positive, /RIGHT FRONT PASSENGER SEAT LOCK/u);
assert.match(waitingPassengerPack.positive, /center console is on the subject's left/u);
assert.match(waitingPassengerPack.negative, /subject seated in driver seat/u);
assert.match(waitingPassengerPack.negative, /steering wheel directly in front of passenger/u);

const tightCarPack = buildPromptPack({
  ...DEFAULT_STATE,
  scene:"rangeRover",
  time:"day",
  poseFamily:"car",
  pose:"car-driver-close",
  carSeat:"driver-left",
  lighting:"car-day-window",
  clothing:"tee-black",
  composition:"tight",
  selfieAngle:"eye"
});
assert.equal(getBackgroundVisibility(tightCarPack.state), "minimal");
assert.match(tightCarPack.positive, /Do not force an exterior view/u);
assert.match(tightCarPack.positive, /If a real side, rear or windshield slice naturally enters the frame/u);

const streetPack = buildPromptPack({
  ...DEFAULT_STATE,
  scene:"street",
  time:"day",
  poseFamily:"street",
  pose:"street-standing",
  lighting:"street-day-open-shade",
  clothing:"tee-black",
  composition:"medium",
  selfieAngle:"three-quarter"
});
assert.equal(getBackgroundVisibility(streetPack.state), "open");
assert.match(streetPack.positive, /richer but still secondary real-world background/u);
assert.match(streetPack.positive, /varied cars and sparse people only where geometry supports them/u);
assert.match(streetPack.negative, /pedestrians staring at selfie camera/u);
assert.match(streetPack.negative, /background vehicles at impossible scale/u);

const carDirectSun = getLightingOptions("rangeRover", "day").find((item) => /direct sun/i.test(item.text));
assert.ok(carDirectSun, "Car daylight options must include direct sun");
const carDirectSunPack = buildPromptPack({
  ...DEFAULT_STATE,
  scene:"rangeRover",
  time:"day",
  poseFamily:"car",
  pose:"car-driver-close",
  carSeat:"driver-left",
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
console.log("✓ car seat selection and driver/passenger geometry locks passed");
console.log("✓ angle-aware Saudi street, car and pedestrian background realism passed");
console.log("✓ close-crop pruning and hard-light exposure guards passed");
console.log("✓ WikiPrompt local + fallback integration passed");
