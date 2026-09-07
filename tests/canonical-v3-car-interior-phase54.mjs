import assert from "node:assert/strict";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-phase53.js";
import { getSection } from "../js/sections/index.js";
import {
  LHD_VEHICLE_RELATIVE_ANCHORS,
  LHD_SELFIE_VIEWER_MAPPING,
  LHD_STEERING_ANCHOR,
  LHD_REAR_SEAT_ANCHOR
} from "../js/canonical/canonical-v3-phase55.js";

const words=value=>String(value||"").trim().split(/\s+/u).filter(Boolean).length;

const carSection=getSection("car");
assert.deepEqual(carSection.rules.sectionScope,["seats","cabin","driver-seat poses","car lighting"]);
assert.equal(carSection.rules.wikiPromptPolicy,"strict-car-selfie");
assert.equal(carSection.rules.wiring.lighting,true);
assert.equal(carSection.rules.wiring.pose,true);
assert.equal(carSection.rules.wiring.clothing,true);
assert.equal(carSection.rules.wiring.expression,true);
for(const key of ["fabric","fabricWeight","ironState","wearState","clothingFit","selfieAngle","composition","hair","skin","advancedRealism","accessoryProfile","accessoryDetail","objectProfile","environmentNote","postProcessing"]){
  assert.equal(carSection.rules.wiring[key],false,`car-only scope must disable ${key}`);
}

const raw={
  hasReference:true,
  studioSection:"car",
  scene:"rangeRover",
  time:"night",
  clothing:"formal-shirt-gray-trouser-black",
  expression:"neutral",
  pose:"driver-close",
  lighting:"car-night",
  city:"dammam",
  hair:"hand-neat",
  fabric:"cotton-jersey",
  ironState:"normal-pressed",
  wearState:"fresh",
  messiness:"busy",
  selfieAngle:"three-quarter",
  composition:"upper",
  environmentNote:"busy Dammam boulevard with landmarks and crowds",
  postProcessing:["cinematic"]
};

const out=buildCanonicalV3UserOutput(raw);
assert.equal(out.phase54.section,"car");
assert.equal(out.phase54.promptTarget,"chatgpt-images");
assert.equal(out.phase54.fieldEvidence.length,0);
assert.equal(out.phase54.injectedFieldEvidence.length,0);
assert.equal(out.phase54.contradictions.length,0);
assert.equal(out.phase55.active,true);
assert.deepEqual(out.phase55.scope,["seats","cabin","driver-seat poses","car lighting"]);
assert.equal(out.phase55.rawGenericControlsInjected,false);
assert.equal(out.phase55.namedExteriorContextAllowed,false);
assert.equal(out.phase55.simpleCameraLanguage,true);
assert.equal(out.phase55.actionFirst,true);
assert.equal(out.phase55.contextConsistency,true);
assert.equal(out.phase55.subtleImperfections,true);
assert.equal(out.phase55.lhdVisualAnchors,true);
assert.equal(out.phase55.viewerMapping,true);
assert.equal(out.phase55.steeringWheelCenteredOnLeftSeat,true);
assert.equal(out.phase55.rearLeftBehindDriver,true);
assert.equal(out.phase55.wikiPromptSource.url,"https://www.wikiprompt.org/realistic-selfie-image-prompt-generator-system-prompt");
assert.equal(out.phase55.wikiPromptSource.sourceUpdated,"2026-08-27");

