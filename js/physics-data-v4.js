export const BASE_SKIN_TEXTURE = [
  "raw unedited photo",
  "authentic human skin texture",
  "highly detailed face",
  "visible microscopic pores",
  "facial micro-details",
  "realistic subsurface scattering",
  "natural skin blemishes",
  "subtle fine wrinkles",
  "peach fuzz",
  "hyper-realistic anatomical accuracy",
  "documentary photography style",
  "unretouched",
  "natural skin oil reflection",
  "athletic male, 195 cm, 88 kg"
];

export const BASE_NEGATIVE = [
  "plastic skin",
  "waxy skin",
  "over-smoothed skin",
  "airbrushed skin",
  "CGI",
  "3D render",
  "AI generated look",
  "doll-like face",
  "synthetic face",
  "deformed anatomy",
  "mutated anatomy",
  "random artifacts",
  "unnatural facial symmetry",
  "heavy makeup effect",
  "cartoon",
  "illustration",
  "blurred facial details",
  "extra fingers",
  "missing fingers",
  "fused fingers",
  "anatomical nonsense"
];

export const SCENES = {
  my_bedroom_text: {
    id: "my_bedroom_text",
    label: "🏠 غرفتي (بدون صورة)",
    name_ar: "🏠 غرفتي (بدون صورة)",
    image_url: null,
    image_filename: null,
    text_reference: true,
    region: "master_bedroom_full",
    supported_poses: [
      "standing_center",
      "standing_bedside",
      "standing_sofa",
      "standing_vanity",
      "standing_wardrobe",
      "sitting_bed_edge",
      "sitting_sofa",
      "sitting_chair",
      "sitting_floor",
      "lying_back",
      "lying_stomach",
      "lying_right_side",
      "lying_left_side",
      "semi_reclining"
    ],
    supported_directions: ["any"],
    camera_angles: ["eye_level", "low_angle", "high_angle", "overhead_top_down"],
    camera_distances: ["close", "medium", "wide"],
    visible_features: [
      "tufted_leather_headboard",
      "charcoal_curtains",
      "mirrored_wardrobe",
      "grey_sofa",
      "beige_floor",
      "large_rug",
      "downlights",
      "split_ac",
      "realistic_clutter"
    ],
    surfaces: ["floor", "mattress", "pillow", "headboard", "sofa_cushion", "rug", "wardrobe", "dresser"],
    priority: 200,
    family: "bedroom",
    description_en: "A modern bedroom with tufted dark leather headboard, white split AC on the wall, recessed ceiling downlights, dark wood nightstand with a lit lamp, water bottles, chargers, and a laptop. Charcoal floor-to-ceiling curtains, dark wood wardrobe with full mirrored doors and open shelves of clothes, dark wood dresser with mirror, beige porcelain floor with a large area rug, grey sofa in the corner. Realistic daily clutter: scattered shoes on the floor, a chair with clothes, a bag on the floor. Slightly unmade grey bedding.",
    environment: "the permanent text-only bedroom reference described in the fixed room-description block; preserve its fixed furniture, surfaces, materials and daily clutter",
    clothing: [
      { value: "sleep-set", label: "طقم نوم قطني", text: "soft cotton sleep set with natural creasing where the body contacts the bedding" },
      { value: "t-shirt-shorts", label: "تيشيرت وشورت", text: "worn cotton T-shirt and relaxed sleep shorts with gravity-consistent folds" },
      { value: "robe", label: "روب منزلي", text: "lightweight home robe with a naturally tied belt and realistic drape" }
    ]
  },
  bedroom: {
    label: "غرفة نوم واقعية",
    environment: "a realistically lived-in Saudi bedroom, bed sheets and pillows with real volume and compression, a plausible amount of everyday clutter, practical furniture with coherent scale",
    clothing: [
      { value: "sleep-set", label: "طقم نوم قطني", text: "soft cotton sleep set with natural creasing where the body contacts the bedding" },
      { value: "t-shirt-shorts", label: "تيشيرت وشورت", text: "worn cotton T-shirt and relaxed sleep shorts with gravity-consistent folds" },
      { value: "robe", label: "روب منزلي", text: "lightweight home robe with a naturally tied belt and realistic drape" }
    ]
  },
  gym: {
    label: "نادٍ سعودي حديث",
    environment: "a modern Saudi gym with occupied equipment, credible mirror geometry, metallic machines, rubber flooring, towels and weights placed naturally, background members kept secondary",
    clothing: [
      { value: "training-set", label: "طقم رياضي", text: "matte technical training shirt and tapered athletic trousers, fabric tension and sweat darkening only where physically plausible" },
      { value: "tee-shorts", label: "تيشيرت وشورت رياضي", text: "breathable athletic T-shirt and training shorts with realistic stretch and seam behavior" },
      { value: "tracksuit", label: "ترينينغ", text: "lightweight sports tracksuit with believable fabric weight and creasing" }
    ]
  },
  street: {
    label: "شارع سعودي",
    environment: "a believable Saudi Arabian street with weathered asphalt, yellow-and-black painted curbs where appropriate, contemporary SUVs with tinted windows, practical storefront light, distant people in thobes and abayas, Arabic signage only if naturally present and not relied on for legible text",
    clothing: [
      { value: "street-casual", label: "كاجوال", text: "clean casual cotton shirt and tailored trousers with natural outdoor drape" },
      { value: "thobe", label: "ثوب سعودي", text: "a crisp but naturally moving white Saudi thobe with physically plausible folds and hem contact" },
      { value: "overshirt", label: "قميص أوفرشيرت", text: "casual overshirt over a cotton T-shirt and trousers, layers responding naturally to wind and gravity" }
    ]
  },
  rangeRover: {
    label: "رنج روفر سبورت 2022",
    environment: "inside a stationary white 2022 Range Rover Sport, beige perforated leather upholstery, dark glossy wood center-console trim, left-hand-drive geometry, coherent dashboard and window reflections, parked safely in a plausible Saudi location",
    clothing: [
      { value: "button-shirt", label: "قميص قطني", text: "a neat cotton button-down shirt with natural seated compression and realistic sleeve folds" },
      { value: "polo", label: "بولو كاجوال", text: "a matte cotton polo with realistic seated creasing" },
      { value: "thobe-car", label: "ثوب سعودي", text: "a Saudi thobe with lap and seat-belt-area folds that follow the seated posture" }
    ]
  }
};

