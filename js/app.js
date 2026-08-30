import { APP_CONFIG } from "./config/appConfig.js";
import { FIXED_DATA, IMAGE_A_AUTHORITY, IMAGE_B_AUTHORITY } from "./data/fixedData.js";
import { POSES, SELECTABLE_POSE_IDS } from "./data/posesData.js";
import { SCENES } from "./data/scenesData.js";
import { CAMERA_SPECS, LENSES, SELFIE_ARM_STRATEGIES } from "./data/cameraData.js";
import { LIGHTING_OPTIONS } from "./data/lightingData.js";
import { CLOTHING_OPTIONS } from "./data/clothingData.js";
import { EXPRESSIONS } from "./data/expressionsData.js";
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
import { AutoEngineeringEngine } from "./engines/autoEngineeringEngine.js";
import { QUICK_FIXES } from "./engines/realismLocks.js";
import { StorageManager } from "./utils/storage.js";
import { ImageHandler } from "./utils/imageHandler.js";
import { copyText } from "./utils/clipboard.js";
import { downloadText } from "./utils/download.js";
import { closeDialog, openDialog, setOptions } from "./ui/dom.js";
import { renderScenePicker } from "./ui/scenePicker.js";

const HISTORY_KEY = "prompt_history";
const FAVORITES_KEY = "prompt_favorites";
const LAST5_KEY = "prompt_last5";
const FLOW_KEY = "prompt_personal_flow";

const CLOTHING_CATEGORY_LABELS = Object.freeze({ sleepwear:"ملابس نوم", casual:"كاجوال", sport:"رياضي", winter:"شتوي", traditional:"تقليدي" });
const LIGHTING_CATEGORY_LABELS = Object.freeze({ screen:"شاشة الهاتف", ceiling:"السقف", lamp:"الأباجورة", daylight:"النهار", mixed:"مختلطة", night:"ليلية" });

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

function poseGroupLabel(pose) {
  if (pose?.id?.startsWith("standing")) return "🧍 الوقوف";
  if (pose?.id?.startsWith("sitting")) return "🪑 الجلوس";
  return "🛏️ السرير";
}

class App {
  constructor() {
    this.storage = new StorageManager(APP_CONFIG.storageKey);
    this.state = this.storage.load(APP_CONFIG.defaultState);
    this.state.uploads = { imageA: null };
    this.state.flow = localStorage.getItem(FLOW_KEY) || "poseFirst";
    this.history = readJSON(HISTORY_KEY, []);
    this.favorites = readJSON(FAVORITES_KEY, []);
    this.last5 = readJSON(LAST5_KEY, []);

    this.poseEngine = new PoseEngine(POSES);
    this.sceneEngine = new SceneEngine(SCENES);
    this.cameraEngine = new CameraEngine(CAMERA_SPECS, LENSES, SELFIE_ARM_STRATEGIES);
    this.lightingEngine = new LightingEngine(LIGHTING_OPTIONS);
    this.identityEngine = new IdentityEngine(FIXED_DATA, IMAGE_A_AUTHORITY);
    this.roomLockEngine = new RoomLockEngine(ROOM_LOCK_POLICIES, IMAGE_B_AUTHORITY);
    this.autoEngineeringEngine = new AutoEngineeringEngine({ sceneEngine:this.sceneEngine, lightingEngine:this.lightingEngine });
    this.promptEngine = new PromptEngine({ identityEngine:this.identityEngine, roomLockEngine:this.roomLockEngine, poseEngine:this.poseEngine, cameraEngine:this.cameraEngine, lightingEngine:this.lightingEngine });
    this.validator = new Validator({ lightingEngine:this.lightingEngine });
    this.imageHandler = new ImageHandler({ maxBytes:APP_CONFIG.maxImageBytes, acceptedTypes:APP_CONFIG.acceptedImageTypes });

    this.engineering = null;
    this.currentConfig = null;
    this.currentPrompt = "";
    this.currentValidation = null;
    this.dom = this.cacheDOM();
  }

