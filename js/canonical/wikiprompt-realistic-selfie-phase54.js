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
  allowedSceneDomains:Object.freeze(["seats","cabin","driver-seat pose","car lighting"]),
  allowedGlobalSubjectControls:Object.freeze(["clothing","custom clothing","expression","identity-safe hair arrangement","day/night time"]),
  contextualRealismControls:Object.freeze(["selected Saudi city context","background density","people density","place state"]),
  actionFirst:"Begin with one natural seated driver action from the selected driver-seat pose, not a static catalog pose.",
  contextConsistency:"Keep the fixed parked-car seats and cabin authoritative. Global clothing, expression, identity-safe hair arrangement and day/night time remain active without changing vehicle geometry.",
  subtleImperfections:"Use restrained real-world imperfections caused by contact and capture: natural seat compression, ordinary clothing folds, faint touched-surface wear, coherent glass reflections and sensor-limited detail. Never add decorative grime or random clutter.",
  simpleCameraLanguage:"Use simple front-camera and natural arm-reach language. Avoid ISO, aperture and yaw/pitch/roll jargon in the final ChatGPT Images prompt.",
  observableBackground:"The cabin stays primary, but physically visible windshield and side-window areas may show an ordinary Saudi street with sparse pedestrians, parked or passing vehicles, façades, curbs and practical lights. Exterior detail stays secondary, perspective-correct and visible only through real glass paths.",
  naturalPropIntegration:"Unrelated products and props remain disabled. Do not turn the cabin into a product display.",
  mirrorRule:"Not applicable to a direct front-camera car selfie. Preserve explicit vehicle-relative LHD anchors plus the separate facing-camera viewer mapping; never infer a mirrored cabin.",
  lightingPhysics:"Day and night are physically distinct. Day uses real sun/sky light through vehicle glass with coherent shadows and phone dynamic range. Night uses cabin, street, building and vehicle practical lights with realistic falloff, darker unlit areas, glass reflections and restrained shadow noise.",
  saudiEnvironment:"Use the selected city only as geographic context for ordinary Saudi roads, façades, vegetation, vehicles and lighting. Never force readable city-name signs, landmarks, crowds or luxury-Gulf clichés.",
  realismAuthority:"Physical realism is mandatory and cannot be disabled by section isolation. Every visible person, vehicle, reflection, shadow and surface must belong to the same camera, perspective, time and lighting event.",
  forbiddenLeakage:Object.freeze(["fabric-state contradiction","unrelated accessory","unrelated prop","readable city-name signage","forced landmark","staged crowd","car exterior pose","passenger-seat relocation","driving motion","studio light","ring light","post-processing override"])
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
  car:"Keep the subject naturally seated in the stationary driver position. Car-specific scene authority remains limited to fixed seats, fixed cabin, selected driver-seat pose and selected car lighting, while global clothing, expression, identity-safe hair and day/night controls stay active. Realism is always on: preserve LHD geometry, physical contact, coherent glass, genuine day/night light and ordinary Saudi street life visible only through angle-permitted glass.",
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
