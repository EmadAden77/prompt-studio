import {
  VISUAL_SELFIE_DEFAULTS,
  bindVisualSelfieAngleMonitor,
  buildVisualSelfieGeometrySection,
  mountVisualSelfieAngleMonitor,
  normalizeVisualSelfieState,
  readVisualSelfieUiState,
  selfieAnglePreset,
  visualSelfieQa
} from "./visual-selfie-angle-monitor-v1.js?v=20260901-fix1";

// AUTO REALISM SUITE v1
// High-level orchestration layer for the existing physical realism engines.
// It does not replace identity, anatomy, camera, lighting, WikiPrompt, or scene rules.

export const AUTO_REALISM_DEFAULTS = Object.freeze({
  ...VISUAL_SELFIE_DEFAULTS,
  autoRealism:"on",
  realismPreset:"raw-smartphone",
  generatorProfile:"chatgpt",
  promptCompression:"full",
  continuityMode:"on",
  variationMode:"none",
  lockIdentity:"on",
  lockScene:"on",
  lockClothing:"on",
  lockLighting:"on",
  lockExpression:"off"
});

const PRESET_RULES = Object.freeze({
  natural:`NATURAL EVERYDAY: prefer an ordinary believable personal photo. Keep imperfections subtle, expressions unforced, environment lived-in, and processing restrained.`,
  "raw-smartphone":`RAW SMARTPHONE: prioritize physically credible front-camera capture, ordinary handheld framing, realistic auto-exposure tradeoffs, mild sensor/ISP artifacts, natural asymmetry and zero beauty-treatment behavior.`,
  "high-physical":`HIGH PHYSICAL REALISM: solve support, gravity, contact, reach, perspective, light direction, occlusion and material response before aesthetic choices. Reject any visually attractive result that requires impossible geometry.`,
  "reference-critical":`REFERENCE-CRITICAL: reference fidelity outranks beautification and style. Preserve identity-defining structure and all selected scene/clothing/lighting authorities; do not invent improvements, symmetry, density or replacement details.`
});

const GENERATOR_RULES = Object.freeze({
  chatgpt:`CHATGPT IMAGE ADAPTER: use clear natural-language constraints, preserve the authority hierarchy, and treat the prompt as one coherent photograph rather than independent visual keywords.`,
  gemini:`GEMINI IMAGE ADAPTER: keep instructions literal and causally connected. Preserve reference roles exactly and avoid decorative detail that is not caused by the selected scene, pose or light.`,
  grok:`GROK IMAGE ADAPTER: prioritize candid smartphone behavior, direct subject-held camera geometry, ordinary environment detail and physically caused imperfections over cinematic polish.`,
  midjourney:`MIDJOURNEY ADAPTER: preserve hard constraints before style tokens. Interpret the scene as candid smartphone photography with restrained stylization; do not let aesthetic shorthand override identity, anatomy, camera reach or lighting.`,
  flux:`FLUX ADAPTER: prefer concise literal visual constraints, physically explicit relationships and stable reference roles. Do not infer glamour, studio light or third-person camera behavior.`
});

const VARIATION_RULES = Object.freeze({
  none:"",
  eye_level:`VARIATION DELTA: keep every locked field unchanged. Use a natural eye-level subject-held selfie angle only.`,
  slight_high:`VARIATION DELTA: keep every locked field unchanged. Move the phone only slightly above eye level with a mild downward pitch that remains reachable at arm's length.`,
  three_quarter:`VARIATION DELTA: keep every locked field unchanged. Shift to a natural three-quarter selfie relationship by changing phone lateral position and face yaw only; do not turn it into a third-person portrait.`,
  close_crop:`VARIATION DELTA: keep every locked field unchanged. Use a closer but still physically reachable crop; do not widen the lens behavior or invent missing body/background details.`,
  slight_low:`VARIATION DELTA: keep every locked field unchanged. Use a mildly lower phone position with plausible upward pitch; avoid exaggerated low-angle distortion.`
});

