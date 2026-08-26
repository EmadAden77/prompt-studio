import "./carCloseupRuntime.js";
import { PromptEngine } from "./engines/promptEngine.js";
import { getActiveCarTemplate } from "./carTemplates.js";

const patchFlag = Symbol.for("promptStudio.carPromptConflictNormalizer.patched");

const LEGACY_CAR_NO_ARM_BLOCK = `- The camera-holding arm, hand, fingertips, and phone are completely outside the finished crop. Hide them by physically reachable composition, never by erasing, shortening, amputating, deforming, or disconnecting anatomy.`;

const CAR_ARM_REPLACEMENT = `- CAR CABIN ARM VISIBILITY: a physically continuous camera-side shoulder/forearm/hand segment MAY enter an extreme frame edge when required by the selected car pose and true 22–24mm near-field geometry. The phone itself remains directly invisible behind the front-camera optical center. Never lengthen bones or add joints.`;

const UNIFIED_VEHICLE_AUTHORITY = `IMAGE A — SINGLE UNIFIED VEHICLE AUTHORITY
- IMAGE A is the SAME image used for the subject identity and the vehicle reference. Do not request, require, or infer a separate IMAGE B for car templates.
- The vehicle is one WHITE 2022 RANGE ROVER SPORT. Preserve every vehicle feature visibly established by IMAGE A before using model knowledge for anything unseen.
- Visible reference evidence has priority over generic model assumptions: keep the exact visible seat color, leather character, stitching, steering wheel, dashboard, displays, center console, gear selector, door trim, mirrors, pillars, roof, sunroof, window geometry, materials, proportions, and small visible details.
- The person visible in IMAGE A is the identity authority as well as the seated-body scale reference. Do not replace him with a look-alike and do not treat his reference pose or clothing as mandatory unless the selected template asks for them.`;

const RANGE_ROVER_COMPLETION_LOCK = `VEHICLE IDENTITY & UNSEEN-AREA COMPLETION LOCK — WHITE 2022 RANGE ROVER SPORT
- Treat the cabin as one continuous real 2022 Range Rover Sport, not as a front-seat set with an invented rear half.
- IMAGE A is absolute authority for every area it actually shows. Never redesign a visible part merely because generic model knowledge differs.
- When a selected selfie angle reveals previously unseen passenger-side or rear-cabin areas, continue them only as necessary using authentic 2022 Range Rover Sport architecture consistent with the visible configuration and the same design language.
- Continue the visible light-beige leather family, matching stitching logic, compatible door-panel construction, trim language, roof/headliner treatment, glazing, pillar proportions, seat geometry, rear seating, rear door geometry, rear console/vent treatment, and cargo/rear-cabin spatial proportions as one coherent vehicle.
- Keep Saudi left-hand-drive geometry coherent throughout: driver on the left, steering wheel in front of the driver, center console to the driver's right, and rear/passenger geometry aligned to the same cabin shell.
- If any exterior bodywork becomes visible from an open sightline, mirror, window edge, or unusual but physically reachable cabin angle, the vehicle body is WHITE and remains the same 2022 Range Rover Sport.
- Do not mix generations, facelifts, dashboards, steering wheels, seats, door cards, trim packages, roof geometries, or rear-cabin designs from another Range Rover, another model year, or another vehicle.
- For an unseen detail that IMAGE A does not prove and the real model may have multiple trim variants, choose the least-assumptive physically plausible continuation that best matches the visible materials. Never add decorative features merely to fill space.
- Rear-cabin completion must feel like the camera simply turned inside the same real car. No style reset, no material reset, no scale jump, and no separate lighting or rendering pipeline.`;

