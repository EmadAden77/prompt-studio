import { LIGHTING_REALISM_BLOCK } from "../data/lightingData.js";

const PHONE_SCREEN_ONLY_NEGATIVE_PROMPT = "warm lamp glow, lit bedside lamp, amber cast on skin, orange light on wall, illuminated lamp shade, studio warm fill, cinematic grading";

export function buildLightingSection(opt) {
  if (!opt) {
    return `LIGHTING: Use only physically motivated light visible or supported by IMAGE B.
${LIGHTING_REALISM_BLOCK}`;
  }

  const section = `LIGHTING: ${opt.name_en}.
${opt.physics}
Color temperature: ${opt.kelvin}. Quality: ${opt.quality}.
Shadows: ${opt.shadows}. Catchlights: ${opt.catchlights}.
Room response: ${opt.room_effect}. Exposure: ${opt.iso}.
${LIGHTING_REALISM_BLOCK}`;

  if (!opt.disable_visible_lamps) return section;

  const STRICT_PHONE_SCREEN_ONLY_ENFORCEMENT = `
STRICT "PHONE SCREEN ONLY" ENFORCEMENT — NON-NEGOTIABLE
The bedside lamp visible in IMAGE B is an UNLIT decorative prop. It emits ZERO light.
Its shade and bulb show NO warm glow, NO inner light, NO warm cast on the wall
behind it, NO warm spill on the headboard, NO warm catchlight in the eyes.

If ANY warm orange/amber cast appears on skin, bedding, wall, or headboard —
the render is INVALID. Re-render from scratch with the lamp fully unlit.

The phone screen (held 35–45 cm from the face by the selfie hand) is the ONLY
photon source in the entire scene. Enforce:

1) FACE LIGHTING: cool ~6500K light from below-front, centered on the face.
   Slightly harsh highlights on the nose bridge and T-zone; soft upward shadow
   under the brows and under the chin; slight cool cast on skin.

2) CATCHLIGHTS: two rectangular phone-screen shapes in the eyes — NO round
   warm bulb glints, NO window rectangles, nothing else.

3) FALLOFF: rapid inverse-square falloff from the screen.
   - Face: readable with cool tone
   - Shoulder/chest: significantly darker, cool-tinted
   - Bedside area within 50cm: barely readable, deep cool shadows
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

  return `${section}

${STRICT_PHONE_SCREEN_ONLY_ENFORCEMENT}

NEGATIVE PROMPT — PHONE SCREEN ONLY:
${PHONE_SCREEN_ONLY_NEGATIVE_PROMPT}`;
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
