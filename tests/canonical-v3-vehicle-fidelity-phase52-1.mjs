import assert from "node:assert/strict";
import fs from "node:fs";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-phase52-1.js";

const words=v=>String(v||"").trim().split(/\s+/u).filter(Boolean).length;
const base=(extra={})=>({hasReference:true,studioSection:"carExterior",scene:"carExterior",time:"night",clothing:"formal-shirt-white-beige",expression:"neutral",carExteriorLocation:"parking",selfieAngle:"auto",...extra});

const cases=[
  {pose:"door-lean",view:"side",pattern:/L494 side silhouette.*roofline.*window line.*door\/vent placement.*wheel arches.*circular wheels/iu},
  {pose:"front-fender",view:"front-quarter",pattern:/L494 front-quarter shape.*grille\/headlight proportions.*hood-fender geometry.*wheel arches.*circular wheels/iu},
  {pose:"rear-quarter",view:"rear-quarter",pattern:/L494 rear-quarter shape.*tailgate\/lamp placement.*rear wheel-arch geometry.*circular wheels/iu},
  {pose:"door-open",view:"door-open",pattern:/L494 side silhouette.*window\/door geometry.*open driver door aligns naturally with the Ivory cabin/iu}
];

for(const item of cases){
  const raw=base({carExteriorPose:item.pose});
  const out=buildCanonicalV3UserOutput(raw);
  assert.equal(out.phase52_1.active,true);
  assert.equal(out.phase52_1.vehicleFidelity,true);
  assert.equal(out.phase52_1.view,item.view);
  assert.equal(out.phase52_1.pose,item.pose);
  assert.match(out.prompt,item.pattern,`${item.pose}: angle-aware fidelity contract missing`);
  assert.match(out.prompt,/never a generic SUV/iu,`${item.pose}: generic-SUV rejection missing`);
  assert.ok(words(out.prompt)<=280,`${item.pose}: carExterior budget exceeded (${words(out.prompt)})`);
  assert.match(out.prompt,/2017 Range Rover Sport Autobiography Dynamic L494/iu);
  assert.match(out.prompt,/white formal shirt with beige trousers and a brown belt/iu);
  assert.match(out.prompt,/Neutral closed-mouth expression/iu);
  assert.match(out.prompt,/unmistakably at night/iu);
  for(const entry of Object.values(out.phase50.selectionManifest)) assert.ok(out.prompt.includes(entry.resolved||entry.requested),`${item.pose}: protected selection lost`);
  const ten=Array.from({length:10},()=>buildCanonicalV3UserOutput(raw).prompt);
  assert.ok(ten.every(v=>v===ten[0]),`${item.pose}: determinism must be 10/10`);
}

const streetRaw={hasReference:true,studioSection:"street",scene:"street",time:"night",clothing:"thobe-redshemagh-iqal",expression:"neutral",selfiePose:"standing-relaxed"};
const street=buildCanonicalV3UserOutput(streetRaw);
assert.equal(street.phase52_1.active,false,"non-carExterior sections must remain untouched");
assert.doesNotMatch(street.prompt,/Vehicle fidelity:/iu);
assert.ok(words(street.prompt)<=250);

const engineGate=fs.readFileSync(new URL("../js/canonical/engine-gate.js",import.meta.url),"utf8");
assert.match(engineGate,/from\s+["']\.\/canonical-v3-phase52-1\.js["']/u,"historical Phase 52.1 gate contract must remain importable");

console.log("PHASE52_1_VIEWS=side,front-quarter,rear-quarter,door-open");
console.log(`PHASE52_1_SIDE_WORDS=${words(buildCanonicalV3UserOutput(base({carExteriorPose:"door-lean"})).prompt)}`);
console.log("PHASE52_1_DETERMINISM=10/10");
console.log("Phase 52.1 vehicle fidelity contract: PASS");

await import("./canonical-v3-car-exterior-reviewer-phase53.mjs");
