import {
  ANATOMY_AND_CAPTURE_LOCK,
  BASE_NEGATIVE,
  BASE_TEMPLATES,
  BEDROOM_LIGHTING_OPTIONS,
  BEDROOM_POSITION_OPTIONS,
  BEDROOM_WINDOW_OPTIONS,
  CAMERA,
  CITIES,
  COMPOSITION_OPTIONS,
  EXPRESSION_OPTIONS,
  FALLBACK_TEMPLATES,
  HAIR_OPTIONS,
  IDENTITY_LOCK,
  LIGHTING_OPTIONS,
  MESSINESS_OPTIONS,
  SCENES,
  SELFIE_ANGLE_OPTIONS,
  SKIN_OPTIONS
} from "./physics-data-v4.js";
import { PHYSICS_CONTRACT } from "./policies/physicsPolicy.js";

const valueOrDefault = (value, fallback) => (value ? value : fallback);

const optionText = (options, value, fallback = "") =>
  options.find((option) => option.value === value)?.text ?? fallback;

const sceneOption = (scene, value) =>
  getScene(scene).clothing.find((option) => option.value === value);

const getScene = (sceneId) => SCENES[sceneId] ?? SCENES.bedroom;

const getSceneFamily = (sceneId) => getScene(sceneId).family ?? sceneId;

const getBedroomPositionOption = (position) =>
  BEDROOM_POSITION_OPTIONS.find((option) => option.value === position) ?? null;

function getBedroomWorkPosition(state) {
  if (!isBedroomScene(state.scene)) return null;
  const position = getBedroomPositionOption(state.bedroomPosition);
  return position?.workSelfie ? position : null;
}

export function getBedroomPositionRequirements(position, time) {
  const option = getBedroomPositionOption(position);
  if (!option?.workSelfie) return null;
  return {
    mode: "selfie",
    selfieAngle: option.selfieAngle,
    bedroomWindow: option.windowByTime?.[time],
    bedroomLighting: option.lightingByTime?.[time]
  };
}

const cleanText = (value) => value?.trim().replace(/\s+/g, " ") ?? "";

const compact = (parts) =>
  parts
    .flat()
    .map((part) => cleanText(part))
    .filter(Boolean)
    .join(", ");

const XIAOMI_15_ULTRA_FRONT_CAMERA = [
  "Xiaomi 15 Ultra front camera only",
  "32MP OV32B",
  "21mm-equivalent f/2.0 perspective",
  "approximately 90-degree field of view",
  "natural Xiaomi front-camera color rendering",
  "restrained saturation",
  "realistic automatic white balance",
  "phone held at a physically possible 40–70 cm arm reach",
  "no floating camera",
  "no impossible selfie geometry"
];

const PHONE_CAMERA_SKIN_REALISM = [
  "raw unedited photo",
  "natural phone-camera skin rendering",
  "visible but non-exaggerated pores",
  "fine facial texture",
  "small natural blemishes",
  "slight local tonal variation",
  "subtle fine wrinkles and peach fuzz only where naturally present",
  "restrained sharpening",
  "realistic low-level sensor noise",
  "unretouched documentary capture",
  "natural skin oil reflection"
];

export const DEFAULT_STATE = {
  scene: "bedroom",
  city: "riyadh",
  time: "night",
  mode: "selfie",
  clothing: "sleep-set",
  clothingCustom: "",
  hair: "natural",
  skin: "neutral",
  expression: "neutral",
  composition: "close",
  selfieAngle: "eye",
  messiness: "natural",
  lighting: "bedside-lamp",
  bedroomPosition: "bed-edge",
  bedroomWindow: "night-blackout",
  bedroomLighting: "bedside-3000",
  bedroomDetail: "",
  identityNotes: "",
  activity: "",
  environmentNote: "",
  hasReference: false
};

export function isBedroomScene(sceneId) {
  return getSceneFamily(sceneId) === "bedroom";
}

export function isTextRoomReference(sceneId) {
  const scene = getScene(sceneId);
  return Boolean(scene.text_reference && scene.description_en);
}

export function getClothingOptions(scene) {
  return getScene(scene).clothing ?? [];
}

export function getLightingOptions(scene, time) {
  return LIGHTING_OPTIONS[getSceneFamily(scene)]?.[time] ?? [];
}

export function getBedroomPositionOptions() {
  return BEDROOM_POSITION_OPTIONS;
}

export function getBedroomWindowOptions(time) {
  return BEDROOM_WINDOW_OPTIONS[time] ?? [];
}

