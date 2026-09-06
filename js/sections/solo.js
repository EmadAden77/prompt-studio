import { deepFreeze } from "./_freeze.js";
export const SECTION = deepFreeze({ id:"solo", label:"Solo", description:"Single-person direct selfie", captureType:"direct_front_camera_selfie", scenes:["street"], clothingSource:"authority", poses:["selfie"], lighting:["personal"], realismLayers:["micro","imperfections"], rules:{ hard:["exactly one person","selfie capture"], composition:["selfie poses and angles"], interaction:[], exclusions:[] } });
export default SECTION;
