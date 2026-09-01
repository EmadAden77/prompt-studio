// VISUAL SELFIE ANGLE MONITOR v1
// Vector-only geometry preview for subject-held smartphone selfies.
// No image generation is performed by this module.

export const VISUAL_SELFIE_DEFAULTS = Object.freeze({
  visualSelfieMonitor:"on",
  visualMonitorSync:"on",
  selfieDistanceCm:50,
  selfieYawDeg:0,
  selfiePitchDeg:0,
  selfieRollDeg:2,
  faceYawDeg:0,
  monitorComposition:"auto"
});

const LIMITS = Object.freeze({
  distance:[35,80],
  yaw:[-45,45],
  pitch:[-25,25],
  roll:[-10,10],
  faceYaw:[-40,40]
});

const COMPOSITIONS = new Set(["auto","tight","close","upper","full"]);

function numberValue(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, [min,max]) {
  return Math.min(max, Math.max(min, value));
}

function onOff(value, fallback = "on") {
  if (value === "on" || value === true) return "on";
  if (value === "off" || value === false) return "off";
  return fallback;
}

export function normalizeVisualSelfieState(rawState = {}) {
  return {
    ...rawState,
    visualSelfieMonitor:onOff(rawState.visualSelfieMonitor, VISUAL_SELFIE_DEFAULTS.visualSelfieMonitor),
    visualMonitorSync:onOff(rawState.visualMonitorSync, VISUAL_SELFIE_DEFAULTS.visualMonitorSync),
    selfieDistanceCm:clamp(numberValue(rawState.selfieDistanceCm, VISUAL_SELFIE_DEFAULTS.selfieDistanceCm), LIMITS.distance),
    selfieYawDeg:clamp(numberValue(rawState.selfieYawDeg, VISUAL_SELFIE_DEFAULTS.selfieYawDeg), LIMITS.yaw),
    selfiePitchDeg:clamp(numberValue(rawState.selfiePitchDeg, VISUAL_SELFIE_DEFAULTS.selfiePitchDeg), LIMITS.pitch),
    selfieRollDeg:clamp(numberValue(rawState.selfieRollDeg, VISUAL_SELFIE_DEFAULTS.selfieRollDeg), LIMITS.roll),
    faceYawDeg:clamp(numberValue(rawState.faceYawDeg, VISUAL_SELFIE_DEFAULTS.faceYawDeg), LIMITS.faceYaw),
    monitorComposition:COMPOSITIONS.has(rawState.monitorComposition) ? rawState.monitorComposition : VISUAL_SELFIE_DEFAULTS.monitorComposition
  };
}

export function selfieAnglePreset(angle = "") {
  const key = String(angle || "").toLowerCase().replace(/_/g,"-");
  if (/(three-quarter|threequarter|3\/4)/u.test(key)) return { distance:50, yaw:24, pitch:-2, roll:2, faceYaw:10 };
  if (/(side-close|side|lateral)/u.test(key)) return { distance:48, yaw:32, pitch:0, roll:2, faceYaw:16 };
  if (/(slight-high|high|above|overhead)/u.test(key)) return { distance:50, yaw:0, pitch:-11, roll:2, faceYaw:0 };
  if (/(slight-low|low|below)/u.test(key)) return { distance:52, yaw:0, pitch:8, roll:2, faceYaw:0 };
  return { distance:50, yaw:0, pitch:0, roll:2, faceYaw:0 };
}

