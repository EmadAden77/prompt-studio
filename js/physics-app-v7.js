import {
  DEFAULT_STATE,
  buildPromptPack,
  getCarSeatOptions,
  getClothingFitOptions,
  getClothingOptions,
  getCompatibleBedroomWindowOptions,
  getCompositionOptions,
  getExpressionOptions,
  getFabricOptions,
  getFabricWeightOptions,
  getHairOptions,
  getIronStateOptions,
  getLightingOptions,
  getPoseFamilyOptions,
  getPoseOptions,
  getSceneOptions,
  getSelfieAngleOptions,
  getSkinOptions,
  getWearStateOptions,
  isBedroomScene,
  isCarScene,
  isCustomScene,
  isTextRoomReference,
  normalizeState
} from "./physics-prompt-engine-v5.js?v=20260902-bedroom-topology1";
import {
  REALISM_CORE_NEGATIVE_RULES,
  buildRealismCoreSections,
  getPeopleDensityOptions,
  getPlaceStateOptions,
  getSubjectMomentOptions,
  realismCoreQaItems,
  resolveRealismCoreState
} from "./realism-core-v1.js";
import {
  ADVANCED_REALISM_NEGATIVE_RULES,
  advancedRealismQaItems,
  buildAdvancedRealismSections,
  evaluateRealismRisk,
  getAccessoryProfileOptions,
  getObjectProfileOptions,
  getSceneProfileOptions,
  optimizePrompt,
  resolveAdvancedRealismState
} from "./advanced-realism-v1.js";
import { wikiPromptService } from "./services/wikiPromptService.js";
import {
  AUTO_REALISM_DEFAULTS,
  applyAutoRealismSuite,
  bindAutoRealismSuite,
  mountAutoRealismSuite,
  normalizeAutoRealismState,
  readAutoRealismUiState
} from "./auto-realism-suite-v1.js?v=20260902-context-resolver1";
import { CAMERA_HOLDER_OPTIONS, GROUP_ARRANGEMENT_OPTIONS, GROUP_COUNT_OPTIONS, GROUP_INTERACTION_OPTIONS, GROUP_SELFIE_DEFAULTS, buildGroupSelfieEnhancement, evaluateGroupRealism, isGroupSelfie, normalizeGroupSelfieState } from "./group-selfie-engine-v1.js";
import { ACCIDENTAL_DEFAULTS, ACCIDENTAL_DEVICE_OPTIONS, ACCIDENTAL_EXPOSURE_OPTIONS, ACCIDENTAL_FOCUS_OPTIONS, ACCIDENTAL_INTENSITY_OPTIONS, ACCIDENTAL_MOTION_OPTIONS, ACCIDENTAL_POSITION_OPTIONS, ACCIDENTAL_TILT_OPTIONS, ACCIDENTAL_TRIGGER_OPTIONS, applyAccidentalDeviceAuthority, buildAccidentalCaptureEnhancement, isAccidentalCapture, normalizeAccidentalState } from "./accidental-capture-engine-v1.js";
import { SCENARIO_DEFAULTS, SCENARIO_OPTIONS, buildScenarioLock, getScenarioSceneOptions, normalizeScenarioState, scenarioForScene } from "./scenario-section-engine-v1.js";
import { STUDIO_SECTION_DEFAULTS, STUDIO_SECTION_OPTIONS, buildStudioSectionLock, normalizeStudioSectionState } from "./studio-section-engine-v1.js";
import { buildPostProcessingEnhancement, normalizePostProcessingState } from "./post-processing-engine-v1.js";

const REALISM_DEFAULTS = Object.freeze({
  placeState:"auto",
  peopleDensity:"auto",
  subjectMoment:"auto",
  interactionObject:"",
  sceneProfile:"auto",
  accessoryProfile:"auto",
  accessoryDetail:"",
  objectProfile:"none"
});

