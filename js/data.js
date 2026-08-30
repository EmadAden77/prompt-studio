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
  "athletic male, 183 cm, 82 kg"
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
  selfie: "Xiaomi 15 Ultra front camera only, 23mm-equivalent f/2.0 perspective, Leica Authentic color treatment, phone held at a physically possible 45–70 cm arm reach, no floating camera, no impossible selfie geometry"
};

export const IDENTITY_LOCK = "SINGLE-REFERENCE IDENTITY LOCK: use only the exact person from the one attached reference image, preserve facial structure, feature spacing, age appearance, skin tone, natural asymmetry, hairline, beard pattern and visible hair density; if a feature is partly obscured in the reference, infer it conservatively only from the same image and do not substitute or invent another identity";

export const ANATOMY_AND_CAPTURE_LOCK = "one adult male only, athletic build at 183 cm and 82 kg, anatomically connected head, torso, arms, hands, legs and feet, five fingers on each visible hand, clothing and body contacts obey gravity and compression, reflections and mirrors follow correct geometry, captured not rendered";