export function evaluateSelfieGeometry(rawState = {}) {
  const state = normalizeVisualSelfieState(rawState);
  let score = 100;
  const issues = [];
  const distance = state.selfieDistanceCm;
  const yaw = Math.abs(state.selfieYawDeg);
  const pitch = Math.abs(state.selfiePitchDeg);
  const roll = Math.abs(state.selfieRollDeg);
  const relativeFace = Math.abs(state.selfieYawDeg - state.faceYawDeg);

  if (distance < 38) { score -= 18; issues.push("الهاتف قريب جدًا من الوجه وقد يسبب منظورًا مبالغًا فيه"); }
  else if (distance < 43) { score -= 5; issues.push("المسافة قريبة؛ منظور الأنف والوجه سيزداد قليلًا"); }
  else if (distance > 75) { score -= 18; issues.push("المسافة تتجاوز مدى ذراع مريح لمعظم وضعيات السيلفي"); }
  else if (distance > 68) { score -= 5; issues.push("المسافة بعيدة نسبيًا وتحتاج مدّ الذراع بوضوح"); }

  if (yaw > 38) { score -= 20; issues.push("الإزاحة الجانبية للهاتف قوية وصعبة مع ذراع واحدة"); }
  else if (yaw > 30) { score -= 8; issues.push("زاوية الهاتف الجانبية قريبة من حد الراحة الطبيعي"); }

  if (pitch > 21) { score -= 20; issues.push("ارتفاع/انخفاض الهاتف شديد بالنسبة لسيلفي بطول الذراع"); }
  else if (pitch > 16) { score -= 8; issues.push("ميل الهاتف الرأسي قوي ويحتاج وضعية ذراع واضحة"); }

  if (roll > 8) { score -= 10; issues.push("لف الهاتف كبير ويبدو مقصودًا أكثر من لقطة عفوية"); }
  else if (roll > 5) { score -= 4; issues.push("لف الهاتف ملحوظ لكنه ما يزال ممكنًا"); }

  if (relativeFace > 45) { score -= 16; issues.push("اتجاه الوجه والهاتف متباعدان بشكل غير مريح للنظر إلى العدسة"); }
  else if (relativeFace > 34) { score -= 6; issues.push("يتطلب اتجاه الوجه دوران عين/رقبة أكبر من المعتاد"); }

  if (distance < 43 && yaw > 28) { score -= 8; issues.push("المسافة القريبة مع الإزاحة الجانبية الكبيرة تضغط هندسة الذراع والمنظور"); }

  score = Math.max(0, Math.min(100, score));
  const level = score >= 88 ? "ممكن طبيعيًا" : score >= 68 ? "ممكن بحذر" : "يحتاج تصحيح";
  return { state, score, level, issues, reachable:score >= 68 };
}

function signed(value) {
  const n = Number(value) || 0;
  return `${n > 0 ? "+" : ""}${n}°`;
}

function yawMeaning(value) {
  if (value > 2) return "phone shifted toward the subject's right";
  if (value < -2) return "phone shifted toward the subject's left";
  return "phone approximately centered on the face axis";
}

function pitchMeaning(value) {
  if (value < -2) return "phone above eye level with a downward camera pitch";
  if (value > 2) return "phone below eye level with an upward camera pitch";
  return "phone approximately at eye level";
}

function rollMeaning(value) {
  if (value > 1) return "small clockwise handheld roll";
  if (value < -1) return "small counter-clockwise handheld roll";
  return "nearly level phone";
}

export function resolveMonitorComposition(state = {}) {
  const normalized = normalizeVisualSelfieState(state);
  return normalized.monitorComposition === "auto" ? (state.composition || "close") : normalized.monitorComposition;
}

