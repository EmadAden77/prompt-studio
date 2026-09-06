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

function compactContractSentence(view){
  if(view==="front-quarter") return "Vehicle fidelity: preserve real L494 front-quarter proportions, grille, headlights, wheel shape and stance; avoid generic-SUV distortion.";
  if(view==="rear-quarter") return "Vehicle fidelity: preserve real L494 rear-quarter proportions, tailgate, rear lamps, wheel shape and stance; avoid generic-SUV distortion.";
  if(view==="door-open") return "Vehicle fidelity: preserve real L494 side and door geometry, wheel shape and cabin alignment; avoid generic-SUV distortion.";
  return "Vehicle fidelity: preserve real L494 side proportions, roofline, window geometry, wheel shape and stance; avoid generic-SUV distortion.";
}

function protectedPart(part,protectedTexts=[]){
  return protectedTexts.some(value=>value&&part.includes(value))
    || /^(?:A candid direct selfie|A candid group selfie|An accidental front-camera capture)/iu.test(part)
    || /One arm extends toward the camera|Identity strictly preserved|Tall 195 cm, 88 kg|2017 Range Rover Sport Autobiography Dynamic|^Vehicle fidelity:|^Subject wearing|closed-mouth expression|^He naturally|^He stands naturally|^He sits naturally|^In a marked|^Beside a Saudi|^At the curb|^On a sandy|^At an ordinary roadside|^The capture is|Night physics:|Raised phone ISO|Exposure keeps|Direct phone flash/iu.test(part);
}

function trimLowValue(prompt,protectedTexts=[]){
  const hardMax=280;
  let parts=sentences(prompt);
  const lowValue=/Fine skin pores|Authentic skin texture|Natural hair flyaways|Tires have realistic contact shadow|Natural sensor noise|Slight lens softness|Natural fabric wrinkles|Localized highlights|Background .*same|background people|Street life|parking area|gym has/iu;
  for(let i=parts.length-1;i>=0&&words(parts.join(" "))>hardMax;i--){
    if(!protectedPart(parts[i],protectedTexts)&&lowValue.test(parts[i])) parts.splice(i,1);
  }
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
  let contractSentence=contract.sentence;
  let prompt=trimLowValue(insertAfterVehicle(base.prompt,contractSentence),[...protectedSelections,contractSentence]);
  let compactFallback=false;

  if(words(prompt)>280){
    contractSentence=compactContractSentence(contract.view);
    prompt=trimLowValue(insertAfterVehicle(base.prompt,contractSentence),[...protectedSelections,contractSentence]);
    compactFallback=true;
  }

  let deferred=false;
  if(words(prompt)>280){
    prompt=base.prompt;
    deferred=true;
  }

  for(const required of protectedSelections) if(!prompt.includes(required)) throw new Error(`Phase 52.1 protected selection lost: ${required}`);
  if(words(prompt)>280) throw new Error(`Phase 52.1 final budget overflow: ${words(prompt)} words (max 280)`);

  return Object.freeze({
    ...base,
    phase52_1:Object.freeze({
      active:true,
      vehicleFidelity:!deferred,
      deferred,
      compactFallback,
      view:contract.view,
      pose:contract.pose,
      contract:deferred?"":contractSentence,
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
