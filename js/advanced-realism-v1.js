const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

export const SCENE_PROFILE_OPTIONS = Object.freeze([
  { value:"auto", label:"تلقائي من وصف المشهد" },
  { value:"optical-store", label:"محل نظارات / بصريات" },
  { value:"grocery", label:"بقالة / سوبرماركت صغير" },
  { value:"pharmacy", label:"صيدلية" },
  { value:"cafe", label:"كوفي / مقهى" },
  { value:"restaurant", label:"مطعم" },
  { value:"clinic", label:"عيادة" },
  { value:"office", label:"مكتب" },
  { value:"mall", label:"مول / مركز تجاري" },
  { value:"gas-station", label:"محطة وقود" }
]);

export const ACCESSORY_PROFILE_OPTIONS = Object.freeze([
  { value:"auto", label:"تلقائي من الوصف" },
  { value:"none", label:"بدون إكسسوار إضافي" },
  { value:"eyeglasses", label:"نظارة طبية / شمسية" },
  { value:"watch", label:"ساعة يد" },
  { value:"ring", label:"خاتم" },
  { value:"cap", label:"قبعة" },
  { value:"earbuds", label:"سماعات أذن" }
]);

export const OBJECT_PROFILE_OPTIONS = Object.freeze([
  { value:"auto", label:"تلقائي من تفاعل اليد" },
  { value:"none", label:"بدون جسم محدد" },
  { value:"held-eyeglasses", label:"نظارة ممسوكة باليد" },
  { value:"coffee-cup", label:"كوب قهوة" },
  { value:"car-keys", label:"مفتاح سيارة" },
  { value:"laptop", label:"لابتوب" },
  { value:"shopping-bag", label:"كيس مشتريات" },
  { value:"book", label:"كتاب" }
]);

const SCENE_PROFILES = Object.freeze({
  "optical-store": {
    text:"an ordinary functioning optical store with correctly scaled eyewear displays, small mirrors, practical counters and coherent aisles; frames are arranged with believable variation rather than perfect catalog symmetry",
    keywords:["optical","eyeglass","glasses store","نظارات","بصريات","محل نظارات"],
    micro:["faint handling marks may exist on a nearby glass display if it is actually visible", "a small amount of ordinary dust may remain at shelf edges without making the store dirty"]
  },
  grocery: {
    text:"an ordinary neighborhood grocery with usable aisles, supported shelf stock, believable product spacing, a practical checkout area and small natural gaps or uneven alignment in merchandise",
    keywords:["grocery","supermarket","mini market","بقالة","سوبرماركت","تموينات"],
    micro:["a few shelf rows may be slightly uneven from normal customer use", "packaging alignment may vary subtly without duplicated or floating products"]
  },
  pharmacy: {
    text:"a real pharmacy with clean practical shelving, a service counter, coherent medicine and personal-care display zones, and restrained clinical organization without showroom perfection",
    keywords:["pharmacy","صيدلية"],
    micro:["frequently touched counter or glass areas may show extremely faint use marks", "small shelf-spacing irregularities may remain while the store stays clean"]
  },
  cafe: {
    text:"an ordinary operating cafe with practical seating, a service counter, real circulation paths and believable cup or equipment placement, kept secondary to the selfie",
    keywords:["cafe","coffee shop","مقهى","كوفي"],
    micro:["a nearby tabletop may show a subtle normal use trace if it enters the crop", "glass or metal service surfaces may carry restrained handling variation rather than perfect polish"]
  },
  restaurant: {
    text:"a functioning everyday restaurant with coherent tables, seating, service paths and practical lighting, without staged symmetry or a showroom dining-room look",
    keywords:["restaurant","مطعم"],
    micro:["chairs or table settings may vary slightly from recent normal use", "frequently touched surfaces may be clean but not optically perfect"]
  },
  clinic: {
    text:"a real outpatient clinic or waiting area with practical seating, clean surfaces, coherent doors and service points, restrained medical context and no invented operating-room equipment",
    keywords:["clinic","medical center","عيادة","مستوصف"],
    micro:["seating may show tiny pressure or use variation", "clean glass or counters may retain very faint handling traces without looking dirty"]
  },
  office: {
    text:"an ordinary working office with usable desks, chairs, storage and cables or papers only where work actually requires them, avoiding staged executive-showroom styling",
    keywords:["office","workspace","مكتب"],
    micro:["desk items may be slightly asymmetrical from daily work", "frequently used chair or desk surfaces may show subtle normal wear"]
  },
  mall: {
    text:"a real Saudi shopping mall interior with coherent storefront spacing, circulation paths, floor reflections and sparse-to-moderate public activity scaled to the visible field of view",
    keywords:["mall","shopping center","مول","مركز تجاري"],
    micro:["polished floors may show subtle real scuff or reflection variation", "distant storefront glass may carry restrained reflections rather than mirror-perfect clarity"]
  },
  "gas-station": {
    text:"a functioning Saudi fuel station or attached convenience area with coherent pumps, canopy, paving and vehicle circulation, visible only where the selfie viewpoint physically reaches it",
    keywords:["gas station","fuel station","محطة وقود","بنزين"],
    micro:["paving may show mild ordinary tire or use marks", "metal and glass surfaces may carry restrained dust or handling variation appropriate to an outdoor service area"]
  }
});

