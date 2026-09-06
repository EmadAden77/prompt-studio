import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"bedroom",
  label:"Bedroom",
  description:"Lived-in bedroom selfie and home poses",
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
    exclusions:["studio staging"]
  }
});

export default SECTION;
