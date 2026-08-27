import { CAR_TEMPLATES } from "./carPosesData.js";

const VERSION = "v1.32";
const PATCH = Symbol.for("promptStudio.carPlaceTemplatesRuntime.installed");

const INTERIOR_TEMPLATES = Object.freeze([
  {
    id:"interior_residential",
    name:"داخل السيارة · شارع سكني هادئ",
    baseId:"cu_classic",
    place:"quiet Saudi residential neighborhood street with ordinary villas, boundary walls, curb edges, sparse parked cars and believable residential depth; no readable invented house signage"
  },
  {
    id:"interior_mosque",
    name:"داخل السيارة · موقف مسجد محلي",
    baseId:"side_34",
    place:"ordinary local Saudi mosque parking area with pale interlocking pavers, practical curb geometry, simple shade structures where present and sparse naturally parked vehicles; no invented readable mosque signage"
  },
  {
    id:"interior_mall",
    name:"داخل السيارة · موقف مركز تجاري",
    baseId:"high_dash",
    place:"active but ordinary Saudi shopping-mall parking area with real parking lanes, curbs, scattered vehicles, practical poles or shade structures and believable entrance/building depth; no invented readable storefront text"
  },
  {
    id:"interior_business",
    name:"داخل السيارة · موقف مبنى أعمال",
    baseId:"whl_hand8",
    place:"everyday Saudi office/business parking lot with slightly worn parking lines, wheel stops or curbs, sparse landscaping, irregular parked vehicles and an unbranded low-rise work-building context"
  },
  {
    id:"interior_station",
    name:"داخل السيارة · موقف محطة وقود",
    baseId:"rear_seat_selfie",
    place:"standard Saudi gas-station parking area beside the forecourt, with real canopy columns, access lanes, ordinary parked vehicles and lived-in pavement; the car remains parked away from any active fueling action and no readable invented fuel-brand logos appear"
  }
]);

const EXTERIOR_TEMPLATES = Object.freeze([
  {
    id:"exterior_residential",
    name:"خارج السيارة · بجانب الباب في شارع سكني",
    baseName:"واقف بجانب باب السائق",
    place:"quiet Saudi residential neighborhood street beside ordinary villa boundary walls, curb edges, restrained landscaping and sparse parked cars; residential scale and depth remain natural and un-staged"
  },
  {
    id:"exterior_mosque",
    name:"خارج السيارة · اتكاء خفيف في موقف مسجد",
    baseName:"اتكاء خفيف بالكتف على الباب",
    place:"ordinary local Saudi mosque parking area with pale interlocking pavers, practical shade structures or open parking geometry, curbs and sparse naturally parked vehicles; no readable invented mosque signage"
  },
  {
    id:"exterior_mall",
    name:"خارج السيارة · يد على المقبض في موقف مول",
    baseName:"يد على مقبض الباب",
    place:"active Saudi shopping-mall parking area with real parking lanes, curbs, scattered vehicles, poles or shade structures and believable building/entrance depth; no readable invented storefront text"
  },
  {
    id:"exterior_business",
    name:"خارج السيارة · قرب المقدمة في موقف أعمال",
    baseName:"واقف قرب المقدمة 3/4",
    place:"everyday Saudi office/business parking lot with slightly worn markings, wheel stops or curbs, sparse landscaping, irregular parked cars and an unbranded low-rise work-building context"
  },
  {
    id:"exterior_station",
    name:"خارج السيارة · قرب المؤخرة في محطة وقود",
    baseName:"واقف قرب المؤخرة",
    place:"standard Saudi gas-station parking area beside the forecourt with real canopy columns, access lanes, ordinary vehicle spacing and lived-in pavement; keep the subject away from active fueling and show no readable invented fuel-brand logos"
  }
]);

let activeInterior = null;
let activeExterior = null;
let programmatic = false;
let interiorWriting = false;
let exteriorWriting = false;

