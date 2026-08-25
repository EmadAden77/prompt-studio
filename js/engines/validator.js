const BED_SELFIE_ARM_STRATEGIES = new Set([
  "lying_back",
  "lying_stomach",
  "lying_right_side",
  "lying_left_side",
  "semi_reclining"
]);

export class Validator {
  constructor({ lightingEngine }) {
    this.lightingEngine = lightingEngine;
  }

  createIssue(severity, type, message, suggestion = "", autoFix = null) {
    return { severity, type, message, suggestion, autoFix };
  }

  validate(config) {
    const conflicts = [];
    const warnings = [];
    const notices = [];
    const { pose, scene, camera, lens, lighting } = config;
    const bedSelfiePose = Boolean(
      pose?.placement === "bed"
      && BED_SELFIE_ARM_STRATEGIES.has(pose.arm_strategy)
    );

    if (!pose) {
      conflicts.push(this.createIssue("error", "pose_missing", "ما تم اختيار وضعية صالحة.", "اختر وضعية من القائمة."));
    }

    if (!scene) {
      conflicts.push(this.createIssue("error", "scene_missing", "ما فيه مرجع مكان صالح للاختيارات الحالية.", "غيّر الوضعية أو الاتجاه، أو اختر مرجعًا يدويًا."));
    }

    if (bedSelfiePose && camera?.type !== "front") {
      conflicts.push(this.createIssue(
        "error",
        "bed_selfie_camera_conflict",
        "وضعيات سيلفي السرير المعتمدة تحتاج الكاميرا الأمامية الفعلية؛ الكاميرا الخلفية تغيّر الحدث إلى تصوير خارجي.",
        "استخدم الكاميرا الأمامية وعدسة السيلفي الأصلية.",
        { field: "cameraType", value: "front", secondary: { field: "lensType", value: "front_wide" } }
      ));
    }

    if (bedSelfiePose && config.roomMode === "EDIT") {
      conflicts.push(this.createIssue(
        "error",
        "bed_selfie_requires_generate",
        "سيلفي السرير يغيّر موضع الكاميرا إلى نقطة داخل مدى الذراع، لذلك لا يمكن تنفيذه كـ EDIT على لوحة IMAGE B ثابتة.",
        "استخدم GENERATE حتى تبقى الغرفة نفسها لكن من موضع كاميرا سيلفي قابل للوصول.",
        { field: "roomMode", value: "GENERATE" }
      ));
    }

    if (pose && scene) {
      if (!scene.supported_poses.includes(pose.id)) {
        conflicts.push(this.createIssue(
          "error",
          "pose_scene_conflict",
          "الوضعية غير مدعومة في مرجع المكان المختار.",
          "اختر مرجعًا يدعم الوضعية أو غيّر الوضعية."
        ));
      }

      if (!(scene.supported_directions.includes("any") || scene.supported_directions.includes(config.bodyDirection))) {
        conflicts.push(this.createIssue(
          "error",
          "direction_scene_conflict",
          "اتجاه الجسم غير متوافق مع مرجع المكان.",
          "استخدم اتجاهًا ظاهرًا وممكنًا في المرجع."
        ));
      }

      const missingPoseFeatures = (pose.requires ?? []).filter((feature) => !scene.visible_features.includes(feature));
      if (missingPoseFeatures.length) {
        conflicts.push(this.createIssue(
          "error",
          "required_feature_missing",
          `المرجع ما يحتوي العنصر الإلزامي: ${missingPoseFeatures.join("، ")}.`,
          "اختر مرجعًا تظهر فيه العناصر المطلوبة بوضوح."
        ));
      }

      const missingSurfaces = pose.surfaces.filter((surface) => !scene.surfaces.includes(surface));
      if (missingSurfaces.length) {
        conflicts.push(this.createIssue(
          "error",
          "surface_not_available",
          `أسطح الارتكاز المطلوبة غير متوفرة: ${missingSurfaces.join("، ")}.`,
          "اختر مشهدًا يحتوي أسطح التلامس الفعلية."
        ));
      }

      if (!pose.valid_angles.includes(config.cameraAngle) || !scene.camera_angles.includes(config.cameraAngle)) {
        conflicts.push(this.createIssue(
          "error",
          "camera_angle_conflict",
          "زاوية الكاميرا غير ممكنة للوضعية أو غير مدعومة في المرجع.",
          "استخدم زاوية مشتركة بين الوضعية والمرجع.",
          { field: "cameraAngle", value: scene.camera_angles.find((angle) => pose.valid_angles.includes(angle)) ?? pose.valid_angles[0] }
        ));
      }

      if (!pose.valid_distances.includes(config.cameraDistance) || !scene.camera_distances.includes(config.cameraDistance)) {
        conflicts.push(this.createIssue(
          "error",
          "camera_distance_conflict",
          "مسافة التصوير غير مدعومة للوضعية أو المرجع.",
          "استخدم مسافة مشتركة بين الوضعية والمرجع.",
          { field: "cameraDistance", value: scene.camera_distances.find((distance) => pose.valid_distances.includes(distance)) ?? pose.valid_distances[0] }
        ));
      }

      if (!bedSelfiePose && config.roomMode === "EDIT" && config.cameraAngle !== scene.base_camera_angle) {
        conflicts.push(this.createIssue(
          "error",
          "edit_mode_angle",
          "وضع EDIT يفرض زاوية اللوحة الأصلية ولا يسمح بتغيير منظورها.",
          "استخدم زاوية المرجع أو حوّل إلى GENERATE.",
          { field: "cameraAngle", value: scene.base_camera_angle }
        ));
      }

      if (!bedSelfiePose && config.roomMode === "EDIT" && config.cameraDistance !== scene.base_camera_distance) {
        conflicts.push(this.createIssue(
          "error",
          "edit_mode_distance",
          "وضع EDIT يحافظ على القص والمنظور الأصليين، لذلك مسافة التصوير لازم تطابق اللوحة المرجعية.",
          "استخدم مسافة المرجع الأصلية أو حوّل إلى GENERATE.",
          { field: "cameraDistance", value: scene.base_camera_distance }
        ));
      }

      const missingLightFeatures = this.lightingEngine.getMissingFeatures(lighting, scene);
      if (missingLightFeatures.length) {
        conflicts.push(this.createIssue(
          "error",
          "light_source_missing",
          `مصدر الإضاءة المختار غير مثبت في المرجع: ${missingLightFeatures.join("، ")}.`,
          "اختر إضاءة لها مصدر ظاهر أو مدعوم في IMAGE B.",
          { field: "lightingId", value: "phone_screen_only" }
        ));
      }
    }

    if (camera && lens && lens.camera !== camera.type) {
      conflicts.push(this.createIssue(
        "error",
        "camera_lens_conflict",
        "العدسة المختارة ما تتبع نوع الكاميرا الحالي.",
        "استخدم عدسة الكاميرا نفسها.",
        { field: "lensType", value: camera.type === "front" ? "front_wide" : "rear_standard" }
      ));
    }

    if (pose?.arm_strategy === "mirror" && camera?.type !== "rear") {
      conflicts.push(this.createIssue(
        "error",
        "mirror_camera_conflict",
        "سيلفي المرآة يحتاج الكاميرا الخلفية حتى تكون الشاشة باتجاه الشخص والعدسة باتجاه المرآة.",
        "حوّل إلى الكاميرا الخلفية الرئيسية.",
        { field: "cameraType", value: "rear", secondary: { field: "lensType", value: "rear_standard" } }
      ));
    }

    if (camera?.type === "rear" && lighting?.id === "phone_screen_only") {
      conflicts.push(this.createIssue(
        "error",
        "rear_screen_light_conflict",
        "شاشة هاتف الكاميرا الخلفية تتجه بعيدًا عن الوجه، لذلك ما تقدر تكون مصدر الإضاءة الوحيد.",
        "اختر مصدرًا موجودًا في الغرفة.",
        { field: "lightingId", value: "lamp_only" }
      ));
    }

    if (camera?.type === "rear") {
      notices.push(this.createIssue("info", "rear_not_selfie", "الكاميرا الخلفية ستُعامل كصورة من شخص آخر أو ترايبود، وليست سيلفي."));
    }

    if (!config.uploads?.imageA) {
      warnings.push(this.createIssue("warning", "image_a_missing", "صورة الهوية غير مرفوعة داخل المعاينة.", "ارفع IMAGE A قبل نسخ الأمر واستخدامه مع ChatGPT."));
    }

    if (!config.uploads?.imageB) {
      warnings.push(this.createIssue("warning", "image_b_missing", "صورة المكان غير مرفوعة داخل المعاينة.", "ارفع IMAGE B المطابقة للمرجع المختار قبل الاستخدام."));
    } else if (scene && config.uploads.imageB.name !== scene.image_filename) {
      warnings.push(this.createIssue(
        "warning",
        "image_b_filename_mismatch",
        `اسم IMAGE B المرفوعة مختلف عن المرجع المقترح (${scene.image_filename}).`,
        "تأكد بصريًا أنها صورة المنطقة نفسها؛ اختلاف الاسم وحده لا يمنع بناء الأمر."
      ));
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
