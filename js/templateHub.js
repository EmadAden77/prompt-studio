import { BEDROOM_TEMPLATES_V2, BEDROOM_TEMPLATE_GROUPS } from "./bedroomTemplatesV2.js";
import { showToast } from "./ui/dom.js";

const GROUP_ORDER = ["bed", "sitting", "standing"];

function setSelect(id, value, dispatch = true) {
  const select = document.querySelector(`#${id}`);
  if (!select) return false;
  const option = [...select.options].find((item) => item.value === value);
  if (!option) return false;
  select.value = value;
  if (dispatch) select.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function selectInternalScene(sceneId) {
  if (!sceneId) return true;
  const opener = document.querySelector("#selectSceneBtn");
  const grid = document.querySelector("#scenePickerGrid");
  if (!opener || !grid) return false;
  opener.click();
  const button = grid.querySelector(`[data-scene-id="${CSS.escape(sceneId)}"]`);
  if (!button) {
    document.querySelector("#sceneDialog")?.close?.();
    return false;
  }
  button.click();
  return true;
}

function clearLegacyTemplateState() {
  setSelect("templateSelect", "custom", true);
  setSelect("hiddenArmTemplateSelect", "custom", false);
  setSelect("indoorDayTemplateSelect", "custom", false);
  setSelect("indoorNightTemplateSelect", "custom", false);
  ["hubClothingPrepTemplate", "hubPostShowerTemplate"].forEach((id) => setSelect(id, "custom", false));
  delete document.documentElement.dataset.activeTemplate;
  delete document.documentElement.dataset.activeTemplateHub;
  delete document.documentElement.dataset.activeIndoorTimeTemplate;
  delete document.documentElement.dataset.activeRoomScenario;
}

function applyTemplate(template, select) {
  clearLegacyTemplateState();

  if (!selectInternalScene(template.sceneId)) {
    select.value = "custom";
    showToast("تعذر تجهيز خريطة التفاعل الداخلية للقالب", "error", 4200);
    return;
  }

  const run = () => {
    const poseOk = setSelect("poseSelect", template.poseId, true);
    setSelect("expressionSelect", template.expressionId, true);
    setSelect("hairSelect", template.hairId, true);
    setSelect("clothingSelect", template.clothingId, true);
    setSelect("lightingSelect", template.lightingId, true);
    setSelect("aspectSelect", template.aspect, true);

    if (!poseOk) {
      select.value = "custom";
      showToast("القالب لا يطابق منطقة التفاعل الحالية", "error", 4200);
      return;
    }

    document.documentElement.dataset.activeBedroomTemplate = template.id;
    document.querySelectorAll("[data-bedroom-template-select]").forEach((other) => {
      if (other !== select) other.value = "custom";
    });
    document.querySelector("#rebuildBtn")?.click();
    showToast(`تم تطبيق قالب غرفة النوم: ${template.name_ar}`, "success", 3600);
  };

  requestAnimationFrame(() => requestAnimationFrame(run));
}

function removeLegacyBedroomTemplateUI() {
  const legacyTemplateField = document.querySelector("#templateSelect")?.closest(".field");
  if (legacyTemplateField) legacyTemplateField.hidden = true;

  document.querySelectorAll('[data-indoor-time-templates]').forEach((panel) => panel.remove());
  document.querySelectorAll('[data-room-scenario-group]').forEach((card) => card.remove());

  ["hiddenArmTemplateSelect", "indoorDayTemplateSelect", "indoorNightTemplateSelect", "hubClothingPrepTemplate", "hubPostShowerTemplate"].forEach((id) => {
    const node = document.querySelector(`#${id}`);
    const holder = node?.closest(".template-hub__card, .field, section, article");
    holder?.remove();
  });

  const clothing = document.querySelector("#clothingSelect");
  if (clothing) clothing.disabled = false;
  document.querySelectorAll("[data-scenario-clothing-note]").forEach((note) => note.remove());

  const optionsTitle = document.querySelector("#optionsTitle");
  if (optionsTitle) optionsTitle.textContent = "خيارات القالب";
  const badge = optionsTitle?.closest(".panel__header")?.querySelector(".context-badge");
  if (badge) badge.textContent = "Bedroom V2";
}

function buildHub() {
  document.querySelector("#templateHub")?.remove();

  const intro = document.querySelector(".intro");
  if (!intro) return;

  const section = document.createElement("section");
  section.id = "templateHub";
  section.className = "template-hub";

  const header = document.createElement("div");
  header.className = "template-hub__header";
  header.innerHTML = `<div><p class="eyebrow">BEDROOM V2</p><h2>قوالب غرفة النوم الجديدة</h2><p>قوالب محدودة ومقيدة بالمرجع الواحد. كل قالب يغيّر الوضعية والكادر فقط، ويمنع إعادة تصميم الغرفة أو اختراع خلفية جديدة.</p></div>`;

  const grid = document.createElement("div");
  grid.className = "template-hub__grid";

  GROUP_ORDER.forEach((group) => {
    const meta = BEDROOM_TEMPLATE_GROUPS[group];
    const templates = BEDROOM_TEMPLATES_V2.filter((item) => item.group === group);
    if (!meta || !templates.length) return;

    const card = document.createElement("article");
    card.className = "template-hub__card";

    const label = document.createElement("label");
    label.htmlFor = `bedroomV2_${group}`;
    label.innerHTML = `<span class="template-hub__icon">${meta.icon}</span><strong>${meta.title}</strong>`;

    const select = document.createElement("select");
    select.id = `bedroomV2_${group}`;
    select.dataset.bedroomTemplateSelect = "true";
    select.appendChild(new Option("اختر قالبًا", "custom"));
    templates.forEach((item) => select.appendChild(new Option(item.name_ar, item.id)));
    select.addEventListener("change", () => {
      if (select.value === "custom") return;
      const selected = templates.find((item) => item.id === select.value);
      if (selected) applyTemplate(selected, select);
    });

    card.append(label, select);
    grid.appendChild(card);
  });

  section.append(header, grid);
  intro.after(section);
}

function installStyles() {
  if (document.querySelector("#templateHubStyles")) return;
  const style = document.createElement("style");
  style.id = "templateHubStyles";
  style.textContent = `
.template-hub{max-width:1180px;margin:0 auto 24px;padding:22px;border:1px solid var(--border-color,rgba(127,127,127,.18));border-radius:24px;background:var(--panel-bg,rgba(20,24,32,.72))}
.template-hub__header{margin-bottom:18px}.template-hub__header h2{margin:2px 0 6px;font-size:clamp(1.35rem,4vw,2rem)}.template-hub__header p:last-child{margin:0;opacity:.72;line-height:1.8}
.template-hub__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.template-hub__card{padding:14px;border:1px solid var(--border-color,rgba(127,127,127,.18));border-radius:16px;background:rgba(127,127,127,.035)}.template-hub__card label{display:flex;align-items:center;gap:9px;margin-bottom:9px}.template-hub__icon{font-size:1.2rem}.template-hub__card select{width:100%}
@media(max-width:800px){.template-hub{margin:0 16px 20px;padding:16px}.template-hub__grid{grid-template-columns:1fr}}
`;
  document.head.appendChild(style);
}

function installTemplateHub() {
  installStyles();
  clearLegacyTemplateState();
  removeLegacyBedroomTemplateUI();
  buildHub();
}

function finalizeBedroomV2() {
  clearLegacyTemplateState();
  removeLegacyBedroomTemplateUI();
  if (!document.querySelector("#templateHub")) buildHub();
  import("./bedroomTemplateV2Runtime.js").then(() => {
    document.querySelector("#rebuildBtn")?.click();
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installTemplateHub, { once: true });
  else installTemplateHub();

  if (document.readyState === "complete") finalizeBedroomV2();
  else window.addEventListener("load", finalizeBedroomV2, { once: true });
}
