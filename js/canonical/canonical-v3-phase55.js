import { buildCanonicalV3UserOutput as buildPhase52_1CanonicalV3UserOutput } from "./canonical-v3-phase52-1.js";
import { buildCanonicalV3UserOutput as buildPhase54CanonicalV3UserOutput } from "./canonical-v3-phase54.js";
import { buildWikiPromptSectionContract, normalizePhase54Aliases, WIKIPROMPT_CAR_SELFIE_RULES } from "./wikiprompt-realistic-selfie-phase54.js";
import { resolveClothingText } from "../clothing-authority.js";

const text=value=>String(value??"").trim();
const words=value=>text(value).split(/\s+/u).filter(Boolean).length;

export const LHD_VEHICLE_RELATIVE_ANCHORS="LHD visual anchors: the driver's seat and steering wheel occupy the vehicle LEFT; the empty Ivory passenger seat occupies the cabin RIGHT; the dark-wood center console is between the front seats on the driver's RIGHT; the driver's seatbelt retractor and B-pillar are beside his LEFT shoulder.";
export const LHD_SELFIE_VIEWER_MAPPING="Selfie viewer mapping: when he faces the camera, his LEFT-side door, B-pillar and seatbelt appear on the viewer's RIGHT, while the empty passenger seat appears on the viewer's LEFT.";
export const LHD_STEERING_ANCHOR="Steering wheel: centered only in front of the LEFT seat; no wheel or pedal geometry on the cabin right.";
export const LHD_REAR_SEAT_ANCHOR="Rear Ivory seats span behind both front seats; rear-left is behind the driver.";

const POSES=Object.freeze({
  "driver-seat":"Pose: upright driver-seat selfie with relaxed shoulders and believable seat contact.",
  "driver-close":"Pose: close driver-seat selfie; upper torso dominant, wheel arc when natural.",
  "driver-low":"Pose: driver selfie with phone slightly below eye level at natural arm reach.",
  "roof-context":"Pose: wider driver selfie naturally including part of the panoramic roof and headliner."
});

const EXPRESSIONS=Object.freeze({
  neutral:"neutral",relaxed:"calm and relaxed",serious:"serious",confident:"confident",focused:"focused neutral",
  "small-smile":"small natural closed-mouth smile",smile:"natural smile",laughing:"natural laugh"
});

const HAIR=Object.freeze({
  same:"as reference",messy:"slightly messy",neat:"neat",wet:"damp",natural_tousled:"light natural tousle",
  loose_swept_back:"naturally swept back",swept_back_soft_part:"swept back with soft part",side_part_right:"soft right side part",
  side_part_left:"soft left side part",soft_middle_part:"soft middle part",side_sweep_right:"naturally swept right",
  side_sweep_left:"naturally swept left",light_front_lift:"light natural front lift",loose_forehead_strands:"a few loose forehead strands",
  forward_relaxed:"relaxed forward",sleep_compressed_right:"slightly compressed on the right",sleep_compressed_left:"slightly compressed on the left",
  damp_post_shower:"damp post-shower",towel_dried:"casually towel-dried",neat_natural:"neat and natural",morning_messy:"natural morning mess",
  shemagh_compression:"natural shemagh compression",hand_through_hair:"naturally displaced by the free hand","hand-neat":"neatly hand-arranged"
});

function selectedPose(raw={}){
  const requested=text(raw.pose||raw.selfiePose);
  return POSES[requested]||POSES["driver-seat"];
}

function selectedClothing(raw={}){
  const resolved=text(resolveClothingText(raw.clothing,raw));
  return resolved?`Clothing: ${resolved}.`:"";
}

function selectedExpression(raw={}){
  const id=text(raw.expression).toLowerCase();
  return `Expression: ${EXPRESSIONS[id]||"neutral"}.`;
}

function selectedHair(raw={}){
  const id=text(raw.hair).toLowerCase();
  return `Hair: ${HAIR[id]||HAIR.same}; reference density, hairline and volume unchanged.`;
}

function selectedTime(raw={}){
  const time=text(raw.time).toLowerCase();
  const lighting=text(raw.lighting).toLowerCase();
  if(time==="day"||/day|daylight|sun|overcast|shade/u.test(lighting)) return "day";
  return "night";
}

