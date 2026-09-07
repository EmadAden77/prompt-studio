import { buildCanonicalV3UserOutput as buildPhase52_1CanonicalV3UserOutput } from "./canonical-v3-phase52-1.js";
import { MIRROR_RULES_SENTENCE } from "../sections/wikiprompt-phase47-profiles.js";
import { buildWikiPromptSectionContract, normalizePhase54Aliases } from "./wikiprompt-realistic-selfie-phase54.js";
import { buildXiaomi15UltraRealismContract, describeXiaomi15UltraFrontCamera, describeXiaomi15UltraProcessing } from "./xiaomi15-ultra-front-camera-phase57.js";

const text=value=>String(value??"").trim();
const words=value=>text(value).split(/\s+/u).filter(Boolean).length;
const sentences=value=>String(value||"").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map(part=>part.replace(/\s+/gu," ").trim()).filter(Boolean)||[];
const normalize=value=>text(value).toLowerCase().replace(/[\s._-]+/gu," ");
const CHATGPT_CUSTOM_DIRECTIVE="ChatGPT Images: create exactly one candid, physically plausible smartphone selfie; use the reference for identity only and preserve explicit selections.";
const CHATGPT_CAR_DIRECTIVE="ChatGPT Images: create one physically plausible front-camera selfie inside this parked vehicle; preserve reference identity and explicit selections.";
const CAR_INTERIOR_GEOMETRY_LOCK="Car-interior lock: parked LHD, driver seat only; door/window physically left, console right, steering wheel ahead of torso; never mirror or swap cabin geometry.";
const CAR_INTERIOR_FIDELITY_LOCK="Cabin fidelity: 2017 Range Rover Sport Autobiography Dynamic L494; Ivory perforated leather, dark wood, black-and-Ivory wheel, transparent panoramic roof and Ivory headliner; show only angle-visible details with natural reflections.";
const CAR_CAPTURE_PHYSICS_LOCK="Capture physics: reachable one-arm phone hold; other hand free; no driving, passenger-seat relocation, exterior pose, studio/ring light, impossible or simultaneous conflicting actions.";
const CAR_BODY_SCALE_LOCK="Tall 195 cm, 88 kg lean-athletic build; cabin scale remains believable for his stature.";
const CUSTOM_NIGHT_PHYSICS_LOCK="Night capture: selected practical light stays physically dominant; mild phone grain and shadow noise remain visible; exposure stays clearly nocturnal.";

function requiredSelectionTexts(base){
  return Object.values(base?.phase50?.selectionManifest||{}).map(entry=>text(entry?.resolved||entry?.requested)).filter(Boolean);
}

function evidenceValue(evidence=""){
  const index=evidence.indexOf(":");
  return index>=0?text(evidence.slice(index+1)):text(evidence);
}

const EVIDENCE_LABELS=Object.freeze({
  "Hair styling":"hair","Skin state":"skin","Fabric":"fabric","Fabric weight":"weight","Iron state":"iron","Wear state":"wear","Clothing fit":"fit",
  "Composition":"frame","Selfie angle":"angle","Bedroom window":"window","Place state":"place","People density":"people","Subject moment":"moment",
  "Hand interaction":"hand","Scene profile":"profile","Accessory":"accessory","Accessory detail":"accessory","Object profile":"object","Background density":"background",
  "Context note":"context","Group type":"group","Group vibe":"vibe","Street mood":"street","Street hour":"hour","Post-processing":"post",
  "City":"city","Identity note":"identity","Custom clothing":"clothing"
});

function compactEvidenceItem(item=""){
  const index=item.indexOf(":");
  if(index<0) return text(item);
  const label=text(item.slice(0,index));
  const value=text(item.slice(index+1));
  return `${EVIDENCE_LABELS[label]||label.toLowerCase().replace(/\s+/gu,"-")}=${value}`;
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
  const compact=evidence.map(compactEvidenceItem);
  const sentence=`Selected controls: ${compact.join("; ")}.`;
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
  parts=parts.filter(part=>!/^Night physics:|^Raised phone ISO|^Low-light phone exposure|^Exposure keeps|^Night processing|^Shadow integrity/iu.test(part));
  if(scene){
    parts=parts.map(part=>part.replace(/an ordinary physically plausible user-defined location/giu,scene));
    parts=parts.filter(part=>!/^(?:Scene|Location):\s*an ordinary physically plausible user-defined location\.?$/iu.test(part));
  }
  const sceneSentence=scene?`The scene is exactly: ${scene}.`:"";
  const detailSentence=details?`Required visible scene details: ${details}.`:"";
  if(scene&&!normalize(parts.join(" ")).includes(normalize(scene))) parts.splice(Math.min(4,parts.length),0,sceneSentence);
  if(details&&!normalize(parts.join(" ")).includes(normalize(details))) parts.splice(Math.min(5,parts.length),0,detailSentence);
  const nightLock=text(raw.time)==="night"?CUSTOM_NIGHT_PHYSICS_LOCK:"";
  if(nightLock&&!parts.some(part=>part===nightLock)) parts.push(nightLock);
  parts.unshift(CHATGPT_CUSTOM_DIRECTIVE);
  return Object.freeze({
    prompt:parts.join(" ").trim(),
    protectedEvidence:Object.freeze([CHATGPT_CUSTOM_DIRECTIVE,sceneSentence,detailSentence,nightLock].filter(Boolean))
  });
}

