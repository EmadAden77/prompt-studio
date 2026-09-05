import buildPhase35Prompt from "./openai-image-adapter.js";

export * from "./openai-image-adapter.js";

export const SELFIE_ARM_LOCK = "One arm extends toward the camera holding the phone; the other hand stays free or relaxed — never both hands in pockets or both hands occupied.";

const DIRECT_SELFIE_TYPES = new Set(["direct_front_camera_selfie", "subject_held_driver_selfie", "mirror_selfie"]);

function text(value) { return typeof value === "string" ? value.trim() : ""; }
function words(value) { return text(value).split(/\s+/u).filter(Boolean).length; }

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

const LOW_PRIORITY_PATTERNS = Object.freeze([
  /Visual preferences:[^.]+\.\s*/iu,
  /Scene details:[^.]+\.\s*/iu,
  /Subtle tone variation between forehead and cheeks\.\s*/iu,
  /Natural hair flyaways and loose strands\.\s*/iu,
  /Natural fabric wrinkles and folds\.\s*/iu,
  /Natural body proportions consistent with the environment\.\s*/iu,
  /Slight lens softness is visible toward the frame edges\.\s*/iu,
  /Localized highlights transition gradually into adjacent shadows\.\s*/iu,
  /Gentle directional contrast creates gradual shadow falloff across the scene\.\s*/iu,
  /Transparent glass carries natural reflections and a faint view into the Ivory cabin\.\s*/iu,
  /At night, transparent glass carries streetlight reflections and a dim cabin view; never opaque black\.\s*/iu,
  /Lighting follows the selected real-world day or night source\.\s*/iu,
  /Captured with the selected physically plausible front-camera geometry\.\s*/iu,
  /; Autobiography Dynamic badging and Saudi plate, never legible/iu
]);

function keepWithinBudget(prompt, maxWords = 250) {
  let result = String(prompt || "").replace(/\s{2,}/gu, " ").trim();
  for (const pattern of LOW_PRIORITY_PATTERNS) {
    if (words(result) <= maxWords) break;
    result = result.replace(pattern, "").replace(/\s{2,}/gu, " ").trim();
  }
  return result;
}

export function buildOpenAIImagePrompt(canonical, options = {}) {
  const opening = captureOpeningSentence(canonical);
  let prompt = buildPhase35Prompt(canonical, options);
  if (!opening) return prompt;

  prompt = stripExistingCaptureOpeners(prompt);
  if (isIntentionalSelfie(canonical)) prompt = stripExistingOperatorSentence(prompt);

  const prefix = isIntentionalSelfie(canonical)
    ? `${opening} ${SELFIE_ARM_LOCK}`
    : opening;
  return keepWithinBudget(`${prefix} ${prompt}`);
}

export default buildOpenAIImagePrompt;
