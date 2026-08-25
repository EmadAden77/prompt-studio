import { APP_CONFIG } from "./config/appConfig.js";
import { FIXED_DATA, IMAGE_A_AUTHORITY, IMAGE_B_AUTHORITY } from "./data/fixedData.js";
import { POSES } from "./data/posesData.js";
import { SCENES } from "./data/scenesData.js";
import { CAMERA_SPECS, LENSES, SELFIE_ARM_STRATEGIES } from "./data/cameraData.js";
import { LIGHTING_OPTIONS } from "./data/lightingData.js";
import { CLOTHING_OPTIONS } from "./data/clothingData.js";
import { EXPRESSION_OPTIONS } from "./data/expressionsData.js";
import { HAIR_OPTIONS } from "./data/hairData.js";
import { QUAD_DEFAULTS, QUAD_EXPRESSION_IDS, QUAD_POSE_IDS } from "./data/quadModeData.js";
import { ROOM_LOCK_POLICIES } from "./policies/roomLockPolicy.js";
import { SceneEngine } from "./engines/sceneEngine.js";
import { PoseEngine } from "./engines/poseEngine.js";
import { CameraEngine } from "./engines/cameraEngine.js";
import { LightingEngine } from "./engines/lightingEngine.js";
import { IdentityEngine } from "./engines/identityEngine.js";
import { RoomLockEngine } from "./engines/roomLockEngine.js";
import { PromptEngine } from "./engines/promptEngine.js";
import { Validator } from "./engines/validator.js";
import { AutoEngineeringEngine } from "./engines/autoEngineeringEngine.js";
import { StorageManager } from "./utils/storage.js";
import { ImageHandler, formatBytes } from "./utils/imageHandler.js";
import { copyText } from "./utils/clipboard.js";
import { downloadText } from "./utils/download.js";
import { $, $$, closeDialog, openDialog, setOptions, showToast } from "./ui/dom.js";
import { renderPrompt, renderPromptSummary } from "./ui/promptDisplay.js";
import { renderValidation } from "./ui/conflictModal.js";
import { renderScenePicker } from "./ui/scenePicker.js";

const CLOTHING_CATEGORY_LABELS = Object.freeze({
  sleepwear: "ملابس نوم",
  casual: "كاجوال",
  sport: "رياضي",
  winter: "شتوي",
  traditional: "تقليدي"
});

class App {
  constructor() {
    this.storage = new StorageManager(APP_CONFIG.storageKey);
    this.state = this.storage.load(APP_CONFIG.defaultState);
    this.state.uploads = { imageA: null, imageB: null };

    this.poseEngine = new PoseEngine(POSES);
    this.sceneEngine = new SceneEngine(SCENES);
    this.cameraEngine = new CameraEngine(CAMERA_SPECS, LENSES, SELFIE_ARM_STRATEGIES);
    this.lightingEngine = new LightingEngine(LIGHTING_OPTIONS);
    this.identityEngine = new IdentityEngine(FIXED_DATA, IMAGE_A_AUTHORITY);
    this.roomLockEngine = new RoomLockEngine(ROOM_LOCK_POLICIES, IMAGE_B_AUTHORITY);
    this.autoEngineeringEngine = new AutoEngineeringEngine({
      sceneEngine: this.sceneEngine,
      lightingEngine: this.lightingEngine
    });
    this.promptEngine = new PromptEngine({
      identityEngine: this.identityEngine,
      roomLockEngine: this.roomLockEngine,
      poseEngine: this.poseEngine,
      cameraEngine: this.cameraEngine,
      lightingEngine: this.lightingEngine
    });
    this.validator = new Validator({ lightingEngine: this.lightingEngine });
    this.imageHandler = new ImageHandler({
      maxBytes: APP_CONFIG.maxImageBytes,
      acceptedTypes: APP_CONFIG.acceptedImageTypes
    });

    this.engineering = null;
    this.lastPrompt = "";
    this.lastValidation = null;
    this.dom = this.cacheDOM();
  }