export const BASE_TEMPLATES = {
  "bedroom:night:standard": {
    title: "الغرفة ليلاً",
    text: "candid night photograph inside a bedroom, warm 3000K tungsten bedside lamp as a visible practical key light, soft falloff into deep room ambience, source-consistent shadows and bounce light, slight halation around bright practical bulbs"
  },
  "gym:night:standard": {
    title: "النادي ليلاً",
    text: "candid night photograph inside a modern gym, practical overhead LED lighting and selected neon accents only where fixtures are visible, controlled reflections on metal equipment, restrained low-light contrast, no nightclub atmosphere unless explicitly requested"
  },
  "street:night:standard": {
    title: "شارع سعودي ليلاً",
    text: "candid night street photograph in Saudi Arabia, sodium-vapor orange streetlights mixing with modern white LEDs, reflective asphalt only where it is genuinely damp or polished, ambient storefront glow, naturally dark gaps between light pools"
  },
  "rangeRover:night:standard": {
    title: "رنج روفر 2022 ليلاً",
    text: "candid night photograph inside a white 2022 Range Rover Sport, beige perforated leather upholstery and dark glossy wood center console, restrained cabin ambient light and dashboard-screen glow, streetlights reflecting coherently in the windshield, realistic low-light noise"
  },
  "bedroom:night:selfie": {
    title: "سيلفي الغرفة ليلاً",
    text: "candid nighttime bedroom selfie, a cool smartphone-screen glow only if the phone screen can physically illuminate the face, warm 3000K bedside-lamp practical with soft falloff, optional orange sodium light through blinds only if a visible window supports it, realistic low-light noise"
  },
  "bedroom:day:standard": {
    title: "الغرفة نهاراً",
    text: "candid daytime photograph inside a bright modern Saudi bedroom, direct sunlight through windows partially diffused by sheer curtains, defined light pools on bedding and floor, ambient skylight filling shadows, realistic highlight clipping and natural daytime sensor grain"
  },
  "gym:day:standard": {
    title: "النادي نهاراً",
    text: "candid daytime photograph inside a modern Saudi gym, daylight entering through large windows mixed with visible interior LED fixtures, reflections on metallic equipment and mirrors following correct geometry, defined indoor details with realistic exposure tradeoffs"
  },
  "street:day:standard": {
    title: "شارع سعودي نهاراً",
    text: "candid midday street photograph in Saudi Arabia, harsh direct sunlight, deep defined shadows on traditional and modern architecture, heat haze only in distant sunlit areas, clear blue sky, realistic exposure tradeoffs between bright asphalt and shaded faces"
  },
  "rangeRover:day:standard": {
    title: "رنج روفر 2022 نهاراً",
    text: "candid daylight portrait inside a stationary white 2022 Range Rover Sport, panoramic sunroof and side windows casting source-consistent light patterns on beige leather and dark wood trim, bright exterior held within believable phone-camera dynamic range"
  },
  "street:night:selfie": {
    title: "سيلفي الشارع ليلاً",
    text: "candid nighttime selfie on a Saudi street, orange sodium-vapor streetlights mixed with white commercial LEDs, yellow-and-black curbs where physically present, coffee shops and passing SUVs remaining secondary in the background, realistic night exposure and asphalt reflections"
  },
  "rangeRover:day:selfie": {
    title: "سيلفي السيارة نهاراً",
    text: "candid daytime selfie inside a stationary white 2022 Range Rover Sport, beige perforated leather and dark wood trim, realistic physical sunlight in the cabin, a plausible Saudi street or parking area visible through the side window, restrained daytime grain"
  }
};

