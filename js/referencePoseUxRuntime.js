const MARKER_START = "POSE TRANSFORMER UX AUTHORITY — v1.7";
const MARKER_END = "END POSE TRANSFORMER UX AUTHORITY";
const STORAGE_KEY = "prompt-studio:pose-transformer-mode:v1";

const BOLDNESS = Object.freeze({
  conservative: `POSE CHANGE BOLDNESS — CONSERVATIVE
- Prefer the smallest clearly visible pose change that still reads as a new pose.
- Minimize hidden-anatomy reconstruction, large joint travel, support changes and camera-distance changes.
- Preserve maximum identity, body and scene stability.`,
  medium: `POSE CHANGE BOLDNESS — MEDIUM
- Choose a clearly different pose with moderate torso rotation, weight transfer, limb repositioning or support change when physically supported.
- Allow conservative reconstruction of partially hidden anatomy, but keep body type, limb lengths, identity and reachable selfie geometry locked.
- The result must look meaningfully different without becoming theatrical.`,
  clear: `POSE CHANGE BOLDNESS — CLEAR
- Choose a visibly distinct new pose, not a micro-variation, while remaining anatomically plausible and physically reachable as a Xiaomi 15 Ultra front-camera selfie.
- Larger torso orientation changes, supported seated/leaning transitions or stronger weight shifts are allowed only when the visible anatomy and preserved scene can support them.
- Never trade identity, body proportions, real support/contact or selfie reach for dramatic difference.`
});

let writing = false;
let observer = null;
const $ = (id) => document.getElementById(id);

function selectedText(select) {
  return select?.selectedOptions?.[0]?.textContent?.trim() || "غير محدد";
}

function currentMode() {
  return document.querySelector('input[name="poseUiMode"]:checked')?.value || "quick";
}

function clothingChanges() {
  return ($("clothingSelect")?.value || "preserve_reference") !== "preserve_reference";
}

function currentScope() {
  return document.querySelector('input[name="preserveScope"]:checked')?.value || "identity";
}

function conflictNotes() {
  const notes = [];
  const scope = currentScope();
  if (clothingChanges() && (scope === "identity_clothes" || scope === "identity_clothes_scene")) {
    notes.push("اختيار الملابس الجديدة يتغلب على حفظ الملابس فقط؛ الهوية والمكان يبقيان محفوظين حسب اختيارك.");
  }
  if ($("framingSelect")?.value === "full") {
    notes.push("الكادر الكامل مشروط بإمكانية تحقيقه من مسافة سيلفي بذراع حقيقية؛ وإلا سيُخفّف الكادر تلقائيًا.");
  }
  if ($("targetPoseSelect")?.value !== "smart_auto" && $("poseBoldnessSelect")?.value === "clear") {
    notes.push("جرأة «واضح» تطبق داخل حدود الوضعية اليدوية المختارة ولا تستبدلها بوضعية أخرى.");
  }
  return notes;
}

function updateSummary() {
  const summary = $("poseDecisionSummary");
  const conflicts = $("poseConflictSummary");
  if (!summary || !conflicts) return;

  const scopeMap = {
    identity: "الشخص فقط",
    identity_clothes: "الشخص + الملابس",
    identity_clothes_scene: "الشخص + الملابس + المكان"
  };
  const parts = [
    `الوضع: ${currentMode() === "quick" ? "سريع" : "متقدم"}`,
    `الوضعية: ${selectedText($("targetPoseSelect"))}`,
    `الجرأة: ${selectedText($("poseBoldnessSelect"))}`,
    `التعبير: ${selectedText($("expressionSelect"))}`,
    `الملابس: ${selectedText($("clothingSelect"))}`,
    `الإضاءة: ${selectedText($("nightLightingSelect"))}`,
    `الحفظ: ${scopeMap[currentScope()] || "الشخص فقط"}`,
    "التصوير: Xiaomi 15 Ultra أمامي"
  ];
  summary.textContent = parts.join(" · ");

  const notes = conflictNotes();
  conflicts.textContent = notes.length ? `حل التعارضات: ${notes.join(" ")}` : "لا توجد تعارضات منطقية بين الاختيارات الحالية.";
  conflicts.dataset.hasConflict = notes.length ? "true" : "false";
}