const ACCESSORY_PROFILES = Object.freeze({
  none:{ label:"بدون إكسسوار إضافي", text:"Do not invent an accessory merely to make the subject look styled." },
  eyeglasses:{ label:"نظارة", text:"Eyeglasses sit on the real nasal bridge and both ears with symmetric physical support but natural facial asymmetry. Frame width, temple length and lens position must match the head scale. Lenses refract or reflect only subtly according to the selected lighting, never hide the eyes with fake glare unless the source geometry truly produces it. Frame shadows fall on the face from the same practical light." },
  watch:{ label:"ساعة يد", text:"The watch conforms to the wrist circumference with believable strap tension and contact shadow. The case cannot float above the skin or intersect the wrist, and any glass highlight follows the selected practical light." },
  ring:{ label:"خاتم", text:"The ring wraps one physically visible finger at plausible scale, follows finger perspective and skin contact, and never merges two fingers or creates an extra digit." },
  cap:{ label:"قبعة", text:"The cap contacts the head with believable crown volume, brim thickness and hair compression only where fabric actually touches existing hair. It must not change the locked hairline or invent extra hair density." },
  earbuds:{ label:"سماعات أذن", text:"Earbuds seat inside the visible ear anatomy at plausible scale and angle, with no duplicated buds, floating stems or ear reshaping." }
});

const OBJECT_PROFILES = Object.freeze({
  none:{ label:"بدون جسم محدد", text:"Do not force a handheld object into the frame." },
  "held-eyeglasses":{ label:"نظارة ممسوكة", text:"A single pair of eyeglasses is casually held by the subject's free hand at a realistic temple, hinge or bridge grip. These eyeglasses are NOT worn on the face. The rigid frame keeps coherent geometry, the lenses remain thin and physically plausible, and fingers correctly occlude the frame according to depth instead of passing through it. Do not create a second pair of eyeglasses." },
  "coffee-cup":{ label:"كوب قهوة", text:"A coffee cup has believable diameter, wall thickness and upright gravity. The free hand uses a plausible side-wall or handle grip, with finger spacing and contact shadows matching the cup geometry. Do not tilt liquid-bearing geometry implausibly." },
  "car-keys":{ label:"مفتاح سيارة", text:"A small car key or key fob rests naturally between fingers or in the palm with realistic scale and weight. It must not become oversized, merge with fingers or require a second free hand." },
  laptop:{ label:"لابتوب", text:"A laptop must be physically supported by the lap, mattress, table or another real surface. Its hinge angle, screen plane, keyboard plane, weight and fabric compression must agree. Never let a laptop float or balance on an impossible fingertip grip." },
  "shopping-bag":{ label:"كيس مشتريات", text:"A shopping bag hangs from reachable fingers or rests against a supported surface. Handles carry the bag weight with believable tension and the bag deforms under gravity rather than floating or staying perfectly geometric." },
  book:{ label:"كتاب", text:"A book has plausible thickness and page block geometry, supported by the free hand or a real surface. Fingers contact the cover or page edge without clipping through it." }
});

