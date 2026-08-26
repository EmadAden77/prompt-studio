import { SCENES } from "./data/scenesData.js";
import { LIGHTING_BY_ID } from "./data/lightingData.js";
import { TEMPLATE_PRESETS, sceneSupportsTemplateRequirements } from "./templates.js";
import { HIDDEN_ARM_TEMPLATE_PRESETS } from "./hiddenArmTemplates.js";
import { INDOOR_DAY_TEMPLATES, INDOOR_NIGHT_TEMPLATES } from "./indoorTimeTemplates.js";
import { showToast } from "./ui/dom.js";

const STANDARD_GROUPS = Object.freeze({
  bed: { id: "hubBedTemplate", icon: "🛏️", title: "قوالب الاستلقاء والسرير" },
  sitting: { id: "hubSittingTemplate", icon: "🪑", title: "قوالب الجلوس" },
  standing: { id: "hubStandingTemplate", icon: "🧍", title: "قوالب الوقوف" },
  mirror: { id: "hubMirrorTemplate", icon: "🪞", title: "قوالب المرآة" }
});

const SELECT_DEFS = Object.freeze([
  { id: "hubStandardTemplate", icon: "📸", title: "قوالب سيلفي عادية", kind: "standard", templates: TEMPLATE_PRESETS },
  { id: "hubHiddenTemplate", icon: "🙈", title: "قوالب سيلفي بدون ظهور الذراع", kind: "hidden", templates: HIDDEN_ARM_TEMPLATE_PRESETS },
  { id: "hubDayTemplate", icon: "☀️", title: "قوالب نهارية داخل الغرفة", kind: "day", templates: INDOOR_DAY_TEMPLATES },
  { id: "hubNightTemplate", icon: "🌙", title: "قوالب ليلية داخل الغرفة", kind: "night", templates: INDOOR_NIGHT_TEMPLATES },
  ...Object.entries(STANDARD_GROUPS).map(([group, meta]) => ({ ...meta, kind: "standard", templates: TEMPLATE_PRESETS.filter((item) => item.group === group) }))
]);

function lightingSupported(scene, lightingId) {
  const lighting = LIGHTING_BY_ID[lightingId];
  if (!scene || !lighting) return false;
  return (lighting.required_features ?? []).every((feature) => (scene.visible_features ?? []).includes(feature));
}

function templateLightingIds(template) {
  if (template.lightingId) return [template.lightingId];
  if (Array.isArray(template.lightingIds)) return template.lightingIds;
  return ["window_daylight", "ceiling_white", "lamp_and_phone", "phone_screen_only"];
}

function scenePasses(template, scene, kind) {
  if (!template || !scene || !scene.supported_poses?.includes(template.poseId)) return false;
  const features = new Set(scene.visible_features ?? []);
  if ((template.requiresAll ?? []).some((feature) => !features.has(feature))) return false;
  if ((template.requiresAny ?? []).length && !(template.requiresAny ?? []).some((feature) => features.has(feature))) return false;
  if (kind === "standard" && !sceneSupportsTemplateRequirements(template, scene)) return false;
  return templateLightingIds(template).some((id) => lightingSupported(scene, id));
}

function bestSceneFor(template, kind) {
  return SCENES
    .filter((scene) => scenePasses(template, scene, kind))
    .sort((a, b) => {
      const aDefault = (a.default_for_poses ?? []).includes(template.poseId) ? 1 : 0;
      const bDefault = (b.default_for_poses ?? []).includes(template.poseId) ? 1 : 0;
      if (aDefault !== bDefault) return bDefault - aDefault;
      return (b.priority ?? 0) - (a.priority ?? 0);
    })[0] ?? null;
}

function bestLightingFor(template, scene) {
  return templateLightingIds(template).find((id) => lightingSupported(scene, id)) ?? null;
}

