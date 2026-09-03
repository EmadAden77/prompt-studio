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

// Canonical V3 does not use WikiPrompt prompt-body injection. Keep the legacy
// service untouched in normal/default legacy mode; suppress async legacy output
// rewrites only while the Canonical V3 flag is active.
if (engineSelection.engine === CANONICAL_V3_ENGINE) {
  wikiPromptService.sync = () => Promise.resolve("");
}

const value = (id) => document.querySelector(`#${id}`)?.value ?? "";

function activeSection() {
  return value("studio-section");
}

function canonicalActiveForCurrentSection() {
  return shouldUseCanonicalV3(activeSection(), engineSelection);
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
  state.hasReference = Boolean(document.querySelector("#reference-image")?.files?.length)
    || document.querySelector("#reference-preview-wrap")?.hidden === false;

  return state;
}

function setStatus(message) {
  const node = document.querySelector("#form-status");
  if (node) node.textContent = message;
}

function renderCanonicalOutput({ reveal = true } = {}) {
  if (!canonicalActiveForCurrentSection()) return false;

  const rawState = readFormState();
  const output = buildCanonicalV3UserOutput(rawState, rawState.sceneFacts);
  const positive = document.querySelector("#positive-prompt");
  const negative = document.querySelector("#negative-prompt");
  const json = document.querySelector("#json-prompt");
  const meta = document.querySelector("#result-meta");
  const qa = document.querySelector("#qa-list");
  const panel = document.querySelector("#result-panel");

  if (positive) positive.value = output.prompt;
  if (negative) negative.value = "";
  if (json) json.value = JSON.stringify(output.canonical, null, 2);
  if (qa) qa.replaceChildren();
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
  queueMicrotask(() => renderCanonicalOutput({ reveal:false }));
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

// The legacy UI still owns field population and controls. If one of its
// automatic render callbacks fires while Canonical V3 output is visible,
// restore Canonical V3 at the end of the same event turn.
document.addEventListener("change", scheduleCanonicalRefresh);
document.addEventListener("input", scheduleCanonicalRefresh);
document.addEventListener("click", (event) => {
  const id = event.target?.closest?.("button")?.id || "";
  if (!canonicalActiveForCurrentSection()) return;

  if (id === "copy-pack") {
    event.preventDefault();
    event.stopImmediatePropagation();
    void copyCanonicalPrompt();
    return;
  }
  if (id === "download-prompt") {
    event.preventDefault();
    event.stopImmediatePropagation();
    downloadCanonicalPrompt();
    return;
  }
  scheduleCanonicalRefresh();
}, true);

await import("../physics-app-v7.js?v=20260903-json-clean2");

// Exposed only for lightweight manual diagnostics from the browser console.
globalThis.__PROMPT_STUDIO_ENGINE__ = Object.freeze({
  engine: engineSelection.engine,
  source: engineSelection.source,
  supportedSection: () => canonicalActiveForCurrentSection()
});
