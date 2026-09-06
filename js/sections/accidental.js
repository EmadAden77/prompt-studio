import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"accidental",
  label:"📱 اللقطة العفوية بالخطأ",
  description:"حركة الهاتف والتركيز والتعريض العرضي داخل مشهد يومي",
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
    exclusions:["posed selfie"],
    routing:{ intentType:"accidental", sceneMode:"selectable", defaultScene:"street" },
    ui:{ scenarioMode:"custom", scene:"custom", groupMode:"single", captureMode:"accidental", customFallback:"an ordinary lived-in indoor room or everyday place", showScenePicker:false }
  }
});

export default SECTION;
