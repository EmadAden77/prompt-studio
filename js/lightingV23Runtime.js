import { LIGHTING_OPTIONS } from "./data/lightingData.js";

const GROUP_LABELS = Object.freeze({
  screen:"شاشة الهاتف",
  ceiling:"السقف",
  lamp:"الأباجورة",
  daylight:"النهار",
  mixed:"مختلطة",
  night:"ليلية",
  isolation:"عزل ليلي 🌑",
  spill:"تسرب ضوء 🚪",
  drama:"نهاري درامي ☀️"
});

function install() {
  const App = window.App;
  if (!App || App.prototype.__lightingV23) return;
  App.prototype.__lightingV23 = true;

  App.prototype.populateLightingSelect = function() {
    const fragment = document.createDocumentFragment();
    Object.entries(GROUP_LABELS).forEach(([category, label]) => {
      const items = LIGHTING_OPTIONS.filter((x) => x.category === category);
      if (!items.length) return;
      const group = document.createElement("optgroup");
      group.label = label;
      items.forEach((x) => {
        const uiLabel = x.mood_ar ? `${x.name_ar} · ${x.mood_ar}` : x.name_ar;
        group.appendChild(new Option(uiLabel, x.id));
      });
      fragment.appendChild(group);
    });
    this.dom.lightingSelect.replaceChildren(fragment);
    this.dom.lightingSelect.value = this.state.lightingId;
  };
}

install();
