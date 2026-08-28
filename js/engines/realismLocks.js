export const SELFIE_VIEWPOINT_LOCK = `SELFIE VIEWPOINT LOCK (HIGHEST PRIORITY): the ONLY viewpoint is his own phone held at arm's length (35–60cm). FORBIDDEN: third-person, camera across the room, wide shot from foot of bed, tripod, another photographer. Face 40–60% of frame; selfie-side shoulder slightly raised; room only as near background.`;

export const CAMERA_EMULATOR = `[Camera Emulator]: Xiaomi 15 Ultra - Front-Facing Camera (Selfie Mode)
- Focal Length: 22–24mm equivalent wide-angle front lens.
- Perspective: 0.4–0.7m close-quarters; natural center-face protrusion; edge distortion only at frame corners.
- Sensor: subtle high-ISO grain + raw chroma noise in shadows; restrained noise reduction preserving skin texture.
- Processing: subtle over-sharpening on edges; micro-motion blur on loose hair only; natural phone depth of field; ONE pipeline for the whole frame.`;

export const LIGHTING_PHYSICS_LOCK = `LIGHTING PHYSICS LOCK — ONE LIGHTING EVENT: person, bedding/furniture and room under one coherent light; key direction strikes face and surfaces consistently; one face side only slightly brighter; DO NOT correct exposure (one highlight may clip; white balance may drift warm/green per source); no hidden fill, no softbox, no cinematic grading.`;

export const PHONE_SCREEN_ONLY_STRICT = `STRICT "PHONE SCREEN ONLY": the bedside lamp visible in IMAGE B is an UNLIT decorative prop emitting ZERO light; ANY warm/amber cast on skin, bedding, wall or headboard = INVALID; the screen (35–45cm) is the ONLY photon source; face cool ~6500K with soft under-brow/chin shadows; rectangular screen catchlights only; beyond ~1m NEAR BLACK; ISO 1600–3200 with visible luminance + chroma noise.`;

export const NIGHT_REALISM_LOCK = `NIGHT REALISM LOCK (all night templates):
- Darkness is NEVER clean: shadows and black areas carry real sensor luminance + chroma noise at the declared ISO; blacks lifted slightly by noise, NOT pure #000.
- Inverse-square falloff from the phone screen: face readable, shoulders darker, beyond ~1m near-black but noisy.
- Catchlights: rectangular phone-screen glows in both eyes; add a secondary catchlight ONLY if that template's second source is actually lit.
- The bedside lamp is an UNLIT prop unless the template explicitly lights it.
- Mixed white balance imperfect: cool screen on face, ambient tint on edges.
- Pupils slightly dilated in low light; slight cool skin cast; faint screen sheen on the T-zone.
- One emissive micro-dot (AC/charger LED) allowed that casts NO light.
- No cinematic grading, no teal-orange, no clean studio black, no even light.
- Bedding physics unchanged from day: pillow compression, blanket tension, lying face ≠ standing face.`;

export const SINGLE_PIPELINE = `SINGLE PHONE PIPELINE: the background is NEVER sharper, cleaner or less noisy than the face; same exposure, HDR merge, noise, sharpening and compression everywhere.`;

export const HAIR_REALISM_LOCK = `HAIR REALISM LOCK: density, volume, wave, length and hairline LOCKED to IMAGE A; hair forms soft natural clumps; individual strands resolved ONLY at the hairline edge, flyaways (5–12) and highlight glints; warm sun-lifted crests vs deeper valleys; matte sheen; NO wire strands, NO helmet, NO invented length/density.`;

export const CLOTHING_LOCK = `CLOTHING LOCK: garment is EXACTLY the selected one; NEVER copy any garment from IMAGE A; fabric follows gravity, pressure and friction; non-repeating weave; irregular load-driven folds; same phone pipeline as the rest of the frame.`;

export const EXPRESSION_LOCK = `EXPRESSION = MUSCLE STATE ONLY. Geometry freeze: face width/length, cheek fullness, jaw/chin, nose, lip volume, eye size/spacing/eyelids, ears, hairline, beard pattern and skin tone identical to IMAGE A. ANTI-STEREOTYPE: ignore all visual stereotypes of mood words (no sharper jaw, no thinner face, no narrower eyes). SAME-PERSON TEST: a friend must recognize him instantly; otherwise INVALID.`;

