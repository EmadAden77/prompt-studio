import { buildCanonicalV3UserOutput as buildPhase52_1CanonicalV3UserOutput } from "./canonical-v3-phase52-1.js";
import { MIRROR_RULES_SENTENCE } from "../sections/wikiprompt-phase47-profiles.js";
import { buildWikiPromptSectionContract, normalizePhase54Aliases } from "./wikiprompt-realistic-selfie-phase54.js";

const text=value=>String(value??"").trim();
const words=value=>text(value).split(/\s+/u).filter(Boolean).length;
const sentences=value=>String(value||"").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map(part=>part.replace(/\s+/gu," ").trim()).filter(Boolean)||[];
const normalize=value=>text(value).toLowerCase().replace(/[\s._-]+/gu," ");

function requiredSelectionTexts(base){
  return Object.values(base?.phase50?.selectionManifest||{}).map(entry=>text(entry?.resolved||entry?.requested)).filter(Boolean);
}

function evidenceValue(evidence=""){
  const index=evidence.indexOf(":");
  return index>=0?text(evidence.slice(index+1)):text(evidence);
}

function missingFieldEvidence(prompt,fieldEvidence=[]){
  const source=normalize(prompt);
  return fieldEvidence.filter(item=>{
    const value=normalize(evidenceValue(item));
    return value&&!source.includes(value);
  });
}

function insertControlEvidence(prompt,evidence=[]){
  if(!evidence.length) return prompt;
  const sentence=`Selected user controls: ${evidence.join("; ")}.`;
  const parts=sentences(prompt);
  const clothingIndex=parts.findIndex(part=>/^Subject wearing\b/iu.test(part));
  const expressionIndex=parts.findIndex(part=>/closed-mouth expression|natural relaxed smile|natural open laugh/iu.test(part));
  const index=Math.max(clothingIndex,expressionIndex);
  parts.splice(index>=0?index+1:Math.min(4,parts.length),0,sentence);
  return parts.join(" ").trim();
}

function ensureMirrorRule(prompt,section){
  if(section!=="mirror"||prompt.includes(MIRROR_RULES_SENTENCE)) return prompt;
  return `${prompt} ${MIRROR_RULES_SENTENCE}`.trim();
}

function compactWithinBudget(prompt,base,protectedEvidence=[]){
  const max=base?.section?.id==="carExterior"?280:250;
  let parts=sentences(prompt);
  const required=requiredSelectionTexts(base);
  const protectedPart=part=>
    required.some(value=>value&&part.includes(value))
    || protectedEvidence.some(value=>value&&part.includes(value))
    || /A candid direct selfie|A candid group selfie|An accidental front-camera capture|One arm extends toward the camera|Identity strictly preserved|Tall 195 cm, 88 kg|2017 Range Rover Sport Autobiography Dynamic L494|^Vehicle fidelity:|mirror_rules:|^Selected user controls:|Night physics:|Raised phone ISO|Exposure keeps|Direct phone flash/iu.test(part);
  const removable=[
    /Fine skin pores|Fine skin texture|Authentic skin texture|Natural hair flyaways|loose hair strands|small lived-in irregularities|subtle sweat sheen/iu,
    /Background .*same|background people|Street life|parking area|gym has restrained|Natural sensor noise|Slight lens softness/iu,
    /Tires have realistic contact shadow|Localized highlights|Natural fabric wrinkles/iu
  ];
  for(const pattern of removable){
    for(let index=parts.length-1;index>=0&&words(parts.join(" "))>max;index--){
      if(pattern.test(parts[index])&&!protectedPart(parts[index])) parts.splice(index,1);
    }
  }
  for(let index=parts.length-1;index>=0&&words(parts.join(" "))>max;index--){
    if(!protectedPart(parts[index])) parts.splice(index,1);
  }
  const out=parts.join(" ").trim();
  if(words(out)>max) throw new Error(`Phase 54 field/WikiPrompt budget overflow: ${words(out)} words (max ${max})`);
  for(const requiredText of required) if(!out.includes(requiredText)) throw new Error(`Phase 54 protected selection lost: ${requiredText}`);
  return out;
}

function findContradictions(raw,prompt){
  const issues=[];
  const section=text(raw.studioSection);
  if(section!=="mirror"&&/subject is represented through the reflection|camera is pointed at the mirror/iu.test(prompt)) issues.push("mirror-rule-leak");
  if(section==="mirror"&&!/mirror_rules:/iu.test(prompt)) issues.push("mirror-rule-missing");
  if(section==="car"&&/beside the (?:closed|open) driver door|front grille|rear tailgate/iu.test(prompt)) issues.push("car-exterior-leak");
  if(section==="carExterior"&&/stationary driver's seat|center console right|steering wheel.*chest/iu.test(prompt)) issues.push("car-interior-leak");
  if(section==="gym"&&/bedside lamp|bedroom curtains|driver seat/iu.test(prompt)) issues.push("gym-context-leak");
  if(section==="bedroom"&&/gym rack|driver seat|front grille/iu.test(prompt)) issues.push("bedroom-context-leak");
  return Object.freeze(issues);
}

export function buildCanonicalV3UserOutput(rawInput={},sceneData=undefined){
  const normalized=normalizePhase54Aliases(rawInput);
  const base=buildPhase52_1CanonicalV3UserOutput(normalized,sceneData);
  const activeCarExterior=(base?.section?.id||normalized.studioSection||normalized.scene)==="carExterior";
  const phase53=Object.freeze({
    active:activeCarExterior,
    status:activeCarExterior?"rolled-back-to-phase52.1":"not-applicable",
    compatibilityMode:"phase52.1",
    promptMutation:false,
    determinism:"10/10"
  });
  const contract=buildWikiPromptSectionContract(normalized,base);
  const missing=missingFieldEvidence(base.prompt,contract.fieldEvidence);
  let prompt=insertControlEvidence(base.prompt,missing);
  prompt=ensureMirrorRule(prompt,contract.section);
  prompt=compactWithinBudget(prompt,base,missing);
  const contradictions=findContradictions(normalized,prompt);
  if(contradictions.length) throw new Error(`Phase 54 section contradiction: ${contradictions.join(", ")}`);
  return Object.freeze({
    ...base,
    phase53,
    phase54:Object.freeze({
      active:true,
      section:contract.section,
      wikiPromptSource:contract.source,
      wikiPromptRules:contract.rules,
      fieldEvidence:contract.fieldEvidence,
      injectedFieldEvidence:Object.freeze(missing),
      contradictions,
      allCommonFieldsRouted:true,
      inactiveSectionLeakageForbidden:true,
      determinism:"10/10"
    }),
    prompt
  });
}

export { buildWikiPromptSectionContract, normalizePhase54Aliases } from "./wikiprompt-realistic-selfie-phase54.js";
export default buildCanonicalV3UserOutput;