const form = document.querySelector("#prompt-form");
mountAutoRealismSuite(form);
const referenceImage = document.querySelector("#reference-image");
const referencePreview = document.querySelector("#reference-preview");
const referencePreviewWrap = document.querySelector("#reference-preview-wrap");
const removeReferenceButton = document.querySelector("#remove-reference");
const sceneSelect = document.querySelector("#scene");
const scenarioModeSelect = document.querySelector("#scenario-mode");
const studioSectionSelect = document.querySelector("#studio-section");
const studioSectionDescription = document.querySelector("#studio-section-description");
const studioSectionStatus = document.querySelector("#studio-section-status");
const studioHub = document.querySelector("#studio-hub");
const studioWorkspace = document.querySelector("#studio-workspace");
const studioSectionGrid = document.querySelector("#studio-section-grid");
const activeStudioSectionTitle = document.querySelector("#active-studio-section-title");
const backToSectionsButton = document.querySelector("#back-to-sections");
const sceneField = document.querySelector("#scene-field");
const customSceneField = document.querySelector("#custom-scene-field");
const customSceneDetailsField = document.querySelector("#custom-scene-details-field");
const poseFamilySelect = document.querySelector("#pose-family");
const poseSelect = document.querySelector("#pose");
const carSeatSelect = document.querySelector("#car-seat");
const carSeatField = document.querySelector("#car-seat-field");
const selfieAngleSelect = document.querySelector("#selfie-angle");
const compositionSelect = document.querySelector("#composition");
const clothingSelect = document.querySelector("#clothing");
const fabricSelect = document.querySelector("#fabric");
const fabricWeightSelect = document.querySelector("#fabric-weight");
const ironStateSelect = document.querySelector("#iron-state");
const wearStateSelect = document.querySelector("#wear-state");
const clothingFitSelect = document.querySelector("#clothing-fit");
const hairSelect = document.querySelector("#hair");
const skinSelect = document.querySelector("#skin");
const expressionSelect = document.querySelector("#expression");
const lightingSelect = document.querySelector("#lighting");
const bedroomWindowSelect = document.querySelector("#bedroom-window");
const bedroomWindowField = document.querySelector("#bedroom-window-field");
const placeStateSelect = document.querySelector("#place-state");
const peopleDensitySelect = document.querySelector("#people-density");
const subjectMomentSelect = document.querySelector("#subject-moment");
const sceneProfileSelect = document.querySelector("#scene-profile");
const sceneProfileField = document.querySelector("#scene-profile-field");
const accessoryProfileSelect = document.querySelector("#accessory-profile");
const objectProfileSelect = document.querySelector("#object-profile");
const realismScorePreview = document.querySelector("#realism-score-preview");
const groupSelfieFields = document.querySelector("#group-selfie-fields");
const groupModeSelect = document.querySelector("#group-mode");
const captureModeSelect = document.querySelector("#capture-mode");
const groupCountSelect = document.querySelector("#group-count");
const cameraHolderSelect = document.querySelector("#camera-holder");
const groupArrangementSelect = document.querySelector("#group-arrangement");
const groupInteractionSelect = document.querySelector("#group-interaction");
const groupScorePreview = document.querySelector("#group-score-preview");
const accidentalCaptureFields = document.querySelector("#accidental-capture-fields");
const accidentalTriggerSelect = document.querySelector("#accidental-trigger");
const accidentalDeviceSelect = document.querySelector("#accidental-device");
const accidentalPositionSelect = document.querySelector("#accidental-position");
const accidentalMotionSelect = document.querySelector("#accidental-motion");
const accidentalTiltSelect = document.querySelector("#accidental-tilt");
const accidentalFocusSelect = document.querySelector("#accidental-focus");
const accidentalExposureSelect = document.querySelector("#accidental-exposure");
const accidentalIntensitySelect = document.querySelector("#accidental-intensity");
const templateHint = document.querySelector("#template-hint");
const resultPanel = document.querySelector("#result-panel");
const positivePrompt = document.querySelector("#positive-prompt");
const negativePrompt = document.querySelector("#negative-prompt");
const resultMeta = document.querySelector("#result-meta");
const qaList = document.querySelector("#qa-list");
const qaItemTemplate = document.querySelector("#qa-item-template");
const formStatus = document.querySelector("#form-status");
const postProcessingInputs = [...document.querySelectorAll('input[name="postProcessing"]')];
const postProcessingStatus = document.querySelector("#post-processing-status");

let referenceObjectUrl = "";
let hasReference = false;
let wikiSyncId = 0;
const SELECTED_SCENE_STORAGE_KEY = "wikiprompt-selfie-studio:selected-scene";
const SELECTED_SCENARIO_STORAGE_KEY = "wikiprompt-selfie-studio:selected-scenario";
const SELECTED_STUDIO_SECTION_STORAGE_KEY = "wikiprompt-selfie-studio:active-section";
const value = (id) => document.querySelector(`#${id}`)?.value ?? "";

function setStatus(message) { formStatus.textContent = message; }

function populateSelect(select, options, preferredValue) {
  if (!select) return;
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
    scene:{ id:state.scene, name_en:state.customScene || state.scene },
    pose:{ id:state.pose, name_en:state.pose },
    lighting:{ id:state.lighting, name_en:state.lighting },
    mode:"selfie",
    composition:state.composition,
    selfieAngle:state.selfieAngle
  };
}

function wikiStatusText(status = wikiPromptService.getStatus()) {
  const labels = {
    idle:"⚪ WikiPrompt: لم يُفحص بعد", loading:"🟡 WikiPrompt: جارٍ الفحص", synced:"🟢 WikiPrompt: الأساس متزامن",
    "synced-fallback":"🟢 WikiPrompt: الأساس متزامن عبر النسخة الاحتياطية", cache:"🟢 WikiPrompt: الأساس من الكاش",
    "local-ready":"🟢 WikiPrompt: البيانات المحلية جاهزة", "local-fallback":"🟢 WikiPrompt: النسخة الاحتياطية المحلية فعّالة",
    empty:"🟠 WikiPrompt: لا توجد إشارات مناسبة", unavailable:"🔴 WikiPrompt: غير متاح", error:"🔴 WikiPrompt: فشل المزامنة"
  };
  return labels[status?.state] || `⚪ WikiPrompt: ${status?.state || "غير معروف"}`;
}

