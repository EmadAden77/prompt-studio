import { buildCanonicalV3 } from "../canonical-v3-engine.js";
import { resolveCanonicalConflicts } from "./conflict-resolver.js";
import { buildOpenAIImagePrompt, describeHeadwear } from "./openai-image-adapter-phase36.js";
import { applyGroupPhase13, enrichGroupPromptPhase13 } from "./group-phase13.js";
import { SCENES } from "../data.js";
import { resolveClothingText } from "../clothing-authority.js";
import { describeMissingCarExteriorSelectionEvidence, resolveCarExteriorSelection } from "../car-exterior-authority.js";
import { SECTION_REGISTRY, getSection } from "../sections/index.js";

export const CAR_EXTERIOR_PROMPT_WORD_BUDGET = 280;
const PHASE34_ROUTING_WORD_BUDGET = 250;
const PHASE34_REDUNDANT_GLASS_SENTENCE = "Transparent glass carries natural reflections and a faint view into the Ivory cabin.";
const LEGACY_SECTION_ALIASES = Object.freeze({ selfie:"solo", studio:"solo" });
const DAILY_SCENE_KEYS = new Set(["majlis", "kashta", "barbershop", "grocery", "rooftop", "streetFootball", "gasStation"]);
const REAL_SECTION_SCENES = new Set([
  ...Object.values(SECTION_REGISTRY).flatMap((section) => section.scenes),
  ...DAILY_SCENE_KEYS,
  "rangeRover",
  "carExterior"
].filter((scene) => scene && scene !== "custom"));
const SELFIE_CAPTURE_TYPES = new Set([
  ...Object.values(SECTION_REGISTRY).map((section) => section.captureType).filter((type) => /selfie/iu.test(String(type))),
  "mirror_selfie"
]);

function compatibilityRoute(section) {
  const routing = section.rules?.routing || {};
  const defaultScene = routing.defaultScene || section.scenes[0] || "street";
  const route = {
    captureType:section.captureType,
    intentType:routing.intentType || "selfie"
  };
  if (routing.sceneMode === "fixed") {
    route.scene = defaultScene;
    route.forceScene = true;
  } else {
    route.fallbackScene = defaultScene;
  }
  return Object.freeze(route);
}

export const SECTION_CAPTURE_ROUTING = Object.freeze(Object.fromEntries(
  Object.values(SECTION_REGISTRY).map((section) => [section.id, compatibilityRoute(section)])
));

const WEAR_TEXT = Object.freeze({
  fresh: "fresh wear",
  "normal-day": "ordinary daily wear",
  "hours-worn": "several hours worn",
  "washed-soft": "washed-soft daily wear",
  "home-used": "home-used wear",
  "post-workout": "post-workout wear"
});
const FIT_TEXT = Object.freeze({ slim:"slim fit", regular:"regular fit", relaxed:"relaxed fit", oversized:"oversized fit" });
const IRON_TEXT = Object.freeze({
  "fresh-pressed":"freshly pressed",
  "normal-pressed":"normally pressed",
  "lightly-unpressed":"lightly unpressed",
  unpressed:"unpressed"
});

function humanize(value) { return String(value || "").trim().replace(/[_-]+/gu, " ").replace(/\s+/gu, " "); }
function wordCount(value) { return String(value || "").trim().split(/\s+/u).filter(Boolean).length; }
function normalizeScene(value) { return String(value || "") === "my_bedroom_text" ? "bedroom" : String(value || ""); }
function activeSectionById(id) {
  const key = String(id || "").trim();
  return getSection(key) || getSection(LEGACY_SECTION_ALIASES[key]);
}
function hasAuthority(section, authority) { return section?.rules?.routing?.authority === authority; }

function selfieSafePose(value, captureType) {
  const pose = String(value || "").trim();
  if (!SELFIE_CAPTURE_TYPES.has(captureType) || !pose) return pose;
  if (/both\s+hands?\s+(?:in\s+)?(?:the\s+)?pockets?/iu.test(pose) || /both-hands?-pockets?/iu.test(pose)) return "one hand in a pocket while the other holds the phone";
  if (/arms?\s+crossed|crossed-arms?/iu.test(pose)) return "one hand relaxed at his side";
  if (/holding\s+(?:an?\s+)?object\s+with\s+both\s+hands|both-hands?-object/iu.test(pose)) return "free hand raising a peace sign";
  return pose;
}

