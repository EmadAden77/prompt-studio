const freeze = (value) => Object.freeze(value);

const template = (id, group, name_ar, poseId, expressionId, hairId, clothingId, lightingId, sceneId, promptBlock, extras = {}) => freeze({
  id,
  group,
  name_ar,
  poseId,
  expressionId,
  hairId,
  clothingId,
  lightingId,
  sceneId,
  aspect: "9:16",
  promptBlock,
  ...extras
});

const BASE_CAPTURE = `BEDROOM V2 TEMPLATE — REFERENCE-ANCHORED CAPTURE
- IMAGE A is identity authority only. The selected ROOM REFERENCES are the exact bedroom authority.
- This template may change only pose, subject location, reachable selfie viewpoint, selected clothing, expression muscle state, hair arrangement, and illumination.
- Do not rebuild the bedroom. Use only visible/reasonably reprojectable geometry from the selected ROOM REFERENCES. Unsupported background must be cropped, occluded, dark, or omitted.
- Keep the result ordinary and incidental: slight framing imbalance, mild handheld roll, natural asymmetry, ordinary phone sharpening/noise/compression, no beauty treatment, no cinematic staging, no synthetic perfection.
- Background identity is proved by a few correct landmarks, never by widening the frame or inventing unseen geometry.
- Camera-holding arm remains outside crop; selfie evidence comes from reachable near-field perspective, gaze, shoulder asymmetry, and room perspective.
- If template composition conflicts with identity or room continuity, preserve identity and room and simplify the composition.`;

const bedClose = (pose, support, background, camera) => `${BASE_CAPTURE}
TEMPLATE FAMILY: BED CLOSE SELFIE
POSE: ${pose}
SUPPORT: ${support}
BACKGROUND WINDOW: ${background}
CAMERA: ${camera}
ANTI-SYNTHETIC GATE: no whole-bed view, no remote observer view, no generic hotel-room reconstruction, no perfect centered portrait, no excessive background detail. Keep only the reference-supported near-bed landmarks required by this crop.`;

const roomSelfie = (pose, grounding, background, camera) => `${BASE_CAPTURE}
TEMPLATE FAMILY: ROOM SELFIE
POSE: ${pose}
GROUNDING: ${grounding}
BACKGROUND WINDOW: ${background}
CAMERA: ${camera}
ANTI-SYNTHETIC GATE: avoid showroom-clean room, perfect symmetry, impossible wall reveal, repeated clutter, invented furniture, or wide architectural hero shot. This is an ordinary personal phone photo inside the same lived-in bedroom.`;

export const BEDROOM_TEMPLATE_GROUPS = freeze({
  bed: freeze({ icon: "🛏️", title: "السرير" }),
  sitting: freeze({ icon: "🪑", title: "الجلوس" }),
  standing: freeze({ icon: "🧍", title: "الوقوف" })
});