const optionValue = (options, value, fallback) => options.some((item) => item.value === value) ? value : fallback;
const isCustom = (state) => state.scene === "custom";
const isCar = (state) => state.scene === "rangeRover";
const isDriverSeat = (state) => isCar(state) && state.carSeat === "driver-left";
const isTight = (state) => ["tight","close"].includes(state.composition);

function scoreKeywords(text, keywords) {
  const hay = clean(text).toLowerCase();
  return keywords.reduce((score, keyword) => score + (hay.includes(keyword.toLowerCase()) ? 1 : 0), 0);
}

export function inferSceneProfile(state) {
  if (!isCustom(state)) return "auto";
  const text = `${state.customScene || ""} ${state.customSceneDetails || ""}`;
  let best = "auto";
  let bestScore = 0;
  for (const [id, profile] of Object.entries(SCENE_PROFILES)) {
    const score = scoreKeywords(text, profile.keywords);
    if (score > bestScore) { best = id; bestScore = score; }
  }
  return best;
}

function inferAccessory(detail) {
  const text = clean(detail).toLowerCase();
  if (!text) return "none";
  if (/نظار|glasses|eyeglass|sunglass/u.test(text)) return "eyeglasses";
  if (/ساعة|watch/u.test(text)) return "watch";
  if (/خاتم|ring/u.test(text)) return "ring";
  if (/قبعة|كاب|cap|hat/u.test(text)) return "cap";
  if (/سماعة|earbud|earphone/u.test(text)) return "earbuds";
  return "none";
}

function inferObject(textValue) {
  const text = clean(textValue).toLowerCase();
  if (!text) return "none";
  if (/نظار|glasses|eyeglass/u.test(text)) return "held-eyeglasses";
  if (/قهوة|كوب|coffee|cup/u.test(text)) return "coffee-cup";
  if (/مفتاح|key fob|car key/u.test(text)) return "car-keys";
  if (/لابتوب|لاب توب|laptop|macbook/u.test(text)) return "laptop";
  if (/كيس|shopping bag|bag/u.test(text)) return "shopping-bag";
  if (/كتاب|book/u.test(text)) return "book";
  return "none";
}

export function getSceneProfileOptions() { return SCENE_PROFILE_OPTIONS.map((item) => ({ ...item })); }
export function getAccessoryProfileOptions() { return ACCESSORY_PROFILE_OPTIONS.map((item) => ({ ...item })); }
export function getObjectProfileOptions() { return OBJECT_PROFILE_OPTIONS.map((item) => ({ ...item })); }

export function resolveAdvancedRealismState(rawState = {}) {
  const state = { ...rawState };
  const conflicts = [];
  state.sceneProfile = optionValue(SCENE_PROFILE_OPTIONS, state.sceneProfile, "auto");
  state.accessoryProfile = optionValue(ACCESSORY_PROFILE_OPTIONS, state.accessoryProfile, "auto");
  state.objectProfile = optionValue(OBJECT_PROFILE_OPTIONS, state.objectProfile, "auto");
  state.accessoryDetail = clean(state.accessoryDetail);

  const inferredScene = inferSceneProfile(state);
  if (!isCustom(state)) state.sceneProfile = "auto";
  else if (state.sceneProfile === "auto") state.sceneProfile = inferredScene;
  else if (inferredScene !== "auto" && state.sceneProfile !== inferredScene) {
    conflicts.push({
      code:"scene-profile-mismatch",
      qa:"تمت مطابقة ملف المكان مع وصف المشهد المكتوب لتجنب خلط نوعين مختلفين من الأماكن.",
      prompt:"The explicit scene profile conflicted with the user-written location description, so the written location remains authoritative and the matching scene profile is used."
    });
    state.sceneProfile = inferredScene;
  }

  if (state.accessoryProfile === "auto") state.accessoryProfile = inferAccessory(state.accessoryDetail);
  if (state.objectProfile === "auto") state.objectProfile = inferObject(state.interactionObject);

  if (state.objectProfile === "held-eyeglasses" && state.accessoryProfile === "eyeglasses") {
    conflicts.push({
      code:"held-worn-eyeglasses-conflict",
      qa:"تم منع تعارض النظارة: عند اختيار «نظارة ممسوكة باليد» لن تُلبس النظارة نفسها على الوجه ولن تُنشأ نسخة ثانية.",
      prompt:"The held-eyeglasses Object Profile overrides worn-eyeglasses accessory behavior for the same physical pair. Keep one pair only, held in the free hand and not worn on the face."
    });
    state.accessoryProfile = "none";
  }

  if (isTight(state) && ["laptop","shopping-bag"].includes(state.objectProfile)) {
    conflicts.push({
      code:"large-object-tight-crop",
      qa:"الجسم الكبير أصبح مشروطاً بالكادر؛ إذا لم يدخل طبيعيًا يُحذف بدل توسيع السيلفي بالقوة.",
      prompt:"The selected handheld object is large relative to a tight selfie crop. Keep the selected crop authoritative and omit most or all of the object if it cannot enter naturally."
    });
  }

  return { state, conflicts };
}

