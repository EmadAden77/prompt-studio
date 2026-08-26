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

const BASE_CAR_TEMPLATE_PRESETS = Object.freeze([
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

export const DRIVER_SELFIE_POSES = Object.freeze([
  {
    id: "driver_classic",
    name_ar: "سيلفي سائق كلاسيكي",
    name_en: "Classic Driver Selfie",
    category: "car",
    physics_description: "Sitting in the immutable driver seat with the back supported by the existing backrest. The non-camera right hand rests naturally on the steering wheel around the lower-left quadrant when physically reachable. The left hand holds the phone at normal selfie distance, but the entire camera-holding arm and phone remain outside the crop.",
    physics: {
      weight_distribution: "pelvis and upper thighs supported by the existing seat cushion; back supported by the existing seatback",
      seat_compression: "subtle body-weight compression only; never change seat geometry or recline",
      seatbelt: "use only if already present and physically compatible with IMAGE B or explicitly requested; never invent or reposition it",
      spine: "natural lumbar curve with only a slight reachable lean toward the phone"
    },
    arm_strategy: {
      holding_hand: "left",
      position: "35-50cm from face, eye level to about 10cm above",
      support: "left elbow may be supported on the real door armrest or center console outside the crop when reachable",
      other_arm: "right hand may rest lightly on steering wheel with relaxed fingers",
      critical_rules: "Camera-holding arm is solved physically outside crop; no floating elbow, no overextension, no limb erasure, no arm crossing the steering wheel."
    },
    camera_geometry: {
      angle: "eye level to slightly above, about 5-10 degrees downward",
      distance: "35-50cm",
      focal_length: "22-24mm equivalent",
      aperture: "f/2.0",
      frame_composition: "face primary, with steering wheel/dashboard and windshield context still readable"
    },
    pose: "Classic parked-driver selfie. Keep the back supported by the real seat and the non-camera right hand relaxed on a physically reachable part of the steering wheel. Do not force a seatbelt unless the reference supports it. The camera-holding side remains completely outside crop.",
    camera: "Xiaomi 15 Ultra front-camera selfie at 35-50cm, eye level to slightly high, with ordinary near-field perspective and no visible camera arm or phone.",
    surfaces: ["car_seat", "steering_wheel", "door_armrest", "center_console"],
    requires: "car_interior",
    selfie_type: "front_camera",
    anti_distortion: {
      max_elbow_angle: 120,
      min_elbow_angle: 90,
      elbow_must_be_supported: true,
      phone_height_range: "eye level to 10cm above",
      forbidden: ["overextended arm", "floating elbow", "arm through steering wheel", "impossible wrist angle", "visible camera-holding arm"]
    }
  },
  {
    id: "driver_low_angle",
    name_ar: "سيلفي سائق من الأسفل",
    name_en: "Driver Low Angle Selfie",
    category: "car",
    physics_description: "Sitting fully supported in the driver seat while the phone is held lower, around chest level, and tilted upward. The chin lowers slightly toward the lens; the camera-holding elbow is supported on a real surface outside the crop when physically reachable.",
    physics: {
      weight_distribution: "pelvis, upper thighs, and back supported by the existing seat",
      seat_compression: "subtle natural compression only",
      neck: "slight downward inclination toward the lower phone position",
      shoulders: "relaxed; any apparent width comes from perspective rather than body reshaping"
    },
    arm_strategy: {
      holding_hand: "left",
      position: "40-60cm from face at lower-chest level, camera pointing upward roughly 20-30 degrees",
      support: "left elbow supported on thigh or center console outside crop when reachable",
      other_arm: "right hand may rest on thigh or steering wheel",
      critical_rules: "Phone remains below eye level but within natural reach; no impossible low reach, no floating elbow, and no visible camera arm."
    },
    camera_geometry: {
      angle: "low angle looking upward about 20-30 degrees",
      distance: "40-60cm",
      focal_length: "22-24mm equivalent",
      aperture: "f/2.0",
      frame_composition: "jaw/chin slightly more prominent, with roof/headliner geometry visible above"
    },
    pose: "Remain seated and fully supported. Use a restrained low-angle selfie with the phone below eye level. Keep neck, jaw, shoulders, and dashboard perspective physically believable.",
    camera: "Xiaomi 15 Ultra front camera at 40-60cm, modest low angle only, with the complete camera-holding arm outside the finished crop.",
    surfaces: ["car_seat", "center_console", "thigh"],
    requires: "car_interior",
    selfie_type: "front_camera",
    anti_distortion: {
      max_elbow_angle: 130,
      min_elbow_angle: 80,
      elbow_must_be_supported: true,
      phone_height_range: "lower chest to chest level",
      forbidden: ["arm reaching impossibly low", "elbow through seat", "wrist bent backward", "visible camera-holding arm"]
    }
  },
  {
    id: "driver_high_angle",
    name_ar: "سيلفي سائق من الأعلى",
    name_en: "Driver High Angle Selfie",
    category: "car",
    physics_description: "Sitting in the immutable driver seat while the phone is held higher than eye level within natural reach. The holding-side shoulder may rise slightly, but the entire holding arm remains outside crop; the arm must never intersect the headliner or A-pillar.",
    physics: {
      weight_distribution: "pelvis and back remain supported by the real seat",
      seat_compression: "subtle natural compression only",
      neck: "eyes and head angle upward modestly toward the phone",
      holding_shoulder: "slightly elevated only as needed for a reachable high selfie"
    },
    arm_strategy: {
      holding_hand: "left",
      position: "about 50-65cm from face and above eye level, never beyond the roof boundary",
      support: "unsupported high reach is permitted because the arm extends upward, but remains anatomically connected and entirely outside crop",
      other_arm: "right hand rests on thigh or a physically reachable steering-wheel area",
      critical_rules: "No extreme overhead stretch, no shoulder dislocation, no arm through headliner/A-pillar, and no visible holding arm."
    },
    camera_geometry: {
      angle: "high angle looking downward about 15-25 degrees",
      distance: "50-65cm",
      focal_length: "22-24mm equivalent",
      aperture: "f/2.0",
      frame_composition: "face remains primary while dashboard/steering wheel can become more visible below"
    },
    pose: "Remain seated and supported while looking slightly upward toward a modestly high phone position. Preserve normal neck and shoulder anatomy and immutable roof geometry.",
    camera: "Xiaomi 15 Ultra front camera at a reachable high angle, 50-65cm away, with no visible camera arm or phone.",
    surfaces: ["car_seat", "steering_wheel"],
    requires: "car_interior",
    selfie_type: "front_camera",
    anti_distortion: {
      max_elbow_angle: 170,
      min_elbow_angle: 145,
      elbow_must_be_supported: false,
      phone_height_range: "above eye level but below the real headliner boundary",
      forbidden: ["arm through headliner", "impossible shoulder angle", "arm passing through A-pillar", "visible camera-holding arm"]
    }
  },
  {
    id: "driver_side_angle",
    name_ar: "سيلفي سائق من الجانب",
    name_en: "Driver Side Angle Selfie",
    category: "car",
    physics_description: "The pelvis stays planted in the driver seat while the torso rotates only about 20-35 degrees toward the passenger side. The phone approaches from a side-biased but still reachable front-camera position; the holding arm remains outside crop.",
    physics: {
      weight_distribution: "pelvis remains supported; only a mild asymmetric load shift is allowed",
      torso_rotation: "20-35 degrees toward passenger side, without twisting the pelvis out of the seat",
      seat_compression: "slightly asymmetric but subtle"
    },
    arm_strategy: {
      holding_hand: "left",
      position: "40-55cm from face at a side-biased eye-level position",
      support: "left elbow may use center console or door armrest outside crop if reachable",
      other_arm: "right arm rests on steering wheel, thigh, or center console",
      critical_rules: "Phone comes from a reachable side-biased angle; do not twist the torso excessively and do not show the holding arm."
    },
    camera_geometry: {
      angle: "roughly 25-40 degrees off frontal at eye level",
      distance: "40-55cm",
      focal_length: "22-24mm equivalent",
      aperture: "f/2.0",
      frame_composition: "three-quarter face view with passenger-seat/side-window context where geometry permits"
    },
    pose: "Use a mild three-quarter seated turn toward the passenger side while keeping the pelvis planted and the back partly supported by the real seat.",
    camera: "Reachable side-biased Xiaomi front-camera selfie at 40-55cm; no observer viewpoint and no visible holding arm.",
    surfaces: ["car_seat", "center_console", "steering_wheel"],
    requires: "car_interior",
    selfie_type: "front_camera",
    anti_distortion: {
      max_elbow_angle: 130,
      min_elbow_angle: 90,
      elbow_must_be_supported: true,
      phone_height_range: "eye level",
      forbidden: ["arm through steering wheel", "arm through body", "impossible torso twist", "visible camera-holding arm"]
    }
  },
  {
    id: "driver_mirror_check",
    name_ar: "سيلفي سائق يتفقد المرآة",
    name_en: "Driver Checking Mirror Selfie",
    category: "car",
    physics_description: "The subject remains seated and stationary, turning the head modestly toward the real rearview mirror while the phone captures the moment from a lower reachable front-camera position. The body does not simulate driving.",
    physics: {
      weight_distribution: "pelvis and back remain supported by the real seat",
      head_rotation: "about 25-35 degrees toward the real rearview mirror",
      neck: "natural visible rotation only; no exaggerated muscle tension"
    },
    arm_strategy: {
      holding_hand: "left",
      position: "35-50cm from face, around chest to lower-eye level",
      support: "left elbow supported on door armrest or center console outside crop if reachable",
      other_arm: "right hand may rest lightly on steering wheel or thigh",
      critical_rules: "Gaze can favor the real mirror rather than the phone; the vehicle remains parked and the holding arm remains outside crop."
    },
    camera_geometry: {
      angle: "eye level to slightly low",
      distance: "35-50cm",
      focal_length: "22-24mm equivalent",
      aperture: "f/2.0",
      frame_composition: "three-quarter/profile face with the real rearview mirror visible only if the reference/viewpoint supports it"
    },
    pose: "Turn the head modestly toward the real rearview mirror while staying relaxed in the parked driver seat. Do not create a driving action or invent mirror geometry.",
    camera: "Xiaomi 15 Ultra front-camera selfie from chest-to-eye level, 35-50cm, with the camera-holding arm outside crop.",
    surfaces: ["car_seat", "steering_wheel", "center_console"],
    requires: "car_interior",
    selfie_type: "front_camera",
    anti_distortion: {
      max_elbow_angle: 120,
      min_elbow_angle: 90,
      elbow_must_be_supported: true,
      phone_height_range: "chest to eye level",
      forbidden: ["neck twisted impossibly", "head detached from body", "arm through headrest", "visible camera-holding arm"]
    }
  },
  {
    id: "driver_window_lean",
    name_ar: "سيلفي سائق متكئ ناحية النافذة",
    name_en: "Driver Window-Side Lean Selfie",
    category: "car",
    physics_description: "The subject leans slightly toward the driver-side door/window area while preserving the exact window state from IMAGE B. The free left forearm may rest on the real door armrest or window ledge only if that surface exists; the right hand holds the phone outside crop.",
    physics: {
      weight_distribution: "pelvis remains on seat with a slight lateral load toward the door side",
      window_contact: "free forearm may contact only a real door/window support surface; never pass through glass",
      spine: "small lateral lean only"
    },
    arm_strategy: {
      holding_hand: "right",
      position: "35-50cm from face at eye level",
      support: "right elbow may rest on center console or thigh outside crop",
      other_arm: "left forearm may rest on the existing door armrest/window ledge if physically present",
      critical_rules: "Do not open, close, lower, or raise the window. Preserve reference state exactly. No arm through glass and no visible camera-holding arm."
    },
    camera_geometry: {
      angle: "eye level with a slight natural roll",
      distance: "35-50cm",
      focal_length: "22-24mm equivalent",
      aperture: "f/2.0",
      frame_composition: "face with driver-side window/door context, while exterior remains visible only through the actual reference glass state"
    },
    pose: "Lean mildly toward the driver-side door/window area using only real support surfaces. Keep the window exactly as in IMAGE B and never invent an open-window state.",
    camera: "Xiaomi 15 Ultra front-camera selfie at 35-50cm with a mild natural roll; camera hand and phone remain outside crop.",
    surfaces: ["car_seat", "door_armrest", "window_ledge", "center_console", "thigh"],
    requires: "car_interior",
    selfie_type: "front_camera",
    anti_distortion: {
      max_elbow_angle: 120,
      min_elbow_angle: 90,
      elbow_must_be_supported: true,
      phone_height_range: "eye level",
      forbidden: ["arm through window glass", "impossible lean angle", "floating forearm", "changed window state", "visible camera-holding arm"]
    }
  },
  {
    id: "driver_two_hand_wheel",
    name_ar: "سيلفي سائق — المقود بارز",
    name_en: "Driver Steering-Wheel Focus Selfie",
    category: "car",
    legacy_requested_name_ar: "سيلفي سائق بيدين على المقود",
    corrected_for_handheld_selfie: true,
    physics_description: "A true handheld front-camera selfie cannot have both hands on the steering wheel at the same instant. Preserve physical truth: the camera-holding hand stays outside crop while the visible non-camera hand rests on the real steering wheel. The framing makes the wheel prominent without inventing a mounted phone.",
    physics: {
      weight_distribution: "pelvis and back supported by the seat",
      arm_position: "one visible non-camera arm may extend to the steering wheel; camera arm remains outside crop",
      phone_position: "subject-held at reachable selfie distance only; never mounted"
    },
    arm_strategy: {
      holding_hand: "left",
      position: "35-50cm from face at eye level",
      support: "holding elbow solved naturally outside crop; may use door armrest if reachable",
      other_arm: "right hand rests on the steering wheel with relaxed grip",
      critical_rules: "Never place both hands on the wheel while also claiming a handheld selfie. No mounted phone, floating phone, or third-person camera."
    },
    camera_geometry: {
      angle: "eye level",
      distance: "35-50cm",
      focal_length: "22-24mm equivalent",
      aperture: "f/2.0",
      frame_composition: "face primary with steering wheel intentionally more prominent in the lower frame"
    },
    pose: "Keep the vehicle parked. Make the steering wheel visually prominent while only the non-camera hand rests on it. The camera hand remains outside crop and continues to hold the phone physically.",
    camera: "True handheld Xiaomi 15 Ultra front-camera selfie at 35-50cm; no dashboard mount, no passenger photographer, and no visible phone/holding arm.",
    surfaces: ["car_seat", "steering_wheel", "door_armrest"],
    requires: "car_interior",
    selfie_type: "front_camera",
    anti_distortion: {
      max_elbow_angle: 130,
      min_elbow_angle: 90,
      elbow_must_be_supported: false,
      phone_height_range: "eye level",
      forbidden: ["floating phone", "mounted phone", "both hands on wheel during handheld selfie", "impossible grip", "visible camera-holding arm"]
    }
  },
  {
    id: "driver_relaxed_recline",
    name_ar: "سيلفي سائق مسترخي بالمقعد المرجع",
    name_en: "Driver Relaxed Seatback Selfie",
    category: "car",
    physics_description: "The subject relaxes into the exact existing seatback angle from IMAGE B. Do not recline, rotate, resize, or otherwise alter the seat. Head may rest lightly against the existing headrest while the phone remains at a reachable front-camera position outside crop.",
    physics: {
      weight_distribution: "body load distributed along the existing seat cushion and seatback",
      seat_recline: "must remain exactly as shown in IMAGE B; no 15-20 degree adjustment",
      head_contact: "light contact with the existing headrest if physically reachable"
    },
    arm_strategy: {
      holding_hand: "left",
      position: "40-55cm from face around upper-chest to eye level",
      support: "left elbow may rest on door armrest or center console outside crop",
      other_arm: "right arm rests on thigh, console, or steering wheel",
      critical_rules: "Relax the body, not the seat mechanism. No seat-state change, floating elbow, or visible camera-holding arm."
    },
    camera_geometry: {
      angle: "slightly high to eye level, looking down only modestly",
      distance: "40-55cm",
      focal_length: "22-24mm equivalent",
      aperture: "f/2.0",
      frame_composition: "relaxed face/upper torso with existing headrest, steering-wheel edge, and headliner context"
    },
    pose: "Relax naturally against the exact seatback/headrest configuration in IMAGE B. Do not change seat recline or headrest position.",
    camera: "Reachable Xiaomi 15 Ultra front-camera selfie at 40-55cm, with the camera-holding arm and phone completely outside crop.",
    surfaces: ["car_seat", "headrest", "center_console", "door_armrest"],
    requires: "car_interior",
    selfie_type: "front_camera",
    anti_distortion: {
      max_elbow_angle: 130,
      min_elbow_angle: 90,
      elbow_must_be_supported: true,
      phone_height_range: "upper chest to eye level",
      forbidden: ["changed seat recline", "arm through headrest", "floating elbow", "visible camera-holding arm"]
    }
  }
]);

export const CAR_TEMPLATE_PRESETS = Object.freeze([
  ...BASE_CAR_TEMPLATE_PRESETS,
  ...DRIVER_SELFIE_POSES
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
