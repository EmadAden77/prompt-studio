import { POSES as DEFAULT_POSES } from "../data/posesData.js";

export const NIGHT_IDS = Object.freeze([
  "phone_screen_only","phone_dark_closeup","tv_glow_night","moonlight_window",
  "ac_led_micro","hallway_spill","bathroom_spill","streetlight_curtain","night_city_window",
  "curtain_lamp","blue_hour_dusk","fajr_pre_dawn","lamp_only","lamp_and_phone"
]);

export const isNight = (l) => NIGHT_IDS.includes(l?.id);

function featureRequirements(pose) {
  if (!pose) return [];
  if (Array.isArray(pose.requires) && pose.requires.length) return pose.requires;
  if (pose.id === "sitting_sofa" || pose.id === "standing_sofa") return ["sofa"];
  if (pose.id === "sitting_chair") return ["chair"];
  if (pose.id === "standing_wardrobe") return ["wardrobe"];
  if (pose.id === "standing_vanity" || pose.id === "mirror_selfie") return ["vanity_mirror"];
  if (pose.id?.startsWith("lying") || pose.id === "semi_reclining" || pose.id === "sitting_bed_edge" || pose.id === "standing_bedside") return ["bed"];
  return [];
}

export function poseAllowed(pose, scene) {
  if (!pose || !scene) return Boolean(pose);
  const visible = new Set(scene.visible_features || []);
  const requirements = featureRequirements(pose);
  const featOk = !requirements.length || requirements.some((feature) => visible.has(feature));
  const listed = !Array.isArray(scene.supported_poses) || scene.supported_poses.includes(pose.id);
  return featOk && listed;
}

export function coherence(pose, cfg = {}) {
  const n = cfg.companionSet?.members?.length || 0;
  const child = cfg.companionSet?.members?.some((m) => m.startsWith("C"));
  const night = isNight(cfg.lighting);
  const id = pose?.id || "";
  let score = 0;

  if (night && n === 0 && (id.startsWith("lying") || id === "semi_reclining")) score += 40;
  if (!night && n === 0 && (id.startsWith("standing") || id === "sitting_bed_edge")) score += 30;
  if (n >= 3 && (id === "sitting_sofa" || id === "standing_center")) score += 45;
  else if (n >= 2 && (id === "sitting_sofa" || id === "standing_center")) score += 45;
  if (n === 1 && child && (id === "sitting_sofa" || id === "sitting_bed_edge")) score += 45;
  if (n === 0 && id === "sitting_sofa" && !night) score += 15;

  if (id === "sitting_sofa" || id === "sitting_bed_edge") score += 4;
  if (id === "standing_center") score += 3;
  if (id === "semi_reclining") score += 2;
  return score;
}

export function rankedPoses(cfg = {}, poses = DEFAULT_POSES) {
  return poses
    .filter((pose) => poseAllowed(pose, cfg.selectedScene))
    .map((pose, index) => ({ pose, score:coherence(pose, cfg), index }))
    .sort((a, b) => (b.score - a.score) || (a.index - b.index))
    .map((entry) => entry.pose);
}

// v3 returns a pose object when an explicit pool is supplied. Legacy callers without a pool receive the pose id.
export function autoPose(cfg = {}, poses) {
  const pool = rankedPoses(cfg, poses || DEFAULT_POSES);
  const pose = pool[0] || (poses || DEFAULT_POSES)[0] || { id:"sitting_bed_edge", name_ar:"الجلوس على حافة السرير" };
  return poses ? pose : pose.id;
}

export function altPose(cfg = {}, k = 0, poses = DEFAULT_POSES) {
  const pool = rankedPoses(cfg, poses);
  if (!pool.length) return poses[0] || { id:"sitting_bed_edge", name_ar:"الجلوس على حافة السرير" };
  return pool[Math.max(0, k) % pool.length] || pool[0];
}

export const autoHair = (poseId) => poseId?.startsWith("lying") ? "morning_messy"
  : poseId?.startsWith("standing") ? "neat" : "same";

export const autoExpression = (cfg = {}) => (cfg.companionSet?.members?.length > 0) ? "smile"
  : isNight(cfg.lighting) ? "relaxed" : "smile";

if (typeof window !== "undefined")
  Object.assign(window, { NIGHT_IDS, isNight, poseAllowed, coherence, rankedPoses, autoPose, altPose, autoHair, autoExpression });