function composeWikiFirstPrompt(basePrompt, guidance) {
  return guidance ? `[WIKIPROMPT BASE REALISM]\n${guidance}\n\n${basePrompt}` : basePrompt;
}

function restoreSelectedScene() {
  try {
    const savedSection = localStorage.getItem(SELECTED_STUDIO_SECTION_STORAGE_KEY);
    if ([...studioSectionSelect.options].some((option) => option.value === savedSection)) studioSectionSelect.value = savedSection;
  } catch {}
}
function persistSelectedScene() { try { localStorage.setItem(SELECTED_STUDIO_SECTION_STORAGE_KEY, studioSectionSelect.value); } catch {} }

function openStudioSection(sectionId) {
  studioSectionSelect.value = sectionId;
  persistSelectedScene();
  if (!history.state?.studioSection) {
    history.pushState({ ...(history.state || {}), studioSection:sectionId }, "", `#section=${sectionId}`);
  } else {
    history.replaceState({ ...(history.state || {}), studioSection:sectionId }, "", `#section=${sectionId}`);
  }
  studioHub.hidden = true;
  studioWorkspace.hidden = false;
  resultPanel.hidden = true;
  refreshDynamicFields();
  studioWorkspace.scrollIntoView({ behavior:"smooth", block:"start" });
}

function closeStudioSection() {
  studioWorkspace.hidden = true;
  resultPanel.hidden = true;
  studioHub.hidden = false;
  studioHub.scrollIntoView({ behavior:"smooth", block:"start" });
}

function returnToStudioHub() {
  const sectionHistoryActive = Boolean(history.state?.studioSection);
  closeStudioSection();
  if (sectionHistoryActive) history.back();
}

function renderStudioSectionCards() {
  studioSectionGrid.replaceChildren();
  STUDIO_SECTION_OPTIONS.forEach((section) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "studio-section-card";
    const title = document.createElement("strong");
    const description = document.createElement("small");
    title.textContent = section.label;
    description.textContent = section.description;
    button.append(title, description);
    button.addEventListener("click", () => openStudioSection(section.value));
    studioSectionGrid.append(button);
  });
}

function readState() {
  return {
    studioSection:value("studio-section"), scenarioMode:value("scenario-mode"), scene:value("scene"), customScene:value("custom-scene"), customSceneDetails:value("custom-scene-details"),
    city:value("city"), time:value("time"), mode:"selfie", poseFamily:value("pose-family"), pose:value("pose"),
    carSeat:value("car-seat"), clothing:value("clothing"), clothingCustom:value("clothing-custom"),
    fabric:value("fabric"), fabricWeight:value("fabric-weight"), ironState:value("iron-state"), wearState:value("wear-state"),
    clothingFit:value("clothing-fit"), hair:value("hair"), skin:value("skin"), expression:value("expression"),
    composition:value("composition"), selfieAngle:value("selfie-angle"), messiness:value("messiness"),
    lighting:value("lighting"), bedroomWindow:value("bedroom-window"), identityNotes:value("identity-notes"),
    environmentNote:value("environment-note"), placeState:value("place-state"), peopleDensity:value("people-density"),
    subjectMoment:value("subject-moment"), interactionObject:value("interaction-object"),
    sceneProfile:value("scene-profile"), accessoryProfile:value("accessory-profile"), accessoryDetail:value("accessory-detail"),
    objectProfile:value("object-profile"), hasReference,
    postProcessing:postProcessingInputs.filter((input) => input.checked).map((input) => input.value),
    groupMode:value("group-mode"), groupCount:value("group-count"), cameraHolder:value("camera-holder"), groupArrangement:value("group-arrangement"), groupInteraction:value("group-interaction"), groupAutoFix:value("group-auto-fix"),
    captureMode:value("capture-mode"), accidentalTrigger:value("accidental-trigger"), accidentalDevice:value("accidental-device"), accidentalPhonePosition:value("accidental-position"), accidentalMotion:value("accidental-motion"), accidentalTilt:value("accidental-tilt"), accidentalFocus:value("accidental-focus"), accidentalExposure:value("accidental-exposure"), accidentalIntensity:value("accidental-intensity"),
    ...readAutoRealismUiState()
  };
}

function normalizeEnhancedState(rawState = {}) {
  const studioState = normalizeStudioSectionState({ ...REALISM_DEFAULTS, ...AUTO_REALISM_DEFAULTS, ...rawState });
  const scenarioState = normalizeScenarioState(studioState);
  const base = normalizeState(scenarioState);
  const core = resolveRealismCoreState(base);
  const coreNormalized = normalizeState(core.state);
  const coreState = { ...coreNormalized, ...core.state };
  const advanced = resolveAdvancedRealismState(coreState);
  const finalNormalized = normalizeState(advanced.state);
  const suiteState = normalizeAutoRealismState({ ...finalNormalized, ...advanced.state });
  const groupState = normalizeGroupSelfieState(suiteState);
  const accidentalState = normalizeAccidentalState(groupState);
  const postProcessingState = normalizePostProcessingState(accidentalState);
  return {
    state:{ ...suiteState, ...groupState, ...accidentalState, ...postProcessingState },
    conflicts:[...core.conflicts, ...advanced.conflicts]
  };
}

