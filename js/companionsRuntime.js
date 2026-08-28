import { COMPANION_SETS, COMPANIONS } from "./data/companionsData.js";
import { resolveCompanionPoses } from "./data/companionPosesData.js";

const DEFAULT_SET_ID = "none";
const GROUPS = Object.freeze({
  women: { label:"نساء", ids:new Set(["w40", "w42"]) },
  children: { label:"أطفال", ids:new Set(["toddler", "girl5", "boy7", "boy10"]) },
  groups: { label:"مجموعات", ids:new Set(["both_women", "two_kids", "mom_toddler", "family_small", "family_full"]) }
});

function selectedSet(app) {
  return COMPANION_SETS.find((set) => set.id === app.state.companionSetId)
    || COMPANION_SETS.find((set) => set.id === DEFAULT_SET_ID)
    || null;
}

function groupReachWarning(config) {
  const count = config?.companionSet?.members?.length ?? 0;
  if (count <= 4) return null;
  return {
    severity:"warning",
    type:"companion_arm_reach",
    message:"المجموعة أوسع من مدى الذراع",
    suggestion:"خفف القص قليلًا ضمن مدى عدسة السيلفي الواقعي أو قلّل عدد المرافقين حتى تبقى جميع الوجوه داخل لقطة واحدة قابلة للوصول من مسافة ذراع.",
    autoFix:null,
    solution:null
  };
}

function fallbackSummary(app) {
  const set = selectedSet(app);
  if (!set?.members?.length) return "";
  const resolved = resolveCompanionPoses(set, app.state.companionSeedExtra ?? 0, app.state.poseId ?? app.state.pose?.id ?? "");
  if (!resolved.replacements.length) return "العفوية الحالية متوافقة مع الوضعية.";
  return resolved.replacements.map((r) => {
    const name = COMPANIONS[r.id]?.name_ar || r.id;
    return `استبدال آمن: ${name} · ${r.from.ar} ← ${r.to.ar} (${r.reason}).`;
  }).join(" ");
}

function install() {
  const App = window.App;
  if (!App || App.prototype.__companionsV27) return;
  App.prototype.__companionsV27 = true;

  const originalCacheDOM = App.prototype.cacheDOM;
  App.prototype.cacheDOM = function(...args) {
    const dom = originalCacheDOM.apply(this, args);
    dom.companionSelect = document.getElementById("companionSelect");
    dom.companionShuffleBtn = document.getElementById("companionShuffleBtn");
    dom.companionPoseSummary = document.getElementById("companionPoseSummary");
    return dom;
  };

  const originalSanitize = App.prototype.sanitizeState;
  App.prototype.sanitizeState = function() {
    originalSanitize.call(this);
    if (!COMPANION_SETS.some((set) => set.id === this.state.companionSetId)) this.state.companionSetId = DEFAULT_SET_ID;
    if (!Number.isInteger(this.state.companionSeedExtra) || this.state.companionSeedExtra < 0) this.state.companionSeedExtra = 0;
  };

  const originalBuildConfig = App.prototype.buildConfig;
  App.prototype.buildConfig = function(...args) {
    const config = originalBuildConfig.apply(this, args);
    config.companionSet = selectedSet(this);
    config.companionSeedExtra = this.state.companionSeedExtra ?? 0;
    return config;
  };

  const originalPopulateSelects = App.prototype.populateSelects;
  App.prototype.populateSelects = function(...args) {
    const result = originalPopulateSelects.apply(this, args);
    this.populateCompanionSelectV27();
    this.renderCompanionSpontaneityV27();
    return result;
  };

  App.prototype.populateCompanionSelectV27 = function() {
    const select = this.dom?.companionSelect || document.getElementById("companionSelect");
    if (!select) return;
    const fragment = document.createDocumentFragment();
    const none = COMPANION_SETS.find((set) => set.id === DEFAULT_SET_ID);
    if (none) fragment.appendChild(new Option(none.name_ar, none.id));

    Object.values(GROUPS).forEach((groupDef) => {
      const group = document.createElement("optgroup");
      group.label = groupDef.label;
      COMPANION_SETS.filter((set) => groupDef.ids.has(set.id))
        .forEach((set) => group.appendChild(new Option(set.name_ar, set.id)));
      fragment.appendChild(group);
    });

    select.replaceChildren(fragment);
    select.value = this.state.companionSetId || DEFAULT_SET_ID;
  };

  App.prototype.renderCompanionSpontaneityV27 = function() {
    const set = selectedSet(this);
    const active = Boolean(set?.members?.length);
    if (this.dom?.companionShuffleBtn) {
      this.dom.companionShuffleBtn.disabled = !active;
      this.dom.companionShuffleBtn.hidden = !active;
    }
    if (this.dom?.companionPoseSummary) {
      this.dom.companionPoseSummary.textContent = active ? fallbackSummary(this) : "";
      this.dom.companionPoseSummary.hidden = !active;
    }
  };

  const originalBindUI = App.prototype.bindUI;
  App.prototype.bindUI = function(...args) {
    const result = originalBindUI.apply(this, args);
    this.dom.companionSelect?.addEventListener("change", () => {
      this.state.companionSetId = this.dom.companionSelect.value;
      this.state.companionSeedExtra = 0;
      this.renderCompanionSpontaneityV27();
      this.engineer();
    });
    this.dom.companionShuffleBtn?.addEventListener("click", () => {
      const set = selectedSet(this);
      if (!set?.members?.length) return;
      this.state.companionSeedExtra = (this.state.companionSeedExtra ?? 0) + 1;
      this.renderCompanionSpontaneityV27();
      this.engineer();
    });
    this.dom.poseSelect?.addEventListener("change", () => queueMicrotask(() => this.renderCompanionSpontaneityV27()));
    return result;
  };

  const originalInit = App.prototype.init;
  App.prototype.init = function(...args) {
    if (!this.__companionsValidatorPatched && this.validator?.validate) {
      const originalValidate = this.validator.validate.bind(this.validator);
      this.validator.validate = (config) => {
        const result = originalValidate(config);
        const warning = groupReachWarning(config);
        if (warning) {
          result.warnings.push(warning);
          result.issues.push(warning);
        }
        return result;
      };
      this.__companionsValidatorPatched = true;
    }
    const result = originalInit.apply(this, args);
    queueMicrotask(() => this.renderCompanionSpontaneityV27());
    return result;
  };

  const originalReset = App.prototype.resetToDefaults;
  App.prototype.resetToDefaults = function(...args) {
    this.state.companionSetId = DEFAULT_SET_ID;
    this.state.companionSeedExtra = 0;
    const result = originalReset.apply(this, args);
    this.populateCompanionSelectV27();
    this.renderCompanionSpontaneityV27();
    return result;
  };
}

install();
