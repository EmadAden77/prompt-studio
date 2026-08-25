export const HAIR_OPTIONS = Object.freeze([
  { id: "same", name_ar: "كما في صورة الهوية", prompt: "Keep the reference hairstyle arrangement as closely as the new pose and gravity allow." },
  { id: "messy", name_ar: "فوضوي قليلًا", prompt: "Rearrange the existing hair into a mildly tousled state with a few plausible stray strands; preserve length, density, wave pattern, and hairline." },
  { id: "neat", name_ar: "مرتب", prompt: "Arrange the existing hair neatly using only its original length, density, wave pattern, and hairline; do not create a new haircut." },
  { id: "wet", name_ar: "مبلل", prompt: "Make the existing hair visibly damp, with darker grouped clumps and reduced volume caused by water; preserve length, density, and hairline." }
]);

export const HAIR_BY_ID = Object.freeze(Object.fromEntries(HAIR_OPTIONS.map((item) => [item.id, item])));
