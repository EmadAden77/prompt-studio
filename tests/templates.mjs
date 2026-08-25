import assert from "node:assert/strict";
import { SCENES } from "../js/data/scenesData.js";
import { POSES } from "../js/data/posesData.js";
import { LIGHTING_OPTIONS } from "../js/data/lightingData.js";
import { CLOTHING_OPTIONS } from "../js/data/clothingData.js";
import { EXPRESSION_OPTIONS } from "../js/data/expressionsData.js";
import { HAIR_OPTIONS } from "../js/data/hairData.js";
import {
  TEMPLATE_PRESETS,
  TEMPLATE_BY_ID,
  TEMPLATE_GROUP_LABELS,
  validateTemplatePreset,
  isTemplateCompatibleWithScene,
  resolveTemplateLighting,
  sceneSupportsTemplateRequirements
} from "../js/templates.js";
import { CAMERA_SPECS, LENSES, SELFIE_ARM_STRATEGIES } from "../js/data/cameraData.js";
import { CameraEngine } from "../js/engines/cameraEngine.js";

assert.ok(TEMPLATE_PRESETS.length >= 18, "Template library should cover the major bedroom pose families and expanded standing treatments");
assert.equal(new Set(TEMPLATE_PRESETS.map((item) => item.id)).size, TEMPLATE_PRESETS.length, "Template IDs must be unique");
assert.deepEqual(Object.keys(TEMPLATE_GROUP_LABELS), ["bed", "sitting", "standing", "mirror"]);

const poseIds = new Set(POSES.map((item) => item.id));
const lightingIds = new Set(LIGHTING_OPTIONS.map((item) => item.id));
const clothingIds = new Set(CLOTHING_OPTIONS.map((item) => item.id));
const expressionIds = new Set(EXPRESSION_OPTIONS.map((item) => item.id));
const hairIds = new Set(HAIR_OPTIONS.map((item) => item.id));

for (const template of TEMPLATE_PRESETS) {
  assert.ok(validateTemplatePreset(template), `Template metadata must be valid: ${template.id}`);
  assert.ok(poseIds.has(template.poseId));
  assert.ok(clothingIds.has(template.clothingId));
  assert.ok(expressionIds.has(template.expressionId));
  assert.ok(hairIds.has(template.hairId));
  assert.ok(template.lightingIds.every((id) => lightingIds.has(id)));

  const compatibleScenes = SCENES.filter((scene) => isTemplateCompatibleWithScene(template, scene));
  assert.ok(compatibleScenes.length > 0, `Template must have at least one real compatible scene: ${template.id}`);
  for (const scene of compatibleScenes) {
    assert.ok(sceneSupportsTemplateRequirements(template, scene));
    const lightingId = resolveTemplateLighting(template, scene);
    assert.ok(lightingId, `Template must resolve a physical lighting source for ${scene.id}`);
    const lighting = LIGHTING_OPTIONS.find((item) => item.id === lightingId);
    assert.ok((lighting.required_features ?? []).every((feature) => scene.visible_features.includes(feature)));
  }
}

const requiredStandingTemplateIds = [
  "standing_center_relaxed",
  "standing_bedside_hand_rest",
  "standing_sofa_rest",
  "standing_wardrobe_choose",
  "standing_wall_lean",
  "standing_low_angle_power",
  "standing_phone_above_head",
  "standing_window_sidelight",
  "standing_walk_pause"
];
for (const id of requiredStandingTemplateIds) {
  const template = TEMPLATE_BY_ID[id];
  assert.ok(template, `Required v1.12 standing template missing: ${id}`);
  assert.equal(template.group, "standing");
  assert.match(template.promptBlock, /STANDING TEMPLATE — SELECTED PRESET ONLY/u);
  assert.match(template.promptBlock, /POSE:/u);
  assert.match(template.promptBlock, /GROUNDING:/u);
  assert.match(template.promptBlock, /ARM:/u);
  assert.match(template.promptBlock, /CAMERA:/u);
}

