const freeze = (value) => Object.freeze(value);

const template = (id, name_ar, poseId, lightingId, sceneId, promptBlock, extras = {}) => freeze({
  id,
  group: "bed",
  name_ar,
  poseId,
  expressionId: "relaxed",
  hairId: "same",
  clothingId: "cotton_pajama",
  lightingId,
  sceneId,
  aspect: "9:16",
  promptBlock,
  ...extras
});

const BASE = `BEDROOM CANDID SELFIE — PHYSICALLY GROUNDED
- IMAGE A is the sole facial-identity authority. Preserve exact facial geometry, bone structure, natural asymmetry, age, beard/hairline boundaries, skin undertone and camera-resolvable skin texture.
- Use an ordinary Xiaomi 15 Ultra FRONT-camera selfie viewpoint, approximately 22–24mm full-frame equivalent around f/2.0. The phone remains within a physically reachable hand arc; do not substitute an observer camera.
- Expression changes muscle state only. Identity geometry does not drift.
- Hair, pillow, bedding, clothing, skin contact and room lighting must obey gravity, pressure, friction, occlusion and one exposure/white-balance/denoise/sharpening pipeline.
- Keep micro-detail limited by distance, focus, illumination and front-camera resolving power. No beauty smoothing, synthetic pore stamping, decorative bokeh or cinematic relighting.
- Use only bedroom geometry supported by the active room references. Crop or omit uncertain background instead of inventing it.`;

const bed = (pose, contact, hair, light, camera, background) => `${BASE}
POSE MECHANICS: ${pose}
CONTACT / BEDDING PHYSICS: ${contact}
HAIR PHYSICS: ${hair}
LIGHTING PHYSICS: ${light}
CAMERA / CROP: ${camera}
REFERENCE WINDOW: ${background}
FINAL GATE: preserve exact IMAGE A identity, reachable selfie geometry, coherent pillow/mattress deformation, source-traceable lighting and ordinary low-light/mobile sensor behavior. CAPTURED, NOT RENDERED.`;

