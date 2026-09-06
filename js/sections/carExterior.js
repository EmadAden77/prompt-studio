import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"carExterior",
  label:"🚘 سيلفي بجانب السيارة",
  description:"بجانب الرنج روفر 2017: مواقع الوقوف والوضعيات والإضاءة",
  captureType:"direct_front_camera_selfie",
  scenes:["carExterior"],
  clothingSource:"authority",
  poses:["exterior-authority"],
  lighting:["exterior-authority"],
  realismLayers:["car-spec-lock","glass","contact-shadow"],
  rules:{
    hard:["2017 Range Rover Sport Autobiography Dynamic L494","Fuji White","exterior only"],
    composition:["location and pose authority"],
    interaction:["beside vehicle"],
    exclusions:["driving"],
    routing:{ intentType:"selfie", sceneMode:"fixed", defaultScene:"carExterior", authority:"carExterior" },
    wiring:{ enabled:false, authority:"carExterior" },
    ui:{ scenarioMode:"custom", scene:"custom", groupMode:"single", captureMode:"normal", customFallback:"a parked 2017 Range Rover exterior selfie setting", showScenePicker:false, dedicatedControls:"carExterior" }
  }
});

export default SECTION;
