import { buildCanonicalV3 } from "../canonical-v3-engine.js";
import { resolveCanonicalConflicts } from "./conflict-resolver.js";
import { buildOpenAIImagePrompt } from "./openai-image-adapter.js";
import { applyGroupPhase13, enrichGroupPromptPhase13 } from "./group-phase13.js";

export function buildCanonicalV3UserOutput(rawInput = {}, sceneData = undefined) {
  const resolution = resolveCanonicalConflicts(rawInput, sceneData);
  const baseCanonical = buildCanonicalV3(resolution.cleanInput);
  const canonical = applyGroupPhase13(baseCanonical, resolution.cleanInput);
  const basePrompt = buildOpenAIImagePrompt(canonical);
  const prompt = enrichGroupPromptPhase13(canonical, resolution.cleanInput, basePrompt);
  return Object.freeze({ resolution, canonical, prompt });
}

export default buildCanonicalV3UserOutput;
