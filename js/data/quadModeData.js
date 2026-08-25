export const QUAD_POSE_IDS = Object.freeze([
  "lying_back",
  "lying_stomach",
  "lying_right_side",
  "lying_left_side",
  "semi_reclining",
  "sitting_bed_edge",
  "mirror_selfie"
]);

export const BED_REALISM_POSE_IDS = Object.freeze([
  "lying_back",
  "lying_stomach",
  "lying_right_side",
  "lying_left_side",
  "semi_reclining"
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
  image_b_camera_rule: "IMAGE B is scene-geometry authority rather than an immutable external camera plate for true handheld selfies. The virtual camera moves only to the physically reachable phone endpoint while the room itself remains fixed.",
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
    orientation: "His back is down on the mattress, head supported by the pillow zone, and the face turns only as far as the neck and upper torso can support naturally.",
    cameraFine: "Place the front camera slightly above the face at a physically reachable arm endpoint, approximately 45–75 cm from the face, with about 15–35 degrees of downward pitch and no more than about 20 degrees of yaw to either side.",
    armFine: "Resolve the selfie arm deterministically from the reachable shoulder arc; use the RIGHT hand when both sides are equally feasible. The other arm rests naturally on the mattress or torso. Keep the phone and most of the forearm outside frame if showing them would create distortion.",
    physicsFine: "Distribute weight across the back of the head or pillow-supported head, upper back, shoulder blades, pelvis, and posterior thighs as the leg position requires. Mattress and pillow compression must follow those load points.",
    bedRealismProfile: {
      supportSide: "back",
      loadPoints: ["occiput", "upper_back", "shoulder_blades", "pelvis"],
      preferredSelfieArm: "AUTO",
      resolvedSelfieArm: "RIGHT",
      cameraDistanceCm: [45, 75],
      cameraPitchDeg: [15, 35],
      cameraYawDeg: [-20, 20],
      headSupport: "pillow",
      requiredSurface: "bed"
    },
    selfieViewpoint: {
      holdingHand: "RIGHT",
      otherHand: "LEFT",
      distance: "45–75 cm",
      angle: "slightly above the face with approximately 15–35 degrees of downward pitch and yaw kept within about 20 degrees either side",
      tilt: "small casual handheld roll only",
      armVisual: "The RIGHT selfie arm follows a continuous reachable chain from shoulder to elbow to wrist; crop most of it if edge stretching would become anatomically distracting."
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
    orientation: "His chest and abdomen face the mattress while the neck turns only within a plausible range toward the reachable phone position.",
    cameraFine: "Place the front camera at a reachable forward or diagonal endpoint of the selfie arm, typically 45–70 cm from the face, near or slightly above eye level, with roughly 5–25 degrees of downward pitch and 10–35 degrees of yaw as anatomy allows.",
    armFine: "Use the arm that can extend forward or diagonally without intersecting the mattress, torso, head, or pillow. A supporting elbow may bear part of the upper-body load only if it remains visibly planted and anatomically comfortable.",
    physicsFine: "Load the chest, abdomen, pelvis, and thighs into the mattress. Preserve a plausible neck turn, natural lumbar curve, and local mattress compression under the real load points.",
    bedRealismProfile: {
      supportSide: "front",
      loadPoints: ["chest", "abdomen", "pelvis", "thighs"],
      preferredSelfieArm: "AUTO",
      resolvedSelfieArm: "RIGHT",
      cameraDistanceCm: [45, 70],
      cameraPitchDeg: [5, 25],
      cameraYawDeg: [10, 35],
      headSupport: "optional_pillow",
      requiredSurface: "bed"
    },
    selfieViewpoint: {
      holdingHand: "RIGHT",
      otherHand: "LEFT",
      distance: "45–70 cm",
      angle: "a reachable forward or diagonal front-camera position near or slightly above eye level, with about 5–25 degrees downward pitch and 10–35 degrees yaw",
      tilt: "small natural handheld roll only",
      armVisual: "The RIGHT holding arm follows a continuous shoulder-to-elbow-to-wrist path toward the camera; never hide an impossible elbow inside the mattress or torso."
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
    cameraFine: "Use the upper LEFT arm as the selfie arm. Place the front camera at its physically reachable endpoint, approximately 45–70 cm from the face, with about 5–20 degrees of downward pitch and 10–30 degrees of yaw toward the face.",
    armFine: "His upper LEFT hand is the selfie hand and the LEFT elbow remains anatomically plausible relative to the mattress. His lower RIGHT arm rests forward near the torso or partly under the pillow and never penetrates the ribcage.",
    physicsFine: "Carry weight through the RIGHT shoulder, RIGHT ribcage, RIGHT hip, and right-side thigh as supported. Preserve realistic pillow compression, lower-shoulder compression, neck angle, and local mattress deformation.",
    bedRealismProfile: {
      supportSide: "right",
      loadPoints: ["right_shoulder", "right_ribcage", "right_hip", "right_thigh"],
      preferredSelfieArm: "LEFT",
      resolvedSelfieArm: "LEFT",
      cameraDistanceCm: [45, 70],
      cameraPitchDeg: [5, 20],
      cameraYawDeg: [10, 30],
      headSupport: "pillow",
      requiredSurface: "bed"
    },
    selfieViewpoint: {
      holdingHand: "LEFT",
      otherHand: "RIGHT",
      distance: "45–70 cm",
      angle: "a reachable side-lying front-camera position with approximately 5–20 degrees of downward pitch and 10–30 degrees of yaw toward the face",
      tilt: "small casual handheld roll only; do not impose a fixed roll angle",
      armVisual: "The upper LEFT selfie arm visibly originates from the LEFT shoulder and extends toward the camera with only mild near-field wide-angle stretch."
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
    cameraFine: "Use the upper RIGHT arm as the selfie arm. Place the front camera at its physically reachable endpoint, approximately 45–70 cm from the face, with about 5–20 degrees of downward pitch and 10–30 degrees of yaw toward the face.",
    armFine: "His upper RIGHT hand is the selfie hand and the RIGHT elbow remains anatomically plausible relative to the mattress. His lower LEFT arm stays in front of the torso or partly under the pillow and never penetrates the body.",
    physicsFine: "Carry weight through the LEFT shoulder, LEFT ribcage, LEFT hip, and left-side thigh as supported. Preserve pillow compression, lower-shoulder compression, realistic neck angle, and local mattress deformation.",
    bedRealismProfile: {
      supportSide: "left",
      loadPoints: ["left_shoulder", "left_ribcage", "left_hip", "left_thigh"],
      preferredSelfieArm: "RIGHT",
      resolvedSelfieArm: "RIGHT",
      cameraDistanceCm: [45, 70],
      cameraPitchDeg: [5, 20],
      cameraYawDeg: [10, 30],
      headSupport: "pillow",
      requiredSurface: "bed"
    },
    selfieViewpoint: {
      holdingHand: "RIGHT",
      otherHand: "LEFT",
      distance: "45–70 cm",
      angle: "a reachable side-lying front-camera position with approximately 5–20 degrees of downward pitch and 10–30 degrees of yaw toward the face",
      tilt: "small casual handheld roll only; do not impose a fixed roll angle",
      armVisual: "The upper RIGHT selfie arm visibly originates from the RIGHT shoulder and extends toward the camera with only mild near-field wide-angle stretch."
    }
  },
  semi_reclining: {
    roomMode: "GENERATE",
    bodyDirection: "toward_lamp",
    cameraType: "front",
    lensType: "front_wide",
    cameraAngle: "eye_level",
    cameraDistance: "close",
    preferredSceneId: "bed_right_nightstand",
    orientation: "His pelvis stays on the mattress while the back and shoulders are partially supported by real pillows or the headboard; torso angle follows the actual support thickness rather than a fixed theatrical pose.",
    cameraFine: "Use a reachable front-camera position typically 45–70 cm from the face, near or slightly above eye level, with about 5–25 degrees of downward pitch and 10–35 degrees of yaw as the supported torso angle allows.",
    armFine: "Use the RIGHT hand when both arms are equally feasible. Keep the shoulder, elbow, forearm, wrist, and unseen phone on one continuous reachable chain; the other arm rests naturally on bedding or torso.",
    physicsFine: "Load the pelvis, lower back, upper back, and shoulders according to the real pillow or headboard support. Keep the head, neck, shoulder line, and upper thoracic spine physically connected.",
    bedRealismProfile: {
      supportSide: "reclined_back",
      loadPoints: ["pelvis", "lower_back", "upper_back", "shoulders"],
      preferredSelfieArm: "AUTO",
      resolvedSelfieArm: "RIGHT",
      cameraDistanceCm: [45, 70],
      cameraPitchDeg: [5, 25],
      cameraYawDeg: [10, 35],
      headSupport: "pillows_or_headboard",
      requiredSurface: "bed"
    },
    selfieViewpoint: {
      holdingHand: "RIGHT",
      otherHand: "LEFT",
      distance: "45–70 cm",
      angle: "a reachable front-camera position near or slightly above eye level, with about 5–25 degrees downward pitch and 10–35 degrees yaw",
      tilt: "small natural handheld roll only",
      armVisual: "The RIGHT selfie arm stays within normal reach and preserves a continuous shoulder-to-wrist path without enlarging the shoulder or forearm."
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
  clothingId: "cotton_pajama",
  mode: "smart",
  sceneOverrideId: null
});
