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

const sceneEngine = new SceneEngine(SCENES);
const poseEngine = new PoseEngine(POSES);
const cameraEngine = new CameraEngine(CAMERA_SPECS, LENSES, SELFIE_ARM_STRATEGIES);
const lightingEngine = new LightingEngine(LIGHTING_OPTIONS);
const identityEngine = new IdentityEngine(FIXED_DATA, IMAGE_A_AUTHORITY);
const roomLockEngine = new RoomLockEngine(ROOM_LOCK_POLICIES, IMAGE_B_AUTHORITY);
const validator = new Validator({ lightingEngine });
const promptEngine = new PromptEngine({ identityEngine, roomLockEngine, poseEngine, cameraEngine, lightingEngine });
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const rightSide = sceneEngine.autoSelect({
  poseId: "lying_right_side",
  bodyDirection: "toward_lamp",
  cameraAngle: "eye_level",
  cameraDistance: "medium"
});
assert.equal(rightSide.scene.id, "bed_right_nightstand", "Right-side lying must select the lamp-side bed reference");
assert.equal(rightSide.confidence, "دقة عالية");

const mirror = sceneEngine.autoSelect({
  poseId: "mirror_selfie",
  bodyDirection: "facing_mirror",
  cameraAngle: "eye_level",
  cameraDistance: "medium",
  requiredFeatures: ["vanity_mirror"]
});
assert.equal(mirror.scene.id, "vanity_mirror", "Mirror pose must select a scene with a real vanity mirror");

const impossible = sceneEngine.autoSelect({
  poseId: "lying_left_side",
  bodyDirection: "toward_lamp",
  cameraAngle: "eye_level",
  cameraDistance: "medium"
});
assert.equal(impossible.error, "no_match", "Mandatory mismatch must not fall back to an unrelated scene");

const pose = poseEngine.getById("lying_right_side");
const scene = rightSide.scene;
const baseConfig = {
  mode: "smart",
  pose,
  scene,
  poseId: pose.id,
  selectedSceneId: scene.id,
  bodyDirection: "toward_lamp",
  cameraAngle: "eye_level",
  cameraDistance: "medium",
  cameraType: "front",
  camera: cameraEngine.getCamera("front"),
  lensType: "front_wide",
  lens: cameraEngine.getLens("front_wide"),
  expression: EXPRESSION_OPTIONS[0],
  hair: HAIR_OPTIONS[0],
  clothing: CLOTHING_OPTIONS[0],
  lighting: lightingEngine.getById("lamp_only"),
  roomMode: "GENERATE",
  uploads: {
    imageA: { name: "identity.jpg" },
    imageB: { name: scene.image_filename }
  }
};

const validResult = validator.validate(baseConfig);
assert.equal(validResult.valid, true, "Physically compatible generated bed selfie must pass validation");

const editBedSelfieResult = validator.validate({
  ...baseConfig,
  roomMode: "EDIT"
});
assert.equal(editBedSelfieResult.valid, false, "Bed selfie must not pass as immutable EDIT geometry");
assert.ok(editBedSelfieResult.conflicts.some((issue) => issue.type === "bed_selfie_requires_generate"));
assert.ok(editBedSelfieResult.autoFixes.some((fix) => fix.field === "roomMode" && fix.value === "GENERATE"));

const rearBedSelfieResult = validator.validate({
  ...baseConfig,
  cameraType: "rear",
  camera: cameraEngine.getCamera("rear"),
  lensType: "rear_standard",
  lens: cameraEngine.getLens("rear_standard")
});
assert.equal(rearBedSelfieResult.valid, false);
assert.ok(rearBedSelfieResult.conflicts.some((issue) => issue.type === "bed_selfie_camera_conflict"));

const wrongLensResult = validator.validate({
  ...baseConfig,
  lens: cameraEngine.getLens("rear_portrait")
});
assert.equal(wrongLensResult.valid, false);
assert.ok(wrongLensResult.conflicts.some((issue) => issue.type === "camera_lens_conflict"));

const standingPose = poseEngine.getById("standing_center");
const standingScene = sceneEngine.autoSelect({
  poseId: standingPose.id,
  bodyDirection: standingPose.preferred_direction,
  cameraAngle: "eye_level",
  cameraDistance: "wide"
}).scene;
const editConfig = {
  ...baseConfig,
  pose: standingPose,
  scene: standingScene,
  poseId: standingPose.id,
  selectedSceneId: standingScene.id,
  bodyDirection: standingPose.preferred_direction,
  cameraAngle: standingScene.base_camera_angle,
  cameraDistance: standingScene.base_camera_distance,
  lighting: lightingEngine.getById("all_ceiling_spots"),
  roomMode: "EDIT",
  uploads: {
    imageA: { name: "identity.jpg" },
    imageB: { name: standingScene.image_filename }
  }
};

const wrongEditAngleResult = validator.validate({
  ...editConfig,
  cameraAngle: "high_angle"
});
assert.ok(wrongEditAngleResult.conflicts.some((issue) => issue.type === "edit_mode_angle"));

const wrongEditDistanceResult = validator.validate({
  ...editConfig,
  cameraDistance: "medium"
});
assert.ok(wrongEditDistanceResult.conflicts.some((issue) => issue.type === "edit_mode_distance"));

const prompt = promptEngine.generate(baseConfig);
assert.match(prompt, /^CHATGPT IMAGE TASK/u);
assert.match(prompt, /IMAGE A — IDENTITY ONLY/u);
assert.match(prompt, /IMAGE B — ROOM ONLY/u);
assert.match(prompt, /Use the LEFT hand as the upper selfie hand/u);
assert.match(prompt, /BED SELFIE SPATIAL ANCHOR — BODY FIRST, CAMERA SECOND/u);
assert.match(prompt, /The camera must move to the reachable hand position; the body must not move to satisfy the camera/u);
assert.match(prompt, /Return only the final image/u);
assert.doesNotMatch(prompt, /الاستلقاء|الأباجورة|التسريحة/u, "Final prompt must remain English");

for (const poseItem of POSES) {
  const coverage = sceneEngine.autoSelect({
    poseId: poseItem.id,
    bodyDirection: poseItem.preferred_direction,
    cameraAngle: poseItem.valid_angles[0],
    cameraDistance: poseItem.valid_distances[0],
    requiredFeatures: poseItem.requires ?? []
  });
  assert.ok(coverage.scene, `Every pose needs at least one strict smart-mode scene: ${poseItem.id}`);
}

const indexHTML = readFileSync(resolve(projectRoot, "index.html"), "utf8");
assert.doesNotMatch(indexHTML, /183\s*cm|82\s*kg|35 years|Middle Eastern man/u, "Fixed person data must not appear in the UI document");

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

console.log("✓ Scene matching tests passed");
console.log("✓ Validator tests passed");
console.log("✓ Prompt generation tests passed");
console.log("✓ Static asset and module integrity tests passed");
