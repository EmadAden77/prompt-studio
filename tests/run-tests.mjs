import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SCENES } from "../js/data/scenesData.js";
import { POSES } from "../js/data/posesData.js";
import { CAMERA_SPECS, LENSES, SELFIE_ARM_STRATEGIES } from "../js/data/cameraData.js";
import { LIGHTING_OPTIONS } from "../js/data/lightingData.js";
import { CLOTHING_OPTIONS } from "../js/data/clothingData.js";
import { EXPRESSION_OPTIONS } from "../js/data/expressionsData.js";
import { HAIR_OPTIONS } from "../js/data/hairData.js";
import { QUAD_POSE_IDS } from "../js/data/quadModeData.js";
import { FIXED_DATA, IMAGE_A_AUTHORITY, IMAGE_B_AUTHORITY } from "../js/data/fixedData.js";
import { ROOM_LOCK_POLICIES } from "../js/policies/roomLockPolicy.js";
import { SceneEngine } from "../js/engines/sceneEngine.js";
import { PoseEngine } from "../js/engines/poseEngine.js";
import { CameraEngine } from "../js/engines/cameraEngine.js";
import { LightingEngine } from "../js/engines/lightingEngine.js";
import { IdentityEngine } from "../js/engines/identityEngine.js";
import { RoomLockEngine } from "../js/engines/roomLockEngine.js";
import { Validator } from "../js/engines/validator.js";
import { PromptEngine } from "../js/engines/promptEngine.js";
import { AutoEngineeringEngine } from "../js/engines/autoEngineeringEngine.js";

const sceneEngine = new SceneEngine(SCENES);
const poseEngine = new PoseEngine(POSES);
const cameraEngine = new CameraEngine(CAMERA_SPECS, LENSES, SELFIE_ARM_STRATEGIES);
const lightingEngine = new LightingEngine(LIGHTING_OPTIONS);
const identityEngine = new IdentityEngine(FIXED_DATA, IMAGE_A_AUTHORITY);
const roomLockEngine = new RoomLockEngine(ROOM_LOCK_POLICIES, IMAGE_B_AUTHORITY);
const validator = new Validator({ lightingEngine });
const promptEngine = new PromptEngine({ identityEngine, roomLockEngine, poseEngine, cameraEngine, lightingEngine });
const autoEngineeringEngine = new AutoEngineeringEngine({ sceneEngine, lightingEngine });
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const rightPose = poseEngine.getById("lying_right_side");
const rightEngineering = autoEngineeringEngine.engineer({
  pose: rightPose,
  lightingId: "lamp_and_phone"
});
assert.equal(rightEngineering.selectedSceneId, "bed_right_nightstand");
assert.equal(rightEngineering.bodyDirection, "toward_lamp");
assert.equal(rightEngineering.cameraType, "front");
assert.equal(rightEngineering.lensType, "front_wide");
assert.equal(rightEngineering.roomMode, "GENERATE");
assert.match(rightEngineering.armFine, /LEFT/u);
assert.match(rightEngineering.physicsFine, /RIGHT shoulder/u);
assert.equal(rightEngineering.confidence, "تلقائي — دقة عالية");

const leftPose = poseEngine.getById("lying_left_side");
const leftEngineering = autoEngineeringEngine.engineer({ pose: leftPose, lightingId: "phone_screen_only" });
assert.equal(leftEngineering.selectedSceneId, "bed_left_vanity");
assert.equal(leftEngineering.bodyDirection, "toward_vanity");
assert.match(leftEngineering.armFine, /RIGHT hand/u);
assert.match(leftEngineering.orientation, /LEFT shoulder/u);

const mirrorPose = poseEngine.getById("mirror_selfie");
const mirrorEngineering = autoEngineeringEngine.engineer({ pose: mirrorPose, lightingId: "single_ceiling" });
assert.equal(mirrorEngineering.selectedSceneId, "vanity_mirror");
assert.equal(mirrorEngineering.cameraType, "rear");
assert.equal(mirrorEngineering.bodyDirection, "facing_mirror");

for (const poseId of QUAD_POSE_IDS) {
  const pose = poseEngine.getById(poseId);
  const engineered = autoEngineeringEngine.engineer({ pose, lightingId: "lamp_and_phone" });
  assert.ok(engineered?.scene, `Every Smart Quad pose needs a deterministic scene: ${poseId}`);
  assert.ok(engineered.cameraType, `Every Smart Quad pose needs a deterministic camera: ${poseId}`);
  assert.ok(engineered.cameraFine, `Every Smart Quad pose needs fine camera geometry: ${poseId}`);
  assert.ok(engineered.armFine, `Every Smart Quad pose needs deterministic arm geometry: ${poseId}`);
}

