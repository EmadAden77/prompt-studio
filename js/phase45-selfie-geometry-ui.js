import { getSection } from "./sections/index.js";

export const SELFIE_ANGLE_OPTIONS = Object.freeze([
  Object.freeze({ value:"auto", label:"تلقائي (ذكي)" }),
  Object.freeze({ value:"eye", label:"بمستوى العين" }),
  Object.freeze({ value:"high", label:"من أعلى قليلاً" }),
  Object.freeze({ value:"low", label:"من أسفل قليلاً" }),
  Object.freeze({ value:"three-quarter", label:"ثلاثة أرباع" })
]);

const POSE_LABELS = Object.freeze({
  "standing-relaxed":"وقوف مريح",
  walking:"مشي عفوي",
  "seated-relaxed":"جلوس مريح",
  "driver-close":"سيلفي قريب من مقعد السائق",
  "driver-low":"سيلفي منخفض من مقعد السائق",
  "roof-context":"سيلفي يظهر سياق السقف البانورامي",
  "door-lean":"اتكاء على باب السائق المغلق",
  "door-open":"بجانب باب السائق المفتوح",
  "front-grille":"بجانب الشبك الأمامي",
  "rear-tailgate":"قرب الباب الخلفي",
  "front-fender":"بجانب الرفرف الأمامي",
  "rear-quarter":"عند الربع الخلفي",
  "hood-sit":"جلوس خفيف على حافة غطاء المحرك",
  "standing-bedroom":"وقوف مريح داخل الغرفة",
  "seated-bed":"جلوس طبيعي على السرير",
  "sofa-seated":"جلوس مريح على الأريكة",
  "seated-rest-elbows":"جلوس راحة والمرفقان على الركبتين",
  staggered:"توزيع متدرج للمجموعة",
  "tight-group":"تجمع قريب",
  "distributed-group":"توزيع طبيعي للمجموعة",
  "low-off-axis":"منخفض وخارج المحور",
  "phone-rising":"الهاتف يرتفع أثناء اللقطة"
});

function appendOption(select, value, label) {
  const node = document.createElement("option");
  node.value = value;
  node.textContent = label;
  select.append(node);
}

function sectionId() { return document.querySelector("#studio-section")?.value || ""; }
function sectionGeometry() { return getSection(sectionId())?.rules?.selfieGeometry || null; }

function ensurePoseField() {
  let select = document.querySelector("#selfie-pose");
  if (select) return select;
  const angle = document.querySelector("#selfie-angle");
  const angleField = angle?.closest("label");
  if (!angleField) return null;
  const field = document.createElement("label");
  field.className = "field";
  field.id = "selfie-pose-field";
  field.htmlFor = "selfie-pose";
  const title = document.createElement("span");
  title.textContent = "وضعية السيلفي";
  select = document.createElement("select");
  select.id = "selfie-pose";
  select.name = "selfiePose";
  field.append(title, select);
  angleField.after(field);
  return select;
}

function hideLegacyPoseControls() {
  for (const id of ["pose", "pose-family"]) {
    const control = document.querySelector(`#${id}`);
    const field = control?.closest("label");
    if (field) field.hidden = true;
    if (control) control.disabled = true;
  }
  const exteriorPose = document.querySelector("#car-exterior-pose");
  const exteriorField = exteriorPose?.closest("label");
  if (sectionId() === "carExterior") {
    if (exteriorField) exteriorField.hidden = true;
    if (exteriorPose) exteriorPose.disabled = true;
  }
}

function populateAngles() {
  const select = document.querySelector("#selfie-angle");
  const geometry = sectionGeometry();
  if (!select || !geometry) return;
  const previous = select.value;
  const allowed = new Set(geometry.angles || []);
  select.replaceChildren();
  appendOption(select, "auto", "تلقائي (ذكي)");
  for (const option of SELFIE_ANGLE_OPTIONS.slice(1)) if (allowed.has(option.value)) appendOption(select, option.value, option.label);
  select.value = [...select.options].some((option) => option.value === previous) ? previous : "auto";
  const title = select.closest("label")?.querySelector(":scope > span");
  if (title) title.textContent = "زاوية السيلفي";
}

function populatePoses() {
  const select = ensurePoseField();
  const geometry = sectionGeometry();
  if (!select || !geometry) return;
  const previous = select.value;
  select.replaceChildren();
  appendOption(select, "auto", "تلقائي (ذكي)");
  for (const pose of geometry.poses || []) appendOption(select, pose, POSE_LABELS[pose] || pose.replace(/[-_]+/gu, " "));
  select.value = [...select.options].some((option) => option.value === previous) ? previous : "auto";
}

export function syncPhase45SelfieGeometryUI() {
  if (typeof document === "undefined") return;
  populateAngles();
  populatePoses();
  hideLegacyPoseControls();
}

export function installPhase45SelfieGeometryUI() {
  if (typeof document === "undefined") return;
  queueMicrotask(syncPhase45SelfieGeometryUI);
  document.addEventListener("change", () => setTimeout(syncPhase45SelfieGeometryUI, 0), true);
  document.addEventListener("click", (event) => {
    if (event.target?.closest?.("#studio-section-grid .studio-section-card")) setTimeout(syncPhase45SelfieGeometryUI, 0);
  }, true);
}

if (typeof document !== "undefined") installPhase45SelfieGeometryUI();
