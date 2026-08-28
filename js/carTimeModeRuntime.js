const VERSION = "v1.36";
const STORAGE_KEY = "prompt-studio:car-time:v1";
const DAY_LIGHTS = new Set(["N4", "D2"]);
const NIGHT_LIGHTS = new Set(["N1", "N2", "N3", "N5", "N6"]);
const TIME_MARKER_START = "CAR TIME AUTHORITY — ABSOLUTE";
const TIME_MARKER_END = "END CAR TIME AUTHORITY";

const INTERIOR_DAY_NAMES = new Set([
  "المقود + هواء المكيّف",
  "نافذة مفتوحة وقت الغروب",
  "تحت ظل شجرة سكنية"
]);
const INTERIOR_NIGHT_NAMES = new Set([
  "كلوز أب ليلي بضوء جانبي",
  "ميلان كسول",
  "راكب مقعد مرجع",
  "انتظار الطلب ليلاً",
  "إضاءة عمود شارع ليلي"
]);

const EXTERIOR_DAY_NAMES = new Set([
  "شارع سكني بجانب فيلا",
  "موقف مسجد تحت المظلة",
  "شارع تجاري قرب الرفرف الخلفي",
  "موقف أعمال صباحي مفتوح"
]);
const EXTERIOR_NIGHT_NAMES = new Set(["موقف محطة وقود ليلاً"]);

const DAY_PARKING = new Set([
  "open_asphalt_day",
  "shade_canopy_day",
  "office_shade",
  "residential_villa_day",
  "mosque_canopy_day",
  "commercial_curb_afternoon",
  "business_morning"
]);
const NIGHT_PARKING = new Set([
  "mall_night",
  "underground",
  "dusk_open",
  "gas_station_night"
]);

function savedTime() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "day" || value === "night") return value;
  } catch {}
  const current = document.querySelector("#lightingSelect")?.value;
  return DAY_LIGHTS.has(current) ? "day" : "night";
}

let activeTime = "night";
let applying = false;
let promptWriting = false;

function kindFromLabel(label, daySet, nightSet) {
  if (daySet.has(label)) return "day";
  if (nightSet.has(label)) return "night";
  const normalized = String(label || "").toLowerCase();
  if (/ليل|ليلي|night|underground|محطة وقود/.test(normalized)) return "night";
  if (/نهار|نهاري|صباح|ظهيرة|day|morning|midday|afternoon/.test(normalized)) return "day";
  return "both";
}

function allowedTime(kind) {
  return kind === "both" || kind === activeTime;
}

