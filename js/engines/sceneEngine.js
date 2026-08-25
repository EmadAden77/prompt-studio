export class SceneEngine {
  constructor(scenes = []) {
    this.scenes = [...scenes];
  }

  getById(sceneId) {
    return this.scenes.find((scene) => scene.id === sceneId) ?? null;
  }

  directionMatches(scene, bodyDirection) {
    return scene.supported_directions.includes("any") || scene.supported_directions.includes(bodyDirection);
  }

  requiredFeaturesMatch(scene, requiredFeatures = []) {
    return requiredFeatures.every((feature) => scene.visible_features.includes(feature));
  }

  getCompatibleScenes(poseId, bodyDirection, requiredFeatures = []) {
    return this.scenes.filter((scene) => (
      scene.supported_poses.includes(poseId)
      && this.directionMatches(scene, bodyDirection)
      && this.requiredFeaturesMatch(scene, requiredFeatures)
    ));
  }

  scoreScene(scene, { poseId, cameraAngle, cameraDistance, requiredFeatures = [] }) {
    let score = 0;
    const reasons = [];

    if (scene.camera_angles.includes(cameraAngle)) {
      score += 30;
      reasons.push("زاوية الكاميرا متطابقة");
    }

    if (scene.camera_distances.includes(cameraDistance)) {
      score += 20;
      reasons.push("مسافة التصوير متطابقة");
    }

    if (scene.default_for_poses.includes(poseId)) {
      score += 25;
      reasons.push("المرجع الافتراضي للوضعية");
    }

    if (requiredFeatures.length > 0) {
      score += 15;
      reasons.push("العناصر الإلزامية ظاهرة");
    }

    if (scene.base_camera_angle === cameraAngle) {
      score += 10;
      reasons.push("منظور اللوحة الأصلية متوافق");
    }

    score += Math.min(10, Math.max(0, Math.round((scene.priority ?? 0) / 10)));
    return { scene, score, reasons };
  }

  autoSelect({ poseId, bodyDirection, cameraAngle, cameraDistance, requiredFeatures = [] }) {
    if (!poseId || !bodyDirection) {
      return {
        error: "missing_input",
        message: "اختر الوضعية واتجاه الجسم أولًا",
        mode: "تلقائي"
      };
    }

    const matchingScenes = this.getCompatibleScenes(poseId, bodyDirection, requiredFeatures);
    if (matchingScenes.length === 0) {
      return {
        error: "no_match",
        message: "ما فيه مرجع يطابق الوضعية والاتجاه والعناصر المطلوبة مطابقة إلزامية",
        mode: "تلقائي"
      };
    }

    const ranked = matchingScenes
      .map((scene) => this.scoreScene(scene, { poseId, cameraAngle, cameraDistance, requiredFeatures }))
      .sort((a, b) => b.score - a.score || (b.scene.priority ?? 0) - (a.scene.priority ?? 0) || a.scene.id.localeCompare(b.scene.id));

    const best = ranked[0];
    let confidence = "دقة منخفضة";
    if (best.score >= 65) confidence = "دقة عالية";
    else if (best.score >= 40) confidence = "دقة متوسطة";

    return {
      scene: best.scene,
      confidence,
      score: best.score,
      reasons: best.reasons,
      alternatives: ranked.slice(1, 3),
      mode: "تلقائي"
    };
  }

  evaluateManualSelection(scene, config) {
    if (!scene) return { score: 0, reasons: [], compatible: false };
    const poseMatch = scene.supported_poses.includes(config.poseId);
    const directionMatch = this.directionMatches(scene, config.bodyDirection);
    const featureMatch = this.requiredFeaturesMatch(scene, config.requiredFeatures ?? []);
    const scored = this.scoreScene(scene, config);
    return {
      ...scored,
      compatible: poseMatch && directionMatch && featureMatch,
      reasons: [
        poseMatch ? "الوضعية مدعومة" : "الوضعية غير مدعومة",
        directionMatch ? "الاتجاه مدعوم" : "الاتجاه غير مدعوم",
        ...scored.reasons
      ]
    };
  }
}
