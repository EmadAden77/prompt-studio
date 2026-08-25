export const POSE_REQUIREMENTS = Object.freeze({
  standing_center: { required_features_all: ["floor"], preferred_region: "center" },
  standing_bedside: { required_features_all: ["bed"], preferred_region: null },
  standing_sofa: { required_features_all: ["sofa"], preferred_region: "sofa_zone" },
  standing_vanity: { required_features_all: ["vanity_mirror"], preferred_region: "vanity_area" },
  standing_wardrobe: { required_features_all: ["wardrobe"], preferred_region: "wardrobe_zone" },
  sitting_bed_edge: { required_features_all: ["bed", "mattress"], preferred_region: null },
  sitting_sofa: { required_features_all: ["sofa"], preferred_region: "sofa_zone" },
  sitting_chair: { required_features_all: ["chair"], preferred_region: "chair_zone" },
  sitting_floor: { required_features_all: ["floor"], preferred_region: "center" },
  lying_back: { required_features_all: ["bed", "mattress"], preferred_region: null },
  lying_stomach: { required_features_all: ["bed", "mattress"], preferred_region: null },
  lying_right_side: { required_features_all: ["bed", "mattress"], preferred_region: "right_side_of_bed" },
  lying_left_side: { required_features_all: ["bed", "mattress"], preferred_region: "left_side_of_bed" },
  semi_reclining: { required_features_all: ["bed", "mattress"], preferred_region: null },
  mirror_selfie: { required_features_all: ["vanity_mirror"], preferred_region: "vanity_area" }
});

const FEATURE_LABELS_AR = Object.freeze({
  bed: "سرير",
  mattress: "مرتبة",
  floor: "أرضية",
  vanity_mirror: "مرآة التسريحة",
  sofa: "أريكة",
  chair: "كرسي",
  wardrobe: "دولاب"
});

function unique(items = []) {
  return [...new Set(items.filter(Boolean))];
}

export class SceneEngine {
  constructor(scenes = []) {
    this.scenes = [...scenes];
  }

  getById(sceneId) {
    return this.scenes.find((scene) => scene.id === sceneId) ?? null;
  }

  getRequirement(poseId, extraRequiredFeatures = []) {
    const defined = POSE_REQUIREMENTS[poseId] ?? { required_features_all: [], preferred_region: null };
    return {
      required_features_all: unique([...(defined.required_features_all ?? []), ...extraRequiredFeatures]),
      preferred_region: defined.preferred_region ?? null
    };
  }

  formatRequiredFeatures(features = []) {
    return features.map((feature) => FEATURE_LABELS_AR[feature] ?? feature).join("، ");
  }

  directionMatches(scene, bodyDirection) {
    return scene.supported_directions.includes("any") || scene.supported_directions.includes(bodyDirection);
  }

  requiredFeaturesMatch(scene, requiredFeatures = []) {
    return requiredFeatures.every((feature) => scene.visible_features.includes(feature));
  }

  evaluateHardGate(scene, poseId, extraRequiredFeatures = []) {
    const requirement = this.getRequirement(poseId, extraRequiredFeatures);
    if (!scene) {
      return {
        pass: false,
        poseMatch: false,
        featureMatch: false,
        missingFeatures: [...requirement.required_features_all],
        requirement
      };
    }

    const poseMatch = scene.supported_poses.includes(poseId);
    const missingFeatures = requirement.required_features_all.filter(
      (feature) => !scene.visible_features.includes(feature)
    );

    return {
      pass: poseMatch && missingFeatures.length === 0,
      poseMatch,
      featureMatch: missingFeatures.length === 0,
      missingFeatures,
      requirement
    };
  }

  hardGate(poseId, extraRequiredFeatures = []) {
    const requirement = this.getRequirement(poseId, extraRequiredFeatures);
    const evaluated = this.scenes.map((scene) => ({
      scene,
      gate: this.evaluateHardGate(scene, poseId, extraRequiredFeatures)
    }));
    const passed = evaluated.filter((item) => item.gate.pass);
    const rejected = evaluated.filter((item) => !item.gate.pass);

    return {
      requirement,
      passed,
      rejected,
      passedCount: passed.length,
      totalCount: this.scenes.length
    };
  }

  getCompatibleScenes(poseId, bodyDirection, requiredFeatures = []) {
    // v1.2: compatibility is a hard Pass/Fail gate. Direction belongs to ranking, not gating.
    return this.hardGate(poseId, requiredFeatures).passed.map((item) => item.scene);
  }

