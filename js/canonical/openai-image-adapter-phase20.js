import phase19BuildOpenAIImagePrompt, {
  describePlaceRealism as describePlaceRealismPhase19,
  describePostProcessing,
  describeEnvironmentalDetails,
  describeCameraArtifacts,
  describeLightingPhysics
} from "./openai-image-adapter-phase19.js";

export * from "./openai-image-adapter-phase19.js";

function text(value) { return typeof value === "string" ? value.trim() : ""; }
function words(value) { return text(value).split(/\s+/u).filter(Boolean).length; }
function isObject(value) { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function sentence(value) { const v = text(value); return !v ? "" : /[.!?]$/u.test(v) ? v : `${v}.`; }

function sceneAnchor(canonical) {
  const scene = canonical?.scene ?? {};
  if (scene.type === "room" && isObject(scene.room) && text(scene.room.description)) return sentence(scene.room.description);
  return sentence(scene.description);
}

function removeExactLayer(prompt, layer) {
  if (!layer) return prompt;
  return prompt.replace(`${layer} `, "").replace(` ${layer}`, "").replace(layer, "").replace(/\s{2,}/gu, " ").trim();
}

function phase20PlaceRealism(canonical) {
  switch (canonical?.scene?.id) {
    case "rooftop":
      return [
        "Water tanks and satellite dishes show faint dust accumulation and rust traces at the base.",
        "The low perimeter wall carries a thin dust film and minor concrete weathering.",
        "The generic distant skyline softens into a muted haze of anonymous low-rise forms.",
        "A neighboring rooftop shows a soft clothesline and a distant cat silhouette."
      ].join(" ");
    case "streetFootball":
      return [
        "Worn artificial turf shows flattened fibers and scattered rubber granules near the goal area.",
        "A deflated football and a plastic water bottle sit near the chain-link fence with visible dust on the ground.",
        "Overhead floodlights cast cool white pools leaving darker gaps between lit zones.",
        "Blurred distant figures remain near the far goal."
      ].join(" ");
    case "gasStation":
      return [
        "Fuel pump nozzles and handles show natural wear and faint residue.",
        "The concrete around the pumps carries tire marks, rubber scuffs, and fine dust.",
        "Bright canopy LEDs cast harsh white light with soft shadows under the car and subject.",
        "A blurred distant figure stands near the store entrance in the background."
      ].join(" ");
    default:
      return "";
  }
}

export function describePlaceRealism(canonical) {
  return phase20PlaceRealism(canonical) || describePlaceRealismPhase19(canonical);
}

function insertAfterScene(prompt, canonical, addition) {
  const anchor = sceneAnchor(canonical);
  return anchor && prompt.includes(anchor)
    ? prompt.replace(anchor, `${anchor} ${addition}`)
    : `${prompt} ${addition}`.trim();
}

function insertPhase20WithinCap(prompt, canonical, addition, maxWords = 250) {
  let base = prompt;
  let candidate = insertAfterScene(base, canonical, addition);
  if (words(candidate) <= maxWords) return candidate;
  for (const layer of [
    describePostProcessing(canonical),
    describeEnvironmentalDetails(canonical),
    describeCameraArtifacts(canonical),
    describeLightingPhysics(canonical)
  ]) {
    base = removeExactLayer(base, layer);
    candidate = insertAfterScene(base, canonical, addition);
    if (words(candidate) <= maxWords) return candidate;
  }
  const sentences = addition.match(/[^.!?]+[.!?]/gu)?.map((part) => part.trim()).filter(Boolean) ?? [];
  const priority = sentences.length >= 4 ? [sentences[0], sentences[1], sentences[3], sentences[2]] : sentences;
  let chosen = "";
  for (const part of priority) {
    const next = chosen ? `${chosen} ${part}` : part;
    const nextPrompt = insertAfterScene(base, canonical, next);
    if (words(nextPrompt) <= maxWords) chosen = next;
  }
  return chosen ? insertAfterScene(base, canonical, chosen) : base;
}

export function buildOpenAIImagePrompt(canonical, options = {}) {
  const prompt = phase19BuildOpenAIImagePrompt(canonical, options);
  const addition = phase20PlaceRealism(canonical);
  return addition ? insertPhase20WithinCap(prompt, canonical, addition) : prompt;
}

export default buildOpenAIImagePrompt;
