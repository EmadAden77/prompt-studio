import { BED_CATEGORIES, BED_TEMPLATES, getBedTemplatesByCat } from "./data/bedTemplatesData.js";

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

function timeBadge(light = "") {
  const text = light.toLowerCase();
  if (/lamp|screen|warm|night|cool screen/.test(text) && !/window morning|ceiling or window|window soft|window low/.test(text)) return "ليلي 🌙";
  if (/window|morning|day|ceiling/.test(text) && !/lamp \+ screen|lamp selected|screen\/lamp/.test(text)) return "نهاري ☀️";
  return "محايد";
}

function poseForTemplate(template) {
  return TEMPLATE_POSE[template.id] || CATEGORY_POSE[template.cat] || "lying_back";
}

function selectedTemplate(app) {
  return BED_TEMPLATES.find((t) => t.id === app.state.selectedBedTemplateId) || null;
}

function install() {
  const App = window.App;
  if (!App || App.prototype.__bedTemplatesV21) return;
  App.prototype.__bedTemplatesV21 = true;

  const originalSanitize = App.prototype.sanitizeState;
  App.prototype.sanitizeState = function() {
    originalSanitize.call(this);
    if (!BED_TEMPLATES.some((t) => t.id === this.state.selectedBedTemplateId)) this.state.selectedBedTemplateId = null;
    if (!BED_CATEGORIES.some((c) => c.id === this.state.bedTemplateCategory)) this.state.bedTemplateCategory = BED_CATEGORIES[0].id;
  };

  const originalBuildConfig = App.prototype.buildConfig;
  App.prototype.buildConfig = function(...args) {
    const config = originalBuildConfig.apply(this, args);
    config.bedTemplate = selectedTemplate(this);
    return config;
  };

  const originalInit = App.prototype.init;
  App.prototype.init = function(...args) {
    const result = originalInit.apply(this, args);
    window.__promptStudioApp = this;
    this.initBedTemplatesV21();
    return result;
  };

  App.prototype.initBedTemplatesV21 = function() {
    this.dom.bedCategoryChips = document.getElementById("bedCategoryChips");
    this.dom.bedTemplateGrid = document.getElementById("bedTemplateGrid");
    if (!this.dom.bedCategoryChips || !this.dom.bedTemplateGrid) return;
    this.renderBedCategoryChips();
    this.renderBedTemplateCards();

    this.dom.poseSelect?.addEventListener("change", () => {
      if (!this.state.selectedBedTemplateId) return;
      this.state.selectedBedTemplateId = null;
      this.renderBedTemplateCards();
    }, true);
  };

  App.prototype.renderBedCategoryChips = function() {
    const active = this.state.bedTemplateCategory || BED_CATEGORIES[0].id;
    this.dom.bedCategoryChips.replaceChildren(...BED_CATEGORIES.map((cat) => {
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
    const cat = this.state.bedTemplateCategory || BED_CATEGORIES[0].id;
    const selectedId = this.state.selectedBedTemplateId;
    const cards = getBedTemplatesByCat(cat).map((template) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `bed-template-card${template.id === selectedId ? " selected" : ""}`;
      button.dataset.bedTemplate = template.id;
      button.innerHTML = `<span class="bed-template-card__top"><strong>${template.ar}</strong><span class="bed-template-time">${timeBadge(template.light)}</span></span><span>📐 ${template.angle}</span><span>🖼️ ${template.frame}</span><span>🙂 ${template.mood}</span><small>${template.anti}</small>`;
      button.addEventListener("click", () => this.selectBedTemplate(template.id));
      return button;
    });
    this.dom.bedTemplateGrid.replaceChildren(...cards);
  };

  App.prototype.selectBedTemplate = function(templateId) {
    const template = BED_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    this.state.selectedBedTemplateId = template.id;
    this.state.bedTemplateCategory = template.cat;
    this.state.poseId = poseForTemplate(template);
    if (!this.state.lightingId) this.state.lightingId = this.lightingEngine?.items?.[0]?.id || "lamp_and_phone";
    this.populateSelects();
    this.renderBedCategoryChips();
    this.renderBedTemplateCards();
    this.engineer();
    this.setStatus(`قالب: ${template.ar}`);
  };
}

install();
