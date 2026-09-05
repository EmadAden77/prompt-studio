export const BASE_NEGATIVE = [
  "third-person camera",
  "observer viewpoint",
  "tripod selfie",
  "floating camera",
  "impossible arm reach",
  "telephoto compression",
  "fake DSLR bokeh",
  "beauty filter",
  "face slimming",
  "changed facial identity",
  "changed hairline",
  "increased hair density",
  "invented scalp coverage",
  "plastic skin",
  "waxy skin",
  "airbrushed skin",
  "perfect skin",
  "CGI",
  "3D render",
  "cinematic lighting",
  "studio lighting",
  "ring light",
  "softbox",
  "extreme HDR",
  "oversharpening halos",
  "extra fingers",
  "missing fingers",
  "fused fingers",
  "disconnected limbs",
  "impossible wrist angle",
  "floating body",
  "impossible contact",
  "impossible reflections",
  "duplicated background objects",
  "watermark",
  "logo overlay"
];

export const CITIES = [
  { value:"riyadh", label:"الرياض", text:"Riyadh, Saudi Arabia" },
  { value:"jeddah", label:"جدة", text:"Jeddah, Saudi Arabia" },
  { value:"dammam", label:"الدمام", text:"Dammam, Saudi Arabia" },
  { value:"other", label:"مدينة سعودية أخرى", text:"a plausible Saudi Arabian location" }
];

export const SCENES = {
  my_bedroom_text: {
    label:"🏠 غرفتي (وصف نصي ثابت)",
    family:"bedroom",
    text_reference:true,
    environment:"a lived-in modern bedroom used only as supporting context",
    description_en:"Use the uploaded bedroom reference as an immutable spatial map. From the doorway viewpoint, the bed occupies the left side with its black horizontally padded headboard fixed against the left wall and the foot extending toward the center foreground. A dark wood bedside cabinet with the lit bedside lamp, laptop, bottles, chargers, cups and cables remains beside the bed at the near-left. The white split AC remains high on the upper-left wall. The charcoal floor-to-ceiling curtains remain centered on the far wall. The chair carrying clothes and the dark bag remain directly in front of the curtains. The tall dark wood wardrobe remains fixed along the right wall, with mirrored sliding doors toward the far end and the open hanging-clothes and shelf bays continuing toward the foreground. The long dark wood dresser and its wall mirror remain along the near-right wall. The large beige rectangular rug remains centered in the open floor area in front of the bed, aligned with the room, with ordinary scattered shoes on the rug and adjacent beige porcelain tile. Preserve the white recessed tray ceiling and its downlight positions, the doorway viewpoint, wall spacing, furniture scale, depth order, walking gaps, left/right orientation and ordinary clutter distribution exactly. Do not add a sofa or any furniture not visible in the bedroom reference.",
    topology_lock_en:"BEDROOM TOPOLOGY LOCK — NON-NEGOTIABLE: never move, rotate, resize, mirror, swap, duplicate, remove or redesign the bed, headboard, bedside cabinet, lamp, curtains, chair, bag, wardrobe, mirrored doors, open shelves, dresser, wall mirror, rug, AC, doorway, ceiling or floor. Never exchange the left and right walls. A tighter selfie may crop or occlude furniture, but any visible fragment must project from this same fixed room layout and one coherent camera viewpoint. If the selected selfie angle cannot reveal an item, omit it instead of relocating it into view."
  },
  bedroom: {
    label:"غرفة نوم واقعية",
    family:"bedroom",
    environment:"an ordinary lived-in Saudi bedroom, visible only as much as needed to establish the selfie context"
  },
  rangeRover: {
    label:"رنج روفر 2017",
    family:"car",
    environment:"inside a stationary 2017 Range Rover Sport Autobiography Dynamic, Ivory perforated leather, dark wood veneer, LHD, visible only as much as needed to establish the parked-car selfie"
  },
  gym: {
    label:"نادٍ سعودي حديث",
    family:"gym",
    environment:"a plausible modern Saudi gym with real equipment and practical lighting, kept secondary to the person taking the selfie"
  },
  street: {
    label:"شارع أو موقف سعودي",
    family:"street",
    environment:"a plausible Saudi street or parking area with ordinary cars, pavement and practical surroundings, kept secondary to the selfie"
  }
};

const ALL_SCENES = Object.freeze(Object.keys(SCENES));
const HOME_SCENES = Object.freeze(["my_bedroom_text","bedroom"]);
const CASUAL_SCENES = Object.freeze(["my_bedroom_text","bedroom","rangeRover","street"]);
const TRADITIONAL_SCENES = Object.freeze(["my_bedroom_text","bedroom","rangeRover","street"]);
const WORK_SCENES = Object.freeze(["my_bedroom_text","bedroom","rangeRover","street"]);
const SPORT_SCENES = Object.freeze(["gym","street"]);

