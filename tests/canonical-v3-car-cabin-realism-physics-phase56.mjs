import assert from "node:assert/strict";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-phase53.js";

const words=value=>String(value||"").trim().split(/\s+/u).filter(Boolean).length;
const base={
  hasReference:true,studioSection:"car",scene:"rangeRover",time:"night",lighting:"car-night",
  clothing:"formal-shirt-gray-trouser-black",expression:"neutral",hair:"same",placeState:"used"
};

const close=buildCanonicalV3UserOutput({...base,pose:"driver-close-armless"});
assert.equal(close.phase56.active,true);
assert.equal(close.phase56.feature,"car-cabin-realism-physics");
assert.equal(close.phase56.contactPhysics,true);
assert.equal(close.phase56.seatAwareScale,true);
assert.equal(close.phase56.nearFieldDistortion,true);
assert.equal(close.phase56.reflectionPhysics,true);
assert.equal(close.phase56.microAsymmetry,true);
assert.equal(close.phase56.eyeLinePhysics,true);
assert.equal(close.phase56.nightSensorModel,true);
assert.equal(close.phase56.poseVisibilityMatrix,true);
assert.equal(close.phase56.edgeOcclusion,true);
assert.equal(close.phase56.phoneProcessing,true);
assert.equal(close.phase56.contradictionChecker,true);
assert.equal(close.phase56.determinism,"10/10");
assert.match(close.prompt,/near-field phone projection/iu);
assert.match(close.prompt,/face\/near shoulder enlarged/iu);
assert.match(close.prompt,/seat\/headrest compress/iu);
assert.match(close.prompt,/shoulders differ/iu);
assert.match(close.prompt,/clothing bunches at contact/iu);
assert.match(close.prompt,/Wood\/glass reflections stay faint/iu);
assert.match(close.prompt,/Eye-line may favor screen/iu);
assert.match(close.prompt,/Nothing floats/iu);
assert.match(close.prompt,/noisy shadows/iu);
assert.match(close.prompt,/softer distant detail/iu);
assert.ok(words(close.prompt)<=250,`close prompt exceeded budget: ${words(close.prompt)}`);

const flash=buildCanonicalV3UserOutput({...base,pose:"driver-close-armless",lighting:"car-night-flash"});
assert.equal(flash.phase56.flashFalloff,true);
assert.match(flash.prompt,/phone flash plus dim cabin ambient and restrained dash glow/iu);
assert.match(flash.prompt,/rear darker/iu);
assert.match(flash.prompt,/short jaw\/neck shadows/iu);
assert.match(flash.prompt,/one wood highlight/iu);
assert.ok(words(flash.prompt)<=250,`flash prompt exceeded budget: ${words(flash.prompt)}`);

const roof=buildCanonicalV3UserOutput({...base,pose:"driver-roof-armless",roof:"opaque black roof"});
assert.ok(roof.phase56.autoCorrectedContradictions.includes("panoramic-glass-transparency-restored"));
assert.match(roof.prompt,/transparent panoramic glass/iu);
assert.match(roof.prompt,/real night sky and stars/iu);
assert.match(roof.prompt,/faint cabin reflection/iu);
assert.doesNotMatch(roof.prompt,/opaque black roof/iu);

const passenger=buildCanonicalV3UserOutput({...base,pose:"passenger-close-armless",requestedElements:"show steering wheel"});
assert.ok(passenger.phase56.autoCorrectedContradictions.includes("passenger-wheel-suppressed"));
assert.match(passenger.prompt,/front passenger seat/iu);
assert.match(passenger.prompt,/no steering wheel in frame/iu);

const rear=buildCanonicalV3UserOutput({...base,pose:"rear-seat-armless",composition:"full torso"});
assert.ok(rear.phase56.autoCorrectedContradictions.includes("rear-tight-crop-preserved"));
assert.match(rear.prompt,/two front headrests softly blurred/iu);
assert.match(rear.prompt,/tight head-and-shoulders cabin crop/iu);

const flashConflict=buildCanonicalV3UserOutput({...base,pose:"driver-close-armless",lighting:"flash evenly lit cabin"});
assert.ok(flashConflict.phase56.autoCorrectedContradictions.includes("flash-falloff-restored"));
assert.match(flashConflict.prompt,/rear darker/iu);

const day=buildCanonicalV3UserOutput({...base,pose:"driver-close-armless",time:"day",lighting:"car-day"});
assert.equal(day.phase56.nightSensorModel,false);
assert.equal(day.phase56.flashFalloff,false);
assert.match(day.prompt,/restrained phone HDR/iu);
assert.match(day.prompt,/no studio fill/iu);

const repeated=Array.from({length:10},()=>buildCanonicalV3UserOutput({...base,pose:"driver-close-armless"}));
assert.ok(repeated.every(item=>item.prompt===repeated[0].prompt),"Phase 56 prompt must remain deterministic");
assert.ok(repeated.every(item=>JSON.stringify(item.phase56)===JSON.stringify(repeated[0].phase56)),"Phase 56 metadata must remain deterministic");

const legacy=buildCanonicalV3UserOutput({...base,pose:"driver-seat"});
assert.equal(legacy.phase56.active,false,"legacy non-armless car path must remain compatible");
assert.match(legacy.prompt,/Self-held at arm reach; phone and holding arm remain outside the crop/iu);
assert.doesNotMatch(legacy.prompt,/visible holding arm|one arm extends|full holding forearm/iu);
assert.doesNotMatch(legacy.prompt,/near-field phone projection/iu);

console.log(`PHASE56_CLOSE_WORDS=${words(close.prompt)}`);
console.log(`PHASE56_FLASH_WORDS=${words(flash.prompt)}`);
console.log("PHASE56_REALISM_LAYERS=contact,scale,optics,reflection,asymmetry,eyeline,sensor,flash,visibility,occlusion,processing,contradictions");
console.log("PHASE56_DETERMINISM=10/10");
console.log("Phase 56 car cabin realism physics: PASS");