const CARD_SELECTOR = "[data-room-scenario-group]";
const GRID_SELECTOR = "#templateHub .template-hub__grid";
const cache = new Map();
let scheduled = false;

function rememberFrom(node) {
  if (!(node instanceof Element)) return;
  if (node.matches(CARD_SELECTOR)) {
    const key = node.dataset.roomScenarioGroup || node.querySelector("select")?.id;
    if (key) cache.set(key, node);
  }
  node.querySelectorAll?.(CARD_SELECTOR).forEach((card) => {
    const key = card.dataset.roomScenarioGroup || card.querySelector("select")?.id;
    if (key) cache.set(key, card);
  });
}

function reattach() {
  scheduled = false;
  const grid = document.querySelector(GRID_SELECTOR);
  if (!grid || !cache.size) return;
  cache.forEach((card, key) => {
    const selectId = card.querySelector("select")?.id;
    if (selectId && document.querySelector(`#${CSS.escape(selectId)}`)) return;
    if (!card.isConnected) grid.appendChild(card);
  });
}

function scheduleReattach() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(reattach);
}

function install() {
  document.querySelectorAll(CARD_SELECTOR).forEach(rememberFrom);

  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      record.removedNodes.forEach(rememberFrom);
      record.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches?.("#templateHub") || node.querySelector?.("#templateHub")) scheduleReattach();
      });
    });
    scheduleReattach();
  });
  observer.observe(document.body, { childList:true, subtree:true });

  document.addEventListener("bedroom-template-hub-built", scheduleReattach);
  scheduleReattach();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once:true });
  else install();
}
