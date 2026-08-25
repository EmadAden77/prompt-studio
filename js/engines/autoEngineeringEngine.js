import { BED_SPATIAL_MAP, QUAD_DEFAULTS, QUAD_POSE_ENGINEERING } from "../data/quadModeData.js";

export class AutoEngineeringEngine {
  constructor({ sceneEngine, lightingEngine }) {
    this.sceneEngine = sceneEngine;
    this.lightingEngine = lightingEngine;
  }

  getPoseEngineering(poseId) {
    return QUAD_POSE_ENGINEERING[poseId] ?? null;
  }

  resolveScene(engineering, sceneOverrideId = null) {
    if (sceneOverrideId) {
      const scene = this.sceneEngine.getById(sceneOverrideId);
      if (scene) return { scene, overridden: true };
    }

    const preferred = this.sceneEngine.getById(engineering.preferredSceneId);
    if (preferred) return { scene: preferred, overridden: false };

    const fallback = this.sceneEngine.autoSelect({
      poseId: engineering.poseId,
      bodyDirection: engineering.bodyDirection,
      cameraAngle: engineering.cameraAngle,
      cameraDistance: engineering.cameraDistance,
      requiredFeatures: engineering.requires ?? []
    });
    return { scene: fallback.scene ?? null, overridden: false };
  }

  compatibleLighting(scene, cameraType) {
    if (!scene) return [];
    return this.lightingEngine.options.filter((option) => {
      if (this.lightingEngine.getMissingFeatures(option, scene).length) return false;
      if (cameraType === "rear" && option.id === "phone_screen_only") return false;
      return true;
    });
  }

  engineer({ pose, lightingId, sceneOverrideId = null }) {
    const mapping = this.getPoseEngineering(pose?.id);
    if (!pose || !mapping) return null;

    const engineering = {
      ...mapping,
      poseId: pose.id,
      requires: pose.requires ?? [],
      clothingId: QUAD_DEFAULTS.clothingId,
      spatialMap: BED_SPATIAL_MAP
    };

    const { scene, overridden } = this.resolveScene(engineering, sceneOverrideId);
    const compatibleLighting = this.compatibleLighting(scene, engineering.cameraType);
    const selectedLighting = compatibleLighting.find((option) => option.id === lightingId)
      ?? compatibleLighting[0]
      ?? this.lightingEngine.getById(lightingId);

    const sceneReason = overridden
      ? "Manual scene override retained, then checked against deterministic pose geometry."
      : `Deterministic match: pose ${pose.id} → body orientation → camera geometry → ${scene?.id ?? "no scene"}.`;

    return {
      ...engineering,
      selectedSceneId: scene?.id ?? null,
      scene,
      sceneOverrideId: overridden ? sceneOverrideId : null,
      lightingId: selectedLighting?.id ?? lightingId,
      compatibleLightingIds: compatibleLighting.map((option) => option.id),
      confidence: overridden ? "اختيار يدوي — تحت الفحص" : "تلقائي — دقة عالية",
      sceneReason
    };
  }

  buildSpatialPrompt(engineering) {
    if (!engineering) return "";
    const map = engineering.spatialMap;
    return [
      "BED SPATIAL MAP AND SIDE REFERENCE",
      `- Fixed side rule: ${map.frame_rule}`,
      `- Head direction: ${map.head_direction}.`,
      `- Foot direction: ${map.foot_direction}.`,
      `- Subject's RIGHT side: ${map.person_right_side}.`,
      `- Subject's LEFT side: ${map.person_left_side}.`,
      `- LAMP SIDE: ${map.lamp_side}.`,
      `- VANITY SIDE: ${map.vanity_side}.`,
      `- Window/daylight: ${map.window_daylight}.`,
      `- Pillow rule: ${map.pillows}.`,
      `- IMAGE B camera rule: ${map.image_b_camera_rule}.`,
      `- Ambiguity rule: ${map.ambiguity_rule}.`,
      "Always describe sides relative to the subject's own body, never as left/right of the rendered image."
    ].join("\n");
  }
}