export function buildVisualSelfieGeometrySection(rawState = {}) {
  const result = evaluateSelfieGeometry(rawState);
  if (result.state.visualSelfieMonitor !== "on") return "";
  const composition = resolveMonitorComposition(result.state);
  const correction = result.reachable
    ? "Preserve these monitor values as the numeric refinement of the selected selfie angle, unless the active pose physically requires a smaller adjustment."
    : "These values exceed a comfortable selfie envelope. Clamp only the conflicting value(s) to the nearest physically reachable geometry while preserving the intended direction and composition.";
  return `[VISUAL SELFIE ANGLE MONITOR]
This is capture geometry, not a style suggestion and not a third-person camera plan.
- Device: Xiaomi 15 Ultra FRONT camera, subject-held at natural arm length.
- Camera-to-face distance: ${result.state.selfieDistanceCm} cm.
- Phone yaw: ${signed(result.state.selfieYawDeg)}; ${yawMeaning(result.state.selfieYawDeg)}.
- Phone pitch: ${signed(result.state.selfiePitchDeg)}; ${pitchMeaning(result.state.selfiePitchDeg)}.
- Phone roll: ${signed(result.state.selfieRollDeg)}; ${rollMeaning(result.state.selfieRollDeg)}.
- Face yaw relative to the body/front axis: ${signed(result.state.faceYawDeg)}. The eyes may make only a small natural correction toward the front-camera lens.
- Framing target: ${composition}; crop follows arm reach and the active pose instead of widening merely to expose background.
- Feasibility diagnostic: ${result.score}/100 (${result.level}).
${correction}
Never convert this geometry into a tripod, observer, rear-camera, drone or third-person photograph.`;
}

export function visualSelfieQa(rawState = {}) {
  const result = evaluateSelfieGeometry(rawState);
  if (result.state.visualSelfieMonitor !== "on") return [{ label:"Visual Selfie Monitor", value:"متوقف" }];
  const vector = `D ${result.state.selfieDistanceCm}cm · Y ${signed(result.state.selfieYawDeg)} · P ${signed(result.state.selfiePitchDeg)} · R ${signed(result.state.selfieRollDeg)} · Face ${signed(result.state.faceYawDeg)}`;
  return [
    { label:"Visual Selfie Monitor", value:`${result.score}/100 · ${result.level}` },
    { label:"Selfie Geometry", value:vector },
    { label:"Monitor Crop", value:resolveMonitorComposition(result.state) },
    { label:"Arm-Reach Check", value:result.reachable ? "هندسة قابلة للتنفيذ" : `يحتاج تصحيح: ${result.issues[0] || "خارج النطاق المريح"}` }
  ];
}

function rangeField(id, label, min, max, step, value, unit) {
  return `<label class="visual-monitor-control" for="${id}">
    <span><b>${label}</b><output id="${id}-out">${value}${unit}</output></span>
    <input id="${id}" name="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" dir="ltr" />
  </label>`;
}

