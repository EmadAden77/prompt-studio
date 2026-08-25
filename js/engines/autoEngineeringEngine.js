import { BED_SPATIAL_MAP, QUAD_POSE_ENGINEERING } from "../data/quadModeData.js";

export class AutoEngineeringEngine {
  constructor({ sceneEngine, lightingEngine }) {
    this.sceneEngine = sceneEngine;
    this.lightingEngine = lightingEngine;
  }

  getPoseEngineering(poseId) {
    return QUAD_POSE_ENGINEERING[poseId] ?? null;
  }

  resolveScene(engineering, lighting, sceneOverrideId = null, { requireSelectedScene = false } = {}) {
    const selectionConfig = {
      poseId: engineering.poseId,
      bodyDirection: engineering.bodyDirection,
      cameraAngle: engineering.cameraAngle,
      cameraDistance: engineering.cameraDistance,
      requiredFeatures: engineering.requires ?? [],
      lightingRequiredFeatures: lighting?.required_features ?? [],
      cameraType: engineering.cameraType,
      bedRealismProfile: engineering.bedRealismProfile ?? null
    };

    if (sceneOverrideId) {
      const scene = this.sceneEngine.getById(sceneOverrideId);
      if (scene) {
        const manual = this.sceneEngine.evaluateManualSelection(scene, selectionConfig);
        const gateStats = this.sceneEngine.hardGate(
          engineering.poseId,
          engineering.requires ?? [],
          {
            lightingRequiredFeatures: lighting?.required_features ?? [],
            cameraType: engineering.cameraType,
            bedRealismProfile: engineering.bedRealismProfile ?? null
          }
        );
        const missing = [
          ...(manual.gate?.missingFeatures ?? []),
          ...(manual.gate?.missingLightingFeatures ?? [])
        ];
        const requiredText = this.sceneEngine.formatRequiredFeatures(missing);
        return {
          scene,
          overridden: true,
          manualOverrideInvalid: !manual.hardGatePassed,
          hardGatePassed: manual.hardGatePassed,
          userSelected: true,
          confidence: manual.hardGatePassed
            ? "مرجع اختاره المستخدم — اجتاز بوابة v1.3"
            : "⚠ مرجع اختاره المستخدم — غير صالح",
          reasons: manual.reasons,
          gateSummary: `مرشح صارم v1.3: اجتاز ${gateStats.passedCount} من ${gateStats.totalCount} مرجعًا`,
          passedCount: gateStats.passedCount,
          totalCount: gateStats.totalCount,
          requiredFeatures: gateStats.requirement.required_features_all,
          lightingRequiredFeatures: gateStats.lightingRequiredFeatures,
          requiredMessage: manual.hardGatePassed
            ? ""
            : `التجاوز اليدوي لا يطابق بوابة v1.3${requiredText ? ` — العناصر/المصادر الناقصة: ${requiredText}` : ""}`
        };
      }
    }

    if (requireSelectedScene) {
      return {
        scene: null,
        overridden: false,
        userSelected: false,
        manualOverrideInvalid: false,
        hardGatePassed: false,
        confidence: "بانتظار اختيار المرجع",
        reasons: [],
        gateSummary: "مرجع الغرفة: بانتظار اختيارك",
        passedCount: 0,
        totalCount: this.sceneEngine.scenes.length,
        requiredFeatures: [],
        lightingRequiredFeatures: [],
        requiredMessage: "اختر صورة مرجع الغرفة أولًا؛ سيقترح لك التطبيق الوضعية المناسبة تلقائيًا.",
        error: "reference_required"
      };
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
      lightingRequiredFeatures: automatic.lightingRequiredFeatures ?? [],
      requiredMessage: automatic.message ?? "",
      error: automatic.error ?? null
    };
  }

  compatibleLighting(scene, cameraType) {
    if (!scene) return [];
    // Keep the full user lighting catalog visible. Scene compatibility must never
    // silently remove or replace a user lighting choice. The validator/hard gate
    // may still flag a physically unsupported room source after the user selects it.
    // Rear-camera capture keeps the one genuine optical exception: the phone screen
    // faces away from the subject and cannot be the sole face light.
    return this.lightingEngine.options.filter((option) => {
      if (cameraType === "rear" && option.id === "phone_screen_only") return false;
      return true;
    });
  }

  normalizeGeometry(pose, scene, mapping) {
    // True bed selfies use IMAGE B as room-geometry authority, not as an immutable external camera plate.
    if (mapping.bedRealismProfile) {
      return {
        cameraAngle: pose.valid_angles.includes(mapping.cameraAngle)
          ? mapping.cameraAngle
          : pose.valid_angles[0],
        cameraDistance: pose.valid_distances.includes(mapping.cameraDistance)
          ? mapping.cameraDistance
          : pose.valid_distances[0]
      };
    }

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

  engineer({ pose, lightingId, sceneOverrideId = null, requireSelectedScene = false }) {
    const mapping = this.getPoseEngineering(pose?.id);
    if (!pose || !mapping) return null;

    const requestedLighting = this.lightingEngine.getById(lightingId);
    const baseEngineering = {
      ...mapping,
      poseId: pose.id,
      requires: pose.requires ?? [],
      spatialMap: BED_SPATIAL_MAP
    };

    const selection = this.resolveScene(baseEngineering, requestedLighting, sceneOverrideId, { requireSelectedScene });
    const geometry = this.normalizeGeometry(pose, selection.scene, mapping);
    const engineering = { ...baseEngineering, ...geometry };
    const compatibleLighting = this.compatibleLighting(selection.scene, engineering.cameraType);

    const sceneReason = selection.overridden
      ? (selection.manualOverrideInvalid
        ? "المرجع الذي اخترته لا يجتاز بوابة v1.3، والـValidator سيحجبه."
        : "المرجع الذي اخترته اجتاز بوابة v1.3 ثم خضع للفحص.")
      : (selection.scene
        ? "اختيار تلقائي صارم v1.3: دعم الوضعية وهندسة السرير وقابلية السيلفي والإضاءة فُحصت قبل أي مفاضلة."
        : selection.requiredMessage);

    return {
      ...engineering,
      selectedSceneId: selection.scene?.id ?? null,
      scene: selection.scene,
      sceneOverrideId: selection.overridden ? sceneOverrideId : null,
      userSelectedReference: Boolean(selection.userSelected),
      lightingId: requestedLighting?.id ?? lightingId,
      compatibleLightingIds: compatibleLighting.map((option) => option.id),
      portableLightSources: requestedLighting?.portable_sources ?? [],
      confidence: selection.confidence,
      sceneReason,
      sceneSelectionReasons: selection.reasons,
      gateSummary: selection.gateSummary,
      gatePassedCount: selection.passedCount,
      gateTotalCount: selection.totalCount,
      strictRequiredFeatures: selection.requiredFeatures,
      strictRequiredLightingFeatures: selection.lightingRequiredFeatures,
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
