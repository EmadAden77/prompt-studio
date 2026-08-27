import "./carExteriorRuntime.js";

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
  { id:"headrest_relaxed", cat:"front_cu", name_ar:"متكئ على مسند الرأس", angle:"frontal eye level, slight recline", distance:"30–40cm", framing:"face 72%", gaze:"into lens", mood:"هادئ مرتاح", note:"head lightly supported by headrest; subtle hair/headrest contact only where physically visible" },
  { id:"seatbelt_pause", cat:"front_cu", name_ar:"لحظة ربط الحزام", angle:"frontal eye level with slight torso turn", distance:"35–45cm", framing:"face 65% + upper chest", gaze:"into lens", mood:"عفوي", note:"free hand may interact with seatbelt only if naturally inside crop; belt tension and clothing contact must be coherent" },
  { id:"console_lean", cat:"front_cu", name_ar:"ميل خفيف نحو الكونسول", angle:"frontal with 10–15° torso lean toward console", distance:"35–45cm", framing:"face 68%", gaze:"into lens", mood:"مرتاح غير متناظر", note:"shoulders remain naturally unequal; torso lean comes from pelvis/seat support, not neck bend alone" },
  { id:"side_34", cat:"side", name_ar:"ثلاثة أرباع جانبي", angle:"45° side", distance:"35–50cm", framing:"face 65%", gaze:"into lens", mood:"عفوي" },
  { id:"side_win", cat:"side", name_ar:"متكئ على النافذة", angle:"side toward window", distance:"35–50cm", framing:"face 65%", gaze:"into lens", mood:"كسول", note:"left forearm on window frame; outside slice visible" },
  { id:"side_shoulder", cat:"side", name_ar:"نظرة عبر الكتف", angle:"body frontal, head turned 60°", distance:"35–50cm", framing:"face 60%", gaze:"into lens over shoulder", mood:"سينمائي عفوي" },
  { id:"door_armrest_rest", cat:"side", name_ar:"ارتكاز على مسند الباب", angle:"30–40° side toward door", distance:"35–50cm", framing:"face 65% + near shoulder", gaze:"into lens", mood:"مرتاح", note:"free forearm rests naturally on door armrest only when visible; shoulder lowers and fabric/contact shadows follow the support" },
  { id:"night_window_sidekey", cat:"side", name_ar:"كلوز أب ليلي بضوء جانبي", angle:"20–30° toward side window", distance:"30–40cm", framing:"face 68%", gaze:"into lens", mood:"ليلي طبيعي", note:"single real window-side source dominates one side of face; opposite side remains naturally darker without hidden fill" },
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
  { id:"pass_recl", cat:"passenger", name_ar:"راكب مقعد مرجع", angle:"looking down 15–20°", distance:"40–55cm", framing:"face 65%", gaze:"up into lens", mood:"كسول ليلي" },
  { id:"rear_seat_selfie", cat:"passenger", name_ar:"سيلفي من المقعد الخلفي", angle:"rear-seat frontal eye level", distance:"35–50cm", framing:"face 62% + front-seat depth cues", gaze:"into lens", mood:"عفوي هادئ", note:"subject is seated in the rear row; front seatbacks/center tunnel may appear only as crop-supported depth cues; no driver-seat wheel-axis constraint" },
  { id:"ac_steering_breeze", cat:"wheel", name_ar:"المقود + هواء المكيّف", angle:"frontal eye level", distance:"30–40cm", framing:"face 60% + top steering-wheel segment + free hand", gaze:"into lens", mood:"نهاري طبيعي", preferredLighting:"N4", scene:"parked on an ordinary Saudi neighborhood street in daylight; cabin remains stationary and coherent", hairDynamics:"direct cool airflow from a dashboard AC vent may lift only a few fine front strands upward/backward while the heavier hair mass stays anchored by gravity", lightingOverride:"natural daylight filtered through real windshield/side glass and any actual tint, producing soft cabin illumination, dashboard shadowing and restrained windshield reflections" },
  { id:"food_wait_night", cat:"front_cu", name_ar:"انتظار الطلب ليلاً", angle:"frontal eye level with slight driver-side turn", distance:"30–45cm", framing:"face 68% + upper chest + small steering-wheel edge", gaze:"into lens", mood:"منتظر بهدوء", preferredLighting:"N2", scene:"driver seated in a local Saudi street parking spot at night while waiting for food; exterior shop lighting remains ordinary and non-readable", hairDynamics:"hair remains mostly still and gravity-settled, with only minor headrest contact flattening if visible", lightingOverride:"warm storefront/street practicals enter through the driver-side window while the cooler dashboard display contributes a weaker lower-face and steering-wheel glow; both sources create distinct but physically coherent catchlights" },
  { id:"golden_window_breeze", cat:"side", name_ar:"نافذة مفتوحة وقت الغروب", angle:"25–35° toward open driver window", distance:"35–50cm", framing:"face 62% + near shoulder + window edge", gaze:"into lens", mood:"غروب عفوي", preferredLighting:"N5", scene:"parked curbside in a Saudi town during late golden hour with the driver window fully open", hairDynamics:"a gentle outdoor evening breeze entering through the open window may move a small group of side strands across the cheek/ear while roots and main hair mass remain stable", lightingOverride:"strong low warm sunset light enters horizontally through the open driver window, creating directional warm highlights and rim response on the near face and steering-wheel rim while the deeper cabin stays naturally darker" },
  { id:"tree_dappled_driver", cat:"wheel", name_ar:"تحت ظل شجرة سكنية", angle:"frontal to slight 3/4", distance:"35–50cm", framing:"face 62% + steering wheel + seat context", gaze:"into lens", mood:"هادئ نهاري", preferredLighting:"D2", scene:"parked under a leafy street tree in a quiet Saudi residential neighborhood", hairDynamics:"hair rests naturally with a few fine wisps allowed to shift slightly from weak cabin airflow", lightingOverride:"dappled daylight filtered through real leaves and windshield glass creates irregular soft-edged light/shadow patches across face, shirt and steering wheel; beige cabin surfaces provide weak material-colored bounce" },
  { id:"streetlight_cockpit", cat:"wheel", name_ar:"إضاءة عمود شارع ليلي", angle:"frontal eye level", distance:"30–45cm", framing:"face 65% + steering-wheel top + instrument area", gaze:"into lens", mood:"ابتسامة خفيفة", preferredLighting:"N1", scene:"parked beneath an ordinary municipal street-light pole on a Saudi street at night", hairDynamics:"hair remains stationary under the roof with natural clump separation and no invented wind", lightingOverride:"one overhead municipal street source reaches the cabin through windshield and/or panoramic roof geometry, creating top-down highlights on forehead/nose and steering-wheel top, balanced only by weak real instrument/button illumination below" }
]);

export const CAR_TEMPLATE_BY_ID = Object.freeze(Object.fromEntries(CAR_TEMPLATES.map((item) => [item.id, item])));
export const CAR_CATEGORY_BY_ID = Object.freeze(Object.fromEntries(CAR_CATEGORIES.map((item) => [item.id, item])));

if (typeof window !== "undefined") Object.assign(window, { CAR_CATEGORIES, CAR_TEMPLATES, ANGLE_ANATOMY });
