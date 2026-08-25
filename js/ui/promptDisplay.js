function makeSummaryItem(label, value, className = "") {
  const item = document.createElement("div");
  item.className = `summary-item${className ? ` ${className}` : ""}`;
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
    makeSummaryItem("المرجع", config.scene?.name_ar ?? "لا يوجد مرجع صالح"),
    makeSummaryItem("الثقة", config.autoEngineering?.confidence ?? "تحت الفحص")
  );

  if (config.autoEngineering?.manualOverrideInvalid) {
    fragment.append(makeSummaryItem(
      "تحذير المرجع",
      "⚠ التجاوز اليدوي لا يجتاز البوابة الصارمة لهذه الوضعية. الأمر مبني للمعاينة لكن التحقق مانع.",
      "summary-item--warning"
    ));
  } else if (config.autoEngineering?.strictNoMatch) {
    fragment.append(makeSummaryItem(
      "حالة المرجع",
      config.autoEngineering.strictNoMatchMessage || "لا يوجد مرجع صالح لهذه الوضعية.",
      "summary-item--warning"
    ));
  }

  container.replaceChildren(fragment);
}
