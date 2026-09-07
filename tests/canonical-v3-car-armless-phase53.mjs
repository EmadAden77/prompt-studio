import assert from "node:assert/strict";
import fs from "node:fs";
import { buildCanonicalV3UserOutput, ARMLESS_LOCK, ARMLESS_FRAMING, ARMLESS_OPTICS } from "../js/canonical/canonical-v3-phase53.js";
import { getSection } from "../js/sections/index.js";
import { CAR_ARMLESS_POSE_OPTIONS } from "../js/phase53-car-armless-ui.js";

const words=value=>String(value||"").trim().split(/\s+/u).filter(Boolean).length;
const poseIds=[
  "driver-close-armless","driver-low-armless","driver-side-armless","driver-roof-armless",
  "passenger-close-armless","rear-seat-armless"
];
const base={
  hasReference:true,studioSection:"car",scene:"rangeRover",time:"night",lighting:"car-night",
  clothing:"formal-shirt-gray-trouser-black",expression:"neutral",hair:"same",placeState:"used"
};

const section=getSection("car");
for(const id of poseIds) assert.ok(section.poses.includes(id),`car section missing ${id}`);
assert.equal(section.rules.selfieGeometry.autoTightCropPose,"driver-close-armless");
assert.deepEqual(section.rules.selfieGeometry.armlessAngles,["eye","slightly-below","three-quarter","roof-tilt"]);

assert.equal(CAR_ARMLESS_POSE_OPTIONS.length,6);
for(const item of CAR_ARMLESS_POSE_OPTIONS){
  assert.ok(poseIds.includes(item.value));
  assert.match(item.label,/\(الذراع خارج الإطار\)$/u);
}

for(const pose of poseIds){
  const out=buildCanonicalV3UserOutput({...base,pose});
  assert.equal(out.phase53.active,true,`${pose}: Phase 53 must be active`);
  assert.equal(out.phase53.feature,"car-cabin-armless-selfie");
  assert.equal(out.phase53.armVisible,false);
  assert.equal(out.phase53.hardLimit,250);
  assert.equal(out.phase55.armlessMode,true);
  assert.equal(out.phase55.interiorOnly,true);
  assert.equal(out.phase55.determinism,"10/10");
  assert.ok(out.prompt.includes(ARMLESS_LOCK),`${pose}: ARMLESS_LOCK missing`);
  assert.ok(out.prompt.includes(ARMLESS_FRAMING),`${pose}: framing sentence missing`);
  assert.ok(out.prompt.includes(ARMLESS_OPTICS),`${pose}: near-field optics missing`);
  assert.match(out.prompt,/LHD visual anchors:/iu,`${pose}: LHD anchors missing`);
  assert.match(out.prompt,/Ivory perforated leather/iu);
  assert.match(out.prompt,/dark wood veneer/iu);
  assert.match(out.prompt,/transparent panoramic glass/iu);
  assert.match(out.prompt,/glass never opaque black/iu);
  assert.match(out.prompt,/195 cm, 88 kg lean-athletic; shoulders fill seatback, head near headliner/iu);
  assert.match(out.prompt,/Other hand: wheel\/console\/lap, or out of frame/iu);
  assert.match(out.prompt,/Preserve reference identity:/iu);
  assert.doesNotMatch(out.prompt,/one arm extends|holding the phone at arm reach|one hand holds the phone/iu,`${pose}: visible-arm lock leaked`);
  assert.doesNotMatch(out.prompt,/grille|alloys|\bDRL\b|Fuji White exterior/iu,`${pose}: exterior spec leaked`);
  assert.doesNotMatch(out.prompt,/street lights|building lights|vehicle lights|street\/building\/vehicle/iu,`${pose}: exterior lighting leaked`);
  assert.ok(words(out.prompt)<=250,`${pose}: word budget exceeded (${words(out.prompt)})`);

  const repeated=Array.from({length:10},()=>buildCanonicalV3UserOutput({...base,pose}).prompt);
  assert.ok(repeated.every(prompt=>prompt===repeated[0]),`${pose}: determinism must remain 10/10`);
}

const close=buildCanonicalV3UserOutput({...base,pose:"driver-close-armless",lighting:"car-night"});
assert.match(close.prompt,/driver headrest, B-pillar, window edge, steering-wheel top arc at bottom/iu);
assert.match(close.prompt,/Car-only night: dim cabin ambient plus restrained dash glow/iu);

const low=buildCanonicalV3UserOutput({...base,pose:"driver-low-armless"});
assert.match(low.prompt,/slightly below eye level/iu);
assert.match(low.prompt,/Ivory headliner, sun visor, transparent panoramic roof/iu);

const side=buildCanonicalV3UserOutput({...base,pose:"driver-side-armless"});
assert.match(side.prompt,/driver-side-armless three-quarter/iu);
assert.match(side.prompt,/dark-wood door trim and one side-window edge/iu);

const roof=buildCanonicalV3UserOutput({...base,pose:"driver-roof-armless",lighting:"car-night"});
assert.match(roof.prompt,/gentle roof tilt/iu);
assert.match(roof.prompt,/real night sky and stars/iu);
assert.match(roof.prompt,/never opaque black/iu);

const passenger=buildCanonicalV3UserOutput({...base,pose:"passenger-close-armless"});
assert.match(passenger.prompt,/front passenger seat/iu);
assert.match(passenger.prompt,/center-console side/iu);
assert.match(passenger.prompt,/no steering wheel in frame/iu);

const rear=buildCanonicalV3UserOutput({...base,pose:"rear-seat-armless"});
assert.match(rear.prompt,/two front headrests softly blurred/iu);

const day=buildCanonicalV3UserOutput({...base,pose:"driver-close-armless",time:"day",lighting:"car-day"});
assert.match(day.prompt,/Car-only day:/iu);
assert.doesNotMatch(day.prompt,/Car-only night/iu);
const flash=buildCanonicalV3UserOutput({...base,pose:"driver-close-armless",time:"night",lighting:"car-night-flash"});
assert.match(flash.prompt,/Car-only night-flash: phone flash/iu);
assert.match(flash.prompt,/dim cabin ambient and restrained dash glow/iu);

const auto=buildCanonicalV3UserOutput({...base,pose:"auto",mode:"auto",composition:"tight head-and-shoulders"});
assert.equal(auto.phase53.pose,"driver-close-armless","auto tight crop must select armless close driver mode");
assert.ok(auto.prompt.includes(ARMLESS_LOCK));

const uiSource=fs.readFileSync(new URL("../js/phase53-car-armless-ui.js",import.meta.url),"utf8");
for(const id of poseIds) assert.match(uiSource,new RegExp(id,"u"));
assert.match(uiSource,/الذراع خارج الإطار/u);

console.log(`PHASE53_CAR_ARMLESS_CLOSE_WORDS=${words(close.prompt)}`);
console.log(`PHASE53_CAR_ARMLESS_ROOF_WORDS=${words(roof.prompt)}`);
console.log("PHASE53_CAR_ARMLESS_MODES=6");
console.log("PHASE53_CAR_ARMLESS_LIGHTING=day,night,night-flash");
console.log("PHASE53_CAR_ARMLESS_DETERMINISM=10/10");
console.log("Phase 53 car cabin armless selfie modes: PASS");
