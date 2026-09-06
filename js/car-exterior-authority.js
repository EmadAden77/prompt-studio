import { CAR_EXTERIOR_LOCATIONS, CAR_EXTERIOR_POSES, LIGHTING_OPTIONS } from "./data.js";

const DEFAULT_LOCATION = "villa";
const DEFAULT_POSE = "door-lean";
const FORBIDDEN_SELFIE_POSES = new Set(["key-fob"]);

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

export function isCarExteriorSelfiePoseAllowed(value) {
  return Boolean(optionByValue(getCarExteriorPoseOptions(), text(value)));
}
