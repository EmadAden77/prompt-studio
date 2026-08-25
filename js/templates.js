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

const preset = (id, group, name_ar, poseId, expressionId, hairId, clothingId, lightingIds, aspect = "9:16") =>
  Object.freeze({ id, group, name_ar, poseId, expressionId, hairId, clothingId, lightingIds: Object.freeze(lightingIds), aspect });

export const TEMPLATE_PRESETS = Object.freeze([
  preset("back_relaxed", "bed", "استلقاء على الظهر — طبيعي هادئ", "lying_back", "relaxed", "messy", "cotton_pajama", ["window_daylight", "ceiling_white", "lamp_and_phone", "phone_screen_only"]),
  preset("stomach_relaxed", "bed", "استلقاء على البطن — سيلفي طبيعي", "lying_stomach", "relaxed", "messy", "sleep_tee_shorts", ["window_daylight", "ceiling_white", "lamp_and_phone", "phone_screen_only"]),
  preset("right_side_warm", "bed", "الجانب الأيمن — إضاءة دافئة واقعية", "lying_right_side", "relaxed", "messy", "cotton_pajama", ["lamp_only", "lamp_and_phone", "phone_screen_only"]),
  preset("left_side_lowlight", "bed", "الجانب الأيسر — إضاءة هاتف خافتة", "lying_left_side", "relaxed", "messy", "cotton_pajama", ["phone_screen_only"]),
  preset("semi_reclining_home", "bed", "نصف استلقاء — منزلي عفوي", "semi_reclining", "serious", "same", "thermal_sleep", ["lamp_and_phone", "ceiling_warm", "ceiling_white", "phone_screen_only"]),
  preset("bed_edge_casual", "bed", "حافة السرير — كاجوال طبيعي", "sitting_bed_edge", "serious", "neat", "heather_tee_jeans", ["window_daylight", "ceiling_white", "lamp_and_phone", "phone_screen_only"]),
  preset("sofa_casual", "sitting", "الأريكة — كاجوال نهاري", "sitting_sofa", "relaxed", "same", "heather_tee_jeans", ["window_daylight", "overcast_flat", "phone_screen_only"]),
  preset("chair_neat", "sitting", "الكرسي — مرتب داخلي", "sitting_chair", "serious", "neat", "oxford_shirt_chino", ["ceiling_white", "phone_screen_only"]),
  preset("floor_relaxed", "sitting", "الأرض — جلسة عفوية", "sitting_floor", "relaxed", "messy", "hoodie_sweats", ["window_daylight", "ceiling_white", "phone_screen_only"]),
  preset("center_confident", "standing", "وسط الغرفة — وقوف واثق طبيعي", "standing_center", "confident", "neat", "oxford_shirt_chino", ["window_daylight", "ceiling_white", "phone_screen_only"]),
  preset("bedside_thobe", "standing", "بجانب السرير — ثوب أبيض", "standing_bedside", "confident", "neat", "thobe", ["window_daylight", "ceiling_white", "lamp_only", "phone_screen_only"]),
  preset("sofa_standing_casual", "standing", "عند الأريكة — وقوف كاجوال", "standing_sofa", "relaxed", "same", "longsleeve_chino", ["window_daylight", "overcast_flat", "phone_screen_only"]),
  preset("vanity_standing", "standing", "أمام التسريحة — وقوف مرتب", "standing_vanity", "confident", "neat", "oxford_shirt_chino", ["ceiling_white", "phone_screen_only"]),
  preset("wardrobe_neat", "standing", "عند الدولاب — وقوف هادئ", "standing_wardrobe", "serious", "neat", "thobe", ["ceiling_white", "phone_screen_only"]),
  preset("mirror_classic", "mirror", "مرآة التسريحة — كلاسيكي واقعي", "mirror_selfie", "confident", "neat", "thobe", ["ceiling_white"])
]);

export const TEMPLATE_BY_ID = Object.freeze(Object.fromEntries(TEMPLATE_PRESETS.map((item) => [item.id, item])));

const LIGHTING_BY_ID = Object.freeze(Object.fromEntries(LIGHTING_OPTIONS.map((item) => [item.id, item])));
const POSE_IDS = new Set(POSES.map((item) => item.id));
const EXPRESSION_IDS = new Set(EXPRESSION_OPTIONS.map((item) => item.id));
const HAIR_IDS = new Set(HAIR_OPTIONS.map((item) => item.id));
const CLOTHING_IDS = new Set(CLOTHING_OPTIONS.map((item) => item.id));

export function isLightingSupportedByScene(lightingId, scene) {
  const lighting = LIGHTING_BY_ID[lightingId];
  return Boolean(lighting && scene && (lighting.required_features ?? []).every((feature) => scene.visible_features.includes(feature)));
}

export function resolveTemplateLighting(template, scene) {
  if (!template || !scene) return null;
  return template.lightingIds.find((lightingId) => isLightingSupportedByScene(lightingId, scene)) ?? null;
}

export function isTemplateCompatibleWithScene(template, scene) {
  return Boolean(template && scene && scene.supported_poses.includes(template.poseId) && resolveTemplateLighting(template, scene));
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
  if (!select || ![...select.options].some((option) => option.value === value)) return false;
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
  let lastSceneFilename = null;

  const populate = () => {
    const scene = currentSceneFromUI();
    lastSceneFilename = sceneFilename.textContent?.trim() ?? "";
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
    const applied = [
      setSelectValue("poseSelect", template.poseId),
      setSelectValue("hairSelect", template.hairId),
      setSelectValue("lightingSelect", lightingId),
      setSelectValue("expressionSelect", template.expressionId),
      setSelectValue("clothingSelect", template.clothingId),
      setSelectValue("aspectSelect", template.aspect)
    ];
    applyingTemplate = false;

    if (!applied.every(Boolean)) {
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

  new MutationObserver(() => {
    const currentFilename = sceneFilename.textContent?.trim() ?? "";
    if (currentFilename !== lastSceneFilename) populate();
  }).observe(sceneFilename, { childList: true, characterData: true, subtree: true });

  populate();
}

if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", initTemplateControl);
