export const APP_CONFIG = Object.freeze({
  name: "AI Selfie Prompt Studio",
  version: "2.0.0",
  storageKey: "ai-selfie-prompt-studio:smart-quad:v2",
  maxImageBytes: 12 * 1024 * 1024,
  acceptedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  defaultState: {
    mode: "smart",
    poseId: "lying_right_side",
    bodyDirection: "toward_lamp",
    cameraAngle: "eye_level",
    cameraDistance: "close",
    cameraType: "front",
    lensType: "front_wide",
    expressionId: "relaxed",
    hairId: "same",
    clothingId: "pajamas",
    lightingId: "lamp_and_phone",
    roomMode: "GENERATE",
    selectedSceneId: "bed_right_nightstand",
    sceneOverrideId: null,
    theme: "system"
  }
});

export const UI_LABELS = Object.freeze({
  bodyDirections: {
    toward_lamp: "باتجاه الأباجورة",
    toward_vanity: "باتجاه التسريحة",
    toward_ceiling: "باتجاه السقف",
    facing_right: "باتجاه اليمين",
    facing_left: "باتجاه اليسار",
    facing_mirror: "أمام المرآة",
    toward_sofa: "باتجاه الأريكة",
    facing_wardrobe: "باتجاه الدولاب",
    side_to_wardrobe: "بجانب الدولاب",
    facing_room: "باتجاه الغرفة"
  },
  cameraAngles: {
    high_angle: "من أعلى",
    eye_level: "مستوى العين",
    low_angle: "من أسفل"
  },
  cameraDistances: {
    close: "قريبة",
    medium: "متوسطة",
    wide: "واسعة"
  },
  roomModes: {
    EDIT: "تعديل موضعي — ثبات صورة المكان",
    GENERATE: "توليد — زاوية جديدة لنفس المكان"
  }
});
