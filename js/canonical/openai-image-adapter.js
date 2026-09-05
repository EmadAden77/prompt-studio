import baseBuildOpenAIImagePrompt, {
  describeSaudiStreetRealism as describeSaudiStreetRealismBase
} from "./openai-image-adapter-base-phase16.js";

export * from "./openai-image-adapter-base-phase16.js";

const RESERVED_SCENE_FACT_KEYS = new Set([
  "identity", "scene", "capture", "subjects", "camera", "camera_geometry", "lighting", "vehicle_geometry", "anatomy", "realism", "aesthetic", "drive_configuration", "driver_position", "steering_relation", "cluster_relation", "console_relation", "door_window_relation", "coordinate_system", "mirror_may_swap_physical_sides", "exterior_color", "interior", "seats", "console_trim", "steering_wheel", "roof", "street_mood", "source"
]);

function isObject(value) { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function cleanText(value) { return typeof value === "string" ? value.trim() : ""; }
function humanize(value) { return cleanText(value).replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim(); }
function naturalList(items) {
  const values = items.filter(Boolean);
  if (values.length === 0) return "";
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}
function sentence(value) {
  const valueText = cleanText(value);
  return !valueText ? "" : /[.!?]$/u.test(valueText) ? valueText : `${valueText}.`;
}

function describeSceneFactsForInsertion(canonical) {
  const facts = canonical?.scene?.facts;
  if (!isObject(facts)) return "";
  const phrases = [];
  for (const [key, value] of Object.entries(facts)) {
    if (RESERVED_SCENE_FACT_KEYS.has(key)) continue;
    if (typeof value === "string" && cleanText(value)) phrases.push(`${humanize(key)} is ${cleanText(value)}`);
    else if (typeof value === "number" && Number.isFinite(value)) phrases.push(`${humanize(key)} is ${value}`);
    else if (typeof value === "boolean") phrases.push(`${humanize(key)} is ${value ? "present" : "absent"}`);
  }
  return phrases.length ? `Scene details: ${naturalList(phrases)}.` : "";
}

function describeSceneAnchor(canonical) {
  const scene = canonical?.scene ?? {};
  if (scene.type === "room" && isObject(scene.room) && cleanText(scene.room.description)) return sentence(scene.room.description);
  return sentence(scene.description);
}

function isDayLighting(canonical) {
  if (cleanText(canonical?.lighting?.source_type).toLowerCase() === "daylight") return true;
  const evidence = [canonical?.lighting?.description, canonical?.lighting?.name, canonical?.lighting?.id]
    .map((value) => cleanText(value).toLowerCase())
    .filter(Boolean)
    .join(" ");
  return /\bday\b|\bdaylight\b|\bgolden\b|\bsunset\b|\bdawn\b|\bmorning\b/iu.test(evidence);
}

export function describePlaceRealism(canonical) {
  if (!isObject(canonical)) return "";
  if (canonical.scene?.id === "majlis") {
    return [
      "A half-empty tea glass and a date plate with a few left sit on the side table beside a slightly compressed cushion.",
      "Velvet cushions show visible weave and the brass dallah carries faint fingerprints under warm sconce light pools."
    ].join(" ");
  }
  if (canonical.scene?.id === "kashta") {
    const realism = isDayLighting(canonical)
      ? [
          "Golden low sun rakes across the dunes with heat shimmer and sand dust on the vehicle's lower panels.",
          "A worn blanket and a weathered kettle rest beside the seating area."
        ]
      : [
          "Scattered tea glasses and a weathered kettle sit near the fire with a blanket draped over a seat and tire tracks in the sand.",
          "Firelight flickers warm on faces against a deep starry sky, casting long soft shadows."
        ];
    realism.push("A distant parked Land Cruiser with dimmed lights blurs in the background.");
    return realism.join(" ");
  }
  return "";
}

export function describeSaudiStreetRealism(canonical) {
  if (canonical?.scene?.id === "kashta") return "";
  return describeSaudiStreetRealismBase(canonical);
}

function removeKashtaStreetFallback(prompt, canonical) {
  if (canonical?.scene?.id !== "kashta") return prompt;
  const streetText = describeSaudiStreetRealismBase(canonical);
  if (!streetText) return prompt;
  return prompt
    .replace(`${streetText} `, "")
    .replace(` ${streetText}`, "")
    .trim();
}

function insertPlaceRealism(prompt, canonical, placeRealism) {
  const facts = describeSceneFactsForInsertion(canonical);
  if (facts && prompt.includes(facts)) {
    return prompt.replace(facts, `${facts} ${placeRealism}`);
  }
  const sceneAnchor = describeSceneAnchor(canonical);
  if (sceneAnchor && prompt.includes(sceneAnchor)) {
    return prompt.replace(sceneAnchor, `${sceneAnchor} ${placeRealism}`);
  }
  return `${prompt} ${placeRealism}`.trim();
}

export function buildOpenAIImagePrompt(canonical, options = {}) {
  let prompt = baseBuildOpenAIImagePrompt(canonical, options);
  prompt = removeKashtaStreetFallback(prompt, canonical);
  const placeRealism = describePlaceRealism(canonical);
  return placeRealism ? insertPlaceRealism(prompt, canonical, placeRealism) : prompt;
}

export default buildOpenAIImagePrompt;