const ESSENTIAL_LINE = /(IDENTITY|REFERENCE|AUTHORITY|SELFIE|CAMERA|ANATOM|LIGHT|CONTACT|GRAVITY|POSE|PHONE|LOCK|PRIORITY|DRIVER|STEERING|MIRROR|WIKIPROMPT)/i;

function boolValue(value, fallback = "off") {
  return value === "on" || value === true ? "on" : value === "off" || value === false ? "off" : fallback;
}

function optionValue(map, value, fallback) {
  return Object.prototype.hasOwnProperty.call(map, value) ? value : fallback;
}

function isDriverCarState(state = {}) {
  const section = String(state.studioSection || "").toLowerCase();
  const scene = String(state.scene || "").toLowerCase();
  return String(state.carSeat || "") === "driver-left"
    && (section === "car" || /range.?rover|(?:^|[-_])car(?:[-_]|$)/u.test(scene));
}

export function normalizeAutoRealismState(rawState = {}) {
  let visual = normalizeVisualSelfieState(rawState);
  const variationMode = optionValue(VARIATION_RULES, rawState.variationMode, AUTO_REALISM_DEFAULTS.variationMode);
  const variationAngles = { eye_level:"eye", slight_high:"slight-high", three_quarter:"three-quarter", slight_low:"slight-low" };
  if (visual.visualMonitorSync === "on" && variationAngles[variationMode]) {
    const preset = selfieAnglePreset(variationAngles[variationMode]);
    visual = normalizeVisualSelfieState({ ...visual, selfieDistanceCm:preset.distance, selfieYawDeg:preset.yaw, selfiePitchDeg:preset.pitch, selfieRollDeg:preset.roll, faceYawDeg:preset.faceYaw });
  }
  return {
    ...visual,
    autoRealism:boolValue(rawState.autoRealism, AUTO_REALISM_DEFAULTS.autoRealism),
    realismPreset:optionValue(PRESET_RULES, rawState.realismPreset, AUTO_REALISM_DEFAULTS.realismPreset),
    generatorProfile:optionValue(GENERATOR_RULES, rawState.generatorProfile, AUTO_REALISM_DEFAULTS.generatorProfile),
    promptCompression:["full","compact","ultra"].includes(rawState.promptCompression) ? rawState.promptCompression : AUTO_REALISM_DEFAULTS.promptCompression,
    continuityMode:boolValue(rawState.continuityMode, AUTO_REALISM_DEFAULTS.continuityMode),
    variationMode,
    lockIdentity:boolValue(rawState.lockIdentity, AUTO_REALISM_DEFAULTS.lockIdentity),
    lockScene:boolValue(rawState.lockScene, AUTO_REALISM_DEFAULTS.lockScene),
    lockClothing:boolValue(rawState.lockClothing, AUTO_REALISM_DEFAULTS.lockClothing),
    lockLighting:boolValue(rawState.lockLighting, AUTO_REALISM_DEFAULTS.lockLighting),
    lockExpression:boolValue(rawState.lockExpression, AUTO_REALISM_DEFAULTS.lockExpression)
  };
}

function buildReferenceAuthorityMap(state) {
  const sceneAuthority = state.customScene ? `user custom scene description (${state.customScene})` : `selected scene (${state.scene})`;
  const poseCameraAuthority = isDriverCarState(state)
    ? `car-driver geometry resolver: selected angle (${state.selfieAngle}) + composition (${state.composition}), with one reachable numeric vector and a mandatory steering-wheel anchor`
    : `selected pose (${state.pose}) + selfie angle (${state.selfieAngle}) + composition (${state.composition})`;
  return `[REFERENCE AUTHORITY MAP]
- IMAGE A = identity only: facial structure, apparent age, skin identity, hairline/density and facial-hair pattern. Never borrow scene, clothing or lighting from IMAGE A unless explicitly selected elsewhere.
- Environment authority = ${sceneAuthority}.
- Pose/camera authority = ${poseCameraAuthority}.
- Clothing authority = selected clothing (${state.clothing}) and its fabric/fit controls.
- Lighting authority = selected lighting (${state.lighting}) at ${state.time}.
- Vehicle/room geometry, when applicable, remains subordinate to the selected scene-specific physical engine and must never rewrite identity.`;
}

