import { deepFreeze } from "./_freeze.js";
export const SECTION = deepFreeze({ id:"custom", label:"Custom", description:"User-written free scene", captureType:"direct_front_camera_selfie", scenes:["custom"], clothingSource:"custom", poses:["free"], lighting:["contextual"], realismLayers:["micro"], rules:{ hard:["preserve user-written place"], composition:["free composition"], interaction:[], exclusions:[] } });
export default SECTION;