  cacheDOM() {
    const byId = (id) => document.getElementById(id);
    return {
      poseSelect:byId("poseSelect"), hairSelect:byId("hairSelect"), lightingSelect:byId("lightingSelect"), expressionSelect:byId("expressionSelect"), clothingSelect:byId("clothingSelect"), aspectSelect:byId("aspectSelect"),
      poseFirstBtn:byId("poseFirstBtn"), refFirstBtn:byId("refFirstBtn"), imageAInput:byId("imageAInput"), imageAPreview:byId("imageAPreview"), imageARemove:byId("imageARemove"),
      sceneImage:byId("sceneImage"), sceneName:byId("sceneName"), sceneMeta:byId("sceneMeta"), overrideSceneBtn:byId("overrideSceneBtn"), attachChip:byId("attachChip"), attachFile:byId("attachFile"), downloadSceneBtn:byId("downloadSceneBtn"), confBadge:byId("confBadge"), strictLine:byId("strictLine"),
      conflictsBox:byId("conflictsBox"), finalPrompt:byId("finalPrompt"), wordCount:byId("promptWordCount"), engineerBtn:byId("engineerBtn"), validateBtn:byId("validateBtn"), copyBtn:byId("copyBtn"), resetBtn:byId("resetBtn"), downloadBtn:byId("downloadBtn"),
      sessionBtn:byId("sessionBtn"), favBtn:byId("favBtn"), historyBtn:byId("historyBtn"), statusLine:byId("statusLine"), sceneDialog:byId("sceneDialog"), scenePickerGrid:byId("scenePickerGrid"), historyDialog:byId("historyDialog"), historyList:byId("historyList")
    };
  }

  init() {
    this.sanitizeState();
    this.populateSelects();
    this.bindUI();
    this.bindShortcuts();
    this.renderFlowUI();
    this.renderUpload();
    this.engineer({ persistHistory:false });
    window.addEventListener("load", () => this.engineer({ persistHistory:false }), { once:true });
    window.addEventListener("beforeunload", () => this.imageHandler.destroy());
  }

  sanitizeState() {
    if (!SELECTABLE_POSE_IDS.includes(this.state.poseId)) this.state.poseId = APP_CONFIG.defaultState.poseId;
    if (!HAIR_OPTIONS.some((x) => x.id === this.state.hairId)) this.state.hairId = APP_CONFIG.defaultState.hairId;
    if (!LIGHTING_OPTIONS.some((x) => x.id === this.state.lightingId)) this.state.lightingId = APP_CONFIG.defaultState.lightingId;
    if (!EXPRESSIONS.some((x) => x.id === this.state.expressionId)) this.state.expressionId = APP_CONFIG.defaultState.expressionId;
    if (!CLOTHING_OPTIONS.some((x) => x.id === this.state.clothingId)) this.state.clothingId = APP_CONFIG.defaultState.clothingId;
    if (!["9:16","1:1","16:9"].includes(this.state.aspect)) this.state.aspect = APP_CONFIG.defaultState.aspect;
    if (!["poseFirst","referenceFirst"].includes(this.state.flow)) this.state.flow = "poseFirst";
    if (this.state.sceneOverrideId && !this.sceneEngine.getById(this.state.sceneOverrideId)) this.state.sceneOverrideId = null;
  }

  populateSelects() {
    this.populatePoseSelect();
    setOptions(this.dom.hairSelect, HAIR_OPTIONS, this.state.hairId);
    this.populateLightingSelect();
    setOptions(this.dom.expressionSelect, EXPRESSIONS, this.state.expressionId);
    this.populateClothingSelect();
    if (this.dom.aspectSelect) this.dom.aspectSelect.value = this.state.aspect;
  }

  selectablePoses() {
    const all = POSES.filter((p) => SELECTABLE_POSE_IDS.includes(p.id));
    if (this.state.flow !== "referenceFirst" || !this.state.sceneOverrideId) return all;
    const scene = this.sceneEngine.getById(this.state.sceneOverrideId);
    const ids = new Set(this.sceneEngine.getCompatiblePoseIds(scene, SELECTABLE_POSE_IDS));
    return all.filter((p) => ids.has(p.id));
  }

