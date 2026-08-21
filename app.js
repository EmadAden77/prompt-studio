const locations = [
  ["bedroom", "غرفة نوم", "inside a realistic lived-in bedroom"],
  ["office", "مكتب", "inside a realistic modern office"],
  ["car", "داخل سيارة", "inside a real car interior"],
  ["street", "شارع", "on a real urban street"],
  ["gym", "نادي رياضي", "inside a real gym"],
  ["cafe", "مقهى", "inside a real casual café"],
  ["villa", "فيلا", "inside or immediately outside a real residential villa"],
  ["parking", "موقف سيارات", "in a real outdoor parking area"]
];

const angles = [
  ["eye", "مستوى العين", "eye-level front-camera selfie, natural handheld framing"],
  ["high", "أعلى قليلًا", "slightly high selfie angle, camera about 8–12 degrees above eye level"],
  ["low", "أسفل قليلًا", "slightly low selfie angle, camera about 8–12 degrees below eye level"],
  ["left", "جانبية من اليسار", "subtle left-side selfie angle with a mild three-quarter facial view"],
  ["right", "جانبية من اليمين", "subtle right-side selfie angle with a mild three-quarter facial view"],
  ["down", "الهاتف أعلى ومائل للأسفل", "phone held slightly higher and angled downward naturally"],
  ["up", "الهاتف أسفل ومائل للأعلى", "phone held around upper-chest level and angled upward naturally"],
  ["offcenter", "غير مركزي عفوي", "off-center casual selfie composition with slight natural camera roll"]
];

const poses = [
  ["standing", "واقف بشكل طبيعي", "standing naturally with relaxed asymmetrical shoulders"],
  ["sit-chair", "جالس على كرسي", "sitting naturally on a chair with believable torso and shoulder mechanics"],
  ["sit-bed", "جالس على طرف السرير", "sitting naturally on the edge of the bed"],
  ["lean", "متكئ على الجدار", "leaning lightly against a wall in a relaxed natural posture"],
  ["lying-back", "مستلقي على الظهر", "lying naturally on the back while taking a believable front-camera selfie"],
  ["lying-side", "مستلقي على الجانب", "lying naturally on one side while taking a believable front-camera selfie"],
  ["floor", "جالس على الأرض", "sitting casually on the floor with anatomically correct posture"],
  ["walking", "يمشي ببطء", "walking slowly with a casual handheld selfie posture and slight natural motion softness"]
];

const expressions = [
  ["neutral", "محايد", "neutral closed-mouth expression"],
  ["soft", "ابتسامة خفيفة", "small natural closed-mouth smile"],
  ["half", "نصف ابتسامة", "subtle asymmetric half-smile"],
  ["smile", "ابتسامة طبيعية", "small natural smile with only slight teeth visibility"],
  ["serious", "جدي", "calm serious expression without exaggerated tension"]
];

const lightings = [
  ["auto", "طبيعية حسب المكان", "use only the physically plausible existing light sources in the chosen scene"],
  ["ceiling-white", "لمبة سقف بيضاء", "a single practical white ceiling light with realistic falloff and naturally darker areas"],
  ["warm", "إضاءة داخلية دافئة", "ordinary warm indoor practical lighting with imperfect exposure"],
  ["fluorescent", "فلورسنت مكتب", "ordinary overhead fluorescent office lighting with realistic color cast"],
  ["day", "ضوء نهار", "available natural daylight only, with realistic window falloff and no artificial fill"],
  ["street", "إنارة شارع ليلية", "available street lighting at night with realistic mixed color temperatures"],
  ["car", "إضاءة سيارة ليلية", "dim existing car-interior and street-light spill only"]
];

