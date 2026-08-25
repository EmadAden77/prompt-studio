/**
 * Engine-only constants. These values are injected into the final prompt and
 * are intentionally never rendered as editable UI fields.
 */
export const FIXED_DATA = Object.freeze({
  person: Object.freeze({
    gender: "male",
    ethnicity: "Middle Eastern",
    age: 35,
    height_cm: 183,
    weight_kg: 82,
    build: "lightly athletic",
    description: "Middle Eastern man, 35 years old, 183 cm tall, 82 kg, with a lightly athletic build"
  }),
  room: Object.freeze({
    type: "bedroom",
    description: "Standard bedroom"
  })
});

export const IMAGE_A_AUTHORITY = Object.freeze({
  controls: [
    "face shape and head structure",
    "eye shape, size, spacing, eyelids, and eyebrows",
    "nose shape and size",
    "mouth and lip shape",
    "jawline and chin",
    "ear shape and position",
    "skin color and natural texture",
    "apparent age and natural facial asymmetry",
    "hairline, hair density, and wave pattern",
    "beard growth pattern and natural gaps"
  ],
  doesNotControl: [
    "pose or body position",
    "facial expression",
    "clothing",
    "background",
    "lighting",
    "camera angle or distance"
  ]
});

export const IMAGE_B_AUTHORITY = Object.freeze({
  controls: [
    "room shape and dimensions",
    "walls, ceiling, and floor",
    "perspective and vanishing points in EDIT mode",
    "all visible furniture, fixtures, textiles, and mirrors",
    "visible shoes, bottles, cables, and small objects",
    "colors, materials, clutter, arrangement, doors, and windows"
  ],
  doesNotControl: [
    "person identity",
    "person pose or expression",
    "person clothing",
    "selected added lighting",
    "camera settings"
  ]
});