function lightingSentence(raw={}){
  const mode=selectedTime(raw);
  const lighting=text(raw.lighting).toLowerCase();
  if(mode==="day") return "Day lighting: real sun/sky through glass; natural cabin shadows, exterior brightness, reflections and phone dynamic range.";
  if(lighting.includes("flash")) return "Night lighting: phone flash plus real cabin/street lights; hard near shadows, darker distance and coherent reflections.";
  return "Night lighting: cabin and Saudi street/building/vehicle lights through glass; natural falloff, dark areas, reflections and mild shadow noise.";
}

function saudiRegion(raw={}){
  const city=text(raw.city||raw.saudiCity).toLowerCase();
  if(/dammam|khobar|الدمام|الخبر/u.test(city)) return "eastern-coast Saudi";
  if(/jeddah|جدة/u.test(city)) return "western-coast Saudi";
  if(/riyadh|الرياض/u.test(city)) return "inland Saudi";
  return "ordinary Saudi";
}

function peoplePhrase(raw={}){
  const density=text(raw.peopleDensity).toLowerCase();
  if(/none|zero|empty|بدون/u.test(density)) return "no staged pedestrians";
  if(/high|many|busy|كثر|مرتفع/u.test(density)) return "several dispersed pedestrians";
  if(/low|few|minimal|قليل/u.test(density)) return "one or two distant pedestrians";
  return "sparse pedestrians";
}

function detailWord(raw={}){
  const density=text(raw.messiness).toLowerCase();
  if(density==="busy") return "denser";
  if(density==="minimal") return "restrained";
  return "ordinary";
}

function backgroundSentence(raw={}){
  return `Through visible glass: ${detailWord(raw)} ${saudiRegion(raw)} street life, parked/passing vehicles and ${peoplePhrase(raw)} at varied depth; no posing, readable city signs or forced landmarks.`;
}

function realismSentence(raw={}){
  const state=text(raw.placeState).toLowerCase();
  const cabin=state&&/clean|tidy|fresh|مرتب|نظيف/u.test(state)?"well-kept, not showroom-perfect":"naturally used";
  return `Mandatory realism: ${cabin} cabin, seat compression, clothing folds, skin texture and touched-surface wear share one exposure/perspective.`;
}

function buildCarPrompt(raw={}){
  const parts=[
    "ChatGPT Images: create a candid front-camera selfie inside a parked 2017 Range Rover Sport Autobiography Dynamic L494.",
    "Driver seated naturally; one hand holds the phone at arm reach, the other stays free.",
    "Preserve reference identity: face, skin tone, hairline, facial hair, age and asymmetry; no beautification/de-aging.",
    selectedClothing(raw),selectedExpression(raw),selectedHair(raw),
    "Tall 195 cm, 88 kg lean-athletic; believable seated scale.",
    LHD_VEHICLE_RELATIVE_ANCHORS,LHD_SELFIE_VIEWER_MAPPING,LHD_STEERING_ANCHOR,LHD_REAR_SEAT_ANCHOR,
    "Cabin: Ivory perforated leather, dark wood, black-and-Ivory steering wheel, transparent panoramic roof and Ivory headliner; angle-visible only.",
    selectedPose(raw),lightingSentence(raw),backgroundSentence(raw),realismSentence(raw),
    "No driving, passenger relocation, exterior camera, studio/ring light or staging."
  ].filter(Boolean);
  return parts.join(" ").trim();
}

const WRONG_SIDE_STEERING=/steering wheel\s+(?:is\s+|sits\s+|appears\s+|located\s+|centered\s+)?(?:on|at|in)\s+(?:the\s+)?(?:cabin|vehicle)\s+RIGHT/iu;

