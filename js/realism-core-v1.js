const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

export const PLACE_STATE_OPTIONS = Object.freeze([
  { value:"auto", label:"تلقائي واقعي", text:"derive an ordinary lived-in state from the selected place, time and activity; avoid both sterile perfection and theatrical mess" },
  { value:"clean-used", label:"مرتب لكن مستخدم", text:"clean and reasonably organized but visibly used, with small natural irregularities rather than showroom perfection" },
  { value:"daily", label:"استخدام يومي طبيعي", text:"ordinary daily-use condition with subtle asymmetry, small placement irregularities and believable signs of recent human use" },
  { value:"late-day", label:"بعد يوم عمل", text:"slightly more lived-in after hours of normal use, with mild local disorder only where that place would realistically accumulate it" },
  { value:"active", label:"نشاط أكثر قليلًا", text:"a somewhat more active real-world state while keeping circulation paths, surfaces and objects physically usable and not cluttered for decoration" }
]);

export const PEOPLE_DENSITY_OPTIONS = Object.freeze([
  { value:"auto", label:"تلقائي حسب المكان والكادر" },
  { value:"none", label:"بدون أشخاص إضافيين" },
  { value:"sparse", label:"أشخاص قليلون" },
  { value:"natural", label:"نشاط بشري طبيعي" },
  { value:"busy", label:"مزدحم نسبيًا" }
]);

export const SUBJECT_MOMENT_OPTIONS = Object.freeze([
  { value:"auto", label:"تلقائي حسب الوضعية" },
  { value:"relaxed", label:"مرتاح" },
  { value:"just-arrived", label:"توه وصل" },
  { value:"waiting", label:"منتظر" },
  { value:"after-work", label:"بعد يوم عمل" },
  { value:"after-walk", label:"بعد مشي قصير" },
  { value:"post-workout", label:"بعد تمرين" },
  { value:"just-woke", label:"توه صحى" }
]);

const placeOption = (value) => PLACE_STATE_OPTIONS.find((item) => item.value === value) ?? PLACE_STATE_OPTIONS[0];
const peopleOption = (value) => PEOPLE_DENSITY_OPTIONS.find((item) => item.value === value) ?? PEOPLE_DENSITY_OPTIONS[0];
const momentOption = (value) => SUBJECT_MOMENT_OPTIONS.find((item) => item.value === value) ?? SUBJECT_MOMENT_OPTIONS[0];

const isBedroom = (scene) => scene === "bedroom" || scene === "my_bedroom_text";
const isCar = (scene) => scene === "rangeRover";
const isGym = (scene) => scene === "gym";
const isStreet = (scene) => scene === "street";
const isCustom = (scene) => scene === "custom";
const isTight = (state) => state.composition === "tight" || state.composition === "close";
const isMovingPose = (state) => /walk|browsing|activity/i.test(`${state.poseFamily} ${state.pose}`);

function hasWindowlessSignal(state) {
  return /(?:windowless|no window|without windows|بدون نافذ|بلا نافذ|لا توجد نافذ)/iu.test(`${state.customScene} ${state.customSceneDetails}`);
}

function hasReflectiveSignal(state) {
  if (isCar(state.scene) || isGym(state.scene) || isBedroom(state.scene)) return true;
  return /(?:mirror|glass|optical|eyeglass|storefront|display case|مرآ|مرايا|زجاج|نظارات|واجهة)/iu.test(`${state.customScene} ${state.customSceneDetails} ${state.environmentNote}`);
}

export function getPlaceStateOptions() {
  return PLACE_STATE_OPTIONS.map((item) => ({ ...item }));
}

export function getPeopleDensityOptions() {
  return PEOPLE_DENSITY_OPTIONS.map((item) => ({ ...item }));
}

export function getSubjectMomentOptions() {
  return SUBJECT_MOMENT_OPTIONS.map((item) => ({ ...item }));
}

