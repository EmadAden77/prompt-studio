import { APP_CONFIG, UI_LABELS } from "./config/appConfig.js";
import { FIXED_DATA, IMAGE_A_AUTHORITY, IMAGE_B_AUTHORITY } from "./data/fixedData.js";
import { POSES } from "./data/posesData.js";
import { SCENES } from "./data/scenesData.js";
import { CAMERA_SPECS, LENSES, SELFIE_ARM_STRATEGIES } from "./data/cameraData.js";
import { LIGHTING_OPTIONS } from "./data/lightingData.js";
import { CLOTHING_OPTIONS } from "./data/clothingData.js";
import { EXPRESSION_OPTIONS } from "./data/expressionsData.js";
import { HAIR_OPTIONS } from "./data/hairData.js";
import { ROOM_LOCK_POLICIES } from "./policies/roomLockPolicy.js";
import { SceneEngine } from "./engines/sceneEngine.js";
import { PoseEngine } from "./engines/poseEngine.js";
import { CameraEngine } from "./engines/cameraEngine.js";
import { LightingEngine } from "./engines/lightingEngine.js";
import { IdentityEngine } from "./engines/identityEngine.js";
import { RoomLockEngine } from "./engines/roomLockEngine.js";
import { PromptEngine } from "./engines/promptEngine.js";
import { Validator } from "./engines/validator.js";
import { StorageManager } from "./utils/storage.js";
import { ImageHandler, formatBytes } from "./utils/imageHandler.js";
import { copyText } from "./utils/clipboard.js";
import { downloadText } from "./utils/download.js";
import { $, $$, closeDialog, openDialog, setOptions, showToast } from "./ui/dom.js";
import { renderPrompt, renderPromptSummary } from "./ui/promptDisplay.js";
import { renderValidation } from "./ui/conflictModal.js";
import { renderScenePicker } from "./ui/scenePicker.js";
import { activateSmartMode } from "./ui/smartMode.js";
import { activateManualMode } from "./ui/manualMode.js";

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

    this.lastPrompt = "";
    this.lastValidation = null;
    this.sceneResult = null;
    this.lastChangedField = null;
    this.dom = this.cacheDOM();
  }

  cacheDOM() {
    return {
      smartModeBtn: $("#smartModeBtn"),
      manualModeBtn: $("#manualModeBtn"),
      modeHint: $("#modeHint"),
      poseSelect: $("#poseSelect"),
      directionSelect: $("#directionSelect"),
      roomModeSelect: $("#roomModeSelect"),
      angleSelect: $("#angleSelect"),
      distanceSelect: $("#distanceSelect"),
      cameraSelect: $("#cameraSelect"),
      lensSelect: $("#lensSelect"),
      expressionSelect: $("#expressionSelect"),
      hairSelect: $("#hairSelect"),
      clothingSelect: $("#clothingSelect"),
      lightingSelect: $("#lightingSelect"),
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
    this.populateStaticControls();
    this.bindEvents();
    this.applyTheme();
    this.updateAll({ initial: true });
  }

  sanitizeState() {
    const defaults = APP_CONFIG.defaultState;
    if (!POSES.some((item) => item.id === this.state.poseId)) this.state.poseId = defaults.poseId;
    if (!CAMERA_SPECS[this.state.cameraType]) this.state.cameraType = defaults.cameraType;
    if (!EXPRESSION_OPTIONS.some((item) => item.id === this.state.expressionId)) this.state.expressionId = defaults.expressionId;
    if (!HAIR_OPTIONS.some((item) => item.id === this.state.hairId)) this.state.hairId = defaults.hairId;
    if (!CLOTHING_OPTIONS.some((item) => item.id === this.state.clothingId)) this.state.clothingId = defaults.clothingId;
    if (!LIGHTING_OPTIONS.some((item) => item.id === this.state.lightingId)) this.state.lightingId = defaults.lightingId;
    if (!["smart", "manual"].includes(this.state.mode)) this.state.mode = defaults.mode;
    if (!["EDIT", "GENERATE"].includes(this.state.roomMode)) this.state.roomMode = defaults.roomMode;
    if (!["light", "dark", "system"].includes(this.state.theme)) this.state.theme = defaults.theme;
    const directions = new Set(POSES.flatMap((item) => item.valid_directions));
    if (!directions.has(this.state.bodyDirection)) this.state.bodyDirection = defaults.bodyDirection;
    if (!Object.hasOwn(UI_LABELS.cameraAngles, this.state.cameraAngle)) this.state.cameraAngle = defaults.cameraAngle;
    if (!Object.hasOwn(UI_LABELS.cameraDistances, this.state.cameraDistance)) this.state.cameraDistance = defaults.cameraDistance;
    this.state.lensType = this.cameraEngine.normalizeLens(this.state.cameraType, this.state.lensType);
  }

  populateStaticControls() {
    setOptions(this.dom.poseSelect, POSES, this.state.poseId);
    setOptions(this.dom.cameraSelect, Object.values(CAMERA_SPECS), this.state.cameraType);
    setOptions(this.dom.expressionSelect, EXPRESSION_OPTIONS, this.state.expressionId);
    setOptions(this.dom.hairSelect, HAIR_OPTIONS, this.state.hairId);
    setOptions(this.dom.clothingSelect, CLOTHING_OPTIONS, this.state.clothingId);
    setOptions(this.dom.lightingSelect, LIGHTING_OPTIONS, this.state.lightingId);
    this.dom.roomModeSelect.value = this.state.roomMode;
  }

  bindEvents() {
    this.dom.smartModeBtn.addEventListener("click", () => this.setMode("smart"));
    this.dom.manualModeBtn.addEventListener("click", () => this.setMode("manual"));

    const bindings = [
      [this.dom.poseSelect, "poseId"],
      [this.dom.directionSelect, "bodyDirection"],
      [this.dom.roomModeSelect, "roomMode"],
      [this.dom.angleSelect, "cameraAngle"],
      [this.dom.distanceSelect, "cameraDistance"],
      [this.dom.cameraSelect, "cameraType"],
      [this.dom.lensSelect, "lensType"],
      [this.dom.expressionSelect, "expressionId"],
      [this.dom.hairSelect, "hairId"],
      [this.dom.clothingSelect, "clothingId"],
      [this.dom.lightingSelect, "lightingId"]
    ];

    bindings.forEach(([element, field]) => {
      element.addEventListener("change", () => this.changeState(field, element.value));
    });

    this.bindUpload("imageA");
    this.bindUpload("imageB");

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

    const preview = this.imageHandler.createPreview(key, file);
    this.state.uploads[key] = preview;
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

  setMode(mode) {
    if (this.state.mode === mode) return;
    this.state.mode = mode;
    if (mode === "manual" && !this.state.selectedSceneId) {
      this.state.selectedSceneId = SCENES[0].id;
    }
    this.updateAll();
    if (mode === "manual") this.openScenePicker();
  }

  changeState(field, value) {
    this.state[field] = value;
    this.lastChangedField = field;
    if (field === "cameraType") {
      this.state.lensType = this.cameraEngine.normalizeLens(value, this.state.lensType);
    }
    this.updateAll();
  }

  normalizeSmartState() {
    if (this.state.mode !== "smart") return;
    this.state = { ...this.state, ...this.poseEngine.normalizeSelection(this.state) };
    this.state.uploads ??= { imageA: null, imageB: null };

    const pose = this.poseEngine.getById(this.state.poseId);
    const smartCameraType = pose?.arm_strategy === "mirror" ? "rear" : "front";
    this.state.cameraType = smartCameraType;
    this.state.lensType = smartCameraType === "rear" ? "rear_standard" : "front_wide";
  }

  getCompatibleLightingOptions(scene) {
    if (!scene) return LIGHTING_OPTIONS;
    return LIGHTING_OPTIONS.filter((option) => {
      if (this.lightingEngine.getMissingFeatures(option, scene).length) return false;
      if (this.state.cameraType === "rear" && option.id === "phone_screen_only") return false;
      return true;
    });
  }

  chooseCompatibleLighting(scene) {
    const compatible = this.getCompatibleLightingOptions(scene);
    const preferredIds = ["lamp_only", "lamp_and_phone", "single_ceiling", "all_ceiling_spots", "daylight_semidark", "phone_screen_only"];
    return preferredIds.find((id) => compatible.some((option) => option.id === id)) ?? compatible[0]?.id ?? "phone_screen_only";
  }

  resolveScene() {
    const pose = this.poseEngine.getById(this.state.poseId);
    if (this.state.mode === "smart") {
      let result = this.sceneEngine.autoSelect({
        poseId: pose.id,
        bodyDirection: this.state.bodyDirection,
        cameraAngle: this.state.cameraAngle,
        cameraDistance: this.state.cameraDistance,
        requiredFeatures: pose.requires ?? []
      });

      if (result.scene && this.state.roomMode === "EDIT") {
        for (let attempt = 0; attempt < 2 && result.scene; attempt += 1) {
          const targetAngle = result.scene.base_camera_angle;
          const targetDistance = result.scene.base_camera_distance;
          const canUseAngle = pose.valid_angles.includes(targetAngle) && result.scene.camera_angles.includes(targetAngle);
          const canUseDistance = pose.valid_distances.includes(targetDistance) && result.scene.camera_distances.includes(targetDistance);
          const angleChanged = canUseAngle && this.state.cameraAngle !== targetAngle;
          const distanceChanged = canUseDistance && this.state.cameraDistance !== targetDistance;
          if (!angleChanged && !distanceChanged) break;

          if (angleChanged) this.state.cameraAngle = targetAngle;
          if (distanceChanged) this.state.cameraDistance = targetDistance;
          result = this.sceneEngine.autoSelect({
            poseId: pose.id,
            bodyDirection: this.state.bodyDirection,
            cameraAngle: this.state.cameraAngle,
            cameraDistance: this.state.cameraDistance,
            requiredFeatures: pose.requires ?? []
          });
        }
      }

      this.state.selectedSceneId = result.scene?.id ?? null;
      return result;
    }

    const scene = this.sceneEngine.getById(this.state.selectedSceneId);
    const evaluation = this.sceneEngine.evaluateManualSelection(scene, {
      poseId: pose.id,
      bodyDirection: this.state.bodyDirection,
      cameraAngle: this.state.cameraAngle,
      cameraDistance: this.state.cameraDistance,
      requiredFeatures: pose.requires ?? []
    });
    return {
      scene,
      confidence: evaluation.compatible ? "اختيار يدوي متوافق" : "اختيار يدوي يحتاج مراجعة",
      score: evaluation.score,
      reasons: evaluation.reasons,
      mode: "يدوي"
    };
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
      lighting: this.lightingEngine.getById(this.state.lightingId)
    };
  }

  syncControls() {
    const pose = this.poseEngine.getById(this.state.poseId);
    const allDirections = [...new Set(POSES.flatMap((item) => item.valid_directions))];
    const allAngles = Object.keys(UI_LABELS.cameraAngles);
    const allDistances = Object.keys(UI_LABELS.cameraDistances);

    let directions = allDirections;
    let angles = allAngles;
    let distances = allDistances;
    let cameras = Object.values(CAMERA_SPECS);
    let lenses = this.cameraEngine.getLensesForCamera(this.state.cameraType);
    let lightingOptions = LIGHTING_OPTIONS;

    if (this.state.mode === "smart") {
      directions = pose.valid_directions;
      const compatibleScenes = this.sceneEngine.getCompatibleScenes(
        pose.id,
        this.state.bodyDirection,
        pose.requires ?? []
      );

      if (this.state.roomMode === "EDIT" && this.sceneResult?.scene) {
        const scene = this.sceneResult.scene;
        angles = [scene.base_camera_angle].filter((angle) => pose.valid_angles.includes(angle));
        distances = [scene.base_camera_distance].filter((distance) => pose.valid_distances.includes(distance));
      } else {
        angles = pose.valid_angles.filter((angle) => compatibleScenes.some((scene) => scene.camera_angles.includes(angle)));
        distances = pose.valid_distances.filter((distance) => compatibleScenes.some((scene) => scene.camera_distances.includes(distance)));
      }

      if (!angles.length) angles = pose.valid_angles;
      if (!distances.length) distances = pose.valid_distances;

      cameras = [CAMERA_SPECS[this.state.cameraType]];
      lenses = [this.cameraEngine.getLens(this.state.lensType)].filter(Boolean);
      lightingOptions = this.getCompatibleLightingOptions(this.sceneResult?.scene);
      if (!lightingOptions.length) lightingOptions = [this.lightingEngine.getById(this.state.lightingId)].filter(Boolean);
    }

    setOptions(this.dom.directionSelect, directions, this.state.bodyDirection, (value) => ({
      value,
      label: UI_LABELS.bodyDirections[value] ?? value
    }));
    setOptions(this.dom.angleSelect, angles, this.state.cameraAngle, (value) => ({
      value,
      label: UI_LABELS.cameraAngles[value] ?? value
    }));
    setOptions(this.dom.distanceSelect, distances, this.state.cameraDistance, (value) => ({
      value,
      label: UI_LABELS.cameraDistances[value] ?? value
    }));
    setOptions(this.dom.cameraSelect, cameras, this.state.cameraType);
    setOptions(this.dom.lensSelect, lenses, this.state.lensType);
    setOptions(this.dom.lightingSelect, lightingOptions, this.state.lightingId);

    this.dom.poseSelect.value = this.state.poseId;
    this.dom.roomModeSelect.value = this.state.roomMode;
    this.dom.expressionSelect.value = this.state.expressionId;
    this.dom.hairSelect.value = this.state.hairId;
    this.dom.clothingSelect.value = this.state.clothingId;

    const smartMode = this.state.mode === "smart";
    this.dom.cameraSelect.disabled = smartMode;
    this.dom.lensSelect.disabled = smartMode;
    this.dom.angleSelect.disabled = smartMode && this.state.roomMode === "EDIT";
    this.dom.distanceSelect.disabled = smartMode && this.state.roomMode === "EDIT";

    const modeElements = {
      smartButton: this.dom.smartModeBtn,
      manualButton: this.dom.manualModeBtn,
      modeHint: this.dom.modeHint
    };
    if (smartMode) activateSmartMode(modeElements);
    else activateManualMode(modeElements);
  }

  renderScene() {
    const scene = this.sceneResult?.scene;
    if (!scene) {
      this.dom.sceneName.textContent = "ما لقينا مرجعًا مطابقًا";
      this.dom.sceneRegion.textContent = "NO MATCH";
      this.dom.sceneFilename.textContent = "غيّر الوضعية أو الاتجاه";
      this.dom.sceneConfidence.textContent = "غير متاح";
      this.dom.sceneReasons.replaceChildren();
      this.setSceneImage("assets/scene-placeholder.svg", true);
      return;
    }

    this.dom.sceneName.textContent = scene.name_ar;
    this.dom.sceneRegion.textContent = scene.region.replaceAll("_", " ").toUpperCase();
    this.dom.sceneFilename.textContent = scene.image_filename;
    this.dom.sceneConfidence.textContent = `${this.sceneResult.confidence} • ${this.sceneResult.score}`;
    this.dom.sceneConfidence.className = `confidence-badge${this.sceneResult.confidence.includes("عالية") || this.sceneResult.confidence.includes("متوافق") ? " is-high" : ""}`;

    const reasons = document.createDocumentFragment();
    (this.sceneResult.reasons ?? []).slice(0, 4).forEach((reason) => {
      const item = document.createElement("li");
      item.textContent = reason;
      reasons.append(item);
    });
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
        image.onload = null;
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

  updateAll({ initial = false } = {}) {
    this.normalizeSmartState();
    this.sceneResult = this.resolveScene();

    if (this.state.mode === "smart" && this.sceneResult.scene) {
      const compatibleLighting = this.getCompatibleLightingOptions(this.sceneResult.scene);
      if (!compatibleLighting.some((option) => option.id === this.state.lightingId)) {
        this.state.lightingId = this.chooseCompatibleLighting(this.sceneResult.scene);
      }
    }

    this.syncControls();

    const config = this.buildConfig();
    this.lastValidation = this.validator.validate(config);
    this.lastPrompt = this.promptEngine.generate(config);

    this.renderScene();
    renderValidation({
      statusElement: this.dom.validationStatus,
      summaryElement: this.dom.validationSummary,
      listElement: this.dom.conflictsList,
      autoFixButton: this.dom.autoFixBtn,
      result: this.lastValidation
    });
    renderPrompt({
      promptElement: this.dom.finalPrompt,
      countElement: this.dom.promptWordCount,
      prompt: this.lastPrompt
    });
    renderPromptSummary(this.dom.promptSummary, config);

    this.dom.copyBtn.disabled = !this.lastValidation.valid;
    this.dom.downloadBtn.disabled = !this.lastValidation.valid;
    this.dom.copyBtn.title = this.lastValidation.valid ? "نسخ الأمر النهائي" : "أصلح التعارضات أولًا";

    this.storage.save(this.state);
    this.lastChangedField = null;
    if (!initial) this.flashSaved();
  }

  openScenePicker() {
    renderScenePicker({
      container: this.dom.scenePickerGrid,
      scenes: SCENES,
      selectedSceneId: this.state.selectedSceneId,
      onSelect: (sceneId) => {
        this.state.mode = "manual";
        this.state.selectedSceneId = sceneId;
        closeDialog(this.dom.sceneDialog);
        this.updateAll();
        showToast("تم اعتماد المرجع اليدوي");
      }
    });
    openDialog(this.dom.sceneDialog);
  }

  applyAutoFixes() {
    if (!this.lastValidation?.autoFixes.length) return;
    this.lastValidation.autoFixes.forEach((fix) => {
      this.state[fix.field] = fix.value;
      if (fix.secondary) this.state[fix.secondary.field] = fix.secondary.value;
    });
    this.state.lensType = this.cameraEngine.normalizeLens(this.state.cameraType, this.state.lensType);
    this.updateAll();
    showToast("تم تطبيق الإصلاحات الممكنة");
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
    showToast(this.lastValidation.valid ? "الفحص مكتمل: ما فيه تعارضات مانعة" : "راجع التعارضات الحمراء", this.lastValidation.valid ? "success" : "error");
  }

  rebuildPrompt() {
    this.updateAll();
    this.dom.finalPrompt.closest(".prompt-editor").classList.add("is-refreshed");
    window.setTimeout(() => this.dom.finalPrompt.closest(".prompt-editor").classList.remove("is-refreshed"), 500);
    showToast("أُعيد بناء الأمر من الاختيارات الحالية");
  }

  toggleTheme() {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const currentDark = this.state.theme === "dark" || (this.state.theme === "system" && isDark);
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