assert.match(out.prompt,/^ChatGPT Images: create one candid front-camera selfie inside a parked 2017 Range Rover Sport Autobiography Dynamic L494/iu);
assert.match(out.prompt,/He sits naturally in the driver seat/iu,"WikiPrompt action-first rule must be rendered");
assert.match(out.prompt,/light gray formal shirt with black suit trousers/iu);
assert.match(out.prompt,/Neutral closed-mouth expression/iu);
assert.match(out.prompt,/Tall 195 cm, 88 kg lean-athletic build/iu);
for(const required of [LHD_VEHICLE_RELATIVE_ANCHORS,LHD_SELFIE_VIEWER_MAPPING,LHD_STEERING_ANCHOR,LHD_REAR_SEAT_ANCHOR]){
  assert.ok(out.prompt.includes(required),`required LHD anchor missing: ${required}`);
}
assert.match(out.prompt,/driver's seat and steering wheel occupy the vehicle LEFT/iu);
assert.match(out.prompt,/empty Ivory passenger seat occupies the cabin RIGHT/iu);
assert.match(out.prompt,/center console.*driver's RIGHT/iu);
assert.match(out.prompt,/seatbelt retractor and B-pillar.*LEFT shoulder/iu);
assert.match(out.prompt,/LEFT-side door, B-pillar and seatbelt appear on the viewer's RIGHT/iu);
assert.match(out.prompt,/empty passenger seat appears on the viewer's LEFT/iu);
assert.match(out.prompt,/centered only in front of the LEFT seat/iu);
assert.match(out.prompt,/no wheel or pedal geometry on the cabin right/iu);
assert.match(out.prompt,/rear-left is behind the driver/iu);
assert.match(out.prompt,/Ivory perforated leather/iu);
assert.match(out.prompt,/dark wood/iu);
assert.match(out.prompt,/black-and-Ivory steering wheel/iu);
assert.match(out.prompt,/transparent panoramic roof/iu);
assert.match(out.prompt,/Pose: close driver-seat selfie/iu);
assert.match(out.prompt,/Night lighting: cabin practical light is dominant/iu);
assert.match(out.prompt,/Background stays cabin-only/iu);
assert.match(out.prompt,/outside through glass is soft and anonymous/iu);
assert.match(out.prompt,/subtle skin texture/iu);

for(const forbidden of [
  /Selected controls:/iu,/city=/iu,/background=/iu,/fabric=/iu,/hair=/iu,/cotton-jersey/iu,/normal-pressed/iu,/Dammam/iu,
  /busy traffic|crowd|landmark/iu,/front grille|rear tailgate|standing beside|leaning against the .*driver door/iu,
  /driver(?:'s)? (?:seatbelt|belt|B-pillar).*RIGHT shoulder/iu,/passenger seat.*vehicle LEFT/iu,
  /steering wheel\s+(?:is\s+|sits\s+|appears\s+|located\s+|centered\s+)?(?:on|at|in)\s+(?:the\s+)?(?:cabin|vehicle)\s+RIGHT/iu,
  /\bISO\b|\byaw\b|\bpitch\b|\broll\b|\b21\s*mm\b|f\/\d/iu
]) assert.doesNotMatch(out.prompt,forbidden,`forbidden car-interior leakage: ${forbidden}`);
assert.match(out.prompt,/No driving, passenger-seat relocation, exterior pose, studio\/ring light or staged display/iu,"explicit no-studio/ring-light guard must remain in the final prompt");

assert.ok(words(out.prompt)<=280,`car interior ChatGPT prompt budget exceeded (${words(out.prompt)})`);
assert.equal(out.phase55.wordCount,words(out.prompt));
assert.equal(out.phase55.hardLimit,280);

const staleExterior=buildCanonicalV3UserOutput({
  hasReference:true,studioSection:"car",scene:"rangeRover",time:"night",clothing:"casual-tee-black-jeans-blue",
  expression:"focused",pose:"standing beside the open driver door",lighting:"car-night",city:"riyadh",messiness:"busy"
});
assert.doesNotMatch(staleExterior.prompt,/standing beside the open driver door|front grille|rear tailgate|Riyadh|busy/iu);
assert.match(staleExterior.prompt,/Pose: naturally seated upright in the driver seat/iu,"invalid exterior pose must resolve to driver-seat pose");

const ten=Array.from({length:10},()=>buildCanonicalV3UserOutput(raw).prompt);
assert.ok(ten.every(prompt=>prompt===ten[0]),"car interior Phase 55 must remain deterministic 10/10");

console.log(`PHASE55_CAR_WORDS=${words(out.prompt)}`);
console.log("PHASE55_CAR_SCOPE=seats,cabin,driver-seat poses,car lighting");
console.log("PHASE55_CAR_WIKIPROMPT=action-first,context-consistent,simple-camera,subtle-imperfections");
console.log("PHASE55_CAR_LHD_VISUAL_ANCHORS=PASS");
console.log("PHASE55_CAR_GENERIC_LEAKAGE=0");
console.log("PHASE55_CAR_CONTRADICTIONS=0");
console.log("PHASE55_CAR_DETERMINISM=10/10");
console.log("Phase 55 strict WikiPrompt car interior: PASS");
