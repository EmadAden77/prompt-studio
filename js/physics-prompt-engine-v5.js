import {
  BASE_NEGATIVE,
  CAMERA_SELFIE_LOCK,
  CITIES,
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
import {
  CLOTHING_NEGATIVE_RULES,
  buildClothingPhysicsText,
  clothingQaText,
  getClothingFitOptions,
  getExpandedClothingOptions,
  getFabricOptions,
  getFabricWeightOptions,
  getIronStateOptions,
  getWearStateOptions,
  normalizeClothingPhysicsState
} from "./clothing-physics-v1.js";

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const sentence = (value) => {
  const text = clean(value);
  if (!text) return "";
  return /[.!?]$/u.test(text) ? text : `${text}.`;
};
const optionByValue = (options, value) => options.find((item) => item.value === value) ?? null;
const optionText = (options, value, fallback = "") => optionByValue(options, value)?.text ?? fallback;

const CUSTOM_SCENE_ID = "custom";

const CUSTOM_POSES = Object.freeze([
  {
    value:"custom-relaxed-close",
    family:"relaxed",
    label:"سيلفي عفوي داخل المشهد",
    angles:["eye","slight-high","three-quarter","side-close"],
    compositions:["tight","close","upper"],
    text:"a relaxed subject-held selfie naturally positioned inside the user-defined location, with small shoulder asymmetry and no staged presentation pose"
  },
  {
    value:"custom-standing",
    family:"standing",
    label:"واقف داخل المشهد",
    angles:["eye","three-quarter","slight-low"],
    compositions:["close","upper","medium"],
    text:"standing naturally inside the user-defined location with relaxed posture, keeping shelves, counters, doors, displays or other scene structure secondary and only visible where the selfie field of view reaches them"
  },
  {
    value:"custom-seated",
    family:"seated",
    label:"جالس داخل المشهد",
    angles:["eye","slight-high","three-quarter"],
    compositions:["close","upper","medium"],
    text:"seated naturally on a physically plausible seat or waiting surface that belongs in the user-defined location, with real body support and no invented furniture merely to satisfy the pose"
  },
  {
    value:"custom-waiting",
    family:"activity",
    label:"ينتظر بشكل عفوي",
    angles:["eye","slight-high","three-quarter"],
    compositions:["close","upper"],
    text:"waiting casually inside the user-defined location with ordinary asymmetry and no staged gesture, as if the selfie was taken during a brief pause"
  },
  {
    value:"custom-browsing",
    family:"activity",
    label:"يتصفح أو ينظر حوله",
    angles:["eye","three-quarter"],
    compositions:["close","upper","medium"],
    text:"casually browsing or looking around the user-defined location while taking the selfie, interacting only with scene objects that physically belong there and only when they naturally enter the crop"
  }
]);

const CUSTOM_LIGHTING_OPTIONS = Object.freeze({
  night: [
    {
      value:"custom-night-auto-practical",
      label:"تلقائي حسب المشهد — ليلي",
      text:"use only physically present night-time practical sources implied by the user-defined location: for an indoor shop or grocery, visible ceiling LED or fluorescent fixtures may dominate; for an outdoor place, actual street, facade or parking lights must provide the illumination. Never invent studio fill"
    },
    {
      value:"custom-night-led",
      label:"LED سقفي واقعي",
      text:"visible ceiling LED fixtures appropriate to the user-defined indoor location are the dominant practical sources, with ordinary fixture spacing, realistic downward shadow behavior and no hidden frontal fill"
    },
    {
      value:"custom-night-warm",
      label:"إنارة داخلية دافئة",
      text:"visible warm indoor practical fixtures appropriate to the user-defined location illuminate the subject and nearby scene consistently, with realistic falloff and mixed white balance left natural"
    },
    {
      value:"custom-night-frontage",
      label:"إنارة محل + واجهة ليلية",
      text:"interior practical lighting remains dominant while a physically visible storefront, doorway or window may contribute weaker exterior night spill only if the selected selfie angle actually reaches it"
    }
  ],
  day: [
    {
      value:"custom-day-auto-practical",
      label:"تلقائي حسب المشهد — نهاري",
      text:"use only physically present daylight and practical sources implied by the user-defined location: an indoor shop may combine real window or entrance daylight with visible ceiling fixtures, while an outdoor place uses sky, sun or open shade. Never invent studio fill"
    },
    {
      value:"custom-day-window-led",
      label:"نهار + LED داخلي",
      text:"real daylight entering through physically plausible windows or an open storefront remains consistent with visible indoor LED fixtures, preserving ordinary mixed-source exposure rather than polished commercial lighting"
    },
    {
      value:"custom-day-led-only",
      label:"LED داخلي فقط",
      text:"visible indoor ceiling LED fixtures provide the dominant illumination because exterior daylight does not materially reach the subject; shadows and reflections follow the real fixture layout"
    },
    {
      value:"custom-day-open-frontage",
      label:"ضوء واجهة أو مدخل",
      text:"broad daylight from a physically visible or nearby entrance, storefront or opening shapes the subject from one plausible direction while interior practical lights remain weaker"
    }
  ]
});

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
  customScene:"",
  customSceneDetails:"",
  city:"riyadh",
  time:"night",
  mode:"selfie",
  poseFamily:"lying",
  pose:"lying-right-close",
  carSeat:"driver-left",
  clothing:"sleep-cotton-short",
  clothingCustom:"",
  fabric:"cotton-jersey",
  fabricWeight:"light",
  ironState:"lightly-unpressed",
  wearState:"home-used",
  clothingFit:"relaxed",
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

export function isCustomScene(sceneId) {
  return sceneId === CUSTOM_SCENE_ID;
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
  return [
    ...Object.entries(SCENES).map(([value, scene]) => ({ value, label:scene.label })),
    { value:CUSTOM_SCENE_ID, label:"✍️ مشهد مخصص" }
  ];
}

export function getCityOptions() {
  return CITIES.map(({ value, label }) => ({ value, label }));
}

export function getClothingOptions(sceneId) {
  return getExpandedClothingOptions(sceneId, isCustomScene(sceneId));
}

export { getFabricOptions, getFabricWeightOptions, getIronStateOptions, getWearStateOptions, getClothingFitOptions };

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
  const poses = isCustomScene(sceneId)
    ? CUSTOM_POSES
    : SELFIE_POSES.filter((pose) => pose.scenes.includes(sceneId));
  const validFamilies = new Set(poses.map((pose) => pose.family));
  return POSE_FAMILIES.filter((family) => validFamilies.has(family.value));
}