  scoreScene(scene, { poseId, bodyDirection, cameraAngle, cameraDistance, requiredFeatures = [] }) {
    const requirement = this.getRequirement(poseId, requiredFeatures);
    let score = 0;
    const reasons = ["اجتاز البوابة الصارمة: الوضعية مدعومة وكل العناصر الإلزامية موجودة"];

    if (requirement.preferred_region && scene.region === requirement.preferred_region) {
      score += 50;
      reasons.push(`المنطقة المفضلة للوضعية مطابقة: ${scene.region}`);
    }

    if (this.directionMatches(scene, bodyDirection)) {
      score += 30;
      reasons.push("جهة الجسم مدعومة في المرجع");
    }

    if (scene.camera_angles.includes(cameraAngle)) {
      score += 20;
      reasons.push("زاوية الكاميرا متطابقة");
    }

    if (scene.camera_distances.includes(cameraDistance)) {
      score += 10;
      reasons.push("مسافة التصوير متطابقة");
    }

    if (scene.default_for_poses.includes(poseId)) {
      score += 5;
      reasons.push("المرجع افتراضي لهذه الوضعية");
    }

    return { scene, score, reasons };
  }

  confidenceFromScore(score) {
    if (score >= 60) return "تلقائي صارم — دقة عالية";
    if (score >= 35) return "تلقائي صارم — دقة متوسطة";
    return "تلقائي صارم — دقة منخفضة";
  }

  autoSelect({ poseId, bodyDirection, cameraAngle, cameraDistance, requiredFeatures = [] }) {
    if (!poseId || !bodyDirection) {
      return {
        error: "missing_input",
        message: "اختر الوضعية واتجاه الجسم أولًا",
        mode: "تلقائي صارم"
      };
    }

    // HARD GATE FIRST. No score is calculated until this pass/fail stage finishes.
    const gate = this.hardGate(poseId, requiredFeatures);
    if (gate.passedCount === 0) {
      const requiredText = this.formatRequiredFeatures(gate.requirement.required_features_all) || "مرجع يدعم الوضعية نفسها";
      return {
        error: "strict_no_match",
        scene: null,
        message: `لا يوجد مرجع صالح لهذه الوضعية — المطلوب: ${requiredText}`,
        requiredFeatures: gate.requirement.required_features_all,
        preferredRegion: gate.requirement.preferred_region,
        passedCount: 0,
        totalCount: gate.totalCount,
        gateSummary: `مرشح صارم: اجتاز 0 من ${gate.totalCount} مرجعًا`,
        alternatives: [],
        reasons: [],
        mode: "تلقائي صارم"
      };
    }

    // Ranking happens ONLY among scenes that passed the hard gate.
    const ranked = gate.passed
      .map(({ scene }) => this.scoreScene(scene, {
        poseId,
        bodyDirection,
        cameraAngle,
        cameraDistance,
        requiredFeatures
      }))
      .sort((a, b) => (
        b.score - a.score
        || (b.scene.priority ?? 0) - (a.scene.priority ?? 0)
        || a.scene.id.localeCompare(b.scene.id)
      ));

    const best = ranked[0];
    return {
      scene: best.scene,
      confidence: this.confidenceFromScore(best.score),
      score: best.score,
      reasons: best.reasons,
      alternatives: ranked.slice(1, 3),
      requiredFeatures: gate.requirement.required_features_all,
      preferredRegion: gate.requirement.preferred_region,
      passedCount: gate.passedCount,
      totalCount: gate.totalCount,
      gateSummary: `مرشح صارم: اجتاز ${gate.passedCount} من ${gate.totalCount} مرجعًا`,
      mode: "تلقائي صارم"
    };
  }

  evaluateManualSelection(scene, config) {
    if (!scene) return { score: 0, reasons: [], compatible: false, hardGatePassed: false };
    const gate = this.evaluateHardGate(scene, config.poseId, config.requiredFeatures ?? []);
    const scored = this.scoreScene(scene, config);
    const directionMatch = this.directionMatches(scene, config.bodyDirection);

    return {
      ...scored,
      compatible: gate.pass,
      hardGatePassed: gate.pass,
      gate,
      directionMatch,
      reasons: [
        gate.poseMatch ? "الوضعية مدعومة" : "الوضعية غير مدعومة",
        gate.featureMatch
          ? "العناصر الإلزامية موجودة"
          : `العناصر الإلزامية الناقصة: ${this.formatRequiredFeatures(gate.missingFeatures)}`,
        directionMatch ? "جهة الجسم مدعومة" : "جهة الجسم غير مفضلة في هذا المرجع",
        ...scored.reasons.slice(1)
      ]
    };
  }
}
