import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"bedroom",
  label:"🏠 التصوير في غرفة النوم",
  description:"السرير والاستلقاء والأريكة وملابس وإضاءة الغرفة فقط",
  captureType:"direct_front_camera_selfie",
  scenes:["bedroom"],
  clothingSource:"home",
  poses:["bed","sofa","lying","selfie"],
  lighting:["room"],
  realismLayers:["lived-in","imperfections"],
  rules:{
    hard:["bedroom context"],
    composition:["bed sofa or lying pose"],
    interaction:[],
    exclusions:["studio staging"],
    routing:{ intentType:"selfie", sceneMode:"fallback", defaultScene:"bedroom" },
    wiring:{ enabled:true, clothing:true, lighting:true, pose:true, expression:true, body:true, selfieArmLock:true },
    ui:{ scenarioMode:"bedroom", scene:"bedroom", groupMode:"single", captureMode:"normal", showScenePicker:false }
  }
});

export default SECTION;