function buildEnhancedPack(rawState = {}) {
  const { state, conflicts } = normalizeEnhancedState(rawState);
  const base = buildPromptPack(state);
  const coreSections = buildRealismCoreSections(base.state, conflicts).join("\n\n");
  const advancedSections = buildAdvancedRealismSections(base.state, conflicts).join("\n\n");
  const phoneAnchor = "\n\n[PHONE REALISM]";
  const enriched = base.positive.includes(phoneAnchor)
    ? base.positive.replace(phoneAnchor, `\n\n${coreSections}\n\n${advancedSections}${phoneAnchor}`)
    : `${base.positive}\n\n${coreSections}\n\n${advancedSections}`;
  const optimized = optimizePrompt(enriched);
  const negative = [...new Set([
    ...base.negative.split(/,\s*/),
    ...REALISM_CORE_NEGATIVE_RULES,
    ...ADVANCED_REALISM_NEGATIVE_RULES
  ])].join(", ");
  const risk = evaluateRealismRisk(base.state, conflicts);
  const suite = applyAutoRealismSuite({ positive:optimized.prompt, negative, state:{ ...base.state, ...state }, risk, conflicts });
  const group = buildGroupSelfieEnhancement(state);
  const accidental = buildAccidentalCaptureEnhancement(state);
  const scenario = buildScenarioLock(state);
  const studio = buildStudioSectionLock(state);
  const postProcessing = buildPostProcessingEnhancement(state);
  const baseWithDevice = applyAccidentalDeviceAuthority(suite.positive, accidental.state);
  const scenarioPositive = `${baseWithDevice}\n\n${studio.positive}`;
  const groupPositive = group.positive ? `${scenarioPositive}\n\n${group.positive}` : scenarioPositive;
  const capturePositive = accidental.positive ? `${groupPositive}\n\n${accidental.positive}` : groupPositive;
  const enhancedPositive = postProcessing.positive ? `${capturePositive}\n\n${postProcessing.positive}` : capturePositive;
  const groupNegative = [...new Set([...suite.negative.split(/,\s*/), ...studio.negative, ...group.negative, ...accidental.negative, ...postProcessing.negative])].join(", ");
  return {
    ...base,
    state:{ ...suite.state, postProcessing:postProcessing.state.postProcessing },
    positive:enhancedPositive,
    negative:groupNegative,
    qa:[
      ...base.qa,
      ...realismCoreQaItems(base.state, conflicts),
      ...advancedRealismQaItems(base.state, conflicts, optimized.stats),
      ...suite.qa, ...studio.qa, ...group.qa, ...accidental.qa, ...postProcessing.qa
    ],
    conflicts,
    optimizerStats:optimized.stats,
    risk,
    suiteMeta:suite.meta, groupScore:group.score
  };
}

function syncUiToNormalizedState(state) {
  const pairs = [
    [sceneSelect,state.scene],[poseFamilySelect,state.poseFamily],[poseSelect,state.pose],[carSeatSelect,state.carSeat],
    [selfieAngleSelect,state.selfieAngle],[compositionSelect,state.composition],[clothingSelect,state.clothing],
    [fabricSelect,state.fabric],[fabricWeightSelect,state.fabricWeight],[ironStateSelect,state.ironState],
    [wearStateSelect,state.wearState],[clothingFitSelect,state.clothingFit],[hairSelect,state.hair],[skinSelect,state.skin],
    [expressionSelect,state.expression],[lightingSelect,state.lighting],[bedroomWindowSelect,state.bedroomWindow],
    [placeStateSelect,state.placeState],[peopleDensitySelect,state.peopleDensity],[subjectMomentSelect,state.subjectMoment],
    [sceneProfileSelect,state.sceneProfile],[accessoryProfileSelect,state.accessoryProfile],[objectProfileSelect,state.objectProfile]
  ];
  pairs.forEach(([select, selectedValue]) => {
    if (select && [...select.options].some((option) => option.value === selectedValue)) select.value = selectedValue;
  });
  const selectedEffects = new Set(state.postProcessing || []);
  postProcessingInputs.forEach((input) => { input.checked = selectedEffects.has(input.value); });
  postProcessingStatus.textContent = selectedEffects.size
    ? `${[...selectedEffects].map((value) => inputEffectLabel(value)).join(" + ")} · ${selectedEffects.size}/2`
    : "بدون معالجة إضافية";
}

function inputEffectLabel(value) {
  return postProcessingInputs.find((input) => input.value === value)?.parentElement?.innerText?.trim() || value;
}

function refreshPostProcessingSelection() {
  const normalized = normalizePostProcessingState({ postProcessing:postProcessingInputs.filter((input) => input.checked).map((input) => input.value) });
  const selected = new Set(normalized.postProcessing);
  postProcessingInputs.forEach((input) => { input.checked = selected.has(input.value); });
  postProcessingStatus.textContent = selected.size
    ? `${[...selected].map((value) => inputEffectLabel(value)).join(" + ")} · ${selected.size}/2`
    : "بدون معالجة إضافية";
}

