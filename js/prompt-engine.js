import {
  ANATOMY_AND_CAPTURE_LOCK,
  BASE_NEGATIVE,
  BASE_SKIN_TEXTURE,
  BASE_TEMPLATES,
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
} from "./data.js";

const valueOrDefault = (value, fallback) => (value ? value : fallback);

const optionText = (options, value, fallback = "") =>
  options.find((option) => option.value === value)?.text ?? fallback;

const sceneOption = (scene, value) =>
  SCENES[scene].clothing.find((option) => option.value === value);

const cleanText = (value) => value?.trim().replace(/\s+/g, " ") ?? "";

const compact = (parts) =>
  parts
    .flat()
    .map((part) => cleanText(part))
    .filter(Boolean)
    .join(", ");

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
  identityNotes: "",
  activity: "",
  environmentNote: "",
  hasReference: false
};

export function getClothingOptions(scene) {
  return SCENES[scene]?.clothing ?? [];
}

export function getLightingOptions(scene, time) {
  return LIGHTING_OPTIONS[scene]?.[time] ?? [];
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
  return state;
}

export function getTemplate(state) {
  const key = `${state.scene}:${state.time}:${state.mode}`;
  if (BASE_TEMPLATES[key]) return BASE_TEMPLATES[key];
  return {
    title: `${SCENES[state.scene].label} — ${state.time === "night" ? "ليلاً" : "نهاراً"}`,
    text: FALLBACK_TEMPLATES[key] ?? "candid documentary photograph with physically coherent lighting, exposure, and optics"
  };
}

function buildCameraGeometry(state) {
  const composition = optionText(COMPOSITION_OPTIONS, state.composition);
  if (state.mode === "selfie") {
    return compact([
      CAMERA.selfie,
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

function buildContextPhysics(state) {
  const city = optionText(CITIES, state.city, "Saudi Arabia");
  const scene = SCENES[state.scene];
  const baseScene = `${scene.environment}, ${city}`;
  const clutter = optionText(MESSINESS_OPTIONS, state.messiness);
  const userContext = cleanText(state.environmentNote);
  const activity = cleanText(state.activity);
  const modeSpecific = state.scene === "rangeRover"
    ? "vehicle is fully stationary and safely parked; no driving action, no motion blur implying travel, four wheels and left-hand-drive cabin geometry remain coherent"
    : "all visible objects rest on credible surfaces with correct occlusion, contact shadows and scale";
  return compact([baseScene, clutter, activity && `natural action: ${activity}`, userContext, modeSpecific]);
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
  const selected = optionText(getLightingOptions(state.scene, state.time), state.lighting);
  const timeTexture = state.time === "night"
    ? "realistic high-ISO luminance and chroma noise where darkness requires it, restrained sharpening, imperfect white balance, no HDR glow"
    : "realistic daylight exposure, restrained highlight roll-off, natural sensor grain, no fake HDR or excessive saturation";
  return compact([
    selected,
    "all facial highlights, cast shadows, eye catchlights, textile sheen and reflective surfaces agree with the same visible light sources",
    timeTexture
  ]);
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
    template.text,
    buildContextPhysics(state),
    buildStyling(state),
    buildCameraGeometry(state),
    buildLighting(state),
    BASE_SKIN_TEXTURE,
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
  if (state.scene === "rangeRover") {
    contextual.push("moving vehicle", "wrong steering side", "duplicated wheels", "warped dashboard", "melted wood trim", "incorrect windshield reflections");
  }
  if (state.scene === "gym") contextual.push("broken mirror geometry", "duplicated equipment", "impossible metal reflections");
  if (state.scene === "street") contextual.push("garbled Arabic signage", "duplicated cars", "floating vehicles", "impossible wet asphalt reflections");
  return compact([...BASE_NEGATIVE, ...contextual]);
}

export function buildRealismQa(rawState = {}) {
  const state = normalizeState(rawState);
  const template = getTemplate(state);
  const lighting = optionText(getLightingOptions(state.scene, state.time), state.lighting);
  return [
    { label: "الهوية", value: "مرجع واحد فقط مع تثبيت الملامح وكثافة الشعر" },
    { label: "المشهد", value: `${SCENES[state.scene].label} — ${template.title}` },
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
