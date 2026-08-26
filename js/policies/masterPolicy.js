const IMMUTABLE_PHOTOGRAPHIC_REALISM_LOCK = `GLOBAL PHOTOGRAPHIC IMPERFECTION & CONSISTENCY LOCK — IMMUTABLE, ALWAYS ACTIVE
This rule applies to EVERY template, pose, room scenario, camera path, clothing state, lighting preset, and future template. It is not a style option, cannot be disabled, and cannot be weakened by any lower-priority instruction.
- SKIN: Never over-smooth, homogenize, airbrush, beautify, or wax-polish the face, neck, torso, chest, abdomen, shoulders, or arms. Preserve natural pores, small tonal variation, faint redness or unevenness, subtle texture changes, shaving traces where appropriate, tiny blemish-level variation, and realistic highlight breakup. Do not add artificial defects; preserve ordinary human variation instead of cosmetic perfection.
- HEAD HAIR & BEARD: Never render the hair or beard as uniformly groomed, strand-perfect, painted, or procedurally ordered. Keep realistic clumping, small flyaways, local density variation, beard gaps, irregular strand direction, soft occlusion, and pose/gravity/contact effects. Do not change the identity-defined haircut, density, hairline, beard pattern, or age.
- TEETH & SMILE: Teeth must remain naturally human rather than advertisement-perfect. No artificial whitening, identical tooth geometry, porcelain-uniform brightness, perfectly even spacing, or unnaturally polished gums. Preserve the selected facial expression without beautifying dental appearance.
- CHEST & ABDOMINAL HAIR: Whenever visible, body hair must have sparse-to-moderate natural variation in density, direction, length, clustering, spacing, and overlap. Never create a repeated, tiled, mirrored, symmetrical, combed, vector-like, or near-regular pattern. Keep it subtle and anatomically plausible.
- NEAR-LENS ARM & SKIN: The arm closest to the phone must retain ordinary smartphone perspective, local texture variation, natural pores, faint hair, small exposure/noise differences, and physically plausible wide-angle stretching. Never smooth its gradients into CGI-like transitions or remove all minor camera imperfections.
- ONE LIGHTING EVENT: The subject and IMAGE B room must be illuminated by the same declared physical light event. The face/body may not receive cleaner, softer, brighter, more balanced, or differently directed light than the room unless actual source geometry and occlusion explain it. Shadow direction, softness, color temperature, falloff, reflections, catchlights, and local exposure must agree across person and environment.
- ONE PHONE PIPELINE: Face, torso, arms, hair, beard, towel/clothing, fingers, footwear, furniture edges, bedding, mirrors, and room objects must share one exposure, white balance, HDR response, noise field, sharpening level, compression behavior, motion softness, chromatic behavior, and depth logic. No region may look selectively cleaner or more perfectly resolved than the rest.
- MICRO-DETAIL CHECK: Fingers, fingernails, towel edges and overlap, clothing seams, shoes, furniture boundaries, occlusion edges, reflections, and contact points must remain structurally convincing under close inspection. No fused fingers, melted edges, locally missing geometry, rubbery fabric, floating contact, impossible seam continuation, false reflection, or edge that is merely plausible from a distance.
- ORDINARY PHONE IMPERFECTIONS: Preserve restrained real capture limitations where physically expected: mild luminance/chroma noise in darker zones, small white-balance imperfection, modest sharpening halos, slight compression, occasional micro-motion softness, mild lens distortion, non-uniform edge sharpness, and imperfect highlight roll-off. Never exaggerate these into a filter, and never remove them so completely that the result becomes synthetic.
- NO SELECTIVE BEAUTIFICATION: Do not make the subject visually more polished than the room. Skin, teeth, hair, body hair, towel/clothing, and near-camera limbs must never receive a separate beauty, denoise, relight, HDR, clarity, or cleanup treatment.
- FINAL CONSISTENCY GATE: Before output, reject any solution in which the person looks more polished than IMAGE B, body-hair distribution looks patterned, skin looks unusually smooth, dental appearance looks commercially perfect, the near-lens arm lacks normal phone texture, or subject lighting/shadows disagree with the room. Correct the local realism while preserving identity, pose, room geometry, selected expression, selected hair arrangement, and permitted clothing state.`;

export const MASTER_POLICY = Object.freeze({
  immutablePhotographicRealismLock: IMMUTABLE_PHOTOGRAPHIC_REALISM_LOCK,
  eventRule: `Interpret every selected value as one physically coherent photographic event.\n\n${IMMUTABLE_PHOTOGRAPHIC_REALISM_LOCK}`,
  conflictDomains: [
    "identity",
    "place and room continuity",
    "anatomy and support surfaces",
    "arm reach and phone position",
    "camera and lens geometry",
    "perspective and reflections",
    "lighting and exposure",
    "skin, hair, beard, teeth, and body-hair natural variation",
    "micro-detail integrity at fingers, textiles, footwear, and object boundaries",
    "single phone-processing consistency across subject and environment",
    "materials, scale, and depth of field"
  ],
  realismRule: "Realism must come from optics, light, anatomy, pressure, gravity, friction, natural human variation, micro-detail integrity, and one ordinary phone-processing pipeline—not artificial detail injection, selective beautification, or synthetic perfection.",
  forbiddenTechniques: [
    "skin over-smoothing or airbrushing",
    "selective subject beautification",
    "advertisement-perfect teeth",
    "procedurally regular body-hair patterns",
    "separate subject relighting from the room",
    "region-specific cleanup or denoising",
    "EXIF spoofing",
    "C2PA removal",
    "PRNU simulation",
    "forensic countermeasures",
    "fake 8K detail",
    "unmotivated cinematic grading"
  ]
});
