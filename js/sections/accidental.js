import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"accidental",
  label:"Accidental",
  description:"Candid accidental front-camera capture",
  captureType:"accidental_front_camera_capture",
  scenes:["street"],
  clothingSource:"authority",
  poses:["candid-motion"],
  lighting:["available"],
  realismLayers:["camera-accident","micro"],
  rules:{
    hard:["candid capture"],
    composition:["phone motion focus and exposure accidents"],
    interaction:[],
    exclusions:["posed selfie"]
  }
});

export default SECTION;