export const BEDROOM_CANDID_TEMPLATES = freeze([
  template(
    "bed_candid_back_phone_glow",
    "استلقاء مسطح على الظهر — ضوء شاشة الهاتف",
    "lying_back",
    "lamp_and_phone",
    "room_bed_front",
    bed(
      "Lie completely flat on the back. Head rests on the real pillow; shoulders and upper back remain loaded into the mattress. The selfie phone is held slightly above the face on a reachable arm arc, with gaze directly into the front lens.",
      "Head creates a shallow real pillow depression; upper back and pelvis load the mattress; bedding folds radiate from pressure rather than decorative symmetry.",
      "Hair spreads outward across the pillow under gravity, with localized flattening at skull contact, realistic strand grouping and fabric friction. Only a few fine strands separate where the camera can resolve them.",
      "The phone display may be the dominant near-axis cool source only if the selected lighting preset supports it. Keep inverse-square falloff across the face, darker room ambience, rectangular/phone-shaped eye catchlights only when geometry supports them, and authentic shadow grain. Do not invent a hidden softbox.",
      "Front camera about 35–55 cm from the face, slightly above eye line, portrait close crop. Phone and holding hand remain outside frame.",
      "Use ROOM-R3 + ROOM-R2 only: pillow, grey bedding and exact padded headboard, with no room-wide reveal."
    )
  ),
  template(
    "bed_candid_side_lamp",
    "استلقاء جانبي — ضوء الأباجورة الدافئ",
    "lying_right_side",
    "lamp_only",
    "room_bed_side",
    bed(
      "Lie comfortably on one side with cheek gently supported by the pillow and the upper selfie hand mechanically reachable. Keep shoulder/ribcage/hip stacking natural rather than posed.",
      "Pillow compresses under the cheek and skull; soft facial tissue shows restrained local pressure deformation without changing bone geometry. Mattress loading follows shoulder, ribcage and hip contact.",
      "Hair cascades sideways across pillow and shoulder in gravity-led layers. A few loose strands may cross the cheek naturally; no uniform strand fan.",
      "Warm bedside lamp is the principal side source, producing a soft golden highlight on the near cheek/nose bridge and real falloff into the far side. Skin translucency remains subtle and source-dependent, never waxy.",
      "Front camera about 40–60 cm from the face, near eye level with a small side yaw. Tight head-and-shoulders crop.",
      "Use ROOM-R2 + ROOM-R3 only, preserving the actual bedside/headboard geometry."
    )
  ),
  template(
    "bed_candid_elbow_prop",
    "ارتكاز على كوع واحد — سيلفي عفوي",
    "semi_reclining",
    "ceiling_warm",
    "room_bed_side",
    bed(
      "Upper torso rises only through one real supporting elbow/forearm and mattress support. Supporting shoulder, clavicle and neck show mild anatomically plausible load; the camera-holding arm remains the separate free arm.",
      "The supporting elbow makes a localized mattress depression and contact shadow. Torso angle must follow that support path; no floating ribcage or neck-only tilt.",
      "Hair falls naturally toward the lower shoulder according to head tilt, with realistic root direction, modest volume and sparse flyaways catching ambient light.",
      "Use soft room ambience with restrained directional variation and ordinary mobile grain. Bedding/headboard reflect only the light they physically receive.",
      "Front camera 40–60 cm away, slightly above eye line, head-to-upper-torso crop with mild natural framing asymmetry.",
      "Use ROOM-R2 + ROOM-R3 and only the near-bed landmarks visible from this reachable endpoint."
    )
  ),
  template(
    "bed_candid_duvet_tucked",
    "متدثر باللحاف — لقطة قبل النوم",
    "lying_back",
    "lamp_and_phone",
    "room_bed_front",
    bed(
      "Lie back with head deeply but naturally nestled into the pillow while the duvet is pulled to the chest. Shoulders remain supported; face stays unobstructed enough for identity.",
      "Pillow compression follows skull/neck load. Duvet thickness remains real, with gravity folds and chest-edge compression rather than paper creases or vacuum wrapping.",
      "Bedtime hair is naturally tousled and splayed on the pillow by static friction and head contact. Keep clumps irregular and camera-resolvable.",
      "Very dim warm bedside light may mix with a weak cool phone-screen bounce. Both colors must propagate coherently across skin, hair, duvet and pillow under one white balance, with low-light noise rather than face-only cleanup.",
      "Front camera 35–55 cm from face, near eye line, close portrait crop. Do not widen to display the whole duvet or bed.",
      "Use ROOM-R3 + ROOM-R2 only."
    )
  ),
  template(
    "bed_candid_stomach_chin_palm",
    "على البطن — الذقن على راحة اليد",
    "lying_stomach",
    "lamp_only",
    "room_bed_front",
    bed(
      "Lie on the stomach with chest/abdomen/pelvis loaded into the mattress. One supporting hand may cradle the chin with anatomically continuous wrist/finger geometry; the opposite hand holds the phone within natural reach.",
      "Chin-to-palm contact produces small local skin compression and an attached contact shadow. Supporting forearm/elbow loads the mattress; bedding compresses under torso and arm.",
      "Hair drapes organically around the neck and toward both shoulders/bed surface according to gravity and head orientation, without symmetric curtains.",
      "Soft directional warm bedside light creates real contact shadows beneath chin/hand and coherent eye catchlights. Background softness comes only from ordinary front-camera focus/depth behavior, not synthetic portrait masking.",
      "Front camera 35–55 cm from face at a low mattress-level reachable position, head-and-shoulders dominant.",
      "Use ROOM-R3 + ROOM-R2, keeping headboard/bedding secondary and physically plausible."
    )
  ),
  template(
    "bed_candid_deep_side_sleepy",
    "استلقاء جانبي عميق — نعاس منخفض الإضاءة",
    "lying_left_side",
    "lamp_only",
    "room_bed_side",
    bed(
      "Lie on the side with the head sunk deeper into a plush pillow and facial muscles heavy, drowsy and relaxed. Neck remains supported and the upper selfie arm stays mechanically reachable.",
      "Pillow loft compresses around the skull without engulfing the face. Cheek pressure is local and soft; mattress loading remains coherent through shoulder/ribcage/hip.",
      "Hair is flattened at the loaded side of the skull and spreads outward around the pillow. Fine loose hairs may scatter across forehead/cheek only where focus and light resolve them.",
      "Extremely low room ambience with a dim warm distant lamp. Preserve real underexposure, softer fine detail, shadow luminance noise and restrained chroma noise. Do not over-denoise or brighten the face independently.",
      "Front camera 35–55 cm away, near eye level, close crop with ordinary handheld imbalance.",
      "Use ROOM-R2 + ROOM-R3 and keep the room mostly dark/omitted outside supported geometry."
    )
  ),
  template(
    "bed_candid_inverted_edge",
    "زاوية مقلوبة قرب حافة السرير",
    "lying_back",
    "ceiling_white",
    "room_bed_front",
    bed(
      "Lie on the back with the head positioned near a real mattress edge while the neck remains safely supported. The phone stays in front on a reachable low/forward arc; do not create an impossible observer angle.",
      "Upper back and pelvis load the mattress normally. Head/neck support must remain physically plausible at the edge; no hanging skull or excessive cervical extension.",
      "Hair may drape backward over the mattress/pillow edge only where gravity and the exact support edge allow it. Strands fall in grouped, irregular curtains rather than perfectly separated fibers.",
      "Soft indirect wall/ceiling bounce gives broad low-contrast illumination with authentic eye reflections and one coherent exposure. No flat studio fill.",
      "Front camera 35–55 cm from face on a low relaxed angle, portrait close crop. Perspective may feel unusual but must remain self-held and anatomically reachable.",
      "Use ROOM-R3 + ROOM-R2 only and keep the mattress/headboard edge geometry conservative."
    )
  )
]);

export const BEDROOM_CANDID_TEMPLATE_BY_ID = freeze(Object.fromEntries(BEDROOM_CANDID_TEMPLATES.map((item) => [item.id, item])));
