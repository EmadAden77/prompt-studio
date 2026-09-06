import { buildCanonicalV3UserOutput as buildPhase47CanonicalV3UserOutput } from "./canonical-v3-phase47.js";
import { environmentLifeSentences, resolveEnvironmentLife } from "./environment-life-phase48.js";

function text(v){ return String(v ?? "").trim(); }
function words(v){ return text(v).split(/\s+/u).filter(Boolean).length; }
function sentences(v){ return String(v || "").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map(s=>s.replace(/\s+/gu," ").trim()).filter(Boolean)||[]; }
function dedupe(v){ const seen=new Set(); return sentences(v).filter(s=>{const k=s.toLowerCase(); if(seen.has(k)) return false; seen.add(k); return true;}).join(" ").trim(); }

function insertEnvironmentLife(base, raw) {
  const section = base.section;
  const additions = environmentLifeSentences(raw, base.canonical, section?.id);
  let parts = sentences(base.prompt).filter(s => !/Background (?:activity|life|people|elements)|parking area has restrained|residential background stays quiet|public roadside setting has modest|gym has restrained everyday activity|Street life is distributed naturally/iu.test(s));
  const lightingIndex = parts.findIndex(s => /parking-lot practical lighting|villa porch light|sodium streetlights|practical night lighting|selected real-world night source/iu.test(s));
  const insertAt = lightingIndex >= 0 ? lightingIndex + 1 : parts.length;
  parts.splice(insertAt, 0, ...additions);
  return dedupe(parts.join(" "));
}

function keepBudget(prompt, section, environment) {
  const max = section?.id === "carExterior" ? 280 : 250;
  let parts = sentences(dedupe(prompt));
  const protectedPart = s => /Identity strictly preserved|Tall 195 cm, 88 kg|2017 Range Rover Sport Autobiography Dynamic|One arm extends toward the camera|parking-lot practical lighting|villa porch light|sodium streetlights|practical night lighting|selected real-world night source/iu.test(s)
    || s === environment.lifeSentence || s === environment.lightingSentence
    || s === section?.actionDescription || s === section?.imperfections;
  const optional = [/Visual preferences:/iu,/Scene details:/iu,/Natural sensor noise/iu,/Slight lens softness/iu,/Authentic white balance/iu,/Subtle natural eye reflection/iu,/Captured with the selected physically plausible/iu];
  for (const pattern of optional) for(let i=parts.length-1;i>=0&&words(parts.join(" "))>max;i--) if(pattern.test(parts[i])&&!protectedPart(parts[i])) parts.splice(i,1);
  for(let i=parts.length-1;i>=0&&words(parts.join(" "))>max;i--) if(!protectedPart(parts[i])) parts.splice(i,1);
  return dedupe(parts.join(" "));
}

export function buildCanonicalV3UserOutput(rawInput = {}, sceneData = undefined) {
  const base = buildPhase47CanonicalV3UserOutput(rawInput, sceneData);
  const environment = resolveEnvironmentLife(rawInput, base.canonical, base.section?.id);
  const enriched = insertEnvironmentLife(base, rawInput);
  const prompt = keepBudget(enriched, base.section, environment);
  return Object.freeze({ ...base, phase48:Object.freeze({ environmentLife:environment, determinism:"10/10" }), prompt });
}

export default buildCanonicalV3UserOutput;