export const CLOTHING_OPTIONS = [
  { value:"sleep-cotton-short", label:"طقم نوم قطني خفيف", scenes:HOME_SCENES, text:"a lightweight cotton sleep set with soft matte weave, natural drape and compression folds only at real body contact zones" },
  { value:"sleep-cotton-long", label:"طقم نوم قطني طويل", scenes:HOME_SCENES, text:"a long cotton sleep set with breathable matte fabric, relaxed fit and gravity-consistent folds around shoulders, waist, hips and knees" },
  { value:"sleep-tee-shorts", label:"تيشيرت نوم + شورت", scenes:HOME_SCENES, text:"a worn-in cotton sleep T-shirt with relaxed shorts, ordinary fabric wrinkles and believable mattress or seat compression" },
  { value:"sleep-tank-shorts", label:"فانلة قطنية + شورت", scenes:HOME_SCENES, text:"a plain cotton sleeveless undershirt with relaxed sleep shorts, realistic ribbing, seam tension and casual home drape" },
  { value:"lounge-tee-trousers", label:"تيشيرت + بنطال منزلي", scenes:HOME_SCENES, text:"a soft cotton T-shirt with relaxed home trousers, natural waistband folds and fabric pooling appropriate to the selected pose" },
  { value:"lounge-set", label:"طقم استرخاء منزلي", scenes:HOME_SCENES, text:"a coordinated matte lounge set with soft medium-weight fabric and natural folds from sitting, reclining or lying" },
  { value:"robe-light", label:"روب منزلي خفيف", scenes:HOME_SCENES, text:"a lightweight home robe with a naturally tied belt, realistic overlap and gravity-driven drape" },
  { value:"robe-winter", label:"روب منزلي شتوي", scenes:HOME_SCENES, text:"a thicker winter home robe with soft pile, heavier drape and compressed fabric at seated or reclining contact points" },
  { value:"hoodie-home", label:"هودي خفيف + بنطال منزلي", scenes:HOME_SCENES, text:"a lightweight cotton hoodie with relaxed home trousers, soft hood collapse and natural sleeve and lap folds" },

  { value:"tee-black", label:"تيشيرت أسود ساده", scenes:CASUAL_SCENES, text:"a plain black cotton crew-neck T-shirt with natural shoulder folds, chest drape and pose-consistent compression" },
  { value:"tee-white", label:"تيشيرت أبيض ساده", scenes:CASUAL_SCENES, text:"a plain white cotton crew-neck T-shirt with realistic knit texture, slight ordinary wrinkling and no logos" },
  { value:"tee-oversized", label:"تيشيرت أوفرسايز", scenes:CASUAL_SCENES, text:"a slightly oversized cotton T-shirt with heavier side drape, relaxed sleeves and gravity-led folds without stylized fashion posing" },
  { value:"shirt-casual", label:"قميص قطني كاجوال", scenes:CASUAL_SCENES, text:"a casual cotton button-down shirt with visible weave, natural placket behavior and realistic folds at elbows, waist and seated contact" },
  { value:"shirt-rolled", label:"قميص بأكمام مطوية", scenes:CASUAL_SCENES, text:"a cotton button-down with casually rolled sleeves, believable cuff thickness, elbow creasing and relaxed torso drape" },
  { value:"polo-matte", label:"بولو ساده", scenes:CASUAL_SCENES, text:"a matte cotton polo with natural collar shape, soft shoulder folds and realistic seated or standing creasing" },
  { value:"sweatshirt", label:"سويت شيرت خفيف", scenes:CASUAL_SCENES, text:"a lightweight sweatshirt with soft ribbed cuffs, modest fabric thickness and natural compression around torso and elbows" },
  { value:"hoodie-casual", label:"هودي كاجوال", scenes:CASUAL_SCENES, text:"a casual hoodie with realistic hood collapse, drawstrings resting under gravity and ordinary cotton-fleece folds" },
  { value:"denim-jacket", label:"جاكيت دنيم", scenes:["rangeRover","street"], text:"a casual denim jacket over a plain shirt, structured denim seams and realistic elbow, shoulder and waist creasing" },

  { value:"thobe-white", label:"ثوب أبيض", scenes:TRADITIONAL_SCENES, text:"a plain white Saudi thobe with believable cotton blend weight, natural vertical drape and pose-dependent lap, shoulder and sleeve folds" },
  { value:"thobe-offwhite", label:"ثوب أوف وايت", scenes:TRADITIONAL_SCENES, text:"an off-white Saudi thobe with matte fabric, realistic seam placement and natural folds without showroom stiffness" },
  { value:"thobe-casual", label:"ثوب يومي بسيط", scenes:TRADITIONAL_SCENES, text:"an everyday Saudi thobe with slightly relaxed fabric behavior, ordinary creasing and no ceremonial styling" },
  { value:"thobe-winter", label:"ثوب شتوي أثقل", scenes:TRADITIONAL_SCENES, text:"a heavier winter Saudi thobe with thicker fabric, slower drape and realistic compression when seated" },

  { value:"work-blue-navy", label:"قميص سماوي + بنطال كحلي", scenes:WORK_SCENES, text:"a light-blue cotton work shirt with deep navy trousers, realistic shirt creasing and seated or standing trouser tension" },
  { value:"work-white-charcoal", label:"قميص أبيض + بنطال فحمي", scenes:WORK_SCENES, text:"a plain white cotton shirt with charcoal trousers, restrained business-casual fit and natural fabric behavior" },
  { value:"work-dark-stone", label:"قميص داكن + بنطال حجري", scenes:WORK_SCENES, text:"a dark matte shirt with stone-colored chinos, realistic weave, knee folds and waistband compression" },
  { value:"work-admin-dark", label:"لباس إداري داكن", scenes:WORK_SCENES, text:"a simple dark administrative outfit with matte fabric, no logos or ceremonial decorations, and realistic posture-driven creasing" },

  { value:"sport-dryfit", label:"طقم رياضي تقني", scenes:SPORT_SCENES, text:"a matte technical training top with tapered athletic trousers, realistic stretch, seam tension and only physically plausible sweat darkening" },
  { value:"sport-tee-shorts", label:"تيشيرت + شورت رياضي", scenes:SPORT_SCENES, text:"a breathable athletic T-shirt with training shorts, realistic fabric stretch and ordinary post-activity creasing" },
  { value:"sport-tracksuit", label:"ترينينغ خفيف", scenes:SPORT_SCENES, text:"a lightweight tracksuit with natural zipper behavior, realistic fabric weight and relaxed folds" }
];

