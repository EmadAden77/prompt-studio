import { SCENES } from "./data/scenesData.js";
import { POSES } from "./data/posesData.js";
import { LIGHTING_BY_ID } from "./data/lightingData.js";
import { showToast } from "./ui/dom.js";

const DAY_TEMPLATES = Object.freeze([
  ["day_center_window", "standing_center", "window_daylight", "وسط الغرفة — ضوء نافذة طبيعي"],
  ["day_center_overcast", "standing_center", "overcast_flat", "وسط الغرفة — نهار غائم منتشر"],
  ["day_bedside_window", "standing_bedside", "window_daylight", "بجانب السرير — ضوء نافذة"],
  ["day_bedside_golden", "standing_bedside", "golden_hour", "بجانب السرير — ساعة ذهبية"],
  ["day_bededge_window", "sitting_bed_edge", "window_daylight", "حافة السرير — نهاري"],
  ["day_sofa_window", "sitting_sofa", "window_daylight", "الأريكة — ضوء نافذة"],
  ["day_sofa_overcast", "sitting_sofa", "overcast_flat", "الأريكة — نهار غائم هادئ"],
  ["day_chair_window", "sitting_chair", "window_daylight", "الكرسي — ضوء جانبي نهاري"],
  ["day_floor_overcast", "sitting_floor", "overcast_flat", "الأرض — نهار منتشر"],
  ["day_wardrobe_window", "standing_wardrobe", "window_daylight", "عند الدولاب — نهاري"],
  ["day_back_window", "lying_back", "window_daylight", "استلقاء على الظهر — نهاري"],
  ["day_back_overcast", "lying_back", "overcast_flat", "استلقاء على الظهر — غائم ناعم"],
  ["day_right_overcast", "lying_right_side", "overcast_flat", "استلقاء يمين — نهار غائم"],
  ["day_left_overcast", "lying_left_side", "overcast_flat", "استلقاء يسار — نهار غائم"],
  ["day_stomach_window", "lying_stomach", "window_daylight", "على البطن — ضوء نافذة"],
  ["day_recline_window", "semi_reclining", "window_daylight", "نصف استلقاء — نهاري"]
].map(([id, poseId, lightingId, name_ar]) => Object.freeze({ id, poseId, lightingId, name_ar })));

const NIGHT_TEMPLATES = Object.freeze([
  ["night_center_ceiling", "standing_center", "ceiling_white", "وسط الغرفة — سقف أبيض"],
  ["night_center_warm", "standing_center", "ceiling_warm", "وسط الغرفة — سقف دافئ"],
  ["night_center_screen", "standing_center", "phone_screen_only", "وسط الغرفة — شاشة الهاتف فقط"],
  ["night_bedside_lamp", "standing_bedside", "lamp_only", "بجانب السرير — أباجورة فقط"],
  ["night_bedside_lamp_phone", "standing_bedside", "lamp_and_phone", "بجانب السرير — أباجورة + شاشة"],
  ["night_bededge_lamp", "sitting_bed_edge", "lamp_only", "حافة السرير — أباجورة دافئة"],
  ["night_bededge_screen", "sitting_bed_edge", "phone_screen_only", "حافة السرير — شاشة الهاتف"],
  ["night_sofa_ceiling", "sitting_sofa", "ceiling_white", "الأريكة — سقف أبيض"],
  ["night_sofa_screen", "sitting_sofa", "phone_screen_only", "الأريكة — شاشة الهاتف فقط"],
  ["night_chair_ceiling", "sitting_chair", "ceiling_white", "الكرسي — سقف أبيض"],
  ["night_chair_screen", "sitting_chair", "phone_screen_only", "الكرسي — شاشة الهاتف فقط"],
  ["night_floor_screen", "sitting_floor", "phone_screen_only", "الأرض — شاشة الهاتف فقط"],
  ["night_wardrobe_ceiling", "standing_wardrobe", "ceiling_white", "عند الدولاب — سقف أبيض"],
  ["night_wardrobe_screen", "standing_wardrobe", "phone_screen_only", "عند الدولاب — شاشة الهاتف فقط"],
  ["night_back_screen", "lying_back", "phone_screen_only", "استلقاء على الظهر — شاشة الهاتف فقط"],
  ["night_back_lamp", "lying_back", "lamp_only", "استلقاء على الظهر — أباجورة"],
  ["night_right_lamp", "lying_right_side", "lamp_only", "استلقاء يمين — أباجورة"],
  ["night_right_screen", "lying_right_side", "phone_screen_only", "استلقاء يمين — شاشة الهاتف"],
  ["night_left_lamp", "lying_left_side", "lamp_only", "استلقاء يسار — أباجورة"],
  ["night_left_screen", "lying_left_side", "phone_screen_only", "استلقاء يسار — شاشة الهاتف"],
  ["night_stomach_screen", "lying_stomach", "phone_screen_only", "على البطن — شاشة الهاتف"],
  ["night_recline_lamp_phone", "semi_reclining", "lamp_and_phone", "نصف استلقاء — أباجورة + شاشة"],
  ["night_recline_ceiling", "semi_reclining", "ceiling_white", "نصف استلقاء — سقف أبيض"],
  ["night_city_back", "lying_back", "night_city_window", "السرير — مدينة خافتة + شاشة"],
  ["night_curtain_lamp", "semi_reclining", "curtain_lamp", "نصف استلقاء — ستارة مسدلة + أباجورة"]
].map(([id, poseId, lightingId, name_ar]) => Object.freeze({ id, poseId, lightingId, name_ar })));

const TEMPLATE_BY_ID = Object.freeze(Object.fromEntries([...DAY_TEMPLATES, ...NIGHT_TEMPLATES].map((item) => [item.id, item])));

