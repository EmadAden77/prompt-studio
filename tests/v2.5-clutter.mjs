import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CLUTTER_LEVELS, CLUTTER, getClutterByLevel } from "../js/data/clutterData.js";
import { CLUTTER_REALISM_LOCK } from "../js/engines/realismLocks.js";
import { PromptEngine } from "../js/engines/promptEngine.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

assert.equal(CLUTTER.length, 14);
assert.equal(CLUTTER.find((x) => x.id === "just_woke")?.level, "light");
assert.deepEqual(Object.keys(CLUTTER_LEVELS), ["tidy", "light", "medium", "heavy"]);
assert.ok(getClutterByLevel("medium").length >= 6);
assert.match(CLUTTER_REALISM_LOCK, /fixed furniture NEVER moves/u);
assert.match(CLUTTER_REALISM_LOCK, /NOTHING floats or hovers/u);
assert.match(CLUTTER_REALISM_LOCK, /NO readable brand logos/u);
assert.match(CLUTTER_REALISM_LOCK, /support surfaces impossibly/u);

const identityEngine = { fixedData:{ person:{ description:"test subject" } }, buildPersonText:()=>"IDENTITY", buildLockText:()=>"LOCK" };
const roomLockEngine = { buildAuthorityText:()=>"ROOM AUTHORITY", buildLockText:()=>"ROOM LOCK BODY" };
const poseEngine = { engineer:()=>({ posePhysics:"POSE & PHYSICS" }) };
const engine = new PromptEngine({ identityEngine, roomLockEngine, poseEngine, cameraEngine:{}, lightingEngine:{} });
const clutter = CLUTTER.find((x) => x.id === "just_woke");
const prompt = engine.generateV2({
  pose:{ id:"lying_back", name_en:"lying on back" },
  expression:{ id:"neutral", muscle:"neutral muscles" },
  hair:{ name_en:"same hair" },
  clothing:{ pieces:"cotton pajamas", fabric:{} },
  lighting:{ id:"lamp_and_phone", name_en:"lamp and phone" },
  clutter,
  roomMode:"GENERATE",
  aspect:"9:16",
  scene:{ name_en:"bedroom" }
});
const roomPos = prompt.indexOf("ROOM LOCK — IMAGE B ONLY");
const clutterPos = prompt.indexOf("CLUTTER (user-selected, movable props only)");
const posePos = prompt.indexOf("POSE & PHYSICS");
assert.ok(roomPos >= 0 && clutterPos > roomPos && posePos > clutterPos, "clutter must be injected after room lock and before pose physics");
assert.match(prompt, /CLUTTER REALISM LOCK/u);
assert.match(prompt, /fixed furniture NEVER moves/u);

const index = readFileSync(resolve(root, "index.html"), "utf8");
assert.match(index, /6\. الفوضى/u);
assert.match(index, /id="clutterSelect"/u);
assert.match(index, /js\/data\/clutterData\.js/u);
assert.match(index, /js\/clutterRuntime\.js/u);

const runtime = readFileSync(resolve(root, "js/clutterRuntime.js"), "utf8");
assert.match(runtime, /DEFAULT_CLUTTER_ID = "just_woke"/u);
assert.match(runtime, /الفوضى تلامس سطح الارتكاز/u);
assert.match(runtime, /اقتراح فقط/u);
assert.match(runtime, /selectBedTemplate/u);
assert.match(runtime, /selectNightTemplate/u);
assert.match(runtime, /اختيارك الحالي لم يتغير/u);

console.log("✓ v2.5-clutter independent movable-prop realism passed");
