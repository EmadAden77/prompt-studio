import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"street",
  label:"Street",
  description:"Saudi street standing and walking selfie",
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
    exclusions:["studio lighting"]
  }
});

export default SECTION;