  populatePoseSelect() {
    const options = this.selectablePoses();
    if (!options.some((p) => p.id === this.state.poseId)) this.state.poseId = options[0]?.id ?? APP_CONFIG.defaultState.poseId;
    const fragment = document.createDocumentFragment();
    ["🛏️ السرير","🪑 الجلوس","🧍 الوقوف"].forEach((label) => {
      const items = options.filter((p) => poseGroupLabel(p) === label);
      if (!items.length) return;
      const group = document.createElement("optgroup");
      group.label = label;
      items.forEach((p) => group.appendChild(new Option(p.name_ar, p.id)));
      fragment.appendChild(group);
    });
    this.dom.poseSelect.replaceChildren(fragment);
    this.dom.poseSelect.value = this.state.poseId;
  }

  populateLightingSelect() {
    const fragment = document.createDocumentFragment();
    Object.entries(LIGHTING_CATEGORY_LABELS).forEach(([category,label]) => {
      const items = LIGHTING_OPTIONS.filter((x) => x.category === category);
      if (!items.length) return;
      const group = document.createElement("optgroup"); group.label = label;
      items.forEach((x) => group.appendChild(new Option(x.name_ar, x.id)));
      fragment.appendChild(group);
    });
    this.dom.lightingSelect.replaceChildren(fragment);
    this.dom.lightingSelect.value = this.state.lightingId;
  }

  populateClothingSelect() {
    const fragment = document.createDocumentFragment();
    Object.entries(CLOTHING_CATEGORY_LABELS).forEach(([category,label]) => {
      const items = CLOTHING_OPTIONS.filter((x) => x.category === category);
      if (!items.length) return;
      const group = document.createElement("optgroup"); group.label = label;
      items.forEach((x) => group.appendChild(new Option(x.name_ar, x.id)));
      fragment.appendChild(group);
    });
    this.dom.clothingSelect.replaceChildren(fragment);
    this.dom.clothingSelect.value = this.state.clothingId;
  }

  bindUI() {
    [[this.dom.poseSelect,"poseId"],[this.dom.hairSelect,"hairId"],[this.dom.lightingSelect,"lightingId"],[this.dom.expressionSelect,"expressionId"],[this.dom.clothingSelect,"clothingId"],[this.dom.aspectSelect,"aspect"]]
      .forEach(([el,key]) => el?.addEventListener("change", () => { this.state[key] = el.value; this.engineer(); }));

    this.dom.poseFirstBtn?.addEventListener("click", () => this.setFlow("poseFirst"));
    this.dom.refFirstBtn?.addEventListener("click", () => this.setFlow("referenceFirst"));
    this.dom.imageAInput?.addEventListener("change", () => this.handleImage(this.dom.imageAInput.files?.[0]));
    this.dom.imageARemove?.addEventListener("click", () => this.removeImage());
    this.dom.overrideSceneBtn?.addEventListener("click", () => this.openScenePicker());
    this.dom.engineerBtn?.addEventListener("click", () => this.engineer());
    this.dom.validateBtn?.addEventListener("click", () => this.renderValidation(true));
    this.dom.copyBtn?.addEventListener("click", () => this.copyPrompt());
    this.dom.resetBtn?.addEventListener("click", () => this.resetToDefaults());
    this.dom.downloadBtn?.addEventListener("click", () => downloadText(this.currentPrompt || ""));
    this.dom.sessionBtn?.addEventListener("click", () => this.buildSession());
    this.dom.favBtn?.addEventListener("click", () => this.toggleFavorite());
    this.dom.historyBtn?.addEventListener("click", () => this.showHistory());

    document.querySelectorAll("[data-fix]").forEach((btn) => btn.addEventListener("click", () => this.quickFix(btn.dataset.fix)));
    document.querySelectorAll("[data-idx]").forEach((btn) => btn.addEventListener("click", () => this.loadFromLast5(Number(btn.dataset.idx))));
    document.querySelectorAll("[data-close-dialog]").forEach((btn) => btn.addEventListener("click", () => closeDialog(document.getElementById(btn.dataset.closeDialog))));
  }