function currentSceneFilename() {
  return document.querySelector("#sceneFilename")?.textContent?.trim() ?? "";
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

function setSelect(id, value, dispatch = true) {
  const select = document.querySelector(`#${id}`);
  if (!select) return false;
  const option = [...select.options].find((item) => item.value === value);
  if (!option) return false;
  select.value = value;
  if (dispatch) select.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function afterReferenceSwitch(callback) {
  requestAnimationFrame(() => requestAnimationFrame(callback));
}

function clearUnderlyingTemplates(kind) {
  if (kind !== "standard") setSelect("templateSelect", "custom", true);
  if (kind !== "hidden") setSelect("hiddenArmTemplateSelect", "custom", true);
  if (kind !== "day") setSelect("indoorDayTemplateSelect", "custom", false);
  if (kind !== "night") setSelect("indoorNightTemplateSelect", "custom", false);
  delete document.documentElement.dataset.activeIndoorTimeTemplate;
}

function applyStandard(template, scene) {
  const lightingId = bestLightingFor(template, scene);
  clearUnderlyingTemplates("standard");
  setSelect("lightingSelect", lightingId, true);
  if (!setSelect("templateSelect", template.id, true)) return false;
  return true;
}

function applyHidden(template, scene) {
  const lightingId = bestLightingFor(template, scene);
  clearUnderlyingTemplates("hidden");
  if (lightingId) setSelect("lightingSelect", lightingId, true);
  if (!setSelect("hiddenArmTemplateSelect", template.id, true)) return false;
  return true;
}

function applyTimed(template, kind) {
  clearUnderlyingTemplates(kind);
  const id = kind === "day" ? "indoorDayTemplateSelect" : "indoorNightTemplateSelect";
  return setSelect(id, template.id, true);
}

function resetHubSelections(activeId) {
  SELECT_DEFS.forEach(({ id }) => {
    if (id === activeId) return;
    const select = document.querySelector(`#${id}`);
    if (select) select.value = "custom";
  });
}

function applyHubTemplate(def, template, hubSelect) {
  const scene = bestSceneFor(template, def.kind);
  if (!scene) {
    hubSelect.value = "custom";
    showToast("لا يوجد مرجع غرفة يجتاز الشروط الصارمة لهذا القالب", "error", 4600);
    return;
  }

  resetHubSelections(hubSelect.id);
  const sceneChanged = currentSceneFilename() !== scene.image_filename;
  if (!selectScene(scene)) {
    hubSelect.value = "custom";
    showToast("تعذر اختيار المرجع المناسب للقالب تلقائيًا", "error", 4600);
    return;
  }

  const run = () => {
    let applied = false;
    if (def.kind === "standard") applied = applyStandard(template, scene);
    else if (def.kind === "hidden") applied = applyHidden(template, scene);
    else applied = applyTimed(template, def.kind);

    if (!applied) {
      hubSelect.value = "custom";
      showToast("تعذر تطبيق القالب بعد تبديل المرجع", "error", 4600);
      return;
    }

    hubSelect.value = template.id;
    document.documentElement.dataset.activeTemplateHub = template.id;
    document.querySelector("#rebuildBtn")?.click();
    showToast(`تم تطبيق القالب واختيار المرجع تلقائيًا: ${template.name_ar}`, "success", 4200);
  };

  if (sceneChanged) afterReferenceSwitch(run);
  else run();
}

function buildHub() {
  const intro = document.querySelector(".intro");
  if (!intro || document.querySelector("#templateHub")) return;

  const section = document.createElement("section");
  section.id = "templateHub";
  section.className = "template-hub";
  section.setAttribute("aria-labelledby", "templateHubTitle");

  const header = document.createElement("div");
  header.className = "template-hub__header";
  const titleWrap = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "TEMPLATE FIRST";
  const title = document.createElement("h2");
  title.id = "templateHubTitle";
  title.textContent = "اختر نوع القالب أولًا";
  const note = document.createElement("p");
  note.textContent = "القالب يضبط المرجع والوضعية والإضاءة والكاميرا تلقائيًا. يبقى لك فقط الشعر وتعبير الوجه والملابس.";
  titleWrap.append(eyebrow, title, note);
  header.appendChild(titleWrap);

  const grid = document.createElement("div");
  grid.className = "template-hub__grid";

  SELECT_DEFS.forEach((def) => {
    const card = document.createElement("article");
    card.className = "template-hub__card";
    const label = document.createElement("label");
    label.htmlFor = def.id;
    const icon = document.createElement("span");
    icon.className = "template-hub__icon";
    icon.textContent = def.icon;
    const text = document.createElement("strong");
    text.textContent = def.title;
    label.append(icon, text);

    const select = document.createElement("select");
    select.id = def.id;
    select.dataset.templateKind = def.kind;
    const off = document.createElement("option");
    off.value = "custom";
    off.textContent = "اختر قالبًا";
    select.appendChild(off);

    def.templates.forEach((template) => {
      const scene = bestSceneFor(template, def.kind);
      if (!scene) return;
      const option = document.createElement("option");
      option.value = template.id;
      option.textContent = template.name_ar;
      select.appendChild(option);
    });

    select.disabled = select.options.length <= 1;
    select.addEventListener("change", () => {
      if (select.value === "custom") return;
      const template = def.templates.find((item) => item.id === select.value);
      if (template) applyHubTemplate(def, template, select);
    });

    card.append(label, select);
    grid.appendChild(card);
  });

  section.append(header, grid);
  intro.after(section);
}

function simplifyManualControls() {
  const templateField = document.querySelector("#templateSelect")?.closest(".field");
  const poseField = document.querySelector("#poseSelect")?.closest(".field");
  const lightingField = document.querySelector("#lightingSelect")?.closest(".field");
  const aspectField = document.querySelector("#aspectSelect")?.closest(".field");
  [templateField, poseField, lightingField, aspectField].forEach((field) => {
    if (field) {
      field.hidden = true;
      field.dataset.templateControlled = "true";
    }
  });

  const optionsTitle = document.querySelector("#optionsTitle");
  if (optionsTitle) optionsTitle.textContent = "اختياراتك الشخصية";
  const form = document.querySelector("#optionsForm");
  const hair = document.querySelector("#hairSelect")?.closest(".field");
  const expression = document.querySelector("#expressionSelect")?.closest(".field");
  const clothing = document.querySelector("#clothingSelect")?.closest(".field");
  [hair, expression, clothing].forEach((field) => field?.classList.add("field--wide"));
  if (form) form.dataset.personalOnly = "true";

  document.querySelectorAll('[data-hidden-arm-templates="true"]').forEach((field) => { field.hidden = true; });
  document.querySelectorAll('[data-indoor-time-templates]').forEach((panel) => { panel.hidden = true; });
}

function installStyles() {
  if (document.querySelector("#templateHubStyles")) return;
  const style = document.createElement("style");
  style.id = "templateHubStyles";
  style.textContent = `
.template-hub{max-width:1180px;margin:0 auto 24px;padding:22px;border:1px solid var(--border-color,rgba(127,127,127,.18));border-radius:24px;background:var(--panel-bg,rgba(20,24,32,.72))}
.template-hub__header{display:flex;justify-content:space-between;gap:16px;margin-bottom:18px}.template-hub__header h2{margin:2px 0 6px;font-size:clamp(1.35rem,4vw,2rem)}.template-hub__header p:last-child{margin:0;opacity:.72;line-height:1.8}
.template-hub__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.template-hub__card{padding:14px;border:1px solid var(--border-color,rgba(127,127,127,.18));border-radius:16px;background:rgba(127,127,127,.035)}.template-hub__card label{display:flex;align-items:center;gap:9px;margin-bottom:9px}.template-hub__icon{font-size:1.2rem}.template-hub__card select{width:100%}
#optionsForm[data-personal-only="true"]{grid-template-columns:1fr}
@media(max-width:700px){.template-hub{margin:0 16px 20px;padding:16px}.template-hub__grid{grid-template-columns:1fr}.template-hub__header{display:block}}
`;
  document.head.appendChild(style);
}

function installTemplateHub() {
  installStyles();
  buildHub();
  requestAnimationFrame(() => requestAnimationFrame(simplifyManualControls));
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installTemplateHub, { once: true });
  else installTemplateHub();
}
