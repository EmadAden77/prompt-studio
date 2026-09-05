import phase24BuildOpenAIImagePrompt, {
  describeSaudiStreetRealism,
  describePlaceRealism,
  describePostProcessing,
  describeEnvironmentalDetails,
  describeCameraArtifacts,
  describeLightingPhysics,
  describeMicroRealism,
  describeNaturalImperfections,
  describeGymRealism,
  describeCarExterior,
  describeCarExteriorRealism,
  describeBodyAnatomy,
  describeSelfiePerspective,
  describeEnvironmentScale
} from "./openai-image-adapter-phase24.js";
import { SAUDI_REALISM_MODIFIERS } from "../data.js";

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
  const withHeadwear = headwear ? insertHeadwearWithinCap(prompt, canonical, headwear) : prompt;
  const withSaudiRealism = insertSaudiRealism(withHeadwear, canonical);
  const withPhase29Camera = insertPhase29CameraArtifacts(withSaudiRealism, canonical);
  const withCandidSpeech = insertCandidSpeech(withPhase29Camera, canonical);
  const withBodyAuthority = insertPhase26Authority(withCandidSpeech, canonical);
  const withRequiredGymCue = ensureGymEffort(withBodyAuthority, canonical);
  const withRequiredCarExterior = ensureCarExterior(withRequiredGymCue, canonical);
  const withGlassRealism = insertGlassRealism(withRequiredCarExterior, canonical);
  const withLightingLast = moveLightingLast(withGlassRealism);
  return retainMicroRealism(enforcePhase26WordBudget(withLightingLast, canonical), canonical);
}

const AUTO_STREET_MOODS = Object.freeze(new Set(["auto", "dawn", "rush", "normal", "school", "prayer", "cafe", "latenight"]));
const SPECIAL_PLACE_BY_MOOD = Object.freeze({ cafe: "saudi_bufia", normal: "old_service_alley", rush: "street_construction" });

function modifierById(group, id) {
  return SAUDI_REALISM_MODIFIERS[group]?.find((item) => item.id === id)?.prompt ?? "";
}

function sentence(value) {
  const cleaned = text(value).replace(/[.!?]+$/u, "");
  return cleaned ? `${cleaned}.` : "";
}

export function describeSaudiRealism(canonical) {
  const sceneId = text(canonical?.scene?.id);
  const mood = text(canonical?.scene?.facts?.street_mood).toLowerCase();
  let place = "";
  if (sceneId === "street" && AUTO_STREET_MOODS.has(mood || "auto")) {
    const specialPlace = SPECIAL_PLACE_BY_MOOD[mood];
    place = specialPlace
      ? modifierById("streetsAndPlaces", specialPlace)
      : modifierById("streetsAndPlaces", canonical?.lighting?.source_type === "daylight" ? "saudi_street_day" : "saudi_street_night");
  } else if (sceneId === "barbershop") {
    place = modifierById("authenticShops", "local_barbershop");
  } else if (sceneId === "grocery") {
    place = modifierById("authenticShops", "local_bakala");
  }
  if (!place) return "";
  const people = modifierById("backgroundHumans", sceneId === "street" ? "realistic_crowd" : "human_imperfections");
  return [sentence(place), sentence(people)].filter(Boolean).join(" ");
}

export function describePhase29CameraArtifacts(canonical) {
  if (text(canonical?.lighting?.source_type).toLowerCase() !== "daylight") return "";
  const sceneId = text(canonical?.scene?.id);
  if (!["street", "carExterior", "rooftop", "gasStation", "grocery"].includes(sceneId)) return "";
  return "Slight chromatic aberration at frame edges and a small natural sun flare; grainy shadows and slightly blown highlights appear where direct sunlight hits.";
}

export function describeCandidSpeech(canonical) {
  const primary = canonical?.subjects?.primary ?? {};
  const evidence = [primary.pose, primary.expression].map(text).join(" ");
  if (!/mid[- ]speech|speaking|talking|conversation/iu.test(evidence)) return "";
  return "Caught naturally mid-sentence with lips slightly parted and a small conversational hand gesture; the eyes remain naturally open with identity-preserving shape.";
}

