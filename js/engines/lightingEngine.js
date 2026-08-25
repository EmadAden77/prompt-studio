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
    if (!lighting) return "Use only physically motivated light visible or supported by IMAGE B.";
    return `${lighting.name_en}.
${lighting.physics}
Exposure behavior: ${lighting.exposure}
${lighting.room_dark ? "The room remains predominantly dark outside the source's short falloff." : "Preserve believable source-to-surface falloff throughout the room."}`;
  }
}
