const VERSION = "v1.38";
const STORAGE_KEY = "prompt-studio:car-selfie-angle:v1";
const MARKER_START = "SELFIE ANGLE AUTHORITY — USER SELECTED";
const MARKER_END = "END SELFIE ANGLE AUTHORITY";

const ANGLES = Object.freeze([
  {
    id: "eye_level",
    name_ar: "مستوى العين · طبيعي",
    prompt: `SELFIE ANGLE — EYE LEVEL NATURAL
- Place the Xiaomi 15 Ultra front-camera optical center approximately at the subject's eye level, within ordinary arm reach.
- Keep pitch near 0–3 degrees, roll near 0–2 degrees, and only mild horizontal offset caused by the real holding hand.
- Preserve natural near-field perspective without flattening the face into a telephoto look.`
  },
  {
    id: "slightly_high",
    name_ar: "أعلى قليلًا",
    prompt: `SELFIE ANGLE — SLIGHTLY HIGH
- Hold the front camera modestly above eye level, roughly 8–15 cm higher than the eye line, at realistic arm length.
- Use a gentle downward optical-axis pitch of about 6–10 degrees. Chin response and neck posture must remain natural.
- Do not enlarge the eyes, narrow the jaw, slim the face, or cosmetically reshape facial proportions because of the higher viewpoint.`
  },
  {
    id: "clearly_high",
    name_ar: "أعلى بوضوح · ضمن مدى الذراع",
    prompt: `SELFIE ANGLE — CLEARLY HIGH BUT REACHABLE
- Raise the phone clearly above eye level while keeping the shoulder, elbow and hidden holding arm mechanically reachable.
- Use a restrained downward pitch of about 12–18 degrees, never an overhead photographer viewpoint.
- Preserve real near-field size falloff and IMAGE A facial identity after perspective compensation; no beauty-angle face slimming.`
  },
  {
    id: "slightly_low",
    name_ar: "أسفل قليلًا",
    prompt: `SELFIE ANGLE — SLIGHTLY LOW
- Place the camera modestly below eye level, roughly 6–12 cm lower, at ordinary selfie reach.
- Use a gentle upward pitch of about 5–9 degrees while keeping chin, neck and shoulder mechanics continuous.
- Do not exaggerate nostrils, jaw size or chin projection beyond real perspective.`
  },
  {
    id: "low_soft",
    name_ar: "منخفضة خفيفة",
    prompt: `SELFIE ANGLE — LOW SOFT
- Hold the camera distinctly below the eye line but still near chest/upper-chest selfie height and within reach.
- Use an upward pitch of about 10–15 degrees with restrained wide-angle perspective.
- This must remain a handheld front-camera selfie, not a dashboard, lap, console, floor or passenger-camera viewpoint.`
  },
  {
    id: "right_offset",
    name_ar: "انحراف يمين خفيف",
    prompt: `SELFIE ANGLE — SLIGHT RIGHT OFFSET
- Shift the phone modestly to the subject's right side while remaining near eye level and within realistic arm reach.
- Keep horizontal yaw modest, about 8–15 degrees, with the gaze returning to the real optical center.
- Preserve natural left/right facial perspective asymmetry without changing the underlying identity geometry.`
  },
  {
    id: "left_offset",
    name_ar: "انحراف يسار خفيف",
    prompt: `SELFIE ANGLE — SLIGHT LEFT OFFSET
- Shift the phone modestly to the subject's left side while remaining near eye level and within realistic arm reach.
- Keep horizontal yaw modest, about 8–15 degrees, with the gaze returning to the real optical center.
- Preserve natural left/right facial perspective asymmetry without changing the underlying identity geometry.`
  },
  {
    id: "three_quarter_right",
    name_ar: "3/4 يمين · خفيف",
    prompt: `SELFIE ANGLE — THREE-QUARTER RIGHT
- Position the phone to the subject's right with a stronger but still reachable horizontal offset, producing roughly 18–28 degrees of face-to-camera yaw.
- Let neck and upper torso contribute naturally rather than twisting only the head.
- Preserve IMAGE A landmarks after perspective compensation; do not alter jaw width, eye spacing, nose shape or lip volume to make the three-quarter view prettier.`
  },
  {
    id: "three_quarter_left",
    name_ar: "3/4 يسار · خفيف",
    prompt: `SELFIE ANGLE — THREE-QUARTER LEFT
- Position the phone to the subject's left with a stronger but still reachable horizontal offset, producing roughly 18–28 degrees of face-to-camera yaw.
- Let neck and upper torso contribute naturally rather than twisting only the head.
- Preserve IMAGE A landmarks after perspective compensation; do not alter jaw width, eye spacing, nose shape or lip volume to make the three-quarter view prettier.`
  },
  {
    id: "dutch_soft",
    name_ar: "Dutch Tilt خفيف",
    prompt: `SELFIE ANGLE — SUBTLE DUTCH TILT
- Keep the phone at ordinary selfie distance and roll the camera only about 3–6 degrees.
- The subject remains anatomically upright relative to gravity; only the camera frame rolls slightly.
- Do not compensate by bending the neck excessively, rotating the cabin, or creating a staged cinematic angle.`
  },
  {
    id: "very_close",
    name_ar: "قريب جدًا للوجه · واقعي",
    prompt: `SELFIE ANGLE — VERY CLOSE FRONT SELFIE
- Keep the phone at a physically reachable close distance of roughly 25–35 cm from the face using the Xiaomi 15 Ultra front camera.
- Preserve genuine near-field perspective: mild nose prominence and stronger size falloff toward ears/shoulders are allowed only as optical effects.
- Keep the crop face-dominant. Do not widen the frame to show torso, steering wheel or cabin details, and never reinterpret perspective distortion as altered facial anatomy.`
  }
]);

