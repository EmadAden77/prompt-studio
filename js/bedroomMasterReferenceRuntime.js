import { PromptEngine } from "./engines/promptEngine.js";

const SINGLE_MASTER_LOCK = `SINGLE BEDROOM MASTER REFERENCE — HIGHEST PRIORITY
- Exactly ONE attached image is used: MASTER REFERENCE.
- MASTER REFERENCE is simultaneously the sole visual authority for the real subject identity AND the exact bedroom geometry/environment.
- Preserve stable facial geometry from MASTER REFERENCE: face width/length, cheek fullness, jaw/chin, nose, lip volume, eye size/spacing/eyelid shape, ears, hairline, hair density, beard pattern/density, skin tone, apparent age, and natural asymmetry.
- Preserve the bedroom from the same MASTER REFERENCE: bed, chair, wardrobe, dresser/vanity, rug, curtains, floor, ceiling, lights, doors, mirrors, clutter, materials, scale, relative placement, and all visible architectural geometry.
- Internal scene/zone metadata may choose WHERE the selected pose interacts inside this room, but it is planning metadata only. It is NEVER a second visual reference and must never redesign, replace, invent, or move room elements.
- The selected template may change pose, body placement, expression muscle state, clothing, camera framing, and selected lighting only within the real geometry supported by MASTER REFERENCE.
- Expression is muscle state only and must never change identity geometry.
- If a requested support object or interaction point is not actually visible/supported by MASTER REFERENCE, do not invent it; use the nearest valid supported placement or reject that interpretation.
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
      "MASTER REFERENCE — IDENTITY AUTHORITY: Use $1 as the sole identity authority; preserve stable facial geometry exactly."
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
    );

  return `${SINGLE_MASTER_LOCK}\n\n${prompt}`;
};
