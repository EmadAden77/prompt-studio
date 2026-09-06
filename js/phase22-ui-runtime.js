import {
  SCENES
} from "./data.js";
import { STUDIO_SECTION_OPTIONS } from "./studio-section-engine-v1.js";
import {
  CLOTHING_CATALOG as UNIFIED_CLOTHING_CATALOG,
  CLOTHING_TOP_OPTIONS,
  getClothingOptions as getUnifiedClothingOptions
} from "./clothing-authority.js";
import {
  getCarExteriorLightingOptions,
  getCarExteriorLocationOptions,
  getCarExteriorPoseOptions
} from "./car-exterior-authority.js";
// CAR_EXTERIOR_CLOTHING_CATALOG is now a compatibility alias only; the live UI uses the clothing authority for every section.

export const VISIBLE_SCENE_KEYS = Object.freeze([
  "bedroom", "gym", "street", "rangeRover", "majlis", "kashta",
  "barbershop", "grocery", "rooftop", "streetFootball", "gasStation"
]);

const SECTION_GARMENT_SCENE = Object.freeze({
  solo:"street", street:"street", bedroom:"bedroom", gym:"gym", car:"rangeRover",
  carExterior:"carExterior", accidental:"street", custom:"street", group:"street"
});
const DETAIL_FIELD_IDS = Object.freeze(["fabric", "fabric-weight", "iron-state", "wear-state", "clothing-fit"]);
const SCENE_LABELS = Object.freeze({
  bedroom:"غرفة نوم واقعية", gym:"نادٍ سعودي حديث", street:"شارع أو موقف سعودي", rangeRover:"رنج روفر 2017",
  majlis:"مجلس سعودي", kashta:"كشتة بر", barbershop:"صالون حلاقة سعودي", grocery:"بقالة سعودية",
  rooftop:"سطح المنزل", streetFootball:"ملعب حارة", gasStation:"محطة وقود"
});

let rememberedClothingValue = "";

export function garmentSceneForSection(section = "", selectedScene = "") {
  return selectedScene || SECTION_GARMENT_SCENE[section] || "street";
}

export function garmentOptionsForSection() { return getUnifiedClothingOptions(); }
export function shouldShowCustomClothing(value = "") { return String(value) === "custom"; }

function appendOptions(select, options) {
  for (const option of options || []) {
    const node = document.createElement("option");
    node.value = option?.value || "";
    node.textContent = option?.label || option?.value || "";
    select.append(node);
  }
}

function populateCatalog(select, catalog, preferredValue = "", topOptions = []) {
  if (!select) return;
  const previous = preferredValue || select.value;
  select.replaceChildren();
  appendOptions(select, topOptions);
  for (const clothingSection of catalog || []) {
    const group = document.createElement("optgroup");
    group.label = clothingSection?.label || clothingSection?.id || "";
    group.dataset.clothingSection = clothingSection?.id || "";
    appendOptions(group, clothingSection?.options || []);
    select.append(group);
  }
  const available = new Set([
    ...(topOptions || []).map((option) => option?.value),
    ...(catalog || []).flatMap((section) => section?.options || []).map((option) => option?.value)
  ]);
  select.value = available.has(previous) ? previous : (select.options[0]?.value || "");
}

export function populateUnifiedClothingSelect(select, preferredValue = "") {
  populateCatalog(select, UNIFIED_CLOTHING_CATALOG, preferredValue, CLOTHING_TOP_OPTIONS);
}

function makeSelect(id, name, title, options) {
  const field = document.createElement("label");
  field.className = "field";
  field.htmlFor = id;
  const caption = document.createElement("span");
  caption.textContent = title;
  const select = document.createElement("select");
  select.id = id;
  select.name = name;
  appendOptions(select, options);
  field.append(caption, select);
  return { field, select };
}

function carLightingOptions() {
  const time = document.querySelector("#time")?.value === "day" ? "day" : "night";
  const location = document.querySelector("#car-exterior-location")?.value || "villa";
  const pose = document.querySelector("#car-exterior-pose")?.value || "door-lean";
  return getCarExteriorLightingOptions({ time, location, pose });
}