  bindShortcuts() {
    document.addEventListener("keydown", (e) => {
      const tag = e.target?.tagName;
      if (["INPUT","TEXTAREA","SELECT"].includes(tag) || e.target?.isContentEditable || e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === "n") this.resetToDefaults();
      else if (key === "c") this.copyPrompt();
      else if (key === "r") this.engineer();
      else if (key === "f") this.toggleFavorite();
      else if (key === "h") this.showHistory();
      else if (/^[1-5]$/.test(key)) this.loadFromLast5(Number(key) - 1);
    });
  }

  setFlow(flow) {
    this.state.flow = flow;
    if (flow === "poseFirst") this.state.sceneOverrideId = null;
    else if (!this.state.sceneOverrideId && this.state.selectedSceneId) this.state.sceneOverrideId = this.state.selectedSceneId;
    localStorage.setItem(FLOW_KEY, flow);
    this.populatePoseSelect();
    this.renderFlowUI();
    this.engineer({ persistHistory:false });
  }

  renderFlowUI() {
    this.dom.poseFirstBtn?.classList.toggle("active", this.state.flow === "poseFirst");
    this.dom.refFirstBtn?.classList.toggle("active", this.state.flow === "referenceFirst");
    if (this.dom.overrideSceneBtn) this.dom.overrideSceneBtn.textContent = this.state.flow === "referenceFirst" ? "اختيار المرجع" : "استبدال المرجع";
  }

  handleImage(file) {
    const result = this.imageHandler.validate(file);
    if (!result.valid) return this.setStatus(result.error, true);
    this.state.uploads.imageA = this.imageHandler.createPreview("imageA", file);
    this.renderUpload();
    this.engineer({ persistHistory:false });
    this.setStatus("تم تحديث IMAGE A");
  }

  removeImage() {
    this.imageHandler.revoke("imageA");
    this.state.uploads.imageA = null;
    if (this.dom.imageAInput) this.dom.imageAInput.value = "";
    this.renderUpload();
    this.setStatus("تم حذف IMAGE A");
  }

  renderUpload() {
    const value = this.state.uploads.imageA;
    if (this.dom.imageAPreview) {
      this.dom.imageAPreview.hidden = !value;
      if (value) this.dom.imageAPreview.src = value.url; else this.dom.imageAPreview.removeAttribute("src");
    }
    if (this.dom.imageARemove) this.dom.imageARemove.hidden = !value;
  }

  engineerState(pose = this.poseEngine.getById(this.state.poseId), { sceneOverrideId = this.state.sceneOverrideId } = {}) {
    return this.autoEngineeringEngine.engineer({
      pose,
      lightingId:this.state.lightingId,
      sceneOverrideId,
      requireSelectedScene:this.state.flow === "referenceFirst"
    });
  }

  applyEngineering(e) {
    this.engineering = e;
    if (!e) return;
    ["bodyDirection","cameraAngle","cameraDistance","cameraType","lensType","roomMode","selectedSceneId","lightingId"].forEach((key) => {
      if (e[key] != null) this.state[key] = e[key];
    });
  }

  buildConfig(pose = this.poseEngine.getById(this.state.poseId), engineering = this.engineering) {
    return {
      ...this.state,
      pose,
      scene:this.sceneEngine.getById(engineering?.selectedSceneId ?? this.state.selectedSceneId),
      camera:this.cameraEngine.getCamera(engineering?.cameraType ?? this.state.cameraType),
      lens:this.cameraEngine.getLens(engineering?.lensType ?? this.state.lensType),
      expression:EXPRESSIONS.find((x) => x.id === this.state.expressionId) ?? EXPRESSIONS[0],
      hair:HAIR_OPTIONS.find((x) => x.id === this.state.hairId) ?? HAIR_OPTIONS[0],
      clothing:CLOTHING_OPTIONS.find((x) => x.id === this.state.clothingId) ?? CLOTHING_OPTIONS[0],
      lighting:this.lightingEngine.getById(engineering?.lightingId ?? this.state.lightingId),
      autoEngineering:engineering,
      uploads:this.state.uploads
    };
  }