function monitorMarkup() {
  return `
    <div class="section-heading"><div><span class="section-number">02A</span><h2 id="visual-selfie-monitor-title">Visual Selfie Angle Monitor</h2></div><p>محاكاة هندسية مباشرة لموضع الهاتف والوجه والكادر. لا تولّد صورًا.</p></div>
    <div class="selfie-guidance" role="note">حرّك القيم وشاهد موضع الهاتف فورًا. الأرقام تنتقل إلى البرومبت كقيود هندسية، بينما محركات الوضعية والتشريح تظل صاحبة الكلمة الأخيرة إذا كانت الحركة غير ممكنة.</div>
    <div class="visual-monitor-layout">
      <div class="visual-monitor-preview-wrap">
        <div class="visual-monitor-preview" aria-label="معاينة هندسة زاوية السيلفي">
          <svg id="visual-selfie-svg" viewBox="0 0 360 270" role="img" aria-labelledby="visual-selfie-monitor-title">
            <defs>
              <pattern id="selfie-grid" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1" class="visual-grid-dot" /></pattern>
              <marker id="selfie-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" class="visual-vector-arrow" /></marker>
            </defs>
            <rect x="4" y="4" width="352" height="262" rx="18" class="visual-stage-bg" />
            <rect x="10" y="10" width="340" height="250" rx="14" fill="url(#selfie-grid)" />
            <line x1="55" y1="118" x2="305" y2="118" class="visual-eye-line" />
            <text x="300" y="111" class="visual-svg-label">EYE LEVEL</text>
            <g id="visual-subject-group">
              <path d="M118 224 C125 178, 235 178, 242 224 L242 245 L118 245 Z" class="visual-shoulders" />
              <ellipse cx="180" cy="119" rx="47" ry="61" class="visual-head" />
              <ellipse id="visual-left-ear" cx="132" cy="121" rx="7" ry="14" class="visual-ear" />
              <ellipse id="visual-right-ear" cx="228" cy="121" rx="7" ry="14" class="visual-ear" />
              <line id="visual-face-axis" x1="180" y1="82" x2="180" y2="156" class="visual-face-axis" />
              <path id="visual-nose" d="M180 108 L184 126 L177 128" class="visual-nose" />
              <circle cx="164" cy="109" r="3" class="visual-eye" /><circle cx="196" cy="109" r="3" class="visual-eye" />
            </g>
            <line id="visual-reach-line" x1="180" y1="138" x2="180" y2="214" class="visual-reach-line" marker-end="url(#selfie-arrow)" />
            <g id="visual-phone-group" transform="translate(180 214) rotate(2)">
              <rect x="-17" y="-31" width="34" height="62" rx="8" class="visual-phone" />
              <circle cx="0" cy="-23" r="2.7" class="visual-phone-camera" />
              <line x1="-9" y1="22" x2="9" y2="22" class="visual-phone-detail" />
            </g>
            <rect id="visual-crop-frame" x="88" y="35" width="184" height="206" rx="13" class="visual-crop-frame" />
            <text id="visual-crop-label" x="99" y="55" class="visual-svg-label">CLOSE</text>
          </svg>
          <div class="visual-monitor-score-row"><strong id="visual-monitor-score">100/100</strong><span id="visual-monitor-level">ممكن طبيعيًا</span></div>
        </div>
        <div class="visual-monitor-readout" id="visual-monitor-readout">Xiaomi 15 Ultra Front · 50 cm · Y 0° · P 0° · R +2°</div>
        <div class="visual-monitor-warning" id="visual-monitor-warning" hidden></div>
      </div>
      <div class="visual-monitor-controls">
        <div class="visual-monitor-toolbar">
          <label class="field" for="visual-monitor-sync"><span>ربط مع زاوية السيلفي</span><select id="visual-monitor-sync" name="visualMonitorSync"><option value="on" selected>تلقائي</option><option value="off">يدوي</option></select></label>
          <label class="field" for="visual-monitor-composition"><span>الكادر</span><select id="visual-monitor-composition" name="monitorComposition"><option value="auto" selected>حسب التكوين المختار</option><option value="tight">Tight</option><option value="close">Close</option><option value="upper">Upper chest</option><option value="full">Wide / full</option></select></label>
        </div>
        ${rangeField("visual-selfie-distance", "المسافة", 35, 80, 1, 50, " cm")}
        ${rangeField("visual-selfie-yaw", "Yaw الهاتف", -45, 45, 1, 0, "°")}
        ${rangeField("visual-selfie-pitch", "Pitch الهاتف", -25, 25, 1, 0, "°")}
        ${rangeField("visual-selfie-roll", "Roll الهاتف", -10, 10, 1, 2, "°")}
        ${rangeField("visual-face-yaw", "دوران الوجه", -40, 40, 1, 0, "°")}
        <div class="visual-monitor-presets" aria-label="زوايا سيلفي سريعة">
          <button type="button" data-selfie-monitor-preset="eye">Eye level</button>
          <button type="button" data-selfie-monitor-preset="slight-high">Slight high</button>
          <button type="button" data-selfie-monitor-preset="three-quarter">3/4</button>
          <button type="button" data-selfie-monitor-preset="slight-low">Slight low</button>
        </div>
      </div>
    </div>`;
}