export function applySectionCaptureRouting(rawInput = {}) {
  const raw = rawInput && typeof rawInput === "object" ? { ...rawInput } : {};
  const requestedSection = String(raw.studioSection || "").trim();
  const section = activeSectionById(requestedSection);
  if (!section) return raw;

  raw.studioSection = section.id;
  raw.captureType = section.captureType;
  const routing = section.rules?.routing || {};
  raw.intentType = routing.intentType || raw.intentType || "selfie";

  const currentScene = normalizeScene(raw.scene);
  const defaultScene = routing.defaultScene || section.scenes[0] || "street";
  if (routing.sceneMode === "fixed") raw.scene = defaultScene;
  else if (routing.sceneMode === "preserve-custom") raw.scene = currentScene || defaultScene;
  else raw.scene = section.scenes.includes(currentScene) ? currentScene : defaultScene;

  if (routing.sceneMode !== "preserve-custom" && REAL_SECTION_SCENES.has(String(raw.scene || ""))) raw.customScene = "";
  raw.pose = selfieSafePose(raw.pose, section.captureType);
  raw.sectionClothingSource = section.clothingSource;
  raw.sectionPoses = [...section.poses];
  raw.sectionLighting = [...section.lighting];
  raw.sectionRealismLayers = [...section.realismLayers];

  if (hasAuthority(section, "carExterior")) {
    const selection = resolveCarExteriorSelection(raw);
    raw.time = selection.time;
    raw.carExteriorLocation = selection.location;
    raw.carExteriorPose = selection.pose;
    raw.carExteriorLighting = selection.lighting;
  }
  return raw;
}

function resolveClothingDetails(raw, clean) {
  const selectedClothing = raw.clothing || raw.carExteriorClothing || "";
  const garment = resolveClothingText(selectedClothing, raw);
  const fabricValue = raw.fabric || clean.fabric;
  const weightValue = raw.fabricWeight || clean.fabricWeight;
  const wearValue = raw.wearState || clean.wearState;
  const fitValue = raw.clothingFit || clean.clothingFit;
  const ironValue = raw.ironState || clean.ironState;
  const fabric = fabricValue ? humanize(fabricValue) : clean.fabric;
  const fabricWeight = weightValue ? `${humanize(weightValue)} fabric weight` : clean.fabricWeight;
  const wearState = WEAR_TEXT[wearValue] || (wearValue ? humanize(wearValue) : clean.wearState);
  const clothingFit = FIT_TEXT[fitValue] || (fitValue ? `${humanize(fitValue)} fit` : clean.clothingFit);
  const ironText = IRON_TEXT[ironValue] || (ironValue ? humanize(ironValue) : "");
  const userModifier = String(raw.clothingCustom || clean.clothingCustom || "").trim();
  const clothingCustom = [ironText, userModifier].filter(Boolean).join("; ");
  return {
    ...clean,
    clothing:garment,
    fabric,
    fabricWeight,
    wearState,
    clothingFit,
    clothingCustom,
    sectionClothingSource:raw.sectionClothingSource || clean.sectionClothingSource,
    sectionPoses:raw.sectionPoses || clean.sectionPoses,
    sectionLighting:raw.sectionLighting || clean.sectionLighting,
    sectionRealismLayers:raw.sectionRealismLayers || clean.sectionRealismLayers
  };
}