function populateClothingPhysics(preferred = {}) {
  const clothing = clothingSelect.value;
  populateSelect(fabricSelect, getFabricOptions(clothing), preferred.fabric || fabricSelect.value || DEFAULT_STATE.fabric);
  populateSelect(fabricWeightSelect, getFabricWeightOptions(clothing, fabricSelect.value), preferred.fabricWeight || fabricWeightSelect.value || DEFAULT_STATE.fabricWeight);
  populateSelect(ironStateSelect, getIronStateOptions(clothing), preferred.ironState || ironStateSelect.value || DEFAULT_STATE.ironState);
  populateSelect(wearStateSelect, getWearStateOptions(clothing), preferred.wearState || wearStateSelect.value || DEFAULT_STATE.wearState);
  populateSelect(clothingFitSelect, getClothingFitOptions(clothing), preferred.clothingFit || clothingFitSelect.value || DEFAULT_STATE.clothingFit);
}

function refreshDynamicFields() {
  const studioSection = studioSectionSelect.value || STUDIO_SECTION_DEFAULTS.studioSection;
  const studioOption = STUDIO_SECTION_OPTIONS.find((item) => item.value === studioSection) || STUDIO_SECTION_OPTIONS[0];
  const studioResolved = normalizeStudioSectionState({ studioSection, scene:value("scene"), customScene:value("custom-scene") });
  scenarioModeSelect.value = studioResolved.scenarioMode;
  groupModeSelect.value = studioResolved.groupMode;
  captureModeSelect.value = studioResolved.captureMode;
  const scenarioMode = studioResolved.scenarioMode;
  const allowedSceneOptions = getScenarioSceneOptions(scenarioMode);
  populateSelect(sceneSelect, allowedSceneOptions, studioResolved.scene);
  studioSectionDescription.textContent = studioOption.description;
  activeStudioSectionTitle.textContent = studioOption.label;
  studioSectionStatus.textContent = `${studioOption.label} يعمل · بقية الأقسام مخفية ومقفلة`;
  const scene = sceneSelect.value || allowedSceneOptions[0]?.value || DEFAULT_STATE.scene;
  const time = value("time") || DEFAULT_STATE.time;
  const custom = isCustomScene(scene);
  const groupState = normalizeGroupSelfieState(readState());
  groupSelfieFields.hidden = studioSection !== "group";
  sceneField.hidden = studioSection !== "group";
  const accidentalState = normalizeAccidentalState(readState());
  accidentalCaptureFields.hidden = studioSection !== "accidental";
  if (groupScorePreview) { const groupRisk = evaluateGroupRealism(groupState); groupScorePreview.textContent = `${groupRisk.score}/100 · ${groupRisk.level}`; }
  customSceneField.hidden = !custom;
  customSceneDetailsField.hidden = !custom;
  if (sceneProfileField) sceneProfileField.hidden = !custom;

  populateSelect(poseFamilySelect, getPoseFamilyOptions(scene), poseFamilySelect.value || DEFAULT_STATE.poseFamily);
  populateSelect(poseSelect, getPoseOptions(scene, poseFamilySelect.value), poseSelect.value || DEFAULT_STATE.pose);

  const car = isCarScene(scene);
  carSeatField.hidden = !car;
  if (car) populateSelect(carSeatSelect, getCarSeatOptions(scene, poseSelect.value), carSeatSelect.value || DEFAULT_STATE.carSeat);
  else carSeatSelect.replaceChildren();

  populateSelect(selfieAngleSelect, getSelfieAngleOptions(poseSelect.value), selfieAngleSelect.value || DEFAULT_STATE.selfieAngle);
  populateSelect(compositionSelect, getCompositionOptions(poseSelect.value), compositionSelect.value || DEFAULT_STATE.composition);
  populateSelect(clothingSelect, getClothingOptions(scene), clothingSelect.value || DEFAULT_STATE.clothing);
  populateClothingPhysics();
  populateSelect(lightingSelect, getLightingOptions(scene, time), lightingSelect.value || DEFAULT_STATE.lighting);

  const bedroom = isBedroomScene(scene);
  bedroomWindowField.hidden = !bedroom;
  if (bedroom) populateSelect(bedroomWindowSelect, getCompatibleBedroomWindowOptions(time, lightingSelect.value), bedroomWindowSelect.value || DEFAULT_STATE.bedroomWindow);
  else bedroomWindowSelect.replaceChildren();

  const { state:normalized, conflicts } = normalizeEnhancedState(readState());
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
  populateClothingPhysics(normalized);
  populateSelect(lightingSelect, getLightingOptions(normalized.scene, normalized.time), normalized.lighting);
  if (isBedroomScene(normalized.scene)) populateSelect(bedroomWindowSelect, getCompatibleBedroomWindowOptions(normalized.time, normalized.lighting), normalized.bedroomWindow);

  syncUiToNormalizedState(normalized);
  const risk = evaluateRealismRisk(normalized, conflicts);
  if (realismScorePreview) realismScorePreview.textContent = `${risk.score}/100 · ${risk.level}`;
  const pack = buildEnhancedPack(normalized);
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
  const conflict = pack.conflicts.length ? ` · صُحح ${pack.conflicts.length} تعارض واقعي تلقائياً` : " · فحص التعارضات سليم";
  let base;
  if (isTextRoomReference(pack.state.scene)) base = hasReference ? "هوية واحدة مثبتة؛ وصف الغرفة سياق اختياري ولا يلزم IMAGE B." : "الغرفة وصف نصي مساعد؛ أرفق صورة هوية واحدة فقط عند الاستخدام.";
  else if (isCarScene(pack.state.scene)) base = hasReference ? "تم تثبيت الهوية وموضع الجلوس داخل السيارة؛ الخلفية غير إجبارية." : "موضع الجلوس داخل السيارة مقفل؛ أرفق صورة هوية واحدة فقط عند الاستخدام.";
  else if (isCustomScene(pack.state.scene)) {
    if (!pack.state.customScene) base = "اكتب وصف المشهد المخصص أولاً؛ المحرك لن يخترع المكان بدلاً منك.";
    else base = hasReference ? "تم تثبيت الهوية والمشهد المخصص؛ التفاصيل الثانوية مرتبطة بزاوية السيلفي." : "المشهد المخصص جاهز؛ أرفق صورة هوية واحدة فقط عند الاستخدام.";
  } else base = hasReference ? "تم تثبيت مرجع الهوية الواحد؛ الخلفية غير إجبارية." : "البرومبت جاهز؛ أرفق صورة هوية واحدة فقط عند الاستخدام.";
  return `${base}${conflict} · مؤشر الواقعية ${pack.risk.score}/100 · ${pack.suiteMeta.generator}/${pack.suiteMeta.compression}`;
}

