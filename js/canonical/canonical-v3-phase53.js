import {
  buildCanonicalV3UserOutput as buildPhase55CanonicalV3UserOutput,
  ARMLESS_LOCK,
  ARMLESS_FRAMING,
  ARMLESS_OPTICS,
  ARMLESS_LHD_ANCHORS
} from "./canonical-v3-phase55.js";

export { ARMLESS_LOCK, ARMLESS_FRAMING, ARMLESS_OPTICS, ARMLESS_LHD_ANCHORS };

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
  const out=buildPhase55CanonicalV3UserOutput(rawInput,sceneData);
  if(!out?.phase53?.active) return out;

  const forbiddenExteriorSpecs=/\s*Interior-only scope: no grille, alloys, DRL, Fuji White exterior specification, exterior camera position, studio light, ring light or staged product view\./iu;
  const prompt=String(out.prompt||"").replace(
    forbiddenExteriorSpecs,
    " Interior-only scope: keep the capture inside the cabin; no exterior camera position, studio light, ring light or staged product view."
  ).trim();

  return Object.freeze({
    ...out,
    phase55:Object.freeze({...out.phase55,wordCount:words(prompt)}),
    prompt
  });
}

export default buildCanonicalV3UserOutput;
