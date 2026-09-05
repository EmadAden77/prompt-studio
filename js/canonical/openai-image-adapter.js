import phase24BuildOpenAIImagePrompt, {
  describeSaudiStreetRealism,
  describePlaceRealism,
  describePostProcessing,
  describeEnvironmentalDetails,
  describeCameraArtifacts,
  describeLightingPhysics,
  describeMicroRealism,
  describeNaturalImperfections
} from "./openai-image-adapter-phase24.js";

export * from "./openai-image-adapter-phase24.js";

export const HEADWEAR_LOCK = "a red-and-white fine checkered shemagh with one end casually thrown over the shoulder and the other hanging at the chest, held by a black doubled-cord iqal seated firmly on the crown, relaxed youthful drape, the shemagh lies flat under the iqal, not a turban";

function text(value) { return typeof value === "string" ? value.trim() : ""; }
function words(value) { return text(value).split(/\s+/u).filter(Boolean).length; }
function clothing(canonical) { return canonical?.subjects?.primary?.clothing ?? {}; }

export function describeHeadwear(canonical) {
  const selected = clothing(canonical);
  const evidence = [selected.garment, selected.custom_modifier].map(text).join(" ");
  return /shemagh|shimagh|ghutra/iu.test(evidence) && /iqal|agal/iu.test(evidence) ? HEADWEAR_LOCK : "";
}

function removeExact(prompt, layer) {
  if (!layer) return prompt;
  return prompt.replace(`${layer} `, "").replace(` ${layer}`, "").replace(layer, "").replace(/\s{2,}/gu, " ").trim();
}

function clothingSentenceBounds(prompt, canonical) {
  const garment = text(clothing(canonical).garment);
  let index = garment ? prompt.indexOf(garment) : -1;
  if (index < 0) index = prompt.indexOf(" wearing ");
  if (index < 0) index = prompt.indexOf("wearing ");
  if (index < 0) return null;
  const previous = prompt.lastIndexOf(". ", index);
  const start = previous < 0 ? 0 : previous + 2;
  const next = prompt.indexOf(".", index);
  if (next < 0) return null;
  return { start, end: next + 1 };
}

function insertAfterClothingSentence(prompt, canonical, headwear) {
  if (!headwear) return prompt;
  const addition = `${headwear}.`;
  const bounds = clothingSentenceBounds(prompt, canonical);
  if (!bounds) return `${prompt} ${addition}`.trim();
  return `${prompt.slice(0, bounds.end)} ${addition}${prompt.slice(bounds.end)}`.replace(/\s{2,}/gu, " ").trim();
}

function compactIdentity(prompt) {
  return prompt.replace(
    /The primary subject preserves the supplied identity reference for [^.]+\./iu,
    "The primary subject preserves the supplied identity reference for facial structure, skin tone, natural asymmetry, and reference-linked eyewear."
  );
}

function compactClothingSentence(prompt, canonical) {
  const bounds = clothingSentenceBounds(prompt, canonical);
  if (!bounds) return prompt;
  const primary = canonical?.subjects?.primary ?? {};
  const garment = text(clothing(canonical).garment);
  const pose = text(primary.pose) || "natural pose";
  const expression = text(primary.expression) || "natural expression";
  const compact = `The primary subject has ${pose}, ${expression}, wearing ${garment}, with body scale consistent with the environment.`;
  return `${prompt.slice(0, bounds.start)}${compact}${prompt.slice(bounds.end)}`.replace(/\s{2,}/gu, " ").trim();
}

function removeLowPriority(prompt) {
  return prompt
    .replace(/Visual preferences:[^.]+\./iu, "")
    .replace(/Scene details:[^.]+\./iu, "")
    .replace(/Fuji White paint carries fine dust[^.]+\./iu, "")
    .replace(/An elongated light-pole reflection[^.]+\./iu, "")
    .replace(/Damp ground patches reflect[^.]+\./iu, "")
    .replace(/His hand rests on the body[^.]+\./iu, "")
    .replace(/\s{2,}/gu, " ")
    .trim();
}

function removeExtraOptional(prompt) {
  return prompt
    .replace(/A single soft catchlight in each eye[^.]+\./iu, "")
    .replace(/Subtle natural eye reflection[^.]+\./iu, "")
    .replace(/Subtle skin texture with natural pores\./iu, "")
    .replace(/Natural hair flyaways and loose strands\./iu, "")
    .replace(/Natural fabric wrinkles and folds\./iu, "")
    .replace(/Localized highlights transition gradually into adjacent shadows\./iu, "")
    .replace(/\s{2,}/gu, " ")
    .trim();
}

function compactCamera(prompt) {
  return prompt.replace(/Captured with [^.]+\./iu, "Captured with the selected physically plausible front-camera geometry.");
}

function insertHeadwearWithinCap(prompt, canonical, headwear, maxWords = 250) {
  let base = prompt;
  let candidate = insertAfterClothingSentence(base, canonical, headwear);
  if (words(candidate) <= maxWords) return candidate;

  for (const layer of [
    describePostProcessing(canonical),
    describeEnvironmentalDetails(canonical),
    describeCameraArtifacts(canonical),
    describeLightingPhysics(canonical),
    describeMicroRealism(canonical),
    describeNaturalImperfections(canonical),
    describePlaceRealism(canonical),
    describeSaudiStreetRealism(canonical)
  ]) {
    base = removeExact(base, layer);
    candidate = insertAfterClothingSentence(base, canonical, headwear);
    if (words(candidate) <= maxWords) return candidate;
  }

  for (const compact of [removeLowPriority, compactIdentity, compactClothingSentence, removeExtraOptional, compactCamera]) {
    base = compact === compactClothingSentence ? compact(base, canonical) : compact(base);
    candidate = insertAfterClothingSentence(base, canonical, headwear);
    if (words(candidate) <= maxWords) return candidate;
  }

  return candidate;
}

export function buildOpenAIImagePrompt(canonical, options = {}) {
  const prompt = phase24BuildOpenAIImagePrompt(canonical, options);
  const headwear = describeHeadwear(canonical);
  return headwear ? insertHeadwearWithinCap(prompt, canonical, headwear) : prompt;
}

export default buildOpenAIImagePrompt;
