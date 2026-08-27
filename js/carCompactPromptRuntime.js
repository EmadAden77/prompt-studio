import { CAR_TEMPLATES } from "./carPosesData.js";
import { HAIR_OPTIONS } from "./data/hairData.js";
import { EXPRESSION_OPTIONS } from "./data/expressionsData.js";
import { CLOTHING_OPTIONS } from "./data/clothingData.js";

const VERSION = "v1.19";
const OUTPUT_ID = "finalPrompt";
const patchFlag = Symbol.for("promptStudio.carCompactPromptRuntime.installed");

const LIGHTING = Object.freeze({
  N1: "N1 night lighting: mixed warm sodium spill and cool white parking LED with realistic cabin shadows and light-beige interior details.",
  N2: "N2 night lighting: irregular real storefront and sign spill through the windows, mixed with ordinary street practicals, with natural color contamination and cabin shadows.",
  N3: "N3 gas-station lighting: cool-white overhead canopy practicals entering through the glass, localized reflections on trim and windows, realistic cabin shadow falloff and modest highlight clipping.",
  N4: "N4 midday lighting: strong natural Saudi daylight through the windshield and side glass, brighter exterior exposure, deeper cabin shadows and restrained smartphone HDR.",
  N5: "N5 dusk lighting: cool ambient sky mixed with sparse warm exterior practicals, natural mixed white balance, modest cabin underexposure and realistic glass reflections.",
  N6: "N6 underground-parking lighting: localized cool fluorescent/LED ceiling practicals, weak concrete bounce, darker gaps between fixtures, natural shadow noise and restrained clipping.",
  D2: "D2 shaded daylight: open-sky daylight entering indirectly while the parked vehicle remains under shade, with soft top-side illumination, brighter exterior slices and realistic cabin contrast."
});

function byId(list, id) {
  return list.find((item) => item.id === id) ?? list[0];
}

function activeTemplate() {
  const label = document.querySelector(".car-pose-card.is-active strong")?.textContent?.trim();
  return CAR_TEMPLATES.find((item) => item.name_ar === label) ?? CAR_TEMPLATES[0];
}

function selectedValue(id) {
  return document.querySelector(`#${id}`)?.value || "";
}

function cleanHair(hair) {
  if (!hair || hair.id === "same") return "the exact same dark hair, hairline, density and natural texture as IMAGE A";
  return `${hair.name_en || hair.name_ar}, while preserving the exact hairline, density and identity from IMAGE A`;
}

function cleanExpression(expression) {
  return expression?.name_en ? expression.name_en.toLowerCase() : "relaxed candid expression";
}

function cleanClothing(clothing) {
  if (!clothing) return "ordinary natural clothing";
  return clothing.name_en || clothing.name_ar;
}

function cabinSentence(hasCabin) {
  return hasCabin
    ? "Use IMAGE B as the exact cabin reference for every visible interior detail; do not redesign, clean, mirror or replace the cabin."
    : "Use a coherent 2022 Range Rover Sport parked in Saudi Arabia with a realistic light-beige interior; show only the cabin details naturally included by the selected crop.";
}

function cropSentence(tpl) {
  return `Use the selected ${tpl.name_ar} composition: ${tpl.angle}, ${tpl.framing}, at ${tpl.distance}. ${tpl.gaze}. Camera distance, face scale and crop are strict; never widen the frame merely to show more cabin, clothing, steering wheel or anatomy.`;
}

function buildPrompt() {
  const tpl = activeTemplate();
  const lightingId = selectedValue("lightingSelect") || "N1";
  const hair = byId(HAIR_OPTIONS, selectedValue("hairSelect"));
  const expression = byId(EXPRESSION_OPTIONS, selectedValue("expressionSelect"));
  const clothing = byId(CLOTHING_OPTIONS, selectedValue("clothingSelect"));
  const hasCabin = !document.querySelector("#cabinPreview")?.hidden;

  return `Candid smartphone selfie of the exact man from IMAGE A, parked in Saudi Arabia inside a stationary 2022 Range Rover Sport. Preserve the exact facial structure, skin texture and tone, beard pattern and density, age, natural facial asymmetry, and ${cleanHair(hair)}. Do not create a look-alike or beautified version.\n\n${cropSentence(tpl)} Selfie arm, hand and phone completely off-frame. Keep only natural shoulder mechanics that imply a subject-held front-camera selfie.\n\nExpression is ${cleanExpression(expression)}, anatomically natural, with the exact identity geometry from IMAGE A unchanged. Follow the selected gaze exactly.\n\n${LIGHTING[lightingId] || LIGHTING.N1} No hidden fill light, beauty lighting, cinematic relighting or face-only exposure correction.\n\nWearing ${cleanClothing(clothing)}. Fabric must have ordinary real texture, seams, thickness, gravity-driven folds and material-correct sheen where visible.\n\n${cabinSentence(hasCabin)}\n\nAuthentic raw smartphone photo quality from a normal front-facing phone camera around 22–24mm equivalent: natural close selfie perspective, realistic edge behavior, one exposure and white balance for face and cabin, ordinary dynamic range, restrained HDR, subtle sensor noise in shadows, modest sharpening/compression and no artificial DSLR bokeh. Zero beauty filter, zero skin smoothing, zero CGI waxiness, zero hyper-symmetry. Captured, not rendered.`;
}

function syncPrompt() {
  const output = document.querySelector(`#${OUTPUT_ID}`);
  if (!output) return false;
  const prompt = buildPrompt();
  if (output.textContent !== prompt) output.textContent = prompt;

  const count = document.querySelector("#promptWordCount");
  if (count) count.textContent = `${prompt.trim().split(/\s+/u).length} كلمة`;
  const version = document.querySelector(".car-version");
  if (version) version.textContent = VERSION;
  return true;
}

function install() {
  if (document.documentElement[patchFlag]) return;
  document.documentElement[patchFlag] = true;

  let writing = false;
  const output = document.querySelector(`#${OUTPUT_ID}`);
  const observer = output ? new MutationObserver(() => {
    if (writing) return;
    writing = true;
    queueMicrotask(() => {
      syncPrompt();
      writing = false;
    });
  }) : null;
  observer?.observe(output, { childList:true, characterData:true, subtree:true });

  document.addEventListener("change", () => queueMicrotask(syncPrompt));
  document.addEventListener("click", (event) => {
    if (event.target.closest(".car-pose-card, .car-chip, #cabinRemove")) queueMicrotask(syncPrompt);
  });
  document.querySelector("#cabinInput")?.addEventListener("change", () => setTimeout(syncPrompt, 0));

  syncPrompt();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once:true });
  else install();
}
