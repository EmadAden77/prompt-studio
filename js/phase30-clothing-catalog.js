import { SCENES } from "./data.js";
import { CLOTHING_OPTIONS as WIKI_CLOTHING_OPTIONS } from "./wiki-selfie-data-v1.js";

export const UNIFIED_CLOTHING_SECTION_ORDER = Object.freeze([
  "home",
  "casual",
  "formal",
  "sport",
  "traditional",
  "outdoor"
]);

const SECTION_LABELS = Object.freeze({
  home: "منزل",
  casual: "كاجوال",
  formal: "رسمي",
  sport: "رياضي",
  traditional: "تقليدي",
  outdoor: "خارجي"
});

const SCENE_KEYS = Object.freeze(Object.keys(SCENES));
export const PHASE30_ALL_ENGINE_SCENES = Object.freeze([
  ...new Set(["my_bedroom_text", "bedroom", "gym", "street", "rangeRover", "custom", ...SCENE_KEYS])
]);

function cloneOption(option) {
  return {
    value: String(option?.value ?? ""),
    label: String(option?.label ?? option?.value ?? ""),
    text: String(option?.text ?? ""),
    ...(option?.profile ? { profile: option.profile } : {})
  };
}

const LEGACY_ENTRIES = [];
for (const [sceneId, scene] of Object.entries(SCENES)) {
  for (const option of scene?.clothing ?? []) LEGACY_ENTRIES.push({ sceneId, option: cloneOption(option) });
}

export const PHASE30_ORIGINAL_CLOTHING_VALUES = Object.freeze(LEGACY_ENTRIES.map(({ option }) => option.value));

const wikiByValue = new Map(WIKI_CLOTHING_OPTIONS.map((option) => [option.value, option]));
for (const { option } of LEGACY_ENTRIES) {
  if (!option.value || wikiByValue.has(option.value)) continue;
  const added = { ...cloneOption(option), scenes: [...PHASE30_ALL_ENGINE_SCENES] };
  WIKI_CLOTHING_OPTIONS.push(added);
  wikiByValue.set(option.value, added);
}
for (const option of WIKI_CLOTHING_OPTIONS) option.scenes = [...PHASE30_ALL_ENGINE_SCENES];

const { EXTRA_CLOTHING_OPTIONS } = await import("./clothing-physics-v1.js");
for (const option of EXTRA_CLOTHING_OPTIONS) option.scenes = [...PHASE30_ALL_ENGINE_SCENES];

const ALL_SOURCE_ENTRIES = [
  ...LEGACY_ENTRIES,
  ...WIKI_CLOTHING_OPTIONS.map((option) => ({ sceneId: "wiki", option: cloneOption(option) })),
  ...EXTRA_CLOTHING_OPTIONS.map((option) => ({ sceneId: "expanded", option: cloneOption(option) }))
];

function sectionFor(option) {
  const evidence = `${option.value} ${option.label} ${option.profile ?? ""}`.toLowerCase();
  if (/sleep|lounge|pajama|robe|bathrobe|home-|منزل|نوم|بيجام|روب/u.test(evidence)) return "home";
  if (/thobe|shemagh|ghutra|bisht|arabic-shirt|ثوب|شماغ|غترة|بشت|عربي/u.test(evidence)) return "traditional";
  if (/sport|training|tracksuit|jersey|athletic|dryfit|compression|تمرين|تدريب|رياضي|ترينينغ|قميص أحمر|قميص أخضر|قميص أزرق/u.test(evidence)) return "sport";
  if (/work-|formal|admin|oxford-navy|poplin-charcoal|shirt-poplin-formal|قميص رسمي|إداري|عمل/u.test(evidence)) return "formal";
  if (/jacket|bomber|hoodie|overshirt|cardigan|leather|جاكيت|هودي|أوفرشيرت|كارديغان/u.test(evidence)) return "outdoor";
  return "casual";
}

const seenValues = new Set();
const grouped = Object.fromEntries(UNIFIED_CLOTHING_SECTION_ORDER.map((id) => [id, []]));
for (const { option } of ALL_SOURCE_ENTRIES) {
  if (!option.value || seenValues.has(option.value)) continue;
  seenValues.add(option.value);
  grouped[sectionFor(option)].push(Object.freeze(option));
}

export const UNIFIED_CLOTHING_CATALOG = Object.freeze(
  UNIFIED_CLOTHING_SECTION_ORDER.map((id) => Object.freeze({
    id,
    label: SECTION_LABELS[id],
    options: Object.freeze([
      Object.freeze({ value: "", label: "غير محدد", text: "" }),
      ...grouped[id]
    ])
  }))
);

export const UNIFIED_CLOTHING_OPTIONS = Object.freeze(
  UNIFIED_CLOTHING_CATALOG.flatMap((section) => section.options.filter((option) => option.value))
);

const UNIFIED_BY_VALUE = new Map(UNIFIED_CLOTHING_OPTIONS.map((option) => [option.value, option]));

export function getUnifiedClothingCatalog() {
  return UNIFIED_CLOTHING_CATALOG.map((section) => ({
    id: section.id,
    label: section.label,
    options: section.options.map(cloneOption)
  }));
}

export function getUnifiedClothingOptions() {
  return UNIFIED_CLOTHING_OPTIONS.map(cloneOption);
}

export function resolveUnifiedClothingOption(value) {
  const key = String(value ?? "");
  if (!key) return null;
  const unified = UNIFIED_BY_VALUE.get(key);
  return unified ? cloneOption(unified) : null;
}

const flatSceneCatalog = getUnifiedClothingOptions();
for (const scene of Object.values(SCENES)) {
  if (scene && Array.isArray(scene.clothing)) scene.clothing = flatSceneCatalog.map(cloneOption);
}

function renderUnifiedClothingSelect(preferredValue = "") {
  if (typeof document === "undefined") return;
  const select = document.querySelector("#clothing");
  if (!select) return;
  const current = preferredValue || select.value;
  select.replaceChildren();
  for (const section of UNIFIED_CLOTHING_CATALOG) {
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
  const available = new Set(UNIFIED_CLOTHING_CATALOG.flatMap((section) => section.options.map((option) => option.value)));
  select.value = available.has(current) ? current : "";
  const field = select.closest("label");
  if (field) field.hidden = false;
}

function installUiCompatibility() {
  if (typeof document === "undefined") return;
  let remembered = "";
  document.addEventListener("change", (event) => {
    if (event.target?.id === "clothing") remembered = event.target.value;
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