function normalizeUnifiedCarReference(text) {
  if (typeof text !== "string") return text;

  let output = text;

  output = output.replace(
    "Generate one new, ordinary, photorealistic smartphone selfie inside the exact same vehicle interior represented by IMAGE B, using IMAGE A only for identity.",
    "Generate one new, ordinary, photorealistic smartphone selfie inside the exact same white 2022 Range Rover Sport represented by IMAGE A. IMAGE A is the single unified reference for both the subject identity and the vehicle."
  );

  output = output.replace(
    /IMAGE B is the built-in vehicle reference “[^”]+”\. Use it as the sole authority for the vehicle interior\. The car remains the same car with the exact seat shapes, upholstery, stitching, steering wheel, dashboard, displays, center console, gear selector, trim, doors, mirrors, roof, sunroof, pillars, window geometry, materials, colors, proportions, and visible small details\./,
    "IMAGE A is the single unified subject-and-vehicle reference. The vehicle is a white 2022 Range Rover Sport. Preserve every visible cabin detail from IMAGE A exactly as supported by the image; use the model identity only to continue areas that the selected camera angle newly reveals."
  );

  output = output
    .replaceAll("REFERENCE AUTHORITY\nIMAGE A — IDENTITY ONLY", "REFERENCE AUTHORITY — SINGLE UNIFIED IMAGE\nIMAGE A — SUBJECT IDENTITY + VEHICLE IDENTITY")
    .replaceAll(
      "IMAGE A does not control pose, clothing, expression, lighting, camera viewpoint, or vehicle geometry.",
      "IMAGE A controls the subject identity and the vehicle identity plus all visible vehicle geometry. It does not force the reference pose, reference clothing, expression, lighting, or camera viewpoint when the selected template changes them."
    )
    .replace(
      /\n\nIMAGE B — VEHICLE INTERIOR ONLY\nUse “[^”]+” as the immutable vehicle reference\. Do not borrow the person, pose, facial identity, or clothing from IMAGE B\. If IMAGE B contains a different person, replace only that person while preserving the complete vehicle interior and viewpoint logic required by this selfie template\./,
      `\n\n${UNIFIED_VEHICLE_AUTHORITY}`
    );

  if (!output.includes("VEHICLE IDENTITY & UNSEEN-AREA COMPLETION LOCK — WHITE 2022 RANGE ROVER SPORT")) {
    output = output.replace(
      "\n\nCAR INTERIOR LOCK — IMMUTABLE",
      `\n\n${RANGE_ROVER_COMPLETION_LOCK}\n\nCAR INTERIOR LOCK — IMMUTABLE`
    );
  }

  output = output
    .replaceAll("1000206938.jpg", "IMAGE A")
    .replaceAll("1000206961.png", "IMAGE A")
    .replaceAll("IMAGE B", "IMAGE A")
    .replaceAll("using IMAGE A only for identity", "using IMAGE A as the single unified subject-and-vehicle reference")
    .replaceAll("IMAGE A — VEHICLE INTERIOR ONLY", "IMAGE A — SINGLE UNIFIED VEHICLE AUTHORITY")
    .replaceAll("IMAGE A and IMAGE A", "IMAGE A")
    .replaceAll("IMAGE A / IMAGE A", "IMAGE A");

  output = output.replace(
    /IMAGE A is the built-in vehicle reference “[^”]+”\./g,
    "IMAGE A is the uploaded single unified subject-and-vehicle reference."
  );

  if (!output.includes("IMAGE A — SINGLE UNIFIED VEHICLE AUTHORITY")) {
    output = `${output}\n\n${UNIFIED_VEHICLE_AUTHORITY}`;
  }
  if (!output.includes("VEHICLE IDENTITY & UNSEEN-AREA COMPLETION LOCK — WHITE 2022 RANGE ROVER SPORT")) {
    output = `${output}\n\n${RANGE_ROVER_COMPLETION_LOCK}`;
  }

  return output;
}

function normalizeCarPrompt(text) {
  if (typeof text !== "string") return text;

  const armNormalized = text
    .replaceAll(LEGACY_CAR_NO_ARM_BLOCK, CAR_ARM_REPLACEMENT)
    .replaceAll("- any part of the camera-holding arm, hand, fingertips, or phone appears in frame;", "- the phone appears directly in frame, or any visible camera-side arm/hand segment is anatomically disconnected, overextended, duplicated, or inconsistent with the cabin reach lock;")
    .replaceAll("The camera-holding arm and phone remain completely outside crop.", "Arm visibility follows the CAR CABIN SELFIE LOCK: a small camera-side forearm/shoulder segment may enter an extreme edge when physically required; the phone remains directly invisible.")
    .replaceAll("No observer-camera distance and no visible camera-holding arm.", "No observer-camera distance. Any visible camera-side arm segment must remain a small, continuous, physically reachable edge foreground under the CAR CABIN SELFIE LOCK.")
    .replaceAll("camera-holding arm stays outside crop.", "camera-side arm visibility follows the CAR CABIN SELFIE LOCK; the phone stays directly invisible.")
    .replaceAll("with the camera-holding arm fully outside crop.", "with camera-side arm visibility governed by the CAR CABIN SELFIE LOCK.")
    .replaceAll("no visible camera arm or phone.", "no directly visible phone; any visible arm segment must obey the CAR CABIN SELFIE LOCK.")
    .replaceAll("The camera-holding side remains completely outside crop.", "The camera-side arm may enter only as a small physically continuous extreme-edge foreground segment under the CAR CABIN SELFIE LOCK; the phone remains directly invisible.")
    .replaceAll("the holding arm remains outside crop", "camera-side arm visibility follows the CAR CABIN SELFIE LOCK")
    .replaceAll("visible camera-holding arm", "anatomically impossible or disconnected camera-side arm")
    .replaceAll("no visible holding arm", "no anatomically impossible or disconnected holding arm");

  return normalizeUnifiedCarReference(armNormalized)
    .concat(`\n\nCAR CABIN ARM VISIBILITY PRIORITY — FINAL OVERRIDE\nFor an active car template only, any earlier generic instruction requiring the entire camera-holding arm to remain outside crop is superseded by the XIAOMI 15 ULTRA FRONT-CAMERA CABIN SELFIE LOCK. A small physically continuous camera-side shoulder/forearm/hand segment may appear at an extreme edge when the selected pose requires it. The phone itself remains directly invisible. This override does NOT apply to non-car templates.`);
}

