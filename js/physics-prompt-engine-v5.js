import {
  BASE_NEGATIVE,
  BEDROOM_WINDOW_OPTIONS,
  CITIES,
  COMPOSITION_OPTIONS,
  CONFLICT_PRIORITY_LINES,
  EXPRESSION_OPTIONS,
  HAIR_OPTIONS,
  LIGHTING_OPTIONS,
  MESSINESS_OPTIONS,
  POSE_FAMILIES,
  SCENES,
  SELFIE_ANGLE_OPTIONS,
  SELFIE_POSES,
  SKIN_OPTIONS,
  sceneFamily
} from "./wiki-selfie-data-v1.js?v=20260903-conflict-order1";
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
import { evaluateSelfieGeometry, resolveMonitorComposition } from "./visual-selfie-angle-monitor-v1.js?v=20260903-json-output1";

/*
 * CANONICAL PROMPT ENGINE
 *
 * One selected field -> one authority -> one final value.
 * UI/runtime modules may enrich diagnostics, but this engine never lets them
 * create a second camera vector, seat mapping, expression, scene, lighting or
 * identity authority inside the portable JSON contract.
 */

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const optionByValue = (options, value) => options.find((item) => item.value === value) ?? null;
const optionText = (options, value, fallback = "") => optionByValue(options, value)?.text ?? fallback;
const cloneOption = (item) => item ? { ...item } : null;

const CUSTOM_SCENE_ID = "custom";
const DRIVER_SEAT = "driver-left";

const CUSTOM_POSES = Object.freeze([
  { value:"custom-relaxed-close", family:"relaxed", label:"سيلفي عفوي داخل المشهد", angles:["eye","slight-high","three-quarter","side-close"], compositions:["tight","close","upper"], text:"a relaxed subject-held selfie naturally positioned inside the user-defined location" },
  { value:"custom-standing", family:"standing", label:"واقف داخل المشهد", angles:["eye","three-quarter","slight-low"], compositions:["close","upper","medium"], text:"standing naturally inside the user-defined location with relaxed posture" },
  { value:"custom-seated", family:"seated", label:"جالس داخل المشهد", angles:["eye","slight-high","three-quarter"], compositions:["close","upper","medium"], text:"seated naturally on a physically plausible support surface that belongs in the user-defined location" },
  { value:"custom-waiting", family:"activity", label:"ينتظر بشكل عفوي", angles:["eye","slight-high","three-quarter"], compositions:["close","upper"], text:"waiting casually inside the user-defined location during a brief ordinary pause" },
  { value:"custom-browsing", family:"activity", label:"يتصفح أو ينظر حوله", angles:["eye","three-quarter"], compositions:["close","upper","medium"], text:"casually looking around the user-defined location while taking the selfie" }
]);

const CUSTOM_LIGHTING_OPTIONS = Object.freeze({
  night:[
    { value:"custom-night-auto-practical", label:"تلقائي حسب المشهد — ليلي", text:"use only physically present night-time practical sources implied by the user-defined location; never invent studio fill" },
    { value:"custom-night-led", label:"LED سقفي واقعي", text:"visible ceiling LED fixtures appropriate to the location are the dominant practical sources" },
    { value:"custom-night-warm", label:"إنارة داخلية دافئة", text:"visible warm practical fixtures appropriate to the location illuminate the subject consistently" },
    { value:"custom-night-frontage", label:"إنارة محل + واجهة ليلية", text:"interior practical lighting remains dominant while a physically visible opening may contribute weaker exterior spill" }
  ],
  day:[
    { value:"custom-day-auto-practical", label:"تلقائي حسب المشهد — نهاري", text:"use only physically present daylight and practical sources implied by the user-defined location; never invent studio fill" },
    { value:"custom-day-window-led", label:"نهار + LED داخلي", text:"real daylight and visible indoor LED fixtures coexist with ordinary mixed-source exposure" },
    { value:"custom-day-led-only", label:"LED داخلي فقط", text:"visible indoor ceiling LED fixtures provide the dominant illumination because exterior daylight does not materially reach the subject" },
    { value:"custom-day-open-frontage", label:"ضوء واجهة أو مدخل", text:"broad daylight from a physically plausible opening shapes the subject while interior practical lights remain weaker" }
  ]
});

