import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { POSES, POSE_GROUP_IDS } from "../js/data/posesData.js";
import { SCENES } from "../js/data/scenesData.js";
import { LIGHTING_OPTIONS } from "../js/data/lightingData.js";
import { SceneEngine } from "../js/engines/sceneEngine.js";
import { LightingEngine } from "../js/engines/lightingEngine.js";
import { AutoEngineeringEngine } from "../js/engines/autoEngineeringEngine.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sceneEngine = new SceneEngine(SCENES);
const lightingEngine = new LightingEngine(LIGHTING_OPTIONS);
const autoEngineeringEngine = new AutoEngineeringEngine({ sceneEngine, lightingEngine });
const poseById = Object.fromEntries(POSES.map((pose) => [pose.id, pose]));

const NEW_FAMILY_POSE_IDS = Object.freeze([
  ...POSE_GROUP_IDS.sitting,
  "standing_center",
  "standing_bedside",
  "standing_sofa",
  "standing_vanity",
  "standing_wardrobe"
]);

export function libraryCoverageReport(poseIds = NEW_FAMILY_POSE_IDS) {
  return poseIds.map((poseId) => {
    const pose = poseById[poseId];
    assert.ok(pose, `Pose metadata missing: ${poseId}`);

    const mapping = autoEngineeringEngine.getPoseEngineering(poseId);
    assert.ok(mapping, `Auto-engineering mapping missing: ${poseId}`);

    const gate = sceneEngine.hardGate(
      poseId,
      pose.requires ?? [],
      {
        lightingRequiredFeatures: [],
        cameraType: mapping.cameraType,
        bedRealismProfile: mapping.bedRealismProfile ?? null
      }
    );

    const validScenes = gate.passed.map(({ scene }) => scene);
    const localScenes = validScenes.filter((scene) => existsSync(resolve(projectRoot, scene.image_url)));

    return {
      poseId,
      family: poseId.startsWith("sitting") ? "sitting" : "standing",
      validSceneCount: validScenes.length,
      localImageCount: localScenes.length,
      sceneIds: localScenes.map((scene) => scene.id)
    };
  });
}

const report = libraryCoverageReport();
for (const row of report) {
  assert.ok(row.validSceneCount > 0, `ZERO valid references for ${row.poseId}; do not invent a scene reference`);
  assert.ok(row.localImageCount > 0, `No local scene image exists for ${row.poseId}; request a real reference image instead of inventing one`);
  console.log(`[libraryCoverageReport] ${row.poseId}: ${row.localImageCount} local valid reference(s) -> ${row.sceneIds.join(", ")}`);
}

const expectedPrimaryCoverage = {
  sitting_sofa: "sofa_area",
  sitting_chair: "chair_area",
  sitting_floor: "room_center",
  standing_center: "room_center",
  standing_bedside: "bed_front_overview",
  standing_sofa: "sofa_area",
  standing_vanity: "vanity_mirror",
  standing_wardrobe: "wardrobe_area"
};

for (const [poseId, expectedSceneId] of Object.entries(expectedPrimaryCoverage)) {
  const pose = poseById[poseId];
  const engineered = autoEngineeringEngine.engineer({
    pose,
    lightingId: "phone_screen_only"
  });
  assert.ok(engineered?.scene, `Automatic scene selection failed for ${poseId}`);
  assert.equal(engineered.scene.id, expectedSceneId, `Unexpected primary reference for ${poseId}`);
}

console.log("✓ libraryCoverageReport: sitting and standing families have real local scene coverage");
