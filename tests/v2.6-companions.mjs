import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { COMPANIONS, COMPANION_SETS, SET_ARRANGEMENT, buildCompanionsSection } from "../js/data/companionsData.js";
import { GROUP_SELFIE_REALISM_LOCK } from "../js/engines/realismLocks.js";
import { PromptEngine } from "../js/engines/promptEngine.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

assert.equal(Object.keys(COMPANIONS).length, 6);
assert.equal(COMPANION_SETS[0].id, "none");
assert.equal(COMPANION_SETS.find((x) => x.id === "family_full")?.members.length, 4);
assert.match(COMPANIONS.W40.face, /small mole near left chin/u);
assert.match(COMPANIONS.W42.face, /thin rectangular glasses/u);
assert.match(COMPANIONS.C7.face, /MISSING upper front tooth/u);
assert.match(COMPANIONS.C2.face, /large forehead/u);
assert.match(SET_ARRANGEMENT.family_full, /three depths with overlap/u);
assert.match(GROUP_SELFIE_REALISM_LOCK, /ONE phone, ONE arm-length capture/u);
assert.match(GROUP_SELFIE_REALISM_LOCK, /DISTINCT FACES/u);
assert.match(GROUP_SELFIE_REALISM_LOCK, /AGE ACCURACY/u);
assert.match(GROUP_SELFIE_REALISM_LOCK, /fully-clothed family framing/u);

const navyMain = { name_en:"navy satin pajama set", pieces:"navy satin pajama shirt with matching pants" };
const w42 = COMPANION_SETS.find((x) => x.id === "w42");
const collisionText = buildCompanionsSection(w42, navyMain, GROUP_SELFIE_REALISM_LOCK);
assert.match(collisionText, /ATTIRE olive shayla; olive abaya with olive trim/u);
assert.doesNotMatch(collisionText, /navy shayla/u);
assert.match(collisionText, /fully clothed/u);

const identityEngine = { fixedData:{ person:{ description:"test subject" } }, buildPersonText:()=>"IDENTITY", buildLockText:()=>"LOCK" };
const roomLockEngine = { buildAuthorityText:()=>"ROOM AUTHORITY", buildLockText:()=>"ROOM LOCK BODY" };
const poseEngine = { engineer:()=>({ posePhysics:"POSE & PHYSICS" }) };
const engine = new PromptEngine({ identityEngine, roomLockEngine, poseEngine, cameraEngine:{}, lightingEngine:{} });
const set = COMPANION_SETS.find((x) => x.id === "family_small");
const prompt = engine.generateV2({
  pose:{ id:"sitting_bed_edge", name_en:"sitting at bed edge" },
  expression:{ id:"neutral", muscle:"neutral muscles" },
  hair:{ name_en:"same hair" },
  clothing:{ name_en:"white thobe", pieces:"white thobe", fabric:{} },
  lighting:{ id:"lamp_and_phone", name_en:"lamp and phone" },
  companionSet:set,
  roomMode:"GENERATE",
  aspect:"9:16",
  scene:{ name_en:"bedroom" }
});
const clothingPos = prompt.indexOf("CLOTHING LOCK");
const companionsPos = prompt.indexOf("COMPANIONS (fixed distinct personas");
const lightingPos = prompt.indexOf("LIGHTING PHYSICS LOCK");
assert.ok(clothingPos >= 0 && companionsPos > clothingPos && lightingPos > companionsPos, "companions must be injected after clothing and before lighting");
assert.match(prompt, /NO resemblance to IMAGE A or each other/u);
assert.match(prompt, /GROUP SELFIE REALISM LOCK|COMPANION & GROUP SELFIE REALISM LOCK/u);
assert.match(prompt, /one main subject plus 3 selected companions/u);
assert.match(prompt, /same-face companions/u);

const noSetPrompt = engine.generateV2({
  pose:{ id:"sitting_bed_edge", name_en:"sitting at bed edge" },
  expression:{ id:"neutral", muscle:"neutral muscles" },
  hair:{ name_en:"same hair" },
  clothing:{ name_en:"white thobe", pieces:"white thobe", fabric:{} },
  lighting:{ id:"lamp_and_phone", name_en:"lamp and phone" },
  companionSet:COMPANION_SETS.find((x) => x.id === "none"),
  roomMode:"GENERATE",
  aspect:"9:16",
  scene:{ name_en:"bedroom" }
});
assert.doesNotMatch(noSetPrompt, /COMPANIONS \(fixed distinct personas/u);

const index = readFileSync(resolve(root, "index.html"), "utf8");
assert.match(index, /الاختيارات السبعة/u);
assert.match(index, /7\. المرافقون/u);
assert.match(index, /id="companionSelect"/u);
assert.match(index, /js\/data\/companionsData\.js/u);
assert.match(index, /js\/companionsRuntime\.js/u);

const runtime = readFileSync(resolve(root, "js/companionsRuntime.js"), "utf8");
assert.match(runtime, /DEFAULT_SET_ID = "none"/u);
assert.match(runtime, /نساء/u);
assert.match(runtime, /أطفال/u);
assert.match(runtime, /مجموعات/u);
assert.match(runtime, /count <= 4/u);
assert.match(runtime, /المجموعة أوسع من مدى الذراع/u);
assert.match(runtime, /خفف القص قليلًا/u);

console.log("✓ v2.6-companions group selfie realism passed");
