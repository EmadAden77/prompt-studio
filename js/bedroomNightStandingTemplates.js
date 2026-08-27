const freeze = (value) => Object.freeze(value);

const template = (id, name_ar, poseId, lightingId, sceneId, promptBlock, extras = {}) => freeze({
  id,
  group: "standing",
  name_ar,
  poseId,
  expressionId: "relaxed",
  hairId: "same",
  clothingId: "heather_tee_jeans",
  lightingId,
  sceneId,
  aspect: "9:16",
  promptBlock,
  ...extras
});

const NIGHT_STANDING_BASE = `BEDROOM NIGHT STANDING TEMPLATE — MAXIMUM PHYSICAL REALISM
- IMAGE A remains the sole authority for stable facial identity. Preserve exact cranial proportions, jaw/chin geometry, eye shape/spacing, nose geometry, lip dimensions, hairline, beard boundaries, age markers and stable natural asymmetry.
- Expression changes muscle state only. Never redesign the face to fit the lighting, angle, clothing or pose.
- IMAGE B / the active bedroom master reference remains the exact room authority. Preserve real wall positions, headboard, bed, wardrobe, dresser, mirror, curtains, flooring, clutter, object scale and perspective. Do not clean, redesign, mirror, enlarge or invent room geometry.
- Solve the full standing body before the camera. Both feet remain physically grounded on the real floor/rug; pelvis, spine, shoulders, neck and head follow one coherent weight-bearing chain. Use ordinary contrapposto, not mannequin symmetry.
- The selfie phone remains on a physically reachable arm arc at ordinary front-camera distance. Do not use an observer camera, floating camera, impossible shoulder reach or exaggerated near-field limb stretching.
- Use the app's Xiaomi 15 Ultra front-camera model around 22–24 mm full-frame equivalent and approximately f/2.0, with small-sensor depth behavior, finite highlight headroom, restrained HDR, illumination-dependent sensor noise, modest sharpening/compression and no beauty processing.
- Night lighting must come only from the selected real source(s). Every shadow, eye catchlight, skin highlight, glass/mirror reflection and color contamination must trace back to those sources. No hidden fill, rim light, softbox or face-only relighting.
- Skin, hair, clothing, floor, furniture, glass and room surfaces share one exposure, white balance, denoise, sharpening and tone pipeline. Dark regions may lose detail and carry more noise. Bright practicals may clip modestly.
- Clothing folds come only from gravity, shoulder suspension, elbow/waist bending, body curvature, friction and real contact. Fabric texture is camera-resolvable only; no synthetic weave over-detail or plastic sheen.
- Hair follows gravity, shoulder contact, collar friction and any real airflow only. Keep grouped strands and natural mass; do not render every strand equally sharp.
- Final rejection gate: no floating feet, duplicated limbs, impossible mirror reflection, face drift, waxy skin, beauty smoothing, fake depth blur, cinematic color grade, perfectly clean room, invented props, conflicting shadows or selective face cleanup. CAPTURED, NOT RENDERED.`;

const standing = (pose, grounding, freeHand, light, camera, background) => `${NIGHT_STANDING_BASE}
POSE / BODY MECHANICS: ${pose}
GROUNDING / LOAD PATH: ${grounding}
FREE-HAND MECHANICS: ${freeHand}
LIGHTING / SENSOR BEHAVIOR: ${light}
CAMERA / FRAMING: ${camera}
REFERENCE WINDOW: ${background}`;

