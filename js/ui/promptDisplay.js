import { UI_LABELS } from "../config/appConfig.js";

function makeSummaryItem(label, value) {
  const item = document.createElement("div");
  item.className = "summary-item";
  const key = document.createElement("span");
  key.textContent = label;
  const content = document.createElement("strong");
  content.textContent = value;
  item.append(key, content);
  return item;
}

export function renderPrompt({ promptElement, countElement, prompt }) {
  promptElement.textContent = prompt;
  const count = prompt.trim() ? prompt.trim().split(/\s+/u).length : 0;
  countElement.textContent = `${count.toLocaleString("ar-SA")} كلمة`;
}

export function renderPromptSummary(container, config) {
  const fragment = document.createDocumentFragment();
  fragment.append(
    makeSummaryItem("الوضعية", config.pose.name_ar),
    makeSummaryItem("المرجع", config.scene?.name_ar ?? "غير متاح"),
    makeSummaryItem("الكاميرا", config.camera.name_ar),
    makeSummaryItem("الإضاءة", config.lighting.name_ar),
    makeSummaryItem("الغرفة", UI_LABELS.roomModes[config.roomMode])
  );
  container.replaceChildren(fragment);
}
