import assert from "node:assert/strict";
import fs from "node:fs";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-phase50.js";
import { resolveClothingText } from "../js/clothing-authority.js";

const words=v=>String(v||"").trim().split(/\s+/u).filter(Boolean).length;
const base=(extra={})=>({hasReference:true,studioSection:"carExterior",scene:"carExterior",time:"night",clothing:"formal-shirt-gray-trouser-black",expression:"neutral",carExteriorLocation:"parking",carExteriorPose:"door-lean",selfieAngle:"auto",...extra});

const screenshotCase=base();
const out=buildCanonicalV3UserOutput(screenshotCase);
const clothing=resolveClothingText(screenshotCase.clothing,screenshotCase);
assert.ok(out.prompt.includes(`Subject wearing ${clothing}.`),"selected formal clothing was lost after final budget");
assert.match(out.prompt,/light gray formal shirt with black suit trousers/iu,"formal shirt/trousers semantics missing");
assert.doesNotMatch(out.prompt,/gray T-shirt|grey T-shirt|dark T-shirt/iu,"prompt regressed to generic T-shirt");
assert.match(out.prompt,/Neutral closed-mouth expression\./u,"neutral expression must survive final budget");
assert.match(out.prompt,/marked outdoor parking lot/iu,"selected carExterior location must survive final budget");
assert.match(out.prompt,/leans one side of his upper body against the closed driver door/iu,"selected pose must survive final budget");
assert.match(out.prompt,/unmistakably at night/iu,"selected time must survive final budget");
assert.match(out.prompt,/dominant visible source/iu,"night lighting physics must survive final budget");
assert.ok(words(out.prompt)<=280,`carExterior budget exceeded: ${words(out.prompt)}`);
for(const key of ["clothing","expression","pose","location","time"]) assert.equal(out.phase50.selectionManifest[key]?.rendered,true,`${key}: manifest must prove final rendering`);
assert.equal(out.phase50.determinism,"10/10");
const ten=Array.from({length:10},()=>buildCanonicalV3UserOutput(screenshotCase).prompt); assert.ok(ten.every(v=>v===ten[0]),"Phase 50 determinism must be 10/10");

const custom=base({clothing:"custom",customClothing:"cream linen overshirt over a plain white T-shirt with tailored beige trousers",expression:"focused",carExteriorLocation:"villa",carExteriorPose:"front-fender"});
const customOut=buildCanonicalV3UserOutput(custom);
assert.match(customOut.prompt,/cream linen overshirt over a plain white T-shirt with tailored beige trousers/iu,"custom clothing verbatim must survive");
assert.match(customOut.prompt,/Focused neutral closed-mouth expression\./u);
assert.match(customOut.prompt,/Saudi residential villa driveway/iu);
assert.match(customOut.prompt,/beside the front fender/iu);
assert.ok(words(customOut.prompt)<=280);

const street=buildCanonicalV3UserOutput({hasReference:true,studioSection:"street",scene:"street",time:"night",clothing:"thobe-redshemagh-iqal",expression:"neutral",selfiePose:"standing-relaxed",lighting:"street-night"});
assert.match(street.prompt,/Subject wearing crisp white thobe with a red-and-white checkered shemagh and black iqal/iu);
assert.match(street.prompt,/red-and-white fine checkered shemagh|red-and-white checkered shemagh/iu);
assert.match(street.prompt,/black doubled-cord iqal|black iqal/iu);
assert.match(street.prompt,/Neutral closed-mouth expression\./u);
assert.ok(words(street.prompt)<=250,`street budget exceeded: ${words(street.prompt)}`);

const day=buildCanonicalV3UserOutput({hasReference:true,studioSection:"street",scene:"street",time:"day",clothing:"formal-shirt-white-beige",expression:"neutral",selfiePose:"standing-relaxed",lighting:"daylight"});
assert.match(day.prompt,/Subject wearing white formal shirt with beige trousers and a brown belt\./u);
assert.match(day.prompt,/The capture is in day conditions\./u);
assert.doesNotMatch(day.prompt,/Night physics:|Raised phone ISO|night remains visibly nocturnal|turns night into day/iu,"day prompt leaked night physics");
assert.ok(words(day.prompt)<=250);

const engineGate=fs.readFileSync(new URL("../js/canonical/engine-gate.js",import.meta.url),"utf8");
assert.match(engineGate,/from\s+["']\.\/canonical-v3-phase52\.js["']/u,"live engine gate must use Phase 52 while Phase 50 remains the selection-authority behavior contract");

console.log(`PHASE50_SCREENSHOT_WORDS=${words(out.prompt)}`);
console.log(`PHASE50_SCREENSHOT_SAMPLE=${out.prompt}`);
console.log("PHASE50_DETERMINISM=10/10");
console.log("Phase 50 user selection authority: PASS under Phase 52 live gate");
