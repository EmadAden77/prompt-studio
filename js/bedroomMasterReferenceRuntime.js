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

ROOM REPROJECTION LOCK — HIGHEST PRIORITY FOR BEDROOM CONTINUITY
- MASTER REFERENCE is the exact physical bedroom, not a style guide, mood board, loose room description, or semantic inspiration.
- Preserve the exact spatial relationships among all visible landmarks: bed, padded headboard, bedside table, lamp, wardrobe, mirrored wardrobe panels, dresser/vanity, curtains, rug, floor, walls, ceiling, AC unit, clutter, shoes, bottles, cables, and other visible objects.
- A new selfie viewpoint may change ONLY perspective, crop, occlusion, apparent size, reflection angle, and visibility caused by the real camera move.
- It may NEVER change object identity, object count, relative order, furniture scale, furniture position, furniture orientation, room proportions, wall relationships, ceiling height, material identity, or architectural structure.
- Never reconstruct a generic bedroom from semantic memory merely because the viewpoint changes.

REFERENCE-SUPPORTED VIEW ONLY
- Reveal only geometry that can be reasonably inferred from surfaces and relationships already visible in MASTER REFERENCE.
- Never invent unseen back sides, hidden furniture, hidden wall sections, unsupported room continuation, or decorative replacement objects.
- If a requested camera angle would require unsupported hidden geometry, tighten, shift, or rotate the crop so that unsupported regions remain outside frame.
- Cropping is preferred over hallucination. Occlusion is preferred over invention. Darkness is preferred over replacement. Preserve ambiguity where the reference is ambiguous.

LANDMARK CONSTELLATION LOCK
- The padded black headboard remains on the same wall and in the same relationship to the bed.
- The bedside lamp remains in the same physical position relative to the headboard and bedside table.
- The wardrobe remains on the same wall with the same mirrored-panel spacing, proportions, and orientation.
- The dresser/vanity remains adjacent to the same wardrobe wall in the same physical relationship.
- The curtains remain on the same rear wall.
- Bed orientation and mattress alignment remain unchanged.
- Floor tile direction and scale remain unchanged.
- Visible clutter remains where recorded unless naturally hidden by the new viewpoint, crop, subject occlusion, or darkness.

CLOSE SELFIE BACKGROUND RULE
- For close or medium-close bed selfies, the background must be a physically plausible crop of the exact same bedroom.
- Show only nearby elements supported by MASTER REFERENCE, prioritizing pillow, bedding, padded black headboard, real bedside lamp, real bedside table, wardrobe/mirror edge, dresser edge, or curtains only when geometrically reachable from the subject-held phone viewpoint.
- Do not widen the scene merely to prove room identity.
- Do not simplify or restyle the room into a generic hotel bedroom.
- If exact continuity conflicts with showing more background, preserve exact continuity and show LESS background.

LIGHTING DOES NOT REBUILD GEOMETRY
- Changing lighting changes illumination, exposure, shadow, color temperature, reflections, noise, and visibility only.
- Lighting NEVER changes furniture geometry, room layout, object placement, material identity, wall structure, ceiling structure, or architectural proportions.
- Darkness may hide unsupported details; darkness must never be used as permission to replace or redesign them.

ROOM SIMILARITY GATE — MANDATORY
- Before output, compare every visible room landmark against MASTER REFERENCE.
- INVALID if the headboard shape changes, wardrobe structure changes, dresser position changes, lamp position changes, bed orientation changes, wall relationships change, furniture proportions change, new furniture appears, or visible clutter is relocated without a physical occlusion reason.
- A room that merely looks similar is INVALID. It must read as the same physical room.
- If maintaining the selected selfie angle would require changing the room, KEEP THE ROOM and reduce the visible background instead.

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
      "generate only a reference-supported re-projection of the same real person from a physically reachable nearby viewpoint inside the exact bedroom represented by MASTER REFERENCE; do not synthesize unseen room geometry, and keep unsupported regions cropped, occluded, dark, or out of frame"
    )
    .replace(
      "generate one new photograph of the same real person inside the exact same three-dimensional bedroom represented by the attached MASTER REFERENCE",
      "generate only a reference-supported re-projection of the same real person from a physically reachable nearby viewpoint inside the exact bedroom represented by the attached MASTER REFERENCE; do not synthesize unseen room geometry, and keep unsupported regions cropped, occluded, dark, or out of frame"
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
      "The setting is exactly the bedroom visible in MASTER REFERENCE, with the same furniture, materials, layout, scale, and visible clutter. Any new viewpoint is a reference-supported re-projection only; unsupported hidden geometry stays out of frame."
    )
    .replaceAll(
      "Change facial muscle state only; preserve identity geometry and natural asymmetry from MASTER REFERENCE.",
      "Change facial muscle state only. Preserve face width/length, cheek fullness baseline, jaw/chin geometry, nose geometry, eye size/spacing, lip-volume baseline, ears, hairline, beard geometry, skin tone, apparent age, and natural asymmetry from the FACE IDENTITY ZONE of MASTER REFERENCE."
    )
    .replace(
      /ROOM LOCK\nGENERATE MODE: Render a new viewpoint of the same physical room while preserving its known three-dimensional continuity\./,
      "ROOM LOCK\nREFERENCE-ANCHORED REPROJECTION MODE: Render only a reference-supported re-projection from a physically reachable nearby viewpoint inside the exact same room. Do not synthesize unseen room geometry. Any unsupported region must remain cropped, occluded, dark, ambiguous, or out of frame."
    )
    .replaceAll(
      "a physically reachable new camera position in the same room",
      "a physically reachable nearby camera position only where the resulting visible geometry remains reference-supported"
    )
    .replaceAll(
      "revealing impossible sides of fixed objects",
      "revealing impossible or unsupported sides of fixed objects; inventing hidden room continuation; replacing cropped geometry with semantically similar furniture"
    );

  prompt = prompt.replace(
    /NEGATIVE PROMPT\n/,
    "NEGATIVE PROMPT\ndifferent room, similar-but-not-identical bedroom, generic hotel bedroom, redesigned bedroom, changed headboard, changed wardrobe, changed dresser position, changed lamp position, changed bed orientation, altered wall relationship, changed furniture scale, invented hidden furniture, invented unseen wall, relocated clutter, semantic room reconstruction, unsupported background completion, different person, look-alike, sibling-like face, generic face, identity drift, face reshaping, thinner face, longer face, hollow cheeks, sharper jaw, altered chin, changed eye size, changed eye spacing, changed nose, changed lip volume, changed beard geometry, changed hairline, age drift, beautified face, ruggedized face, facial symmetry correction, selective face sharpening, selective face denoising, selective face relighting, "
  );

  return `${SINGLE_MASTER_LOCK}\n\n${prompt}`;
};
