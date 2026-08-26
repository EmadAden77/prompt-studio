import { PromptEngine } from "./engines/promptEngine.js";

const SINGLE_MASTER_LOCK = `SINGLE BEDROOM MASTER REFERENCE — HIGHEST PRIORITY
- Exactly ONE attached image is used: MASTER REFERENCE.
- MASTER REFERENCE is simultaneously the sole visual authority for the real subject identity AND the exact bedroom geometry/environment.

FACE IDENTITY ZONE — ABSOLUTE PRIORITY INSIDE MASTER REFERENCE
- Treat the visible face/head region of MASTER REFERENCE as a dedicated FACE IDENTITY ZONE with higher authority than pose, camera, expression, lighting, clothing, aesthetics, or room-composition preferences.
- Preserve stable facial geometry exactly: face width/length ratio, forehead proportions, temple width, cheek fullness, zygomatic width, jaw angle, jaw width, chin width/projection, nose bridge/width/tip, nostril geometry, philtrum, lip volume/shape, eye size/spacing/canthus positions, eyelid shape, eyebrow placement, ear shape/position, hairline, hair density, beard outline/pattern/density/gaps, skin tone, apparent age, and natural asymmetry.
- Do NOT reinterpret the face according to the selected pose, mood, camera angle, lighting style, masculinity, attractiveness, or aesthetic preference.
- Perspective may change only what a real camera viewpoint physically changes. Perspective must never be used as an excuse to lengthen, narrow, widen, sharpen, hollow, symmetrize, beautify, mature, rejuvenate, or otherwise redesign the face.
- If the face occupies relatively few pixels in MASTER REFERENCE, preserve the visible coarse identity geometry and uncertainty. NEVER hallucinate a cleaner, sharper, more idealized, more generic, or more conventionally attractive face to fill missing detail.
- Do not infer hidden identity details from stereotypes, age, ethnicity, hairstyle, beard style, expression, or body build.

IDENTITY SUPERIMPOSITION TEST — MANDATORY
- Mentally align the generated head with the FACE IDENTITY ZONE from MASTER REFERENCE after accounting only for legitimate camera perspective and head rotation.
- Stable landmarks must remain consistent: outer face contour, brow line, eye centers and spacing, nose root/tip/base, mouth center and width, jaw corners, chin center, ears, hairline, and beard boundary.
- Expression may alter only soft-tissue muscle state around mouth, cheeks, brows, and eyelids. It must not alter skull/face proportions or stable landmark relationships.
- If the result would read as a sibling, look-alike, beautified version, thinner-faced version, sharper-jawed version, more rugged version, or simply a different man, the result is INVALID.

ROOM GEOMETRY ZONE — SECOND PRIORITY INSIDE THE SAME MASTER REFERENCE
- Preserve the bedroom from the same MASTER REFERENCE: bed, chair, wardrobe, dresser/vanity, rug, curtains, floor, ceiling, lights, doors, mirrors, clutter, materials, scale, relative placement, and all visible architectural geometry.
- Internal scene/zone metadata may choose WHERE the selected pose interacts inside this room, but it is planning metadata only. It is NEVER a second visual reference and must never redesign, replace, invent, or move room elements.
- The selected template may change pose, body placement, expression muscle state, clothing, camera framing, and selected lighting only within the real geometry supported by MASTER REFERENCE.
- If a requested support object or interaction point is not actually visible/supported by MASTER REFERENCE, do not invent it; use the nearest valid supported placement or reject that interpretation.

EXPRESSION = MUSCLE STATE ONLY
- Expression cannot alter face shape, cheek volume baseline, jawline, chin, nose, eye size/spacing, lip volume baseline, hairline, beard geometry, or apparent age.
- confident/serious/tired/relaxed/smiling are muscle-state labels only, never identity redesign instructions.

IDENTITY-DRIFT NEGATIVES
- Forbidden: different person, look-alike, sibling-like face, generic Middle Eastern male face, beautified face, thinner face, longer face, wider face, hollow cheeks, fuller cheeks, sharper jaw, broader jaw, different chin, narrower eyes, larger eyes, different eye spacing, different nose, altered lip volume, changed beard line, denser beard, cleaner beard, changed hairline, younger face, older face, ruggedized face, masculine enhancement, facial symmetry correction, selective face sharpening, selective face denoising, selective face relighting, beauty retouching, synthetic skin cleanup.

- One real person, one real bedroom, one coherent photographic event. CAPTURED, NOT RENDERED.`;

