import { buildCanonicalV3UserOutput as buildPhase52_1CanonicalV3UserOutput } from "./canonical-v3-phase52-1.js";
import { buildCanonicalV3UserOutput as buildPhase54CanonicalV3UserOutput } from "./canonical-v3-phase54.js";
import { buildWikiPromptSectionContract, normalizePhase54Aliases, WIKIPROMPT_CAR_SELFIE_RULES } from "./wikiprompt-realistic-selfie-phase54.js";
import { resolveClothingText } from "../clothing-authority.js";

const text=value=>String(value??"").trim();
const words=value=>text(value).split(/\s+/u).filter(Boolean).length;

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
  return "Night lighting: cabin practical light is dominant; face stays naturally brighter than the darker window view, with mild phone grain and no daylight-like shadow lift.";
}

function buildCarPrompt(raw={}){
  const parts=[
    "ChatGPT Images: create one candid front-camera selfie inside a parked 2017 Range Rover Sport Autobiography Dynamic L494.",
    "He sits naturally in the driver seat, holding the phone at arm reach with one hand while the other stays free.",
    "Preserve reference identity exactly: face/head shape, proportions, feature spacing, eyes, brows, nose, lips, jaw/chin, ears, skin tone, hairline, beard/moustache pattern, apparent age and natural asymmetry; no beautification, slimming or de-aging.",
    selectedClothing(raw),
    selectedExpression(raw),
    "Tall 195 cm, 88 kg lean-athletic build with believable seated scale.",
    "LHD geometry: driver door/window at his left, console at his right, steering wheel directly ahead; never swap these physical relationships or turn them into image-frame left/right rules.",
    "Cabin: Ivory perforated leather, dark wood, black-and-Ivory steering wheel, transparent panoramic roof and Ivory headliner; show only angle-visible details.",
    selectedPose(raw),
    lightingSentence(raw),
    "Background stays cabin-only; outside through glass is soft and anonymous, never a named city, landmark, crowd or busy street.",
    "Keep subtle skin texture, ordinary clothing creases and slight touched-surface wear. No driving, passenger-seat relocation, exterior pose, studio/ring light or staged product display."
  ].filter(Boolean);
  return parts.join(" ").trim();
}

function assertCarPrompt(prompt){
  const forbidden=[
    /Selected controls:/iu,
    /city=/iu,
    /background=/iu,
    /fabric=/iu,
    /hair=/iu,
    /Dammam|Riyadh|Jeddah/iu,
    /busy traffic|crowd|landmark/iu,
    /front grille|rear tailgate|standing beside|leaning against the .*driver door/iu,
    /ISO\b|\byaw\b|\bpitch\b|\broll\b|\bmm\b|f\/\d/iu
  ];
  for(const pattern of forbidden) if(pattern.test(prompt)) throw new Error(`Phase 55 car-interior leakage: ${pattern}`);
  if(!/parked 2017 Range Rover Sport Autobiography Dynamic L494/iu.test(prompt)) throw new Error("Phase 55 missing parked vehicle identity");
  if(!/driver door\/window at his left, console at his right, steering wheel directly ahead/iu.test(prompt)) throw new Error("Phase 55 missing physical LHD mapping");
  if(!/Background stays cabin-only/iu.test(prompt)) throw new Error("Phase 55 missing cabin-only background authority");
  if(words(prompt)>250) throw new Error(`Phase 55 car prompt budget overflow: ${words(prompt)} words`);
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
      active:true,
      section:"car",
      wikiPromptSource:contract.source,
      wikiPromptRules:contract.rules,
      wikiPromptCarRules:WIKIPROMPT_CAR_SELFIE_RULES,
      fieldEvidence:Object.freeze([]),
      injectedFieldEvidence:Object.freeze([]),
      contradictions:Object.freeze([]),
      allCommonFieldsRouted:false,
      inactiveSectionLeakageForbidden:true,
      promptTarget:"chatgpt-images",
      carInteriorAuthority:true,
      physicalRealismEnforced:true,
      semanticSelectionSupersession:true,
      determinism:"10/10"
    }),
    phase55:Object.freeze({
      active:true,
      section:"car",
      scope:Object.freeze(["seats","cabin","driver-seat poses","car lighting"]),
      wikiPromptSource:contract.source,
      wikiPromptSpecialization:WIKIPROMPT_CAR_SELFIE_RULES,
      rawGenericControlsInjected:false,
      namedExteriorContextAllowed:false,
      simpleCameraLanguage:true,
      actionFirst:true,
      contextConsistency:true,
      subtleImperfections:true,
      wordCount:words(prompt),
      hardLimit:250,
      determinism:"10/10"
    }),
    prompt
  });
}

export default buildCanonicalV3UserOutput;
