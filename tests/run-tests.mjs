import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { APP_CONFIG } from "../js/config/appConfig.js";
import { SCENES } from "../js/data/scenesData.js";
import { POSES } from "../js/data/posesData.js";
import { CAMERA_SPECS, LENSES, SELFIE_ARM_STRATEGIES } from "../js/data/cameraData.js";
import { LIGHTING_OPTIONS } from "../js/data/lightingData.js";
import { CLOTHING_OPTIONS } from "../js/data/clothingData.js";
import { EXPRESSION_OPTIONS } from "../js/data/expressionsData.js";
import { HAIR_OPTIONS } from "../js/data/hairData.js";
import { QUAD_DEFAULTS, QUAD_POSE_IDS } from "../js/data/quadModeData.js";
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

const expectedClothingIds = [
  "cotton_pajama", "satin_pajama", "sleep_tee_shorts", "thermal_sleep",
  "heather_tee_jeans", "longsleeve_chino", "oxford_shirt_chino", "flannel_jeans", "polo_chino", "hoodie_sweats", "sweater_jeans",
  "dryfit_track", "track_jacket",
  "denim_jacket", "leather_jacket", "puffer_jacket", "wool_coat",
  "thobe"
];
assert.deepEqual(CLOTHING_OPTIONS.map((item) => item.id), expectedClothingIds, "v1.1 clothing catalog must contain only the approved items in approved order");
assert.equal(APP_CONFIG.defaultState.clothingId, "cotton_pajama");
assert.equal(QUAD_DEFAULTS.clothingId, "cotton_pajama");
assert.deepEqual([...new Set(CLOTHING_OPTIONS.map((item) => item.category))], ["sleepwear", "casual", "sport", "winter", "traditional"]);
for (const outfit of CLOTHING_OPTIONS) {
  assert.ok(outfit.name_ar && outfit.name_en && outfit.pieces, `Clothing metadata must be complete: ${outfit.id}`);
  for (const key of ["type", "weight", "sheen", "drape", "folds", "texture", "wear"]) {
    assert.ok(outfit.fabric?.[key], `Fabric field ${key} must exist: ${outfit.id}`);
  }
}

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
assert.equal(rightEngineering.clothingId, undefined, "Auto-engineering must never overwrite the user-selected clothing in v1.1");
assert.match(rightEngineering.armFine, /LEFT/u);
assert.match(rightEngineering.physicsFine, /RIGHT shoulder/u);
assert.equal(rightEngineering.selfieViewpoint.holdingHand, "LEFT");
assert.equal(rightEngineering.selfieViewpoint.otherHand, "RIGHT");
assert.equal(rightEngineering.selfieViewpoint.distance, "35–45 cm");
assert.match(rightEngineering.selfieViewpoint.tilt, /clockwise Dutch tilt/u);
assert.equal(rightEngineering.confidence, "تلقائي — دقة عالية");

const leftPose = poseEngine.getById("lying_left_side");
const leftEngineering = autoEngineeringEngine.engineer({ pose: leftPose, lightingId: "phone_screen_only" });
assert.equal(leftEngineering.selectedSceneId, "bed_left_vanity");
assert.equal(leftEngineering.bodyDirection, "toward_vanity");
assert.match(leftEngineering.armFine, /RIGHT hand/u);
assert.match(leftEngineering.orientation, /LEFT shoulder/u);
assert.equal(leftEngineering.selfieViewpoint.holdingHand, "RIGHT");
assert.equal(leftEngineering.selfieViewpoint.otherHand, "LEFT");
assert.match(leftEngineering.selfieViewpoint.tilt, /counterclockwise Dutch tilt/u);

