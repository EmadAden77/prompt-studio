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
import { BED_REALISM_POSE_IDS, QUAD_DEFAULTS, QUAD_POSE_IDS } from "../js/data/quadModeData.js";
import { FIXED_DATA, IMAGE_A_AUTHORITY, IMAGE_B_AUTHORITY } from "../js/data/fixedData.js";
import { ROOM_LOCK_POLICIES } from "../js/policies/roomLockPolicy.js";
import { PHYSICS_CONTRACT } from "../js/policies/physicsPolicy.js";
import { AUTHORITY_HIERARCHY } from "../js/policies/authorityPolicy.js";
import { SceneEngine, POSE_REQUIREMENTS } from "../js/engines/sceneEngine.js";
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
const validator = new Validator({ lightingEngine, sceneEngine });
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
assert.deepEqual(CLOTHING_OPTIONS.map((item) => item.id), expectedClothingIds, "v1.1 clothing catalog must remain unchanged");
assert.equal(APP_CONFIG.defaultState.clothingId, "cotton_pajama");
assert.equal(QUAD_DEFAULTS.clothingId, "cotton_pajama");
assert.deepEqual([...new Set(CLOTHING_OPTIONS.map((item) => item.category))], ["sleepwear", "casual", "sport", "winter", "traditional"]);
for (const outfit of CLOTHING_OPTIONS) {
  assert.ok(outfit.name_ar && outfit.name_en && outfit.pieces, `Clothing metadata must be complete: ${outfit.id}`);
  for (const key of ["type", "weight", "sheen", "drape", "folds", "texture", "wear"]) {
    assert.ok(outfit.fabric?.[key], `Fabric field ${key} must exist: ${outfit.id}`);
  }
}

assert.deepEqual(BED_REALISM_POSE_IDS, ["lying_back", "lying_stomach", "lying_right_side", "lying_left_side", "semi_reclining"]);
assert.deepEqual(POSE_REQUIREMENTS.lying_right_side.required_features_all, ["bed", "mattress"]);
assert.equal(POSE_REQUIREMENTS.lying_right_side.preferred_region, "right_side_of_bed");
assert.deepEqual(POSE_REQUIREMENTS.lying_left_side.required_features_all, ["bed", "mattress"]);
assert.equal(POSE_REQUIREMENTS.lying_left_side.preferred_region, "left_side_of_bed");
assert.deepEqual(POSE_REQUIREMENTS.mirror_selfie.required_features_all, ["vanity_mirror"]);
assert.equal(POSE_REQUIREMENTS.mirror_selfie.preferred_region, "vanity_area");

const expectedLightingIds = [
  "phone_screen_only", "phone_screen_faint_bounce",
  "ceiling_white", "ceiling_warm", "all_spots", "ceiling_spots_dim",
  "lamp_only", "lamp_and_phone", "lamp_and_phone_low",
  "window_daylight", "morning_cool_curtain", "morning_wall_bounce", "midday_sheer_curtain",
  "bright_indirect_day", "heavy_overcast_day", "strong_side_window", "curtain_fold_sun",
  "low_sun_curtain_filtered", "floor_wall_day_bounce", "window_backlight_phone_hdr", "soft_front_window",
  "overcast_flat", "golden_hour",
  "ceiling_and_lamp", "ceiling_and_phone",
  "night_city_window", "curtain_lamp", "curtain_leak_screen", "night_ceiling_low"
];
assert.deepEqual(LIGHTING_OPTIONS.map((item) => item.id), expectedLightingIds, "expanded bedroom lighting catalog must match the supplied preset order");
assert.deepEqual([...new Set(LIGHTING_OPTIONS.map((item) => item.category))], ["screen", "ceiling", "lamp", "daylight", "mixed", "night"]);
assert.equal(APP_CONFIG.defaultState.lightingId, "lamp_and_phone", "The existing lighting default must remain unchanged");
for (const lighting of LIGHTING_OPTIONS) {
  for (const key of ["name_ar", "name_en", "category", "kelvin", "quality", "iso", "physics", "shadows", "catchlights", "room_effect"]) {
    assert.ok(lighting[key], `Lighting field ${key} must exist: ${lighting.id}`);
  }
}

