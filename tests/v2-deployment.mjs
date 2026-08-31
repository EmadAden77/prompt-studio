import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const index = readFileSync(resolve(root, "index.html"), "utf8");
assert.match(index, /WikiPrompt Selfie Studio/u);
assert.match(index, /WIKIPROMPT FIRST · SELFIE FIRST · SINGLE REFERENCE/u);
assert.match(index, /id="prompt-form"/u);
assert.match(index, /id="reference-image"/u);
assert.match(index, /id="scene"/u);
assert.match(index, /id="custom-scene-field"/u);
assert.match(index, /id="custom-scene"/u);
assert.match(index, /id="custom-scene-details-field"/u);
assert.match(index, /id="custom-scene-details"/u);
assert.match(index, /وصف المشهد المخصص/u);
assert.match(index, /تفاصيل مطلوبة إذا سمحت الزاوية/u);
assert.match(index, /id="pose-family"/u);
assert.match(index, /id="pose"/u);
assert.match(index, /id="car-seat-field"/u);
assert.match(index, /id="car-seat"/u);
assert.match(index, /موضع الجلوس داخل السيارة/u);
assert.match(index, /id="clothing"/u);
assert.match(index, /id="hair"/u);
assert.match(index, /id="lighting"/u);
assert.match(index, /id="selfie-angle"/u);
assert.match(index, /id="composition"/u);
assert.match(index, /id="positive-prompt"/u);
assert.match(index, /id="negative-prompt"/u);
assert.match(index, /id="qa-list"/u);
assert.match(index, /<input id="mode" name="mode" type="hidden" value="selfie"/u);
assert.doesNotMatch(index, /<option value="standard">/u, "Standard/observer photography must not remain as an active option");
assert.match(index, /styles-wikiprompt\.css/u);
assert.match(index, /<script type="module" src="js\/physics-app-v5\.js"><\/script>/u);

const app = readFileSync(resolve(root, "js/physics-app-v5.js"), "utf8");
assert.match(app, /composeWikiFirstPrompt/u);
assert.match(app, /\[WIKIPROMPT BASE REALISM\].*\\n\$\{guidance\}\\n\\n\$\{basePrompt\}/u, "WikiPrompt guidance must precede the engine prompt");
assert.match(app, /getPoseFamilyOptions/u);
assert.match(app, /getPoseOptions/u);
assert.match(app, /getCarSeatOptions/u);
assert.match(app, /isCarScene/u);
assert.match(app, /isCustomScene/u);
assert.match(app, /customScene:value\("custom-scene"\)/u);
assert.match(app, /customSceneDetails:value\("custom-scene-details"\)/u);
assert.match(app, /getCompatibleBedroomWindowOptions/u);
assert.match(app, /wikiPromptService\.sync\(config\)/u);
assert.doesNotMatch(app, /bedroomLighting/u, "Old parallel bedroom-lighting state must be removed from the live controller");
assert.doesNotMatch(app, /activity:value/u, "Free-form pose activity must not compete with the linked pose catalog");

const engine = readFileSync(resolve(root, "js/physics-prompt-engine-v5.js"), "utf8");
assert.match(engine, /wiki-selfie-data-v1\.js/u);
assert.match(engine, /SCENE_PRIORITY_RULE/u, "Engine must consume the selfie-priority policy from the modular data source");
assert.match(engine, /REALISM_ORDER/u, "Engine must consume the conflict-order policy from the modular data source");
assert.match(engine, /getCompatibleBedroomWindowOptions/u);
assert.match(engine, /LEFT FRONT DRIVER'S SEAT LOCK/u);
assert.match(engine, /RIGHT FRONT PASSENGER SEAT LOCK/u);
assert.match(engine, /Do not mirror, swap or reinterpret the subject's seat/u);
assert.match(engine, /\[CUSTOM SCENE AUTHORITY\]/u);
assert.match(engine, /Do not silently replace the requested place with a bedroom, car, gym, street or unrelated generic interior/u);
assert.match(engine, /CUSTOM_LIGHTING_OPTIONS/u);
assert.doesNotMatch(engine, /physics-data-v4\.js/u, "Old contradictory data source must be detached from the live engine");
assert.doesNotMatch(engine, /physicsPolicy\.js/u, "Old generic physics contract must be detached from the live engine");
assert.doesNotMatch(engine, /Leica Authentic|23mm-equivalent/u);

const data = readFileSync(resolve(root, "js/wiki-selfie-data-v1.js"), "utf8");
assert.match(data, /HAIR DENSITY LOCK/u);
assert.match(data, /SUBJECT-HELD SELFIE CAMERA/u);
assert.match(data, /SELFIE PRIORITY/u);
assert.match(data, /CONFLICT ORDER/u);
assert.doesNotMatch(data, /sheer white curtains/u);
assert.doesNotMatch(data, /cinematic lighting.*dominant/iu);

const wikiService = readFileSync(resolve(root, "js/services/wikiPromptService.js"), "utf8");
assert.match(wikiService, /new URL\("\.\.\/\.\.\/data\/wikiprompt-realism\.json", import\.meta\.url\)\.href/u);
assert.doesNotMatch(wikiService, /document\.baseURI/u);
assert.match(wikiService, /embedded-fallback/u);

const wikiDataset = JSON.parse(readFileSync(resolve(root, "data/wikiprompt-realism.json"), "utf8"));
assert.ok(Array.isArray(wikiDataset.records) && wikiDataset.records.length > 0);

console.log("✓ active WikiPrompt Selfie Studio deployment contract passed");
