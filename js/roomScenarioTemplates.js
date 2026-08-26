export const IMMUTABLE_ROOM_SCENARIO_LOCK = `IMMUTABLE ROOM LOCK — ABSOLUTE PRIORITY
IMAGE B is immutable environment geometry and appearance.
- Do not move, remove, add, clean, rearrange, mirror, resize, recolor, replace, redesign, open, close, fold, unfold, tidy, or otherwise alter any furniture, clutter, wardrobe door state, wardrobe contents, bed state, pillows, blanket, curtains, doors, mirrors, fixtures, wall details, floor objects, cables, bottles, shoes, materials, or visible room contents.
- Preserve the exact same object count, object positions, orientations, scale, spacing, visible clutter, surface state, and room layout from IMAGE B.
- A scenario may change ONLY the subject, his physically supported pose, one explicitly allowed handheld clothing item, and the explicitly selected body/clothing state.
- If a requested action would require changing the room, wardrobe door state, furniture, or stored contents, keep the room unchanged and adapt the subject action instead. IMAGE B wins every such conflict.`;

const scenario = (id, group, name_ar, poseId, lightingIds, promptBlock, extras = {}) => Object.freeze({
  id, group, name_ar, poseId, lightingIds, promptBlock, ...extras
});

export const CLOTHING_PREP_TEMPLATES = Object.freeze([
  scenario("prep_wardrobe_hold_shirt", "clothing_prep", "أمام الدولاب — يمسك قميصًا", "standing_wardrobe", ["ceiling_white", "ceiling_warm", "phone_screen_only"], `CLOTHING PREPARATION SCENARIO — HOLDING ONE SHIRT
The subject stands naturally in front of the unchanged wardrobe and holds one ordinary real shirt in the non-phone hand as if considering whether to wear it. The shirt is a handheld prop only; do not imply it came from a newly opened wardrobe section. Preserve the wardrobe door state and every visible room detail exactly as IMAGE B.`),
  scenario("prep_wardrobe_choose", "clothing_prep", "أمام الدولاب — يختار ملابسه", "standing_wardrobe", ["ceiling_white", "ceiling_warm"], `CLOTHING PREPARATION SCENARIO — CHOOSING CLOTHES
The subject stands at the wardrobe in a natural deciding posture, visually comparing or considering clothing without changing any wardrobe door, shelf, hanger, drawer, or visible stored item. If no open wardrobe interior is visible in IMAGE B, he simply looks toward the existing wardrobe surface while holding at most one separate shirt in the non-phone hand. Never invent an open door or new wardrobe contents.`),
  scenario("prep_wardrobe_look_inside", "clothing_prep", "أمام الدولاب — ينظر للجزء الظاهر", "standing_wardrobe", ["ceiling_white", "ceiling_warm"], `CLOTHING PREPARATION SCENARIO — LOOKING TOWARD WARDROBE
The subject turns his gaze and upper torso toward the wardrobe as if checking his clothing options. He may look into an interior section ONLY if that exact section is already visibly open in IMAGE B. Otherwise he looks at the closed wardrobe without touching or opening it. The wardrobe state is immutable.`),
  scenario("prep_wardrobe_shirt_against_torso", "clothing_prep", "أمام الدولاب — يقيس القميص بصريًا", "standing_wardrobe", ["ceiling_white", "ceiling_warm", "window_daylight"], `CLOTHING PREPARATION SCENARIO — VISUAL SHIRT CHECK
The subject holds one shirt lightly against the front of his torso with the non-phone hand as a quick visual check, without actually changing clothes. Keep the shirt physically separate where appropriate, preserve realistic cloth gravity and hand contact, and leave the wardrobe and room untouched.`),
  scenario("prep_wardrobe_side_glance", "clothing_prep", "أمام الدولاب — نظرة جانبية أثناء الاختيار", "standing_wardrobe", ["ceiling_white", "ceiling_warm", "phone_screen_only"], `CLOTHING PREPARATION SCENARIO — SIDE GLANCE
The subject remains grounded in the wardrobe zone, body mildly angled toward the wardrobe while his eyes return toward the selfie camera. One optional shirt may hang naturally from the non-phone hand. No wardrobe interaction may alter IMAGE B.`)
]);

