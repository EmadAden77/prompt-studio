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
const sentence = (value) => {
  const text = clean(value);
  if (!text) return "";
  return /[.!?]$/u.test(text) ? text : `${text}.`;
};
const optionByValue = (options, value) => options.find((item) => item.value === value) ?? null;
const optionText = (options, value, fallback = "") => optionByValue(options, value)?.text ?? fallback;

const CAR_SEAT_OPTIONS = Object.freeze([
  {
    value:"driver-left",
    label:"مقعد السائق الأمامي الأيسر",
    text:"LEFT FRONT DRIVER'S SEAT LOCK: the subject's hips and torso are centered on the left-front driver-seat cushion and seatback of the left-hand-drive vehicle. The driver door and side window are on the subject's left, the center console is on the subject's right, and the steering wheel is physically directly in front of the driver even when it falls outside the selfie crop"
  },
  {
    value:"passenger-front-right",
    label:"مقعد الراكب الأمامي الأيمن",
    text:"RIGHT FRONT PASSENGER SEAT LOCK: the subject's hips and torso are centered on the right-front passenger-seat cushion and seatback. The passenger door and side window are on the subject's right, the center console is on the subject's left, and the steering wheel belongs across the cabin on the driver side rather than directly in front of the subject"
  },
  {
    value:"rear-left",
    label:"المقعد الخلفي الأيسر",
    text:"LEFT REAR SEAT LOCK: the subject is seated behind the driver position, with the left rear door and window on the subject's left and the driver seat physically ahead. The camera origin must remain in the rear-left seating position and must not drift into either front seat"
  },
  {
    value:"rear-right",
    label:"المقعد الخلفي الأيمن",
    text:"RIGHT REAR SEAT LOCK: the subject is seated behind the front passenger position, with the right rear door and window on the subject's right and the passenger seat physically ahead. The camera origin must remain in the rear-right seating position and must not drift into either front seat"
  }
]);