export const HAIR_OPTIONS = [
  { value:"natural", label:"طبيعي كما في المرجع", text:"naturally arranged with the original strand distribution and small irregular flyaways" },
  { value:"hand-neat", label:"ترتيب خفيف باليد", text:"lightly arranged by hand, preserving irregular strand grouping rather than a salon finish" },
  { value:"sweep-back", label:"تمشيط خفيف للخلف", text:"gently swept backward using only the existing hair, without adding lift or density" },
  { value:"side-part-soft", label:"فرق جانبي خفيف", text:"a subtle side part made only by rearranging existing strands, with scalp visibility unchanged" },
  { value:"center-part-soft", label:"فرق وسطي خفيف", text:"a mild center division using existing strands only, keeping original density and visible scalp unchanged" },
  { value:"relaxed-forward", label:"مسترخي للأمام", text:"slightly relaxed forward with small uneven strand groups and no invented frontal volume" },
  { value:"loose-strands", label:"خصل مرتخية طبيعية", text:"a few naturally loose strands with otherwise unchanged density and hairline" },
  { value:"morning-messy", label:"فوضى صباحية خفيفة", text:"mild morning disorder with irregular direction, small flyaways and no increase in volume" },
  { value:"bedhead", label:"مضغوط من النوم", text:"sleep-compressed at real pillow contact zones with uneven bed-head direction and no added hair" },
  { value:"post-shower-damp", label:"رطب بعد الاستحمام", text:"lightly damp after a shower, strands grouping naturally under moisture and gravity while scalp coverage remains unchanged" },
  { value:"semi-dry", label:"شبه جاف", text:"partly dried with a mix of separated and lightly grouped strands, preserving original density" },
  { value:"sweat-damp", label:"رطوبة تمرين خفيفة", text:"slightly damp from exertion only where plausible, with minor strand clumping and unchanged density" },
  { value:"light-wind", label:"هواء خفيف", text:"subtly shifted by a light breeze in one coherent direction, without volumizing" },
  { value:"low-volume", label:"حجم منخفض طبيعي", text:"kept naturally low in volume, preserving visible scalp and the reference hairline" },
  { value:"soft-flyaways", label:"شعيرات طائرة قليلة", text:"a few small irregular flyaways while the main hair mass, density and hairline remain unchanged" }
];

export const HAIR_DENSITY_LOCK =
  "HAIR DENSITY LOCK: preserve only the hairline, original visible hair density, scalp visibility, recession and natural strand coverage that are clearly observable in the single reference image. Do not infer or invent thinning, scalp gaps or recession that the reference does not show. Styling may only rearrange existing hair; never fill visible gaps, thicken hair, add volume, lower the hairline or invent new strands.";

export const SKIN_OPTIONS = [
  { value:"neutral", label:"طبيعية", text:"ordinary natural skin moisture, visible but non-exaggerated pores and local tone variation" },
  { value:"slight-oil", label:"زيوت طبيعية خفيفة", text:"subtle natural oil reflection on facial high points without gloss or retouching" },
  { value:"slight-sweat", label:"تعرق خفيف", text:"small localized sweat sheen only where temperature or activity physically supports it" },
  { value:"mild-tired", label:"إرهاق بسيط", text:"mild natural tiredness around the eyes without aging, smoothing or reshaping the face" }
];

export const EXPRESSION_OPTIONS = [
  { value:"neutral", label:"هادئ ومحايد", text:"calm neutral expression with relaxed jaw, natural eyelids and ordinary facial asymmetry" },
  { value:"soft-smile", label:"ابتسامة خفيفة", text:"a small natural smile with subtle asymmetric cheek and eye-muscle engagement" },
  { value:"serious", label:"جدي وهادئ", text:"a serious but relaxed expression without forced brow tension" },
  { value:"focused", label:"مركز", text:"a naturally focused gaze with relaxed facial anatomy" },
  { value:"slightly-tired", label:"متعب قليلًا", text:"a mildly tired expression with slightly heavier eyelids and relaxed jaw, without changing apparent age" }
];

export const COMPOSITION_OPTIONS = [
  { value:"tight", label:"كلوز أب", text:"tight selfie framing with the face dominant and only minimal contextual background" },
  { value:"close", label:"وجه وكتفان", text:"close selfie framing showing head and shoulders with enough context to read the location" },
  { value:"upper", label:"نصف علوي", text:"upper-body selfie framing with head, shoulders and torso visible while the environment remains secondary" },
  { value:"medium", label:"متوسط", text:"medium selfie framing showing more pose context without requiring the full room, car or body to appear" }
];

export const SELFIE_ANGLE_OPTIONS = [
  { value:"eye", label:"مستوى العين", text:"front camera held around eye height with a small natural hand roll" },
  { value:"slight-high", label:"أعلى قليلًا", text:"front camera held about 8–18 degrees above eye level within natural arm reach" },
  { value:"slight-low", label:"أسفل قليلًا", text:"front camera held about 5–10 degrees below eye level within natural arm reach" },
  { value:"three-quarter", label:"ثلاثة أرباع", text:"front camera held at a natural three-quarter arm angle with matching head rotation and near-field perspective" },
  { value:"side-close", label:"جانبي قريب", text:"front camera held slightly to one side of the face while remaining clearly subject-held and within arm reach" }
];

export const POSE_FAMILIES = [
  { value:"relaxed", label:"سيلفي عفوي" },
  { value:"seated", label:"جلوس" },
  { value:"lying", label:"استلقاء على السرير" },
  { value:"standing", label:"وقوف" },
  { value:"activity", label:"نشاط بسيط" },
  { value:"car", label:"داخل السيارة" },
  { value:"gym", label:"النادي" },
  { value:"street", label:"خارجي" }
];

