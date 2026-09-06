import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"car",
  label:"🚙 التصوير داخل السيارة",
  description:"مقاعد السيارة والمقصورة ووضعيات وإضاءة السيارة فقط",
  captureType:"subject_held_driver_selfie",
  scenes:["rangeRover"],
  clothingSource:"authority",
  poses:["driver-seat","driver-close","driver-low","roof-context"],
  lighting:["car"],
  realismLayers:["cabin-material","glass"],
  rules:{
    hard:["interior only","LHD cabin","seat and cabin geometry"],
    composition:["driver-seat selfie"],
    interaction:[],
    exclusions:["exterior scene"],
    routing:{ intentType:"car", sceneMode:"fixed", defaultScene:"rangeRover" },
    wiring:{ enabled:true, clothing:true, lighting:true, pose:true, expression:true, body:true, selfieArmLock:true },
    ui:{ scenarioMode:"car", scene:"rangeRover", groupMode:"single", captureMode:"normal", showScenePicker:false }
  }
});

export default SECTION;