export const BEDROOM_NIGHT_STANDING_TEMPLATES = freeze([
  template(
    "bed_night_stand_bedside_lamp",
    "وقوف ليلي بجانب السرير — ضوء الأباجورة",
    "standing_bedside",
    "lamp_only",
    "room_bed_side",
    standing(
      "Stand beside the real bed with a slight relaxed weight shift onto one leg. Torso may rotate only about 5–15° toward the phone; shoulders remain naturally unequal and the neck stays neutral rather than craned toward the lens.",
      "Both feet remain planted on the real floor. The loaded leg carries more pelvic height while the free knee relaxes slightly; floor contact shadows stay tight beneath the soles and lengthen only according to the lamp direction.",
      "The free hand hangs naturally near the thigh or rests lightly on the mattress edge only if the crop actually shows that contact. If it touches the bed, mattress fabric reacts locally with a tiny depression/contact shadow rather than a dramatic dent.",
      "Use the real warm bedside lamp as the dominant source from its recorded side. Near-side facial planes and shoulder receive warm light; the far side falls naturally darker. Keep strong but believable lateral falloff, warm contamination on nearby bedding/headboard, shadow noise in the darker room, and no frontal rescue light.",
      "Front camera about 45–60 cm from the face at eye level or only slightly above. Head-to-lower-torso crop, mild handheld roll, ordinary edge softness. Do not widen to include both feet merely to prove standing.",
      "Use only the reference-supported bed, padded headboard, bedside zone and nearby floor geometry visible from this reachable phone endpoint."
    )
  ),
  template(
    "bed_night_stand_wardrobe_dimspots",
    "وقوف ليلي عند الدولاب — سبوتات خافتة",
    "standing_wardrobe",
    "ceiling_spots_dim",
    "room_wardrobe_dresser",
    standing(
      "Stand naturally beside the real wardrobe without opening doors or reaching for handles unless that exact state is already visible in the reference. Keep body axis upright with a small hip shift and relaxed shoulder asymmetry.",
      "Feet stay grounded on the same real floor plane as the wardrobe base. Preserve believable human scale against the wardrobe height; no enlarged subject, shortened room or perspective mismatch.",
      "Keep the free hand down, lightly in a pocket, or resting near the thigh. Avoid touching reflective panels or handles, which would otherwise require extra reflection/contact constraints.",
      "Use only the existing dimmed ceiling spots. Expect weak top-down multi-point illumination, darker eye sockets/lower face, small faint overhead catchlights, low-light sensor noise in wardrobe shadows and subtle specular response on mirrored/glossy panels only where geometry supports it.",
      "Front camera 45–60 cm from face, near eye level, head-to-waist crop. Keep vertical room lines nearly vertical with only mild wide-angle convergence; no dramatic tilted architecture.",
      "Use ROOM wardrobe/dresser geometry as recorded: wardrobe panel spacing, mirror reflectance, dresser placement and any visible clutter remain fixed. Reflections must follow the actual camera-to-mirror ray path."
    )
  ),
  template(
    "bed_night_stand_vanity_warm",
    "وقوف ليلي عند التسريحة — إضاءة دافئة هادئة",
    "standing_vanity",
    "ceiling_warm",
    "room_dresser_mirror",
    standing(
      "Stand near the real dresser/vanity with the torso angled only slightly relative to the mirror. This is a front-camera selfie, not a mirror selfie: the phone is held toward the face, while any mirror appears only as background geometry.",
      "Both feet stay on the real floor with a modest natural stance width. Pelvis and ribcage remain stacked; one shoulder rises only as required by the selfie arm while the opposite shoulder remains relaxed.",
      "Free hand stays simple and non-interactive, hanging beside the body or lightly touching clothing. Do not invent contact with cosmetics, drawers, mirror frame or decorative objects.",
      "Use the existing warm ceiling source only. Warm top light creates downward facial shadows, broad warm response on wood/fabric surfaces, restrained mirror highlights and darker lower-room zones. White balance remains one imperfect phone-camera solution rather than neutralizing every surface.",
      "Front camera 45–60 cm from face, eye level, medium-close head-to-waist crop. Keep mirror reflections secondary and geometrically exact; no duplicated face or phantom phone in unrelated reflection paths.",
      "Preserve the exact dresser, mirror frame, drawer geometry, top clutter, adjacent wardrobe and wall relationships from the active reference."
    )
  ),
  template(
    "bed_night_stand_center_dim",
    "وقوف ليلي وسط الغرفة — إضاءة منخفضة طبيعية",
    "standing_center",
    "ceiling_spots_dim",
    "room_master_overview",
    standing(
      "Stand in the real central walking/rug zone with ordinary contrapposto. One leg bears slightly more weight, the free knee softens, shoulders counterbalance subtly, and the head stays connected to the torso rather than leaning independently toward the camera.",
      "Foot placement must match the real rug/floor plane and room scale. Contact shadows remain attached beneath the soles. Do not shift the body toward the camera to make the face larger; preserve room-relative scale first, then crop.",
      "The free arm hangs naturally, rests lightly at the hip, or enters a pocket without forcing shoulder elevation. Fingers remain relaxed and non-symmetrical if visible.",
      "Use only the dim ceiling spots. The room should genuinely remain dark between fixtures, with spatially uneven overhead pools, subtle mixed reflection from nearby surfaces, deeper corners, realistic luminance/chroma noise and limited shadow recovery. No cinematic ambient lift.",
      "Front camera 45–65 cm from the face, near eye height. Frame head to upper thighs at most, with the subject dominant and only enough room context to prove location. Preserve ordinary handheld roll and slight framing imbalance.",
      "Use the master room overview only for supported relative geometry: bed, rug/floor, wardrobe, dresser and sofa may appear only where the selected crop naturally intersects their recorded positions."
    )
  ),
  template(
    "bed_night_stand_bedfront_mixed",
    "وقوف ليلي أمام السرير — أباجورة + شاشة الهاتف",
    "standing_bedside",
    "lamp_and_phone",
    "room_bed_front",
    standing(
      "Stand near the foot/side-front region of the real bed while remaining fully on the floor. Torso faces the phone naturally with a small body rotation and no staged squared shoulders.",
      "Both feet remain physically grounded. Weight shift produces a subtle pelvic tilt and corresponding shoulder counter-tilt; clothing drape and floor shadows must agree with that load distribution.",
      "The free hand may rest loosely near the pocket, thigh or lower torso. Keep elbow/wrist anatomy continuous and avoid touching bedding unless the actual crop clearly contains reachable contact.",
      "Use exactly two sources: the real warm bedside lamp plus the cool/neutral phone screen near the optical axis. The lamp controls lateral warm structure and room pool; the phone screen provides weaker close frontal fill on the face only where it can physically reach. Mixed color remains visible under one white balance, with screen-shaped catchlight geometry when visible and no third source.",
      "Front camera about 40–55 cm from the face, slightly above or at eye level, close head-to-lower-torso crop. Mild near-field perspective is acceptable at the frame edges, but stable facial landmarks remain identity-locked.",
      "Use only the exact bed-front/headboard/bedside geometry supported by the reference. The rest of the room may fall dark or outside the crop instead of being invented."
    )
  )
]);

export const BEDROOM_NIGHT_STANDING_TEMPLATE_BY_ID = freeze(Object.fromEntries(BEDROOM_NIGHT_STANDING_TEMPLATES.map((item) => [item.id, item])));