export function resolveRealismCoreState(rawState = {}) {
  const state = { ...rawState };
  const conflicts = [];

  if (!PLACE_STATE_OPTIONS.some((item) => item.value === state.placeState)) state.placeState = "auto";
  if (!PEOPLE_DENSITY_OPTIONS.some((item) => item.value === state.peopleDensity)) state.peopleDensity = "auto";
  if (!SUBJECT_MOMENT_OPTIONS.some((item) => item.value === state.subjectMoment)) state.subjectMoment = "auto";
  state.interactionObject = clean(state.interactionObject);

  if (isTight(state) && state.peopleDensity === "busy") {
    state.peopleDensity = "sparse";
    conflicts.push({
      code:"tight-crowd",
      qa:"تم خفض كثافة البشر لأن الكلوز أب لا يملك مساحة هندسية لازدحام مقنع.",
      prompt:"A tight selfie crop cannot support a dense crowd without forcing people into impossible scale or overlap, so background people density is reduced to sparse."
    });
  }

  if (isBedroom(state.scene) && state.peopleDensity === "auto") state.peopleDensity = "none";
  if (isCar(state.scene) && state.peopleDensity === "auto") state.peopleDensity = "sparse";
  if ((isGym(state.scene) || isStreet(state.scene) || isCustom(state.scene)) && state.peopleDensity === "auto") state.peopleDensity = "natural";

  if (state.subjectMoment === "auto") {
    if (isGym(state.scene) && /post-workout/i.test(state.pose)) state.subjectMoment = "post-workout";
    else if (/waiting/i.test(state.pose)) state.subjectMoment = "waiting";
    else if (isBedroom(state.scene) && /lying|bedhead/i.test(`${state.pose} ${state.hair}`)) state.subjectMoment = "relaxed";
    else state.subjectMoment = "relaxed";
  }

  if (state.subjectMoment === "just-woke" && !isBedroom(state.scene)) {
    state.subjectMoment = "relaxed";
    conflicts.push({
      code:"woke-location",
      qa:"حالة «توه صحى» أُلغيت لأنها لا تتوافق مع المكان المختار.",
      prompt:"The requested just-woke state conflicts with the selected non-bedroom location, so use a relaxed ordinary state instead of inventing sleep context."
    });
  }

  if (isCustom(state.scene) && hasWindowlessSignal(state)) {
    if (/custom-day-(?:window|open-frontage)/i.test(state.lighting)) {
      state.lighting = "custom-day-led-only";
      conflicts.push({
        code:"windowless-daylight",
        qa:"تم تحويل الإضاءة إلى LED داخلي لأن وصف المكان بلا نوافذ.",
        prompt:"The custom place is explicitly windowless, so window or storefront daylight is removed and visible indoor practical lighting becomes authoritative."
      });
    }
    if (/custom-night-frontage/i.test(state.lighting)) {
      state.lighting = "custom-night-led";
      conflicts.push({
        code:"windowless-frontage",
        qa:"تم حذف ضوء الواجهة لأن وصف المكان بلا نوافذ أو فتحات خارجية.",
        prompt:"The custom place is explicitly windowless, so exterior frontage spill is removed and visible indoor practical lighting becomes authoritative."
      });
    }
  }

  return { state, conflicts };
}

function buildPlaceStateRule(state) {
  const selected = placeOption(state.placeState);
  const base = selected.text;
  if (isBedroom(state.scene)) {
    return `${base}. Keep bedding, bedside items and personal objects subtly uneven only where they naturally enter frame; never stage the room symmetrically for the camera.`;
  }
  if (isCar(state.scene)) {
    return `${base}. The cabin stays coherent and maintained; allow only subtle normal surface variation, faint dust or fingerprints on glossy areas when visible, never invented trash or loose clutter.`;
  }
  if (isGym(state.scene)) {
    return `${base}. Equipment remains usable and correctly spaced, with ordinary signs of use rather than pristine showroom presentation or random scattered gear.`;
  }
  if (isStreet(state.scene)) {
    return `${base}. Pavement, parked cars, curbs and roadside elements may show mild ordinary wear and placement variation without turning the street into decay or a staged film set.`;
  }
  return `${base}. Translate the user-defined place into an ordinary functioning location with small realistic irregularities specific to that type of business or interior, not generic decorative clutter.`;
}

function buildPeopleRule(state) {
  const density = peopleOption(state.peopleDensity).value;
  if (density === "none") return "Do not add unrelated background people.";

  const cropCap = isTight(state)
    ? "Because the selfie is tight, only a partial distant person may survive at an edge if the geometry truly permits it; never force a full background figure behind the face."
    : "People appear only in real background space left by the subject, with scale, occlusion and detail decreasing naturally with distance.";

  if (isBedroom(state.scene)) return "Do not introduce unrelated strangers into the bedroom. Any person would require an explicit companion request, which is absent here.";
  if (isCar(state.scene)) return `Background people may exist only outside the stationary car through physically visible glass, never inside the cabin unless explicitly requested. ${cropCap}`;
  if (isGym(state.scene)) return `Use ${density === "busy" ? "a moderately active" : density === "natural" ? "an ordinary sparse-to-moderate" : "a sparse"} number of gym-goers, each occupied with plausible independent activity rather than looking at the selfie. ${cropCap}`;
  if (isStreet(state.scene)) return `Use ${density === "busy" ? "moderate real pedestrian activity" : density === "natural" ? "ordinary sparse pedestrian activity" : "only a few pedestrians"}, respecting walking paths, ground contact and traffic separation. ${cropCap}`;
  return `Use ${density === "busy" ? "moderate but plausible customer or staff activity" : density === "natural" ? "ordinary sparse customer or staff activity" : "only one or a few background people"} appropriate to the custom place. Staff and customers remain occupied with their own tasks and unaware of the selfie. ${cropCap}`;
}

