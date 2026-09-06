import { buildCanonicalV3UserOutput as buildPhase45CanonicalV3UserOutput } from "./canonical-v3-phase45.js";
import { NATURAL_HEIGHT_SCALE_SENTENCE, resolveNaturalClothingFabricNote } from "./canonical-v3-pipeline.js";
import {
  POSITIVE_CAR_GLASS_SENTENCE,
  POSITIVE_SKIN_SENTENCE,
  describeNaturalNightLighting
} from "./openai-image-adapter-phase36.js";

function text(value) { return String(value ?? "").trim(); }
function words(value) { return text(value).split(/\s+/u).filter(Boolean).length; }
function sentences(value) { return String(value || "").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map((part) => part.replace(/\s+/gu, " ").trim()).filter(Boolean) || []; }
function dedupe(value) {
  const seen = new Set();
  return sentences(value).filter((sentence) => {
    const key = sentence.toLowerCase().replace(/\s+/gu, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).join(" ").replace(/\s{2,}/gu, " ").trim();
}

function displayGarmentText(garment) {
  const source = text(garment);
  if (/\bthobe\b/iu.test(source) && /shemagh|ghutra|iqal|agal/iu.test(source)) {
    return source.match(/^.*?\bthobe\b/iu)?.[0] || source;
  }
  return source;
}

function replaceClothingSentence(prompt, raw, canonical) {
  const garment = text(canonical?.subjects?.primary?.clothing?.garment);
  if (!garment || /^unspecified garment$/iu.test(garment)) return String(prompt || "");
  const displayGarment = displayGarmentText(garment);
  const fabricNote = resolveNaturalClothingFabricNote(raw, garment) || (/\bthobe\b/iu.test(displayGarment) ? "cotton" : "");
  const alreadyNamesFabric = fabricNote && displayGarment.toLowerCase().includes(fabricNote.toLowerCase());
  const fabricClause = fabricNote && !alreadyNamesFabric ? ` with ${fabricNote} fabric` : "";
  const coherent = `Subject wearing ${displayGarment}${fabricClause} and natural standing folds.`;
  const parts = sentences(prompt);
  let index = parts.findIndex((sentence) => sentence.includes(garment) && /\bwearing\b|\bClothing:/iu.test(sentence));
  if (index < 0) index = parts.findIndex((sentence) => /\bSubject wearing\b|\bClothing:/iu.test(sentence));
  if (index >= 0) parts[index] = coherent;
  else parts.push(coherent);
  return dedupe(parts.join(" "));
}

function naturalizeScale(prompt, section) {
  if (section?.id !== "carExterior") return String(prompt || "");
  let source = String(prompt || "")
    .replace(/Vehicle scale confirms a genuine 195 cm adult\.\s*/giu, "")
    .replace(/Roofline, door and handle scale reads as a genuine 195 cm adult\.\s*/giu, "")
    .replace(/Shoulder and head height relative to roofline, door frame, and handle reflect a genuine 195 cm adult\.\s*/giu, "")
    .replace(/\s{2,}/gu, " ")
    .trim();
  if (!source.includes(NATURAL_HEIGHT_SCALE_SENTENCE)) source = `${source} ${NATURAL_HEIGHT_SCALE_SENTENCE}`.trim();
  return source;
}

function angleSentence(geometry) {
  if (geometry?.angle === "three-quarter") return "Camera held close to eye level with a natural three-quarter turn.";
  const degrees = Number(geometry?.angleDegrees || 0);
  if (degrees > 0) return "Camera held slightly above eye level.";
  if (degrees < 0) return "Camera held slightly below eye level.";
  return "Camera held close to eye level.";
}

function framingSentence(section, geometry) {
  if (section?.id === "carExterior") return "Naturally imperfect framing where the Range Rover is slightly awkwardly cropped in the way a real one-handed selfie captures it.";
  if (section?.id === "street" && geometry?.pose === "walking") return "The walking selfie keeps the streetlights behind the subject with a naturally imperfect one-handed crop.";
  if (section?.id === "group") return "A wide, slightly imperfect group crop keeps the staggered group and phone holder naturally centered.";
  if (section?.id === "accidental") return "The accidental framing stays low and off-axis with an imperfect edge crop.";
  if (section?.id === "gym" && geometry?.pose === "seated-rest-elbows") return "The frame catches a believable seated rest with the elbows on the knees and ordinary gym context behind.";
  if (section?.id === "bedroom" && geometry?.pose === "seated-bed") return "The frame catches a natural seated-on-bed selfie with ordinary bedside context.";
  return "The framing feels naturally imperfect and consistent with a real one-handed selfie.";
}

function naturalizeGeometry(prompt, section, geometry) {
  const parts = sentences(prompt).filter((sentence) => !/^Selfie optics lock:/iu.test(sentence) && !/^Selfie framing:/iu.test(sentence));
  const lightingIndex = parts.findIndex((sentence) => /^Lighting\b/iu.test(sentence));
  const additions = [angleSentence(geometry), framingSentence(section, geometry)];
  if (lightingIndex < 0) parts.push(...additions);
  else parts.splice(lightingIndex, 0, ...additions);
  return dedupe(parts.join(" "));
}

function removeDuplicatePose(prompt, section) {
  if (section?.id !== "carExterior") return String(prompt || "");
  return sentences(prompt).filter((sentence) => !/^subject leaning on closed driver door\.?$/iu.test(sentence)).join(" ");
}

function scopedCarSpec(section, geometry) {
  if (section?.id !== "carExterior") return "";
  const sidePose = new Set(["door-lean", "door-open", "front-fender", "side-view"]).has(text(geometry?.pose));
  if (sidePose) {
    return "2017 Range Rover Sport Autobiography Dynamic L494 in Fuji White, with gloss-black grille and vent trim, dark 22-inch alloys, LED DRLs, panoramic roof, transparent glass with natural reflections and a faint Ivory-cabin view where lighting allows, and Dynamic badging.";
  }
  return "2017 Range Rover Sport Autobiography Dynamic L494 in Fuji White, with gloss-black grille and vent trim, dark 22-inch alloys, quad exhausts, LED DRLs, panoramic roof, transparent glass with natural reflections and a faint Ivory-cabin view where lighting allows, and Dynamic badging.";
}

function naturalizeCarSpecAndGlass(prompt, section, geometry) {
  let parts = sentences(prompt);
  if (section?.id === "carExterior") {
    const spec = scopedCarSpec(section, geometry);
    const index = parts.findIndex((sentence) => /2017 Range Rover Sport Autobiography Dynamic/iu.test(sentence));
    if (index >= 0) parts[index] = spec;
    else parts.push(spec);
  }
  parts = parts.map((sentence) => sentence
    .replace(/transparent glass with faint Ivory-cabin view, never opaque black/giu, "transparent glass with natural reflections and a faint Ivory-cabin view where lighting allows")
    .replace(/transparent glass with natural reflections and a faint Ivory-cabin view, never opaque black/giu, "transparent glass with natural reflections and a faint Ivory-cabin view where lighting allows")
    .replace(/At night, transparent glass carries streetlight reflections and a dim cabin view; never opaque black/giu, POSITIVE_CAR_GLASS_SENTENCE)
    .replace(/Transparent windshield and side glass carry natural reflections and a faint view of the Ivory cabin; never opaque black/giu, POSITIVE_CAR_GLASS_SENTENCE)
    .replace(/The panoramic glass roof is transparent, revealing the actual sky or night stars above, not a black panel; side windows show the real exterior with natural reflections/giu, "The panoramic glass roof and side windows remain transparent with natural reflections and exterior detail where lighting allows")
  );
  if (section?.id === "car" && !parts.some((sentence) => /transparent.*natural reflections/iu.test(sentence))) parts.push("The panoramic glass roof and side windows remain transparent with natural reflections and exterior detail where lighting allows.");
  return dedupe(parts.join(" "));
}

function ensurePositiveSkin(prompt) {
  let parts = sentences(prompt).filter((sentence) => !/^Fine pores, faint tonal variation between facial regions, realistic beard detail, no waxy smoothing\.?$/iu.test(sentence));
  const lightingIndex = parts.findIndex((sentence) => /^Lighting\b/iu.test(sentence));
  if (lightingIndex < 0) parts.push(POSITIVE_SKIN_SENTENCE);
  else parts.splice(lightingIndex, 0, POSITIVE_SKIN_SENTENCE);
  return dedupe(parts.join(" "));
}

function naturalizeLighting(prompt, raw, section, canonical) {
  const night = text(raw?.time).toLowerCase() !== "day" && text(canonical?.lighting?.source_type).toLowerCase() !== "daylight";
  if (!night) return String(prompt || "");
  const concrete = describeNaturalNightLighting(canonical, raw, section?.id);
  const parts = sentences(prompt).filter((sentence) => !/^Lighting (?:uses|follows)\b/iu.test(sentence));
  parts.push(concrete);
  return dedupe(parts.join(" "));
}

function compactBodyIfNeeded(prompt, maxWords) {
  if (words(prompt) <= maxWords) return prompt;
  return String(prompt || "").replace(
    /Tall 195 cm, 88 kg lean-athletic build: medium-to-moderately-broad shoulders visibly wider than the waist, moderately developed chest, subtle deltoid roundness, long proportional limbs with filled-not-thin arms, proportionate adult male neck, and head anatomically scaled to tall frame\./iu,
    "Tall 195 cm, 88 kg lean-athletic build with believable adult proportions."
  );
}

function keepBudget(prompt, section, geometry, canonical, maxWords) {
  let parts = sentences(dedupe(compactBodyIfNeeded(prompt, maxWords)));
  const garment = text(canonical?.subjects?.primary?.clothing?.garment);
  const displayGarment = displayGarmentText(garment);
  const protect = (sentence) => Boolean(
    /^A candid |^An accidental /u.test(sentence)
    || /Identity strictly preserved from the reference image:/iu.test(sentence)
    || /One arm extends toward the camera holding the phone/iu.test(sentence)
    || sentence.includes(POSITIVE_SKIN_SENTENCE)
    || sentence.includes(NATURAL_HEIGHT_SCALE_SENTENCE)
    || /^Camera held /iu.test(sentence)
    || /naturally imperfect|one-handed crop|wide, slightly imperfect group crop|accidental framing|seated rest|seated-on-bed selfie/iu.test(sentence)
    || /2017 Range Rover Sport Autobiography Dynamic/iu.test(sentence)
    || /transparent.*natural reflections/iu.test(sentence)
    || /shemagh|ghutra|iqal|agal|bisht/iu.test(sentence)
    || (displayGarment && sentence.includes(displayGarment))
    || /^Warm villa porch light|^Real parking-lot practical lighting|^Mixed sodium streetlights|^Available practical night lighting/iu.test(sentence)
    || (section?.id === "carExterior" && /Saudi villa|marked outdoor lot|small grocery|yellow-and-black|sandy shoulder|mall parking|Tires have realistic contact shadow|Open door reveals/iu.test(sentence))
  );
  const optional = [
    /Visual preferences:/iu,/Scene details:/iu,/Natural hair flyaways/iu,/Natural fabric wrinkles/iu,/Natural body proportions consistent/iu,
    /Natural sensor noise/iu,/Slight lens softness/iu,/Authentic white balance/iu,/Localized highlights transition/iu,/Gentle directional contrast/iu,
    /A single soft catchlight/iu,/Subtle natural eye reflection/iu,/Captured with /iu,/The capture uses a physically possible camera position/iu,
    /soft-focus background characters/iu,/Blurred ambient streetlight glow/iu,/Out-of-focus warm storefront light/iu,/mixed lighting from yellow sodium lamps/iu,
    /Localized sweat sheen|A damp shirt patch|Flushed skin|Chalk dust/iu,/Chrome bars|Bench upholstery|Weight plates|Rubber flooring/iu,
    /A water bottle|His phone and gym bag|One side of the bar/iu,/A blurred figure|A distant figure/iu
  ];
  for (const pattern of optional) {
    if (words(parts.join(" ")) <= maxWords) break;
    for (let index = parts.length - 1; index >= 0 && words(parts.join(" ")) > maxWords; index -= 1) {
      if (pattern.test(parts[index]) && !protect(parts[index])) parts.splice(index, 1);
    }
  }
  for (let index = parts.length - 1; index >= 0 && words(parts.join(" ")) > maxWords; index -= 1) {
    if (!protect(parts[index])) parts.splice(index, 1);
  }
  return dedupe(parts.join(" "));
}

function naturalizePrompt(base, raw) {
  const section = base.section;
  const geometry = base.geometry;
  let prompt = replaceClothingSentence(base.prompt, raw, base.canonical);
  prompt = naturalizeScale(prompt, section);
  prompt = removeDuplicatePose(prompt, section);
  prompt = naturalizeGeometry(prompt, section, geometry);
  prompt = naturalizeCarSpecAndGlass(prompt, section, geometry);
  prompt = ensurePositiveSkin(prompt);
  prompt = naturalizeLighting(prompt, raw, section, base.canonical);
  prompt = prompt.replace(/\bmanual\s+[^.]*composition\b/giu, "natural one-handed framing").replace(/\s{2,}/gu, " ").trim();
  const maxWords = section?.id === "carExterior" ? 280 : 250;
  return keepBudget(prompt, section, geometry, base.canonical, maxWords);
}

export function buildCanonicalV3UserOutput(rawInput = {}, sceneData = undefined) {
  const base = buildPhase45CanonicalV3UserOutput(rawInput, sceneData);
  if (!base?.geometry) return base;
  const prompt = naturalizePrompt(base, rawInput);
  return Object.freeze({ ...base, prompt });
}

export default buildCanonicalV3UserOutput;