const phoneOnly = lightingEngine.getById("phone_screen_only");
const lampAndPhone = lightingEngine.getById("lamp_and_phone");
assert.deepEqual(phoneOnly.required_features, [], "Phone screen is a portable source and must not require a room feature");
assert.deepEqual(phoneOnly.portable_sources, ["phone_screen"]);
assert.deepEqual(lampAndPhone.portable_sources, ["phone_screen"]);
assert.deepEqual(lampAndPhone.required_features, ["lamp"]);
const phoneOnlyPrompt = lightingEngine.buildPrompt(phoneOnly);
assert.match(phoneOnlyPrompt, /LIGHTING REALISM \(anti-AI\)/u);
assert.match(phoneOnlyPrompt, /Inverse-square falloff/u);
assert.match(phoneOnlyPrompt, /rectangular screen glow in both eyes/u);
assert.match(CAMERA_SPECS.front.focal_length, /22–24 mm/u);
assert.equal(LENSES.find((item) => item.id === "front_wide").focal_length, "22–24 mm equivalent");
assert.match(CAMERA_SPECS.front.distance, /typically 45–70 cm/u);
assert.match(CAMERA_SPECS.front.distance, /70–90 cm only when/u);

const rightPose = poseEngine.getById("lying_right_side");
const rightMapping = autoEngineeringEngine.getPoseEngineering(rightPose.id);
const frontCameraPrompt = cameraEngine.buildPrompt({
  camera: CAMERA_SPECS.front,
  lens: LENSES.find((item) => item.id === "front_wide"),
  pose: rightPose,
  cameraAngle: "eye_level",
  cameraDistance: "close"
});
assert.match(frontCameraPrompt, /^\[Camera Emulator\]: Xiaomi 15 Ultra - Front-Facing Camera/u);
assert.match(frontCameraPrompt, /Focal Length: 22–24mm equivalent wide-angle front lens/u);
assert.match(frontCameraPrompt, /STRICT NO AI POLISH/u);
assert.doesNotMatch(frontCameraPrompt, /- Camera:/u);

const rightGate = sceneEngine.hardGate(
  rightPose.id,
  rightPose.requires ?? [],
  {
    lightingRequiredFeatures: lampAndPhone.required_features,
    cameraType: "front",
    bedRealismProfile: rightMapping.bedRealismProfile
  }
);
assert.equal(rightGate.passedCount, 1, "Only the actual right-side lamp reference may pass right-side + lamp + selfie feasibility");
assert.equal(rightGate.totalCount, SCENES.length);
assert.deepEqual(rightGate.passed.map((item) => item.scene.id), ["bed_right_nightstand"]);
assert.equal(
  sceneEngine.evaluateHardGate(sceneEngine.getById("vanity_mirror"), rightPose.id, [], {
    cameraType: "front",
    bedRealismProfile: rightMapping.bedRealismProfile
  }).pass,
  false,
  "Mirror reference must fail before ranking for bed lying"
);

const isolatedWrongSceneEngine = new SceneEngine([sceneEngine.getById("vanity_mirror")]);
const strictNoMatch = isolatedWrongSceneEngine.autoSelect({
  poseId: rightPose.id,
  bodyDirection: "toward_lamp",
  cameraAngle: "eye_level",
  cameraDistance: "close",
  cameraType: "front",
  bedRealismProfile: rightMapping.bedRealismProfile
});
assert.equal(strictNoMatch.scene, null, "Hard gate must not choose the least-bad invalid scene");
assert.equal(strictNoMatch.error, "strict_no_match");
assert.equal(strictNoMatch.passedCount, 0);
assert.match(strictNoMatch.message, /لا يوجد مرجع صالح لهذه الوضعية/u);

