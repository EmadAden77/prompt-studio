import { deepFreeze } from "./_freeze.js";
export const SECTION = deepFreeze({ id:"car", label:"Car", description:"2017 Range Rover cabin selfie", captureType:"subject_held_driver_selfie", scenes:["rangeRover"], clothingSource:"authority", poses:["driver-seat"], lighting:["car"], realismLayers:["cabin-material","glass"], rules:{ hard:["interior only","LHD cabin","seat and cabin geometry"], composition:["driver-seat selfie"], interaction:[], exclusions:["exterior scene"] } });
export default SECTION;
