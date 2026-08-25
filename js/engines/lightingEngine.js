import { LIGHTING_REALISM_BLOCK } from "../data/lightingData.js";

const PHONE_SCREEN_ONLY_NEGATIVE_PROMPT = "warm lamp glow, lit bedside lamp, amber cast on skin, orange light on wall, illuminated lamp shade, studio warm fill, cinematic grading";

const CPR_01 = `CPR-01 — SELECTED LIGHTING AUTHORITY
The selected lighting option above is the only lighting source description in the final prompt. Delete/ignore any conflicting lighting description.
- Treat the selected preset as one authoritative lighting event. If that preset explicitly contains two physically real sources, use exactly those two and NO third source.
- Do not import lighting from IMAGE A. Do not preserve conflicting baseline illumination from IMAGE B merely because it existed in the reference capture; IMAGE B remains authoritative for geometry, furniture, materials, fixture positions, and object continuity, not for a conflicting light state.
- Changing lighting changes illumination only. It MUST NOT move, resize, rotate, mirror, recolor, clean, replace, redesign, add, or remove any furniture, landmark, fixture, clutter item, wall, floor, ceiling, bed, bedding, mirror, curtain, window, or material.
- Every cast shadow points away from a declared source. Every contact shadow stays attached to the real contact surface. Every highlight, catchlight, reflection, and brightness gradient must trace back to a declared source.
- Reflections on glass, mirrors, polished tile, metal, glossy furniture, eyes, and skin may come ONLY from declared sources. Never invent decorative reflections or a hidden fill.
- Daylight presets only: allow window/curtain-shaped light patches where geometry supports them, mostly one dominant shadow direction, slight visible dust only inside direct sun rays, and modest natural highlight clipping near bright openings from ordinary phone HDR.
- Night/low-light presets only: darkness must remain genuinely dark. No magical ambient brightness. Preserve realistic luminance noise and slight chroma noise in darker regions, modest practical-source halos only when that source is actually selected, and source-shaped eye catchlights.
- Mixed-color presets keep their real color-temperature separation; do not neutralize everything into clean white light.
- Use one smartphone exposure, one white-balance solution, one HDR/noise-reduction event, and one tone-mapping pipeline for the entire frame. No selective relighting of the face.
- Forbidden: invisible fill light, studio softbox, ring light, beauty lighting, cinematic rim light, orange-teal grading, artificial global glow, fake volumetric beams, or shadow directions that disagree with the declared source geometry.`;

const PHONE_SCREEN_ONLY_PHYSICS = "The phone screen is the only light in the room. Because the same phone is also the front-camera capture device, keep the screen-to-face distance physically consistent with the selfie reach at about 45–70 cm. Cool screen light arrives from close below-front around the optical axis, with inverse-square falloff: the face is readable, shoulders and bedding fall darker, and the room beyond roughly 1 m approaches near darkness. Slightly upward-biased facial shadows may appear under brows and chin. NO ceiling light, window light, bedside-lamp light, hidden fill, or studio source is added. Any visible bedside lamp, lamp shade, or bulb is an unlit decorative prop that emits ZERO light, with no warm glow, no inner illumination, no warm wall/headboard spill, and no warm eye catchlight.";

export function buildLightingSection(opt) {
  if (!opt) {
    return `LIGHTING: Use only physically motivated light visible or supported by IMAGE B.\n${CPR_01}\n${LIGHTING_REALISM_BLOCK}`;
  }

  const physics = opt.id === "phone_screen_only" ? PHONE_SCREEN_ONLY_PHYSICS : opt.physics;
  const section = `LIGHTING — USER SELECTED\nSELECTED LIGHTING OPTION — LITERAL: "${opt.name_en}".\n${physics}\nColor temperature: ${opt.kelvin}. Quality: ${opt.quality}.\nShadows: ${opt.shadows}. Catchlights: ${opt.catchlights}.\nRoom response: ${opt.room_effect}. Exposure: ${opt.iso}.\n\n${CPR_01}\n\n${LIGHTING_REALISM_BLOCK}`;

  if (!opt.disable_visible_lamps) return section;

  const STRICT_PHONE_SCREEN_ONLY_ENFORCEMENT = `
STRICT "PHONE SCREEN ONLY" ENFORCEMENT — NON-NEGOTIABLE
The bedside lamp visible in IMAGE B is an UNLIT decorative prop. It emits ZERO light.
Its shade and bulb show NO warm glow, NO inner light, NO warm cast on the wall
behind it, NO warm spill on the headboard, NO warm catchlight in the eyes.

If ANY warm orange/amber cast appears on skin, bedding, wall, or headboard —
the render is INVALID. Re-render from scratch with the lamp fully unlit.

The phone screen, held at the same physically reachable 45–70 cm selfie distance,
is the ONLY photon source in the entire scene. Enforce:

1) FACE LIGHTING: cool ~6500K light from below-front near the optical axis.
   Slightly harsh highlights on the nose bridge and T-zone; soft upward shadow
   under the brows and under the chin; slight cool cast on skin.

2) CATCHLIGHTS: two rectangular phone-screen shapes in the eyes — NO round
   warm bulb glints, NO window rectangles, nothing else.

3) FALLOFF: rapid inverse-square falloff from the screen.
   - Face: readable with cool tone
   - Shoulder/chest: significantly darker, cool-tinted
   - Bedside area within the near field: barely readable, deep cool shadows
   - Beyond ~1 meter: NEAR BLACK (lamp, wall, headboard, floor almost invisible)
   - Background behind the lamp: essentially black with only faint noise detail

4) EXPOSURE: automatic low-light phone exposure pushed to ISO 1600–3200.
   Visible luminance noise in shadows and midtones; slight chroma noise in the
   darkest regions; realistic shadow noise; NO noise-free clean rendering.

5) ABSOLUTELY FORBIDDEN in this render:
   - Any warm light, amber glow, or orange cast anywhere
   - Any ceiling light, window light, or secondary source
   - A lamp shade that looks internally illuminated
   - Even lighting across the room
   - Studio-quality clean shadows
   - Cinematic warm grading or orange-teal look
`;

  return `${section}\n\n${STRICT_PHONE_SCREEN_ONLY_ENFORCEMENT}\n\nNEGATIVE PROMPT — PHONE SCREEN ONLY:\n${PHONE_SCREEN_ONLY_NEGATIVE_PROMPT}`;
}

export class LightingEngine {
  constructor(options = []) {
    this.options = [...options];
  }

  getById(lightingId) {
    return this.options.find((item) => item.id === lightingId) ?? this.options[0] ?? null;
  }

  getMissingFeatures(lighting, scene) {
    if (!lighting || !scene) return lighting?.required_features ?? [];
    return lighting.required_features.filter((feature) => !scene.visible_features.includes(feature));
  }

  buildPrompt(lighting) {
    return buildLightingSection(lighting);
  }
}
