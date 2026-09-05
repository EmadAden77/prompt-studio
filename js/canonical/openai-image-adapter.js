import baseBuildOpenAIImagePrompt, {
  describeSaudiStreetRealism as describeSaudiStreetRealismBase,
  describeNaturalImperfections as describeNaturalImperfectionsBase,
  describePostProcessing as describePostProcessingBase,
  describeEnvironmentalDetails as describeEnvironmentalDetailsBase
} from "./openai-image-adapter-base-phase16.js";

export * from "./openai-image-adapter-base-phase16.js";

const RESERVED_SCENE_FACT_KEYS = new Set([
  "identity", "scene", "capture", "subjects", "camera", "camera_geometry", "lighting", "vehicle_geometry", "anatomy", "realism", "aesthetic", "drive_configuration", "driver_position", "steering_relation", "cluster_relation", "console_relation", "door_window_relation", "coordinate_system", "mirror_may_swap_physical_sides", "exterior_color", "interior", "seats", "console_trim", "steering_wheel", "roof", "street_mood", "source"
]);

const GLOBAL_FORBIDDEN = /\b(?:landmark|tower|monument|kingdom|faisaliah|ramadan|fanous|lantern|crescent)\b|mosque\s+minaret/iu;

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
function wordCount(value) { return cleanText(value).split(/\s+/u).filter(Boolean).length; }

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
    .map((value) => cleanText(value).toLowerCase()).filter(Boolean).join(" ");
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

export function describeMicroRealism(canonical) {
  if (!isObject(canonical)) return "";
  const primary = canonical.subjects?.primary;
  const identityPreserved = canonical.identity?.reference_mode === "single_reference" && canonical.hard_constraints?.identity?.preserve_reference_identity === true;
  const evidence = [
    canonical.scene?.id, canonical.scene?.type, canonical.scene?.description, canonical.scene?.room?.description,
    canonical.lighting?.source_type, canonical.lighting?.description, canonical.lighting?.name, canonical.lighting?.id,
    primary?.clothing?.garment, primary?.clothing?.fabric, primary?.clothing?.custom_modifier,
    canonical.camera?.device_profile, canonical.capture?.type
  ].map((value) => cleanText(value).toLowerCase()).filter(Boolean).join(" ");
  const phrases = [];

  if (identityPreserved) phrases.push("A single soft catchlight in each eye matches the dominant light source.");
  if (identityPreserved && phrases.length < 3) phrases.push("Subtle natural eye reflection mirrors the surrounding environment.");
  if (phrases.length < 3) phrases.push("Subtle tone variation between forehead and cheeks.");
  if (phrases.length < 3) phrases.push("Faint natural pore detail across the cheeks.");
  if (phrases.length < 3) phrases.push("Soft contact shadows ground the subject and nearby objects to their surfaces.");

  if (phrases.length < 3) {
    const envPhrase = /\bcold\b|\bdawn\b/iu.test(evidence)
      ? "Faint breath vapor is visible near the lips."
      : /\bhot\b|\bnoon\b|\bheat\b/iu.test(evidence)
        ? "Light sweat sheen appears at temples and hairline."
        : /\bdust\b|\bsand\b|\bdesert\b|\bkashta\b/iu.test(evidence)
          ? "Fine dust particles settle on shoulders and fabric."
          : /\bgym\b|\btraining\b|\bathletic\b/iu.test(evidence)
            ? "Localized sweat darkening appears on fabric at underarm and back."
            : canonical.scene?.type === "outdoor" && !isDayLighting(canonical)
              ? "Streetlight color subtly tints the shoulder and hair."
              : "";
    if (envPhrase) phrases.push(envPhrase);
  }

  if (phrases.length < 3 && /\bwatch\b/iu.test(evidence)) phrases.push("Watch strap shows natural wear marks at the clasp.");
  if (phrases.length < 3 && /\bphone\b|\bsmartphone\b/iu.test(evidence)) phrases.push("Phone case shows scratched edges from daily use.");
  if (phrases.length < 3 && /\bglasses\b|\beyewear\b/iu.test(evidence)) phrases.push("Glasses frames show subtle wear at nose pads.");
  if (phrases.length < 3 && /\bshemagh\b/iu.test(evidence)) phrases.push("A slightly crooked shemagh fold and one uneven beard edge remain visible.");
  if (phrases.length < 3 && identityPreserved) phrases.push("Natural facial asymmetry remains consistent with the reference.");
  if (phrases.length < 3 && isObject(primary?.clothing) && cleanText(primary.clothing.garment)) phrases.push("Natural fabric creasing follows gravity at the lap and shoulder.");
  return phrases.slice(0, 3).join(" ");
}

