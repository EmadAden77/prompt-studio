const FLASH_SECTIONS = new Set(["solo", "street", "carExterior"]);

function value(id) {
  return document.querySelector(`#${id}`)?.value ?? "";
}

function syncFlashOption() {
  const lighting = document.querySelector("#lighting");
  if (!lighting) return;

  const allowed = value("time") === "night" && FLASH_SECTIONS.has(value("studio-section"));
  let option = lighting.querySelector('option[value="flash"]');

  if (allowed) {
    if (!option) {
      option = document.createElement("option");
      option.value = "flash";
      option.textContent = "فلاش الهاتف المباشر";
      option.dataset.phase49Flash = "true";
      lighting.append(option);
    }
    return;
  }

  if (option?.dataset.phase49Flash === "true") {
    const wasSelected = lighting.value === "flash";
    option.remove();
    if (wasSelected && lighting.options.length) lighting.selectedIndex = 0;
  }
}

function scheduleSync() {
  queueMicrotask(syncFlashOption);
}

document.addEventListener("change", (event) => {
  if (["time", "studio-section", "lighting"].includes(event.target?.id || "")) scheduleSync();
});

document.addEventListener("click", (event) => {
  if (event.target?.closest?.("[data-studio-section]")) scheduleSync();
});

syncFlashOption();

globalThis.__PHASE49_NIGHT_LIGHTING_UI__ = Object.freeze({ syncFlashOption });
