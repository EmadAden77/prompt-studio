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
    makeSummaryItem("الوضعية", config.pose?.name_ar ?? "غير متاح"),
    makeSummaryItem("الشعر", config.hair?.name_ar ?? "غير متاح"),
    makeSummaryItem("الإضاءة", config.lighting?.name_ar ?? "غير متاح"),
    makeSummaryItem("التعبير", config.expression?.name_ar ?? "غير متاح"),
    makeSummaryItem("الملابس", config.clothing?.name_ar ?? "غير متاح"),
    makeSummaryItem("المرجع التلقائي", config.scene?.name_ar ?? "غير متاح"),
    makeSummaryItem("الثقة", config.autoEngineering?.confidence ?? "تحت الفحص")
  );
  container.replaceChildren(fragment);
}