function monitorStyle() {
  return `
#visual-selfie-angle-monitor{overflow:hidden}
.visual-monitor-layout{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(280px,.95fr);gap:18px;align-items:start}
.visual-monitor-preview-wrap{min-width:0}
.visual-monitor-preview{border:1px solid rgba(255,255,255,.13);border-radius:18px;padding:12px;background:rgba(4,8,15,.64);box-shadow:inset 0 0 0 1px rgba(255,255,255,.02)}
#visual-selfie-svg{display:block;width:100%;height:auto;max-height:360px}
.visual-stage-bg{fill:rgba(5,9,16,.94);stroke:rgba(255,255,255,.08);stroke-width:1.2}
.visual-grid-dot{fill:rgba(255,255,255,.08)}
.visual-eye-line{stroke:rgba(250,198,42,.36);stroke-width:1;stroke-dasharray:6 8}
.visual-svg-label{fill:rgba(250,198,42,.8);font-size:9px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em}
.visual-shoulders{fill:rgba(179,190,207,.25);stroke:rgba(222,230,240,.55);stroke-width:1.5}
.visual-head{fill:rgba(190,199,214,.28);stroke:rgba(231,237,245,.72);stroke-width:1.6}
.visual-ear{fill:rgba(190,199,214,.24);stroke:rgba(231,237,245,.48);stroke-width:1}
.visual-face-axis{stroke:rgba(250,198,42,.65);stroke-width:1.2;stroke-dasharray:4 4}
.visual-nose{fill:none;stroke:rgba(235,240,246,.78);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.visual-eye{fill:rgba(238,244,250,.85)}
.visual-reach-line{stroke:rgba(66,180,255,.82);stroke-width:2;stroke-dasharray:5 5}
.visual-vector-arrow{fill:rgba(66,180,255,.92)}
.visual-phone{fill:rgba(20,24,31,.95);stroke:rgba(250,198,42,.92);stroke-width:2}
.visual-phone-camera{fill:rgba(100,202,255,.95)}
.visual-phone-detail{stroke:rgba(255,255,255,.45);stroke-width:1.2}
.visual-crop-frame{fill:none;stroke:rgba(250,198,42,.75);stroke-width:1.5;stroke-dasharray:7 5}
.visual-monitor-score-row{display:flex;justify-content:center;gap:10px;align-items:center;padding:6px 0 0;font-size:.9rem}
.visual-monitor-score-row strong{color:#fac62a}
.visual-monitor-readout{margin-top:10px;border-radius:12px;padding:10px 12px;background:rgba(250,198,42,.07);border:1px solid rgba(250,198,42,.18);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.84rem;direction:ltr;text-align:center}
.visual-monitor-warning{margin-top:8px;padding:9px 11px;border-radius:10px;background:rgba(255,141,61,.09);border:1px solid rgba(255,141,61,.24);font-size:.82rem;line-height:1.6}
.visual-monitor-controls{display:grid;gap:11px}
.visual-monitor-toolbar{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.visual-monitor-control{display:grid;gap:6px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07)}
.visual-monitor-control>span{display:flex;justify-content:space-between;gap:10px;align-items:center;font-size:.86rem}
.visual-monitor-control output{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#fac62a;direction:ltr}
.visual-monitor-control input[type=range]{width:100%;accent-color:#fac62a}
.visual-monitor-presets{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.visual-monitor-presets button{min-height:40px;border:1px solid rgba(250,198,42,.25);border-radius:10px;background:rgba(250,198,42,.07);color:inherit;font-weight:700;cursor:pointer}
.visual-monitor-presets button:hover,.visual-monitor-presets button:focus-visible{background:rgba(250,198,42,.14);outline:none;border-color:rgba(250,198,42,.55)}
@media(max-width:760px){
  #visual-selfie-angle-monitor{overflow:visible}
  .visual-monitor-layout{grid-template-columns:1fr;gap:10px}
  .visual-monitor-preview-wrap{position:sticky;top:6px;z-index:20;padding:5px;border-radius:14px;background:rgba(6,13,23,.96);box-shadow:0 10px 26px rgba(0,0,0,.3);backdrop-filter:blur(10px)}
  .visual-monitor-preview{border-radius:12px;padding:5px}
  #visual-selfie-svg{height:154px;max-height:154px}
  .visual-monitor-score-row{gap:7px;padding-top:2px;font-size:.76rem;line-height:1.2}
  .visual-monitor-readout{margin-top:4px;border-radius:9px;padding:5px 7px;font-size:.66rem;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .visual-monitor-warning{margin-top:4px;padding:5px 7px;border-radius:8px;font-size:.68rem;line-height:1.3;max-height:42px;overflow:auto}
  .visual-monitor-toolbar{grid-template-columns:1fr 1fr;gap:7px}
  .visual-monitor-controls{gap:7px}
  .visual-monitor-control{gap:4px;padding:7px 9px;border-radius:10px}
  .visual-monitor-control>span{font-size:.78rem}
  .visual-monitor-presets{grid-template-columns:repeat(4,1fr);gap:5px}
  .visual-monitor-presets button{min-height:34px;padding:5px 3px;font-size:.72rem}
}
@media(max-width:430px){
  .visual-monitor-preview-wrap{top:4px;padding:4px}
  #visual-selfie-svg{height:138px;max-height:138px}
  .visual-monitor-score-row{font-size:.72rem}
  .visual-monitor-readout{font-size:.62rem}
  .visual-monitor-toolbar{grid-template-columns:1fr 1fr}
  .visual-monitor-toolbar .field{padding:7px 8px}
  .visual-monitor-toolbar .field span{font-size:.74rem}
  .visual-monitor-toolbar select{font-size:.78rem}
  .visual-monitor-presets{grid-template-columns:repeat(2,1fr)}
}
`;
}

