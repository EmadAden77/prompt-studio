import assert from "node:assert/strict";
import fs from "node:fs";
import { POSES } from "../js/data/posesData.js";
import { autoPose, altPose, autoHair, autoExpression, poseAllowed, coherence, isNight } from "../js/engines/autoEngine.js";

const index = fs.readFileSync("index.html", "utf8");
const runtime = fs.readFileSync("js/autoRuntime.js", "utf8");
const autoSource = fs.readFileSync("js/engines/autoEngine.js", "utf8");

assert.match(index, /3 اختيارات فقط — والباقي هندسة تلقائية واقعية/u);
assert.match(index, /1\. الملابس/u);
assert.match(index, /2\. الإضاءة/u);
assert.match(index, /3\. المرافقون/u);
assert.doesNotMatch(index, /<label for="poseSelect">/u);
assert.doesNotMatch(index, /<label for="hairSelect">/u);
assert.doesNotMatch(index, /<label for="expressionSelect">/u);
assert.match(index, /id="autoPose"/u);
assert.match(index, /id="autoHair"/u);
assert.match(index, /id="autoExpression"/u);
assert.ok(index.indexOf("js/engines/autoEngine.js") < index.indexOf("js/app.js"));

assert.match(runtime, /App\.prototype\.runAuto/u);
assert.match(runtime, /this\.runAuto\(\{ announceCorrection:true \}\)/u);
assert.match(runtime, /data-auto-r/u);
assert.match(runtime, /autoPoseOffset/u);
assert.match(runtime, /autoHairOffset/u);
assert.match(runtime, /autoExpressionOffset/u);
assert.match(runtime, /بوابة المرجع الصارمة/u);

assert.match(autoSource, /export function poseAllowed/u);
assert.match(autoSource, /export function coherence/u);
assert.match(autoSource, /export function rankedPoses/u);
assert.match(autoSource, /export function altPose/u);
assert.match(autoSource, /lamp_only/u);
assert.match(autoSource, /lamp_and_phone/u);

const sofaScene = {
  visible_features:["sofa","sofa_cushion","floor"],
  supported_poses:["sitting_sofa","standing_sofa"]
};
const bedScene = {
  visible_features:["bed","mattress","pillow","floor"],
  supported_poses:["lying_back","lying_right_side","semi_reclining","sitting_bed_edge"]
};
const none = { id:"none", members:[] };
const family = { id:"family", members:["W40","W42","C5"] };
const child = { id:"child", members:["C2"] };

const sittingSofa = POSES.find((p) => p.id === "sitting_sofa");
const lyingBack = POSES.find((p) => p.id === "lying_back");
assert.equal(poseAllowed(sittingSofa, sofaScene), true);
assert.equal(poseAllowed(lyingBack, sofaScene), false);
assert.equal(isNight({ id:"lamp_only" }), true);
assert.ok(coherence(sittingSofa, { companionSet:family, lighting:{ id:"daylight_window" } }) > coherence(lyingBack, { companionSet:family, lighting:{ id:"daylight_window" } }));

const nightPose = autoPose({ selectedScene:bedScene, companionSet:none, lighting:{ id:"phone_dark_closeup" } }, POSES);
assert.ok(["lying_back","lying_right_side","semi_reclining"].includes(nightPose.id));
const familyPose = autoPose({ selectedScene:sofaScene, companionSet:family, lighting:{ id:"daylight_window" } }, POSES);
assert.equal(familyPose.id, "sitting_sofa");
const childPose = autoPose({ selectedScene:bedScene, companionSet:child, lighting:{ id:"daylight_window" } }, POSES);
assert.equal(childPose.id, "sitting_bed_edge");
const alt = altPose({ selectedScene:bedScene, companionSet:none, lighting:{ id:"phone_dark_closeup" } }, 1, POSES);
assert.ok(poseAllowed(alt, bedScene));
assert.equal(autoHair("lying_back"), "morning_messy");
assert.equal(autoHair("standing_center"), "neat");
assert.equal(autoExpression({ companionSet:none, lighting:{ id:"moonlight_window" } }), "relaxed");
assert.equal(autoExpression({ companionSet:family, lighting:{ id:"moonlight_window" } }), "smile");

console.log("✓ v3.0-auto strict-gate physical coherence system passed");
