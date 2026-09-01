import { SCENES, sceneFamily } from "./wiki-selfie-data-v1.js";

export const SCENARIO_DEFAULTS = Object.freeze({ scenarioMode:"bedroom" });
export const SCENARIO_OPTIONS = Object.freeze([
  { value:"bedroom", label:"🏠 غرفة النوم", description:"السرير والاستلقاء والملابس المنزلية وإضاءة الغرفة" },
  { value:"car", label:"🚙 السيارة", description:"المقاعد والمقصورة ووضعيات وإضاءة السيارة" },
  { value:"street", label:"🌆 الخارج والشارع", description:"الوقوف والمشي والمواقف والإضاءة الخارجية" },
  { value:"gym", label:"🏋️ الجيم", description:"الوضعيات والملابس والإضاءة الرياضية" },
  { value:"custom", label:"✍️ مشهد مخصص", description:"مكان يكتبه المستخدم مع قواعد مستقلة" }
]);

const DEFAULT_SCENES = Object.freeze({ bedroom:"my_bedroom_text", car:"rangeRover", street:"street", gym:"gym", custom:"custom" });
const FAMILY_LABELS = Object.freeze({ bedroom:"غرفة النوم", car:"السيارة", street:"الخارج والشارع", gym:"الجيم", custom:"المشهد المخصص" });

export function scenarioForScene(scene = "") {
  if (scene === "custom") return "custom";
  const family = sceneFamily(scene);
  return ["bedroom","car","street","gym"].includes(family) ? family : "bedroom";
}

export function getScenarioSceneOptions(scenarioMode = "bedroom") {
  if (scenarioMode === "custom") return [{ value:"custom", label:"✍️ مشهد مخصص" }];
  return Object.entries(SCENES)
    .filter(([, scene]) => scene.family === scenarioMode)
    .map(([value, scene]) => ({ value, label:scene.label }));
}

export function normalizeScenarioState(raw = {}) {
  const scenarioMode = SCENARIO_OPTIONS.some((item) => item.value === raw.scenarioMode) ? raw.scenarioMode : scenarioForScene(raw.scene);
  const allowedScenes = getScenarioSceneOptions(scenarioMode).map((item) => item.value);
  const scene = allowedScenes.includes(raw.scene) ? raw.scene : DEFAULT_SCENES[scenarioMode];
  const state = { ...raw, scenarioMode, scene };
  if (scenarioMode !== "car") state.carSeat = "";
  if (scenarioMode !== "bedroom") state.bedroomWindow = "";
  if (scenarioMode !== "custom") {
    state.customScene = ""; state.customSceneDetails = ""; state.sceneProfile = "auto";
  }
  return state;
}

export function buildScenarioLock(raw = {}) {
  const state = normalizeScenarioState(raw);
  const active = FAMILY_LABELS[state.scenarioMode];
  const disabled = SCENARIO_OPTIONS.filter((item) => item.value !== state.scenarioMode).map((item) => FAMILY_LABELS[item.value]);
  return {
    state,
    positive:`[ACTIVE SCENARIO LOCK]\nActive section: ${active}. Use only poses, clothing choices, lighting systems, environment physics and scene-specific modules belonging to this active section. Disabled sections: ${disabled.join(", ")}. Values retained by the browser or another section are invalid and must not enter the prompt. Group Selfie and Accidental Capture are capture modifiers inside the active section; they never unlock another environment section.`,
    negative:disabled.map((label) => `inactive ${label} section leakage`),
    qa:[{ label:"القسم النشط", value:`${active} — بقية الأقسام مقفلة` }]
  };
}