const rightEngineering = autoEngineeringEngine.engineer({ pose: rightPose, lightingId: "lamp_and_phone" });
assert.equal(rightEngineering.selectedSceneId, "bed_right_nightstand");
assert.equal(rightEngineering.bodyDirection, "toward_lamp");
assert.equal(rightEngineering.cameraType, "front");
assert.equal(rightEngineering.lensType, "front_wide");
assert.equal(rightEngineering.roomMode, "GENERATE");
assert.equal(rightEngineering.clothingId, undefined, "Auto-engineering must never overwrite user-selected clothing");
assert.match(rightEngineering.armFine, /LEFT/u);
assert.match(rightEngineering.physicsFine, /RIGHT shoulder/u);
assert.equal(rightEngineering.selfieViewpoint.holdingHand, "LEFT");
assert.equal(rightEngineering.selfieViewpoint.otherHand, "RIGHT");
assert.equal(rightEngineering.selfieViewpoint.distance, "45–70 cm");
assert.match(rightEngineering.selfieViewpoint.angle, /5–20 degrees/u);
assert.match(rightEngineering.selfieViewpoint.angle, /10–30 degrees/u);
assert.doesNotMatch(rightEngineering.selfieViewpoint.tilt, /Dutch/u);
assert.deepEqual(rightEngineering.bedRealismProfile.cameraDistanceCm, [45, 70]);
assert.deepEqual(rightEngineering.bedRealismProfile.cameraPitchDeg, [5, 20]);
assert.deepEqual(rightEngineering.bedRealismProfile.cameraYawDeg, [10, 30]);
assert.equal(rightEngineering.confidence, "تلقائي صارم — دقة عالية");
assert.equal(rightEngineering.gatePassedCount, 1);
assert.equal(rightEngineering.gateTotalCount, SCENES.length);
assert.match(rightEngineering.gateSummary, /مرشح صارم v1\.3: اجتاز 1 من 8 مرجعًا/u);
assert.equal(rightEngineering.manualOverrideInvalid, false);
assert.equal(rightEngineering.lightingId, "lamp_and_phone");

const bedLeftCompatiblePoses = sceneEngine.getCompatiblePoseIds("bed_left_vanity", QUAD_POSE_IDS);
assert.deepEqual(bedLeftCompatiblePoses, ["lying_back", "lying_stomach", "lying_left_side", "semi_reclining", "sitting_bed_edge"]);
assert.equal(sceneEngine.getSuggestedPoseId("bed_left_vanity", QUAD_POSE_IDS), "lying_left_side");
assert.deepEqual(sceneEngine.getCompatiblePoseIds("chair_area", QUAD_POSE_IDS), []);
assert.equal(sceneEngine.getSuggestedPoseId("chair_area", QUAD_POSE_IDS), null);

const selectedReferenceEngineering = autoEngineeringEngine.engineer({
  pose: rightPose,
  lightingId: "lamp_and_phone",
  sceneOverrideId: "bed_right_nightstand",
  requireSelectedScene: true
});
assert.equal(selectedReferenceEngineering.selectedSceneId, "bed_right_nightstand");
assert.equal(selectedReferenceEngineering.hardGatePassed, true);
assert.equal(selectedReferenceEngineering.userSelectedReference, true);
assert.match(selectedReferenceEngineering.confidence, /مرجع اختاره المستخدم/u);

const waitingForReference = autoEngineeringEngine.engineer({
  pose: rightPose,
  lightingId: "lamp_and_phone",
  requireSelectedScene: true
});
assert.equal(waitingForReference.scene, null);
assert.equal(waitingForReference.strictNoMatch, true);
assert.match(waitingForReference.strictNoMatchMessage, /اختر صورة مرجع الغرفة/u);

const leftPose = poseEngine.getById("lying_left_side");
const leftEngineering = autoEngineeringEngine.engineer({ pose: leftPose, lightingId: "phone_screen_only" });
assert.equal(leftEngineering.selectedSceneId, "bed_left_vanity");
assert.equal(leftEngineering.bodyDirection, "toward_vanity");
assert.match(leftEngineering.armFine, /RIGHT hand/u);
assert.match(leftEngineering.orientation, /LEFT shoulder/u);
assert.equal(leftEngineering.selfieViewpoint.holdingHand, "RIGHT");
assert.equal(leftEngineering.selfieViewpoint.otherHand, "LEFT");
assert.equal(leftEngineering.selfieViewpoint.distance, "45–70 cm");
assert.doesNotMatch(leftEngineering.selfieViewpoint.tilt, /Dutch/u);
assert.equal(leftEngineering.gatePassedCount, 1);
assert.equal(leftEngineering.lightingId, "phone_screen_only");

const leftLampNoMatch = autoEngineeringEngine.engineer({ pose: leftPose, lightingId: "lamp_and_phone" });
assert.equal(leftLampNoMatch.scene, null, "Left-side pose must not silently use a scene without the selected lamp source");
assert.equal(leftLampNoMatch.strictNoMatch, true);
assert.equal(leftLampNoMatch.lightingId, "lamp_and_phone", "Selected lighting must never be silently replaced");
assert.match(leftLampNoMatch.strictNoMatchMessage, /أباجورة/u);

