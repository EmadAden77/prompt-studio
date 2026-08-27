import { BEDROOM_TEMPLATES_V2, BEDROOM_TEMPLATE_GROUPS } from "./bedroomTemplatesV2.js";
import { BEDROOM_CANDID_TEMPLATES } from "./bedroomCandidTemplates.js";
import { BEDROOM_NIGHT_STANDING_TEMPLATES } from "./bedroomNightStandingTemplates.js";
import { showToast } from "./ui/dom.js";

const ALL_BEDROOM_TEMPLATES = Object.freeze([
  ...BEDROOM_TEMPLATES_V2,
  ...BEDROOM_CANDID_TEMPLATES,
  ...BEDROOM_NIGHT_STANDING_TEMPLATES
]);
const GROUP_ORDER = ["bed", "sitting", "standing"];
const BEDROOM_HUB_VERSION = "v2.2";
const TIME_STORAGE_KEY = "prompt-studio:bedroom-template-time:v1";

const DAY_TEMPLATE_IDS = new Set([
  "bed_v2_edge_candid",
  "bed_v2_floor_rug",
  "bed_v2_bedside_stand",
  "bed_v2_center_stand",
  "bed_v2_wardrobe_pause",
  "bed_v2_dresser_pause",
  "bed_candid_inverted_edge"
]);

const NIGHT_TEMPLATE_IDS = new Set([
  "bed_v2_right_close",
  "bed_v2_back_close",
  "bed_v2_semi_headboard",
  "bed_candid_back_phone_glow",
  "bed_candid_side_lamp",
  "bed_candid_elbow_prop",
  "bed_candid_duvet_tucked",
  "bed_candid_stomach_chin_palm",
  "bed_candid_deep_side_sleepy",
  "bed_night_stand_bedside_lamp",
  "bed_night_stand_wardrobe_dimspots",
  "bed_night_stand_vanity_warm",
  "bed_night_stand_center_dim",
  "bed_night_stand_bedfront_mixed"
]);

let activeTime = readSavedTime();

function readSavedTime() {
  try {
    const value = localStorage.getItem(TIME_STORAGE_KEY);
    return value === "day" || value === "night" ? value : "night";
  } catch {
    return "night";
  }
}

function saveTime(value) {
  try { localStorage.setItem(TIME_STORAGE_KEY, value); } catch {}
}

function timeOfTemplate(template) {
  if (DAY_TEMPLATE_IDS.has(template.id)) return "day";
  if (NIGHT_TEMPLATE_IDS.has(template.id)) return "night";
  return template.lightingId === "ceiling_white" ? "day" : "night";
}

function templatesFor(group) {
  return ALL_BEDROOM_TEMPLATES.filter((item) => item.group === group && timeOfTemplate(item) === activeTime);
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
    document.documentElement.dataset.bedroomTemplateTime = activeTime;
    document.querySelectorAll("[data-bedroom-template-select]").forEach((other) => {
      if (other !== select) other.value = "custom";
    });
    document.querySelector("#rebuildBtn")?.click();
    showToast(`تم تطبيق قالب ${activeTime === "day" ? "نهاري" : "ليلي"}: ${template.name_ar}`, "success", 3600);
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
  if (badge) badge.textContent = `Bedroom ${BEDROOM_HUB_VERSION}`;
}

function buildTimeSwitcher() {
  const wrap = document.createElement("div");
  wrap.className = "bedroom-time-switcher";
  wrap.setAttribute("aria-label", "تصفية قوالب غرفة النوم حسب الوقت");
  wrap.innerHTML = `
    <button type="button" data-bedroom-time="day">☀️ نهاري</button>
    <button type="button" data-bedroom-time="night">🌙 ليلي</button>
    <span id="bedroomTimeStatus" class="bedroom-time-status"></span>
  `;
  wrap.addEventListener("click", (event) => {
    const button = event.target.closest("[data-bedroom-time]");
    if (!button) return;
    const value = button.dataset.bedroomTime;
    if (value !== "day" && value !== "night") return;
    activeTime = value;
    saveTime(activeTime);
    delete document.documentElement.dataset.activeBedroomTemplate;
    buildHub();
    showToast(activeTime === "day" ? "تم عرض القوالب النهارية فقط" : "تم عرض القوالب الليلية فقط", "success", 2200);
  });
  return wrap;
}

