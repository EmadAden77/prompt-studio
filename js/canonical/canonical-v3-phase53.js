import { buildCanonicalV3UserOutput as buildPhase52_1CanonicalV3UserOutput } from "./canonical-v3-phase52-1.js";

const text=v=>String(v??"").trim();
const words=v=>text(v).split(/\s+/u).filter(Boolean).length;

export function reviewCarExteriorPrompt(rawInput={},base={},prompt=""){
  const active=(base?.section?.id||rawInput.studioSection||rawInput.scene)==="carExterior";
  if(!active) return Object.freeze({active:false,status:"not-applicable",issues:Object.freeze([]),determinism:"10/10"});

  const issues=[];
  if(!/2017 Range Rover Sport Autobiography Dynamic L494/iu.test(prompt)) issues.push("vehicle-identity");
  if(!/^.*Vehicle fidelity:/imu.test(prompt)) issues.push("vehicle-fidelity-block");
  if(!/never a generic SUV/iu.test(prompt)) issues.push("generic-suv-rejection");
  if(words(prompt)>280) issues.push("budget");
  for(const entry of Object.values(base?.phase50?.selectionManifest||{})){
    const required=text(entry?.resolved||entry?.requested);
    if(required&&!prompt.includes(required)) issues.push(`selection:${entry?.id||required}`);
  }

  return Object.freeze({
    active:true,
    status:issues.length?"fail":"pass",
    view:base?.phase52_1?.view||"side",
    issues:Object.freeze(issues),
    compatibilityMode:"phase52.1",
    determinism:"10/10"
  });
}

export function buildCanonicalV3UserOutput(rawInput={},sceneData=undefined){
  const base=buildPhase52_1CanonicalV3UserOutput(rawInput,sceneData);
  const active=(base?.section?.id||rawInput.studioSection||rawInput.scene)==="carExterior";

  // Phase 53 visibility rewriting is intentionally rolled back.
  // Keep the live gate import stable while restoring the exact Phase 52.1
  // vehicle prompt behavior that was used before Phase 53.
  return Object.freeze({
    ...base,
    phase53:Object.freeze({
      active,
      status:active?"rolled-back-to-phase52.1":"not-applicable",
      compatibilityMode:"phase52.1",
      promptMutation:false,
      determinism:"10/10"
    }),
    prompt:base.prompt
  });
}

export default buildCanonicalV3UserOutput;
