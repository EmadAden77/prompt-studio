import "./carTemplateRuntime.js";
import "./carDriverGeometryRuntime.js";
import { CAR_REFERENCE, CAR_TEMPLATE_PRESETS, CAR_TEMPLATE_BY_ID, CAR_TIME_OPTIONS, CAR_TIME_BY_ID } from "./carTemplates.js";
import { showToast } from "./ui/dom.js";

const TEMPLATE_STORAGE = "ai-selfie-prompt-studio:car-template";
const TIME_STORAGE = "ai-selfie-prompt-studio:car-time";
let originalSendInstruction = null;

function readStored(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

function writeStored(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

function activeTemplate() {
  return CAR_TEMPLATE_BY_ID[document.documentElement.dataset.activeCarTemplate] ?? null;
}

function activeTime() {
  return CAR_TIME_BY_ID[document.documentElement.dataset.activeCarTime] ?? CAR_TIME_BY_ID.day;
}

function resetOtherTemplateControls() {
  document.querySelectorAll("#templateHub select").forEach((select) => {
    if (select.id === "hubCarTemplate" || select.id === "carTimeSelect") return;
    if ([...select.options].some((option) => option.value === "custom")) select.value = "custom";
  });
  const templateSelect = document.querySelector("#templateSelect");
  if (templateSelect && [...templateSelect.options].some((option) => option.value === "custom")) templateSelect.value = "custom";
  document.documentElement.dataset.activeTemplate = "custom";
  delete document.documentElement.dataset.activeTemplateHub;
  delete document.documentElement.dataset.activeIndoorTimeTemplate;
}

function makeReason(text) {
  const li = document.createElement("li");
  li.textContent = text;
  return li;
}

function renderCarReference() {
  const template = activeTemplate();
  if (!template) return;
  const time = activeTime();

  const title = document.querySelector("#sceneTitle");
  if (title) title.textContent = "مرجع السيارة الذي اختاره القالب";

  const confidence = document.querySelector("#sceneConfidence");
  if (confidence) {
    confidence.textContent = "ثابت 100%";
    confidence.className = "confidence-badge is-high";
  }

  const image = document.querySelector("#sceneImage");
  if (image) {
    image.onerror = null;
    image.src = CAR_REFERENCE.image_url;
    image.alt = "معاينة مرجع السيارة";
    image.classList.remove("is-placeholder");
  }
  const fallback = document.querySelector("#sceneFallback");
  if (fallback) fallback.hidden = true;

  const region = document.querySelector("#sceneRegion");
  if (region) region.textContent = "CAR INTERIOR · SAUDI PARKING";
  const name = document.querySelector("#sceneName");
  if (name) name.textContent = CAR_REFERENCE.name_ar;
  const filename = document.querySelector("#sceneFilename");
  if (filename) filename.textContent = CAR_REFERENCE.image_filename;
  const reasons = document.querySelector("#sceneReasons");
  if (reasons) reasons.replaceChildren(
    makeReason("المقصورة نفسها ثابتة بالكامل من المرجع؛ الشخص والملابس والشعر والتعبير فقط قابلة للتغيير."),
    makeReason(`السيارة متوقفة داخل السعودية · الوقت المختار: ${time.name_ar}.`),
    makeReason(`القالب النشط: ${template.name_ar}.`)
  );

  const autoTitle = document.querySelector("#autoReferenceTitle");
  if (autoTitle) autoTitle.textContent = CAR_REFERENCE.name_ar;
  const autoMeta = document.querySelector("#autoReferenceMeta");
  if (autoMeta) autoMeta.textContent = `${CAR_REFERENCE.image_filename} · مرجع ثابت مع قالب السيارة`;

  const summary = document.querySelector("#promptSummary");
  if (summary) summary.textContent = `🚙 ${template.name_ar} · ${time.name_ar} · Xiaomi 15 Ultra Front Camera · السيارة متوقفة في السعودية`;

  const send = document.querySelector("#sendInstruction");
  if (send) send.innerHTML = "أرفق IMAGE A ومرجع السيارة <strong>1000206938.jpg</strong> باعتباره IMAGE B مع الأمر، واطلب توليد صورة واحدة فقط داخل نفس السيارة المتوقفة في السعودية.";
}

function scheduleRender() {
  requestAnimationFrame(() => requestAnimationFrame(renderCarReference));
}

function restoreRoomLabels() {
  const title = document.querySelector("#sceneTitle");
  if (title) title.textContent = "مرجع الغرفة الذي اختاره القالب";
  const send = document.querySelector("#sendInstruction");
  if (send && originalSendInstruction !== null) send.innerHTML = originalSendInstruction;
}

function deactivateCar({ rebuild = true } = {}) {
  if (!activeTemplate()) return;
  delete document.documentElement.dataset.activeCarTemplate;
  delete document.documentElement.dataset.activeCarTime;
  const select = document.querySelector("#hubCarTemplate");
  if (select) select.value = "custom";
  restoreRoomLabels();
  if (rebuild) document.querySelector("#rebuildBtn")?.click();
}

function activateCar(templateId, timeId) {
  const template = CAR_TEMPLATE_BY_ID[templateId];
  const time = CAR_TIME_BY_ID[timeId] ?? CAR_TIME_BY_ID.day;
  if (!template) return;
  resetOtherTemplateControls();
  document.documentElement.dataset.activeCarTemplate = template.id;
  document.documentElement.dataset.activeCarTime = time.id;
  writeStored(TEMPLATE_STORAGE, template.id);
  writeStored(TIME_STORAGE, time.id);
  document.querySelector("#rebuildBtn")?.click();
  scheduleRender();
  showToast(`تم تطبيق قالب السيارة: ${template.name_ar} · السيارة متوقفة في السعودية`, "success", 4200);
}

function installStyles() {
  if (document.querySelector("#carTemplateStyles")) return;
  const style = document.createElement("style");
  style.id = "carTemplateStyles";
  style.textContent = `
.car-template-card{grid-column:1/-1}.car-template-card__controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.car-template-card__preview{margin-top:12px;display:grid;grid-template-columns:86px 1fr;gap:12px;align-items:center;padding:10px;border:1px solid var(--border-color,rgba(127,127,127,.18));border-radius:14px;background:rgba(127,127,127,.03)}.car-template-card__preview img{width:86px;aspect-ratio:9/16;object-fit:cover;border-radius:10px}.car-template-card__preview strong{display:block;margin-bottom:4px}.car-template-card__preview small{display:block;line-height:1.7;opacity:.72}@media(max-width:700px){.car-template-card__controls{grid-template-columns:1fr}}
`;
  document.head.appendChild(style);
}

function buildCarCard() {
  const grid = document.querySelector("#templateHub .template-hub__grid");
  if (!grid || document.querySelector("#hubCarTemplate")) return false;
  installStyles();

  const card = document.createElement("article");
  card.className = "template-hub__card car-template-card";

  const label = document.createElement("label");
  label.htmlFor = "hubCarTemplate";
  const icon = document.createElement("span");
  icon.className = "template-hub__icon";
  icon.textContent = "🚙";
  const text = document.createElement("strong");
  text.textContent = "قوالب السيارة — متوقفة في السعودية";
  label.append(icon, text);

  const controls = document.createElement("div");
  controls.className = "car-template-card__controls";

  const templateWrap = document.createElement("div");
  const templateLabel = document.createElement("small");
  templateLabel.textContent = "الوضعية داخل السيارة";
  const templateSelect = document.createElement("select");
  templateSelect.id = "hubCarTemplate";
  const custom = document.createElement("option");
  custom.value = "custom";
  custom.textContent = "اختر قالب السيارة";
  templateSelect.appendChild(custom);
  CAR_TEMPLATE_PRESETS.forEach((template) => {
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = template.name_ar;
    templateSelect.appendChild(option);
  });
  templateWrap.append(templateLabel, templateSelect);

  const timeWrap = document.createElement("div");
  const timeLabel = document.createElement("small");
  timeLabel.textContent = "وقت التصوير";
  const timeSelect = document.createElement("select");
  timeSelect.id = "carTimeSelect";
  CAR_TIME_OPTIONS.forEach((time) => {
    const option = document.createElement("option");
    option.value = time.id;
    option.textContent = time.name_ar;
    timeSelect.appendChild(option);
  });
  timeSelect.value = CAR_TIME_BY_ID[readStored(TIME_STORAGE, "day")] ? readStored(TIME_STORAGE, "day") : "day";
  timeWrap.append(timeLabel, timeSelect);
  controls.append(templateWrap, timeWrap);

  const preview = document.createElement("div");
  preview.className = "car-template-card__preview";
  const image = document.createElement("img");
  image.src = CAR_REFERENCE.image_url;
  image.alt = "مرجع السيارة الثابت";
  const meta = document.createElement("div");
  const metaTitle = document.createElement("strong");
  metaTitle.textContent = CAR_REFERENCE.name_ar;
  const metaText = document.createElement("small");
  metaText.textContent = "المقصورة ثابتة 100%. الملابس والشعر والتعبير والوقت ونمط كاميرا Xiaomi يمكن تغييرها. الخلفية خارج الزجاج مواقف سيارات داخل السعودية فقط.";
  meta.append(metaTitle, metaText);
  preview.append(image, meta);

  templateSelect.addEventListener("change", () => {
    if (templateSelect.value === "custom") {
      deactivateCar();
      return;
    }
    activateCar(templateSelect.value, timeSelect.value);
  });

  timeSelect.addEventListener("change", () => {
    writeStored(TIME_STORAGE, timeSelect.value);
    if (!activeTemplate()) return;
    document.documentElement.dataset.activeCarTime = timeSelect.value;
    document.querySelector("#rebuildBtn")?.click();
    scheduleRender();
  });

  card.append(label, controls, preview);
  grid.appendChild(card);

  const storedTemplate = readStored(TEMPLATE_STORAGE, "custom");
  if (CAR_TEMPLATE_BY_ID[storedTemplate]) {
    templateSelect.value = storedTemplate;
  }
  return true;
}

function install() {
  originalSendInstruction = document.querySelector("#sendInstruction")?.innerHTML ?? null;
  let attempts = 0;
  const tryBuild = () => {
    if (buildCarCard()) return;
    attempts += 1;
    if (attempts < 12) requestAnimationFrame(tryBuild);
  };
  tryBuild();

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    if (target.id === "hubCarTemplate" || target.id === "carTimeSelect") {
      if (activeTemplate()) scheduleRender();
      return;
    }
    if (activeTemplate() && ((target.id.startsWith("hub") && target.value !== "custom") || target.id === "templateSelect")) {
      deactivateCar({ rebuild: false });
      return;
    }
    if (activeTemplate()) scheduleRender();
  }, true);

  document.querySelector("#rebuildBtn")?.addEventListener("click", () => {
    if (activeTemplate()) scheduleRender();
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
}
