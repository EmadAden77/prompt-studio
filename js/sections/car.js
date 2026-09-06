import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"car",
  label:"🚙 التصوير داخل السيارة",
  description:"مقاعد السيارة والمقصورة ووضعيات وإضاءة السيارة فقط",
  captureType:"subject_held_driver_selfie",
  scenes:["rangeRover"],
  clothingSource:"authority",
  poses:["driver-seat","driver-close","driver-low","roof-context"],
  lighting:["car"],
  realismLayers:["cabin-material","glass","micro","imperfections","lighting-physics","camera-artifacts"],
  rules:{
    hard:[
      "interior only",
      "stationary vehicle",
      "subject seated in driver seat",
      "LHD cabin",
      "steering wheel directly ahead of torso",
      "driver door and side window remain on the driver's side",
      "center console remains opposite the driver door",
      "seat and cabin geometry",
      "one physically possible selfie capture event"
    ],
    composition:["driver-seat selfie","show only cabin elements naturally visible from the selected selfie angle"],
    interaction:["one hand holds the phone; the other remains physically available and cannot perform incompatible simultaneous actions"],
    exclusions:[
      "exterior scene",
      "standing outside vehicle",
      "passenger-seat relocation",
      "mirrored LHD cabin",
      "driving motion",
      "studio lighting",
      "ring light",
      "fake panoramic-roof panel",
      "impossible hand use"
    ],
    routing:{ intentType:"car", sceneMode:"fixed", defaultScene:"rangeRover" },
    wiring:{
      enabled:true,
      clothing:true,
      customClothing:true,
      fabric:true,
      fabricWeight:true,
      ironState:true,
      wearState:true,
      clothingFit:true,
      lighting:true,
      pose:true,
      expression:true,
      body:true,
      selfieArmLock:true,
      selfieAngle:true,
      composition:true,
      hair:true,
      skin:true,
      time:true,
      realismCore:true,
      advancedRealism:true,
      accessoryProfile:true,
      accessoryDetail:true,
      objectProfile:true,
      environmentNote:true,
      postProcessing:true
    },
    selfieGeometry:{ angles:["eye","high","low","three-quarter"], poses:["driver-close","driver-low","roof-context"] },
    ui:{
      scenarioMode:"car",
      scene:"rangeRover",
      groupMode:"single",
      captureMode:"normal",
      showScenePicker:false,
      promptTarget:"chatgpt-images",
      activateCommonControls:true,
      enforceRealism:true,
      preventCrossSectionLeakage:true
    }
  }
});

export default SECTION;
