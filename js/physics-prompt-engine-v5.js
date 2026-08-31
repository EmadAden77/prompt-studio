import {
  BASE_NEGATIVE,
  CAMERA_SELFIE_LOCK,
  CITIES,
  CLOTHING_OPTIONS,
  COMPOSITION_OPTIONS,
  EXPRESSION_OPTIONS,
  HAIR_DENSITY_LOCK,
  HAIR_OPTIONS,
  IDENTITY_LOCK,
  LIGHTING_OPTIONS,
  MESSINESS_OPTIONS,
  POSE_FAMILIES,
  REALISM_ORDER,
  SCENES,
  SCENE_PRIORITY_RULE,
  SELFIE_ANGLE_OPTIONS,
  SELFIE_POSES,
  SKIN_OPTIONS,
  SMARTPHONE_REALISM,
  SUBJECT_BODY,
  BEDROOM_WINDOW_OPTIONS,
  sceneFamily
} from "./wiki-selfie-data-v1.js";

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const optionByValue = (options, value) => options.find((item) => item.value === value) ?? null;
const optionText = (options, value, fallback = "") => optionByValue(options, value)?.text ?? fallback;

export const DEFAULT_STATE = Object.freeze({
  scene:"my_bedroom_text",
  city:"riyadh",
  time:"night",
  mode:"selfie",
  poseFamily:"lying",
  pose:"lying-right-close",
  clothing:"sleep-cotton-short",
  clothingCustom:"",
  hair:"natural",
  skin:"neutral",
  expression:"neutral",
  composition:"close",
  selfieAngle:"eye",
  messiness:"natural",
  lighting:"night-bedside-3000",
  bedroomWindow:"night-charcoal-closed",
  identityNotes:"",
  environmentNote:"",
  hasReference:false
});

export function isBedroomScene(sceneId) {
  return sceneFamily(sceneId) === "bedroom";
}

export function isTextRoomReference(sceneId) {
  return Boolean(SCENES[sceneId]?.text_reference);
}

export function getSceneOptions() {
  return Object.entries(SCENES).map(([value, scene]) => ({ value, label:scene.label }));
}

export function getCityOptions() {
  return CITIES.map(({ value, label }) => ({ value, label }));
}

export function getClothingOptions(sceneId) {
  const options = CLOTHING_OPTIONS.filter((item) => item.scenes.includes(sceneId));
  return options.length ? options : CLOTHING_OPTIONS;
}

export function getHairOptions() {
  return HAIR_OPTIONS;
}

export function getSkinOptions() {
  return SKIN_OPTIONS;
}

export function getExpressionOptions() {
  return EXPRESSION_OPTIONS;
}

export function getPoseFamilyOptions(sceneId) {
  const validFamilies = new Set(
    SELFIE_POSES.filter((pose) => pose.scenes.includes(sceneId)).map((pose) => pose.family)
  );
  return POSE_FAMILIES.filter((family) => validFamilies.has(family.value));
}

export function getPoseOptions(sceneId, family) {
  const options = SELFIE_POSES.filter(
    (pose) => pose.scenes.includes(sceneId) && (!family || pose.family === family)
  );
  return options.length
    ? options
    : SELFIE_POSES.filter((pose) => pose.scenes.includes(sceneId));
}

export function getPoseById(poseId) {
  return optionByValue(SELFIE_POSES, poseId);
}

export function getSelfieAngleOptions(poseId) {
  const pose = getPoseById(poseId);
  const allowed = pose?.angles ?? SELFIE_ANGLE_OPTIONS.map((item) => item.value);
  return SELFIE_ANGLE_OPTIONS.filter((item) => allowed.includes(item.value));
}

export function getCompositionOptions(poseId) {
  const pose = getPoseById(poseId);
  const allowed = pose?.compositions ?? COMPOSITION_OPTIONS.map((item) => item.value);
  return COMPOSITION_OPTIONS.filter((item) => allowed.includes(item.value));
}

