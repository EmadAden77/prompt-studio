import { CLOTHING_OPTIONS } from "./data/clothingData.js";

const PATCH = Symbol.for("promptStudio.globalFabricPhysicsRuntime.applied");
const NAME_MARKER = " [GLOBAL FABRIC PHYSICS:";

function compact(value, fallback) {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function materialFamily(item) {
  const type = String(item?.fabric?.type ?? "").toLowerCase();
  if (/denim|twill|jean/.test(type)) return "woven-twill";
  if (/linen/.test(type)) return "linen-blend";
  if (/wool|flannel|fleece|knit|rib|waffle/.test(type)) return "fibrous-knit";
  if (/satin|viscose|modal|bamboo/.test(type)) return "fluid-low-sheen";
  if (/leather/.test(type)) return "leather";
  if (/nylon|polyester|tech|interlock/.test(type)) return "technical";
  if (/poplin|oxford|cotton|jersey|piqué/.test(type)) return "cotton-family";
  return "material-specific";
}

function constructionRule(item) {
  const family = materialFamily(item);
  const fabric = item?.fabric ?? {};
  const type = compact(fabric.type, "selected material");
  const weight = compact(fabric.weight, "material-appropriate weight");
  const texture = compact(fabric.texture, "camera-resolvable non-repeating textile structure");
  return `construction=${type}; weight=${weight}; family=${family}; texture=${texture}`;
}

function hardwareRule(item) {
  const haystack = `${item?.pieces ?? ""} ${item?.name_en ?? ""} ${item?.fabric?.texture ?? ""}`.toLowerCase();
  const parts = [];
  if (/button|shirt|pajama|polo|thobe/.test(haystack)) parts.push("buttons/plackets only if the selected garment actually contains them, with mild seam pull and realistic buttonhole depth");
  if (/zip|jacket|track/.test(haystack)) parts.push("zipper teeth/tape only if present in the selected construction; no invented brand markings");
  if (/denim|jean/.test(haystack)) parts.push("denim topstitching/rivets only where the selected garment construction supports them; no decorative hardware invention");
  if (/drawstring/.test(haystack)) parts.push("drawstring, eyelets and knot remain simple, load-bearing and physically continuous");
  return parts.length ? parts.join("; ") : "hardware and closures appear only when present in the selected garment; never invent branded zippers, rivets, buttons or decorative fasteners";
}

export function buildGlobalFabricPhysicsDirective(item) {
  const fabric = item?.fabric ?? {};
  const sheen = compact(fabric.sheen, "material-correct optical response");
  const drape = compact(fabric.drape, "gravity-led drape");
  const folds = compact(fabric.folds, "load-driven folds");
  const wear = compact(fabric.wear, "subtle material-appropriate wear only when plausible");

  return `GLOBAL FABRIC PHYSICS: ${constructionRule(item)}. Load/drape=${drape}; folds=${folds}. Every fold must come from gravity, joint flexion, body curvature, seam constraint, friction or real support/contact; button/placket zones may show restrained pull tension, elbow bends may form material-appropriate accordion folds, and hems keep real thickness/weight rather than paper creases. Micro-imperfections=${wear}; allow sparse seam-edge fuzz, puckering, pilling, dye/fold wear or yarn slubs ONLY when the selected material and use genuinely support them. Hardware=${hardwareRule(item)}. Optical response=${sheen}; use material-correct anisotropic or diffuse response, tiny weave-gap self-shadowing and localized fiber-edge scattering only when lighting, focus and distance can resolve them. MATERIAL TRUTH OVERRIDES DETAIL LANGUAGE. Do not add weave, fuzz, sheen, hardware, pilling, slubs, fading or stitch structures that the selected garment would not naturally contain. CAMERA-RESOLVABLE TEXTILE TEXTURE ONLY: never render textile microstructure beyond what the selected camera distance, focus, illumination and sensor can physically resolve.`;
}

function decorate(item) {
  if (!item || item[PATCH]) return;
  const base = String(item.name_en || item.name_ar || "selected clothing").replace(/ \[GLOBAL FABRIC PHYSICS:[\s\S]*$/u, "");
  const directive = buildGlobalFabricPhysicsDirective(item);
  try {
    item.name_en = `${base}${NAME_MARKER} ${directive}]`;
    item.fabric_physics = directive;
    Object.defineProperty(item, PATCH, { value:true, configurable:false, enumerable:false });
  } catch {
    // Data items are currently mutable; if a future catalog freezes them, fail closed rather than corrupting the UI.
  }
}

function apply() {
  CLOTHING_OPTIONS.forEach(decorate);
  if (typeof document === "undefined") return;
  document.documentElement.dataset.globalFabricPhysics = "adaptive";
  const select = document.querySelector("#clothingSelect");
  if (select) {
    select.dispatchEvent(new Event("change", { bubbles:true }));
    queueMicrotask(() => document.querySelector("#rebuildBtn")?.click());
  }
}

apply();
