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
  wardrobe: "دولاب",
  lamp: "أباجورة",
  ceiling_light: "لمبة سقف",
  ceiling_spots: "سبوتات سقف",
  daylight_access: "مدخل ضوء نهاري"
});

const SELFIE_NEAR_DISTANCES = new Set(["close", "medium"]);
const SELFIE_CAMERA_ANGLES = new Set(["eye_level", "high_angle", "low_angle"]);

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

  getCompatiblePoseIds(sceneOrId, allowedPoseIds = []) {
    const scene = typeof sceneOrId === "string" ? this.getById(sceneOrId) : sceneOrId;
    if (!scene) return [];
    const allowed = [...allowedPoseIds];
    if (!allowed.length) return [...(scene.supported_poses ?? [])];
    return allowed.filter((poseId) => (scene.supported_poses ?? []).includes(poseId));
  }

  getSuggestedPoseId(sceneOrId, allowedPoseIds = []) {
    const scene = typeof sceneOrId === "string" ? this.getById(sceneOrId) : sceneOrId;
    const compatiblePoseIds = this.getCompatiblePoseIds(scene, allowedPoseIds);
    return (scene?.default_for_poses ?? []).find((poseId) => compatiblePoseIds.includes(poseId))
      ?? compatiblePoseIds[0]
      ?? null;
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

  evaluateSelfieCameraFeasibility(scene, { cameraType = null, bedRealismProfile = null } = {}) {
    if (!scene || cameraType !== "front" || !bedRealismProfile) {
      return { pass: true, surfacePass: true, nearViewSupport: true, cameraAngleSupport: true };
    }

    const requiredSurface = bedRealismProfile.requiredSurface;
    const surfacePass = requiredSurface === "bed"
      ? scene.visible_features.includes("bed") && scene.visible_features.includes("mattress")
      : !requiredSurface || scene.surfaces.includes(requiredSurface);
    const nearViewSupport = scene.camera_distances.some((distance) => SELFIE_NEAR_DISTANCES.has(distance));
    const cameraAngleSupport = scene.camera_angles.some((angle) => SELFIE_CAMERA_ANGLES.has(angle));

    return {
      pass: surfacePass && nearViewSupport && cameraAngleSupport,
      surfacePass,
      nearViewSupport,
      cameraAngleSupport
    };
  }

  evaluateHardGate(scene, poseId, extraRequiredFeatures = [], context = {}) {
    const requirement = this.getRequirement(poseId, extraRequiredFeatures);
    const lightingRequiredFeatures = unique(context.lightingRequiredFeatures ?? []);

    if (!scene) {
      return {
        pass: false,
        poseMatch: false,
        featureMatch: false,
        lightingMatch: false,
        selfieCameraFeasible: false,
        missingFeatures: [...requirement.required_features_all],
        missingLightingFeatures: [...lightingRequiredFeatures],
        requirement,
        selfieFeasibility: { pass: false }
      };
    }

    if (scene.text_reference) {
      const poseMatch = scene.supported_poses.includes(poseId);
      return {
        pass: poseMatch,
        poseMatch,
        featureMatch: true,
        lightingMatch: true,
        selfieCameraFeasible: true,
        missingFeatures: [],
        missingLightingFeatures: [],
        requirement,
        selfieFeasibility: { pass: true, surfacePass: true, nearViewSupport: true, cameraAngleSupport: true },
        textReference: true
      };
    }

    const poseMatch = scene.supported_poses.includes(poseId);
    const missingFeatures = requirement.required_features_all.filter(
      (feature) => !scene.visible_features.includes(feature)
    );
    const missingLightingFeatures = lightingRequiredFeatures.filter(
      (feature) => !scene.visible_features.includes(feature)
    );
    const selfieFeasibility = this.evaluateSelfieCameraFeasibility(scene, context);

    return {
      pass: poseMatch
        && missingFeatures.length === 0
        && missingLightingFeatures.length === 0
        && selfieFeasibility.pass,
      poseMatch,
      featureMatch: missingFeatures.length === 0,
      lightingMatch: missingLightingFeatures.length === 0,
      selfieCameraFeasible: selfieFeasibility.pass,
      missingFeatures,
      missingLightingFeatures,
      requirement,
      selfieFeasibility
    };
  }

  hardGate(poseId, extraRequiredFeatures = [], context = {}) {
    const requirement = this.getRequirement(poseId, extraRequiredFeatures);
    const evaluated = this.scenes.map((scene) => ({
      scene,
      gate: this.evaluateHardGate(scene, poseId, extraRequiredFeatures, context)
    }));
    const passed = evaluated.filter((item) => item.gate.pass);
    const rejected = evaluated.filter((item) => !item.gate.pass);

    return {
      requirement,
      passed,
      rejected,
      passedCount: passed.length,
      totalCount: this.scenes.length,
      lightingRequiredFeatures: unique(context.lightingRequiredFeatures ?? [])
    };
  }

  formatGateSummary(gate) {
    const coreScenes = this.scenes.filter((scene) => !scene.id.startsWith("user_room_"));
    if (coreScenes.length === this.scenes.length) {
      return `مرشح صارم v1.3: اجتاز ${gate.passedCount} من ${gate.totalCount} مرجعًا`;
    }
    const coreIds = new Set(coreScenes.map((scene) => scene.id));
    const corePassed = gate.passed.filter((item) => coreIds.has(item.scene.id)).length;
    return `مرشح صارم v1.3: اجتاز ${corePassed} من ${coreScenes.length} مرجعًا أساسيًا؛ المكتبة الكاملة: اجتاز ${gate.passedCount} من ${gate.totalCount} مرجعًا`;
  }

  getCompatibleScenes(poseId, bodyDirection, requiredFeatures = [], context = {}) {
    return this.hardGate(poseId, requiredFeatures, context).passed.map((item) => item.scene);
  }

  scoreScene(scene, { poseId, bodyDirection, cameraAngle, cameraDistance, requiredFeatures = [] }) {
    const requirement = this.getRequirement(poseId, requiredFeatures);
    let score = 0;
    const reasons = [];

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
      reasons.push("بيانات المرجع تساعد على مصالحة زاوية الخلفية مع موضع السيلفي");
    }

    if (scene.camera_distances.includes(cameraDistance)) {
      score += 10;
      reasons.push("بيانات المرجع تساعد على مصالحة مسافة الخلفية مع موضع السيلفي");
    }

    if ((scene.default_for_poses ?? []).includes(poseId)) {
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

  autoSelect({
    poseId,
    bodyDirection,
    cameraAngle,
    cameraDistance,
    requiredFeatures = [],
    lightingRequiredFeatures = [],
    cameraType = null,
    bedRealismProfile = null
  }) {
    if (!poseId || !bodyDirection) {
      return {
        error: "missing_input",
        message: "اختر الوضعية واتجاه الجسم أولًا",
        mode: "تلقائي صارم"
      };
    }

    const context = { lightingRequiredFeatures, cameraType, bedRealismProfile };
    // v1.3 HARD GATE FIRST: pose + required geometry + reachable selfie feasibility + selected lighting support.
    const gate = this.hardGate(poseId, requiredFeatures, context);
    if (gate.passedCount === 0) {
      const required = unique([
        ...gate.requirement.required_features_all,
        ...gate.lightingRequiredFeatures
      ]);
      const requiredText = this.formatRequiredFeatures(required) || "مرجع يدعم الوضعية نفسها";
      const selfieText = cameraType === "front" && bedRealismProfile
        ? " + منظور سيلفي قريب قابل للمصالحة مع هندسة السرير"
        : "";
      return {
        error: "strict_no_match",
        scene: null,
        message: `لا يوجد مرجع صالح لهذه الوضعية — المطلوب: ${requiredText}${selfieText}`,
        requiredFeatures: gate.requirement.required_features_all,
        lightingRequiredFeatures: gate.lightingRequiredFeatures,
        preferredRegion: gate.requirement.preferred_region,
        passedCount: 0,
        totalCount: gate.totalCount,
        gateSummary: this.formatGateSummary(gate),
        alternatives: [],
        reasons: [],
        mode: "تلقائي صارم"
      };
    }

    const ranked = gate.passed
      .map(({ scene, gate: sceneGate }) => {
        const scored = this.scoreScene(scene, {
          poseId,
          bodyDirection,
          cameraAngle,
          cameraDistance,
          requiredFeatures
        });
        const gateReasons = [
          "اجتاز دعم الوضعية وهندسة السرير الإلزامية",
          sceneGate.selfieCameraFeasible ? "اجتاز قابلية منظور السيلفي القريب" : "",
          sceneGate.lightingMatch ? "اجتاز توافق مصدر الإضاءة المختار" : ""
        ].filter(Boolean);
        return { ...scored, reasons: [...gateReasons, ...scored.reasons] };
      })
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
      lightingRequiredFeatures: gate.lightingRequiredFeatures,
      preferredRegion: gate.requirement.preferred_region,
      passedCount: gate.passedCount,
      totalCount: gate.totalCount,
      gateSummary: this.formatGateSummary(gate),
      mode: "تلقائي صارم"
    };
  }

  evaluateManualSelection(scene, config) {
    if (!scene) return { score: 0, reasons: [], compatible: false, hardGatePassed: false };
    const context = {
      lightingRequiredFeatures: config.lightingRequiredFeatures ?? [],
      cameraType: config.cameraType ?? null,
      bedRealismProfile: config.bedRealismProfile ?? null
    };
    const gate = this.evaluateHardGate(scene, config.poseId, config.requiredFeatures ?? [], context);
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
          ? "هندسة السرير والعناصر الإلزامية موجودة"
          : `العناصر الإلزامية الناقصة: ${this.formatRequiredFeatures(gate.missingFeatures)}`,
        gate.selfieCameraFeasible ? "منظور السيلفي القريب قابل للمصالحة" : "منظور السيلفي القريب غير قابل للمصالحة مع بيانات المرجع",
        gate.lightingMatch
          ? "مصدر الإضاءة المختار مدعوم"
          : `مصادر الإضاءة الناقصة: ${this.formatRequiredFeatures(gate.missingLightingFeatures)}`,
        directionMatch ? "جهة الجسم مدعومة" : "جهة الجسم غير مفضلة في هذا المرجع",
        ...scored.reasons
      ]
    };
  }
}