function insertAfterLayer(prompt, anchor, addition) {
  if (!addition || prompt.includes(addition)) return prompt;
  if (anchor && prompt.includes(anchor)) return prompt.replace(anchor, `${anchor} ${addition}`);
  return `${prompt} ${addition}`.trim();
}

function insertSaudiRealism(prompt, canonical, maxWords = 250) {
  const realism = describeSaudiRealism(canonical);
  if (!realism) return prompt;
  let base = removeExact(prompt, describeSaudiStreetRealism(canonical));
  const anchor = describePlaceRealism(canonical);
  let candidate = insertAfterLayer(base, anchor, realism);
  if (words(candidate) <= maxWords) return candidate;
  for (const layer of [
    describePostProcessing(canonical),
    describeEnvironmentalDetails(canonical),
    describeCameraArtifacts(canonical),
    describeLightingPhysics(canonical)
  ]) {
    base = removeExact(base, layer);
    candidate = insertAfterLayer(base, anchor, realism);
    if (words(candidate) <= maxWords) return candidate;
  }
  return candidate;
}

function insertPhase29CameraArtifacts(prompt, canonical, maxWords = 250) {
  const artifact = describePhase29CameraArtifacts(canonical);
  if (!artifact || prompt.includes(artifact)) return prompt;
  let candidate = insertAfterLayer(prompt, describeCameraArtifacts(canonical), artifact);
  if (words(candidate) <= maxWords) return candidate;
  const base = removeExact(prompt, describePostProcessing(canonical));
  candidate = insertAfterLayer(base, describeCameraArtifacts(canonical), artifact);
  return words(candidate) <= maxWords ? candidate : prompt;
}

function insertCandidSpeech(prompt, canonical, maxWords = 250) {
  const speech = describeCandidSpeech(canonical);
  if (!speech || prompt.includes(speech)) return prompt;
  let candidate = insertAfterLayer(prompt, describeNaturalImperfections(canonical), speech);
  if (words(candidate) <= maxWords) return candidate;
  const base = removeExact(prompt, describePostProcessing(canonical));
  candidate = insertAfterLayer(base, describeNaturalImperfections(canonical), speech);
  return words(candidate) <= maxWords ? candidate : prompt;
}

function retainMicroRealism(prompt, canonical, maxWords = 250) {
  const signals = describeMicroRealism(canonical).match(/[^.!?]+[.!?]/gu)?.map((part) => part.trim()) ?? [];
  if (!signals.length || signals.some((signal) => prompt.includes(signal))) return prompt;
  const signal = signals.sort((a, b) => words(a) - words(b))[0];
  const lightingIndex = prompt.lastIndexOf("Lighting ");
  let candidate = lightingIndex < 0
    ? `${prompt} ${signal}`
    : `${prompt.slice(0, lightingIndex)}${signal} ${prompt.slice(lightingIndex)}`;
  if (words(candidate) > maxWords) {
    candidate = candidate.replace(/Lighting uses daylight and the selected [^.]+ setup\./iu, "Lighting uses daylight.");
  }
  if (words(candidate) > maxWords) {
    candidate = candidate.replace(/Subject wearing thobe white\./iu, "Wearing white thobe.");
  }
  return words(candidate) <= maxWords ? candidate : prompt;
}

function isNightGlassScene(canonical) {
  const source = text(canonical?.lighting?.source_type).toLowerCase();
  if (source === "daylight") return false;
  const evidence = [canonical?.lighting?.description, canonical?.lighting?.id].map(text).join(" ");
  return /\bnight\b|streetlight|interior spill|villa porch|\bdrl\b|\bdim\b/iu.test(evidence) || source === "practical" || source === "mixed";
}