function buildAutoRealismRule(state) {
  if (state.autoRealism !== "on") return "";
  const accessoryRule = state.accessoryProfile && state.accessoryProfile !== "none"
    ? "Keep only the selected accessory or object secondary and physically supported; never add a second styling accessory, product prop, free hand or duplicate item."
    : "Do not invent accessories, jewelry, fitness trackers, products, handheld props or a second free hand merely to make the image feel styled or active.";
  const driverRule = isDriverCarState(state)
    ? "For a car-driver selfie, preserve the dedicated driver geometry, the unmirrored left-hand-drive mapping and the steering-wheel anchor without exception."
    : "";
  return `[AUTO REALISM]
Resolve every unspecified detail through physical causality instead of decorative invention. Camera reach determines viewpoint; body support determines posture; gravity/contact determine fabric and tissue displacement; selected light determines every highlight, shadow and reflection; distance determines visible detail. If a requested secondary detail conflicts with identity, anatomy, selfie geometry, scene authority or lighting, omit or correct the secondary detail automatically.

CONTEXT RESOLUTION: Use contextual defaults only for unspecified secondary detail. Never replace selected clothing, lighting, expression, scene, camera geometry, seat position or reference identity with generic assumptions such as a hoodie, window light, a hand near the face, gym styling or a product display.

VISIBILITY GATE: Add a background object, person, exterior slice or scene cue only when it belongs to the selected location and the real selfie crop can physically reveal it. Keep the face primary; omit secondary context instead of widening the camera, changing the pose or forcing a complete room, vehicle or street view.

ACCESSORY GATE: ${accessoryRule}

IMPERFECTION BUDGET: Use at most two subtle, physically caused imperfections that are visible at this distance. Never stack sweat, dust, fingerprints, haze, moisture, wind, clutter and wrinkles as decorative effects.

MIRROR / TEXT SAFETY: If a mirror naturally enters the crop, use one coherent reflection path and keep all reflected geometry physically consistent. Do not force clothing text to be readable; omit incidental typography when reflection legibility would create a contradiction.

${driverRule}`.replace(/\n\n$/u, "");
}

function buildLockRule(state) {
  const locks = [];
  if (state.lockIdentity === "on") locks.push("identity/reference face structure");
  if (state.lockScene === "on") locks.push("scene/place/vehicle-or-room context");
  if (state.lockClothing === "on") locks.push("clothing selection and material family");
  if (state.lockLighting === "on") locks.push("time and selected lighting event");
  if (state.lockExpression === "on") locks.push("expression");
  if (!locks.length) return "";
  return `[LOCKED FIELDS]
Keep unchanged across regeneration and variations: ${locks.join(", ")}. A variation may modify only the explicitly requested delta. Never silently trade a locked field for a prettier composition.`;
}

function buildContinuityRule(state) {
  if (state.continuityMode !== "on") return "";
  return `[SCENE CONTINUITY]
Treat this prompt as one frame from a continuous real session. Preserve the same person, selected place, clothing, time-of-day and lighting logic between variants. Keep vehicle/room topology, material identity and left/right orientation stable. Change only the selected variation delta and whatever minor occlusion/crop naturally follows from that camera move.`;
}

function buildGeneratorRule(state) {
  return `[GENERATOR PROFILE]
${GENERATOR_RULES[state.generatorProfile]}`;
}

