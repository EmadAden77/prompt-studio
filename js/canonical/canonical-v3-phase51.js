import { buildCanonicalV3UserOutput as buildPhase50CanonicalV3UserOutput } from "./canonical-v3-phase50.js";
import { buildVisualQualityContract, evaluateVisualQuality } from "./visual-quality-phase51.js";

export { buildVisualQualityContract, evaluateVisualQuality } from "./visual-quality-phase51.js";

export function buildCanonicalV3UserOutput(rawInput = {}, sceneData = undefined) {
  const base = buildPhase50CanonicalV3UserOutput(rawInput, sceneData);
  const visualQualityContract = buildVisualQualityContract(rawInput, base);
  return Object.freeze({
    ...base,
    phase51:Object.freeze({
      visualQualityContract,
      determinism:"10/10",
      promptMutation:false
    }),
    prompt:base.prompt
  });
}

export default buildCanonicalV3UserOutput;