function updateTimeSwitcher(section) {
  section.querySelectorAll("[data-bedroom-time]").forEach((button) => {
    const active = button.dataset.bedroomTime === activeTime;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  const count = ALL_BEDROOM_TEMPLATES.filter((item) => timeOfTemplate(item) === activeTime).length;
  const status = section.querySelector("#bedroomTimeStatus");
  if (status) status.textContent = `${activeTime === "day" ? "القوالب النهارية" : "القوالب الليلية"} · ${count} قوالب`;
  document.documentElement.dataset.bedroomTemplateTime = activeTime;
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
  header.innerHTML = `<div><p class="eyebrow">BEDROOM ${BEDROOM_HUB_VERSION}</p><h2>قوالب غرفة النوم</h2><p>اختر أولًا نهاري أو ليلي، ثم اختر القالب. لن تختلط القوالب الليلية والنهارية في القائمة نفسها.</p></div>`;

  const timeSwitcher = buildTimeSwitcher();
  const grid = document.createElement("div");
  grid.className = "template-hub__grid";

  GROUP_ORDER.forEach((group) => {
    const meta = BEDROOM_TEMPLATE_GROUPS[group];
    const templates = templatesFor(group);
    if (!meta || !templates.length) return;

    const card = document.createElement("article");
    card.className = "template-hub__card";

    const label = document.createElement("label");
    label.htmlFor = `bedroomV2_${group}`;
    label.innerHTML = `<span class="template-hub__icon">${meta.icon}</span><strong>${meta.title}</strong><small>${activeTime === "day" ? "نهاري" : "ليلي"}</small>`;

    const select = document.createElement("select");
    select.id = `bedroomV2_${group}`;
    select.dataset.bedroomTemplateSelect = "true";
    select.dataset.bedroomTime = activeTime;
    select.appendChild(new Option(`اختر قالبًا ${activeTime === "day" ? "نهاريًا" : "ليليًا"}`, "custom"));
    templates.forEach((item) => select.appendChild(new Option(item.name_ar, item.id)));
    select.addEventListener("change", () => {
      if (select.value === "custom") return;
      const selected = templates.find((item) => item.id === select.value);
      if (selected) applyTemplate(selected, select);
    });

    card.append(label, select);
    grid.appendChild(card);
  });

  section.append(header, timeSwitcher, grid);
  intro.after(section);
  updateTimeSwitcher(section);
}

function installStyles() {
  if (document.querySelector("#templateHubStyles")) return;
  const style = document.createElement("style");
  style.id = "templateHubStyles";
  style.textContent = `
.template-hub{max-width:1180px;margin:0 auto 24px;padding:22px;border:1px solid var(--border-color,rgba(127,127,127,.18));border-radius:24px;background:var(--panel-bg,rgba(20,24,32,.72))}
.template-hub__header{margin-bottom:14px}.template-hub__header h2{margin:2px 0 6px;font-size:clamp(1.35rem,4vw,2rem)}.template-hub__header p:last-child{margin:0;opacity:.72;line-height:1.8}
.bedroom-time-switcher{display:grid;grid-template-columns:1fr 1fr auto;gap:9px;align-items:center;margin:0 0 16px;padding:10px;border:1px solid var(--border-color,rgba(127,127,127,.18));border-radius:16px;background:rgba(127,127,127,.035)}.bedroom-time-switcher button{border:1px solid var(--border-color,rgba(127,127,127,.22));border-radius:12px;padding:12px;background:transparent;color:inherit;font:inherit;font-weight:800;cursor:pointer}.bedroom-time-switcher button.is-active{outline:2px solid currentColor;outline-offset:1px;background:rgba(127,127,127,.12)}.bedroom-time-status{font-size:.88rem;opacity:.72;white-space:nowrap;padding:0 6px}
.template-hub__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.template-hub__card{padding:14px;border:1px solid var(--border-color,rgba(127,127,127,.18));border-radius:16px;background:rgba(127,127,127,.035)}.template-hub__card label{display:flex;align-items:center;gap:9px;margin-bottom:9px}.template-hub__card label small{margin-inline-start:auto;opacity:.62}.template-hub__icon{font-size:1.2rem}.template-hub__card select{width:100%}
@media(max-width:800px){.template-hub{margin:0 16px 20px;padding:16px}.template-hub__grid{grid-template-columns:1fr}.bedroom-time-switcher{grid-template-columns:1fr 1fr}.bedroom-time-status{grid-column:1/-1;text-align:center;padding-top:2px}}
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