const cameras = [
  ["xiaomi", "Xiaomi 15 Ultra · أمامية", "Xiaomi 15 Ultra front-camera rendering, approximately 21–22 mm equivalent, natural smartphone HDR, ordinary sharpening and compression"],
  ["iphone", "iPhone 15 Pro Max · أمامية", "iPhone 15 Pro Max front-camera rendering, approximately 24 mm equivalent, ordinary computational HDR and natural phone processing"],
  ["generic", "هاتف حديث · أمامية", "modern smartphone front-camera rendering with believable wide-angle geometry and ordinary computational processing"]
];

const state = { location: locations[0][0] };
const byId = (id) => document.getElementById(id);

function fillSelect(id, items) {
  const el = byId(id);
  el.innerHTML = items.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
}

function getItem(items, value) {
  return items.find(([id]) => id === value) || items[0];
}

function renderLocationChips() {
  byId("locationChips").innerHTML = locations.map(([id, label]) =>
    `<button class="chip ${state.location === id ? "active" : ""}" data-location="${id}" type="button">${label}</button>`
  ).join("");
  document.querySelectorAll("[data-location]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.location = btn.dataset.location;
      renderLocationChips();
      buildPrompt();
    });
  });
}

function locationDescription() {
  const custom = byId("customLocation").value.trim();
  return custom || getItem(locations, state.location)[2];
}

function buildPrompt() {
  const angle = getItem(angles, byId("angleSelect").value)[2];
  const pose = getItem(poses, byId("poseSelect").value)[2];
  const expression = getItem(expressions, byId("expressionSelect").value)[2];
  const lighting = getItem(lightings, byId("lightingSelect").value)[2];
  const camera = getItem(cameras, byId("cameraSelect").value)[2];
  const ratio = byId("ratioSelect").value;
  const location = locationDescription();

  const prompt = `REFERENCE IMAGE — STRICT IDENTITY SOURCE ONLY\nUse the uploaded reference image as the strict identity reference for the person. Preserve the exact same facial identity and overall physical identity. Keep the exact face shape, jaw width, chin, nose, eyes, eyebrows, lips, ears, forehead, hairstyle, hairline, beard pattern, apparent age, skin characteristics, and natural asymmetry. Do not beautify, smooth, slim, widen, reshape, enhance, rejuvenate, stylize, or reinterpret the face. Do not change the hairstyle or hairline.\n\nSELFIE-ONLY CAPTURE RULE\nGenerate a true handheld front-camera selfie, not a portrait photographed by another person. The geometry must read as a believable arm's-length smartphone selfie. Keep the phone and selfie-taking arm outside the visible frame through natural cropping and framing. Never distort, lengthen, bend, or anatomically alter the arm to solve the composition. Maintain realistic neck, shoulder, torso, and hand mechanics.\n\nSCENE\nLocation: ${location}. Preserve physically coherent architecture, materials, object scale, perspective, depth, wear, spacing, and ordinary scene clutter appropriate to that exact location. Do not invent decorative elements or extra people unless explicitly required by the location description.\n\nPOSE AND COMPOSITION\nPose: ${pose}.\nSelfie angle: ${angle}.\nExpression: ${expression}.\nAspect ratio: ${ratio}.\nUse a believable casual composition rather than a perfectly centered studio portrait.\n\nCAMERA REALISM CONTROL — MAXIMUM\nUse ${camera}. Preserve realistic front-camera perspective, mild wide-angle facial geometry, limited dynamic range, ordinary smartphone sharpening, subtle sensor noise, small compression artifacts, occasional mild highlight clipping, and realistic focus behavior. Keep face and background within the same photographic processing pipeline. Do not make the face unnaturally sharper or cleaner than the environment.\n\nFACE, SKIN, HAIR AND BEARD REALISM CONTROL — MAXIMUM\nPreserve non-uniform pores, fine vellus hair, subtle skin texture variation, ordinary imperfections, realistic skin sheen, uneven micro-contrast, and natural facial asymmetry. Keep individual and clustered hair strands irregular, with believable density variation and imperfect hairline edges. Keep beard density and transition irregular and natural. Avoid plastic skin, waxy skin, airbrushing, beauty-filter texture, overly perfect pores, graphic hair edges, helmet-like hair, or perfectly outlined beard borders.\n\nBODY AND ANATOMY REALISM CONTROL — MAXIMUM\nPreserve believable human anatomy, joint mechanics, shoulder asymmetry, neck transitions, hand scale, finger structure, fabric contact, gravity, and realistic body proportions. Never solve framing by warping limbs, torso, shoulders, hands, or furniture.\n\nLIGHTING REALISM CONTROL — MAXIMUM\nLighting: ${lighting}. Use only physically motivated light. Preserve believable falloff, real shadow direction, uneven illumination, limited dynamic range, scene-appropriate white balance, and small exposure imperfections. No cinematic rim light, studio key light, perfect fill, beauty lighting, artificial glow, or impossible shadowless illumination.\n\nBACKGROUND REALISM CONTROL — MAXIMUM\nMaintain real-world perspective, depth, clutter logic, material response, reflections, occlusion, contact shadows, object grounding, and natural non-repetitive detail. Avoid duplicated objects, melted geometry, repeated textures, fake bokeh, impossible reflections, floating items, or overly clean synthetic backgrounds.\n\nNATURAL IMPERFECTIONS — REQUIRED\nKeep subtle real-camera imperfections when physically plausible: mild focus inconsistency, small sensor noise, slight motion softness, minor white-balance error, local exposure variation, ordinary compression, uneven hair strands, fabric wrinkles, and naturally imperfect environmental detail. These imperfections must remain subtle and photographic, never exaggerated as a stylistic filter.\n\nSELECTED-ONLY MODE — MANDATORY\nDo not add optional accessories, props, extra people, decorative objects, additional lighting sources, clothing details, vehicles, room changes, gestures, or environmental embellishments that were not explicitly requested. Do not change the subject's identity or turn the selfie into a cinematic portrait.\n\nFINAL TARGET\nCreate a highly convincing ordinary smartphone selfie with maximum photographic realism and strong identity preservation. Prioritize physical coherence and natural camera behavior over visual perfection. The result should look like a plausible real front-camera photograph, not polished digital artwork or an idealized AI aesthetic.`;

  byId("promptOutput").value = prompt;
  return prompt;
}

