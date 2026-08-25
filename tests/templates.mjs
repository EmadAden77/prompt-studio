import assert from "node:assert/strict";
import { SCENES } from "../js/data/scenesData.js";
import { POSES } from "../js/data/posesData.js";
import { LIGHTING_OPTIONS } from "../js/data/lightingData.js";
import { CLOTHING_OPTIONS } from "../js/data/clothingData.js";
import { EXPRESSION_OPTIONS } from "../js/data/expressionsData.js";
import { HAIR_OPTIONS } from "../js/data/hairData.js";
import {
  TEMPLATE_PRESETS,
  TEMPLATE_GROUP_LABELS,
  validateTemplatePreset,
  isTemplateCompatibleWithScene,
  resolveTemplateLighting
} from "../js/templates.js";
import { CAMERA_SPECS, LENSES, SELFIE_ARM_STRATEGIES } from "../js/data/cameraData.js";
import { CameraEngine } from "../js/engines/cameraEngine.js";

assert.ok(TEMPLATE_PRESETS.length >= 10, "Template library should cover the major bedroom pose families");
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
    const lightingId = resolveTemplateLighting(template, scene);
    assert.ok(lightingId, `Template must resolve a physical lighting source for ${scene.id}`);
    const lighting = LIGHTING_OPTIONS.find((item) => item.id === lightingId);
    assert.ok((lighting.required_features ?? []).every((feature) => scene.visible_features.includes(feature)));
  }
}

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

console.log("✓ v1.11 scene-aware template presets passed");
console.log("✓ v1.11 mirror-selfie rear-camera path passed");