const BED = ["my_bedroom_text","bedroom"];
const CAR = ["rangeRover"];
const GYM = ["gym"];
const STREET = ["street"];

export const SELFIE_POSES = [
  { value:"relaxed-close", family:"relaxed", label:"سيلفي قريب عفوي", scenes:ALL_SCENES, angles:["eye","slight-high","three-quarter"], compositions:["tight","close"], text:"a relaxed subject-held close selfie with natural shoulder asymmetry and no staged pose; background may be only partially visible" },
  { value:"relaxed-side", family:"relaxed", label:"سيلفي جانبي خفيف", scenes:ALL_SCENES, angles:["three-quarter","side-close"], compositions:["tight","close"], text:"a relaxed selfie from a slight side angle, head rotation matching the phone position and arm reach" },
  { value:"relaxed-low", family:"relaxed", label:"سيلفي من أسفل قليلًا", scenes:ALL_SCENES, angles:["slight-low"], compositions:["close","upper"], text:"a casual low-angle selfie from only slightly below eye level, neck and shoulder geometry remaining relaxed and physically possible" },

  { value:"bed-edge", family:"seated", label:"جالس على حافة السرير", scenes:BED, angles:["eye","slight-high","three-quarter"], compositions:["close","upper","medium"], text:"seated naturally on the bed edge with pelvis and thighs compressing the mattress edge, shoulders uneven and the selfie arm raised within easy reach" },
  { value:"sofa-seated", family:"seated", label:"جالس على الكنبة", scenes:["my_bedroom_text","bedroom"], angles:["eye","slight-high","three-quarter"], compositions:["close","upper","medium"], text:"seated naturally on the sofa with real cushion compression under the hips and relaxed torso posture" },
  { value:"chair-seated", family:"seated", label:"جالس على كرسي", scenes:["my_bedroom_text","bedroom","street"], angles:["eye","three-quarter"], compositions:["close","upper","medium"], text:"seated naturally on a chair with pelvis supported, ordinary torso lean and no requirement to show the feet unless they enter the frame" },
  { value:"floor-seated", family:"seated", label:"جالس على الأرض", scenes:BED, angles:["slight-high","three-quarter"], compositions:["upper","medium"], text:"seated casually on the floor with hips grounded and legs arranged within normal joint range, only the visible contact area needing to appear" },

  { value:"lying-back", family:"lying", label:"على الظهر — طبيعي", scenes:BED, angles:["eye","slight-high"], compositions:["tight","close","upper"], text:"lying naturally on the back, head supported by the pillow, visible pillow indentation and mild shoulder and upper-back mattress compression" },
  { value:"lying-back-pillow", family:"lying", label:"على الظهر — رأس مرتفع", scenes:BED, angles:["eye","slight-high"], compositions:["tight","close","upper"], text:"lying on the back with the head slightly elevated by a pillow, pillow visibly compressed and neck kept neutral rather than craned" },
  { value:"lying-back-blanket", family:"lying", label:"على الظهر — بطانية على الساقين", scenes:BED, angles:["eye","slight-high"], compositions:["close","upper","medium"], text:"lying on the back with a blanket resting only over the lower body, cloth draping independently over the legs while the upper body remains naturally supported" },
  { value:"lying-right-close", family:"lying", label:"الجانب الأيمن — قريب", scenes:BED, angles:["eye","slight-high","side-close"], compositions:["tight","close"], text:"lying on the right side in a close selfie, right cheek and shoulder showing mild pillow and mattress compression, hair compressed only on the contact side; the face turns naturally about 10–15 degrees toward the front camera, and the left hand is the phone-holding hand with the phone and arm remaining outside the crop unless geometry requires a tiny edge" },
  { value:"lying-right-propped", family:"lying", label:"الجانب الأيمن — متكئ", scenes:BED, angles:["eye","slight-high","three-quarter"], compositions:["close","upper"], text:"lying on the right side with the upper torso slightly propped by a pillow, right shoulder and hip supported and the free arm able to hold the phone naturally" },
  { value:"lying-left-close", family:"lying", label:"الجانب الأيسر — قريب", scenes:BED, angles:["eye","slight-high","side-close"], compositions:["tight","close"], text:"lying on the left side in a close selfie, left cheek and shoulder showing mild pillow and mattress compression, hair compressed only on the contact side" },
  { value:"lying-left-propped", family:"lying", label:"الجانب الأيسر — متكئ", scenes:BED, angles:["eye","slight-high","three-quarter"], compositions:["close","upper"], text:"lying on the left side with the upper torso slightly propped by a pillow, left shoulder and hip supported and the free arm able to hold the phone naturally" },
  { value:"lying-stomach-elbow", family:"lying", label:"على البطن — مرتكز على المرفق", scenes:BED, angles:["eye","slight-high"], compositions:["close","upper"], text:"lying on the stomach with chest and abdomen loading the mattress, one forearm or elbow supporting part of the upper body and the other arm holding the phone within reach" },
  { value:"lying-stomach-relaxed", family:"lying", label:"على البطن — استرخاء", scenes:BED, angles:["eye","three-quarter"], compositions:["close","upper"], text:"lying relaxed on the stomach with torso weight spread across the mattress, head turned only enough for a comfortable subject-held selfie" },
  { value:"semi-reclining", family:"lying", label:"نصف استلقاء", scenes:BED, angles:["eye","slight-high"], compositions:["close","upper","medium"], text:"semi-reclining at a comfortable 30–55 degree torso angle, back and pelvis supported by the mattress or pillows with broad real compression zones" },
  { value:"semi-reclining-two-pillows", family:"lying", label:"نصف استلقاء — وسادتان", scenes:BED, angles:["eye","slight-high"], compositions:["close","upper","medium"], text:"semi-reclining against two visibly compressed pillows, shoulders relaxed and phone held within natural reach" },

  { value:"standing-room", family:"standing", label:"واقف داخل الغرفة", scenes:BED, angles:["eye","three-quarter","slight-low"], compositions:["close","upper","medium"], text:"standing casually in the bedroom with relaxed shoulders and only enough background visible to establish the room" },
  { value:"standing-window", family:"standing", label:"واقف قرب النافذة", scenes:BED, angles:["eye","three-quarter"], compositions:["close","upper"], text:"standing near the window so the selected practical daylight can plausibly illuminate the face; the window itself does not need to be fully visible" },
  { value:"standing-wardrobe", family:"standing", label:"واقف قرب الدولاب", scenes:BED, angles:["eye","three-quarter"], compositions:["close","upper","medium"], text:"standing casually near the wardrobe, with mirror reflections included only if they naturally enter the crop and obey one camera ray path" },

  { value:"laptop-bed-edge", family:"activity", label:"💻 يعمل على لابتوب — حافة السرير", scenes:BED, angles:["eye","slight-high"], compositions:["upper","medium"], text:"seated on the bed edge with an open laptop resting with real weight on the thighs, one hand able to contact the keyboard or trackpad while the other arm holds the phone; laptop screen light remains only as strong as the selected lighting setup allows" },
  { value:"laptop-semi-reclining", family:"activity", label:"💻 لابتوب — نصف استلقاء", scenes:BED, angles:["eye","slight-high"], compositions:["upper","medium"], text:"semi-reclining with a laptop resting securely on the thighs or mattress, body and laptop both visibly supported, with the selfie arm free to hold the phone" },
  { value:"coffee-relaxed", family:"activity", label:"يمسك كوب قهوة", scenes:["my_bedroom_text","bedroom","street"], angles:["eye","three-quarter"], compositions:["close","upper"], text:"holding a cup casually with the non-selfie hand while taking the selfie, wrist and cup orientation remaining physically comfortable" },
  { value:"waiting-relaxed", family:"activity", label:"ينتظر باسترخاء", scenes:ALL_SCENES, angles:["eye","slight-high","three-quarter"], compositions:["close","upper"], text:"a natural waiting posture with small asymmetries and no staged gesture, as if the selfie was taken casually during a pause" },

  { value:"car-driver-close", family:"car", label:"السائق — سيلفي قريب", scenes:CAR, angles:["eye","three-quarter"], compositions:["tight","close"], text:"seated in the stationary driver's seat, torso supported by the seatback, with only a thin physically attached upper steering-wheel rim fragment at the extreme lower edge, no more than 8% of image height, as the minimal driver-seat cue; do not show a full wheel, hub, spokes or broad holding forearm" },
  { value:"car-driver-relaxed", family:"car", label:"السائق — مسترخي", scenes:CAR, angles:["eye","slight-high","three-quarter"], compositions:["close","upper"], text:"relaxed in the stationary driver's seat with natural seat compression and ordinary shoulder asymmetry" },
  { value:"car-driver-side", family:"car", label:"السائق — جانبي", scenes:CAR, angles:["three-quarter","side-close"], compositions:["tight","close","upper"], text:"subject-held selfie from a slight side angle in the stationary driver's seat, cabin perspective and steering-side geometry remaining coherent" },
  { value:"car-driver-low", family:"car", label:"السائق — من أسفل قليلًا", scenes:CAR, angles:["slight-low"], compositions:["close","upper"], text:"a mildly low front-camera selfie from the stationary driver's seat, still within natural arm reach and without exaggerating the chin or cabin geometry" },
  { value:"car-roof-context", family:"car", label:"السائق — السقف البانورامي ظاهر جزئيًا", scenes:CAR, angles:["slight-high","three-quarter"], compositions:["upper","medium"], text:"a stationary driver selfie framed slightly wider so part of the panoramic roof may appear if naturally inside the field of view; it is not mandatory" },

  { value:"gym-between-sets", family:"gym", label:"راحة بين التمارين", scenes:GYM, angles:["eye","slight-high","three-quarter"], compositions:["close","upper"], text:"a candid selfie during a rest between sets, posture relaxed and equipment only partly visible as secondary context" },
  { value:"gym-bench-seated", family:"gym", label:"جالس على بنش", scenes:GYM, angles:["eye","slight-high"], compositions:["close","upper","medium"], text:"seated on a gym bench with real seat contact, relaxed breathing posture and the selfie arm raised naturally" },
  { value:"gym-standing", family:"gym", label:"واقف داخل النادي", scenes:GYM, angles:["eye","three-quarter"], compositions:["close","upper"], text:"standing casually in the gym with ordinary posture, equipment and mirrors included only if they naturally enter the selfie crop" },
  { value:"gym-post-workout", family:"gym", label:"بعد التمرين", scenes:GYM, angles:["eye","slight-high"], compositions:["tight","close","upper"], text:"a post-workout selfie with mild believable fatigue and only physically plausible sweat, not a fitness advertisement pose" },

  { value:"street-standing", family:"street", label:"واقف في شارع أو موقف", scenes:STREET, angles:["eye","three-quarter","slight-low"], compositions:["close","upper","medium"], text:"standing casually in a Saudi street or parking area, background traffic and architecture secondary and not required to be fully visible" },
  { value:"street-beside-car", family:"street", label:"واقف بجانب سيارة", scenes:STREET, angles:["eye","three-quarter"], compositions:["close","upper","medium"], text:"standing beside a parked car while taking the selfie, only a plausible portion of the vehicle needing to appear in frame" },
  { value:"street-open-shade", family:"street", label:"واقف في ظل مفتوح", scenes:STREET, angles:["eye","three-quarter"], compositions:["close","upper"], text:"standing in open shade near a building or canopy, face lit by reflected daylight with the environment kept secondary" },
  { value:"street-slow-walk", family:"street", label:"مشي بطيء وسيلفي", scenes:STREET, angles:["eye","slight-high"], compositions:["close","upper"], text:"taking a selfie during a slow casual walk, with only subtle body motion and no travel-style motion blur" }
];

