import { buildCanonicalV3UserOutput as buildPhase52_1CanonicalV3UserOutput } from "./canonical-v3-phase52-1.js";
import { MIRROR_RULES_SENTENCE } from "../sections/wikiprompt-phase47-profiles.js";
import { buildWikiPromptSectionContract, normalizePhase54Aliases } from "./wikiprompt-realistic-selfie-phase54.js";

const text=value=>String(value??"").trim();
const words=value=>text(value).split(/\s+/u).filter(Boolean).length;
const sentences=value=>String(value||"").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map(part=>part.replace(/\s+/gu," ").trim()).filter(Boolean)||[];
const normalize=value=>text(value).toLowerCase().replace(/[\s._-]+/gu," ");
const CHATGPT_CUSTOM_DIRECTIVE="ChatGPT Images: create exactly one candid, physically plausible smartphone selfie from these instructions; treat the attached reference image as identity-only and preserve every explicit user selection.";
const CHATGPT_CAR_DIRECTIVE="ChatGPT Images: create exactly one candid, physically plausible front-camera selfie inside the parked vehicle; preserve the attached reference identity and every explicit user selection.";
const CAR_INTERIOR_GEOMETRY_LOCK="Car-interior lock: parked stationary LHD cabin; the subject is seated in the driver seat; the driver door and side window remain on his left, the center console remains on his right, and the steering wheel stays directly ahead of his torso; front-camera mirroring must never swap the vehicle's physical left/right geometry.";
const CAR_INTERIOR_FIDELITY_LOCK="Cabin fidelity: 2017 Range Rover Sport Autobiography Dynamic L494 with Ivory perforated leather, dark polished wood veneer, a black-and-Ivory multifunction steering wheel, transparent panoramic glass roof and Ivory headliner; show only elements naturally visible from the selected selfie angle, with ordinary material wear and physically consistent reflections.";
const CAR_CAPTURE_PHYSICS_LOCK="Capture physics: one arm holds the phone at reachable selfie distance and the other stays free or relaxed; the vehicle remains parked, with no driving motion, passenger-seat relocation, exterior pose, studio or ring light, impossible hand use, or contradictory simultaneous actions.";

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
  const sentence=`Use these selected details exactly: ${evidence.join("; ")}.`;
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

function applyCustomSceneAuthority(prompt,raw){
  if(text(raw.studioSection)!=="custom") return Object.freeze({prompt,protectedEvidence:Object.freeze([])});
  const scene=text(raw.customScene);
  const details=text(raw.customSceneDetails);
  let parts=sentences(prompt).filter(part=>!/^ChatGPT Images:/iu.test(part));
  if(scene){
    parts=parts.map(part=>part.replace(/an ordinary physically plausible user-defined location/giu,scene));
    parts=parts.filter(part=>!/^(?:Scene|Location):\s*an ordinary physically plausible user-defined location\.?$/iu.test(part));
  }
  const sceneSentence=scene?`The scene is exactly: ${scene}.`:"";
  const detailSentence=details?`Required scene details, only where physically visible in the selfie framing: ${details}.`:"";
  if(scene&&!normalize(parts.join(" ")).includes(normalize(scene))) parts.splice(Math.min(4,parts.length),0,sceneSentence);
  if(details&&!normalize(parts.join(" ")).includes(normalize(details))) parts.splice(Math.min(5,parts.length),0,detailSentence);
  parts.unshift(CHATGPT_CUSTOM_DIRECTIVE);
  return Object.freeze({
    prompt:parts.join(" ").trim(),
    protectedEvidence:Object.freeze([CHATGPT_CUSTOM_DIRECTIVE,sceneSentence,detailSentence].filter(Boolean))
  });
}

