import { wikiPromptService } from "../services/wikiPromptService.js";
import { buildCanonicalV3UserOutput } from "./canonical-v3-pipeline.js";
import {
  CANONICAL_V3_ENGINE,
  ENGINE_STORAGE_KEY,
  canonicalIntentForSection,
  resolvePromptEngineSelection,
  shouldUseCanonicalV3
} from "./engine-feature-flag.js";

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

// Keep the WikiPrompt service fully intact for the default legacy path and for
// legacy-only sections. During Canonical V3 startup/output, suppress only the
// asynchronous legacy prompt rewrite that could overwrite adapter output.
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
  // A macrotask runs after legacy event handlers and their resolved Promise
  // microtasks, so the Canonical V3 adapter remains the final user-facing writer.
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

// Capture submit before the legacy application handler. Unsupported sections
// continue through the legacy path unchanged.
document.addEventListener("submit", (event) => {
  if (event.target?.id !== "prompt-form" || !canonicalActiveForCurrentSection()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  renderCanonicalOutput();
}, true);

// The legacy UI still owns field population and controls. Restore Canonical V3
// after those callbacks whenever its result panel is already visible.
document.addEventListener("change", scheduleCanonicalRefresh);
document.addEventListener("input", scheduleCanonicalRefresh);
document.addEventListener("click", scheduleCanonicalRefresh);

// Existing visible output controls keep their layout. In Canonical V3 mode they
// copy/download the adapter prompt rather than the legacy JSON/pack wrappers.
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

// Exposed only for lightweight manual diagnostics from the browser console.
globalThis.__PROMPT_STUDIO_ENGINE__ = Object.freeze({
  engine: engineSelection.engine,
  source: engineSelection.source,
  supportedSection: () => canonicalActiveForCurrentSection()
});
