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

const POST_SHOWER_IDENTITY_LOCK = `POST-SHOWER IDENTITY LOCK — HIGHEST PRIORITY
- IMAGE A is the sole authority for the adult male subject's stable identity. Preserve exact cranial and facial proportions, eye size/shape/spacing/canthus positions, eyebrow placement, nose bridge/root/tip/alar geometry, cheek fullness, jaw angle and breadth, chin dimensions, lip width/volume, ears, hairline, beard boundaries/density, skin tone, age markers and stable natural asymmetry.
- Wet hair, moisture, expression, head angle, camera perspective, gravity and contact may change appearance only through physically plausible soft-tissue, strand, specular and perspective effects. They may NEVER redesign facial bones or identity landmarks.
- No beautification, face slimming, jaw sharpening, enlarged eyes, altered nose, fuller/thinner lips, beard redesign, cosmetic symmetry correction, skin whitening, beauty smoothing or synthetic portrait retouching.
- LANDMARK CONSISTENCY TEST: after compensating only for perspective, pose and selected expression, stable facial landmarks must plausibly superimpose on IMAGE A. If not, restore IMAGE A identity.`;

const POST_SHOWER_CAPTURE_LOCK = `POST-SHOWER CAPTURE MODE — ONE OPTICAL PATH ONLY
- Use ONE declared capture mode per result. Never blend mirror-selfie and direct front-camera geometry in the same image.
- DIRECT FRONT SELFIE: Xiaomi 15 Ultra front-facing smartphone viewpoint at physically reachable arm length, approximately 22–24 mm full-frame equivalent around f/2.0, mild near-field wide-angle perspective, ordinary small-sensor depth behavior, no observer-camera viewpoint.
- MIRROR SELFIE: the phone photographs the real mirror reflection through one continuous optical path. Preserve mirror plane, handedness, phone/hand reflection, subject-to-mirror distance and reflected room geometry. Do not also render a separate direct-camera version of the subject.
- The selected scenario/camera elsewhere in the app decides which one is active. If no mirror mode is explicitly selected, default to the direct front-camera path.
- Depth of field remains smartphone-plausible: the environment may become progressively softer with distance, but it stays structurally readable. No DSLR-like shallow focus, portrait-mask cutout or decorative bokeh.`;

const POST_SHOWER_BODY_LOCK = `POST-SHOWER BODY / TOWEL / WATER PHYSICS — STRICT
- The adult male subject wears ONLY one opaque white cotton bath towel securely wrapped around the waist. It fully covers pelvis and buttocks at all times. No shirt, undershirt, trousers, shorts, underwear, robe or second towel is visible.
- Towel construction must remain physically credible: medium-weight cotton with real thickness, edge mass, overlap/tuck support at the waist, localized compression where secured, gravity-driven folds from waist/hip loading and mild friction against damp skin. Use waffle texture only at camera-resolvable scale; never stamp oversized repeated squares or make the towel look like plastic CGI cloth.
- The torso remains anatomically natural and unenhanced. Preserve the subject's real build from IMAGE A; do not add muscle size, reduce body fat, sharpen abdominal definition or create fitness-model proportions.
- Chest/body hair is sparse-to-natural, irregular and anatomically integrated. Damp hairs may form small clumps that follow surface curvature and gravity; never create a uniform painted hair layer.
- Wet/damp scalp hair keeps the exact hairline, density, color and cut from IMAGE A. Moisture changes strand grouping and volume only: clumps gain weight, roots may flatten slightly, and a few damp strands may adhere naturally to forehead/temples where contact and gravity support it.
- Water is non-uniform and transient. Hair retains more moisture than exposed skin. Use only a few plausible droplets or short gravity-led trails near hair tips, behind ears, neck, shoulders and collarbones. Some skin regions should already be drying. Never cover every pore with droplets and never create decorative rain-on-skin effects.
- Post-shower skin sheen is restrained and spatially variable. Specular response follows real moisture, skin normals and the selected light source. Camera-resolvable pores, follicle openings, fine body hair, lip texture and small imperfections appear only where distance, focus and illumination support them.
- Subsurface transmission is subtle and source-dependent at thin tissue edges only. No global red/orange SSS glow, wax texture, hyper-detailed pore stamping or artificial micro-contrast.`;