export const FALLBACK_TEMPLATES = {
  "bedroom:day:selfie": "candid daytime bedroom selfie, window daylight as the dominant source, any indoor practical light kept visibly subordinate, realistic smartphone exposure and near-field perspective",
  "gym:day:selfie": "candid daytime selfie inside a modern Saudi gym, daylight and visible LED fixtures illuminating the face consistently with the equipment and mirrors, realistic near-field phone perspective",
  "gym:night:selfie": "candid nighttime selfie inside a modern Saudi gym, practical LED fixtures as the dominant sources, restrained color spill only from visible equipment or signs, realistic low-light phone noise",
  "street:day:selfie": "candid daytime selfie on a Saudi street, harsh sunlight or open shade selected consistently, realistic near-field phone perspective and bright-day exposure tradeoffs",
  "rangeRover:night:selfie": "candid nighttime selfie inside a stationary white 2022 Range Rover Sport, dashboard and exterior practical lights kept physically consistent, restrained low-light noise and coherent windshield reflections"
};

export const LIGHTING_OPTIONS = {
  bedroom: {
    night: [
      { value: "bedside-lamp", label: "أباجورة 3000K", text: "a single warm 3000K bedside lamp as the dominant visible key light, soft falloff, dark ambient room" },
      { value: "phone-screen", label: "شاشة الهاتف فقط", text: "smartphone-screen light as the only direct facial light, near-black room ambience, underexposed background, realistic blue-white screen falloff" },
      { value: "lamp-window", label: "أباجورة + نافذة", text: "warm 3000K bedside lamp plus weak sodium-orange light through a window, each source producing its own plausible direction and intensity" }
    ],
    day: [
      { value: "window-daylight", label: "ضوء نافذة", text: "window daylight as the dominant source, soft skylight fill, realistic white balance and shadow detail" },
      { value: "direct-sun", label: "شمس مباشرة", text: "direct sun entering through a window, defined hard-edged light pools and realistic specular highlights, no hidden fill light" }
    ]
  },
  gym: {
    night: [
      { value: "gym-led", label: "LED النادي", text: "visible 4000–5000K gym LED fixtures as the primary lighting, with restrained reflections on machines and mirrors" },
      { value: "gym-neon", label: "LED + نيون خفيف", text: "visible gym LEDs with a small amount of colored accent light from an actual sign or strip, no unexplained neon rim light" }
    ],
    day: [
      { value: "window-led", label: "نافذة + LED", text: "daylight from windows mixed with visible indoor LED fixtures, matched color balance and credible reflection directions" },
      { value: "window-only", label: "نافذة فقط", text: "large-window daylight as the primary source, natural contrast and realistic reflective highlights on equipment" }
    ]
  },
  street: {
    night: [
      { value: "sodium-led", label: "صوديوم + LED", text: "orange sodium-vapor streetlights mixed with cool white LED poles and storefront practicals, localized light pools and believable color contrast" },
      { value: "led-only", label: "LED أبيض", text: "modern cool-white LED street poles and storefront practicals, darker unlit gaps, no invented orange source" }
    ],
    day: [
      { value: "midday-sun", label: "شمس الظهر", text: "high midday sun with hard, short shadows, heat haze only in distant hot surfaces and realistic eye-socket shadow" },
      { value: "open-shade", label: "ظل مفتوح", text: "open shade from a building with bright reflected daylight, soft directional ambient shadows, no studio fill" }
    ]
  },
  rangeRover: {
    night: [
      { value: "cabin-practicals", label: "إنارة المقصورة", text: "subtle built-in cabin lights and dashboard glow, with exterior parking lights shaping window reflections" },
      { value: "parking-led", label: "LED موقف السيارات", text: "cool-white parking LEDs entering through windows with minimal dashboard glow, realistic window reflection and shadow falloff" }
    ],
    day: [
      { value: "car-window-daylight", label: "ضوء النهار من النوافذ", text: "daylight entering through the panoramic roof and side windows, with believable exposure roll-off from exterior to cabin" },
      { value: "car-open-shade", label: "ظل موقف", text: "open-shade daylight in a parking area, soft reflections on gloss wood and leather, no harsh sunlight unless a window opening supports it" }
    ]
  }
};

