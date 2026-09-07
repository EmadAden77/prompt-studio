import assert from "node:assert/strict";
import fs from "node:fs";
import {
  buildCanonicalV3UserOutput,
  LHD_VEHICLE_RELATIVE_ANCHORS,
  LHD_SELFIE_VIEWER_MAPPING,
  LHD_STEERING_ANCHOR,
  LHD_REAR_SEAT_ANCHOR
} from "../js/canonical/canonical-v3-phase55.js";

const words=value=>String(value||"").trim().split(/\s+/u).filter(Boolean).length;
const WRONG_SIDE_STEERING=/steering wheel\s+(?:is\s+|sits\s+|appears\s+|located\s+|centered\s+)?(?:on|at|in)\s+(?:the\s+)?(?:cabin|vehicle)\s+RIGHT/iu;

const raw={
  hasReference:true,
  studioSection:"car",
  scene:"rangeRover",
  time:"night",
  clothing:"formal-shirt-gray-trouser-black",
  expression:"neutral",
  pose:"driver-close",
  lighting:"car-night"
};

const out=buildCanonicalV3UserOutput(raw);
assert.equal(out.phase55.active,true);
assert.equal(out.phase55.lhdVisualAnchors,true);
assert.equal(out.phase55.viewerMapping,true);
assert.equal(out.phase55.steeringWheelCenteredOnLeftSeat,true);
assert.equal(out.phase55.rearLeftBehindDriver,true);
assert.equal(out.phase55.determinism,"10/10");
assert.ok(words(out.prompt)<=280,`LHD visual-anchor prompt exceeds 280 words (${words(out.prompt)})`);
assert.equal(out.phase55.hardLimit,280);

for(const required of [
  LHD_VEHICLE_RELATIVE_ANCHORS,
  LHD_SELFIE_VIEWER_MAPPING,
  LHD_STEERING_ANCHOR,
  LHD_REAR_SEAT_ANCHOR
]) assert.ok(out.prompt.includes(required),`missing LHD visual anchor: ${required}`);

assert.match(out.prompt,/driver's seat and steering wheel occupy the vehicle LEFT/iu);
assert.match(out.prompt,/empty Ivory passenger seat occupies the cabin RIGHT/iu);
assert.match(out.prompt,/center console.*driver's RIGHT/iu);
assert.match(out.prompt,/seatbelt retractor and B-pillar.*LEFT shoulder/iu);
assert.match(out.prompt,/LEFT-side door, B-pillar and seatbelt appear on the viewer's RIGHT/iu);
assert.match(out.prompt,/empty passenger seat appears on the viewer's LEFT/iu);
assert.match(out.prompt,/centered only in front of the LEFT seat/iu);
assert.match(out.prompt,/no wheel or pedal geometry on the cabin right/iu);
assert.match(out.prompt,/rear-left is behind the driver/iu);

assert.doesNotMatch(out.prompt,/driver(?:'s)? (?:seatbelt|belt|B-pillar).*RIGHT shoulder/iu);
assert.doesNotMatch(out.prompt,/passenger seat.*vehicle LEFT/iu);
assert.doesNotMatch(out.prompt,WRONG_SIDE_STEERING);
assert.match(out.prompt,/Preserve reference identity:/iu,"identity lock must remain protected");
assert.match(out.prompt,/Self-held; phone and holding arm stay outside the crop/iu,"subject-held arm-free selfie lock must remain protected");

const ten=Array.from({length:10},()=>buildCanonicalV3UserOutput(raw).prompt);
assert.ok(ten.every(prompt=>prompt===ten[0]),"LHD visual anchors must be deterministic 10/10");

for(const pose of ["driver-seat","driver-close","driver-low","roof-context"]){
  const prompt=buildCanonicalV3UserOutput({...raw,pose}).prompt;
  assert.ok(prompt.includes(LHD_VEHICLE_RELATIVE_ANCHORS),`${pose}: vehicle anchors missing`);
  assert.ok(prompt.includes(LHD_SELFIE_VIEWER_MAPPING),`${pose}: viewer mapping missing`);
  assert.ok(words(prompt)<=280,`${pose}: exceeds 280 words`);
}

const gate=fs.readFileSync(new URL("../js/canonical/engine-gate.js",import.meta.url),"utf8");
const phase53=fs.readFileSync(new URL("../js/canonical/canonical-v3-phase53.js",import.meta.url),"utf8");
assert.match(gate,/canonical-v3-phase53\.js/iu,"live gate must retain compatibility entrypoint");
assert.match(phase53,/canonical-v3-phase55\.js/iu,"live compatibility entrypoint must delegate to LHD-anchor output");

console.log(`PHASE52_LHD_WORDS=${words(out.prompt)}`);
console.log("PHASE52_LHD_VEHICLE_ANCHORS=PASS");
console.log("PHASE52_LHD_VIEWER_MAPPING=PASS");
console.log("PHASE52_LHD_STEERING_CENTERING=PASS");
console.log("PHASE52_LHD_REAR_SEATS=PASS");
console.log("PHASE52_LHD_DETERMINISM=10/10");
console.log(`PHASE52_LHD_SAMPLE=${out.prompt}`);
console.log("Phase 52 LHD visual anchors: PASS");
