import assert from "node:assert/strict";
import fs from "node:fs";
import { buildCanonicalV3UserOutput, reviewCarExteriorPrompt } from "../js/canonical/canonical-v3-phase53.js";

const words=v=>String(v||"").trim().split(/\s+/u).filter(Boolean).length;
const base=(extra={})=>({hasReference:true,studioSection:"carExterior",scene:"carExterior",time:"night",clothing:"formal-shirt-white-beige",expression:"neutral",carExteriorLocation:"parking",selfieAngle:"auto",...extra});

const cases=[
  {pose:"door-lean",view:"side",must:/L494 roofline.*window line.*door\/vent placement.*wheel arches.*circular wheels/iu},
  {pose:"front-fender",view:"front-quarter",must:/L494 grille\/headlight.*hood-fender.*front wheel-arch.*circular wheel/iu},
  {pose:"rear-quarter",view:"rear-quarter",must:/L494 tailgate\/lamp.*rear body-mass.*rear wheel-arch.*circular wheel/iu},
  {pose:"door-open",view:"door-open",must:/L494 roofline.*window\/door geometry.*wheel arch.*Ivory-cabin alignment/iu}
];

for(const item of cases){
  const raw=base({carExteriorPose:item.pose});
  const out=buildCanonicalV3UserOutput(raw);
  assert.equal(out.phase53.active,true);
  assert.equal(out.phase53.status,"pass");
  assert.equal(out.phase53.visibilityGate,true);
  assert.equal(out.phase53.view,item.view);
  assert.ok(out.phase53.minimumVisibleCues.length>=5);
  assert.match(out.prompt,item.must,`${item.pose}: visibility/fidelity cues missing`);
  assert.match(out.prompt,/never a generic SUV/iu);
  assert.ok(words(out.prompt)<=280,`${item.pose}: budget exceeded (${words(out.prompt)})`);
  assert.match(out.prompt,/2017 Range Rover Sport Autobiography Dynamic L494/iu);
  assert.match(out.prompt,/white formal shirt with beige trousers and a brown belt/iu);
  assert.match(out.prompt,/Neutral closed-mouth expression/iu);
  assert.match(out.prompt,/unmistakably at night/iu);
  for(const entry of Object.values(out.phase50.selectionManifest)) assert.ok(out.prompt.includes(entry.resolved||entry.requested),`${item.pose}: selection lost`);
  const reviewed=reviewCarExteriorPrompt(raw,out,out.prompt);
  assert.equal(reviewed.status,"pass");
  const ten=Array.from({length:10},()=>buildCanonicalV3UserOutput(raw).prompt);
  assert.ok(ten.every(v=>v===ten[0]),`${item.pose}: determinism must be 10/10`);
}

const street=buildCanonicalV3UserOutput({hasReference:true,studioSection:"street",scene:"street",time:"night",clothing:"thobe-redshemagh-iqal",expression:"neutral",selfiePose:"standing-relaxed"});
assert.equal(street.phase53.active,false);
assert.ok(words(street.prompt)<=250);

const engineGate=fs.readFileSync(new URL("../js/canonical/engine-gate.js",import.meta.url),"utf8");
assert.match(engineGate,/from\s+["']\.\/canonical-v3-phase53\.js["']/u,"live engine gate must use Phase 53");

console.log("PHASE53_VIEWS=side,front-quarter,rear-quarter,door-open");
console.log(`PHASE53_SIDE_WORDS=${words(buildCanonicalV3UserOutput(base({carExteriorPose:"door-lean"})).prompt)}`);
console.log("PHASE53_DETERMINISM=10/10");
console.log("Phase 53 carExterior reviewer and visibility gate: PASS");