export function describeGlassRealism(canonical) {
  if (canonical?.scene?.id === "carExterior") {
    if (isNightGlassScene(canonical)) return "At night the glass shows reflected streetlights and a dim view into the cabin instead of black panels; it remains transparent, never opaque black.";
    return "The windshield and side windows are clear glass with a light factory tint, carrying sky and environment reflections; the Ivory headliner and seats are faintly visible through the side glass; glass is never solid black.";
  }
  if (canonical?.scene?.id === "rangeRover" || canonical?.scene?.type === "vehicle") {
    return "The panoramic glass roof is transparent, revealing the actual sky or night stars above, not a black panel; side windows show the real exterior with natural reflections.";
  }
  return "";
}

function insertGlassRealism(prompt, canonical) {
  const glass = describeGlassRealism(canonical);
  if (!glass || prompt.includes(glass)) return prompt;
  const lightingIndex = Math.max(prompt.lastIndexOf("Lighting uses "), prompt.lastIndexOf("Lighting follows "));
  return lightingIndex < 0
    ? `${prompt} ${glass}`.trim()
    : `${prompt.slice(0, lightingIndex)}${glass} ${prompt.slice(lightingIndex)}`.replace(/\s{2,}/gu, " ").trim();
}

function moveLightingLast(prompt) {
  const lighting = prompt.match(/Lighting (?:uses|follows)[^.]*\./iu)?.[0] ?? "";
  if (!lighting) return prompt;
  const physicsPatterns = [
    /Gentle directional contrast creates gradual shadow falloff across the scene\./iu,
    /Localized highlights transition gradually into adjacent shadows\./iu,
    /Subtle color variation follows the overlapping illumination across the scene\./iu,
    /Concentrated illumination falls off across the nearby subject\./iu,
    /Soft low-contrast transitions extend across the scene\./iu
  ];
  let base = prompt.replace(lighting, "");
  const physics = [];
  for (const pattern of physicsPatterns) {
    const match = base.match(pattern)?.[0];
    if (match) {
      physics.push(match);
      base = base.replace(match, "");
    }
  }
  return `${base} ${lighting} ${physics.join(" ")}`.replace(/\s{2,}/gu, " ").trim();
}

function insertPhase26Authority(prompt, canonical) {
  const authority = [describeBodyAnatomy(canonical), describeSelfiePerspective(canonical), describeEnvironmentScale(canonical)].filter(Boolean).join(" ");
  if (!authority) return prompt;
  const identityMatch = prompt.match(/The primary subject preserves the supplied identity reference[^.]*\./iu);
  const captureMatch = prompt.match(/^A candid [^.]+\.\s*/iu);
  let reordered = prompt;
  if (identityMatch && identityMatch.index > 0) {
    reordered = `${identityMatch[0]} ${prompt.replace(identityMatch[0], "").trim()}`;
  } else if (!identityMatch && captureMatch) {
    reordered = prompt.slice(captureMatch[0].length).trim();
  }
  const anchor = identityMatch?.[0] ?? "";
  return anchor && reordered.startsWith(anchor)
    ? reordered.replace(anchor, `${anchor} ${authority}`)
    : `${authority} ${reordered}`.trim();
}

function ensureCarExterior(prompt, canonical) {
  if (canonical?.scene?.id !== "carExterior" || /Fuji White/iu.test(prompt)) return prompt;
  const genericScene = text(canonical?.scene?.description);
  const exterior = describeCarExterior(canonical)
    .replace(/The vehicle is parked on a driveway before a Saudi villa with beige stone cladding, high wall, metal gate, and a palm tree, with the subject /iu, "Beside a Saudi villa driveway and gate, the subject ")
    .replace(/The vehicle is in a marked outdoor lot with white lines, concrete wheel stops, and a few other parked cars, with the subject /iu, "In a marked outdoor parking lot, the subject ");
  const contact = "Tires have realistic contact shadow; tinted glass carries natural environment reflection.";
  const replacement = [exterior, contact].filter(Boolean).join(" ");
  const withoutLegacyTireCue = removeSentence(prompt, /The tires sit with realistic contact shadow on the ground\./iu);
  return genericScene && withoutLegacyTireCue.includes(`${genericScene}.`)
    ? withoutLegacyTireCue.replace(`${genericScene}.`, replacement)
    : genericScene && withoutLegacyTireCue.includes(genericScene)
      ? withoutLegacyTireCue.replace(genericScene, replacement.replace(/\.$/u, ""))
      : `${withoutLegacyTireCue} ${replacement}`.trim();
}

