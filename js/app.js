import { APP_CONFIG } from "./config/appConfig.js";
import { FIXED_DATA, IMAGE_A_AUTHORITY, IMAGE_B_AUTHORITY } from "./data/fixedData.js";
import { POSES, SELECTABLE_POSE_IDS } from "./data/posesData.js";
import { SCENES } from "./data/scenesData.js";
import { CAMERA_SPECS, LENSES, SELFIE_ARM_STRATEGIES } from "./data/cameraData.js";
import { LIGHTING_OPTIONS } from "./data/lightingData.js";
import { CLOTHING_OPTIONS } from "./data/clothingData.js";
import { EXPRESSIONS } from "./data/expressionsData.js";
import { HAIR_OPTIONS } from "./data/hairData.js";
import { QUAD_DEFAULTS, QUAD_EXPRESSION_IDS } from "./data/quadModeData.js";
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

const LIGHTING_CATEGORY_LABELS = Object.freeze({
  screen: "شاشة الهاتف",
  ceiling: "السقف",
  lamp: "الأباجورة",
  daylight: "النهار",
  mixed: "مختلطة",
  night: "ليلية"
});

const POSE_GROUPS = Object.freeze({
  bed: "🛏️ السرير",
  sofa: "🪑 الجلوس",
  chair: "🪑 الجلوس",
  room: "🧍 الوقوف",
  vanity: "🧍 الوقوف",
  wardrobe: "🧍 الوقوف"
});

function poseGroupLabel(pose) {
  if (pose?.id?.startsWith("standing")) return "🧍 الوقوف";
  if (pose?.id?.startsWith("sitting")) return "🪑 الجلوس";
  if (pose?.placement && POSE_GROUPS[pose.placement]) return POSE_GROUPS[pose.placement];
  return "🛏️ السرير";
}

class App {
  constructor() {
    this.storage = new StorageManager(APP_CONFIG.storageKey);
    this.state = this.storage.load(APP_CONFIG.defaultState);
    this.state.uploads = { imageA: null };

    this.poseEngine = new PoseEngine(POSES);
    this.sceneEngine = new SceneEngine(SCENES);
    this.cameraEngine = new CameraEngine(CAMERA_SPECS, LENSES, SELFIE_ARM_STRATEGIES);
    this.lightingEngine = new LightingEngine(LIGHTING_OPTIONS);
    this.identityEngine = new IdentityEngine(FIXED_DATA, IMAGE_A_AUTHORITY);
    this.roomLockEngine = new RoomLockEngine(ROOM_LOCK_POLICIES, IMAGE_B_AUTHORITY);
    this.autoEngineeringEngine = new AutoEngineeringEngine({ sceneEngine: this.sceneEngine, lightingEngine: this.lightingEngine });
    this.promptEngine = new PromptEngine({
      identityEngine: this.identityEngine,
      roomLockEngine: this.roomLockEngine,
      poseEngine: this.poseEngine,
      cameraEngine: this.cameraEngine,
      lightingEngine: this.lightingEngine
    });
    this.validator = new Validator({ lightingEngine: this.lightingEngine });
    this.imageHandler = new ImageHandler({ maxBytes: APP_CONFIG.maxImageBytes, acceptedTypes: APP_CONFIG.acceptedImageTypes });

    this.engineering = null;
    this.lastPrompt = "";
    this.lastValidation = null;
    this.dom = this.cacheDOM();
  }

  cacheDOM() {
    return {
      poseSelect: $("#poseSelect"), expressionSelect: $("#expressionSelect"), hairSelect: $("#hairSelect"),
      lightingSelect: $("#lightingSelect"), clothingSelect: $("#clothingSelect"), aspectSelect: $("#aspectSelect"),
      autoEngineerBtn: $("#autoEngineerBtn"), modeHint: $("#modeHint"), autoReferenceTitle: $("#autoReferenceTitle"),
      autoReferenceMeta: $("#autoReferenceMeta"), selectSceneBtn: $("#selectSceneBtn"), sceneName: $("#sceneName"),
      sceneRegion: $("#sceneRegion"), sceneFilename: $("#sceneFilename"), sceneReasons: $("#sceneReasons"),
      sceneConfidence: $("#sceneConfidence"), sceneImage: $("#sceneImage"), sceneFallback: $("#sceneFallback"),
      attachChip: $("#attachChip"), attachFile: $("#attachFile"), downloadSceneBtn: $("#downloadSceneBtn"),
      confBadge: $("#confBadge"), strictLine: $("#strictLine"), validationStatus: $("#validationStatus"),
      validationSummary: $("#validationSummary"), conflictsList: $("#conflictsList"), autoFixBtn: $("#autoFixBtn"),
      finalPrompt: $("#finalPrompt"), promptWordCount: $("#promptWordCount"), promptSummary: $("#promptSummary"),
      copyBtn: $("#copyBtn"), downloadBtn: $("#downloadBtn"), validateBtn: $("#validateBtn"), rebuildBtn: $("#rebuildBtn"),
      sceneDialog: $("#sceneDialog"), scenePickerGrid: $("#scenePickerGrid"), helpBtn: $("#helpBtn"),
      helpDialog: $("#helpDialog"), themeBtn: $("#themeBtn"), themeIcon: $("#themeIcon"), saveStatus: $("#saveStatus")
    };
  }