function setMode(mode, persist = true) {
  const advanced = mode === "advanced";
  document.body.dataset.poseUiMode = mode;
  document.querySelectorAll("[data-pose-advanced]").forEach((node) => { node.hidden = !advanced; });
  const input = document.querySelector(`input[name="poseUiMode"][value="${mode}"]`);
  if (input) input.checked = true;
  if (persist) {
    try { localStorage.setItem(STORAGE_KEY, mode); } catch {}
  }
  updateSummary();
}

function stripBlock(text) {
  const start = text.indexOf(MARKER_START);
  if (start < 0) return text;
  const end = text.indexOf(MARKER_END, start);
  if (end < 0) return text.slice(0, start).trimEnd();
  return `${text.slice(0, start)}${text.slice(end + MARKER_END.length)}`.replace(/\n{3,}/g, "\n\n").trim();
}

function uxBlock() {
  const boldness = $("poseBoldnessSelect")?.value || "medium";
  const conflicts = conflictNotes();
  return `${MARKER_START}\n${BOLDNESS[boldness] || BOLDNESS.medium}\n\nCONFLICT RESOLUTION — DETERMINISTIC\n- Facial identity and stable body proportions outrank every editable choice.\n- The mandatory Xiaomi 15 Ultra front-camera selfie geometry outranks framing requests that would require an observer camera, impossible arm length or visible capture device.\n- A user-selected new clothing preset overrides ONLY earlier instructions to preserve source clothing. It never overrides identity, body type or selected scene preservation.\n- User-selected lighting remains the sole lighting authority and must not be changed to make the pose easier.\n- If pose, crop and preserved scene cannot all coexist physically, simplify pose magnitude first, then loosen crop; do not redesign identity or the preserved environment.\n${conflicts.length ? `- Current resolved UI conflict note: ${conflicts.join(" ")}` : "- Current selections contain no detected UI-level conflicts."}\n${MARKER_END}`;
}

function transform(text) {
  let clean = stripBlock(text || "");
  clean = clean.replace("REFERENCE POSE TRANSFORMER v1.6", "REFERENCE POSE TRANSFORMER v1.7");
  const anchor = "\n\nLIGHTING / ILLUMINATION — USER CONTROLLED";
  const block = uxBlock();
  if (clean.includes(anchor)) return clean.replace(anchor, `\n\n${block}${anchor}`);
  return `${clean}\n\n${block}`.trim();
}

function applyPromptAuthority() {
  const output = $("posePromptOutput");
  if (!output || writing) return;
  const next = transform(output.textContent || "");
  if (next === output.textContent) return;
  writing = true;
  output.textContent = next;
  const count = next.trim().split(/\s+/).filter(Boolean).length;
  if ($("posePromptWordCount")) $("posePromptWordCount").textContent = `${count} كلمة`;
  queueMicrotask(() => { writing = false; });
}

function refresh() {
  updateSummary();
  applyPromptAuthority();
}

function install() {
  let stored = "quick";
  try { stored = localStorage.getItem(STORAGE_KEY) || "quick"; } catch {}
  if (!["quick", "advanced"].includes(stored)) stored = "quick";
  setMode(stored, false);

  document.querySelectorAll('input[name="poseUiMode"]').forEach((node) => node.addEventListener("change", () => setMode(node.value)));
  ["targetPoseSelect","poseBoldnessSelect","expressionSelect","clothingSelect","customClothingInput","nightLightingSelect","framingSelect"].forEach((id) => $(id)?.addEventListener("input", refresh));
  document.querySelectorAll('input[name="preserveScope"]').forEach((node) => node.addEventListener("change", refresh));
  $("buildPosePromptBtn")?.addEventListener("click", () => queueMicrotask(refresh));
  $("resetPoseTransformerBtn")?.addEventListener("click", () => queueMicrotask(() => {
    if ($("poseBoldnessSelect")) $("poseBoldnessSelect").value = "medium";
    setMode("quick");
    refresh();
  }));

  const output = $("posePromptOutput");
  if (output) {
    observer = new MutationObserver(() => queueMicrotask(applyPromptAuthority));
    observer.observe(output, { childList:true, characterData:true, subtree:true });
  }
  refresh();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once:true });
else install();
