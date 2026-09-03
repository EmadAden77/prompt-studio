import {
  BASE_NEGATIVE,
  BEDROOM_WINDOW_OPTIONS,
  CITIES,
  COMPOSITION_OPTIONS,
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
 * One selected field -> one authority -> one final value.
 * UI/runtime modules may enrich diagnostics, but the portable JSON contract
 * never accepts a second camera, seat, expression, scene or lighting authority.
 */

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const optionByValue = (options, value) => options.find((item) => item.value === value) ?? null;
const optionText = (options, value, fallback = "") => optionByValue(options, value)?.text ?? fallback;
const cloneOption = (item) => item ? { ...item } : null;
const CUSTOM_SCENE_ID = "custom";

const CANONICAL_CONFLICT_PRIORITY_LINES = Object.freeze([
  "1. Reference identity and reference-linked eyewear.",
  "2. Active capture type and its dedicated capture authority.",
  "3. Explicit selected scene, expression, clothing and lighting.",
  "4. Physical and anatomical feasibility: reach, support, contact, gravity and single-instant causality.",
  "5. Canonical camera geometry compatible with the active capture type and physical feasibility.",
  "6. Scene topology, vehicle-relative geometry, material, lighting and reflection physics.",
  "7. Optional context and physically caused imperfections.",
  "8. WikiPrompt realism calibration only; it has no override permission.",
  "9. Aesthetic finishing, always last."
]);

const CUSTOM_POSES = Object.freeze([
  { value:"custom-relaxed-close", family:"relaxed", label:"سيلفي عفوي داخل المشهد", angles:["eye","slight-high","three-quarter","side-close"], compositions:["tight","close","upper"], text:"a relaxed subject-held selfie naturally positioned inside the user-defined location" },
  { value:"custom-standing", family:"standing", label:"واقف داخل المشهد", angles:["eye","three-quarter","slight-low"], compositions:["close","upper","medium"], text:"standing naturally inside the user-defined location with relaxed posture" },
  { value:"custom-seated", family:"seated", label:"جالس داخل المشهد", angles:["eye","slight-high","three-quarter"], compositions:["close","upper","medium"], text:"seated naturally on a physically plausible support surface belonging to the user-defined location" },
  { value:"custom-waiting", family:"activity", label:"ينتظر بشكل عفوي", angles:["eye","slight-high","three-quarter"], compositions:["close","upper"], text:"waiting casually inside the user-defined location during an ordinary pause" },
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


export const DEFAULT_STATE = Object.freeze({
  scene:"my_bedroom_text", customScene:"", customSceneDetails:"", city:"riyadh", time:"night", mode:"selfie",
  poseFamily:"lying", pose:"lying-right-close",
  clothing:"sleep-cotton-short", clothingCustom:"", fabric:"cotton-jersey", fabricWeight:"light",
  ironState:"lightly-unpressed", wearState:"home-used", clothingFit:"relaxed",
  hair:"natural", skin:"neutral", expression:"neutral", composition:"close", selfieAngle:"eye",
  messiness:"natural", lighting:"night-bedside-3000", bedroomWindow:"night-charcoal-closed",
  identityNotes:"", environmentNote:"", hasReference:false
});

export function isCustomScene(sceneId) { return sceneId === CUSTOM_SCENE_ID; }
export function isBedroomScene(sceneId) { return !isCustomScene(sceneId) && sceneFamily(sceneId) === "bedroom"; }
export function isCarScene(sceneId) { return !isCustomScene(sceneId) && sceneFamily(sceneId) === "car"; }
export function isTextRoomReference(sceneId) { return Boolean(SCENES[sceneId]?.text_reference); }

function isDriverLockedPose(poseId) { return /^car-driver-/u.test(String(poseId ?? "")) || poseId === "car-roof-context"; }
function isDriverCarState(state) { return isCarScene(state.scene) && String(state.studioSection || "").toLowerCase() === "car"; }
function poseById(id) { return [...SELFIE_POSES, ...CUSTOM_POSES].find((item) => item.value === id) ?? null; }
export function getPoseById(id) { return cloneOption(poseById(id)); }
export function getCityOptions() { return CITIES.map(cloneOption); }

export function getSceneOptions() {
  return [...Object.entries(SCENES).map(([value, scene]) => ({ value, label:scene.label })), { value:CUSTOM_SCENE_ID, label:"✍️ مشهد مخصص" }];
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
  const allowed = poseById(poseId)?.angles ?? SELFIE_ANGLE_OPTIONS.map((item) => item.value);
  return SELFIE_ANGLE_OPTIONS.filter((item) => allowed.includes(item.value));
}
export function getCompositionOptions(poseId) {
  const allowed = poseById(poseId)?.compositions ?? COMPOSITION_OPTIONS.map((item) => item.value);
  return COMPOSITION_OPTIONS.filter((item) => allowed.includes(item.value));
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
export function getBedroomWindowOptions(time) { return (BEDROOM_WINDOW_OPTIONS[time] ?? []).map(cloneOption); }
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
    record("pose", state.pose, poses[0]?.value ?? getPoseOptions(state.scene, "", state.studioSection)[0]?.value ?? "relaxed-close", "pose_scene_or_family_mismatch");
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
  if (section !== "group") state.groupMode = "single";
  if (!state.groupCount) state.groupCount = "3";
  if (section !== "accidental") state.captureMode = "normal";
  state.__canonicalConflicts = conflicts;
  return { state, conflicts };
}

export function normalizeState(rawState = {}) { return canonicalizeState(rawState).state; }

export function getBackgroundVisibility(rawState = {}) {
  const state = normalizeState(rawState);
  if (isBedroomScene(state.scene)) return "none";
  let score = ({ tight:0, close:1, upper:2, medium:3 })[state.composition] ?? 1;
  if (["three-quarter","side-close"].includes(state.selfieAngle)) score += 1;
  if (state.messiness === "minimal") score -= 1;
  if (state.messiness === "busy") score += 1;
  if (score <= 0) return "minimal";
  if (score <= 2) return "conditional";
  return "open";
}

function isGroupState(state) { return String(state.studioSection || "").toLowerCase() === "group" && state.groupMode === "group"; }
function isAccidentalState(state) { return String(state.studioSection || "").toLowerCase() === "accidental" && state.captureMode === "accidental"; }
function captureDeviceName(state) { return isAccidentalState(state) && state.accidentalDevice === "iphone" ? "iPhone 15 Pro Max front camera" : "Xiaomi 15 Ultra front camera"; }
function captureType(state) {
  if (isAccidentalState(state)) return "accidental_subject_held_front_camera_capture";
  if (isGroupState(state)) return "subject_held_group_selfie";
  if (isDriverCarState(state)) return "subject_held_driver_selfie";
  return "subject_held_front_camera_selfie";
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
function accidentalGeometry(state) {
  if (!isAccidentalState(state)) return null;
  return {
    authority:"accidental_capture_event",
    intentional_selfie_geometry:false,
    trigger:state.accidentalTrigger || "pocket",
    phone_position:state.accidentalPhonePosition || "rising",
    motion:state.accidentalMotion || "subtle",
    tilt:state.accidentalTilt || "auto",
    focus:state.accidentalFocus || "transition-face",
    exposure:state.accidentalExposure || "auto-imperfect",
    rule:"The event fields above are the sole composition and camera-behavior authority. Do not import a deliberate selfie angle, normal eye-level preset or alternate camera vector."
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
function cameraGeometry(state) { return accidentalGeometry(state) ?? driverGeometry(state) ?? genericGeometry(state); }

function accidentalBodyState(state) {
  if (!isAccidentalState(state)) return null;
  const supportByFamily = {
    lying:"lying or reclining with anatomy supported by the selected real surface",
    seated:"seated naturally on a real support surface",
    standing:"standing naturally with ordinary balance and weight distribution",
    car:"seated in the selected stationary vehicle seat with normal seat support",
    activity:"maintaining the selected ordinary activity posture without using it to compose the camera",
    relaxed:"holding an ordinary relaxed body posture"
  };
  return {
    pose_family:state.poseFamily || "relaxed",
    support_state:supportByFamily[state.poseFamily] || "maintaining a physically supported ordinary posture",
    authority:"body_support_and_anatomy_only",
    capture_composition_authority:false,
    rule:"This body state may constrain anatomy, gravity and support only. It must not restore a deliberate selfie angle, framing target, lens position, gaze or staged capture pose."
  };
}

function vehicleGeometry(state) {
  if (!isCarScene(state.scene)) return null;
  const driver = isDriverCarState(state);
  return {
    drive_configuration:"left_hand_drive",
    mirror_state:"unmirrored",
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
function selectedCity(state) { return optionByValue(CITIES, state.city)?.text ?? "a plausible real location"; }
function selectedScene(state) { return isCustomScene(state.scene) ? clean(state.customScene) || "user-defined location" : SCENES[state.scene]?.environment ?? state.scene; }
function structuredClothing(state) {
  return {
    garment:structuredOption(getClothingOptions(state.scene), state.clothing),
    custom_modifier:clean(state.clothingCustom) || null,
    fabric:structuredOption(getFabricOptions(state.clothing), state.fabric),
    fabric_weight:structuredOption(getFabricWeightOptions(state.clothing, state.fabric), state.fabricWeight),
    iron_state:structuredOption(getIronStateOptions(state.clothing), state.ironState),
    wear_state:structuredOption(getWearStateOptions(state.clothing), state.wearState),
    fit:structuredOption(getClothingFitOptions(state.clothing), state.clothingFit),
    visibility_rule:["tight","close"].includes(state.composition) ? "Describe only garment regions naturally entering the head-and-shoulders crop." : "Describe only garment regions naturally entering the selected framing."
  };
}
function structuredAccessories(state) {
  const accessory = state.accessoryProfile && state.accessoryProfile !== "none" ? state.accessoryProfile : null;
  const object = state.objectProfile && state.objectProfile !== "none" ? state.objectProfile : null;
  return {
    reference_linked_eyewear:"Preserve the same pair only when visibly worn in the sole identity reference.",
    selected_accessory:accessory ? { type:accessory, detail:clean(state.accessoryDetail) || null } : null,
    prop:object ? { type:object, instruction:clean(state.interactionObject) || null, visibility:"secondary and only when physically reachable inside the crop" } : null,
    capture_device:{ name:captureDeviceName(state), subject_held:true, visible_in_frame:false },
    invention_policy:"Do not invent additional accessories, jewelry, props, products, a second phone, a second free hand or duplicate objects."
  };
}
function structuredBackground(state) {
  const driver = isDriverCarState(state);
  return {
    setting:selectedScene(state), scene_id:state.scene, scene_family:isCustomScene(state.scene) ? "custom" : sceneFamily(state.scene), city:selectedCity(state),
    elements:{
      required:driver ? ["physically coherent left-hand-drive driver geometry"] : [],
      optional:driver ? ["small steering-wheel rim fragment only if naturally reached by the crop","driver door/window or A-pillar cue","center-console edge","exterior slice through real vehicle glass"] : ["only scene details physically reached by the selected front-camera crop"],
      visibility_rule:"Omit optional context before widening the camera, changing the pose, altering the selected scene or breaking physical geometry."
    },
    atmosphere:state.time === "night" ? "ordinary uneven night illumination from selected practical sources" : "ordinary daylight exposure from selected real sources",
    environment_note:clean(state.environmentNote) || null,
    background_visibility:getBackgroundVisibility(state)
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
  const task = isAccidentalState(state)
    ? "Generate one physically plausible accidental front-camera smartphone capture caused by one unfinished hand movement."
    : isGroupState(state)
      ? "Generate one candid physically plausible subject-held group selfie from one front-camera viewpoint."
      : "Generate one candid physically plausible subject-held smartphone selfie from one coherent moment.";
  return [
    `[TASK] ${task}`,
    `[IDENTITY AUTHORITY] Use exactly one attached reference as identity only. Preserve permanent facial structure, apparent age, skin identity, hairline, visible density, facial-hair pattern and reference-linked eyewear. The reference does not control scene, clothing, pose, expression, lighting, camera angle or crop.`,
    `[EXPRESSION] ${expression}. Apply it without changing permanent identity geometry.`,
    `[CAPTURE] ${captureDeviceName(state)}, held by the subject. One camera, one lens, one exposure pipeline. Geometry authority: ${JSON.stringify(geometry)}.`,
    `[SCENE] ${selectedScene(state)}. ${selectedCity(state)}. ${isAccidentalState(state) ? `Body support only: ${accidentalBodyState(state)?.support_state}. Catalog pose text is not capture authority.` : `Pose: ${pose?.text ?? state.pose}.`}`,
    vehicle ? `[VEHICLE GEOMETRY] ${JSON.stringify(vehicle)}.` : "",
    isGroupState(state) ? `[GROUP] Exactly ${state.groupCount || "3"} people. Camera holder: ${state.cameraHolder || "A"}. Arrangement: ${state.groupArrangement || "natural-auto"}. Interaction: ${state.groupInteraction || "casual"}. Keep identities independent and every visible limb attached to its owner.` : "",
    isAccidentalState(state) ? `[ACCIDENTAL EVENT] Trigger: ${state.accidentalTrigger || "pocket"}; phone position: ${state.accidentalPhonePosition || "rising"}; motion: ${state.accidentalMotion || "subtle"}; tilt: ${state.accidentalTilt || "auto"}; focus: ${state.accidentalFocus || "transition-face"}; exposure: ${state.accidentalExposure || "auto-imperfect"}; intensity: ${state.accidentalIntensity || "natural"}. These event fields are the sole capture-composition authority.` : "",
    `[APPEARANCE] Hair: ${hair}. Skin: ${skin}. Clothing: ${structuredClothing(state).garment.instruction ?? state.clothing}.`,
    `[LIGHTING] ${light}. No hidden fill, ring light, softbox, cinematic relighting or contradictory second light authority.`,
    `[REALISM] Gravity, support, contact, occlusion, reflections, material response and exposure must describe the same physically possible instant. Optional context is omitted before any locked field is changed.`
  ].filter(Boolean);
}

export function buildPositivePrompt(rawState = {}) { return promptSections(normalizeState(rawState)).join("\n\n"); }
export function buildNegativePrompt(rawState = {}) {
  const state = normalizeState(rawState);
  const contextual = [...BASE_NEGATIVE, ...CLOTHING_NEGATIVE_RULES, "multiple camera viewpoints", "competing camera distances", "competing pose instructions", "competing lighting setups", "scene leakage from another studio section", "identity reference controlling pose or scene"];
  if (isCarScene(state.scene)) contextual.push("mirrored cabin","right-hand-drive conversion","swapped driver and passenger seats","center console on the wrong physical side","steering wheel moved across the cabin","duplicated steering wheel","duplicated controls","forced full steering wheel","vehicle in motion");
  if (isGroupState(state)) contextual.push("more or fewer people than selected","multiple camera holders","anonymous selfie arm","blended identities","cloned face","arm attached to wrong person");
  if (isAccidentalState(state)) contextual.push("deliberately staged bad photo","normal eye-level selfie preset overriding accidental event","direct intentional lens gaze","selective decorative blur","cinematic accidental snapshot");
  return [...new Set(contextual)].join(", ");
}

export function buildRealismQa(rawState = {}) {
  const { state, conflicts } = canonicalizeState(rawState);
  const pose = poseById(state.pose);
  const light = optionByValue(getLightingOptions(state.scene, state.time), state.lighting);
  return [
    { label:"السلطة", value:"قيمة نهائية واحدة لكل خاصية؛ لا توجد سلطة ثانية لنفس الحقل" },
    { label:"الهوية", value:"مرجع واحد للهوية فقط؛ المشهد والوضعية والإضاءة خارج سلطته" },
    { label:"الكاميرا", value:`${captureType(state)} · سلطة هندسة واحدة` },
    { label:"الوضعية", value:isAccidentalState(state) ? "حالة جسم فقط — لا تتحكم بزاوية أو تكوين اللقطة" : pose?.label ?? state.pose },
    ...(isCarScene(state.scene) ? [{ label:"السيارة", value:"LHD غير معكوس · هندسة السائق ثابتة تلقائياً · العلاقات Vehicle-relative وليست Image-relative" }] : []),
    { label:"الملابس", value:clothingQaText(state) },
    { label:"الإضاءة", value:light?.label ?? state.lighting },
    { label:"التعارضات", value:conflicts.length ? `صُحح ${conflicts.length} تعارض قبل التوليد` : "لا توجد تعارضات حالة غير محلولة" }
  ];
}

export function getTemplate(rawState = {}) {
  const state = normalizeState(rawState);
  const pose = poseById(state.pose);
  const captureLabel = isAccidentalState(state) ? "لقطة عفوية بالخطأ" : pose?.label ?? "سيلفي";
  return { title:[captureLabel, state.time === "night" ? "ليلاً" : "نهاراً"].filter(Boolean).join(" · "), text:"Canonical subject-held smartphone capture" };
}
export function buildPromptPack(rawState = {}) {
  const state = normalizeState(rawState);
  return { positive:buildPositivePrompt(state), negative:buildNegativePrompt(state), qa:buildRealismQa(state), template:getTemplate(state), state };
}

function lockNames(state) {
  return [state.lockIdentity === "on" && "identity_and_reference_linked_eyewear", state.lockScene === "on" && "scene_and_location", state.lockClothing === "on" && "clothing_and_material_family", state.lockLighting === "on" && "time_and_selected_lighting", state.lockExpression === "on" && "expression"].filter(Boolean);
}

/** Portable canonical JSON contract. It intentionally contains no Positive Prompt, Negative Prompt or UI QA. */
export function buildStructuredPromptSpec(rawState = {}, { wikiPromptGuidance = "" } = {}) {
  const { state } = canonicalizeState(rawState);
  const pose = poseById(state.pose);
  const sceneAuthority = isCustomScene(state.scene)
    ? { id:"custom", description:clean(state.customScene) || null, supporting_details:clean(state.customSceneDetails) || null }
    : isTextRoomReference(state.scene)
      ? { id:state.scene, description:SCENES[state.scene]?.description_en ?? SCENES[state.scene]?.environment ?? state.scene, supporting_details:SCENES[state.scene]?.topology_lock_en ?? null }
      : { id:state.scene, description:SCENES[state.scene]?.environment ?? state.scene, supporting_details:null };

  return {
    schema_version:"realistic-image-generator/v2-canonical",
    task:{
      type:"generate_one_realistic_image",
      capture_type:captureType(state),
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
      priority:CANONICAL_CONFLICT_PRIORITY_LINES,
      resolution_rule:"Resolve conflicts strictly by the priority list. Active capture authority cannot be restored by a lower-priority pose or camera preset. Preserve selected intent only while it remains physically possible; correct the impossible component, and omit optional context before changing higher-authority fields."
    },
    subject:{
      description:isGroupState(state) ? "Person A is the same person from the sole identity reference; other selected people remain distinct individuals and must never inherit Person A's facial identity." : "the same person from the sole identity reference casually holding the capture device",
      mirror_rules:{ applicable:false, policy:"This is not a mirror selfie. Never use mirror logic to swap vehicle geometry or left/right seat identity." },
      age:"preserve apparent age from the identity reference",
      expression:structuredOption(EXPRESSION_OPTIONS, state.expression),
      hair:{ arrangement:structuredOption(HAIR_OPTIONS, state.hair), density_lock:"Preserve reference-visible hairline, density, scalp visibility and strand coverage. Styling may rearrange existing hair only." },
      clothing:structuredClothing(state),
      face:{ identity_lock:"Preserve facial structure, feature spacing, eyes, brows, nose, lips, jaw, chin, ears, skin tone and natural asymmetry. Do not beautify, symmetrize, slim, reshape, de-age or substitute the face.", skin:structuredOption(SKIN_OPTIONS, state.skin) },
      group:isGroupState(state) ? {
        count:Number(state.groupCount || 3), camera_holder:state.cameraHolder || "A", arrangement:state.groupArrangement || "natural-auto", interaction:state.groupInteraction || "casual",
        identity_policy:"Preserve each person's identity independently. Never clone, blend or transfer facial structure, hair, skin or expression between people.",
        anatomy_policy:"Every visible arm and hand belongs to exactly one person with continuous shoulder anatomy; never create an anonymous selfie arm or merged torso."
      } : null,
      visible_anatomy:["tight","close"].includes(state.composition) ? "Only anatomy naturally entering the close crop is required. Do not force height, weight, hands, legs or full-body evidence into frame." : "All visible anatomy must remain connected, supported and physically plausible."
    },
    accessories:structuredAccessories(state),
    photography:{
      camera_style:isAccidentalState(state) ? "ordinary accidental smartphone front-camera capture with event-caused framing imperfection; no cinematic treatment or deliberately artistic bad-photo styling" : "ordinary realistic smartphone front-camera capture; handheld and unpolished; no fake DSLR bokeh, beauty treatment, studio light or cinematic grading",
      selected_angle:isAccidentalState(state) ? null : structuredOption(getSelfieAngleOptions(state.pose), state.selfieAngle),
      selected_shot_type:isAccidentalState(state) ? null : structuredOption(getCompositionOptions(state.pose), state.composition),
      aspect_ratio:null,
      device:captureDeviceName(state),
      camera_geometry:cameraGeometry(state),
      accidental_event:isAccidentalState(state) ? { trigger:state.accidentalTrigger || "pocket", phone_position:state.accidentalPhonePosition || "rising", motion:state.accidentalMotion || "subtle", tilt:state.accidentalTilt || "auto", focus:state.accidentalFocus || "transition-face", exposure:state.accidentalExposure || "auto-imperfect", intensity:state.accidentalIntensity || "natural" } : null,
      texture:"ordinary skin texture, restrained sharpening, realistic auto-exposure, limited highlight recovery and subtle sensor noise appropriate to the selected light"
    },
    scene:{
      selected_pose:isAccidentalState(state) ? null : { id:state.pose, label:pose?.label ?? state.pose, instruction:pose?.text ?? null },
      body_state:accidentalBodyState(state),
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
      locked_fields:lockNames(state), continuity:state.continuityMode === "on", variation:state.variationMode || "none"
    },
    generator:{
      profile:state.generatorProfile || "chatgpt",
      wiki_prompt_calibration:{ enabled:Boolean(wikiPromptGuidance), role:"realism_calibration_only", override_permission:false },
      instruction:"Null or absent optional fields must remain unspecified. Never invent a second authority for any field already defined in this JSON."
    }
  };
}
