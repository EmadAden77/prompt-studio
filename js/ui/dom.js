export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export function setOptions(select, items, selectedValue, mapItem = (item) => ({ value: item.id, label: item.name_ar })) {
  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const mapped = mapItem(item);
    const option = document.createElement("option");
    option.value = mapped.value;
    option.textContent = mapped.label;
    option.selected = mapped.value === selectedValue;
    option.disabled = Boolean(mapped.disabled);
    fragment.append(option);
  });
  select.replaceChildren(fragment);
}

export function escapeHTML(value = "") {
  const node = document.createElement("span");
  node.textContent = String(value);
  return node.innerHTML;
}

export function showToast(message, type = "success", timeout = 2600) {
  const region = $("#toastRegion");
  if (!region) return;
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.textContent = message;
  region.append(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => toast.remove(), 220);
  }, timeout);
}

export function openDialog(dialog) {
  if (!dialog?.open) dialog?.showModal();
}

export function closeDialog(dialog) {
  if (dialog?.open) dialog.close();
}
