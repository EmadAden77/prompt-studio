import {
  DEFAULT_STATE,
  buildPromptPack,
  getCarSeatOptions,
  getClothingOptions,
  getCompatibleBedroomWindowOptions,
  getCompositionOptions,
  getExpressionOptions,
  getHairOptions,
  getLightingOptions,
  getPoseFamilyOptions,
  getPoseOptions,
  getSceneOptions,
  getSelfieAngleOptions,
  getSkinOptions,
  isBedroomScene,
  isCarScene,
  isTextRoomReference,
  normalizeState
} from "./physics-prompt-engine-v5.js";
import { wikiPromptService } from "./services/wikiPromptService.js";

const form = document.querySelector("#prompt-form");
const referenceImage = document.querySelector("#reference-image");
const referencePreview = document.querySelector("#reference-preview");
const referencePreviewWrap = document.querySelector("#reference-preview-wrap");
const removeReferenceButton = document.querySelector("#remove-reference");
const sceneSelect = document.querySelector("#scene");
const poseFamilySelect = document.querySelector("#pose-family");
const poseSelect = document.querySelector("#pose");
const carSeatSelect = document.querySelector("#car-seat");
const carSeatField = document.querySelector("#car-seat-field");
const selfieAngleSelect = document.querySelector("#selfie-angle");
const compositionSelect = document.querySelector("#composition");
const clothingSelect = document.querySelector("#clothing");
const hairSelect = document.querySelector("#hair");
const skinSelect = document.querySelector("#skin");
const expressionSelect = document.querySelector("#expression");
const lightingSelect = document.querySelector("#lighting");
const bedroomWindowSelect = document.querySelector("#bedroom-window");
const bedroomWindowField = document.querySelector("#bedroom-window-field");
const templateHint = document.querySelector("#template-hint");
const positivePrompt = document.querySelector("#positive-prompt");
const negativePrompt = document.querySelector("#negative-prompt");
const resultMeta = document.querySelector("#result-meta");
const qaList = document.querySelector("#qa-list");
const qaItemTemplate = document.querySelector("#qa-item-template");
const formStatus = document.querySelector("#form-status");

let referenceObjectUrl = "";
let hasReference = false;
let wikiSyncId = 0;

const SELECTED_SCENE_STORAGE_KEY = "wikiprompt-selfie-studio:selected-scene";
const value = (id) => document.querySelector(`#${id}`)?.value ?? "";

function setStatus(message) {
  formStatus.textContent = message;
}

function populateSelect(select, options, preferredValue) {
  select.replaceChildren();
  options.forEach((option) => {
    const element = document.createElement("option");
    element.value = option.value;
    element.textContent = option.label;
    select.append(element);
  });
  const preferredExists = options.some((option) => option.value === preferredValue);
  select.value = preferredExists ? preferredValue : options[0]?.value ?? "";
}

function wikiConfig(state) {
  return {
    scene:{ id:state.scene, name_en:state.scene },
    pose:{ id:state.pose, name_en:state.pose },
    lighting:{ id:state.lighting, name_en:state.lighting },
    mode:"selfie",
    composition:state.composition,
    selfieAngle:state.selfieAngle
  };
}

function wikiStatusText(status = wikiPromptService.getStatus()) {
  const labels = {
    idle:"⚪ WikiPrompt: لم يُفحص بعد",
    loading:"🟡 WikiPrompt: جارٍ الفحص",
    synced:"🟢 WikiPrompt: الأساس متزامن",
    "synced-fallback":"🟢 WikiPrompt: الأساس متزامن عبر النسخة الاحتياطية",
    cache:"🟢 WikiPrompt: الأساس من الكاش",
    "local-ready":"🟢 WikiPrompt: البيانات المحلية جاهزة",
    "local-fallback":"🟢 WikiPrompt: النسخة الاحتياطية المحلية فعّالة",
    empty:"🟠 WikiPrompt: لا توجد إشارات مناسبة",
    unavailable:"🔴 WikiPrompt: غير متاح",
    error:"🔴 WikiPrompt: فشل المزامنة"
  };
  return labels[status?.state] || `⚪ WikiPrompt: ${status?.state || "غير معروف"}`;
}

