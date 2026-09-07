import { getSection } from "../sections/index.js";

export const WIKIPROMPT_REALISTIC_SELFIE_SOURCE = Object.freeze({
  url:"https://www.wikiprompt.org/realistic-selfie-image-prompt-generator-system-prompt",
  title:"Realistic selfie image-prompt generator system prompt",
  sourceUpdated:"2026-08-27",
  integration:"paraphrased-contextual-contract"
});

export const WIKIPROMPT_REALISTIC_SELFIE_RULES = Object.freeze({
  actionFirst:true,
  contextConsistency:true,
  subtleImperfections:true,
  simplePhoneCameraLanguage:true,
  observableBackground:true,
  naturalPropIntegration:true,
  mirrorPhysicsRequired:true,
  explicitUserAuthority:true,
  inactiveSectionLeakageForbidden:true
});

export const WIKIPROMPT_CAR_SELFIE_RULES = Object.freeze({
  allowedDomains:Object.freeze(["seats","cabin","driver-seat pose","car lighting","subject clothing","face expression","hair","through-glass Saudi street life"]),
  actionFirst:"Begin with one natural seated driver action from the selected driver-seat pose, not a static catalog pose.",
  contextConsistency:"The fixed parked-car seats and cabin remain authoritative while selected clothing, expression, hair, driver-seat pose, car lighting and through-glass Saudi background life shape the realistic moment.",
  subtleImperfections:"Use restrained realism: believable seat compression, touched-surface wear, natural glass reflections, real skin/clothing texture and ordinary street activity behind glass.",
  simpleCameraLanguage:"Use simple front-camera and natural arm-reach language; avoid ISO, focal-length, aperture, yaw/pitch/roll jargon in the final ChatGPT Images prompt.",
  observableBackground:"Background is primarily cabin: seats, center console, door/B-pillar, steering wheel, rear seats, glass, roof and headliner. Outside through glass remains secondary but alive: Saudi street lights, parked cars, passing vehicles, storefronts and a few pedestrians.",
  naturalPropIntegration:"Props and product placement remain disabled unless they are explicitly car-relevant and physically held or visible without display staging.",
  mirrorRule:"Not applicable to a direct front-camera car selfie. Preserve the explicit vehicle-relative LHD anchors and their separate selfie viewer mapping; never infer a mirrored cabin.",
  selectionAuthority:"Clothing, expression and hair are active person controls. Pose and lighting are active car controls. Seats, cabin, vehicle fidelity and LHD geometry remain fixed. City, density and environment notes may only influence secondary through-glass Saudi life, never landmarks, skyline staging or exterior relocation.",
  forbiddenLeakage:Object.freeze(["raw selected controls","fabric contradiction","accessory display","prop display","tourism landmark","skyline staging","crowd staging","car exterior pose","passenger-seat relocation","driving motion","studio light","ring light","post-processing gimmick"])
});

const text=value=>String(value??"").trim();
const clean=value=>text(value).replace(/\s+/gu," ");
const NEUTRAL_VALUES=new Set([
  "","auto","none","default","off","normal","natural-auto","natural","neutral","close","eye",
  "light","lightly-unpressed","home-used","relaxed","riyadh","minimal","night-charcoal-closed"
]);
const meaningful=(key,value)=>{
  const v=clean(value);
  if(!v) return false;
  if(NEUTRAL_VALUES.has(v.toLowerCase())) return false;
  if(key==="streetHour"&&!Number.isFinite(Number(v))) return false;
  return true;
};

const SECTION_GUIDANCE=Object.freeze({
  solo:"Keep the moment activity-led and candid; supporting details must match the selected place rather than inventing a staged setup.",
  group:"Keep one clear phone-holder and a shared candid group moment; people remain distinct and naturally distributed instead of posing identically.",
  car:"Keep the subject naturally seated in the stationary driver position. Preserve exact L494 cabin and LHD geometry, keep clothing/expression/hair active, and use Saudi street life only as secondary through-glass realism. Apply action-first behavior, context consistency, subtle imperfections, simple phone language, observable cabin background and non-mirror LHD physics.",
  carExterior:"Keep the vehicle as contextual support to the selfie; preserve the selected L494 geometry and pose without turning the frame into a product display.",
  bedroom:"Keep the room lived-in rather than staged; furniture contact, clothing and small imperfections must match the subject's actual action.",
  gym:"Keep the scene workout-consistent; athletic context, subtle exertion cues and accessories must fit the activity while explicit user clothing remains authoritative.",
  street:"Keep the outdoor moment action-led; wind, pavement activity and background elements should be ordinary, visible and secondary to the selfie.",
  accidental:"Keep the capture genuinely unfinished and unposed; motion, focus and exposure behavior must agree with the selected accidental-capture controls.",
  custom:"Treat the user-written place as authority; add only context that is physically compatible with the written activity and visible framing.",
  mirror:"Use real mirror capture geometry; the phone points at the mirror, the subject is seen through reflection, and visible text remains viewer-readable."
});

