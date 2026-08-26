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
      ? `لا توجد تعارضات مانعة. يوجد ${warningCount} ${warningCount === 1 ? "تنبيه" : "تنبيهات"} يحتاج انتباهك قبل الاستخدام.`
      : "التحقق ناجح: اجتازت التركيبة البوابة الصارمة ولا توجد تعارضات مانعة."
    : "توجد تعارضات مانعة. النسخ يبقى مقفولًا حتى تُحل، والحل المقترح يظهر داخل كل بطاقة تعارض أدناه.";

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

    if (issue.solution?.text) {
      const solution = document.createElement("div");
      solution.className = "validation-summary is-valid";
      solution.style.marginTop = "10px";

      const title = document.createElement("strong");
      title.textContent = `${issue.solution.title ?? "الحل المقترح"}: `;
      const text = document.createElement("span");
      text.textContent = issue.solution.text;
      solution.append(title, text);
      body.append(solution);
    }

    article.append(marker, body);
    fragment.append(article);
  });

  listElement.replaceChildren(fragment);
  autoFixButton.hidden = result.autoFixes.length === 0;
  if (!autoFixButton.hidden) {
    autoFixButton.textContent = "تطبيق الإصلاحات الآمنة تلقائيًا";
  }
}