function buildSceneProfileRule(state) {
  if (!isCustom(state)) return "";
  if (state.sceneProfile === "auto") return "[SCENE PROFILE] No specialized scene profile is forced. The user's custom location text remains the authority.";
  const profile = SCENE_PROFILES[state.sceneProfile];
  if (!profile) return "[SCENE PROFILE] Use only the physically plausible structure implied by the custom location.";
  return `[SCENE PROFILE] ${profile.text}. This profile supplies ordinary real-world priors only; it must not replace the user's written location, force every typical object into frame, add brands or create readable signage.`;
}

function buildAccessoryRule(state) {
  if (state.objectProfile === "held-eyeglasses" && state.accessoryProfile === "eyeglasses") {
    return "[ACCESSORY PHYSICS] Do not generate worn eyeglasses because the selected eyeglasses are assigned exclusively to the handheld Object Profile. Do not create a second pair.";
  }
  const profile = ACCESSORY_PROFILES[state.accessoryProfile] ?? ACCESSORY_PROFILES.none;
  const detail = state.accessoryDetail ? ` User detail: ${state.accessoryDetail}. Apply it only if it remains physically compatible with this accessory.` : "";
  return `[ACCESSORY PHYSICS] ${profile.text}${detail}`;
}

function buildObjectRule(state) {
  if (!state.objectProfile || state.objectProfile === "none") return "";
  const profile = OBJECT_PROFILES[state.objectProfile] ?? OBJECT_PROFILES.none;
  const custom = clean(state.interactionObject);
  const detail = custom ? ` User interaction wording: ${custom}.` : "";
  return `[OBJECT PROFILE] ${profile.text}${detail} The object is secondary to the selfie and may be omitted if the selected framing cannot include it without breaking arm reach, anatomy or contact physics.`;
}

function buildOcclusionRule(state) {
  const layers = [];
  if (state.objectProfile && state.objectProfile !== "none") layers.push("the free hand and held object");
  if (state.accessoryProfile && state.accessoryProfile !== "none") layers.push("the worn accessory");
  const foreground = layers.length ? `${layers.join(" and ")} may become foreground layers where they physically cross the face or clothing` : "hands, hair or incidental objects become foreground layers only when the selected pose actually places them there";
  return `[OCCLUSION ENGINE] Use one consistent depth order from the subject-held front camera. ${foreground}. Nearer surfaces hide farther surfaces with correct edge continuity, partial visibility and contact. Fingers may pass in front of an object or behind part of it according to the grip, but never through it. Background people, shelves, seats, mirrors and architecture remain behind the subject unless real geometry places an edge in front. Do not keep every object fully visible merely for completeness.`;
}

function buildCarOrientationRule(state) {
  if (!isCar(state)) return "";
  return "[CAR ORIENTATION LOCK] FINAL OUTPUT ORIENTATION: use unmirrored physical camera geometry for the finished image. Treat vehicle-left and vehicle-right as real cabin coordinates, not screen-left and screen-right. Do not horizontally flip, selfie-mirror, swap or reinterpret the cabin after composing the shot. Any visible steering wheel, center console, A-pillar, door, side window, mirror, seat, roof or windshield geometry must preserve the same left-hand-drive mapping from one coherent front-camera viewpoint.";
}

