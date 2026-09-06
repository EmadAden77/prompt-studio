import { buildCanonicalV3UserOutput as buildPhase48CanonicalV3UserOutput } from "./canonical-v3-phase48.js";

function text(v){ return String(v ?? "").trim(); }
function words(v){ return text(v).split(/\s+/u).filter(Boolean).length; }
function sentences(v){ return String(v || "").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map(s=>s.replace(/\s+/gu," ").trim()).filter(Boolean)||[]; }
function dedupe(v){ const seen=new Set(); return sentences(v).filter(s=>{const k=s.toLowerCase(); if(seen.has(k)) return false; seen.add(k); return true;}).join(" ").trim(); }
function isNight(raw, canonical){ const t=text(raw?.time || canonical?.scene?.time).toLowerCase(); const e=`${t} ${text(canonical?.lighting?.source_type)} ${text(canonical?.lighting?.description)}`.toLowerCase(); return t==="night" || /night|streetlight|sodium|neon|practical|porch|dark/iu.test(e); }
function isFlash(raw, sectionId){ return ["solo","street","carExterior"].includes(sectionId) && /^(?:flash|phone-flash|direct-flash)$/iu.test(text(raw?.nightLighting || raw?.lighting || raw?.lightingMode || raw?.nightLightingMode)); }
function moving(raw, canonical){ return /walk|walking|motion|moving|phone-rising|accidental/iu.test(`${text(raw?.selfiePose)} ${text(raw?.carExteriorPose)} ${text(canonical?.subjects?.primary?.pose)} ${text(canonical?.capture?.type)}`); }
function visibleSource(raw, canonical, sectionId, flash){
  if (flash) return "phone flash";
  const explicit=text(raw?.nightLightSource || raw?.lightSource || raw?.lighting).toLowerCase();
  if (/sodium|streetlamp|streetlight/.test(explicit)) return "warm sodium streetlamp";
  if (/neon|sign/.test(explicit)) return "neon shop sign";
  if (/shop|storefront/.test(explicit)) return "shopfront lighting";
  if (/screen/.test(explicit)) return "phone screen";
  if (/interior|cabin/.test(explicit)) return "car interior light";
  if (/porch|villa/.test(explicit)) return "villa porch light";
  if (sectionId==="car") return "car interior light";
  if (sectionId==="carExterior" && /villa/iu.test(text(raw?.carExteriorLocation))) return "villa porch light";
  if (sectionId==="street") return "warm sodium streetlamp";
  if (sectionId==="bedroom" || sectionId==="mirror") return "bedside practical lamp";
  if (sectionId==="gym") return "cool overhead LED fixtures";
  const d=text(canonical?.lighting?.description).toLowerCase();
  if (/sodium|street/.test(d)) return "warm sodium streetlamp";
  if (/neon|sign/.test(d)) return "neon shop sign";
  if (/porch|villa/.test(d)) return "villa porch light";
  return "nearby practical streetlamp";
}
function castFor(source){ if(/sodium|porch|bedside/.test(source)) return "a warm yellow-orange cast on lit skin and clothing"; if(/cool|led/.test(source)) return "a neutral-cool cast on nearby skin and surfaces"; if(/neon|sign/.test(source)) return "a localized colored reflection on face edge, hair, and shoulder"; if(/flash/.test(source)) return "a neutral direct flash cast on the face with cooler ambient color behind"; return "a source-matched local color cast on nearby skin and clothing"; }

export function describeNightPhysics(canonical, raw = {}, sectionId = "") {
  const id=text(sectionId || canonical?.scene?.id || raw?.studioSection);
  if(!isNight(raw,canonical)) return "";
  const flash=isFlash(raw,id); const source=visibleSource(raw,canonical,id,flash); const cast=castFor(source); const motion=moving(raw,canonical);
  const sourceRule=`Night physics: the dominant visible source is the ${source}; it produces ${cast}.`;
  const sensorRule="Low-light phone exposure uses raised ISO with subtle grain, shadow noise, and mild loss of fine detail while retaining natural skin texture.";
  const motionRule=motion ? "Natural movement adds slight blur to the moving hand or loose hair strands, with short streaks from passing car lights." : "Stationary areas stay stable while moving cars may leave short light streaks.";
  const shadowRule="Shadow integrity follows that source; a lit face never floats against an unexplained pitch-black background.";
  const exposureRule=flash
    ? "Flash mode lights the close face directly, leaves the background distinctly darker, creates harder short shadows, and adds a slight realistic sheen on skin and eyes."
    : "Exposure favors either a clearer face with darker background or visible background lights with a naturally dimmer face, never both perfectly bright.";
  const nightGuard="Computational night processing may lift shadows slightly, but darkness remains visibly nocturnal and never turns the scene into daylight.";
  return [sourceRule,sensorRule,motionRule,shadowRule,exposureRule,nightGuard].join(" ");
}

function insertAfterLighting(prompt, physics){
  if(!physics) return prompt;
  const parts=sentences(prompt).filter(s=>!/^Night physics:|^Low-light phone exposure|^Natural movement adds|^Stationary areas stay|^Shadow integrity follows|^Flash mode lights|^Exposure favors|^Computational night processing/iu.test(s));
  let index=parts.findLastIndex(s=>/lighting|streetlamp|streetlight|porch light|shopfront|interior light|LED|DRL/iu.test(s));
  if(index<0) index=parts.length-1;
  parts.splice(index+1,0,...sentences(physics));
  return dedupe(parts.join(" "));
}

function keepBudget(prompt, base, physics){
  const max=base.section?.id==="carExterior"?280:250;
  let parts=sentences(dedupe(prompt));
  const protectedPart=s=>/Identity strictly preserved|Tall 195 cm, 88 kg|One arm extends toward the camera|2017 Range Rover Sport Autobiography Dynamic|red-and-white fine checkered shemagh|black doubled-cord iqal/iu.test(s) || sentences(physics).includes(s) || s===base.section?.actionDescription || s===base.section?.imperfections;
  const drop=[/Background elements share/iu,/Background people, vehicles/iu,/Natural sensor noise/iu,/Slight lens softness/iu,/Captured with the selected physically plausible/iu,/Fine skin pores/iu,/Tires have realistic contact shadow/iu];
  for(const pattern of drop) for(let i=parts.length-1;i>=0&&words(parts.join(" "))>max;i--) if(pattern.test(parts[i])&&!protectedPart(parts[i])) parts.splice(i,1);
  for(let i=parts.length-1;i>=0&&words(parts.join(" "))>max;i--) if(!protectedPart(parts[i])) parts.splice(i,1);
  return dedupe(parts.join(" "));
}

export function buildCanonicalV3UserOutput(rawInput = {}, sceneData = undefined){
  const base=buildPhase48CanonicalV3UserOutput(rawInput,sceneData);
  const physics=describeNightPhysics(base.canonical,rawInput,base.section?.id);
  const prompt=keepBudget(insertAfterLighting(base.prompt,physics),base,physics);
  return Object.freeze({...base,phase49:Object.freeze({nightPhysics:physics,flash:isFlash(rawInput,base.section?.id),determinism:"10/10"}),prompt});
}

export default buildCanonicalV3UserOutput;
