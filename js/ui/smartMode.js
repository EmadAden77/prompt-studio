export function activateSmartMode({ smartButton, manualButton, modeHint }) {
  smartButton.classList.add("is-active");
  smartButton.setAttribute("aria-pressed", "true");
  manualButton.classList.remove("is-active");
  manualButton.setAttribute("aria-pressed", "false");
  modeHint.textContent = "اختيار المرجع تلقائي";
  modeHint.classList.remove("is-manual");
}