export const BEDROOM_WINDOW_OPTIONS = {
  night: [
    { value:"night-charcoal-closed", label:"الستائر الفحمية مغلقة", text:"the existing charcoal curtains are closed; no unsupported exterior light enters" },
    { value:"night-charcoal-parted-street", label:"الستائر مفتوحة قليلًا + ضوء شارع", text:"the existing charcoal curtains are parted slightly, allowing a weak physically plausible streetlight spill" },
    { value:"night-charcoal-parted-city", label:"الستائر مفتوحة قليلًا + أضواء بعيدة", text:"the existing charcoal curtains are parted slightly, with only faint distant city lights visible or reflected" },
    { value:"night-charcoal-open-dark", label:"الستائر مفتوحة والنافذة داكنة", text:"the existing charcoal curtains are open enough to reveal a dark night window with only weak room reflections" }
  ],
  day: [
    { value:"day-charcoal-parted-soft", label:"الستائر الفحمية مفتوحة جزئيًا — ضوء ناعم", text:"the existing charcoal curtains are partly drawn, allowing broad soft daylight to enter; do not invent white sheer curtains" },
    { value:"day-charcoal-open-skylight", label:"الستائر مفتوحة — ضوء سماوي", text:"the existing charcoal curtains are opened enough for bright skylight and a believable exterior exposure tradeoff" },
    { value:"day-charcoal-sun-gap", label:"فتحة ستارة — شمس مباشرة", text:"a gap between the existing charcoal curtains admits a defined patch of direct sunlight with matching hard-edged shadows" },
    { value:"day-charcoal-closed", label:"الستائر الفحمية مغلقة", text:"the existing charcoal curtains are closed and daylight is blocked; illumination must come from the selected indoor practical" }
  ]
};

