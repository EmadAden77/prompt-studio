import { SCENES } from "./data/scenesData.js";
import { LIGHTING_OPTIONS } from "./data/lightingData.js";
import { CLOTHING_OPTIONS } from "./data/clothingData.js";
import { EXPRESSION_OPTIONS } from "./data/expressionsData.js";
import { HAIR_OPTIONS } from "./data/hairData.js";
import { POSES } from "./data/posesData.js";
import { showToast } from "./ui/dom.js";

export const TEMPLATE_GROUP_LABELS = Object.freeze({
  bed: "🛏️ قوالب السرير",
  sitting: "🛋️ قوالب الجلوس",
  standing: "🧍 قوالب الوقوف",
  mirror: "🪞 قوالب المرآة"
});

export const TEMPLATE_PRESETS = Object.freeze([
  {
    id: "back_relaxed",
    group: "bed",
    name_ar: "استلقاء على الظهر — طبيعي هادئ",
    poseId: "lying_back",
    expressionId: "relaxed",
    hairId: "messy",
    clothingId: "cotton_pajama",
    lightingIds: ["window_daylight", "ceiling_white", "lamp_and_phone", "phone_screen_only"],
    aspect: "9:16"
  },
  {
    id: "stomach_relaxed",
    group: "bed",
    name_ar: "استلقاء على البطن — سيلفي طبيعي",
    poseId: "lying_stomach",
    expressionId: "relaxed",
    hairId: "messy",
    clothingId: "sleep_tee_shorts",
    lightingIds: ["window_daylight", "ceiling_white", "lamp_and_phone", "phone_screen_only"],
    aspect: "9:16"
  },
  {
    id: "right_side_warm",
    group: "bed",
    name_ar: "الجانب الأيمن — إضاءة دافئة واقعية",
    poseId: "lying_right_side",
    expressionId: "relaxed",
    hairId: "messy",
    clothingId: "cotton_pajama",
    lightingIds: ["lamp_only", "lamp_and_phone", "phone_screen_only"],
    aspect: "9:16"
  },
  {
    id: "left_side_lowlight",
    group: "bed",
    name_ar: "الجانب الأيسر — إضاءة هاتف خافتة",
    poseId: "lying_left_side",
    expressionId: "relaxed",
    hairId: "messy",
    clothingId: "cotton_pajama",
    lightingIds: ["phone_screen_only"],
    aspect: "9:16"
  },
  {
    id: "semi_reclining_home",
    group: "bed",
    name_ar: "نصف استلقاء — منزلي عفوي",
    poseId: "semi_reclining",
    expressionId: "serious",
    hairId: "same",
    clothingId: "thermal_sleep",
    lightingIds: ["lamp_and_phone", "ceiling_warm", "ceiling_white", "phone_screen_only"],
    aspect: "9:16"
  },
  {
    id: "bed_edge_casual",
    group: "bed",
    name_ar: "حافة السرير — كاجوال طبيعي",
    poseId: "sitting_bed_edge",
    expressionId: "serious",
    hairId: "neat",
    clothingId: "heather_tee_jeans",
    lightingIds: ["window_daylight", "ceiling_white", "lamp_and_phone", "phone_screen_only"],
    aspect: "9:16"
  },
  {
    id: "sofa_casual",
    group: "sitting",
    name_ar: "الأريكة — كاجوال نهاري",
    poseId: "sitting_sofa",
    expressionId: "relaxed",
    hairId: "same",
    clothingId: "heather_tee_jeans",
    lightingIds: ["window_daylight", "overcast_flat", "phone_screen_only"],
    aspect: "9:16"
  },
  {
    id: "chair_neat",
    group: "sitting",
    name_ar: "الكرسي — مرتب داخلي",
    poseId: "sitting_chair",
    expressionId: "serious",
    hairId: "neat",
    clothingId: "oxford_shirt_chino",
    lightingIds: ["ceiling_white", "phone_screen_only"],
    aspect: "9:16"
  },
  {
    id: "floor_relaxed",
    group: "sitting",
    name_ar: "الأرض — جلسة عفوية",
    poseId: "sitting_floor",
    expressionId: "relaxed",
    hairId: "messy",
    clothingId: "hoodie_sweats",
    lightingIds: ["window_daylight", "ceiling_white", "phone_screen_only"],
    aspect: "9:16"
  },
  {
    id: "center_confident",
    group: "standing",
    name_ar: "وسط الغرفة — وقوف واثق طبيعي",
    poseId: "standing_center",
    expressionId: "confident",
    hairId: "neat",
    clothingId: "oxford_shirt_chino",
    lightingIds: ["window_daylight", "ceiling_white", "phone_screen_only"],
    aspect: "9:16"
  },
  {
    id: "bedside_thobe",
    group: "standing",
    name_ar: "بجانب السرير — ثوب أبيض",
    poseId: "standing_bedside",
    expressionId: "confident",
    hairId: "neat",
    clothingId: "thobe",
    lightingIds: ["window_daylight", "ceiling_white", "lamp_only", "phone_screen_only"],
    aspect: "9:16"
  },
  {
    id: "sofa_standing_casual",
    group: "standing",
    name_ar: "عند الأريكة — وقوف كاجوال",
    poseId: "standing_sofa",
    expressionId: "relaxed",
    hairId: "same",
    clothingId: "longsleeve_chino",
    lightingIds: ["window_daylight", "overcast_flat", "phone_screen_only"],
    aspect: "9:16"
  },
  {
    id: "vanity_standing",
    group: "standing",
    name_ar: "أمام التسريحة — وقوف مرتب",
    poseId: "standing_vanity",
    expressionId: "confident",
    hairId: "neat",
    clothingId: "oxford_shirt_chino",
    lightingIds: ["ceiling_white", "phone_screen_only"],
    aspect: "9:16"
  },
  {
    id: "wardrobe_neat",
    group: "standing",
    name_ar: "عند الدولاب — وقوف هادئ",
    poseId: "standing_wardrobe",
    expressionId: "serious",
    hairId: "neat",
    clothingId: "thobe",
    lightingIds: ["ceiling_white", "phone_screen_only"],
    aspect: "9:16"
  },
  {
    id: "mirror_classic",
    group: "mirror",
    name_ar: "مرآة التسريحة — كلاسيكي واقعي",
    poseId: "mirror_selfie",
    expressionId: "confident",
    hairId: "neat",
    clothingId: "thobe",
    lightingIds: ["ceiling_white"],
    aspect: "9:16"
  }
]);