export function getPoseOptions(sceneId, family) {
  const scenePoses = isCustomScene(sceneId)
    ? [...CUSTOM_POSES]
    : SELFIE_POSES.filter((pose) => pose.scenes.includes(sceneId));
  if (!family) return scenePoses;
  return scenePoses.filter((pose) => pose.family === family);
}

export function getPoseById(poseId) {
  return optionByValue([...SELFIE_POSES, ...CUSTOM_POSES], poseId);
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
  if (isCustomScene(sceneId)) return CUSTOM_LIGHTING_OPTIONS[time] ?? [];
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

  if (!SCENES[state.scene] && !isCustomScene(state.scene)) state.scene = DEFAULT_STATE.scene;
  if (!["day","night"].includes(state.time)) state.time = DEFAULT_STATE.time;
  if (!CITIES.some((item) => item.value === state.city)) state.city = DEFAULT_STATE.city;

  state.customScene = isCustomScene(state.scene) ? clean(state.customScene) : "";
  state.customSceneDetails = isCustomScene(state.scene) ? clean(state.customSceneDetails) : "";

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
  Object.assign(state, normalizeClothingPhysicsState(state));

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
    ? `Optional clothing modifier: ${clothingCustom}. Apply only if it does not replace or contradict the selected garment structure, selected fabric, pose physics or scene practicality.`
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

function buildClothingPhysicsSection(state) {
  return buildClothingPhysicsText(state);
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
  if (isCustomScene(state.scene) && state.messiness === "busy") {
    return "Allow somewhat more ordinary scene detail only where the selected selfie angle reaches it, but keep the location believable rather than densely decorated or staged.";
  }
  if (isCustomScene(state.scene) && state.messiness === "minimal") {
    return "Keep the user-defined location visually sparse in the selfie crop while retaining just enough physically correct structure to identify the place.";
  }
  return base;
}

export function getBackgroundVisibility(rawState = {}) {
  const state = normalizeState(rawState);
  const family = sceneFamily(state.scene);
  if (!isCarScene(state.scene) && family !== "street" && !isCustomScene(state.scene)) return "none";

  let score = ({ tight:0, close:1, upper:2, medium:3 })[state.composition] ?? 1;
  if (["three-quarter","side-close"].includes(state.selfieAngle)) score += 1;
  if (family === "street") score += 1;

  if (score <= 0) return "minimal";
  if (score <= 2) return "conditional";
  return "open";
}

function buildCustomBackgroundRealism(state, visibility) {
  const timeRule = state.time === "night"
    ? "At night, the user-defined place must be lit by actual practical sources that belong there. Indoor shops may use visible ceiling fixtures and weaker storefront spill; exterior portions use real street, parking or facade lights with darker gaps rather than uniform brightness."
    : "In daylight, preserve ordinary real-world exposure. Indoor locations may show a believable difference between interior practical light and brighter windows or entrances; exterior portions use actual sun, sky or open shade with natural highlight clipping where expected.";

  const sceneRule = "Build only physical elements that naturally belong to the user-defined location. For a shop, optical store, grocery, pharmacy or similar place, shelves, display stands, counters, products, mirrors, doors and aisles must have coherent scale, support, spacing and perspective. Do not invent unrelated furniture, luxury styling, brand identity or decorative objects merely to make the scene look complete.";

  const peopleRule = "Staff or customers may appear only when the selected angle and crop leave real background space for them. Keep them sparse, naturally occupied with their own activity, correctly scaled, partially occluded when appropriate and unaware of the selfie. Never stage a group around the subject.";

  const exteriorRule = "Cars, pedestrians or street detail may appear only if a real doorway, storefront window, open frontage or exterior portion is physically visible from the selected selfie viewpoint. Do not place outdoor traffic behind opaque walls or force a street view into an interior crop.";

  const geometryRule = "All visible shelves, products, people, mirrors, counters, vehicles and architectural lines must obey one perspective, real support and contact, occlusion, plausible repetition and distance-based detail. Avoid cloned products, duplicated shelves, floating merchandise, impossible reflections, perfectly symmetrical stock-photo staging or text that must be readable.";

  if (visibility === "minimal") {
    return `[BACKGROUND REALISM] The tight selfie crop dominates. Use only a few location cues that naturally survive around the face; do not force a wide view of the custom scene. ${timeRule} ${sceneRule} ${peopleRule} ${exteriorRule} ${geometryRule}`;
  }
  if (visibility === "conditional") {
    return `[BACKGROUND REALISM] Use the selected selfie angle and crop to decide which parts of the user-defined location are truly visible behind or beside the subject. Add only those physically reachable background zones. ${timeRule} ${sceneRule} ${peopleRule} ${exteriorRule} ${geometryRule}`;
  }
  return `[BACKGROUND REALISM] The selected angle and crop allow a richer but still secondary view of the user-defined location. Build convincing depth from the actual place structure while keeping the selfie subject dominant. ${timeRule} ${sceneRule} ${peopleRule} ${exteriorRule} ${geometryRule}`;
}

function buildBackgroundRealism(state) {
  const visibility = getBackgroundVisibility(state);
  if (visibility === "none") return "";

  if (isCustomScene(state.scene)) return buildCustomBackgroundRealism(state, visibility);

  const family = sceneFamily(state.scene);
  const timeRule = state.time === "night"
    ? "At night, use uneven real-world illumination: localized parking or street-light pools, darker gaps between fixtures, believable vehicle lamp spill and restrained distant practical lights rather than a uniformly bright background."
    : "In daylight, preserve real outdoor exposure behavior: believable sun or open shade, natural sky-to-ground contrast, ordinary atmospheric haze, and exterior highlights that may be brighter than the cabin or face when physically expected.";

  const worldRule = "When the real front-camera field of view actually reaches the exterior, render a believable Saudi street or parking slice with physically grounded asphalt, curbs or paving, ordinary light poles or roadside elements, and varied everyday vehicles at plausible scale, spacing, orientation and distance. Cars may be parked or naturally passing only when consistent with the stationary selfie scene. Sparse pedestrians may appear only where the angle truly exposes public space; keep them secondary, naturally posed, correctly scaled and unaware of the selfie rather than staged or staring at the camera.";

  const geometryRule = "Every visible background car or person must obey perspective, occlusion, contact with the ground, shadow direction and distance-based detail. Do not duplicate vehicles, clone pedestrians, fill empty space merely for activity, or make the background look like a showroom, stock photo or generated crowd.";

  if (family === "car") {
    if (visibility === "minimal") {
      return `[BACKGROUND REALISM] The tight selfie crop has priority. Do not force an exterior view. If a real side, rear or windshield slice naturally enters the frame, keep it small but physically believable. ${timeRule} ${worldRule} ${geometryRule}`;
    }
    if (visibility === "conditional") {
      return `[BACKGROUND REALISM] Use the selected selfie angle to decide whether a side window, windshield edge or rear-window slice is genuinely visible. Only through those real openings may exterior street or parking detail appear. ${timeRule} ${worldRule} ${geometryRule}`;
    }
    return `[BACKGROUND REALISM] This wider or more lateral selfie angle can support meaningful exterior context through physically visible vehicle glass. Keep the subject dominant while allowing a coherent Saudi street or parking slice to contribute real-world depth. ${timeRule} ${worldRule} ${geometryRule}`;
  }

  if (visibility === "minimal") {
    return `[BACKGROUND REALISM] Keep the outdoor background minimal because the face dominates the crop. Use only the street detail that naturally survives around the subject. ${timeRule} ${worldRule} ${geometryRule}`;
  }
  if (visibility === "conditional") {
    return `[BACKGROUND REALISM] Allow a moderate amount of real Saudi street or parking context around the subject according to the selected angle and crop, never at the expense of selfie plausibility. ${timeRule} ${worldRule} ${geometryRule}`;
  }
  return `[BACKGROUND REALISM] The selected outdoor angle and crop permit a richer but still secondary real-world background. Build coherent depth using ordinary Saudi street or parking elements, varied cars and sparse people only where geometry supports them. ${timeRule} ${worldRule} ${geometryRule}`;
}

function buildCustomSceneAuthority(state) {
  if (!isCustomScene(state.scene)) return "";
  const city = optionText(CITIES, state.city, "a plausible Saudi Arabian location");
  const description = state.customScene || "an ordinary plausible user-defined location";
  const details = state.customSceneDetails;
  return [
    "[CUSTOM SCENE AUTHORITY]",
    sentence(`User-defined location: ${description}`),
    sentence(`Set this location in ${city}`),
    "Treat the user's location description as the scene authority, but translate it into ordinary physically plausible real-world geometry rather than a polished advertisement.",
    details ? sentence(`Requested supporting details: ${details}`) : "",
    details ? "Requested supporting details are conditional: show each only if the selected selfie angle, crop, lighting and real scene layout can physically include it. Do not force every requested item into frame." : "",
    "Do not silently replace the requested place with a bedroom, car, gym, street or unrelated generic interior."
  ].filter(Boolean).join(" ");
}

function buildContextSection(state) {
  const city = optionText(CITIES, state.city, "a plausible Saudi Arabian location");
  const note = clean(state.environmentNote);
  if (isCustomScene(state.scene)) {
    return [
      "[OPTIONAL CONTEXT]",
      sentence(`supporting context for the user-defined location in ${city}`),
      sentence(buildContextDensity(state)),
      note ? sentence(`Optional context note: ${note}. Use it only if physically compatible with the selected pose, crop and lighting`) : "",
      SCENE_PRIORITY_RULE
    ].filter(Boolean).join(" ");
  }

  const scene = SCENES[state.scene];
  return [
    "[OPTIONAL CONTEXT]",
    sentence(`${scene.environment}; ${city}`),
    sentence(buildContextDensity(state)),
    note ? sentence(`Optional context note: ${note}. Use it only if physically compatible with the selected pose, crop and lighting`) : "",
    SCENE_PRIORITY_RULE
  ].filter(Boolean).join(" ");
}

function buildSceneSpecificSafety(state) {
  if (isCustomScene(state.scene)) {
    return "Keep the custom location internally consistent as one real place. Do not mix unrelated scene types. Shelves, counters, mirrors, doors, windows, products, staff, customers and exterior openings appear only where the selected front-camera crop can physically reach them; omit them rather than breaking perspective or scene logic.";
  }
  if (isCarScene(state.scene)) {
    return "The vehicle is fully stationary and safely parked. Preserve left-hand-drive cabin geometry. Steering wheel, dashboard, console and mirrors appear only if they naturally enter the front-camera crop; if visible, keep their geometry coherent and never duplicate controls. Do not imply driving, steering motion or road travel.";
  }
  if (sceneFamily(state.scene) === "gym") {
    return "Gym equipment, mirrors and people are secondary context. Do not force mirrors or full machines into the crop.";
  }
  if (sceneFamily(state.scene) === "street") {
    return "Outdoor cars, signs and pedestrians are optional context. Do not rely on readable signage or force a complete vehicle or person into the frame.";
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

function backgroundNegativeRules(state) {
  const family = sceneFamily(state.scene);
  if (!isCarScene(state.scene) && family !== "street" && !isCustomScene(state.scene)) return [];
  const common = [
    "showroom-like background",
    "staged crowd",
    "pedestrians staring at selfie camera",
    "cloned pedestrians",
    "identical duplicated cars",
    "floating cars",
    "cars without ground contact",
    "impossible traffic orientation",
    "background vehicles at impossible scale",
    "overfilled background activity"
  ];
  if (isCustomScene(state.scene)) {
    return [
      ...common,
      "unrelated scene type replacing custom location",
      "duplicated shelves",
      "cloned staff or customers",
      "floating merchandise",
      "products without shelf support",
      "impossible aisle perspective",
      "forced storefront view",
      "outdoor traffic behind opaque interior wall",
      "invented branded signage",
      "perfectly symmetrical stock-photo interior"
    ];
  }
  return ["sterile empty street when exterior context is naturally visible", ...common];
}

export function getTemplate(rawState = {}) {
  const state = normalizeState(rawState);
  const pose = getPoseById(state.pose);
  const seat = isCarScene(state.scene) ? optionByValue(CAR_SEAT_OPTIONS, state.carSeat)?.label : "";
  const custom = isCustomScene(state.scene) ? "مشهد مخصص" : "";
  return {
    title:[pose?.label ?? "سيلفي", seat || custom, state.time === "night" ? "ليلاً" : "نهاراً"].filter(Boolean).join(" · "),
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
    buildClothingPhysicsSection(state),
    buildLightingSection(state),
    buildRoomAuthority(state),
    buildCustomSceneAuthority(state),
    buildContextSection(state),
    buildBackgroundRealism(state),
    buildSceneSpecificSafety(state),
    `[PHONE REALISM] ${SMARTPHONE_REALISM}`,
    `[CONFLICT RESOLUTION] ${REALISM_ORDER}`,
    "[FINAL QA] One identity, one subject-held phone, one front camera, one lens, one physically possible arm reach, one coherent pose, one clothing material system, one lighting setup and one exposure strategy. The selected fabric, weight, ironing, wear state and fit must remain mutually compatible and must produce folds only where the pose and crop physically permit them. For car scenes, preserve the selected seat position and cabin side mapping. Background activity may appear only where the selected front-camera angle and crop physically reveal it. For a custom scene, preserve the user's requested place while omitting lower-priority details that do not fit the real field of view. Do not add full-body requirements to a tight crop. Omit secondary details rather than forcing them into the frame."
  ];
  return sections.filter(Boolean).join("\n\n");
}

export function buildNegativePrompt(rawState = {}) {
  const state = normalizeState(rawState);
  const contextual = [...CLOTHING_NEGATIVE_RULES];

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

  contextual.push(...backgroundNegativeRules(state));
  return [...BASE_NEGATIVE, ...contextual].join(", ");
}

export function buildRealismQa(rawState = {}) {
  const state = normalizeState(rawState);
  const pose = getPoseById(state.pose);
  const lighting = optionByValue(getLightingOptions(state.scene, state.time), state.lighting);
  const seat = isCarScene(state.scene) ? optionByValue(CAR_SEAT_OPTIONS, state.carSeat) : null;
  const backgroundVisibility = getBackgroundVisibility(state);
  const backgroundQa = isCustomScene(state.scene)
    ? backgroundVisibility === "minimal"
      ? "المشهد المخصص محدود جداً حسب الكادر؛ لا تُفرض رفوف أو أشخاص أو واجهة"
      : backgroundVisibility === "conditional"
        ? "تفاصيل المشهد المخصص تظهر فقط إذا سمحت زاوية السيلفي والكادر"
        : "الزاوية تسمح بخلفية أغنى من المشهد المخصص مع بقاء الشخص هو الأساس"
    : backgroundVisibility === "none"
      ? "سياق مساعد فقط؛ لا يلزم ظهور كل التفاصيل"
      : backgroundVisibility === "minimal"
        ? "محدودة جداً حسب الكادر؛ لا تُفرض سيارات أو أشخاص"
        : backgroundVisibility === "conditional"
          ? "تظهر سيارات أو أشخاص فقط إذا كشفت الزاوية الخارج فعلياً"
          : "الزاوية تسمح بخلفية شارع أغنى مع بقاء الشخص هو العنصر الأساسي";
  return [
    { label:"الأساس", value:"WikiPrompt أولاً — واقعية سيلفي هاتف عفوية" },
    { label:"الهوية", value:"مرجع شخص واحد فقط؛ الوجه وكثافة الشعر مقفلان" },
    { label:"السيلفي", value:"الشخص يمسك الهاتف بنفسه؛ لا توجد كاميرا مراقب" },
    { label:"الوضعية", value:`${pose?.label ?? state.pose} — الزاوية والتكوين مقيدان بها` },
    ...(seat ? [{ label:"المقعد", value:`${seat.label} — منظور المقصورة مقفل على هذا الموضع` }] : []),
    ...(isCustomScene(state.scene) ? [{ label:"المشهد", value:state.customScene || "مشهد مخصص — أضف وصف المكان" }] : []),
    { label:"الملابس", value:clothingQaText(state) },
    { label:"الإضاءة", value:lighting?.label ?? state.lighting },
    { label:"الخلفية", value:backgroundQa },
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
