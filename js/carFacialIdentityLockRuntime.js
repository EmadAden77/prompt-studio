const VERSION = "v1.37";
const MARKER_START = "ABSOLUTE FACIAL IDENTITY LOCK — IMAGE A HIGHEST PRIORITY";
const MARKER_END = "END ABSOLUTE FACIAL IDENTITY LOCK";

let writing = false;
let observer = null;
const $ = (id) => document.getElementById(id);

function identityBlock() {
  return `${MARKER_START}
- IMAGE A is the sole and highest authority for the subject's facial identity. Preserve the EXACT SAME PERSON, not a look-alike, approximation, beautified variant, younger/older variant, or identity inferred from the selected template.
- Lock stable craniofacial geometry from IMAGE A: skull/head shape, facial width/height ratio, forehead proportions, temple width, cheekbone position/fullness, jaw angle and breadth, chin width/height/projection, and the subject's natural left-right asymmetry.
- Lock eye identity: exact eye size, shape, spacing, canthus positions, eyelid baseline, iris placement relative to gaze, eyebrow height/shape/spacing and brow-to-eye distance. Do not enlarge, narrow, symmetrize or "improve" the eyes.
- Lock nose identity: bridge/root height and width, dorsum shape, tip projection/rotation, alar width, nostril geometry and nose-to-face proportion. Perspective may change apparent projection only through the real selfie viewpoint; never redesign the nose.
- Lock mouth/lip identity: exact mouth width, philtrum relationship, upper/lower lip baseline volume, cupid's-bow shape and resting asymmetry. Expression may move the lips through muscle action only; it must not inflate, thin, widen or cosmetically reshape them.
- Lock ears, hairline, sideburn boundaries, beard/moustache outline, density pattern, skin tone, age markers and distinctive visible marks from IMAGE A.
- Selected expression changes facial MUSCLE STATE and compressible soft tissue only. It may move mouth corners, eyelids, brows, cheeks and jaw opening within natural anatomy, but must never change the underlying stable facial landmarks.
- Lighting changes illumination only. Night/day selection, mixed light, HDR, shadow depth, white balance and reflections must never be interpreted as a license to alter skin tone identity, face width, nose shape, eye size or jaw structure.
- Camera angle and near-field selfie perspective may change apparent scale with depth, but after compensating for perspective the stable landmark geometry must still correspond to IMAGE A.
- No face slimming, jaw sharpening, cheek hollowing, nose refinement, eye enlargement, lip enhancement, symmetry correction, skin whitening, age reduction, cosmetic reconstruction, beauty filter, face morphing or generic-model substitution.

LANDMARK CONSISTENCY TEST — MANDATORY
- Before final output, mentally align the stable landmarks of the generated face with IMAGE A after compensating only for camera perspective, head pose and the selected facial expression.
- The relative geometry of inner/outer eye corners, pupils, eyebrow anchors, nose root/tip/alar points, mouth corners, chin center, jaw corners and ear attachment points must remain identity-consistent with IMAGE A.
- If the result would no longer be immediately recognizable as the exact person in IMAGE A because any stable facial proportion drifted, restore IMAGE A geometry and re-solve only perspective, lighting and expression.

FINAL FACIAL IDENTITY REJECTION GATE
Reject and correct any result containing: look-alike substitution; changed face width; altered jaw/chin; modified nose; enlarged or differently spaced eyes; changed lip volume/width; moved hairline; redesigned beard; beautification; excessive symmetry; age drift; skin-tone identity drift; expression causing skeletal change; lighting causing facial reconstruction; or a face that cannot plausibly superimpose on IMAGE A after perspective compensation.
${MARKER_END}`;
}

function stripBlock(text) {
  const start = text.indexOf(MARKER_START);
  if (start < 0) return text;
  const end = text.indexOf(MARKER_END, start);
  if (end < 0) return text.slice(0, start).trimEnd();
  return `${text.slice(0, start)}${text.slice(end + MARKER_END.length)}`.replace(/\n{3,}/g, "\n\n").trim();
}

function transform(text) {
  const clean = stripBlock(text || "");
  if (!clean.trim()) return clean;
  return `${identityBlock()}\n\n${clean}`.trim();
}

function updateVersionLabels() {
  document.querySelectorAll(".car-version").forEach((node) => { node.textContent = VERSION; });
  const brand = document.querySelector(".brand small");
  if (brand) brand.textContent = `Car Templates ${VERSION}`;
  const eyebrow = document.querySelector(".intro .eyebrow");
  if (eyebrow) eyebrow.textContent = `CAR SELFIE ENGINE · ${VERSION}`;
  document.title = `قوالب السيارة ${VERSION} — AI Selfie Prompt Studio`;
}

function apply() {
  const output = $("finalPrompt");
  if (!output || writing) return;
  const next = transform(output.textContent || "");
  if (next !== output.textContent) {
    writing = true;
    output.textContent = next;
    const words = next.trim().split(/\s+/).filter(Boolean).length;
    if ($("promptWordCount")) $("promptWordCount").textContent = `${words} كلمة`;
    queueMicrotask(() => { writing = false; });
  }
  updateVersionLabels();
}

function installVisibleLockNote() {
  const rules = document.querySelector(".car-help");
  if (!rules || rules.querySelector("[data-car-face-lock]")) return;
  const note = document.createElement("span");
  note.dataset.carFaceLock = "true";
  note.innerHTML = ` <strong>FACE ID LOCK:</strong> IMAGE A تقفل هندسة الوجه 1:1؛ الإضاءة والقالب والتعبير يغيّرون المظهر العضلي/الضوئي فقط ولا يغيّرون الملامح.`;
  rules.appendChild(note);
}

function install() {
  document.documentElement.dataset.carFacialIdentityLock = VERSION;
  installVisibleLockNote();
  updateVersionLabels();
  ["lightingSelect","hairSelect","expressionSelect","clothingSelect"].forEach((id) => $(id)?.addEventListener("change", () => queueMicrotask(apply)));
  document.addEventListener("car-time-change", () => queueMicrotask(apply));
  document.addEventListener("click", (event) => {
    if (event.target.closest(".car-pose-card,.car-exterior-card,.car-chip,.car-mode-btn,#copyBtn,#downloadBtn")) queueMicrotask(apply);
  }, true);
  const output = $("finalPrompt");
  if (output) {
    observer = new MutationObserver(() => queueMicrotask(apply));
    observer.observe(output, { childList:true, characterData:true, subtree:true });
  }
  apply();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once:true });
else install();
