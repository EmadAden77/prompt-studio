const IMMUTABLE_PHOTOGRAPHIC_REALISM_LOCK = `GLOBAL PHOTOGRAPHIC IMPERFECTION & CONSISTENCY LOCK — IMMUTABLE, ALWAYS ACTIVE
This rule applies to EVERY template, pose, room scenario, camera path, clothing state, lighting preset, and future template. It is not a style option, cannot be disabled, and cannot be weakened by any lower-priority instruction.
- SKIN: Never over-smooth, homogenize, airbrush, beautify, or wax-polish the face, neck, torso, chest, abdomen, shoulders, or arms. Preserve natural pores, small tonal variation, faint redness or unevenness, subtle texture changes, shaving traces where appropriate, tiny blemish-level variation, and realistic highlight breakup. Do not add artificial defects; preserve ordinary human variation instead of cosmetic perfection.
- HEAD HAIR & BEARD: Never render the hair or beard as uniformly groomed, strand-perfect, painted, or procedurally ordered. Keep realistic clumping, small flyaways, local density variation, beard gaps, irregular strand direction, soft occlusion, and pose/gravity/contact effects. Do not change the identity-defined haircut, density, hairline, beard pattern, or age.
- TEETH & SMILE: Teeth must remain naturally human rather than advertisement-perfect. No artificial whitening, identical tooth geometry, porcelain-uniform brightness, perfectly even spacing, or unnaturally polished gums. Preserve the selected facial expression without beautifying dental appearance.
- CHEST & ABDOMINAL HAIR: Whenever visible, body hair must have sparse-to-moderate natural variation in density, direction, length, clustering, spacing, and overlap. Never create a repeated, tiled, mirrored, symmetrical, combed, vector-like, or near-regular pattern. Keep it subtle and anatomically plausible.
- GLOBAL SELFIE ARM EXCLUSION: In EVERY selfie template and EVERY pose, the camera-holding arm is physically solved but remains COMPLETELY OUTSIDE the finished image crop. No camera-holding upper arm, elbow, forearm, wrist, hand, fingertips, or phone may enter any edge of the frame. Never use foreground arm elongation, forced-perspective arm stretch, 0.5x arm exaggeration, fisheye-like limb magnification, or a visible arm as evidence that the image is a selfie. Preserve selfie realism through reachable camera position, near-field facial perspective, gaze direction, shoulder asymmetry, and room perspective only. The arm must be hidden by composition, never by erasing, shortening, amputating, deforming, disconnecting, or merging anatomy. If a lower-priority template requests visible-arm perspective or arm extension, that instruction is VOID.
- ONE LIGHTING EVENT: The subject and IMAGE B room must be illuminated by the same declared physical light event. The face/body may not receive cleaner, softer, brighter, more balanced, or differently directed light than the room unless actual source geometry and occlusion explain it. Shadow direction, softness, color temperature, falloff, reflections, catchlights, and local exposure must agree across person and environment.
- ONE PHONE PIPELINE: Face, torso, hair, beard, towel/clothing, fingers, footwear, furniture edges, bedding, mirrors, and room objects must share one exposure, white balance, HDR response, noise field, sharpening level, compression behavior, motion softness, chromatic behavior, and depth logic. No region may look selectively cleaner or more perfectly resolved than the rest.
- MICRO-DETAIL CHECK: Fingers, fingernails, towel edges and overlap, clothing seams, shoes, furniture boundaries, occlusion edges, reflections, and contact points must remain structurally convincing under close inspection. No fused fingers, melted edges, locally missing geometry, rubbery fabric, floating contact, impossible seam continuation, false reflection, or edge that is merely plausible from a distance.
- ORDINARY PHONE IMPERFECTIONS: Preserve restrained real capture limitations where physically expected: mild luminance/chroma noise in darker zones, small white-balance imperfection, modest sharpening halos, slight compression, occasional micro-motion softness, mild lens distortion, non-uniform edge sharpness, and imperfect highlight roll-off. Never exaggerate these into a filter, and never remove them so completely that the result becomes synthetic.
- NO SELECTIVE BEAUTIFICATION: Do not make the subject visually more polished than the room. Skin, teeth, hair, body hair, towel/clothing, and visible non-camera-holding limbs must never receive a separate beauty, denoise, relight, HDR, clarity, or cleanup treatment.
- FINAL CONSISTENCY GATE: Before output, reject any solution in which the camera-holding arm or phone is visible anywhere in the frame, any limb is elongated toward the lens, the person looks more polished than IMAGE B, body-hair distribution looks patterned, skin looks unusually smooth, dental appearance looks commercially perfect, or subject lighting/shadows disagree with the room. Correct the local realism while preserving identity, pose, room geometry, selected expression, selected hair arrangement, and permitted clothing state.`;

