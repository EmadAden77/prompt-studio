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
assert.match(out.prompt,/^ChatGPT Images: create exactly one candid, physically plausible front-camera selfie inside the parked vehicle/iu);
assert.match(out.prompt,/Car-interior lock: parked LHD/iu);
assert.match(out.prompt,/subject seated in the driver seat/iu);
assert.match(out.prompt,/driver door and side window stay physically left/iu);
assert.match(out.prompt,/center console right/iu);
assert.match(out.prompt,/steering wheel directly ahead of the torso/iu);
assert.match(out.prompt,/front-camera mirroring never swaps vehicle geometry/iu);
assert.match(out.prompt,/Cabin fidelity: 2017 Range Rover Sport Autobiography Dynamic L494/iu);
assert.match(out.prompt,/Ivory perforated leather/iu);
assert.match(out.prompt,/dark polished wood/iu);
assert.match(out.prompt,/black-and-Ivory multifunction steering wheel/iu);
assert.match(out.prompt,/transparent panoramic roof/iu);
assert.match(out.prompt,/show only angle-visible cabin details with natural reflections/iu);
assert.match(out.prompt,/Capture physics: one reachable phone-holding arm/iu);
assert.match(out.prompt,/vehicle parked/iu);
assert.match(out.prompt,/Tall 195 cm, 88 kg lean-athletic build/iu);
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
