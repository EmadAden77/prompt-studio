export const QUAD_POSE_IDS = Object.freeze([
  "lying_back",
  "lying_stomach",
  "lying_right_side",
  "lying_left_side",
  "semi_reclining",
  "sitting_bed_edge",
  "mirror_selfie"
]);

export const QUAD_EXPRESSION_IDS = Object.freeze([
  "neutral",
  "smile",
  "serious",
  "relaxed",
  "confident"
]);

export const BED_SPATIAL_MAP = Object.freeze({
  frame_rule: "LEFT and RIGHT are always defined from the subject's own body while lying on his back with his head on the pillow, never from the rendered image or camera view.",
  head_direction: "toward the padded headboard and pillow zone",
  foot_direction: "away from the padded headboard toward the foot of the mattress",
  person_right_side: "lamp-side bed region",
  person_left_side: "vanity-side bed region",
  lamp_side: "RIGHT",
  vanity_side: "LEFT",
  window_daylight: "daylight access is supported by the wider room references; exact body-relative window side is not asserted by the mapper unless visible in the selected IMAGE B",
  pillows: "pillows remain in the head-of-bed zone exactly as recorded by the selected reference",
  image_b_camera_rule: "the selected scene metadata defines the reference camera region; generated selfies may move only to a physically reachable new camera point in the same room",
  ambiguity_rule: "never invent a cropped or unverified room element; omit it from the prompt unless the selected reference or scene metadata supports it"
});

