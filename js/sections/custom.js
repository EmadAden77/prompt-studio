import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"custom",
  label:"✍️ مشهد مخصص",
  description:"قسم مستقل لمشهد يكتبه المستخدم مع جميع خيارات السيلفي والواقعية الفعالة",
  captureType:"direct_front_camera_selfie",
  scenes:["custom"],
  clothingSource:"authority",
  poses:["free","standing","seated","walking","waiting","browsing"],
  lighting:["contextual","day","night"],
  realismLayers:["micro","imperfections","contextual-environment","advanced-realism"],
  rules:{
    hard:["preserve user-written place","preserve explicit user selections","ChatGPT Images prompt target"],
    composition:["free physically plausible selfie composition"],
    interaction:["context-compatible props only"],
    exclusions:["inactive section leakage","invented scene replacement","studio staging unless explicitly requested"],
    routing:{ intentType:"selfie", sceneMode:"preserve-custom", defaultScene:"custom" },
    wiring:{
      enabled:true,
      clothing:true,
      clothingPhysics:true,
      lighting:true,
      pose:true,
      expression:true,
      body:true,
      selfieArmLock:true,
      selfieAngle:true,
      composition:true,
      hair:true,
      skin:true,
      realismCore:true,
      advancedRealism:true,
      postProcessing:true,
      customScene:true,
      customSceneDetails:true,
      sceneProfile:true,
      environmentNote:true,
      accessories:true,
      objects:true,
      chatgptImagesTarget:true
    },
    selfieGeometry:{
      angles:["eye","high","low","three-quarter"],
      poses:["standing-relaxed","walking","custom-standing","custom-seated","custom-waiting","custom-browsing","custom-relaxed-close"]
    },
    ui:{
      scenarioMode:"custom",
      scene:"custom",
      groupMode:"single",
      captureMode:"normal",
      customFallback:"an ordinary physically plausible user-defined location",
      showScenePicker:false,
      showCustomScene:true,
      showCustomSceneDetails:true,
      showSceneProfile:true,
      allCommonControls:true,
      promptTarget:"chatgpt-images"
    }
  }
});

export default SECTION;
