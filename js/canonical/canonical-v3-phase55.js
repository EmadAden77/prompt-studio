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

export const ARMLESS_LOCK=`The phone-holding arm is entirely outside the frame;
the crop is tight on the face and shoulders inside the cabin so no arm or hand holding the phone is visible, while a subtle raised tension in the near shoulder and the near-field selfie projection still read as a self-held capture from the seat.`;
export const ARMLESS_FRAMING="Framing: tight head-and-shoulders cabin crop; the extended arm falls completely outside the frame edges; slight natural tilt kept.";
export const ARMLESS_OPTICS="Optics: near-field projection makes the face larger than the cabin; mild wide-angle, small natural tilt; never third-person.";
export const ARMLESS_LHD_ANCHORS="LHD visual anchors: wheel only before vehicle-LEFT driver seat; dark-wood console driver-right; B-pillar/belt vehicle-left; never mirror cabin.";

const POSES=Object.freeze({
  "driver-seat":"Pose: upright driver-seat selfie; relaxed shoulders, believable seat contact.",
  "driver-close":"Pose: close driver-seat selfie; upper torso dominant, wheel arc when natural.",
  "driver-low":"Pose: driver selfie; phone slightly below eye level at arm reach.",
  "roof-context":"Pose: wider driver selfie; panoramic roof/headliner naturally visible."
});

