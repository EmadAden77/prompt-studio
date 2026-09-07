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

function preservePhase53Surface(prompt=""){
  return String(prompt)
    .replace("Pose: driver-close-armless eye-level; headrest, B-pillar, window edge, wheel top arc.","Pose: driver-close-armless at eye level; driver headrest, B-pillar, window edge, steering-wheel top arc at bottom.")
    .replace("Pose: driver-low-armless slightly below eye level; headliner, sun visor, panoramic roof.","Pose: driver-low-armless slightly below eye level; Ivory headliner, sun visor, transparent panoramic roof above.")
    .replace("Pose: driver-side-armless three-quarter; door wood trim and one window edge.","Pose: driver-side-armless three-quarter; dark-wood door trim and one side-window edge visible.")
    .replace("Pose: driver-roof-armless roof tilt; panoramic glass shows only physically visible sky/stars.","Pose: driver-roof-armless with gentle roof tilt; transparent panoramic glass shows only real sky/stars physically visible through it.")
    .replace("Pose: passenger-close-armless eye-level; center-console side visible; steering wheel excluded.","Pose: passenger-close-armless at eye level from the front passenger seat; center-console side visible; no steering wheel in frame.")
    .replace("Pose: rear-seat-armless eye-level; front headrests softly blurred foreground.","Pose: rear-seat-armless at eye level; two front headrests softly blurred in the near foreground.");
}

export function buildCanonicalV3UserOutput(rawInput={},sceneData=undefined){
  const out=buildPhase55CanonicalV3UserOutput(rawInput,sceneData);
  if(!out?.phase53?.active) return out;

  const forbiddenExteriorSpecs=/\s*Interior-only scope: no grille, alloys, DRL, Fuji White exterior specification, exterior camera position, studio light, ring light or staged product view\./iu;
  const prompt=preservePhase53Surface(String(out.prompt||"").replace(
    forbiddenExteriorSpecs,
    " Interior-only scope: keep the capture inside the cabin; no exterior camera position, studio light, ring light or staged product view."
  )).trim();

  return Object.freeze({
    ...out,
    phase55:Object.freeze({...out.phase55,wordCount:words(prompt)}),
    prompt
  });
}

export default buildCanonicalV3UserOutput;