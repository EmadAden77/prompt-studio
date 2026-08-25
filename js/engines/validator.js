import { POSE_REQUIREMENTS } from "./sceneEngine.js";

const BED_SELFIE_POSE_IDS = new Set([
  "lying_back",
  "lying_stomach",
  "lying_right_side",
  "lying_left_side",
  "semi_reclining",
  "sitting_bed_edge"
]);

function unique(items = []) {
  return [...new Set(items.filter(Boolean))];
}

export class Validator {
  constructor({ lightingEngine }) {
    this.lightingEngine = lightingEngine;
  }

  createIssue(severity, type, message, suggestion = "", autoFix = null) {
    return { severity, type, message, suggestion, autoFix };
  }

  getStrictReferenceMismatch(pose, scene) {
    if (!pose || !scene) return null;
    const requirement = POSE_REQUIREMENTS[pose.id] ?? { required_features_all: [] };
    const requiredFeatures = unique([...(requirement.required_features_all ?? []), ...(pose.requires ?? [])]);
    const poseMatch = scene.supported_poses.includes(pose.id);
    const missingFeatures = requiredFeatures.filter((feature) => !scene.visible_features.includes(feature));

    if (poseMatch && missingFeatures.length === 0) return null;
    return { poseMatch, missingFeatures, requiredFeatures };
  }

