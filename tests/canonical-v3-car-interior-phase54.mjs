import assert from "node:assert/strict";
import fs from "node:fs";
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
assert.deepEqual(carSection.rules.authority.fixed,["seats","cabin"]);
assert.deepEqual(carSection.rules.authority.selectable,["pose","lighting"]);
assert.deepEqual(carSection.rules.authority.globalSubjectControls,["clothing","customClothing","expression","hair","time"]);
assert.deepEqual(carSection.rules.authority.contextualRealismControls,["city","messiness","peopleDensity","placeState"]);
for(const key of ["clothing","customClothing","lighting","pose","expression","hair","time","realismCore","placeState","peopleDensity","city","messiness"]){
  assert.equal(carSection.rules.wiring[key],true,`car control must remain active: ${key}`);
}
for(const key of ["fabric","fabricWeight","ironState","wearState","clothingFit","skin","selfieAngle","composition","advancedRealism","subjectMoment","interactionObject","accessoryProfile","accessoryDetail","objectProfile","environmentNote","postProcessing"]){
  assert.equal(carSection.rules.wiring[key],false,`conflicting car control must remain isolated: ${key}`);
}

const raw={
  hasReference:true,studioSection:"car",scene:"rangeRover",time:"night",
  clothing:"formal-shirt-gray-trouser-black",expression:"laughing",hair:"hand-neat",
  pose:"driver-close",lighting:"car-night",city:"dammam",messiness:"busy",peopleDensity:"low",placeState:"used",
  fabric:"cotton-jersey",fabricWeight:"heavy",ironState:"normal-pressed",wearState:"fresh",clothingFit:"oversized",
  skin:"retouched-glossy",accessoryProfile:"luxury-watch",accessoryDetail:"gold bracelet",objectProfile:"coffee-cup",
  environmentNote:"busy Dammam boulevard with landmarks and crowds",postProcessing:["cinematic"]
};

const out=buildCanonicalV3UserOutput(raw);
assert.equal(out.phase54.section,"car");
assert.equal(out.phase54.promptTarget,"chatgpt-images");
assert.equal(out.phase54.fieldEvidence.length,0,"raw Selected controls evidence must stay disabled for car");
assert.equal(out.phase54.contradictions.length,0);
assert.equal(out.phase55.active,true);
assert.equal(out.phase55.strictFourDomainAuthority,true,"car-specific scene authority must remain four-domain");
assert.deepEqual(out.phase55.fixedDomains,["seats","cabin"]);
assert.deepEqual(out.phase55.selectableDomains,["driver-seat pose","car lighting"]);
assert.equal(out.phase55.globalSubjectControlsActive,true);
assert.equal(out.phase55.contextualSaudiRealismActive,true);
assert.equal(out.phase55.environmentLifeActive,true);
assert.equal(out.phase55.realismMandatory,true);
assert.equal(out.phase55.naturalPropIntegration,false);
assert.equal(out.phase55.mirrorRule,"not-applicable-direct-front-camera");
assert.equal(out.phase55.simpleCameraLanguage,true);
assert.equal(out.phase55.actionFirst,true);
assert.equal(out.phase55.contextConsistency,true);
assert.equal(out.phase55.subtleImperfections,true);
assert.equal(out.phase55.lhdVisualAnchors,true);
assert.equal(out.phase55.viewerMapping,true);
assert.equal(out.phase55.steeringWheelCenteredOnLeftSeat,true);
assert.equal(out.phase55.rearLeftBehindDriver,true);
assert.deepEqual(out.phase55.wikiPromptSpecialization.allowedSceneDomains,["seats","cabin","driver-seat pose","car lighting"]);
for(const token of ["clothing","expression","identity-safe hair arrangement","day/night time"]){
  assert.ok(out.phase55.wikiPromptSpecialization.allowedGlobalSubjectControls.includes(token),`WikiPrompt global subject control missing: ${token}`);
}
assert.equal(out.phase55.wikiPromptSource.url,"https://www.wikiprompt.org/realistic-selfie-image-prompt-generator-system-prompt");
assert.equal(out.phase55.wikiPromptSource.sourceUpdated,"2026-08-27");

