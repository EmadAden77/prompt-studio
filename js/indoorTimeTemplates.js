import { SCENES } from "./data/scenesData.js";
import { LIGHTING_BY_ID } from "./data/lightingData.js";
import { showToast } from "./ui/dom.js";

const preset = (id, period, name_ar, poseId, lightingId) => Object.freeze({ id, period, name_ar, poseId, lightingId });

export const INDOOR_DAY_TEMPLATES = Object.freeze([
  preset("day_center_window", "day", "وسط الغرفة — ضوء نافذة طبيعي", "standing_center", "window_daylight"),
  preset("day_center_overcast", "day", "وسط الغرفة — نهار غائم منتشر", "standing_center", "overcast_flat"),
  preset("day_bedside_window", "day", "بجانب السرير — ضوء نافذة", "standing_bedside", "window_daylight"),
  preset("day_bedside_golden", "day", "بجانب السرير — ساعة ذهبية", "standing_bedside", "golden_hour"),
  preset("day_bededge_window", "day", "حافة السرير — نهاري", "sitting_bed_edge", "window_daylight"),
  preset("day_sofa_window", "day", "الأريكة — ضوء نافذة", "sitting_sofa", "window_daylight"),
  preset("day_sofa_overcast", "day", "الأريكة — نهار غائم هادئ", "sitting_sofa", "overcast_flat"),
  preset("day_chair_window", "day", "الكرسي — ضوء جانبي نهاري", "sitting_chair", "window_daylight"),
  preset("day_floor_overcast", "day", "الأرض — نهار منتشر", "sitting_floor", "overcast_flat"),
  preset("day_wardrobe_window", "day", "عند الدولاب — نهاري", "standing_wardrobe", "window_daylight"),
  preset("day_back_window", "day", "استلقاء على الظهر — نهاري", "lying_back", "window_daylight"),
  preset("day_back_overcast", "day", "استلقاء على الظهر — غائم ناعم", "lying_back", "overcast_flat"),
  preset("day_right_overcast", "day", "استلقاء يمين — نهار غائم", "lying_right_side", "overcast_flat"),
  preset("day_left_overcast", "day", "استلقاء يسار — نهار غائم", "lying_left_side", "overcast_flat"),
  preset("day_stomach_window", "day", "على البطن — ضوء نافذة", "lying_stomach", "window_daylight"),
  preset("day_recline_window", "day", "نصف استلقاء — نهاري", "semi_reclining", "window_daylight")
]);

export const INDOOR_NIGHT_TEMPLATES = Object.freeze([
  preset("night_center_ceiling", "night", "وسط الغرفة — سقف أبيض", "standing_center", "ceiling_white"),
  preset("night_center_warm", "night", "وسط الغرفة — سقف دافئ", "standing_center", "ceiling_warm"),
  preset("night_center_screen", "night", "وسط الغرفة — شاشة الهاتف فقط", "standing_center", "phone_screen_only"),
  preset("night_bedside_lamp", "night", "بجانب السرير — أباجورة فقط", "standing_bedside", "lamp_only"),
  preset("night_bedside_lamp_phone", "night", "بجانب السرير — أباجورة + شاشة", "standing_bedside", "lamp_and_phone"),
  preset("night_bededge_lamp", "night", "حافة السرير — أباجورة دافئة", "sitting_bed_edge", "lamp_only"),
  preset("night_bededge_screen", "night", "حافة السرير — شاشة الهاتف", "sitting_bed_edge", "phone_screen_only"),
  preset("night_sofa_ceiling", "night", "الأريكة — سقف أبيض", "sitting_sofa", "ceiling_white"),
  preset("night_sofa_screen", "night", "الأريكة — شاشة الهاتف فقط", "sitting_sofa", "phone_screen_only"),
  preset("night_chair_ceiling", "night", "الكرسي — سقف أبيض", "sitting_chair", "ceiling_white"),
  preset("night_chair_screen", "night", "الكرسي — شاشة الهاتف فقط", "sitting_chair", "phone_screen_only"),
  preset("night_floor_screen", "night", "الأرض — شاشة الهاتف فقط", "sitting_floor", "phone_screen_only"),
  preset("night_wardrobe_ceiling", "night", "عند الدولاب — سقف أبيض", "standing_wardrobe", "ceiling_white"),
  preset("night_wardrobe_screen", "night", "عند الدولاب — شاشة الهاتف فقط", "standing_wardrobe", "phone_screen_only"),
  preset("night_back_screen", "night", "استلقاء على الظهر — شاشة الهاتف فقط", "lying_back", "phone_screen_only"),
  preset("night_back_lamp", "night", "استلقاء على الظهر — أباجورة", "lying_back", "lamp_only"),
  preset("night_right_lamp", "night", "استلقاء يمين — أباجورة", "lying_right_side", "lamp_only"),
  preset("night_right_screen", "night", "استلقاء يمين — شاشة الهاتف", "lying_right_side", "phone_screen_only"),
  preset("night_left_lamp", "night", "استلقاء يسار — أباجورة", "lying_left_side", "lamp_only"),
  preset("night_left_screen", "night", "استلقاء يسار — شاشة الهاتف", "lying_left_side", "phone_screen_only"),
  preset("night_stomach_screen", "night", "على البطن — شاشة الهاتف", "lying_stomach", "phone_screen_only"),
  preset("night_recline_lamp_phone", "night", "نصف استلقاء — أباجورة + شاشة", "semi_reclining", "lamp_and_phone"),
  preset("night_recline_ceiling", "night", "نصف استلقاء — سقف أبيض", "semi_reclining", "ceiling_white"),
  preset("night_city_back", "night", "السرير — مدينة خافتة + شاشة", "lying_back", "night_city_window"),
  preset("night_curtain_lamp", "night", "نصف استلقاء — ستارة مسدلة + أباجورة", "semi_reclining", "curtain_lamp")
]);

