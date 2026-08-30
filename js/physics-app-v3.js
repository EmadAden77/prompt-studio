import {
  DEFAULT_STATE,
  buildPromptPack,
  getBedroomLightingOptions,
  getBedroomPositionOptions,
  getBedroomWindowOptions,
  getClothingOptions,
  getLightingOptions,
  isBedroomScene,
  isTextRoomReference
} from "./physics-prompt-engine-v3.js";

const form = document.querySelector("#prompt-form");
const referenceImage = document.querySelector("#reference-image");
const referencePreview = document.querySelector("#reference-preview");
const referencePreviewWrap = document.querySelector("#reference-preview-wrap");
const removeReferenceButton = document.querySelector("#remove-reference");
const clothingSelect = document.querySelector("#clothing");
const lightingSelect = document.querySelector("#lighting");
const bedroomOptionsPanel = document.querySelector("#bedroom-options");
const bedroomPositionSelect = document.querySelector("#bedroom-position");
const bedroomWindowSelect = document.querySelector("#bedroom-window");
const bedroomLightingSelect = document.querySelector("#bedroom-lighting");
const generalLightingField = document.querySelector("#general-lighting-field");
const selfieAngleField = document.querySelector("#selfie-angle").closest(".selfie-only");
const templateHint = document.querySelector("#template-hint");
const positivePrompt = document.querySelector("#positive-prompt");
const negativePrompt = document.querySelector("#negative-prompt");
const resultMeta = document.querySelector("#result-meta");
const qaList = document.querySelector("#qa-list");
const qaItemTemplate = document.querySelector("#qa-item-template");
const formStatus = document.querySelector("#form-status");

let referenceObjectUrl = "";
let hasReference = false;

const SELECTED_SCENE_STORAGE_KEY = "physics-prompt-studio:selected-scene";

const value = (id) => document.querySelector(`#${id}`).value;

function setStatus(message) {
  formStatus.textContent = message;
}

function restoreSelectedScene() {
  try {
    const savedScene = localStorage.getItem(SELECTED_SCENE_STORAGE_KEY);
    const sceneSelect = document.querySelector("#scene");
    if ([...sceneSelect.options].some((option) => option.value === savedScene)) {
      sceneSelect.value = savedScene;
    }
  } catch {
    // Storage can be unavailable in a private browser session; the form still works.
  }
}

function persistSelectedScene() {
  try {
    localStorage.setItem(SELECTED_SCENE_STORAGE_KEY, value("scene"));
  } catch {
    // Keep the selection in the current page even when storage is unavailable.
  }
}

function populateSelect(select, options, preferredValue) {
  select.replaceChildren();
  options.forEach((option) => {
    const element = document.createElement("option");
    element.value = option.value;
    element.textContent = option.label;
    select.append(element);
  });
  const canPreserve = options.some((option) => option.value === preferredValue);
  select.value = canPreserve ? preferredValue : options[0]?.value ?? "";
}

function readState() {
  return {
    scene: value("scene"),
    city: value("city"),
    time: value("time"),
    mode: value("mode"),
    clothing: value("clothing"),
    clothingCustom: value("clothing-custom"),
    hair: value("hair"),
    skin: value("skin"),
    expression: value("expression"),
    composition: value("composition"),
    selfieAngle: value("selfie-angle"),
    messiness: value("messiness"),
    lighting: value("lighting"),
    bedroomPosition: value("bedroom-position"),
    bedroomWindow: value("bedroom-window"),
    bedroomLighting: value("bedroom-lighting"),
    bedroomDetail: value("bedroom-detail"),
    identityNotes: value("identity-notes"),
    activity: value("activity"),
    environmentNote: value("environment-note"),
    hasReference
  };
}

