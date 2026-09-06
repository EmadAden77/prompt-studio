import { buildCanonicalV3UserOutput as buildPhase42CanonicalV3UserOutput } from "./canonical-v3-pipeline.js";
import { getSection } from "../sections/index.js";
import { resolveSelfieGeometry, SELFIE_FRAMING_LOCK, SELFIE_OPTICS_LOCK } from "./selfie-geometry-authority.js";
import { SELFIE_ARM_LOCK, IDENTITY_STRICT_LOCK } from "./openai-image-adapter-phase36.js";

const LEGACY_SECTION_ALIASES = Object.freeze({ selfie:"solo", studio:"solo" });

function words(value) { return String(value || "").trim().split(/\s+/u).filter(Boolean).length; }
function sentences(value) { return String(value || "").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map((part) => part.replace(/\s+/gu, " ").trim()).filter(Boolean) || []; }
function sectionFor(raw) { const id = String(raw?.studioSection || "").trim(); return getSection(id) || getSection(LEGACY_SECTION_ALIASES[id]); }
function framingSentence(geometry) { return `${SELFIE_FRAMING_LOCK} ${geometry.framing}.`; }
function dedupe(value) { const seen = new Set(); return sentences(value).filter((sentence) => { const key = sentence.replace(/\s+/gu, " "); if (seen.has(key)) return false; seen.add(key); return true; }).join(" "); }

function applyResolvedGeometry(raw, section, geometry) {
  const next = { ...raw, studioSection:section?.id || raw?.studioSection, selfieAngle:geometry.angle, selfiePose:geometry.pose };
  if (section?.id === "carExterior") next.carExteriorPose = geometry.pose;
  else next.pose = geometry.pose;
  if (section?.id === "group" && geometry.mode.pose === "auto" && geometry.pose === "staggered") next.groupArrangement = "staggered";
  if (section?.id === "accidental" && geometry.mode.pose === "auto") next.accidentalPhonePosition = next.accidentalPhonePosition || "low-off-axis";
  return next;
}

function preCompact(prompt, section) {
  let source = String(prompt || "")
    .replace(/Camera near eye level at 45–60 cm, no steep downward angle; relaxed upright posture, spine extension, enough upper torso to communicate the tall athletic frame\.\s*/giu, "")
    .replace(/Selfie optics lock:[^.]*\.\s*/giu, "")
    .replace(/Selfie framing:[^.]*\.\s*/giu, "")
    .replace(/\s{2,}/gu, " ")
    .trim();
  if (section?.id !== "carExterior") return source;
  return source
    .replace(/Tall 195 cm, 88 kg lean-athletic; broad-shouldered with proportional limbs\./iu, "Tall 195 cm, 88 kg lean-athletic build.")
    .replace(/(?:Shoulder and head height relative to roofline, door frame, and handle reflect|Roofline, door and handle scale reads as) a genuine 195 cm adult\./iu, "Vehicle scale confirms a genuine 195 cm adult.")
    .replace(/\b(?:standing beside the open driver door|standing beside the front grille|leaning naturally against the closed driver door);\s*neutral;\s*(crisp white thobe)\./iu, "neutral; $1.")
    .replace(/\s{2,}/gu, " ")
    .trim();
}

function protect(sentence, section, geometry, garment) {
  return Boolean(
    /^A candid |^An accidental /u.test(sentence)
    || sentence.includes(SELFIE_ARM_LOCK)
    || sentence.includes(IDENTITY_STRICT_LOCK)
    || /195\s*cm/iu.test(sentence)
    || /88\s*kg/iu.test(sentence)
    || sentence.startsWith(SELFIE_OPTICS_LOCK)
    || sentence.startsWith(SELFIE_FRAMING_LOCK)
    || /^Lighting (?:uses|follows)\b/iu.test(sentence)
    || /2017 Range Rover Sport Autobiography Dynamic/iu.test(sentence)
    || /shemagh|ghutra|iqal|agal|bisht/iu.test(sentence)
    || (garment && sentence.includes(garment))
    || (section?.id === "carExterior" && /Tires have realistic contact shadow|subject |Open door reveals|Saudi villa|marked outdoor lot|small grocery|yellow-and-black|sandy shoulder|mall parking/iu.test(sentence))
    || (geometry?.pose && sentence.includes(geometry.pose))
  );
}

function keepPhase45Budget(prompt, section, geometry, canonical, maxWords = 250) {
  let parts = sentences(dedupe(prompt));
  const garment = String(canonical?.subjects?.primary?.clothing?.garment || "").trim();
  const optional = [
    /Visual preferences:/iu,
    /Scene details:/iu,
    /Subtle tone variation/iu,
    /Faint natural pore detail/iu,
    /Subtle skin texture/iu,
    /Natural hair flyaways/iu,
    /Natural fabric wrinkles/iu,
    /Natural body proportions consistent/iu,
    /Natural sensor noise/iu,
    /Slight lens softness/iu,
    /Authentic white balance/iu,
    /Localized highlights transition/iu,
    /Gentle directional contrast/iu,
    /A single soft catchlight/iu,
    /Subtle natural eye reflection/iu,
    /Captured with /iu,
    /The capture uses a physically possible camera position/iu,
    /soft-focus background characters/iu,
    /Blurred ambient streetlight glow/iu,
    /Out-of-focus warm storefront light/iu
  ];
  for (const pattern of optional) {
    if (words(parts.join(" ")) <= maxWords) break;
    for (let index = parts.length - 1; index >= 0 && words(parts.join(" ")) > maxWords; index -= 1) {
      if (pattern.test(parts[index]) && !protect(parts[index], section, geometry, garment)) parts.splice(index, 1);
    }
  }
  for (let index = parts.length - 1; index >= 0 && words(parts.join(" ")) > maxWords; index -= 1) {
    if (!protect(parts[index], section, geometry, garment)) parts.splice(index, 1);
  }
  return parts.join(" ").replace(/\s{2,}/gu, " ").trim();
}

function injectGeometry(prompt, section, geometry, canonical) {
  const compacted = preCompact(prompt, section);
  const lightingIndex = Math.max(compacted.lastIndexOf("Lighting follows "), compacted.lastIndexOf("Lighting uses "));
  const addition = `${geometry.optics} ${framingSentence(geometry)}`;
  const next = lightingIndex < 0
    ? `${compacted} ${addition}`
    : `${compacted.slice(0, lightingIndex)}${addition} ${compacted.slice(lightingIndex)}`;
  return keepPhase45Budget(next, section, geometry, canonical, 250);
}

export function buildCanonicalV3UserOutput(rawInput = {}, sceneData = undefined) {
  const section = sectionFor(rawInput);
  if (!section?.rules?.selfieGeometry) return buildPhase42CanonicalV3UserOutput(rawInput, sceneData);
  const geometry = resolveSelfieGeometry(rawInput, section);
  const routedRaw = applyResolvedGeometry(rawInput, section, geometry);
  const base = buildPhase42CanonicalV3UserOutput(routedRaw, sceneData);
  const prompt = injectGeometry(base.prompt, section, geometry, base.canonical);
  return Object.freeze({ ...base, geometry, prompt });
}

export default buildCanonicalV3UserOutput;
