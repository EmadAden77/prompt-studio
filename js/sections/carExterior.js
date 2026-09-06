import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"carExterior",
  label:"Car Exterior",
  description:"Selfie beside the locked 2017 Range Rover",
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
    exclusions:["driving"]
  }
});

export default SECTION;