export const DEFAULT_STATE = Object.freeze({
  scene:"my_bedroom_text",
  city:"riyadh",
  time:"night",
  mode:"selfie",
  poseFamily:"lying",
  pose:"lying-right-close",
  carSeat:"driver-left",
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

export function isCarScene(sceneId) {
  return sceneFamily(sceneId) === "car";
}

export function isTextRoomReference(sceneId) {
  return Boolean(SCENES[sceneId]?.text_reference);
}

function isDriverLockedPose(poseId) {
  return /^car-driver-/u.test(String(poseId ?? "")) || poseId === "car-roof-context";
}

export function getCarSeatOptions(sceneId, poseId = "") {
  if (!isCarScene(sceneId)) return [];
  if (isDriverLockedPose(poseId)) return CAR_SEAT_OPTIONS.filter((item) => item.value === "driver-left");
  return CAR_SEAT_OPTIONS.map((item) => ({ ...item }));
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
  const scenePoses = SELFIE_POSES.filter((pose) => pose.scenes.includes(sceneId));
  if (!family) return scenePoses;
  return scenePoses.filter((pose) => pose.family === family);
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

function normalizeCarSeat(state) {
  if (!isCarScene(state.scene)) return "";
  const options = getCarSeatOptions(state.scene, state.pose);
  if (options.some((item) => item.value === state.carSeat)) return state.carSeat;
  return options[0]?.value ?? "driver-left";
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

  state.carSeat = normalizeCarSeat(state);

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

function buildVisibleBodyInstruction(state) {
  if (["tight","close"].includes(state.composition)) {
    return "Describe only anatomy that naturally enters this crop. Do not force height, weight, hands, legs or full-body visibility into a tight head-and-shoulders selfie. Any visible hand must remain anatomically plausible with exactly five fingers.";
  }
  return SUBJECT_BODY;
}

function buildReferenceSection(state) {
  const referenceInstruction = state.hasReference
    ? "the attached reference image is the sole identity source"
    : "attach exactly one identity reference image when using this prompt";
  const notes = clean(state.identityNotes);
  return [
    "[IDENTITY]",
    sentence(IDENTITY_LOCK),
    sentence(referenceInstruction),
    sentence(buildVisibleBodyInstruction(state)),
    notes ? sentence(`Reference-specific observations to preserve if compatible: ${notes}`) : ""
  ].filter(Boolean).join(" ");
}

function buildPoseSection(state) {
  const pose = getPoseById(state.pose);
  const angle = optionText(getSelfieAngleOptions(state.pose), state.selfieAngle);
  const composition = optionText(getCompositionOptions(state.pose), state.composition);
  const cropRule = isCarScene(state.scene)
    ? "Do not force the holding hand, phone body, steering wheel, dashboard or console into view when the selected crop naturally excludes them."
    : "Do not force the holding hand or phone body into view when the selected crop naturally excludes them.";
  return [
    "[SELFIE POSE]",
    sentence(pose?.text ?? "a natural subject-held selfie pose"),
    sentence(angle),
    sentence(composition),
    "The pose, crop and phone position must describe the same single instant.",
    cropRule
  ].filter(Boolean).join(" ");
}

function buildCarSeatSection(state) {
  if (!isCarScene(state.scene)) return "";
  const seat = optionByValue(CAR_SEAT_OPTIONS, state.carSeat) ?? CAR_SEAT_OPTIONS[0];
  return `[CAR SEAT POSITION] ${sentence(seat.text)} The front-camera viewpoint originates from this exact seat position. Do not mirror, swap or reinterpret the subject's seat.`;
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
  const cropRule = ["tight","close"].includes(state.composition)
    ? "Describe only garment portions that naturally enter the selected crop; lower-body clothing may remain outside frame and must not be forced into view."
    : "";
  return [
    "[APPEARANCE]",
    sentence(clothing),
    custom,
    sentence(skin),
    sentence(expression),
    cropRule,
    "Do not turn ordinary clothing or grooming into fashion-editorial styling."
  ].filter(Boolean).join(" ");
}

function buildExposureConsequence(lighting) {
  const signal = `${lighting?.value ?? ""} ${lighting?.text ?? ""}`;
  if (/direct sun|hard sunlight|hard light|side-sun/i.test(signal)) {
    return "Expose like a real phone under hard sunlight: the directly lit facial region may approach clipping, the shaded side may fall noticeably darker, and exterior highlights may clip. Do not flatten the contrast with HDR, brighten the shadow side using hidden fill, or make both sides of the face equally exposed.";
  }
  return "";
}

function buildLightingSection(state) {
  const lighting = optionByValue(getLightingOptions(state.scene, state.time), state.lighting);
  const windowText = isBedroomScene(state.scene)
    ? optionText(getBedroomWindowOptions(state.time), state.bedroomWindow)
    : "";
  return [
    "[PRACTICAL LIGHTING]",
    sentence(lighting?.text ?? "use only physically present practical light"),
    sentence(windowText),
    sentence(buildExposureConsequence(lighting)),
    "All face highlights, cast shadows, eye catchlights, fabric sheen, glass reflections and material speculars must agree with the selected source geometry. No hidden fill light."
  ].filter(Boolean).join(" ");
}

function buildRoomAuthority(state) {
  if (!isTextRoomReference(state.scene)) return "";
  const room = SCENES[state.scene];
  return `[TEXT ROOM AUTHORITY] ${room.description_en} This description fixes room identity only. It does NOT require every listed item to appear in the selfie. Never invent a second room reference image.`;
}

function buildContextDensity(state) {
  const base = optionText(MESSINESS_OPTIONS, state.messiness);
  if (isCarScene(state.scene) && state.messiness === "busy") {
    return "Show slightly more naturally visible cabin detail and parked exterior context, but do not invent loose clutter, duplicate controls or extra interior objects merely to make the background look busy.";
  }
  if (isCarScene(state.scene) && state.messiness === "minimal") {
    return "Keep the visible cabin context sparse and natural; show only the few interior elements that the selected front-camera crop actually reaches.";
  }
  return base;
}

function buildContextSection(state) {
  const scene = SCENES[state.scene];
  const city = optionText(CITIES, state.city, "a plausible Saudi Arabian location");
  const note = clean(state.environmentNote);
  return [
    "[OPTIONAL CONTEXT]",
    sentence(`${scene.environment}; ${city}`),
    sentence(buildContextDensity(state)),
    note ? sentence(`Optional context note: ${note}. Use it only if physically compatible with the selected pose, crop and lighting`) : "",
    SCENE_PRIORITY_RULE
  ].filter(Boolean).join(" ");
}

function buildSceneSpecificSafety(state) {
  if (isCarScene(state.scene)) {
    return "The vehicle is fully stationary and safely parked. Preserve left-hand-drive cabin geometry. Steering wheel, dashboard, console and mirrors appear only if they naturally enter the front-camera crop; if visible, keep their geometry coherent and never duplicate controls. Do not imply driving, steering motion or road travel.";
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

function carSeatNegativeRules(state) {
  if (!isCarScene(state.scene)) return [];
  if (state.carSeat === "driver-left") {
    return [
      "subject seated in front passenger seat",
      "passenger-side subject position",
      "subject in right-front seat",
      "mirrored cabin",
      "swapped driver and passenger positions",
      "center console on driver's left"
    ];
  }
  if (state.carSeat === "passenger-front-right") {
    return [
      "subject seated in driver seat",
      "steering wheel directly in front of passenger",
      "subject in left-front seat",
      "mirrored cabin",
      "swapped driver and passenger positions",
      "center console on passenger's right"
    ];
  }
  if (state.carSeat === "rear-left") {
    return ["subject in front seat", "front-passenger viewpoint", "driver-seat viewpoint", "mirrored cabin", "camera origin in front row"];
  }
  if (state.carSeat === "rear-right") {
    return ["subject in front seat", "front-passenger viewpoint", "driver-seat viewpoint", "mirrored cabin", "camera origin in front row"];
  }
  return [];
}

export function getTemplate(rawState = {}) {
  const state = normalizeState(rawState);
  const pose = getPoseById(state.pose);
  const seat = isCarScene(state.scene) ? optionByValue(CAR_SEAT_OPTIONS, state.carSeat)?.label : "";
  return {
    title:[pose?.label ?? "سيلفي", seat, state.time === "night" ? "ليلاً" : "نهاراً"].filter(Boolean).join(" · "),
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
    buildCarSeatSection(state),
    buildHairSection(state),
    buildAppearanceSection(state),
    buildLightingSection(state),
    buildRoomAuthority(state),
    buildContextSection(state),
    buildSceneSpecificSafety(state),
    `[PHONE REALISM] ${SMARTPHONE_REALISM}`,
    `[CONFLICT RESOLUTION] ${REALISM_ORDER}`,
    "[FINAL QA] One identity, one subject-held phone, one front camera, one lens, one physically possible arm reach, one coherent pose, one lighting setup and one exposure strategy. For car scenes, preserve the selected seat position and cabin side mapping. Do not add full-body requirements to a tight crop. Omit secondary details rather than forcing them into the frame."
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

  if (isCarScene(state.scene)) {
    contextual.push(
      "moving vehicle",
      "driving action",
      "wrong steering side",
      "warped dashboard",
      "duplicated steering wheel",
      "duplicated controls",
      "invented cabin clutter",
      "impossible windshield reflection",
      "forced full-car interior",
      ...carSeatNegativeRules(state)
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
  const seat = isCarScene(state.scene) ? optionByValue(CAR_SEAT_OPTIONS, state.carSeat) : null;
  return [
    { label:"الأساس", value:"WikiPrompt أولاً — واقعية سيلفي هاتف عفوية" },
    { label:"الهوية", value:"مرجع شخص واحد فقط؛ الوجه وكثافة الشعر مقفلان" },
    { label:"السيلفي", value:"الشخص يمسك الهاتف بنفسه؛ لا توجد كاميرا مراقب" },
    { label:"الوضعية", value:`${pose?.label ?? state.pose} — الزاوية والتكوين مقيدان بها` },
    ...(seat ? [{ label:"المقعد", value:`${seat.label} — منظور المقصورة مقفل على هذا الموضع` }] : []),
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