const ARMLESS_POSES=Object.freeze({
  "driver-close-armless":"Pose: driver-close-armless at eye level; driver headrest, B-pillar, window edge, steering-wheel top arc at bottom.",
  "driver-low-armless":"Pose: driver-low-armless slightly below eye level; Ivory headliner, sun visor, transparent panoramic roof above.",
  "driver-side-armless":"Pose: driver-side-armless three-quarter; dark-wood door trim and one side-window edge visible.",
  "driver-roof-armless":"Pose: driver-roof-armless with gentle roof tilt; transparent panoramic glass shows only real sky/stars physically visible through it.",
  "passenger-close-armless":"Pose: passenger-close-armless at eye level from the front passenger seat; center-console side visible; no steering wheel in frame.",
  "rear-seat-armless":"Pose: rear-seat-armless at eye level; two front headrests softly blurred in the near foreground."
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

function requestedPoseId(raw={}){
  const requested=text(raw.pose||raw.selfiePose);
  const auto=/^auto$/iu.test(requested)||raw.autoMode===true||text(raw.mode).toLowerCase()==="auto";
  const crop=text(raw.composition||raw.crop||raw.framing).toLowerCase();
  if(auto&&/tight|close|head|shoulder|portrait/u.test(crop)) return "driver-close-armless";
  return requested;
}

function isArmlessPose(raw={}){ return Boolean(ARMLESS_POSES[requestedPoseId(raw)]); }
function selectedPose(raw={}){
  const requested=requestedPoseId(raw);
  return ARMLESS_POSES[requested]||POSES[requested]||POSES["driver-seat"];
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

function armlessHair(raw={}){
  const id=text(raw.hair).toLowerCase();
  return `Hair: ${HAIR[id]||HAIR.same}; density/hairline/volume unchanged.`;
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
  if(lighting.includes("flash")) return "Night lighting: phone flash plus cabin/street lights; hard near shadows, darker distance and coherent reflections.";
  return "Night lighting: cabin and Saudi street/building/vehicle lights through glass; natural falloff, dark areas, reflections and mild shadow noise.";
}

function armlessLightingSentence(raw={}){
  const mode=selectedTime(raw);
  const lighting=text(raw.lighting).toLowerCase();
  const roof=requestedPoseId(raw)==="driver-roof-armless";
  if(mode==="day") return roof
    ?"Car-only day: daylight through transparent cabin glass/panoramic roof; real sky visible; restrained phone dynamic range."
    :"Car-only day: daylight through transparent cabin glass; believable Ivory/dark-wood shadows; restrained phone dynamic range.";
  if(lighting.includes("flash")) return "Car-only night-flash: phone flash plus dim cabin ambient and restrained dash glow; short near shadows, darker cabin distance, coherent glass reflections.";
  return roof
    ?"Car-only night: dim cabin ambient plus restrained dash glow; transparent panoramic glass shows a physically plausible real night sky and stars, never opaque black."
    :"Car-only night: dim cabin ambient plus restrained dash glow; natural falloff and mild phone shadow noise.";
}

function saudiRegion(raw={}){
  const city=text(raw.city||raw.saudiCity).toLowerCase();
  if(/dammam|khobar|الدمام|الخبر/u.test(city)) return "eastern-coast Saudi";
  if(/jeddah|جدة/u.test(city)) return "western-coast Saudi";
  if(/riyadh|الرياض/u.test(city)) return "inland Saudi";
  return "Saudi";
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
  return "";
}

function backgroundSentence(raw={}){
  const detail=detailWord(raw);
  const prefix=detail?`${detail} `:"";
  return `Through visible glass: ${prefix}${saudiRegion(raw)} street life with parked/passing vehicles and ${peoplePhrase(raw)}; no posing, readable city signs or landmarks.`;
}

function realismSentence(raw={}){
  const state=text(raw.placeState).toLowerCase();
  const cabin=state&&/clean|tidy|fresh|مرتب|نظيف/u.test(state)?"well-kept, not showroom-perfect":"naturally used";
  return `Mandatory realism: ${cabin} cabin, seat compression, clothing folds, skin texture and touched-surface wear under one exposure/perspective.`;
}

function armlessRealismSentence(){
  return "Realism: seat compression, clothing folds, skin texture, touched-surface wear; one exposure.";
}

function buildLegacyCarPrompt(raw={}){
  return [
    "ChatGPT Images: create a candid front-camera selfie inside a parked 2017 Range Rover Sport Autobiography Dynamic L494.",
    "Seated naturally, holding the phone at arm reach with one hand; the other hand stays free.",
    "Preserve reference identity: face, skin tone, hairline, facial hair, age/asymmetry; no beautification/de-aging.",
    selectedClothing(raw),selectedExpression(raw),selectedHair(raw),
    "Tall 195 cm, 88 kg lean-athletic; believable seated scale.",
    LHD_VEHICLE_RELATIVE_ANCHORS,LHD_SELFIE_VIEWER_MAPPING,LHD_STEERING_ANCHOR,LHD_REAR_SEAT_ANCHOR,
    "Cabin: Ivory perforated leather, dark wood, black-and-Ivory steering wheel, transparent panoramic roof and Ivory headliner; angle-visible only.",
    selectedPose(raw),lightingSentence(raw),backgroundSentence(raw),realismSentence(raw),
    "No driving, passenger relocation, exterior camera, studio/ring light or staging."
  ].filter(Boolean).join(" ").trim();
}

function buildArmlessCarPrompt(raw={}){
  return [
    "ChatGPT Images: create one candid front-camera selfie inside a parked 2017 Range Rover Sport Autobiography Dynamic L494.",
    "Preserve reference identity: face, skin tone, hairline, facial hair, age/asymmetry; no beautification/de-aging.",
    selectedClothing(raw),selectedExpression(raw),armlessHair(raw),
    "195 cm, 88 kg lean-athletic; shoulders fill seatback, head near headliner.",
    ARMLESS_LHD_ANCHORS,
    "Cabin: Ivory perforated leather, dark wood veneer, transparent panoramic glass, Ivory headliner; glass never opaque black.",
    ARMLESS_LOCK,
    ARMLESS_FRAMING,
    "Other hand: wheel/console/lap, or out of frame.",
    ARMLESS_OPTICS,
    selectedPose(raw),armlessLightingSentence(raw),armlessRealismSentence(raw),
    "Interior only; no exterior camera, studio/ring light, or staged display."
  ].filter(Boolean).join(" ").trim();
}

function buildCarPrompt(raw={}){ return isArmlessPose(raw)?buildArmlessCarPrompt(raw):buildLegacyCarPrompt(raw); }

const WRONG_SIDE_STEERING=/steering wheel\s+(?:is\s+|sits\s+|appears\s+|located\s+|centered\s+)?(?:on|at|in)\s+(?:the\s+)?(?:cabin|vehicle)\s+RIGHT/iu;

function assertCarPrompt(prompt,raw={}){
  const armless=isArmlessPose(raw);
  const forbidden=[
    /Selected controls:/iu,/city=/iu,/background=/iu,/fabric=/iu,/hair=/iu,/Dammam|Riyadh|Jeddah/iu,
    /front grille|rear tailgate|standing beside|leaning against the .*driver door/iu,
    /driver(?:'s)? (?:seatbelt|belt|B-pillar).*RIGHT shoulder/iu,
    WRONG_SIDE_STEERING,/\bISO\b|\byaw\b|\bpitch\b|\broll\b|f\/\d/iu
  ];
  for(const pattern of forbidden) if(pattern.test(prompt)) throw new Error(`Phase 55 car-interior leakage: ${pattern}`);
  if(!/parked 2017 Range Rover Sport Autobiography Dynamic L494/iu.test(prompt)) throw new Error("Phase 55 missing parked vehicle identity");
  if(!/Preserve reference identity:/iu.test(prompt)) throw new Error("Phase 55 identity lock missing");

  if(armless){
    if(!prompt.includes(ARMLESS_LOCK)) throw new Error("Phase 53 ARMLESS_LOCK missing");
    if(!prompt.includes(ARMLESS_LHD_ANCHORS)) throw new Error("Phase 53 LHD armless anchors missing");
    if(!/Ivory perforated leather, dark wood veneer, transparent panoramic glass/iu.test(prompt)) throw new Error("Phase 53 cabin anchors missing");
    if(!prompt.includes(ARMLESS_OPTICS)) throw new Error("Phase 53 near-field selfie optics missing");
    if(!/Realism:/iu.test(prompt)) throw new Error("Phase 53 realism lock missing");
    if(/one arm extends|holding the phone at arm reach|one hand holds the phone/iu.test(prompt)) throw new Error("Phase 53 visible selfie arm leakage");
    if(/grille|alloys|\bDRL\b|Fuji White exterior/iu.test(prompt)) throw new Error("Phase 53 exterior specification leakage");
    if(/street lights|building lights|vehicle lights|street\/building\/vehicle/iu.test(prompt)) throw new Error("Phase 53 exterior lighting leakage");
    if(words(prompt)>250) throw new Error(`Phase 53 armless car prompt budget overflow: ${words(prompt)} words`);
    return;
  }

  if(!/Mandatory realism:/iu.test(prompt)) throw new Error("Phase 55 mandatory realism missing");
  if(!prompt.includes(LHD_VEHICLE_RELATIVE_ANCHORS)) throw new Error("Phase 55 missing vehicle-relative anchors");
  if(!prompt.includes(LHD_SELFIE_VIEWER_MAPPING)) throw new Error("Phase 55 missing selfie viewer mapping");
  if(!prompt.includes(LHD_STEERING_ANCHOR)) throw new Error("Phase 55 missing steering-wheel centering");
  if(!prompt.includes(LHD_REAR_SEAT_ANCHOR)) throw new Error("Phase 55 missing rear-seat consistency");
  if(!/holding the phone at arm reach with one hand; the other hand stays free/iu.test(prompt)) throw new Error("Phase 55 selfie lock missing");
  if(!/Cabin: Ivory perforated leather, dark wood, black-and-Ivory steering wheel, transparent panoramic roof and Ivory headliner/iu.test(prompt)) throw new Error("Phase 55 cabin fidelity changed");
  if(!/Saudi street life/iu.test(prompt)) throw new Error("Phase 55 Saudi environment life missing");
  if(words(prompt)>280) throw new Error(`Phase 55 car prompt budget overflow: ${words(prompt)} words`);
}

export function buildCanonicalV3UserOutput(rawInput={},sceneData=undefined){
  const normalized=normalizePhase54Aliases(rawInput);
  if(text(normalized.studioSection)!=="car") return buildPhase54CanonicalV3UserOutput(normalized,sceneData);

  const base=buildPhase52_1CanonicalV3UserOutput(normalized,sceneData);
  const contract=buildWikiPromptSectionContract(normalized,base);
  const armless=isArmlessPose(normalized);
  const prompt=buildCarPrompt(normalized);
  assertCarPrompt(prompt,normalized);

  return Object.freeze({
    ...base,
    phase53:Object.freeze(armless?{
      active:true,status:"pass",feature:"car-cabin-armless-selfie",interiorOnly:true,armVisible:false,
      pose:requestedPoseId(normalized),hardLimit:250,determinism:"10/10"
    }:{active:false,status:"not-applicable",compatibilityMode:"phase52.1",promptMutation:false,determinism:"10/10"}),
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
      globalSubjectControlsActive:true,contextualSaudiRealismActive:!armless,environmentLifeActive:!armless,realismMandatory:true,
      naturalPropIntegration:false,mirrorRule:"not-applicable-direct-front-camera",
      simpleCameraLanguage:true,actionFirst:true,contextConsistency:true,subtleImperfections:true,
      lhdVisualAnchors:true,viewerMapping:true,steeringWheelCenteredOnLeftSeat:true,rearLeftBehindDriver:true,
      armlessMode:armless,interiorOnly:armless,wordCount:words(prompt),hardLimit:armless?250:280,determinism:"10/10"
    }),prompt
  });
}

export default buildCanonicalV3UserOutput;
