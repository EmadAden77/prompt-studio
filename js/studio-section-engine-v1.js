export const STUDIO_SECTION_DEFAULTS = Object.freeze({ studioSection:"solo" });
export const STUDIO_SECTION_OPTIONS = Object.freeze([
  { value:"solo", label:"🤳 السيلفي الفردي", description:"شخص واحد، وضعيات وزوايا وملابس وإضاءة خاصة بالسيلفي الفردي" },
  { value:"group", label:"👥 السيلفي الجماعي", description:"قسم مستقل لعدد الأشخاص وصاحب الهاتف وتوزيع المجموعة، مع اختيار المشهد" },
  { value:"car", label:"🚙 التصوير داخل السيارة", description:"مقاعد السيارة والمقصورة ووضعيات وإضاءة السيارة فقط" },
  { value:"carExterior", label:"🚘 سيلفي بجانب السيارة", description:"بجانب الرنج روفر 2017: مواقع الوقوف والوضعيات والإضاءة" },
  { value:"bedroom", label:"🏠 التصوير في غرفة النوم", description:"السرير والاستلقاء والأريكة وملابس وإضاءة الغرفة فقط" },
  { value:"gym", label:"🏋️ التصوير في الجيم", description:"وضعيات وملابس وإضاءة الجيم فقط" },
  { value:"street", label:"🌆 التصوير الخارجي والشارع", description:"الوقوف والمشي والمواقف والإضاءة الخارجية فقط" },
  { value:"accidental", label:"📱 اللقطة العفوية بالخطأ", description:"حركة الهاتف والتركيز والتعريض العرضي داخل مشهد يومي" },
  { value:"custom", label:"✍️ مشهد مخصص", description:"قسم مستقل لمكان يكتبه المستخدم" }
]);

const CONFIG = Object.freeze({
  solo:{ scenarioMode:"custom", scene:"custom", groupMode:"single", captureMode:"normal", customFallback:"an ordinary everyday location used only as minimal supporting context" },
  group:{ scenarioMode:"group", scene:"my_bedroom_text", groupMode:"group", captureMode:"normal" },
  car:{ scenarioMode:"car", scene:"rangeRover", groupMode:"single", captureMode:"normal" },
  carExterior:{ scenarioMode:"custom", scene:"custom", groupMode:"single", captureMode:"normal", customFallback:"a parked 2017 Range Rover exterior selfie setting" },
  bedroom:{ scenarioMode:"bedroom", scene:"my_bedroom_text", groupMode:"single", captureMode:"normal" },
  gym:{ scenarioMode:"gym", scene:"gym", groupMode:"single", captureMode:"normal" },
  street:{ scenarioMode:"street", scene:"street", groupMode:"single", captureMode:"normal" },
  accidental:{ scenarioMode:"custom", scene:"custom", groupMode:"single", captureMode:"accidental", customFallback:"an ordinary lived-in indoor room or everyday place" },
  custom:{ scenarioMode:"custom", scene:"custom", groupMode:"single", captureMode:"normal", customFallback:"an ordinary physically plausible user-defined location" }
});

export function normalizeStudioSectionState(raw = {}) {
  const studioSection = STUDIO_SECTION_OPTIONS.some((item) => item.value === raw.studioSection) ? raw.studioSection : STUDIO_SECTION_DEFAULTS.studioSection;
  const config = CONFIG[studioSection];
  const groupScenes = ["my_bedroom_text", "gym", "street"];
  const sectionScene = studioSection === "group" && groupScenes.includes(raw.scene) ? raw.scene : config.scene;
  const state = { ...raw, studioSection, scenarioMode:config.scenarioMode, scene:sectionScene, groupMode:config.groupMode, captureMode:config.captureMode };
  if (config.customFallback && !String(state.customScene || "").trim()) state.customScene = config.customFallback;
  if (studioSection !== "group") {
    state.groupCount = "3"; state.cameraHolder = "A"; state.groupArrangement = "natural-auto"; state.groupInteraction = "casual"; state.groupAutoFix = "on";
  }
  if (studioSection !== "accidental") {
    state.accidentalTrigger = "pocket"; state.accidentalPhonePosition = "rising"; state.accidentalMotion = "subtle"; state.accidentalTilt = "auto";
    state.accidentalFocus = "transition-face"; state.accidentalExposure = "auto-imperfect"; state.accidentalIntensity = "natural";
  }
  return state;
}

export function buildStudioSectionLock(raw = {}) {
  const state = normalizeStudioSectionState(raw);
  const active = STUDIO_SECTION_OPTIONS.find((item) => item.value === state.studioSection);
  const disabled = STUDIO_SECTION_OPTIONS.filter((item) => item.value !== state.studioSection).map((item) => item.label.replace(/^\S+\s/u, ""));
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