const cottonPajama = CLOTHING_OPTIONS.find((item) => item.id === "cotton_pajama");
const rightPoseSections = poseEngine.engineer({
  pose: rightPose,
  expression: EXPRESSION_OPTIONS.find((item) => item.id === "serious"),
  hair: HAIR_OPTIONS.find((item) => item.id === "messy"),
  clothing: cottonPajama,
  autoEngineering: rightEngineering
});
assert.match(rightPoseSections.trueLateral, /TRUE LATERAL ENFORCEMENT/u);
assert.match(rightPoseSections.trueLateral, /UPPER LEFT hand is the ONLY selfie hand/u);
assert.match(rightPoseSections.trueLateral, /LOWER RIGHT arm/u);
assert.match(rightPoseSections.trueLateral, /SUBJECT'S own body/u);
assert.match(rightPoseSections.expression, /overrides the expression visible in IMAGE A/u);
assert.match(rightPoseSections.expression, /muscle-state override/u);
assert.match(rightPoseSections.clothing, /CLOTHING \(user-selected — OVERRIDES IMAGE A\)/u);
assert.match(rightPoseSections.clothing, /loose grey cotton pajama shirt with matching pants/u);
assert.match(rightPoseSections.clothing, /Fabric: cotton; weight light-medium; sheen: matte/u);
assert.match(rightPoseSections.clothing, /FABRIC REALISM/u);
assert.match(rightPoseSections.clothing, /NON-REPEATING/u);
assert.match(rightPoseSections.clothing, /no tiled texture stamps/u);
assert.match(rightPoseSections.clothing, /Folds are load-driven only/u);
assert.match(rightPoseSections.clothing, /Matte cotton stays matte/u);
assert.match(rightPoseSections.clothing, /same phone-camera pipeline/u);
assert.match(rightPoseSections.clothing, /selected clothing overrides every shirt/u);
assert.match(rightPoseSections.hair, /arrangement only/u);

const leather = CLOTHING_OPTIONS.find((item) => item.id === "leather_jacket");
const leatherLock = poseEngine.buildClothingLock(leather);
assert.match(leatherLock, /soft specular highlights/u);
assert.match(leatherLock, /natural grain, no uniform pattern/u);
assert.match(leatherLock, /Satin and leather may show soft directional highlights only/u);

const leftPoseSections = poseEngine.engineer({
  pose: leftPose,
  expression: EXPRESSION_OPTIONS.find((item) => item.id === "relaxed"),
  hair: HAIR_OPTIONS.find((item) => item.id === "same"),
  clothing: cottonPajama,
  autoEngineering: leftEngineering
});
assert.match(leftPoseSections.trueLateral, /UPPER RIGHT hand is the ONLY selfie hand/u);
assert.match(leftPoseSections.trueLateral, /LOWER LEFT arm/u);

const rightViewpointLock = cameraEngine.selfieViewpointLock({
  camera: cameraEngine.getCamera("front"),
  pose: rightPose,
  autoEngineering: rightEngineering
});
assert.match(rightViewpointLock, /SELFIE VIEWPOINT LOCK — HIGHEST PRIORITY FOR CAMERA GEOMETRY/u);
assert.match(rightViewpointLock, /subject's own front-facing phone held in his LEFT hand at 35–45 cm/u);
assert.match(rightViewpointLock, /clockwise Dutch tilt of 25–35 degrees/u);
assert.match(rightViewpointLock, /Face occupies approximately 40–60% of frame height/u);
assert.match(rightViewpointLock, /phone is behind the camera plane and therefore is NOT visible/u);
assert.match(rightViewpointLock, /third-person observer camera/u);
assert.match(rightViewpointLock, /camera at the foot of the bed/u);
assert.match(rightViewpointLock, /whole bed/u);
assert.match(rightViewpointLock, /hand's ONLY job is holding the phone/u);
assert.match(rightViewpointLock, /SELFIE DISTANCE CHECK/u);

const mirrorPose = poseEngine.getById("mirror_selfie");
const mirrorEngineering = autoEngineeringEngine.engineer({ pose: mirrorPose, lightingId: "single_ceiling" });
assert.equal(mirrorEngineering.selectedSceneId, "vanity_mirror");
assert.equal(mirrorEngineering.cameraType, "rear");
assert.equal(mirrorEngineering.bodyDirection, "facing_mirror");
assert.equal(cameraEngine.selfieViewpointLock({
  camera: cameraEngine.getCamera("rear"),
  pose: mirrorPose,
  autoEngineering: mirrorEngineering
}), "", "Rear-camera mirror capture must not receive the front-camera selfie viewpoint lock");

for (const poseId of QUAD_POSE_IDS) {
  const pose = poseEngine.getById(poseId);
  const engineered = autoEngineeringEngine.engineer({ pose, lightingId: "lamp_and_phone" });
  assert.ok(engineered?.scene, `Every Smart Quad pose needs a deterministic scene: ${poseId}`);
  assert.ok(engineered.cameraType, `Every Smart Quad pose needs a deterministic camera: ${poseId}`);
  assert.ok(engineered.cameraFine, `Every Smart Quad pose needs fine camera geometry: ${poseId}`);
  assert.ok(engineered.armFine, `Every Smart Quad pose needs deterministic arm geometry: ${poseId}`);
  if (engineered.cameraType === "front") {
    assert.ok(engineered.selfieViewpoint, `Every front-camera Smart Quad pose needs a deterministic selfie viewpoint profile: ${poseId}`);
    assert.ok(engineered.selfieViewpoint.holdingHand, `Every front-camera pose needs a deterministic holding hand: ${poseId}`);
    assert.ok(engineered.selfieViewpoint.distance, `Every front-camera pose needs an arm-reach distance: ${poseId}`);
  }
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
  clothing: cottonPajama,
  clothingId: cottonPajama.id,
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
assert.match(prompt, /SELFIE VIEWPOINT LOCK — HIGHEST PRIORITY FOR CAMERA GEOMETRY/u);
assert.match(prompt, /IMAGE A — IDENTITY ONLY/u);
assert.match(prompt, /IMAGE B — ROOM ONLY/u);
assert.match(prompt, /BED SPATIAL MAP/u);
assert.match(prompt, /BODY FIRST, CAMERA SECOND/u);
assert.match(prompt, /TRUE LATERAL ENFORCEMENT — NON-NEGOTIABLE/u);
assert.match(prompt, /UPPER LEFT hand is the ONLY selfie hand/u);
assert.match(prompt, /LOWER RIGHT arm/u);
assert.match(prompt, /EXPRESSION LOCK/u);
assert.match(prompt, /selected expression overrides the expression visible in IMAGE A/u);
assert.match(prompt, /CLOTHING LOCK/u);
assert.match(prompt, /FABRIC REALISM/u);
assert.match(prompt, /loose grey cotton pajama shirt with matching pants/u);
assert.match(prompt, /same phone-camera pipeline/u);
assert.match(prompt, /LAMP SIDE: RIGHT/u);
assert.match(prompt, /Face occupies approximately 40–60% of frame height/u);
assert.match(prompt, /third-person view, observer camera, wide room shot/u);
assert.match(prompt, /hand propping head/u);
assert.match(prompt, /NEGATIVE PROMPT/u);
assert.match(prompt, /Return only the final image/u);
assert.ok(
  prompt.indexOf("CHATGPT IMAGE TASK") < prompt.indexOf("SELFIE VIEWPOINT LOCK — HIGHEST PRIORITY FOR CAMERA GEOMETRY")
  && prompt.indexOf("SELFIE VIEWPOINT LOCK — HIGHEST PRIORITY FOR CAMERA GEOMETRY") < prompt.indexOf("PROMPT ENGINEERING POLICY"),
  "Selfie viewpoint lock must be injected immediately after the task and before the general prompt policy"
);
assert.doesNotMatch(prompt, /الاستلقاء|الأباجورة|التسريحة/u, "Final prompt must remain English");

const leftConfig = {
  ...baseConfig,
  pose: leftPose,
  scene: leftEngineering.scene,
  poseId: leftPose.id,
  selectedSceneId: leftEngineering.selectedSceneId,
  bodyDirection: leftEngineering.bodyDirection,
  cameraAngle: leftEngineering.cameraAngle,
  cameraDistance: leftEngineering.cameraDistance,
  cameraType: leftEngineering.cameraType,
  camera: cameraEngine.getCamera(leftEngineering.cameraType),
  lensType: leftEngineering.lensType,
  lens: cameraEngine.getLens(leftEngineering.lensType),
  roomMode: leftEngineering.roomMode,
  autoEngineering: leftEngineering,
  lighting: lightingEngine.getById(leftEngineering.lightingId),
  uploads: {
    imageA: { name: "identity.jpg" },
    imageB: { name: leftEngineering.scene.image_filename }
  }
};
const leftPrompt = promptEngine.generate(leftConfig);
assert.match(leftPrompt, /front-facing phone held in his RIGHT hand at 30–40 cm/u);
assert.match(leftPrompt, /counterclockwise Dutch tilt of 25–35 degrees/u);
assert.match(leftPrompt, /UPPER RIGHT hand is the ONLY selfie hand/u);

const indexHTML = readFileSync(resolve(projectRoot, "index.html"), "utf8");
assert.doesNotMatch(indexHTML, /183\s*cm|82\s*kg|35 years|Middle Eastern man/u, "Fixed person data must not appear in the UI document");
assert.match(indexHTML, /Smart Quad/u);
assert.match(indexHTML, /خمس اختيارات/u);
assert.match(indexHTML, /id="poseSelect"/u);
assert.match(indexHTML, /id="hairSelect"/u);
assert.match(indexHTML, /id="lightingSelect"/u);
assert.match(indexHTML, /id="expressionSelect"/u);
assert.match(indexHTML, /id="clothingSelect"/u);
assert.doesNotMatch(indexHTML, /id="cameraSelect"|id="angleSelect"|id="distanceSelect"|id="roomModeSelect"/u, "v1.1 UI must keep engineering controls hidden");

const appJS = readFileSync(resolve(projectRoot, "js/app.js"), "utf8");
assert.match(appJS, /document\.createElement\("optgroup"\)/u);
assert.match(appJS, /sleepwear: "ملابس نوم"/u);
assert.match(appJS, /casual: "كاجوال"/u);
assert.match(appJS, /sport: "رياضي"/u);
assert.match(appJS, /winter: "شتوي"/u);
assert.match(appJS, /traditional: "تقليدي"/u);
assert.doesNotMatch(appJS, /derivedFields = \[[\s\S]*"clothingId"/u, "Auto-engineered fields must not overwrite the clothing choice");

const changelog = readFileSync(resolve(projectRoot, "CHANGELOG.md"), "utf8");
assert.match(changelog, /## v1\.1 — 2026-08-25/u);
assert.match(changelog, /FABRIC REALISM/u);
assert.match(changelog, /cotton_pajama/u);

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
console.log("✓ True lateral anatomy and reference-lock tests passed");
console.log("✓ Selfie viewpoint lock and framing tests passed");
console.log("✓ v1.1 clothing catalog and fabric-realism tests passed");
console.log("✓ Validator tests passed");
console.log("✓ Prompt generation and spatial-map tests passed");
console.log("✓ Five-choice UI and static integrity tests passed");