function refreshDynamicFields() {
  const scene = value("scene");
  const time = value("time");
  const mode = value("mode");
  const currentClothing = clothingSelect.value;
  const currentLighting = lightingSelect.value;
  const currentBedroomPosition = bedroomPositionSelect.value;
  const currentBedroomWindow = bedroomWindowSelect.value;
  const currentBedroomLighting = bedroomLightingSelect.value;

  populateSelect(clothingSelect, getClothingOptions(scene), currentClothing);
  populateSelect(lightingSelect, getLightingOptions(scene, time), currentLighting);
  populateSelect(bedroomPositionSelect, getBedroomPositionOptions(), currentBedroomPosition);
  populateSelect(bedroomWindowSelect, getBedroomWindowOptions(time), currentBedroomWindow);
  populateSelect(bedroomLightingSelect, getBedroomLightingOptions(time), currentBedroomLighting);

  const isBedroom = isBedroomScene(scene);
  bedroomOptionsPanel.hidden = !isBedroom;
  generalLightingField.hidden = isBedroom;
  selfieAngleField.hidden = mode !== "selfie";

  const pack = buildPromptPack(readState());
  templateHint.textContent = `القالب النشط: ${pack.template.title}`;
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

function renderPrompt() {
  const pack = buildPromptPack(readState());
  positivePrompt.value = pack.positive;
  negativePrompt.value = pack.negative;
  resultMeta.textContent = `${pack.template.title} · ${pack.state.mode === "selfie" ? "كاميرا أمامية" : "كاميرا خلفية رئيسية"} · ${pack.state.time === "night" ? "ليلي" : "نهاري"}`;
  renderQa(pack.qa);
  setStatus(
    isTextRoomReference(pack.state.scene)
      ? hasReference
        ? "تم تثبيت وصف غرفتك النصي؛ لا يلزم IMAGE B، وصورة الهوية تبقى المرجع الوحيد للشخص."
        : "وصف غرفتك النصي ثابت؛ لا يلزم IMAGE B. أرفق فقط صورة الهوية عند الاستخدام."
      : hasReference
      ? "تم بناء البرومبت مع قيد المرجع الواحد."
      : "البرومبت جاهز؛ أرفق صورة هوية واحدة مع مولّد الصور عند الاستخدام."
  );
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
  setStatus("تمت معاينة مرجع واحد محلياً؛ لم يتم رفعه أو حفظه.");
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
  setStatus(`${label} تم نسخه.`);
}

function downloadPrompt() {
  const pack = [
    "PHYSICS PROMPT STUDIO",
    "",
    "POSITIVE PROMPT",
    positivePrompt.value,
    "",
    "NEGATIVE PROMPT",
    negativePrompt.value
  ].join("\n");
  const blob = new Blob([pack], { type: "text/plain;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = "physics-prompt.txt";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
  setStatus("تم تنزيل ملف البرومبت.");
}

function resetForm() {
  form.reset();
  document.querySelector("#scene").value = DEFAULT_STATE.scene;
  document.querySelector("#city").value = DEFAULT_STATE.city;
  document.querySelector("#time").value = DEFAULT_STATE.time;
  document.querySelector("#mode").value = DEFAULT_STATE.mode;
  document.querySelector("#hair").value = DEFAULT_STATE.hair;
  document.querySelector("#skin").value = DEFAULT_STATE.skin;
  document.querySelector("#expression").value = DEFAULT_STATE.expression;
  document.querySelector("#composition").value = DEFAULT_STATE.composition;
  document.querySelector("#selfie-angle").value = DEFAULT_STATE.selfieAngle;
  document.querySelector("#messiness").value = DEFAULT_STATE.messiness;
  document.querySelector("#bedroom-position").value = DEFAULT_STATE.bedroomPosition;
  document.querySelector("#bedroom-window").value = DEFAULT_STATE.bedroomWindow;
  document.querySelector("#bedroom-lighting").value = DEFAULT_STATE.bedroomLighting;
  clearReference();
  persistSelectedScene();
  refreshDynamicFields();
  renderPrompt();
  setStatus("عادت الخيارات إلى الإعدادات الافتراضية.");
}

referenceImage.addEventListener("change", (event) => {
  setReference(event.target.files?.[0]);
});

removeReferenceButton.addEventListener("click", () => {
  clearReference();
  setStatus("أزيلت معاينة المرجع من الجهاز.");
});

document.querySelector("#scene").addEventListener("change", () => {
  persistSelectedScene();
  refreshDynamicFields();
});

["time", "mode"].forEach((id) => {
  document.querySelector(`#${id}`).addEventListener("change", refreshDynamicFields);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  refreshDynamicFields();
  renderPrompt();
});

document.querySelector("#reset-form").addEventListener("click", resetForm);
document.querySelector("#copy-positive").addEventListener("click", () => copyText(positivePrompt.value, "البرومبت"));
document.querySelector("#copy-negative").addEventListener("click", () => copyText(negativePrompt.value, "البرومبت السلبي"));
document.querySelector("#copy-pack").addEventListener("click", () => {
  const fullPack = `POSITIVE PROMPT\n${positivePrompt.value}\n\nNEGATIVE PROMPT\n${negativePrompt.value}`;
  copyText(fullPack, "الحزمة الكاملة");
});
document.querySelector("#download-prompt").addEventListener("click", downloadPrompt);

restoreSelectedScene();
refreshDynamicFields();
renderPrompt();
