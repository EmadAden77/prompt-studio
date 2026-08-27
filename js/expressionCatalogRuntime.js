import { EXPRESSION_OPTIONS } from "./data/expressionsData.js";

const STORAGE_KEY = "ai-selfie-prompt-studio:expanded-expression";
const SELECT_ID = "expressionSelect";
const installFlag = Symbol.for("promptStudio.expressionCatalogRuntime.installed");

function validId(id) {
  return EXPRESSION_OPTIONS.some((item) => item.id === id);
}

function readStoredId() {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    return validId(id) ? id : null;
  } catch {
    return null;
  }
}

function writeStoredId(id) {
  if (!validId(id)) return;
  try { localStorage.setItem(STORAGE_KEY, id); } catch {}
}

function buildOptions(select) {
  const previous = select.value;
  const desired = readStoredId() || (validId(previous) ? previous : "relaxed");

  const fragment = document.createDocumentFragment();
  EXPRESSION_OPTIONS.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name_ar;
    fragment.appendChild(option);
  });

  select.replaceChildren(fragment);
  select.value = validId(desired) ? desired : "relaxed";
  return { previous, desired: select.value };
}

function install() {
  if (typeof document === "undefined") return;
  const select = document.querySelector(`#${SELECT_ID}`);
  if (!select) return false;
  if (select[installFlag]) return true;

  const { previous, desired } = buildOptions(select);

  select.addEventListener("change", () => {
    if (validId(select.value)) writeStoredId(select.value);
  });

  // App initialization currently whitelists only the original Smart Quad expression IDs.
  // Restore the expanded catalog after init, then notify the existing App listener so
  // prompt state, persistence and rebuild all follow the visible selected expression.
  if (desired !== previous) {
    queueMicrotask(() => select.dispatchEvent(new Event("change", { bubbles: true })));
  }

  const observer = new MutationObserver(() => {
    if (select.options.length === EXPRESSION_OPTIONS.length) return;
    const current = validId(select.value) ? select.value : readStoredId() || "relaxed";
    buildOptions(select);
    if (validId(current)) select.value = current;
  });
  observer.observe(select, { childList: true });

  select[installFlag] = true;
  return true;
}

function installWhenReady() {
  let attempts = 0;
  const tryInstall = () => {
    if (install()) return;
    attempts += 1;
    if (attempts < 30) requestAnimationFrame(tryInstall);
  };
  tryInstall();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installWhenReady, { once: true });
  else installWhenReady();
}