// These controls are intentionally bedroom-only. They describe the actual
// practicals and window state, so the prompt does not mix an unexplained key
// light with a generic "cinematic" look.
export const BEDROOM_POSITION_OPTIONS = [
  {
    value: "bed-edge",
    label: "جالس على حافة السرير",
    text: "seated naturally on the edge of the bed, mattress compressed under the thighs, feet supported on the floor, bedding displaced only at real contact points"
  },
  {
    value: "bed-lying",
    label: "مستلقٍ على السرير",
    text: "lying naturally on the bed, pillow indentation, cheek and shoulder compression, hair compression and bedding folds following gravity and body contact"
  },
  {
    value: "bed-propped",
    label: "متكئ على المخدات",
    text: "propped against pillows on the bed, back and shoulders supported by visibly compressed pillows, clothing twisted and folded toward the mattress"
  },
  {
    value: "sofa",
    label: "جالس على الكنبة",
    text: "seated naturally on the bedroom sofa, cushion compression under the hips and realistic fabric tension at the elbows and knees"
  },
  {
    value: "chair",
    label: "جالس على الكرسي",
    text: "seated on the bedroom chair with a stable pelvis, grounded feet and realistic garment creases at the waist and thighs"
  },
  {
    value: "mirror",
    label: "أمام المرآة أو التسريحة",
    text: "positioned by the bedroom mirror or dresser, mirror perspective and reflected room geometry matching the same camera position"
  },
  {
    value: "wardrobe",
    label: "بجوار الدولاب",
    text: "standing naturally beside the bedroom wardrobe, both feet grounded and all room furniture retaining plausible scale and fixed geometry"
  },
  {
    value: "laptop-bed-edge",
    label: "💻 عمل باللابتوب — حافة السرير",
    workSelfie: true,
    selfieAngle: "eye",
    windowByTime: { night: "night-blackout", day: "day-blackout" },
    lightingByTime: { night: "single-downlight-4000", day: "ceiling-only-4000" },
    text: "front-camera work selfie at a physically possible 40–70 cm arm reach with mild wide-angle perspective; seated on the bed edge, pelvis loading the mattress edge with shallow compression and both feet supported on the floor; an open laptop at roughly a 110-degree hinge rests on the thighs, its weight pressing the clothing and thigh fabric, one hand naturally contacts the trackpad edge while the other arm holds the phone with natural shoulder elevation; slight forward work posture with relaxed uneven shoulders; the laptop screen supplies only a cool soft lower-face and chest fill while the ceiling downlight remains the single dominant key and all main shadows follow its direction; exactly five fingers on each visible hand, no floating laptop, contradictory screen glow or impossible contact"
  },
  {
    value: "laptop-stomach",
    label: "💻 عمل باللابتوب — استلقاء على البطن",
    workSelfie: true,
    selfieAngle: "eye",
    windowByTime: { night: "night-blackout", day: "day-blackout" },
    lightingByTime: { night: "single-downlight-4000", day: "ceiling-only-4000" },
    text: "front-camera work selfie at a physically possible 40–70 cm arm reach; lying on the stomach on the bed, chest and abdomen loading the mattress with a visible depression, one elbow planted and bearing weight; an open laptop rests on the mattress in front with its screen facing the person and adding only a local cool fill on the face; the free hand holds the phone within natural reach at a possible wrist angle; lower legs extend along the mattress or, if ankles are loosely crossed and raised behind, knee flexion and calf tension visibly support their weight; bedding folds respond to body load, with no intersecting limbs, floating phone or laptop sinking into the mattress; the ceiling downlight remains the single dominant room key and the main shadow direction stays unified"
  },
  {
    value: "laptop-semi-reclining",
    label: "💻 عمل باللابتوب — اتكاء علوي",
    workSelfie: true,
    selfieAngle: "high",
    windowByTime: { night: "night-blackout", day: "day-blackout" },
    lightingByTime: { night: "single-downlight-4000", day: "ceiling-only-4000" },
    text: "overhead front-camera work selfie at a physically possible 40–70 cm arm reach; semi-reclining against the headboard at 30–60 degrees, with back and pelvis creating broad pressure areas on the mattress and the pillow compressed under the head; a laptop rests aside on the mattress, half-open with a dim screen glow, clearly set down and never hovering; the raised arm holds the phone above the face with plausible deltoid and shoulder elevation, and under the ceiling downlight the phone casts a soft geometrically consistent shadow on the chest; an optional blanket drapes independently over the legs, hair is compressed only at real contact zones, and catchlights match the one dominant ceiling source"
  },
  {
    value: "laptop-chair",
    label: "💻 عمل باللابتوب — على الكرسي",
    workSelfie: true,
    selfieAngle: "high",
    windowByTime: { night: "night-blackout", day: "day-blackout" },
    lightingByTime: { night: "single-downlight-4000", day: "ceiling-only-4000" },
    text: "front-camera work selfie held slightly above eye level at a physically possible 40–70 cm arm reach with mild wide-angle perspective; seated on the bedroom chair with the pelvis fully within the seat and a clear contact shadow, knees near 90 degrees and both feet supported on the floor; an open laptop rests on the thighs with real weight, one hand on the keyboard and the other hand raising the phone with natural shoulder and wrist geometry; the laptop screen gives a weak cool under-fill while the ceiling light from above remains the dominant key, all main shadows stay consistent, and the slight forward lean reads as someone mid-work; exactly five fingers on each visible hand, no dangling feet, merged hands and keyboard, or floating laptop"
  }
];