const POST_SHOWER_BODY_LOCK = `POST-SHOWER BODY & TOWEL LOCK — STRICT
- The adult male subject wears ONLY one opaque bath towel securely wrapped around the waist, from the hip line to around the knees or upper shins depending on crop. No shirt, undershirt, trousers, underwear, robe, or second towel is visible.
- The towel must behave as real medium-weight cotton terry: believable thickness, soft pile, gravity-driven folds, overlap at the waist, slight compression where tucked, and no painted-on fabric.
- Keep the result non-explicit and ordinary. The towel fully covers the pelvis and buttocks at all times.
- Show only a small, naturally distributed amount of chest hair, subtle and anatomically plausible for the same adult male identity. It should be sparse-to-light, irregular, and integrated with real skin texture, never dense, stylized, symmetrical, painted, or exaggerated.
- Slight post-shower skin moisture may appear only as restrained, physically plausible micro-sheen on shoulders/upper chest where the selected light supports it. No dripping water, glamour oil, or artificial body enhancement.`;

export const POST_SHOWER_TEMPLATES = Object.freeze([
  scenario("shower_center_towel", "post_shower", "بعد الاستحمام — وسط الغرفة", "standing_center", ["ceiling_white", "ceiling_warm", "window_daylight"], `POST-SHOWER SCENARIO — CENTER ROOM
${POST_SHOWER_BODY_LOCK}
Stand naturally on the real floor in the room center. The room itself remains exactly unchanged.` , { forcedClothingId: "bath_towel_only" }),
  scenario("shower_wardrobe_towel", "post_shower", "بعد الاستحمام — أمام الدولاب", "standing_wardrobe", ["ceiling_white", "ceiling_warm"], `POST-SHOWER SCENARIO — WARDROBE
${POST_SHOWER_BODY_LOCK}
Stand naturally in front of the wardrobe as if about to get dressed, but do not open, close, touch, or alter any wardrobe door or visible contents. Preserve IMAGE B exactly.` , { forcedClothingId: "bath_towel_only" }),
  scenario("shower_vanity_towel", "post_shower", "بعد الاستحمام — أمام التسريحة", "standing_vanity", ["ceiling_white", "ceiling_warm"], `POST-SHOWER SCENARIO — VANITY
${POST_SHOWER_BODY_LOCK}
Stand naturally on the real floor in front of the vanity. Do not move or alter the mirror, vanity items, stool, or surrounding room details.` , { forcedClothingId: "bath_towel_only" }),
  scenario("shower_bedside_towel", "post_shower", "بعد الاستحمام — بجانب السرير", "standing_bedside", ["ceiling_white", "ceiling_warm", "window_daylight"], `POST-SHOWER SCENARIO — BEDSIDE
${POST_SHOWER_BODY_LOCK}
Stand naturally on the floor beside the bed. Do not sit on, remake, disturb, flatten, move, or otherwise change the bedding or nearby objects.` , { forcedClothingId: "bath_towel_only" }),
  scenario("shower_center_screen", "post_shower", "بعد الاستحمام — إضاءة شاشة الهاتف", "standing_center", ["phone_screen_only"], `POST-SHOWER SCENARIO — PHONE SCREEN LIGHT
${POST_SHOWER_BODY_LOCK}
Stand naturally in the room center with the phone screen as the only declared light source. The room remains physically unchanged and falls dark according to real light falloff.` , { forcedClothingId: "bath_towel_only" })
]);

export const ROOM_SCENARIO_TEMPLATES = Object.freeze([...CLOTHING_PREP_TEMPLATES, ...POST_SHOWER_TEMPLATES]);
export const ROOM_SCENARIO_BY_ID = Object.freeze(Object.fromEntries(ROOM_SCENARIO_TEMPLATES.map((item) => [item.id, item])));

export function getActiveRoomScenario(pose = null) {
  if (typeof document === "undefined") return null;
  const id = document.documentElement.dataset.activeRoomScenario;
  const template = ROOM_SCENARIO_BY_ID[id];
  if (!template) return null;
  if (pose && template.poseId !== pose.id) return null;
  return template;
}