  engineer({ persistHistory = true } = {}) {
    const pose = this.poseEngine.getById(this.state.poseId);
    const engineering = this.engineerState(pose);
    this.applyEngineering(engineering);
    this.currentConfig = this.buildConfig(pose, engineering);
    this.currentValidation = this.validator.validate(this.currentConfig);
    this.currentPrompt = this.promptEngine.generateV2(this.currentConfig);
    this.renderPrompt(this.currentPrompt);
    this.renderScene();
    this.renderValidation(false);
    this.renderFavoriteState();
    this.storage.save(this.state);
    if (persistHistory) {
      this.saveToHistory(this.currentPrompt);
      this.updateLast5();
    }
    return this.currentPrompt;
  }

  renderPrompt(prompt) {
    if (this.dom.finalPrompt) this.dom.finalPrompt.textContent = prompt;
    if (this.dom.wordCount) this.dom.wordCount.textContent = `${prompt.trim().split(/\s+/u).filter(Boolean).length} كلمة`;
  }

  renderScene() {
    const scene = this.currentConfig?.scene;
    const e = this.engineering;
    if (!scene) {
      this.dom.sceneImage?.setAttribute("src", "assets/scene-placeholder.svg");
      if (this.dom.sceneName) this.dom.sceneName.textContent = "لا يوجد مرجع صالح للإعداد الحالي";
      if (this.dom.sceneMeta) this.dom.sceneMeta.textContent = e?.strictNoMatchMessage || "غيّر الوضعية أو اختر مرجعًا آخر.";
      this.dom.attachChip?.classList.add("hidden");
      this.renderConfidence(e);
      return;
    }
    if (this.dom.sceneImage) this.dom.sceneImage.src = scene.text_reference ? "assets/scene-placeholder.svg" : scene.image_url;
    if (this.dom.sceneName) this.dom.sceneName.textContent = scene.name_ar;
    if (this.dom.sceneMeta) {
      this.dom.sceneMeta.textContent = scene.text_reference
        ? "🏠 بدون صورة · مرجع نصي ثابت · لا يلزم IMAGE B"
        : `${scene.image_filename} · ${scene.region.replaceAll("_", " ")}`;
    }
    this.renderAttachChip(scene);
    this.renderConfidence(e);
  }

  renderAttachChip(scene) {
    if (!this.dom.attachChip) return;
    if (scene?.text_reference || !scene?.image_url) {
      this.dom.attachChip.classList.add("hidden");
      return;
    }
    this.dom.attachChip.classList.remove("hidden");
    if (this.dom.attachFile) this.dom.attachFile.textContent = scene.image_url;
    if (this.dom.downloadSceneBtn) this.dom.downloadSceneBtn.onclick = () => {
      const a = document.createElement("a"); a.href = scene.image_url; a.download = scene.image_url.split("/").pop(); a.click();
    };
  }

  renderConfidence(r) {
    if (!this.dom.confBadge || !this.dom.strictLine) return;
    const confidence = r?.confidence || "ثقة منخفضة";
    const cls = confidence.includes("عالية") || confidence.includes("دقة عالية") ? "green" : confidence.includes("متوسطة") ? "yellow" : "red";
    this.dom.confBadge.className = `badge ${cls}`;
    this.dom.confBadge.textContent = confidence;
    this.dom.strictLine.textContent = `مرشح صارم: اجتاز ${r?.gatePassedCount ?? 0} من ${r?.gateTotalCount ?? SCENES.length} مرجعًا`;
  }