export const BEDROOM_TEMPLATES_V2 = freeze([
  template(
    "bed_v2_right_close",
    "bed",
    "استلقاء على الجانب الأيمن — قريب طبيعي",
    "lying_right_side",
    "relaxed",
    "same",
    "cotton_pajama",
    "lamp_only",
    "room_bed_side",
    bedClose(
      "Lie fully on the RIGHT side with the right cheek/ear supported by the real pillow; shoulder, ribcage and hip remain stacked and loaded into the mattress.",
      "Pillow compresses locally beneath the head; mattress compresses beneath right shoulder/ribcage/hip; lower right arm rests naturally without torso penetration.",
      "Use ROOM-R2 + ROOM-R3 only: pillow, grey bedding, exact black padded headboard and the real bedside zone when physically visible. Never reveal a newly invented room sector.",
      "Front-camera phone 45–60 cm from face, slightly above eye line, mild 10–20° yaw. Face about 45–58% of frame height. Head + shoulders + upper torso only."
    )
  ),
  template(
    "bed_v2_back_close",
    "bed",
    "استلقاء على الظهر — سيلفي وسادة",
    "lying_back",
    "relaxed",
    "same",
    "cotton_pajama",
    "lamp_and_phone",
    "room_bed_front",
    bedClose(
      "Lie flat on the real mattress with the back supported and head resting naturally on the pillow; shoulders are not lifted into a seated pose.",
      "Head produces local pillow depression; upper back and pelvis load the mattress; bedding wrinkles radiate from real pressure points.",
      "Use ROOM-R3 + ROOM-R2 only. Background stays close: pillow, grey bedding, exact padded headboard, and only a physically reachable slice of bedside area. Do not show the entire room or invent the wall behind the phone.",
      "Front camera 45–65 cm from face, near eye level or 5–15° above, small casual roll. Face about 42–55% of frame height."
    )
  ),
  template(
    "bed_v2_semi_headboard",
    "bed",
    "نصف استلقاء على السرير — عفوي",
    "semi_reclining",
    "relaxed",
    "same",
    "thermal_sleep",
    "ceiling_warm",
    "room_bed_side",
    bedClose(
      "Semi-recline only if the real pillow/headboard geometry supports the upper back. Pelvis remains on mattress; torso rises naturally from bedding support, never floating upright.",
      "Back/pillow contact, mattress loading and clothing compression must visibly support the posture.",
      "Use ROOM-R2 + ROOM-R3 only. Keep black padded headboard, pillow and grey bedding as the dominant room identifiers. Add bedside geometry only when visible from the reachable phone endpoint.",
      "Front camera 50–65 cm from face at eye line, modest downward pitch. Crop around head to mid-torso. No knees, feet, whole bed, or across-room view."
    )
  ),
  template(
    "bed_v2_edge_candid",
    "sitting",
    "جلوس على حافة السرير — لقطة يومية",
    "sitting_bed_edge",
    "relaxed",
    "same",
    "heather_tee_jeans",
    "ceiling_white",
    "room_bed_front",
    roomSelfie(
      "Sit on the actual mattress edge with pelvis fully supported; torso slightly forward or neutral, shoulders naturally uneven, free hand resting on thigh or mattress.",
      "Mattress edge compresses under pelvis; both feet contact the real floor when included; knees remain anatomically ordinary and are not forced into frame.",
      "Use ROOM-R3 + ROOM-R1. Show a close, correct constellation of bed edge + black headboard + bedside area. Wardrobe/dresser may remain secondary only when the crop naturally reaches them. No full-room proof shot.",
      "Front camera 50–65 cm from face, eye level, medium-close crop from head to waist or upper thighs only if naturally reachable."
    )
  ),
  template(
    "bed_v2_floor_rug",
    "sitting",
    "جلوس على السجادة — عفوي",
    "sitting_floor",
    "relaxed",
    "messy",
    "hoodie_sweats",
    "ceiling_white",
    "room_master_overview",
    roomSelfie(
      "Sit naturally on the real rug/floor area visible in ROOM-R1, knees comfortably bent without yoga-like posing or staged symmetry.",
      "Pelvis and legs carry real floor contact; clothing bunches at hips/knees; contact shadows remain attached to rug/floor.",
      "Use ROOM-R1 + ROOM-R4 only. Keep rug/floor plus correctly positioned bed/sofa landmarks that fall inside the reachable crop. Do not invent any additional furniture.",
      "Front camera 50–70 cm from face, slightly above eye level, modest downward pitch. Upper body dominant; floor context visible but not a room-wide shot."
    )
  ),
  template(
    "bed_v2_bedside_stand",
    "standing",
    "وقوف بجانب السرير — سيلفي بسيط",
    "standing_bedside",
    "relaxed",
    "same",
    "heather_tee_jeans",
    "ceiling_white",
    "room_master_overview",
    roomSelfie(
      "Stand on the real floor beside the bed with a small natural weight shift. Free hand may rest lightly on the mattress edge only if the crop supports the contact.",
      "Both feet remain grounded off-frame or partially visible as composition permits; no floating stance and no leaning that requires invented support.",
      "Use ROOM-R1 + ROOM-R3. Keep bed/headboard and bedside area as the principal background landmarks. Wardrobe may appear only in its true relative direction. Preserve clutter rather than cleaning it.",
      "Front camera 45–60 cm from face, eye level. Crop head to lower torso. Do not widen to show full body or the entire room."
    )
  ),
  template(
    "bed_v2_center_stand",
    "standing",
    "وقوف وسط الغرفة — لقطة هاتف عادية",
    "standing_center",
    "relaxed",
    "same",
    "longsleeve_chino",
    "ceiling_white",
    "room_master_overview",
    roomSelfie(
      "Stand in the real central walking/rug zone with ordinary contrapposto, shoulders slightly uneven, free hand relaxed or in pocket.",
      "Feet remain on the real floor/rug and body scale stays consistent with bed, wardrobe, sofa and dresser.",
      "Use ROOM-R1 only. Background may include bed, sofa, wardrobe and dresser only in their exact recorded relationships and only as a medium-close phone crop.",
      "Front camera 45–60 cm from face, eye level. Head to mid-thigh at most; avoid architectural wide-angle composition and excessive ceiling/floor."
    )
  ),
  template(
    "bed_v2_wardrobe_pause",
    "standing",
    "عند الدولاب — وقفة طبيعية",
    "standing_wardrobe",
    "relaxed",
    "same",
    "heather_tee_jeans",
    "ceiling_white",
    "room_wardrobe_dresser",
    roomSelfie(
      "Stand on the real floor beside the existing wardrobe. Do not open, close, touch or move a door unless that exact door state/edge is clearly supported by ROOM-R5.",
      "Natural standing weight shift only; free hand stays down or in pocket to avoid invented handles and hand-object errors.",
      "Use ROOM-R5 + ROOM-R1. Wardrobe mirrored panels and dresser are the principal room identifiers. Their spacing, verticals and relative positions must match the references. Bed may appear only as a distant partial edge if geometrically valid.",
      "Front camera 45–60 cm from face, eye level, head-to-waist crop. Avoid mirror-selfie logic and avoid showing unsupported reflected room sectors."
    )
  ),
  template(
    "bed_v2_dresser_pause",
    "standing",
    "عند التسريحة — وقفة عفوية",
    "standing_vanity",
    "relaxed",
    "same",
    "heather_tee_jeans",
    "ceiling_white",
    "room_dresser_mirror",
    roomSelfie(
      "Stand on the real floor near the dresser/vanity area without leaning on or touching small objects. Keep hands simple to reduce object-interaction hallucination.",
      "Natural stance, real floor contact, relaxed torso rotation no more than about 15–20 degrees.",
      "Use ROOM-R6 + ROOM-R5 only. Preserve the exact dresser, mirror frame, drawer geometry, top clutter, adjacent wardrobe and physically valid reflection. Do not invent cosmetics, lamps, stools or decorative objects.",
      "Front camera 45–60 cm from face, eye level, medium-close head-to-waist crop. Reflective surfaces remain geometrically conservative."
    )
  )
]);

export const BEDROOM_TEMPLATE_BY_ID = freeze(Object.fromEntries(BEDROOM_TEMPLATES_V2.map((item) => [item.id, item])));
