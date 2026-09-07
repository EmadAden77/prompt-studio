import { buildCanonicalV3UserOutput as buildPhase52_1CanonicalV3UserOutput } from "./canonical-v3-phase52-1.js";
import { buildCanonicalV3UserOutput as buildPhase54CanonicalV3UserOutput } from "./canonical-v3-phase54.js";
import { buildWikiPromptSectionContract, normalizePhase54Aliases, WIKIPROMPT_CAR_SELFIE_RULES } from "./wikiprompt-realistic-selfie-phase54.js";
import { resolveClothingText } from "../clothing-authority.js";

const text=value=>String(value??"").trim();
const words=value=>text(value).split(/\s+/u).filter(Boolean).length;
const lower=value=>text(value).toLowerCase();

export const LHD_VEHICLE_RELATIVE_ANCHORS="LHD visual anchors: the driver's seat and steering wheel occupy the vehicle LEFT; the empty Ivory passenger seat occupies the cabin RIGHT; the dark-wood center console is between the front seats on the driver's RIGHT; the driver's seatbelt retractor and B-pillar are beside his LEFT shoulder.";
export const LHD_SELFIE_VIEWER_MAPPING="Selfie viewer mapping: when he faces the camera, his LEFT-side door, B-pillar and seatbelt appear on the viewer's RIGHT, while the empty passenger seat appears on the viewer's LEFT.";
export const LHD_STEERING_ANCHOR="Steering wheel: centered only in front of the LEFT seat; no wheel or pedal geometry on the cabin right.";
export const LHD_REAR_SEAT_ANCHOR="Rear Ivory seats span behind both front seats; rear-left is behind the driver.";

const EXPRESSIONS=Object.freeze({
  neutral:"Neutral closed-mouth expression.",
  focused:"Focused neutral expression.",
  serious:"Serious closed-mouth expression.",
  "small-smile":"Small natural closed-mouth smile.",
  smile:"Natural visible smile.",
  laughing:"Natural laughing expression."
});

const HAIR=Object.freeze({
  "hand-neat":"neatly hand-styled",
  messy:"slightly messy but believable",
  "sweep-back":"swept back naturally",
  "side-sweep":"textured side-swept",
  "french-crop":"short French-crop styled",
  natural:"natural"
});

const POSES=Object.freeze({
  "driver-seat":"Pose: naturally seated upright in the driver seat with relaxed shoulders and believable seat contact.",
  "driver-close":"Pose: close driver-seat selfie; upper torso dominant, partial steering-wheel arc when natural.",
  "driver-low":"Pose: driver-seat selfie with phone slightly below eye level at natural arm reach; torso relaxed.",
  "roof-context":"Pose: slightly wider driver-seat selfie that naturally includes part of the panoramic roof and headliner."
});

function selectedPose(raw={}){
  const requested=text(raw.pose||raw.selfiePose);
  return POSES[requested]||POSES["driver-seat"];
}

function selectedClothing(raw={}){
  const resolved=text(resolveClothingText(raw.clothing,raw));
  return resolved?`Subject wearing ${resolved}.`:"";
}

function selectedExpression(raw={}){
  return EXPRESSIONS[text(raw.expression)]||EXPRESSIONS.neutral;
}

function selectedHair(raw={}){
  const requested=lower(raw.hair);
  if(!requested||requested==="auto"||requested==="natural-auto"||requested==="default") return "";
  const style=HAIR[requested]||text(raw.hair).replace(/-/gu," ");
  return `Hair: ${style}, preserving reference hairline/density.`;
}

function lightingSentence(raw={}){
  const lighting=lower(raw.lighting);
  const time=lower(raw.time);
  if(lighting.includes("flash")) return "Car lighting: direct phone flash lights the face; cabin/window background stays darker with short hard shadows.";
  if(/day|daylight|window|sun|overcast|shade/u.test(`${lighting} ${time}`)) return "Car lighting: soft daylight enters through vehicle glass, shaping the Ivory cabin with real shadows, no studio fill.";
  return "Car lighting: cabin practical light dominates; face brighter than darker window view, restrained phone grain.";
}

function throughGlassLife(raw={}){
  const daylight=/day|daylight|window|sun|overcast|shade/u.test(`${lower(raw.lighting)} ${lower(raw.time)}`);
  const dense=/busy|active|medium|high|street|city|people|crowd|traffic/u.test(`${lower(raw.messiness)} ${lower(raw.peopleDensity)} ${lower(raw.environmentNote)}`);
  if(daylight&&dense) return "Through glass: ordinary Saudi street life stays secondary, with parked cars, passing vehicles, storefront daylight and a few pedestrians.";
  if(daylight) return "Through glass: ordinary Saudi street life stays secondary, with parked cars, daylight storefronts and a few pedestrians.";
  if(dense) return "Through glass: ordinary Saudi street life stays secondary, with parked cars, passing headlights, road lights and a few pedestrians.";
  return "Through glass: ordinary Saudi street life stays secondary, with parked cars, road lights and a few pedestrians.";
}

