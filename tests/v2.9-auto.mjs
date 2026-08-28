import assert from "node:assert/strict";
import fs from "node:fs";
import { autoPose, autoHair, autoExpression, isNight } from "../js/engines/autoEngine.js";

const index = fs.readFileSync("index.html", "utf8");
const runtime = fs.readFileSync("js/autoRuntime.js", "utf8");
const autoSource = fs.readFileSync("js/engines/autoEngine.js", "utf8");

assert.match(index, /<h2>3 اختيارات يدوية<\/h2>/);
assert.match(index, /1\. الملابس/);
assert.match(index, /2\. الإضاءة/);
assert.match(index, /3\. المرافقون/);
assert.match(index, /id="autoPose"/);
assert.match(index, /id="autoHair"/);
assert.match(index, /id="autoExpression"/);
assert.match(index, /data-auto-r="pose"/);
assert.match(index, /data-auto-r="hair"/);
assert.match(index, /data-auto-r="expr"/);
assert.match(index, /js\/engines\/autoEngine\.js/);
assert.ok(index.indexOf("js/engines/autoEngine.js") < index.indexOf("js/app.js"), "autoEngine must load before app.js");
assert.match(index, /auto-compat-hidden/);
assert.match(runtime, /autoPoseOffset/);
assert.match(runtime, /autoHairOffset/);
assert.match(runtime, /autoExpressionOffset/);
assert.match(runtime, /nearestSupportedPose/);
assert.match(runtime, /تم تصحيح الوضعية تلقائيًا لتوافق المرجع/);
assert.match(runtime, /this\.state\.poseId = decision\.poseId/);
assert.match(runtime, /this\.state\.hairId = decision\.hairId/);
assert.match(runtime, /this\.state\.expressionId = decision\.expressionId/);
assert.match(autoSource, /n >= 3/);
assert.match(autoSource, /startsWith\("lying"\)/);

const sofaScene = { visible_features:["sofa","floor"] };
const bedScene = { visible_features:["bed","mattress"] };
const none = { members:[] };
const family = { members:["W40","W42","C5"] };
assert.equal(autoPose({ selectedScene:sofaScene, companionSet:family, lighting:{ id:"lamp_only" } }), "sitting_sofa");
assert.equal(autoHair("lying_back"), "morning_messy");
assert.equal(autoHair("standing_center"), "neat");
assert.equal(autoExpression({ companionSet:none, lighting:{ id:"phone_dark_closeup" } }), "relaxed");
assert.equal(autoExpression({ companionSet:family, lighting:{ id:"phone_dark_closeup" } }), "smile");
assert.equal(isNight({ id:"moonlight_window" }), true);
assert.ok(["lying_back","lying_right_side","semi_reclining"].includes(autoPose({ selectedScene:bedScene, companionSet:none, lighting:{ id:"phone_dark_closeup" } })));

console.log("✓ v2.9-auto deterministic three-choice system passed");
