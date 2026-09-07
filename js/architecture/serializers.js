export const SERIALIZER_TARGETS = Object.freeze([
  "chatgpt-images",
  "gemini",
  "future"
]);

export function createSerializerAdapter({ target, legacySerialize }) {
  if (!SERIALIZER_TARGETS.includes(target)) throw new TypeError(`Unsupported serializer target: ${target}`);
  if (typeof legacySerialize !== "function") throw new TypeError("legacySerialize must be a function");

  return Object.freeze({
    target,
    serialize(sceneState, legacyInput) {
      // Foundation phase only: exact delegation. No trimming, normalization,
      // reordering, deduplication, whitespace changes, or prose transformation.
      return legacySerialize(sceneState, legacyInput);
    }
  });
}

export const SERIALIZER_FOUNDATION_POLICY = Object.freeze({
  activeProductionRoutingChanged: false,
  transformsExistingPromptStrings: false,
  reservedTargets: SERIALIZER_TARGETS
});
