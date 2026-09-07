const RESERVED_PROSE_KEYS = new Set(["prompt", "generatedPrompt", "promptText", "renderedPrompt"]);

function assertPlainData(value, path = "SceneState") {
  if (value === null) return;
  const type = typeof value;
  if (["string", "number", "boolean"].includes(type)) return;
  if (type === "undefined") return;
  if (type === "function" || type === "symbol" || type === "bigint") {
    throw new TypeError(`${path} must contain JSON-safe pure data only`);
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertPlainData(item, `${path}[${index}]`));
    return;
  }
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) {
    throw new TypeError(`${path} must contain plain objects only`);
  }
  for (const [key, item] of Object.entries(value)) {
    if (RESERVED_PROSE_KEYS.has(key)) {
      throw new TypeError(`${path}.${key} is generated prose and cannot enter SceneState`);
    }
    assertPlainData(item, `${path}.${key}`);
  }
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort((a, b) => a.localeCompare(b, "en"))
        .map((key) => [key, canonicalize(value[key])])
    );
  }
  return value;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const item of Object.values(value)) deepFreeze(item);
  return value;
}

function cloneCanonical(value) {
  return canonicalize(structuredClone(value));
}

export const SCENE_STATE_FIELDS = Object.freeze([
  "identity",
  "section",
  "scene",
  "pose",
  "clothing",
  "expression",
  "camera",
  "lighting",
  "topology",
  "contactSupport",
  "materials",
  "generatorTarget",
  "selectedControls",
  "reflection"
]);

export function createSceneState(input = {}) {
  assertPlainData(input);
  const source = {
    identity: input.identity ?? null,
    section: input.section ?? null,
    scene: input.scene ?? null,
    pose: input.pose ?? null,
    clothing: input.clothing ?? null,
    expression: input.expression ?? null,
    camera: input.camera ?? null,
    lighting: input.lighting ?? null,
    topology: input.topology ?? null,
    contactSupport: input.contactSupport ?? input["contact/support"] ?? null,
    materials: input.materials ?? null,
    generatorTarget: input.generatorTarget ?? null,
    selectedControls: input.selectedControls ?? null,
    reflection: input.reflection ?? null
  };
  return deepFreeze(cloneCanonical(source));
}

export function serializeSceneState(state) {
  assertPlainData(state);
  return JSON.stringify(canonicalize(state));
}

export function isDeeplyFrozen(value) {
  if (!value || typeof value !== "object") return true;
  if (!Object.isFrozen(value)) return false;
  return Object.values(value).every(isDeeplyFrozen);
}