  init() {
    this.sanitizeState();
    this.populateQuadControls();
    this.bindEvents();
    this.applyTheme();
    this.onSmartModeChange({ initial: true });
    window.addEventListener("load", () => this.onSmartModeChange({ initial: true }), { once: true });
  }

  sanitizeState() {
    if (!SELECTABLE_POSE_IDS.includes(this.state.poseId)) this.state.poseId = "lying_right_side";
    if (!HAIR_OPTIONS.some((item) => item.id === this.state.hairId)) this.state.hairId = "same";
    if (!QUAD_EXPRESSION_IDS.includes(this.state.expressionId)) this.state.expressionId = "relaxed";
    if (!LIGHTING_OPTIONS.some((item) => item.id === this.state.lightingId)) this.state.lightingId = "lamp_and_phone";
    if (!CLOTHING_OPTIONS.some((item) => item.id === this.state.clothingId)) this.state.clothingId = APP_CONFIG.defaultState.clothingId;
    if (!["9:16", "1:1", "16:9"].includes(this.state.aspect)) this.state.aspect = APP_CONFIG.defaultState.aspect;
    if (!["light", "dark", "system"].includes(this.state.theme)) this.state.theme = "system";
    this.state.mode = QUAD_DEFAULTS.mode;
    if (!this.sceneEngine.getById(this.state.sceneOverrideId)) this.state.sceneOverrideId = null;
  }

  populateClothingSelect() {
    const fragment = document.createDocumentFragment();
    Object.entries(CLOTHING_CATEGORY_LABELS).forEach(([category, label]) => {
      const group = document.createElement("optgroup");
      group.label = label;
      CLOTHING_OPTIONS.filter((item) => item.category === category).forEach((item) => group.appendChild(new Option(item.name_ar, item.id)));
      fragment.appendChild(group);
    });
    this.dom.clothingSelect.replaceChildren(fragment);
    this.dom.clothingSelect.value = this.state.clothingId;
  }

  populateLightingSelect(options = LIGHTING_OPTIONS) {
    const fragment = document.createDocumentFragment();
    Object.entries(LIGHTING_CATEGORY_LABELS).forEach(([category, label]) => {
      const items = options.filter((item) => item.category === category);
      if (!items.length) return;
      const group = document.createElement("optgroup");
      group.label = label;
      items.forEach((item) => group.appendChild(new Option(item.name_ar, item.id, false, item.id === this.state.lightingId)));
      fragment.appendChild(group);
    });
    this.dom.lightingSelect.replaceChildren(fragment);
    this.dom.lightingSelect.value = this.state.lightingId;
  }

  populatePoseSelect(options = [], selectedId = null) {
    const groups = new Map();
    options.forEach((pose) => {
      const label = poseGroupLabel(pose);
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(pose);
    });
    const fragment = document.createDocumentFragment();
    ["🛏️ السرير", "🪑 الجلوس", "🧍 الوقوف"].forEach((label) => {
      const items = groups.get(label) ?? [];
      if (!items.length) return;
      const group = document.createElement("optgroup");
      group.label = label;
      items.forEach((pose) => group.appendChild(new Option(pose.name_ar, pose.id, false, pose.id === selectedId)));
      fragment.appendChild(group);
    });
    this.dom.poseSelect.replaceChildren(fragment);
    if (selectedId) this.dom.poseSelect.value = selectedId;
    this.dom.poseSelect.disabled = options.length === 0;
  }

