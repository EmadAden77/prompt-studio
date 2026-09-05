import { SCENES } from "./data.js";
import {
  CLOTHING_SECTION_ORDER,
  CLOTHING_CATALOG,
  CLOTHING_OPTIONS,
  TRADITIONAL,
  getClothingCatalog,
  getClothingOptions,
  registerSceneClothing,
  resolveClothingText as authorityResolveClothingText
} from "./clothing-authority.js";

export const UNIFIED_CLOTHING_SECTION_ORDER = CLOTHING_SECTION_ORDER;
export const UNIFIED_CLOTHING_CATALOG = CLOTHING_CATALOG;
export const UNIFIED_CLOTHING_OPTIONS = CLOTHING_OPTIONS;
export const TRADITIONAL_CAR_OPTIONS = TRADITIONAL;
export const PHASE30_ORIGINAL_CLOTHING_VALUES = Object.freeze([]);
export const PHASE32_NEUTRAL_CUSTOM_OUTFIT = "تيشيرت أبيض بسيط + بنطلون قماش رمادي";
export const PHASE34_NEUTRAL_CLOTHING = "casual cotton clothing";

function cloneOption(option) { return { value:String(option?.value ?? ""), label:String(option?.label ?? option?.value ?? ""), text:String(option?.text ?? "") }; }

registerSceneClothing(SCENES);
const flatSceneCatalog = getClothingOptions();
for (const scene of Object.values(SCENES)) {
  if (scene && Array.isArray(scene.clothing)) scene.clothing = flatSceneCatalog.map(cloneOption);
}

export function getUnifiedClothingCatalog() { return getClothingCatalog(); }
export function getUnifiedClothingOptions() { return getClothingOptions(); }
export function resolveUnifiedClothingOption(value) {
  const key = String(value ?? "");
  const found = CLOTHING_OPTIONS.find((option) => option.value === key);
  return found ? cloneOption(found) : null;
}

export function resolveClothingText(value, raw = {}) {
  // Compatibility facade only. Phase 37 pipeline imports the leaf authority directly.
  // The leaf preserves raw?.customClothing verbatim and never manufactures a selected-X phrase.
  const key = String(value ?? "").trim();
  const resolved = authorityResolveClothingText(value, raw);
  if (key === "custom") return resolved;
  return resolved || PHASE34_NEUTRAL_CLOTHING;
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
  field.hidden = select.value !== "custom";
  return field;
}

export function renderUnifiedClothingSelect(preferredValue = "") {
  if (typeof document === "undefined") return;
  const select = document.querySelector("#clothing");
  if (!select) return;
  const current = preferredValue || select.value;
  select.replaceChildren();
  for (const section of CLOTHING_CATALOG) {
    const group = document.createElement("optgroup");
    group.label = section.label;
    group.dataset.clothingSection = section.id;
    for (const option of section.options) {
      const node = document.createElement("option");
      node.value = option.value;
      node.textContent = option.label;
      group.append(node);
    }
    select.append(group);
  }
  const available = new Set(CLOTHING_OPTIONS.map((option) => option.value));
  select.value = available.has(current) ? current : (CLOTHING_OPTIONS[0]?.value || "custom");
  const field = select.closest("label");
  if (field) field.hidden = false;
  ensureCustomClothingField(select);
}

function installUiCompatibility() {
  if (typeof document === "undefined") return;
  let remembered = "";
  document.addEventListener("change", (event) => {
    if (event.target?.id === "clothing") {
      remembered = event.target.value;
      ensureCustomClothingField(event.target);
    }
  }, true);
  document.addEventListener("change", (event) => {
    if (["scene", "studio-section"].includes(event.target?.id)) {
      const preserve = remembered || document.querySelector("#clothing")?.value || "";
      setTimeout(() => renderUnifiedClothingSelect(preserve), 0);
    }
  });
  setTimeout(() => renderUnifiedClothingSelect(remembered), 0);
}

installUiCompatibility();
