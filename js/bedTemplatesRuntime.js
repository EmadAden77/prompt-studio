import { BED_CATEGORIES, BED_TEMPLATES, getBedTemplatesByCat } from "./data/bedTemplatesData.js";
import { NIGHT_CATEGORIES, NIGHT_TEMPLATES, getNightTemplatesByCat } from "./data/nightTemplatesData.js";
import { SOFA_CATEGORIES, SOFA_TEMPLATES, getSofaTemplatesByCat } from "./data/sofaTemplatesData.js";

const CATEGORY_POSE = Object.freeze({
  lb: "lying_back",
  lp: "lying_stomach",
  sr: "semi_reclining",
  st: "sitting_bed_edge",
  sd: "standing_center",
  mr: "mirror_selfie"
});

const TEMPLATE_POSE = Object.freeze({
  ls_right: "lying_right_side",
  ls_left: "lying_left_side",
  ls_tight: "lying_right_side",
  st_bededge: "sitting_bed_edge",
  st_chair: "sitting_chair",
  st_floor: "sitting_floor",
  sd_center: "standing_center",
  sd_bedside: "standing_bedside",
  sd_wardrobe: "standing_wardrobe",
  mr_vanity: "mirror_selfie",
  mr_full: "mirror_selfie"
});

const NIGHT_LIGHTING_BY_TEMPLATE = Object.freeze({
  dk_lb_top: "phone_dark_closeup",
  dk_ls_right: "phone_dark_closeup",
  dk_sr_pillows: "phone_dark_closeup",
  dk_st_floor: "phone_dark_closeup",
  dk_lp_prone: "phone_dark_closeup",
  sp_lb_hall: "hallway_spill",
  sp_ls_bath: "bathroom_spill",
  sp_sr_street: "streetlight_curtain",
  sp_st_hall: "hallway_spill",
  lp_lb_lamp: "lamp_only",
  lp_ls_lamp: "lamp_and_phone",
  lp_sr_lamp: "lamp_and_phone",
  lp_lb_blackout: "lamp_only",
  sb_lb_blue: "blue_hour_dusk",
  sb_ls_moon: "moonlight_window",
  sb_sr_fajr: "fajr_pre_dawn",
  sb_st_dusk: "blue_hour_dusk",
  gl_lb_tv: "tv_glow_night",
  gl_sr_tv: "tv_glow_night",
  gl_ls_tv: "tv_glow_night"
});

function timeBadge(light = "") {
  const text = light.toLowerCase();
  if (/lamp|screen|warm|night|cool screen/.test(text) && !/window morning|ceiling or window|window soft|window low/.test(text)) return "ليلي 🌙";
  if (/window|morning|day|ceiling/.test(text) && !/lamp \+ screen|lamp selected|screen\/lamp/.test(text)) return "نهاري ☀️";
  return "محايد";
}

function poseForDayTemplate(template) {
  return TEMPLATE_POSE[template.id] || CATEGORY_POSE[template.cat] || "lying_back";
}

function currentMode(app) {
  return ["day", "night", "sofa"].includes(app.state.bedTemplateMode) ? app.state.bedTemplateMode : "day";
}

function selectedDayTemplate(app) {
  if (currentMode(app) !== "day") return null;
  return BED_TEMPLATES.find((t) => t.id === app.state.selectedBedTemplateId) || null;
}

function selectedNightTemplate(app) {
  if (currentMode(app) !== "night") return null;
  return NIGHT_TEMPLATES.find((t) => t.id === app.state.selectedNightTemplateId) || null;
}

function selectedSofaTemplate(app) {
  if (currentMode(app) !== "sofa") return null;
  return SOFA_TEMPLATES.find((t) => t.id === app.state.selectedSofaTemplateId) || null;
}

function categoriesFor(app) {
  if (currentMode(app) === "night") return NIGHT_CATEGORIES;
  if (currentMode(app) === "sofa") return SOFA_CATEGORIES;
  return BED_CATEGORIES;
}

