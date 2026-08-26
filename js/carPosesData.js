export const ANGLE_ANATOMY = Object.freeze({
  frontal:"torso 20–30° waist turn max; knees stay to pedals; head on centerline",
  side:"torso 30–45° hip pivot; far shoulder rolled forward; near hip loaded",
  high:"neck extended up; chin tucked; shoulders slightly raised; lean 5–10°",
  low:"chin down; neck flexed; chest opened slightly upward; shoulders down",
  dutch:"body unchanged; head tilts 5–8° with frame roll; natural lateral flexion",
  mirror:"head rotated 30–40°; neck muscle tension visible; torso 10–15° only",
  wheel:"torso forward 10–15° over rim; resting forearms; shoulders rounded",
  passenger:"no wheel constraint; one leg may cross; torso turn up to 40°"
});

export const CAR_CATEGORIES = Object.freeze([
  { id:"front_cu",  name_ar:"سيلفي أمامي كلوز أب", icon:"🤳" },
  { id:"side",      name_ar:"سيلفي جانبي",        icon:"↔️" },
  { id:"high",      name_ar:"من الأعلى",          icon:"⬆️" },
  { id:"low",       name_ar:"من الأسفل",          icon:"⬇️" },
  { id:"dutch",     name_ar:"ميلان عفوي",         icon:"↩️" },
  { id:"mirror",    name_ar:"تفقد المرآة",        icon:"🪞" },
  { id:"wheel",     name_ar:"يد على المقود",      icon:"🛞" },
  { id:"passenger", name_ar:"مقعد الراكب",        icon:"💺" }
]);

export const CAR_TEMPLATES = Object.freeze([
  { id:"cu_classic", cat:"front_cu", name_ar:"كلوز أب كلاسيكي", angle:"frontal eye level", distance:"30–40cm", framing:"face 70%", gaze:"into lens", mood:"واثق مرتاح" },
  { id:"cu_tight", cat:"front_cu", name_ar:"كلوز أب محكم", angle:"frontal", distance:"25–35cm", framing:"face 85%", gaze:"into lens", mood:"قريب حميمي", note:"nose mild protrusion; ears recede slightly; pores resolved" },
  { id:"cu_win_key", cat:"front_cu", name_ar:"كلوز أب بضوء النافذة", angle:"frontal", distance:"30–40cm", framing:"face 70%", gaze:"into lens", mood:"درامي طبيعي", note:"side-window key splits the face; cabin falls to shadow" },
  { id:"side_34", cat:"side", name_ar:"ثلاثة أرباع جانبي", angle:"45° side", distance:"35–50cm", framing:"face 65%", gaze:"into lens", mood:"عفوي" },
  { id:"side_win", cat:"side", name_ar:"متكئ على النافذة", angle:"side toward window", distance:"35–50cm", framing:"face 65%", gaze:"into lens", mood:"كسول", note:"left forearm on window frame; outside slice visible" },
  { id:"side_shoulder", cat:"side", name_ar:"نظرة عبر الكتف", angle:"body frontal, head turned 60°", distance:"35–50cm", framing:"face 60%", gaze:"into lens over shoulder", mood:"سينمائي عفوي" },
  { id:"high_slim", cat:"high", name_ar:"أعلى نحيف", angle:"10–15° above", distance:"30–45cm", framing:"face 70%", gaze:"up into lens", mood:"مرتب" },
  { id:"high_dash", cat:"high", name_ar:"أعلى مع التابلوه", angle:"20° above", distance:"45–60cm", framing:"face 55% + dash/wheel below", gaze:"up into lens", mood:"سياقي" },
  { id:"low_jaw", cat:"low", name_ar:"أسفل فك بارز", angle:"10–20° up", distance:"30–45cm", framing:"face 70%", gaze:"down into lens", mood:"واثق" },
  { id:"low_power", cat:"low", name_ar:"أسفل أكتاف عريضة", angle:"30–40° up", distance:"40–60cm", framing:"face 55%, shoulders broad", gaze:"down into lens", mood:"قوي", note:"headliner enters top edge" },
  { id:"dutch_lazy", cat:"dutch", name_ar:"ميلان كسول", angle:"frontal + roll 10–20°", distance:"30–40cm", framing:"face 70%", gaze:"into lens", mood:"ليلي عفوي" },
  { id:"dutch_a", cat:"dutch", name_ar:"ميلان مع عمود A", angle:"frontal + roll 15°, A-pillar diagonal", distance:"35–45cm", framing:"face 65%", gaze:"into lens", mood:"ديناميكي" },
  { id:"mir_rear", cat:"mirror", name_ar:"تفقد المرآة الداخلية", angle:"frontal body, head to rearview", distance:"35–50cm", framing:"face 60% profile-ish", gaze:"AT MIRROR (candid)", mood:"لقطة صادقة" },
  { id:"mir_side", cat:"mirror", name_ar:"تفقد المرآة الجانبية", angle:"head to side mirror", distance:"35–50cm", framing:"face 60%", gaze:"AT SIDE MIRROR", mood:"قبل الانطلاق" },
  { id:"whl_hand8", cat:"wheel", name_ar:"كلوز أب + يد على المقود", angle:"frontal", distance:"30–40cm", framing:"face 60% + right hand at 8 o'clock", gaze:"into lens", mood:"سائق مرتاح" },
  { id:"whl_two", cat:"wheel", name_ar:"مرفقان على المقود (متوقفة)", angle:"frontal", distance:"30–40cm", framing:"face 70%, forearms on rim", gaze:"into lens", mood:"استراحة", note:"resting forearms allowed; no extended arm" },
  { id:"whl_console", cat:"wheel", name_ar:"مرفق على الكونسول", angle:"frontal", distance:"35–45cm", framing:"face 65%", gaze:"into lens", mood:"هادئ" },
  { id:"pass_classic", cat:"passenger", name_ar:"راكب كلاسيكي", angle:"frontal", distance:"35–50cm", framing:"face 65%", gaze:"into lens", mood:"مرتخي", note:"one leg crossed allowed" },
  { id:"pass_win", cat:"passenger", name_ar:"راكب نحو النافذة", angle:"side toward window", distance:"35–50cm", framing:"face 65%", gaze:"into lens", mood:"تأملي" },
  { id:"pass_recl", cat:"passenger", name_ar:"راكب مقعد مرجع", angle:"looking down 15–20°", distance:"40–55cm", framing:"face 65%", gaze:"up into lens", mood:"كسول ليلي" }
]);

export const CAR_TEMPLATE_BY_ID = Object.freeze(Object.fromEntries(CAR_TEMPLATES.map((item) => [item.id, item])));
export const CAR_CATEGORY_BY_ID = Object.freeze(Object.fromEntries(CAR_CATEGORIES.map((item) => [item.id, item])));

if (typeof window !== "undefined") Object.assign(window, { CAR_CATEGORIES, CAR_TEMPLATES, ANGLE_ANATOMY });
