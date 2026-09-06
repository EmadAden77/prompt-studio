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
      "driver door and side window remain on the driver's physical left",
      "center console remains on the driver's physical right",
      "seat and cabin geometry",
      "one physically possible selfie capture event",
      "car-interior controls cannot be overridden by city, street, crowd, background-density, hair, skin, fabric-state or unrelated environment controls"
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
      "impossible hand use",
      "city landmark staging",
      "busy street or crowd staging",
      "generic background-density injection",
      "fabric-state override that contradicts the selected garment"
    ],
    routing:{ intentType:"car", sceneMode:"fixed", defaultScene:"rangeRover" },
    wiring:{
      enabled:true,
      clothing:true,
      customClothing:true,
      fabric:false,
      fabricWeight:false,
      ironState:false,
      wearState:false,
      clothingFit:false,
      lighting:true,
      pose:true,
      expression:true,
      body:true,
      selfieArmLock:true,
      selfieAngle:false,
      composition:false,
      hair:false,
      skin:false,
      time:true,
      realismCore:true,
      advancedRealism:false,
      accessoryProfile:false,
      accessoryDetail:false,
      objectProfile:false,
      environmentNote:false,
      postProcessing:false
    },
    selfieGeometry:{ angles:["eye"], poses:["driver-close","driver-low","roof-context"] },
    ui:{
      scenarioMode:"car",
      scene:"rangeRover",
      groupMode:"single",
      captureMode:"normal",
      showScenePicker:false,
      promptTarget:"chatgpt-images",
      activateCommonControls:false,
      enforceRealism:true,
      preventCrossSectionLeakage:true,
      dedicatedControls:"carInterior"
    }
  }
});

export default SECTION;