export const BEDROOM_WINDOW_OPTIONS = {
  night: [
    {
      value: "night-blackout",
      label: "ستائر معتمة مغلقة",
      text: "blackout curtains fully closed, no unsupported exterior light entering the room"
    },
    {
      value: "night-blinds-sodium",
      label: "شتر مفتوح جزئياً + صوديوم شارع",
      text: "partly open blinds admitting a weak 2200K sodium-vapor streetlight spill, narrow and dim enough to remain secondary to the selected indoor practical"
    },
    {
      value: "night-sheer-city",
      label: "ستارة شفافة + أضواء مدينة بعيدة",
      text: "sheer curtains with faint, distant city LED and sodium color variation behind them, not a bright unexplained window key"
    },
    {
      value: "night-dark-window",
      label: "نافذة داكنة بلا ضوء",
      text: "dark night window with only weak reflections from the room practicals, no invented exterior glow"
    }
  ],
  day: [
    {
      value: "day-sheer",
      label: "ستائر شفافة نهارية",
      text: "sheer white curtains diffusing daylight into broad soft gradients across the bedding and floor"
    },
    {
      value: "day-blinds",
      label: "شتر جزئي وخطوط ضوء",
      text: "partly open blinds creating correctly aligned narrow sunlight stripes and darker shadow bands"
    },
    {
      value: "day-open-window",
      label: "نافذة مفتوحة بالكامل",
      text: "open window view providing direct skylight and a believable bright exterior exposure tradeoff"
    },
    {
      value: "day-blackout",
      label: "ستائر معتمة مغلقة",
      text: "blackout curtains closed; daylight is blocked and any illumination must come from the selected visible indoor practical"
    }
  ]
};