function updateVersion() {
  document.querySelectorAll(".car-version").forEach((node) => { node.textContent = VERSION; });
  const brand = document.querySelector(".brand small");
  if (brand) brand.textContent = `Car Templates ${VERSION}`;
  const eyebrow = document.querySelector(".intro .eyebrow");
  if (eyebrow) eyebrow.textContent = `CAR SELFIE ENGINE · ${VERSION}`;
  const footer = document.querySelector("footer p:first-child");
  if (footer) footer.innerHTML = `Car Templates ${VERSION} <span>•</span> PLACE-AWARE DAY/NIGHT PROMPT`;
  document.title = `قوالب السيارة ${VERSION} — AI Selfie Prompt Studio`;
}

function locationBlock(item) {
  return `LOCATION TEMPLATE AUTHORITY — ${item.name}\nPLACE: ${item.place}.\nTIME / LIGHTING AUTHORITY: keep the user's currently selected day/night mode and lighting preset exactly as chosen. This place template never switches, forces or substitutes lighting. The same physical location may be photographed in daylight or at night; only illumination/exposure changes, while place geometry and infrastructure remain coherent.`;
}

function injectInteriorLocation() {
  const output = document.querySelector("#finalPrompt");
  if (!output || !activeInterior || interiorWriting) return;
  const marker = "LOCATION TEMPLATE AUTHORITY —";
  let text = output.textContent || "";
  if (text.includes(marker)) return;
  const block = locationBlock(activeInterior);
  const anchor = "\n\nFRAMING & CAMERA AUTHORITY";
  text = text.includes(anchor) ? text.replace(anchor, `\n\n${block}${anchor}`) : `${text}\n\n${block}`;
  interiorWriting = true;
  output.textContent = text;
  queueMicrotask(() => { interiorWriting = false; });
}

function injectExteriorLocation() {
  const output = document.querySelector("#exteriorPrompt");
  if (!output || !activeExterior || exteriorWriting) return;
  let text = output.textContent || "";
  const block = locationBlock(activeExterior);
  const environmentPattern = /(PARKING ENVIRONMENT REALISM\n)Use [^\n]+(?=\. Keep the setting ordinary,)/u;
  if (environmentPattern.test(text)) {
    text = text.replace(environmentPattern, `$1${block}\nUse the exact PLACE above as the environment authority`);
  } else if (!text.includes("LOCATION TEMPLATE AUTHORITY —")) {
    text = `${text}\n\n${block}`;
  } else {
    return;
  }
  exteriorWriting = true;
  output.textContent = text;
  queueMicrotask(() => { exteriorWriting = false; });
}

function chooseInterior(item) {
  const base = CAR_TEMPLATES.find((tpl) => tpl.id === item.baseId);
  if (!base) return;
  const card = [...document.querySelectorAll(".car-pose-card")].find((node) => node.querySelector("strong")?.textContent?.trim() === base.name_ar);
  if (!card) return;
  activeInterior = item;
  programmatic = true;
  card.click();
  programmatic = false;
  renderActiveStates();
  queueMicrotask(injectInteriorLocation);
}

function chooseExterior(item) {
  const card = [...document.querySelectorAll(".car-exterior-card")].find((node) => node.querySelector("strong")?.textContent?.trim() === item.baseName);
  if (!card) return;
  activeExterior = item;
  programmatic = true;
  card.click();
  programmatic = false;
  renderActiveStates();
  queueMicrotask(injectExteriorLocation);
}

function renderActiveStates() {
  document.querySelectorAll("[data-place-template]").forEach((button) => {
    const id = button.dataset.placeTemplate;
    const active = id === activeInterior?.id || id === activeExterior?.id;
    button.classList.toggle("is-active", active);
  });
}

function createCard(item, mode) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "car-place-card";
  button.dataset.placeTemplate = item.id;
  button.innerHTML = `<strong>${item.name}</strong><small>📍 المكان مثبت داخل القالب · الإضاءة حسب اختيارك</small>`;
  button.addEventListener("click", () => mode === "interior" ? chooseInterior(item) : chooseExterior(item));
  return button;
}