function phase23Input(rawInput, cleanInput) {
  const raw = rawInput && typeof rawInput === "object" ? rawInput : {};
  const section = activeSectionById(raw.studioSection);
  let clean = cleanInput && typeof cleanInput === "object" ? cleanInput : {};
  clean = resolveClothingDetails(raw, clean);
  clean = {
    ...clean,
    studioSection:section?.id || raw.studioSection || clean.studioSection,
    intentType:raw.intentType || section?.rules?.routing?.intentType || clean.intentType,
    captureType:section?.captureType || raw.captureType || clean.captureType,
    scene:raw.scene || clean.scene,
    pose:raw.pose || clean.pose
  };
  if (hasAuthority(section, "carExterior")) {
    const selection = resolveCarExteriorSelection(raw);
    return {
      ...clean,
      studioSection:section.id,
      intentType:section.rules.routing.intentType,
      captureType:section.captureType,
      scene:section.rules.routing.defaultScene,
      customScene:`A parked Range Rover exterior selfie, ${selection.locationText}, with the subject ${selection.poseText}`,
      pose:selection.poseText,
      lighting:selection.lightingText || clean.lighting,
      time:selection.time,
      sceneFacts:{
        ...(clean.sceneFacts && typeof clean.sceneFacts === "object" ? clean.sceneFacts : {}),
        carExteriorLocation:selection.location,
        carExteriorPose:selection.pose,
        carExteriorLighting:selection.lighting
      }
    };
  }
  if (DAILY_SCENE_KEYS.has(clean.scene) && SCENES[clean.scene]?.environment) return { ...clean, customScene:SCENES[clean.scene].environment };
  return clean;
}

function enforcePhase34CarExteriorHeadwearBudget(prompt, canonical) {
  if (canonical?.scene?.id !== "carExterior" || !describeHeadwear(canonical) || wordCount(prompt) <= PHASE34_ROUTING_WORD_BUDGET) return prompt;
  return String(prompt).replace(PHASE34_REDUNDANT_GLASS_SENTENCE, "").replace(/\s{2,}/gu, " ").trim();
}

function compactPhase40CarExteriorBudget(prompt, maxWords = 250) {
  let compacted = String(prompt || "").replace(/\s{2,}/gu, " ").trim();
  if (wordCount(compacted) <= maxWords) return compacted;

  const sceneCompactors = [
    [/A parked Range Rover exterior selfie, parked on a driveway before a Saudi villa with beige stone cladding, high wall, metal gate, and a palm tree\./iu, "A parked Range Rover exterior selfie on a Saudi villa driveway with beige stone, gate and palm tree."],
    [/A parked Range Rover exterior selfie, at the curb before a small grocery with shelves and a glowing beverage cooler behind glass\./iu, "A parked Range Rover exterior selfie at a small grocery curb."],
    [/A parked Range Rover exterior selfie, in a marked outdoor lot with white lines, concrete wheel stops, and a few other parked cars\./iu, "A parked Range Rover exterior selfie in a marked outdoor parking lot."],
    [/A parked Range Rover exterior selfie, parallel parked along a yellow-and-black curb on weathered asphalt\./iu, "A parked Range Rover exterior selfie along a yellow-and-black street curb."],
    [/A parked Range Rover exterior selfie, on a sandy shoulder with sparse shrubs and an open horizon\./iu, "A parked Range Rover exterior selfie on a sandy rest-stop shoulder."],
    [/A parked Range Rover exterior selfie, in outdoor mall parking with shaded walkways\./iu, "A parked Range Rover exterior selfie in outdoor mall parking."]
  ];
  for (const [pattern, replacement] of sceneCompactors) {
    compacted = compacted.replace(pattern, replacement).replace(/\s{2,}/gu, " ").trim();
    if (wordCount(compacted) <= maxWords) return compacted;
  }

  const compactors = [
    [/Subject:\s*([^.]*?),\s*wearing crisp white thobe with a red-and-white checkered shemagh and black iqal, youthful style with one end casually thrown over the shoulder\./iu, "Subject: $1, wearing crisp white thobe."],
    [/Camera near eye level at 45–60 cm, no steep downward angle; relaxed upright posture, spine extension, enough upper torso to communicate the tall athletic frame\./iu, "Camera near eye level at 45–60 cm, no steep downward angle; relaxed posture preserves tall-frame perspective."],
    [/The capture uses a physically possible camera position, a physically possible camera operator, and one coherent capture event\./iu, "One physically possible front-camera capture event."],
    [/Shoulder and head height relative to roofline, door frame, and handle reflect a genuine 195 cm adult\./iu, "Roofline, door and handle scale reads as a genuine 195 cm adult."],
    [/Captured with the selected physically plausible front-camera geometry\./iu, "Plausible front-camera geometry."],
    [/Slight lens softness is visible toward the frame edges\.\s*/iu, ""],
    [/Subtle tone variation between forehead and cheeks\.\s*/iu, ""],
    [/Natural hair flyaways and loose strands\.\s*/iu, ""],
    [/Natural fabric wrinkles and folds\.\s*/iu, ""],
    [/Subtle skin texture with natural pores\.\s*/iu, ""]
  ];

  for (const [pattern, replacement] of compactors) {
    compacted = compacted.replace(pattern, replacement).replace(/\s{2,}/gu, " ").trim();
    if (wordCount(compacted) <= maxWords) return compacted;
  }

  if (/Identity strictly preserved from the reference image:/iu.test(compacted)) {
    compacted = compacted.replace(/No facial alteration\/lengthening\.\s*/iu, "").replace(/\s{2,}/gu, " ").trim();
    if (wordCount(compacted) <= maxWords) return compacted;
  }

  compacted = compacted.replace(
    /Tall 195 cm, 88 kg lean-athletic build: medium-to-moderately-broad shoulders visibly wider than the waist, moderately developed chest, subtle deltoid roundness, long proportional limbs with filled-not-thin arms, proportionate adult male neck, and head anatomically scaled to tall frame\./iu,
    "Tall 195 cm, 88 kg lean-athletic build: shoulders wider than waist, moderately developed chest and deltoids, long proportional limbs, filled arms, adult male neck, and head scaled to the tall frame."
  ).replace(/\s{2,}/gu, " ").trim();

  return compacted;
}