export const BEDDING_PHYSICS_LOCK = `BEDDING PHYSICS: the head SINKS 4–6cm into the pillow with rim bulge and radiating wrinkles; soft contact-shadow ring at head/neck; contact-side hair flattened and spread, free side follows gravity; THE LYING FACE IS NOT THE STANDING FACE (cheek tissue falls slightly with gravity; bone structure unchanged); blanket drapes over the lower body with tension lines where knees push and slack folds between; sheet taut beside compressed zones; mattress depression with side bulge.`;

export const GROUNDING = Object.freeze({
  sitting: `SITTING GROUNDING: sit bones load the seat with visible compression (soft) or contact shadow (hard); knees ~90°, feet supported with their own shadows; back contact per pose; gravity folds at waist/knees; natural slight slouch — no mannequin.`,
  standing: `STANDING GROUNDING: both feet flat with contact shadow hugging the sole line; weight on one leg (contrapposto); clothing hangs vertically; body casts a floor shadow matching the light source; vertical room lines nearly vertical.`
});

export const IMPERFECTIONS = Object.freeze([
  "one highlight slightly too hot (lamp bulb / window edge)",
  "one shadow deeper than ideal (under pillow, seat gap, door pocket)",
  "one stray hair or slightly uneven beard edge",
  "one background object cropped by the frame",
  "uneven sharpening: face slightly crisper than bedding, never the reverse",
  "slight skin-tone delta between lit and shadow side of the face",
  "one distant object out of focus"
]);

export function imperfectionManifest(cfg) {
  const seed = (cfg.pose.id + cfg.lighting.id + cfg.expression.id)
    .split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const n = 3 + seed % 3;
  const picks = Array.from({ length: n }, (_, i) =>
    IMPERFECTIONS[(seed + i * 3) % IMPERFECTIONS.length]);
  return `IMPERFECTION MANIFEST (this render): ` + picks.join(" ; ") + `.`;
}

export const QUICK_FIXES = Object.freeze({
  face_drift: `IDENTITY-DRIFT FIX: the face shape/width/length/jaw/eyes/beard changed. Re-render with LANDMARK FREEZE vs IMAGE A (interocular, nose, lip volume, jaw width, face ratio identical). ANTI-STEREOTYPE: ignore all mood-word visual stereotypes. SAME-PERSON TEST must pass.`,
  arm_leak: `ARM LEAK FIX: a selfie arm/hand appeared in frame. ARM-FREE FRAMING: the phone, hand and entire selfie arm are strictly OUTSIDE the frame; crop begins beyond the phone-side shoulder. Only the resting OTHER arm is visible.`,
  light_leak: `LIGHTING LEAK FIX: lighting did not match the selected source. Apply LIGHTING PHYSICS LOCK strictly; the bedside lamp visible in IMAGE B is an UNLIT decorative prop (if phone-screen-only); every shadow, catchlight and gradient traces to the selected source only.`,
  seat_mess: `SEAT MESS FIX: driver seating is twisted (wheel off-axis, torso 90° twist, knees mismatching hips). Apply DRIVER SEAT ANATOMY SOLVER: solve seat–wheel axis FIRST, torso rotation ≤ 30°, knees point to pedals, both sleeves identical.`,
  bg_cleaner: `BACKGROUND CLEANER FIX: background sharper/cleaner than the face. SINGLE PIPELINE: face, room and outside share identical exposure, HDR, noise, sharpening and compression. Background NEVER cleaner than face.`
});

if (typeof window !== "undefined") {
  Object.assign(window, {
    SELFIE_VIEWPOINT_LOCK,
    CAMERA_EMULATOR,
    LIGHTING_PHYSICS_LOCK,
    PHONE_SCREEN_ONLY_STRICT,
    NIGHT_REALISM_LOCK,
    SINGLE_PIPELINE,
    HAIR_REALISM_LOCK,
    CLOTHING_LOCK,
    EXPRESSION_LOCK,
    BEDDING_PHYSICS_LOCK,
    GROUNDING,
    IMPERFECTIONS,
    imperfectionManifest,
    QUICK_FIXES
  });
}