const BY_ID = Object.freeze(Object.fromEntries(ANGLES.map((x) => [x.id, x])));
let writing = false;

const $ = (id) => document.getElementById(id);

function savedAngle() {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    if (BY_ID[id]) return id;
  } catch {}
  return "eye_level";
}

function currentAngle() {
  const id = $("carSelfieAngleSelect")?.value || savedAngle();
  return BY_ID[id] || BY_ID.eye_level;
}

function stripBlock(text) {
  const start = text.indexOf(MARKER_START);
  if (start < 0) return text;
  const end = text.indexOf(MARKER_END, start);
  if (end < 0) return text.slice(0, start).trimEnd();
  return `${text.slice(0, start)}${text.slice(end + MARKER_END.length)}`.replace(/\n{3,}/g, "\n\n").trim();
}

function angleBlock() {
  const angle = currentAngle();
  return `${MARKER_START}\nSELECTED ANGLE — ${angle.name_ar}\n${angle.prompt}\n\nANGLE PRIORITY / CONFLICT RULES\n- IMAGE A facial identity lock remains higher priority than this angle. The angle may change perspective only, never stable facial geometry.\n- The selected selfie angle overrides historical template camera-angle wording when the two disagree, while preserving the template's seat/location/pose intent and crop as far as physically compatible.\n- Time-of-day and selected lighting remain independent authorities and must not be changed by the angle.\n- Xiaomi 15 Ultra front camera, approximately 22–24 mm full-frame equivalent around f/2.0, remains mandatory.\n- The phone and complete camera-holding arm stay outside the finished frame. The hidden shoulder-to-hand chain must still be anatomically reachable.\n- If the requested angle and template crop cannot coexist at realistic arm length inside the cabin, reduce angular extremity before moving the virtual camera to an observer position.\n- No rear-camera, passenger-held camera, dashboard camera, mirror-ray substitution, tripod, floating viewpoint or external photographer.\n\nFINAL SELFIE ANGLE GATE\nReject and correct: impossible arm reach; remote camera distance; observer perspective; exaggerated fisheye stretch; angle-induced identity drift; camera roll treated as body tilt; cabin perspective inconsistent with the selected optical center; or any visible phone/holding arm caused by the selected angle.\n${MARKER_END}`;
}

function applyPrompt() {
  const output = $("finalPrompt");
  if (!output || writing) return;
  const clean = stripBlock(output.textContent || "");
  if (!clean.trim()) return;
  const next = `${clean.trim()}\n\n${angleBlock()}`;
  if (next === output.textContent) return;
  writing = true;
  output.textContent = next;
  const words = next.trim().split(/\s+/).filter(Boolean).length;
  if ($("promptWordCount")) $("promptWordCount").textContent = `${words} كلمة`;
  queueMicrotask(() => { writing = false; });
}

function updateVersion() {
  document.documentElement.dataset.carSelfieAngle = currentAngle().id;
  document.querySelectorAll(".car-version").forEach((node) => { node.textContent = VERSION; });
  const brand = document.querySelector(".brand small");
  if (brand) brand.textContent = `Car Templates ${VERSION}`;
  const eyebrow = document.querySelector(".intro .eyebrow");
  if (eyebrow) eyebrow.textContent = `CAR SELFIE ENGINE · ${VERSION}`;
  const footer = document.querySelector("footer p:first-child");
  if (footer) footer.innerHTML = `Car Templates ${VERSION} <span>•</span> USER SELFIE ANGLE AUTHORITY`;
  document.title = `قوالب السيارة ${VERSION} — AI Selfie Prompt Studio`;
}

function installControl() {
  if ($("carSelfieAngleSelect")) return;
  const form = document.querySelector(".car-form-grid");
  if (!form) return;

  const field = document.createElement("div");
  field.className = "field field--wide";
  field.dataset.carSelfieAngleControl = "true";

  const label = document.createElement("label");
  label.htmlFor = "carSelfieAngleSelect";
  label.textContent = "📐 زاوية تصوير السيلفي";

  const select = document.createElement("select");
  select.id = "carSelfieAngleSelect";
  select.name = "carSelfieAngle";
  ANGLES.forEach((angle) => {
    const option = document.createElement("option");
    option.value = angle.id;
    option.textContent = angle.name_ar;
    select.appendChild(option);
  });
  select.value = savedAngle();

  const note = document.createElement("small");
  note.textContent = "تتحكم بموضع الهاتف وارتفاعه وميله فقط. الهوية، الوقت، الإضاءة والملابس لا تتغير بسبب الزاوية.";

  field.append(label, select, note);
  form.prepend(field);

  select.addEventListener("change", () => {
    try { localStorage.setItem(STORAGE_KEY, select.value); } catch {}
    updateVersion();
    document.querySelector("#rebuildBtn")?.click();
    queueMicrotask(applyPrompt);
  });
}

function install() {
  installControl();
  updateVersion();
  const output = $("finalPrompt");
  if (output) {
    const observer = new MutationObserver(() => queueMicrotask(applyPrompt));
    observer.observe(output, { childList:true, characterData:true, subtree:true });
  }
  document.addEventListener("car-time-change", () => queueMicrotask(applyPrompt));
  document.addEventListener("click", (event) => {
    if (event.target.closest(".car-pose-card,.car-exterior-card,.car-chip,.car-mode-btn,#copyBtn,#downloadBtn")) queueMicrotask(applyPrompt);
  }, true);
  ["lightingSelect","hairSelect","expressionSelect","clothingSelect"].forEach((id) => $(id)?.addEventListener("change", () => queueMicrotask(applyPrompt)));
  applyPrompt();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once:true });
else install();
