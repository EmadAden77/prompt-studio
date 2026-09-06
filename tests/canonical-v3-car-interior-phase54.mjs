import assert from "node:assert/strict";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-phase53.js";
import { getSection } from "../js/sections/index.js";

const words=value=>String(value||"").trim().split(/\s+/u).filter(Boolean).length;

const carSection=getSection("car");
assert.equal(carSection.rules.wiring.enabled,true);
for(const key of [
  "clothing","customClothing","fabric","fabricWeight","ironState","wearState","clothingFit",
  "lighting","pose","expression","body","selfieArmLock","selfieAngle","composition","hair","skin","time",
  "realismCore","advancedRealism","accessoryProfile","accessoryDetail","objectProfile","environmentNote","postProcessing"
]) assert.equal(carSection.rules.wiring[key],true,`car option ${key} must be active`);
assert.equal(carSection.rules.ui.promptTarget,"chatgpt-images");
assert.equal(carSection.rules.ui.enforceRealism,true);
assert.equal(carSection.rules.ui.preventCrossSectionLeakage,true);
assert.ok(carSection.rules.hard.includes("stationary vehicle"));
assert.ok(carSection.rules.hard.includes("subject seated in driver seat"));
assert.ok(carSection.rules.exclusions.includes("passenger-seat relocation"));
assert.ok(carSection.rules.exclusions.includes("mirrored LHD cabin"));
assert.ok(carSection.rules.exclusions.includes("driving motion"));

const raw={
  hasReference:true,
  studioSection:"car",
  scene:"rangeRover",
  time:"night",
  clothing:"formal-shirt-white-beige",
  expression:"focused",
  pose:"driver-close",
  lighting:"car-night",
  selfieAngle:"three-quarter",
  composition:"upper",
  hair:"sweep-back",
  skin:"slight-oil",
  accessoryDetail:"plain steel wristwatch",
  environmentNote:"ordinary parked-car surroundings visible softly through the side glass"
};

const out=buildCanonicalV3UserOutput(raw);
assert.equal(out.phase54.section,"car");
assert.equal(out.phase54.promptTarget,"chatgpt-images");
assert.equal(out.phase54.carInteriorAuthority,true);
assert.equal(out.phase54.physicalRealismEnforced,true);
assert.equal(out.phase54.contradictions.length,0);
assert.match(out.prompt,/^ChatGPT Images: create one physically plausible front-camera selfie inside this parked vehicle/iu);
assert.match(out.prompt,/Car-interior lock: parked LHD, driver seat only/iu);
assert.match(out.prompt,/door\/window physically left/iu);
assert.match(out.prompt,/console right/iu);
assert.match(out.prompt,/steering wheel ahead of torso/iu);
assert.match(out.prompt,/never mirror or swap cabin geometry/iu);
assert.match(out.prompt,/Cabin fidelity: 2017 Range Rover Sport Autobiography Dynamic L494/iu);
assert.match(out.prompt,/Ivory perforated leather/iu);
assert.match(out.prompt,/dark wood/iu);
assert.match(out.prompt,/black-and-Ivory wheel/iu);
assert.match(out.prompt,/transparent panoramic roof/iu);
assert.match(out.prompt,/show only angle-visible details with natural reflections/iu);
assert.match(out.prompt,/Capture physics: reachable one-arm phone hold/iu);
assert.match(out.prompt,/no driving/iu);
assert.match(out.prompt,/Tall 195 cm, 88 kg lean-athletic build/iu);
assert.match(out.prompt,/Lighting: car interior light is the dominant night source/iu);
assert.match(out.prompt,/source-matched cast/iu);
assert.match(out.prompt,/raised ISO adds subtle grain and shadow noise/iu);
assert.match(out.prompt,/exposure keeps a natural face\/background tradeoff and remains clearly nocturnal/iu);
assert.match(out.prompt,/plain steel wristwatch/iu);
assert.match(out.prompt,/ordinary parked-car surroundings visible softly through the side glass/iu);
assert.match(out.prompt,/three-quarter/iu);
assert.doesNotMatch(out.prompt,/(?:standing|leaning)\s+(?:beside|against)\s+the\s+(?:closed|open)\s+driver\s+door/iu);
assert.doesNotMatch(out.prompt,/front grille|rear tailgate|tire contact shadow/iu);
assert.doesNotMatch(out.prompt,/In the frame, the driver's door and side window appear/iu,"ambiguous image-left/right legacy mapping must be removed");
assert.doesNotMatch(out.prompt,/Pose:\s*.*(?:standing|walking|lying|bed|sofa|gym|outside)/iu);
assert.ok(words(out.prompt)<=250,`car interior ChatGPT prompt budget exceeded (${words(out.prompt)})`);

const staleExterior=buildCanonicalV3UserOutput({
  hasReference:true,studioSection:"car",scene:"rangeRover",time:"night",clothing:"casual-tee-black-jeans-blue",
  expression:"neutral",pose:"standing beside the open driver door",lighting:"car-night"
});
assert.equal(staleExterior.phase54.contradictions.length,0);
assert.doesNotMatch(staleExterior.prompt,/standing beside the open driver door|front grille|rear tailgate/iu,"stale exterior pose must not leak into car interior");
assert.match(staleExterior.prompt,/Pose: seated naturally in the driver seat/iu,"invalid stale pose must resolve to a driver-seat pose");

const ten=Array.from({length:10},()=>buildCanonicalV3UserOutput(raw).prompt);
assert.ok(ten.every(prompt=>prompt===ten[0]),"car interior Phase 54 must remain deterministic 10/10");

console.log(`PHASE54_CAR_WORDS=${words(out.prompt)}`);
console.log("PHASE54_CAR_OPTIONS=active");
console.log("PHASE54_CAR_PROMPT_TARGET=chatgpt-images");
console.log("PHASE54_CAR_LHD=vehicle-relative-physical");
console.log("PHASE54_CAR_REALISM=physical");
console.log("PHASE54_CAR_CONTRADICTIONS=0");
console.log("PHASE54_CAR_DETERMINISM=10/10");
console.log("Phase 54 car interior physical realism: PASS");
