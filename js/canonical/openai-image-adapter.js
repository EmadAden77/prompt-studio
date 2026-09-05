import phase20BuildOpenAIImagePrompt, {
  describeSaudiStreetRealism as describeSaudiStreetRealismPhase20,
  describePostProcessing,
  describeEnvironmentalDetails,
  describeCameraArtifacts,
  describeLightingPhysics
} from "./openai-image-adapter-phase20.js";

export * from "./openai-image-adapter-phase20.js";

const FROZEN_EXTERIOR_SPEC = "2017 Range Rover Sport Autobiography Dynamic L494 in Fuji White, gloss black grille and side-vent surrounds, 22-inch dark alloy wheels, quad rectangular exhaust tips, LED headlights with DRL signature, panoramic glass roof, tinted rear glass, small Autobiography Dynamic badging and Saudi plate present, both soft-focus and never legible.";

const LOCATIONS = Object.freeze({
  villa: "parked on a driveway before a Saudi villa with beige stone cladding, high wall, metal gate, and a palm tree",
  grocery: "at the curb before a small grocery with shelves and a glowing beverage cooler behind glass",
  parking: "in a marked outdoor lot with white lines, concrete wheel stops, and a few other parked cars",
  street: "parallel parked along a yellow-and-black curb on weathered asphalt",
  reststop: "on a sandy shoulder with sparse shrubs and an open horizon",
  mall: "in outdoor mall parking with shaded walkways"
});

const POSES = Object.freeze({
  "door-lean": "leaning naturally against the closed driver door",
  "door-open": "standing beside the open driver door",
  "front-grille": "standing beside the front grille",
  "rear-tailgate": "standing near the rear tailgate",
  "front-fender": "standing at the front fender with one hand resting on the body",
  "rear-quarter": "standing at the rear three-quarter corner",
  "key-fob": "standing beside the parked vehicle with the key fob relaxed in one hand",
  "hood-sit": "sitting lightly on the front edge of the hood with natural body weight"
});

function text(value) { return typeof value === "string" ? value.trim() : ""; }
function words(value) { return text(value).split(/\s+/u).filter(Boolean).length; }
function sentence(value) { const v = text(value); return !v ? "" : /[.!?]$/u.test(v) ? v : `${v}.`; }
function sceneAnchor(canonical) { return sentence(canonical?.scene?.description); }
function facts(canonical) { return canonical?.scene?.facts ?? {}; }
function isNight(canonical) {
  const source = text(canonical?.lighting?.source_type).toLowerCase();
  const evidence = [canonical?.lighting?.description, canonical?.lighting?.id, canonical?.lighting?.name].map(text).join(" ").toLowerCase();
  return source !== "daylight" && !/\bdaylight\b|\bnoon\b|\bovercast\b|\bgolden\b/iu.test(evidence);
}
function isDamp(canonical) {
  const evidence = [canonical?.lighting?.description, canonical?.scene?.description, facts(canonical).surface, facts(canonical).weather].map(text).join(" ");
  return /\bdamp\b|\bwet\b|\brain/iu.test(evidence);
}
function hasBodyContact(canonical) {
  return ["door-lean", "front-fender", "hood-sit"].includes(text(facts(canonical).carExteriorPose));
}

export function describeCarExterior(canonical) {
  if (canonical?.scene?.id !== "carExterior") return "";
  const location = LOCATIONS[text(facts(canonical).carExteriorLocation)] || LOCATIONS.villa;
  const poseId = text(facts(canonical).carExteriorPose) || "door-lean";
  const pose = POSES[poseId] || POSES["door-lean"];
  const parts = [FROZEN_EXTERIOR_SPEC, `The vehicle is ${location}, with the subject ${pose}.`];
  if (poseId === "door-open") {
    parts.push(`The open door reveals Ivory perforated leather, dark wood veneer, and the black-and-Ivory wheel${isNight(canonical) ? ", with the interior light spilling at night" : ""}.`);
  }
  return parts.join(" ");
}

export function describeCarExteriorRealism(canonical) {
  if (canonical?.scene?.id !== "carExterior") return "";
  const phrases = [
    "Fuji White paint carries fine dust on lower panels and wheel arches with environment reflections stretched across the doors.",
    "Alloy wheels show light brake dust and the tires sit with realistic contact shadow on the ground.",
    "Tinted glass mirrors the surroundings and the panoramic roof reflects the sky."
  ];
  if (isNight(canonical)) phrases.push("An elongated light-pole reflection runs along the hood and roof.");
  if (isNight(canonical) && isDamp(canonical)) phrases.push("Damp ground patches reflect the overhead light near the tires.");
  if (hasBodyContact(canonical)) phrases.push("His hand rests on the body with natural finger spread and a faint reflection under the palm.");
  return phrases.slice(0, 4).join(" ");
}

export function describeSaudiStreetRealism(canonical) {
  return canonical?.scene?.id === "carExterior" ? "" : describeSaudiStreetRealismPhase20(canonical);
}

function removeExact(prompt, layer) {
  if (!layer) return prompt;
  return prompt.replace(`${layer} `, "").replace(` ${layer}`, "").replace(layer, "").replace(/\s{2,}/gu, " ").trim();
}
function insertAfterScene(prompt, canonical, addition) {
  const anchor = sceneAnchor(canonical);
  return anchor && prompt.includes(anchor) ? prompt.replace(anchor, `${anchor} ${addition}`) : `${prompt} ${addition}`.trim();
}
function insertWithinCap(prompt, canonical, addition, maxWords = 250) {
  let base = prompt;
  let candidate = insertAfterScene(base, canonical, addition);
  if (words(candidate) <= maxWords) return candidate;
  for (const layer of [describePostProcessing(canonical), describeEnvironmentalDetails(canonical), describeCameraArtifacts(canonical), describeLightingPhysics(canonical)]) {
    base = removeExact(base, layer);
    candidate = insertAfterScene(base, canonical, addition);
    if (words(candidate) <= maxWords) return candidate;
  }
  const sentences = addition.match(/[^.!?]+[.!?]/gu)?.map((x) => x.trim()).filter(Boolean) ?? [];
  let chosen = "";
  for (const part of sentences) {
    const next = chosen ? `${chosen} ${part}` : part;
    const nextPrompt = insertAfterScene(base, canonical, next);
    if (words(nextPrompt) <= maxWords) chosen = next;
  }
  return chosen ? insertAfterScene(base, canonical, chosen) : base;
}

export function buildOpenAIImagePrompt(canonical, options = {}) {
  let prompt = phase20BuildOpenAIImagePrompt(canonical, options);
  if (canonical?.scene?.id !== "carExterior") return prompt;
  prompt = removeExact(prompt, describeSaudiStreetRealismPhase20(canonical));
  const block = [describeCarExterior(canonical), describeCarExteriorRealism(canonical)].filter(Boolean).join(" ");
  return insertWithinCap(prompt, canonical, block);
}

export default buildOpenAIImagePrompt;