  populateQuadControls() {
    setOptions(this.dom.hairSelect, HAIR_OPTIONS, this.state.hairId);
    setOptions(this.dom.expressionSelect, EXPRESSIONS.filter((item) => QUAD_EXPRESSION_IDS.includes(item.id)), this.state.expressionId);
    this.populateLightingSelect(LIGHTING_OPTIONS);
    this.populateClothingSelect();
    this.dom.aspectSelect.value = this.state.aspect;
    this.populatePoseSelect(POSES.filter((p) => SELECTABLE_POSE_IDS.includes(p.id)), this.state.poseId);
    if (this.dom.modeHint) this.dom.modeHint.textContent = "5 اختيارات — هندسة فورية v2.0";
  }

  bindEvents() {
    [[this.dom.poseSelect,"poseId"],[this.dom.hairSelect,"hairId"],[this.dom.lightingSelect,"lightingId"],[this.dom.expressionSelect,"expressionId"],[this.dom.clothingSelect,"clothingId"],[this.dom.aspectSelect,"aspect"]]
      .forEach(([element, field]) => element?.addEventListener("change", () => {
        this.state[field] = element.value;
        this.onSmartModeChange();
      }));

    this.bindUpload("imageA");
    this.dom.autoEngineerBtn?.addEventListener("click", () => this.onSmartModeChange());
    this.dom.selectSceneBtn?.addEventListener("click", () => this.openScenePicker());
    this.dom.autoFixBtn?.addEventListener("click", () => this.applyAutoFixes());
    this.dom.copyBtn?.addEventListener("click", () => this.copyPrompt());
    this.dom.downloadBtn?.addEventListener("click", () => downloadText(this.lastPrompt));
    this.dom.validateBtn?.addEventListener("click", () => this.focusValidation());
    this.dom.rebuildBtn?.addEventListener("click", () => this.rebuildPrompt());
    this.dom.helpBtn?.addEventListener("click", () => openDialog(this.dom.helpDialog));
    this.dom.themeBtn?.addEventListener("click", () => this.toggleTheme());

    $$('[data-close-dialog]').forEach((button) => button.addEventListener("click", () => closeDialog($(`#${button.dataset.closeDialog}`))));
    [this.dom.sceneDialog, this.dom.helpDialog].filter(Boolean).forEach((dialog) => dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(dialog); }));
    window.addEventListener("beforeunload", () => this.imageHandler.destroy());
  }

  bindUpload(key) {
    const input = $("#imageAInput"), dropzone = $("#imageADropzone"), remove = $("#imageARemove");
    input?.addEventListener("change", () => this.handleImage(key, input.files?.[0]));
    remove?.addEventListener("click", () => this.removeImage(key));
    ["dragenter","dragover"].forEach((type) => dropzone?.addEventListener(type, (event) => { event.preventDefault(); dropzone.classList.add("is-dragging"); }));
    ["dragleave","drop"].forEach((type) => dropzone?.addEventListener(type, (event) => { event.preventDefault(); dropzone.classList.remove("is-dragging"); }));
    dropzone?.addEventListener("drop", (event) => this.handleImage(key, event.dataTransfer?.files?.[0]));
  }

  handleImage(key, file) {
    const validation = this.imageHandler.validate(file);
    if (!validation.valid) return showToast(validation.error, "error", 3600);
    this.state.uploads[key] = this.imageHandler.createPreview(key, file);
    this.renderUpload(key);
    this.onSmartModeChange();
    showToast("تمت إضافة صورة الهوية");
  }

  removeImage(key) {
    this.imageHandler.revoke(key);
    this.state.uploads[key] = null;
    const input = $("#imageAInput"); if (input) input.value = "";
    this.renderUpload(key);
    this.onSmartModeChange();
  }

  renderUpload(key) {
    const value = this.state.uploads[key], preview = $("#imageAPreview"), remove = $("#imageARemove"), meta = $("#imageAMeta"), card = $('[data-upload="imageA"]');
    card?.classList.toggle("has-image", Boolean(value));
    if (remove) remove.hidden = !value;
    if (preview) {
      preview.hidden = !value;
      if (value) preview.src = value.url; else preview.removeAttribute("src");
    }
    if (meta) meta.textContent = value ? `${value.name} • ${formatBytes(value.size)}` : "";
  }

  engineerState() {
    const pose = this.poseEngine.getById(this.state.poseId);
    this.engineering = this.autoEngineeringEngine.engineer({
      pose,
      lightingId: this.state.lightingId,
      sceneOverrideId: this.state.sceneOverrideId,
      requireSelectedScene: false
    });
    if (!this.engineering) return;
    ["bodyDirection","cameraAngle","cameraDistance","cameraType","lensType","roomMode","selectedSceneId","lightingId"].forEach((field) => {
      if (this.engineering[field] != null) this.state[field] = this.engineering[field];
    });
    this.state.mode = "smart";
  }

  buildConfig() {
    return {
      ...this.state,
      pose: this.poseEngine.getById(this.state.poseId),
      scene: this.sceneEngine.getById(this.state.selectedSceneId),
      camera: this.cameraEngine.getCamera(this.state.cameraType),
      lens: this.cameraEngine.getLens(this.state.lensType),
      expression: EXPRESSIONS.find((item) => item.id === this.state.expressionId) ?? EXPRESSIONS[0],
      hair: HAIR_OPTIONS.find((item) => item.id === this.state.hairId) ?? HAIR_OPTIONS[0],
      clothing: CLOTHING_OPTIONS.find((item) => item.id === this.state.clothingId) ?? CLOTHING_OPTIONS[0],
      lighting: this.lightingEngine.getById(this.state.lightingId),
      autoEngineering: this.engineering
    };
  }

  onSmartModeChange({ initial = false } = {}) {
    this.updateAll({ initial });
  }

  applyFixesToState(fixes = []) {
    fixes.forEach((fix) => { this.state[fix.field] = fix.value; if (fix.secondary) this.state[fix.secondary.field] = fix.secondary.value; });
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

    this.lastValidation = validation;
    this.lastPrompt = this.promptEngine.generateV2(config);
    this.populatePoseSelect(POSES.filter((p) => SELECTABLE_POSE_IDS.includes(p.id)), this.state.poseId);
    this.populateLightingSelect(LIGHTING_OPTIONS);
    this.renderAutoReference();
    this.renderScene();
    this.renderAttachChip(config.scene);
    this.renderConfidence(this.engineering);

    renderValidation({ statusElement:this.dom.validationStatus, summaryElement:this.dom.validationSummary, listElement:this.dom.conflictsList, autoFixButton:this.dom.autoFixBtn, result:validation });
    renderPrompt({ promptElement:this.dom.finalPrompt, countElement:this.dom.promptWordCount, prompt:this.lastPrompt });
    renderPromptSummary(this.dom.promptSummary, config);

    this.dom.copyBtn.disabled = !validation.valid;
    this.dom.downloadBtn.disabled = !validation.valid;
    this.dom.copyBtn.title = validation.valid ? "نسخ الأمر النهائي" : "أصلح التعارضات أولًا";
    this.storage.save(this.state);
    if (!initial) this.flashSaved();
  }

  renderAutoReference() {
    const scene = this.engineering?.scene;
    if (!scene) {
      this.dom.autoReferenceTitle.textContent = "لا يوجد مرجع صالح";
      this.dom.autoReferenceMeta.textContent = this.engineering?.strictNoMatchMessage ?? "غيّر الوضعية أو الإضاءة.";
      return;
    }
    this.dom.autoReferenceTitle.textContent = `المرجع الهندسي: ${scene.name_ar}`;
    this.dom.autoReferenceMeta.textContent = `${scene.image_filename} • هندسة تلقائية v2.0`;
  }

  renderScene() {
    const e = this.engineering, scene = e?.scene, reasons = document.createDocumentFragment();
    if (!scene) {
      this.dom.sceneName.textContent = "لا يوجد مرجع يجتاز المرشح";
      this.dom.sceneRegion.textContent = "STRICT FILTER";
      this.dom.sceneFilename.textContent = "—";
      this.dom.sceneConfidence.textContent = "ثقة منخفضة";
      this.setSceneImage("assets/scene-placeholder.svg", true);
      return;
    }
    this.dom.sceneName.textContent = scene.name_ar;
    this.dom.sceneRegion.textContent = scene.region.replaceAll("_", " ").toUpperCase();
    this.dom.sceneFilename.textContent = scene.image_filename;
    this.dom.sceneConfidence.textContent = e.confidence;
    [e.sceneReason, e.gateSummary, ...(e.sceneSelectionReasons ?? []), e.orientation].filter(Boolean).forEach((text) => {
      const li = document.createElement("li"); li.textContent = text; reasons.append(li);
    });
    this.dom.sceneReasons.replaceChildren(reasons);
    this.setSceneImage(scene.image_url, false);
  }

  renderAttachChip(scene) {
    if (!this.dom.attachChip || !this.dom.attachFile || !this.dom.downloadSceneBtn) return;
    if (!scene?.image_url) {
      this.dom.attachChip.classList.add("hidden");
      return;
    }
    this.dom.attachChip.classList.remove("hidden");
    this.dom.attachFile.textContent = scene.image_url;
    this.dom.downloadSceneBtn.onclick = () => {
      const a = document.createElement("a");
      a.href = scene.image_url;
      a.download = scene.image_url.split("/").pop();
      a.click();
    };
  }

  renderConfidence(r) {
    if (!this.dom.confBadge || !this.dom.strictLine) return;
    const confidence = r?.confidence ?? "ثقة منخفضة";
    const cls = confidence.includes("عالية") || confidence.includes("دقة عالية") ? "green" : confidence.includes("متوسطة") ? "yellow" : "red";
    this.dom.confBadge.className = `badge ${cls}`;
    this.dom.confBadge.textContent = confidence;
    this.dom.strictLine.textContent = `مرشح صارم: اجتاز ${r?.gatePassedCount ?? 0} من ${r?.gateTotalCount ?? SCENES.length} مرجعًا`;
  }

  setSceneImage(source, knownFallback = false) {
    const image = this.dom.sceneImage, fallback = this.dom.sceneFallback;
    fallback.hidden = !knownFallback;
    image.onerror = null;
    if (!knownFallback) image.onerror = () => { image.src = "assets/scene-placeholder.svg"; fallback.hidden = false; };
    image.src = source;
  }

  openScenePicker() {
    const poseLabels = Object.fromEntries(POSES.map((pose) => [pose.id, pose.name_ar]));
    renderScenePicker({
      container:this.dom.scenePickerGrid,
      scenes:SCENES,
      selectedSceneId:this.state.sceneOverrideId,
      poseLabels,
      onSelect:(sceneId) => { this.state.sceneOverrideId = sceneId; closeDialog(this.dom.sceneDialog); this.onSmartModeChange(); }
    });
    openDialog(this.dom.sceneDialog);
  }

  applyAutoFixes() {
    if (!this.lastValidation?.autoFixes.length) return;
    this.applyFixesToState(this.lastValidation.autoFixes);
    this.onSmartModeChange();
    showToast("تم إصلاح التعارضات القابلة للإصلاح");
  }

  async copyPrompt() {
    try { await copyText(this.lastPrompt); showToast("تم نسخ الأمر كاملًا"); }
    catch { showToast("تعذر النسخ تلقائيًا؛ حدّد النص وانسخه يدويًا.", "error"); this.dom.finalPrompt.focus(); }
  }

  focusValidation() {
    $(".validation-panel")?.scrollIntoView({ behavior:"smooth", block:"center" });
    showToast(this.lastValidation.valid ? "الفحص مكتمل: لا توجد تعارضات مانعة" : "راجع التعارضات الحمراء", this.lastValidation.valid ? "success" : "error");
  }

  rebuildPrompt() {
    this.onSmartModeChange();
    showToast("أُعيد بناء الأمر وفق هندسة v2.0");
  }

  toggleTheme() {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const currentDark = this.state.theme === "dark" || (this.state.theme === "system" && systemDark);
    this.state.theme = currentDark ? "light" : "dark";
    this.applyTheme(); this.storage.save(this.state);
  }

  applyTheme() {
    document.documentElement.dataset.theme = this.state.theme;
    const isDark = this.state.theme === "dark" || (this.state.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    this.dom.themeIcon.textContent = isDark ? "☀" : "☾";
    this.dom.themeBtn.title = isDark ? "استخدام المظهر الفاتح" : "استخدام المظهر الداكن";
  }

  flashSaved() {
    if (!this.dom.saveStatus) return;
    this.dom.saveStatus.classList.add("is-saving");
    this.dom.saveStatus.lastChild.textContent = " جارٍ الحفظ";
    window.setTimeout(() => { this.dom.saveStatus.classList.remove("is-saving"); this.dom.saveStatus.lastChild.textContent = " محفوظ محليًا"; }, 420);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  try { const app = new App(); app.init(); }
  catch (error) { console.error("AI Selfie Prompt Studio failed to initialize", error); showToast("تعذر تشغيل الاستوديو. حدّث الصفحة وحاول مرة ثانية.", "error", 6000); }
});
