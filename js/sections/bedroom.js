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
    routing:{ intentType:"selfie", sceneMode:"fixed", defaultScene:"bedroom" },
    ui:{ scenarioMode:"bedroom", scene:"bedroom", groupMode:"single", captureMode:"normal", showScenePicker:false }
  }
});

export default SECTION;
