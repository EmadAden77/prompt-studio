import { CAR_EXTERIOR_LOCATIONS, CAR_EXTERIOR_POSES, LIGHTING_OPTIONS } from "./data.js";

const DEFAULT_LOCATION = "villa";
const DEFAULT_POSE = "door-lean";
const FORBIDDEN_SELFIE_POSES = new Set(["key-fob"]);

const COMPACT_LOCATION_TEXT = Object.freeze({
  villa:"Villa driveway",
  grocery:"Grocery curb",
  parking:"Marked parking lot",
  street:"yellow-and-black street curb",
  reststop:"sandy shoulder",
  mall:"mall parking"
});

const COMPACT_POSE_TEXT = Object.freeze({
  "door-lean":"leaning on closed driver door",
  "door-open":"at open driver door",
  "front-grille":"at front grille",
  "rear-tailgate":"near rear tailgate",
  "front-fender":"at front fender, free hand on body",
  "rear-quarter":"at rear three-quarter corner",
  "hood-sit":"sitting at front edge of the hood"
});

const LOCATION_EVIDENCE = Object.freeze({
  villa:/(?:villa driveway|driveway before a Saudi villa|Saudi villa|villa[^.]{0,50}(?:gate|driveway))/iu,
  grocery:/(?:grocery curb|curb before a small grocery|small grocery|grocery with)/iu,
  parking:/(?:marked parking lot|marked outdoor parking|outdoor lot with white lines|concrete wheel stops)/iu,
  street:/(?:yellow-and-black street curb|parallel parked along a yellow-and-black curb|weathered asphalt)/iu,
  reststop:/(?:sandy shoulder|rest-stop shoulder|open horizon)/iu,
  mall:/(?:mall parking|outdoor mall parking|shaded walkways)/iu
});

const POSE_EVIDENCE = Object.freeze({
  "door-lean":/(?:leaning naturally against the closed driver door|leaning on closed driver door)/iu,
  "door-open":/(?:standing beside the open driver door|beside the open driver door|at open driver door)/iu,
  "front-grille":/(?:standing beside the front grille|beside the front grille|at front grille)/iu,
  "rear-tailgate":/(?:standing near the rear tailgate|near the rear tailgate)/iu,
  "front-fender":/(?:front fender|hand resting on the body|free hand on body)/iu,
  "rear-quarter":/(?:rear three-quarter corner|rear-quarter)/iu,
  "hood-sit":/(?:front edge of the hood|sitting at front edge of the hood|sitting lightly on the hood)/iu
});

const CONTACT_EVIDENCE = /(?:(?:tire|tires)[^.]{0,35}contact shadow|contact shadow[^.]{0,35}(?:tire|tires))/iu;

function text(value) { return typeof value === "string" ? value.trim() : ""; }
function optionByValue(options, value) { return options.find((item) => item.value === value) || null; }

export function getCarExteriorLocationOptions() {
  return CAR_EXTERIOR_LOCATIONS.map((item) => ({ ...item }));
}

export function getCarExteriorPoseOptions() {
  return CAR_EXTERIOR_POSES.filter((item) => !FORBIDDEN_SELFIE_POSES.has(item.value)).map((item) => ({ ...item }));
}

export function getCarExteriorLightingOptions({ time = "night", location = DEFAULT_LOCATION, pose = DEFAULT_POSE } = {}) {
  const period = text(time) === "day" ? "day" : "night";
  const locationId = optionByValue(CAR_EXTERIOR_LOCATIONS, text(location))?.value || DEFAULT_LOCATION;
  const poseId = optionByValue(getCarExteriorPoseOptions(), text(pose))?.value || DEFAULT_POSE;
  const base = LIGHTING_OPTIONS.carExterior?.[period] || [];
  return base.filter((item) => {
    if (item.value === "villa-porch" && locationId !== "villa") return false;
    if (item.value === "interior-spill" && poseId !== "door-open") return false;
    return true;
  }).map((item) => ({ ...item }));
}

export function resolveCarExteriorSelection(raw = {}) {
  const requestedLocation = text(raw.carExteriorLocation);
  const locationOption = optionByValue(CAR_EXTERIOR_LOCATIONS, requestedLocation) || optionByValue(CAR_EXTERIOR_LOCATIONS, DEFAULT_LOCATION);

  const allowedPoses = getCarExteriorPoseOptions();
  const requestedPose = text(raw.carExteriorPose);
  const poseOption = optionByValue(allowedPoses, requestedPose) || optionByValue(allowedPoses, DEFAULT_POSE);

  const time = text(raw.time) === "day" ? "day" : "night";
  const lightingOptions = getCarExteriorLightingOptions({ time, location:locationOption.value, pose:poseOption.value });
  const requestedLighting = text(raw.carExteriorLighting);
  const lightingOption = optionByValue(lightingOptions, requestedLighting) || lightingOptions[0] || null;

  return Object.freeze({
    time,
    location:locationOption.value,
    locationText:locationOption.text,
    pose:poseOption.value,
    poseText:poseOption.text,
    lighting:lightingOption?.value || "",
    lightingText:lightingOption?.text || "",
    lightingOptions:Object.freeze(lightingOptions.map((item) => Object.freeze({ ...item })))
  });
}

export function describeCompactCarExteriorSelection(raw = {}) {
  const selection = resolveCarExteriorSelection(raw);
  const location = COMPACT_LOCATION_TEXT[selection.location] || selection.locationText;
  const pose = COMPACT_POSE_TEXT[selection.pose] || selection.poseText;
  return `${location}; subject ${pose}; tire contact shadow.`;
}

export function describeMissingCarExteriorSelectionEvidence(prompt, raw = {}) {
  const selection = resolveCarExteriorSelection(raw);
  const source = String(prompt || "");
  const clauses = [];
  if (!LOCATION_EVIDENCE[selection.location]?.test(source)) clauses.push(COMPACT_LOCATION_TEXT[selection.location] || selection.locationText);
  if (!POSE_EVIDENCE[selection.pose]?.test(source)) clauses.push(`subject ${COMPACT_POSE_TEXT[selection.pose] || selection.poseText}`);
  if (!CONTACT_EVIDENCE.test(source)) clauses.push("tire contact shadow");
  return clauses.length ? `${clauses.join("; ")}.` : "";
}

export function isCarExteriorSelfiePoseAllowed(value) {
  return Boolean(optionByValue(getCarExteriorPoseOptions(), text(value)));
}
