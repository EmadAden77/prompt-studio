import assert from "node:assert/strict";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-phase53.js";
import { getSection } from "../js/sections/index.js";

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
assert.equal(out.phase55.wikiPromptSource.url,"https://www.wikiprompt.org/realistic-selfie-image-prompt-generator-system-prompt");
assert.equal(out.phase55.wikiPromptSource.sourceUpdated,"2026-08-27");

assert.match(out.prompt,/^ChatGPT Images: create one candid front-camera selfie inside a parked 2017 Range Rover Sport Autobiography Dynamic L494/iu);
assert.match(out.prompt,/He sits naturally in the driver seat/iu,"WikiPrompt action-first rule must be rendered");
assert.match(out.prompt,/light gray formal shirt with black suit trousers/iu);
assert.match(out.prompt,/Neutral closed-mouth expression/iu);
assert.match(out.prompt,/Tall 195 cm, 88 kg lean-athletic build/iu);
assert.match(out.prompt,/driver door\/window at his left, console at his right, steering wheel directly ahead/iu);
assert.match(out.prompt,/never swap these physical relationships or turn them into image-frame left\/right rules/iu);
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
  /\bISO\b|\byaw\b|\bpitch\b|\broll\b|\b21\s*mm\b|f\/\d/iu,/studio light|ring light/iu
]) assert.doesNotMatch(out.prompt,forbidden,`forbidden car-interior leakage: ${forbidden}`);

assert.ok(words(out.prompt)<=250,`car interior ChatGPT prompt budget exceeded (${words(out.prompt)})`);
assert.equal(out.phase55.wordCount,words(out.prompt));
assert.equal(out.phase55.hardLimit,250);

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
console.log("PHASE55_CAR_GENERIC_LEAKAGE=0");
console.log("PHASE55_CAR_CONTRADICTIONS=0");
console.log("PHASE55_CAR_DETERMINISM=10/10");
console.log("Phase 55 strict WikiPrompt car interior: PASS");
