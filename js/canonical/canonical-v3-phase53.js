import { buildCanonicalV3UserOutput as buildPhase52_1CanonicalV3UserOutput } from "./canonical-v3-phase52-1.js";

const text=v=>String(v??"").trim();
const words=v=>text(v).split(/\s+/u).filter(Boolean).length;
const sentences=v=>String(v||"").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map(s=>s.replace(/\s+/gu," ").trim()).filter(Boolean)||[];

const VIEW_RULES=Object.freeze({
  side:Object.freeze({
    features:Object.freeze(["roofline","window line","door geometry","side vent","wheel arch","circular wheel"]),
    sentence:"Vehicle fidelity: keep real L494 roofline, window line, door/vent placement, wheel arches and circular wheels readable in selfie perspective; show these model cues, never a generic SUV."
  }),
  "front-quarter":Object.freeze({
    features:Object.freeze(["grille","headlights","hood-fender geometry","front wheel arch","circular wheel"]),
    sentence:"Vehicle fidelity: keep real L494 grille/headlight, hood-fender, front wheel-arch and circular wheel proportions readable in selfie perspective; show these model cues, never a generic SUV."
  }),
  "rear-quarter":Object.freeze({
    features:Object.freeze(["tailgate","rear lamps","rear quarter mass","rear wheel arch","circular wheel"]),
    sentence:"Vehicle fidelity: keep real L494 tailgate/lamp, rear body-mass, rear wheel-arch and circular wheel proportions readable in selfie perspective; show these model cues, never a generic SUV."
  }),
  "door-open":Object.freeze({
    features:Object.freeze(["roofline","window line","door geometry","Ivory cabin alignment","wheel arch"]),
    sentence:"Vehicle fidelity: keep real L494 roofline, window/door geometry, wheel arch and Ivory-cabin alignment readable with the door open; preserve these model cues, never a generic SUV."
  })
});

function replaceVehicleFidelity(prompt,replacement){
  const parts=sentences(prompt);
  const index=parts.findIndex(part=>/^Vehicle fidelity:/iu.test(part));
  if(index>=0) parts[index]=replacement;
  else {
    const vehicle=parts.findIndex(part=>/2017 Range Rover Sport Autobiography Dynamic L494/iu.test(part));
    parts.splice(vehicle>=0?vehicle+1:0,0,replacement);
  }
  return parts.join(" ").trim();
}

function compactCarExterior(prompt,protectedTexts=[]){
  const hardMax=280;
  const target=265;
  let parts=sentences(prompt);
  const protectedPart=part=>protectedTexts.some(v=>v&&part.includes(v))
    || /A candid direct selfie|One arm extends toward the camera|Identity strictly preserved|Tall 195 cm, 88 kg|2017 Range Rover Sport Autobiography Dynamic L494|^Vehicle fidelity:|^Subject wearing|closed-mouth expression|^He naturally|^In a marked|^Beside a Saudi|^At the curb|^On a sandy|^At an ordinary roadside|^The capture is|Night physics:|Raised phone ISO|Exposure keeps/iu.test(part);
  const removable=/Fine skin pores|Authentic skin texture|Natural hair flyaways|Tires have realistic contact shadow|Natural sensor noise|Slight lens softness|Natural fabric wrinkles|Localized highlights|Background .*same|background people|Street life|parking area/iu;
  for(let i=parts.length-1;i>=0&&words(parts.join(" "))>target;i--){
    if(!protectedPart(parts[i])&&removable.test(parts[i])) parts.splice(i,1);
  }
  const out=parts.join(" ").trim();
  if(words(out)>hardMax) throw new Error(`Phase 53 carExterior budget overflow: ${words(out)} words (max ${hardMax})`);
  return out;
}

export function reviewCarExteriorPrompt(rawInput={},base={},prompt=""){
  const active=(base?.section?.id||rawInput.studioSection||rawInput.scene)==="carExterior";
  if(!active) return Object.freeze({active:false,status:"not-applicable",issues:Object.freeze([]),determinism:"10/10"});
  const view=base?.phase52_1?.view||"side";
  const rule=VIEW_RULES[view]||VIEW_RULES.side;
  const issues=[];
  if(!/2017 Range Rover Sport Autobiography Dynamic L494/iu.test(prompt)) issues.push("vehicle-identity");
  if(!/never a generic SUV/iu.test(prompt)) issues.push("generic-suv-rejection");
  if(!/^Vehicle fidelity:/imu.test(prompt)) issues.push("vehicle-fidelity-block");
  if(words(prompt)>280) issues.push("budget");
  for(const entry of Object.values(base?.phase50?.selectionManifest||{})){
    const required=text(entry?.resolved||entry?.requested);
    if(required&&!prompt.includes(required)) issues.push(`selection:${entry?.id||required}`);
  }
  return Object.freeze({
    active:true,
    status:issues.length?"fail":"pass",
    view,
    minimumVisibleCues:rule.features,
    issues:Object.freeze(issues),
    determinism:"10/10"
  });
}

export function buildCanonicalV3UserOutput(rawInput={},sceneData=undefined){
  const base=buildPhase52_1CanonicalV3UserOutput(rawInput,sceneData);
  const active=(base?.section?.id||rawInput.studioSection||rawInput.scene)==="carExterior";
  if(!active){
    return Object.freeze({...base,phase53:Object.freeze({active:false,status:"not-applicable",determinism:"10/10"}),prompt:base.prompt});
  }

  const view=base?.phase52_1?.view||"side";
  const rule=VIEW_RULES[view]||VIEW_RULES.side;
  const protectedSelections=Object.values(base?.phase50?.selectionManifest||{}).map(v=>text(v?.resolved||v?.requested)).filter(Boolean);
  let prompt=replaceVehicleFidelity(base.prompt,rule.sentence);
  prompt=compactCarExterior(prompt,[...protectedSelections,rule.sentence]);
  const review=reviewCarExteriorPrompt(rawInput,base,prompt);
  if(review.status!=="pass") throw new Error(`Phase 53 reviewer failed: ${review.issues.join(", ")}`);

  return Object.freeze({
    ...base,
    prompt,
    phase53:Object.freeze({
      active:true,
      status:"pass",
      view,
      visibilityGate:true,
      minimumVisibleCues:rule.features,
      reviewer:review,
      wordsBefore:words(base.prompt),
      wordsAfter:words(prompt),
      hardMax:280,
      determinism:"10/10"
    })
  });
}

export default buildCanonicalV3UserOutput;
