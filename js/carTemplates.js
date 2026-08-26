export const CAR_REFERENCE = Object.freeze({
  id: "car_interior_1000206938",
  name_ar: "مرجع السيارة — مقعد السائق",
  image_url: "scenes/car_interior_1000206938.svg",
  image_filename: "1000206938.jpg",
  region: "driver_seat",
  country: "Saudi Arabia"
});

export const CAR_TIME_OPTIONS = Object.freeze([
  {
    id: "day",
    name_ar: "نهار",
    prompt: "DAYTIME: bright but ordinary Saudi daylight enters through the windshield, side glass, and sunroof. Keep realistic phone auto-exposure tradeoffs between the face and the brighter exterior.",
    parking: "a stationary shaded or open-air parking area in Saudi Arabia beside an unbranded modern building, with plausible parking bays and dry daylight"
  },
  {
    id: "afternoon",
    name_ar: "بعد الظهر",
    prompt: "AFTERNOON: slightly warmer directional daylight with harder exterior contrast and natural reflections on glass and trim. Do not add studio fill.",
    parking: "a stationary Saudi outdoor or covered parking area in late-afternoon light, with ordinary parked vehicles only when naturally visible"
  },
  {
    id: "sunset",
    name_ar: "غروب",
    prompt: "SUNSET: low warm exterior light may enter from one real window direction, producing a believable warm/cool imbalance and restrained highlight clipping. No cinematic orange grade.",
    parking: "a stationary Saudi mall, hotel, or restaurant parking area at sunset, with warm sky spill and no active-road motion"
  },
  {
    id: "evening",
    name_ar: "مساء",
    prompt: "EVENING: exterior daylight has mostly faded. Use mixed parking-area practical light and remaining cool ambient sky with imperfect phone white balance.",
    parking: "a stationary Saudi parking area during blue hour or early evening, with believable overhead or façade practical lighting and no readable branding"
  },
  {
    id: "night",
    name_ar: "ليل",
    prompt: "NIGHT: use realistic low-light front-camera behavior, higher sensor gain, visible restrained shadow noise, modest highlight clipping, and mixed parking-light color. No hidden beauty fill.",
    parking: "a stationary Saudi mall, hotel, office, or restaurant parking area at night, with practical parking lights and dark surroundings"
  },
  {
    id: "late_night",
    name_ar: "ليل متأخر",
    prompt: "LATE NIGHT: darker exterior parking context, sparse practical lights, more visible sensor noise in shadows, and limited dynamic range. Keep the face naturally exposed rather than perfectly relit.",
    parking: "a quiet stationary Saudi parking area late at night, with sparse practical illumination, parked vehicles at rest, and no road-travel cues"
  }
]);

export const CAR_TEMPLATE_PRESETS = Object.freeze([
  {
    id: "car_driver_relaxed",
    name_ar: "السائق — جلسة طبيعية",
    pose: "Sit naturally in the real driver seat with pelvis and upper thighs fully supported by the seat cushion, back lightly contacting the seatback, shoulders relaxed and asymmetric. The free hand rests naturally on the thigh or center armrest.",
    camera: "Natural eye-level front-camera selfie, medium framing from roughly chest upward, keeping the steering wheel, driver seat, and part of the center console readable."
  },
  {
    id: "car_driver_wheel_rest",
    name_ar: "السائق — يد على المقود",
    pose: "Remain seated in the parked driver seat. The non-camera hand rests lightly on a real visible part of the steering wheel with relaxed fingers and no steering effort. The car is OFF the roadway and stationary.",
    camera: "Eye-level front-camera selfie with medium framing; steering wheel contact remains anatomically plausible and secondary to the face."
  },
  {
    id: "car_driver_console_rest",
    name_ar: "السائق — ارتكاز على الكونسول",
    pose: "Sit back naturally with the free forearm or hand resting on the real center armrest/console only where the reference physically supports contact. Keep shoulders slightly uneven and legs naturally positioned in the footwell.",
    camera: "Medium front-camera selfie with a mild diagonal composition that keeps the driver seat and center console recognizable."
  },
  {
    id: "car_driver_side_glance",
    name_ar: "السائق — نظرة جانبية هادئة",
    pose: "Keep the body supported by the driver seat while turning the head only slightly toward the side window or windshield, with the eyes returning naturally toward the phone. No fashion-pose neck twist.",
    camera: "Eye-level or very slightly high front-camera selfie, medium-close framing with one side window and part of the steering area visible."
  },
  {
    id: "car_driver_close",
    name_ar: "السائق — سيلفي قريب",
    pose: "Sit normally in the driver seat with the torso supported and free hand relaxed out of visual competition with the face.",
    camera: "Close Xiaomi front-camera framing focused on face and shoulders while retaining enough seat, pillar, window, or steering-wheel edge to prove the same car interior."
  },
  {
    id: "car_driver_high_angle",
    name_ar: "السائق — زاوية عالية خفيفة",
    pose: "Remain fully seated and supported. Chin stays natural and shoulders remain relaxed; do not stretch the torso upward toward the camera.",
    camera: "Hold the front camera modestly above eye level within natural reach, angled down slightly. The sunroof/roof geometry may become more readable without distorting the face or interior."
  },
  {
    id: "car_driver_low_angle",
    name_ar: "السائق — زاوية منخفضة خفيفة",
    pose: "Remain seated against the real driver seat with natural posture and no exaggerated chest lift.",
    camera: "Hold the Xiaomi front camera modestly below eye level within reachable distance, angled upward slightly. Keep distortion restrained and preserve steering wheel, dashboard, and roof geometry."
  },
  {
    id: "car_driver_sunroof",
    name_ar: "السائق — فتحة السقف ظاهرة",
    pose: "Sit naturally in the driver seat while keeping the head clear of the roof and sunroof boundary. The free hand rests on thigh, console, or steering wheel as physically supported.",
    camera: "Compose the selfie so the real sunroof occupies a meaningful upper-background area while the face remains primary. Never enlarge, reshape, open, close, or replace the sunroof."
  },
  {
    id: "car_driver_pre_exit",
    name_ar: "السائق — قبل النزول",
    pose: "Stay seated but rotate the torso only slightly toward the driver-side door as if preparing to leave. Keep the door in exactly the reference state; do not open it or change any interior component.",
    camera: "Medium front-camera selfie with a subtle diagonal body line, still clearly captured from the seated driver position."
  },
  {
    id: "car_driver_candid_pause",
    name_ar: "السائق — لقطة عفوية متوقفة",
    pose: "Sit in a relaxed paused moment after parking, with ordinary posture, slight shoulder asymmetry, and the free hand naturally resting rather than performing a gesture.",
    camera: "Natural medium front-camera snapshot with tiny handheld imperfection, no staged observer viewpoint, and the camera-holding arm fully outside crop."
  }
]);

export const CAR_TEMPLATE_BY_ID = Object.freeze(Object.fromEntries(CAR_TEMPLATE_PRESETS.map((item) => [item.id, item])));
export const CAR_TIME_BY_ID = Object.freeze(Object.fromEntries(CAR_TIME_OPTIONS.map((item) => [item.id, item])));

export function getActiveCarTemplate() {
  if (typeof document === "undefined") return null;
  return CAR_TEMPLATE_BY_ID[document.documentElement.dataset.activeCarTemplate] ?? null;
}

export function getActiveCarTime() {
  if (typeof document === "undefined") return CAR_TIME_BY_ID.day;
  return CAR_TIME_BY_ID[document.documentElement.dataset.activeCarTime] ?? CAR_TIME_BY_ID.day;
}
