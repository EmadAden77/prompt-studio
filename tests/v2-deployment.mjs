import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PromptEngine } from "../js/engines/promptEngine.js";
import { EXPRESSIONS } from "../js/data/expressionsData.js";
import { LIGHTING_OPTIONS } from "../js/data/lightingData.js";
import { POSES } from "../js/data/posesData.js";
import { HAIR_OPTIONS } from "../js/data/hairData.js";
import { CLOTHING_OPTIONS } from "../js/data/clothingData.js";
import { QUICK_FIXES } from "../js/engines/realismLocks.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const identityEngine = { fixedData:{ person:{ description:"test subject" } }, buildPersonText:()=>"IDENTITY PERSON DATA", buildLockText:()=>"IDENTITY GEOMETRY DATA" };
const roomLockEngine = { buildAuthorityText:()=>"ROOM AUTHORITY DATA", buildLockText:()=>"ROOM GEOMETRY DATA" };
const poseEngine = { engineer:({ pose }) => ({ posePhysics:`POSE & PHYSICS\nSelected pose id: ${pose.id}.` }) };
const engine = new PromptEngine({ identityEngine, roomLockEngine, poseEngine, cameraEngine:{}, lightingEngine:{ buildPrompt:()=>"LIGHTING FALLBACK" } });

const relaxed = EXPRESSIONS.find((x) => x.id === "relaxed");
const confident = EXPRESSIONS.find((x) => x.id === "confident");
const pose = POSES.find((x) => x.id === "lying_right_side") ?? POSES[0];
const hair = HAIR_OPTIONS[0];
const clothing = CLOTHING_OPTIONS[0];
const regularLighting = LIGHTING_OPTIONS.find((x) => x.id !== "phone_screen_only") ?? LIGHTING_OPTIONS[0];
const phoneLighting = LIGHTING_OPTIONS.find((x) => x.id === "phone_screen_only");

const cfg = (expression = relaxed, lighting = regularLighting) => ({
  pose, expression, lighting, hair, clothing,
  scene:{ name_en:"selected bedroom", image_url:"assets/test.jpg" },
  roomMode:"GENERATE", aspect:"9:16",
  autoEngineering:{ orientation:"physically supported orientation" }
});

const prompt = engine.generateV2(cfg());
const order = ["TASK:","SELFIE VIEWPOINT LOCK","PHOTOGRAPHIC BRIEF","IDENTITY LOCK","ROOM LOCK","POSE & PHYSICS","BEDDING PHYSICS","[Camera Emulator]","EXPRESSION = MUSCLE STATE ONLY","HAIR REALISM LOCK","CLOTHING LOCK","LIGHTING PHYSICS LOCK","SINGLE PHONE PIPELINE","IMPERFECTION MANIFEST","FINAL CHECK","NEGATIVE PROMPT"];
let cursor = -1;
for (const marker of order) {
  const next = prompt.indexOf(marker);
  assert.ok(next > cursor, `v2 marker must appear in order: ${marker}`);
  cursor = next;
}
assert.match(prompt, /^TASK:/u);
assert.match(prompt, /Return only the final image/u);
assert.match(prompt, /Xiaomi 15 Ultra - Front-Facing Camera/u);

const confidentPrompt = engine.generateV2(cfg(confident));
assert.doesNotMatch(confidentPrompt, /\bconfident\b/iu, "Confident selection must be muscle-only in the generated prompt");
assert.match(confidentPrompt, /mouth corners lifted slightly and asymmetrically/u);

assert.ok(phoneLighting, "phone_screen_only must remain available");
const phonePrompt = engine.generateV2(cfg(relaxed, phoneLighting));
assert.match(phonePrompt, /STRICT "PHONE SCREEN ONLY"/u);
assert.match(phonePrompt, /UNLIT decorative prop emitting ZERO light/u);

assert.deepEqual(Object.keys(QUICK_FIXES), ["face_drift","arm_leak","light_leak","seat_mess","bg_cleaner"]);
for (const value of Object.values(QUICK_FIXES)) assert.ok(value.length > 80, "Every quick fix must contain an actionable correction block");

// Deployment contract for the currently active GitHub Pages application.
const index = readFileSync(resolve(root, "index.html"), "utf8");
assert.match(index, /id="prompt-form"/u);
assert.match(index, /id="reference-image"/u);
assert.match(index, /id="scene"/u);
assert.match(index, /id="time"/u);
assert.match(index, /id="mode"/u);
assert.match(index, /id="composition"/u);
assert.match(index, /id="selfie-angle"/u);
assert.match(index, /id="positive-prompt"/u);
assert.match(index, /id="negative-prompt"/u);
assert.match(index, /id="qa-list"/u);
assert.match(index, /id="form-status"/u);
assert.match(index, /<script type="module" src="js\/physics-app-v5\.js"><\/script>/u);
assert.doesNotMatch(index, /src="js\/app\.js"/u, "The retired controller must not be the live root entrypoint");

const physicsApp = readFileSync(resolve(root, "js/physics-app-v5.js"), "utf8");
assert.match(physicsApp, /wikiPromptService/u);
assert.match(physicsApp, /wikiPromptService\.sync\(config\)/u);
assert.match(physicsApp, /appendWikiGuidance/u);
assert.match(physicsApp, /wikiStatusText/u);

const wikiService = readFileSync(resolve(root, "js/services/wikiPromptService.js"), "utf8");
assert.match(wikiService, /new URL\("\.\.\/\.\.\/data\/wikiprompt-realism\.json", import\.meta\.url\)\.href/u);
assert.doesNotMatch(wikiService, /document\.baseURI/u, "WikiPrompt service must remain import-safe in Node tests");
assert.match(wikiService, /same-origin-local-json/u);

const wikiDataset = JSON.parse(readFileSync(resolve(root, "data/wikiprompt-realism.json"), "utf8"));
assert.ok(Array.isArray(wikiDataset.records) && wikiDataset.records.length > 0, "WikiPrompt local realism cache must contain records");
for (const record of wikiDataset.records) {
  assert.ok(record.title, "Every WikiPrompt metadata record needs a title");
  assert.ok(Array.isArray(record.tags), "Every WikiPrompt metadata record needs tags");
}

const changelog = readFileSync(resolve(root, "CHANGELOG.md"), "utf8");
assert.match(changelog, /## v2\.0-personal — 2026-08-28/u);

const car = readFileSync(resolve(root, "car.html"), "utf8");
assert.doesNotMatch(car, /prompt_personal_flow|historyDialog|quickFix/u, "Personal home tooling must not leak into frozen car.html");

console.log("✓ prompt-studio active Physics v5 deployment contract passed");
