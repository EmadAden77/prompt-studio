const option = (options, value) => options.find((item) => item.value === value) ?? options[0];

export const GROUP_SELFIE_DEFAULTS = Object.freeze({ groupMode:"single", groupCount:"3", cameraHolder:"A", groupArrangement:"natural-auto", groupInteraction:"casual", groupAutoFix:"on" });
export const GROUP_COUNT_OPTIONS = [2, 3, 4, 5].map((count) => ({ value:String(count), label:`${count} أشخاص` }));
export const CAMERA_HOLDER_OPTIONS = [
  { value:"A", label:"الشخص A — صاحب مرجع الهوية" }, { value:"B", label:"الشخص B" },
  { value:"auto", label:"تلقائي — يحدد المحرك صاحب الهاتف" }
];
export const GROUP_ARRANGEMENT_OPTIONS = [
  { value:"natural-auto", label:"تلقائي طبيعي", text:"an asymmetrical close cluster chosen from the available space" },
  { value:"close-cluster", label:"تجمع قريب", text:"a close, uneven cluster with natural shoulder overlap" },
  { value:"shoulder", label:"كتفاً إلى كتف", text:"a loose shoulder-to-shoulder arrangement without a perfectly straight row" },
  { value:"heads-in", label:"الرؤوس مائلة للداخل", text:"heads leaning inward by different small amounts to fit the real front-camera field of view" },
  { value:"one-behind", label:"شخص بالخلف", text:"one person slightly behind the foreground pair or cluster, naturally smaller from distance" },
  { value:"seated", label:"مجموعة جالسة", text:"a seated group sharing physically plausible support surfaces with partial torso occlusion" },
  { value:"mixed-depth", label:"أعماق مختلفة", text:"mixed camera distances with physically derived face scale and natural overlap" }
];
export const GROUP_INTERACTION_OPTIONS = [
  { value:"casual", label:"سيلفي عفوي", text:"a casual social pause with subtly different gaze directions and expressions" },
  { value:"camera", label:"ينظرون للكاميرا", text:"most people notice the camera, but their gaze precision and smiles remain naturally non-identical" },
  { value:"talking", label:"يتحدثون معاً", text:"one person is mid-conversation while the others react naturally" },
  { value:"laughing", label:"ضحك عفوي", text:"a spontaneous laugh at slightly different phases rather than synchronized identical laughter" },
  { value:"distracted", label:"شخص مشتت قليلاً", text:"one non-holder is slightly distracted while the others engage with the phone" },
  { value:"family", label:"سيلفي عائلي", text:"warm, ordinary family closeness without staged portrait symmetry" },
  { value:"friends", label:"سيلفي أصدقاء", text:"relaxed friendly interaction with small head leans and uneven spacing" },
  { value:"work", label:"سيلفي عمل", text:"restrained friendly expressions appropriate to a casual workplace moment" }
];

export function isGroupSelfie(state = {}) { return state.groupMode === "group"; }
export function normalizeGroupSelfieState(raw = {}) {
  const state = { ...GROUP_SELFIE_DEFAULTS, ...raw };
  if (!["single", "group"].includes(state.groupMode)) state.groupMode = "single";
  if (!GROUP_COUNT_OPTIONS.some((item) => item.value === String(state.groupCount))) state.groupCount = "3";
  if (!CAMERA_HOLDER_OPTIONS.some((item) => item.value === state.cameraHolder)) state.cameraHolder = "A";
  if (!GROUP_ARRANGEMENT_OPTIONS.some((item) => item.value === state.groupArrangement)) state.groupArrangement = "natural-auto";
  if (!GROUP_INTERACTION_OPTIONS.some((item) => item.value === state.groupInteraction)) state.groupInteraction = "casual";
  state.groupAutoFix = state.groupAutoFix === "off" ? "off" : "on";
  return state;
}