assert.match(out.prompt,/^ChatGPT Images: create a candid front-camera selfie inside a parked 2017 Range Rover Sport Autobiography Dynamic L494/iu);
assert.match(out.prompt,/Self-held; phone and holding arm stay outside crop/iu);
assert.match(out.prompt,/Preserve reference identity/iu);
assert.match(out.prompt,/Tall 195 cm, 88 kg lean-athletic/iu);
assert.match(out.prompt,/Clothing: light gray formal shirt with black suit trousers/iu,"selected clothing must work in car section");
assert.match(out.prompt,/Expression: natural laugh/iu,"selected expression must work in car section");
assert.match(out.prompt,/Hair: neatly hand-arranged; reference density, hairline and volume unchanged/iu,"selected hair arrangement must work without changing identity density");

for(const required of [LHD_VEHICLE_RELATIVE_ANCHORS,LHD_SELFIE_VIEWER_MAPPING,LHD_STEERING_ANCHOR,LHD_REAR_SEAT_ANCHOR]){
  assert.ok(out.prompt.includes(required),`required LHD anchor missing: ${required}`);
}
assert.match(out.prompt,/Cabin: Ivory perforated leather, dark wood, black-and-Ivory steering wheel, transparent panoramic roof and Ivory headliner/iu);
assert.match(out.prompt,/Pose: close driver-seat selfie/iu);
assert.match(out.prompt,/Night lighting: cabin and Saudi street\/building\/vehicle lights through glass/iu);
assert.match(out.prompt,/natural falloff, dark areas, one source-matched eye catchlight and mild shadow noise/iu);
assert.match(out.prompt,/Through visible glass: denser eastern-coast Saudi street life/iu);
assert.match(out.prompt,/parked\/passing vehicles/iu);
assert.match(out.prompt,/one or two distant pedestrians/iu);
assert.match(out.prompt,/Mandatory realism:/iu);
assert.match(out.prompt,/seat compression, clothing folds, skin texture and touched-surface wear/iu);
assert.doesNotMatch(out.prompt,/outside stays soft and anonymous|Cabin-only background/iu,"Saudi environment life must not be erased");

