const sourceCategories = Array.isArray(window.CAR_CATEGORIES) ? window.CAR_CATEGORIES : [];
const sourceTemplates = Array.isArray(window.CAR_TEMPLATES) ? window.CAR_TEMPLATES : [];
const sourceAnatomy = window.ANGLE_ANATOMY && typeof window.ANGLE_ANATOMY === "object" ? window.ANGLE_ANATOMY : {};

export const CAR_CATEGORIES = Object.freeze(sourceCategories.map((item) => Object.freeze({ ...item })));

export const CAR_TEMPLATES = Object.freeze(sourceTemplates.map((item) => Object.freeze({
  ...item,
  name_ar: item.ar,
  name_en: item.en,
  distance: item.dist,
  framing: item.frame,
  note: item.anatomy || item.light || ""
})));

export const ANGLE_ANATOMY = Object.freeze({ ...sourceAnatomy });
export const CAR_TEMPLATE_BY_ID = Object.freeze(Object.fromEntries(CAR_TEMPLATES.map((item) => [item.id, item])));
export const CAR_CATEGORY_BY_ID = Object.freeze(Object.fromEntries(CAR_CATEGORIES.map((item) => [item.id, item])));
