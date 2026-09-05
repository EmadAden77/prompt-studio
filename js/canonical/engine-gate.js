import { wikiPromptService } from "../services/wikiPromptService.js";
import { STREET_MOODS } from "../data.js";
import { buildCanonicalV3UserOutput } from "./canonical-v3-pipeline.js";
import {
  CANONICAL_V3_ENGINE,
  ENGINE_STORAGE_KEY,
  canonicalIntentForSection,
  resolvePromptEngineSelection,
  shouldUseCanonicalV3
} from "./engine-feature-flag.js";

const GROUP_KIND_OPTIONS = Object.freeze([
  { value:"friends", label:"أصدقاء" },
  { value:"family", label:"أقارب" },
  { value:"work", label:"زملاء عمل" },
  { value:"team", label:"فريق رياضي" },
  { value:"kashta", label:"كشتة بر" }
]);
const GROUP_VIBE_OPTIONS = Object.freeze([
  { value:"casual", label:"لقطة عادية" },
  { value:"laughing", label:"ضحك" },
  { value:"win", label:"احتفال فوز" },
  { value:"eid", label:"تهنئة عيد" },
  { value:"meal", label:"بعد عزومة" }
]);

function readStoredEngine() {
  try { return localStorage.getItem(ENGINE_STORAGE_KEY) || ""; }
  catch { return ""; }
}

const engineSelection = resolvePromptEngineSelection({
  search: globalThis.location?.search || "",
  storageValue: readStoredEngine()
});

const value = (id) => document.querySelector(`#${id}`)?.value ?? "";

function activeSection() {
  return value("studio-section");
}

function canonicalActiveForCurrentSection() {
  return shouldUseCanonicalV3(activeSection(), engineSelection);
}

const legacyWikiSync = wikiPromptService.sync.bind(wikiPromptService);
let legacyAppReady = false;
if (engineSelection.engine === CANONICAL_V3_ENGINE) {
  wikiPromptService.sync = (...args) => {
    if (!legacyAppReady || canonicalActiveForCurrentSection()) return Promise.resolve("");
    return legacyWikiSync(...args);
  };
}

function readFormState() {
  const form = document.querySelector("#prompt-form");
  const state = {};
  if (form) {
    const data = new FormData(form);
    for (const [key, entry] of data.entries()) {
      const next = typeof entry === "string" ? entry : "";
      if (Object.prototype.hasOwnProperty.call(state, key)) {
        state[key] = Array.isArray(state[key]) ? [...state[key], next] : [state[key], next];
      } else {
        state[key] = next;
      }
    }
  }

  const section = activeSection();
  const intentType = canonicalIntentForSection(section);
  if (intentType) state.intentType = intentType;
  state.studioSection = section;
  state.identityNotes = value("identity-notes");
  state.environmentNote = value("environment-note");
  state.hasReference = Boolean(document.querySelector("#reference-image")?.files?.length)
    || document.querySelector("#reference-preview-wrap")?.hidden === false;

  return state;
}

function setStatus(message) {
  const node = document.querySelector("#form-status");
  if (node) node.textContent = message;
}

function setCanonicalOutputLabels(active) {
  const jsonField = document.querySelector('label[for="json-prompt"]');
  const title = jsonField?.querySelector(":scope > span");
  const help = jsonField?.querySelector(":scope > small");
  const copyTop = document.querySelector("#copy-json");
  const copyOutput = document.querySelector("#copy-json-output");
  const download = document.querySelector("#download-json");

  if (active) {
    if (title) title.textContent = "FINAL IMAGE PROMPT · CANONICAL V3";
    if (help) help.textContent = "OpenAI Image Adapter output from the resolved frozen Canonical V3 state.";
    if (copyTop) copyTop.textContent = "نسخ البرومبت";
    if (copyOutput) copyOutput.textContent = "نسخ البرومبت";
    if (download) download.textContent = "تنزيل TXT";
  }
}

function renderCanonicalOutput({ reveal = true } = {}) {
  if (!canonicalActiveForCurrentSection()) return false;

  const rawState = readFormState();
  const output = buildCanonicalV3UserOutput(rawState, rawState.sceneFacts);
  const positive = document.querySelector("#positive-prompt");
  const negative = document.querySelector("#negative-prompt");
  const visibleOutput = document.querySelector("#json-prompt");
  const meta = document.querySelector("#result-meta");
  const qa = document.querySelector("#qa-list");
  const panel = document.querySelector("#result-panel");

  if (positive) positive.value = output.prompt;
  if (negative) negative.value = "";
  if (visibleOutput) visibleOutput.value = output.prompt;
  if (qa) qa.replaceChildren();
  setCanonicalOutputLabels(true);
  if (meta) {
    meta.textContent = `ENGINE CANONICAL V3 · ${output.canonical.intent.type.toUpperCase()} · OpenAI Image Adapter · ${output.prompt.trim().split(/\s+/u).filter(Boolean).length} words`;
  }
  setStatus("Canonical V3 active · resolved canonical state and adapter prompt are ready.");

  if (reveal && panel) {
    panel.hidden = false;
    panel.scrollIntoView({ behavior:"smooth", block:"start" });
  }
  return true;
}

function scheduleCanonicalRefresh() {
  const panel = document.querySelector("#result-panel");
  if (!canonicalActiveForCurrentSection() || !panel || panel.hidden) return;
  setTimeout(() => renderCanonicalOutput({ reveal:false }), 0);
}