const invalidManualEngineering = autoEngineeringEngine.engineer({
  pose: rightPose,
  lightingId: "ceiling_white",
  sceneOverrideId: "vanity_mirror"
});
assert.equal(invalidManualEngineering.selectedSceneId, "vanity_mirror", "Manual override is retained for explicit review");
assert.equal(invalidManualEngineering.manualOverrideInvalid, true);
assert.equal(invalidManualEngineering.hardGatePassed, false);
assert.match(invalidManualEngineering.confidence, /غير صالح/u);

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
assert.match(rightPoseSections.clothing, /FABRIC REALISM/u);
assert.match(rightPoseSections.clothing, /NON-REPEATING/u);
assert.match(rightPoseSections.clothing, /Folds are load-driven only/u);
assert.match(rightPoseSections.clothing, /same phone-camera pipeline/u);
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
assert.match(rightViewpointLock, /subject's own front-facing phone held in his LEFT hand at 45–70 cm/u);
assert.match(rightViewpointLock, /5–20 degrees of downward pitch/u);
assert.match(rightViewpointLock, /10–30 degrees of yaw/u);
assert.doesNotMatch(rightViewpointLock, /Dutch tilt/u);
assert.match(rightViewpointLock, /Face occupies approximately 40–60% of frame height/u);
assert.match(rightViewpointLock, /third-person observer camera/u);
assert.match(rightViewpointLock, /camera at the foot of the bed/u);
assert.match(rightViewpointLock, /SELFIE DISTANCE CHECK/u);

const backPose = poseEngine.getById("lying_back");
const backEngineering = autoEngineeringEngine.engineer({ pose: backPose, lightingId: "phone_screen_only" });
assert.deepEqual(backEngineering.bedRealismProfile.cameraDistanceCm, [45, 75]);
assert.deepEqual(backEngineering.bedRealismProfile.cameraPitchDeg, [15, 35]);
assert.deepEqual(backEngineering.bedRealismProfile.cameraYawDeg, [-20, 20]);
assert.equal(backEngineering.selfieViewpoint.distance, "45–75 cm");
assert.doesNotMatch(backEngineering.cameraFine, /75–85/u);

const mirrorPose = poseEngine.getById("mirror_selfie");
const mirrorEngineering = autoEngineeringEngine.engineer({ pose: mirrorPose, lightingId: "ceiling_white" });
assert.equal(mirrorEngineering.selectedSceneId, "vanity_mirror");
assert.equal(mirrorEngineering.cameraType, "rear");
assert.equal(mirrorEngineering.bodyDirection, "facing_mirror");
assert.equal(mirrorEngineering.bedRealismProfile, undefined, "Mirror selfie must stay outside the bed-realism engine");
assert.equal(cameraEngine.selfieViewpointLock({
  camera: cameraEngine.getCamera("rear"),
  pose: mirrorPose,
  autoEngineering: mirrorEngineering
}), "", "Rear-camera mirror capture must not receive the front-camera selfie viewpoint lock");

for (const poseId of QUAD_POSE_IDS) {
  const pose = poseEngine.getById(poseId);
  const lightingId = poseId === "mirror_selfie" ? "ceiling_white" : "phone_screen_only";
  const engineered = autoEngineeringEngine.engineer({ pose, lightingId });
  assert.ok(engineered?.scene, `Every Smart Quad pose needs a deterministic scene under a compatible lighting choice: ${poseId}`);
  assert.ok(engineered.hardGatePassed, `Every automatic Smart Quad scene must pass the hard gate: ${poseId}`);
  assert.ok(engineered.cameraType, `Every Smart Quad pose needs a deterministic camera: ${poseId}`);
  assert.ok(engineered.cameraFine, `Every Smart Quad pose needs fine camera geometry: ${poseId}`);
  assert.ok(engineered.armFine, `Every Smart Quad pose needs deterministic arm geometry: ${poseId}`);
  if (engineered.cameraType === "front") {
    assert.ok(engineered.selfieViewpoint, `Every front-camera Smart Quad pose needs a deterministic selfie viewpoint profile: ${poseId}`);
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
    imageA: { name: "identity.jpg" }
  }
};

const validResult = validator.validate(baseConfig);
assert.equal(validResult.valid, true, "Deterministic right-side v1.3 configuration must pass validation");
assert.equal(validResult.warnings.some((issue) => issue.type === "image_b_missing"), false, "Automatic IMAGE B selection must never request an upload");
const automaticReferencePrompt = promptEngine.generate(baseConfig);
assert.match(automaticReferencePrompt, /user-selected built-in room reference/u);
assert.doesNotMatch(automaticReferencePrompt, /the attached IMAGE B room photograph/u);

const invalidManualConfig = {
  ...baseConfig,
  scene: sceneEngine.getById("vanity_mirror"),
  selectedSceneId: "vanity_mirror",
  cameraAngle: invalidManualEngineering.cameraAngle,
  cameraDistance: invalidManualEngineering.cameraDistance,
  lighting: lightingEngine.getById(invalidManualEngineering.lightingId),
  autoEngineering: invalidManualEngineering,
  uploads: {
    imageA: { name: "identity.jpg" },
    imageB: { name: "vanity_mirror.jpg" }
  }
};
const invalidManualResult = validator.validate(invalidManualConfig);
assert.equal(invalidManualResult.valid, false);
assert.ok(invalidManualResult.conflicts.some((issue) => issue.type === "reference_pose_mismatch"));
const invalidManualPrompt = promptEngine.generate(invalidManualConfig);
assert.match(invalidManualPrompt, /^CHATGPT IMAGE TASK/u);
assert.doesNotMatch(invalidManualPrompt, /التجاوز اليدوي|مرجع غير صالح/u);

const editBedSelfieResult = validator.validate({ ...baseConfig, roomMode: "EDIT" });
assert.equal(editBedSelfieResult.valid, false);
assert.ok(editBedSelfieResult.conflicts.some((issue) => issue.type === "bed_selfie_requires_generate"));

const wrongLensResult = validator.validate({ ...baseConfig, lens: cameraEngine.getLens("rear_portrait") });
assert.equal(wrongLensResult.valid, false);
assert.ok(wrongLensResult.conflicts.some((issue) => issue.type === "camera_lens_conflict"));

const physicsAxes = ["Gravity:", "Compression:", "Light:", "Mirrors:", "Materials:", "Anatomy:", "Camera:", "Clutter:"];
assert.equal(AUTHORITY_HIERARCHY[0]?.id, "physics", "Master physics must have the highest authority priority");
for (const axis of physicsAxes) {
  assert.ok(PHYSICS_CONTRACT.includes(axis), `Physics contract must define ${axis}`);
}
for (const bedroomScene of SCENES) {
  const bedroomPrompt = promptEngine.generate({
    ...baseConfig,
    scene: bedroomScene,
    selectedSceneId: bedroomScene.id,
    autoEngineering: { ...baseConfig.autoEngineering, selectedSceneId: bedroomScene.id }
  });
  const poseIndex = bedroomPrompt.indexOf("[POSE]");
  const physicsIndex = bedroomPrompt.indexOf("[BEDROOM PHYSICS]");
  const lightingIndex = bedroomPrompt.indexOf("[LIGHTING]");
  assert.ok(
    poseIndex >= 0 && poseIndex < physicsIndex && physicsIndex < lightingIndex,
    `Physics contract must remain directly after [POSE] and before [LIGHTING]: ${bedroomScene.id}`
  );
  for (const axis of physicsAxes) {
    assert.ok(bedroomPrompt.includes(axis), `Bedroom prompt must include ${axis}: ${bedroomScene.id}`);
  }
}

const prompt = promptEngine.generate(baseConfig);
assert.match(prompt, /^CHATGPT IMAGE TASK/u);
assert.match(prompt, /LIGHTING REALISM \(anti-AI\)/u);
assert.match(prompt, /\[Camera Emulator\]: Xiaomi 15 Ultra - Front-Facing Camera/u);
assert.match(prompt, /SELFIE VIEWPOINT LOCK — HIGHEST PRIORITY FOR CAMERA GEOMETRY/u);
assert.match(prompt, /IMAGE A — IDENTITY ONLY/u);
assert.match(prompt, /IMAGE B — ROOM ONLY/u);
assert.match(prompt, /BED SPATIAL MAP/u);
assert.match(prompt, /BODY FIRST, CAMERA SECOND/u);
assert.match(prompt, /TRUE LATERAL ENFORCEMENT — NON-NEGOTIABLE/u);
assert.match(prompt, /UPPER LEFT hand is the ONLY selfie hand/u);
assert.match(prompt, /LOWER RIGHT arm/u);
assert.match(prompt, /EXPRESSION LOCK/u);
assert.match(prompt, /CLOTHING LOCK/u);
assert.match(prompt, /FABRIC REALISM/u);
assert.match(prompt, /LAMP SIDE: RIGHT/u);
assert.match(prompt, /45–70 cm/u);
assert.match(prompt, /5–20 degrees/u);
assert.match(prompt, /10–30 degrees/u);
assert.doesNotMatch(prompt, /clockwise Dutch tilt|25–35 degrees/u);
assert.match(prompt, /third-person view, observer camera, wide room shot/u);
assert.match(prompt, /NEGATIVE PROMPT/u);
assert.match(prompt, /Return only the final image/u);
assert.ok(
  prompt.indexOf("CHATGPT IMAGE TASK") < prompt.indexOf("SELFIE VIEWPOINT LOCK — HIGHEST PRIORITY FOR CAMERA GEOMETRY")
  && prompt.indexOf("SELFIE VIEWPOINT LOCK — HIGHEST PRIORITY FOR CAMERA GEOMETRY") < prompt.indexOf("PROMPT ENGINEERING POLICY"),
  "Selfie viewpoint lock must remain immediately after the task"
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
assert.match(leftPrompt, /front-facing phone held in his RIGHT hand at 45–70 cm/u);
assert.match(leftPrompt, /5–20 degrees of downward pitch/u);
assert.match(leftPrompt, /10–30 degrees of yaw/u);
assert.doesNotMatch(leftPrompt, /counterclockwise Dutch tilt/u);
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
assert.doesNotMatch(indexHTML, /id="cameraSelect"|id="angleSelect"|id="distanceSelect"|id="roomModeSelect"/u, "v1.3 UI must keep engineering controls hidden");

const appJS = readFileSync(resolve(projectRoot, "js/app.js"), "utf8");
assert.match(appJS, /document\.createElement\("optgroup"\)/u);
assert.match(appJS, /LIGHTING_CATEGORY_LABELS/u);
assert.match(appJS, /populateLightingSelect/u);
assert.doesNotMatch(appJS, /derivedFields = \[[\s\S]*"clothingId"/u, "Auto-engineered fields must not overwrite clothing");
assert.match(appJS, /selectReference\(sceneId/u);
assert.match(appJS, /getCompatiblePoseIds/u);
assert.match(appJS, /requireSelectedScene: true/u);
assert.match(appJS, /مرشح صارم/u);

const promptDisplayJS = readFileSync(resolve(projectRoot, "js/ui/promptDisplay.js"), "utf8");
assert.match(promptDisplayJS, /تحذير المرجع/u);
assert.match(promptDisplayJS, /summary-item--warning/u);

const changelog = readFileSync(resolve(projectRoot, "CHANGELOG.md"), "utf8");
assert.match(changelog, /## v1\.6 — 2026-08-25/u);
assert.match(changelog, /Camera Emulator/u);
assert.match(changelog, /LIGHTING REALISM/u);
assert.match(changelog, /## v1\.4 — 2026-08-25/u);
assert.match(changelog, /reference-first selection/u);
assert.match(changelog, /## v1\.3\.1 — 2026-08-25/u);
assert.match(changelog, /automatic room-reference selection/u);
assert.match(changelog, /## v1\.3 — 2026-08-25/u);
assert.match(changelog, /45–70 cm/u);
assert.match(changelog, /portable-light/u);
assert.match(changelog, /SELFIE BEDROOM REALISM ENGINE/u);
assert.match(changelog, /## v1\.2 — 2026-08-25/u);
assert.match(changelog, /reference_pose_mismatch/u);
assert.match(changelog, /## v1\.1 — 2026-08-25/u);
assert.match(changelog, /FABRIC REALISM/u);

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

console.log("✓ permanent bedroom Master Physics Rule regression tests passed");
console.log("✓ expanded daylight lighting realism and Camera Emulator tests passed");
console.log("✓ Smart Quad deterministic mapping tests passed");
console.log("✓ v1.3 bedroom realism camera geometry tests passed");
console.log("✓ v1.3 scene + selfie feasibility + lighting hard-gate tests passed");
console.log("✓ Portable phone-screen lighting tests passed");
console.log("✓ True lateral anatomy and reference-lock tests passed");
console.log("✓ Selfie viewpoint lock and framing tests passed");
console.log("✓ Clothing and fabric-realism tests passed");
console.log("✓ Reference-first room and compatible-pose tests passed");
console.log("✓ Validator tests passed");
console.log("✓ Prompt generation and static integrity tests passed");