for(const forbidden of [
  /Selected controls:/iu,/city=/iu,/background=/iu,/fabric=/iu,/hair=/iu,
  /\bDammam\b|\bRiyadh\b|\bJeddah\b/iu,/cotton-jersey|normal-pressed|oversized|luxury-watch|gold bracelet|coffee-cup|cinematic/iu,
  /front grille|rear tailgate|standing beside|leaning against the .*driver door/iu,
  /driver(?:'s)? (?:seatbelt|belt|B-pillar).*RIGHT shoulder/iu,/passenger seat.*vehicle LEFT/iu,
  /steering wheel\s+(?:is\s+|sits\s+|appears\s+|located\s+|centered\s+)?(?:on|at|in)\s+(?:the\s+)?(?:cabin|vehicle)\s+RIGHT/iu,
  /\bISO\b|\byaw\b|\bpitch\b|\broll\b|f\/\d/iu
]) assert.doesNotMatch(out.prompt,forbidden,`forbidden car-interior leakage: ${forbidden}`);

assert.ok(words(out.prompt)<=280,`car interior ChatGPT prompt budget exceeded (${words(out.prompt)})`);
assert.equal(out.phase55.wordCount,words(out.prompt));
assert.equal(out.phase55.hardLimit,280);

const clothingVariant=buildCanonicalV3UserOutput({...raw,clothing:"casual-tee-black-jeans-blue"});
assert.notEqual(clothingVariant.prompt,out.prompt,"clothing selection must affect car prompt");
assert.match(clothingVariant.prompt,/Clothing: heavy black cotton T-shirt with dark blue jeans/iu);
const expressionVariant=buildCanonicalV3UserOutput({...raw,expression:"serious"});
assert.notEqual(expressionVariant.prompt,out.prompt,"expression selection must affect car prompt");
assert.match(expressionVariant.prompt,/Expression: serious/iu);
const hairVariant=buildCanonicalV3UserOutput({...raw,hair:"messy"});
assert.notEqual(hairVariant.prompt,out.prompt,"hair selection must affect car prompt");
assert.match(hairVariant.prompt,/Hair: slightly messy/iu);

const day=buildCanonicalV3UserOutput({...raw,time:"day",lighting:"car-day"});
assert.notEqual(day.prompt,out.prompt,"day/night must affect car prompt");
assert.match(day.prompt,/Day lighting: real sun\/sky through glass/iu);
assert.match(day.prompt,/natural cabin shadows, exterior brightness, one source-matched eye catchlight and ordinary phone dynamic range/iu);
assert.doesNotMatch(day.prompt,/Night lighting:/iu);
const night=buildCanonicalV3UserOutput({...raw,time:"night",lighting:"car-night"});
assert.match(night.prompt,/Night lighting:/iu);

const riyadh=buildCanonicalV3UserOutput({...raw,city:"riyadh"});
const jeddah=buildCanonicalV3UserOutput({...raw,city:"jeddah"});
assert.match(riyadh.prompt,/inland Saudi street life/iu);
assert.match(jeddah.prompt,/western-coast Saudi street life/iu);
assert.notEqual(riyadh.prompt,jeddah.prompt,"selected Saudi city must influence geographic character without forcing signage");
assert.doesNotMatch(riyadh.prompt,/\bRiyadh\b/iu);
assert.doesNotMatch(jeddah.prompt,/\bJeddah\b/iu);

const activeLife=buildCanonicalV3UserOutput({...raw,messiness:"busy",peopleDensity:"high"});
assert.match(activeLife.prompt,/denser .*Saudi street life/iu);
assert.match(activeLife.prompt,/several dispersed pedestrians/iu);
assert.doesNotMatch(activeLife.prompt,/staged crowd/iu);

const ignoredNoiseVariant=buildCanonicalV3UserOutput({
  ...raw,fabric:"silk",fabricWeight:"light",ironState:"wrinkled",wearState:"worn",clothingFit:"slim",skin:"matte",
  accessoryProfile:"sunglasses",accessoryDetail:"silver chain",objectProfile:"water-bottle",
  environmentNote:"Riyadh skyline and crowded road",postProcessing:["hdr","film"],selfieAngle:"low",composition:"full"
});
assert.equal(ignoredNoiseVariant.prompt,out.prompt,"disabled generic controls must not leak into car prompt");

const poseVariant=buildCanonicalV3UserOutput({...raw,pose:"roof-context"});
assert.notEqual(poseVariant.prompt,out.prompt,"driver-seat pose must remain active");
assert.match(poseVariant.prompt,/Pose: wider driver selfie/iu);
const staleExterior=buildCanonicalV3UserOutput({...raw,pose:"standing beside the open driver door"});
assert.doesNotMatch(staleExterior.prompt,/standing beside the open driver door|front grille|rear tailgate/iu);
assert.match(staleExterior.prompt,/Pose: upright driver-seat selfie/iu);

const ten=Array.from({length:10},()=>buildCanonicalV3UserOutput(raw).prompt);
assert.ok(ten.every(prompt=>prompt===ten[0]),"car interior Phase 55 must remain deterministic 10/10");

const ui=fs.readFileSync(new URL("../js/phase54-section-field-ui.js",import.meta.url),"utf8");
for(const selector of ["#clothing","#clothing-custom","#expression","#hair","#time"]){
  const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  assert.match(ui,new RegExp(`${escaped.replace("#","#")}[\\s\\S]{0,100}hidden:false[\\s\\S]{0,60}disabled:false`,`iu`),`UI must keep ${selector} active in car`);
}
assert.match(ui,/realism-core-title[\s\S]{0,100}hidden:false[\s\S]{0,60}disabled:false/iu,"Realism Core must stay visible and active in car");
assert.match(ui,/#city[\s\S]{0,100}hidden:false[\s\S]{0,60}disabled:false/iu,"Saudi city context must stay active");
assert.match(ui,/#people-density[\s\S]{0,100}hidden:false[\s\S]{0,60}disabled:false/iu,"background people density must stay active");
assert.match(ui,/#fabric[\s\S]{0,180}hidden:carInterior[\s\S]{0,80}disabled:carInterior/iu,"conflicting fabric-state UI must stay isolated in car");

console.log(`PHASE55_CAR_WORDS=${words(out.prompt)}`);
console.log("PHASE55_CAR_SUBJECT_CONTROLS=clothing,expression,hair,time");
console.log("PHASE55_CAR_REALISM=mandatory");
console.log("PHASE55_CAR_SAUDI_ENVIRONMENT_LIFE=active-through-glass");
console.log("PHASE55_CAR_DAY_NIGHT_PHYSICS=PASS");
console.log("PHASE55_CAR_LHD_VISUAL_ANCHORS=PASS");
console.log("PHASE55_CAR_DETERMINISM=10/10");
console.log("Phase 55 car interior restored realism and controls: PASS");