export function getLightingOptions(sceneId, time) {
  return LIGHTING_OPTIONS[sceneFamily(sceneId)]?.[time] ?? [];
}

export function getBedroomWindowOptions(time) {
  return BEDROOM_WINDOW_OPTIONS[time] ?? [];
}

export function getCompatibleBedroomWindowOptions(time, lightingId) {
  const windows = getBedroomWindowOptions(time);
  const lighting = optionByValue(LIGHTING_OPTIONS.bedroom?.[time] ?? [], lightingId);
  const allowedIds = lighting?.windowIds ?? windows.map((item) => item.value);
  return windows.filter((item) => allowedIds.includes(item.value));
}

function normalizeBedroomWindow(state, lighting) {
  if (!isBedroomScene(state.scene)) return "";
  const windows = getBedroomWindowOptions(state.time);
  const allowedIds = lighting?.windowIds ?? windows.map((item) => item.value);
  if (allowedIds.includes(state.bedroomWindow)) return state.bedroomWindow;
  return allowedIds.find((id) => windows.some((item) => item.value === id)) ?? windows[0]?.value ?? "";
}

export function normalizeState(rawState = {}) {
  const state = { ...DEFAULT_STATE, ...rawState, mode:"selfie" };

  if (!SCENES[state.scene]) state.scene = DEFAULT_STATE.scene;
  if (!["day","night"].includes(state.time)) state.time = DEFAULT_STATE.time;
  if (!CITIES.some((item) => item.value === state.city)) state.city = DEFAULT_STATE.city;

  const familyOptions = getPoseFamilyOptions(state.scene);
  if (!familyOptions.some((item) => item.value === state.poseFamily)) {
    state.poseFamily = familyOptions[0]?.value ?? "relaxed";
  }

  const poseOptions = getPoseOptions(state.scene, state.poseFamily);
  if (!poseOptions.some((item) => item.value === state.pose)) {
    state.pose = poseOptions[0]?.value ?? getPoseOptions(state.scene)[0]?.value ?? "relaxed-close";
  }

  const angleOptions = getSelfieAngleOptions(state.pose);
  if (!angleOptions.some((item) => item.value === state.selfieAngle)) {
    state.selfieAngle = angleOptions[0]?.value ?? "eye";
  }

  const compositionOptions = getCompositionOptions(state.pose);
  if (!compositionOptions.some((item) => item.value === state.composition)) {
    state.composition = compositionOptions[0]?.value ?? "close";
  }

  const clothingOptions = getClothingOptions(state.scene);
  if (!clothingOptions.some((item) => item.value === state.clothing)) {
    state.clothing = clothingOptions[0]?.value ?? "";
  }

  if (!HAIR_OPTIONS.some((item) => item.value === state.hair)) state.hair = DEFAULT_STATE.hair;
  if (!SKIN_OPTIONS.some((item) => item.value === state.skin)) state.skin = DEFAULT_STATE.skin;
  if (!EXPRESSION_OPTIONS.some((item) => item.value === state.expression)) state.expression = DEFAULT_STATE.expression;
  if (!MESSINESS_OPTIONS.some((item) => item.value === state.messiness)) state.messiness = DEFAULT_STATE.messiness;

  const lightingOptions = getLightingOptions(state.scene, state.time);
  if (!lightingOptions.some((item) => item.value === state.lighting)) {
    state.lighting = lightingOptions[0]?.value ?? "";
  }
  const lighting = optionByValue(lightingOptions, state.lighting);
  state.bedroomWindow = normalizeBedroomWindow(state, lighting);

  return state;
}