function renderPrompt() {
  refreshDynamicFields();
  const pack = buildEnhancedPack(readState());
  syncUiToNormalizedState(pack.state);
  if (realismScorePreview) realismScorePreview.textContent = `${pack.risk.score}/100 · ${pack.risk.level}`;
  const config = wikiConfig(pack.state);
  const cachedGuidance = wikiPromptService.getCachedGuidance(config);
  positivePrompt.value = composeWikiFirstPrompt(pack.positive, cachedGuidance);
  negativePrompt.value = pack.negative;
  resultMeta.textContent = `${pack.template.title} · Xiaomi 15 Ultra Front · AUTO REALISM · ${pack.suiteMeta.generator} · ${pack.suiteMeta.compression} · ${pack.risk.score}/100 · ${pack.state.time === "night" ? "ليلي" : "نهاري"}`;
  if (isGroupSelfie(pack.state)) resultMeta.textContent += ` · GROUP ${pack.state.groupCount} · ${pack.groupScore.score}/100`;
  if (isAccidentalCapture(pack.state)) resultMeta.textContent += ` · ACCIDENTAL CAPTURE · ${pack.state.accidentalDevice === "iphone" ? "iPhone 15 Pro Max" : "Xiaomi 15 Ultra"}`;
  renderQa([...pack.qa, { label:"WikiPrompt", value:cachedGuidance ? "هو أساس البرومبت الحالي" : "جارٍ تحميل أساس الواقعية" }]);
  setStatus(`${localStatus(pack)} · ${cachedGuidance ? wikiStatusText({ state:"cache" }) : "🟡 WikiPrompt: جارٍ الفحص"}`);

  const syncId = ++wikiSyncId;
  void wikiPromptService.sync(config).then((guidance) => {
    if (syncId !== wikiSyncId) return;
    const status = wikiPromptService.getStatus();
    positivePrompt.value = composeWikiFirstPrompt(pack.positive, guidance);
    renderQa([...pack.qa, {
      label:"WikiPrompt",
      value:guidance ? (status.state === "synced-fallback" ? "الأساس الواقعي مضاف عبر النسخة الاحتياطية" : "الأساس الواقعي مضاف أول البرومبت") : wikiStatusText(status).replace(/^\S+\sWikiPrompt:\s*/, "")
    }]);
    setStatus(`${localStatus(pack)} · ${wikiStatusText(status)}`);
  });
}

function clearReference() {
  if (referenceObjectUrl) URL.revokeObjectURL(referenceObjectUrl);
  referenceObjectUrl = ""; hasReference = false; referenceImage.value = "";
  referencePreview.removeAttribute("src"); referencePreviewWrap.hidden = true;
}
function setReference(file) {
  clearReference();
  if (!file) return;
  if (!file.type.startsWith("image/")) { setStatus("اختر ملف صورة صالحاً فقط."); return; }
  referenceObjectUrl = URL.createObjectURL(file); referencePreview.src = referenceObjectUrl;
  referencePreviewWrap.hidden = false; hasReference = true;
  setStatus("تمت معاينة مرجع الهوية محلياً؛ لم يتم رفعه أو حفظه.");
}

