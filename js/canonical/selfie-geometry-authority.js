import { SECTION_REGISTRY } from "../sections/index.js";

export const SELFIE_OPTICS_LOCK = "Selfie optics lock:";
export const SELFIE_FRAMING_LOCK = "Selfie framing:";

const DEFAULT_ANGLES = Object.freeze(["eye","high","low","three-quarter"]);
const ANGLE_DEGREES = Object.freeze({ eye:0, high:8, low:-8, "three-quarter":0 });
const TRADITIONAL_SAFE_CAR_POSES = new Set(["door-lean","door-open","front-grille","rear-tailgate","front-fender","rear-quarter"]);

function text(value) { return String(value ?? "").trim(); }
function sectionConfig(section, raw) {
  if (section && typeof section === "object") return section;
  const id = text(section) || text(raw?.studioSection);
  return SECTION_REGISTRY[id] || null;
}
function geometryRules(section) { return section?.rules?.selfieGeometry || {}; }
function allowedAngles(section) {
  const values = geometryRules(section).angles;
  return Array.isArray(values) && values.length ? values : DEFAULT_ANGLES;
}
function allowedPoses(section) {
  const values = geometryRules(section).poses;
  return Array.isArray(values) ? values : [];
}
function hasAllowed(list, value) { return list.includes(value); }
function clothingEvidence(raw) {
  return [raw?.clothing, raw?.carExteriorClothing, raw?.customClothing, raw?.clothingCustom]
    .map(text).filter(Boolean).join(" ").toLowerCase();
}
function isTraditional(raw) {
  return /(?:^|\b)(?:thobe|shemagh|ghutra|iqal|agal|bisht|traditional)(?:\b|[-_])/iu.test(clothingEvidence(raw));
}
function isNight(raw) { return text(raw?.time).toLowerCase() !== "day"; }
function compactPose(value) { return text(value).replace(/[-_]+/gu, " "); }
function manualFraming(sectionId, pose, angle) {
  if (sectionId === "carExterior") return `manual ${compactPose(pose)} composition with a slightly awkward car crop`;
  if (sectionId === "group") return `wide group composition with the phone holder inside the frame`;
  if (sectionId === "accidental") return `off-axis accidental composition with an imperfect edge crop`;
  return `natural phone-held ${compactPose(pose)} composition at the selected ${compactPose(angle)} angle`;
}
function autoDefaults(sectionId) {
  if (sectionId === "carExterior") return { angle:"eye", angleDegrees:0, pose:"door-lean", framing:"front quarter vehicle context with a slightly awkward car crop" };
  if (sectionId === "street") return { angle:"eye", angleDegrees:0, pose:"standing-relaxed", framing:"relaxed standing selfie with ordinary street context" };
  if (sectionId === "gym") return { angle:"eye", angleDegrees:0, pose:"standing-relaxed", framing:"relaxed gym selfie with believable equipment context" };
  if (sectionId === "bedroom") return { angle:"eye", angleDegrees:0, pose:"standing-bedroom", framing:"natural bedroom selfie with lived-in room context" };
  if (sectionId === "group") return { angle:"high", angleDegrees:10, pose:"staggered", framing:"wide staggered group composition with the phone holder centered" };
  if (sectionId === "accidental") return { angle:"low", angleDegrees:-12, pose:"low-off-axis", framing:"low off-axis accidental composition with an imperfect edge crop" };
  if (sectionId === "car") return { angle:"eye", angleDegrees:0, pose:"driver-close", framing:"close driver-seat selfie with steering-wheel and cabin context" };
  if (sectionId === "solo") return { angle:"eye", angleDegrees:0, pose:"standing-relaxed", framing:"natural arm-length selfie with comfortable head and shoulder room" };
  return { angle:"eye", angleDegrees:0, pose:"standing-relaxed", framing:"natural arm-length selfie with scene context" };
}
function autoRule(raw, section) {
  const id = section?.id || text(raw?.studioSection);
  const location = text(raw?.carExteriorLocation).toLowerCase();
  const mood = text(raw?.streetMood).toLowerCase();
  const scene = text(raw?.scene).toLowerCase();
  const night = isNight(raw);
  let chosen = autoDefaults(id);

  if (id === "carExterior" && night && location === "villa") {
    chosen = { angle:"high", angleDegrees:8, pose:"door-lean", framing:"front quarter vehicle view with the DRL visible and a slightly awkward car crop" };
  } else if (id === "carExterior" && !night && location === "parking") {
    chosen = { angle:"eye", angleDegrees:0, pose:"front-grille", framing:"front grille selfie with the hood edge entering the lower frame" };
  } else if (id === "street" && night) {
    chosen = { angle:"high", angleDegrees:10, pose:"walking", framing:"walking selfie with streetlights behind the subject" };
  } else if (id === "street" && !night && (mood === "alley" || mood === "bufia")) {
    chosen = { angle:"eye", angleDegrees:0, pose:"standing-relaxed", framing:"relaxed standing selfie with the alley or bufia context behind" };
  } else if (id === "gym" && night) {
    chosen = { angle:"high", angleDegrees:12, pose:"seated-rest-elbows", framing:"seated rest selfie with elbows on knees and gym context behind" };
  } else if (id === "bedroom" && night) {
    chosen = { angle:"high", angleDegrees:15, pose:"seated-bed", framing:"seated bed selfie with natural bedside context" };
  } else if (id === "group") {
    chosen = { angle:"high", angleDegrees:10, pose:"staggered", framing:"wide staggered group composition with the phone holder centered" };
  } else if (id === "accidental") {
    chosen = { angle:"low", angleDegrees:-12, pose:"low-off-axis", framing:"low off-axis accidental composition with an imperfect edge crop" };
  } else if (id === "solo" && night && scene === "street") {
    chosen = { angle:"high", angleDegrees:8, pose:"walking", framing:"walking arm-length selfie with practical streetlights behind" };
  }

  if (id === "carExterior" && isTraditional(raw) && !TRADITIONAL_SAFE_CAR_POSES.has(chosen.pose)) {
    chosen = { ...chosen, pose:"door-lean", framing:"front quarter vehicle view with a thobe-safe stance and a slightly awkward car crop" };
  }
  return chosen;
}
function opticsText(angle, degrees) {
  const yaw = angle === "three-quarter" ? " with a three-quarter yaw" : "";
  return `${SELFIE_OPTICS_LOCK} camera about ${degrees}° above eye level${yaw}.`;
}