function buildCarPrompt(raw={}){
  const parts=[
    "ChatGPT Images: create one candid front-camera selfie inside a parked 2017 Range Rover Sport Autobiography Dynamic L494.",
    "He sits in the driver seat, holding the phone at arm reach with one hand; the other hand stays free.",
    "Preserve reference identity: face structure, feature spacing, skin tone, hairline, beard/moustache pattern, apparent age and asymmetry; no beautification.",
    selectedClothing(raw),
    selectedExpression(raw),
    selectedHair(raw),
    "Tall 195 cm, 88 kg lean-athletic build; believable seated scale.",
    LHD_VEHICLE_RELATIVE_ANCHORS,
    LHD_SELFIE_VIEWER_MAPPING,
    LHD_STEERING_ANCHOR,
    LHD_REAR_SEAT_ANCHOR,
    "Cabin: Ivory perforated leather, dark wood, black-and-Ivory steering wheel, transparent panoramic roof and Ivory headliner; show only angle-visible details.",
    selectedPose(raw),
    lightingSentence(raw),
    throughGlassLife(raw),
    "Realism: seat compression, touched wood/controls, coherent glass reflections, natural skin and clothing texture.",
    "Direct selfie; mirror physics not applicable.",
    "No driving, passenger relocation, exterior pose, studio/ring light."
  ].filter(Boolean);
  return parts.join(" ").trim();
}

const WRONG_SIDE_STEERING=/steering wheel\s+(?:is\s+|sits\s+|appears\s+|located\s+|centered\s+)?(?:on|at|in)\s+(?:the\s+)?(?:cabin|vehicle)\s+RIGHT/iu;

function assertCarPrompt(prompt){
  const forbidden=[
    /Selected controls:/iu,/city=/iu,/background=/iu,/fabric=/iu,/hair=/iu,/Dammam|Riyadh|Jeddah/iu,
    /busy traffic|crowd of people|landmark|skyline/iu,/front grille|rear tailgate|standing beside|leaning against the .*driver door/iu,
    /driver(?:'s)? (?:seatbelt|belt|B-pillar).*RIGHT shoulder/iu,/passenger seat.*vehicle LEFT/iu,
    WRONG_SIDE_STEERING,/ISO\b|\byaw\b|\bpitch\b|\broll\b|f\/\d/iu
  ];
  for(const pattern of forbidden) if(pattern.test(prompt)) throw new Error(`Phase 55 car-interior leakage: ${pattern}`);
  if(!/parked 2017 Range Rover Sport Autobiography Dynamic L494/iu.test(prompt)) throw new Error("Phase 55 missing parked vehicle identity");
  if(!prompt.includes(LHD_VEHICLE_RELATIVE_ANCHORS)) throw new Error("Phase 55 missing vehicle-relative anchors");
  if(!prompt.includes(LHD_SELFIE_VIEWER_MAPPING)) throw new Error("Phase 55 missing selfie viewer mapping");
  if(!prompt.includes(LHD_STEERING_ANCHOR)) throw new Error("Phase 55 missing steering-wheel centering");
  if(!prompt.includes(LHD_REAR_SEAT_ANCHOR)) throw new Error("Phase 55 missing rear-seat consistency");
  if(!/Preserve reference identity:/iu.test(prompt)) throw new Error("Phase 55 identity lock missing");
  if(!/holding the phone at arm reach with one hand; the other hand stays free/iu.test(prompt)) throw new Error("Phase 55 selfie lock missing");
  if(!/Cabin: Ivory perforated leather, dark wood, black-and-Ivory steering wheel, transparent panoramic roof and Ivory headliner/iu.test(prompt)) throw new Error("Phase 55 cabin fidelity changed");
  if(!/Subject wearing /iu.test(prompt)) throw new Error("Phase 55 clothing control missing");
  if(!/expression\./iu.test(prompt)) throw new Error("Phase 55 expression control missing");
  if(!/ordinary Saudi street life/iu.test(prompt)) throw new Error("Phase 55 through-glass Saudi life missing");
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
      semanticSelectionSupersession:false,determinism:"10/10"
    }),
    phase55:Object.freeze({
      active:true,section:"car",scope:Object.freeze(["seats","cabin","driver-seat poses","car lighting","subject appearance","through-glass Saudi street life"]),wikiPromptSource:contract.source,
      wikiPromptSpecialization:WIKIPROMPT_CAR_SELFIE_RULES,rawGenericControlsInjected:false,namedExteriorContextAllowed:false,
      fixedDomains:Object.freeze(["seats","cabin","L494 vehicle fidelity","LHD cabin geometry"]),selectableDomains:Object.freeze(["clothing","expression","hair","driver-seat pose","car lighting","through-glass background life"]),
      subjectControlsEnabled:true,backgroundLifeEnabled:true,naturalPropIntegration:false,mirrorRule:"not-applicable-direct-front-camera",
      simpleCameraLanguage:true,actionFirst:true,contextConsistency:true,subtleImperfections:true,
      lhdVisualAnchors:true,viewerMapping:true,steeringWheelCenteredOnLeftSeat:true,rearLeftBehindDriver:true,
      wordCount:words(prompt),hardLimit:280,determinism:"10/10"
    }),
    prompt
  });
}

export default buildCanonicalV3UserOutput;
