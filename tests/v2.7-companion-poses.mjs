import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { COMPANION_SETS } from "../js/data/companionsData.js";
import { SPONTANEITY_LOCK, assignCompanionPoses, resolveCompanionPoses, buildCompanionPosesSection } from "../js/data/companionPosesData.js";
import { PromptEngine } from "../js/engines/promptEngine.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

assert.match(SPONTANEITY_LOCK, /AT LEAST ONE per render/u);
assert.match(SPONTANEITY_LOCK, /NEVER all eyes on lens/u);
assert.match(SPONTANEITY_LOCK, /TIMING FEEL/u);
assert.match(SPONTANEITY_LOCK, /Children move/u);

const family = COMPANION_SETS.find((set) => set.id === "family_full");
const none = COMPANION_SETS.find((set) => set.id === "none");
const a = assignCompanionPoses(family, 0);
const b = assignCompanionPoses(family, 0);
const c = assignCompanionPoses(family, 1);
assert.deepEqual(a, b, "same set + seed must remain deterministic");
assert.notDeepEqual(a, c, "shuffle seed must change spontaneous assignment");
assert.equal(buildCompanionPosesSection(none, 0, "lying_back", {}), "", "empty companion set must not inject spontaneity lock");

const narrow = resolveCompanionPoses(family, 0, "lying_right_side");
assert.ok(narrow.out.length === family.members.length);
assert.ok(narrow.replacements.every((r) => r.to?.id), "unsafe micro poses must receive a safe fallback");

const identityEngine = { fixedData:{ person:{ description:"test subject" } }, buildPersonText:()=>"IDENTITY", buildLockText:()=>"LOCK" };
const roomLockEngine = { buildAuthorityText:()=>"ROOM AUTHORITY", buildLockText:()=>"ROOM LOCK BODY" };
const poseEngine = { engineer:()=>({ posePhysics:"POSE & PHYSICS" }) };
const engine = new PromptEngine({ identityEngine, roomLockEngine, poseEngine, cameraEngine:{}, lightingEngine:{} });
const base = {
  pose:{ id:"lying_back", name_en:"lying on back" },
  expression:{ id:"neutral", muscle:"neutral muscles" },
  hair:{ name_en:"same hair" },
  clothing:{ name_en:"white thobe", pieces:"white thobe", fabric:{} },
  lighting:{ id:"lamp_and_phone", name_en:"lamp and phone" },
  roomMode:"GENERATE", aspect:"9:16", scene:{ name_en:"bedroom" }
};
const withFamily = engine.generateV2({ ...base, companionSet:family, companionSeedExtra:0 });
assert.match(withFamily, /COMPANIONS \(fixed distinct personas/u);
assert.match(withFamily, /COMPANION SPONTANEOUS POSES/u);
assert.match(withFamily, /SPONTANEITY LOCK/u);
assert.ok(withFamily.indexOf("COMPANION SPONTANEOUS POSES") > withFamily.indexOf("COMPANIONS (fixed distinct personas"));
const withoutFamily = engine.generateV2({ ...base, companionSet:none, companionSeedExtra:0 });
assert.doesNotMatch(withoutFamily, /SPONTANEITY LOCK/u);

const index = readFileSync(resolve(root, "index.html"), "utf8");
assert.match(index, /js\/data\/companionPosesData\.js/u);
assert.match(index, /id="companionShuffleBtn"/u);
assert.match(index, /عفوية مختلفة/u);
assert.match(index, /id="companionPoseSummary"/u);

const runtime = readFileSync(resolve(root, "js/companionsRuntime.js"), "utf8");
assert.match(runtime, /companionSeedExtra/u);
assert.match(runtime, /resolveCompanionPoses/u);
assert.match(runtime, /استبدال آمن/u);
assert.match(runtime, /companionShuffleBtn/u);

console.log("✓ v2.7 spontaneous companion pose system passed");