  renderValidation(forceOpen = false) {
    if (!this.dom.conflictsBox || !this.currentValidation) return;
    const issues = [...(this.currentValidation.conflicts || []), ...(this.currentValidation.warnings || [])];
    if (!issues.length) {
      this.dom.conflictsBox.textContent = "الفحص: لا توجد تعارضات مانعة.";
      this.dom.conflictsBox.classList.remove("hidden");
    } else {
      this.dom.conflictsBox.innerHTML = issues.map((x) => `<div>${x.message_ar || x.message || x.type}</div>`).join("");
      this.dom.conflictsBox.classList.remove("hidden");
    }
    if (forceOpen) this.dom.conflictsBox.scrollIntoView({ behavior:"smooth", block:"nearest" });
  }

  async copyPrompt(text = this.currentPrompt) {
    if (!text) return;
    try { await copyText(text); this.setStatus("تم النسخ"); }
    catch { this.setStatus("تعذر النسخ التلقائي", true); }
  }

  quickFix(key) {
    const fix = QUICK_FIXES[key];
    if (!fix || !this.currentPrompt) return;
    const patched = `${this.currentPrompt}\n\n[QUICK FIX — APPLIED]\n${fix}`;
    this.currentPrompt = patched;
    this.renderPrompt(patched);
    this.copyPrompt(patched);
  }

  saveToHistory(prompt) {
    if (!prompt || this.history[0]?.prompt === prompt) return;
    const entry = { timestamp:new Date().toISOString(), prompt, summary:this.summarySnapshot() };
    this.history.unshift(entry);
    this.history = this.history.slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
  }

  summarySnapshot() {
    return {
      pose:this.currentConfig?.pose?.name_ar,
      lighting:this.currentConfig?.lighting?.name_ar,
      expression:this.currentConfig?.expression?.name_ar,
      clothing:this.currentConfig?.clothing?.name_ar,
      scene:this.currentConfig?.scene?.name_ar
    };
  }

  showHistory() {
    if (!this.dom.historyList || !this.dom.historyDialog) return;
    if (!this.history.length) this.dom.historyList.innerHTML = `<p class="muted">لا يوجد سجل بعد.</p>`;
    else this.dom.historyList.innerHTML = this.history.map((h,i) => `<button class="history-item" type="button" data-history-idx="${i}"><strong>${h.summary.pose || "—"} · ${h.summary.lighting || "—"}</strong><span>${h.summary.expression || "—"} · ${new Date(h.timestamp).toLocaleString("ar-SA")}</span></button>`).join("");
    this.dom.historyList.querySelectorAll("[data-history-idx]").forEach((btn) => btn.addEventListener("click", () => {
      const item = this.history[Number(btn.dataset.historyIdx)];
      if (!item) return;
      this.currentPrompt = item.prompt;
      this.renderPrompt(item.prompt);
      closeDialog(this.dom.historyDialog);
      this.setStatus("تم تحميل الأمر من السجل");
    }));
    openDialog(this.dom.historyDialog);
  }

