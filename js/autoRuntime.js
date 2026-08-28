import { POSES } from "./data/posesData.js";
import { HAIR_OPTIONS } from "./data/hairData.js";
import { EXPRESSIONS } from "./data/expressionsData.js";
import { LIGHTING_OPTIONS } from "./data/lightingData.js";
import { COMPANION_SETS } from "./data/companionsData.js";
import { autoPose, altPose, autoHair, autoExpression, poseAllowed, autoLighting, altLighting } from "./engines/autoEngine.js";

const unique = (items) => [...new Set(items.filter(Boolean))];
const byId = (items, id) => items.find((item) => item.id === id);

function selectedCompanions(app) {
  return COMPANION_SETS.find((set) => set.id === app.state.companionSetId)
    || COMPANION_SETS.find((set) => set.id === "none")
    || { id:"none", members:[] };
}

function activeScene(app) {
  return app.sceneEngine.getById(app.state.sceneOverrideId || app.state.selectedSceneId) || null;
}

function rotate(base, pool, offset) {
  const choices = unique([base, ...pool]);
  if (!choices.length) return base;
  const start = Math.max(0, choices.indexOf(base));
  return choices[(start + (offset || 0)) % choices.length];
}

function templatePose(app) {
  if (!app.state.selectedBedTemplateId && !app.state.selectedNightTemplateId && !app.state.selectedSofaTemplateId) return null;
  return byId(POSES, app.state.poseId) || null;
}

function nearestSupportedPose(cfg, proposed) {
  if (poseAllowed(proposed, cfg.selectedScene)) return { pose:proposed, corrected:false };
  const pose = autoPose(cfg, POSES);
  return { pose, corrected:pose?.id !== proposed?.id };
}

function preferredTemplateLighting(app) {
  if (!app.state.selectedNightTemplateId) return null;
  const current = app.lightingEngine.getById(app.state.lightingId);
  return current?.id || null;
}

function autoDecision(app) {
  const scene = activeScene(app);
  const companionSet = selectedCompanions(app);
  const templated = templatePose(app);
  const templateMode = app.state.bedTemplateMode || "day";

  const lightingCfg = {
    selectedScene:scene,
    companionSet,
    pose:templated || byId(POSES, app.state.poseId),
    poseId:templated?.id || app.state.poseId,
    templateMode,
    preferredLightingId:preferredTemplateLighting(app)
  };
  const lighting = (app.state.autoLightingOffset || 0) > 0
    ? altLighting(lightingCfg, app.state.autoLightingOffset, LIGHTING_OPTIONS)
    : autoLighting(lightingCfg, LIGHTING_OPTIONS);

  const cfg = { selectedScene:scene, companionSet, lighting };
  const basePose = templated && poseAllowed(templated, scene) ? templated : autoPose(cfg, POSES);
  const offset = app.state.autoPoseOffset || 0;
  const proposed = offset > 0 ? altPose(cfg, offset, POSES) : basePose;
  const resolved = nearestSupportedPose(cfg, proposed);
  const pose = resolved.pose;

  const poseId = pose?.id || "sitting_bed_edge";
  const hairBase = autoHair(poseId);
  const hairPool = unique([hairBase, "same", "morning_messy", "neat", "natural_tousled"])
    .filter((id) => HAIR_OPTIONS.some((item) => item.id === id));
  const expressionBase = autoExpression({ companionSet, lighting });
  const expressionPool = unique([expressionBase, "relaxed", "smile", "neutral", "serious"])
    .filter((id) => EXPRESSIONS.some((item) => item.id === id));

  return {
    poseId,
    hairId:rotate(hairBase, hairPool, app.state.autoHairOffset),
    expressionId:rotate(expressionBase, expressionPool, app.state.autoExpressionOffset),
    lightingId:lighting?.id || app.state.lightingId,
    companionSet,
    lighting,
    scene,
    correction:{ poseId, corrected:resolved.corrected },
    rejectedPose:resolved.corrected ? proposed : null
  };
}

