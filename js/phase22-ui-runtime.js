import {
  SCENES,
  LIGHTING_OPTIONS,
  CAR_EXTERIOR_LOCATIONS,
  CAR_EXTERIOR_POSES
} from "./data.js";
import { STUDIO_SECTION_OPTIONS } from "./studio-section-engine-v1.js";
import {
  UNIFIED_CLOTHING_CATALOG,
  getUnifiedClothingOptions
} from "./phase30-clothing-catalog.js";
import {
  CAR_EXTERIOR_CLOTHING_CATALOG,
  CAR_EXTERIOR_CLOTHING_OPTIONS
} from "./car-exterior-clothing-phase33.js";

export const VISIBLE_SCENE_KEYS = Object.freeze([
  "bedroom",
  "gym",
  "street",
  "rangeRover",
  "majlis",
  "kashta",
  "barbershop",
  "grocery",
  "rooftop",
  "streetFootball",
  "gasStation"
]);

const SECTION_GARMENT_SCENE = Object.freeze({
  solo: "street",
  street: "street",
  bedroom: "bedroom",
  gym: "gym",
  car: "rangeRover",
  carExterior: "carExterior",
  accidental: "street",
  custom: "street",
  group: "street"
});

const DETAIL_FIELD_IDS = Object.freeze(["fabric", "fabric-weight", "iron-state", "wear-state", "clothing-fit"]);

const SCENE_LABELS = Object.freeze({
  bedroom: "غرفة نوم واقعية",
  gym: "نادٍ سعودي حديث",
  street: "شارع أو موقف سعودي",
  rangeRover: "رنج روفر 2017",
  majlis: "مجلس سعودي",
  kashta: "كشتة بر",
  barbershop: "صالون حلاقة سعودي",
  grocery: "بقالة سعودية",
  rooftop: "سطح المنزل",
  streetFootball: "ملعب حارة",
  gasStation: "محطة وقود"
});

export function garmentSceneForSection(section = "", selectedScene = "") {
  return selectedScene || SECTION_GARMENT_SCENE[section] || "street";
}

export function garmentOptionsForSection(section = "") {
  return section === "carExterior"
    ? CAR_EXTERIOR_CLOTHING_OPTIONS.map((option) => ({ ...option }))
    : getUnifiedClothingOptions();
}

function appendOptions(select, options) {
  for (const option of options || []) {
    const node = document.createElement("option");
    node.value = option?.value || "";
    node.textContent = option?.label || option?.value || "";
    select.append(node);
  }
}

function populateCatalog(select, catalog, preferredValue = "") {
  if (!select) return;
  const previous = preferredValue || select.value;
  select.replaceChildren();
  for (const clothingSection of catalog || []) {
    const group = document.createElement("optgroup");
    group.label = clothingSection?.label || clothingSection?.id || "";
    group.dataset.clothingSection = clothingSection?.id || "";
    appendOptions(group, clothingSection?.options || []);
    select.append(group);
  }
  const available = new Set(
    (catalog || []).flatMap((section) => section?.options || []).map((option) => option?.value)
  );
  select.value = available.has(previous) ? previous : (select.options[0]?.value || "");
}

export function populateUnifiedClothingSelect(select, preferredValue = "", section = "") {
  if (!select) return;
  const catalog = section === "carExterior" ? CAR_EXTERIOR_CLOTHING_CATALOG : UNIFIED_CLOTHING_CATALOG;
  populateCatalog(select, catalog, preferredValue);
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

function makeCatalogSelect(id, name, title, catalog) {
  const field = document.createElement("label");
  field.className = "field field-span-2";
  field.htmlFor = id;
  const caption = document.createElement("span");
  caption.textContent = title;
  const select = document.createElement("select");
  select.id = id;
  select.name = name;
  populateCatalog(select, catalog);
  field.append(caption, select);
  return { field, select };
}

function carLightingOptions() {
  const time = document.querySelector("#time")?.value === "day" ? "day" : "night";
  return LIGHTING_OPTIONS.carExterior?.[time] ?? [];
}

function syncCustomClothingVisibility() {
  const carActive = activeSection() === "carExterior";
  const selected = carActive
    ? document.querySelector("#car-exterior-clothing")?.value
    : document.querySelector("#clothing")?.value;
  const field = document.querySelector("#custom-clothing-field");
  if (field) field.hidden = selected !== "custom";
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

  const location = makeSelect("car-exterior-location", "carExteriorLocation", "موقع الوقوف", CAR_EXTERIOR_LOCATIONS);
  const pose = makeSelect("car-exterior-pose", "carExteriorPose", "الوضعية بجانب السيارة", CAR_EXTERIOR_POSES);
  const lighting = makeSelect("car-exterior-lighting", "carExteriorLighting", "الإضاءة", carLightingOptions());
  const clothing = makeCatalogSelect("car-exterior-clothing", "carExteriorClothing", "الملابس", CAR_EXTERIOR_CLOTHING_CATALOG);
  clothing.select.value = CAR_EXTERIOR_CLOTHING_OPTIONS.some((option) => option.value === "thobe-white")
    ? "thobe-white"
    : (clothing.select.options[0]?.value || "");

  inner.append(location.field, pose.field, lighting.field, clothing.field);
  wrap.append(title, inner);
  grid.prepend(wrap);

  clothing.select.addEventListener("change", syncCustomClothingVisibility);

  const refreshLighting = () => {
    const previous = lighting.select.value;
    lighting.select.replaceChildren();
    const options = carLightingOptions();
    appendOptions(lighting.select, options);
    if (options.some((item) => item.value === previous)) lighting.select.value = previous;
  };
  document.querySelector("#time")?.addEventListener("change", refreshLighting);
}

function decorateSectionCards() {
  const cards = [...document.querySelectorAll("#studio-section-grid .studio-section-card")];
  cards.forEach((card, index) => {
    const option = STUDIO_SECTION_OPTIONS[index];
    if (option) card.dataset.studioSection = option.value;
  });
}

function activeSection() {
  return document.querySelector("#studio-section")?.value || "";
}

function selectedScene() {
  return document.querySelector("#scene")?.value || "";
}

function syncCarExteriorVisibility() {
  const active = activeSection() === "carExterior";
  const fields = document.querySelector("#car-exterior-fields");
  if (fields) fields.hidden = !active;

  const standardPose = document.querySelector("#pose")?.closest("label");
  const standardPoseFamily = document.querySelector("#pose-family")?.closest("label");
  if (standardPose) standardPose.hidden = active;
  if (standardPoseFamily) standardPoseFamily.hidden = active;

  const standardClothing = document.querySelector("#clothing");
  const standardClothingField = standardClothing?.closest("label");
  if (standardClothingField) standardClothingField.hidden = active;
  if (standardClothing) standardClothing.disabled = active;

  const carClothing = document.querySelector("#car-exterior-clothing");
  const carClothingField = carClothing?.closest("label");
  if (carClothingField) carClothingField.hidden = !active;
  if (carClothing) carClothing.disabled = !active;

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
  if (activeSection() !== "carExterior") {
    populateUnifiedClothingSelect(select, select.value, activeSection());
  }
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
}

export function installPhase22UI() {
  if (typeof document === "undefined") return;
  queueMicrotask(syncAll);
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
      }, 0);
    }
    if (["time", "studio-section", "clothing", "car-exterior-clothing"].includes(event.target?.id)) {
      setTimeout(syncAll, 0);
    }
  });
}

if (typeof document !== "undefined") installPhase22UI();