function poseById(id) {
  return POSES.find((pose) => pose.id === id) ?? null;
}

function scenePassesTemplate(scene, template) {
  const pose = poseById(template.poseId);
  const lighting = LIGHTING_BY_ID[template.lightingId];
  if (!scene || !pose || !lighting) return false;
  if (!scene.supported_poses.includes(template.poseId)) return false;

  const features = new Set(scene.visible_features ?? []);
  const surfaces = new Set(scene.surfaces ?? []);
  if ((pose.requires ?? []).some((feature) => !features.has(feature))) return false;
  if ((pose.surfaces ?? []).some((surface) => !surfaces.has(surface))) return false;
  if ((lighting.required_features ?? []).some((feature) => !features.has(feature))) return false;

  const angleMatch = (pose.valid_angles ?? []).some((angle) => (scene.camera_angles ?? []).includes(angle));
  const distanceMatch = (pose.valid_distances ?? []).some((distance) => (scene.camera_distances ?? []).includes(distance));
  return angleMatch && distanceMatch;
}

function bestSceneFor(template) {
  return SCENES
    .filter((scene) => scenePassesTemplate(scene, template))
    .sort((a, b) => {
      const aDefault = (a.default_for_poses ?? []).includes(template.poseId) ? 1 : 0;
      const bDefault = (b.default_for_poses ?? []).includes(template.poseId) ? 1 : 0;
      if (aDefault !== bDefault) return bDefault - aDefault;
      return (b.priority ?? 0) - (a.priority ?? 0);
    })[0] ?? null;
}

function currentSceneFilename() {
  return document.querySelector("#sceneFilename")?.textContent?.trim() ?? "";
}

function selectSceneThroughApp(scene) {
  if (!scene) return false;
  if (currentSceneFilename() === scene.image_filename) return true;

  const opener = document.querySelector("#selectSceneBtn");
  const grid = document.querySelector("#scenePickerGrid");
  if (!opener || !grid) return false;

  opener.click();
  const button = grid.querySelector(`[data-scene-id="${CSS.escape(scene.id)}"]`);
  if (!button) {
    document.querySelector("#sceneDialog")?.close?.();
    return false;
  }
  button.click();
  return true;
}

function fillSelect(select, templates, emptyLabel) {
  if (!select) return;
  const previous = select.value;
  const fragment = document.createDocumentFragment();
  const custom = document.createElement("option");
  custom.value = "custom";
  custom.textContent = emptyLabel;
  fragment.appendChild(custom);

  templates.forEach((template) => {
    const scene = bestSceneFor(template);
    if (!scene) return;
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = `${template.name_ar} · ${scene.name_ar}`;
    fragment.appendChild(option);
  });

  select.replaceChildren(fragment);
  select.disabled = select.options.length <= 1;
  select.value = [...select.options].some((option) => option.value === previous) ? previous : "custom";
}

function restoreAfterReferenceSwitch(select, templateId) {
  queueMicrotask(() => {
    if ([...select.options].some((option) => option.value === templateId)) select.value = templateId;
    document.documentElement.dataset.activeIndoorTimeTemplate = templateId;
  });
}

function installAuthority() {
  const daySelect = document.querySelector("#indoorDayTemplateSelect");
  const nightSelect = document.querySelector("#indoorNightTemplateSelect");
  const sceneFilename = document.querySelector("#sceneFilename");
  if (!daySelect || !nightSelect || !sceneFilename) return;

  const repopulate = () => {
    fillSelect(daySelect, DAY_TEMPLATES, "اختر قالبًا نهاريًا");
    fillSelect(nightSelect, NIGHT_TEMPLATES, "اختر قالبًا ليليًا");

    const dayHint = daySelect.parentElement?.querySelector("small");
    const nightHint = nightSelect.parentElement?.querySelector("small");
    if (dayHint) dayHint.textContent = "القالب هو الأساس: عند اختياره يحدد الوضعية والإضاءة النهارية ويختار التطبيق أفضل مرجع غرفة متوافق تلقائيًا. الملابس والشعر والتعبير تبقى من اختيارك.";
    if (nightHint) nightHint.textContent = "القالب هو الأساس: عند اختياره يحدد الوضعية والإضاءة الليلية ويختار التطبيق أفضل مرجع غرفة متوافق تلقائيًا. الملابس والشعر والتعبير تبقى من اختيارك.";
  };

  document.addEventListener("change", (event) => {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement)) return;
    if (select.id !== "indoorDayTemplateSelect" && select.id !== "indoorNightTemplateSelect") return;
    if (select.value === "custom") return;

    const template = TEMPLATE_BY_ID[select.value];
    if (!template) return;
    const scene = bestSceneFor(template);
    if (!scene) {
      event.stopImmediatePropagation();
      select.value = "custom";
      showToast("لا يوجد مرجع غرفة يجتاز الشروط الصارمة لهذا القالب", "error", 4600);
      return;
    }

    const changed = currentSceneFilename() !== scene.image_filename;
    if (!selectSceneThroughApp(scene)) {
      event.stopImmediatePropagation();
      select.value = "custom";
      showToast("تعذر تبديل مرجع الغرفة تلقائيًا لهذا القالب", "error", 4600);
      return;
    }

    if (changed) restoreAfterReferenceSwitch(select, template.id);
    showToast(`القالب هو الأساس: تم اختيار المرجع الأنسب تلقائيًا — ${scene.name_ar}`, "success", 3600);
  }, true);

  new MutationObserver(() => queueMicrotask(repopulate))
    .observe(sceneFilename, { childList: true, characterData: true, subtree: true });

  repopulate();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installAuthority, { once: true });
  else installAuthority();
}