const scene = rightEngineering.scene;
const baseConfig = {
  mode: "smart",
  pose: rightPose,
  scene,
  poseId: rightPose.id,
  selectedSceneId: scene.id,
  bodyDirection: rightEngineering.bodyDirection,
  cameraAngle: rightEngineering.cameraAngle,
  cameraDistance: rightEngineering.cameraDistance,
  cameraType: rightEngineering.cameraType,
  camera: cameraEngine.getCamera(rightEngineering.cameraType),
  lensType: rightEngineering.lensType,
  lens: cameraEngine.getLens(rightEngineering.lensType),
  expression: EXPRESSION_OPTIONS.find((item) => item.id === "relaxed"),
  hair: HAIR_OPTIONS.find((item) => item.id === "same"),
  clothing: CLOTHING_OPTIONS.find((item) => item.id === "pajamas"),
  lighting: lightingEngine.getById(rightEngineering.lightingId),
  roomMode: rightEngineering.roomMode,
  autoEngineering: rightEngineering,
  uploads: {
    imageA: { name: "identity.jpg" },
    imageB: { name: scene.image_filename }
  }
};

const validResult = validator.validate(baseConfig);
assert.equal(validResult.valid, true, "Deterministic right-side Smart Quad configuration must pass validation");

const editBedSelfieResult = validator.validate({ ...baseConfig, roomMode: "EDIT" });
assert.equal(editBedSelfieResult.valid, false);
assert.ok(editBedSelfieResult.conflicts.some((issue) => issue.type === "bed_selfie_requires_generate"));

const wrongLensResult = validator.validate({ ...baseConfig, lens: cameraEngine.getLens("rear_portrait") });
assert.equal(wrongLensResult.valid, false);
assert.ok(wrongLensResult.conflicts.some((issue) => issue.type === "camera_lens_conflict"));

const prompt = promptEngine.generate(baseConfig);
assert.match(prompt, /^CHATGPT IMAGE TASK/u);
assert.match(prompt, /IMAGE A — IDENTITY ONLY/u);
assert.match(prompt, /IMAGE B — ROOM ONLY/u);
assert.match(prompt, /BED SPATIAL MAP/u);
assert.match(prompt, /BODY FIRST, CAMERA SECOND/u);
assert.match(prompt, /upper LEFT hand/u);
assert.match(prompt, /LAMP SIDE: RIGHT/u);
assert.match(prompt, /NEGATIVE PROMPT/u);
assert.match(prompt, /Return only the final image/u);
assert.doesNotMatch(prompt, /الاستلقاء|الأباجورة|التسريحة/u, "Final prompt must remain English");

const indexHTML = readFileSync(resolve(projectRoot, "index.html"), "utf8");
assert.doesNotMatch(indexHTML, /183\s*cm|82\s*kg|35 years|Middle Eastern man/u, "Fixed person data must not appear in the UI document");
assert.match(indexHTML, /Smart Quad/u);
assert.match(indexHTML, /id="poseSelect"/u);
assert.match(indexHTML, /id="hairSelect"/u);
assert.match(indexHTML, /id="lightingSelect"/u);
assert.match(indexHTML, /id="expressionSelect"/u);
assert.doesNotMatch(indexHTML, /id="cameraSelect"|id="angleSelect"|id="distanceSelect"|id="clothingSelect"|id="roomModeSelect"/u, "Smart Quad UI must hide engineering controls completely");

const localAssets = [...indexHTML.matchAll(/(?:href|src)="([^"#]+)"/gu)]
  .map((match) => match[1])
  .filter((path) => !/^(?:https?:|data:|mailto:)/u.test(path));
for (const asset of localAssets) {
  assert.ok(existsSync(resolve(projectRoot, asset)), `Referenced asset must exist: ${asset}`);
}

const sourceFiles = ["js/app.js"];
const visited = new Set();
while (sourceFiles.length) {
  const relativePath = sourceFiles.pop();
  if (visited.has(relativePath)) continue;
  visited.add(relativePath);
  const absolutePath = resolve(projectRoot, relativePath);
  assert.ok(existsSync(absolutePath), `Imported module must exist: ${relativePath}`);
  const source = readFileSync(absolutePath, "utf8");
  for (const match of source.matchAll(/from\s+["']([^"']+)["']/gu)) {
    if (!match[1].startsWith(".")) continue;
    const importedAbsolute = resolve(dirname(absolutePath), match[1]);
    assert.ok(existsSync(importedAbsolute), `Imported module must exist: ${match[1]} from ${relativePath}`);
    sourceFiles.push(importedAbsolute.slice(projectRoot.length + 1));
  }
}

console.log("✓ Smart Quad deterministic mapping tests passed");
console.log("✓ Validator tests passed");
console.log("✓ Prompt generation and spatial-map tests passed");
console.log("✓ Four-choice UI and static integrity tests passed");