function patchPromptEngine() {
  const proto = PromptEngine?.prototype;
  if (!proto || proto[patchFlag] || typeof proto.generate !== "function") return;

  const originalGenerate = proto.generate;
  proto.generate = function generateWithCarConflictNormalization(config = {}) {
    const result = originalGenerate.call(this, config);
    const pose = getActiveCarTemplate();
    if (!pose) return result;
    return normalizeCarPrompt(result);
  };

  proto[patchFlag] = true;
}

let uiDefaults = null;
let syncQueued = false;

function activeCarTemplate() {
  return getActiveCarTemplate();
}

function captureUiDefaults() {
  if (uiDefaults || typeof document === "undefined") return;
  const imageACard = document.querySelector('[data-upload="imageA"]');
  uiDefaults = {
    referencesTitle: document.querySelector("#referencesTitle")?.textContent ?? "الصور المرجعية",
    imageASubtitle: imageACard?.querySelector(".upload-card__heading span")?.textContent ?? "الهوية فقط",
    imageAHint: imageACard?.querySelector(".upload-card__hint")?.textContent ?? "الوجه والبشرة والشعر واللحية فقط، بدون نقل الوضعية أو التعبير أو الملابس."
  };
}

function uploadedReference() {
  const input = document.querySelector("#imageAInput");
  const preview = document.querySelector("#imageAPreview");
  const hasPreview = preview && !preview.hidden && Boolean(preview.getAttribute("src"));
  return {
    src: hasPreview ? preview.src : null,
    filename: input?.files?.[0]?.name ?? "IMAGE A"
  };
}