function templatesForCategory(app, cat) {
  if (currentMode(app) === "night") return getNightTemplatesByCat(cat);
  if (currentMode(app) === "sofa") return getSofaTemplatesByCat(cat);
  return getBedTemplatesByCat(cat);
}

function selectedIdFor(app) {
  if (currentMode(app) === "night") return app.state.selectedNightTemplateId;
  if (currentMode(app) === "sofa") return app.state.selectedSofaTemplateId;
  return app.state.selectedBedTemplateId;
}

function sofaReferenceIssue(config, scenes = []) {
  if (!config?.sofaTemplate || !config?.scene) return null;
  if (config.scene.visible_features?.includes("sofa")) return null;
  const candidates = scenes.filter((scene) => scene.visible_features?.includes("sofa") && scene.supported_poses?.includes("sitting_sofa"));
  const names = candidates.slice(0, 4).map((scene) => scene.name_ar).join("، ");
  return {
    severity:"error",
    type:"sofa_reference_missing",
    message:"المرجع لا يحتوي أريكة",
    suggestion:names ? `اختر مرجعًا صالحًا يحتوي أريكة مثل: ${names}، أو استخدم وضعية بديلة لا تعتمد على الأريكة.` : "اختر مرجعًا يحتوي sofa ضمن visible_features أو استخدم وضعية بديلة.",
    autoFix:null,
    solution:candidates.length ? { title:"الحل المقترح", text:`مراجع صالحة للأريكة: ${names}.`, actions:[{ kind:"scene", values:candidates.map((scene) => scene.id) }] } : null
  };
}