export function describeSaudiStreetRealism(canonical) {
  if (["kashta", "barbershop", "grocery", "rooftop", "streetFootball", "gasStation"].includes(canonical?.scene?.id)) return "";
  return describeSaudiStreetRealismBase(canonical);
}

function removeSuppressedStreetFallback(prompt, canonical) {
  if (!["kashta", "barbershop", "grocery", "rooftop", "streetFootball", "gasStation"].includes(canonical?.scene?.id)) return prompt;
  const streetText = describeSaudiStreetRealismBase(canonical);
  return streetText ? prompt.replace(`${streetText} `, "").replace(` ${streetText}`, "").trim() : prompt;
}

function removeExactLayer(prompt, layer) {
  if (!layer) return prompt;
  return prompt.replace(`${layer} `, "").replace(` ${layer}`, "").replace(layer, "").trim();
}

function insertPlaceRealism(prompt, canonical, placeRealism) {
  const facts = describeSceneFactsForInsertion(canonical);
  if (facts && prompt.includes(facts)) return prompt.replace(facts, `${facts} ${placeRealism}`);
  const sceneAnchor = describeSceneAnchor(canonical);
  if (sceneAnchor && prompt.includes(sceneAnchor)) return prompt.replace(sceneAnchor, `${sceneAnchor} ${placeRealism}`);
  return `${prompt} ${placeRealism}`.trim();
}

function microSentences(value) { return value.match(/[^.!?]+[.!?]/gu)?.map((part) => part.trim()).filter(Boolean) ?? []; }
function insertMicroWithinCap(prompt, anchor, micro, maxWords = 250) {
  const parts = microSentences(micro);
  let chosen = "";
  for (const part of parts) {
    const next = chosen ? `${chosen} ${part}` : part;
    const candidate = anchor && prompt.includes(anchor) ? prompt.replace(anchor, `${anchor} ${next}`) : `${prompt} ${next}`.trim();
    if (wordCount(candidate) <= maxWords) chosen = next;
    else break;
  }
  if (!chosen) return { prompt, inserted: false };
  return {
    prompt: anchor && prompt.includes(anchor) ? prompt.replace(anchor, `${anchor} ${chosen}`) : `${prompt} ${chosen}`.trim(),
    inserted: true
  };
}

function removeForbiddenSentences(prompt) {
  return cleanText(prompt).match(/[^.!?]+[.!?]?/gu)?.map((part) => part.trim()).filter((part) => part && !GLOBAL_FORBIDDEN.test(part)).join(" ") ?? "";
}

export function buildOpenAIImagePrompt(canonical, options = {}) {
  let prompt = baseBuildOpenAIImagePrompt(canonical, options);
  prompt = removeSuppressedStreetFallback(prompt, canonical);
  const placeRealism = describePlaceRealism(canonical);
  if (placeRealism) prompt = insertPlaceRealism(prompt, canonical, placeRealism);

  const micro = describeMicroRealism(canonical);
  const natural = describeNaturalImperfectionsBase(canonical);
  if (micro) {
    let result = insertMicroWithinCap(prompt, natural, micro);
    if (!result.inserted) {
      prompt = removeExactLayer(prompt, describePostProcessingBase(canonical));
      result = insertMicroWithinCap(prompt, natural, micro);
    }
    if (!result.inserted) {
      prompt = removeExactLayer(prompt, describeEnvironmentalDetailsBase(canonical));
      result = insertMicroWithinCap(prompt, natural, micro);
    }
    prompt = result.prompt;
  }

  return removeForbiddenSentences(prompt).trim();
}

export default buildOpenAIImagePrompt;