function buildDriverSeatVerificationRule(state) {
  if (!isDriverSeat(state)) return "";
  const tightRule = isTight(state)
    ? "Because the crop is tight or close, keep the selfie close but reserve only a thin upper steering-wheel rim fragment at the extreme lower edge, no more than 8% of image height, instead of widening into an interior showcase."
    : "The wider crop should normally preserve more than one coherent driver-side cue when those cues naturally enter frame.";
  return `[DRIVER SEAT VISUAL VERIFICATION] Keep the subject physically in the LEFT FRONT DRIVER'S SEAT. ${tightRule} A small, physically attached upper steering-wheel rim or column edge is mandatory in front of the subject's lower torso and must align with the real instrument cluster behind it. Preserve the center-console edge on the subject's right and/or coherent driver-door / A-pillar / side-window geometry on the subject's left whenever those cues naturally enter frame. Never fabricate or force a complete steering wheel, wheel hub, spokes or a broad holding forearm. If the selected crop initially misses the steering-wheel cue, adjust the crop slightly downward within the same reachable phone geometry; never treat the seat as visually ambiguous, mirror the cabin, move the wheel, or move the subject to the passenger seat.`;
}

function microCues(state) {
  if (isCustom(state) && SCENE_PROFILES[state.sceneProfile]) return SCENE_PROFILES[state.sceneProfile].micro.slice(0, 2);
  if (state.scene === "rangeRover") return ["a faint touch mark may remain on a visible glossy control or trim surface", "a tiny amount of ordinary dust may be visible only on a close, correctly lit surface"];
  if (state.scene === "gym") return ["frequently touched equipment may show restrained normal-use variation", "a mirror or metal surface may retain a faint non-distracting handling trace if close enough to resolve it"];
  if (state.scene === "street") return ["pavement may show mild ordinary wear or patch variation", "distant air may have slight natural atmospheric softness rather than crystal-clear infinite detail"];
  if (state.scene === "bedroom" || state.scene === "my_bedroom_text") return ["bedding and nearby personal items may retain small irregularities from ordinary use", "a frequently touched nearby surface may show subtle lived-in variation without visible dirt"];
  return ["allow one or two very small use-related imperfections only where the camera can actually resolve them"];
}

function buildMicrophysicsRule(state) {
  const cues = microCues(state);
  return `[ENVIRONMENT MICROPHYSICS] Use an imperfection budget, not an imperfection checklist. Apply at most two subtle cues appropriate to this exact scene and only when those surfaces are visible: ${cues.join("; ")}. Do not add dust, fingerprints, haze, wind, moisture or wear everywhere at once. Environmental imperfection must remain weaker than identity, pose, lighting and composition.`;
}