function applyCarInteriorAuthority(prompt,raw){
  if(text(raw.studioSection)!=="car") return Object.freeze({prompt,protectedEvidence:Object.freeze([])});
  let parts=sentences(prompt).filter(part=>!/^ChatGPT Images:/iu.test(part));
  parts=parts.filter(part=>{
    if(/LHD vehicle-relative:/iu.test(part)) return false;
    if(/In the frame, the driver's door and side window appear/iu.test(part)) return false;
    if(/^Inside stationary 2017 Range Rover Sport Autobiography Dynamic L494/iu.test(part)) return false;
    if(/^Pose:\s*.*(?:standing|walking|lying|bed|sofa|gym|outside)/iu.test(part)) return false;
    if(/(?:standing|leaning)\s+(?:beside|against)\s+the\s+(?:closed|open)\s+driver\s+door|front grille|rear tailgate|tire contact shadow/iu.test(part)) return false;
    return true;
  });
  const hasDriverPose=parts.some(part=>/Pose:\s*.*driver|driver (?:close|low|seat)|roof-context|seated.*driver/iu.test(part));
  const clothingIndex=parts.findIndex(part=>/^Subject wearing\b/iu.test(part));
  const insertAt=clothingIndex>=0?clothingIndex+1:Math.min(4,parts.length);
  const locks=[CAR_INTERIOR_GEOMETRY_LOCK,CAR_INTERIOR_FIDELITY_LOCK,CAR_CAPTURE_PHYSICS_LOCK];
  parts.splice(insertAt,0,...locks);
  if(!hasDriverPose) parts.splice(insertAt+locks.length,0,"Pose: seated naturally in the driver seat for the selected selfie framing.");
  parts.unshift(CHATGPT_CAR_DIRECTIVE);
  return Object.freeze({
    prompt:parts.join(" ").trim(),
    protectedEvidence:Object.freeze([CHATGPT_CAR_DIRECTIVE,...locks])
  });
}

function compactHardCore(parts){
  return parts.map(part=>{
    if(/^Tall 195 cm, 88 kg lean-athletic build:/iu.test(part)) return "Tall 195 cm, 88 kg lean-athletic build with believable adult proportions.";
    if(/^Camera near eye level at 45–60 cm,/iu.test(part)) return "Phone held at physically reachable selfie distance with natural perspective.";
    return part;
  }).filter(part=>!/^No facial alteration\/lengthening\.?$/iu.test(part));
}

function compactWithinBudget(prompt,base,protectedEvidence=[]){
  const max=base?.section?.id==="carExterior"?280:250;
  let parts=sentences(prompt);
  const required=requiredSelectionTexts(base);
  const protectedPart=part=>
    required.some(value=>value&&part.includes(value))
    || protectedEvidence.some(value=>value&&part.includes(value))
    || /ChatGPT Images:|Car-interior lock:|Cabin fidelity:|Capture physics:|A candid direct selfie|A candid group selfie|An accidental front-camera capture|One arm extends toward the camera|Identity strictly preserved|Tall 195 cm, 88 kg|2017 Range Rover Sport Autobiography Dynamic L494|^Vehicle fidelity:|mirror_rules:|^Use these selected details exactly:|Night physics:|Raised phone ISO|Exposure keeps|Direct phone flash/iu.test(part);
  const removable=[
    /Fine skin pores|Fine skin texture|Authentic skin texture|Natural hair flyaways|loose hair strands|small lived-in irregularities|subtle sweat sheen/iu,
    /Background .*same|background people|Street life|parking area|gym has restrained|Natural sensor noise|Slight lens softness/iu,
    /Tires have realistic contact shadow|Localized highlights|Natural fabric wrinkles|Realistic dynamic range|Natural wear appears on frequently touched surfaces/iu,
    /Captured with the selected physically plausible|Human anatomy is physically plausible/iu
  ];
  for(const pattern of removable){
    for(let index=parts.length-1;index>=0&&words(parts.join(" "))>max;index--){
      if(pattern.test(parts[index])&&!protectedPart(parts[index])) parts.splice(index,1);
    }
  }
  if(words(parts.join(" "))>max) parts=compactHardCore(parts);
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
  if(section==="car"){
    if(/(?:standing|leaning)\s+(?:beside|against)\s+the\s+(?:closed|open)\s+driver\s+door|front grille|rear tailgate|tire contact shadow/iu.test(prompt)) issues.push("car-exterior-leak");
    if(/In the frame, the driver's door and side window appear/iu.test(prompt)) issues.push("frame-side-mirroring-ambiguity");
    if(!/^ChatGPT Images:/iu.test(prompt)) issues.push("chatgpt-target-missing");
    if(!/Car-interior lock:.*parked stationary LHD cabin/iu.test(prompt)) issues.push("car-geometry-lock-missing");
    if(!/driver door and side window remain on his left/iu.test(prompt)||!/center console remains on his right/iu.test(prompt)||!/steering wheel stays directly ahead/iu.test(prompt)) issues.push("car-lhd-mapping-missing");
    if(!/Cabin fidelity:.*2017 Range Rover Sport Autobiography Dynamic L494/iu.test(prompt)) issues.push("car-cabin-fidelity-missing");
    if(!/Capture physics:.*vehicle remains parked/iu.test(prompt)) issues.push("car-capture-physics-missing");
    if(!/Pose:.*driver|driver (?:close|low|seat)|roof-context|seated naturally in the driver seat/iu.test(prompt)) issues.push("car-driver-pose-missing");
  }
  if(section==="carExterior"&&/stationary driver's seat|center console right|steering wheel.*chest/iu.test(prompt)) issues.push("car-interior-leak");
  if(section==="gym"&&/bedside lamp|bedroom curtains|driver seat/iu.test(prompt)) issues.push("gym-context-leak");
  if(section==="bedroom"&&/gym rack|driver seat|front grille/iu.test(prompt)) issues.push("bedroom-context-leak");
  if(section==="custom"){
    if(!/^ChatGPT Images:/iu.test(prompt)) issues.push("chatgpt-target-missing");
    if(text(raw.customScene)&&!normalize(prompt).includes(normalize(raw.customScene))) issues.push("custom-scene-lost");
    if(text(raw.customSceneDetails)&&!normalize(prompt).includes(normalize(raw.customSceneDetails))) issues.push("custom-scene-details-lost");
  }
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
  const custom=contract.section==="custom";
  const car=contract.section==="car";
  const evidenceForGenericInjection=custom
    ? contract.fieldEvidence.filter(item=>!/^Custom scene(?: details)?:/iu.test(item))
    : contract.fieldEvidence;
  const missing=missingFieldEvidence(base.prompt,evidenceForGenericInjection);
  let prompt=insertControlEvidence(base.prompt,missing);
  prompt=ensureMirrorRule(prompt,contract.section);
  const customAuthority=applyCustomSceneAuthority(prompt,normalized);
  prompt=customAuthority.prompt;
  const carAuthority=applyCarInteriorAuthority(prompt,normalized);
  prompt=carAuthority.prompt;
  prompt=compactWithinBudget(prompt,base,[...missing,...customAuthority.protectedEvidence,...carAuthority.protectedEvidence]);
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
      promptTarget:(custom||car)?"chatgpt-images":"canonical-v3",
      customSceneAuthority:custom,
      carInteriorAuthority:car,
      physicalRealismEnforced:car,
      determinism:"10/10"
    }),
    prompt
  });
}

export { buildWikiPromptSectionContract, normalizePhase54Aliases } from "./wikiprompt-realistic-selfie-phase54.js";

if(typeof document!=="undefined") void import("../phase54-section-field-ui.js");

export default buildCanonicalV3UserOutput;
