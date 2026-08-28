import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { PromptEngine } from "../js/engines/promptEngine.js";
import { EXPRESSIONS } from "../js/data/expressionsData.js";
import { LIGHTING_OPTIONS } from "../js/data/lightingData.js";
import { POSES } from "../js/data/posesData.js";
import { HAIR_OPTIONS } from "../js/data/hairData.js";
import { CLOTHING_OPTIONS } from "../js/data/clothingData.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const identityEngine = {
  fixedData: { person: { description: "test subject" } },
  buildPersonText: () => "IDENTITY PERSON DATA",
  buildLockText: () => "IDENTITY GEOMETRY DATA"
};
const roomLockEngine = {
  buildAuthorityText: () => "ROOM AUTHORITY DATA",
  buildLockText: () => "ROOM GEOMETRY DATA"
};
const poseEngine = {
  engineer: ({ pose }) => ({ posePhysics: `POSE & PHYSICS\nSelected pose id: ${pose.id}.` })
};
const cameraEngine = {};
const lightingEngine = { buildPrompt: () => "LIGHTING FALLBACK" };
const engine = new PromptEngine({ identityEngine, roomLockEngine, poseEngine, cameraEngine, lightingEngine });

const relaxed = EXPRESSIONS.find((x) => x.id === "relaxed");
const confident = EXPRESSIONS.find((x) => x.id === "confident");
const pose = POSES.find((x) => x.id === "lying_right_side") ?? POSES[0];
const hair = HAIR_OPTIONS[0];
const clothing = CLOTHING_OPTIONS[0];
const regularLighting = LIGHTING_OPTIONS.find((x) => x.id !== "phone_screen_only") ?? LIGHTING_OPTIONS[0];
const phoneLighting = LIGHTING_OPTIONS.find((x) => x.id === "phone_screen_only");

function cfg(expression = relaxed, lighting = regularLighting) {
  return {
    pose,
    expression,
    lighting,
    hair,
    hairstyle: hair,
    clothing,
    scene: { name_en: "selected bedroom", image_url: "assets/test.jpg" },
    roomMode: "GENERATE",
    aspect: "9:16",
    autoEngineering: { orientation: "physically supported orientation" }
  };
}

const prompt = engine.generateV2(cfg());
const order = [
  "TASK:",
  "SELFIE VIEWPOINT LOCK",
  "PHOTOGRAPHIC BRIEF",
  "IDENTITY LOCK",
  "ROOM LOCK",
  "POSE & PHYSICS",
  "BEDDING PHYSICS",
  "[Camera Emulator]",
  "EXPRESSION = MUSCLE STATE ONLY",
  "HAIR REALISM LOCK",
  "CLOTHING LOCK",
  "LIGHTING PHYSICS LOCK",
  "SINGLE PHONE PIPELINE",
  "IMPERFECTION MANIFEST",
  "FINAL CHECK",
  "NEGATIVE PROMPT"
];
let cursor = -1;
for (const marker of order) {
  const next = prompt.indexOf(marker);
  assert.ok(next > cursor, `v2 marker must appear in order: ${marker}`);
  cursor = next;
}
assert.match(prompt, /^TASK:/u);
assert.match(prompt, /Xiaomi 15 Ultra - Front-Facing Camera/u);
assert.match(prompt, /35–60cm/u);
assert.match(prompt, /Return only the final image/u);

const confidentPrompt = engine.generateV2(cfg(confident));
assert.doesNotMatch(confidentPrompt, /\bconfident\b/iu, "Confident selection must be expressed as muscle actions, not the mood word");
assert.match(confidentPrompt, /mouth corners lifted slightly and asymmetrically/u);
assert.match(confidentPrompt, /sharper jaw/u);

assert.ok(phoneLighting, "phone_screen_only lighting must remain in the frozen lighting catalog");
const phonePrompt = engine.generateV2(cfg(relaxed, phoneLighting));
assert.match(phonePrompt, /STRICT "PHONE SCREEN ONLY"/u);
assert.match(phonePrompt, /UNLIT decorative prop emitting ZERO light/u);
assert.match(phonePrompt, /ONLY photon source/u);

const index = readFileSync(resolve(root, "index.html"), "utf8");
assert.match(index, /id="attachChip"/u);
assert.match(index, /id="attachFile"/u);
assert.match(index, /id="downloadSceneBtn"/u);
assert.match(index, /id="confBadge"/u);
assert.match(index, /id="strictLine"/u);
assert.match(index, /js\/engines\/realismLocks\.js/u);
assert.ok(index.indexOf("js/engines/realismLocks.js") < index.indexOf("js/app.js"), "realism locks must load before app engine scripts");

const app = readFileSync(resolve(root, "js/app.js"), "utf8");
assert.match(app, /window\.addEventListener\("load"/u);
assert.match(app, /onSmartModeChange/u);
assert.match(app, /renderAttachChip/u);
assert.match(app, /renderConfidence/u);
assert.match(app, /gatePassedCount/u);
assert.match(app, /🛏️ السرير/u);
assert.match(app, /🪑 الجلوس/u);
assert.match(app, /🧍 الوقوف/u);

const changelog = readFileSync(resolve(root, "CHANGELOG.md"), "utf8");
assert.match(changelog, /## v2\.0 — 2026-08-28/u);
assert.match(changelog, /generateV2/u);

const car = readFileSync(resolve(root, "car.html"), "utf8");
assert.doesNotMatch(car, /realismLocks\.js/u, "v2 home deployment must not wire realismLocks into frozen car.html");

console.log("✓ prompt-studio v2.0 deployment contract passed");
