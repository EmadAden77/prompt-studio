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
      ? `لا توجد تعارضات مانعة. يوجد ${warningCount} ${warningCount === 1 ? "تنبيه" : "تنبيهات"} يحتاج انتباهك قبل الاستخدام، مثل رفع الصور المرجعية.`
      : "التحقق ناجح: لا توجد تعارضات مانعة أو تنبيهات معلّقة."
    : result.autoFixes.length
      ? "توجد تعارضات مانعة قابلة للإصلاح. في الوضع الذكي سيحاول التطبيق إصلاحها تلقائيًا؛ وفي الوضع اليدوي يمكنك تطبيق الإصلاحات المقترحة."
      : "توجد تعارضات مانعة لا يمكن حلها تلقائيًا. غيّر الاختيارات الموضحة باللون الأحمر قبل الاستخدام.";

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
  if (!autoFixButton.hidden) {
    autoFixButton.textContent = "إصلاح التعارضات القابلة للإصلاح";
  }
}