function ensureCustomClothingField(select) {
  if (typeof document === "undefined" || !select) return null;
  let field = document.querySelector("#custom-clothing-field");
  if (!field) {
    field = document.createElement("label");
    field.className = "field field-span-2";
    field.id = "custom-clothing-field";
    field.htmlFor = "custom-clothing";
    const title = document.createElement("span");
    title.textContent = "وصف الملابس المخصص";
    const input = document.createElement("input");
    input.id = "custom-clothing";
    input.name = "customClothing";
    input.type = "text";
    input.placeholder = "مثال: قميص كتان أبيض + بنطلون كحلي";
    const help = document.createElement("small");
    help.textContent = "يُستخدم النص كما كتبته عند اختيار مخصص.";
    field.append(title, input, help);
    select.closest("label")?.after(field);
  }
  field.hidden = !shouldShowCustomClothing(select.value);
  return field;
}

function syncCustomClothingVisibility() {
  const select = document.querySelector("#clothing");
  const field = ensureCustomClothingField(select);
  if (field) field.hidden = !shouldShowCustomClothing(select?.value);
}

function mountCarExteriorControls() {
  if (document.querySelector("#car-exterior-fields")) return;
  const grid = document.querySelector("#pose")?.closest(".form-grid");
  if (!grid) return;
  const wrap = document.createElement("div");
  wrap.className = "field field-span-2";
  wrap.id = "car-exterior-fields";
  wrap.hidden = true;
  const title = document.createElement("span");
  title.textContent = "إعدادات سيلفي بجانب السيارة";
  const inner = document.createElement("div");
  inner.className = "form-grid";
  const location = makeSelect("car-exterior-location", "carExteriorLocation", "موقع الوقوف", getCarExteriorLocationOptions());
  const pose = makeSelect("car-exterior-pose", "carExteriorPose", "الوضعية بجانب السيارة", getCarExteriorPoseOptions());
  const lighting = makeSelect("car-exterior-lighting", "carExteriorLighting", "الإضاءة", carLightingOptions());
  inner.append(location.field, pose.field, lighting.field);
  wrap.append(title, inner);
  grid.prepend(wrap);

  const refreshLighting = () => {
    const previous = lighting.select.value;
    const options = carLightingOptions();
    lighting.select.replaceChildren();
    appendOptions(lighting.select, options);
    lighting.select.value = options.some((item) => item.value === previous) ? previous : (options[0]?.value || "");
  };
  document.querySelector("#time")?.addEventListener("change", refreshLighting);
  location.select.addEventListener("change", refreshLighting);
  pose.select.addEventListener("change", refreshLighting);
}

function decorateSectionCards() {
  const cards = [...document.querySelectorAll("#studio-section-grid .studio-section-card")];
  cards.forEach((card, index) => {
    const option = STUDIO_SECTION_OPTIONS[index];
    if (option) card.dataset.studioSection = option.value;
  });
}
function activeSection() { return document.querySelector("#studio-section")?.value || ""; }
function selectedScene() { return document.querySelector("#scene")?.value || ""; }

function setFieldState(selector, hidden, disabled = hidden) {
  const node = document.querySelector(selector);
  if (!node) return;
  node.hidden = hidden;
  for (const control of node.matches?.("input,select,textarea") ? [node] : node.querySelectorAll?.("input,select,textarea") || []) {
    control.disabled = disabled;
  }
}

function setControlFieldState(control, hidden) {
  const field = control?.closest("label");
  if (field) field.hidden = hidden;
  if (control) control.disabled = hidden;
}

function syncCarExteriorVisibility() {
  const active = activeSection() === "carExterior";
  const fields = document.querySelector("#car-exterior-fields");
  if (fields) fields.hidden = !active;
  for (const select of [
    document.querySelector("#car-exterior-location"),
    document.querySelector("#car-exterior-pose"),
    document.querySelector("#car-exterior-lighting")
  ]) {
    if (select) select.disabled = !active;
  }

  setControlFieldState(document.querySelector("#pose"), active);
  setControlFieldState(document.querySelector("#pose-family"), active);

  // carExterior has dedicated location/pose/lighting authority. Hide and disable
  // legacy/custom controls so FormData cannot leak stale values into Canonical V3.
  setControlFieldState(document.querySelector("#lighting"), active);
  setFieldState("#custom-scene-field", active);
  setFieldState("#custom-scene-details-field", active);
  setFieldState("#scene-profile-field", active);

  // Manual legacy realism/context panels are not authorities in the hardened
  // carExterior path. Automatic realism layers still run inside the adapter.
  setFieldState("#post-processing-panel", active);
  setFieldState('[aria-labelledby="realism-core-title"]', active);
  setFieldState('[aria-labelledby="advanced-realism-title"]', active);
  setFieldState(".context-secondary-panel", active);

  // Reference identity is authoritative for hair/skin in carExterior. Do not expose
  // styling knobs that can imply face/identity drift; expression remains active.
  setControlFieldState(document.querySelector("#hair"), active);
  setControlFieldState(document.querySelector("#skin"), active);

  const clothing = document.querySelector("#clothing");
  const clothingField = clothing?.closest("label");
  if (clothingField) clothingField.hidden = false;
  if (clothing) clothing.disabled = false;
  syncCustomClothingVisibility();
}

