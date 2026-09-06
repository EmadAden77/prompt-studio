import assert from "node:assert/strict";
import { buildCanonicalV3UserOutput, describeNightPhysics } from "../js/canonical/canonical-v3-phase49.js";
import { SELFIE_ARM_LOCK, IDENTITY_STRICT_LOCK } from "../js/canonical/openai-image-adapter-phase36.js";

const wc=v=>String(v||"").trim().split(/\s+/u).filter(Boolean).length;
const base=extra=>({hasReference:true,expression:"neutral",clothing:"thobe-redshemagh-iqal",selfieAngle:"auto",selfiePose:"auto",...extra});
const nightCases=[
  base({studioSection:"street",scene:"street",time:"night",lighting:"sodium"}),
  base({studioSection:"solo",scene:"street",time:"night",lighting:"cool-led"}),
  base({studioSection:"carExterior",scene:"carExterior",time:"night",carExteriorLocation:"villa",carExteriorPose:"door-lean"}),
  base({studioSection:"gym",scene:"gym",time:"night"}),
  base({studioSection:"bedroom",scene:"bedroom",time:"night"}),
  base({studioSection:"car",scene:"rangeRover",time:"night"})
];
for(const raw of nightCases){
  const out=buildCanonicalV3UserOutput(raw);
  assert.ok(out.phase49.nightPhysics,`${raw.studioSection}: night physics missing`);
  assert.match(out.prompt,/dominant visible source is the (?:warm sodium streetlamp|cool overhead LED fixtures|villa porch light|bedside practical lamp|car interior light|nearby practical streetlamp|phone flash|neon shop sign|shopfront lighting)/iu,`${raw.studioSection}: named source`);
  assert.match(out.prompt,/(?:yellow-orange cast|neutral-cool cast|localized colored reflection|source-matched local color cast|neutral direct flash cast)/iu,`${raw.studioSection}: color cast`);
  assert.match(out.prompt,/raised ISO with subtle grain, shadow noise, and mild loss of fine detail/iu,`${raw.studioSection}: ISO grain`);
  assert.match(out.prompt,/(?:Exposure favors|Flash mode lights)/iu,`${raw.studioSection}: exposure balance`);
  assert.match(out.prompt,/darkness remains visibly nocturnal and never turns the scene into daylight/iu,`${raw.studioSection}: night guard`);
  assert.doesNotMatch(out.prompt,/perfectly sharp[^.]*studio-lit face|studio-lit face[^.]*perfectly sharp/iu);
  assert.ok(out.prompt.includes(IDENTITY_STRICT_LOCK),`${raw.studioSection}: identity protected`);
  if(raw.studioSection!=="car") assert.ok(out.prompt.includes(SELFIE_ARM_LOCK),`${raw.studioSection}: selfie protected`);
  assert.match(out.prompt,/red-and-white fine checkered shemagh/iu,`${raw.studioSection}: shemagh protected`);
  assert.ok(wc(out.prompt)<=(raw.studioSection==="carExterior"?280:250),`${raw.studioSection}: budget ${wc(out.prompt)}`);
}
const sodium=buildCanonicalV3UserOutput(base({studioSection:"street",scene:"street",time:"night",lighting:"sodium",selfiePose:"walking"}));
assert.match(sodium.prompt,/warm sodium streetlamp/iu); assert.match(sodium.prompt,/warm yellow-orange cast/iu); assert.match(sodium.prompt,/slight blur to the moving hand or loose hair strands/iu);
const flash=buildCanonicalV3UserOutput(base({studioSection:"carExterior",scene:"carExterior",time:"night",lighting:"flash",carExteriorLocation:"parking",carExteriorPose:"door-lean"}));
assert.equal(flash.phase49.flash,true); assert.match(flash.prompt,/dominant visible source is the phone flash/iu); assert.match(flash.prompt,/lights the close face directly/iu); assert.match(flash.prompt,/background distinctly darker/iu); assert.match(flash.prompt,/harder short shadows/iu); assert.match(flash.prompt,/slight realistic sheen on skin and eyes/iu); assert.ok(wc(flash.prompt)<=280);
for(const section of ["solo","street","carExterior","gym","bedroom"]){ const raw=base({studioSection:section,scene:section==="carExterior"?"carExterior":section,time:"day",carExteriorLocation:"parking"}); const out=buildCanonicalV3UserOutput(raw); assert.equal(describeNightPhysics(out.canonical,raw,section),""); assert.doesNotMatch(out.prompt,/Night physics:|raised ISO|darkness remains visibly nocturnal|Flash mode lights/iu,`${section}: day leakage`); }
const ten=Array.from({length:10},()=>buildCanonicalV3UserOutput(base({studioSection:"street",scene:"street",time:"night",lighting:"sodium",selfiePose:"walking"})).prompt); assert.ok(ten.every(v=>v===ten[0]),"Phase 49 determinism 10/10");
console.log(`PHASE49_STREET_SAMPLE=${sodium.prompt}`); console.log(`PHASE49_FLASH_SAMPLE=${flash.prompt}`); console.log("PHASE49_DETERMINISM=10/10"); console.log("Phase 49 night physics engine: PASS");