assert.deepEqual(TEMPLATE_BY_ID.standing_bedside_hand_rest.requiresAll, ["bed", "mattress_edge"]);
assert.deepEqual(TEMPLATE_BY_ID.standing_sofa_rest.requiresAny, ["sofa_armrest", "sofa_back"]);
assert.deepEqual(TEMPLATE_BY_ID.standing_wardrobe_choose.requiresAll, ["wardrobe", "wardrobe_doors"]);
assert.deepEqual(TEMPLATE_BY_ID.standing_window_sidelight.requiresAll, ["daylight_access"]);
assert.equal(TEMPLATE_BY_ID.standing_low_angle_power.requiresCameraAngle, "low_angle");
assert.equal(TEMPLATE_BY_ID.standing_phone_above_head.requiresCameraAngle, "high_angle");
assert.equal(TEMPLATE_BY_ID.standing_wardrobe_choose.cameraOverride.holdingHand, "LEFT");
assert.equal(TEMPLATE_BY_ID.standing_wardrobe_choose.cameraOverride.otherHand, "RIGHT");
assert.match(TEMPLATE_BY_ID.standing_wall_lean.promptBlock, /Do not force a shoe sole flat against the wall/u);
assert.match(TEMPLATE_BY_ID.standing_walk_pause.promptBlock, /very small step/u);
assert.match(TEMPLATE_BY_ID.standing_phone_above_head.promptBlock, /Distortion is mild and restricted to outer frame regions/u);

const roomCenter = SCENES.find((scene) => scene.id === "room_center");
assert.ok(isTemplateCompatibleWithScene(TEMPLATE_BY_ID.standing_wall_lean, roomCenter));
assert.ok(isTemplateCompatibleWithScene(TEMPLATE_BY_ID.standing_low_angle_power, roomCenter));
assert.ok(isTemplateCompatibleWithScene(TEMPLATE_BY_ID.standing_phone_above_head, roomCenter));
assert.ok(isTemplateCompatibleWithScene(TEMPLATE_BY_ID.standing_window_sidelight, roomCenter));

const wardrobeScene = SCENES.find((scene) => scene.id === "wardrobe_area");
assert.ok(isTemplateCompatibleWithScene(TEMPLATE_BY_ID.standing_wardrobe_choose, wardrobeScene));
assert.match(TEMPLATE_BY_ID.standing_wardrobe_choose.promptBlock, /Never invent a handle/u);

const mirrorTemplate = TEMPLATE_PRESETS.find((item) => item.poseId === "mirror_selfie");
assert.ok(mirrorTemplate, "Mirror selfie template must exist");
assert.doesNotMatch(mirrorTemplate.lightingIds.join(","), /phone_screen_only/u, "Rear-camera mirror template must not use the front-facing phone screen as the sole face light");

const cameraEngine = new CameraEngine(CAMERA_SPECS, LENSES, SELFIE_ARM_STRATEGIES);
const mirrorPose = POSES.find((item) => item.id === "mirror_selfie");
const mirrorPrompt = cameraEngine.buildPrompt({
  camera: cameraEngine.getCamera("rear"),
  lens: cameraEngine.getLens("rear_standard"),
  pose: mirrorPose,
  cameraAngle: "eye_level",
  cameraDistance: "medium"
});
assert.match(mirrorPrompt, /MIRROR SELFIE CAMERA — REAR CAMERA, SUBJECT-HELD/u);
assert.match(mirrorPrompt, /subject himself/u);
assert.match(mirrorPrompt, /one physically consistent subject → mirror → rear-camera ray path/u);
assert.doesNotMatch(mirrorPrompt, /another person or a stable tripod operates/u);

console.log("✓ v1.12 scene-gated standing template presets passed");
console.log("✓ v1.12 camera-driven standing template metadata passed");
console.log("✓ v1.11 mirror-selfie rear-camera path passed");
