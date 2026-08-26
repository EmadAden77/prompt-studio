export const CAR_CLOSEUP_MASTER_LOCK = `CLOSE-UP FRONT LENS RULES — XIAOMI 15 ULTRA FRONT CAMERA
APPLIES ONLY WHEN A CLOSE-UP CAR TEMPLATE CU1–CU8 IS ACTIVE.
- Capture is a genuine subject-held Xiaomi 15 Ultra FRONT-camera selfie inside the parked cabin, using the front-wide optical model around 22–24mm equivalent and approximately f/2.0.
- Working distance is 25–45cm. Face occupies roughly 60–90% of frame height according to the selected CU template.
- Camera remains FRONTAL: the optical axis meets the face from a real hand-held position in front of the subject. Do not drift into profile, side-observer, passenger-held, dashboard-mounted, windshield, tripod, rear-camera, or exterior viewpoints.
- Near-field perspective is controlled: nose and central facial plane protrude mildly; ears and lateral head surfaces recede slightly. No fisheye and no global barrel warping of the cabin.
- Straight cabin lines such as A-pillar, window frame, headrest seams, steering-wheel rim, roof edge, and console remain structurally straight except for very subtle wide-lens bending at extreme image edges.
- At close range, resolve real phone-visible facial micro-detail: pores, beard micro-contrast, asymmetric peach fuzz, individual beard gaps, natural lip texture, and one or two irregular brow hairs where actually visible. No beauty filter, skin smoothing, pore stamping, fake hyper-detail, or cosmetic relighting.
- Background sits roughly 50–90cm behind the face where cabin geometry supports it and becomes only MILDLY softer through natural phone optics, focus, denoising, and distance. Never DSLR bokeh and never sharper/cleaner than the face.
- Eyes normally gaze INTO the front-camera lens. Rectangular screen-shaped catchlights may appear only when the actual screen luminance and selected lighting event physically support them; do not force identical catchlights if the scene geometry would not create them.
- Camera-side forearm may enter from a lower frame corner and appear modestly enlarged by near-field perspective. The elbow must be supported on a real console, armrest, thigh, or steering-wheel top according to the selected CU template. Wrist remains neutral and anatomically connected.
- Handheld capture evidence: allow about 2–4 degrees of natural roll, slight off-centering, face sharper than a moving edge-near forearm, and illumination-dependent shadow noise/compression in dark headliner/corners. These are physical capture traits, not decorative defects.
- Phone itself remains behind the front-camera optical center and is not directly visible. Do not duplicate the phone in mirrors or glass.
- Face, beard, hair, clothing, forearm, cabin, glass, and exterior use one exposure, one white balance, one HDR solution, one sharpening/denoising behavior, one compression pipeline, and one motion state.
- DRIVER-SEAT ANATOMY LOCK remains higher priority than close-up composition. If a close crop conflicts with seat-wheel-body anatomy, loosen the crop or reduce the angle rather than moving the wheel, seat, headrest, pelvis, knees, or shoulders.`;

export const CAR_CLOSEUP_LIGHTING = Object.freeze([
  {
    id: "N1",
    name_ar: "N1 — صوديوم + LED ليلي",
    timeId: "night",
    prompt: "N1 SODIUM + LED: parked at night under mixed warm sodium-like parking light and cooler white LED spill. Preserve a real warm/cool split, imperfect phone white balance, shadow noise, and localized practical-light reflections. No invisible fill."
  },
  {
    id: "N2",
    name_ar: "N2 — إضاءة واجهات محلات",
    timeId: "night",
    prompt: "N2 SHOP-FRONT SPILL: parked beside ordinary illuminated storefronts with no readable branding. Mixed colored practical spill may reach the side glass and one cheek, but the face remains governed by the same exposure as the cabin. No neon fantasy grade."
  },
  {
    id: "N3",
    name_ar: "N3 — محطة وقود ليلاً",
    timeId: "night",
    prompt: "N3 FUEL-STATION CANOPY: parked under a bright ordinary fuel-station canopy with cool/neutral overhead practicals, darker surroundings, hard local reflections on glass/trim, and realistic front-camera highlight clipping. No readable fuel-brand logos."
  },
  {
    id: "N4",
    name_ar: "N4 — شمس ظهر قاسية",
    timeId: "day",
    prompt: "N4 HARSH NOON: strong Saudi midday daylight through the real glass paths, high exterior contrast, bright window values, deeper cabin shade, and restrained phone HDR. No beauty fill and no cinematic golden warmth."
  },
  {
    id: "N5",
    name_ar: "N5 — غسق / بعد الغروب",
    timeId: "sunset",
    prompt: "N5 DUSK: low remaining cool sky mixed with sparse warm parking practicals. Keep natural exposure compromise, mild color-temperature imbalance, and no uniform blue/orange cinematic grade."
  },
  {
    id: "N6",
    name_ar: "N6 — موقف تحت الأرض",
    timeId: "night",
    prompt: "N6 UNDERGROUND PARKING: dim enclosed parking with localized ceiling practicals, concrete/column bounce, darker cabin corners, visible small-sensor noise, and restrained reflections on glass/trim. No studio-like face lighting."
  },
  {
    id: "D2",
    name_ar: "D2 — مظلة نهارية",
    timeId: "day",
    prompt: "D2 DAY CANOPY: parked beneath a real shade canopy in daylight. Use soft top/side ambient daylight from open sides, brighter exterior beyond the shade, cooler cabin shadows, and realistic front-camera exposure tradeoff."
  }
]);

