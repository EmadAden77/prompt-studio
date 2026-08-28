const NIGHT_LIGHT_IDS = Object.freeze([
  "phone_screen_only","phone_dark_closeup","tv_glow_night","moonlight_window",
  "ac_led_micro","hallway_spill","bathroom_spill","streetlight_curtain","night_city_window",
  "curtain_lamp","blue_hour_dusk","fajr_pre_dawn"
]);

export const isNight = (l) => NIGHT_LIGHT_IDS.includes(l?.id);

export function autoPose(cfg) {
  const scene = cfg.selectedScene;
  const n = cfg.companionSet?.members?.length || 0;
  const has = (f) => scene?.visible_features?.includes(f);
  const night = isNight(cfg.lighting);

  if (n >= 3) return has("sofa") ? "sitting_sofa" : "standing_center";
  if (n === 2) return has("sofa") ? "sitting_sofa" : (has("bed") ? "sitting_bed_edge" : "standing_center");
  if (n === 1 && cfg.companionSet?.members?.some((m) => m.startsWith("C")))
    return has("sofa") ? "sitting_sofa" : "sitting_bed_edge";
  if (night && n === 0) {
    if (!has("bed")) return "sitting_chair";
    return ["lying_back","lying_right_side","semi_reclining"][cfg.lighting.id.length % 3];
  }
  if (!night && n === 0)
    return has("sofa") ? "sitting_sofa" : (has("bed") ? "sitting_bed_edge" : "standing_center");
  return "sitting_bed_edge";
}

export function autoHair(poseId) {
  if (poseId?.startsWith("lying")) return "morning_messy";
  if (poseId?.startsWith("standing")) return "neat";
  return "same";
}

export function autoExpression(cfg) {
  const n = cfg.companionSet?.members?.length || 0;
  if (n > 0) return "smile";
  if (isNight(cfg.lighting)) return "relaxed";
  return "smile";
}

if (typeof window !== "undefined") Object.assign(window, { isNight, autoPose, autoHair, autoExpression });