async function copyCanonicalPrompt() {
  const text = document.querySelector("#positive-prompt")?.value || "";
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
  setStatus("Canonical V3 prompt copied.");
}

function downloadCanonicalPrompt() {
  const text = document.querySelector("#positive-prompt")?.value || "";
  const blob = new Blob([text], { type:"text/plain;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = "canonical-v3-image-prompt.txt";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
  setStatus("Canonical V3 prompt downloaded.");
}

function makeSelectField(id, name, titleText, options) {
  const field = document.createElement("label");
  field.className = "field";
  field.id = `${id}-field`;
  field.htmlFor = id;
  const title = document.createElement("span");
  title.textContent = titleText;
  const select = document.createElement("select");
  select.id = id;
  select.name = name;
  for (const option of options) {
    const node = document.createElement("option");
    node.value = option.value;
    node.textContent = option.label;
    select.append(node);
  }
  field.append(title, select);
  return { field, select };
}

function mountGroupControls() {
  if (document.querySelector("#group-kind")) return;
  const grid = document.querySelector("#group-selfie-fields .form-grid");
  if (!grid) return;
  const kind = makeSelectField("group-kind", "groupKind", "نوع المجموعة", GROUP_KIND_OPTIONS);
  const vibe = makeSelectField("group-vibe", "groupVibe", "أجواء اللقطة", GROUP_VIBE_OPTIONS);
  const first = grid.firstElementChild;
  if (first) {
    grid.insertBefore(vibe.field, first);
    grid.insertBefore(kind.field, vibe.field);
  } else {
    grid.append(kind.field, vibe.field);
  }
  kind.select.value = "friends";
  vibe.select.value = "casual";
  kind.select.addEventListener("change", scheduleCanonicalRefresh);
  vibe.select.addEventListener("change", scheduleCanonicalRefresh);
}

function mountStreetMoodControls() {
  if (document.querySelector("#street-mood")) return;
  const contextGrid = document.querySelector("#context-title")?.closest("section")?.querySelector(".form-grid");
  if (!contextGrid) return;

  const moodField = document.createElement("label");
  moodField.className = "field";
  moodField.id = "street-mood-field";
  moodField.htmlFor = "street-mood";
  const moodTitle = document.createElement("span");
  moodTitle.textContent = "مزاج الشارع";
  const moodSelect = document.createElement("select");
  moodSelect.id = "street-mood";
  moodSelect.name = "streetMood";

  const phase31Moods = [
    { value:"alley", label:"حارة شعبية" },
    { value:"construction", label:"حفريات" },
    { value:"bufia", label:"بوفية" }
  ];
  for (const option of [...STREET_MOODS, ...phase31Moods].filter((item, index, all) => all.findIndex((candidate) => candidate.value === item.value) === index)) {
    const node = document.createElement("option");
    node.value = option.value;
    node.textContent = option.label;
    moodSelect.append(node);
  }
  moodField.append(moodTitle, moodSelect);

  const hourField = document.createElement("label");
  hourField.className = "field";
  hourField.id = "street-hour-field";
  hourField.htmlFor = "street-hour";
  const hourTitle = document.createElement("span");
  hourTitle.textContent = "ساعة الشارع";
  const hourInput = document.createElement("input");
  hourInput.id = "street-hour";
  hourInput.name = "streetHour";
  hourInput.type = "number";
  hourInput.min = "0";
  hourInput.max = "23";
  hourInput.step = "1";
  hourField.append(hourTitle, hourInput);

  contextGrid.prepend(hourField);
  contextGrid.prepend(moodField);

  const sync = () => {
    const streetActive = activeSection() === "street" || value("scene") === "street";
    moodField.hidden = !streetActive;
    const auto = moodSelect.value === "auto";
    hourField.hidden = !streetActive || !auto;
    if (streetActive && auto) hourInput.value = String(new Date().getHours());
  };

  moodSelect.value = "auto";
  moodSelect.addEventListener("change", () => { sync(); scheduleCanonicalRefresh(); });
  document.querySelector("#studio-section")?.addEventListener("change", sync);
  document.querySelector("#scene")?.addEventListener("change", sync);
  sync();
}

document.addEventListener("submit", (event) => {
  if (event.target?.id !== "prompt-form" || !canonicalActiveForCurrentSection()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  renderCanonicalOutput();
}, true);

document.addEventListener("change", scheduleCanonicalRefresh);
document.addEventListener("input", scheduleCanonicalRefresh);
document.addEventListener("click", scheduleCanonicalRefresh);

document.addEventListener("click", (event) => {
  const id = event.target?.closest?.("button")?.id || "";
  if (!canonicalActiveForCurrentSection()) return;

  if (["copy-pack", "copy-json", "copy-json-output"].includes(id)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    void copyCanonicalPrompt();
    return;
  }
  if (["download-prompt", "download-json"].includes(id)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    downloadCanonicalPrompt();
  }
}, true);

await import("../physics-app-v7.js?v=20260903-json-clean2");
legacyAppReady = true;
mountGroupControls();
mountStreetMoodControls();

globalThis.__PROMPT_STUDIO_ENGINE__ = Object.freeze({
  engine: engineSelection.engine,
  source: engineSelection.source,
  supportedSection: () => canonicalActiveForCurrentSection()
});