function install() {
  const App = window.App;
  if (!App || App.prototype.__bedTemplatesV28) return;
  App.prototype.__bedTemplatesV28 = true;

  const originalSanitize = App.prototype.sanitizeState;
  App.prototype.sanitizeState = function() {
    originalSanitize.call(this);
    if (!["day", "night", "sofa"].includes(this.state.bedTemplateMode)) this.state.bedTemplateMode = "day";
    if (!BED_TEMPLATES.some((t) => t.id === this.state.selectedBedTemplateId)) this.state.selectedBedTemplateId = null;
    if (!NIGHT_TEMPLATES.some((t) => t.id === this.state.selectedNightTemplateId)) this.state.selectedNightTemplateId = null;
    if (!SOFA_TEMPLATES.some((t) => t.id === this.state.selectedSofaTemplateId)) this.state.selectedSofaTemplateId = null;
    const categories = categoriesFor(this);
    if (!categories.some((c) => c.id === this.state.bedTemplateCategory)) this.state.bedTemplateCategory = categories[0].id;
  };

  const originalBuildConfig = App.prototype.buildConfig;
  App.prototype.buildConfig = function(...args) {
    const config = originalBuildConfig.apply(this, args);
    config.bedTemplate = selectedDayTemplate(this);
    config.nightTemplate = selectedNightTemplate(this);
    config.sofaTemplate = selectedSofaTemplate(this);
    return config;
  };

  const originalInit = App.prototype.init;
  App.prototype.init = function(...args) {
    if (!this.__sofaValidatorPatched && this.validator?.validate) {
      const originalValidate = this.validator.validate.bind(this.validator);
      this.validator.validate = (config) => {
        const result = originalValidate(config);
        const issue = sofaReferenceIssue(config, this.sceneEngine?.scenes || []);
        if (issue) {
          result.conflicts.push(issue);
          result.issues.push(issue);
        }
        return result;
      };
      this.__sofaValidatorPatched = true;
    }
    const result = originalInit.apply(this, args);
    window.__promptStudioApp = this;
    this.initBedTemplatesV28();
    return result;
  };

  const originalReset = App.prototype.resetToDefaults;
  App.prototype.resetToDefaults = function(...args) {
    this.state.selectedBedTemplateId = null;
    this.state.selectedNightTemplateId = null;
    this.state.selectedSofaTemplateId = null;
    this.state.bedTemplateMode = "day";
    const result = originalReset.apply(this, args);
    this.state.bedTemplateCategory = BED_CATEGORIES[0].id;
    this.renderBedTemplateMode?.();
    this.renderBedCategoryChips?.();
    this.renderBedTemplateCards?.();
    return result;
  };

  const originalLoadRecent = App.prototype.loadFromLast5;
  App.prototype.loadFromLast5 = function(...args) {
    this.state.selectedBedTemplateId = null;
    this.state.selectedNightTemplateId = null;
    this.state.selectedSofaTemplateId = null;
    const result = originalLoadRecent.apply(this, args);
    this.renderBedTemplateCards?.();
    return result;
  };

  App.prototype.initBedTemplatesV28 = function() {
    this.dom.bedCategoryChips = document.getElementById("bedCategoryChips");
    this.dom.bedTemplateGrid = document.getElementById("bedTemplateGrid");
    if (!this.dom.bedCategoryChips || !this.dom.bedTemplateGrid) return;

    const picker = this.dom.bedCategoryChips.closest(".bed-template-picker");
    const head = picker?.querySelector(".bed-template-picker__head");
    if (head && !document.getElementById("bedTemplateModeSwitch")) {
      const mode = document.createElement("div");
      mode.id = "bedTemplateModeSwitch";
      mode.className = "bed-template-mode";
      mode.setAttribute("aria-label", "نوع القوالب");
      mode.innerHTML = `<button type="button" data-template-mode="day">نهاري ☀️</button><button type="button" data-template-mode="night">ليلي 🌙</button><button type="button" data-template-mode="sofa">أريكة 🛋️</button>`;
      head.appendChild(mode);
      mode.querySelectorAll("[data-template-mode]").forEach((button) => button.addEventListener("click", () => this.setBedTemplateMode(button.dataset.templateMode)));
    }

    this.renderBedTemplateMode();
    this.renderBedCategoryChips();
    this.renderBedTemplateCards();

    this.dom.poseSelect?.addEventListener("change", () => {
      if (!this.state.selectedBedTemplateId && !this.state.selectedNightTemplateId && !this.state.selectedSofaTemplateId) return;
      this.state.selectedBedTemplateId = null;
      this.state.selectedNightTemplateId = null;
      this.state.selectedSofaTemplateId = null;
      this.renderBedTemplateCards();
    }, true);

    this.dom.lightingSelect?.addEventListener("change", () => {
      if (!this.state.selectedNightTemplateId) return;
      this.state.selectedNightTemplateId = null;
      this.renderBedTemplateCards();
    }, true);
  };

  App.prototype.setBedTemplateMode = function(mode) {
    if (!["day", "night", "sofa"].includes(mode) || currentMode(this) === mode) return;
    this.state.bedTemplateMode = mode;
    this.state.selectedBedTemplateId = null;
    this.state.selectedNightTemplateId = null;
    this.state.selectedSofaTemplateId = null;
    const categories = mode === "night" ? NIGHT_CATEGORIES : mode === "sofa" ? SOFA_CATEGORIES : BED_CATEGORIES;
    this.state.bedTemplateCategory = categories[0].id;
    this.renderBedTemplateMode();
    this.renderBedCategoryChips();
    this.renderBedTemplateCards();
    this.storage.save(this.state);
  };

  App.prototype.renderBedTemplateMode = function() {
    document.querySelectorAll("[data-template-mode]").forEach((button) => {
      button.classList.toggle("active", button.dataset.templateMode === currentMode(this));
      button.setAttribute("aria-pressed", String(button.dataset.templateMode === currentMode(this)));
    });
  };

  App.prototype.renderBedCategoryChips = function() {
    const categories = categoriesFor(this);
    const active = categories.some((c) => c.id === this.state.bedTemplateCategory)
      ? this.state.bedTemplateCategory
      : categories[0].id;
    this.state.bedTemplateCategory = active;
    this.dom.bedCategoryChips.replaceChildren(...categories.map((cat) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `bed-category-chip${cat.id === active ? " active" : ""}`;
      button.dataset.bedCat = cat.id;
      button.textContent = `${cat.icon} ${cat.name_ar}`;
      button.addEventListener("click", () => {
        this.state.bedTemplateCategory = cat.id;
        this.renderBedCategoryChips();
        this.renderBedTemplateCards();
        this.storage.save(this.state);
      });
      return button;
    }));
  };

  App.prototype.renderBedTemplateCards = function() {
    const categories = categoriesFor(this);
    const cat = categories.some((c) => c.id === this.state.bedTemplateCategory)
      ? this.state.bedTemplateCategory
      : categories[0].id;
    const selectedId = selectedIdFor(this);
    const mode = currentMode(this);
    const cards = templatesForCategory(this, cat).map((template) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `bed-template-card${template.id === selectedId ? " selected" : ""}`;
      button.dataset.bedTemplate = template.id;
      const badge = mode === "night" ? "ليلي 🌙" : mode === "sofa" ? "أريكة 🛋️" : timeBadge(template.light);
      button.innerHTML = `<span class="bed-template-card__top"><strong>${template.ar}</strong><span class="bed-template-time">${badge}</span></span><span>📐 ${template.angle}</span><span>🖼️ ${template.frame}</span><span>🙂 ${template.mood}</span><small>${template.anti}</small>`;
      button.addEventListener("click", () => mode === "night" ? this.selectNightTemplate(template.id) : mode === "sofa" ? this.selectSofaTemplate(template.id) : this.selectBedTemplate(template.id));
      return button;
    });
    this.dom.bedTemplateGrid.replaceChildren(...cards);
  };

  App.prototype.selectBedTemplate = function(templateId) {
    const template = BED_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    this.state.bedTemplateMode = "day";
    this.state.selectedNightTemplateId = null;
    this.state.selectedSofaTemplateId = null;
    this.state.selectedBedTemplateId = template.id;
    this.state.bedTemplateCategory = template.cat;
    this.state.poseId = poseForDayTemplate(template);
    if (!this.state.lightingId) this.state.lightingId = this.lightingEngine?.options?.[0]?.id || "lamp_and_phone";
    this.populateSelects();
    this.renderBedTemplateMode();
    this.renderBedCategoryChips();
    this.renderBedTemplateCards();
    this.engineer();
    this.setStatus(`قالب نهاري: ${template.ar}`);
  };

  App.prototype.selectNightTemplate = function(templateId) {
    const template = NIGHT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const lightingId = NIGHT_LIGHTING_BY_TEMPLATE[template.id];
    const lightingExists = this.lightingEngine?.options?.some((item) => item.id === lightingId);
    this.state.bedTemplateMode = "night";
    this.state.selectedBedTemplateId = null;
    this.state.selectedSofaTemplateId = null;
    this.state.selectedNightTemplateId = template.id;
    this.state.bedTemplateCategory = template.cat;
    this.state.poseId = template.pose;
    if (lightingExists) this.state.lightingId = lightingId;
    this.populateSelects();
    this.renderBedTemplateMode();
    this.renderBedCategoryChips();
    this.renderBedTemplateCards();
    this.engineer();
    this.setStatus(`قالب ليلي: ${template.ar}`);
  };

  App.prototype.selectSofaTemplate = function(templateId) {
    const template = SOFA_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    this.state.bedTemplateMode = "sofa";
    this.state.selectedBedTemplateId = null;
    this.state.selectedNightTemplateId = null;
    this.state.selectedSofaTemplateId = template.id;
    this.state.bedTemplateCategory = template.cat;
    this.state.poseId = "sitting_sofa";
    if (!this.state.lightingId) this.state.lightingId = this.lightingEngine?.options?.[0]?.id || "lamp_and_phone";
    this.populateSelects();
    this.renderBedTemplateMode();
    this.renderBedCategoryChips();
    this.renderBedTemplateCards();
    this.engineer();
    this.setStatus(`قالب أريكة: ${template.ar}`);
  };
}

install();