export function getBedroomLightingOptions(time) {
  return BEDROOM_LIGHTING_OPTIONS[time] ?? [];
}

export function normalizeState(rawState = {}) {
  const state = { ...DEFAULT_STATE, ...rawState };
  if (!SCENES[state.scene]) state.scene = DEFAULT_STATE.scene;
  if (!CITIES.some((city) => city.value === state.city)) state.city = DEFAULT_STATE.city;
  if (!["day", "night"].includes(state.time)) state.time = DEFAULT_STATE.time;
  if (!["standard", "selfie"].includes(state.mode)) state.mode = DEFAULT_STATE.mode;

  const clothingOptions = getClothingOptions(state.scene);
  if (!clothingOptions.some((option) => option.value === state.clothing)) {
    state.clothing = clothingOptions[0]?.value ?? "";
  }

  const lightingOptions = getLightingOptions(state.scene, state.time);
  if (!lightingOptions.some((option) => option.value === state.lighting)) {
    state.lighting = lightingOptions[0]?.value ?? "";
  }

  const bedroomPositionOptions = getBedroomPositionOptions();
  if (!bedroomPositionOptions.some((option) => option.value === state.bedroomPosition)) {
    state.bedroomPosition = bedroomPositionOptions[0]?.value ?? "";
  }

  const bedroomPositionRequirements = isBedroomScene(state.scene)
    ? getBedroomPositionRequirements(state.bedroomPosition, state.time)
    : null;
  if (bedroomPositionRequirements) Object.assign(state, bedroomPositionRequirements);

  const bedroomWindowOptions = getBedroomWindowOptions(state.time);
  if (!bedroomWindowOptions.some((option) => option.value === state.bedroomWindow)) {
    state.bedroomWindow = bedroomWindowOptions[0]?.value ?? "";
  }

  const bedroomLightingOptions = getBedroomLightingOptions(state.time);
  if (!bedroomLightingOptions.some((option) => option.value === state.bedroomLighting)) {
    state.bedroomLighting = bedroomLightingOptions[0]?.value ?? "";
  }
  return state;
}

export function getTemplate(state) {
  const scene = getScene(state.scene);
  const workPose = getBedroomWorkPosition(state);
  if (workPose) {
    return {
      title: `${workPose.label} — سيلفي غرفة النوم`,
      text: "candid smartphone front-camera work selfie inside the bedroom; the selected visible ceiling downlight is the single dominant room key, while the laptop screen remains only a weak local cool fill, with no hidden bedside-lamp or studio light"
    };
  }
  const key = `${getSceneFamily(state.scene)}:${state.time}:${state.mode}`;
  if (BASE_TEMPLATES[key]) {
    const template = BASE_TEMPLATES[key];
    return isTextRoomReference(state.scene)
      ? { ...template, title: `🏠 غرفتي بدون صورة — ${template.title}` }
      : template;
  }
  return {
    title: `${scene.label} — ${state.time === "night" ? "ليلاً" : "نهاراً"}`,
    text: FALLBACK_TEMPLATES[key] ?? "candid documentary photograph with physically coherent lighting, exposure, and optics"
  };
}

function buildTemplateCaptureCue(state, template) {
  if (getSceneFamily(state.scene) !== "rangeRover") return template.text;
  if (state.time === "day" && state.mode === "selfie") {
    return "candid daytime front-camera selfie from the driver's seat, realistic physical sunlight across the face and cabin, a plausible Saudi street or parking area visible through the side window, restrained daytime grain";
  }
  if (state.time === "night" && state.mode === "selfie") {
    return "candid nighttime front-camera selfie from the driver's seat, dashboard and exterior practical lights kept physically consistent, restrained low-light noise and coherent windshield reflections";
  }
  if (state.time === "day") {
    return "candid daylight portrait from inside the parked cabin, panoramic-roof and side-window light producing source-consistent patterns, bright exterior held within believable phone-camera dynamic range";
  }
  return "candid night portrait from inside the parked cabin, restrained cabin ambient light and dashboard-screen glow, streetlights reflecting coherently in the windshield, realistic low-light noise";
}

function buildCameraGeometry(state) {
  const composition = optionText(COMPOSITION_OPTIONS, state.composition);
  if (state.mode === "selfie") {
    return compact([
      XIAOMI_15_ULTRA_FRONT_CAMERA,
      optionText(SELFIE_ANGLE_OPTIONS, state.selfieAngle),
      composition,
      "front-camera perspective must match the stated arm reach; the phone and arm may be outside the frame only when their geometry remains physically possible"
    ]);
  }
  return compact([
    CAMERA.standard,
    composition,
    "single-viewpoint documentary composition, no hidden studio light, no artificial portrait-mode segmentation"
  ]);
}