  toggleFavorite() {
    if (!this.currentPrompt) return;
    const key = this.currentPrompt.slice(0, 240);
    const idx = this.favorites.findIndex((x) => x.prompt.slice(0,240) === key);
    if (idx >= 0) this.favorites.splice(idx,1);
    else this.favorites.unshift({ prompt:this.currentPrompt, summary:this.summarySnapshot(), timestamp:new Date().toISOString() });
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(this.favorites));
    this.renderFavoriteState();
    this.setStatus(idx >= 0 ? "أزيل من المفضلة" : "أضيف إلى المفضلة");
  }

  renderFavoriteState() {
    if (!this.dom.favBtn) return;
    const key = this.currentPrompt.slice(0,240);
    const active = this.favorites.some((x) => x.prompt.slice(0,240) === key);
    this.dom.favBtn.classList.toggle("active", active);
    this.dom.favBtn.textContent = active ? "★ محفوظ بالمفضلة" : "☆ مفضلة";
  }

  updateLast5() {
    const cfg = { poseId:this.state.poseId, lightingId:this.state.lightingId, expressionId:this.state.expressionId, clothingId:this.state.clothingId, hairId:this.state.hairId, aspect:this.state.aspect, sceneOverrideId:this.state.sceneOverrideId, flow:this.state.flow };
    const sig = JSON.stringify(cfg);
    this.last5 = [cfg, ...this.last5.filter((x) => JSON.stringify(x) !== sig)].slice(0,5);
    localStorage.setItem(LAST5_KEY, JSON.stringify(this.last5));
  }

  loadFromLast5(idx) {
    const cfg = this.last5[idx];
    if (!cfg) return this.setStatus(`لا يوجد إعداد محفوظ في ${idx + 1}`, true);
    Object.assign(this.state, cfg);
    localStorage.setItem(FLOW_KEY, this.state.flow);
    this.populateSelects();
    this.renderFlowUI();
    this.engineer({ persistHistory:false });
    this.setStatus(`تم تحميل الإعداد ${idx + 1}`);
  }

  nextPoseVariant(offset) {
    const current = this.poseEngine.getById(this.state.poseId);
    const family = poseGroupLabel(current);
    const pool = POSES.filter((p) => SELECTABLE_POSE_IDS.includes(p.id) && poseGroupLabel(p) === family);
    const i = Math.max(0, pool.findIndex((p) => p.id === current.id));
    return pool[(i + offset) % pool.length] || current;
  }

  sessionPromptForPose(pose) {
    const sceneOverrideId = this.state.flow === "referenceFirst" ? this.state.sceneOverrideId : null;
    const engineering = this.engineerState(pose, { sceneOverrideId });
    const config = this.buildConfig(pose, engineering);
    return this.promptEngine.generateV2(config);
  }

  buildSession() {
    const session = [this.nextPoseVariant(0), this.nextPoseVariant(1), this.nextPoseVariant(2)].map((pose) => this.sessionPromptForPose(pose));
    const blob = new Blob([session.join("\n\n\n--- SESSION BREAK ---\n\n\n")], { type:"text/plain;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `session_${Date.now()}.txt`; a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    this.setStatus("تم إنشاء جلسة من 3 أوامر");
  }

  openScenePicker() {
    const poseLabels = Object.fromEntries(POSES.map((p) => [p.id,p.name_ar]));
    renderScenePicker({
      container:this.dom.scenePickerGrid,
      scenes:SCENES,
      selectedSceneId:this.state.sceneOverrideId || this.state.selectedSceneId,
      poseLabels,
      onSelect:(sceneId) => {
        this.state.sceneOverrideId = sceneId;
        if (this.state.flow === "referenceFirst") {
          const scene = this.sceneEngine.getById(sceneId);
          const compatible = this.sceneEngine.getCompatiblePoseIds(scene, SELECTABLE_POSE_IDS);
          if (!compatible.includes(this.state.poseId)) this.state.poseId = compatible[0] || this.state.poseId;
          this.populatePoseSelect();
        }
        closeDialog(this.dom.sceneDialog);
        this.engineer();
      }
    });
    openDialog(this.dom.sceneDialog);
  }

  resetToDefaults() {
    const uploads = this.state.uploads;
    this.state = { ...APP_CONFIG.defaultState, uploads, flow:this.state.flow, sceneOverrideId:this.state.flow === "referenceFirst" ? APP_CONFIG.defaultState.selectedSceneId : null };
    this.populateSelects();
    this.renderFlowUI();
    this.engineer({ persistHistory:false });
    this.setStatus("إعداد جديد");
  }

  setStatus(message, isError = false) {
    if (!this.dom.statusLine) return;
    this.dom.statusLine.textContent = message;
    this.dom.statusLine.classList.toggle("is-error", isError);
  }
}

window.App = App;
document.addEventListener("DOMContentLoaded", () => {
  try { new App().init(); }
  catch (error) {
    console.error("prompt-studio personal initialization failed", error);
    const status = document.getElementById("statusLine");
    if (status) { status.textContent = "تعذر تشغيل الأداة"; status.classList.add("is-error"); }
  }
});
