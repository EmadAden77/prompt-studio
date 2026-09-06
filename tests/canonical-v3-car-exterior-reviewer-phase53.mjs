import assert from "node:assert/strict";
import fs from "node:fs";
import { buildCanonicalV3UserOutput as build52_1 } from "../js/canonical/canonical-v3-phase52-1.js";
import { buildCanonicalV3UserOutput, reviewCarExteriorPrompt } from "../js/canonical/canonical-v3-phase53.js";

const words=v=>String(v||"").trim().split(/\s+/u).filter(Boolean).length;
const base=(extra={})=>({hasReference:true,studioSection:"carExterior",scene:"carExterior",time:"night",clothing:"formal-shirt-white-beige",expression:"neutral",carExteriorLocation:"parking",selfieAngle:"auto",...extra});

const cases=["door-lean","front-fender","rear-quarter","door-open"];

for(const pose of cases){
  const raw=base({carExteriorPose:pose});
  const previous=build52_1(raw);
  const out=buildCanonicalV3UserOutput(raw);

  assert.equal(out.prompt,previous.prompt,`${pose}: Phase 53 must not rewrite the Phase 52.1 vehicle prompt`);
  assert.equal(out.phase53.active,true);
  assert.equal(out.phase53.status,"rolled-back-to-phase52.1");
  assert.equal(out.phase53.compatibilityMode,"phase52.1");
  assert.equal(out.phase53.promptMutation,false);
  assert.equal(out.phase53.determinism,"10/10");

  assert.match(out.prompt,/2017 Range Rover Sport Autobiography Dynamic L494/iu);
  assert.match(out.prompt,/Vehicle fidelity:/iu);
  assert.match(out.prompt,/never a generic SUV/iu);
  assert.match(out.prompt,/white formal shirt with beige trousers and a brown belt/iu);
  assert.match(out.prompt,/Neutral closed-mouth expression/iu);
  assert.match(out.prompt,/unmistakably at night/iu);
  assert.ok(words(out.prompt)<=280,`${pose}: budget exceeded (${words(out.prompt)})`);
  for(const entry of Object.values(out.phase50.selectionManifest)) assert.ok(out.prompt.includes(entry.resolved||entry.requested),`${pose}: selection lost`);

  const reviewed=reviewCarExteriorPrompt(raw,out,out.prompt);
  assert.equal(reviewed.status,"pass",`${pose}: restored Phase 52.1 prompt must still pass baseline review`);

  const ten=Array.from({length:10},()=>buildCanonicalV3UserOutput(raw).prompt);
  assert.ok(ten.every(v=>v===ten[0]),`${pose}: determinism must be 10/10`);
}

const streetRaw={hasReference:true,studioSection:"street",scene:"street",time:"night",clothing:"thobe-redshemagh-iqal",expression:"neutral",selfiePose:"standing-relaxed"};
const streetPrevious=build52_1(streetRaw);
const street=buildCanonicalV3UserOutput(streetRaw);
assert.equal(street.prompt,streetPrevious.prompt,"non-carExterior sections without extra Phase 54 controls must remain byte-for-byte unchanged");
assert.equal(street.phase53.active,false);
assert.equal(street.phase53.status,"not-applicable");
assert.equal(street.phase54.active,true);
assert.ok(words(street.prompt)<=250);

const engineGate=fs.readFileSync(new URL("../js/canonical/engine-gate.js",import.meta.url),"utf8");
assert.match(engineGate,/from\s+["']\.\/canonical-v3-phase53\.js["']/u,"live gate keeps the Phase 53 compatibility wrapper, which now delegates to Phase 54");
assert.match(engineGate,/canonical-v3-phase52-1\.js/iu,"historical Phase 52.1 contract must remain importable");

console.log("PHASE53_COMPATIBILITY_MODE=phase52.1");
console.log(`PHASE53_SIDE_WORDS=${words(buildCanonicalV3UserOutput(base({carExteriorPose:"door-lean"})).prompt)}`);
console.log("PHASE53_PROMPT_MUTATION=false_without_phase54_extra_controls");
console.log("PHASE53_DETERMINISM=10/10");
console.log("Phase 53 vehicle rewrite rollback: PASS");

await import("./canonical-v3-section-integrity-phase54.mjs");
await import("./canonical-v3-car-interior-phase54.mjs");
