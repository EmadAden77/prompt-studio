import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { NIGHT_CATEGORIES, NIGHT_TEMPLATES } from "../js/data/nightTemplatesData.js";
import { NIGHT_REALISM_LOCK } from "../js/engines/realismLocks.js";
import { LIGHTING_OPTIONS } from "../js/data/lightingData.js";
import { PromptEngine } from "../js/engines/promptEngine.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

assert.equal(NIGHT_CATEGORIES.length, 5, "five night categories");
assert.equal(NIGHT_TEMPLATES.length, 20, "twenty supplied night templates");
assert.deepEqual(NIGHT_CATEGORIES.map((x) => x.id), ["dark", "spill", "lamp", "semi", "glow"]);
assert.ok(NIGHT_TEMPLATES.every((t) => t.pose && t.light && t.anti && t.mood), "night template fields complete");
assert.match(NIGHT_REALISM_LOCK, /Darkness is NEVER clean/u);
assert.match(NIGHT_REALISM_LOCK, /emissive micro-dot/u);
assert.match(NIGHT_REALISM_LOCK, /Bedding physics unchanged from day/u);

const identityEngine = { fixedData:{ person:{ description:"test subject" } }, buildPersonText:()=>"IDENTITY", buildLockText:()=>"LOCK" };
const roomLockEngine = { buildAuthorityText:()=>"ROOM", buildLockText:()=>"ROOM LOCK" };
const poseEngine = { engineer:()=>({ posePhysics:"POSE & PHYSICS" }) };
const engine = new PromptEngine({ identityEngine, roomLockEngine, poseEngine, cameraEngine:{}, lightingEngine:{} });
const darkTemplate = NIGHT_TEMPLATES.find((t) => t.id === "dk_lb_top");
const darkLighting = LIGHTING_OPTIONS.find((x) => x.id === "phone_dark_closeup");
const prompt = engine.generateV2({
  pose:{ id:darkTemplate.pose, name_en:"lying on back" },
  expression:{ id:"neutral", muscle:"neutral muscles" },
  hair:{ name_en:"same hair" },
  clothing:{ pieces:"cotton pajamas", fabric:{} },
  roomMode:"GENERATE", aspect:"9:16", scene:{ name_en:"bedroom" },
  lighting:darkLighting,
  nightTemplate:darkTemplate
});
assert.match(prompt, /NIGHT BEDROOM TEMPLATE: Top-down, pitch dark/u);
assert.match(prompt, /NIGHT REALISM LOCK/u);
assert.match(prompt, /STRICT "PHONE SCREEN ONLY"/u);
assert.match(prompt, /BEDDING PHYSICS/u);
assert.match(prompt, /Camera Emulator/u);
assert.match(prompt, /SINGLE PHONE PIPELINE/u);
assert.match(prompt, /IMPERFECTION MANIFEST/u);
assert.doesNotMatch(prompt, /عزل تام/u, "night mood stays UI-only");
assert.ok(prompt.indexOf("POSE & PHYSICS") < prompt.indexOf("NIGHT BEDROOM TEMPLATE"));
assert.ok(prompt.indexOf("NIGHT BEDROOM TEMPLATE") < prompt.indexOf("NIGHT REALISM LOCK"));

const runtime = readFileSync(resolve(root, "js/bedTemplatesRuntime.js"), "utf8");
assert.match(runtime, /data-template-mode="day"/u);
assert.match(runtime, /data-template-mode="night"/u);
assert.match(runtime, /NIGHT_LIGHTING_BY_TEMPLATE/u);
assert.match(runtime, /phone_dark_closeup/u);
assert.match(runtime, /hallway_spill/u);
assert.match(runtime, /tv_glow_night/u);
assert.match(runtime, /selectedNightTemplateId/u);

const css = readFileSync(resolve(root, "css/bedTemplates.css"), "utf8");
assert.match(css, /\.bed-template-mode/u);

console.log("✓ v2.4-night bedroom template system passed");