export function mountVisualSelfieAngleMonitor(form) {
  if (!form || typeof document === "undefined" || document.querySelector("#visual-selfie-angle-monitor")) return;
  const section = document.createElement("section");
  section.className = "panel priority-panel";
  section.id = "visual-selfie-angle-monitor";
  section.setAttribute("aria-labelledby","visual-selfie-monitor-title");
  section.innerHTML = monitorMarkup();
  const selfieSection = form.querySelector("#selfie-title")?.closest("section");
  if (selfieSection?.nextSibling) form.insertBefore(section, selfieSection.nextSibling);
  else if (selfieSection) selfieSection.insertAdjacentElement("afterend", section);
  else form.prepend(section);

  if (!document.querySelector("#visual-selfie-angle-monitor-style")) {
    const style = document.createElement("style");
    style.id = "visual-selfie-angle-monitor-style";
    style.textContent = monitorStyle();
    document.head.append(style);
  }
  updateVisualSelfieAnglePreview(document);
}

export function readVisualSelfieUiState(root = document) {
  const value = (id, fallback) => root.querySelector(`#${id}`)?.value ?? fallback;
  return normalizeVisualSelfieState({
    visualSelfieMonitor:root.querySelector("#visual-selfie-angle-monitor") ? "on" : "off",
    visualMonitorSync:value("visual-monitor-sync", VISUAL_SELFIE_DEFAULTS.visualMonitorSync),
    selfieDistanceCm:value("visual-selfie-distance", VISUAL_SELFIE_DEFAULTS.selfieDistanceCm),
    selfieYawDeg:value("visual-selfie-yaw", VISUAL_SELFIE_DEFAULTS.selfieYawDeg),
    selfiePitchDeg:value("visual-selfie-pitch", VISUAL_SELFIE_DEFAULTS.selfiePitchDeg),
    selfieRollDeg:value("visual-selfie-roll", VISUAL_SELFIE_DEFAULTS.selfieRollDeg),
    faceYawDeg:value("visual-face-yaw", VISUAL_SELFIE_DEFAULTS.faceYawDeg),
    monitorComposition:value("visual-monitor-composition", VISUAL_SELFIE_DEFAULTS.monitorComposition)
  });
}

function setRangeValue(root, id, value) {
  const input = root.querySelector(`#${id}`);
  if (input) input.value = String(value);
}