function composeWikiFirstPrompt(basePrompt, guidance) {
  return guidance ? `[WIKIPROMPT BASE REALISM]\n${guidance}\n\n${basePrompt}` : basePrompt;
}

function restoreSelectedScene() {
  try {
    const savedScene = localStorage.getItem(SELECTED_SCENE_STORAGE_KEY);
    if ([...sceneSelect.options].some((option) => option.value === savedScene)) {
      sceneSelect.value = savedScene;
    }
  } catch {}
}

function persistSelectedScene() {
  try { localStorage.setItem(SELECTED_SCENE_STORAGE_KEY, sceneSelect.value); } catch {}
}

function readState() {
  return {
    scene:value("scene"),
    city:value("city"),
    time:value("time"),
    mode:"selfie",
    poseFamily:value("pose-family"),
    pose:value("pose"),
    carSeat:value("car-seat"),
    clothing:value("clothing"),
    clothingCustom:value("clothing-custom"),
    hair:value("hair"),
    skin:value("skin"),
    expression:value("expression"),
    composition:value("composition"),
    selfieAngle:value("selfie-angle"),
    messiness:value("messiness"),
    lighting:value("lighting"),
    bedroomWindow:value("bedroom-window"),
    identityNotes:value("identity-notes"),
    environmentNote:value("environment-note"),
    hasReference
  };
}

function syncUiToNormalizedState(state) {
  const pairs = [
    [sceneSelect, state.scene],
    [poseFamilySelect, state.poseFamily],
    [poseSelect, state.pose],
    [carSeatSelect, state.carSeat],
    [selfieAngleSelect, state.selfieAngle],
    [compositionSelect, state.composition],
    [clothingSelect, state.clothing],
    [hairSelect, state.hair],
    [skinSelect, state.skin],
    [expressionSelect, state.expression],
    [lightingSelect, state.lighting],
    [bedroomWindowSelect, state.bedroomWindow]
  ];
  pairs.forEach(([select, selectedValue]) => {
    if (select && [...select.options].some((option) => option.value === selectedValue)) {
      select.value = selectedValue;
    }
  });
}

function refreshDynamicFields() {
  const scene = sceneSelect.value || DEFAULT_STATE.scene;
  const time = value("time") || DEFAULT_STATE.time;

  populateSelect(poseFamilySelect, getPoseFamilyOptions(scene), poseFamilySelect.value || DEFAULT_STATE.poseFamily);
  populateSelect(poseSelect, getPoseOptions(scene, poseFamilySelect.value), poseSelect.value || DEFAULT_STATE.pose);

  const car = isCarScene(scene);
  carSeatField.hidden = !car;
  if (car) {
    populateSelect(
      carSeatSelect,
      getCarSeatOptions(scene, poseSelect.value),
      carSeatSelect.value || DEFAULT_STATE.carSeat
    );
  } else {
    carSeatSelect.replaceChildren();
  }

  populateSelect(
    selfieAngleSelect,
    getSelfieAngleOptions(poseSelect.value),
    selfieAngleSelect.value || DEFAULT_STATE.selfieAngle
  );
  populateSelect(
    compositionSelect,
    getCompositionOptions(poseSelect.value),
    compositionSelect.value || DEFAULT_STATE.composition
  );

  populateSelect(clothingSelect, getClothingOptions(scene), clothingSelect.value || DEFAULT_STATE.clothing);
  populateSelect(lightingSelect, getLightingOptions(scene, time), lightingSelect.value || DEFAULT_STATE.lighting);

  const bedroom = isBedroomScene(scene);
  bedroomWindowField.hidden = !bedroom;
  if (bedroom) {
    populateSelect(
      bedroomWindowSelect,
      getCompatibleBedroomWindowOptions(time, lightingSelect.value),
      bedroomWindowSelect.value || DEFAULT_STATE.bedroomWindow
    );
  } else {
    bedroomWindowSelect.replaceChildren();
  }

  const normalized = normalizeState(readState());

  if (normalized.poseFamily !== poseFamilySelect.value) {
    populateSelect(poseFamilySelect, getPoseFamilyOptions(normalized.scene), normalized.poseFamily);
    populateSelect(poseSelect, getPoseOptions(normalized.scene, normalized.poseFamily), normalized.pose);
  }

  if (isCarScene(normalized.scene)) {
    carSeatField.hidden = false;
    populateSelect(carSeatSelect, getCarSeatOptions(normalized.scene, normalized.pose), normalized.carSeat);
  } else {
    carSeatField.hidden = true;
    carSeatSelect.replaceChildren();
  }

  populateSelect(selfieAngleSelect, getSelfieAngleOptions(normalized.pose), normalized.selfieAngle);
  populateSelect(compositionSelect, getCompositionOptions(normalized.pose), normalized.composition);
  populateSelect(clothingSelect, getClothingOptions(normalized.scene), normalized.clothing);
  populateSelect(lightingSelect, getLightingOptions(normalized.scene, normalized.time), normalized.lighting);

  if (isBedroomScene(normalized.scene)) {
    populateSelect(
      bedroomWindowSelect,
      getCompatibleBedroomWindowOptions(normalized.time, normalized.lighting),
      normalized.bedroomWindow
    );
  }

  syncUiToNormalizedState(normalized);
  const pack = buildPromptPack(normalized);
  templateHint.textContent = `السيلفي النشط: ${pack.template.title}`;
}

