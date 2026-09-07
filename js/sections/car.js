import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"car",
  label:"🚙 التصوير داخل السيارة",
  description:"مقاعد السيارة والمقصورة ووضعيات وإضاءة السيارة، مع مظهر الشخص وخلفية سعودية واقعية عبر الزجاج",
  captureType:"subject_held_driver_selfie",
  scenes:["rangeRover"],
  clothingSource:"authority",
  poses:["driver-seat","driver-close","driver-low","roof-context"],
  lighting:["car"],
  realismLayers:["cabin-material","glass","micro","imperfections","lighting-physics","camera-artifacts","through-glass-street-life"],
  rules:{
    sectionScope:["seats","cabin","driver-seat poses","car lighting"],
    subjectControls:["clothing","expression","hair","skin"],
    contextRealism:["through-glass Saudi street life"],
    wikiPromptPolicy:"strict-car-selfie-realism",
    authority:{
      fixed:["seats","cabin","L494 vehicle fidelity","LHD cabin geometry"],
      selectable:["pose","lighting","clothing","expression","hair","skin","time","through-glass background life"],
      ignoredGenericControls:[
        "accessoryProfile","accessoryDetail","objectProfile","postProcessing","street","carExteriorPose","carExteriorLocation"
      ],
      constrainedControls:[
        "city","peopleDensity","messiness","environmentNote","fabric","fabricWeight","ironState","wearState","clothingFit"
      ]
    },
    hard:[
      "interior only",
      "stationary vehicle",
      "subject seated in driver seat",
      "subject clothing, expression and hair remain active person controls",
      "through-glass Saudi street life remains visible but secondary",
      "LHD cabin",
      "driver seat and steering wheel occupy vehicle LEFT",
      "empty passenger seat occupies cabin RIGHT",
      "center console remains on the driver's physical right",
      "driver seatbelt retractor and B-pillar remain beside the driver's physical left shoulder",
      "vehicle-relative anchors remain authoritative; viewer mapping applies only to a facing-camera driver selfie",
      "steering wheel centered only in front of the LEFT front seat",
      "rear-left seat remains behind the driver",
      "one physically possible selfie capture event",
      "car details remain 2017 Range Rover Sport Autobiography Dynamic L494 with Ivory perforated leather, dark wood, black-and-Ivory wheel, panoramic glass roof and Ivory headliner",
      "realism is mandatory: natural seat compression, touched-surface wear, coherent reflections, physical day/night lighting and ordinary Saudi street life through glass"
    ],
    composition:["driver-seat selfie","show cabin elements naturally visible from the selected selfie angle","outside activity remains behind glass and never becomes an exterior scene"],
    interaction:["one hand holds the phone; the other remains physically available and cannot perform incompatible simultaneous actions"],
    exclusions:[
      "exterior scene",
      "standing outside vehicle",
      "passenger-seat relocation",
      "mirrored LHD cabin",
      "driver belt or B-pillar on the driver's physical right",
      "passenger seat on the vehicle left",
      "steering wheel or pedal geometry on the cabin right",
      "driving motion",
      "studio lighting",
      "ring light",
      "fake panoramic-roof panel",
      "impossible hand use",
      "city landmark staging",
      "skyline tourism background",
      "busy crowd staging",
      "raw selected-control text injection",
      "technical camera jargon in final ChatGPT Images prompt"
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
      accessoryProfile:false,
      accessoryDetail:false,
      objectProfile:false,
      environmentNote:true,
      postProcessing:false
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
      preventCrossSectionLeakage:true,
      dedicatedControls:"carInterior"
    }
  }
});

export default SECTION;