function isCarLegacyRedundancy(part){
  return /^(?:Tall 195 cm, 88 kg lean-athletic build:|No facial alteration\/lengthening|Shoulders fill seatback|Camera near eye level at 45–60 cm|Phone held at physically reachable selfie distance|Inside stationary 2017 Range Rover Sport Autobiography Dynamic L494|Xiaomi 15 Ultra front camera:|Captured with the selected physically plausible front-camera geometry|LHD vehicle-relative:|In the frame, the driver's door and side window appear|Natural wear appears on frequently touched surfaces|The panoramic glass roof is transparent|Natural sensor noise is visible|Slight lens softness is visible|Realistic dynamic range|Human anatomy is physically plausible|Fine skin pores|Fine skin texture|Authentic skin texture|Natural hair flyaways|Localized highlights|Night physics:|Raised phone ISO|Low-light phone exposure|Natural movement|Shadow integrity|Exposure keeps|Night processing|Flash mode)/iu.test(part);
}

function compactCarLighting(raw){
  return text(raw.time)==="day"
    ? "Lighting: selected real daylight/practical source, consistent cabin shadows and ordinary phone exposure."
    : "Lighting: car interior light is the dominant night source with a source-matched cast; raised ISO adds subtle grain and shadow noise; exposure keeps a natural face/background tradeoff and remains clearly nocturnal.";
}

function applyCarInteriorAuthority(prompt,raw){
  if(text(raw.studioSection)!=="car") return Object.freeze({prompt,protectedEvidence:Object.freeze([])});
  let parts=sentences(prompt).filter(part=>!/^ChatGPT Images:/iu.test(part));
  parts=parts.filter(part=>{
    if(isCarLegacyRedundancy(part)) return false;
    if(/^Lighting follows the selected real-world/iu.test(part)) return false;
    if(/^Pose:\s*.*(?:standing|walking|lying|bed|sofa|gym|outside)/iu.test(part)) return false;
    if(/(?:standing|leaning)\s+(?:beside|against)\s+the\s+(?:closed|open)\s+driver\s+door|front grille|rear tailgate|tire contact shadow/iu.test(part)) return false;
    return true;
  });
  const hasDriverPose=parts.some(part=>/Pose:\s*.*driver|driver (?:close|low|seat)|roof-context|seated.*driver/iu.test(part));
  const clothingIndex=parts.findIndex(part=>/^Subject wearing\b/iu.test(part));
  const insertAt=clothingIndex>=0?clothingIndex+1:Math.min(4,parts.length);
  const lightingLock=compactCarLighting(raw);
  const locks=[CAR_BODY_SCALE_LOCK,CAR_INTERIOR_GEOMETRY_LOCK,CAR_INTERIOR_FIDELITY_LOCK,CAR_CAPTURE_PHYSICS_LOCK,lightingLock];
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

function carSelectionSatisfied(requiredText,out){
  if(out.includes(requiredText)) return true;
  if(/^Inside stationary 2017 Range Rover Sport Autobiography Dynamic L494/iu.test(requiredText)) {
    return /Cabin fidelity:.*2017 Range Rover Sport Autobiography Dynamic L494/iu.test(out)
      && /Ivory perforated leather/iu.test(out)
      && /dark wood/iu.test(out)
      && /panoramic roof/iu.test(out);
  }
  if(/^Tall 195 cm, 88 kg lean-athletic build/iu.test(requiredText)) return /195\s*cm/iu.test(out)&&/88\s*kg/iu.test(out)&&/lean[- ]athletic/iu.test(out);
  if(/^(?:Pose:\s*)?(?:standing beside|leaning against|standing outside|front grille|rear tailgate)/iu.test(requiredText)) return /Pose: seated naturally in the driver seat|driver (?:close|low|seat)|roof-context/iu.test(out);
  if(/^Lighting follows the selected real-world/iu.test(requiredText)) return /Lighting: selected real daylight\/practical source|Lighting: car interior light is the dominant night source/iu.test(out);
  if(/^Night physics: the dominant visible source is the car interior light/iu.test(requiredText)) return /car interior light is the dominant night source.*source-matched cast/iu.test(out);
  if(/^Raised phone ISO introduces/iu.test(requiredText)) return /raised ISO adds subtle grain and shadow noise/iu.test(out);
  if(/^Exposure keeps/iu.test(requiredText)) return /exposure keeps a natural face\/background tradeoff.*clearly nocturnal/iu.test(out);
  return false;
}

function customSelectionSatisfied(requiredText,out){
  if(out.includes(requiredText)) return true;
  if(/^Night physics:/iu.test(requiredText)) return /Night capture: selected practical light stays physically dominant/iu.test(out);
  if(/^Raised phone ISO|^Low-light phone exposure/iu.test(requiredText)) return /mild phone grain and shadow noise remain visible/iu.test(out);
  if(/^Exposure keeps|^Night processing/iu.test(requiredText)) return /exposure stays clearly nocturnal/iu.test(out);
  return false;
}

function selectionSatisfied(requiredText,out,sectionId){
  if(out.includes(requiredText)) return true;
  if(sectionId==="car"||/Car-interior lock:/iu.test(out)) return carSelectionSatisfied(requiredText,out);
  if(sectionId==="custom"||/^ChatGPT Images:.*smartphone selfie/iu.test(out)) return customSelectionSatisfied(requiredText,out);
  return false;
}

function compactWithinBudget(prompt,base,protectedEvidence=[],sectionIdOverride=""){
  const sectionId=sectionIdOverride||base?.section?.id||"";
  const max=sectionId==="carExterior"?280:250;
  let parts=sentences(prompt);
  const required=requiredSelectionTexts(base);
  const protectedPart=part=>
    required.some(value=>value&&part.includes(value))
    || protectedEvidence.some(value=>value&&part.includes(value))
    || /ChatGPT Images:|Car-interior lock:|Cabin fidelity:|Capture physics:|A candid direct selfie|A candid group selfie|An accidental front-camera capture|One arm extends toward the camera|Identity strictly preserved|Tall 195 cm, 88 kg|2017 Range Rover Sport Autobiography Dynamic L494|^Vehicle fidelity:|mirror_rules:|^Selected controls:|^Use these selected details exactly:|Night physics:|Raised phone ISO|Exposure keeps|Direct phone flash/iu.test(part);
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
  if(sectionId==="car"&&words(parts.join(" "))>max) parts=compactHardCore(parts);
  for(let index=parts.length-1;index>=0&&words(parts.join(" "))>max;index--){
    if(!protectedPart(parts[index])) parts.splice(index,1);
  }
  const out=parts.join(" ").trim();
  if(words(out)>max) throw new Error(`Phase 54 field/WikiPrompt budget overflow [${sectionId||"unknown"}]: ${words(out)} words (max ${max})`);
  for(const requiredText of required) if(!selectionSatisfied(requiredText,out,sectionId)) throw new Error(`Phase 54 protected selection lost [${sectionId||"unknown"}]: ${requiredText}`);
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
    if(!/Car-interior lock:.*parked LHD/iu.test(prompt)) issues.push("car-geometry-lock-missing");
    if(!/door\/window physically left/iu.test(prompt)||!/console right/iu.test(prompt)||!/steering wheel ahead/iu.test(prompt)) issues.push("car-lhd-mapping-missing");
    if(!/Cabin fidelity:.*2017 Range Rover Sport Autobiography Dynamic L494/iu.test(prompt)) issues.push("car-cabin-fidelity-missing");
    if(!/Capture physics:.*no driving/iu.test(prompt)) issues.push("car-capture-physics-missing");
    if(!/Pose:.*driver|driver (?:close|low|seat)|roof-context|seated naturally in the driver seat/iu.test(prompt)) issues.push("car-driver-pose-missing");
    if(!/Lighting: selected real daylight\/practical source|Lighting: car interior light is the dominant night source/iu.test(prompt)) issues.push("car-lighting-physics-missing");
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
  const xiaomiCamera=describeXiaomi15UltraFrontCamera(normalized);
  const xiaomiProcessing=describeXiaomi15UltraProcessing(normalized);
  if(xiaomiCamera) prompt=`${prompt} ${xiaomiCamera} ${xiaomiProcessing}`.replace(/\\s{2,}/gu," ").trim();
  const customAuthority=applyCustomSceneAuthority(prompt,normalized);
  prompt=customAuthority.prompt;
  const carAuthority=applyCarInteriorAuthority(prompt,normalized);
  prompt=carAuthority.prompt;
  prompt=compactWithinBudget(prompt,base,[...customAuthority.protectedEvidence,...carAuthority.protectedEvidence],contract.section);
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
      semanticSelectionSupersession:car||custom,
      xiaomi15Ultra:buildXiaomi15UltraRealismContract(normalized),
      determinism:"10/10"
    }),
    prompt
  });
}

export { buildWikiPromptSectionContract, normalizePhase54Aliases } from "./wikiprompt-realistic-selfie-phase54.js";

if(typeof document!=="undefined") void import("../phase54-section-field-ui.js");

export default buildCanonicalV3UserOutput;