export const TEMPLATE_BY_ID = Object.freeze(Object.fromEntries(TEMPLATE_PRESETS.map((item) => [item.id, item])));

const LIGHTING_BY_ID = Object.freeze(Object.fromEntries(LIGHTING_OPTIONS.map((item) => [item.id, item])));
const POSE_IDS = new Set(POSES.map((item) => item.id));
const EXPRESSION_IDS = new Set(EXPRESSION_OPTIONS.map((item) => item.id));
const HAIR_IDS = new Set(HAIR_OPTIONS.map((item) => item.id));
const CLOTHING_IDS = new Set(CLOTHING_OPTIONS.map((item) => item.id));

export function isLightingSupportedByScene(lightingId, scene) {
  const lighting = LIGHTING_BY_ID[lightingId];
  if (!lighting || !scene) return false;
  return (lighting.required_features ?? []).every((feature) => scene.visible_features.includes(feature));
}

export function resolveTemplateLighting(template, scene) {
  if (!template || !scene) return null;
  return template.lightingIds.find((lightingId) => isLightingSupportedByScene(lightingId, scene)) ?? null;
}

export function isTemplateCompatibleWithScene(template, scene) {
  if (!template || !scene) return false;
  return scene.supported_poses.includes(template.poseId) && Boolean(resolveTemplateLighting(template, scene));
}

