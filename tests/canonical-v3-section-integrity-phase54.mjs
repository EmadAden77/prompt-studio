import assert from "node:assert/strict";
import fs from "node:fs";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-phase53.js";
import { buildWikiPromptSectionContract, normalizePhase54Aliases } from "../js/canonical/canonical-v3-phase54.js";
import { normalizeStudioSectionState } from "../js/studio-section-engine-v1.js";
import { normalizeScenarioState } from "../js/scenario-section-engine-v1.js";

const words=value=>String(value||"").trim().split(/\s+/u).filter(Boolean).length;
const common={hasReference:true,time:"night",clothing:"formal-shirt-white-beige",expression:"neutral"};
const cases={
  solo:{studioSection:"solo",scene:"street",pose:"standing-relaxed",lighting:"street-night"},
  group:{studioSection:"group",scene:"street",pose:"standing-relaxed",lighting:"street-night",groupCount:"3",cameraHolder:"A",groupArrangement:"natural-auto",groupInteraction:"casual"},
  car:{studioSection:"car",scene:"rangeRover",pose:"driver-close",lighting:"car-night"},
  carExterior:{studioSection:"carExterior",scene:"carExterior",carExteriorLocation:"parking",carExteriorPose:"door-lean",carExteriorLighting:"parking-led"},
  bedroom:{studioSection:"bedroom",scene:"bedroom",pose:"standing-bedroom",lighting:"night-bedside-3000"},
  gym:{studioSection:"gym",scene:"gym",pose:"standing-relaxed",lighting:"gym-night"},
  street:{studioSection:"street",scene:"street",pose:"standing-relaxed",lighting:"street-night",streetMood:"normal"},
  accidental:{studioSection:"accidental",scene:"street",pose:"phone-rising",lighting:"street-night",accidentalTrigger:"pocket",accidentalPhonePosition:"rising",accidentalMotion:"subtle",accidentalTilt:"auto",accidentalFocus:"transition-face",accidentalExposure:"auto-imperfect",accidentalIntensity:"natural"},
  custom:{studioSection:"custom",scene:"custom",customScene:"a small ordinary courtyard with a low stone wall",pose:"standing-relaxed",lighting:"custom-night-auto-practical"},
  mirror:{studioSection:"mirror",scene:"bedroom",pose:"mirror-standing",lighting:"night-bedside-3000"}
};

for(const [section,extra] of Object.entries(cases)){
  const raw={...common,...extra};
  const out=buildCanonicalV3UserOutput(raw);
  assert.equal(out.phase54.active,true,`${section}: Phase 54 inactive`);
  assert.equal(out.phase54.section,section,`${section}: wrong Phase 54 section`);
  assert.equal(out.phase54.determinism,"10/10",`${section}: determinism metadata missing`);
  assert.equal(out.phase54.allCommonFieldsRouted,true,`${section}: common field routing disabled`);
  assert.equal(out.phase54.inactiveSectionLeakageForbidden,true,`${section}: leakage guard disabled`);
  assert.equal(out.phase54.contradictions.length,0,`${section}: contradiction found: ${out.phase54.contradictions.join(", ")}`);
  assert.equal(out.phase54.wikiPromptSource.url,"https://www.wikiprompt.org/realistic-selfie-image-prompt-generator-system-prompt");
  assert.equal(out.phase54.wikiPromptRules.actionFirst,true);
  assert.equal(out.phase54.wikiPromptRules.contextConsistency,true);
  assert.equal(out.phase54.wikiPromptRules.subtleImperfections,true);
  assert.equal(out.phase54.wikiPromptRules.simplePhoneCameraLanguage,true);
  assert.equal(out.phase54.wikiPromptRules.mirrorPhysicsRequired,true);
  assert.ok(words(out.prompt)<= (section==="carExterior"?280:250),`${section}: budget overflow (${words(out.prompt)})`);
  const ten=Array.from({length:10},()=>buildCanonicalV3UserOutput(raw).prompt);
  assert.ok(ten.every(value=>value===ten[0]),`${section}: output is not deterministic 10/10`);
  if(section==="mirror") assert.match(out.prompt,/mirror_rules:.*camera is pointed at the mirror.*reflection/iu);
  else assert.doesNotMatch(out.prompt,/subject is represented through the reflection/iu,`${section}: mirror rules leaked`);
}

const aliases=normalizePhase54Aliases({clothing:"custom",clothingCustom:"sand overshirt with charcoal trousers",pose:"standing-relaxed"});
assert.equal(aliases.customClothing,"sand overshirt with charcoal trousers");
assert.equal(aliases.selfiePose,"standing-relaxed");
const customClothing=buildCanonicalV3UserOutput({...common,studioSection:"solo",scene:"street",clothing:"custom",clothingCustom:"sand overshirt with charcoal trousers",pose:"standing-relaxed"});
assert.match(customClothing.prompt,/sand overshirt with charcoal trousers/iu,"clothingCustom alias must reach final prompt");

