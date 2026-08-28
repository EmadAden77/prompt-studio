import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LIGHTING_OPTIONS } from "../js/data/lightingData.js";
import { PromptEngine } from "../js/engines/promptEngine.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const ids = [
  "phone_dark_closeup", "tv_glow_night", "moonlight_window", "ac_led_micro",
  "hallway_spill", "bathroom_spill", "streetlight_curtain",
  "sunbeam_dust", "blinds_stripes", "blue_hour_dusk", "fajr_pre_dawn", "lamp_rim_phone"
];
for (const id of ids) assert.ok(LIGHTING_OPTIONS.some((x) => x.id === id), `missing v2.3 light: ${id}`);
assert.equal(ids.length, 12);
assert.deepEqual([...new Set(LIGHTING_OPTIONS.filter((x) => ids.includes(x.id)).map((x) => x.category))], ["isolation", "spill", "drama", "mixed"]);

const micro = LIGHTING_OPTIONS.find((x) => x.id === "ac_led_micro");
assert.match(micro.physics, /emissive dots that cast NO light/u);
const dark = LIGHTING_OPTIONS.find((x) => x.id === "phone_dark_closeup");
assert.equal(dark.disable_visible_lamps, true);
assert.equal(dark.category, "isolation");

const identityEngine = { fixedData:{ person:{ description:"test subject" } }, buildPersonText:()=>"IDENTITY", buildLockText:()=>"LOCK" };
const roomLockEngine = { buildAuthorityText:()=>"ROOM", buildLockText:()=>"ROOM LOCK" };
const poseEngine = { engineer:()=>({ posePhysics:"POSE & PHYSICS" }) };
const engine = new PromptEngine({ identityEngine, roomLockEngine, poseEngine, cameraEngine:{}, lightingEngine:{} });
const base = {
  pose:{ id:"lying_back", name_en:"lying on back" }, expression:{ muscle:"neutral muscles" }, hair:{ name_en:"same hair" },
  clothing:{ pieces:"cotton pajamas", fabric:{} }, roomMode:"GENERATE", aspect:"9:16", scene:{ name_en:"bedroom" }
};
const darkPrompt = engine.generateV2({ ...base, lighting:dark });
assert.match(darkPrompt, /LIGHTING PHYSICS LOCK/u);
assert.match(darkPrompt, /LIGHTING REALISM \(anti-AI\)/u);
assert.match(darkPrompt, /LOW-LIGHT SENSOR BEHAVIOR/u);
assert.match(darkPrompt, /chroma noise/u);
assert.match(darkPrompt, /STRICT "PHONE SCREEN ONLY"/u);
assert.match(darkPrompt, /UNLIT decorative prop emitting ZERO light/u);

const microPrompt = engine.generateV2({ ...base, lighting:micro });
assert.match(microPrompt, /emissive dots that cast NO light/u);
assert.doesNotMatch(microPrompt, /Mood:/u);
assert.doesNotMatch(microPrompt, /واقعية ليلية خام/u);

const runtime = readFileSync(resolve(root, "js/lightingV23Runtime.js"), "utf8");
assert.match(runtime, /عزل ليلي 🌑/u);
assert.match(runtime, /تسرب ضوء 🚪/u);
assert.match(runtime, /نهاري درامي ☀️/u);
assert.match(runtime, /mood_ar/u);
const index = readFileSync(resolve(root, "index.html"), "utf8");
assert.match(index, /js\/lightingV23Runtime\.js/u);
const locks = readFileSync(resolve(root, "js/engines/realismLocks.js"), "utf8");
assert.ok(locks.length > 0, "realismLocks remains present and untouched by this test contract");

console.log("✓ v2.3-light physical lighting expansion passed");
