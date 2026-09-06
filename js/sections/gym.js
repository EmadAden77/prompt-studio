import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"gym",
  label:"🏋️ التصوير في الجيم",
  description:"وضعيات وملابس وإضاءة الجيم فقط",
  captureType:"direct_front_camera_selfie",
  scenes:["gym"],
  clothingSource:"gym",
  poses:["gym-selfie","post-workout"],
  lighting:["gym"],
  realismLayers:["gym","micro"],
  rules:{
    hard:["gym context"],
    composition:["fitness-appropriate pose"],
    interaction:[],
    exclusions:["luxury accessories"],
    routing:{ intentType:"selfie", sceneMode:"fallback", defaultScene:"gym" },
    wiring:{ enabled:true, clothing:true, lighting:true, pose:true, expression:true, body:true, selfieArmLock:true },
    selfieGeometry:{ angles:["eye","high","low","three-quarter"], poses:["standing-relaxed","seated-rest-elbows"] },
    ui:{ scenarioMode:"gym", scene:"gym", groupMode:"single", captureMode:"normal", showScenePicker:false }
  }
});

export default SECTION;