export function validateTemplatePreset(template) {
  return Boolean(
    template
    && TEMPLATE_GROUP_LABELS[template.group]
    && POSE_IDS.has(template.poseId)
    && EXPRESSION_IDS.has(template.expressionId)
    && HAIR_IDS.has(template.hairId)
    && CLOTHING_IDS.has(template.clothingId)
    && Array.isArray(template.lightingIds)
    && template.lightingIds.length
    && template.lightingIds.every((id) => Boolean(LIGHTING_BY_ID[id]))
    && ["9:16", "1:1", "16:9"].includes(template.aspect)
  );
}

function setSelectValue(id, value) {
  const select = document.querySelector(`#${id}`);
  if (!select) return false;
  const exists = [...select.options].some((option) => option.value === value);
  if (!exists) return false;
  select.value = value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function currentSceneFromUI() {
  const filename = document.querySelector("#sceneFilename")?.textContent?.trim();
  if (!filename || filename === "—") return null;
  return SCENES.find((scene) => scene.image_filename === filename) ?? null;
}

function initTemplateControl() {
  const templateSelect = document.querySelector("#templateSelect");
  const sceneFilename = document.querySelector("#sceneFilename");
  if (!templateSelect || !sceneFilename) return;

  let applyingTemplate = false;

  const populate = () => {
    const scene = currentSceneFromUI();
    const fragment = document.createDocumentFragment();
    const customOption = document.createElement("option");
    customOption.value = "custom";
    customOption.textContent = scene ? "تخصيص يدوي" : "اختر مرجع الغرفة أولًا";
    fragment.appendChild(customOption);

    if (scene) {
      Object.entries(TEMPLATE_GROUP_LABELS).forEach(([groupId, label]) => {
        const presets = TEMPLATE_PRESETS.filter((template) => template.group === groupId && isTemplateCompatibleWithScene(template, scene));
        if (!presets.length) return;
        const group = document.createElement("optgroup");
        group.label = label;
        presets.forEach((template) => {
          const option = document.createElement("option");
          option.value = template.id;
          option.textContent = template.name_ar;
          group.appendChild(option);
        });
        fragment.appendChild(group);
      });
    }

    templateSelect.replaceChildren(fragment);
    templateSelect.value = "custom";
    templateSelect.disabled = !scene;
  };

  templateSelect.addEventListener("change", () => {
    if (templateSelect.value === "custom") return;
    const template = TEMPLATE_BY_ID[templateSelect.value];
    const scene = currentSceneFromUI();
    if (!template || !scene || !isTemplateCompatibleWithScene(template, scene)) {
      templateSelect.value = "custom";
      showToast("القالب غير متوافق مع مرجع الغرفة الحالي", "warning", 3600);
      return;
    }

    const lightingId = resolveTemplateLighting(template, scene);
    applyingTemplate = true;
    const poseApplied = setSelectValue("poseSelect", template.poseId);
    const hairApplied = setSelectValue("hairSelect", template.hairId);
    const lightingApplied = setSelectValue("lightingSelect", lightingId);
    const expressionApplied = setSelectValue("expressionSelect", template.expressionId);
    const clothingApplied = setSelectValue("clothingSelect", template.clothingId);
    const aspectApplied = setSelectValue("aspectSelect", template.aspect);
    applyingTemplate = false;

    if (![poseApplied, hairApplied, lightingApplied, expressionApplied, clothingApplied, aspectApplied].every(Boolean)) {
      templateSelect.value = "custom";
      showToast("تعذر تطبيق القالب كاملًا على هذا المرجع", "error", 4200);
      return;
    }

    templateSelect.value = template.id;
    showToast(`تم تطبيق القالب: ${template.name_ar}`, "success", 3600);
  });

  ["poseSelect", "hairSelect", "lightingSelect", "expressionSelect", "clothingSelect", "aspectSelect"].forEach((id) => {
    document.querySelector(`#${id}`)?.addEventListener("change", () => {
      if (!applyingTemplate) templateSelect.value = "custom";
    });
  });

  const sceneObserver = new MutationObserver(() => {
    if (!applyingTemplate) populate();
  });
  sceneObserver.observe(sceneFilename, { childList: true, characterData: true, subtree: true });

  populate();
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initTemplateControl);
}
