import {
  UNIFIED_CLOTHING_CATALOG,
  TRADITIONAL_CAR_OPTIONS
} from "./phase30-clothing-catalog.js";

export const CAR_EXTERIOR_TRADITIONAL_OPTIONS = TRADITIONAL_CAR_OPTIONS;

const CAR_EXTERIOR_BASE_SECTION_IDS = Object.freeze(["casual", "formal", "sport", "outdoor"]);

function cloneOption(option) {
  return {
    value:String(option?.value ?? ""),
    label:String(option?.label ?? option?.value ?? ""),
    text:String(option?.text ?? "")
  };
}

function unifiedSection(id) {
  return UNIFIED_CLOTHING_CATALOG.find((section) => section.id === id);
}

const customOption = UNIFIED_CLOTHING_CATALOG
  .flatMap((section) => section.options)
  .find((option) => option.value === "custom") || { value:"custom", label:"✍️ مخصص — اكتب ملابسك", text:"" };

export const CAR_EXTERIOR_CLOTHING_CATALOG = Object.freeze([
  Object.freeze({ id:"saudi-traditional", label:"تقليدي سعودي", options:CAR_EXTERIOR_TRADITIONAL_OPTIONS }),
  ...CAR_EXTERIOR_BASE_SECTION_IDS.map((id) => {
    const section = unifiedSection(id);
    return Object.freeze({
      id,
      label:section?.label || id,
      options:Object.freeze((section?.options || []).filter((option) => option.value !== "custom"))
    });
  }),
  Object.freeze({ id:"custom", label:"مخصص", options:Object.freeze([customOption]) })
]);

export const CAR_EXTERIOR_CLOTHING_OPTIONS = Object.freeze(
  CAR_EXTERIOR_CLOTHING_CATALOG.flatMap((section) => section.options)
);

export function getCarExteriorClothingCatalog() {
  return CAR_EXTERIOR_CLOTHING_CATALOG.map((section) => ({
    id:section.id,
    label:section.label,
    options:section.options.map(cloneOption)
  }));
}

export function getCarExteriorClothingOptions() {
  return CAR_EXTERIOR_CLOTHING_OPTIONS.map(cloneOption);
}