async function copyText(text, label) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const fallback = document.createElement("textarea"); fallback.value = text; fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed"; fallback.style.opacity = "0"; document.body.append(fallback); fallback.select(); document.execCommand("copy"); fallback.remove();
  }
  setStatus(`${label} تم نسخه. · ${wikiStatusText()}`);
}

function downloadPrompt() {
  const pack = ["WIKIPROMPT SELFIE STUDIO · AUTO REALISM · ADVANCED REALISM", "", "POSITIVE PROMPT", positivePrompt.value, "", "NEGATIVE PROMPT", negativePrompt.value].join("\n");
  const blob = new Blob([pack], { type:"text/plain;charset=utf-8" });
  const href = URL.createObjectURL(blob); const link = document.createElement("a");
  link.href = href; link.download = "wikiprompt-selfie-auto-realism.txt"; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(href);
  setStatus(`تم تنزيل ملف البرومبت. · ${wikiStatusText()}`);
}

function resetForm() {
  form.reset(); sceneSelect.value = DEFAULT_STATE.scene;
  studioSectionSelect.value = STUDIO_SECTION_DEFAULTS.studioSection;
  document.querySelector("#city").value = DEFAULT_STATE.city; document.querySelector("#time").value = DEFAULT_STATE.time;
  document.querySelector("#messiness").value = DEFAULT_STATE.messiness;
  placeStateSelect.value = REALISM_DEFAULTS.placeState; peopleDensitySelect.value = REALISM_DEFAULTS.peopleDensity; subjectMomentSelect.value = REALISM_DEFAULTS.subjectMoment;
  sceneProfileSelect.value = REALISM_DEFAULTS.sceneProfile; accessoryProfileSelect.value = REALISM_DEFAULTS.accessoryProfile; objectProfileSelect.value = REALISM_DEFAULTS.objectProfile;
  Object.entries({
    "group-mode":GROUP_SELFIE_DEFAULTS.groupMode, "group-count":GROUP_SELFIE_DEFAULTS.groupCount, "camera-holder":GROUP_SELFIE_DEFAULTS.cameraHolder,
    "group-arrangement":GROUP_SELFIE_DEFAULTS.groupArrangement, "group-interaction":GROUP_SELFIE_DEFAULTS.groupInteraction, "group-auto-fix":GROUP_SELFIE_DEFAULTS.groupAutoFix,
    "capture-mode":ACCIDENTAL_DEFAULTS.captureMode, "accidental-trigger":ACCIDENTAL_DEFAULTS.accidentalTrigger, "accidental-device":ACCIDENTAL_DEFAULTS.accidentalDevice,
    "accidental-position":ACCIDENTAL_DEFAULTS.accidentalPhonePosition, "accidental-motion":ACCIDENTAL_DEFAULTS.accidentalMotion, "accidental-tilt":ACCIDENTAL_DEFAULTS.accidentalTilt,
    "accidental-focus":ACCIDENTAL_DEFAULTS.accidentalFocus, "accidental-exposure":ACCIDENTAL_DEFAULTS.accidentalExposure, "accidental-intensity":ACCIDENTAL_DEFAULTS.accidentalIntensity,
    "auto-realism":AUTO_REALISM_DEFAULTS.autoRealism,
    "realism-preset":AUTO_REALISM_DEFAULTS.realismPreset,
    "generator-profile":AUTO_REALISM_DEFAULTS.generatorProfile,
    "prompt-compression":AUTO_REALISM_DEFAULTS.promptCompression,
    "continuity-mode":AUTO_REALISM_DEFAULTS.continuityMode,
    "variation-mode":AUTO_REALISM_DEFAULTS.variationMode,
    "lock-identity":AUTO_REALISM_DEFAULTS.lockIdentity,
    "lock-scene":AUTO_REALISM_DEFAULTS.lockScene,
    "lock-clothing":AUTO_REALISM_DEFAULTS.lockClothing,
    "lock-lighting":AUTO_REALISM_DEFAULTS.lockLighting,
    "lock-expression":AUTO_REALISM_DEFAULTS.lockExpression
  }).forEach(([id, selected]) => { const el = document.querySelector(`#${id}`); if (el) el.value = selected; });
  postProcessingInputs.forEach((input) => { input.checked = false; });
  refreshPostProcessingSelection();
  clearReference(); refreshDynamicFields(); persistSelectedScene(); renderPrompt();
}

