import "../phase30-clothing-catalog.js";
import { buildCanonicalV3 } from "../canonical-v3-engine.js";
import { resolveCanonicalConflicts } from "./conflict-resolver.js";
import { buildOpenAIImagePrompt } from "./openai-image-adapter.js";
import { applyGroupPhase13, enrichGroupPromptPhase13 } from "./group-phase13.js";
import { SCENES, LIGHTING_OPTIONS, CAR_EXTERIOR_LOCATIONS, CAR_EXTERIOR_POSES } from "../data.js";

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

function garmentScene(raw, clean) {
  if (DAILY_SCENE_KEYS.has(clean.scene)) return clean.scene;
  return SECTION_GARMENT_SCENE[raw.studioSection] || SECTION_GARMENT_SCENE[clean.studioSection] || clean.scene || "street";
}

function resolveClothingDetails(raw, clean) {
  const sceneKey = garmentScene(raw, clean);
  const garments = SCENES[sceneKey]?.clothing ?? [];
  const selectedGarment = raw.clothing || clean.clothing;
  const preserveGroupBudget = raw.studioSection === "group" || clean.studioSection === "group";
  const garment = preserveGroupBudget ? selectedGarment : (optionText(garments, selectedGarment) || clean.clothing);
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

  if (raw.studioSection === "carExterior") {
    const location = String(raw.carExteriorLocation || "villa");
    const pose = String(raw.carExteriorPose || "door-lean");
    const time = String(raw.time || "night") === "day" ? "day" : "night";
    const lightingId = String(raw.carExteriorLighting || LIGHTING_OPTIONS.carExterior?.[time]?.[0]?.value || "");
    const locationText = optionText(CAR_EXTERIOR_LOCATIONS, location) || optionText(CAR_EXTERIOR_LOCATIONS, "villa");
    const poseText = optionText(CAR_EXTERIOR_POSES, pose) || optionText(CAR_EXTERIOR_POSES, "door-lean");
    return {
      ...clean,
      studioSection: "carExterior",
      intentType: "selfie",
      scene: "carExterior",
      customScene: `A parked Range Rover exterior selfie, ${locationText}, with the subject ${poseText}`,
      pose,
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

export function buildCanonicalV3UserOutput(rawInput = {}, sceneData = undefined) {
  const resolution = resolveCanonicalConflicts(rawInput, sceneData);
  const cleanInput = phase23Input(rawInput, resolution.cleanInput);
  const baseCanonical = buildCanonicalV3(cleanInput);
  const canonical = applyGroupPhase13(baseCanonical, cleanInput);
  const basePrompt = buildOpenAIImagePrompt(canonical);
  const prompt = enrichGroupPromptPhase13(canonical, cleanInput, basePrompt);
  return Object.freeze({ resolution, canonical, prompt });
}

export default buildCanonicalV3UserOutput;