function closestMainAngleValue(select, presetName) {
  if (!select) return null;
  const candidates = [...select.options].map((option) => option.value);
  const patterns = {
    eye:["eye","eye-level","eye_level"],
    "slight-high":["slight-high","high","slight_high"],
    "three-quarter":["three-quarter","three_quarter","threequarter"],
    "slight-low":["slight-low","low","slight_low"]
  }[presetName] || [];
  return candidates.find((candidate) => patterns.includes(candidate)) || null;
}

export function applyVisualSelfiePreset(presetName, root = document, { updatePrimary = true } = {}) {
  const preset = selfieAnglePreset(presetName);
  setRangeValue(root,"visual-selfie-distance",preset.distance);
  setRangeValue(root,"visual-selfie-yaw",preset.yaw);
  setRangeValue(root,"visual-selfie-pitch",preset.pitch);
  setRangeValue(root,"visual-selfie-roll",preset.roll);
  setRangeValue(root,"visual-face-yaw",preset.faceYaw);
  if (updatePrimary) {
    const main = root.querySelector("#selfie-angle");
    const mapped = closestMainAngleValue(main,presetName);
    if (mapped && main.value !== mapped) main.value = mapped;
  }
  updateVisualSelfieAnglePreview(root);
}

export function syncVisualMonitorFromPrimaryControls(root = document) {
  const sync = root.querySelector("#visual-monitor-sync")?.value ?? "on";
  if (sync !== "on") return false;
  const mainAngle = root.querySelector("#selfie-angle")?.value || "eye";
  const preset = selfieAnglePreset(mainAngle);
  setRangeValue(root,"visual-selfie-distance",preset.distance);
  setRangeValue(root,"visual-selfie-yaw",preset.yaw);
  setRangeValue(root,"visual-selfie-pitch",preset.pitch);
  setRangeValue(root,"visual-selfie-roll",preset.roll);
  setRangeValue(root,"visual-face-yaw",preset.faceYaw);
  updateVisualSelfieAnglePreview(root);
  return true;
}

function outputText(id, value, unit, root) {
  const output = root.querySelector(`#${id}-out`);
  if (output) output.textContent = `${value}${unit}`;
}

function cropRect(composition) {
  if (composition === "tight") return { x:116, y:45, width:128, height:150, label:"TIGHT" };
  if (composition === "upper") return { x:72, y:24, width:216, height:226, label:"UPPER" };
  if (composition === "full") return { x:43, y:14, width:274, height:242, label:"WIDE" };
  return { x:88, y:35, width:184, height:206, label:"CLOSE" };
}

