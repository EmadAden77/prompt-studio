const VERSION = "v1.35";
const PATCH = Symbol.for("promptStudio.carModeSeparationRuntime.installed");
const STORAGE = Object.freeze({
  mode:"prompt-studio:car-mode:v2",
  interiorPose:"prompt-studio:car-interior-pose:v1",
  exteriorPose:"prompt-studio:car-exterior-pose:v1"
});

function safeGet(key) {
  try { return localStorage.getItem(key) || ""; } catch { return ""; }
}

function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

function labelOf(card) {
  return card?.querySelector("strong")?.textContent?.trim() || "";
}

function updateVersionLabels() {
  document.querySelectorAll(".car-version").forEach((node) => { node.textContent = VERSION; });
  const brand = document.querySelector(".brand small");
  if (brand) brand.textContent = `Car Templates ${VERSION}`;
  const eyebrow = document.querySelector(".intro .eyebrow");
  if (eyebrow) eyebrow.textContent = `CAR SELFIE ENGINE · ${VERSION}`;
  document.title = `قوالب السيارة ${VERSION} — AI Selfie Prompt Studio`;
}

function decorateSections() {
  const interiorPanel = document.querySelector("#templatesTitle")?.closest(".panel");
  if (interiorPanel) {
    interiorPanel.id = "interiorPosePanel";
    interiorPanel.dataset.poseMode = "interior";
    const title = interiorPanel.querySelector("#templatesTitle");
    if (title) title.textContent = "وضعيات داخل السيارة";
    const badge = interiorPanel.querySelector(".context-badge");
    if (badge) badge.textContent = "🚗 وضعيات المقصورة فقط";
  }

  const exteriorPanel = document.querySelector(".car-exterior-controls");
  if (exteriorPanel) {
    exteriorPanel.id = "exteriorPosePanel";
    exteriorPanel.dataset.poseMode = "exterior";
    const title = exteriorPanel.querySelector("h2");
    if (title) title.textContent = "وضعيات خارج السيارة";
    const badge = exteriorPanel.querySelector(".context-badge");
    if (badge) badge.textContent = "🅿️ وضعيات بجانب السيارة فقط";
  }

  const placePanel = document.querySelector("#carPlaceTemplates");
  if (placePanel) {
    const interiorGroup = placePanel.querySelector("[data-place-group='interior']");
    const exteriorGroup = placePanel.querySelector("[data-place-group='exterior']");
    if (interiorGroup && !interiorGroup.querySelector(".car-mode-section-title")) {
      interiorGroup.insertAdjacentHTML("afterbegin", `<div class="car-mode-section-title">🚗 قوالب أماكن داخل السيارة</div>`);
    }
    if (exteriorGroup && !exteriorGroup.querySelector(".car-mode-section-title")) {
      exteriorGroup.insertAdjacentHTML("afterbegin", `<div class="car-mode-section-title">🅿️ قوالب أماكن خارج السيارة</div>`);
    }
  }
}

function rememberCurrentPose(mode) {
  if (mode === "exterior") {
    const card = document.querySelector(".car-exterior-card.is-active");
    const label = labelOf(card);
    if (label) safeSet(STORAGE.exteriorPose, label);
    return;
  }
  const card = document.querySelector(".car-pose-card.is-active");
  const label = labelOf(card);
  if (label) safeSet(STORAGE.interiorPose, label);
}

function restorePose(mode) {
  const exterior = mode === "exterior";
  const key = exterior ? STORAGE.exteriorPose : STORAGE.interiorPose;
  const wanted = safeGet(key);
  if (!wanted) return;
  const selector = exterior ? ".car-exterior-card" : ".car-pose-card";
  const card = [...document.querySelectorAll(selector)].find((node) => labelOf(node) === wanted && !node.hidden);
  if (card && !card.classList.contains("is-active")) card.click();
}

function enforceVisualSeparation(mode) {
  const exterior = mode === "exterior";
  const interiorPanel = document.querySelector("#interiorPosePanel");
  const categoryShell = document.querySelector(".car-category-shell");
  const exteriorPanel = document.querySelector("#exteriorPosePanel") || document.querySelector(".car-exterior-controls");

  if (interiorPanel) interiorPanel.hidden = exterior;
  if (categoryShell) categoryShell.hidden = exterior;
  if (exteriorPanel) exteriorPanel.hidden = !exterior;

  document.body.dataset.poseCollection = exterior ? "exterior-only" : "interior-only";
  document.documentElement.dataset.poseCollection = document.body.dataset.poseCollection;

  const placePanel = document.querySelector("#carPlaceTemplates");
  if (placePanel) {
    const interiorGroup = placePanel.querySelector("[data-place-group='interior']");
    const exteriorGroup = placePanel.querySelector("[data-place-group='exterior']");
    if (interiorGroup) interiorGroup.hidden = exterior;
    if (exteriorGroup) exteriorGroup.hidden = !exterior;
  }
}

function applyMode(mode, { restore = true } = {}) {
  if (mode !== "interior" && mode !== "exterior") return;
  decorateSections();
  enforceVisualSeparation(mode);
  safeSet(STORAGE.mode, mode);
  updateVersionLabels();
  if (restore) queueMicrotask(() => restorePose(mode));
}

function install() {
  if (document.documentElement[PATCH]) return;
  document.documentElement[PATCH] = true;

  const style = document.createElement("style");
  style.textContent = `.car-mode-section-title{font-weight:800;margin:2px 0 10px;padding:8px 10px;border-radius:10px;background:rgba(127,127,127,.08)}body[data-pose-collection="interior-only"] #exteriorPosePanel{display:none!important}body[data-pose-collection="exterior-only"] #interiorPosePanel,body[data-pose-collection="exterior-only"] .car-category-shell{display:none!important}`;
  document.head.append(style);

  const ready = () => {
    decorateSections();
    const current = document.body.dataset.carMode || safeGet(STORAGE.mode) || "interior";
    applyMode(current, { restore:true });
  };

  document.addEventListener("click", (event) => {
    const interiorCard = event.target.closest(".car-pose-card");
    if (interiorCard) safeSet(STORAGE.interiorPose, labelOf(interiorCard));

    const exteriorCard = event.target.closest(".car-exterior-card");
    if (exteriorCard) safeSet(STORAGE.exteriorPose, labelOf(exteriorCard));

    const modeButton = event.target.closest(".car-mode-btn");
    if (modeButton?.dataset.mode) {
      const leaving = document.body.dataset.carMode || "interior";
      rememberCurrentPose(leaving);
      setTimeout(() => applyMode(modeButton.dataset.mode, { restore:true }), 0);
    }
  });

  const observer = new MutationObserver(() => queueMicrotask(() => {
    decorateSections();
    applyMode(document.body.dataset.carMode || "interior", { restore:false });
  }));
  observer.observe(document.body, { childList:true, subtree:true });

  ready();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once:true });
else install();
