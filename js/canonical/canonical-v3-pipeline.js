import { buildCanonicalV3 } from "../canonical-v3-engine.js";
import { resolveCanonicalConflicts } from "./conflict-resolver.js";
import {
  buildOpenAIImagePrompt,
  describeHeadwear,
  describeBodyAnatomy,
  describeEnvironmentScale,
  SELFIE_ARM_LOCK,
  IDENTITY_STRICT_LOCK
} from "./openai-image-adapter-phase36.js";
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
  const route = { captureType:section.captureType, intentType:routing.intentType || "selfie" };
  if (routing.sceneMode === "fixed") { route.scene = defaultScene; route.forceScene = true; }
  else route.fallbackScene = defaultScene;
  return Object.freeze(route);
}

export const SECTION_CAPTURE_ROUTING = Object.freeze(Object.fromEntries(
  Object.values(SECTION_REGISTRY).map((section) => [section.id, compatibilityRoute(section)])
));

const WEAR_TEXT = Object.freeze({ fresh:"fresh wear", "normal-day":"ordinary daily wear", "hours-worn":"several hours worn", "washed-soft":"washed-soft daily wear", "home-used":"home-used wear", "post-workout":"post-workout wear" });
const FIT_TEXT = Object.freeze({ slim:"slim fit", regular:"regular fit", relaxed:"relaxed fit", oversized:"oversized fit" });
const IRON_TEXT = Object.freeze({ "fresh-pressed":"freshly pressed", "normal-pressed":"normally pressed", "lightly-unpressed":"lightly unpressed", unpressed:"unpressed" });

function humanize(value) { return String(value || "").trim().replace(/[_-]+/gu, " ").replace(/\s+/gu, " "); }
function wordCount(value) { return String(value || "").trim().split(/\s+/u).filter(Boolean).length; }
function normalizeScene(value) { return String(value || "") === "my_bedroom_text" ? "bedroom" : String(value || ""); }
function activeSectionById(id) { const key = String(id || "").trim(); return getSection(key) || getSection(LEGACY_SECTION_ALIASES[key]); }
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
  else if (routing.sceneMode === "fallback") raw.scene = REAL_SECTION_SCENES.has(currentScene) ? currentScene : defaultScene;
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
  return { ...clean, clothing:garment, fabric, fabricWeight, wearState, clothingFit, clothingCustom, sectionClothingSource:raw.sectionClothingSource || clean.sectionClothingSource, sectionPoses:raw.sectionPoses || clean.sectionPoses, sectionLighting:raw.sectionLighting || clean.sectionLighting, sectionRealismLayers:raw.sectionRealismLayers || clean.sectionRealismLayers };
}