const POST_SHOWER_LIGHT_SENSOR_LOCK = `POST-SHOWER LIGHT / STEAM / SENSOR PIPELINE — ONE CAPTURE
- Use only the physical source or sources in the selected lighting preset and the existing room geometry. No private face fill, softbox, rim light or cinematic relight.
- Warm vanity/bedroom practicals may create local warm pools and real material bounce only if those fixtures exist and are lit in the active reference/preset. Phone-screen bounce is allowed only when the active capture and lighting geometry support it.
- Bathroom steam, if visible in the supported background, behaves as faint suspended moisture that lowers local contrast and adds subtle veiling scatter near the bathroom zone. Steam itself does NOT create bokeh. Out-of-focus highlight circles come only from real distant light sources plus ordinary lens focus behavior.
- Contact shadows remain attached to feet/floor, towel/body contact, jaw/neck and any real support. Reflections in mirrors, glass and wet skin must correspond to the actual source shape and direction.
- Entire frame uses one smartphone exposure, white balance, HDR/merge behavior, denoise pass, sharpening response, tone curve and compression path. Darker regions carry more luminance noise and restrained chroma noise; brighter regions are cleaner. No face-only denoise, local skin cleanup or separate background blur.
- Preserve finite highlight headroom and real low-light compromises. Bright bulbs or wet specular peaks may clip modestly; deep shadows may lose detail. Do not recover every highlight and shadow simultaneously.
- FINAL REJECTION GATE: reject identity drift, beauty smoothing, duplicated reflections, mixed mirror/direct camera geometry, impossible towel support, uniformly wet skin, decorative droplets, synthetic portrait blur, over-resolved pores/hair, inconsistent noise/sharpening, invented steam bokeh or any room change caused by the scenario.
- Target: an ordinary candid post-shower smartphone photograph whose realism comes from coherent physics. CAPTURED, NOT RENDERED.`;

const POST_SHOWER_MASTER_LOCK = `${POST_SHOWER_IDENTITY_LOCK}\n\n${POST_SHOWER_CAPTURE_LOCK}\n\n${POST_SHOWER_BODY_LOCK}\n\n${POST_SHOWER_LIGHT_SENSOR_LOCK}`;

export const POST_SHOWER_TEMPLATES = Object.freeze([
  scenario("shower_center_towel", "post_shower", "بعد الاستحمام — وسط الغرفة", "standing_center", ["ceiling_white", "ceiling_warm", "window_daylight"], `POST-SHOWER SCENARIO — CENTER ROOM
${POST_SHOWER_MASTER_LOCK}
Stand naturally on the real floor in the room center with ordinary weight shift and full foot grounding. The room itself remains exactly unchanged.` , { forcedClothingId: "bath_towel_only" }),
  scenario("shower_wardrobe_towel", "post_shower", "بعد الاستحمام — أمام الدولاب", "standing_wardrobe", ["ceiling_white", "ceiling_warm"], `POST-SHOWER SCENARIO — WARDROBE
${POST_SHOWER_MASTER_LOCK}
Stand naturally in front of the wardrobe as if about to get dressed, but do not open, close, touch, or alter any wardrobe door or visible contents. Preserve IMAGE B exactly.` , { forcedClothingId: "bath_towel_only" }),
  scenario("shower_vanity_towel", "post_shower", "بعد الاستحمام — أمام التسريحة", "standing_vanity", ["ceiling_white", "ceiling_warm"], `POST-SHOWER SCENARIO — VANITY
${POST_SHOWER_MASTER_LOCK}
Stand naturally on the real floor in front of the vanity. This remains a direct front-camera selfie unless an explicit mirror-selfie capture mode is selected elsewhere. Do not move or alter the mirror, vanity items, stool, or surrounding room details.` , { forcedClothingId: "bath_towel_only" }),
  scenario("shower_bedside_towel", "post_shower", "بعد الاستحمام — بجانب السرير", "standing_bedside", ["ceiling_white", "ceiling_warm", "window_daylight"], `POST-SHOWER SCENARIO — BEDSIDE
${POST_SHOWER_MASTER_LOCK}
Stand naturally on the floor beside the bed. Do not sit on, remake, disturb, flatten, move, or otherwise change the bedding or nearby objects.` , { forcedClothingId: "bath_towel_only" }),
  scenario("shower_center_screen", "post_shower", "بعد الاستحمام — إضاءة شاشة الهاتف", "standing_center", ["phone_screen_only"], `POST-SHOWER SCENARIO — PHONE SCREEN LIGHT
${POST_SHOWER_MASTER_LOCK}
Stand naturally in the room center with the phone screen as the only declared light source. The room remains physically unchanged and falls dark according to real inverse-square falloff and sensor exposure limits.` , { forcedClothingId: "bath_towel_only" })
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