const originalGenerate = PromptEngine.prototype.generate;

PromptEngine.prototype.generate = function generateSingleBedroomMasterReference(config) {
  let prompt = originalGenerate.call(this, config);

  prompt = prompt
    .replaceAll("IMAGE A", "MASTER REFERENCE")
    .replaceAll("IMAGE B", "MASTER REFERENCE")
    .replaceAll("the user-selected built-in room reference", "the internally selected spatial-zone metadata")
    .replace(
      "edit MASTER REFERENCE in place as the immutable room plate and insert the person from MASTER REFERENCE",
      "edit the attached MASTER REFERENCE in place, preserving the same real person and exact bedroom while changing only the selected template action"
    )
    .replace(
      "generate one new photograph from a physically reachable viewpoint inside the same three-dimensional room represented by MASTER REFERENCE, using MASTER REFERENCE only for identity",
      "generate one new photograph of the same real person inside the exact same three-dimensional bedroom represented by the attached MASTER REFERENCE"
    )
    .replace(
      /MASTER REFERENCE — IDENTITY ONLY: Use ([^\n]+) exclusively for identity\./,
      "MASTER REFERENCE — FACE IDENTITY AUTHORITY: Use $1 as the sole identity authority. The FACE IDENTITY ZONE has absolute priority over pose, camera, lighting, expression, clothing, and aesthetics. Preserve stable facial geometry exactly; missing fine detail must remain uncertain rather than being invented."
    )
    .replace(
      /MASTER REFERENCE — ROOM ONLY: Use the internally selected spatial-zone metadata[^\n]*\n/,
      "MASTER REFERENCE — ROOM GEOMETRY AUTHORITY: Use the attached MASTER REFERENCE as the sole visual room authority. The internally selected spatial-zone metadata below is planning metadata only and contributes no visual appearance.\n"
    )
    .replaceAll(
      "MASTER REFERENCE controls identity only; its expression, clothing, lighting, pose, and camera viewpoint do not transfer.",
      "MASTER REFERENCE controls stable identity geometry and the immutable bedroom. Expression, clothing, pose, camera, and lighting may change only when explicitly selected and must not alter identity or room geometry."
    )
    .replaceAll(
      "MASTER REFERENCE controls the same room and the selected real seat/support location only.",
      "MASTER REFERENCE controls the exact same room and real seat/support geometry; internal zone metadata only identifies the intended interaction area."
    )
    .replaceAll(
      "MASTER REFERENCE controls the same room and the selected real standing location only.",
      "MASTER REFERENCE controls the exact same room and real standing geometry; internal zone metadata only identifies the intended interaction area."
    )
    .replaceAll(
      "MASTER REFERENCE controls the same room and bed only.",
      "MASTER REFERENCE controls the exact same room, bed, and stable identity geometry."
    )
    .replaceAll(
      "The setting is the selected bedroom reference, exactly the same room as MASTER REFERENCE with the same furniture, materials, layout, and visible clutter.",
      "The setting is exactly the bedroom visible in MASTER REFERENCE, with the same furniture, materials, layout, scale, and visible clutter."
    )
    .replaceAll(
      "Change facial muscle state only; preserve identity geometry and natural asymmetry from MASTER REFERENCE.",
      "Change facial muscle state only. Preserve face width/length, cheek fullness baseline, jaw/chin geometry, nose geometry, eye size/spacing, lip-volume baseline, ears, hairline, beard geometry, skin tone, apparent age, and natural asymmetry from the FACE IDENTITY ZONE of MASTER REFERENCE."
    );

  prompt = prompt.replace(
    /NEGATIVE PROMPT\n/,
    "NEGATIVE PROMPT\ndifferent person, look-alike, sibling-like face, generic face, identity drift, face reshaping, thinner face, longer face, hollow cheeks, sharper jaw, altered chin, changed eye size, changed eye spacing, changed nose, changed lip volume, changed beard geometry, changed hairline, age drift, beautified face, ruggedized face, facial symmetry correction, selective face sharpening, selective face denoising, selective face relighting, "
  );

  return `${SINGLE_MASTER_LOCK}\n\n${prompt}`;
};
