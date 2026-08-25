export const CAMERA_SPECS = Object.freeze({
  front: {
    id: "front",
    name_ar: "أمامية — سيلفي",
    name_en: "Xiaomi 15 Ultra front-facing camera",
    type: "front",
    capture: "true handheld front-camera selfie",
    focal_length: "approximately 23–24 mm full-frame equivalent",
    aperture: "approximately f/2.0",
    sensor: "typical small front-camera phone sensor",
    dof: "natural phone depth of field with no synthetic portrait blur",
    distortion: "mild near-field wide-angle perspective, strongest only at frame edges",
    distance: "typically 45–70 cm from the face within natural arm reach; 70–90 cm only when the solved shoulder, elbow, forearm, and wrist geometry physically justify an extended-arm reach",
    selfie: true
  },
  rear: {
    id: "rear",
    name_ar: "خلفية — تصوير خارجي",
    name_en: "Xiaomi 15 Ultra rear camera",
    type: "rear",
    capture: "photo made by another person or a stable tripod",
    focal_length: "selected rear-lens focal length",
    aperture: "lens-appropriate aperture",
    sensor: "rear phone-camera sensor",
    dof: "optically plausible phone-camera depth of field",
    distortion: "lens-appropriate perspective without artificial warping",
    distance: "camera-to-subject distance determined by framing and selected lens",
    selfie: false
  }
});

export const LENSES = Object.freeze([
  {
    id: "front_wide",
    camera: "front",
    name_ar: "عدسة السيلفي الأصلية",
    name_en: "built-in front wide lens",
    focal_length: "23–24 mm equivalent"
  },
  {
    id: "rear_standard",
    camera: "rear",
    name_ar: "الخلفية الرئيسية",
    name_en: "rear main camera",
    focal_length: "approximately 23 mm equivalent"
  },
  {
    id: "rear_portrait",
    camera: "rear",
    name_ar: "الخلفية 70 مم",
    name_en: "rear short telephoto camera",
    focal_length: "approximately 70 mm equivalent"
  }
]);

export const SELFIE_ARM_STRATEGIES = Object.freeze({
  standing: "The holding shoulder advances slightly and the elbow remains gently bent; the phone stays at face level or slightly above within natural reach.",
  sitting: "The holding arm extends within natural reach from a supported seated torso, with the shoulder and elbow aligned to the phone position.",
  lying_back: "The phone is held above the face within reachable distance; the optical axis points toward the face and the shoulder remains seated in its socket.",
  lying_stomach: "Use the arm that can extend forward or diagonally without intersecting the mattress, torso, head, or pillow; any supporting elbow must visibly carry real load.",
  lying_right_side: "The upper LEFT hand is preferred as the selfie hand; the lower right arm remains anatomically separate from the torso and bedding.",
  lying_left_side: "The upper RIGHT hand is preferred as the selfie hand; the lower left arm remains anatomically separate from the torso and bedding.",
  semi_reclining: "The holding arm extends from the supported torso through one continuous shoulder-to-wrist chain, with the phone remaining within natural reach.",
  mirror: "The phone is visible in the mirror at chest or face level, with correct reflected handedness, grip, occlusion, and gaze direction.",
  rear_camera: "No arm reaches toward the lens. Both arms rest naturally or interact with a real support because the rear-camera photograph is made by another person or a tripod."
});
