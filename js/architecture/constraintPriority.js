export const CONSTRAINT_PRIORITY = Object.freeze([
  "Reference identity and reference-linked attributes",
  "Explicit user-selected attributes",
  "Physical and anatomical plausibility",
  "Scene topology and spatial orientation",
  "Contact/load physics",
  "Camera optics and viewing geometry",
  "Lighting and material physics",
  "Contextual realism",
  "Natural imperfections",
  "Aesthetic preferences"
]);

export function priorityOf(label) {
  const index = CONSTRAINT_PRIORITY.indexOf(label);
  return index === -1 ? null : index + 1;
}