function initializeStaticSelects() {
  groupModeSelect.value = GROUP_SELFIE_DEFAULTS.groupMode;
  captureModeSelect.value = ACCIDENTAL_DEFAULTS.captureMode;
  populateSelect(studioSectionSelect, STUDIO_SECTION_OPTIONS, STUDIO_SECTION_DEFAULTS.studioSection);
  populateSelect(sceneSelect, getScenarioSceneOptions("custom"), "custom");
  populateSelect(hairSelect, getHairOptions(), DEFAULT_STATE.hair);
  populateSelect(skinSelect, getSkinOptions(), DEFAULT_STATE.skin);
  populateSelect(expressionSelect, getExpressionOptions(), DEFAULT_STATE.expression);
  populateSelect(placeStateSelect, getPlaceStateOptions(), REALISM_DEFAULTS.placeState);
  populateSelect(peopleDensitySelect, getPeopleDensityOptions(), REALISM_DEFAULTS.peopleDensity);
  populateSelect(subjectMomentSelect, getSubjectMomentOptions(), REALISM_DEFAULTS.subjectMoment);
  populateSelect(sceneProfileSelect, getSceneProfileOptions(), REALISM_DEFAULTS.sceneProfile);
  populateSelect(accessoryProfileSelect, getAccessoryProfileOptions(), REALISM_DEFAULTS.accessoryProfile);
  populateSelect(objectProfileSelect, getObjectProfileOptions(), REALISM_DEFAULTS.objectProfile);
  populateSelect(groupCountSelect, GROUP_COUNT_OPTIONS, GROUP_SELFIE_DEFAULTS.groupCount);
  populateSelect(cameraHolderSelect, CAMERA_HOLDER_OPTIONS, GROUP_SELFIE_DEFAULTS.cameraHolder);
  populateSelect(groupArrangementSelect, GROUP_ARRANGEMENT_OPTIONS, GROUP_SELFIE_DEFAULTS.groupArrangement);
  populateSelect(groupInteractionSelect, GROUP_INTERACTION_OPTIONS, GROUP_SELFIE_DEFAULTS.groupInteraction);
  populateSelect(accidentalTriggerSelect, ACCIDENTAL_TRIGGER_OPTIONS, ACCIDENTAL_DEFAULTS.accidentalTrigger);
  populateSelect(accidentalDeviceSelect, ACCIDENTAL_DEVICE_OPTIONS, ACCIDENTAL_DEFAULTS.accidentalDevice);
  populateSelect(accidentalPositionSelect, ACCIDENTAL_POSITION_OPTIONS, ACCIDENTAL_DEFAULTS.accidentalPhonePosition);
  populateSelect(accidentalMotionSelect, ACCIDENTAL_MOTION_OPTIONS, ACCIDENTAL_DEFAULTS.accidentalMotion);
  populateSelect(accidentalTiltSelect, ACCIDENTAL_TILT_OPTIONS, ACCIDENTAL_DEFAULTS.accidentalTilt);
  populateSelect(accidentalFocusSelect, ACCIDENTAL_FOCUS_OPTIONS, ACCIDENTAL_DEFAULTS.accidentalFocus);
  populateSelect(accidentalExposureSelect, ACCIDENTAL_EXPOSURE_OPTIONS, ACCIDENTAL_DEFAULTS.accidentalExposure);
  populateSelect(accidentalIntensitySelect, ACCIDENTAL_INTENSITY_OPTIONS, ACCIDENTAL_DEFAULTS.accidentalIntensity);
}

referenceImage.addEventListener("change", (event) => setReference(event.target.files?.[0]));
removeReferenceButton.addEventListener("click", () => { clearReference(); setStatus("أزيلت معاينة المرجع من الجهاز."); });
sceneSelect.addEventListener("change", () => { persistSelectedScene(); refreshDynamicFields(); });
studioSectionSelect.addEventListener("change", () => { persistSelectedScene(); refreshDynamicFields(); });
backToSectionsButton.addEventListener("click", returnToStudioHub);
window.addEventListener("popstate", () => closeStudioSection());
postProcessingInputs.forEach((input) => input.addEventListener("change", () => { refreshPostProcessingSelection(); refreshDynamicFields(); }));
["time","pose-family","pose","car-seat","lighting","clothing","fabric","composition","selfie-angle","place-state","people-density","subject-moment","scene-profile","accessory-profile","object-profile","group-mode","group-count","camera-holder","group-arrangement","group-interaction","group-auto-fix","capture-mode","accidental-trigger","accidental-device","accidental-position","accidental-motion","accidental-tilt","accidental-focus","accidental-exposure","accidental-intensity"].forEach((id) => {
  document.querySelector(`#${id}`)?.addEventListener("change", refreshDynamicFields);
});
form.addEventListener("submit", (event) => { event.preventDefault(); renderPrompt(); resultPanel.hidden = false; resultPanel.scrollIntoView({ behavior:"smooth", block:"start" }); });
document.querySelector("#reset-form").addEventListener("click", resetForm);
document.querySelector("#copy-positive").addEventListener("click", () => copyText(positivePrompt.value, "البرومبت"));
document.querySelector("#copy-negative").addEventListener("click", () => copyText(negativePrompt.value, "البرومبت السلبي"));
document.querySelector("#copy-pack").addEventListener("click", () => copyText(`POSITIVE PROMPT\n${positivePrompt.value}\n\nNEGATIVE PROMPT\n${negativePrompt.value}`, "الحزمة الكاملة"));
document.querySelector("#download-prompt").addEventListener("click", downloadPrompt);
bindAutoRealismSuite(renderPrompt);

initializeStaticSelects(); renderStudioSectionCards(); restoreSelectedScene(); refreshDynamicFields(); renderPrompt(); closeStudioSection();