function reason(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function syncUnifiedCarUI() {
  if (typeof document === "undefined") return;
  captureUiDefaults();

  const template = activeCarTemplate();
  const dedicatedCarPage = document.body?.dataset.page === "car";
  const imageACard = document.querySelector('[data-upload="imageA"]');
  const autoReferenceCard = document.querySelector("[data-auto-reference]");

  if (!template && !dedicatedCarPage) {
    if (autoReferenceCard) autoReferenceCard.hidden = false;
    const referencesTitle = document.querySelector("#referencesTitle");
    if (referencesTitle && uiDefaults) referencesTitle.textContent = uiDefaults.referencesTitle;
    const subtitle = imageACard?.querySelector(".upload-card__heading span");
    if (subtitle && uiDefaults) subtitle.textContent = uiDefaults.imageASubtitle;
    const hint = imageACard?.querySelector(".upload-card__hint");
    if (hint && uiDefaults) hint.textContent = uiDefaults.imageAHint;
    return;
  }

  const reference = uploadedReference();
  if (autoReferenceCard) autoReferenceCard.hidden = true;

  const referencesTitle = document.querySelector("#referencesTitle");
  if (referencesTitle) referencesTitle.textContent = "مرجع واحد فقط — الشخص + السيارة";

  const subtitle = imageACard?.querySelector(".upload-card__heading span");
  if (subtitle) subtitle.textContent = "المرجع الموحّد: الهوية + السيارة";
  const hint = imageACard?.querySelector(".upload-card__hint");
  if (hint) hint.textContent = "في قوالب السيارة ارفع صورة واحدة فقط للشخص داخل نفس السيارة. IMAGE A تصبح مرجع الهوية والسيارة معًا؛ لا تحتاج IMAGE B.";

  const title = document.querySelector("#sceneTitle");
  if (title) title.textContent = "المرجع الموحّد — الشخص داخل السيارة";
  const confidence = document.querySelector("#sceneConfidence");
  if (confidence) {
    confidence.textContent = reference.src ? "IMAGE A ✓" : "بانتظار IMAGE A";
    confidence.className = reference.src ? "confidence-badge is-high" : "confidence-badge";
  }

  const sceneImage = document.querySelector("#sceneImage");
  const fallback = document.querySelector("#sceneFallback");
  if (sceneImage) {
    sceneImage.src = reference.src ?? "assets/scene-placeholder.svg";
    sceneImage.alt = "معاينة المرجع الموحّد للشخص والسيارة";
    sceneImage.classList.toggle("is-placeholder", !reference.src);
  }
  if (fallback) {
    fallback.hidden = Boolean(reference.src);
    fallback.textContent = "ارفع IMAGE A — الشخص داخل السيارة";
  }

  const region = document.querySelector("#sceneRegion");
  if (region) region.textContent = "WHITE 2022 RANGE ROVER SPORT · SINGLE IMAGE A";
  const name = document.querySelector("#sceneName");
  if (name) name.textContent = "رنج روفر سبورت 2022 أبيض — نفس الشخص ونفس السيارة";
  const filename = document.querySelector("#sceneFilename");
  if (filename) filename.textContent = reference.filename;
  const reasons = document.querySelector("#sceneReasons");
  if (reasons) reasons.replaceChildren(
    reason("IMAGE A هي المرجع الوحيد للوجه والشعر واللحية والجسم والسيارة في قوالب السيارة."),
    reason("كل ما يظهر من المقصورة في IMAGE A يبقى ثابتًا؛ لا إعادة تصميم للمقود أو المقاعد أو الكونسول أو السقف."),
    reason("إذا ظهرت الخلفية الداخلية أو جهة الراكب من زاوية جديدة، تُستكمل كجزء من نفس Range Rover Sport 2022 وبنفس لغة التصميم والخامات."),
    reason("لون الهيكل الخارجي ثابت: أبيض. السيارة متوقفة بالكامل داخل السعودية.")
  );

  const send = document.querySelector("#sendInstruction");
  if (send) send.innerHTML = "أرفق <strong>صورة واحدة فقط</strong> باعتبارها <strong>IMAGE A</strong>: الشخص داخل نفس السيارة. لا ترفق IMAGE B لقالب السيارة. IMAGE A هي سلطة الهوية والسيارة معًا، والسيارة Range Rover Sport 2022 بيضاء؛ الأجزاء غير الظاهرة تُستكمل فقط عند الحاجة وبنفس تصميم السيارة.";

  const timeName = document.querySelector("#carTimeSelect option:checked")?.textContent?.trim() ?? "";
  const summary = document.querySelector("#promptSummary");
  if (summary) {
    const templateName = template?.name_ar ?? "اختر قالب السيارة";
    summary.textContent = `🚙 ${templateName}${timeName ? ` · ${timeName}` : ""} · مرجع واحد IMAGE A · Range Rover Sport 2022 أبيض · Xiaomi 15 Ultra Front Camera · متوقفة في السعودية`;
  }

  const hubPreview = document.querySelector(".car-template-card__preview img");
  if (hubPreview) {
    hubPreview.src = reference.src ?? "assets/scene-placeholder.svg";
    hubPreview.alt = "المرجع الموحّد للشخص داخل السيارة";
  }
  const hubTitle = document.querySelector(".car-template-card__preview strong");
  if (hubTitle) hubTitle.textContent = "IMAGE A — الشخص + Range Rover Sport 2022";
  const hubMeta = document.querySelector(".car-template-card__preview small");
  if (hubMeta) hubMeta.textContent = reference.src
    ? "مرجع واحد مرفوع: الهوية والسيارة معًا. الظاهر ثابت، والخلف/الأجزاء غير الظاهرة تُستكمل بنفس تصميم Range Rover Sport 2022 عند الحاجة."
    : "ارفع IMAGE A للشخص داخل السيارة. هذا القالب لا يحتاج صورة سيارة ثانية أو IMAGE B.";
}

function queueUnifiedCarUISync() {
  if (syncQueued || typeof document === "undefined") return;
  syncQueued = true;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    syncQueued = false;
    syncUnifiedCarUI();
  }));
  setTimeout(syncUnifiedCarUI, 90);
}

function installUnifiedCarUI() {
  captureUiDefaults();
  queueUnifiedCarUISync();

  document.addEventListener("change", (event) => {
    const id = event.target?.id;
    if (["hubCarTemplate", "carTimeSelect", "imageAInput", "xiaomiCaptureModeSelect"].includes(id)) queueUnifiedCarUISync();
  }, true);

  document.addEventListener("click", (event) => {
    const id = event.target?.closest?.("button")?.id;
    if (["imageARemove", "rebuildBtn"].includes(id)) queueUnifiedCarUISync();
  }, true);

  const rootObserver = new MutationObserver(queueUnifiedCarUISync);
  rootObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-active-car-template", "data-active-car-time"]
  });

  const preview = document.querySelector("#imageAPreview");
  if (preview) {
    const previewObserver = new MutationObserver(queueUnifiedCarUISync);
    previewObserver.observe(preview, { attributes: true, attributeFilter: ["src", "hidden"] });
  }
}

patchPromptEngine();

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installUnifiedCarUI, { once: true });
  else installUnifiedCarUI();
}
