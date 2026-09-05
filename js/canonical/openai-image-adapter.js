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
  const withBodyAuthority = insertPhase26Authority(withHeadwear, canonical);
  const withRequiredGymCue = ensureGymEffort(withBodyAuthority, canonical);
  const withRequiredCarExterior = ensureCarExterior(withRequiredGymCue, canonical);
  const withLightingLast = moveLightingLast(withRequiredCarExterior);
  return enforcePhase26WordBudget(withLightingLast, canonical);
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
    .replace(
      /2017 Range Rover Sport Autobiography Dynamic L494 in Fuji White, gloss black grille and side-vent surrounds, 22-inch dark alloy wheels, quad rectangular exhaust tips, LED headlights with DRL signature, panoramic glass roof, tinted rear glass, small Autobiography Dynamic badging and Saudi plate present, both soft-focus and never legible\./iu,
      "2017 Range Rover Sport Autobiography Dynamic L494 in Fuji White, dark wheels, quad rectangular exhaust tips, LED headlights, panoramic roof, tinted glass, with badge and Saudi plate soft-focus and never legible."
    )
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
      .replace(
        /2017 Range Rover Sport Autobiography Dynamic L494 in Fuji White, gloss black grille and side-vent surrounds, 22-inch dark alloy wheels, quad rectangular exhaust tips, LED headlights with DRL signature, panoramic glass roof, tinted rear glass, small Autobiography Dynamic badging and Saudi plate present, both soft-focus and never legible\./iu,
        "2017 Range Rover Sport Autobiography Dynamic L494 in Fuji White, dark wheels, quad rectangular exhaust tips, LED headlights, panoramic roof, tinted glass, with badge and Saudi plate soft-focus and never legible."
      )
      .replace(/The vehicle is parked on a driveway before a Saudi villa with beige stone cladding, high wall, metal gate, and a palm tree, with the subject /iu, "Beside a Saudi villa driveway and gate, the subject ")
      .replace(/The vehicle is in a marked outdoor lot with white lines, concrete wheel stops, and a few other parked cars, with the subject /iu, "In a marked outdoor parking lot, the subject ");
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
  }

  compacted = compactIdentity(compacted);
  if (words(compacted) <= maxWords) return compacted;

  compacted = compacted
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
      "$1: $2cm, yaw $3°, pitch $4°, roll $5°, $6mm, $7 crop."
    );
  if (words(compacted) <= maxWords) return compacted;

  for (const pattern of [
    /Faint natural pore detail across the cheeks\./iu,
    /Soft contact shadows ground the subject and nearby objects to their surfaces\./iu,
    /Subtle natural eye reflection mirrors the surrounding environment\./iu
  ]) {
    compacted = removeSentence(compacted, pattern);
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
      "Inside stationary 2017 Range Rover Sport Autobiography Dynamic L494 in Fuji White. Its cabin retains Ivory perforated leather, dark wood veneer, panoramic glass roof."
    );
  if (words(compacted) <= maxWords) return compacted;

  compacted = removeSentence(compacted, /The (?:subject|camera-holding group member) (?:holds|operates) the camera[^.]*\./iu);
  if (words(compacted) <= maxWords) return compacted;

  compacted = removeSentence(compacted, /The capture uses[^.]*\./iu);
  if (words(compacted) <= maxWords) return compacted;

  for (const pattern of [
    /Scene details:[^.]+\./iu,
    /A candid (?:driver|direct|group|mirror) selfie\./iu,
    /Captured with the selected physically plausible front-camera geometry\./iu,
    /The tires sit with realistic contact shadow on the ground\./iu
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
