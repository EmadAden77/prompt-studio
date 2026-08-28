import { CLUTTER_LEVELS, CLUTTER } from "./data/clutterData.js";

const DEFAULT_CLUTTER_ID = "just_woke";
const LEVEL_ORDER = ["tidy", "light", "medium", "heavy"];

const SUPPORT_RISKS = Object.freeze({
  bed: new Set(["just_woke", "cable_mess", "clothes_bed", "night_mess", "heavy_full"]),
  floor: new Set(["drinks", "floor_lived", "laundry", "gym_bag", "heavy_full"]),
  chair: new Set(["clothes_chair", "heavy_full"])
});

function selectedClutter(app) {
  return CLUTTER.find((item) => item.id === app.state.clutterId) || CLUTTER.find((item) => item.id === DEFAULT_CLUTTER_ID) || null;
}

function supportKind(poseId = "") {
  if (poseId.startsWith("lying") || poseId === "semi_reclining" || poseId === "sitting_bed_edge") return "bed";
  if (poseId === "sitting_floor") return "floor";
  if (poseId === "sitting_chair") return "chair";
  return null;
}

function clutterSupportWarning(config) {
  const clutter = config?.clutter;
  const kind = supportKind(config?.pose?.id || "");
  if (!clutter || !kind || !SUPPORT_RISKS[kind]?.has(clutter.id)) return null;
  return {
    severity: "warning",
    type: "clutter_support_contact",
    message: "الفوضى تلامس سطح الارتكاز",
    suggestion: "أزح الأغراض المتنقلة عن منطقة تماس الجسم مع السرير/الأرض/المقعد مع إبقائها قريبة وبنفس الفوضى العامة؛ الأثاث الثابت لا يتحرك.",
    autoFix: null,
    solution: null
  };
}

function suggestedLevel(template, mode = "day") {
  if (mode === "night") {
    if (template?.cat === "glow") return "medium";
    if (template?.cat === "dark" || template?.cat === "spill" || template?.cat === "lamp" || template?.cat === "semi") return "light";
    return "light";
  }
  if (["st", "mr"].includes(template?.cat)) return "medium";
  if (["lb", "ls", "lp", "sr", "sd"].includes(template?.cat)) return "light";
  return "light";
}

function install() {
  const App = window.App;
  if (!App || App.prototype.__clutterV25) return;
  App.prototype.__clutterV25 = true;

  const originalCacheDOM = App.prototype.cacheDOM;
  App.prototype.cacheDOM = function(...args) {
    const dom = originalCacheDOM.apply(this, args);
    dom.clutterSelect = document.getElementById("clutterSelect");
    dom.clutterSuggestion = document.getElementById("clutterSuggestion");
    return dom;
  };

  const originalSanitize = App.prototype.sanitizeState;
  App.prototype.sanitizeState = function() {
    originalSanitize.call(this);
    if (!CLUTTER.some((item) => item.id === this.state.clutterId)) this.state.clutterId = DEFAULT_CLUTTER_ID;
  };

  const originalBuildConfig = App.prototype.buildConfig;
  App.prototype.buildConfig = function(...args) {
    const config = originalBuildConfig.apply(this, args);
    config.clutter = selectedClutter(this);
    return config;
  };

  const originalPopulateSelects = App.prototype.populateSelects;
  App.prototype.populateSelects = function(...args) {
    const result = originalPopulateSelects.apply(this, args);
    this.populateClutterSelectV25();
    return result;
  };

  App.prototype.populateClutterSelectV25 = function() {
    const select = this.dom?.clutterSelect || document.getElementById("clutterSelect");
    if (!select) return;
    const fragment = document.createDocumentFragment();
    LEVEL_ORDER.forEach((level) => {
      const items = CLUTTER.filter((item) => item.level === level);
      if (!items.length) return;
      const group = document.createElement("optgroup");
      group.label = CLUTTER_LEVELS[level];
      items.forEach((item) => group.appendChild(new Option(item.name_ar, item.id)));
      fragment.appendChild(group);
    });
    select.replaceChildren(fragment);
    select.value = this.state.clutterId || DEFAULT_CLUTTER_ID;
  };

  const originalBindUI = App.prototype.bindUI;
  App.prototype.bindUI = function(...args) {
    const result = originalBindUI.apply(this, args);
    this.dom.clutterSelect?.addEventListener("change", () => {
      this.state.clutterId = this.dom.clutterSelect.value;
      if (this.dom.clutterSuggestion) this.dom.clutterSuggestion.textContent = "";
      this.engineer();
    });
    return result;
  };

  const originalInit = App.prototype.init;
  App.prototype.init = function(...args) {
    if (!this.__clutterValidatorPatched && this.validator?.validate) {
      const originalValidate = this.validator.validate.bind(this.validator);
      this.validator.validate = (config) => {
        const result = originalValidate(config);
        const warning = clutterSupportWarning(config);
        if (warning) {
          result.warnings.push(warning);
          result.issues.push(warning);
        }
        return result;
      };
      this.__clutterValidatorPatched = true;
    }
    return originalInit.apply(this, args);
  };

  const originalReset = App.prototype.resetToDefaults;
  App.prototype.resetToDefaults = function(...args) {
    this.state.clutterId = DEFAULT_CLUTTER_ID;
    const result = originalReset.apply(this, args);
    this.populateClutterSelectV25();
    if (this.dom.clutterSuggestion) this.dom.clutterSuggestion.textContent = "";
    return result;
  };

  App.prototype.suggestClutterForTemplate = function(template, mode = "day") {
    const level = suggestedLevel(template, mode);
    const label = CLUTTER_LEVELS[level] || level;
    if (this.dom.clutterSuggestion) {
      this.dom.clutterSuggestion.textContent = `اقتراح فقط: فوضى ${label} مناسبة لهذا القالب. اختيارك الحالي لم يتغير.`;
    }
  };

  if (typeof App.prototype.selectBedTemplate === "function") {
    const originalSelectBedTemplate = App.prototype.selectBedTemplate;
    App.prototype.selectBedTemplate = function(templateId) {
      const result = originalSelectBedTemplate.call(this, templateId);
      const template = window.BED_TEMPLATES?.find((item) => item.id === templateId);
      if (template) this.suggestClutterForTemplate(template, "day");
      return result;
    };
  }

  if (typeof App.prototype.selectNightTemplate === "function") {
    const originalSelectNightTemplate = App.prototype.selectNightTemplate;
    App.prototype.selectNightTemplate = function(templateId) {
      const result = originalSelectNightTemplate.call(this, templateId);
      const template = window.NIGHT_TEMPLATES?.find((item) => item.id === templateId);
      if (template) this.suggestClutterForTemplate(template, "night");
      return result;
    };
  }
}

install();
