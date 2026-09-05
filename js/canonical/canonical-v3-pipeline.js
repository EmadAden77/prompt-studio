import "../phase30-clothing-catalog.js";
import { buildCanonicalV3 } from "../canonical-v3-engine.js";
import { resolveCanonicalConflicts } from "./conflict-resolver.js";
import { buildOpenAIImagePrompt, describeHeadwear } from "./openai-image-adapter-phase36.js";
import { applyGroupPhase13, enrichGroupPromptPhase13 } from "./group-phase13.js";
import { SCENES, LIGHTING_OPTIONS, CAR_EXTERIOR_LOCATIONS, CAR_EXTERIOR_POSES } from "../data.js";
import { resolveClothingText } from "../phase30-clothing-catalog.js";

export const CAR_EXTERIOR_PROMPT_WORD_BUDGET = 280;
const PHASE34_ROUTING_WORD_BUDGET = 250;
const PHASE34_REDUNDANT_GLASS_SENTENCE = "Transparent glass carries natural reflections and a faint view into the Ivory cabin.";

export const SECTION_CAPTURE_ROUTING = Object.freeze({
  solo: Object.freeze({ captureType:"direct_front_camera_selfie", intentType:"selfie", fallbackScene:"street" }),
  selfie: Object.freeze({ captureType:"direct_front_camera_selfie", intentType:"selfie", fallbackScene:"street" }),
  studio: Object.freeze({ captureType:"direct_front_camera_selfie", intentType:"selfie", fallbackScene:"street" }),
  bedroom: Object.freeze({ captureType:"direct_front_camera_selfie", intentType:"selfie", fallbackScene:"bedroom" }),
  gym: Object.freeze({ captureType:"direct_front_camera_selfie", intentType:"selfie", fallbackScene:"gym" }),
  street: Object.freeze({ captureType:"direct_front_camera_selfie", intentType:"selfie", fallbackScene:"street" }),
  carExterior: Object.freeze({ captureType:"direct_front_camera_selfie", intentType:"selfie", scene:"carExterior", forceScene:true }),
  car: Object.freeze({ captureType:"subject_held_driver_selfie", intentType:"car", scene:"rangeRover", forceScene:true }),
  group: Object.freeze({ captureType:"group_selfie", intentType:"group", fallbackScene:"street" }),
  accidental: Object.freeze({ captureType:"accidental_front_camera_capture", intentType:"accidental", fallbackScene:"street" })
});

const REAL_SECTION_SCENES = new Set(["bedroom","gym","street","carExterior","rangeRover","majlis","kashta","barbershop","grocery","rooftop","streetFootball","gasStation"]);
const SELFIE_CAPTURE_TYPES = new Set(["direct_front_camera_selfie","subject_held_driver_selfie","group_selfie","mirror_selfie"]);
const DAILY_SCENE_KEYS = new Set(["majlis", "kashta", "barbershop", "grocery", "rooftop", "streetFootball", "gasStation"]);
const SECTION_GARMENT_SCENE = Object.freeze({
  solo: "street",
  street: "street",
  bedroom: "bedroom",
  gym: "gym",
  car: "rangeRover",
  carExterior: "carExterior",
  accidental: "street",
  custom: "street",
  group: "street"
});
const WEAR_TEXT = Object.freeze({
  fresh: "fresh wear",
  "normal-day": "ordinary daily wear",
  "hours-worn": "several hours worn",
  "washed-soft": "washed-soft daily wear",
  "home-used": "home-used wear",
  "post-workout": "post-workout wear"
});
const FIT_TEXT = Object.freeze({
  slim: "slim fit",
  regular: "regular fit",
  relaxed: "relaxed fit",
  oversized: "oversized fit"
});
const IRON_TEXT = Object.freeze({
  "fresh-pressed": "freshly pressed",
  "normal-pressed": "normally pressed",
  "lightly-unpressed": "lightly unpressed",
  unpressed: "unpressed"
});

function optionText(options, value) {
  return options?.find?.((item) => item.value === value)?.text || "";
}
function humanize(value) {
  return String(value || "").trim().replace(/[_-]+/gu, " ").replace(/\s+/gu, " ");
}
function wordCount(value) {
  return String(value || "").trim().split(/\s+/u).filter(Boolean).length;
}

function selfieSafePose(value, captureType) {
  const pose = String(value || "").trim();
  if (!SELFIE_CAPTURE_TYPES.has(captureType) || !pose) return pose;
  if (/both\s+hands?\s+(?:in\s+)?(?:the\s+)?pockets?/iu.test(pose) || /both-hands?-pockets?/iu.test(pose)) {
    return "one hand in a pocket while the other holds the phone";
  }
  if (/arms?\s+crossed|crossed-arms?/iu.test(pose)) return "one hand relaxed at his side";
  if (/holding\s+(?:an?\s+)?object\s+with\s+both\s+hands|both-hands?-object/iu.test(pose)) {
    return "free hand raising a peace sign";
  }
  return pose;
}

export function applySectionCaptureRouting(rawInput = {}) {
  const raw = rawInput && typeof rawInput === "object" ? { ...rawInput } : {};
  const section = String(raw.studioSection || "").trim();
  const route = SECTION_CAPTURE_ROUTING[section];
  if (!route) return raw;

  raw.captureType = route.captureType;
  raw.intentType = route.intentType;
  const currentScene = String(raw.scene || "").trim();
  if (route.forceScene && route.scene) raw.scene = route.scene;
  else if (!REAL_SECTION_SCENES.has(currentScene)) raw.scene = route.fallbackScene || route.scene || "street";

  if (REAL_SECTION_SCENES.has(String(raw.scene || ""))) raw.customScene = "";

  raw.pose = selfieSafePose(raw.pose, route.captureType);
  if (section === "carExterior") {
    raw.carExteriorPose = selfieSafePose(raw.carExteriorPose, route.captureType) || "door-lean";
  }
  return raw;
}