function renderQa(items) {
  qaList.replaceChildren();
  items.forEach((item) => {
    const fragment = qaItemTemplate.content.cloneNode(true);
    fragment.querySelector("strong").textContent = `${item.label}:`;
    fragment.querySelector("span").textContent = item.value;
    qaList.append(fragment);
  });
}

function localStatus(pack) {
  if (isTextRoomReference(pack.state.scene)) {
    return hasReference
      ? "هوية واحدة مثبتة؛ وصف الغرفة سياق اختياري ولا يلزم IMAGE B."
      : "الغرفة وصف نصي مساعد؛ أرفق صورة هوية واحدة فقط عند الاستخدام.";
  }
  if (isCarScene(pack.state.scene)) {
    return hasReference
      ? "تم تثبيت الهوية وموضع الجلوس داخل السيارة؛ الخلفية غير إجبارية."
      : "موضع الجلوس داخل السيارة مقفل؛ أرفق صورة هوية واحدة فقط عند الاستخدام.";
  }
  return hasReference
    ? "تم تثبيت مرجع الهوية الواحد؛ الخلفية غير إجبارية."
    : "البرومبت جاهز؛ أرفق صورة هوية واحدة فقط عند الاستخدام.";
}

function renderPrompt() {
  refreshDynamicFields();
  const pack = buildPromptPack(readState());
  const config = wikiConfig(pack.state);
  const cachedGuidance = wikiPromptService.getCachedGuidance(config);

  positivePrompt.value = composeWikiFirstPrompt(pack.positive, cachedGuidance);
  negativePrompt.value = pack.negative;
  resultMeta.textContent = `${pack.template.title} · Xiaomi 15 Ultra Front · ${pack.state.time === "night" ? "ليلي" : "نهاري"}`;
  renderQa([
    ...pack.qa,
    { label:"WikiPrompt", value:cachedGuidance ? "هو أساس البرومبت الحالي" : "جارٍ تحميل أساس الواقعية" }
  ]);
  setStatus(`${localStatus(pack)} · ${cachedGuidance ? wikiStatusText({ state:"cache" }) : "🟡 WikiPrompt: جارٍ الفحص"}`);

  const syncId = ++wikiSyncId;
  void wikiPromptService.sync(config).then((guidance) => {
    if (syncId !== wikiSyncId) return;
    const status = wikiPromptService.getStatus();
    positivePrompt.value = composeWikiFirstPrompt(pack.positive, guidance);
    renderQa([
      ...pack.qa,
      {
        label:"WikiPrompt",
        value:guidance
          ? (status.state === "synced-fallback"
              ? "الأساس الواقعي مضاف عبر النسخة الاحتياطية"
              : "الأساس الواقعي مضاف أول البرومبت")
          : wikiStatusText(status).replace(/^\S+\sWikiPrompt:\s*/, "")
      }
    ]);
    setStatus(`${localStatus(pack)} · ${wikiStatusText(status)}`);
  });
}