function currentScene() {
  const filename = document.querySelector("#sceneFilename")?.textContent?.trim();
  return SCENES.find((scene) => scene.image_filename === filename) ?? null;
}

function isCompatible(template, scene) {
  if (!template || !scene || !scene.supported_poses.includes(template.poseId)) return false;
  const lighting = LIGHTING_BY_ID[template.lightingId];
  return Boolean(lighting && (lighting.required_features ?? []).every((feature) => (scene.visible_features ?? []).includes(feature)));
}

function setSelectValue(id, value) {
  const select = document.querySelector(`#${id}`);
  if (!select || ![...select.options].some((option) => option.value === value)) return false;
  select.value = value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function resetOtherTemplateControls(activeId) {
  const regular = document.querySelector("#templateSelect");
  if (regular) regular.value = "custom";
  document.documentElement.dataset.activeTemplate = "custom";

  const hidden = document.querySelector("#hiddenArmTemplateSelect");
  if (hidden) hidden.value = "custom";
  document.documentElement.dataset.activeHiddenArmTemplate = "custom";

  const other = document.querySelector(activeId === "indoorDayTemplateSelect" ? "#indoorNightTemplateSelect" : "#indoorDayTemplateSelect");
  if (other) other.value = "custom";
}

function buildPanel({ id, title, icon, hint }) {
  const section = document.createElement("section");
  section.className = "panel";
  section.dataset.indoorTimeTemplates = id;

  const header = document.createElement("div");
  header.className = "panel__header";
  const titleWrap = document.createElement("div");
  const step = document.createElement("span");
  step.className = "step-number";
  step.textContent = icon;
  const h2 = document.createElement("h2");
  h2.textContent = title;
  titleWrap.append(step, h2);
  header.appendChild(titleWrap);

  const field = document.createElement("div");
  field.className = "field field--wide";
  const select = document.createElement("select");
  select.id = id;
  const option = document.createElement("option");
  option.value = "custom";
  option.textContent = "اختر مرجع الغرفة أولًا";
  select.appendChild(option);
  select.disabled = true;
  const small = document.createElement("small");
  small.textContent = hint;
  field.append(select, small);

  section.append(header, field);
  return { section, select };
}

function installIndoorTimeTemplateSections() {
  if (document.querySelector("#indoorDayTemplateSelect") || document.querySelector("#indoorNightTemplateSelect")) return;
  const optionsPanel = document.querySelector("#optionsForm")?.closest("section.panel");
  const sceneFilename = document.querySelector("#sceneFilename");
  if (!optionsPanel || !sceneFilename) return;

  const day = buildPanel({
    id: "indoorDayTemplateSelect",
    title: "قوالب نهارية داخل الغرفة مع وضعيات",
    icon: "☀️",
    hint: "كل قالب يختار الوضعية + الإضاءة النهارية معًا. الملابس والشعر والتعبير تبقى من اختيارك."
  });
  const night = buildPanel({
    id: "indoorNightTemplateSelect",
    title: "قوالب ليلية داخل الغرفة مع وضعيات",
    icon: "🌙",
    hint: "كل قالب يختار الوضعية + الإضاءة الليلية معًا. الملابس والشعر والتعبير تبقى من اختيارك."
  });

  optionsPanel.after(day.section, night.section);

  let lastScene = "";
  const populateOne = (select, templates) => {
    const scene = currentScene();
    const fragment = document.createDocumentFragment();
    const custom = document.createElement("option");
    custom.value = "custom";
    custom.textContent = scene ? "بدون قالب" : "اختر مرجع الغرفة أولًا";
    fragment.appendChild(custom);
    if (scene) {
      templates.filter((template) => isCompatible(template, scene)).forEach((template) => {
        const option = document.createElement("option");
        option.value = template.id;
        option.textContent = template.name_ar;
        fragment.appendChild(option);
      });
    }
    select.replaceChildren(fragment);
    select.value = "custom";
    select.disabled = !scene || select.options.length <= 1;
  };

  const populate = () => {
    populateOne(day.select, INDOOR_DAY_TEMPLATES);
    populateOne(night.select, INDOOR_NIGHT_TEMPLATES);
    lastScene = sceneFilename.textContent?.trim() ?? "";
  };

  const applyTemplate = (select, templates) => {
    if (select.value === "custom") return;
    const template = templates.find((item) => item.id === select.value);
    const scene = currentScene();
    if (!template || !isCompatible(template, scene)) {
      select.value = "custom";
      showToast("هذا القالب غير متوافق مع مرجع الغرفة الحالي", "warning", 3600);
      return;
    }

    resetOtherTemplateControls(select.id);
    const poseApplied = setSelectValue("poseSelect", template.poseId);
    const lightApplied = setSelectValue("lightingSelect", template.lightingId);
    if (!poseApplied || !lightApplied) {
      select.value = "custom";
      showToast("تعذر تطبيق الوضعية أو الإضاءة لهذا المرجع", "error", 4200);
      return;
    }

    document.documentElement.dataset.activeIndoorTimeTemplate = template.id;
    document.querySelector("#rebuildBtn")?.click();
    showToast(`تم تطبيق القالب: ${template.name_ar} — الملابس والشعر والتعبير بقيت كما اخترتها`, "success", 4200);
  };

  day.select.addEventListener("change", () => applyTemplate(day.select, INDOOR_DAY_TEMPLATES));
  night.select.addEventListener("change", () => applyTemplate(night.select, INDOOR_NIGHT_TEMPLATES));

  ["poseSelect", "lightingSelect"].forEach((id) => {
    document.querySelector(`#${id}`)?.addEventListener("change", () => {
      const active = document.documentElement.dataset.activeIndoorTimeTemplate;
      if (!active) return;
      const all = [...INDOOR_DAY_TEMPLATES, ...INDOOR_NIGHT_TEMPLATES];
      const template = all.find((item) => item.id === active);
      if (!template) return;
      const poseValue = document.querySelector("#poseSelect")?.value;
      const lightValue = document.querySelector("#lightingSelect")?.value;
      if (poseValue !== template.poseId || lightValue !== template.lightingId) {
        day.select.value = "custom";
        night.select.value = "custom";
        delete document.documentElement.dataset.activeIndoorTimeTemplate;
      }
    });
  });

  new MutationObserver(() => {
    const current = sceneFilename.textContent?.trim() ?? "";
    if (current !== lastScene) populate();
  }).observe(sceneFilename, { childList: true, characterData: true, subtree: true });

  populate();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installIndoorTimeTemplateSections, { once: true });
  } else {
    installIndoorTimeTemplateSections();
  }
}