function buildBedroomWindowCue(state) {
  const selected = optionText(getBedroomWindowOptions(state.time), state.bedroomWindow);
  if (!isTextRoomReference(state.scene)) return selected;
  if (state.bedroomWindow === "day-sheer") {
    return "the existing charcoal floor-to-ceiling curtains are partly drawn at the window, allowing daylight to diffuse into broad soft gradients across the bedding and floor; preserve the fixed charcoal curtain material and do not invent white sheer curtains";
  }
  return selected;
}

function buildContextPhysics(state) {
  const city = optionText(CITIES, state.city, "Saudi Arabia");
  const scene = getScene(state.scene);
  const baseScene = `${scene.environment}, ${city}`;
  const clutter = optionText(MESSINESS_OPTIONS, state.messiness);
  const userContext = cleanText(state.environmentNote);
  const activity = cleanText(state.activity);
  const bedroomSpecific = isBedroomScene(state.scene)
    ? compact([
      buildBedroomWindowCue(state),
      cleanText(state.bedroomDetail) && `bedroom-specific detail: ${cleanText(state.bedroomDetail)}`
    ])
    : "";
  const modeSpecific = getSceneFamily(state.scene) === "rangeRover"
    ? "vehicle is fully stationary and safely parked; no driving action, no motion blur implying travel, four wheels and left-hand-drive cabin geometry remain coherent"
    : "all visible objects rest on credible surfaces with correct occlusion, contact shadows and scale";
  return compact([baseScene, bedroomSpecific, clutter, activity && `natural action: ${activity}`, userContext, modeSpecific]);
}

function buildBedroomPoseSection(state) {
  if (!isBedroomScene(state.scene)) return "";
  return `[POSE] ${optionText(getBedroomPositionOptions(), state.bedroomPosition)}`;
}

function buildRoomDescription(state) {
  if (!isTextRoomReference(state.scene)) return "";
  const activeBedsideLampIds = new Set([
    "bedside-2700",
    "bedside-3000",
    "lamp-screen-mix",
    "lamp-street-sodium",
    "laptop-lamp"
  ]);
  const bedsideLampText = activeBedsideLampIds.has(state.bedroomLighting)
    ? "dark wood nightstand with the selected visible bedside lamp active"
    : "dark wood nightstand with a bedside lamp present but switched off";
  const description = getScene(state.scene).description_en.replace(
    /dark wood nightstand with a lit lamp/iu,
    bedsideLampText
  );
  return `[ROOM DESCRIPTION — PERMANENT TEXT REFERENCE] ${description} This fixed text-only room description is the sole room authority. IMAGE B is intentionally absent: do not request an environment image, substitute another room, or raise a missing-reference conflict.`;
}

function buildStyling(state) {
  const clothing = sceneOption(state.scene, state.clothing)?.text;
  const customClothing = cleanText(state.clothingCustom);
  const hair = optionText(HAIR_OPTIONS, state.hair);
  const skin = optionText(SKIN_OPTIONS, state.skin);
  const expression = optionText(EXPRESSION_OPTIONS, state.expression);
  return compact([
    customClothing ? `wardrobe: ${customClothing}, real textile weave, seams, folds and contact compression consistent with the pose` : clothing,
    hair,
    skin,
    expression
  ]);
}

function buildLighting(state) {
  const selected = isBedroomScene(state.scene)
    ? optionText(getBedroomLightingOptions(state.time), state.bedroomLighting)
    : optionText(getLightingOptions(state.scene, state.time), state.lighting);
  const timeTexture = state.time === "night"
    ? "realistic high-ISO luminance and chroma noise where darkness requires it, restrained sharpening, imperfect white balance, no HDR glow"
    : "realistic daylight exposure, restrained highlight roll-off, natural sensor grain, no fake HDR or excessive saturation";
  return compact([
    selected,
    "all facial highlights, cast shadows, eye catchlights, textile sheen and reflective surfaces agree with the same visible light sources",
    timeTexture
  ]);
}

function buildLightingSection(state) {
  const lighting = buildLighting(state);
  return isBedroomScene(state.scene) ? `[LIGHTING] ${lighting}` : lighting;
}