export const LIGHTING_OPTIONS = {
  bedroom: {
    night: [
      { value:"night-phone-only", label:"شاشة الهاتف فقط", windowIds:["night-charcoal-closed","night-charcoal-open-dark"], text:"the phone screen is the only direct facial source at arm length, producing a cool close-range falloff, dark background, realistic high-ISO noise and no hidden room fill" },
      { value:"night-bedside-2700", label:"أباجورة 2700K فقط", windowIds:["night-charcoal-closed","night-charcoal-open-dark"], text:"one visible 2700K bedside lamp is the dominant practical key, with warm inverse-square falloff and naturally darker opposite facial side" },
      { value:"night-bedside-3000", label:"أباجورة 3000K فقط", windowIds:["night-charcoal-closed","night-charcoal-open-dark"], text:"one 3000K bedside lamp is on as the sole dominant practical source and may remain outside the close crop, with soft warm falloff and no hidden frontal fill; all recessed ceiling downlights are switched off" },
      { value:"night-downlight-4000", label:"سبوت سقف واحد 4000K", windowIds:["night-charcoal-closed","night-charcoal-open-dark"], text:"one visible 4000K ceiling downlight is the dominant source, producing plausible downward facial and bedding shadows" },
      { value:"night-all-downlights", label:"سبوتات السقف كلها", windowIds:["night-charcoal-closed","night-charcoal-open-dark"], text:"the visible ceiling downlights are on, producing broad practical room illumination with multiple soft fixture-supported shadow directions" },
      { value:"night-dim-ceiling", label:"سقف خافت", windowIds:["night-charcoal-closed","night-charcoal-open-dark"], text:"dim visible ceiling lighting provides the only room illumination, keeping exposure realistically low and sensor noise visible" },
      { value:"night-lamp-phone", label:"أباجورة + شاشة هاتف خفيفة", windowIds:["night-charcoal-closed","night-charcoal-open-dark"], text:"a visible warm bedside lamp is dominant while the phone screen adds only a weak cool near-face fill, with mixed white balance left natural" },
      { value:"night-laptop-lamp", label:"لابتوب + أباجورة بعيدة", windowIds:["night-charcoal-closed","night-charcoal-open-dark"], text:"a laptop screen provides a localized cool fill while a visible distant warm bedside lamp remains the room practical; neither becomes an unexplained studio key" },
      { value:"night-street-spill", label:"ضوء شارع من النافذة", windowIds:["night-charcoal-parted-street"], text:"a weak exterior streetlight spill enters through the curtain gap and becomes the main visible directional source, with realistic low-light exposure" },
      { value:"night-lamp-street", label:"أباجورة + ضوء شارع ضعيف", windowIds:["night-charcoal-parted-street"], text:"the bedside lamp is dominant and a weaker streetlight spill enters through the curtain gap, each with distinct but physically coherent direction" },
      { value:"night-city-ambient", label:"أضواء مدينة بعيدة", windowIds:["night-charcoal-parted-city"], text:"faint distant city light contributes weak ambient color variation through the window while the room remains mostly dark" },
      { value:"night-parking-cool", label:"ضوء خارجي أبيض متسرب", windowIds:["night-charcoal-parted-street"], text:"a restrained cool-white exterior practical spills through the curtain gap, producing localized light rather than a cinematic rim" }
    ],
    day: [
      { value:"day-soft-window", label:"ضوء نافذة ناعم", windowIds:["day-charcoal-parted-soft","day-charcoal-open-skylight"], text:"soft daylight from the window is the dominant source, with gradual directional falloff, realistic bright-window clipping and natural phone auto-exposure" },
      { value:"day-front-window", label:"ضوء نافذة أمامي ناعم", windowIds:["day-charcoal-parted-soft","day-charcoal-open-skylight"], text:"broad window daylight falls mostly from the front-side direction, softening shadows without looking like a ring light" },
      { value:"day-side-window", label:"ضوء نافذة جانبي", windowIds:["day-charcoal-parted-soft","day-charcoal-open-skylight"], text:"window daylight arrives clearly from one side, producing believable cheek, nose and neck shadow gradients" },
      { value:"day-overcast", label:"نهار غائم", windowIds:["day-charcoal-parted-soft","day-charcoal-open-skylight"], text:"cool overcast daylight from the window creates low-contrast directional illumination with no hard sun shadows" },
      { value:"day-morning", label:"ضوء صباحي ناعم", windowIds:["day-charcoal-parted-soft","day-charcoal-open-skylight"], text:"soft morning daylight enters at a modest angle with restrained contrast and realistic warm-neutral white balance" },
      { value:"day-direct-sun", label:"شمس مباشرة", windowIds:["day-charcoal-sun-gap","day-charcoal-open-skylight"], text:"direct sunlight enters through a real opening, producing hard-edged light patches, deep compatible shadows and realistic highlight clipping" },
      { value:"day-late-afternoon", label:"شمس عصر دافئة", windowIds:["day-charcoal-sun-gap","day-charcoal-open-skylight"], text:"late-afternoon sunlight enters from a lower angle with longer shadows and naturally warmer highlights" },
      { value:"day-window-ceiling", label:"نافذة + سقف خفيف", windowIds:["day-charcoal-parted-soft","day-charcoal-open-skylight"], text:"daylight remains dominant while visible ceiling lights add a weaker practical contribution, preserving mixed but plausible white balance" },
      { value:"day-ceiling-only", label:"سقف فقط والستائر مغلقة", windowIds:["day-charcoal-closed"], text:"the existing charcoal curtains are closed and visible ceiling lights become the only significant source, with no daylight spill" },
      { value:"day-reflected-window", label:"ضوء نهاري مرتد", windowIds:["day-charcoal-parted-soft","day-charcoal-open-skylight"], text:"window daylight reaches the face mainly through nearby wall and floor bounce, producing soft directional fill without hidden studio equipment" }
    ]
  },
  car: {
    night: [
      { value:"car-night-parking-led", label:"LED موقف السيارات", text:"cool-white parking lights enter through the car windows as the dominant source, with restrained dashboard glow and coherent glass reflections" },
      { value:"car-night-dashboard", label:"عدادات وشاشات السيارة", text:"dashboard and infotainment screens provide weak local cabin illumination while the exterior remains dark; screen light falls off quickly" },
      { value:"car-night-street", label:"إنارة شارع خارجية", text:"street or parking practicals outside the stationary car shape the face through the windows, with realistic glass reflections and dark cabin gaps" },
      { value:"car-night-mixed", label:"LED خارجي + شاشة السيارة", text:"exterior parking LEDs are dominant while dashboard screens add a weaker local fill, with mixed color left physically plausible" },
      { value:"car-night-cabin", label:"إنارة المقصورة الخافتة", text:"a visible built-in cabin light is the main interior source, soft but localized, with no studio-style fill" },
      { value:"car-night-window-side", label:"ضوء جانبي من النافذة", text:"one external practical illuminates the face through a side window, producing a clear side-light gradient and matching reflections" }
    ],
    day: [
      { value:"car-day-window", label:"ضوء النهار من النوافذ", text:"daylight entering through the side windows and panoramic roof is dominant, with believable exterior-to-cabin exposure tradeoff" },
      { value:"car-day-open-shade", label:"ظل موقف مفتوح", text:"open-shade daylight in a parking area creates soft cabin illumination and restrained reflections on leather and wood" },
      { value:"car-day-side-sun", label:"شمس جانبية", text:"direct sun enters through one side window, producing a localized hard light patch and realistic bright exterior clipping" },
      { value:"car-day-overcast", label:"نهار غائم", text:"overcast daylight fills the cabin softly with low contrast and natural phone-camera exposure" },
      { value:"car-day-roof-light", label:"ضوء من السقف البانورامي", text:"skylight through the panoramic roof contributes noticeably from above while side-window daylight remains physically consistent" },
      { value:"car-day-reflected", label:"ضوء مرتد من الموقف", text:"bright reflected daylight from pavement or nearby walls fills the cabin softly without looking like artificial bounce cards" }
    ]
  },
  gym: {
    night: [
      { value:"gym-night-led", label:"LED النادي الأبيض", text:"visible gym LED fixtures are the dominant practical sources, with restrained reflections on equipment and realistic low-light phone noise" },
      { value:"gym-night-warm", label:"إضاءة نادي دافئة", text:"visible warmer gym practicals illuminate the face and equipment consistently without nightclub color grading" },
      { value:"gym-night-led-accent", label:"LED + لون خفيف من لوحة ظاهرة", text:"white gym LEDs remain dominant while a visible sign or strip contributes only a small localized colored spill" },
      { value:"gym-night-mirror-area", label:"إضاءة منطقة المرآة", text:"visible practical fixtures near the mirror area illuminate the subject; mirror highlights and reflections follow the same source layout" }
    ],
    day: [
      { value:"gym-day-window", label:"ضوء نافذة", text:"large-window daylight is dominant with natural reflections on equipment and realistic indoor exposure" },
      { value:"gym-day-window-led", label:"نافذة + LED", text:"daylight remains dominant while visible gym LEDs add a weaker practical component" },
      { value:"gym-day-open-shade", label:"ظل نهاري داخل النادي", text:"soft reflected daylight from windows or open frontage lights the subject with low contrast" },
      { value:"gym-day-side-window", label:"نافذة جانبية", text:"directional side-window daylight creates clear but natural facial and equipment shadow gradients" }
    ]
  },
  street: {
    night: [
      { value:"street-night-led", label:"LED أبيض", text:"cool-white street or parking LEDs create localized light pools with realistic dark gaps and phone-camera noise" },
      { value:"street-night-sodium", label:"صوديوم دافئ", text:"warm sodium-vapor streetlight provides the dominant source with believable amber white-balance shift" },
      { value:"street-night-mixed", label:"صوديوم + LED", text:"warm sodium and cooler LED practicals coexist in separate visible directions without cinematic color exaggeration" },
      { value:"street-night-storefront", label:"ضوء واجهة متجر", text:"a real storefront practical becomes the dominant nearby source while the rest of the street remains darker" },
      { value:"street-night-parking", label:"إضاءة موقف", text:"parking-area poles create practical overhead or side light with ordinary asphalt and vehicle reflections" }
    ],
    day: [
      { value:"street-day-open-shade", label:"ظل مفتوح", text:"open shade from a building or canopy with bright reflected daylight and soft directional shadows" },
      { value:"street-day-midday", label:"شمس الظهر", text:"high midday sun creates short hard shadows and strong exposure tradeoffs without fake HDR" },
      { value:"street-day-morning", label:"ضوء صباحي", text:"morning sun creates moderate contrast and a natural warmer direction" },
      { value:"street-day-afternoon", label:"ضوء عصر", text:"late-afternoon sun creates longer shadows and warm highlights without cinematic grading" },
      { value:"street-day-overcast", label:"نهار غائم", text:"overcast daylight produces soft low-contrast outdoor illumination and subdued reflections" }
    ]
  }
};