function randomizeComposition() {
  const selectRandom = (id, items) => {
    const current = byId(id).value;
    const candidates = items.filter(([value]) => value !== current);
    byId(id).value = candidates[Math.floor(Math.random() * candidates.length)][0];
  };
  selectRandom("angleSelect", angles);
  selectRandom("poseSelect", poses);
  selectRandom("expressionSelect", expressions);
  buildPrompt();
}

function init() {
  fillSelect("angleSelect", angles);
  fillSelect("poseSelect", poses);
  fillSelect("expressionSelect", expressions);
  fillSelect("lightingSelect", lightings);
  fillSelect("cameraSelect", cameras);
  renderLocationChips();

  ["customLocation", "angleSelect", "poseSelect", "expressionSelect", "lightingSelect", "cameraSelect", "ratioSelect"]
    .forEach((id) => byId(id).addEventListener("input", buildPrompt));

  byId("referenceImage").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    byId("previewImage").src = url;
    byId("previewImage").hidden = false;
    byId("uploadPlaceholder").hidden = true;
  });

  byId("generateBtn").addEventListener("click", buildPrompt);
  byId("variationBtn").addEventListener("click", randomizeComposition);
  byId("copyBtn").addEventListener("click", async () => {
    const text = buildPrompt();
    try {
      await navigator.clipboard.writeText(text);
      byId("copyStatus").textContent = "تم نسخ الـPrompt ✓";
    } catch {
      byId("promptOutput").select();
      document.execCommand("copy");
      byId("copyStatus").textContent = "تم نسخ الـPrompt ✓";
    }
    setTimeout(() => { byId("copyStatus").textContent = ""; }, 1800);
  });

  buildPrompt();
}

init();