export function resolveSelfieGeometry(raw = {}, section = undefined) {
  const config = sectionConfig(section, raw);
  const id = config?.id || text(raw?.studioSection);
  const angles = allowedAngles(config);
  const poses = allowedPoses(config);
  const requestedAngle = text(raw?.selfieAngle);
  const requestedPose = text(raw?.selfiePose);
  const angleManual = Boolean(requestedAngle && requestedAngle !== "auto" && hasAllowed(angles, requestedAngle));
  const poseManual = Boolean(requestedPose && requestedPose !== "auto" && hasAllowed(poses, requestedPose));
  const automatic = autoRule(raw, config);

  const angle = angleManual ? requestedAngle : automatic.angle;
  const angleDegrees = angleManual ? (ANGLE_DEGREES[requestedAngle] ?? 0) : automatic.angleDegrees;
  let pose = poseManual ? requestedPose : automatic.pose;
  if (id === "carExterior" && isTraditional(raw) && !TRADITIONAL_SAFE_CAR_POSES.has(pose)) pose = "door-lean";
  if (poses.length && !hasAllowed(poses, pose)) pose = poses[0];
  const framing = angleManual || poseManual ? manualFraming(id, pose, angle) : automatic.framing;

  return Object.freeze({
    angle,
    angleDegrees,
    pose,
    framing,
    optics:opticsText(angle, angleDegrees),
    mode:Object.freeze({ angle:angleManual ? "manual" : "auto", pose:poseManual ? "manual" : "auto" })
  });
}

export default resolveSelfieGeometry;