export const MESSINESS_OPTIONS = [
  { value:"minimal", label:"خلفية بسيطة", text:"keep background detail sparse and secondary; do not clean the world into a studio set" },
  { value:"natural", label:"طبيعية", text:"allow ordinary believable background disorder only where it naturally enters the crop" },
  { value:"busy", label:"أكثر ازدحامًا", text:"allow more ordinary contextual objects in the background while keeping the subject clearly dominant and avoiding duplicates" }
];

export const CAMERA_SELFIE_LOCK =
  "SUBJECT-HELD SELFIE CAMERA: Xiaomi 15 Ultra front camera only, 32MP OV32B, approximately 21mm-equivalent f/2.0 field of view around 90 degrees. The subject physically holds the phone at a plausible 40–70 cm arm reach. Use one front-camera viewpoint, one lens and one exposure pipeline. Natural near-field wide-angle perspective is required; the phone and most of the holding arm may remain outside the crop when geometry stays possible. Natural Xiaomi front-camera color rendering, restrained saturation and realistic automatic white balance; no Leica rear-camera look.";

export const IDENTITY_LOCK =
  "SINGLE-REFERENCE IDENTITY LOCK: use exactly one attached reference image as the sole identity authority. Preserve facial structure, proportions, feature spacing, apparent age, skin tone, natural asymmetry, eye and brow geometry, nose, lips, jaw, chin, ears, hairline, visible hair density, beard density, beard gaps and facial-hair growth pattern. Do not beautify, symmetrize, de-age, reshape, slim or substitute the face.";

