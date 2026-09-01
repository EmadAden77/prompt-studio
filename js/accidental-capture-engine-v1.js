const find = (options, value) => options.find((item) => item.value === value) ?? options[0];

export const ACCIDENTAL_DEFAULTS = Object.freeze({
  captureMode:"normal", accidentalTrigger:"pocket", accidentalPhonePosition:"rising", accidentalMotion:"subtle",
  accidentalTilt:"auto", accidentalFocus:"transition-face", accidentalExposure:"auto-imperfect",
  accidentalIntensity:"natural", accidentalDevice:"xiaomi"
});

export const ACCIDENTAL_TRIGGER_OPTIONS = [
  { value:"pocket", label:"أثناء إخراج الهاتف من الجيب", text:"the front camera was already open and the shutter fired while the phone was being pulled from a pocket" },
  { value:"table", label:"أثناء رفع الهاتف من الطاولة", text:"the shutter fired just after the phone was lifted from a table, before the wrist reached a normal selfie orientation" },
  { value:"quick-open", label:"أثناء فتح الكاميرا بسرعة", text:"the shutter fired during a rushed front-camera launch before framing and autofocus settled" },
  { value:"accidental-touch", label:"لمسة تصوير بالخطأ", text:"an unintended screen or volume-button press fired the shutter while the phone was still being repositioned" }
];
export const ACCIDENTAL_POSITION_OPTIONS = [
  { value:"waist", label:"عند مستوى الخصر", text:"temporarily near waist height, pitched upward" },
  { value:"low-chest", label:"أسفل الصدر", text:"temporarily below chest level, pitched upward" },
  { value:"rising", label:"أثناء الارتفاع", text:"moving upward between waist and chest height before reaching a normal selfie position" }
];
export const ACCIDENTAL_MOTION_OPTIONS = [
  { value:"subtle", label:"حركة خفيفة", text:"subtle upward-diagonal handheld softness, with recognizable facial detail" },
  { value:"medium", label:"حركة متوسطة", text:"moderate but plausible directional handheld blur without making the person unrecognizable" }
];
export const ACCIDENTAL_TILT_OPTIONS = [
  { value:"auto", label:"تلقائي", text:"a small tilt derived from the unfinished wrist rotation" },
  { value:"right", label:"ميل لليمين", text:"a small clockwise roll caused by the unfinished wrist rotation" },
  { value:"left", label:"ميل لليسار", text:"a small counter-clockwise roll caused by the unfinished wrist rotation" }
];
export const ACCIDENTAL_FOCUS_OPTIONS = [
  { value:"transition-face", label:"ينتقل نحو الوجه", text:"autofocus is transitioning toward the face, which remains recognizable but mildly soft" },
  { value:"shirt", label:"على القميص مؤقتًا", text:"autofocus briefly remains on the shirt or upper torso, leaving the face slightly softer" },
  { value:"background", label:"على الخلفية مؤقتًا", text:"autofocus briefly catches a nearby background plane before moving toward the face" }
];
export const ACCIDENTAL_EXPOSURE_OPTIONS = [
  { value:"auto-imperfect", label:"تلقائي غير مثالي", text:"automatic exposure is still settling, with modest highlight clipping and reduced shadow detail where physically caused" },
  { value:"window-clipped", label:"النافذة محروقة قليلًا", text:"the bright window is partially clipped while the room and face remain slightly underexposed" },
  { value:"face-dark", label:"الوجه أغمق من المثالي", text:"the face is modestly darker than ideal because the phone meters the brighter background" },
  { value:"mixed-wb", label:"توازن أبيض غير مستقر", text:"mixed daylight and indoor practical light produce a slightly imperfect automatic white balance" }
];
export const ACCIDENTAL_INTENSITY_OPTIONS = [
  { value:"natural", label:"عفوية طبيعية", text:"plausibly imperfect but still an ordinary usable phone photo" },
  { value:"careless", label:"مهملة جدًا", text:"a forgettable photo a person might normally delete, while remaining physically plausible rather than artificially ruined" }
];
export const ACCIDENTAL_DEVICE_OPTIONS = [
  { value:"xiaomi", label:"Xiaomi 15 Ultra", text:"Xiaomi 15 Ultra front camera, 22–24mm equivalent, f/2.0" },
  { value:"iphone", label:"iPhone 15 Pro Max", text:"iPhone 15 Pro Max front camera, 23–24mm equivalent smartphone perspective" }
];