export const BEDROOM_LIGHTING_OPTIONS = {
  night: [
    {
      value: "screen-only-6200",
      label: "شاشة الهاتف فقط — 6200K",
      text: "smartphone screen at roughly 30–45 cm from the face as the only direct source, cool 6200K falloff limited to the face and nearest hands, near-black room, realistic ISO 1600–3200 noise and underexposed background"
    },
    {
      value: "bedside-2700",
      label: "أباجورة جانبية دافئة — 2700K",
      text: "one visible 2700K bedside lamp 0.8–1.2 m from the subject as the dominant key, warm directional falloff, darker far side of the room and naturally soft contact shadows"
    },
    {
      value: "bedside-3000",
      label: "أباجورة جانبية محايدة دافئة — 3000K",
      text: "one visible 3000K bedside lamp as the dominant practical, believable warm skin rendering, soft inverse-square falloff and modest highlight bloom around the bulb only"
    },
    {
      value: "lamp-screen-mix",
      label: "أباجورة 3000K + شاشة هاتف خفيفة",
      text: "a visible 3000K bedside lamp as the key plus a weak 6200K phone-screen fill close to the face, mixed white balance preserved rather than corrected into studio-neutral light"
    },
    {
      value: "single-downlight-4000",
      label: "سبوت سقف واحد — 4000K",
      text: "one visible 4000K ceiling downlight as the source, a narrow downward cone with realistic shadow under brow, chin and furniture edges, no hidden frontal fill"
    },
    {
      value: "all-downlights-5000",
      label: "كل سبوتات السقف — 5000K",
      text: "the room's visible 5000K ceiling downlights switched on, broadly even but not flat illumination, believable multiple soft shadow directions matching the fixture layout and moderate phone-camera noise"
    },
    {
      value: "lamp-street-sodium",
      label: "أباجورة 2700K + صوديوم شارع — 2200K",
      text: "a 2700K bedside lamp as the indoor key plus weak 2200K sodium-vapor spill through the window, separate warm color pools and shadow directions kept physically consistent"
    },
    {
      value: "laptop-lamp",
      label: "لابتوب 6500K + أباجورة بعيدة",
      text: "a 6500K laptop screen as close cool fill while a distant visible 2700K bedside lamp remains the weak warm practical, screen light falling off quickly across the face and bedding"
    }
  ],
  day: [
    {
      value: "soft-window-6200",
      label: "ضوء نافذة ناعم — 6200K",
      text: "soft 6200K skylight from a large window as the dominant source, gradual directional falloff, open shadow detail and realistic bright-window clipping"
    },
    {
      value: "sheer-window-6000",
      label: "نافذة خلف ستارة شفافة — 6000K",
      text: "6000K daylight diffused by sheer curtains, broad soft wrap on the face and bedding, no artificial ring-light catchlight"
    },
    {
      value: "direct-sun-5200",
      label: "شمس مباشرة من النافذة — 5200K",
      text: "direct 5200K sun entering through the window, hard-edged light patches and deep shadows with realistic highlight clipping, no hidden fill light"
    },
    {
      value: "blinds-stripes-5200",
      label: "شمس عبر الشتر — 5200K",
      text: "5200K sunlight filtered by blinds, physically aligned light stripes over bedding and wall surfaces, shadow gaps and dust only where the bright beam supports visibility"
    },
    {
      value: "overcast-window-6500",
      label: "نهار غائم من النافذة — 6500K",
      text: "soft overcast 6500K window daylight, low-contrast directional illumination, realistic cool white balance and no invented sun shadow"
    },
    {
      value: "late-afternoon-4800",
      label: "شمس عصر دافئة — 4800K",
      text: "late-afternoon 4800K sunlight entering from a low window angle, longer shadows, warm highlights and naturally darker opposite corners of the room"
    },
    {
      value: "daylight-downlights",
      label: "ضوء نافذة + سبوتات 4000K",
      text: "window daylight as the dominant source plus visible 4000K ceiling downlights at a lower intensity, distinct but believable mixed white balance and fixture-supported shadow directions"
    },
    {
      value: "ceiling-only-4000",
      label: "سقف فقط مع ستائر مغلقة — 4000K",
      text: "visible 4000K ceiling downlights as the only source because curtains are closed, realistic indoor exposure and no daylight spill on the face or floor"
    }
  ]
};

export const HAIR_OPTIONS = [
  { value: "natural", label: "طبيعي مرتب", text: "the exact hairline and density from the reference, naturally arranged with small irregular flyaways" },
  { value: "bedhead", label: "مبعثر بعد النوم", text: "the exact hair density from the reference, lightly sleep-compressed with irregular bed-head direction and no invented hair volume" },
  { value: "sweaty", label: "رطب من التمرين", text: "the exact hair density from the reference, slightly damp and clumped only where sweat and gravity plausibly cause it" },
  { value: "wind", label: "تأثير هواء خفيف", text: "the exact hair density from the reference, subtly wind-affected in one consistent direction with no volumizing" },
  { value: "damp", label: "رطوبة خفيفة", text: "the exact hair density from the reference, lightly damp with natural strand grouping and visible scalp coverage unchanged" }
];