export const QUAD_POSE_ENGINEERING = Object.freeze({
  lying_back: {
    roomMode: "GENERATE",
    bodyDirection: "toward_ceiling",
    cameraType: "front",
    lensType: "front_wide",
    cameraAngle: "high_angle",
    cameraDistance: "medium",
    preferredSceneId: "bed_front_overview",
    orientation: "His back is down on the mattress, head in the pillow zone, face directed upward toward the phone.",
    cameraFine: "Place the phone above the face at a steep top-down angle of approximately 75–85 degrees, about 60–80 cm from the face, with the optical axis centered toward the eyes.",
    armFine: "His RIGHT hand holds the phone above the face within normal shoulder reach. The LEFT arm rests naturally on the mattress or torso. If showing the full holding arm or phone would distort anatomy, keep the phone, hand, and most of that arm outside frame while preserving a physically believable shoulder and elbow path.",
    physicsFine: "Distribute weight across the back, shoulder blades, pelvis, and posterior legs. Compress the pillow locally under the head by a shallow believable amount and let contact-side hair spread and flatten naturally.",
    selfieViewpoint: {
      holdingHand: "RIGHT",
      otherHand: "LEFT",
      distance: "60–80 cm",
      angle: "steep top-down 75–85 degrees directly above the face",
      tilt: "minimal handheld roll only",
      armVisual: "The RIGHT selfie arm follows a believable upward reach from the shoulder; crop most of it if edge stretching would become anatomically distracting."
    }
  },
  lying_stomach: {
    roomMode: "GENERATE",
    bodyDirection: "toward_lamp",
    cameraType: "front",
    lensType: "front_wide",
    cameraAngle: "eye_level",
    cameraDistance: "close",
    preferredSceneId: "bed_right_nightstand",
    orientation: "His torso faces the mattress while his head turns comfortably toward the phone and the lamp-side room context.",
    cameraFine: "Keep the front camera very low near mattress level, approximately 30–40 cm from the face, looking slightly upward by about 15–20 degrees without dropping below the real mattress boundary.",
    armFine: "His RIGHT hand holds the phone close to the face while the LEFT elbow remains visibly supported by the mattress. The supporting elbow must carry real load and neither forearm may intersect the chest or bedding unnaturally.",
    physicsFine: "Load the chest, abdomen, pelvis, and thighs into the mattress with a natural lumbar curve. Any raised upper torso must be explained by planted elbows and visible mattress compression.",
    selfieViewpoint: {
      holdingHand: "RIGHT",
      otherHand: "LEFT",
      distance: "30–40 cm",
      angle: "very low near mattress level, looking upward approximately 15–20 degrees toward the face",
      tilt: "small natural handheld roll only",
      armVisual: "The RIGHT holding forearm approaches the camera from a reachable low position; keep most of the phone and hand behind the camera plane."
    }
  },
  lying_right_side: {
    roomMode: "GENERATE",
    bodyDirection: "toward_lamp",
    cameraType: "front",
    lensType: "front_wide",
    cameraAngle: "eye_level",
    cameraDistance: "close",
    preferredSceneId: "bed_right_nightstand",
    orientation: "His RIGHT shoulder, RIGHT ribcage, and RIGHT hip are down; he is oriented toward the real LAMP SIDE from the spatial map.",
    cameraFine: "Use an intimate close selfie with a clockwise Dutch tilt of approximately 25–35 degrees, about 35–45 cm from the face, while keeping the optical axis reachable from the upper arm.",
    armFine: "His upper LEFT hand is the selfie hand and the LEFT elbow stays supported on the mattress. His lower RIGHT arm rests forward near the torso or partly under the pillow and must never penetrate the ribcage or disappear through the body.",
    physicsFine: "Carry weight through the RIGHT shoulder, RIGHT ribcage, RIGHT hip, head, and right-side legs. Compress the pillow under the head and right-side hair and create local mattress compression under the shoulder and hip.",
    selfieViewpoint: {
      holdingHand: "LEFT",
      otherHand: "RIGHT",
      distance: "35–45 cm",
      angle: "eye-level intimate side-lying selfie",
      tilt: "clockwise Dutch tilt of 25–35 degrees",
      armVisual: "The upper LEFT selfie arm visibly originates at the LEFT shoulder and extends toward a near frame corner with only mild near-field wide-angle stretch."
    }
  },
  lying_left_side: {
    roomMode: "GENERATE",
    bodyDirection: "toward_vanity",
    cameraType: "front",
    lensType: "front_wide",
    cameraAngle: "eye_level",
    cameraDistance: "close",
    preferredSceneId: "bed_left_vanity",
    orientation: "His LEFT shoulder, LEFT ribcage, and LEFT hip are down; he is oriented toward the real VANITY SIDE from the spatial map.",
    cameraFine: "Use an intimate close selfie with the Dutch tilt mirrored relative to the right-side pose, approximately 25–35 degrees, about 30–40 cm from the face.",
    armFine: "His upper RIGHT hand is the selfie hand with the RIGHT elbow supported on the mattress. His lower LEFT arm remains in front of the torso or partly under the pillow and must never penetrate the body.",
    physicsFine: "Carry weight through the LEFT shoulder, LEFT ribcage, LEFT hip, head, and left-side legs. Compress the pillow and mattress locally on the loaded side and flatten only the contact-side hair.",
    selfieViewpoint: {
      holdingHand: "RIGHT",
      otherHand: "LEFT",
      distance: "30–40 cm",
      angle: "eye-level intimate side-lying selfie",
      tilt: "counterclockwise Dutch tilt of 25–35 degrees",
      armVisual: "The upper RIGHT selfie arm visibly originates at the RIGHT shoulder and extends toward a near frame corner with only mild near-field wide-angle stretch."
    }
  },
  semi_reclining: {
    roomMode: "GENERATE",
    bodyDirection: "toward_lamp",
    cameraType: "front",
    lensType: "front_wide",
    cameraAngle: "low_angle",
    cameraDistance: "close",
    preferredSceneId: "bed_right_nightstand",
    orientation: "His pelvis stays on the mattress while the torso reclines against real pillows or the headboard at approximately 45–60 degrees.",
    cameraFine: "Hold the phone around chest level and point it upward toward the face by approximately 30–45 degrees, within normal arm reach.",
    armFine: "His RIGHT hand holds the phone at chest level; the shoulder remains seated naturally and the elbow may rest lightly on bedding if needed. Do not enlarge the arm or shoulder to manufacture the low angle.",
    physicsFine: "Support the back broadly against the actual pillows or headboard, keep the pelvis and legs loaded by the mattress, and maintain a natural neck-to-spine line.",
    selfieViewpoint: {
      holdingHand: "RIGHT",
      otherHand: "LEFT",
      distance: "35–50 cm",
      angle: "from chest level pointing upward approximately 30–45 degrees toward the face",
      tilt: "small natural handheld roll only",
      armVisual: "The RIGHT holding arm rises from chest level within normal reach; do not enlarge the shoulder or forearm to force the low angle."
    }
  },
  sitting_bed_edge: {
    roomMode: "GENERATE",
    bodyDirection: "facing_room",
    cameraType: "front",
    lensType: "front_wide",
    cameraAngle: "eye_level",
    cameraDistance: "medium",
    preferredSceneId: "bed_front_overview",
    orientation: "His pelvis and upper thighs stay on the actual mattress edge while the torso faces into the room.",
    cameraFine: "Use eye level or very slightly below eye level, approximately 50–60 cm from the face, with the optical axis kept within normal arm reach.",
    armFine: "His RIGHT hand holds the phone near face level. The holding shoulder advances only slightly; the LEFT arm rests naturally on the thigh, mattress, or beside the torso.",
    physicsFine: "Load the pelvis and upper thighs into the mattress edge, producing a shallow local compression of roughly 4–6 cm where physically plausible; feet rest naturally on the floor when reachable.",
    selfieViewpoint: {
      holdingHand: "RIGHT",
      otherHand: "LEFT",
      distance: "50–60 cm",
      angle: "eye level or very slightly below eye level",
      tilt: "small natural handheld roll only",
      armVisual: "The RIGHT selfie arm extends naturally from the shoulder toward the camera without creating a long-arm perspective exaggeration."
    }
  },
  mirror_selfie: {
    roomMode: "GENERATE",
    bodyDirection: "facing_mirror",
    cameraType: "rear",
    lensType: "rear_standard",
    cameraAngle: "eye_level",
    cameraDistance: "medium",
    preferredSceneId: "vanity_mirror",
    orientation: "He stands inside the real vanity-mirror field of view and faces the mirror directly.",
    cameraFine: "Use the rear main camera toward the mirror at natural chest-to-face height. Reflection scale, phone occlusion, gaze, and handedness must follow one consistent mirror ray path.",
    armFine: "The phone is visible in the reflection in a normal grip. This is a mirror selfie, not a front-camera selfie; do not create a second camera-facing arm.",
    physicsFine: "Both feet carry weight naturally on the floor with small shoulder asymmetry and no unsupported lean."
  }
});

export const QUAD_DEFAULTS = Object.freeze({
  clothingId: "pajamas",
  mode: "smart",
  sceneOverrideId: null
});
