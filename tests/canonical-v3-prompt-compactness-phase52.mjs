import assert from "node:assert/strict";
import fs from "node:fs";
import { buildCanonicalV3UserOutput as build51 } from "../js/canonical/canonical-v3-phase51.js";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-phase52.js";

const words=v=>String(v||"").trim().split(/\s+/u).filter(Boolean).length;
const base=(extra={})=>({hasReference:true,studioSection:"carExterior",scene:"carExterior",time:"night",clothing:"formal-shirt-gray-trouser-black",expression:"neutral",carExteriorLocation:"parking",carExteriorPose:"door-lean",selfieAngle:"auto",...extra});

const raw=base();
const p51=build51(raw);
const out=buildCanonicalV3UserOutput(raw);
assert.ok(words(out.prompt)<=words(p51.prompt),"Phase 52 must never lengthen the prompt");
assert.ok(words(out.prompt)<=280);
assert.equal(out.phase52.determinism,"10/10");
assert.equal(out.phase52.semanticCompaction,true);
assert.equal(out.phase52.visualPriorityOrdering,true);
assert.equal(out.phase52.protectedSelections,true);
assert.ok(out.phase52.finalWords<=out.phase52.originalWords);
assert.ok(out.phase51.visualQualityContract,"Phase 51 QA contract must survive Phase 52");
for(const entry of Object.values(out.phase50.selectionManifest)) assert.ok(out.prompt.includes(entry.resolved||entry.requested),`protected selection lost: ${entry.resolved||entry.requested}`);
assert.match(out.prompt,/light gray formal shirt with black suit trousers/iu);
assert.match(out.prompt,/Neutral closed-mouth expression/iu);
assert.match(out.prompt,/marked outdoor parking lot/iu);
assert.match(out.prompt,/leans one side of his upper body against the closed driver door/iu);
assert.match(out.prompt,/unmistakably at night/iu);
assert.match(out.prompt,/dominant visible source/iu);
assert.match(out.prompt,/Raised phone ISO/iu);
assert.match(out.prompt,/Exposure keeps/iu);
assert.match(out.prompt,/2017 Range Rover Sport Autobiography Dynamic L494/iu);

const identityIndex=out.prompt.indexOf("Identity strictly preserved");
const clothingIndex=out.prompt.indexOf("Subject wearing");
const physicsIndex=out.prompt.indexOf("Night physics:");
assert.ok(identityIndex>=0&&clothingIndex>identityIndex,"identity must precede selected clothing in visual priority order");
assert.ok(physicsIndex>clothingIndex,"night physics must follow user selection block");

const streetRaw={hasReference:true,studioSection:"street",scene:"street",time:"night",clothing:"thobe-redshemagh-iqal",expression:"neutral",selfiePose:"standing-relaxed",lighting:"street-night"};
const street=buildCanonicalV3UserOutput(streetRaw);
assert.ok(words(street.prompt)<=250);
assert.match(street.prompt,/crisp white thobe with a red-and-white checkered shemagh and black iqal/iu);
assert.match(street.prompt,/black doubled-cord iqal|black iqal/iu);
assert.match(street.prompt,/Neutral closed-mouth expression/iu);

const dayRaw={hasReference:true,studioSection:"street",scene:"street",time:"day",clothing:"formal-shirt-white-beige",expression:"focused",selfiePose:"standing-relaxed",lighting:"daylight"};
const day=buildCanonicalV3UserOutput(dayRaw);
assert.ok(words(day.prompt)<=250);
assert.match(day.prompt,/white formal shirt with beige trousers and a brown belt/iu);
assert.match(day.prompt,/Focused neutral closed-mouth expression/iu);
assert.doesNotMatch(day.prompt,/Night physics:|Raised phone ISO|turns night into day/iu);

const ten=Array.from({length:10},()=>buildCanonicalV3UserOutput(raw).prompt);
assert.ok(ten.every(v=>v===ten[0]),"Phase 52 determinism must be 10/10");

const engineGate=fs.readFileSync(new URL("../js/canonical/engine-gate.js",import.meta.url),"utf8");
assert.match(engineGate,/from\s+["']\.\/canonical-v3-phase52-1\.js["']/u,"live engine gate must use Phase 52.1 while Phase 52 remains the compactness behavior contract");

console.log(`PHASE52_BEFORE_WORDS=${words(p51.prompt)}`);
console.log(`PHASE52_AFTER_WORDS=${words(out.prompt)}`);
console.log(`PHASE52_REMOVED_SENTENCES=${out.phase52.removedSentenceCount}`);
console.log(`PHASE52_SAMPLE=${out.prompt}`);
console.log("PHASE52_DETERMINISM=10/10");
console.log("Phase 52 prompt compactness and visual priority: PASS under Phase 52.1 live gate");