function buildReferenceDetail(state) {
  const notes = cleanText(state.identityNotes);
  const attachInstruction = state.hasReference
    ? "the supplied reference image is the sole identity source"
    : "attach exactly one reference image to the target image generator; no second identity image";
  return compact([IDENTITY_LOCK, attachInstruction, notes && `reference observations to preserve: ${notes}`]);
}

export function buildPositivePrompt(rawState = {}) {
  const state = normalizeState(rawState);
  const template = getTemplate(state);
  return compact([
    buildReferenceDetail(state),
    ANATOMY_AND_CAPTURE_LOCK,
    buildTemplateCaptureCue(state, template),
    buildRoomDescription(state),
    buildContextPhysics(state),
    buildBedroomPoseSection(state),
    isBedroomScene(state.scene) ? PHYSICS_CONTRACT : "",
    buildStyling(state),
    buildCameraGeometry(state),
    buildLightingSection(state),
    PHONE_CAMERA_SKIN_REALISM,
    "REALISM QA: preserve one coherent camera, one lens, one perspective, one exposure strategy and source-supported lighting; prioritize identity, anatomy, contact, camera geometry, lighting, reflections and sensor behavior over stylization"
  ]);
}

export function buildNegativePrompt(rawState = {}) {
  const state = normalizeState(rawState);
  const contextual = [
    "face substitution",
    "changed hairline",
    "increased hair density",
    "beauty filter",
    "face slimming",
    "floating limbs",
    "disconnected hands",
    "impossible wrist angle",
    "incorrect contact shadows",
    "impossible reflections",
    "unexplained key light",
    "fake DSLR bokeh",
    "oversharpening halos",
    "watermark",
    "logo overlay"
  ];

  if (state.mode === "selfie") {
    contextual.push("floating camera", "impossible arm reach", "wrong front-camera perspective", "phone visible without a hand holding it");
  }
  if (getSceneFamily(state.scene) === "rangeRover") {
    contextual.push("moving vehicle", "wrong steering side", "duplicated wheels", "warped dashboard", "melted wood trim", "incorrect windshield reflections");
  }
  if (isBedroomScene(state.scene)) {
    contextual.push("floating bedding", "impossible mattress compression", "unexplained bedroom key light", "wrong mirror geometry", "inconsistent curtain light direction");
    if (getBedroomWorkPosition(state)) {
      contextual.push("floating laptop", "laptop hovering off the mattress or thighs", "laptop sinking into the mattress", "merged hands and keyboard", "contradictory laptop-screen glow");
    }
  }
  if (getSceneFamily(state.scene) === "gym") contextual.push("broken mirror geometry", "duplicated equipment", "impossible metal reflections");
  if (getSceneFamily(state.scene) === "street") contextual.push("garbled Arabic signage", "duplicated cars", "floating vehicles", "impossible wet asphalt reflections");
  return compact([...BASE_NEGATIVE, ...contextual]);
}

export function buildRealismQa(rawState = {}) {
  const state = normalizeState(rawState);
  const template = getTemplate(state);
  const lighting = isBedroomScene(state.scene)
    ? optionText(getBedroomLightingOptions(state.time), state.bedroomLighting)
    : optionText(getLightingOptions(state.scene, state.time), state.lighting);
  return [
    { label: "الهوية", value: "مرجع واحد فقط مع تثبيت الملامح وكثافة الشعر" },
    { label: "المشهد", value: `${getScene(state.scene).label} — ${template.title}` },
    ...(isTextRoomReference(state.scene) ? [{ label: "مرجع الغرفة", value: "وصف نصي ثابت — لا يلزم IMAGE B" }] : []),
    ...(getBedroomWorkPosition(state) ? [{ label: "قالب اللابتوب", value: "سيلفي أمامي مقفل مع سبوت سقفي رئيسي وشاشة لابتوب كملء خفيف فقط" }] : []),
    { label: "الكاميرا", value: state.mode === "selfie" ? "كاميرا أمامية ومسافة ذراع واقعية" : "الكاميرا الرئيسية الخلفية فقط" },
    { label: "الإضاءة", value: lighting || "مصدر إضاءة فيزيائي محدد" },
    { label: "الفيزياء", value: "تشريح وتلامس وانعكاسات وتعريض متسق" }
  ];
}

export function buildPromptPack(rawState = {}) {
  const state = normalizeState(rawState);
  return {
    positive: buildPositivePrompt(state),
    negative: buildNegativePrompt(state),
    qa: buildRealismQa(state),
    template: getTemplate(state),
    state
  };
}
