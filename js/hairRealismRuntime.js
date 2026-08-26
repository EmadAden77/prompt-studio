import { PromptEngine } from "./engines/promptEngine.js";
import { HAIR_ANGLE_OPTIONS, HAIR_ANGLE_BY_ID, HAIR_REALISM_LOCK } from "./data/hairData.js";

const STORAGE_KEY = "ai-selfie-prompt-studio:hair-angle";
const SELECT_ID = "hairAngleSelect";
const patchFlag = Symbol.for("promptStudio.hairRealismRuntime.patched");

function readStoredAngle() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) || "auto";
    return HAIR_ANGLE_BY_ID[stored] ? stored : "auto";
  } catch {
    return "auto";
  }
}

function writeStoredAngle(id) {
  try { localStorage.setItem(STORAGE_KEY, id); } catch {}
}

function selectedAngleId() {
  if (typeof document === "undefined") return "auto";
  const id = document.querySelector(`#${SELECT_ID}`)?.value || readStoredAngle();
  return HAIR_ANGLE_BY_ID[id] ? id : "auto";
}

function normalizeRiskyHairLanguage(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/\bphotorealistic\b/gi, "physically coherent ordinary smartphone")
    .replace(/highly detailed individual hair strands/gi, "sensor-limited hair detail: individual strands only at hairline edges, flyaways, contact displacement, and highlight glints")
    .replace(/natural hair density and volume/gi, "hair density and total volume locked exactly to IMAGE A")
    .replace(/voluminous natural texture/gi, "soft natural wave clumps with IMAGE A volume ceiling, matte root lift, and no invented fullness")
    .replace(/natural highlights and lowlights/gi, "lighting-driven brighter wave crests and deeper valleys with no painted streaks");
}

function resolveAnglePrompt(result) {
  const id = selectedAngleId();
  const angle = HAIR_ANGLE_BY_ID[id] ?? HAIR_ANGLE_BY_ID.auto;
  if (id !== "back_texture") return angle.prompt;

  const readsAsFrontSelfie = /front[- ]?(camera|facing)|selfie/i.test(result);
  if (!readsAsFrontSelfie) return angle.prompt;

  return `${HAIR_ANGLE_BY_ID.auto.prompt}\nBACK-TEXTURE SAFETY OVERRIDE: the requested back-of-head angle is incompatible with an active front-camera selfie, so it is disabled for this capture. Do not switch to a rear camera or mirror unless the selected template explicitly requests that capture type.`;
}

function hairCameraGuard(result) {
  const readsAsFrontSelfie = /front[- ]?(camera|facing)|selfie/i.test(result);
  if (!readsAsFrontSelfie) {
    return `HAIR CAMERA FOCAL-LENGTH GUARD\n- 85mm-equivalent portrait language is permitted only for an explicitly selected rear-camera portrait, never silently applied to a selfie.`;
  }

  return `HAIR CAMERA FOCAL-LENGTH GUARD — FRONT SELFIE
- Front-camera selfie hair rendering must use the app's Xiaomi 15 Ultra front-camera optical model around 22–24mm equivalent only.
- Do not introduce an 85mm portrait lens, telephoto compression, DSLR perspective, or rear-camera viewpoint merely to improve hair separation.
- Hair edge detail, crown scale, forehead proportion, and side taper must remain consistent with near-field phone selfie geometry.`;
}

function buildHairRuntimeSection(result) {
  return `${HAIR_REALISM_LOCK}\n\n${resolveAnglePrompt(result)}\n\n${hairCameraGuard(result)}\n\nHAIR SENSOR-RESOLUTION RULE
- Hair detail cannot exceed the rest of the frame. The face, beard, clothing, car/room materials, and hair all pass through one exposure, one focus state, one sharpening/denoising behavior, and one compression pipeline.
- Do not sharpen the entire hairstyle strand-by-strand. Interior hair mass stays clump-based and softly resolved; only selected edges and glints may separate into fine strands.
- Never add fake micro-detail solely because the prompt contains words such as detailed, realistic, high-resolution, or photorealistic.`;
}

function patchPromptEngine() {
  const proto = PromptEngine?.prototype;
  if (!proto || proto[patchFlag] || typeof proto.generate !== "function") return;

  const originalGenerate = proto.generate;
  proto.generate = function generateWithHairRealism(config = {}) {
    const raw = originalGenerate.call(this, config);
    if (typeof raw !== "string") return raw;
    const normalized = normalizeRiskyHairLanguage(raw);
    return `${normalized}\n\n${buildHairRuntimeSection(normalized)}`.trim();
  };

  proto[patchFlag] = true;
}

function buildAngleSelector() {
  if (typeof document === "undefined" || document.querySelector(`#${SELECT_ID}`)) return;
  const hairSelect = document.querySelector("#hairSelect");
  const field = hairSelect?.closest(".field");
  if (!hairSelect || !field) return;

  const label = document.createElement("label");
  label.htmlFor = SELECT_ID;
  label.textContent = "زاوية إبراز الشعر";
  label.style.marginTop = "10px";

  const select = document.createElement("select");
  select.id = SELECT_ID;
  select.name = "hairAngle";
  HAIR_ANGLE_OPTIONS.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name_ar;
    select.appendChild(option);
  });
  select.value = readStoredAngle();

  const hint = document.createElement("small");
  hint.textContent = "خلف الرأس يعمل فقط مع كاميرا خلفية أو مرآة؛ السيلفي الأمامي يعود تلقائيًا للوضع الآمن.";

  select.addEventListener("change", () => {
    writeStoredAngle(select.value);
    document.querySelector("#rebuildBtn")?.click();
  });

  field.append(label, select, hint);
}

function installUI() {
  let attempts = 0;
  const tryInstall = () => {
    if (document.querySelector("#hairSelect")) {
      buildAngleSelector();
      return;
    }
    attempts += 1;
    if (attempts < 12) requestAnimationFrame(tryInstall);
  };
  tryInstall();
}

patchPromptEngine();

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installUI, { once: true });
  else installUI();
}