export function isAccidentalCapture(state = {}) { return state.captureMode === "accidental"; }
export function normalizeAccidentalState(raw = {}) {
  const state = { ...ACCIDENTAL_DEFAULTS, ...raw };
  const valid = (options, key, fallback) => { if (!options.some((item) => item.value === state[key])) state[key] = fallback; };
  if (!["normal", "accidental"].includes(state.captureMode)) state.captureMode = "normal";
  valid(ACCIDENTAL_TRIGGER_OPTIONS, "accidentalTrigger", ACCIDENTAL_DEFAULTS.accidentalTrigger);
  valid(ACCIDENTAL_POSITION_OPTIONS, "accidentalPhonePosition", ACCIDENTAL_DEFAULTS.accidentalPhonePosition);
  valid(ACCIDENTAL_MOTION_OPTIONS, "accidentalMotion", ACCIDENTAL_DEFAULTS.accidentalMotion);
  valid(ACCIDENTAL_TILT_OPTIONS, "accidentalTilt", ACCIDENTAL_DEFAULTS.accidentalTilt);
  valid(ACCIDENTAL_FOCUS_OPTIONS, "accidentalFocus", ACCIDENTAL_DEFAULTS.accidentalFocus);
  valid(ACCIDENTAL_EXPOSURE_OPTIONS, "accidentalExposure", ACCIDENTAL_DEFAULTS.accidentalExposure);
  valid(ACCIDENTAL_INTENSITY_OPTIONS, "accidentalIntensity", ACCIDENTAL_DEFAULTS.accidentalIntensity);
  valid(ACCIDENTAL_DEVICE_OPTIONS, "accidentalDevice", ACCIDENTAL_DEFAULTS.accidentalDevice);
  return state;
}

export function buildAccidentalCaptureEnhancement(raw = {}) {
  const state = normalizeAccidentalState(raw);
  if (!isAccidentalCapture(state)) return { state, positive:"", negative:[], qa:[] };
  const trigger = find(ACCIDENTAL_TRIGGER_OPTIONS, state.accidentalTrigger);
  const position = find(ACCIDENTAL_POSITION_OPTIONS, state.accidentalPhonePosition);
  const motion = find(ACCIDENTAL_MOTION_OPTIONS, state.accidentalMotion);
  const tilt = find(ACCIDENTAL_TILT_OPTIONS, state.accidentalTilt);
  const focus = find(ACCIDENTAL_FOCUS_OPTIONS, state.accidentalFocus);
  const exposure = find(ACCIDENTAL_EXPOSURE_OPTIONS, state.accidentalExposure);
  const intensity = find(ACCIDENTAL_INTENSITY_OPTIONS, state.accidentalIntensity);
  const device = find(ACCIDENTAL_DEVICE_OPTIONS, state.accidentalDevice);
  const positive = `[ACCIDENTAL CAPTURE EVENT — CAPTURE AUTHORITY]\nThis is not a deliberately composed selfie. ${trigger.text}. At shutter time the phone is ${position.text}; the wrist has not finished rotating toward a normal selfie orientation. Use the ${device.text}. The subject has not fully realized that the shutter fired: his eyes may pass near the screen but do not deliberately lock onto the lens, and his expression remains incomplete rather than posed or theatrically surprised. The composition is caused by the unfinished movement: the face and upper torso may enter off-center from a lower edge, vertical lines may tilt, the torso may be cropped, and extra ceiling or side space may remain. Do not deliberately arrange these defects as an artistic composition. Motion behavior: ${motion.text}; use one coherent motion direction across subject edges and nearby background, never selective decorative blur. Tilt behavior: ${tilt.text}. Focus behavior: ${focus.text}. Exposure behavior: ${exposure.text}. The face, clothing and environment must pass through the same single camera pipeline and shutter instant. Background elements are conditional, not a checklist: show only the few room or scene details physically reached by this temporary upward-facing field of view. The result should be ${intensity.text}. Capture imperfection overrides aesthetics, but physical plausibility overrides random damage.`;
  const negative = ["deliberately staged bad photo", "artistic careless composition", "posed surprise", "direct intentional lens gaze", "selective face-only motion blur", "uniform decorative blur", "random film grain", "all background objects forced into frame", "professionally balanced exposure", "cinematic accidental snapshot", "third-person camera viewpoint", "phone visible without physical reason"];
  const qa = [
    { label:"نمط الالتقاط", value:"لقطة عفوية بالخطأ" }, { label:"سبب اللقطة", value:trigger.label },
    { label:"الهاتف", value:device.label }, { label:"الحركة والتركيز", value:`${motion.label} · ${focus.label}` },
    { label:"التعريض", value:exposure.label }, { label:"سببية العفوية", value:"موضع الهاتف ودوران المعصم والحركة والتركيز والتعريض تنتمي للحظة واحدة" }
  ];
  return { state, positive, negative, qa };
}

export function applyAccidentalDeviceAuthority(prompt, state = {}) {
  if (!isAccidentalCapture(state) || state.accidentalDevice !== "iphone") return prompt;
  return prompt.replaceAll("Xiaomi 15 Ultra", "iPhone 15 Pro Max").replaceAll("21mm eq · f/2.0", "23–24mm eq front camera");
}