  cacheDOM() {
    return {
      poseSelect: $("#poseSelect"),
      expressionSelect: $("#expressionSelect"),
      hairSelect: $("#hairSelect"),
      lightingSelect: $("#lightingSelect"),
      clothingSelect: $("#clothingSelect"),
      autoEngineerBtn: $("#autoEngineerBtn"),
      modeHint: $("#modeHint"),
      sceneName: $("#sceneName"),
      sceneRegion: $("#sceneRegion"),
      sceneFilename: $("#sceneFilename"),
      sceneReasons: $("#sceneReasons"),
      sceneConfidence: $("#sceneConfidence"),
      sceneImage: $("#sceneImage"),
      sceneFallback: $("#sceneFallback"),
      overrideSceneBtn: $("#overrideSceneBtn"),
      validationStatus: $("#validationStatus"),
      validationSummary: $("#validationSummary"),
      conflictsList: $("#conflictsList"),
      autoFixBtn: $("#autoFixBtn"),
      finalPrompt: $("#finalPrompt"),
      promptWordCount: $("#promptWordCount"),
      promptSummary: $("#promptSummary"),
      copyBtn: $("#copyBtn"),
      downloadBtn: $("#downloadBtn"),
      validateBtn: $("#validateBtn"),
      rebuildBtn: $("#rebuildBtn"),
      sceneDialog: $("#sceneDialog"),
      scenePickerGrid: $("#scenePickerGrid"),
      helpBtn: $("#helpBtn"),
      helpDialog: $("#helpDialog"),
      themeBtn: $("#themeBtn"),
      themeIcon: $("#themeIcon"),
      saveStatus: $("#saveStatus")
    };
  }

  init() {
    this.sanitizeState();
    this.populateQuadControls();
    this.bindEvents();
    this.applyTheme();
    this.updateAll({ initial: true });
  }

  sanitizeState() {
    if (!QUAD_POSE_IDS.includes(this.state.poseId)) this.state.poseId = "lying_right_side";
    if (!HAIR_OPTIONS.some((item) => item.id === this.state.hairId)) this.state.hairId = "same";
    if (!QUAD_EXPRESSION_IDS.includes(this.state.expressionId)) this.state.expressionId = "relaxed";
    if (!LIGHTING_OPTIONS.some((item) => item.id === this.state.lightingId)) this.state.lightingId = "lamp_and_phone";
    if (!CLOTHING_OPTIONS.some((item) => item.id === this.state.clothingId)) this.state.clothingId = APP_CONFIG.defaultState.clothingId;
    if (!["light", "dark", "system"].includes(this.state.theme)) this.state.theme = "system";
    this.state.mode = QUAD_DEFAULTS.mode;
    this.state.sceneOverrideId ??= QUAD_DEFAULTS.sceneOverrideId;
  }

