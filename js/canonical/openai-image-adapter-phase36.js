import buildPhase35Prompt, { describeHeadwear } from "./openai-image-adapter.js";
import { CAR_EXTERIOR_SPEC } from "../data.js";

export * from "./openai-image-adapter.js";

export const SELFIE_ARM_LOCK = "One arm extends toward the camera holding the phone; the other hand stays free or relaxed — never both hands in pockets or both hands occupied.";

const DIRECT_SELFIE_TYPES = new Set(["direct_front_camera_selfie", "subject_held_driver_selfie", "mirror_selfie"]);

function text(value) { return typeof value === "string" ? value.trim() : ""; }
function words(value) { return text(value).split(/\s+/u).filter(Boolean).length; }
function escapeRegExp(value) { return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

export function captureOpeningSentence(canonical) {
  const type = text(canonical?.capture?.type);
  if (DIRECT_SELFIE_TYPES.has(type)) return "A candid direct selfie.";
  if (type === "group_selfie") return "A candid group selfie.";
  if (type === "accidental_front_camera_capture") return "An accidental front-camera capture.";
  return "";
}

function stripExistingCaptureOpeners(prompt) {
  return String(prompt || "")
    .replace(/\bA candid direct selfie\.\s*/giu, "")
    .replace(/\bA candid group selfie\.\s*/giu, "")
    .replace(/\bA candid mirror selfie\.\s*/giu, "")
    .replace(/\bAn accidental front-camera capture\.\s*/giu, "")
    .replace(/\s{2,}/gu, " ")
    .trim();
}

function stripExistingOperatorSentence(prompt) {
  return String(prompt || "")
    .replace(/The subject operates the camera from a physically reachable arm position in one physically possible capture event\.\s*/giu, "")
    .replace(/The subject holds the camera at natural arm reach\.\s*/giu, "")
    .replace(/The camera-holding group member operates the camera from a physically reachable arm position in one physically possible capture event\.\s*/giu, "")
    .replace(/\s{2,}/gu, " ")
    .trim();
}

function isIntentionalSelfie(canonical) {
  return ["direct_front_camera_selfie", "subject_held_driver_selfie", "group_selfie", "mirror_selfie"].includes(text(canonical?.capture?.type));
}

function sentenceParts(prompt) {
  return String(prompt || "").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map((part) => part.replace(/\s+/gu, " ").trim()).filter(Boolean) || [];
}

export function removeExactDuplicateSentences(prompt) {
  const seen = new Set();
  const kept = [];
  for (const sentence of sentenceParts(prompt)) {
    const key = sentence.replace(/\s+/gu, " ").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push(sentence);
  }
  return kept.join(" ").replace(/\s{2,}/gu, " ").trim();
}

function applyAuthorityClothing(prompt, canonical) {
  const garment = text(canonical?.subjects?.primary?.clothing?.garment);
  if (!garment) return prompt;
  return String(prompt || "").replace(/\bwearing selected [^.]+(?=\.)/giu, `wearing ${garment}`);
}

function deconflictRepeatedPose(prompt, canonical) {
  if (canonical?.scene?.id !== "carExterior") return prompt;
  const pose = text(canonical?.subjects?.primary?.pose);
  if (!pose) return prompt;
  const posePattern = new RegExp(escapeRegExp(pose), "giu");
  const matches = String(prompt || "").match(posePattern) || [];
  if (matches.length < 2) return prompt;
  const sceneClause = new RegExp(`,?\\s*(?:with\\s+the\\s+subject|the\\s+subject)\\s+${escapeRegExp(pose)}`, "iu");
  return String(prompt || "").replace(sceneClause, "").replace(/\s{2,}/gu, " ").trim();
}

function ensureCarSpecSentence(prompt, canonical) {
  if (canonical?.scene?.id !== "carExterior") return prompt;
  if (/2017 Range Rover Sport Autobiography Dynamic/iu.test(prompt)) return prompt;
  return `${prompt} ${CAR_EXTERIOR_SPEC}`.replace(/\s{2,}/gu, " ").trim();
}

function isNight(canonical) {
  const source = text(canonical?.lighting?.source_type).toLowerCase();
  if (canonical?.scene?.id === "carExterior" && source !== "daylight") return true;
  const evidence = [canonical?.lighting?.description, canonical?.lighting?.id, canonical?.scene?.time].map(text).join(" ");
  return source !== "daylight" && (/\bnight\b|streetlight|practical|mixed|dim|porch/iu.test(evidence) || source === "practical" || source === "mixed");
}

function ensureLightingSentence(prompt, canonical) {
  if (/\bLighting (?:uses|follows)[^.]*\./iu.test(prompt)) return prompt;
  if (!isNight(canonical)) return prompt;
  return `${prompt} Lighting follows the selected real-world night source.`.replace(/\s{2,}/gu, " ").trim();
}

function protectedSentence(sentence, canonical) {
  const opening = captureOpeningSentence(canonical);
  const headwear = describeHeadwear(canonical);
  const garment = text(canonical?.subjects?.primary?.clothing?.garment);
  return Boolean(
    (opening && sentence === opening)
    || /The primary subject preserves the supplied identity reference/iu.test(sentence)
    || /2017 Range Rover Sport Autobiography Dynamic/iu.test(sentence)
    || (headwear && sentence.includes(headwear))
    || (garment && sentence.includes(garment))
    || /^Lighting (?:uses|follows)\b/iu.test(sentence)
  );
}

const DROP_ORDER = Object.freeze([
  Object.freeze([
    /Visual preferences:/iu,
    /Realistic dynamic range with natural highlight rolloff/iu,
    /Authentic white balance matched to the dominant light source/iu,
    /Minimal retouching preserves natural skin and fabric texture/iu
  ]),
  Object.freeze([
    /Scene details:/iu,
    /Fuji White paint carries fine dust/iu,
    /An elongated light-pole reflection/iu,
    /Damp ground patches reflect/iu,
    /Transparent glass carries natural reflections/iu,
    /At night, transparent glass carries streetlight reflections/iu,
    /Natural wear appears on frequently touched surfaces/iu,
    /Tires (?:have realistic contact shadow|cast realistic contact shadows)/iu
  ]),
  Object.freeze([
    /Subtle tone variation between forehead and cheeks/iu,
    /Faint natural pore detail across the cheeks/iu,
    /Subtle skin texture with natural pores/iu,
    /Natural hair flyaways and loose strands/iu,
    /Natural fabric wrinkles and folds/iu,
    /Natural body proportions consistent with the environment/iu,
    /Natural sensor noise is visible in shadow areas/iu,
    /Localized highlights transition gradually into adjacent shadows/iu,
    /Gentle directional contrast creates gradual shadow falloff across the scene/iu,
    /Subtle natural eye reflection/iu,
    /A single soft catchlight in each eye/iu
  ]),
  Object.freeze([
    /Captured with /iu,
    /Slight lens softness is visible toward the frame edges/iu,
    /Camera near eye level at 45–60 cm/iu,
    /selected physically plausible front-camera geometry/iu
  ])
]);

function keepWithinBudget(prompt, canonical, maxWords = 250) {
  let sentences = sentenceParts(prompt);
  for (const category of DROP_ORDER) {
    for (const pattern of category) {
      if (words(sentences.join(" ")) <= maxWords) return sentences.join(" ");
      const index = sentences.findIndex((sentence) => pattern.test(sentence) && !protectedSentence(sentence, canonical));
      if (index >= 0) sentences.splice(index, 1);
    }
  }
  if (words(sentences.join(" ")) > maxWords) {
    for (let index = sentences.length - 1; index >= 0 && words(sentences.join(" ")) > maxWords; index -= 1) {
      if (!protectedSentence(sentences[index], canonical) && !sentences[index].includes(SELFIE_ARM_LOCK)) sentences.splice(index, 1);
    }
  }
  return sentences.join(" ").replace(/\s{2,}/gu, " ").trim();
}

export function buildOpenAIImagePrompt(canonical, options = {}) {
  const opening = captureOpeningSentence(canonical);
  let prompt = buildPhase35Prompt(canonical, options);
  prompt = stripExistingCaptureOpeners(prompt);
  if (isIntentionalSelfie(canonical)) prompt = stripExistingOperatorSentence(prompt);
  prompt = applyAuthorityClothing(prompt, canonical);
  prompt = deconflictRepeatedPose(prompt, canonical);
  if (opening) {
    const prefix = isIntentionalSelfie(canonical) ? `${opening} ${SELFIE_ARM_LOCK}` : opening;
    prompt = `${prefix} ${prompt}`;
  }
  prompt = ensureCarSpecSentence(prompt, canonical);
  prompt = ensureLightingSentence(prompt, canonical);
  prompt = removeExactDuplicateSentences(prompt);
  return keepWithinBudget(prompt, canonical);
}

export default buildOpenAIImagePrompt;
