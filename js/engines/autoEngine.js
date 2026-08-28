import { POSES as DEFAULT_POSES } from "../data/posesData.js";
import { LIGHTING_OPTIONS as DEFAULT_LIGHTING } from "../data/lightingData.js";

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

export function lightingAllowed(lighting, scene) {
  if (!lighting) return false;
  if (!scene) return true;
  const visible = new Set(scene.visible_features || []);
  const required = Array.isArray(lighting.required_features) ? lighting.required_features : [];
  return required.every((feature) => visible.has(feature));
}

export function lightingCoherence(lighting, cfg = {}) {
  const scene = cfg.selectedScene || null;
  const poseId = cfg.pose?.id || cfg.poseId || "";
  const n = cfg.companionSet?.members?.length || 0;
  const visible = new Set(scene?.visible_features || []);
  const mode = cfg.templateMode || "day";
  let score = 0;

  if (!lightingAllowed(lighting, scene)) return Number.NEGATIVE_INFINITY;
  if (cfg.preferredLightingId && lighting.id === cfg.preferredLightingId) score += 120;

  if (visible.has("daylight_access") && lighting.category === "daylight") score += 42;
  if (visible.has("lamp") && lighting.category === "lamp") score += 38;
  if (visible.has("ceiling_spots") && ["all_spots","ceiling_spots_dim"].includes(lighting.id)) score += 36;
  if (visible.has("ceiling_light") && lighting.category === "ceiling") score += 32;
  if (!(lighting.required_features || []).length) score += 14;

  if (mode === "night") score += isNight(lighting) ? 55 : -24;
  else if (mode === "day" || mode === "sofa") score += isNight(lighting) ? -10 : 18;

  if (n >= 2) {
    if (["daylight","ceiling"].includes(lighting.category)) score += 18;
    if (lighting.id === "phone_screen_only" || lighting.id === "phone_dark_closeup") score -= 24;
  }

  if (poseId.startsWith("lying") || poseId === "semi_reclining") {
    if (["lamp","screen","night"].includes(lighting.category) || isNight(lighting)) score += 12;
  }
  if (poseId.startsWith("standing")) {
    if (["daylight","ceiling"].includes(lighting.category)) score += 12;
  }
  if (poseId === "sitting_sofa") {
    if (visible.has("daylight_access") && lighting.category === "daylight") score += 14;
    if (visible.has("ceiling_light") && lighting.category === "ceiling") score += 8;
  }

  return score;
}

export function rankedLighting(cfg = {}, options = DEFAULT_LIGHTING) {
  return options
    .filter((lighting) => lightingAllowed(lighting, cfg.selectedScene))
    .map((lighting, index) => ({ lighting, score:lightingCoherence(lighting, cfg), index }))
    .sort((a, b) => (b.score - a.score) || (a.index - b.index))
    .map((entry) => entry.lighting);
}

export function autoLighting(cfg = {}, options = DEFAULT_LIGHTING) {
  const pool = rankedLighting(cfg, options);
  return pool[0] || options[0] || null;
}

export function altLighting(cfg = {}, k = 0, options = DEFAULT_LIGHTING) {
  const pool = rankedLighting(cfg, options);
  if (!pool.length) return options[0] || null;
  return pool[Math.max(0, k) % pool.length] || pool[0];
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
  Object.assign(window, { NIGHT_IDS, isNight, poseAllowed, lightingAllowed, lightingCoherence, rankedLighting, autoLighting, altLighting, coherence, rankedPoses, autoPose, altPose, autoHair, autoExpression });