export const CAR_CLOSEUP_TEMPLATES = Object.freeze([
  {
    id: "CU1",
    name_ar: "CU1 — قريب أمامي متوازن",
    prompt: `CU1 — FRONTAL BALANCED CLOSE-UP
- Seated in the real driver seat; phone directly in front of the face.
- Camera: frontal, eye level, 30–40cm; face about 70% of frame height.
- Show shoulders plus the real headrest; a small steering-wheel rim anchor may enter the lower frame where geometry permits.
- Camera-side elbow supported on the real console/armrest/thigh.
- Gaze into lens; natural head tilt about 3–5 degrees.
- Keep driver-seat, wheel-axis, headrest, pelvis, and knee direction physically solved before cropping.`
  },
  {
    id: "CU2",
    name_ar: "CU2 — قريب جدًا 80–90%",
    prompt: `CU2 — EXTREME FACE CLOSE-UP
- Camera frontal, 25–35cm; face occupies roughly 80–90% of frame height.
- Only a narrow slice of the real headrest/window/cabin may remain behind.
- Controlled near-field effect: nose mildly protrudes; ears recede slightly; no fisheye.
- Resolve beard micro-contrast, pores, natural skin variation, and physically supported screen catchlights.
- Elbow supported on thigh/console; wrist neutral. Do not crop so tightly that anatomy requires a floating shoulder or impossible arm.`
  },
  {
    id: "CU3",
    name_ar: "CU3 — قريب من أعلى",
    prompt: `CU3 — FRONTAL SLIGHT HIGH ANGLE
- Camera remains frontal but sits about 10–15 degrees above eye level, looking down, at 30–45cm.
- Face occupies roughly 65–75%; real headliner may enter the top edge.
- Chin tucks slightly; eyes look up into the lens.
- Camera-side arm is raised only as much as cabin clearance allows; elbow uses a real wheel-top/console support when physically reachable.
- If roof/A-pillar clearance conflicts, reduce the height rather than extending the arm unnaturally.`
  },
  {
    id: "CU4",
    name_ar: "CU4 — قريب من أسفل",
    prompt: `CU4 — FRONTAL LOW ANGLE
- Camera frontal at chin/lower-chest height looking upward about 10–20 degrees, 30–45cm from face.
- Face occupies roughly 65–75%; jaw/neck become more prominent by perspective, not reshaping.
- Real headliner may enter the top of frame.
- Camera-side elbow supported on thigh; phone points upward with neutral wrist.
- Mood may read confident/casual, but anatomy and identity remain unchanged.`
  },
  {
    id: "CU5",
    name_ar: "CU5 — قريب بميل كاجوال",
    prompt: `CU5 — FRONTAL DUTCH-ROLL CLOSE-UP
- Camera stays frontal to the face at 30–40cm with a natural 10–20 degree compositional roll only for this template.
- Face about 70% of frame; real A-pillar may form a diagonal background line.
- Camera-side elbow supported on the real door armrest/side support when reachable; shoulder stays relaxed.
- Do not turn the roll into body twist, horizon fantasy, or globally warped cabin geometry.`
  },
  {
    id: "CU6",
    name_ar: "CU6 — قريب مع يد على المقود",
    prompt: `CU6 — DRIVER-CONTEXT WHEEL ANCHOR CLOSE-UP
- Camera frontal, 30–40cm; face roughly 60–70% of frame height.
- Lower frame includes the RIGHT free hand resting/gripping lightly on the real steering wheel around the lower-left quadrant (approximately 8 o'clock when the reference wheel geometry supports it), with natural finger spread and zero steering effort.
- LEFT hand holds the selfie phone; left elbow supported on the real console.
- Wheel + free hand prove driver context inside the tight crop without displacing the wheel off the body axis.
- Gaze into lens.`
  },
  {
    id: "CU7",
    name_ar: "CU7 — قريب بضوء جانبي",
    prompt: `CU7 — SIDE-LIGHT FRONTAL CLOSE-UP
- Camera frontal, 30–40cm; face roughly 60–70%.
- Key light comes physically from the real side-window direction according to selected lighting preset, splitting the face naturally while the cabin behind may fall into deeper shadow.
- Preserve slight skin-tone/white-balance difference between lit and shadow sides when physically justified.
- One eye catchlight may be brighter than the other. Do not force symmetry.
- Camera-side elbow supported on the real window-side door armrest/side support if reachable; otherwise use console/thigh support without changing window state.`
  },
  {
    id: "CU8",
    name_ar: "CU8 — ثابت فوق المقود بيدين",
    prompt: `CU8 — TWO-HAND PHONE ABOVE WHEEL, PARKED ONLY
- Vehicle remains completely parked and stationary.
- Both forearms/elbows may lightly brace on the real steering-wheel top only if the solved seat-wheel geometry allows it.
- Both hands hold the phone just above the rim; the phone remains behind the front-camera optical center and is not directly visible.
- Camera frontal, 30–40cm; face about 70%; wheel rim and physically connected forearms may frame the lower edge.
- Zero arm stretch, no duplicate hands, no hand simultaneously gripping wheel and phone.
- This is the most stable handheld close-up of the set: face stays sharp; only tiny physiologically plausible micro-motion remains.
- Gaze into lens; relaxed expression.`
  }
]);

export const CAR_CLOSEUP_BY_ID = Object.freeze(Object.fromEntries(CAR_CLOSEUP_TEMPLATES.map((item) => [item.id, item])));
export const CAR_CLOSEUP_LIGHTING_BY_ID = Object.freeze(Object.fromEntries(CAR_CLOSEUP_LIGHTING.map((item) => [item.id, item])));