function phase23Input(rawInput, cleanInput) {
  const raw = rawInput && typeof rawInput === "object" ? rawInput : {};
  const section = activeSectionById(raw.studioSection);
  let clean = cleanInput && typeof cleanInput === "object" ? cleanInput : {};
  clean = resolveClothingDetails(raw, clean);
  clean = { ...clean, studioSection:section?.id || raw.studioSection || clean.studioSection, intentType:raw.intentType || section?.rules?.routing?.intentType || clean.intentType, captureType:section?.captureType || raw.captureType || clean.captureType, scene:raw.scene || clean.scene, pose:raw.pose || clean.pose };
  if (hasAuthority(section, "carExterior")) {
    const selection = resolveCarExteriorSelection(raw);
    return { ...clean, studioSection:section.id, intentType:section.rules.routing.intentType, captureType:section.captureType, scene:section.rules.routing.defaultScene, customScene:`A parked Range Rover exterior selfie, ${selection.locationText}, with the subject ${selection.poseText}`, pose:selection.poseText, lighting:selection.lightingText || clean.lighting, time:selection.time, sceneFacts:{ ...(clean.sceneFacts && typeof clean.sceneFacts === "object" ? clean.sceneFacts : {}), carExteriorLocation:selection.location, carExteriorPose:selection.pose, carExteriorLighting:selection.lighting } };
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
  for (const [pattern, replacement] of sceneCompactors) { compacted = compacted.replace(pattern, replacement).replace(/\s{2,}/gu, " ").trim(); if (wordCount(compacted) <= maxWords) return compacted; }
  const compactors = [
    [/Subject:\s*([^.]*?),\s*wearing crisp white thobe with a red-and-white checkered shemagh and black iqal, youthful style with one end casually thrown over the shoulder\./iu, "Subject: $1, wearing crisp white thobe."],
    [/Camera near eye level at 45–60 cm, no steep downward angle; relaxed upright posture, spine extension, enough upper torso to communicate the tall athletic frame\./iu, "Camera near eye level at 45–60 cm, no steep downward angle; relaxed posture preserves tall-frame perspective."],
    [/The capture uses a physically possible camera position, a physically possible camera operator, and one coherent capture event\./iu, "One physically possible front-camera capture event."],
    [/Shoulder and head height relative to roofline, door frame, and handle reflect a genuine 195 cm adult\./iu, "Roofline, door and handle scale reads as a genuine 195 cm adult."],
    [/Captured with the selected physically plausible front-camera geometry\./iu, "Plausible front-camera geometry."],
    [/Slight lens softness is visible toward the frame edges\.\s*/iu, ""], [/Subtle tone variation between forehead and cheeks\.\s*/iu, ""], [/Natural hair flyaways and loose strands\.\s*/iu, ""], [/Natural fabric wrinkles and folds\.\s*/iu, ""], [/Subtle skin texture with natural pores\.\s*/iu, ""]
  ];
  for (const [pattern, replacement] of compactors) { compacted = compacted.replace(pattern, replacement).replace(/\s{2,}/gu, " ").trim(); if (wordCount(compacted) <= maxWords) return compacted; }
  if (/Identity strictly preserved from the reference image:/iu.test(compacted)) { compacted = compacted.replace(/No facial alteration\/lengthening\.\s*/iu, "").replace(/\s{2,}/gu, " ").trim(); if (wordCount(compacted) <= maxWords) return compacted; }
  return compacted.replace(/Tall 195 cm, 88 kg lean-athletic build: medium-to-moderately-broad shoulders visibly wider than the waist, moderately developed chest, subtle deltoid roundness, long proportional limbs with filled-not-thin arms, proportionate adult male neck, and head anatomically scaled to tall frame\./iu, "Tall 195 cm, 88 kg lean-athletic build: shoulders wider than waist, moderately developed chest/deltoids, long proportional limbs, filled arms, adult male neck, and head scaled to the tall frame.").replace(/\s{2,}/gu, " ").trim();
}

function enforcePhase40FinalCarExteriorSelection(prompt, routedInput) {
  const section = activeSectionById(routedInput?.studioSection);
  if (!hasAuthority(section, "carExterior")) return prompt;
  const selection = resolveCarExteriorSelection(routedInput);
  const source = String(prompt || "");
  const missingSelection = describeMissingCarExteriorSelectionEvidence(source, routedInput);
  const missingCabin = selection.pose === "door-open" && !/Ivory perforated leather/iu.test(source) ? "Open door reveals Ivory perforated leather, dark wood veneer and black-and-Ivory wheel." : "";
  const addition = [missingSelection, missingCabin].filter(Boolean).join(" ");
  if (!addition) return compactPhase40CarExteriorBudget(source);
  const lightingIndex = Math.max(source.lastIndexOf("Lighting follows "), source.lastIndexOf("Lighting uses "));
  const next = lightingIndex < 0 ? `${source} ${addition}`.replace(/\s{2,}/gu, " ").trim() : `${source.slice(0, lightingIndex)}${addition} ${source.slice(lightingIndex)}`.replace(/\s{2,}/gu, " ").trim();
  return compactPhase40CarExteriorBudget(next);
}

function deepFreezePhase41(value) { if (!value || typeof value !== "object" || Object.isFrozen(value)) return value; Object.freeze(value); for (const child of Object.values(value)) deepFreezePhase41(child); return value; }

function applyPhase41CanonicalSectionWiring(canonical, routedInput, section) {
  const wiring = section?.rules?.wiring;
  const maxPeople = Number(wiring?.groupMaxPeople || 0);
  if (!maxPeople || section?.id !== "group") return canonical;
  const requested = Math.max(2, Math.min(maxPeople, Math.trunc(Number(routedInput?.groupCount) || canonical?.subjects?.count || 3)));
  if (requested === canonical?.subjects?.count) return canonical;
  const next = structuredClone(canonical);
  next.subjects.count = requested;
  next.subjects.additional = Array.isArray(next.subjects.additional) ? next.subjects.additional.slice(0, Math.max(0, requested - 1)) : [];
  const template = next.subjects.additional[next.subjects.additional.length - 1] || { ...next.subjects.primary, reference_id:null };
  while (next.subjects.additional.length < requested - 1) { const person = structuredClone(template); person.reference_id = null; next.subjects.additional.push(person); }
  return deepFreezePhase41(next);
}

function phase41SentenceParts(prompt) { return String(prompt || "").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map((sentence) => sentence.replace(/\s+/gu, " ").trim()).filter(Boolean) || []; }
function phase41Deduplicate(prompt) { const seen = new Set(); const kept = []; for (const sentence of phase41SentenceParts(prompt)) { if (seen.has(sentence)) continue; seen.add(sentence); kept.push(sentence); } return kept.join(" ").replace(/\s{2,}/gu, " ").trim(); }
function insertAfterOpening(prompt, addition) { if (!addition) return String(prompt || ""); const source = String(prompt || "").trim(); const end = source.search(/[.!?]/u); return end < 0 ? `${addition} ${source}`.trim() : `${source.slice(0, end + 1)} ${addition} ${source.slice(end + 1)}`.replace(/\s{2,}/gu, " ").trim(); }

function replacePhase41Lighting(prompt, description, time) {
  const detail = String(description || "").trim();
  if (!detail) return String(prompt || "");
  const period = String(time || "").trim().toLowerCase() === "day" ? "day" : "night";
  const required = `Lighting follows the selected real-world ${period} source: ${detail.replace(/[.!?]+$/u, "")}.`;
  const source = String(prompt || "").replace(/\bLighting (?:uses|follows)[^.]*\.\s*/giu, "").replace(/\s{2,}/gu, " ").trim();
  return `${source} ${required}`.replace(/\s{2,}/gu, " ").trim();
}

function normalizePhase41CarExteriorAuthority(prompt, routedInput) {
  const selection = resolveCarExteriorSelection(routedInput);
  const cabin = selection.pose === "door-open" ? "; open door reveals Ivory perforated leather, dark wood and black-and-Ivory wheel" : "";
  const authority = `Location: ${selection.locationText}; subject ${selection.poseText}; tire contact shadow${cabin}.`;
  const kept = phase41SentenceParts(prompt).filter((sentence) => {
    if (/2017 Range Rover Sport Autobiography Dynamic/iu.test(sentence)) return true;
    if (/^A parked Range Rover exterior selfie/iu.test(sentence)) return false;
    if (/^The vehicle is /iu.test(sentence)) return false;
    if (/^Open driver door reveals/iu.test(sentence)) return false;
    if (/^(?:Beside a Saudi villa|Villa driveway|At a small grocery|In a marked outdoor parking lot|The vehicle is on a sandy|A parked Range Rover exterior selfie)/iu.test(sentence)) return false;
    return true;
  });
  kept.push(authority);
  return phase41Deduplicate(kept.join(" "));
}

function compactPhase41CarExteriorProtectedText(prompt, canonical) {
  if (canonical?.scene?.id !== "carExterior") return String(prompt || "");
  return String(prompt || "")
    .replace(/2017 Range Rover Sport Autobiography Dynamic L494, Fuji White, gloss black grille and vent surrounds, 22-inch dark alloys, quad rectangular exhaust tips, LED DRLs, panoramic glass roof, transparent glass with natural reflections and a faint Ivory-cabin view, never opaque black; Autobiography Dynamic badging and Saudi plate, never legible\./iu, "2017 Range Rover Sport Autobiography Dynamic L494, Fuji White; gloss-black-grille/vents; 22-inch-dark-alloys; quad-exhausts; LED-DRLs; panoramic-glass; transparent-reflective-glass/faint-Ivory-cabin; Dynamic-badge; illegible-Saudi-plate.")
    .replace(/Tall 195 cm, 88 kg lean-athletic build: medium-to-moderately-broad shoulders visibly wider than the waist, moderately developed chest, subtle deltoid roundness, long proportional limbs with filled-not-thin arms, proportionate adult male neck, and head anatomically scaled to tall frame\./iu, "Tall 195 cm, 88 kg lean-athletic; broad-shouldered; proportional-limbed.")
    .replace(/Tall 195 cm, 88 kg lean-athletic build: shoulders wider than waist, developed chest\/deltoids, long proportional limbs, filled arms, adult male neck, head scaled to the tall frame\./iu, "Tall 195 cm, 88 kg lean-athletic; broad-shouldered; proportional-limbed.")
    .replace(/Subject:\s*([^,]+),\s*([^,]+),\s*wearing ([^.]+)\./iu, "$1; $2; $3.")
    .replace(/\s{2,}/gu, " ")
    .trim();
}

function phase41SceneProtected(sentence, canonical, routedInput, section) {
  const id = section?.id;
  if (id === "carExterior" && /2017 Range Rover Sport Autobiography Dynamic|Location:|Fuji White/iu.test(sentence)) return true;
  if (id === "car" && /Inside stationary 2017 Range Rover Sport Autobiography Dynamic|Ivory perforated leather|LHD vehicle-relative|driver's door and side window/iu.test(sentence)) return true;
  if (id === "bedroom" && /bedroom/iu.test(sentence)) return true;
  if (id === "gym" && /gym environment/iu.test(sentence)) return true;
  if (id === "street") {
    const mood = String(routedInput?.streetMood || "").toLowerCase();
    if (mood === "alley" && /service alley|air-conditioning units/iu.test(sentence)) return true;
    if (mood === "construction" && /street construction|paving blocks/iu.test(sentence)) return true;
    if (mood === "bufia" && /bufia/iu.test(sentence)) return true;
    if ((!mood || mood === "normal") && /street|parking/iu.test(sentence)) return true;
  }
  if (id === "custom" && canonical?.scene?.description && sentence.includes(canonical.scene.description)) return true;
  if ((id === "solo" || id === "group" || id === "accidental") && /street|parking/iu.test(sentence)) return true;
  return false;
}

function compactPhase41Budget(prompt, canonical, routedInput, section, required = [], maxWords = 250) {
  const compactable = section?.id === "carExterior" ? compactPhase41CarExteriorProtectedText(prompt, canonical) : prompt;
  let sentences = phase41SentenceParts(phase41Deduplicate(compactable));
  const headwear = describeHeadwear(canonical);
  const body = describeBodyAnatomy(canonical);
  const scale = describeEnvironmentScale(canonical);
  const requiredText = required.filter(Boolean).map((value) => String(value));
  const protectedSentence = (sentence) => Boolean(/^A candid |^An accidental /u.test(sentence) || sentence.includes(SELFIE_ARM_LOCK) || sentence.includes(IDENTITY_STRICT_LOCK) || (body && sentence.includes(body)) || (scale && sentence.includes(scale)) || /Tall 195 cm, 88 kg lean-athletic/iu.test(sentence) || /195 cm adult|stature reads noticeably above average-height|Shoulders fill seatback|Roofline, door and handle scale/iu.test(sentence) || /2017 Range Rover Sport Autobiography Dynamic/iu.test(sentence) || /LHD vehicle-relative|driver's door and side window/iu.test(sentence) || (headwear && sentence.includes(headwear)) || requiredText.some((value) => sentence.includes(value)) || phase41SceneProtected(sentence, canonical, routedInput, section) || /Each person is a clearly distinct individual/iu.test(sentence) || /^Lighting follows the selected real-world/iu.test(sentence));
  const optionalPatterns = [/Visual preferences:/iu,/Scene details:/iu,/Subtle tone variation/iu,/Faint natural pore detail/iu,/Subtle skin texture/iu,/Natural hair flyaways/iu,/Natural fabric wrinkles/iu,/Natural body proportions consistent/iu,/Natural sensor noise/iu,/Slight lens softness/iu,/Authentic white balance/iu,/Localized highlights transition/iu,/Gentle directional contrast/iu,/A single soft catchlight/iu,/Subtle natural eye reflection/iu,/Captured with /iu,/The capture uses a physically possible camera position/iu,/soft-focus background characters/iu,/mixed lighting from yellow sodium lamps/iu,/Blurred ambient streetlight glow/iu,/Out-of-focus warm storefront light/iu,/Localized sweat sheen|A damp shirt patch|Flushed skin|Chalk dust/iu,/Chrome bars|Bench upholstery|Weight plates|Rubber flooring/iu,/A water bottle|His phone and gym bag|One side of the bar/iu,/A blurred figure|A distant figure/iu];
  for (const pattern of optionalPatterns) { if (wordCount(sentences.join(" ")) <= maxWords) break; for (let index = sentences.length - 1; index >= 0 && wordCount(sentences.join(" ")) > maxWords; index -= 1) { if (pattern.test(sentences[index]) && !protectedSentence(sentences[index])) sentences.splice(index, 1); } }
  for (let index = sentences.length - 1; index >= 0 && wordCount(sentences.join(" ")) > maxWords; index -= 1) { if (!protectedSentence(sentences[index])) sentences.splice(index, 1); }
  return sentences.join(" ").replace(/\s{2,}/gu, " ").trim();
}

function enforcePhase41SectionWiring(prompt, canonical, routedInput, section) {
  const wiring = section?.rules?.wiring;
  if (!wiring?.enabled) return prompt;
  let source = String(prompt || "").trim();
  const required = [];
  const garment = String(canonical?.subjects?.primary?.clothing?.garment || "").trim();
  const pose = String(canonical?.subjects?.primary?.pose || "").trim();
  const expression = String(canonical?.subjects?.primary?.expression || "").trim();
  const lighting = String(canonical?.lighting?.description || "").trim();
  const body = describeBodyAnatomy(canonical);
  const scale = describeEnvironmentScale(canonical);
  const bodyEvidencePresent = /Tall 195 cm, 88 kg lean-athletic/iu.test(source);
  const scaleEvidencePresent = /Shoulder and head height relative to roofline|Roofline, door and handle scale|His stature reads noticeably above average-height|Shoulders fill seatback|Camera near eye level at 45–60 cm/iu.test(source);
  const poseSelected = Boolean(String(routedInput?.pose || routedInput?.carExteriorPose || "").trim());
  const expressionSelected = Boolean(String(routedInput?.expression || "").trim());
  const clothingSelected = Boolean(String(routedInput?.clothing || routedInput?.carExteriorClothing || "").trim());
  if (section.id === "carExterior") source = normalizePhase41CarExteriorAuthority(source, routedInput);
  if (section.id === "group") {
    source = source.replace(/Tall 195 cm, 88 kg lean-athletic build: medium-to-moderately-broad shoulders visibly wider than the waist, moderately developed chest, subtle deltoid roundness, long proportional limbs with filled-not-thin arms, proportionate adult male neck, and head anatomically scaled to tall frame\./iu, "Tall 195 cm, 88 kg lean-athletic build.");
  }
  if (wiring.selfieArmLock && !source.includes(SELFIE_ARM_LOCK)) source = insertAfterOpening(source, SELFIE_ARM_LOCK);
  if (wiring.body && !bodyEvidencePresent) {
    const fallbackBody = section.id === "carExterior" ? "Tall 195 cm, 88 kg lean-athletic build: shoulders wider than waist, developed chest/deltoids, long proportional limbs, filled arms, adult male neck, head scaled to the tall frame." : body;
    if (fallbackBody) source = `${source} ${fallbackBody}`.trim();
  }
  if (wiring.body && !scaleEvidencePresent) {
    const fallbackScale = section.id === "carExterior" ? "Roofline, door and handle scale reads as a genuine 195 cm adult." : scale;
    if (fallbackScale) source = `${source} ${fallbackScale}`.trim();
  }
  if (section.id === "carExterior" && wiring.clothing && clothingSelected && garment && !source.includes(garment)) {
    source = phase41SentenceParts(source).filter((sentence) => !(pose && expression && sentence.includes(pose) && sentence.includes(expression) && /crisp white thobe/iu.test(sentence) && !sentence.includes(garment))).join(" ");
  }
  if (wiring.clothing && clothingSelected && garment && !source.includes(garment)) { source = `${source} Clothing: ${garment}.`.trim(); required.push(garment); }
  else if (wiring.clothing && clothingSelected && garment) required.push(garment);
  if (wiring.pose || wiring.expression) {
    const pieces = [];
    if (wiring.pose && poseSelected && pose && !source.includes(pose)) pieces.push(`Pose: ${pose}`);
    if (wiring.expression && expressionSelected && expression && !source.includes(expression)) pieces.push(`expression: ${expression}`);
    if (pieces.length) source = `${source} ${pieces.join("; ")}.`.trim();
    if (wiring.pose && poseSelected && pose) required.push(pose);
    if (wiring.expression && expressionSelected && expression) required.push(expression);
  }
  if (wiring.groupFields && section.id === "group") {
    const holder = String(routedInput?.cameraHolder || "A").trim();
    const distribution = String(routedInput?.groupArrangement || "natural-auto").trim();
    const clause = `Phone holder: ${holder}; group distribution: ${distribution}.`;
    if (!source.includes(distribution) || !/phone holder/iu.test(source)) source = `${source} ${clause}`.trim();
    const groupGarments = (canonical?.subjects?.additional || []).map((person) => String(person?.clothing?.garment || "").trim()).filter(Boolean);
    required.push(...groupGarments, distribution, "people are present in the group composition", "Phone holder:", "group distribution:");
  }
  if (Array.isArray(wiring.accidentalFields) && section.id === "accidental") { const details = wiring.accidentalFields.map((field) => [field,String(routedInput?.[field] || "").trim()]).filter(([,value]) => value); if (details.length) { const clause = `Accidental details: ${details.map(([field,value]) => `${field} ${value}`).join("; ")}.`; if (!details.every(([,value]) => source.includes(value))) source = `${source} ${clause}`.trim(); required.push(...details.map(([,value]) => value),"Accidental details:"); } }
  if (wiring.lighting && lighting) { source = replacePhase41Lighting(source, lighting, routedInput?.time); required.push(lighting); }
  source = phase41Deduplicate(source);
  source = compactPhase41Budget(source, canonical, routedInput, section, required, 250);
  return phase41Deduplicate(source);
}

export function buildCanonicalV3UserOutput(rawInput = {}, sceneData = undefined) {
  const routedInput = applySectionCaptureRouting(rawInput);
  const section = activeSectionById(routedInput.studioSection);
  const resolution = resolveCanonicalConflicts(routedInput, sceneData);
  const cleanInput = phase23Input(routedInput, resolution.cleanInput);
  const baseCanonical = buildCanonicalV3(cleanInput);
  const routedCanonical = applyPhase41CanonicalSectionWiring(baseCanonical, routedInput, section);
  const canonical = applyGroupPhase13(routedCanonical, cleanInput);
  const basePrompt = enforcePhase34CarExteriorHeadwearBudget(buildOpenAIImagePrompt(canonical), canonical);
  const enrichedPrompt = enrichGroupPromptPhase13(canonical, cleanInput, basePrompt);
  const phase40Prompt = enforcePhase40FinalCarExteriorSelection(enrichedPrompt, routedInput);
  const prompt = enforcePhase41SectionWiring(phase40Prompt, canonical, routedInput, section);
  return Object.freeze({ resolution, section, canonical, prompt });
}

export default buildCanonicalV3UserOutput;