export function updateVisualSelfieAnglePreview(root = document) {
  if (typeof document === "undefined") return null;
  const state = readVisualSelfieUiState(root);
  const result = evaluateSelfieGeometry({ ...state, composition:root.querySelector("#composition")?.value || "close" });
  const composition = resolveMonitorComposition({ ...state, composition:root.querySelector("#composition")?.value || "close" });

  outputText("visual-selfie-distance",state.selfieDistanceCm," cm",root);
  outputText("visual-selfie-yaw",state.selfieYawDeg,"°",root);
  outputText("visual-selfie-pitch",state.selfiePitchDeg,"°",root);
  outputText("visual-selfie-roll",state.selfieRollDeg,"°",root);
  outputText("visual-face-yaw",state.faceYawDeg,"°",root);

  const distanceScale = 72 + ((state.selfieDistanceCm - 35) / 45) * 62;
  const yawRad = state.selfieYawDeg * Math.PI / 180;
  const phoneX = 180 + Math.sin(yawRad) * distanceScale;
  const phoneY = 133 + Math.cos(yawRad) * distanceScale * .62 + state.selfiePitchDeg * 2.05;
  const phone = root.querySelector("#visual-phone-group");
  if (phone) phone.setAttribute("transform",`translate(${phoneX.toFixed(1)} ${phoneY.toFixed(1)}) rotate(${state.selfieRollDeg})`);
  const reach = root.querySelector("#visual-reach-line");
  if (reach) { reach.setAttribute("x2",phoneX.toFixed(1)); reach.setAttribute("y2",phoneY.toFixed(1)); }

  const faceAxis = root.querySelector("#visual-face-axis");
  const faceShift = state.faceYawDeg * .42;
  if (faceAxis) { faceAxis.setAttribute("x1",String(180 + faceShift*.35)); faceAxis.setAttribute("x2",String(180 + faceShift)); }
  const nose = root.querySelector("#visual-nose");
  if (nose) {
    const x = 180 + faceShift;
    nose.setAttribute("d",`M${x.toFixed(1)} 108 L${(x+4).toFixed(1)} 126 L${(x-3).toFixed(1)} 128`);
  }
  const leftEar = root.querySelector("#visual-left-ear");
  const rightEar = root.querySelector("#visual-right-ear");
  if (leftEar) leftEar.setAttribute("opacity",String(Math.max(.25,1 - Math.max(0,state.faceYawDeg)/45)));
  if (rightEar) rightEar.setAttribute("opacity",String(Math.max(.25,1 - Math.max(0,-state.faceYawDeg)/45)));

  const crop = cropRect(composition);
  const cropFrame = root.querySelector("#visual-crop-frame");
  if (cropFrame) Object.entries(crop).forEach(([key,value]) => { if (key !== "label") cropFrame.setAttribute(key,String(value)); });
  const cropLabel = root.querySelector("#visual-crop-label");
  if (cropLabel) { cropLabel.textContent = crop.label; cropLabel.setAttribute("x",String(crop.x + 10)); cropLabel.setAttribute("y",String(crop.y + 20)); }

  const score = root.querySelector("#visual-monitor-score");
  const level = root.querySelector("#visual-monitor-level");
  const readout = root.querySelector("#visual-monitor-readout");
  const warning = root.querySelector("#visual-monitor-warning");
  if (score) score.textContent = `${result.score}/100`;
  if (level) level.textContent = result.level;
  if (readout) readout.textContent = `Xiaomi 15 Ultra Front · ${state.selfieDistanceCm} cm · Y ${signed(state.selfieYawDeg)} · P ${signed(state.selfiePitchDeg)} · R ${signed(state.selfieRollDeg)} · Face ${signed(state.faceYawDeg)} · ${composition}`;
  if (warning) {
    warning.hidden = !result.issues.length;
    warning.textContent = result.issues.length ? `⚠ ${result.issues.join(" · ")}` : "";
  }
  return result;
}

export function bindVisualSelfieAngleMonitor(onChange, root = document) {
  if (typeof document === "undefined") return;
  const rangeIds = ["visual-selfie-distance","visual-selfie-yaw","visual-selfie-pitch","visual-selfie-roll","visual-face-yaw"];
  rangeIds.forEach((id) => {
    const input = root.querySelector(`#${id}`);
    input?.addEventListener("input",() => updateVisualSelfieAnglePreview(root));
    input?.addEventListener("change",() => onChange?.());
  });
  root.querySelector("#visual-monitor-composition")?.addEventListener("change",() => { updateVisualSelfieAnglePreview(root); onChange?.(); });
  root.querySelector("#visual-monitor-sync")?.addEventListener("change",() => {
    syncVisualMonitorFromPrimaryControls(root);
    updateVisualSelfieAnglePreview(root);
    onChange?.();
  });
  root.querySelectorAll("[data-selfie-monitor-preset]").forEach((button) => button.addEventListener("click",() => {
    applyVisualSelfiePreset(button.dataset.selfieMonitorPreset,root,{ updatePrimary:true });
    onChange?.();
  }));
  const primaryAngle = root.querySelector("#selfie-angle");
  primaryAngle?.addEventListener("change",() => {
    if (syncVisualMonitorFromPrimaryControls(root)) onChange?.();
  });
  root.querySelector("#composition")?.addEventListener("change",() => updateVisualSelfieAnglePreview(root));
  queueMicrotask(() => {
    syncVisualMonitorFromPrimaryControls(root);
    updateVisualSelfieAnglePreview(root);
  });
}