function garmentScene(raw, clean) {
  if (DAILY_SCENE_KEYS.has(clean.scene)) return clean.scene;
  return SECTION_GARMENT_SCENE[raw.studioSection] || SECTION_GARMENT_SCENE[clean.studioSection] || clean.scene || "street";
}

function resolveClothingDetails(raw, clean) {
  const sceneKey = garmentScene(raw, clean);
  const explicitValue = sceneKey === "carExterior"
    ? (raw.carExteriorClothing || raw.clothing)
    : raw.clothing;
  const selectedGarment = explicitValue || clean.clothing;
  const garment = resolveClothingText(selectedGarment, raw);
  const fabricValue = raw.fabric || clean.fabric;
  const weightValue = raw.fabricWeight || clean.fabricWeight;
  const wearValue = raw.wearState || clean.wearState;
  const fitValue = raw.clothingFit || clean.clothingFit;
  const ironValue = raw.ironState || clean.ironState;
  const fabric = fabricValue ? humanize(fabricValue) : clean.fabric;
  const fabricWeight = weightValue ? `${humanize(weightValue)} fabric weight` : clean.fabricWeight;
  const wearState = WEAR_TEXT[wearValue] || (wearValue ? humanize(wearValue) : clean.wearState);
  const clothingFit = FIT_TEXT[fitValue] || (fitValue ? `${humanize(fitValue)} fit` : clean.clothingFit);
  const ironText = IRON_TEXT[ironValue] || (ironValue ? humanize(ironValue) : "");
  const userModifier = String(raw.clothingCustom || clean.clothingCustom || "").trim();
  const clothingCustom = [ironText, userModifier].filter(Boolean).join("; ");
  return { ...clean, clothing: garment, fabric, fabricWeight, wearState, clothingFit, clothingCustom };
}

function phase23Input(rawInput, cleanInput) {
  const raw = rawInput && typeof rawInput === "object" ? rawInput : {};
  let clean = cleanInput && typeof cleanInput === "object" ? cleanInput : {};
  clean = resolveClothingDetails(raw, clean);
  clean = {
    ...clean,
    studioSection: raw.studioSection || clean.studioSection,
    intentType: raw.intentType || clean.intentType,
    captureType: raw.captureType || clean.captureType,
    scene: raw.scene || clean.scene,
    pose: raw.pose || clean.pose
  };

  if (raw.studioSection === "carExterior") {
    const location = String(raw.carExteriorLocation || "villa");
    const pose = String(raw.carExteriorPose || "door-lean");
    const time = String(raw.time || "night") === "day" ? "day" : "night";
    const lightingId = String(raw.carExteriorLighting || LIGHTING_OPTIONS.carExterior?.[time]?.[0]?.value || "");
    const locationText = optionText(CAR_EXTERIOR_LOCATIONS, location) || optionText(CAR_EXTERIOR_LOCATIONS, "villa");
    const poseText = optionText(CAR_EXTERIOR_POSES, pose) || pose;
    return {
      ...clean,
      studioSection: "carExterior",
      intentType: "selfie",
      captureType: "direct_front_camera_selfie",
      scene: "carExterior",
      customScene: `A parked Range Rover exterior selfie, ${locationText}, with the subject ${poseText}`,
      pose: poseText,
      lighting: optionText(LIGHTING_OPTIONS.carExterior?.[time], lightingId) || clean.lighting,
      time,
      sceneFacts: {
        ...(clean.sceneFacts && typeof clean.sceneFacts === "object" ? clean.sceneFacts : {}),
        carExteriorLocation: location,
        carExteriorPose: pose
      }
    };
  }

  if (DAILY_SCENE_KEYS.has(clean.scene) && SCENES[clean.scene]?.environment) {
    return { ...clean, customScene: SCENES[clean.scene].environment };
  }
  return clean;
}

function enforcePhase34CarExteriorHeadwearBudget(prompt, canonical) {
  if (canonical?.scene?.id !== "carExterior" || !describeHeadwear(canonical) || wordCount(prompt) <= PHASE34_ROUTING_WORD_BUDGET) {
    return prompt;
  }
  return String(prompt).replace(PHASE34_REDUNDANT_GLASS_SENTENCE, "").replace(/\s{2,}/gu, " ").trim();
}

export function buildCanonicalV3UserOutput(rawInput = {}, sceneData = undefined) {
  const routedInput = applySectionCaptureRouting(rawInput);
  const resolution = resolveCanonicalConflicts(routedInput, sceneData);
  const cleanInput = phase23Input(routedInput, resolution.cleanInput);
  const baseCanonical = buildCanonicalV3(cleanInput);
  const canonical = applyGroupPhase13(baseCanonical, cleanInput);
  const basePrompt = enforcePhase34CarExteriorHeadwearBudget(buildOpenAIImagePrompt(canonical), canonical);
  const prompt = enrichGroupPromptPhase13(canonical, cleanInput, basePrompt);
  return Object.freeze({ resolution, canonical, prompt });
}

export default buildCanonicalV3UserOutput;
