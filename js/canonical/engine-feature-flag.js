export const LEGACY_ENGINE = "legacy";
export const CANONICAL_V3_ENGINE = "canonical-v3";
export const ENGINE_STORAGE_KEY = "wikiprompt-selfie-studio:engine";

const VALID_ENGINES = new Set([LEGACY_ENGINE, CANONICAL_V3_ENGINE]);
const CANONICAL_V3_SECTIONS = new Set(["solo", "selfie", "studio", "car", "carexterior", "group", "accidental", "bedroom", "room", "gym", "street"]);

function normalize(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function resolvePromptEngineSelection({ search = "", storageValue = "" } = {}) {
  let urlValue = "";
  try {
    urlValue = normalize(new URLSearchParams(search).get("engine"));
  } catch {}

  if (VALID_ENGINES.has(urlValue)) return Object.freeze({ engine: urlValue, source: "url", defaulted: false });
  const stored = normalize(storageValue);
  if (VALID_ENGINES.has(stored)) return Object.freeze({ engine: stored, source: "localStorage", defaulted: false });
  return Object.freeze({ engine: LEGACY_ENGINE, source: "default", defaulted: true });
}

export function isCanonicalV3Section(section) {
  return CANONICAL_V3_SECTIONS.has(normalize(section));
}

export function canonicalIntentForSection(section) {
  switch (normalize(section)) {
    case "car": return "car";
    case "carexterior": return "carExterior";
    case "group": return "group";
    case "accidental": return "accidental";
    case "bedroom":
    case "room": return "room";
    case "gym":
    case "street":
    case "solo":
    case "selfie":
    case "studio": return "selfie";
    default: return null;
  }
}

export function shouldUseCanonicalV3(section, selection) {
  const normalized = normalize(section);
  if (["gym", "street"].includes(normalized)) return true;
  return selection?.engine === CANONICAL_V3_ENGINE && isCanonicalV3Section(section);
}

export default resolvePromptEngineSelection;
