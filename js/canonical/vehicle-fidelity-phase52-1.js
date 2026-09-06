const text=v=>String(v??"").trim();

function resolvePose(rawInput={},base={}){
  const requested=text(rawInput.carExteriorPose);
  if(requested&&requested!=="auto") return requested;
  return text(base?.geometry?.pose)||"door-lean";
}

const FRONT_POSES=new Set(["front-grille","front-fender","hood-sit"]);
const REAR_POSES=new Set(["rear-quarter","rear-tailgate"]);

export function buildVehicleFidelityContract(rawInput={},base={}){
  const section=text(base?.section?.id||rawInput.studioSection||rawInput.scene);
  if(section!=="carExterior") return Object.freeze({active:false,pose:"",view:"none",sentence:""});

  const pose=resolvePose(rawInput,base);
  let view="side";
  let sentence="Vehicle fidelity: keep the L494 side silhouette, roofline, window line, door/vent placement, wheel arches and circular wheels coherent in selfie perspective; never a generic SUV.";

  if(FRONT_POSES.has(pose)){
    view="front-quarter";
    sentence="Vehicle fidelity: keep the L494 front-quarter shape, grille/headlight proportions, hood-fender geometry, wheel arches and circular wheels coherent in selfie perspective; never a generic SUV.";
  } else if(REAR_POSES.has(pose)){
    view="rear-quarter";
    sentence="Vehicle fidelity: keep the L494 rear-quarter shape, tailgate/lamp placement, rear wheel-arch geometry and circular wheels coherent in selfie perspective; never a generic SUV.";
  } else if(pose==="door-open"){
    view="door-open";
    sentence="Vehicle fidelity: keep the L494 side silhouette, roofline, window/door geometry and circular wheels coherent; the open driver door aligns naturally with the Ivory cabin, never a generic SUV.";
  }

  return Object.freeze({
    active:true,
    pose,
    view,
    sentence,
    perspectiveRule:"Preserve coherent selfie perspective without near-side body stretching, roofline skew, wheel warping, or axle misalignment.",
    determinism:"10/10"
  });
}

export default buildVehicleFidelityContract;
