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
    .replace("Pose: driver-close-armless at eye level; headrest, B-pillar, window edge and only the steering-wheel top arc at bottom.","Pose: driver-close-armless at eye level; driver headrest, B-pillar, window edge, steering-wheel top arc at bottom.")
    .replace("Pose: driver-low-armless slightly below eye level; headliner, sun visor and panoramic roof dominate upper cabin context.","Pose: driver-low-armless slightly below eye level; Ivory headliner, sun visor, transparent panoramic roof above.")
    .replace("Pose: driver-side-armless three-quarter; door wood trim and one window edge appear, not the whole cabin.","Pose: driver-side-armless three-quarter; dark-wood door trim and one side-window edge visible.")
    .replace("Pose: driver-roof-armless with gentle roof tilt; panoramic glass dominates and shows only physically visible real sky/stars.","Pose: driver-roof-armless with gentle roof tilt; transparent panoramic glass shows only real sky/stars physically visible through it.")
    .replace("Pose: passenger-close-armless at eye level; center-console side visible; steering wheel excluded.","Pose: passenger-close-armless at eye level from the front passenger seat; center-console side visible; no steering wheel in frame.")
    .replace("Pose: rear-seat-armless at eye level; front headrests softly blur in near foreground; steering wheel is not a compositional anchor.","Pose: rear-seat-armless at eye level; two front headrests softly blurred in the near foreground.")
    .replace("Car-only night-flash: phone flash favors face/near shoulder; rear cabin falls darker, short jaw/neck shadows remain, wood gets one small highlight, shadow noise survives.","Car-only night-flash: phone flash plus dim cabin ambient and restrained dash glow; face/near shoulder lead exposure, rear cabin falls darker, short jaw/neck shadows remain, wood gets one small highlight, shadow noise survives.")
    .replace("Car-only night: dim ambient and restrained dash glow; roof stays transparent to plausible night sky/stars, with weak cabin reflection and noisier shadows.","Car-only night: dim cabin ambient plus restrained dash glow; transparent panoramic glass shows a physically plausible real night sky and stars, never opaque black; weak cabin reflection and noisier shadows remain.")
    .replace("Car-only night: dim ambient and restrained dash glow; shadow noise exceeds face noise, dark colors lose slight saturation, distant cabin detail softens naturally.","Car-only night: dim cabin ambient plus restrained dash glow; shadow noise exceeds face noise, dark colors lose slight saturation, distant cabin detail softens naturally.");
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