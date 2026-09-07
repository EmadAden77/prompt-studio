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
assert.deepEqual(carSection.rules.authority.fixed,["seats","cabin"]);
assert.deepEqual(carSection.rules.authority.selectable,["pose","lighting"]);
assert.equal(carSection.rules.wiring.lighting,true);
assert.equal(carSection.rules.wiring.pose,true);
for(const key of [
  "clothing","customClothing","fabric","fabricWeight","ironState","wearState","clothingFit","expression","body","selfieArmLock",
  "selfieAngle","composition","hair","skin","time","realismCore","advancedRealism","accessoryProfile","accessoryDetail",
  "objectProfile","environmentNote","postProcessing"
]) assert.equal(carSection.rules.wiring[key],false,`car four-domain scope must disable ${key}`);

const raw={
  hasReference:true,
  studioSection:"car",
  scene:"rangeRover",
  time:"night",
  clothing:"formal-shirt-gray-trouser-black",
  customClothing:"red jacket with logos",
  expression:"laughing",
  pose:"driver-close",
  lighting:"car-night",
  city:"dammam",
  hair:"hand-neat",
  skin:"retouched-glossy",
  fabric:"cotton-jersey",
  fabricWeight:"heavy",
  ironState:"normal-pressed",
  wearState:"fresh",
  clothingFit:"oversized",
  messiness:"busy",
  selfieAngle:"three-quarter",
  composition:"upper",
  accessoryProfile:"luxury-watch",
  accessoryDetail:"gold bracelet",
  objectProfile:"coffee-cup",
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
assert.equal(out.phase55.strictFourDomainAuthority,true);
assert.deepEqual(out.phase55.fixedDomains,["seats","cabin"]);
assert.deepEqual(out.phase55.selectableDomains,["driver-seat pose","car lighting"]);
assert.equal(out.phase55.genericSubjectControlsIgnored,true);
assert.equal(out.phase55.rawGenericControlsInjected,false);
assert.equal(out.phase55.namedExteriorContextAllowed,false);
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
assert.deepEqual(out.phase55.wikiPromptSpecialization.allowedDomains,["seats","cabin","driver-seat pose","car lighting"]);
assert.equal(out.phase55.wikiPromptSource.url,"https://www.wikiprompt.org/realistic-selfie-image-prompt-generator-system-prompt");
assert.equal(out.phase55.wikiPromptSource.sourceUpdated,"2026-08-27");

assert.match(out.prompt,/^ChatGPT Images: create one candid front-camera selfie inside a parked 2017 Range Rover Sport Autobiography Dynamic L494/iu);
assert.match(out.prompt,/He sits naturally in the driver seat/iu,"action-first seated behavior must be rendered");
assert.match(out.prompt,/Preserve reference identity/iu);
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
assert.match(out.prompt,/Cabin: Ivory perforated leather, dark wood, black-and-Ivory steering wheel, transparent panoramic roof and Ivory headliner/iu);
assert.match(out.prompt,/Pose: close driver-seat selfie/iu);
assert.match(out.prompt,/Car lighting: cabin practical light is dominant/iu);
assert.match(out.prompt,/Background stays cabin-only/iu);
assert.match(out.prompt,/outside through glass is soft and anonymous/iu);
assert.match(out.prompt,/slight natural compression where the driver contacts the Ivory seat/iu);
assert.match(out.prompt,/touched-surface wear on dark wood and controls/iu);
assert.match(out.prompt,/Mirror rules are not applicable/iu);

for(const forbidden of [
  /Subject wearing/iu,/light gray formal shirt|red jacket|laughing expression|closed-mouth expression/iu,
  /Selected controls:/iu,/city=/iu,/background=/iu,/fabric=/iu,/hair=/iu,/cotton-jersey|normal-pressed|oversized/iu,
  /Dammam|luxury-watch|gold bracelet|coffee-cup|cinematic/iu,/busy traffic|crowd|landmark/iu,
  /front grille|rear tailgate|standing beside|leaning against the .*driver door/iu,
  /driver(?:'s)? (?:seatbelt|belt|B-pillar).*RIGHT shoulder/iu,/passenger seat.*vehicle LEFT/iu,
  /steering wheel\s+(?:is\s+|sits\s+|appears\s+|located\s+|centered\s+)?(?:on|at|in)\s+(?:the\s+)?(?:cabin|vehicle)\s+RIGHT/iu,
  /\bISO\b|\byaw\b|\bpitch\b|\broll\b|\b21\s*mm\b|f\/\d/iu
]) assert.doesNotMatch(out.prompt,forbidden,`forbidden car-interior leakage: ${forbidden}`);
assert.match(out.prompt,/No driving, passenger-seat relocation, exterior pose, studio\/ring light or staged display/iu);

assert.ok(words(out.prompt)<=280,`car interior ChatGPT prompt budget exceeded (${words(out.prompt)})`);
assert.equal(out.phase55.wordCount,words(out.prompt));
assert.equal(out.phase55.hardLimit,280);

const genericNoiseVariant=buildCanonicalV3UserOutput({
  ...raw,
  time:"day",
  clothing:"casual-tee-black-jeans-blue",
  customClothing:"white thobe",
  expression:"serious",
  city:"riyadh",
  hair:"messy",
  skin:"matte",
  fabric:"silk",
  fabricWeight:"light",
  ironState:"wrinkled",
  wearState:"worn",
  clothingFit:"slim",
  messiness:"minimal",
  selfieAngle:"low",
  composition:"full",
  accessoryProfile:"sunglasses",
  accessoryDetail:"silver chain",
  objectProfile:"water-bottle",
  environmentNote:"Riyadh skyline and crowded road",
  postProcessing:["hdr","film"]
});
assert.equal(genericNoiseVariant.prompt,out.prompt,"generic controls must not alter the car-interior prompt");

const poseVariant=buildCanonicalV3UserOutput({...raw,pose:"roof-context"});
assert.notEqual(poseVariant.prompt,out.prompt,"driver-seat pose must remain an active section control");
assert.match(poseVariant.prompt,/Pose: slightly wider driver-seat selfie/iu);

const lightingVariant=buildCanonicalV3UserOutput({...raw,lighting:"car-day"});
assert.notEqual(lightingVariant.prompt,out.prompt,"car lighting must remain an active section control");
assert.match(lightingVariant.prompt,/Car lighting: soft real daylight enters through the vehicle glass/iu);

const staleExterior=buildCanonicalV3UserOutput({
  ...raw,
  pose:"standing beside the open driver door",
  lighting:"car-night"
});
assert.doesNotMatch(staleExterior.prompt,/standing beside the open driver door|front grille|rear tailgate/iu);
assert.match(staleExterior.prompt,/Pose: naturally seated upright in the driver seat/iu,"invalid exterior pose must resolve to driver-seat pose");

const ten=Array.from({length:10},()=>buildCanonicalV3UserOutput(raw).prompt);
assert.ok(ten.every(prompt=>prompt===ten[0]),"car interior Phase 55 must remain deterministic 10/10");

console.log(`PHASE55_CAR_WORDS=${words(out.prompt)}`);
console.log("PHASE55_CAR_SCOPE=seats,cabin,driver-seat poses,car lighting");
console.log("PHASE55_CAR_FIXED_DOMAINS=seats,cabin");
console.log("PHASE55_CAR_SELECTABLE_DOMAINS=pose,lighting");
console.log("PHASE55_CAR_GENERIC_INPUT_INVARIANCE=PASS");
console.log("PHASE55_CAR_WIKIPROMPT=action-first,context-consistent,cabin-imperfections,simple-camera,non-mirror");
console.log("PHASE55_CAR_LHD_VISUAL_ANCHORS=PASS");
console.log("PHASE55_CAR_GENERIC_LEAKAGE=0");
console.log("PHASE55_CAR_CONTRADICTIONS=0");
console.log("PHASE55_CAR_DETERMINISM=10/10");
console.log("Phase 55 strict four-domain car interior: PASS");
