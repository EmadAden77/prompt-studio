import { buildCanonicalV3 } from "../canonical-v3-engine.js";
import { resolveCanonicalConflicts } from "./conflict-resolver.js";
import { buildOpenAIImagePrompt } from "./openai-image-adapter.js";
import { applyGroupPhase13, enrichGroupPromptPhase13 } from "./group-phase13.js";
import { SCENES, LIGHTING_OPTIONS, CAR_EXTERIOR_LOCATIONS, CAR_EXTERIOR_POSES } from "../data.js";

const DAILY_SCENE_KEYS = new Set(["majlis", "kashta", "barbershop", "grocery", "rooftop", "streetFootball", "gasStation"]);

function optionText(options, value) {
  return options?.find?.((item) => item.value === value)?.text || "";
}

function phase22Input(rawInput, cleanInput) {
  const raw = rawInput && typeof rawInput === "object" ? rawInput : {};
  const clean = cleanInput && typeof cleanInput === "object" ? cleanInput : {};

  if (raw.studioSection === "carExterior") {
    const location = String(raw.carExteriorLocation || "villa");
    const pose = String(raw.carExteriorPose || "door-lean");
    const time = String(raw.time || "night") === "day" ? "day" : "night";
    const lightingId = String(raw.carExteriorLighting || LIGHTING_OPTIONS.carExterior?.[time]?.[0]?.value || "");
    const clothingId = String(raw.carExteriorClothing || SCENES.carExterior?.clothing?.[0]?.value || "");
    const locationText = optionText(CAR_EXTERIOR_LOCATIONS, location) || optionText(CAR_EXTERIOR_LOCATIONS, "villa");
    const poseText = optionText(CAR_EXTERIOR_POSES, pose) || optionText(CAR_EXTERIOR_POSES, "door-lean");
    return {
      ...clean,
      studioSection: "carExterior",
      intentType: "selfie",
      scene: "carExterior",
      customScene: `A parked Range Rover exterior selfie, ${locationText}, with the subject ${poseText}`,
      pose,
      clothing: optionText(SCENES.carExterior?.clothing, clothingId) || clean.clothing,
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
  const cleanInput = phase22Input(rawInput, resolution.cleanInput);
  const baseCanonical = buildCanonicalV3(cleanInput);
  const canonical = applyGroupPhase13(baseCanonical, cleanInput);
  const basePrompt = buildOpenAIImagePrompt(canonical);
  const prompt = enrichGroupPromptPhase13(canonical, cleanInput, basePrompt);
  return Object.freeze({ resolution, canonical, prompt });
}

export default buildCanonicalV3UserOutput;
