import phase23BuildOpenAIImagePrompt, {
  describeSaudiStreetRealism as describeSaudiStreetRealismPhase23,
  describePostProcessing,
  describeEnvironmentalDetails,
  describeCameraArtifacts,
  describeLightingPhysics,
  describeMicroRealism,
  describeNaturalImperfections
} from "./openai-image-adapter-phase23.js";

export * from "./openai-image-adapter-phase23.js";

const GYM_EFFORT = Object.freeze([
  "Localized sweat sheen appears on the forehead, temples, and neck only.",
  "A damp shirt patch sits at the upper back from exertion.",
  "Flushed skin and visible forearm veins remain after the set.",
  "Chalk dust rests on his palms while he sits mid-rest with elbows on knees."
]);

const GYM_EQUIPMENT = Object.freeze([
  "Chrome bars show fine scratches and worn knurling from grip.",
  "Bench upholstery is faded with slight cracking at the edges.",
  "Weight plates carry chalk residue, dust, and edge scuffs.",
  "Rubber flooring shows dropped-plate marks and scuff trails."
]);

const GYM_TRACES = Object.freeze([
  "A water bottle and a draped towel rest on the bench beside him.",
  "His phone and gym bag sit on the floor at the rack base.",
  "One side of the bar holds a loaded plate while the other side is empty."
]);

const GYM_MIRROR = Object.freeze([
  "The mirror carries fingerprints and a light smudge streak.",
  "The reflection preserves the true background geometry with one coherent subject."
]);

const GYM_BACKGROUND = Object.freeze([
  "A blurred figure mid-lift softens in the far rack background.",
  "A distant figure remains in soft focus near the benches."
]);

const GYM_LIGHT = Object.freeze([
  "Harsh overhead LED casts crisp shadows under equipment with darker corners.",
  "Sweat shine catches the overhead light on shoulders and arms."
]);

function text(value) { return typeof value === "string" ? value.trim() : ""; }
function wordCount(value) { return text(value).split(/\s+/u).filter(Boolean).length; }
function sentence(value) { const v = text(value); return !v ? "" : /[.!?]$/u.test(v) ? v : `${v}.`; }
function isGym(canonical) { return canonical?.scene?.id === "gym"; }
function isMirror(canonical) { return canonical?.capture?.type === "mirror_selfie"; }

function stableSeed(canonical) {
  return [
    canonical?.scene?.id,
    canonical?.capture?.type,
    canonical?.subjects?.primary?.pose,
    canonical?.subjects?.primary?.clothing?.garment,
    canonical?.lighting?.description
  ].map(text).join("|");
}

function stableIndex(seed, salt, length) {
  let hash = 2166136261;
  const value = `${salt}|${seed}`;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0) % length;
}

function pick(catalog, seed, salt) {
  return catalog[stableIndex(seed, salt, catalog.length)];
}

export function describeGymRealism(canonical) {
  if (!isGym(canonical)) return "";
  const seed = stableSeed(canonical);
  const prioritized = [
    pick(GYM_EFFORT, seed, "effort"),
    pick(GYM_EQUIPMENT, seed, "equipment"),
    pick(GYM_TRACES, seed, "traces")
  ];
  if (isMirror(canonical)) prioritized.push(pick(GYM_MIRROR, seed, "mirror"));
  else prioritized.push(pick(GYM_BACKGROUND, seed, "background"));
  if (prioritized.length < 4) prioritized.push(pick(GYM_LIGHT, seed, "light"));
  return prioritized.slice(0, 4).join(" ");
}

export function describeSaudiStreetRealism(canonical) {
  return isGym(canonical) ? "" : describeSaudiStreetRealismPhase23(canonical);
}

function removeExact(prompt, layer) {
  if (!layer) return prompt;
  return prompt.replace(`${layer} `, "").replace(` ${layer}`, "").replace(layer, "").replace(/\s{2,}/gu, " ").trim();
}

function sceneAnchor(canonical) { return sentence(canonical?.scene?.description); }
function insertAfterScene(prompt, canonical, addition) {
  const anchor = sceneAnchor(canonical);
  return anchor && prompt.includes(anchor) ? prompt.replace(anchor, `${anchor} ${addition}`) : `${prompt} ${addition}`.trim();
}

function splitSentences(value) {
  return text(value).match(/[^.!?]+[.!?]/gu)?.map((part) => part.trim()).filter(Boolean) ?? [];
}

function removeLowPriorityGymText(prompt) {
  return prompt
    .replace(/Visual preferences:[^.]+\./iu, "")
    .replace(/\s{2,}/gu, " ")
    .trim();
}

function insertGymWithinCap(prompt, canonical, realism, maxWords = 250) {
  let base = prompt;
  let candidate = insertAfterScene(base, canonical, realism);
  if (wordCount(candidate) <= maxWords) return candidate;

  for (const layer of [
    describePostProcessing(canonical),
    describeEnvironmentalDetails(canonical),
    describeCameraArtifacts(canonical),
    describeLightingPhysics(canonical),
    describeMicroRealism(canonical),
    describeNaturalImperfections(canonical)
  ]) {
    base = removeExact(base, layer);
    candidate = insertAfterScene(base, canonical, realism);
    if (wordCount(candidate) <= maxWords) return candidate;
  }

  base = removeLowPriorityGymText(base);
  const parts = splitSentences(realism);
  let chosen = "";
  for (const part of parts) {
    const next = chosen ? `${chosen} ${part}` : part;
    if (wordCount(insertAfterScene(base, canonical, next)) <= maxWords) chosen = next;
  }
  return chosen ? insertAfterScene(base, canonical, chosen) : base;
}

export function buildOpenAIImagePrompt(canonical, options = {}) {
  let prompt = phase23BuildOpenAIImagePrompt(canonical, options);
  if (!isGym(canonical)) return prompt;
  prompt = removeExact(prompt, describeSaudiStreetRealismPhase23(canonical));
  return insertGymWithinCap(prompt, canonical, describeGymRealism(canonical));
}

export default buildOpenAIImagePrompt;