export function evaluateRealismRisk(state, conflicts = []) {
  let score = 100;
  const issues = [];
  const strengths = ["subject-held front-camera geometry is locked", "lighting remains subordinate to physical sources", "secondary details are allowed to fall outside the crop"];

  if (!state.hasReference) { score -= 8; issues.push("لم يتم تثبيت صورة هوية في المعاينة الحالية"); }
  if (isCustom(state) && !clean(state.customScene)) { score -= 18; issues.push("المشهد المخصص بلا وصف مكان"); }
  if (isCustom(state) && state.sceneProfile === "auto") { score -= 3; issues.push("لا يوجد ملف مشهد متخصص يمكن استنتاجه من الوصف"); }
  if (isTight(state) && state.objectProfile === "laptop") { score -= 7; issues.push("اللابتوب كبير بالنسبة لكلوز أب وقد يخرج من الكادر"); }
  if (isTight(state) && state.objectProfile === "shopping-bag") { score -= 5; issues.push("كيس المشتريات قد لا يدخل طبيعيًا في الكادر الضيق"); }
  if (state.peopleDensity === "busy" && isTight(state)) { score -= 10; issues.push("ازدحام البشر مرتفع بالنسبة للكادر الضيق"); }
  if (isDriverSeat(state) && state.composition === "tight") { score -= 3; issues.push("الكادر الضيق مقفل على قوس مقود علوي رفيع أمام السائق لتثبيت موضعه بصرياً"); }
  else if (isDriverSeat(state) && state.composition === "close") { score -= 2; issues.push("كلوز أب السائق يحتفظ بقوس مقود علوي ودليل مقصورة متسقين لتثبيت الموضع بصرياً"); }
  if (conflicts.length) { score -= Math.min(10, conflicts.length * 2); issues.push(`تم تصحيح ${conflicts.length} تعارض قبل إخراج البرومبت`); }
  if (state.sceneProfile && state.sceneProfile !== "auto") strengths.push("المشهد المخصص مربوط بملف مكان واقعي");
  if (state.accessoryProfile && state.accessoryProfile !== "none") strengths.push("الإكسسوار له تماس ومقياس وانعكاس مقيدان");
  if (state.objectProfile && state.objectProfile !== "none") strengths.push("الجسم المتفاعل معه له وزن وقبضة ودعم مقيدان");
  if (isCar(state)) strengths.push("اتجاه المقصورة النهائي مقفل على هندسة غير معكوسة");
  if (isDriverSeat(state) && !isTight(state)) strengths.push("الكادر يسمح عادةً بدليل بصري مباشر على مقعد السائق");

  score = Math.max(45, Math.min(100, score));
  const level = score >= 92 ? "ممتاز" : score >= 82 ? "قوي" : score >= 70 ? "جيد مع ملاحظات" : "يحتاج مراجعة";
  return { score, level, issues, strengths };
}

const PROTECTED_HEADERS = new Set([
  "[MASTER REALISM POLICY]","[CONFLICT RESOLUTION]","[IDENTITY]","[CAMERA]","[SELFIE POSE]","[CAR SEAT POSITION]","[CAR DRIVER SELFIE GEOMETRY — SOLE AUTHORITY]","[CAR ORIENTATION LOCK]","[DRIVER SEAT VISUAL VERIFICATION]","[HAIR]","[CLOTHING PHYSICS]","[PRACTICAL LIGHTING]"
]);

export function optimizePrompt(prompt) {
  const source = String(prompt ?? "").replace(/\r/g, "").trim();
  const sections = source.split(/\n{2,}/u).map((part) => part.trim()).filter(Boolean);
  const seenSections = new Set();
  let removedSections = 0;
  let removedSentences = 0;
  const output = [];

  for (const rawSection of sections) {
    const compact = rawSection.replace(/[ \t]+/g, " ").trim();
    const header = compact.match(/^\[[^\]]+\]/u)?.[0] ?? "";
    const protectedSection = PROTECTED_HEADERS.has(header);
    const sectionKey = compact.toLowerCase();
    if (!protectedSection && seenSections.has(sectionKey)) { removedSections += 1; continue; }
    seenSections.add(sectionKey);

    if (protectedSection) { output.push(compact); continue; }

    const body = header ? compact.slice(header.length).trim() : compact;
    const sentences = body.split(/(?<=[.!?])\s+(?=[A-Z\[])/u).filter(Boolean);
    const seenLocal = new Set();
    const kept = [];
    for (const current of sentences) {
      const key = current.replace(/\s+/g, " ").trim().toLowerCase();
      if (key && seenLocal.has(key)) { removedSentences += 1; continue; }
      if (key) seenLocal.add(key);
      kept.push(current.trim());
    }
    const rebuilt = [header, kept.join(" ")].filter(Boolean).join(" ").trim();
    output.push(rebuilt);
  }

  return { prompt:output.join("\n\n"), stats:{ removedSections, removedSentences, sectionCount:output.length } };
}

export function buildAdvancedRealismSections(state, conflicts = []) {
  const risk = evaluateRealismRisk(state, conflicts);
  return [
    buildSceneProfileRule(state),
    buildCarOrientationRule(state),
    buildDriverSeatVerificationRule(state),
    buildOcclusionRule(state),
    buildAccessoryRule(state),
    buildObjectRule(state),
    buildMicrophysicsRule(state),
    `[REALISM RISK CHECK] Final normalized realism score before generation: ${risk.score}/100 (${risk.level}). ${risk.issues.length ? `Remaining cautions: ${risk.issues.join("; ")}.` : "No material realism warning remains after normalization."} This score is a rule-based consistency diagnostic, not an aesthetic rating.`
  ].filter(Boolean);
}

