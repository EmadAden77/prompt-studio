import { buildLightingSection, LIGHTING_REALISM_BLOCK } from "../data/lightingData.js";

export class LightingEngine {
  constructor(options = []) {
    this.options = [...options];
  }

  getById(lightingId) {
    return this.options.find((item) => item.id === lightingId) ?? this.options[0] ?? null;
  }

  getMissingFeatures(lighting, scene) {
    if (!lighting || !scene) return lighting?.required_features ?? [];
    return lighting.required_features.filter((feature) => !scene.visible_features.includes(feature));
  }

  buildPrompt(lighting) {
    if (!lighting) {
      return `LIGHTING: Use only physically motivated light visible or supported by IMAGE B.
${LIGHTING_REALISM_BLOCK}`;
    }
    return buildLightingSection(lighting);
  }
}