function dedupeLines(prompt) {
  const seen = new Set();
  return String(prompt || "").split("\n").filter((line) => {
    const key = line.trim().replace(/\s+/g, " ").toLowerCase();
    if (!key) return true;
    if (ESSENTIAL_LINE.test(line)) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function compressPrompt(prompt, mode) {
  const deduped = dedupeLines(prompt);
  if (mode === "full") return deduped;
  const withoutDiagnostics = deduped
    .split("\n")
    .filter((line) => !/^\[REALISM RISK CHECK\]/i.test(line.trim()))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (mode === "compact") return withoutDiagnostics;
  return withoutDiagnostics
    .split("\n")
    .filter((line) => line.trim() === "" || ESSENTIAL_LINE.test(line) || !/^\[(?:ENVIRONMENT MICROPHYSICS|REALISM SCORE|OPTIMIZER)/i.test(line.trim()))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function applyAutoRealismSuite({ positive = "", negative = "", state:rawState = {}, risk = null, conflicts = [] } = {}) {
  const state = normalizeAutoRealismState(rawState);
  const sections = [
    buildReferenceAuthorityMap(state),
    buildAutoRealismRule(state),
    buildVisualSelfieGeometrySection(state),
    PRESET_RULES[state.realismPreset] ? `[REALISM PRESET]\n${PRESET_RULES[state.realismPreset]}` : "",
    buildLockRule(state),
    buildContinuityRule(state),
    VARIATION_RULES[state.variationMode] ? `[ONE-CLICK VARIATION]\n${VARIATION_RULES[state.variationMode]}` : "",
    buildGeneratorRule(state)
  ].filter(Boolean).join("\n\n");

  const combined = sections ? `${sections}\n\n${positive}` : positive;
  const compressed = compressPrompt(combined, state.promptCompression);
  const negativeExtras = [
    "reference-role mixing",
    "locked-field drift",
    "continuity break between variants",
    "third-person viewpoint replacing subject-held selfie",
    "decorative imperfection without physical cause",
    "decorative imperfection checklist",
    "background context forced outside the selfie field of view",
    "invented generic accessory or product prop",
    "forced readable clothing text in a mirror reflection",
    "camera outside natural arm reach",
    "visual selfie monitor geometry ignored",
    "impossible selfie yaw pitch or roll"
  ];
  const finalNegative = [...new Set([...String(negative || "").split(/,\s*/).filter(Boolean), ...negativeExtras])].join(", ");

  return {
    state,
    positive:compressed,
    negative:finalNegative,
    qa:[
      { label:"AUTO REALISM", value:state.autoRealism === "on" ? "مفعّل؛ يحل التفاصيل غير المحددة بالفيزياء" : "متوقف" },
      { label:"Reference Mapper", value:"IMAGE A للهوية فقط؛ المشهد/الملابس/الإضاءة سلطات مستقلة" },
      { label:"Context Resolver", value:"يفترض التفاصيل الثانوية فقط؛ لا يبدّل الاختيارات المقفلة أو يضيف قوالب جاهزة" },
      { label:"Visibility Gate", value:"الخلفية والعناصر تظهر فقط عندما يسمح الكادر الحقيقي؛ الوجه أولوية" },
      { label:"Accessory Gate", value:state.accessoryProfile && state.accessoryProfile !== "none" ? "الإكسسوار المختار فقط؛ بلا نسخ أو إضافات تلقائية" : "لا إكسسوارات أو أدوات تلقائية" },
      { label:"Imperfection Budget", value:"حد أقصى أثرين واقعيين بسيطين حسب المسافة والإضاءة" },
      ...visualSelfieQa(state),
      { label:"Generator", value:state.generatorProfile },
      { label:"Prompt Compression", value:`${state.promptCompression} · ضغط آمن لا يحذف أقفال الهوية والكاميرا والإضاءة` },
      { label:"Continuity", value:state.continuityMode === "on" ? "مقفل عبر التنويعات" : "غير مقفل" },
      { label:"Locked Fields", value:[state.lockIdentity === "on" && "الهوية", state.lockScene === "on" && "المشهد", state.lockClothing === "on" && "الملابس", state.lockLighting === "on" && "الإضاءة", state.lockExpression === "on" && "التعبير"].filter(Boolean).join("، ") || "لا يوجد" },
      { label:"Variation", value:state.variationMode === "none" ? "لا يوجد" : state.variationMode },
      { label:"Auto Fix", value:conflicts.length ? `تم تمرير ${conflicts.length} تعارض مصحح من المحركات الأساسية` : "لا توجد تعارضات أساسية متبقية" },
      { label:"Realism Score", value:risk ? `${risk.score}/100 · ${risk.level}` : "يحسبه محرك Advanced Realism" }
    ],
    meta:{
      preset:state.realismPreset,
      generator:state.generatorProfile,
      compression:state.promptCompression,
      variation:state.variationMode,
      selfieGeometry:`${state.selfieDistanceCm}cm/Y${state.selfieYawDeg}/P${state.selfiePitchDeg}/R${state.selfieRollDeg}`
    }
  };
}

function selectField(id, label, options, value) {
  const opts = options.map(([v,t]) => `<option value="${v}"${v === value ? " selected" : ""}>${t}</option>`).join("");
  return `<label class="field" for="${id}"><span>${label}</span><select id="${id}" name="${id}">${opts}</select></label>`;
}

function toggleField(id, label, value, hint = "") {
  return `<label class="field" for="${id}"><span>${label}</span><select id="${id}" name="${id}"><option value="on"${value === "on" ? " selected" : ""}>مفعّل</option><option value="off"${value === "off" ? " selected" : ""}>متوقف</option></select>${hint ? `<small>${hint}</small>` : ""}</label>`;
}

export function mountAutoRealismSuite(form) {
  if (!form || typeof document === "undefined") return;
  mountVisualSelfieAngleMonitor(form);
  if (document.querySelector("#auto-realism-suite")) return;
  const section = document.createElement("section");
  section.className = "panel priority-panel";
  section.id = "auto-realism-suite";
  section.setAttribute("aria-labelledby", "auto-realism-title");
  section.innerHTML = `
    <div class="section-heading"><div><span class="section-number">06A</span><h2 id="auto-realism-title">AUTO REALISM</h2></div><p>طبقة التحكم العليا: خريطة المراجع، أقفال الحقول، الاستمرارية، ملفات المولدات والتنويعات.</p></div>
    <div class="selfie-guidance" role="note">لا تستبدل هذه الطبقة محركات الفيزياء الحالية؛ تنظمها فقط وتمنع تغيّر ما تم قفله أثناء التنويعات.</div>
    <div class="form-grid">
      ${toggleField("auto-realism", "Master AUTO REALISM", AUTO_REALISM_DEFAULTS.autoRealism, "يحل التفاصيل غير المحددة وفق الفيزياء والسياق.")}
      ${selectField("realism-preset", "Realism Preset", [["natural","Natural Everyday"],["raw-smartphone","Raw Smartphone"],["high-physical","High Physical Realism"],["reference-critical","Reference-Critical"]], AUTO_REALISM_DEFAULTS.realismPreset)}
      ${selectField("generator-profile", "Generator Profile", [["chatgpt","ChatGPT Image"],["gemini","Gemini"],["grok","Grok"],["midjourney","Midjourney"],["flux","FLUX"]], AUTO_REALISM_DEFAULTS.generatorProfile)}
      ${selectField("prompt-compression", "Prompt Compression", [["full","Full"],["compact","Compact"],["ultra","Ultra Compact"]], AUTO_REALISM_DEFAULTS.promptCompression)}
      ${toggleField("continuity-mode", "Scene Continuity", AUTO_REALISM_DEFAULTS.continuityMode, "يحافظ على نفس الجلسة والمكان والوقت بين النسخ.")}
      ${selectField("variation-mode", "One-Click Variation", [["none","بدون تنويع"],["eye_level","Eye level"],["slight_high","Slight high"],["three_quarter","Three-quarter"],["close_crop","Close crop"],["slight_low","Slight low"]], AUTO_REALISM_DEFAULTS.variationMode)}
      <div class="field field-span-2"><span>Reference Mapper</span><div class="readonly-card">IMAGE A = الهوية فقط · Scene = المكان · Clothing = الملابس · Lighting = الإضاءة · Pose/Camera = هندسة الالتقاط</div><small>يمنع خلط هوية الشخص مع بيئة أو ملابس المرجع.</small></div>
      ${toggleField("lock-identity", "🔒 الهوية", AUTO_REALISM_DEFAULTS.lockIdentity)}
      ${toggleField("lock-scene", "🔒 المشهد", AUTO_REALISM_DEFAULTS.lockScene)}
      ${toggleField("lock-clothing", "🔒 الملابس", AUTO_REALISM_DEFAULTS.lockClothing)}
      ${toggleField("lock-lighting", "🔒 الإضاءة", AUTO_REALISM_DEFAULTS.lockLighting)}
      ${toggleField("lock-expression", "🔒 التعبير", AUTO_REALISM_DEFAULTS.lockExpression)}
      <div class="field"><span>التنويعات</span><button type="button" class="secondary-button compact-button" id="next-realism-variation">التنويع التالي</button><small>يبدل زاوية واحدة فقط ويحافظ على الحقول المقفلة.</small></div>
      <div class="field field-span-2"><span>الطبقات المعاد استخدامها</span><div class="readonly-card">WikiPrompt · Visual Selfie Angle Monitor · Selfie Geometry · Contact Physics · Lighting Physics · Advanced Realism · Realism Score</div><small>لا ازدواجية: AUTO REALISM ينسق المحركات الموجودة بدل تكرارها.</small></div>
    </div>`;

  const contextPanel = form.querySelector(".context-secondary-panel");
  if (contextPanel?.parentNode) contextPanel.parentNode.insertBefore(section, contextPanel);
  else form.append(section);

  if (!document.querySelector("#auto-realism-suite-style")) {
    const style = document.createElement("style");
    style.id = "auto-realism-suite-style";
    style.textContent = `#auto-realism-suite .readonly-card{line-height:1.75}#auto-realism-suite .compact-button{width:100%;min-height:44px}`;
    document.head.append(style);
  }
}

export function readAutoRealismUiState(root = document) {
  const read = (id, fallback) => root.querySelector(`#${id}`)?.value ?? fallback;
  return normalizeAutoRealismState({
    ...readVisualSelfieUiState(root),
    autoRealism:read("auto-realism", AUTO_REALISM_DEFAULTS.autoRealism),
    realismPreset:read("realism-preset", AUTO_REALISM_DEFAULTS.realismPreset),
    generatorProfile:read("generator-profile", AUTO_REALISM_DEFAULTS.generatorProfile),
    promptCompression:read("prompt-compression", AUTO_REALISM_DEFAULTS.promptCompression),
    continuityMode:read("continuity-mode", AUTO_REALISM_DEFAULTS.continuityMode),
    variationMode:read("variation-mode", AUTO_REALISM_DEFAULTS.variationMode),
    lockIdentity:read("lock-identity", AUTO_REALISM_DEFAULTS.lockIdentity),
    lockScene:read("lock-scene", AUTO_REALISM_DEFAULTS.lockScene),
    lockClothing:read("lock-clothing", AUTO_REALISM_DEFAULTS.lockClothing),
    lockLighting:read("lock-lighting", AUTO_REALISM_DEFAULTS.lockLighting),
    lockExpression:read("lock-expression", AUTO_REALISM_DEFAULTS.lockExpression)
  });
}

export function bindAutoRealismSuite(onChange) {
  if (typeof document === "undefined") return;
  const ids = ["auto-realism","realism-preset","generator-profile","prompt-compression","continuity-mode","variation-mode","lock-identity","lock-scene","lock-clothing","lock-lighting","lock-expression"];
  ids.forEach((id) => document.querySelector(`#${id}`)?.addEventListener("change", () => onChange?.()));
  document.querySelector("#next-realism-variation")?.addEventListener("click", () => {
    const select = document.querySelector("#variation-mode");
    if (!select) return;
    const values = ["none","eye_level","slight_high","three_quarter","close_crop","slight_low"];
    select.value = values[(values.indexOf(select.value) + 1) % values.length];
    onChange?.();
  });
  bindVisualSelfieAngleMonitor(onChange,document);
}