const CAR_SEAT_OPTIONS = Object.freeze([
  { value:"driver-left", label:"مقعد السائق الأمامي الأيسر", text:"front-left driver seat of an unmirrored left-hand-drive vehicle" },
  { value:"passenger-front-right", label:"مقعد الراكب الأمامي الأيمن", text:"front-right passenger seat of an unmirrored left-hand-drive vehicle" },
  { value:"rear-left", label:"المقعد الخلفي الأيسر", text:"left rear seat behind the driver" },
  { value:"rear-right", label:"المقعد الخلفي الأيمن", text:"right rear seat behind the front passenger" }
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
  carSeat:DRIVER_SEAT,
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

export function isBedroomScene(sceneId) { return sceneFamily(sceneId) === "bedroom"; }
export function isCarScene(sceneId) { return sceneFamily(sceneId) === "car"; }
export function isCustomScene(sceneId) { return sceneId === CUSTOM_SCENE_ID; }
export function isTextRoomReference(sceneId) { return Boolean(SCENES[sceneId]?.text_reference); }

function isDriverLockedPose(poseId) {
  return /^car-driver-/u.test(String(poseId ?? "")) || poseId === "car-roof-context";
}

function isDriverCarState(state) {
  return isCarScene(state.scene) && state.carSeat === DRIVER_SEAT;
}

export function getSceneOptions() {
  return [
    ...Object.entries(SCENES).map(([value, scene]) => ({ value, label:scene.label })),
    { value:CUSTOM_SCENE_ID, label:"✍️ مشهد مخصص" }
  ];
}

function scenePoseOptions(sceneId, studioSection = "") {
  const poses = isCustomScene(sceneId) ? CUSTOM_POSES : SELFIE_POSES.filter((pose) => pose.scenes.includes(sceneId));
  if (isCarScene(sceneId) && String(studioSection).toLowerCase() === "car") return poses.filter((pose) => pose.family === "car");
  return poses;
}

export function getPoseFamilyOptions(sceneId, studioSection = "") {
  const valid = new Set(scenePoseOptions(sceneId, studioSection).map((pose) => pose.family));
  return POSE_FAMILIES.filter((family) => valid.has(family.value));
}

export function getPoseOptions(sceneId, family, studioSection = "") {
  const poses = scenePoseOptions(sceneId, studioSection);
  return family ? poses.filter((pose) => pose.family === family) : poses;
}

export function getSelfieAngleOptions(poseId) {
  const pose = [...SELFIE_POSES, ...CUSTOM_POSES].find((item) => item.value === poseId);
  const allowed = pose?.angles ?? SELFIE_ANGLE_OPTIONS.map((item) => item.value);
  return SELFIE_ANGLE_OPTIONS.filter((item) => allowed.includes(item.value));
}

export function getCompositionOptions(poseId) {
  const pose = [...SELFIE_POSES, ...CUSTOM_POSES].find((item) => item.value === poseId);
  const allowed = pose?.compositions ?? COMPOSITION_OPTIONS.map((item) => item.value);
  return COMPOSITION_OPTIONS.filter((item) => allowed.includes(item.value));
}

export function getCarSeatOptions(sceneId, poseId = "") {
  if (!isCarScene(sceneId)) return [];
  if (isDriverLockedPose(poseId)) return CAR_SEAT_OPTIONS.filter((item) => item.value === DRIVER_SEAT).map(cloneOption);
  return CAR_SEAT_OPTIONS.map(cloneOption);
}

export function getClothingOptions(sceneId) { return getExpandedClothingOptions(sceneId, isCustomScene(sceneId)); }
export { getFabricOptions, getFabricWeightOptions, getIronStateOptions, getWearStateOptions, getClothingFitOptions };
export function getHairOptions() { return HAIR_OPTIONS.map(cloneOption); }
export function getSkinOptions() { return SKIN_OPTIONS.map(cloneOption); }
export function getExpressionOptions() { return EXPRESSION_OPTIONS.map(cloneOption); }

export function getLightingOptions(sceneId, time) {
  if (isCustomScene(sceneId)) return CUSTOM_LIGHTING_OPTIONS[time] ?? [];
  return LIGHTING_OPTIONS[sceneFamily(sceneId)]?.[time] ?? [];
}

export function getCompatibleBedroomWindowOptions(time, lightingId) {
  const windows = BEDROOM_WINDOW_OPTIONS[time] ?? [];
  const lighting = optionByValue(LIGHTING_OPTIONS.bedroom?.[time] ?? [], lightingId);
  const allowed = lighting?.windowIds ?? windows.map((item) => item.value);
  return windows.filter((item) => allowed.includes(item.value));
}

function canonicalizeState(rawState = {}) {
  const state = { ...DEFAULT_STATE, ...rawState, mode:"selfie" };
  const conflicts = [];
  const record = (field, from, to, reason) => {
    if (from === to) return;
    conflicts.push({ field, from, to, reason });
    state[field] = to;
  };

  if (!SCENES[state.scene] && !isCustomScene(state.scene)) record("scene", state.scene, DEFAULT_STATE.scene, "unknown_scene");
  if (!["day","night"].includes(state.time)) record("time", state.time, DEFAULT_STATE.time, "invalid_time");
  if (!CITIES.some((item) => item.value === state.city)) record("city", state.city, DEFAULT_STATE.city, "unknown_city");

  state.customScene = isCustomScene(state.scene) ? clean(state.customScene) : "";
  state.customSceneDetails = isCustomScene(state.scene) ? clean(state.customSceneDetails) : "";

  const families = getPoseFamilyOptions(state.scene, state.studioSection);
  if (!families.some((item) => item.value === state.poseFamily)) record("poseFamily", state.poseFamily, families[0]?.value ?? "relaxed", "pose_family_scene_mismatch");

  const poses = getPoseOptions(state.scene, state.poseFamily, state.studioSection);
  if (!poses.some((item) => item.value === state.pose)) {
    const fallback = poses[0]?.value ?? getPoseOptions(state.scene, "", state.studioSection)[0]?.value ?? "relaxed-close";
    record("pose", state.pose, fallback, "pose_scene_or_family_mismatch");
  }

  if (!isCarScene(state.scene)) {
    if (state.carSeat) record("carSeat", state.carSeat, "", "car_seat_leakage_outside_car_scene");
  } else {
    const seats = getCarSeatOptions(state.scene, state.pose);
    if (!seats.some((item) => item.value === state.carSeat)) record("carSeat", state.carSeat, seats[0]?.value ?? DRIVER_SEAT, "seat_pose_mismatch");
    if (String(state.studioSection).toLowerCase() === "car" && state.carSeat !== DRIVER_SEAT) record("carSeat", state.carSeat, DRIVER_SEAT, "dedicated_car_studio_is_driver_workflow");
  }

  const angles = getSelfieAngleOptions(state.pose);
  if (!angles.some((item) => item.value === state.selfieAngle)) record("selfieAngle", state.selfieAngle, angles[0]?.value ?? "eye", "angle_pose_mismatch");

  const compositions = getCompositionOptions(state.pose);
  if (!compositions.some((item) => item.value === state.composition)) record("composition", state.composition, compositions[0]?.value ?? "close", "composition_pose_mismatch");

  const clothingOptions = getClothingOptions(state.scene);
  if (!clothingOptions.some((item) => item.value === state.clothing)) record("clothing", state.clothing, clothingOptions[0]?.value ?? "", "clothing_scene_mismatch");
  Object.assign(state, normalizeClothingPhysicsState(state));

  if (!HAIR_OPTIONS.some((item) => item.value === state.hair)) record("hair", state.hair, DEFAULT_STATE.hair, "unknown_hair_option");
  if (!SKIN_OPTIONS.some((item) => item.value === state.skin)) record("skin", state.skin, DEFAULT_STATE.skin, "unknown_skin_option");
  if (!EXPRESSION_OPTIONS.some((item) => item.value === state.expression)) record("expression", state.expression, DEFAULT_STATE.expression, "unknown_expression_option");
  if (!MESSINESS_OPTIONS.some((item) => item.value === state.messiness)) record("messiness", state.messiness, DEFAULT_STATE.messiness, "unknown_context_density");

  const lighting = getLightingOptions(state.scene, state.time);
  if (!lighting.some((item) => item.value === state.lighting)) record("lighting", state.lighting, lighting[0]?.value ?? "", "lighting_scene_or_time_mismatch");

  if (!isBedroomScene(state.scene)) {
    if (state.bedroomWindow) record("bedroomWindow", state.bedroomWindow, "", "bedroom_window_leakage_outside_bedroom");
  } else {
    const windows = getCompatibleBedroomWindowOptions(state.time, state.lighting);
    if (windows.length && !windows.some((item) => item.value === state.bedroomWindow)) record("bedroomWindow", state.bedroomWindow, windows[0].value, "window_lighting_mismatch");
  }

  const section = String(state.studioSection || "").toLowerCase();
  if (section !== "group") {
    state.groupMode = "off";
    state.groupCount = state.groupCount || "2";
  }
  if (section !== "accidental") state.captureMode = state.captureMode === "accidental" ? "selfie" : state.captureMode;

  state.__canonicalConflicts = conflicts;
  return { state, conflicts };
}

export function normalizeState(rawState = {}) { return canonicalizeState(rawState).state; }

function poseById(id) { return [...SELFIE_POSES, ...CUSTOM_POSES].find((item) => item.value === id) ?? null; }
function selectedCity(state) { return optionByValue(CITIES, state.city)?.text ?? "a plausible real location"; }
function selectedScene(state) {
  if (isCustomScene(state.scene)) return clean(state.customScene) || "user-defined location";
  return SCENES[state.scene]?.environment ?? state.scene;
}

function driverGeometry(state) {
  if (!isDriverCarState(state)) return null;
  const evaluated = evaluateSelfieGeometry(state);
  return {
    authority:"driver_selfie_numeric_geometry",
    camera_to_face_distance_cm:evaluated.state.selfieDistanceCm,
    phone_yaw_deg:evaluated.state.selfieYawDeg,
    phone_pitch_deg:evaluated.state.selfiePitchDeg,
    phone_roll_deg:evaluated.state.selfieRollDeg,
    face_yaw_deg:evaluated.state.faceYawDeg,
    framing_target:resolveMonitorComposition({ ...evaluated.state, composition:state.composition }),
    feasibility:{ score:evaluated.score, level:evaluated.level, reachable:evaluated.reachable }
  };
}

function genericGeometry(state) {
  const evaluated = evaluateSelfieGeometry(state);
  const active = evaluated.state.visualSelfieMonitor === "on";
  return {
    authority:active ? "visual_selfie_angle_monitor" : "selected_angle_only",
    camera_to_face_distance_cm:active ? evaluated.state.selfieDistanceCm : null,
    phone_yaw_deg:active ? evaluated.state.selfieYawDeg : null,
    phone_pitch_deg:active ? evaluated.state.selfiePitchDeg : null,
    phone_roll_deg:active ? evaluated.state.selfieRollDeg : null,
    face_yaw_deg:active ? evaluated.state.faceYawDeg : null,
    framing_target:resolveMonitorComposition({ ...evaluated.state, composition:state.composition }),
    feasibility:active ? { score:evaluated.score, level:evaluated.level, reachable:evaluated.reachable } : null
  };
}

function cameraGeometry(state) { return driverGeometry(state) ?? genericGeometry(state); }

function vehicleGeometry(state) {
  if (!isCarScene(state.scene)) return null;
  const driver = isDriverCarState(state);
  return {
    drive_configuration:"left_hand_drive",
    mirror_state:"unmirrored",
    occupant_seat:state.carSeat,
    spatial_relations:driver ? {
      steering_wheel:"directly ahead of the driver torso on the vehicle-left driving position",
      instrument_cluster:"behind the steering wheel on the same driver axis",
      center_console:"to the driver's physical right",
      driver_door_and_window:"to the driver's physical left",
      projection_rule:"These are vehicle-relative relations, not image-left/image-right placement. Camera yaw or selfie mirroring must never swap the driver's physical seat or move the steering wheel across the cabin."
    } : {
      center_console:"between the two front seats",
      steering_wheel:"vehicle-left driving position only",
      projection_rule:"Preserve vehicle-relative left/right geometry regardless of where objects project inside the final image."
    },
    visual_evidence_policy:driver
      ? "Do not force a complete steering wheel. Preserve whichever authentic driver-side cues naturally enter the selected crop; a small attached rim fragment may appear only when the crop physically reaches it."
      : "Show only cabin cues naturally reached by the selected front-camera crop."
  };
}

function structuredOption(options, value) {
  const selected = optionByValue(options, value);
  return { id:value || null, label:selected?.label ?? value ?? null, instruction:selected?.text ?? null };
}

function structuredClothing(state) {
  return {
    garment:structuredOption(getClothingOptions(state.scene), state.clothing),
    custom_modifier:clean(state.clothingCustom) || null,
    fabric:structuredOption(getFabricOptions(state.clothing), state.fabric),
    fabric_weight:structuredOption(getFabricWeightOptions(state.clothing, state.fabric), state.fabricWeight),
    iron_state:structuredOption(getIronStateOptions(state.clothing), state.ironState),
    wear_state:structuredOption(getWearStateOptions(state.clothing), state.wearState),
    fit:structuredOption(getClothingFitOptions(state.clothing), state.clothingFit),
    visibility_rule:["tight","close"].includes(state.composition)
      ? "Describe only garment regions naturally entering the head-and-shoulders crop."
      : "Describe only garment regions naturally entering the selected framing."
  };
}

function structuredAccessories(state) {
  const accessory = state.accessoryProfile && state.accessoryProfile !== "none" ? state.accessoryProfile : null;
  const object = state.objectProfile && state.objectProfile !== "none" ? state.objectProfile : null;
  return {
    reference_linked_eyewear:"Preserve the same pair only when visibly worn in the sole identity reference.",
    selected_accessory:accessory ? { type:accessory, detail:clean(state.accessoryDetail) || null } : null,
    prop:object ? { type:object, instruction:clean(state.interactionObject) || null, visibility:"secondary and only when physically reachable inside the crop" } : null,
    capture_device:{ name:"Xiaomi 15 Ultra front camera", subject_held:true, visible_in_frame:false },
    invention_policy:"Do not invent additional accessories, jewelry, props, products, a second phone, a second free hand or duplicate objects."
  };
}

function structuredBackground(state) {
  const driver = isDriverCarState(state);
  return {
    setting:selectedScene(state),
    scene_id:state.scene,
    scene_family:isCustomScene(state.scene) ? "custom" : sceneFamily(state.scene),
    city:selectedCity(state),
    elements:{
      required:driver ? ["physically coherent front-left driver-seat mapping"] : [],
      optional:driver
        ? ["small steering-wheel rim fragment only if naturally reached by the crop", "driver door/window or A-pillar cue", "center-console edge", "exterior slice through real vehicle glass"]
        : ["only scene details physically reached by the selected front-camera crop"],
      visibility_rule:"Omit optional context before widening the camera, changing the pose, altering the selected scene or breaking physical geometry."
    },
    atmosphere:state.time === "night" ? "ordinary uneven night illumination from selected practical sources" : "ordinary daylight exposure from selected real sources",
    environment_note:clean(state.environmentNote) || null
  };
}

function promptSections(state) {
  const pose = poseById(state.pose);
  const expression = optionText(EXPRESSION_OPTIONS, state.expression, "calm neutral expression");
  const hair = optionText(HAIR_OPTIONS, state.hair, "natural hair arrangement");
  const skin = optionText(SKIN_OPTIONS, state.skin, "ordinary natural skin texture");
  const light = optionText(getLightingOptions(state.scene, state.time), state.lighting, "physically present practical light");
  const geometry = cameraGeometry(state);
  const vehicle = vehicleGeometry(state);
  const scene = selectedScene(state);
  const sections = [
    `[TASK] Generate one candid physically plausible subject-held smartphone selfie from one coherent moment.`,
    `[IDENTITY AUTHORITY] Use exactly one attached reference as identity only. Preserve permanent facial structure, apparent age, skin identity, hairline, visible density, facial-hair pattern and reference-linked eyewear. The reference does not control scene, clothing, pose, expression, lighting, camera angle or crop.`,
    `[EXPRESSION] ${expression}. Apply it without changing permanent identity geometry.`,
    `[CAPTURE] Xiaomi 15 Ultra FRONT camera, held by the subject himself. One camera, one lens, one exposure pipeline. Geometry authority: ${JSON.stringify(geometry)}.`,
    `[SCENE] ${scene}. ${selectedCity(state)}. Pose: ${pose?.text ?? state.pose}.`,
    vehicle ? `[VEHICLE GEOMETRY] ${JSON.stringify(vehicle)}.` : "",
    `[APPEARANCE] Hair: ${hair}. Skin: ${skin}. Clothing: ${structuredClothing(state).garment.instruction ?? state.clothing}.`,
    `[LIGHTING] ${light}. No hidden fill, ring light, softbox, cinematic relighting or contradictory second light authority.`,
    `[REALISM] Gravity, support, contact, occlusion, reflections, material response and exposure must describe the same physically possible instant. Optional context is omitted before any locked field is changed.`
  ];
  return sections.filter(Boolean);
}

export function buildPositivePrompt(rawState = {}) {
  const state = normalizeState(rawState);
  return promptSections(state).join("\n\n");
}

export function buildNegativePrompt(rawState = {}) {
  const state = normalizeState(rawState);
  const contextual = [
    ...BASE_NEGATIVE,
    ...CLOTHING_NEGATIVE_RULES,
    "multiple camera viewpoints",
    "competing camera distances",
    "competing pose instructions",
    "competing lighting setups",
    "scene leakage from another studio section",
    "identity reference controlling pose or scene"
  ];
  if (isCarScene(state.scene)) contextual.push(
    "mirrored cabin",
    "right-hand-drive conversion",
    "swapped driver and passenger seats",
    "center console on the wrong physical side",
    "steering wheel moved across the cabin",
    "duplicated steering wheel",
    "duplicated controls",
    "forced full steering wheel",
    "vehicle in motion"
  );
  return [...new Set(contextual)].join(", ");
}

export function buildRealismQa(rawState = {}) {
  const { state, conflicts } = canonicalizeState(rawState);
  const pose = poseById(state.pose);
  const light = optionByValue(getLightingOptions(state.scene, state.time), state.lighting);
  return [
    { label:"السلطة", value:"قيمة نهائية واحدة لكل خاصية؛ لا توجد سلطة ثانية لنفس الحقل" },
    { label:"الهوية", value:"مرجع واحد للهوية فقط؛ المشهد والوضعية والإضاءة خارج سلطته" },
    { label:"الكاميرا", value:isDriverCarState(state) ? "Driver Selfie geometry الرقمية هي السلطة الوحيدة" : "زاوية سيلفي واحدة ومنظور Front Camera واحد" },
    { label:"الوضعية", value:pose?.label ?? state.pose },
    ...(isCarScene(state.scene) ? [{ label:"السيارة", value:`${state.carSeat} · LHD غير معكوس · العلاقات Vehicle-relative وليست Image-relative` }] : []),
    { label:"الملابس", value:clothingQaText(state) },
    { label:"الإضاءة", value:light?.label ?? state.lighting },
    { label:"التعارضات", value:conflicts.length ? `صُحح ${conflicts.length} تعارض قبل التوليد` : "لا توجد تعارضات حالة غير محلولة" }
  ];
}

export function getTemplate(rawState = {}) {
  const state = normalizeState(rawState);
  const pose = poseById(state.pose);
  const seat = isCarScene(state.scene) ? optionByValue(CAR_SEAT_OPTIONS, state.carSeat)?.label : "";
  return {
    title:[pose?.label ?? "سيلفي", seat, state.time === "night" ? "ليلاً" : "نهاراً"].filter(Boolean).join(" · "),
    text:"Canonical subject-held smartphone selfie"
  };
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

function lockNames(state) {
  return [
    state.lockIdentity === "on" && "identity_and_reference_linked_eyewear",
    state.lockScene === "on" && "scene_and_location",
    state.lockClothing === "on" && "clothing_and_material_family",
    state.lockLighting === "on" && "time_and_selected_lighting",
    state.lockExpression === "on" && "expression"
  ].filter(Boolean);
}

/**
 * Portable canonical JSON contract.
 * It intentionally contains no positive prompt, negative prompt or UI QA.
 */
export function buildStructuredPromptSpec(rawState = {}, { wikiPromptGuidance = "" } = {}) {
  const { state } = canonicalizeState(rawState);
  const pose = poseById(state.pose);
  const driver = isDriverCarState(state);
  const seat = isCarScene(state.scene) ? structuredOption(CAR_SEAT_OPTIONS, state.carSeat) : null;
  const sceneAuthority = isCustomScene(state.scene)
    ? { id:"custom", description:clean(state.customScene) || null, supporting_details:clean(state.customSceneDetails) || null }
    : { id:state.scene, description:SCENES[state.scene]?.environment ?? state.scene, supporting_details:null };

  return {
    schema_version:"realistic-image-generator/v2-canonical",
    task:{
      type:"generate_one_realistic_image",
      capture_type:driver ? "subject_held_driver_selfie" : "subject_held_front_camera_selfie",
      input_contract:"json_only",
      instruction:"Generate exactly one candid, physically plausible smartphone photograph from this JSON object only. Do not merge it with a positive prompt, negative prompt, QA list, alternate pose, generic camera preset or inferred scene styling."
    },
    authority:{
      policy:"single_authority_per_field",
      identity_reference:{
        source:state.hasReference ? "attached_reference_image" : "attach_exactly_one_identity_reference_image",
        role:"identity_only",
        controls:["facial_structure","apparent_age","skin_identity","hairline","visible_hair_density","facial_hair_pattern","reference_linked_eyewear_when_visible"],
        does_not_control:["scene","clothing","pose","expression","lighting","camera_geometry","crop","vehicle_side_mapping"]
      },
      scene:sceneAuthority,
      priority:CONFLICT_PRIORITY_LINES,
      resolution_rule:"When two constraints compete, keep the higher-authority selected field. Correct only the physically impossible component. Omit optional context before changing identity, selected scene, selected seat, selected expression, selected clothing, selected lighting or canonical camera geometry."
    },
    subject:{
      description:"the same person from the sole identity reference casually taking the selfie himself",
      mirror_rules:{ applicable:false, policy:"This is not a mirror selfie. Never use mirror logic to swap vehicle geometry or left/right seat identity." },
      age:"preserve apparent age from the identity reference",
      expression:structuredOption(EXPRESSION_OPTIONS, state.expression),
      hair:{ arrangement:structuredOption(HAIR_OPTIONS, state.hair), density_lock:"Preserve reference-visible hairline, density, scalp visibility and strand coverage. Styling may rearrange existing hair only." },
      clothing:structuredClothing(state),
      face:{ identity_lock:"Preserve facial structure, feature spacing, eyes, brows, nose, lips, jaw, chin, ears, skin tone and natural asymmetry. Do not beautify, symmetrize, slim, reshape, de-age or substitute the face.", skin:structuredOption(SKIN_OPTIONS, state.skin) },
      visible_anatomy:["tight","close"].includes(state.composition)
        ? "Only anatomy naturally entering the close crop is required. Do not force height, weight, hands, legs or full-body evidence into frame."
        : "All visible anatomy must remain connected, supported and physically plausible."
    },
    accessories:structuredAccessories(state),
    photography:{
      camera_style:"ordinary realistic smartphone front-camera capture; handheld and unpolished; no fake DSLR bokeh, beauty treatment, studio light or cinematic grading",
      selected_angle:structuredOption(getSelfieAngleOptions(state.pose), state.selfieAngle),
      selected_shot_type:structuredOption(getCompositionOptions(state.pose), state.composition),
      aspect_ratio:null,
      camera_geometry:cameraGeometry(state),
      texture:"ordinary skin texture, restrained sharpening, realistic auto-exposure, limited highlight recovery and subtle sensor noise appropriate to the selected light"
    },
    scene:{
      selected_pose:{ id:state.pose, label:pose?.label ?? state.pose, instruction:pose?.text ?? null },
      seat_position:seat,
      vehicle_geometry:vehicleGeometry(state),
      time_of_day:state.time,
      lighting:structuredOption(getLightingOptions(state.scene, state.time), state.lighting),
      stationary:isCarScene(state.scene) ? true : null
    },
    background:structuredBackground(state),
    realism:{
      priority:"photographic_realism_over_visual_perfection",
      physical_consistency:"Camera geometry, anatomy, gravity, support, contact, material behavior, occlusion, reflections and lighting must describe the same single instant.",
      imperfection_policy:"Only subtle imperfections with a physical cause may appear. Do not add decorative defects to simulate realism.",
      locked_fields:lockNames(state),
      continuity:state.continuityMode === "on",
      variation:state.variationMode || "none"
    },
    generator:{
      profile:state.generatorProfile || "chatgpt",
      wiki_prompt_calibration:{ enabled:Boolean(wikiPromptGuidance), role:"realism_calibration_only", override_permission:false },
      instruction:"Null or absent optional fields must remain unspecified. Never invent a second authority for any field already defined in this JSON."
    }
  };
}