function ensureGymEffort(prompt, canonical) {
  if (canonical?.scene?.id !== "gym" || /Localized sweat sheen|damp shirt patch|Flushed skin|Chalk dust/iu.test(prompt)) return prompt;
  const effort = describeGymRealism(canonical).match(/[^.!?]+[.!?]/u)?.[0]?.trim() ?? "";
  if (!effort) return prompt;
  const lightingIndex = prompt.lastIndexOf("Lighting uses ");
  return lightingIndex < 0
    ? `${prompt} ${effort}`.trim()
    : `${prompt.slice(0, lightingIndex)}${effort} ${prompt.slice(lightingIndex)}`.replace(/\s{2,}/gu, " ").trim();
}

function removeSentence(prompt, pattern) {
  return prompt.replace(pattern, "").replace(/\s{2,}/gu, " ").trim();
}

function enforcePhase26WordBudget(prompt, canonical, maxWords = 250) {
  let compacted = dedupeExactSentences(prompt);
  if (words(compacted) <= maxWords) return compacted;

  if (canonical?.scene?.id === "carExterior") {
    compacted = compacted
      .replace(/The vehicle is parked on a driveway before a Saudi villa with beige stone cladding, high wall, metal gate, and a palm tree, with the subject /iu, "Beside a Saudi villa driveway and gate, the subject ")
      .replace(/The vehicle is in a marked outdoor lot with white lines, concrete wheel stops, and a few other parked cars, with the subject /iu, "In a marked outdoor parking lot, the subject ")
      .replace(/Alloy wheels show light brake dust and the tires sit with realistic contact shadow on the ground\./iu, "Tires have realistic contact shadow.")
      .replace(/The tires sit with realistic contact shadow on the ground\./iu, "Tires cast realistic contact shadows.")
      .replace(/Tinted glass mirrors the surroundings and the panoramic roof reflects the sky\./iu, "")
      .replace(/Tinted glass carries natural reflection of the surroundings\./iu, "")
      .replace(/a parked-car exterior selfie setting with realistic ground contact, generic Saudi surroundings, and natural environmental reflections\./iu,
        text(canonical?.scene?.facts?.carExteriorLocation) === "villa" ? "Beside a Saudi villa driveway and gate." : "In an ordinary outdoor parking setting.");
    if (words(compacted) <= maxWords) return compacted;
    for (const pattern of [
      /A single soft catchlight in each eye[^.]*\./iu,
      /Subtle natural eye reflection[^.]*\./iu,
      /Subtle tone variation between forehead and cheeks\./iu,
      /Faint natural pore detail across the cheeks\./iu,
      /Fuji White paint carries fine dust[^.]*\./iu,
      /An elongated light-pole reflection[^.]*\./iu,
      /Damp ground patches reflect[^.]*\./iu,
      /His hand rests on the body[^.]*\./iu
    ]) {
      compacted = removeSentence(compacted, pattern);
      if (words(compacted) <= maxWords) return compacted;
    }
    compacted = compacted
      .replace(/ with visible weave and natural standing folds/iu, "")
      .replace(/Beside a Saudi villa driveway and gate, the subject standing beside the open driver door\./iu, "At the villa, subject beside the open driver door.")
      .replace(/Tires have realistic contact shadow; tinted glass carries natural environment reflection\./iu, "Tires have realistic contact shadow.")
      .replace(/small Autobiography Dynamic badging and Saudi plate present, both soft-focus and never legible/iu, "Autobiography Dynamic badging and Saudi plate, never legible");
    if (words(compacted) <= maxWords) return compacted;
  }

  compacted = compactIdentity(compacted);
  if (words(compacted) <= maxWords) return compacted;

  compacted = compacted
    .replace(/\bpose pose\b/giu, "pose")
    .replace(/\bexpression expression\b/giu, "expression")
    .replace(
      /The primary subject has a ([^,.]+) pose, a ([^,.]+) expression, and wearing ([^.]+)\./iu,
      "Subject: $1 pose, $2 expression, wearing $3."
    )
    .replace(
      /The primary subject has a ([^,.]+) pose and a ([^,.]+) expression\./iu,
      "Subject: $1 pose, $2 expression."
    )
    .replace(
      /(Xiaomi 15 Ultra[^:]*front camera): (\d+) cm, (-?\d+)° yaw, (-?\d+)° pitch, (-?\d+)° roll, (\d+) mm, and ([^.]+) crop\./iu,
      "$1: $2cm, yaw$3°, pitch$4°, roll$5°, $6mm, $7."
    );
  if (words(compacted) <= maxWords) return compacted;

  for (const pattern of [
    /Faint natural pore detail across the cheeks\./iu,
    /Soft contact shadows ground the subject and nearby objects to their surfaces\./iu,
    /Subtle natural eye reflection mirrors the surrounding environment\./iu,
    /Subtle tone variation between forehead and cheeks\./iu,
    /A single soft catchlight in each eye matches the dominant light source\./iu
  ]) {
    compacted = removeSentence(compacted, pattern);
    if (words(compacted) <= maxWords) return compacted;
  }

  compacted = compacted.replace(/Subject: [^,.]+ pose, [^,.]+ expression, wearing ([^.]+)\./iu, "Subject wearing $1.");
  if (words(compacted) <= maxWords) return compacted;

  if (describeHeadwear(canonical)) {
    const bounds = clothingSentenceBounds(compacted, canonical);
    if (bounds) {
      const primary = canonical?.subjects?.primary ?? {};
      const replacement = `Subject: ${text(primary.pose) || "natural pose"}, ${text(primary.expression) || "natural expression"}, wearing selected white thobe.`;
      compacted = `${compacted.slice(0, bounds.start)}${replacement}${compacted.slice(bounds.end)}`.replace(/\s{2,}/gu, " ").trim();
      if (words(compacted) <= maxWords) return compacted;
    }
    compacted = removeSentence(compacted, /Natural fabric wrinkles and folds\./iu);
    if (words(compacted) <= maxWords) return compacted;
  }

  for (const pattern of [
    /Human anatomy is physically plausible[^.]*\./iu,
    /Visual preferences:[^.]+\./iu
  ]) {
    compacted = removeSentence(compacted, pattern);
    if (words(compacted) <= maxWords) return compacted;
  }

  compacted = compactCamera(compacted);
  if (words(compacted) <= maxWords) return compacted;

  compacted = compacted
    .replace(
      /Inside a stationary 2017 Range Rover Sport Autobiography Dynamic \(L494\) in Fuji White\. The Ebony\/Ivory luxury cabin has Ivory perforated leather seats, dark wood veneer on the center console and door trim, a black-and-Ivory leather multifunction steering wheel, and a panoramic glass roof\./iu,
      "Inside stationary 2017 Range Rover Sport Autobiography Dynamic L494, Fuji White; Ivory perforated leather, dark wood veneer, panoramic glass roof."
    );
  if (words(compacted) <= maxWords) return compacted;

  compacted = removeSentence(compacted, /The (?:subject|camera-holding group member) (?:holds|operates) the camera[^.]*\./iu);
  if (words(compacted) <= maxWords) return compacted;

  compacted = removeSentence(compacted, /The capture uses[^.]*\./iu);
  if (words(compacted) <= maxWords) return compacted;

  for (const pattern of [
    /Scene details:[^.]+\./iu,
    /A candid (?:driver|direct|group|mirror) selfie\./iu,
    /Captured with the selected physically plausible front-camera geometry\./iu
  ]) {
    compacted = removeSentence(compacted, pattern);
    if (words(compacted) <= maxWords) return compacted;
  }
  return compacted;
}

function dedupeExactSentences(prompt) {
  const parts = text(prompt).match(/[^.!?]+[.!?]|[^.!?]+$/gu)?.map((part) => part.trim()).filter(Boolean) ?? [];
  const seen = new Set();
  return parts.filter((part) => {
    const key = part.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).join(" ");
}

export default buildOpenAIImagePrompt;
