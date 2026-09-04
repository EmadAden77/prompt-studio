import { describeSaudiStreetRealism } from "./openai-image-adapter.js";

const FACES = Object.freeze([
  "round face full dark beard",
  "thin face light stubble",
  "oval clean-shaven",
  "square jaw grey-flecked beard",
  "smooth young face"
]);
const AGES = Object.freeze(["~16", "~22", "~30", "~45", "~60"]);
const EXPRESSIONS = Object.freeze(["laughing openly", "calm soft smile", "serious relaxed", "mid-laugh"]);
const POSES = Object.freeze([
  "leaning toward camera holder",
  "arm around neighbor shoulder",
  "peace sign",
  "holding a tea glass",
  "adjusting his shemagh"
]);
const OUTFITS = Object.freeze({
  friends: Object.freeze(["white thobe with red shemagh", "white thobe with white ghutra", "light blue shirt", "heather grey polo", "olive overshirt"]),
  family: Object.freeze(["white thobe with white ghutra", "beige thobe", "navy shirt", "grey polo", "brown bisht over thobe"]),
  work: Object.freeze(["white shirt with black trousers", "blue polo with chinos", "grey thobe", "striped shirt", "dark suit jacket"]),
  team: Object.freeze(["red jersey", "green jersey", "white training tee", "black tracksuit top", "blue jersey"]),
  kashta: Object.freeze(["casual thobe", "flannel shirt", "grey hoodie", "white tee with cap", "olive jacket"])
});
const KIND_SET = new Set(Object.keys(OUTFITS));
const VIBE_TEXT = Object.freeze({
  casual: "The group shares an ordinary relaxed moment.",
  laughing: "The group is caught laughing together.",
  win: "The group celebrates a win together.",
  eid: "The group shares an Eid greeting.",
  meal: "The group gathers just after a shared meal."
});
const ANTI_SIMILARITY = "Each person is a clearly distinct individual with a unique facial structure, beard style, and apparent age; no two people share the same face, hairstyle, or outfit color, and none resemble the primary subject's reference identity.";

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}
function words(value) { const text = String(value || "").trim(); return text ? text.split(/\s+/u).length : 0; }
function kindOf(raw) { const value = String(raw?.groupKind || "friends").trim().toLowerCase(); return KIND_SET.has(value) ? value : "friends"; }
function vibeOf(raw) { const value = String(raw?.groupVibe || "casual").trim().toLowerCase(); return VIBE_TEXT[value] ? value : "casual"; }

export function applyGroupPhase13(canonical, rawInput = {}) {
  if (!canonical || canonical.intent?.type !== "group" || canonical.capture?.type !== "group_selfie") return canonical;
  const next = clone(canonical);
  const kind = kindOf(rawInput);
  const additional = Array.isArray(next.subjects?.additional) ? next.subjects.additional : [];

  if (next.scene?.type === "vehicle") {
    next.scene.type = "outdoor";
    next.scene.id = "street";
    next.scene.description = "an ordinary outdoor street or parking environment";
    next.scene.vehicle = null;
    if (next.scene.facts) {
      for (const key of ["exterior_color", "interior", "seats", "console_trim", "steering_wheel", "roof"]) delete next.scene.facts[key];
    }
  }

  if (next.hard_constraints?.vehicle_geometry) {
    next.hard_constraints.vehicle_geometry = {
      applicable: false,
      drive_configuration: null,
      driver_position: null,
      steering_relation: null,
      cluster_relation: null,
      console_relation: null,
      door_window_relation: null,
      coordinate_system: null,
      mirror_may_swap_physical_sides: false,
      adapter_can_modify: false
    };
  }

  additional.forEach((person, index) => {
    const poolIndex = index % 5;
    person.reference_id = null;
    person.expression = EXPRESSIONS[index % EXPRESSIONS.length];
    person.pose = POSES[poolIndex];
    person.clothing = {
      garment: OUTFITS[kind][poolIndex],
      fabric: null,
      fabric_weight: null,
      fit: null,
      wear_state: null,
      custom_modifier: `${FACES[poolIndex]}, apparent age ${AGES[poolIndex]}`
    };
  });

  return freeze(next);
}

function shortAge(modifier) {
  return /apparent age\s+(~?\d+)/iu.exec(String(modifier || ""))?.[1] || "~30";
}
function faceText(modifier) {
  return String(modifier || "").split(", apparent age")[0].trim();
}
function groupPersonClauses(canonical) {
  const additional = canonical.subjects?.additional || [];
  const compact = canonical.subjects?.count >= 4;
  return additional.map((person, index) => {
    const outfit = String(person.clothing?.garment || "distinct outfit");
    const age = shortAge(person.clothing?.custom_modifier);
    if (compact) return `Person ${index + 2} is ${age} in ${outfit}.`;
    const face = faceText(person.clothing?.custom_modifier);
    return `Beside him, ${face}, ${age}, ${person.expression}, ${person.pose}, in ${outfit}.`;
  });
}
function backgroundLife(canonical) {
  if (canonical.scene?.type !== "outdoor") return "";
  const mood = String(canonical.scene?.facts?.street_mood || "").toLowerCase();
  if (mood === "rush") return "Behind them, commuters and delivery riders move between queued sedans.";
  if (mood === "prayer") return "Behind them, men in thobes walk toward a softly lit mosque.";
  if (mood === "cafe") return "Behind them, pedestrians pass as a cafeteria worker carries tea glasses.";
  if (mood === "latenight") return "Behind them, sparse pedestrians pass a still-open late-night cafeteria.";
  if (canonical.lighting?.source_type === "daylight") return "Behind them, pedestrians in thobes and abayas cross the active street.";
  return "Behind them, pedestrians pass between lit storefronts and parked sedans.";
}
function removeStreetDetailBlock(prompt, canonical) {
  const block = describeSaudiStreetRealism(canonical);
  return block ? prompt.replace(block, "").replace(/\s{2,}/gu, " ").trim() : prompt;
}
function trimToBudget(prompt) {
  let output = prompt.replace(/\s{2,}/gu, " ").trim();
  const removable = [
    "Authentic white balance matched to the dominant light source.",
    "Natural body proportions consistent with the environment.",
    "Slight lens softness is visible toward the frame edges."
  ];
  for (const sentence of removable) {
    if (words(output) <= 250) break;
    output = output.replace(sentence, "").replace(/\s{2,}/gu, " ").trim();
  }
  return output;
}

export function enrichGroupPromptPhase13(canonical, rawInput = {}, basePrompt = "") {
  if (!canonical || canonical.intent?.type !== "group" || canonical.subjects?.count <= 1) return basePrompt;
  const countSentence = `${canonical.subjects.count} people are present in the group composition.`;
  const clauses = groupPersonClauses(canonical);
  const vibe = VIBE_TEXT[vibeOf(rawInput)];
  const life = backgroundLife(canonical);
  const groupBlock = [countSentence, ...clauses, ANTI_SIMILARITY, vibe, life].filter(Boolean).join(" ");
  const withoutStreetBlock = removeStreetDetailBlock(basePrompt, canonical);
  const enriched = withoutStreetBlock.includes(countSentence)
    ? withoutStreetBlock.replace(countSentence, groupBlock)
    : `${groupBlock} ${withoutStreetBlock}`;
  return trimToBudget(enriched);
}

export const GROUP_PHASE13_POOLS = Object.freeze({ FACES, AGES, EXPRESSIONS, POSES, OUTFITS });
export { ANTI_SIMILARITY };