export const SUBJECT_BODY =
  "one adult male, lightly athletic build, 195 cm and 88 kg; anatomy remains connected and physically plausible, with exactly five fingers on every visible hand.";

export const SMARTPHONE_REALISM =
  "RAW SMARTPHONE REALISM: candid unedited phone capture, ordinary skin texture, visible but non-exaggerated pores, slight tonal variation, small natural blemishes, restrained sharpening, realistic auto-exposure, limited highlight recovery, subtle sensor noise appropriate to the light level, slight handheld imperfection and no artificial portrait-mode cutout.";

export const SCENE_PRIORITY_RULE =
  "SELFIE PRIORITY: the person taking the selfie is the primary subject. Scene, furniture, vehicle, equipment, floor, windows and clutter are supporting context only. They may be cropped, partially visible, softly rendered or absent if outside the real front-camera field of view. Never force every environmental detail into the frame.";

export const CONFLICT_PRIORITY_LINES = Object.freeze([
  "1. Reference identity and reference-linked eyewear.",
  "2. Explicit selected fields: active scene, seat position, expression, clothing and lighting.",
  "3. Dedicated scene-specific subject-held camera geometry.",
  "4. Physical anatomy, reach, support, contact and pose feasibility.",
  "5. Hair, clothing, lighting and smartphone capture physics.",
  "6. Optional cabin/exterior context and physically caused imperfections.",
  "7. WikiPrompt calibration and aesthetic finishing."
]);

export const REALISM_ORDER = `CONFLICT ORDER:
${CONFLICT_PRIORITY_LINES.join("\n")}
If a selected detail conflicts with physical feasibility, preserve its intent and correct only the impossible component. If optional context conflicts with a higher-priority rule, omit it rather than changing the scene, seat or camera geometry.`;

export function sceneFamily(sceneId) {
  return SCENES[sceneId]?.family ?? "bedroom";
}