export function evaluateGroupRealism(raw = {}) {
  const state = normalizeGroupSelfieState(raw);
  if (!isGroupSelfie(state)) return { score:100, level:"فردي", action:"pass", warnings:[] };
  const count = Number(state.groupCount); let score = 100; const warnings = [];
  if (count >= 5) { score -= 18; warnings.push("⚠ GROUP FOV TIGHT — خمسة أشخاص يحتاجون تجمعاً شديد القرب وكادراً أوسع."); }
  else if (count === 4) { score -= 8; warnings.push("⚠ EDGE DISTORTION EXPECTED — الأشخاص عند الحواف قد يظهر عليهم تمدد واسع خفيف."); }
  if (count >= 4 && state.groupArrangement === "shoulder") { score -= 12; warnings.push("⚠ STRAIGHT ROW RISK — تم تحويل الصف المتساوي إلى أعماق ومسافات غير منتظمة."); }
  if (count >= 5 && state.groupArrangement === "seated") { score -= 8; warnings.push("⚠ BODY OVERLAP RISK — يلزم حجب طبيعي قوي للأجسام السفلية."); }
  if (state.cameraHolder === "auto") { score -= 5; warnings.push("⚠ SELFIE ARM OWNER AUTO — سيعين المحرك صاحب الهاتف قبل بناء الأذرع."); }
  if (state.groupInteraction === "camera") { score -= 4; warnings.push("⚠ SYNCHRONIZED GAZE RISK — ستبقى اتجاهات النظر والابتسامات غير متطابقة قليلاً."); }
  score = Math.max(0, score);
  return { score, level:score < 60 ? "محظور" : score < 75 ? "يحتاج تصحيح" : "سليم", action:score < 60 ? "block" : score < 75 ? "auto-fix" : "pass", warnings };
}

export function buildGroupSelfieEnhancement(raw = {}) {
  const state = normalizeGroupSelfieState(raw);
  if (!isGroupSelfie(state)) return { state, positive:"", negative:[], qa:[], score:evaluateGroupRealism(state) };
  const count = Number(state.groupCount);
  const holder = state.cameraHolder === "auto" ? "resolve exactly one camera holder before assigning any arm" : `Person ${state.cameraHolder} is the only camera holder`;
  const arrangement = option(GROUP_ARRANGEMENT_OPTIONS, state.groupArrangement);
  const interaction = option(GROUP_INTERACTION_OPTIONS, state.groupInteraction);
  const risk = evaluateGroupRealism(state);
  const autoFix = risk.action !== "pass" && state.groupAutoFix === "on" ? "AUTO FIX is mandatory: vary depth and spacing, move edge faces inward, strengthen natural overlap, and widen only within plausible human arm reach." : "Do not silently rewrite the selected group roles or interaction.";
  const positive = `[GROUP SELFIE PHYSICS ENGINE]\nExactly ${count} people are present. ${holder}. The holder's shoulder elevation, selfie arm, phone origin, camera distance and gaze must belong to that same person; never create an anonymous or cross-attached selfie arm. Arrange the group as ${arrangement.text}. The complete group must fit one real subject-held Xiaomi 15 Ultra front-camera viewpoint at human arm reach; never drift into a distant third-person photograph. People closer to the lens appear naturally larger and people farther behind naturally smaller. Never normalize head or face sizes. Mild wide-angle stretching may affect edge faces, consistently with the same lens and viewpoint. Require natural shoulder, torso and hair overlap, partial occlusion and uneven spacing; never isolate everyone with equal gaps or place all faces on a perfect line. Every visible hand and arm must be assigned to one person with continuous shoulder anatomy, five fingers where visible, no duplicated limbs, merged torsos, floating hands or impossible arm paths. Preserve every person's identity independently; never blend, clone or transfer facial structure, hair, skin texture or expression between people. Social behavior: ${interaction.text}. The holder may look at the lens or screen; the others may look at the lens, screen, holder or each other as the moment requires. Expressions must vary subtly and may include a small smile, half-smile, neutral face, mid-laugh or slightly distracted reaction. Allow ordinary imperfections such as a partly hidden shoulder, a slightly cropped edge head, minor motion softness, someone leaning forward or one imperfect simultaneous expression. Prefer believable interaction over symmetry. ${autoFix}`;
  const negative = ["third-person group photo claimed as selfie", "more or fewer people than selected", "unknown selfie arm owner", "multiple camera holders", "equal normalized face sizes", "perfectly straight evenly spaced face row", "identical gaze and expression", "isolated bodies with equal gaps", "blended identities", "cloned face", "duplicated limb", "floating hand", "merged torso", "arm attached to wrong person", "impossible group fit"];
  const qa = [
    { label:"السيلفي الجماعي", value:`${count} أشخاص · صاحب الهاتف ${state.cameraHolder === "auto" ? "تلقائي" : `Person ${state.cameraHolder}`}` },
    { label:"توزيع المجموعة", value:arrangement.label }, { label:"السلوك الاجتماعي", value:interaction.label },
    { label:"Group Realism", value:`${risk.score}/100 · ${risk.level}${risk.action === "auto-fix" ? " · Auto Fix" : risk.action === "block" ? " · Block Generation" : ""}` },
    ...risk.warnings.map((warning) => ({ label:"تحذير جماعي", value:warning }))
  ];
  return { state, positive, negative, qa, score:risk };
}