function buildSubjectMomentRule(state) {
  const moment = momentOption(state.subjectMoment).value;
  const map = {
    relaxed:"The subject appears ordinarily relaxed: uneven shoulders, natural breathing posture, relaxed jaw and no presentation pose.",
    "just-arrived":"The subject looks as if he has just arrived: posture has not fully settled, clothing may retain mild movement creases, and grooming remains ordinary rather than freshly staged.",
    waiting:"The subject is naturally waiting during a brief pause, with asymmetrical relaxed posture and no deliberate model pose.",
    "after-work":"The subject carries mild end-of-workday realism: slightly relaxed clothing structure, subtle tiredness only if compatible with the selected expression, and no exaggerated exhaustion.",
    "after-walk":"The subject has just finished a short walk: only mild warmth, slightly unsettled clothing and tiny plausible breathing/posture cues, not workout-level sweat.",
    "post-workout":"The subject is after exercise: mild exertion cues, localized physically plausible sweat and slightly heavier breathing posture only where consistent with the selected clothing and scene.",
    "just-woke":"The subject has just woken naturally: soft eyelids, relaxed facial muscles, sleep-compressed hair only if compatible with the selected hairstyle, and clothing/bedding creases caused by real contact."
  };
  return map[moment] ?? map.relaxed;
}

function buildContactRule(state) {
  const signal = `${state.poseFamily} ${state.pose}`;
  if (/lying|reclin|bed/i.test(signal)) {
    return "Body support must be visible only at real contact zones: pillow and mattress compress under the head, shoulder, ribs, hips or limbs that actually bear weight; nearby bedding deforms continuously from those loads and nowhere else.";
  }
  if (isCar(state.scene) || /seat|seated|waiting/i.test(signal)) {
    return "Seated body weight must transfer into the actual seat cushion and backrest: hips and thighs create shallow compression, the torso is supported where it touches the backrest, clothing folds respond to those contacts, and no body part floats above the seat.";
  }
  if (/standing|street/i.test(signal)) {
    return "Standing balance must remain plausible: the torso stacks over the unseen or visible support base, shoulders and hips counterbalance naturally, and any wall, counter or object contact occurs only where a body part physically reaches it.";
  }
  return "All body, clothing and object contacts must carry believable support, pressure, occlusion and deformation. Never create contact shadows or compression where nothing touches.";
}

function buildCameraRule(state) {
  const movement = isMovingPose(state);
  if (state.time === "night") {
    return `Use real front-camera auto behavior in low light: exposure protects the face imperfectly, shadow detail falls away, luminance and chroma noise increase, white balance follows the dominant practical source with small residual color error, and sharpening remains restrained. ${movement ? "Allow only slight physically plausible motion softness from the subject-held phone or body movement; do not freeze everything with impossible shutter speed." : "Keep the face reasonably stable but not unnaturally noise-free or studio-sharp."}`;
  }
  return `Use real front-camera auto exposure in daylight: preserve natural highlight clipping when exterior or direct light exceeds sensor range, keep shadow contrast instead of flattening everything with HDR, allow small automatic white-balance variation, and avoid over-sharpened microdetail. ${movement ? "A tiny amount of motion softness may occur at moving edges while the face remains the focus target." : "The face remains the autofocus priority without fake DSLR separation."}`;
}

function buildReflectionRule(state) {
  if (!hasReflectiveSignal(state)) {
    return "If any reflective or glossy surface incidentally enters the crop, its highlights and reflections must follow the same camera position, scene geometry and selected light sources; otherwise do not invent a reflection.";
  }
  if (isCar(state.scene)) {
    return "Vehicle glass, glossy trim and mirrors reflect only physically reachable parts of the parked surroundings and cabin. Keep reflection angles, brightness and occlusion consistent with the single front-camera viewpoint; never duplicate the subject, steering wheel, dashboard or exterior lights in impossible places.";
  }
  if (isGym(state.scene)) {
    return "Gym mirrors obey one real reflection geometry. The subject, phone, equipment and lights appear in a mirror only when the selected camera angle can actually see their reflected rays; never create extra limbs, duplicate people or a second camera viewpoint.";
  }
  if (isBedroom(state.scene)) {
    return "Bedroom mirrors or glossy furniture reflect only what the selected selfie viewpoint can physically see. Do not force the phone, subject or whole room into a mirror merely because a mirror exists in the room description.";
  }
  return "Mirrors, optical-store glass, display cases and storefront glazing obey one physically coherent reflection system. Reflected people, shelves, lights and the subject must match real left-right geometry, distance and occlusion; the phone appears only if the reflection angle truly includes it.";
}

