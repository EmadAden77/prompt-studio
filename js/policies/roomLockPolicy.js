export const ROOM_LOCK_POLICIES = Object.freeze({
  EDIT: {
    name: "EDIT MODE",
    principle: "IMAGE B is the immutable base photograph. Modify only the subject mask and its physically necessary contact and light-interaction zone.",
    allowed: [
      "subject pixels occupying previously visible background space",
      "contact shadows and ambient occlusion directly caused by the subject",
      "mattress, pillow, or cushion compression under body weight",
      "local fabric displacement directly under or touching the body",
      "physically coherent illumination from the selected light source"
    ],
    forbidden: [
      "moving, scaling, rotating, mirroring, cleaning, or replacing furniture",
      "changing room dimensions, crop, projection, horizon, or vanishing points",
      "adding furniture or inventing hidden room geometry",
      "changing wall, ceiling, or floor colors and materials",
      "moving doors, windows, fixtures, clutter, cables, bottles, or shoes",
      "removing or redesigning curtains, mirrors, air conditioning, or fixed objects"
    ]
  },
  GENERATE: {
    name: "GENERATE MODE",
    principle: "Render a new viewpoint of the same physical room while preserving its known three-dimensional continuity.",
    allowed: [
      "a physically reachable new camera position in the same room",
      "natural occlusion or cropping caused by the new viewpoint",
      "view-dependent reflections that remain geometrically consistent"
    ],
    forbidden: [
      "moving furniture to improve composition",
      "inventing hidden details unsupported by a reference",
      "changing floor plan, ceiling height, furniture identity, scale, location, or orientation",
      "cleaning or redesigning the room",
      "revealing impossible sides of fixed objects"
    ]
  }
});
