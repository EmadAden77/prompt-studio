import { buildCanonicalV3 } from "../canonical-v3-engine.js";
import { resolveCanonicalConflicts } from "./conflict-resolver.js";
import { buildOpenAIImagePrompt } from "./openai-image-adapter.js";

export function buildCanonicalV3UserOutput(rawInput = {}, sceneData = undefined) {
  const resolution = resolveCanonicalConflicts(rawInput, sceneData);
  const canonical = buildCanonicalV3(resolution.cleanInput);
  const prompt = buildOpenAIImagePrompt(canonical);
  return Object.freeze({ resolution, canonical, prompt });
}

export default buildCanonicalV3UserOutput;
