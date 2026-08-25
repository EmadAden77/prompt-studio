import { SCENES } from "../data/scenesData.js";
import { SceneEngine } from "./sceneEngine.js";

const BED_SELFIE_POSE_IDS = new Set([
  "lying_back",
  "lying_stomach",
  "lying_right_side",
  "lying_left_side",
  "semi_reclining",
  "sitting_bed_edge"
]);

export class Validator {
  constructor({ lightingEngine, sceneEngine = null }) {
    this.lightingEngine = lightingEngine;
    this.sceneEngine = sceneEngine ?? new SceneEngine(SCENES);
  }

  createIssue(severity, type, message, suggestion = "", autoFix = null) {
    return { severity, type, message, suggestion, autoFix };
  }

  getStrictReferenceMismatch(config) {
    const { pose, scene, lighting, camera, autoEngineering } = config;
    if (!pose || !scene) return null;

    const gate = this.sceneEngine.evaluateHardGate(
      scene,
      pose.id,
      pose.requires ?? [],
      {
        lightingRequiredFeatures: lighting?.required_features ?? [],
        cameraType: camera?.type ?? null,
        bedRealismProfile: autoEngineering?.bedRealismProfile ?? null
      }
    );

    return gate.pass ? null : gate;
  }

  validate(config) {
    const conflicts = [];
    const warnings = [];
    const notices = [];
    const { pose, scene, camera, lens, lighting } = config;
    const bedSelfiePose = Boolean(pose && BED_SELFIE_POSE_IDS.has(pose.id));
    const physicalBedSelfie = Boolean(config.autoEngineering?.bedRealismProfile);
    const mirrorSelfie = pose?.id === "mirror_selfie";

    if (!pose) {
      conflicts.push(this.createIssue("error", "pose_missing", "ما تم اختيار وضعية صالحة.", "اختر وضعية من القائمة."));
    }

    if (!scene) {
      conflicts.push(this.createIssue(
        "error",
        "scene_missing",
        config.autoEngineering?.strictNoMatchMessage || "لا يوجد مرجع صالح لهذه الوضعية.",
        "اختر صورة مرجع الغرفة أولًا؛ بعدها سيعرض التطبيق الوضعيات والإضاءة المتوافقة."
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
        "سيلفي السرير يحتاج موضع كاميرا جديد عند نهاية الذراع، لذلك لا يُنفّذ كـ EDIT على منظور خارجي ثابت.",
        "استخدم GENERATE لنفس الغرفة مع بقاء هندسة الغرفة ثابتة وتحريك الكاميرا فقط إلى موضع الهاتف القابل للوصول.",
        { field: "roomMode", value: "GENERATE" }
      ));
    }

    let strictMismatch = null;
    if (pose && scene) {
      strictMismatch = this.getStrictReferenceMismatch(config);
      if (strictMismatch) {
        const details = [];
        if (!strictMismatch.poseMatch) details.push("المرجع لا يدعم الوضعية");
        if (strictMismatch.missingFeatures?.length) {
          details.push(`العناصر الإلزامية الناقصة: ${strictMismatch.missingFeatures.join("، ")}`);
        }
        if (!strictMismatch.selfieCameraFeasible) {
          details.push("منظور السيلفي القريب غير قابل للمصالحة مع هندسة المرجع");
        }
        if (strictMismatch.missingLightingFeatures?.length) {
          details.push(`مصادر الإضاءة الناقصة: ${strictMismatch.missingLightingFeatures.join("، ")}`);
        }
        conflicts.push(this.createIssue(
          "error",
          "reference_pose_mismatch",
          `المرجع فشل بوابة v1.3: ${details.join("؛ ")}.`,
          "اختر إحدى الوضعيات المعروضة لهذا المرجع، أو غيّر الإضاءة إلى خيار متوافق."
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

      const poseAngleInvalid = !pose.valid_angles.includes(config.cameraAngle);
      const sceneAngleInvalid = !physicalBedSelfie && !scene.camera_angles.includes(config.cameraAngle);
      if (poseAngleInvalid || sceneAngleInvalid) {
        conflicts.push(this.createIssue(
          "error",
          "camera_angle_conflict",
          physicalBedSelfie
            ? "زاوية الكاميرا لا تتوافق مع الوضعية الفيزيائية المختارة."
            : "زاوية الكاميرا غير ممكنة للوضعية أو غير مدعومة في المرجع.",
          "استخدم الهندسة التلقائية للزاوية المتوافقة.",
          { field: "cameraAngle", value: physicalBedSelfie
            ? pose.valid_angles[0]
            : scene.camera_angles.find((angle) => pose.valid_angles.includes(angle)) ?? pose.valid_angles[0] }
        ));
      }

      const poseDistanceInvalid = !pose.valid_distances.includes(config.cameraDistance);
      const sceneDistanceInvalid = !physicalBedSelfie && !scene.camera_distances.includes(config.cameraDistance);
      if (poseDistanceInvalid || sceneDistanceInvalid) {
        conflicts.push(this.createIssue(
          "error",
          "camera_distance_conflict",
          physicalBedSelfie
            ? "فئة مسافة الكاميرا لا تتوافق مع الوضعية الفيزيائية المختارة."
            : "مسافة التصوير غير مدعومة للوضعية أو المرجع.",
          "استخدم الهندسة التلقائية للمسافة المتوافقة.",
          { field: "cameraDistance", value: physicalBedSelfie
            ? pose.valid_distances[0]
            : scene.camera_distances.find((distance) => pose.valid_distances.includes(distance)) ?? pose.valid_distances[0] }
        ));
      }

      if (!bedSelfiePose && !mirrorSelfie && config.roomMode === "EDIT" && config.cameraAngle !== scene.base_camera_angle) {
        conflicts.push(this.createIssue("error", "edit_mode_angle", "وضع EDIT يفرض زاوية اللوحة الأصلية.", "استخدم زاوية المرجع أو حوّل إلى GENERATE.", { field: "cameraAngle", value: scene.base_camera_angle }));
      }

      if (!bedSelfiePose && !mirrorSelfie && config.roomMode === "EDIT" && config.cameraDistance !== scene.base_camera_distance) {
        conflicts.push(this.createIssue("error", "edit_mode_distance", "وضع EDIT يحافظ على القص والمنظور الأصليين.", "استخدم مسافة المرجع الأصلية أو حوّل إلى GENERATE.", { field: "cameraDistance", value: scene.base_camera_distance }));
      }

      const missingLightFeatures = this.lightingEngine.getMissingFeatures(lighting, scene);
      const lightingAlreadyBlockedByGate = Boolean(strictMismatch?.missingLightingFeatures?.length);
      if (missingLightFeatures.length && !lightingAlreadyBlockedByGate) {
        conflicts.push(this.createIssue(
          "error",
          "light_source_missing",
          `مصدر الإضاءة المختار غير مثبت في المرجع: ${missingLightFeatures.join("، ")}.`,
          "غيّر المرجع أو الإضاءة؛ شاشة الهاتف فقط تُعامل كمصدر محمول ولا تحتاج أن تظهر في IMAGE B."
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