function repopulateSceneSelect(preferred = "") {
  const scene = document.querySelector("#scene");
  if (!scene) return;
  const selected = VISIBLE_SCENE_KEYS.includes(preferred) ? preferred : (VISIBLE_SCENE_KEYS.includes(scene.value) ? scene.value : "bedroom");
  scene.replaceChildren();
  for (const key of VISIBLE_SCENE_KEYS) {
    const node = document.createElement("option");
    node.value = key;
    node.textContent = SCENES[key]?.label || SCENE_LABELS[key] || key;
    scene.append(node);
  }
  scene.value = selected;
}

function exposeSceneSelectForDailyScenes() {
  const section = activeSection();
  const field = document.querySelector("#scene-field");
  if (!field) return;
  if (["solo", "group"].includes(section)) {
    repopulateSceneSelect(field.dataset.phase22Selected || selectedScene() || "bedroom");
    field.hidden = false;
    const title = field.querySelector(":scope > span");
    const help = field.querySelector(":scope > small");
    if (title) title.textContent = "المشهد";
    if (help) help.textContent = "جميع المشاهد اليومية الجديدة متاحة من نفس القائمة.";
  }
}

function keepClothingDetailsVisible() {
  for (const id of DETAIL_FIELD_IDS) {
    const field = document.querySelector(`#${id}`)?.closest("label");
    if (field) field.hidden = false;
  }
  const custom = document.querySelector("#clothing-custom")?.closest("label");
  if (custom) custom.hidden = false;
}

function syncGarmentSelect() {
  const select = document.querySelector("#clothing");
  if (!select) return;
  const preferred = rememberedClothingValue || select.value;
  populateUnifiedClothingSelect(select, preferred);
  rememberedClothingValue = select.value || rememberedClothingValue;
  ensureCustomClothingField(select);
  syncCarExteriorVisibility();
}

function syncAll() {
  decorateSectionCards();
  mountCarExteriorControls();
  syncCarExteriorVisibility();
  exposeSceneSelectForDailyScenes();
  syncGarmentSelect();
  keepClothingDetailsVisible();
  syncCustomClothingVisibility();
  syncCarExteriorVisibility();
}

export function installPhase22UI() {
  if (typeof document === "undefined") return;
  queueMicrotask(syncAll);
  document.addEventListener("change", (event) => {
    if (event.target?.id !== "clothing") return;
    rememberedClothingValue = event.target.value || rememberedClothingValue;
    queueMicrotask(() => {
      syncGarmentSelect();
      keepClothingDetailsVisible();
      syncCustomClothingVisibility();
      syncCarExteriorVisibility();
    });
  }, true);
  document.addEventListener("click", (event) => {
    const card = event.target?.closest?.("#studio-section-grid .studio-section-card");
    if (card) setTimeout(syncAll, 0);
  });
  document.addEventListener("change", (event) => {
    if (event.target?.id === "scene") {
      const field = document.querySelector("#scene-field");
      if (field && VISIBLE_SCENE_KEYS.includes(event.target.value)) field.dataset.phase22Selected = event.target.value;
      setTimeout(() => {
        repopulateSceneSelect(field?.dataset.phase22Selected || event.target.value);
        syncGarmentSelect();
        keepClothingDetailsVisible();
        syncCarExteriorVisibility();
      }, 0);
    }
    if (["time", "studio-section", "clothing", "car-exterior-location", "car-exterior-pose", "car-exterior-lighting"].includes(event.target?.id)) setTimeout(syncAll, 0);
    else setTimeout(() => {
      syncGarmentSelect();
      keepClothingDetailsVisible();
      syncCustomClothingVisibility();
      syncCarExteriorVisibility();
    }, 0);
  });
}

if (typeof document !== "undefined") installPhase22UI();
