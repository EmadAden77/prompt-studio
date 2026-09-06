import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"custom",
  label:"✍️ مشهد مخصص",
  description:"قسم مستقل لمكان يكتبه المستخدم",
  captureType:"direct_front_camera_selfie",
  scenes:["custom"],
  clothingSource:"custom",
  poses:["free"],
  lighting:["contextual"],
  realismLayers:["micro"],
  rules:{
    hard:["preserve user-written place"],
    composition:["free composition"],
    interaction:[],
    exclusions:[],
    routing:{ intentType:"selfie", sceneMode:"preserve-custom", defaultScene:"custom" },
    wiring:{ enabled:true, clothing:true, lighting:true, pose:true, expression:true, body:true, selfieArmLock:true },
    selfieGeometry:{ angles:["eye","high","low","three-quarter"], poses:["standing-relaxed","walking"] },
    ui:{ scenarioMode:"custom", scene:"custom", groupMode:"single", captureMode:"normal", customFallback:"an ordinary physically plausible user-defined location", showScenePicker:false }
  }
});

export default SECTION;
