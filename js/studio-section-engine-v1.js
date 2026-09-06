import { SECTION_REGISTRY, getSection } from "./sections/index.js";

export const STUDIO_SECTION_DEFAULTS = Object.freeze({ studioSection:"solo" });
export const STUDIO_SECTION_OPTIONS = Object.freeze(
  Object.values(SECTION_REGISTRY).map((section) => Object.freeze({
    value:section.id,
    label:section.label,
    description:section.description
  }))
);

function normalizeLegacyScene(value) {
  return String(value || "") === "my_bedroom_text" ? "bedroom" : String(value || "");
}

export function normalizeStudioSectionState(raw = {}) {
  const requested = String(raw.studioSection || "");
  const activeSection = getSection(requested) || getSection(STUDIO_SECTION_DEFAULTS.studioSection);
  const studioSection = activeSection.id;
  const ui = activeSection.rules?.ui || {};
  const requestedScene = normalizeLegacyScene(raw.scene);
  const sectionScene = ui.showScenePicker && activeSection.scenes.includes(requestedScene)
    ? requestedScene
    : (ui.scene || activeSection.scenes[0] || requestedScene || "street");
  const state = {
    ...raw,
    studioSection,
    scenarioMode:ui.scenarioMode || "custom",
    scene:sectionScene,
    groupMode:ui.groupMode || "single",
    captureMode:ui.captureMode || "normal"
  };
  if (ui.customFallback && !String(state.customScene || "").trim()) state.customScene = ui.customFallback;
  if (state.groupMode !== "group") {
    state.groupCount = "3";
    state.cameraHolder = "A";
    state.groupArrangement = "natural-auto";
    state.groupInteraction = "casual";
    state.groupAutoFix = "on";
  }
  if (state.captureMode !== "accidental") {
    state.accidentalTrigger = "pocket";
    state.accidentalPhonePosition = "rising";
    state.accidentalMotion = "subtle";
    state.accidentalTilt = "auto";
    state.accidentalFocus = "transition-face";
    state.accidentalExposure = "auto-imperfect";
    state.accidentalIntensity = "natural";
  }
  return state;
}

export function buildStudioSectionLock(raw = {}) {
  const state = normalizeStudioSectionState(raw);
  const active = getSection(state.studioSection);
  const disabled = Object.values(SECTION_REGISTRY)
    .filter((section) => section.id !== state.studioSection)
    .map((section) => section.label.replace(/^\S+\s/u, ""));
  return {
    state,
    positive:`[EXCLUSIVE STUDIO SECTION]\nActive photography section: ${active.label}. This is the only active section. Load only its pose catalog, clothing catalog, lighting catalog, capture geometry and scene physics. Disabled sections: ${disabled.join(", ")}. Never import retained browser values, rules, objects, people or environmental geometry from a disabled section.`,
    negative:disabled.map((label) => `inactive ${label} section leakage`),
    qa:[{ label:"قسم التصوير", value:`${active.label} — يعمل منفردًا` }]
  };
}

if (typeof document !== "undefined") {
  queueMicrotask(() => { void import("./phase22-ui-runtime.js"); });
}
