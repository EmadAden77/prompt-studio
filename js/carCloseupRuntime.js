import { PromptEngine } from "./engines/promptEngine.js";
import {
  CAR_CLOSEUP_MASTER_LOCK,
  CAR_CLOSEUP_TEMPLATES,
  CAR_CLOSEUP_BY_ID,
  CAR_CLOSEUP_LIGHTING,
  CAR_CLOSEUP_LIGHTING_BY_ID
} from "./carCloseupTemplates.js";

const CLOSEUP_STORAGE = "ai-selfie-prompt-studio:car-closeup-template";
const LIGHT_STORAGE = "ai-selfie-prompt-studio:car-closeup-lighting";
const patchFlag = Symbol.for("promptStudio.carCloseupRuntime.patched");

function readStored(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

function writeStored(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

function activeCloseup() {
  if (typeof document === "undefined") return null;
  return CAR_CLOSEUP_BY_ID[document.documentElement.dataset.activeCarCloseup] ?? null;
}

function activeCloseupLight() {
  if (typeof document === "undefined") return CAR_CLOSEUP_LIGHTING_BY_ID.N1;
  return CAR_CLOSEUP_LIGHTING_BY_ID[document.documentElement.dataset.activeCarCloseupLighting]
    ?? CAR_CLOSEUP_LIGHTING_BY_ID.N1;
}

function activateBaseCloseCarTemplate() {
  const carSelect = document.querySelector("#hubCarTemplate");
  if (!carSelect) return false;
  const baseId = [...carSelect.options].some((option) => option.value === "car_driver_close")
    ? "car_driver_close"
    : [...carSelect.options].find((option) => option.value !== "custom")?.value;
  if (!baseId) return false;
  if (carSelect.value !== baseId) {
    carSelect.value = baseId;
    carSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }
  return true;
}

function syncCarTime(light) {
  const timeSelect = document.querySelector("#carTimeSelect");
  if (!timeSelect || !light?.timeId) return;
  if ([...timeSelect.options].some((option) => option.value === light.timeId) && timeSelect.value !== light.timeId) {
    timeSelect.value = light.timeId;
    timeSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function closeupPromptSection(template, light) {
  return `CAR CLOSE-UP TEMPLATE — ${template.id} / ${template.name_ar}
HIGHEST PRIORITY WITHIN CAR CLOSE-UP CAMERA DISTANCE, FRAMING, AND FACE SCALE.

${CAR_CLOSEUP_MASTER_LOCK}

SELECTED CLOSE-UP GEOMETRY
${template.prompt}

SELECTED CLOSE-UP LIGHTING — ${light.id} / ${light.name_ar}
${light.prompt}

CLOSE-UP CONSISTENCY GATE
- Preserve DRIVER SEAT ANATOMY LOCK, immutable IMAGE B vehicle geometry, Saudi stationary-parking context, and the selected Xiaomi front-camera capture mode.
- Keep face identity, hair density/hairline, beard pattern, skin tone, age, and asymmetry from IMAGE A.
- Expression, hair arrangement, and clothing come from the application's current user selections; this CU template must not silently replace them.
- If 25–45cm framing would force impossible arm reach, body twist, wheel displacement, headrest displacement, or cabin intersection, widen the crop within this CU template before changing anatomy.
- If any old lower-priority instruction says the complete car selfie arm must be invisible, the CU rule wins: a small physically continuous edge-near forearm/shoulder may appear when specified, but the phone itself remains directly invisible.
- Reject any result that reads as a profile portrait, rear-camera portrait, mounted camera, dashcam, exterior camera, passenger photographer, or DSLR close-up.`;
}

function patchPromptEngine() {
  const proto = PromptEngine?.prototype;
  if (!proto || proto[patchFlag] || typeof proto.generate !== "function") return;

  const originalGenerate = proto.generate;
  proto.generate = function generateWithCarCloseup(config = {}) {
    const result = originalGenerate.call(this, config);
    if (typeof result !== "string") return result;
    const template = activeCloseup();
    if (!template) return result;
    const light = activeCloseupLight();
    return `${result}\n\n${closeupPromptSection(template, light)}`.trim();
  };

  proto[patchFlag] = true;
}

function installStyles() {
  if (document.querySelector("#carCloseupStyles")) return;
  const style = document.createElement("style");
  style.id = "carCloseupStyles";
  style.textContent = `
.car-closeup-card{grid-column:1/-1}.car-closeup-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.car-closeup-note{margin-top:8px;opacity:.72;line-height:1.7}@media(max-width:700px){.car-closeup-controls{grid-template-columns:1fr}}
`;
  document.head.appendChild(style);
}

function buildCard() {
  const grid = document.querySelector("#templateHub .template-hub__grid");
  if (!grid || document.querySelector("#carCloseupSelect")) return false;
  installStyles();

  const card = document.createElement("article");
  card.className = "template-hub__card car-closeup-card";

  const heading = document.createElement("label");
  heading.htmlFor = "carCloseupSelect";
  const icon = document.createElement("span");
  icon.className = "template-hub__icon";
  icon.textContent = "🔎";
  const title = document.createElement("strong");
  title.textContent = "لقطات السيارة القريبة — CU1 إلى CU8";
  heading.append(icon, title);

  const controls = document.createElement("div");
  controls.className = "car-closeup-controls";

  const templateWrap = document.createElement("div");
  const templateLabel = document.createElement("small");
  templateLabel.textContent = "قالب القرب";
  const templateSelect = document.createElement("select");
  templateSelect.id = "carCloseupSelect";
  const none = document.createElement("option");
  none.value = "custom";
  none.textContent = "بدون قالب قريب";
  templateSelect.appendChild(none);
  CAR_CLOSEUP_TEMPLATES.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name_ar;
    templateSelect.appendChild(option);
  });
  templateWrap.append(templateLabel, templateSelect);

  const lightWrap = document.createElement("div");
  const lightLabel = document.createElement("small");
  lightLabel.textContent = "إضاءة اللقطة القريبة";
  const lightSelect = document.createElement("select");
  lightSelect.id = "carCloseupLightingSelect";
  CAR_CLOSEUP_LIGHTING.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name_ar;
    lightSelect.appendChild(option);
  });
  const storedLight = readStored(LIGHT_STORAGE, "N1");
  lightSelect.value = CAR_CLOSEUP_LIGHTING_BY_ID[storedLight] ? storedLight : "N1";
  lightWrap.append(lightLabel, lightSelect);
  controls.append(templateWrap, lightWrap);

  const note = document.createElement("small");
  note.className = "car-closeup-note";
  note.textContent = "الكاميرا ثابتة: Xiaomi 15 Ultra أمامية 22–24mm. التعبير والشعر والملابس تبقى من اختياراتك الحالية. اختيار الإضاءة يزامن وقت قالب السيارة تلقائيًا.";

  templateSelect.addEventListener("change", () => {
    if (templateSelect.value === "custom") {
      delete document.documentElement.dataset.activeCarCloseup;
      delete document.documentElement.dataset.activeCarCloseupLighting;
      writeStored(CLOSEUP_STORAGE, "custom");
      document.querySelector("#rebuildBtn")?.click();
      return;
    }

    const template = CAR_CLOSEUP_BY_ID[templateSelect.value];
    const light = CAR_CLOSEUP_LIGHTING_BY_ID[lightSelect.value] ?? CAR_CLOSEUP_LIGHTING_BY_ID.N1;
    if (!template) return;

    activateBaseCloseCarTemplate();
    document.documentElement.dataset.activeCarCloseup = template.id;
    document.documentElement.dataset.activeCarCloseupLighting = light.id;
    writeStored(CLOSEUP_STORAGE, template.id);
    writeStored(LIGHT_STORAGE, light.id);
    syncCarTime(light);
    document.querySelector("#rebuildBtn")?.click();
  });

  lightSelect.addEventListener("change", () => {
    const light = CAR_CLOSEUP_LIGHTING_BY_ID[lightSelect.value] ?? CAR_CLOSEUP_LIGHTING_BY_ID.N1;
    writeStored(LIGHT_STORAGE, light.id);
    if (!activeCloseup()) return;
    document.documentElement.dataset.activeCarCloseupLighting = light.id;
    syncCarTime(light);
    document.querySelector("#rebuildBtn")?.click();
  });

  card.append(heading, controls, note);
  grid.appendChild(card);

  const storedTemplate = readStored(CLOSEUP_STORAGE, "custom");
  if (CAR_CLOSEUP_BY_ID[storedTemplate]) templateSelect.value = storedTemplate;
  return true;
}

function installUI() {
  let attempts = 0;
  const tryBuild = () => {
    if (buildCard()) return;
    attempts += 1;
    if (attempts < 20) requestAnimationFrame(tryBuild);
  };
  tryBuild();

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    if (target.id === "carCloseupSelect" || target.id === "carCloseupLightingSelect") return;
    if (target.id === "hubCarTemplate" && activeCloseup() && target.value !== "car_driver_close") {
      delete document.documentElement.dataset.activeCarCloseup;
      delete document.documentElement.dataset.activeCarCloseupLighting;
      const select = document.querySelector("#carCloseupSelect");
      if (select) select.value = "custom";
      writeStored(CLOSEUP_STORAGE, "custom");
    }
  }, true);
}

patchPromptEngine();

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installUI, { once: true });
  else installUI();
}