function buildInteractionRule(state) {
  const object = clean(state.interactionObject);
  if (!object) {
    return "Do not invent a handheld prop or object interaction merely to make the scene busier. The free hand may remain outside the crop or rest naturally according to the pose.";
  }
  return `Requested interaction: ${object}. Treat this as a secondary real object interaction, normally using the free hand rather than the selfie-holding hand. The object must have plausible size, weight, grip points and gravity; fingers wrap around reachable surfaces with exactly five fingers on any visible hand, with correct occlusion and contact shadows. If the selected crop cannot include the interaction without breaking the selfie geometry, omit the object rather than widening the composition by force.`;
}

export function buildRealismCoreSections(state, conflicts = []) {
  const conflictText = conflicts.length
    ? `[REALISM CONFLICT CHECK] ${conflicts.map((item) => item.prompt).join(" ")} Lower-priority conflicting details have been corrected before prompt assembly.`
    : "[REALISM CONFLICT CHECK] No high-risk contradiction detected among scene, crop, people density, subject moment and lighting. If a later detail conflicts with selfie geometry or physical support, omit the lower-priority detail.";

  return [
    `[PLACE STATE] ${buildPlaceStateRule(state)}`,
    `[PEOPLE REALISM] ${buildPeopleRule(state)}`,
    `[SUBJECT MOMENT] ${buildSubjectMomentRule(state)}`,
    `[CONTACT PHYSICS] ${buildContactRule(state)}`,
    `[CAMERA AUTO BEHAVIOR] ${buildCameraRule(state)}`,
    `[REFLECTION AND GLASS] ${buildReflectionRule(state)}`,
    `[HAND OBJECT INTERACTION] ${buildInteractionRule(state)}`,
    conflictText
  ];
}

export function realismCoreQaItems(state, conflicts = []) {
  const peopleLabel = peopleOption(state.peopleDensity).label;
  const momentLabel = momentOption(state.subjectMoment).label;
  const placeLabel = placeOption(state.placeState).label;
  return [
    { label:"حالة المكان", value:`${placeLabel} — الفوضى والاهتراء بقدر الاستعمال الحقيقي فقط` },
    { label:"البشر", value:`${peopleLabel} — العدد مقيد بالكادر والمنظور` },
    { label:"لحظة الشخص", value:`${momentLabel} — تغيرات صغيرة في الوقفة والملابس والتعبير فقط` },
    { label:"التلامس", value:"ضغط ودعم وظلال تماس فقط عند نقاط التلامس الحقيقية" },
    { label:"الكاميرا", value:"تعريض وWB وضوضاء وحدّة تلقائية حسب الضوء والحركة" },
    { label:"الانعكاسات", value:"المرايا والزجاج تتبع نفس موضع الكاميرا ومصادر الضوء" },
    ...(state.interactionObject ? [{ label:"التفاعل", value:`${state.interactionObject} — قبضة ووزن وتلامس واقعي أو يُحذف إذا لم يسمح الكادر` }] : []),
    { label:"فحص التعارض", value:conflicts.length ? conflicts.map((item) => item.qa).join(" ") : "لا يوجد تعارض عالي الخطورة بعد التطبيع" }
  ];
}

export const REALISM_CORE_NEGATIVE_RULES = Object.freeze([
  "unsupported body contact",
  "floating seated body",
  "compression without physical contact",
  "contact shadow without contact",
  "impossible object grip",
  "object floating in hand",
  "extra hand for object interaction",
  "mirror reflection from impossible camera angle",
  "duplicated reflected subject",
  "duplicated reflected phone",
  "reflection lighting inconsistent with scene",
  "perfectly sterile lived-in environment",
  "decorative random clutter",
  "background people at impossible scale",
  "crowd forced into tight selfie crop",
  "all background people staring at camera",
  "noise-free night smartphone image",
  "uniform HDR exposure across incompatible light levels",
  "impossible frozen motion in low light",
  "fake DSLR depth separation"
]);
