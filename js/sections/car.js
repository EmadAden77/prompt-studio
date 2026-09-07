import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"car",
  label:"🚙 التصوير داخل السيارة",
  description:"مقاعد السيارة والمقصورة ووضعيات وإضاءة السيارة فقط",
  captureType:"subject_held_cabin_selfie",
  scenes:["rangeRover"],
  clothingSource:"authority",
  poses:[
    "driver-seat","driver-close","driver-low","roof-context",
    "driver-close-armless","driver-low-armless","driver-side-armless","driver-roof-armless",
    "passenger-close-armless","rear-seat-armless"
  ],
  lighting:["car"],
  realismLayers:["cabin-material","glass","micro","imperfections","lighting-physics","camera-artifacts","environment-life","saudi-context"],
  rules:{
    sectionScope:["seats","cabin","driver-seat poses","car lighting"],
    wikiPromptPolicy:"strict-car-selfie",
    authority:{
      fixed:["seats","cabin"],
      selectable:["pose","lighting"],
      globalSubjectControls:["clothing","customClothing","expression","hair","time"],
      contextualRealismControls:["city","messiness","peopleDensity","placeState"],
      alwaysOnRealism:["identity","body-scale","contact","glass","lighting-physics","camera-behavior","environment-life","saudi-context"],
      ignoredGenericControls:[
        "fabric","fabricWeight","ironState","wearState","clothingFit","accessoryProfile","accessoryDetail",
        "objectProfile","environmentNote","postProcessing"
      ]
    },
    hard:[
      "interior only",
      "stationary vehicle",
      "subject seated in the selected cabin seat",
      "LHD cabin",
      "driver seat and steering wheel occupy vehicle LEFT",
      "center console remains between the front seats and on the driver's physical right",
      "driver seatbelt retractor and B-pillar remain on the vehicle-left side",
      "vehicle-relative anchors remain authoritative; viewer mapping is seat-aware and never mirrors the cabin",
      "steering wheel centered only in front of the LEFT front seat",
      "rear-left seat remains behind the driver",
      "seat and cabin geometry",
      "one physically possible selfie capture event",
      "car-specific scene controls remain limited to seats, cabin, seated cabin pose and car lighting",
      "global clothing, expression, identity-safe hair arrangement and day/night time remain active",
      "realism is mandatory and cannot be disabled",
      "armless modes keep the phone-holding arm entirely outside the frame while preserving near-field selfie projection"
    ],
    composition:["seated cabin selfie","show only angle-visible cabin elements and physically visible transparent glass"],
    interaction:["armless modes hide the phone-holding arm completely; the other hand may rest on the steering wheel, center console, lap, or remain out of frame"],
    exclusions:[
      "exterior camera position",
      "standing outside vehicle",
      "mirrored LHD cabin",
      "steering wheel or pedal geometry on the cabin right",
      "driving motion",
      "studio lighting",
      "ring light",
      "fake panoramic-roof panel",
      "opaque-black panoramic glass",
      "impossible hand use",
      "front grille",
      "alloy-wheel specification",
      "DRL specification",
      "Fuji White exterior specification",
      "city-name signage or landmark staging",
      "crowd staging",
      "fabric-state override that contradicts selected clothing",
      "technical camera jargon in final ChatGPT Images prompt"
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
      body:false,
      selfieArmLock:false,
      selfieAngle:false,
      composition:false,
      hair:true,
      skin:false,
      time:true,
      realismCore:true,
      advancedRealism:false,
      placeState:true,
      peopleDensity:true,
      subjectMoment:false,
      interactionObject:false,
      city:true,
      messiness:true,
      accessoryProfile:false,
      accessoryDetail:false,
      objectProfile:false,
      environmentNote:false,
      postProcessing:false
    },
    selfieGeometry:{
      angles:["eye","slightly-below","three-quarter","roof-tilt"],
      poses:["driver-close-armless","driver-low-armless","driver-side-armless","driver-roof-armless","passenger-close-armless","rear-seat-armless"],
      autoTightCropPose:"driver-close-armless"
    },
    ui:{
      scenarioMode:"car",
      scene:"rangeRover",
      groupMode:"single",
      captureMode:"normal",
      showScenePicker:false,
      promptTarget:"chatgpt-images",
      activateCommonControls:true,
      enforceRealism:true,
      preventCrossSectionLeakage:true,
      dedicatedControls:"carInterior"
    }
  }
});

export default SECTION;