function showToast(message) {
  if (!message) return;
  let toast = document.getElementById("autoToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "autoToast";
    toast.className = "auto-toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3400);
}

function install() {
  const App = window.App;
  if (!App || App.prototype.__autoV31) return;
  App.prototype.__autoV31 = true;

  const originalCacheDOM = App.prototype.cacheDOM;
  App.prototype.cacheDOM = function(...args) {
    const dom = originalCacheDOM.apply(this, args);
    dom.autoPose = document.getElementById("autoPose");
    dom.autoHair = document.getElementById("autoHair");
    dom.autoExpression = document.getElementById("autoExpression");
    dom.autoLighting = document.getElementById("autoLighting");
    return dom;
  };

  const originalSanitize = App.prototype.sanitizeState;
  App.prototype.sanitizeState = function(...args) {
    const result = originalSanitize.apply(this, args);
    ["autoPoseOffset","autoHairOffset","autoExpressionOffset","autoLightingOffset"].forEach((key) => {
      if (!Number.isInteger(this.state[key]) || this.state[key] < 0) this.state[key] = 0;
    });
    return result;
  };

  App.prototype.runAuto = function({ announceCorrection = true } = {}) {
    const decision = autoDecision(this);
    this.state.poseId = decision.poseId;
    this.state.hairId = decision.hairId;
    this.state.expressionId = decision.expressionId;
    this.state.lightingId = decision.lightingId;
    this.state.companionSet = decision.companionSet;

    if (this.dom.poseSelect) this.dom.poseSelect.value = decision.poseId;
    if (this.dom.hairSelect) this.dom.hairSelect.value = decision.hairId;
    if (this.dom.expressionSelect) this.dom.expressionSelect.value = decision.expressionId;
    if (this.dom.lightingSelect) this.dom.lightingSelect.value = decision.lightingId;

    if (decision.correction.corrected && announceCorrection) {
      const rejected = decision.rejectedPose?.name_ar || decision.rejectedPose?.id || "الاقتراح الأول";
      const accepted = byId(POSES, decision.poseId)?.name_ar || decision.poseId;
      showToast(`تم تصحيح الوضعية تلقائيًا لتوافق المرجع: ${accepted}. المرجع لا يدعم ${rejected}.`);
      this.setStatus?.("تم تطبيق بوابة المرجع الصارمة واختيار أقرب وضعية صالحة.");
    }
    return decision;
  };

  App.prototype.renderAutoBadgesV30 = function() {
    const pose = byId(POSES, this.state.poseId);
    const hair = byId(HAIR_OPTIONS, this.state.hairId);
    const expression = byId(EXPRESSIONS, this.state.expressionId);
    const lighting = byId(LIGHTING_OPTIONS, this.state.lightingId);
    if (this.dom.autoPose) this.dom.autoPose.textContent = pose?.name_ar || "—";
    if (this.dom.autoHair) this.dom.autoHair.textContent = hair?.name_ar || "—";
    if (this.dom.autoExpression) this.dom.autoExpression.textContent = expression?.name_ar || "—";
    if (this.dom.autoLighting) this.dom.autoLighting.textContent = lighting?.name_ar || "—";
  };

  const originalPopulate = App.prototype.populateSelects;
  App.prototype.populateSelects = function(...args) {
    const result = originalPopulate.apply(this, args);
    this.renderAutoBadgesV30?.();
    return result;
  };

  const originalEngineer = App.prototype.engineer;
  App.prototype.engineer = function(options = {}) {
    this.runAuto({ announceCorrection:true });
    const result = originalEngineer.call(this, options);
    this.renderAutoBadgesV30();
    this.renderCompanionSpontaneityV27?.();
    return result;
  };

  const originalBindUI = App.prototype.bindUI;
  App.prototype.bindUI = function(...args) {
    const result = originalBindUI.apply(this, args);
    document.querySelectorAll("[data-auto-r]").forEach((button) => button.addEventListener("click", () => {
      const kind = button.dataset.autoR;
      if (kind === "pose") this.state.autoPoseOffset = (this.state.autoPoseOffset || 0) + 1;
      if (kind === "hair") this.state.autoHairOffset = (this.state.autoHairOffset || 0) + 1;
      if (kind === "expr") this.state.autoExpressionOffset = (this.state.autoExpressionOffset || 0) + 1;
      if (kind === "lighting") this.state.autoLightingOffset = (this.state.autoLightingOffset || 0) + 1;
      this.engineer();
      const label = kind === "pose" ? "لوضعية" : kind === "hair" ? "لشعر" : kind === "expr" ? "لتعبير" : "لإضاءة";
      showToast(`تم اختيار بديل تلقائي جديد ${label}.`);
    }));
    return result;
  };

  const originalReset = App.prototype.resetToDefaults;
  App.prototype.resetToDefaults = function(...args) {
    this.state.autoPoseOffset = 0;
    this.state.autoHairOffset = 0;
    this.state.autoExpressionOffset = 0;
    this.state.autoLightingOffset = 0;
    const result = originalReset.apply(this, args);
    this.renderAutoBadgesV30();
    return result;
  };

  const originalLoadRecent = App.prototype.loadFromLast5;
  App.prototype.loadFromLast5 = function(...args) {
    const result = originalLoadRecent.apply(this, args);
    this.renderAutoBadgesV30();
    return result;
  };
}

install();
