import assert from "node:assert/strict";
import fs from "node:fs";
import { buildCanonicalV3UserOutput as build50 } from "../js/canonical/canonical-v3-phase50.js";
import { buildCanonicalV3UserOutput, evaluateVisualQuality } from "../js/canonical/canonical-v3-phase51.js";

const words=v=>String(v||"").trim().split(/\s+/u).filter(Boolean).length;
const base=(extra={})=>({hasReference:true,studioSection:"carExterior",scene:"carExterior",time:"night",clothing:"formal-shirt-gray-trouser-black",expression:"neutral",carExteriorLocation:"parking",carExteriorPose:"door-lean",selfieAngle:"auto",...extra});

const raw=base();
const p50=build50(raw);
const out=buildCanonicalV3UserOutput(raw);
assert.equal(out.prompt,p50.prompt,"Phase 51 must not mutate the Phase 50 prompt");
assert.equal(out.phase51.promptMutation,false);
assert.equal(out.phase51.determinism,"10/10");
assert.ok(words(out.prompt)<=280);

const ids=new Set(out.phase51.visualQualityContract.criteria.map(c=>c.id));
for(const id of ["identity","selfie_geometry","body_scale","clothing","expression","pose","location","time","night_lighting","vehicle","background_context","anatomy"]) assert.ok(ids.has(id),`missing carExterior QA criterion: ${id}`);
const clothing=out.phase51.visualQualityContract.criteria.find(c=>c.id==="clothing");
assert.match(clothing.expected,/light gray formal shirt with black suit trousers/iu);
const expression=out.phase51.visualQualityContract.criteria.find(c=>c.id==="expression");
assert.match(expression.expected,/Neutral closed-mouth expression/iu);
assert.match(out.phase51.visualQualityContract.policy,/do not score or optimize for AI-detector evasion/iu);

const allPass=Object.fromEntries(out.phase51.visualQualityContract.criteria.map(c=>[c.id,true]));
const passed=evaluateVisualQuality(out.phase51.visualQualityContract,allPass);
assert.equal(passed.status,"pass");
assert.equal(passed.score,100);
assert.equal(passed.failures.length,0);

const badClothing={...allPass,clothing:false};
const failed=evaluateVisualQuality(out.phase51.visualQualityContract,badClothing);
assert.equal(failed.status,"fail");
assert.ok(failed.failures.some(f=>f.id==="clothing"));
assert.match(failed.failures.find(f=>f.id==="clothing").repairHint,/exact selected clothing/iu);

const pending=evaluateVisualQuality(out.phase51.visualQualityContract,{});
assert.equal(pending.status,"pending");
assert.equal(pending.score,null);

const gym=buildCanonicalV3UserOutput({hasReference:true,studioSection:"gym",scene:"gym",time:"night",clothing:"sport-tee-black-shorts-gray",expression:"focused",selfiePose:"seated-rest"});
assert.ok(gym.phase51.visualQualityContract.criteria.some(c=>c.id==="background_people"),"gym must verify independent background people");
assert.ok(!gym.phase51.visualQualityContract.criteria.some(c=>c.id==="privacy"));
assert.ok(words(gym.prompt)<=250);

const bedroom=buildCanonicalV3UserOutput({hasReference:true,studioSection:"bedroom",scene:"bedroom",time:"night",clothing:"home-pajama-blue-gray",expression:"neutral",selfiePose:"seated-bed"});
assert.ok(bedroom.phase51.visualQualityContract.criteria.some(c=>c.id==="privacy"),"bedroom must verify full privacy");
assert.ok(!bedroom.phase51.visualQualityContract.criteria.some(c=>c.id==="background_people"));
assert.ok(words(bedroom.prompt)<=250);

const day=buildCanonicalV3UserOutput({hasReference:true,studioSection:"street",scene:"street",time:"day",clothing:"casual-tee-black-jeans-blue",expression:"neutral",selfiePose:"standing-relaxed"});
assert.ok(!day.phase51.visualQualityContract.criteria.some(c=>c.id==="night_lighting"),"day QA contract leaked night-only criterion");
assert.ok(words(day.prompt)<=250);

const ten=Array.from({length:10},()=>JSON.stringify(buildCanonicalV3UserOutput(raw).phase51.visualQualityContract));
assert.ok(ten.every(v=>v===ten[0]),"Phase 51 contract determinism must be 10/10");

const engineGate=fs.readFileSync(new URL("../js/canonical/engine-gate.js",import.meta.url),"utf8");
assert.match(engineGate,/from\s+["']\.\/canonical-v3-phase52\.js["']/u,"live engine gate must use Phase 52 while Phase 51 remains the visual-QA behavior contract");

console.log(`PHASE51_CRITERIA=${out.phase51.visualQualityContract.criteria.length}`);
console.log(`PHASE51_PROMPT_WORDS=${words(out.prompt)}`);
console.log("PHASE51_DETERMINISM=10/10");
console.log("Phase 51 visual quality evaluation engine: PASS under Phase 52 live gate");