function buildReferenceSection(state) {
  const referenceInstruction = state.hasReference
    ? "the attached reference image is the sole identity source"
    : "attach exactly one identity reference image when using this prompt";
  const notes = clean(state.identityNotes);
  return [
    "[IDENTITY]",
    IDENTITY_LOCK,
    referenceInstruction,
    SUBJECT_BODY,
    notes ? `Reference-specific observations to preserve if compatible: ${notes}` : ""
  ].filter(Boolean).join(" ");
}

function buildPoseSection(state) {
  const pose = getPoseById(state.pose);
  const angle = optionText(getSelfieAngleOptions(state.pose), state.selfieAngle);
  const composition = optionText(getCompositionOptions(state.pose), state.composition);
  return `[SELFIE POSE] ${pose?.text ?? "a natural subject-held selfie pose"}. ${angle}. ${composition}. The pose, crop and phone position must describe the same single instant.`;
}

function buildHairSection(state) {
  const hair = optionText(HAIR_OPTIONS, state.hair);
  return `[HAIR] ${HAIR_DENSITY_LOCK} Selected arrangement: ${hair}.`;
}

function buildAppearanceSection(state) {
  const clothing = optionText(getClothingOptions(state.scene), state.clothing);
  const clothingCustom = clean(state.clothingCustom);
  const skin = optionText(SKIN_OPTIONS, state.skin);
  const expression = optionText(EXPRESSION_OPTIONS, state.expression);
  const custom = clothingCustom
    ? `Optional clothing modifier: ${clothingCustom}. Apply only if it does not replace or contradict the selected garment structure, pose physics or scene practicality.`
    : "";
  return `[APPEARANCE] ${clothing}. ${custom} ${skin}. ${expression}. Do not turn ordinary clothing or grooming into fashion-editorial styling.`;
}

function buildLightingSection(state) {
  const lighting = optionByValue(getLightingOptions(state.scene, state.time), state.lighting);
  const windowText = isBedroomScene(state.scene)
    ? optionText(getBedroomWindowOptions(state.time), state.bedroomWindow)
    : "";
  return [
    "[PRACTICAL LIGHTING]",
    lighting?.text ?? "use only physically present practical light",
    windowText,
    "All face highlights, cast shadows, eye catchlights, fabric sheen, glass reflections and material speculars must agree with the selected source geometry. No hidden fill light."
  ].filter(Boolean).join(" ");
}

function buildRoomAuthority(state) {
  if (!isTextRoomReference(state.scene)) return "";
  const room = SCENES[state.scene];
  return `[TEXT ROOM AUTHORITY] ${room.description_en} This description fixes room identity only. It does NOT require every listed item to appear in the selfie. Never invent a second room reference image.`;
}

function buildContextSection(state) {
  const scene = SCENES[state.scene];
  const city = optionText(CITIES, state.city, "a plausible Saudi Arabian location");
  const messiness = optionText(MESSINESS_OPTIONS, state.messiness);
  const note = clean(state.environmentNote);
  return [
    "[OPTIONAL CONTEXT]",
    `${scene.environment}; ${city}.`,
    messiness,
    note ? `Optional context note: ${note}. Use it only if physically compatible with the selected pose, crop and lighting.` : "",
    SCENE_PRIORITY_RULE
  ].filter(Boolean).join(" ");
}

function buildSceneSpecificSafety(state) {
  if (sceneFamily(state.scene) === "car") {
    return "The vehicle is fully stationary and safely parked. Preserve left-hand-drive cabin geometry. Do not imply driving, steering motion or road travel.";
  }
  if (sceneFamily(state.scene) === "gym") {
    return "Gym equipment, mirrors and people are secondary context. Do not force mirrors or full machines into the crop.";
  }
  if (sceneFamily(state.scene) === "street") {
    return "Outdoor cars, signs and pedestrians are optional context. Do not rely on readable signage or force a complete vehicle into the frame.";
  }
  if (isBedroomScene(state.scene)) {
    return "Pillow, mattress, sofa or chair compression appears only where the selected pose actually contacts those surfaces. Mirror reflections appear only if a mirror naturally enters the crop.";
  }
  return "";
}

