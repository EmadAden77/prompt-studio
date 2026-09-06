import { buildCanonicalV3UserOutput as buildPhase46CanonicalV3UserOutput } from "./canonical-v3-phase46.js";
import { getSection } from "../sections/index.js";
import { MIRROR_RULES_SENTENCE, profileForSection } from "../sections/wikiprompt-phase47-profiles.js";

const FORMAL_GYM = /\b(?:suit|blazer|dress shirt|formal|tie|business|tuxedo|thobe|shemagh|ghutra|iqal|bisht)\b/iu;
const GYM_DEFAULT = "plain breathable athletic T-shirt with training pants";

function text(v){ return String(v ?? "").trim(); }
function words(v){ return text(v).split(/\s+/u).filter(Boolean).length; }
function sentences(v){ return String(v || "").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map(s=>s.replace(/\s+/gu," ").trim()).filter(Boolean)||[]; }
function dedupe(v){ const seen=new Set(); return sentences(v).filter(s=>{const k=s.toLowerCase(); if(seen.has(k)) return false; seen.add(k); return true;}).join(" ").trim(); }

export function resolvePhase47Context(rawInput = {}) {
  const raw = rawInput && typeof rawInput === "object" ? { ...rawInput } : {};
  const sectionId = text(raw.studioSection) || "solo";
  const conflicts = [];
  const selected = text(raw.clothing || raw.carExteriorClothing || raw.customClothing);
  if (sectionId === "gym" && selected && FORMAL_GYM.test(selected)) {
    conflicts.push(Object.freeze({ property:"clothing", section:"gym", value:selected, resolution:"preserve_explicit_user", reason:"formal clothing is contextually unusual for a gym, but explicit user authority outranks the realism resolver" }));
  }
  if (sectionId === "gym" && !selected) {
    raw.clothing = GYM_DEFAULT;
    conflicts.push(Object.freeze({ property:"clothing", section:"gym", value:"", resolution:"auto_resolved_default", replacement:GYM_DEFAULT }));
  }
  return Object.freeze({ input:Object.freeze(raw), conflicts:Object.freeze(conflicts) });
}

function insertAfterOpener(prompt, sentence) {
  const parts = sentences(prompt);
  if (!parts.length) return sentence;
  parts.splice(1,0,sentence);
  return dedupe(parts.join(" "));
}

function stripStaticPose(prompt, section) {
  if (!section?.actionDescription) return prompt;
  return sentences(prompt).filter(s=>!/^Pose:\s*/iu.test(s) && !/^subject leaning on closed driver door\.?$/iu.test(s)).join(" ");
}

function keepPhase47Budget(prompt, section) {
  const max = section?.id === "carExterior" ? 280 : 250;
  let parts = sentences(dedupe(prompt));
  const protectedPart = s => s.includes(section.actionDescription) || s.includes(section.imperfections) || s.includes(MIRROR_RULES_SENTENCE) || /Identity strictly preserved|Tall 195 cm, 88 kg|45–60 cm|21 mm|Selfie optics|2017 Range Rover Sport Autobiography Dynamic/iu.test(s);
  const optional = [/Visual preferences:/iu,/Scene details:/iu,/Natural sensor noise/iu,/Slight lens softness/iu,/Authentic white balance/iu,/Subtle natural eye reflection/iu,/Captured with the selected physically plausible/iu];
  for (const p of optional) for(let i=parts.length-1;i>=0&&words(parts.join(" "))>max;i--) if(p.test(parts[i])&&!protectedPart(parts[i])) parts.splice(i,1);
  for(let i=parts.length-1;i>=0&&words(parts.join(" "))>max;i--) if(!protectedPart(parts[i])) parts.splice(i,1);
  return dedupe(parts.join(" "));
}

function applyPhase47Prompt(base) {
  const section = base.section || getSection(base?.canonical?.input?.studioSection) || getSection("solo");
  const profile = section ? { actionDescription:section.actionDescription, imperfections:section.imperfections } : profileForSection("custom");
  let prompt = stripStaticPose(base.prompt, section);
  prompt = insertAfterOpener(prompt, profile.actionDescription);
  const parts = sentences(prompt);
  const clothingIndex = parts.findIndex(s=>/^Subject wearing\b|\bClothing:/iu.test(s));
  if (!parts.some(s=>s.includes(profile.imperfections))) parts.splice(clothingIndex >= 0 ? clothingIndex + 1 : Math.min(3,parts.length),0,profile.imperfections);
  prompt = dedupe(parts.join(" "));
  if (section?.id === "mirror" && !prompt.includes(MIRROR_RULES_SENTENCE)) prompt = `${prompt} ${MIRROR_RULES_SENTENCE}`.trim();
  return keepPhase47Budget(prompt, section);
}

export function buildCanonicalV3UserOutput(rawInput = {}, sceneData = undefined) {
  const context = resolvePhase47Context(rawInput);
  const base = buildPhase46CanonicalV3UserOutput(context.input, sceneData);
  const prompt = applyPhase47Prompt(base);
  return Object.freeze({ ...base, phase47:Object.freeze({ contextualConflicts:context.conflicts, determinism:"10/10" }), prompt });
}

export default buildCanonicalV3UserOutput;