function updateButtons() {
  document.querySelectorAll("[data-car-time]").forEach((button) => {
    const active = button.dataset.carTime === activeTime;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  const badge = document.querySelector("#carTimeBadge");
  if (badge) badge.textContent = activeTime === "day" ? "نهاري · سلطة الوقت مطبقة" : "ليلي · سلطة الوقت مطبقة";
  document.documentElement.dataset.carTime = activeTime;
  document.body.dataset.carTime = activeTime;
}

function updateVersionLabels() {
  document.querySelectorAll(".car-version").forEach((node) => { node.textContent = VERSION; });
  const brand = document.querySelector(".brand small");
  if (brand) brand.textContent = `Car Templates ${VERSION}`;
  const eyebrow = document.querySelector(".intro .eyebrow");
  if (eyebrow) eyebrow.textContent = `CAR SELFIE ENGINE · ${VERSION}`;
  const footer = document.querySelector("footer p:first-child");
  if (footer) footer.innerHTML = `Car Templates ${VERSION} <span>•</span> AUTHORITATIVE DAY / NIGHT · USER LIGHTING`;
  document.title = `قوالب السيارة ${VERSION} — AI Selfie Prompt Studio`;
}

function filterLighting() {
  const select = document.querySelector("#lightingSelect");
  if (!select) return;
  const allowed = activeTime === "day" ? DAY_LIGHTS : NIGHT_LIGHTS;
  [...select.options].forEach((option) => {
    const show = allowed.has(option.value);
    option.hidden = !show;
    option.disabled = !show;
  });
  if (!allowed.has(select.value)) {
    select.value = activeTime === "day" ? "N4" : "N1";
    select.dispatchEvent(new Event("change", { bubbles:true }));
  }
}

function filterInteriorTemplates() {
  const grid = document.querySelector("#carTemplateGrid");
  if (!grid) return;
  const cards = [...grid.querySelectorAll(".car-pose-card")];
  cards.forEach((card) => {
    const label = card.querySelector("strong")?.textContent?.trim() || "";
    const show = allowedTime(kindFromLabel(label, INTERIOR_DAY_NAMES, INTERIOR_NIGHT_NAMES));
    card.hidden = !show;
    card.dataset.timeMatch = show ? "true" : "false";
  });
  const active = cards.find((card) => card.classList.contains("is-active"));
  if (active?.hidden) cards.find((card) => !card.hidden)?.click();
}

function filterExteriorTemplates() {
  const grid = document.querySelector("#exteriorPoseGrid");
  if (!grid) return;
  const cards = [...grid.querySelectorAll(".car-exterior-card")];
  cards.forEach((card) => {
    const label = card.querySelector("strong")?.textContent?.trim() || "";
    const show = allowedTime(kindFromLabel(label, EXTERIOR_DAY_NAMES, EXTERIOR_NIGHT_NAMES));
    card.hidden = !show;
    card.dataset.timeMatch = show ? "true" : "false";
  });
  const active = cards.find((card) => card.classList.contains("is-active"));
  if (active?.hidden) cards.find((card) => !card.hidden)?.click();
}

function filterParking() {
  const select = document.querySelector("#exteriorParkingSelect");
  if (!select) return;
  const allowed = activeTime === "day" ? DAY_PARKING : NIGHT_PARKING;
  [...select.options].forEach((option) => {
    const show = allowed.has(option.value);
    option.hidden = !show;
    option.disabled = !show;
  });
  if (!allowed.has(select.value)) {
    const next = [...select.options].find((option) => allowed.has(option.value));
    if (next) {
      select.value = next.value;
      select.dispatchEvent(new Event("change", { bubbles:true }));
    }
  }
}

function stripTimeAuthority(text) {
  const start = text.indexOf(TIME_MARKER_START);
  if (start < 0) return text;
  const end = text.indexOf(TIME_MARKER_END, start);
  if (end < 0) return text.slice(0, start).trimEnd();
  return `${text.slice(0, start)}${text.slice(end + TIME_MARKER_END.length)}`.replace(/\n{3,}/g, "\n\n").trim();
}

function timeAuthorityBlock() {
  if (activeTime === "night") {
    return `${TIME_MARKER_START}\nSELECTED TIME — NIGHT / USER AUTHORITY\n- The final photographic event occurs at NIGHT. This selection overrides any historical template wording, scene metadata, parking description, lighting default, or cached state that implies daylight, morning, midday, afternoon, bright sun, blue daytime sky, or sunlit exterior.\n- Allowed lighting is NIGHT ONLY: N1, N2, N3, N5 or N6, according to the user's current selection. N4 and D2 are forbidden while NIGHT is active.\n- Exterior brightness, sky, glass transmission, reflections, cabin exposure, sensor gain, white balance and shadow noise must all read coherently as nighttime or dusk only when N5 is selected.\n- Do not preserve daylight from a template just because the physical location is also usable by day. Preserve location geometry, not its old time-of-day illumination.\nFINAL TIME CONFLICT GATE — NIGHT: if any visible or textual cue still reads as daytime, morning, midday, afternoon, direct sun, bright blue daylight sky, N4 or D2, reject it and rebuild the same composition under the selected night lighting before output.\n${TIME_MARKER_END}`;
  }
  return `${TIME_MARKER_START}\nSELECTED TIME — DAY / USER AUTHORITY\n- The final photographic event occurs in DAYLIGHT. This selection overrides any historical template wording, scene metadata, parking description, lighting default, or cached state that implies night, streetlight-only darkness, gas-station night, underground-night mood, or dark nocturnal sky.\n- Allowed lighting is DAY ONLY: N4 or D2, according to the user's current selection. N1, N2, N3, N5 and N6 are forbidden while DAY is active.\n- Exterior brightness, sky, glass transmission, reflections, cabin exposure, sensor gain, white balance and shadow detail must all read coherently as daytime.\n- Preserve location geometry while replacing any old nighttime illumination state with the selected daylight state.\nFINAL TIME CONFLICT GATE — DAY: if any visible or textual cue still reads as night, nocturnal darkness, night streetlight mood, N1, N2, N3, N5 or N6, reject it and rebuild the same composition under the selected day lighting before output.\n${TIME_MARKER_END}`;
}

function enforcePromptTime() {
  const output = document.querySelector("#finalPrompt");
  if (!output || promptWriting) return;
  const clean = stripTimeAuthority(output.textContent || "");
  if (!clean.trim()) return;
  const next = `${clean.trim()}\n\n${timeAuthorityBlock()}`;
  if (next === output.textContent) return;
  promptWriting = true;
  output.textContent = next;
  const wc = document.querySelector("#promptWordCount");
  if (wc) wc.textContent = `${next.trim().split(/\s+/).filter(Boolean).length} كلمة`;
  queueMicrotask(() => { promptWriting = false; });
}

function applyTime() {
  if (applying) return;
  applying = true;
  updateButtons();
  updateVersionLabels();
  filterLighting();
  filterInteriorTemplates();
  filterExteriorTemplates();
  filterParking();
  window.dispatchEvent(new CustomEvent("car-time-change", { detail:{ time:activeTime } }));
  queueMicrotask(() => {
    applying = false;
    enforcePromptTime();
  });
}

function setTime(value) {
  if (value !== "day" && value !== "night") return;
  activeTime = value;
  try { localStorage.setItem(STORAGE_KEY, activeTime); } catch {}
  applyTime();
  queueMicrotask(() => document.querySelector("#rebuildBtn")?.click());
  setTimeout(enforcePromptTime, 0);
}

function install() {
  if (document.querySelector("#carTimeMode")) return;
  activeTime = savedTime();

  const anchor = document.querySelector("#carModeBar") || document.querySelector(".car-category-shell");
  if (!anchor) return;

  const style = document.createElement("style");
  style.textContent = `.car-time-mode{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;margin:12px 0;padding:12px 14px;border:1px solid var(--border-color,rgba(127,127,127,.18));border-radius:16px;background:var(--surface-raised,rgba(127,127,127,.04))}.car-time-copy{display:grid;gap:3px}.car-time-copy strong{font-size:.95rem}.car-time-copy small{opacity:.7}.car-time-buttons{display:grid;grid-template-columns:1fr 1fr;gap:8px}.car-time-btn{border:1px solid var(--border-color,rgba(127,127,127,.22));border-radius:12px;padding:11px 12px;background:transparent;color:inherit;font:inherit;font-weight:800;cursor:pointer}.car-time-btn.is-active{outline:2px solid currentColor;outline-offset:1px;background:rgba(127,127,127,.12)}@media(max-width:640px){.car-time-mode{grid-template-columns:1fr}.car-time-copy{text-align:center}}`;
  document.head.append(style);

  const panel = document.createElement("section");
  panel.id = "carTimeMode";
  panel.className = "car-time-mode";
  panel.innerHTML = `<div class="car-time-copy"><strong>وقت التصوير</strong><small id="carTimeBadge"></small></div><div class="car-time-buttons"><button type="button" class="car-time-btn" data-car-time="day" aria-pressed="false">☀️ نهاري</button><button type="button" class="car-time-btn" data-car-time="night" aria-pressed="false">🌙 ليلي</button></div>`;
  anchor.after(panel);
  panel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-car-time]");
    if (button) setTime(button.dataset.carTime);
  });

  const cardsObserver = new MutationObserver(() => queueMicrotask(applyTime));
  [document.querySelector("#carTemplateGrid"), document.querySelector("#exteriorPoseGrid")].filter(Boolean).forEach((node) => cardsObserver.observe(node, { childList:true }));

  const output = document.querySelector("#finalPrompt");
  if (output) {
    const promptObserver = new MutationObserver(() => queueMicrotask(enforcePromptTime));
    promptObserver.observe(output, { childList:true, characterData:true, subtree:true });
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest(".car-chip, .car-mode-btn, .car-pose-card, .car-exterior-card")) queueMicrotask(applyTime);
  });
  document.querySelector("#lightingSelect")?.addEventListener("change", () => queueMicrotask(() => {
    filterLighting();
    enforcePromptTime();
  }));
  document.querySelector("#copyBtn")?.addEventListener("click", enforcePromptTime, true);
  document.querySelector("#downloadBtn")?.addEventListener("click", enforcePromptTime, true);

  applyTime();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once:true });
else install();
