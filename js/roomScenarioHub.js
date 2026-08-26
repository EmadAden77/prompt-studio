import "./globalSelfieArmPolicy.js";
import { SCENES } from "./data/scenesData.js";
import { LIGHTING_BY_ID } from "./data/lightingData.js";
import { CLOTHING_PREP_TEMPLATES, POST_SHOWER_TEMPLATES } from "./roomScenarioTemplates.js";
import { showToast } from "./ui/dom.js";

const GROUPS = Object.freeze([
  { id: "hubClothingPrepTemplate", icon: "👕", title: "قوالب تجهيز الملابس", templates: CLOTHING_PREP_TEMPLATES },
  { id: "hubPostShowerTemplate", icon: "🚿", title: "قوالب بعد الاستحمام", templates: POST_SHOWER_TEMPLATES }
]);

function lightingSupported(scene, lightingId) {
  const lighting = LIGHTING_BY_ID[lightingId];
  return Boolean(scene && lighting && (lighting.required_features ?? []).every((feature) => (scene.visible_features ?? []).includes(feature)));
}

function scenePasses(scene, template) {
  if (!scene?.supported_poses?.includes(template.poseId)) return false;
  return (template.lightingIds ?? []).some((id) => lightingSupported(scene, id));
}

function bestSceneFor(template) {
  return SCENES
    .filter((scene) => scenePasses(scene, template))
    .sort((a, b) => {
      const aDefault = (a.default_for_poses ?? []).includes(template.poseId) ? 1 : 0;
      const bDefault = (b.default_for_poses ?? []).includes(template.poseId) ? 1 : 0;
      if (aDefault !== bDefault) return bDefault - aDefault;
      return (b.priority ?? 0) - (a.priority ?? 0);
    })[0] ?? null;
}

function bestLightingFor(template, scene) {
  return (template.lightingIds ?? []).find((id) => lightingSupported(scene, id)) ?? null;
}

function currentSceneFilename() {
  return document.querySelector("#sceneFilename")?.textContent?.trim() ?? "";
}

function setSelect(id, value, dispatch = true) {
  const select = document.querySelector(`#${id}`);
  if (!select || ![...select.options].some((option) => option.value === value)) return false;
  select.value = value;
  if (dispatch) select.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function selectScene(scene) {
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

function resetOtherHubSelections(activeId) {
  document.querySelectorAll("#templateHub select").forEach((select) => {
    if (select.id !== activeId) select.value = "custom";
  });
  GROUPS.forEach(({ id }) => {
    if (id !== activeId) {
      const select = document.querySelector(`#${id}`);
      if (select) select.value = "custom";
    }
  });
}

function setPersonalControlState(scenario = null) {
  const clothing = document.querySelector("#clothingSelect");
  if (!clothing) return;
  const field = clothing.closest(".field");
  let note = field?.querySelector("[data-scenario-clothing-note]");

  const forcedTowel = scenario?.forcedClothingId === "bath_towel_only";
  clothing.disabled = forcedTowel;
  if (forcedTowel) {
    if (!note && field) {
      note = document.createElement("small");
      note.dataset.scenarioClothingNote = "true";
      field.appendChild(note);
    }
    if (note) note.textContent = "هذا القالب يفرض منشفة حمام حول الخصر فقط. اختيار الملابس اليدوي متوقف حتى تغيير القالب.";
  } else if (note) {
    note.remove();
  }
}

function clearScenario() {
  delete document.documentElement.dataset.activeRoomScenario;
  setPersonalControlState(null);
}

function applyScenario(template, select) {
  const scene = bestSceneFor(template);
  const lightingId = scene ? bestLightingFor(template, scene) : null;
  if (!scene || !lightingId) {
    select.value = "custom";
    showToast("لا يوجد مرجع غرفة يجتاز شروط هذا القالب بدون تغيير تفاصيل الغرفة", "error", 4600);
    return;
  }

  resetOtherHubSelections(select.id);
  clearScenario();
  const changed = currentSceneFilename() !== scene.image_filename;
  if (!selectScene(scene)) {
    select.value = "custom";
    showToast("تعذر اختيار مرجع الغرفة المناسب تلقائيًا", "error", 4600);
    return;
  }

  const run = () => {
    if (!setSelect("poseSelect", template.poseId, true)) {
      select.value = "custom";
      showToast("تعذر تطبيق وضعية القالب على المرجع المختار", "error", 4600);
      return;
    }
    if (!setSelect("lightingSelect", lightingId, true)) {
      select.value = "custom";
      showToast("تعذر تطبيق إضاءة القالب", "error", 4600);
      return;
    }

    document.documentElement.dataset.activeRoomScenario = template.id;
    document.documentElement.dataset.activeTemplateHub = template.id;
    setPersonalControlState(template);
    select.value = template.id;
    document.querySelector("#rebuildBtn")?.click();
    showToast(`تم تطبيق: ${template.name_ar} — الغرفة مقفلة على IMAGE B بدون أي تغيير`, "success", 4500);
  };

  if (changed) requestAnimationFrame(() => requestAnimationFrame(run));
  else run();
}

function buildCard(group) {
  const card = document.createElement("article");
  card.className = "template-hub__card";
  card.dataset.roomScenarioGroup = group.id;

  const label = document.createElement("label");
  label.htmlFor = group.id;
  const icon = document.createElement("span");
  icon.className = "template-hub__icon";
  icon.textContent = group.icon;
  const strong = document.createElement("strong");
  strong.textContent = group.title;
  label.append(icon, strong);

  const select = document.createElement("select");
  select.id = group.id;
  const off = document.createElement("option");
  off.value = "custom";
  off.textContent = "اختر قالبًا";
  select.appendChild(off);

  group.templates.forEach((template) => {
    if (!bestSceneFor(template)) return;
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = template.name_ar;
    select.appendChild(option);
  });

  select.disabled = select.options.length <= 1;
  select.addEventListener("change", () => {
    if (select.value === "custom") {
      clearScenario();
      document.querySelector("#rebuildBtn")?.click();
      return;
    }
    const template = group.templates.find((item) => item.id === select.value);
    if (template) applyScenario(template, select);
  });

  card.append(label, select);
  return card;
}

function installRoomScenarioHub() {
  const grid = document.querySelector("#templateHub .template-hub__grid");
  if (!grid || document.querySelector("#hubClothingPrepTemplate")) return;
  GROUPS.forEach((group) => grid.appendChild(buildCard(group)));

  document.querySelectorAll("#templateHub select").forEach((select) => {
    if (GROUPS.some((group) => group.id === select.id)) return;
    select.addEventListener("change", () => {
      if (select.value !== "custom") clearScenario();
    });
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installRoomScenarioHub, { once: true });
  else installRoomScenarioHub();
}