export function getTemplate(rawState = {}) {
  const state = normalizeState(rawState);
  const pose = getPoseById(state.pose);
  return {
    title:`${pose?.label ?? "سيلفي"} · ${state.time === "night" ? "ليلاً" : "نهاراً"}`,
    text:"WikiPrompt-first subject-held smartphone selfie"
  };
}

export function buildPositivePrompt(rawState = {}) {
  const state = normalizeState(rawState);
  const sections = [
    "[SELFIE TASK] Create a candid, physically plausible smartphone selfie taken by the subject himself. The person and the act of taking the selfie are the primary visual event.",
    buildReferenceSection(state),
    `[CAMERA] ${CAMERA_SELFIE_LOCK}`,
    buildPoseSection(state),
    buildHairSection(state),
    buildAppearanceSection(state),
    buildLightingSection(state),
    buildRoomAuthority(state),
    buildContextSection(state),
    buildSceneSpecificSafety(state),
    `[PHONE REALISM] ${SMARTPHONE_REALISM}`,
    `[CONFLICT RESOLUTION] ${REALISM_ORDER}`,
    "[FINAL QA] One identity, one subject-held phone, one front camera, one lens, one physically possible arm reach, one coherent pose, one lighting setup and one exposure strategy. Omit secondary details rather than forcing them into the frame."
  ];
  return sections.filter(Boolean).join("\n\n");
}

export function buildNegativePrompt(rawState = {}) {
  const state = normalizeState(rawState);
  const contextual = [];

  if (isBedroomScene(state.scene)) {
    contextual.push(
      "invented white sheer curtains",
      "forced full-room view",
      "forced mirror reflection",
      "phone forced into mirror",
      "unrelated floor contact",
      "unrelated rug compression",
      "floating bedding",
      "impossible mattress compression",
      "extra bedroom light source"
    );
  }

  if (sceneFamily(state.scene) === "car") {
    contextual.push(
      "moving vehicle",
      "driving action",
      "wrong steering side",
      "warped dashboard",
      "duplicated steering wheel",
      "impossible windshield reflection",
      "forced full-car interior"
    );
  }

  if (sceneFamily(state.scene) === "gym") {
    contextual.push("broken mirror geometry", "duplicated gym equipment", "forced full gym view");
  }

  if (sceneFamily(state.scene) === "street") {
    contextual.push("garbled required signage", "duplicated cars", "floating vehicles", "forced full street view");
  }

  return [...BASE_NEGATIVE, ...contextual].join(", ");
}

export function buildRealismQa(rawState = {}) {
  const state = normalizeState(rawState);
  const pose = getPoseById(state.pose);
  const lighting = optionByValue(getLightingOptions(state.scene, state.time), state.lighting);
  return [
    { label:"الأساس", value:"WikiPrompt أولاً — واقعية سيلفي هاتف عفوية" },
    { label:"الهوية", value:"مرجع شخص واحد فقط؛ الوجه وكثافة الشعر مقفلان" },
    { label:"السيلفي", value:"الشخص يمسك الهاتف بنفسه؛ لا توجد كاميرا مراقب" },
    { label:"الوضعية", value:`${pose?.label ?? state.pose} — الزاوية والتكوين مقيدان بها` },
    { label:"الإضاءة", value:lighting?.label ?? state.lighting },
    { label:"الخلفية", value:"سياق مساعد فقط؛ لا يلزم ظهور كل التفاصيل" },
    { label:"التناقضات", value:"تُحذف التفاصيل الأقل أولوية تلقائياً عند التعارض" }
  ];
}

export function buildPromptPack(rawState = {}) {
  const state = normalizeState(rawState);
  return {
    positive:buildPositivePrompt(state),
    negative:buildNegativePrompt(state),
    qa:buildRealismQa(state),
    template:getTemplate(state),
    state
  };
}
