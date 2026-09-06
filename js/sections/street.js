import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"street",
  label:"🌆 التصوير الخارجي والشارع",
  description:"الوقوف والمشي والمواقف والإضاءة الخارجية فقط",
  captureType:"direct_front_camera_selfie",
  scenes:["street"],
  clothingSource:"authority",
  poses:["standing","walking"],
  lighting:["outdoor"],
  realismLayers:["saudi-street","saudi-realism","micro"],
  rules:{
    hard:["outdoor street context"],
    composition:["standing or walking"],
    interaction:[],
    exclusions:["studio lighting"],
    routing:{ intentType:"selfie", sceneMode:"fallback", defaultScene:"street" },
    ui:{ scenarioMode:"street", scene:"street", groupMode:"single", captureMode:"normal", showScenePicker:false }
  }
});

export default SECTION;
