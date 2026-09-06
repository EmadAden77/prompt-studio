const text=v=>String(v??"").trim();

function resolvePose(rawInput={},base={}){
  const requested=text(rawInput.carExteriorPose);
  if(requested&&requested!=="auto") return requested;
  return text(base?.geometry?.pose)||"door-lean";
}

const SIDE_POSES=new Set(["door-lean"]);
const FRONT_POSES=new Set(["front-grille","front-fender","hood-sit"]);
const REAR_POSES=new Set(["rear-quarter","rear-tailgate"]);

export function buildVehicleFidelityContract(rawInput={},base={}){
  const section=text(base?.section?.id||rawInput.studioSection||rawInput.scene);
  if(section!=="carExterior") return Object.freeze({active:false,pose:"",view:"none",sentence:""});

  const pose=resolvePose(rawInput,base);
  let view="side";
  let sentence="Vehicle fidelity: preserve the recognizable L494 side silhouette, roofline, greenhouse and side-window proportions, door and side-vent placement, circular wheels, aligned axles and believable body mass; it must not read as a generic SUV.";

  if(FRONT_POSES.has(pose)){
    view="front-quarter";
    sentence="Vehicle fidelity: preserve the recognizable L494 front-quarter shape, grille and headlight proportions, hood-to-fender relationship, wheel-arch placement, circular wheels and coherent body mass; it must not read as a generic SUV.";
  } else if(REAR_POSES.has(pose)){
    view="rear-quarter";
    sentence="Vehicle fidelity: preserve the recognizable L494 rear-quarter shape, tailgate and rear-lamp placement, rear wheel-arch geometry, circular wheels, axle alignment and coherent body mass; it must not read as a generic SUV.";
  } else if(pose==="door-open"){
    view="door-open";
    sentence="Vehicle fidelity: preserve the recognizable L494 side silhouette, roofline, window and door geometry, circular wheels and coherent body mass; the open driver door must align naturally with the Ivory cabin, not read as a generic SUV.";
  } else if(!SIDE_POSES.has(pose)){
    view="side";
  }

  return Object.freeze({
    active:true,
    pose,
    view,
    sentence,
    perspectiveRule:"Preserve coherent selfie perspective without stretching the near side of the body, skewing the roofline, or warping visible wheels.",
    determinism:"10/10"
  });
}

export default buildVehicleFidelityContract;
