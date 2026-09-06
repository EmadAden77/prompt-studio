import { buildCanonicalV3UserOutput as buildPhase52CanonicalV3UserOutput } from "./canonical-v3-phase52.js";
import { buildVehicleFidelityContract } from "./vehicle-fidelity-phase52-1.js";

const text=v=>String(v??"").trim();
const words=v=>text(v).split(/\s+/u).filter(Boolean).length;
const sentences=v=>String(v||"").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map(s=>s.replace(/\s+/gu," ").trim()).filter(Boolean)||[];

function insertAfterVehicle(prompt,sentence){
  const parts=sentences(prompt);
  const index=parts.findIndex(part=>/2017 Range Rover Sport Autobiography Dynamic L494/iu.test(part));
  if(index<0) return `${sentence} ${prompt}`.trim();
  parts.splice(index+1,0,sentence);
  return parts.join(" ").trim();
}

function trimToCarExteriorBudget(prompt,protectedTexts=[]){
  const hardMax=280;
  let parts=sentences(prompt);
  const protectedPart=part=>protectedTexts.some(value=>value&&part.includes(value))
    || /^(?:A candid direct selfie|A candid group selfie|An accidental front-camera capture)/iu.test(part)
    || /One arm extends toward the camera|Identity strictly preserved|Tall 195 cm, 88 kg|2017 Range Rover Sport Autobiography Dynamic|^Vehicle fidelity:|^Subject wearing|closed-mouth expression|^He naturally|^He stands naturally|^He sits naturally|^In a marked|^Beside a Saudi|^At the curb|^On a sandy|^At an ordinary roadside|^The capture is|Night physics:|Raised phone ISO|Exposure keeps|Direct phone flash/iu.test(part);
  const lowValue=/Fine skin pores|Authentic skin texture|Natural hair flyaways|Tires have realistic contact shadow|Natural sensor noise|Slight lens softness|Natural fabric wrinkles|Localized highlights|Background .*same|background people|Street life|parking area|gym has/iu;

  for(let i=parts.length-1;i>=0&&words(parts.join(" "))>hardMax;i--){
    if(!protectedPart(parts[i])&&lowValue.test(parts[i])) parts.splice(i,1);
  }
  if(words(parts.join(" "))>hardMax) throw new Error(`Phase 52.1 vehicle fidelity budget overflow: ${words(parts.join(" "))} words (max ${hardMax})`);
  return parts.join(" ").trim();
}

export function buildCanonicalV3UserOutput(rawInput={},sceneData=undefined){
  const base=buildPhase52CanonicalV3UserOutput(rawInput,sceneData);
  const contract=buildVehicleFidelityContract(rawInput,base);
  if(!contract.active){
    return Object.freeze({
      ...base,
      phase52_1:Object.freeze({active:false,vehicleFidelity:false,determinism:"10/10"}),
      prompt:base.prompt
    });
  }

  const protectedSelections=Object.values(base?.phase50?.selectionManifest||{}).map(v=>text(v?.resolved||v?.requested)).filter(Boolean);
  const injected=insertAfterVehicle(base.prompt,contract.sentence);
  const prompt=trimToCarExteriorBudget(injected,[...protectedSelections,contract.sentence]);
  if(!prompt.includes(contract.sentence)) throw new Error("Phase 52.1 vehicle fidelity contract was lost");
  for(const required of protectedSelections) if(!prompt.includes(required)) throw new Error(`Phase 52.1 protected selection lost: ${required}`);

  return Object.freeze({
    ...base,
    phase52_1:Object.freeze({
      active:true,
      vehicleFidelity:true,
      view:contract.view,
      pose:contract.pose,
      contract:contract.sentence,
      perspectiveRule:contract.perspectiveRule,
      wordsBefore:words(base.prompt),
      wordsAfter:words(prompt),
      hardMax:280,
      determinism:"10/10"
    }),
    prompt
  });
}

export { buildVehicleFidelityContract } from "./vehicle-fidelity-phase52-1.js";
export default buildCanonicalV3UserOutput;
