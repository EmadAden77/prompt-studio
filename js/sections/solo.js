import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"solo",
  label:"🤳 السيلفي الفردي",
  description:"شخص واحد، وضعيات وزوايا وملابس وإضاءة خاصة بالسيلفي الفردي",
  captureType:"direct_front_camera_selfie",
  scenes:["street","bedroom","gym","majlis","kashta","barbershop","grocery","rooftop","streetFootball","gasStation"],
  clothingSource:"authority",
  poses:["selfie","standing","seated","walking"],
  lighting:["personal","scene"],
  realismLayers:["micro","imperfections"],
  rules:{
    hard:["exactly one person","selfie capture"],
    composition:["selfie poses and angles"],
    interaction:[],
    exclusions:[],
    routing:{ intentType:"selfie", sceneMode:"fallback", defaultScene:"street" },
    wiring:{ enabled:true, clothing:true, lighting:true, pose:true, expression:true, body:true, selfieArmLock:true },
    selfieGeometry:{ angles:["eye","high","low","three-quarter"], poses:["standing-relaxed","walking","seated-relaxed"] },
    ui:{ scenarioMode:"custom", scene:"custom", groupMode:"single", captureMode:"normal", customFallback:"an ordinary everyday location used only as minimal supporting context", showScenePicker:true }
  }
});

export default SECTION;