const FIELD_DEFS=Object.freeze([
  ["city","City"],
  ["identityNotes","Identity note"],
  ["customScene","Custom scene"],
  ["customSceneDetails","Custom scene details"],
  ["clothingCustom","Custom clothing"],
  ["hair","Hair styling"],
  ["skin","Skin state"],
  ["fabric","Fabric"],
  ["fabricWeight","Fabric weight"],
  ["ironState","Iron state"],
  ["wearState","Wear state"],
  ["clothingFit","Clothing fit"],
  ["composition","Composition"],
  ["selfieAngle","Selfie angle"],
  ["bedroomWindow","Bedroom window"],
  ["placeState","Place state"],
  ["peopleDensity","People density"],
  ["subjectMoment","Subject moment"],
  ["interactionObject","Hand interaction"],
  ["sceneProfile","Scene profile"],
  ["accessoryProfile","Accessory"],
  ["accessoryDetail","Accessory detail"],
  ["objectProfile","Object profile"],
  ["messiness","Background density"],
  ["environmentNote","Context note"],
  ["groupKind","Group type"],
  ["groupVibe","Group vibe"],
  ["streetMood","Street mood"],
  ["streetHour","Street hour"]
]);

export function normalizePhase54Aliases(rawInput={}){
  const raw={...(rawInput&&typeof rawInput==="object"?rawInput:{})};
  if(!text(raw.customClothing)&&text(raw.clothingCustom)) raw.customClothing=raw.clothingCustom;
  if(!text(raw.clothingCustom)&&text(raw.customClothing)) raw.clothingCustom=raw.customClothing;
  if(!text(raw.pose)&&text(raw.selfiePose)) raw.pose=raw.selfiePose;
  if(!text(raw.selfiePose)&&text(raw.pose)) raw.selfiePose=raw.pose;
  return Object.freeze(raw);
}

export function buildWikiPromptFieldEvidence(rawInput={}){
  const raw=normalizePhase54Aliases(rawInput);
  const section=text(raw.studioSection||raw.scene);
  if(section==="car") return Object.freeze([]);
  const evidence=[];
  for(const [key,label] of FIELD_DEFS){
    const value=raw[key];
    if(Array.isArray(value)) continue;
    if(meaningful(key,value)) evidence.push(`${label}: ${clean(value)}`);
  }
  const effects=Array.isArray(raw.postProcessing)?raw.postProcessing:[raw.postProcessing].filter(Boolean);
  const selectedEffects=effects.map(clean).filter(value=>meaningful("postProcessing",value));
  if(selectedEffects.length) evidence.push(`Post-processing: ${selectedEffects.join(" + ")}`);
  return Object.freeze(evidence);
}

export function buildWikiPromptSectionContract(rawInput={},base={}){
  const raw=normalizePhase54Aliases(rawInput);
  const id=text(base?.section?.id||raw.studioSection)||"solo";
  const section=getSection(id)||getSection("solo");
  const guidance=SECTION_GUIDANCE[id]||SECTION_GUIDANCE.custom;
  const evidence=id==="car"?Object.freeze([]):buildWikiPromptFieldEvidence(raw);
  return Object.freeze({
    active:true,
    section:id,
    source:WIKIPROMPT_REALISTIC_SELFIE_SOURCE,
    rules:WIKIPROMPT_REALISTIC_SELFIE_RULES,
    specialization:id==="car"?WIKIPROMPT_CAR_SELFIE_RULES:null,
    guidance,
    fieldEvidence:evidence,
    mirrorRequired:id==="mirror",
    captureType:section?.captureType||"",
    determinism:"10/10"
  });
}

export default buildWikiPromptSectionContract;