export function advancedRealismQaItems(state, conflicts = [], optimizerStats = {}) {
  const risk = evaluateRealismRisk(state, conflicts);
  const sceneLabel = SCENE_PROFILE_OPTIONS.find((item) => item.value === state.sceneProfile)?.label ?? "تلقائي";
  const accessoryLabel = ACCESSORY_PROFILE_OPTIONS.find((item) => item.value === state.accessoryProfile)?.label ?? "بدون";
  const objectLabel = OBJECT_PROFILE_OPTIONS.find((item) => item.value === state.objectProfile)?.label ?? "بدون";
  const removed = Number(optimizerStats.removedSections || 0) + Number(optimizerStats.removedSentences || 0);
  const carQa = isCar(state) ? [
    { label:"اتجاه المقصورة", value:"الإخراج النهائي غير معكوس؛ يمين/يسار السيارة يتبعان الإحداثيات الفيزيائية للمقصورة" },
    ...(isDriverSeat(state) ? [{
      label:"تحقق مقعد السائق",
      value:isTight(state) ? "الكادر ضيق؛ يجب بقاء دليل بصري واحد على الأقل إذا سمحت الهندسة، وإلا يُسجل الموضع كملتبس بصرياً ولا يُنقل للراكب" : "الكادر يسمح عادةً بإظهار دليل أو أكثر على موضع السائق مع بقاء السيلفي هو الأساس"
    }] : [])
  ] : [];
  return [
    { label:"مؤشر الواقعية", value:`${risk.score}/100 — ${risk.level}${risk.issues.length ? ` · ${risk.issues.join(" · ")}` : ""}` },
    { label:"Scene Profile", value:isCustom(state) ? `${sceneLabel} — يضيف معرفة مكان فقط ولا يفرض كل التفاصيل` : "المشهد الأساسي له قواعده الخاصة؛ لا يوجد Profile إضافي مفروض" },
    ...carQa,
    { label:"Occlusion", value:"ترتيب العمق والحجب مرتبط بالكاميرا والقبضة والوجه والخلفية" },
    { label:"الإكسسوار", value:`${accessoryLabel} — المقياس والتلامس والظل والانعكاس مقيدان` },
    { label:"Object Profile", value:`${objectLabel} — الوزن والقبضة والدعم مقيدان أو يُحذف الجسم إذا لم يسمح الكادر` },
    { label:"Microphysics", value:"بحد أقصى أثرين بيئيين صغيرين مناسبين للمكان، بدون تجميع عيوب مصطنع" },
    { label:"Prompt Optimizer", value:removed ? `أزال ${removed} تكراراً حرفياً آمناً مع حماية أقفال الهوية والكاميرا والوضعية والإضاءة` : "لم يجد تكراراً حرفياً آمناً للحذف؛ الأقفال الأساسية محمية" }
  ];
}

export const ADVANCED_REALISM_NEGATIVE_RULES = Object.freeze([
  "impossible occlusion order",
  "fingers passing through held object",
  "all objects fully visible despite overlap",
  "accessory floating above skin",
  "eyeglasses intersecting face",
  "eyeglass temples missing ear support",
  "same eyeglasses simultaneously worn and held",
  "duplicated eyeglasses pair",
  "watch floating above wrist",
  "ring merging fingers",
  "duplicated accessory",
  "oversized handheld prop",
  "unsupported laptop",
  "floating shopping bag",
  "object grip without contact",
  "environment covered in fingerprints",
  "excessive decorative dust",
  "simultaneous haze dust moisture and wind effects",
  "scene profile overriding user location",
  "catalog-perfect scene symmetry",
  "horizontally mirrored cabin after seat mapping",
  "driver rendered in front passenger seat",
  "steering wheel mapped to passenger side",
  "center console on driver's left",
  "driver-seat anchor omitted when the crop can include one"
]);
