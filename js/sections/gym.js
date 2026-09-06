import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"gym",
  label:"Gym",
  description:"Natural gym selfie and fitness context",
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
    exclusions:["luxury accessories"]
  }
});

export default SECTION;
