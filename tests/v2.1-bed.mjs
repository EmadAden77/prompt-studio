import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BED_CATEGORIES, BED_TEMPLATES, getBedTemplatesByCat } from "../js/data/bedTemplatesData.js";
import { PromptEngine } from "../js/engines/promptEngine.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

assert.equal(BED_CATEGORIES.length, 7, "v2.1-bed must expose seven bedroom template categories");
assert.equal(BED_TEMPLATES.length, 18, "v2.1-bed must preserve the supplied 18 templates");
for (const category of BED_CATEGORIES) assert.ok(getBedTemplatesByCat(category.id).length > 0, `Category must have templates: ${category.id}`);
for (const template of BED_TEMPLATES) {
  for (const key of ["id","cat","ar","en","angle","dist","frame","gaze","mood","anatomy","light","anti"]) assert.ok(template[key], `Template field ${key} is required: ${template.id}`);
}

const identityEngine = { fixedData:{ person:{ description:"test subject" } }, buildPersonText:()=>"PERSON", buildLockText:()=>"IDENTITY" };
const roomLockEngine = { buildAuthorityText:()=>"ROOM AUTHORITY", buildLockText:()=>"ROOM LOCK DATA" };
const poseEngine = { engineer:()=>({ posePhysics:"POSE & PHYSICS: test pose" }) };
const engine = new PromptEngine({ identityEngine, roomLockEngine, poseEngine, cameraEngine:{}, lightingEngine:{} });
const template = BED_TEMPLATES.find((t) => t.id === "lb_topdown");
const cfg = {
  pose:{ id:"lying_back", name_en:"Lying back" },
  scene:{ name_en:"Bedroom" },
  expression:{ id:"neutral", muscle:"neutral muscle state" },
  hair:{ name_en:"same" },
  clothing:{ pieces:"cotton pajamas", fabric:{} },
  lighting:{ id:"lamp_and_phone", name_en:"lamp and phone" },
  roomMode:"GENERATE",
  autoEngineering:{},
  bedTemplate:template
};
const prompt = engine.generateV2(cfg);
const poseIndex = prompt.indexOf("POSE & PHYSICS");
const templateIndex = prompt.indexOf("BEDROOM TEMPLATE: Top-down classic");
const beddingIndex = prompt.indexOf("BEDDING PHYSICS");
assert.ok(poseIndex >= 0 && templateIndex > poseIndex && beddingIndex > templateIndex, "BEDROOM TEMPLATE must be injected after pose physics and before family realism locks");
assert.match(prompt, /camera top-down 75–85°; 60–80cm; framing face 40%, bed\/room 60%; gaze into lens/u);
assert.match(prompt, /ANTI-AI: flat untouched pillow = INVALID/u);

const index = readFileSync(resolve(root, "index.html"), "utf8");
assert.match(index, /id="bedCategoryChips"/u);
assert.match(index, /id="bedTemplateGrid"/u);
assert.match(index, /js\/data\/bedTemplatesData\.js/u);
assert.match(index, /js\/bedTemplatesRuntime\.js/u);
assert.ok(index.indexOf("js/data/bedTemplatesData.js") < index.indexOf("js/engines/realismLocks.js"), "Bedroom template data must load before engines");

const runtime = readFileSync(resolve(root, "js/bedTemplatesRuntime.js"), "utf8");
assert.match(runtime, /CATEGORY_POSE/u);
assert.match(runtime, /TEMPLATE_POSE/u);
assert.match(runtime, /selectedBedTemplateId/u);
assert.match(runtime, /bed-template-time/u);
assert.match(runtime, /ليلي 🌙|نهاري ☀️|محايد/u);

const car = readFileSync(resolve(root, "car.html"), "utf8");
assert.doesNotMatch(car, /bedTemplatesData|bedTemplatesRuntime/u, "v2.1-bed must not touch car.html wiring");

console.log("✓ v2.1-bed bedroom template contract passed");
