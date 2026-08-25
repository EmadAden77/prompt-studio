export function activateManualMode({ smartButton, manualButton, modeHint }) {
  manualButton.classList.add("is-active");
  manualButton.setAttribute("aria-pressed", "true");
  smartButton.classList.remove("is-active");
  smartButton.setAttribute("aria-pressed", "false");
  modeHint.textContent = "المرجع تحت تحكمك";
  modeHint.classList.add("is-manual");
}