const CAR_INTERIOR_SAUDI_PARKING_LOCK = `CAR INTERIOR — SAUDI PARKING LOCK
This rule becomes mandatory whenever a car-interior template or car reference is active.
- The vehicle is stationary and parked in Saudi Arabia for the entire photographic event. Never depict the car as moving, driving, merging, turning, accelerating, braking in traffic, or traveling on a road while the selfie is being made.
- Any exterior context visible through the windshield, side windows, mirrors, or sunroof must read as a plausible Saudi parking environment appropriate to the selected time of day, such as an outdoor parking lot, covered parking, mall parking, hotel parking, office parking, restaurant parking, or indoor garage.
- The vehicle interior itself is immutable reference geometry: preserve the exact seats, upholstery, stitching, steering wheel, dashboard, displays, center console, gear selector, trim, doors, mirrors, roof, sunroof, pillars, window shapes, colors, materials, proportions, wear, and visible small details from the car reference. Do not redesign, replace, recolor, clean, move, mirror, simplify, or invent interior parts.
- Time-of-day or lighting changes may alter illumination, reflections, exposure, white balance, window brightness, and physically plausible exterior light only. They must not alter the interior design or create new fixtures, screens, controls, ambient-light strips, accessories, or trim.
- The person, clothing, hairstyle arrangement, facial expression, pose, time of day, and physically valid lighting may vary according to the selected template. The car remains the same car.
- Keep the Saudi parking background secondary and believable. Do not invent prominent readable license plates, brand signage, road signs, or location text unless they are explicitly present in the reference or separately requested.
- FINAL VEHICLE GATE: if the car appears to be moving, the outside context reads as active roadway travel, or any interior component changes identity or geometry relative to the reference, the result is invalid and must be corrected before output.`;

export const MASTER_POLICY = Object.freeze({
  immutablePhotographicRealismLock: IMMUTABLE_PHOTOGRAPHIC_REALISM_LOCK,
  carInteriorSaudiParkingLock: CAR_INTERIOR_SAUDI_PARKING_LOCK,
  globalSelfieArmRule: "The camera-holding arm and phone are always physically solved outside the crop and must never appear in the finished image. Any visible-arm or arm-extension instruction is invalid.",
  eventRule: `Interpret every selected value as one physically coherent photographic event.\n\n${IMMUTABLE_PHOTOGRAPHIC_REALISM_LOCK}\n\n${CAR_INTERIOR_SAUDI_PARKING_LOCK}`,
  conflictDomains: [
    "identity",
    "place and room continuity",
    "vehicle-interior continuity and stationary Saudi parking context when a car template is active",
    "anatomy and support surfaces",
    "camera-holding arm exclusion and reachable phone position",
    "camera and lens geometry",
    "perspective and reflections",
    "lighting and exposure",
    "skin, hair, beard, teeth, and body-hair natural variation",
    "micro-detail integrity at fingers, textiles, footwear, and object boundaries",
    "single phone-processing consistency across subject and environment",
    "materials, scale, and depth of field"
  ],
  realismRule: "Realism must come from optics, light, anatomy, pressure, gravity, friction, natural human variation, micro-detail integrity, a physically reachable hidden selfie arm, and one ordinary phone-processing pipeline—not visible arm elongation, artificial detail injection, selective beautification, or synthetic perfection.",
  forbiddenTechniques: [
    "visible camera-holding arm",
    "visible camera-holding hand or phone",
    "foreground selfie-arm elongation",
    "0.5x or fisheye arm exaggeration",
    "forced-perspective limb stretching",
    "moving-car selfie capture",
    "active-roadway car-interior selfie context",
    "vehicle-interior redesign or substitution",
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
