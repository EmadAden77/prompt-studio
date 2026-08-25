import { BED_SPATIAL_MAP, QUAD_POSE_ENGINEERING } from "../data/quadModeData.js";

export class AutoEngineeringEngine {
  constructor({ sceneEngine, lightingEngine }) {
    this.sceneEngine = sceneEngine;
    this.lightingEngine = lightingEngine;
  }

  getPoseEngineering(poseId) {
    return QUAD_POSE_ENGINEERING[poseId] ?? null;
  }

  resolveScene(engineering, sceneOverrideId = null) {
    const selectionConfig = {
      poseId: engineering.poseId,
      bodyDirection: engineering.bodyDirection,
      cameraAngle: engineering.cameraAngle,
      cameraDistance: engineering.cameraDistance,
      requiredFeatures: engineering.requires ?? []
    };

    if (sceneOverrideId) {
      const scene = this.sceneEngine.getById(sceneOverrideId);
      if (scene) {
        const manual = this.sceneEngine.evaluateManualSelection(scene, selectionConfig);
        const gateStats = this.sceneEngine.hardGate(engineering.poseId, engineering.requires ?? []);
        const requiredText = this.sceneEngine.formatRequiredFeatures(manual.gate?.missingFeatures ?? []);
        return {
          scene,
          overridden: true,
          manualOverrideInvalid: !manual.hardGatePassed,
          hardGatePassed: manual.hardGatePassed,
          confidence: manual.hardGatePassed
            ? "تجاوز يدوي — اجتاز البوابة"
            : "⚠ تجاوز يدوي — مرجع غير صالح",
          reasons: manual.reasons,
          gateSummary: `مرشح صارم: اجتاز ${gateStats.passedCount} من ${gateStats.totalCount} مرجعًا`,
          passedCount: gateStats.passedCount,
          totalCount: gateStats.totalCount,
          requiredFeatures: gateStats.requirement.required_features_all,
          requiredMessage: manual.hardGatePassed
            ? ""
            : `التجاوز اليدوي لا يطابق الوضعية${requiredText ? ` — العناصر الناقصة: ${requiredText}` : ""}`
        };
      }
    }

    const automatic = this.sceneEngine.autoSelect(selectionConfig);
    return {
      scene: automatic.scene ?? null,
      overridden: false,
      manualOverrideInvalid: false,
      hardGatePassed: Boolean(automatic.scene),
      confidence: automatic.confidence ?? "غير متاح",
      reasons: automatic.reasons ?? [],
      gateSummary: automatic.gateSummary ?? "",
      passedCount: automatic.passedCount ?? 0,
      totalCount: automatic.totalCount ?? this.sceneEngine.scenes.length,
      requiredFeatures: automatic.requiredFeatures ?? [],
      requiredMessage: automatic.message ?? "",
      error: automatic.error ?? null
    };
  }

  compatibleLighting(scene, cameraType) {
    if (!scene) return [];
    return this.lightingEngine.options.filter((option) => {
      if (this.lightingEngine.getMissingFeatures(option, scene).length) return false;
      if (cameraType === "rear" && option.id === "phone_screen_only") return false;
      return true;
    });
  }

  normalizeGeometry(pose, scene, mapping) {
    const sharedAngles = scene
      ? pose.valid_angles.filter((angle) => scene.camera_angles.includes(angle))
      : pose.valid_angles;
    const sharedDistances = scene
      ? pose.valid_distances.filter((distance) => scene.camera_distances.includes(distance))
      : pose.valid_distances;

    return {
      cameraAngle: sharedAngles.includes(mapping.cameraAngle)
        ? mapping.cameraAngle
        : sharedAngles[0] ?? pose.valid_angles[0],
      cameraDistance: sharedDistances.includes(mapping.cameraDistance)
        ? mapping.cameraDistance
        : sharedDistances[0] ?? pose.valid_distances[0]
    };
  }

  engineer({ pose, lightingId, sceneOverrideId = null }) {
    const mapping = this.getPoseEngineering(pose?.id);
    if (!pose || !mapping) return null;

    const baseEngineering = {
      ...mapping,
      poseId: pose.id,
      requires: pose.requires ?? [],
      spatialMap: BED_SPATIAL_MAP
    };

    const selection = this.resolveScene(baseEngineering, sceneOverrideId);
    const geometry = this.normalizeGeometry(pose, selection.scene, mapping);
    const engineering = { ...baseEngineering, ...geometry };
    const compatibleLighting = this.compatibleLighting(selection.scene, engineering.cameraType);
    const selectedLighting = compatibleLighting.find((option) => option.id === lightingId)
      ?? compatibleLighting[0]
      ?? this.lightingEngine.getById(lightingId);

    const sceneReason = selection.overridden
      ? (selection.manualOverrideInvalid
        ? "تجاوز يدوي: المرجع محفوظ رغم فشله في البوابة الصارمة، والـValidator سيحجبه."
        : "تجاوز يدوي: المرجع اجتاز البوابة الصارمة ثم خضع للفحص.")
      : (selection.scene
        ? "اختيار تلقائي صارم: البوابة Pass/Fail نُفذت أولًا، ثم تمت المفاضلة بين المراجع الناجحة فقط."
        : selection.requiredMessage);

    return {
      ...engineering,
      selectedSceneId: selection.scene?.id ?? null,
      scene: selection.scene,
      sceneOverrideId: selection.overridden ? sceneOverrideId : null,
      lightingId: selectedLighting?.id ?? lightingId,
      compatibleLightingIds: compatibleLighting.map((option) => option.id),
      confidence: selection.confidence,
      sceneReason,
      sceneSelectionReasons: selection.reasons,
      gateSummary: selection.gateSummary,
      gatePassedCount: selection.passedCount,
      gateTotalCount: selection.totalCount,
      strictRequiredFeatures: selection.requiredFeatures,
      strictNoMatch: !selection.scene && Boolean(selection.error),
      strictNoMatchMessage: !selection.scene ? selection.requiredMessage : "",
      hardGatePassed: selection.hardGatePassed,
      manualOverrideInvalid: selection.manualOverrideInvalid
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