export const SKIN_OPTIONS = [
  { value: "neutral", label: "طبيعية", text: "natural skin moisture and oil balance, pores and local tone variation intact" },
  { value: "sweat-light", label: "تعرق خفيف", text: "a light, localized sweat sheen on forehead, temples and neck only where exertion and temperature support it" },
  { value: "warm-oil", label: "زيوت طبيعية خفيفة", text: "subtle natural oil reflection on high points of the face, without beautification or artificial gloss" },
  { value: "tired", label: "إرهاق بسيط", text: "natural mild tiredness around the eyes without aging, reshaping or smoothing the face" }
];

export const EXPRESSION_OPTIONS = [
  { value: "neutral", label: "هادئ ومحايد", text: "calm neutral expression, relaxed jaw and anatomically natural eyelids" },
  { value: "soft-smile", label: "ابتسامة خفيفة", text: "small natural smile with believable cheek and eye-muscle engagement" },
  { value: "serious", label: "جدي", text: "serious relaxed expression, no exaggerated tension or artificial symmetry" },
  { value: "focused", label: "مركز", text: "focused expression with a naturally engaged gaze and relaxed facial anatomy" }
];

export const COMPOSITION_OPTIONS = [
  { value: "close", label: "قريب للوجه", text: "close portrait framing, face dominant but not distorted beyond the selected camera geometry" },
  { value: "half", label: "نصف الجسم", text: "waist-up composition with shoulders, torso and clothing posture physically connected" },
  { value: "full", label: "كامل الجسم", text: "full-body composition, head and both feet visible, both feet firmly grounded with contact shadows" }
];

export const SELFIE_ANGLE_OPTIONS = [
  { value: "eye", label: "بمستوى العين", text: "front camera held at eye height with a slight natural hand roll" },
  { value: "high", label: "من أعلى قليلًا", text: "front camera held 10–20 degrees above eye level, within natural arm reach" },
  { value: "low", label: "من أسفل قليلًا", text: "front camera held 5–12 degrees below eye level, within natural arm reach and without impossible neck geometry" },
  { value: "three-quarter", label: "ثلاثة أرباع", text: "front camera held at a natural three-quarter arm angle, face rotation and near-field perspective kept consistent" }
];

export const MESSINESS_OPTIONS = [
  { value: "minimal", label: "خفيفة", text: "a small amount of believable lived-in disorder, kept secondary to the subject" },
  { value: "natural", label: "طبيعية", text: "natural everyday environmental disorder appropriate to the location, with objects resting on credible surfaces" },
  { value: "busy", label: "واضحة", text: "a visibly active but plausible environment, no random duplicated objects or obstructive clutter" }
];

export const CITIES = [
  { value: "riyadh", label: "الرياض", text: "Riyadh, Saudi Arabia" },
  { value: "jeddah", label: "جدة", text: "Jeddah, Saudi Arabia" },
  { value: "dammam", label: "الدمام", text: "Dammam, Saudi Arabia" },
  { value: "other", label: "مدينة سعودية أخرى", text: "Saudi Arabia" }
];

export const CAMERA = {
  standard: "Xiaomi 15 Ultra rear main camera, Leica Summilux 23mm-equivalent f/1.4, LYT-900 one-inch sensor, Leica Authentic color science, natural optical distortion, one camera and one lens only",
  selfie: "Xiaomi 15 Ultra front camera only, 23mm-equivalent f/2.0 perspective, Leica Authentic color treatment, phone held at a physically possible 40–70 cm arm reach, no floating camera, no impossible selfie geometry"
};

export const IDENTITY_LOCK = "SINGLE-REFERENCE IDENTITY LOCK: use only the exact person from the one attached reference image, preserve facial structure, feature spacing, age appearance, skin tone, natural asymmetry, hairline, beard pattern and visible hair density; if a feature is partly obscured in the reference, infer it conservatively only from the same image and do not substitute or invent another identity";

export const ANATOMY_AND_CAPTURE_LOCK = "one adult male only, athletic build at 195 cm and 88 kg, anatomically connected head, torso, arms, hands, legs and feet, five fingers on each visible hand, clothing and body contacts obey gravity and compression, reflections and mirrors follow correct geometry, captured not rendered";
