import { deepFreeze } from "./_freeze.js";
import { profileForSection, MIRROR_RULES_SENTENCE } from "./wikiprompt-phase47-profiles.js";

const profile = profileForSection("mirror");
export const SECTION = deepFreeze({
  id:"mirror",
  label:"🪞 سيلفي المرآة",
  description:"سيلفي مرآة بفيزياء انعكاس صحيحة ونص مقروء للمشاهد",
  captureType:"mirror_selfie",
  scenes:["bedroom"],
  clothingSource:"authority",
  poses:["mirror-standing","mirror-candid"],
  lighting:["indoor-authority"],
  realismLayers:["micro","imperfections","mirror-geometry"],
  actionDescription:profile.actionDescription,
  imperfections:profile.imperfections,
  rules:{
    hard:["camera pointed at mirror","subject represented through reflection","correct reflection geometry"],
    composition:["natural mirror framing"],
    interaction:["phone held toward mirror"],
    exclusions:["third-person camera masquerading as mirror selfie"],
    mirrorRules:MIRROR_RULES_SENTENCE,
    contextualRules:{ clothing:"scene-appropriate", accessories:"activity-appropriate", lighting:"time-and-place coherent", expression:"action-coherent" },
    routing:{ intentType:"selfie", sceneMode:"fallback", defaultScene:"bedroom" },
    wiring:{ enabled:true, clothing:true, lighting:true, pose:true, expression:true, body:true, selfieArmLock:false },
    selfieGeometry:{ angles:["eye","three-quarter"], poses:["mirror-standing","mirror-candid"] },
    ui:{ scenarioMode:"bedroom", scene:"bedroom", groupMode:"single", captureMode:"normal", showScenePicker:true }
  }
});

export default SECTION;