  populateClothingSelect() {
    const select = this.dom.clothingSelect;
    if (!select) return;
    const fragment = document.createDocumentFragment();

    Object.entries(CLOTHING_CATEGORY_LABELS).forEach(([category, label]) => {
      const group = document.createElement("optgroup");
      group.label = label;
      CLOTHING_OPTIONS.filter((item) => item.category === category).forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name_ar;
        group.appendChild(option);
      });
      fragment.appendChild(group);
    });

    select.replaceChildren(fragment);
    select.value = this.state.clothingId;
  }

  populateQuadControls() {
    const quadPoses = POSES.filter((pose) => QUAD_POSE_IDS.includes(pose.id));
    const quadExpressions = EXPRESSION_OPTIONS.filter((item) => QUAD_EXPRESSION_IDS.includes(item.id));
    setOptions(this.dom.poseSelect, quadPoses, this.state.poseId);
    setOptions(this.dom.hairSelect, HAIR_OPTIONS, this.state.hairId);
    setOptions(this.dom.expressionSelect, quadExpressions, this.state.expressionId);
    setOptions(this.dom.lightingSelect, LIGHTING_OPTIONS, this.state.lightingId);
    this.populateClothingSelect();
    if (this.dom.modeHint) this.dom.modeHint.textContent = "5 اختيارات فقط — الباقي تلقائي";
  }

  bindEvents() {
    [
      [this.dom.poseSelect, "poseId"],
      [this.dom.hairSelect, "hairId"],
      [this.dom.lightingSelect, "lightingId"],
      [this.dom.expressionSelect, "expressionId"],
      [this.dom.clothingSelect, "clothingId"]
    ].forEach(([element, field]) => {
      element.addEventListener("change", () => {
        this.state[field] = element.value;
        if (field === "poseId") this.state.sceneOverrideId = null;
        this.updateAll();
      });
    });

    this.bindUpload("imageA");
    this.bindUpload("imageB");

    this.dom.autoEngineerBtn?.addEventListener("click", () => {
      this.state.sceneOverrideId = null;
      this.updateAll();
      showToast("تمت إعادة الهندسة الحتمية من الاختيارات الخمسة");
    });
    this.dom.overrideSceneBtn.addEventListener("click", () => this.openScenePicker());
    this.dom.autoFixBtn.addEventListener("click", () => this.applyAutoFixes());
    this.dom.copyBtn.addEventListener("click", () => this.copyPrompt());
    this.dom.downloadBtn.addEventListener("click", () => downloadText(this.lastPrompt));
    this.dom.validateBtn.addEventListener("click", () => this.focusValidation());
    this.dom.rebuildBtn.addEventListener("click", () => this.rebuildPrompt());
    this.dom.helpBtn.addEventListener("click", () => openDialog(this.dom.helpDialog));
    this.dom.themeBtn.addEventListener("click", () => this.toggleTheme());

    $$('[data-close-dialog]').forEach((button) => {
      button.addEventListener("click", () => closeDialog($(`#${button.dataset.closeDialog}`)));
    });

    [this.dom.sceneDialog, this.dom.helpDialog].forEach((dialog) => {
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) closeDialog(dialog);
      });
    });

    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        if (!this.dom.copyBtn.disabled) this.copyPrompt();
      }
    });

    window.addEventListener("beforeunload", () => this.imageHandler.destroy());
  }

  bindUpload(key) {
    const suffix = key === "imageA" ? "A" : "B";
    const input = $(`#image${suffix}Input`);
    const dropzone = $(`#image${suffix}Dropzone`);
    const remove = $(`#image${suffix}Remove`);

    input.addEventListener("change", () => this.handleImage(key, input.files?.[0]));
    remove.addEventListener("click", () => this.removeImage(key));

    ["dragenter", "dragover"].forEach((type) => {
      dropzone.addEventListener(type, (event) => {
        event.preventDefault();
        dropzone.classList.add("is-dragging");
      });
    });
    ["dragleave", "drop"].forEach((type) => {
      dropzone.addEventListener(type, (event) => {
        event.preventDefault();
        dropzone.classList.remove("is-dragging");
      });
    });
    dropzone.addEventListener("drop", (event) => this.handleImage(key, event.dataTransfer?.files?.[0]));
    dropzone.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        input.click();
      }
    });
  }

  handleImage(key, file) {
    const validation = this.imageHandler.validate(file);
    if (!validation.valid) {
      showToast(validation.error, "error", 3600);
      return;
    }
    this.state.uploads[key] = this.imageHandler.createPreview(key, file);
    this.renderUpload(key);
    this.updateAll();
    showToast(key === "imageA" ? "تمت إضافة صورة الهوية" : "تمت إضافة صورة المكان");
  }

  removeImage(key) {
    const suffix = key === "imageA" ? "A" : "B";
    this.imageHandler.revoke(key);
    this.state.uploads[key] = null;
    $(`#image${suffix}Input`).value = "";
    this.renderUpload(key);
    this.updateAll();
  }

  renderUpload(key) {
    const suffix = key === "imageA" ? "A" : "B";
    const value = this.state.uploads[key];
    const preview = $(`#image${suffix}Preview`);
    const remove = $(`#image${suffix}Remove`);
    const meta = $(`#image${suffix}Meta`);
    const card = $(`[data-upload="${key}"]`);

    card.classList.toggle("has-image", Boolean(value));
    remove.hidden = !value;
    preview.hidden = !value;
    if (value) {
      preview.src = value.url;
      meta.textContent = `${value.name} • ${formatBytes(value.size)}`;
    } else {
      preview.removeAttribute("src");
      meta.textContent = "";
    }
  }

  engineerState() {
    const pose = this.poseEngine.getById(this.state.poseId);
    this.engineering = this.autoEngineeringEngine.engineer({
      pose,
      lightingId: this.state.lightingId,
      sceneOverrideId: this.state.sceneOverrideId
    });
    if (!this.engineering) return;

    const derivedFields = [
      "bodyDirection",
      "cameraAngle",
      "cameraDistance",
      "cameraType",
      "lensType",
      "roomMode",
      "selectedSceneId",
      "lightingId"
    ];
    derivedFields.forEach((field) => {
      this.state[field] = this.engineering[field];
    });
    this.state.mode = "smart";
  }

  syncLightingControl() {
    const ids = this.engineering?.compatibleLightingIds ?? LIGHTING_OPTIONS.map((item) => item.id);
    const options = LIGHTING_OPTIONS.filter((item) => ids.includes(item.id));
    const safeOptions = options.length ? options : LIGHTING_OPTIONS;
    setOptions(this.dom.lightingSelect, safeOptions, this.state.lightingId);
    this.dom.poseSelect.value = this.state.poseId;
    this.dom.hairSelect.value = this.state.hairId;
    this.dom.expressionSelect.value = this.state.expressionId;
    this.dom.clothingSelect.value = this.state.clothingId;
  }

  buildConfig() {
    const pose = this.poseEngine.getById(this.state.poseId);
    const scene = this.sceneEngine.getById(this.state.selectedSceneId);
    return {
      ...this.state,
      pose,
      scene,
      camera: this.cameraEngine.getCamera(this.state.cameraType),
      lens: this.cameraEngine.getLens(this.state.lensType),
      expression: EXPRESSION_OPTIONS.find((item) => item.id === this.state.expressionId) ?? EXPRESSION_OPTIONS[0],
      hair: HAIR_OPTIONS.find((item) => item.id === this.state.hairId) ?? HAIR_OPTIONS[0],
      clothing: CLOTHING_OPTIONS.find((item) => item.id === this.state.clothingId) ?? CLOTHING_OPTIONS[0],
      lighting: this.lightingEngine.getById(this.state.lightingId),
      autoEngineering: this.engineering
    };
  }

  applyFixesToState(fixes = []) {
    fixes.forEach((fix) => {
      this.state[fix.field] = fix.value;
      if (fix.secondary) this.state[fix.secondary.field] = fix.secondary.value;
    });
  }

  updateAll({ initial = false } = {}) {
    this.engineerState();
    let config = this.buildConfig();
    let validation = this.validator.validate(config);

    for (let attempt = 0; attempt < 3 && validation.autoFixes.length; attempt += 1) {
      this.applyFixesToState(validation.autoFixes);
      this.engineerState();
      config = this.buildConfig();
      validation = this.validator.validate(config);
    }

    this.syncLightingControl();
    this.lastValidation = validation;
    this.lastPrompt = this.promptEngine.generate(config);

    this.renderScene();
    renderValidation({
      statusElement: this.dom.validationStatus,
      summaryElement: this.dom.validationSummary,
      listElement: this.dom.conflictsList,
      autoFixButton: this.dom.autoFixBtn,
      result: validation
    });
    renderPrompt({
      promptElement: this.dom.finalPrompt,
      countElement: this.dom.promptWordCount,
      prompt: this.lastPrompt
    });
    renderPromptSummary(this.dom.promptSummary, config);

    this.dom.copyBtn.disabled = !validation.valid;
    this.dom.downloadBtn.disabled = !validation.valid;
    this.dom.copyBtn.title = validation.valid ? "نسخ الأمر النهائي" : "أصلح التعارضات أولًا";

    this.storage.save(this.state);
    if (!initial) this.flashSaved();
  }

  renderScene() {
    const scene = this.engineering?.scene;
    if (!scene) {
      this.dom.sceneName.textContent = "لا يوجد مرجع متوافق";
      this.dom.sceneRegion.textContent = "NO MATCH";
      this.dom.sceneFilename.textContent = "أعد الهندسة";
      this.dom.sceneConfidence.textContent = "غير متاح";
      this.dom.sceneReasons.replaceChildren();
      this.setSceneImage("assets/scene-placeholder.svg", true);
      return;
    }

    this.dom.sceneName.textContent = scene.name_ar;
    this.dom.sceneRegion.textContent = scene.region.replaceAll("_", " ").toUpperCase();
    this.dom.sceneFilename.textContent = scene.image_filename;
    this.dom.sceneConfidence.textContent = this.engineering.confidence;
    this.dom.sceneConfidence.className = `confidence-badge${this.engineering.sceneOverrideId ? "" : " is-high"}`;

    const reasons = document.createDocumentFragment();
    const item = document.createElement("li");
    item.textContent = this.engineering.sceneReason;
    reasons.append(item);
    const sideRule = document.createElement("li");
    sideRule.textContent = this.engineering.orientation;
    reasons.append(sideRule);
    this.dom.sceneReasons.replaceChildren(reasons);

    const uploaded = this.state.uploads.imageB;
    this.setSceneImage(uploaded?.url ?? scene.image_url, false, Boolean(uploaded));
  }

  setSceneImage(source, knownFallback = false, uploaded = false) {
    const image = this.dom.sceneImage;
    const fallback = this.dom.sceneFallback;
    image.onerror = null;
    image.onload = null;
    fallback.hidden = !knownFallback;
    image.classList.toggle("is-placeholder", knownFallback);

    if (!knownFallback && !uploaded) {
      image.onerror = () => {
        image.onerror = null;
        image.src = "assets/scene-placeholder.svg";
        image.classList.add("is-placeholder");
        fallback.hidden = false;
      };
      image.onload = () => {
        fallback.hidden = true;
        image.classList.remove("is-placeholder");
      };
    }
    image.src = source;
    if (uploaded) {
      fallback.hidden = true;
      image.classList.remove("is-placeholder");
    }
  }

  openScenePicker() {
    renderScenePicker({
      container: this.dom.scenePickerGrid,
      scenes: SCENES,
      selectedSceneId: this.state.sceneOverrideId ?? this.state.selectedSceneId,
      onSelect: (sceneId) => {
        this.state.sceneOverrideId = sceneId;
        closeDialog(this.dom.sceneDialog);
        this.updateAll();
        showToast("تم تجاوز المرجع التلقائي؛ الفحص ما زال نشطًا");
      }
    });
    openDialog(this.dom.sceneDialog);
  }

  applyAutoFixes() {
    if (!this.lastValidation?.autoFixes.length) return;
    this.applyFixesToState(this.lastValidation.autoFixes);
    this.updateAll();
    showToast("تم إصلاح التعارضات القابلة للإصلاح");
  }

  async copyPrompt() {
    try {
      await copyText(this.lastPrompt);
      const original = this.dom.copyBtn.innerHTML;
      this.dom.copyBtn.textContent = "تم النسخ ✓";
      showToast("تم نسخ الأمر كاملًا");
      window.setTimeout(() => { this.dom.copyBtn.innerHTML = original; }, 1400);
    } catch {
      showToast("تعذر النسخ تلقائيًا؛ حدّد النص وانسخه يدويًا.", "error");
      this.dom.finalPrompt.focus();
    }
  }

  focusValidation() {
    $(".validation-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
    showToast(this.lastValidation.valid ? "الفحص مكتمل: لا توجد تعارضات مانعة" : "راجع التعارضات الحمراء", this.lastValidation.valid ? "success" : "error");
  }

  rebuildPrompt() {
    this.updateAll();
    this.dom.finalPrompt.closest(".prompt-editor")?.classList.add("is-refreshed");
    window.setTimeout(() => this.dom.finalPrompt.closest(".prompt-editor")?.classList.remove("is-refreshed"), 500);
    showToast("أُعيد بناء الأمر من الاختيارات الخمسة");
  }

  toggleTheme() {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const currentDark = this.state.theme === "dark" || (this.state.theme === "system" && systemDark);
    this.state.theme = currentDark ? "light" : "dark";
    this.applyTheme();
    this.storage.save(this.state);
  }

  applyTheme() {
    document.documentElement.dataset.theme = this.state.theme;
    const isDark = this.state.theme === "dark"
      || (this.state.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    this.dom.themeIcon.textContent = isDark ? "☀" : "☾";
    this.dom.themeBtn.title = isDark ? "استخدام المظهر الفاتح" : "استخدام المظهر الداكن";
  }

  flashSaved() {
    this.dom.saveStatus.classList.add("is-saving");
    this.dom.saveStatus.lastChild.textContent = " جارٍ الحفظ";
    window.setTimeout(() => {
      this.dom.saveStatus.classList.remove("is-saving");
      this.dom.saveStatus.lastChild.textContent = " محفوظ محليًا";
    }, 420);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    const app = new App();
    app.init();
  } catch (error) {
    console.error("AI Selfie Prompt Studio failed to initialize", error);
    showToast("تعذر تشغيل الاستوديو. حدّث الصفحة وحاول مرة ثانية.", "error", 6000);
  }
});