function enforcePhase40FinalCarExteriorSelection(prompt, routedInput) {
  const section = activeSectionById(routedInput?.studioSection);
  if (!hasAuthority(section, "carExterior")) return prompt;
  const selection = resolveCarExteriorSelection(routedInput);
  const source = String(prompt || "");
  const missingSelection = describeMissingCarExteriorSelectionEvidence(source, routedInput);
  const missingCabin = selection.pose === "door-open" && !/Ivory perforated leather/iu.test(source)
    ? "Open door reveals Ivory perforated leather, dark wood veneer and black-and-Ivory wheel."
    : "";
  const addition = [missingSelection, missingCabin].filter(Boolean).join(" ");
  if (!addition) return compactPhase40CarExteriorBudget(source);

  const lightingIndex = Math.max(source.lastIndexOf("Lighting follows "), source.lastIndexOf("Lighting uses "));
  const next = lightingIndex < 0
    ? `${source} ${addition}`.replace(/\s{2,}/gu, " ").trim()
    : `${source.slice(0, lightingIndex)}${addition} ${source.slice(lightingIndex)}`.replace(/\s{2,}/gu, " ").trim();
  return compactPhase40CarExteriorBudget(next);
}

export function buildCanonicalV3UserOutput(rawInput = {}, sceneData = undefined) {
  const routedInput = applySectionCaptureRouting(rawInput);
  const section = activeSectionById(routedInput.studioSection);
  const resolution = resolveCanonicalConflicts(routedInput, sceneData);
  const cleanInput = phase23Input(routedInput, resolution.cleanInput);
  const baseCanonical = buildCanonicalV3(cleanInput);
  const canonical = applyGroupPhase13(baseCanonical, cleanInput);
  const basePrompt = enforcePhase34CarExteriorHeadwearBudget(buildOpenAIImagePrompt(canonical), canonical);
  const enrichedPrompt = enrichGroupPromptPhase13(canonical, cleanInput, basePrompt);
  const prompt = enforcePhase40FinalCarExteriorSelection(enrichedPrompt, routedInput);
  return Object.freeze({ resolution, section, canonical, prompt });
}

export default buildCanonicalV3UserOutput;