function assertCarPrompt(prompt){
  const forbidden=[
    /Selected controls:/iu,/city=/iu,/background=/iu,/fabric=/iu,/hair=/iu,/Dammam|Riyadh|Jeddah/iu,
    /front grille|rear tailgate|standing beside|leaning against the .*driver door/iu,
    /driver(?:'s)? (?:seatbelt|belt|B-pillar).*RIGHT shoulder/iu,/passenger seat.*vehicle LEFT/iu,
    WRONG_SIDE_STEERING,/\bISO\b|\byaw\b|\bpitch\b|\broll\b|f\/\d/iu
  ];
  for(const pattern of forbidden) if(pattern.test(prompt)) throw new Error(`Phase 55 car-interior leakage: ${pattern}`);
  if(!/parked 2017 Range Rover Sport Autobiography Dynamic L494/iu.test(prompt)) throw new Error("Phase 55 missing parked vehicle identity");
  if(!prompt.includes(LHD_VEHICLE_RELATIVE_ANCHORS)) throw new Error("Phase 55 missing vehicle-relative anchors");
  if(!prompt.includes(LHD_SELFIE_VIEWER_MAPPING)) throw new Error("Phase 55 missing selfie viewer mapping");
  if(!prompt.includes(LHD_STEERING_ANCHOR)) throw new Error("Phase 55 missing steering-wheel centering");
  if(!prompt.includes(LHD_REAR_SEAT_ANCHOR)) throw new Error("Phase 55 missing rear-seat consistency");
  if(!/Preserve reference identity:/iu.test(prompt)) throw new Error("Phase 55 identity lock missing");
  if(!/one hand holds the phone at arm reach, the other stays free/iu.test(prompt)) throw new Error("Phase 55 selfie lock missing");
  if(!/Cabin: Ivory perforated leather, dark wood, black-and-Ivory steering wheel, transparent panoramic roof and Ivory headliner/iu.test(prompt)) throw new Error("Phase 55 cabin fidelity changed");
  if(!/Mandatory realism:/iu.test(prompt)) throw new Error("Phase 55 mandatory realism missing");
  if(!/Saudi street life/iu.test(prompt)) throw new Error("Phase 55 Saudi environment life missing");
  if(words(prompt)>280) throw new Error(`Phase 55 car prompt budget overflow: ${words(prompt)} words`);
}

export function buildCanonicalV3UserOutput(rawInput={},sceneData=undefined){
  const normalized=normalizePhase54Aliases(rawInput);
  if(text(normalized.studioSection)!=="car") return buildPhase54CanonicalV3UserOutput(normalized,sceneData);

  const base=buildPhase52_1CanonicalV3UserOutput(normalized,sceneData);
  const contract=buildWikiPromptSectionContract(normalized,base);
  const prompt=buildCarPrompt(normalized);
  assertCarPrompt(prompt);

  return Object.freeze({
    ...base,
    phase53:Object.freeze({active:false,status:"not-applicable",compatibilityMode:"phase52.1",promptMutation:false,determinism:"10/10"}),
    phase54:Object.freeze({
      active:true,section:"car",wikiPromptSource:contract.source,wikiPromptRules:contract.rules,wikiPromptCarRules:WIKIPROMPT_CAR_SELFIE_RULES,
      fieldEvidence:Object.freeze([]),injectedFieldEvidence:Object.freeze([]),contradictions:Object.freeze([]),allCommonFieldsRouted:false,
      inactiveSectionLeakageForbidden:true,promptTarget:"chatgpt-images",carInteriorAuthority:true,physicalRealismEnforced:true,
      semanticSelectionSupersession:true,determinism:"10/10"
    }),
    phase55:Object.freeze({
      active:true,section:"car",scope:Object.freeze(["seats","cabin","driver-seat poses","car lighting"]),wikiPromptSource:contract.source,
      wikiPromptSpecialization:WIKIPROMPT_CAR_SELFIE_RULES,rawGenericControlsInjected:false,namedExteriorContextAllowed:false,
      strictFourDomainAuthority:true,fixedDomains:Object.freeze(["seats","cabin"]),selectableDomains:Object.freeze(["driver-seat pose","car lighting"]),
      globalSubjectControlsActive:true,contextualSaudiRealismActive:true,environmentLifeActive:true,realismMandatory:true,
      naturalPropIntegration:false,mirrorRule:"not-applicable-direct-front-camera",
      simpleCameraLanguage:true,actionFirst:true,contextConsistency:true,subtleImperfections:true,
      lhdVisualAnchors:true,viewerMapping:true,steeringWheelCenteredOnLeftSeat:true,rearLeftBehindDriver:true,
      wordCount:words(prompt),hardLimit:280,determinism:"10/10"
    }),prompt
  });
}

export default buildCanonicalV3UserOutput;
