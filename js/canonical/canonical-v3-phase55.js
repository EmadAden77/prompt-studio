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

const EXPRESSIONS=Object.freeze({
  neutral:"Neutral closed-mouth expression.",
  focused:"Focused neutral closed-mouth expression.",
  serious:"Serious closed-mouth expression.",
  "small-smile":"Small natural closed-mouth smile.",
  smile:"Natural visible smile.",
  laughing:"Natural laughing expression."
});

const POSES=Object.freeze({
  "driver-seat":"Pose: naturally seated upright in the driver seat with relaxed shoulders and believable seat contact.",
  "driver-close":"Pose: close driver-seat selfie with upper torso dominant and a partial steering-wheel arc only when naturally visible.",
  "driver-low":"Pose: driver-seat selfie with the phone slightly below eye level at normal arm reach, without stretching or twisting the torso.",
  "roof-context":"Pose: slightly wider driver-seat selfie that naturally includes part of the panoramic roof and headliner."
});

function selectedPose(raw={}){
  const requested=text(raw.pose||raw.selfiePose);
  return POSES[requested]||POSES["driver-seat"];
}

function selectedExpression(raw={}){
  return EXPRESSIONS[text(raw.expression)]||EXPRESSIONS.neutral;
}

function selectedClothing(raw={}){
  const resolved=text(resolveClothingText(raw.clothing,raw));
  return resolved?`Subject wearing ${resolved}.`:"";
}

function lightingSentence(raw={}){
  const lighting=text(raw.lighting).toLowerCase();
  const time=text(raw.time).toLowerCase();
  if(lighting.includes("flash")) return "Night lighting: direct phone flash lights the nearby face while cabin and window background stay darker with ordinary hard shadows.";
  if(time==="day"||lighting.includes("day")) return "Day lighting: soft real daylight enters through the vehicle glass, with natural cabin shadows and no studio fill.";
  return "Night lighting: cabin practical light is dominant; face naturally brighter than the darker window view, with mild phone grain.";
}

function buildCarPrompt(raw={}){
  const parts=[
    "ChatGPT Images: create one candid front-camera selfie inside a parked 2017 Range Rover Sport Autobiography Dynamic L494.",
    "He sits naturally in the driver seat, holding the phone at arm reach with one hand; the other hand stays free.",
    "Preserve reference identity: facial structure, feature spacing, skin tone, hairline, beard/moustache pattern, apparent age and natural asymmetry; no beautification, slimming or de-aging.",
    selectedClothing(raw),
    selectedExpression(raw),
    "Tall 195 cm, 88 kg lean-athletic build with believable seated scale.",
    LHD_VEHICLE_RELATIVE_ANCHORS,
    LHD_SELFIE_VIEWER_MAPPING,
    LHD_STEERING_ANCHOR,
    LHD_REAR_SEAT_ANCHOR,
    "Cabin: Ivory perforated leather, dark wood, black-and-Ivory steering wheel, transparent panoramic roof and Ivory headliner; show only angle-visible details.",
    selectedPose(raw),
    lightingSentence(raw),
    "Background stays cabin-only; outside through glass is soft and anonymous.",
    "Keep subtle skin texture, ordinary clothing creases and touched-surface wear. No driving, passenger-seat relocation, exterior pose, studio/ring light or staged display."
  ].filter(Boolean);
  return parts.join(" ").trim();
}

const WRONG_SIDE_STEERING=/steering wheel\s+(?:is\s+|sits\s+|appears\s+|located\s+|centered\s+)?(?:on|at|in)\s+(?:the\s+)?(?:cabin|vehicle)\s+RIGHT/iu;

function assertCarPrompt(prompt){
  const forbidden=[
    /Selected controls:/iu,/city=/iu,/background=/iu,/fabric=/iu,/hair=/iu,/Dammam|Riyadh|Jeddah/iu,
    /busy traffic|crowd|landmark/iu,/front grille|rear tailgate|standing beside|leaning against the .*driver door/iu,
    /driver(?:'s)? (?:seatbelt|belt|B-pillar).*RIGHT shoulder/iu,/passenger seat.*vehicle LEFT/iu,
    WRONG_SIDE_STEERING,/ISO\b|\byaw\b|\bpitch\b|\broll\b|f\/\d/iu
  ];
  for(const pattern of forbidden) if(pattern.test(prompt)) throw new Error(`Phase 52 LHD car-interior leakage: ${pattern}`);
  if(!/parked 2017 Range Rover Sport Autobiography Dynamic L494/iu.test(prompt)) throw new Error("Phase 52 LHD missing parked vehicle identity");
  if(!prompt.includes(LHD_VEHICLE_RELATIVE_ANCHORS)) throw new Error("Phase 52 LHD missing vehicle-relative anchors");
  if(!prompt.includes(LHD_SELFIE_VIEWER_MAPPING)) throw new Error("Phase 52 LHD missing selfie viewer mapping");
  if(!prompt.includes(LHD_STEERING_ANCHOR)) throw new Error("Phase 52 LHD missing steering-wheel centering");
  if(!prompt.includes(LHD_REAR_SEAT_ANCHOR)) throw new Error("Phase 52 LHD missing rear-seat consistency");
  if(!/Preserve reference identity:/iu.test(prompt)) throw new Error("Phase 52 LHD identity lock missing");
  if(!/holding the phone at arm reach with one hand; the other hand stays free/iu.test(prompt)) throw new Error("Phase 52 LHD selfie lock missing");
  if(words(prompt)>280) throw new Error(`Phase 52 LHD car prompt budget overflow: ${words(prompt)} words`);
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
      simpleCameraLanguage:true,actionFirst:true,contextConsistency:true,subtleImperfections:true,
      lhdVisualAnchors:true,viewerMapping:true,steeringWheelCenteredOnLeftSeat:true,rearLeftBehindDriver:true,
      wordCount:words(prompt),hardLimit:280,determinism:"10/10"
    }),
    prompt
  });
}

export default buildCanonicalV3UserOutput;