const fieldRaw={
  studioSection:"solo",hair:"sweep-back",skin:"slight-oil",fabric:"linen",fabricWeight:"medium",ironState:"pressed",wearState:"daily-used",clothingFit:"tailored",
  composition:"upper",selfieAngle:"three-quarter",placeState:"used",peopleDensity:"sparse",subjectMoment:"waiting",interactionObject:"car keys",
  sceneProfile:"cafe",accessoryProfile:"watch",accessoryDetail:"plain steel watch",objectProfile:"keys",messiness:"busy",environmentNote:"one vending machine near the wall",
  groupKind:"friends",groupVibe:"laughing",streetMood:"alley",streetHour:"21",postProcessing:["film-grain"]
};
const contract=buildWikiPromptSectionContract(fieldRaw,{section:{id:"solo"}});
for(const token of ["sweep-back","slight-oil","linen","medium","pressed","daily-used","tailored","upper","three-quarter","used","sparse","waiting","car keys","cafe","watch","plain steel watch","keys","busy","one vending machine near the wall","friends","laughing","alley","21","film-grain"]){
  assert.ok(contract.fieldEvidence.some(item=>item.includes(token)),`field evidence missing ${token}`);
}

const noteRaw={...common,...cases.solo,environmentNote:"a blue plastic chair beside the doorway"};
const noteOut=buildCanonicalV3UserOutput(noteRaw);
assert.match(noteOut.prompt,/blue plastic chair beside the doorway/iu,"environmentNote must affect final prompt");
const accessoryRaw={...common,...cases.solo,accessoryDetail:"thin matte black wristwatch"};
const accessoryOut=buildCanonicalV3UserOutput(accessoryRaw);
assert.match(accessoryOut.prompt,/thin matte black wristwatch/iu,"accessoryDetail must affect final prompt");

assert.equal(normalizeStudioSectionState({studioSection:"solo",scene:"custom"}).scene,"street","solo must reject stale custom scene");
assert.equal(normalizeStudioSectionState({studioSection:"accidental",scene:"custom"}).scene,"street","accidental must reject stale custom scene");
assert.equal(normalizeStudioSectionState({studioSection:"carExterior",scene:"custom"}).scene,"carExterior","carExterior must keep fixed exterior scene");
assert.equal(normalizeStudioSectionState({studioSection:"mirror",scene:"bedroom"}).scene,"bedroom","mirror scene must remain bedroom");
assert.equal(normalizeStudioSectionState({studioSection:"custom",scene:"custom",customScene:"courtyard"}).scene,"custom","custom scene must stay custom");
assert.equal(normalizeScenarioState({studioSection:"solo",scene:"street",scenarioMode:"custom"}).scene,"street","legacy scenario normalizer must not override studio section scene");
assert.equal(normalizeScenarioState({studioSection:"car",scene:"rangeRover",scenarioMode:"custom"}).scene,"rangeRover","legacy scenario normalizer must preserve car section scene");

const ui=fs.readFileSync(new URL("../js/phase54-section-field-ui.js",import.meta.url),"utf8");
const phase54=fs.readFileSync(new URL("../js/canonical/canonical-v3-phase54.js",import.meta.url),"utf8");
assert.match(ui,/#post-processing-panel[\s\S]{0,80}hidden:false[\s\S]{0,40}disabled:false/iu,"post-processing must stay active");
assert.match(ui,/#hair[\s\S]{0,60}hidden:false[\s\S]{0,40}disabled:false/iu,"hair must stay active");
assert.match(ui,/#skin[\s\S]{0,60}hidden:false[\s\S]{0,40}disabled:false/iu,"skin must stay active");
assert.match(ui,/car-exterior-fields[\s\S]{0,80}!carExterior/iu,"carExterior dedicated controls must be section-scoped");
assert.match(phase54,/phase54-section-field-ui\.js/iu,"Phase 54 UI activation module must load with canonical engine");

console.log("PHASE54_SECTIONS=solo,group,car,carExterior,bedroom,gym,street,accidental,custom,mirror");
console.log("PHASE54_WIKIPROMPT_SOURCE=connected");
console.log("PHASE54_COMMON_FIELDS_ROUTED=true");
console.log("PHASE54_CONTRADICTIONS=0");
console.log("PHASE54_DETERMINISM=10/10");
console.log("Phase 54 section integrity and WikiPrompt wiring: PASS");