  validate(config) {
    const conflicts = [];
    const warnings = [];
    const notices = [];
    const { pose, scene, camera, lens, lighting } = config;
    const bedSelfiePose = Boolean(pose && BED_SELFIE_POSE_IDS.has(pose.id));
    const mirrorSelfie = pose?.id === "mirror_selfie";

    if (!pose) {
      conflicts.push(this.createIssue("error", "pose_missing", "ما تم اختيار وضعية صالحة.", "اختر وضعية من القائمة."));
    }

    if (!scene) {
      conflicts.push(this.createIssue(
        "error",
        "scene_missing",
        config.autoEngineering?.strictNoMatchMessage || "لا يوجد مرجع صالح لهذه الوضعية.",
        "غيّر الوضعية أو استخدم التجاوز اليدوي مع فهم أن المرجع غير المطابق سيظل محجوبًا في الفحص."
      ));
    }

    if (bedSelfiePose && camera?.type !== "front") {
      conflicts.push(this.createIssue(
        "error",
        "bed_selfie_camera_conflict",
        "سيلفي السرير يحتاج الكاميرا الأمامية الفعلية.",
        "استخدم الكاميرا الأمامية وعدسة السيلفي الأصلية.",
        { field: "cameraType", value: "front", secondary: { field: "lensType", value: "front_wide" } }
      ));
    }

    if (bedSelfiePose && config.roomMode === "EDIT") {
      conflicts.push(this.createIssue(
        "error",
        "bed_selfie_requires_generate",
        "سيلفي السرير يحتاج موضع كاميرا جديد داخل مدى الذراع، لذلك لا يُنفّذ كـ EDIT على لوحة ثابتة.",
        "استخدم GENERATE لنفس الغرفة من موضع سيلفي قابل للوصول.",
        { field: "roomMode", value: "GENERATE" }
      ));
    }

    if (pose && scene) {
      const strictMismatch = this.getStrictReferenceMismatch(pose, scene);
      if (strictMismatch) {
        const missingText = strictMismatch.missingFeatures.length
          ? ` العناصر الناقصة: ${strictMismatch.missingFeatures.join("، ")}.`
          : "";
        conflicts.push(this.createIssue(
          "error",
          "reference_pose_mismatch",
          `${strictMismatch.poseMatch ? "المرجع لا يحتوي كل العناصر الإلزامية للوضعية." : "المرجع لا يدعم الوضعية المختارة."}${missingText}`,
          config.autoEngineering?.sceneOverrideId
            ? "ألغِ التجاوز اليدوي لاختيار أفضل مرجع ناجح تلقائيًا، أو غيّر الوضعية."
            : "استخدم المرجع الناتج من المرشح الصارم أو غيّر الوضعية."
        ));
      }

      if (!(scene.supported_directions.includes("any") || scene.supported_directions.includes(config.bodyDirection))) {
        warnings.push(this.createIssue(
          "warning",
          "direction_scene_warning",
          "جهة الجسم ليست الاتجاه المفضل لهذا المرجع، لكنها لا تُسقط البوابة الصارمة وحدها.",
          "استخدم المرجع التلقائي الأعلى ترتيبًا إن أردت تطابق الجهة أيضًا."
        ));
      }

      const missingSurfaces = pose.surfaces.filter((surface) => !scene.surfaces.includes(surface));
      if (missingSurfaces.length) {
        conflicts.push(this.createIssue("error", "surface_not_available", `أسطح الارتكاز المطلوبة غير متوفرة: ${missingSurfaces.join("، ")}.`, "اختر مرجعًا يحتوي أسطح التلامس الفعلية."));
      }

      if (!pose.valid_angles.includes(config.cameraAngle) || !scene.camera_angles.includes(config.cameraAngle)) {
        conflicts.push(this.createIssue(
          "error",
          "camera_angle_conflict",
          "زاوية الكاميرا غير ممكنة للوضعية أو غير مدعومة في المرجع.",
          "استخدم الهندسة التلقائية للزاوية المتوافقة.",
          { field: "cameraAngle", value: scene.camera_angles.find((angle) => pose.valid_angles.includes(angle)) ?? pose.valid_angles[0] }
        ));
      }

      if (!pose.valid_distances.includes(config.cameraDistance) || !scene.camera_distances.includes(config.cameraDistance)) {
        conflicts.push(this.createIssue(
          "error",
          "camera_distance_conflict",
          "مسافة التصوير غير مدعومة للوضعية أو المرجع.",
          "استخدم الهندسة التلقائية للمسافة المتوافقة.",
          { field: "cameraDistance", value: scene.camera_distances.find((distance) => pose.valid_distances.includes(distance)) ?? pose.valid_distances[0] }
        ));
      }

      if (!bedSelfiePose && !mirrorSelfie && config.roomMode === "EDIT" && config.cameraAngle !== scene.base_camera_angle) {
        conflicts.push(this.createIssue("error", "edit_mode_angle", "وضع EDIT يفرض زاوية اللوحة الأصلية.", "استخدم زاوية المرجع أو حوّل إلى GENERATE.", { field: "cameraAngle", value: scene.base_camera_angle }));
      }

      if (!bedSelfiePose && !mirrorSelfie && config.roomMode === "EDIT" && config.cameraDistance !== scene.base_camera_distance) {
        conflicts.push(this.createIssue("error", "edit_mode_distance", "وضع EDIT يحافظ على القص والمنظور الأصليين.", "استخدم مسافة المرجع الأصلية أو حوّل إلى GENERATE.", { field: "cameraDistance", value: scene.base_camera_distance }));
      }

      const missingLightFeatures = this.lightingEngine.getMissingFeatures(lighting, scene);
      if (missingLightFeatures.length) {
        conflicts.push(this.createIssue(
          "error",
          "light_source_missing",
          `مصدر الإضاءة المختار غير مثبت في المرجع: ${missingLightFeatures.join("، ")}.`,
          "اختر إضاءة مدعومة في المرجع الحالي.",
          { field: "lightingId", value: "phone_screen_only" }
        ));
      }
    }

    if (camera && lens && lens.camera !== camera.type) {
      conflicts.push(this.createIssue("error", "camera_lens_conflict", "العدسة المختارة ما تتبع نوع الكاميرا الحالي.", "استخدم عدسة الكاميرا نفسها.", { field: "lensType", value: camera.type === "front" ? "front_wide" : "rear_standard" }));
    }

    if (mirrorSelfie && camera?.type !== "rear") {
      conflicts.push(this.createIssue("error", "mirror_camera_conflict", "سيلفي المرآة يحتاج الكاميرا الخلفية الرئيسية باتجاه المرآة.", "استخدم الكاميرا الخلفية الرئيسية.", { field: "cameraType", value: "rear", secondary: { field: "lensType", value: "rear_standard" } }));
    }

    if (camera?.type === "rear" && lighting?.id === "phone_screen_only") {
      conflicts.push(this.createIssue("error", "rear_screen_light_conflict", "شاشة هاتف الكاميرا الخلفية تتجه بعيدًا عن الوجه، فلا تكون مصدر الإضاءة الوحيد.", "اختر مصدرًا موجودًا في الغرفة.", { field: "lightingId", value: "single_ceiling" }));
    }

    if (camera?.type === "rear" && !mirrorSelfie) {
      notices.push(this.createIssue("info", "rear_not_selfie", "الكاميرا الخلفية خارج المرآة تُعامل كصورة من شخص آخر أو ترايبود، وليست سيلفي."));
    }

    if (!config.uploads?.imageA) {
      warnings.push(this.createIssue("warning", "image_a_missing", "صورة الهوية غير مرفوعة داخل المعاينة.", "ارفع IMAGE A قبل استخدام الأمر مع ChatGPT."));
    }

    if (!config.uploads?.imageB) {
      warnings.push(this.createIssue("warning", "image_b_missing", "صورة المكان غير مرفوعة داخل المعاينة.", "ارفع IMAGE B المطابقة للمرجع المختار قبل الاستخدام."));
    } else if (scene && config.uploads.imageB.name !== scene.image_filename) {
      warnings.push(this.createIssue("warning", "image_b_filename_mismatch", `اسم IMAGE B المرفوعة مختلف عن المرجع المقترح (${scene.image_filename}).`, "تأكد بصريًا أنها صورة المنطقة نفسها؛ اختلاف الاسم وحده لا يمنع بناء الأمر."));
    }

    const issues = [...conflicts, ...warnings, ...notices];
    return {
      valid: conflicts.length === 0,
      conflicts,
      warnings,
      notices,
      issues,
      autoFixes: conflicts.filter((item) => item.autoFix).map((item) => item.autoFix)
    };
  }
}