function syncMode(panel) {
  const exterior = document.body.dataset.carMode === "exterior";
  panel.querySelector("[data-place-group='interior']").hidden = exterior;
  panel.querySelector("[data-place-group='exterior']").hidden = !exterior;
  queueMicrotask(() => {
    if (exterior) injectExteriorLocation(); else injectInteriorLocation();
    updateVersion();
  });
}

function install() {
  if (document.documentElement[PATCH]) return;
  document.documentElement[PATCH] = true;

  const anchor = document.querySelector("#carTimeMode") || document.querySelector("#carModeBar") || document.querySelector(".car-category-shell");
  if (!anchor) return;

  const style = document.createElement("style");
  style.textContent = `.car-place-panel{margin:12px 0;padding:14px;border:1px solid var(--border-color,rgba(127,127,127,.18));border-radius:16px;background:var(--surface-raised,rgba(127,127,127,.04))}.car-place-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px}.car-place-head small{opacity:.7}.car-place-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.car-place-card{text-align:right;border:1px solid var(--border-color,rgba(127,127,127,.18));border-radius:13px;padding:12px;background:transparent;color:inherit;font:inherit;cursor:pointer}.car-place-card strong,.car-place-card small{display:block}.car-place-card small{margin-top:5px;opacity:.72;line-height:1.55}.car-place-card.is-active{outline:2px solid currentColor;outline-offset:1px;background:rgba(127,127,127,.1)}@media(max-width:700px){.car-place-grid{grid-template-columns:1fr}.car-place-head{align-items:flex-start;flex-direction:column}}`;
  document.head.append(style);

  const panel = document.createElement("section");
  panel.id = "carPlaceTemplates";
  panel.className = "car-place-panel";
  panel.innerHTML = `<div class="car-place-head"><div><strong>قوالب المكان</strong><small>5 داخل السيارة + 5 خارج السيارة</small></div><span class="context-badge">📍 المكان داخل اسم القالب</span></div><div data-place-group="interior"><div class="car-place-grid" id="interiorPlaceGrid"></div></div><div data-place-group="exterior" hidden><div class="car-place-grid" id="exteriorPlaceGrid"></div></div>`;
  anchor.after(panel);

  const interiorGrid = panel.querySelector("#interiorPlaceGrid");
  const exteriorGrid = panel.querySelector("#exteriorPlaceGrid");
  INTERIOR_TEMPLATES.forEach((item) => interiorGrid.append(createCard(item, "interior")));
  EXTERIOR_TEMPLATES.forEach((item) => exteriorGrid.append(createCard(item, "exterior")));

  const interiorOutput = document.querySelector("#finalPrompt");
  const exteriorOutput = document.querySelector("#exteriorPrompt");
  if (interiorOutput) new MutationObserver(() => queueMicrotask(injectInteriorLocation)).observe(interiorOutput, { childList:true, characterData:true, subtree:true });
  if (exteriorOutput) new MutationObserver(() => queueMicrotask(injectExteriorLocation)).observe(exteriorOutput, { childList:true, characterData:true, subtree:true });

  document.addEventListener("click", (event) => {
    if (!programmatic && event.target.closest(".car-pose-card")) {
      activeInterior = null;
      renderActiveStates();
    }
    if (!programmatic && event.target.closest(".car-exterior-card")) {
      activeExterior = null;
      renderActiveStates();
    }
    if (event.target.closest(".car-mode-btn")) setTimeout(() => syncMode(panel), 0);
  });
  document.addEventListener("change", (event) => {
    if (["lightingSelect","hairSelect","expressionSelect","clothingSelect"].includes(event.target?.id)) {
      queueMicrotask(() => {
        injectInteriorLocation();
        injectExteriorLocation();
      });
    }
  });
  window.addEventListener("car-time-change", () => queueMicrotask(() => { updateVersion(); injectInteriorLocation(); injectExteriorLocation(); }));

  syncMode(panel);
  updateVersion();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once:true });
else install();
