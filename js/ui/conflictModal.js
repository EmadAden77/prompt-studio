const ISSUE_LABELS = {
  error: "تعارض",
  warning: "تنبيه",
  info: "معلومة"
};

export function renderValidation({ statusElement, summaryElement, listElement, autoFixButton, result }) {
  const conflictCount = result.conflicts.length;
  const warningCount = result.warnings.length;

  statusElement.className = `validation-status ${result.valid ? "is-valid" : "is-invalid"}`;
  statusElement.textContent = result.valid ? "متوافق فيزيائيًا" : `${conflictCount} تعارض`;

  summaryElement.className = `validation-summary ${result.valid ? "is-valid" : "is-invalid"}`;
  summaryElement.textContent = result.valid
    ? warningCount
      ? `الأمر قابل للاستخدام، وعندك ${warningCount} تنبيه غير مانع.`
      : "كل السلطات والوضعية والكاميرا والإضاءة متوافقة."
    : "الأمر ما زال يُبنى للمعاينة، لكن أصلح التعارضات الحمراء قبل استخدامه.";

  const fragment = document.createDocumentFragment();
  result.issues.forEach((issue) => {
    const article = document.createElement("article");
    article.className = `issue issue--${issue.severity}`;

    const marker = document.createElement("span");
    marker.className = "issue__marker";
    marker.textContent = issue.severity === "error" ? "!" : issue.severity === "warning" ? "△" : "i";

    const body = document.createElement("div");
    const heading = document.createElement("div");
    heading.className = "issue__heading";
    const label = document.createElement("strong");
    label.textContent = ISSUE_LABELS[issue.severity];
    const code = document.createElement("code");
    code.textContent = issue.type;
    heading.append(label, code);

    const message = document.createElement("p");
    message.textContent = issue.message;
    body.append(heading, message);

    if (issue.suggestion) {
      const suggestion = document.createElement("small");
      suggestion.textContent = issue.suggestion;
      body.append(suggestion);
    }

    article.append(marker, body);
    fragment.append(article);
  });

  listElement.replaceChildren(fragment);
  autoFixButton.hidden = result.autoFixes.length === 0;
}