function clearReference() {
  if (referenceObjectUrl) URL.revokeObjectURL(referenceObjectUrl);
  referenceObjectUrl = "";
  hasReference = false;
  referenceImage.value = "";
  referencePreview.removeAttribute("src");
  referencePreviewWrap.hidden = true;
}

function setReference(file) {
  clearReference();
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setStatus("اختر ملف صورة صالحاً فقط.");
    return;
  }
  referenceObjectUrl = URL.createObjectURL(file);
  referencePreview.src = referenceObjectUrl;
  referencePreviewWrap.hidden = false;
  hasReference = true;
  setStatus("تمت معاينة مرجع الهوية محلياً؛ لم يتم رفعه أو حفظه.");
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const fallback = document.createElement("textarea");
    fallback.value = text;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.append(fallback);
    fallback.select();
    document.execCommand("copy");
    fallback.remove();
  }
  setStatus(`${label} تم نسخه. · ${wikiStatusText()}`);
}

function downloadPrompt() {
  const pack = [
    "WIKIPROMPT SELFIE STUDIO",
    "",
    "POSITIVE PROMPT",
    positivePrompt.value,
    "",
    "NEGATIVE PROMPT",
    negativePrompt.value
  ].join("\n");
  const blob = new Blob([pack], { type:"text/plain;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = "wikiprompt-selfie.txt";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
  setStatus(`تم تنزيل ملف البرومبت. · ${wikiStatusText()}`);
}

function resetForm() {
  form.reset();
  sceneSelect.value = DEFAULT_STATE.scene;
  document.querySelector("#city").value = DEFAULT_STATE.city;
  document.querySelector("#time").value = DEFAULT_STATE.time;
  document.querySelector("#messiness").value = DEFAULT_STATE.messiness;
  clearReference();
  refreshDynamicFields();
  syncUiToNormalizedState(DEFAULT_STATE);
  persistSelectedScene();
  renderPrompt();
}

function initializeStaticSelects() {
  populateSelect(sceneSelect, getSceneOptions(), DEFAULT_STATE.scene);
  populateSelect(hairSelect, getHairOptions(), DEFAULT_STATE.hair);
  populateSelect(skinSelect, getSkinOptions(), DEFAULT_STATE.skin);
  populateSelect(expressionSelect, getExpressionOptions(), DEFAULT_STATE.expression);
}

referenceImage.addEventListener("change", (event) => setReference(event.target.files?.[0]));
removeReferenceButton.addEventListener("click", () => {
  clearReference();
  setStatus("أزيلت معاينة المرجع من الجهاز.");
});

sceneSelect.addEventListener("change", () => {
  persistSelectedScene();
  refreshDynamicFields();
});

["time","pose-family","pose","car-seat","lighting"].forEach((id) => {
  document.querySelector(`#${id}`).addEventListener("change", refreshDynamicFields);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  renderPrompt();
});

document.querySelector("#reset-form").addEventListener("click", resetForm);
document.querySelector("#copy-positive").addEventListener("click", () => copyText(positivePrompt.value, "البرومبت"));
document.querySelector("#copy-negative").addEventListener("click", () => copyText(negativePrompt.value, "البرومبت السلبي"));
document.querySelector("#copy-pack").addEventListener("click", () =>
  copyText(`POSITIVE PROMPT\n${positivePrompt.value}\n\nNEGATIVE PROMPT\n${negativePrompt.value}`, "الحزمة الكاملة")
);
document.querySelector("#download-prompt").addEventListener("click", downloadPrompt);

initializeStaticSelects();
restoreSelectedScene();
refreshDynamicFields();
renderPrompt();
