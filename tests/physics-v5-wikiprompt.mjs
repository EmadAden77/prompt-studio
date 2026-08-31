import assert from "node:assert/strict";
import {
  DEFAULT_STATE,
  buildPromptPack,
  getBedroomPositionRequirements,
  isBedroomScene,
  isTextRoomReference,
  normalizeState
} from "../js/physics-prompt-engine-v5.js";
import { WikiPromptService } from "../js/services/wikiPromptService.js";

assert.equal(DEFAULT_STATE.mode, "selfie");
assert.equal(isBedroomScene("bedroom"), true);
assert.equal(isBedroomScene("my_bedroom_text"), true);
assert.equal(isTextRoomReference("my_bedroom_text"), true);

const normalized = normalizeState({
  ...DEFAULT_STATE,
  scene:"not-a-real-scene",
  time:"not-a-real-time",
  mode:"not-a-real-mode"
});
assert.equal(normalized.scene, DEFAULT_STATE.scene);
assert.equal(normalized.time, DEFAULT_STATE.time);
assert.equal(normalized.mode, DEFAULT_STATE.mode);

const workRequirements = getBedroomPositionRequirements("laptop-bed-edge", "night");
assert.ok(workRequirements, "Laptop work pose must have deterministic capture requirements");
assert.equal(workRequirements.mode, "selfie");
assert.equal(workRequirements.bedroomWindow, "night-blackout");
assert.equal(workRequirements.bedroomLighting, "single-downlight-4000");

const workPack = buildPromptPack({
  ...DEFAULT_STATE,
  scene:"my_bedroom_text",
  time:"night",
  mode:"standard",
  bedroomPosition:"laptop-bed-edge",
  bedroomWindow:"night-blinds-sodium",
  bedroomLighting:"bedside-3000"
});
assert.equal(workPack.state.mode, "selfie", "Laptop work pose must force selfie mode");
assert.equal(workPack.state.bedroomWindow, "night-blackout");
assert.equal(workPack.state.bedroomLighting, "single-downlight-4000");
assert.match(workPack.positive, /SINGLE-REFERENCE IDENTITY LOCK/u);
assert.match(workPack.positive, /\[POSE\]/u);
assert.match(workPack.positive, /\[BEDROOM PHYSICS\]/u);
assert.match(workPack.positive, /\[LIGHTING\]/u);
assert.match(workPack.positive, /front-camera/u);
assert.match(workPack.positive, /natural phone-camera skin rendering/u);
assert.doesNotMatch(workPack.positive, /microscopic pores|subsurface scattering|hyper-realistic anatomical accuracy/u);
assert.match(workPack.negative, /floating laptop/u);
assert.ok(workPack.qa.length >= 6, "Active prompt pack must expose realism QA");

const carPack = buildPromptPack({
  ...DEFAULT_STATE,
  scene:"rangeRover",
  time:"day",
  mode:"selfie",
  clothing:"thobe-car",
  activity:"sitting naturally behind the steering wheel while safely parked"
});
assert.match(carPack.positive, /fully stationary and safely parked/u);
assert.match(carPack.positive, /candid daytime front-camera selfie from the driver's seat/u);
assert.match(carPack.positive, /natural phone-camera skin rendering/u);
assert.doesNotMatch(carPack.positive, /microscopic pores|subsurface scattering|hyper-realistic anatomical accuracy/u);
assert.equal((carPack.positive.match(/stationary white 2022 Range Rover Sport/gu) ?? []).length, 1, "Vehicle identity should be stated once, not duplicated by the capture template");
assert.equal((carPack.positive.match(/183 cm and 82 kg/gu) ?? []).length, 1, "Body measurements should not be repeated in the skin-realism block");
assert.match(carPack.negative, /moving vehicle/u);

const localRecords = [
  {
    slug:"realistic-selfie",
    title:"Realistic smartphone selfie",
    description:"Identity-preserving candid front-camera photography with natural practical light and authentic imperfections.",
    tags:["selfie", "smartphone", "identity", "front-camera", "photorealistic"]
  },
  {
    slug:"cinematic-render",
    title:"Cinematic 16K studio render",
    description:"Masterpiece studio lighting and extreme HDR.",
    tags:["16k", "cinematic"]
  }
];

const fetchImpl = async () => ({
  ok:true,
  status:200,
  async json() {
    return { updated_at:"2026-08-31", records:localRecords };
  }
});

const wiki = new WikiPromptService({ fetchImpl, localUrl:"https://example.test/data/wikiprompt-realism.json" });
const config = {
  scene:{ id:"bedroom", name_en:"bedroom" },
  pose:{ id:"laptop-bed-edge", name_en:"laptop bed edge selfie" },
  lighting:{ id:"single-downlight-4000", name_en:"single ceiling downlight" },
  mode:"selfie",
  composition:"close",
  selfieAngle:"eye"
};

const records = await wiki.discover(config);
assert.ok(records.length > 0, "Curated WikiPrompt metadata must produce usable local matches");
assert.equal(records[0].slug, "realistic-selfie", "Realistic selfie evidence must outrank cinematic render language");

const guidance = await wiki.sync(config);
assert.match(guidance, /^Apply physically compatible candid-smartphone realism cues:/u);
assert.match(guidance, /realistic auto-exposure behavior/u);
assert.doesNotMatch(guidance, /WIKIPROMPT REALISM DISCOVERY|Realistic smartphone selfie|Cinematic 16K studio render/u);
assert.ok(guidance.length < 600, "WikiPrompt should contribute a compact internal cue, not a research appendix");
assert.equal(wiki.getStatus().state, "synced");
assert.equal(wiki.getCachedGuidance(config), guidance);

const second = await wiki.sync(config);
assert.equal(second, guidance);
assert.equal(wiki.getStatus().state, "cache");

const blockedFetch = async () => {
  throw new TypeError("Failed to fetch");
};
const fallbackWiki = new WikiPromptService({ fetchImpl:blockedFetch, localUrl:"https://example.test/data/wikiprompt-realism.json" });
const fallbackGuidance = await fallbackWiki.sync(config);
assert.match(fallbackGuidance, /^Apply physically compatible candid-smartphone realism cues:/u);
assert.doesNotMatch(fallbackGuidance, /Realistic selfie image-prompt generator system prompt|embedded WikiPrompt metadata/u);
assert.equal(fallbackWiki.getStatus().state, "synced-fallback", "Mobile/network JSON fetch failures must still produce compact WikiPrompt guidance");
assert.equal(fallbackWiki.getStatus().details?.source, "embedded-fallback");

console.log("✓ active Physics v5 prompt engine passed");
console.log("✓ compact WikiPrompt realism cue passed");
console.log("✓ WikiPrompt embedded fallback passed");
