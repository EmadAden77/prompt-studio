import assert from "node:assert/strict";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-phase55.js";
import {
  XIAOMI_15_ULTRA_FRONT_CAMERA,
  buildXiaomi15UltraRealismContract,
  describeXiaomi15UltraFrontCamera,
  describeXiaomi15UltraProcessing
} from "../js/canonical/xiaomi15-ultra-front-camera-phase57.js";

const words=value=>String(value||"").trim().split(/\s+/u).filter(Boolean).length;

assert.equal(XIAOMI_15_ULTRA_FRONT_CAMERA.focalLengthEquivalentMm,21);
assert.equal(XIAOMI_15_ULTRA_FRONT_CAMERA.aperture,"f/2.0");
assert.equal(XIAOMI_15_ULTRA_FRONT_CAMERA.fieldOfViewDegrees,90);
assert.equal(XIAOMI_15_ULTRA_FRONT_CAMERA.resolution,"32 MP");
assert.equal(XIAOMI_15_ULTRA_FRONT_CAMERA.sensor,"1/3.6-inch-class");

const day={studioSection:"street",scene:"street",hasReference:true,xiaomiFrontCameraProfile:true,time:"day",lighting:"overcast daylight",clothing:"plain white T-shirt",expression:"neutral"};
const night={studioSection:"street",scene:"street",hasReference:true,xiaomiFrontCameraProfile:true,time:"night",lighting:"sodium",clothing:"plain black T-shirt",expression:"neutral"};
const mixed={studioSection:"bedroom",scene:"bedroom",hasReference:true,time:"night",lighting:"window-lamp mixed",clothing:"plain black T-shirt",expression:"neutral"};

for(const raw of [day,night,mixed]){
  const out=buildCanonicalV3UserOutput(raw);
  assert.equal(out.phase54.xiaomi15Ultra.active,true);
  assert.match(out.prompt,/Xiaomi 15 Ultra front camera; natural 21 mm perspective/iu);
  assert.match(out.prompt,/source-aware phone rendering/iu);
  assert.ok(words(out.prompt)<=250,"prompt budget overflow: "+words(out.prompt));
}
assert.match(describeXiaomi15UltraProcessing(day),/restrained HDR/iu);
assert.match(describeXiaomi15UltraProcessing(night),/mild luminance\/chroma noise/iu);
assert.match(describeXiaomi15UltraProcessing(mixed),/mixed practical sources/iu);
assert.match(describeXiaomi15UltraFrontCamera(day),/32 MP 1\/3\.6-inch-class sensor/iu);

const car=buildCanonicalV3UserOutput({studioSection:"car",scene:"rangeRover",hasReference:true,time:"night",lighting:"car-night",pose:"driver-close",clothing:"plain black T-shirt",expression:"neutral"});
assert.equal(car.phase56.xiaomi15Ultra.device,"Xiaomi 15 Ultra front camera");
assert.equal(car.phase56.xiaomi15Ultra.noArtificialBokeh,true);
assert.ok(words(car.prompt)<=280,"car prompt budget overflow: "+words(car.prompt));
assert.equal(buildXiaomi15UltraRealismContract({accidentalDevice:"iphone"}).active,false);

console.log("PHASE57_XIAOMI_FRONT_CAMERA=PASS");
