import {
  SELFIE_VIEWPOINT_LOCK,
  CAMERA_EMULATOR,
  LIGHTING_PHYSICS_LOCK,
  PHONE_SCREEN_ONLY_STRICT,
  NIGHT_REALISM_LOCK,
  CLUTTER_REALISM_LOCK,
  GROUP_SELFIE_REALISM_LOCK,
  SOFA_GROUNDING_LOCK,
  SINGLE_PIPELINE,
  HAIR_REALISM_LOCK,
  CLOTHING_LOCK,
  EXPRESSION_LOCK,
  BEDDING_PHYSICS_LOCK,
  GROUNDING,
  imperfectionManifest
} from "./realismLocks.js";
import { REALISTIC_IMAGE_GENERATOR_RULES } from "./realisticImageGeneratorRules.js";
import { LIGHTING_REALISM_BLOCK } from "../data/lightingData.js";
import { SCENES } from "../data/scenesData.js";
import { PHYSICS_CONTRACT } from "../policies/physicsPolicy.js";
import { COMPANIONS, buildCompanionsSection } from "../data/companionsData.js";
import { buildCompanionPosesSection } from "../data/companionPosesData.js";

const BEDROOM_SCENE_IDS = new Set(SCENES.map((scene) => scene.id));

export class PromptEngine {
  constructor({ identityEngine, roomLockEngine, poseEngine, cameraEngine, lightingEngine }) {
    this.identityEngine = identityEngine;
    this.roomLockEngine = roomLockEngine;
    this.poseEngine = poseEngine;
    this.cameraEngine = cameraEngine;
    this.lightingEngine = lightingEngine;
  }

  isBedroomPrompt(c) {
    return Boolean(c?.scene && BEDROOM_SCENE_IDS.has(c.scene.id));
  }

  isTextRoomReference(c) {
    return Boolean(c.scene?.text_reference && c.scene?.description_en);
  }

  roomDescription(c) {
    if (!this.isTextRoomReference(c)) return "";
    return `[ROOM DESCRIPTION — PERMANENT TEXT REFERENCE]\n${c.scene.description_en}\nThis fixed text-only room description is the sole room authority. IMAGE B is intentionally absent: do not request it, substitute another room, or raise a missing-reference conflict.`;
  }

  buildNaturalBrief(c) {
    const personDescription = this.identityEngine.fixedData?.person?.description
      ?? "Middle Eastern man, 35 years old, 195 cm tall, 88 kg, with a lightly athletic build";
    const sceneName = c.scene?.name_en ?? "the selected bedroom reference";
    const poseName = c.pose?.name_en?.toLowerCase() ?? "positioned naturally in the selected scene";
    const lightingName = c.lighting?.name_en?.toLowerCase() ?? "the selected physically motivated lighting";
    const aspect = ["9:16", "1:1", "16:9"].includes(c.aspect) ? c.aspect : "9:16";
    const aspectLabel = aspect === "9:16" ? "vertical phone selfie" : aspect === "1:1" ? "square phone selfie" : "horizontal phone selfie";
    const roomAuthority = this.isTextRoomReference(c)
      ? "using the fixed [ROOM DESCRIPTION] as the sole room authority; IMAGE B is intentionally absent."
      : "using IMAGE B only as room geometry/material authority.";

    return `PHOTOGRAPHIC BRIEF — NATURAL FIVE-PART BRIEF\nSubject: the exact real man from IMAGE A, ${personDescription}, with unchanged identity geometry, skin tone, hairline and beard pattern.\nSetting: ${sceneName}, ${roomAuthority}\nAction / pose: ${poseName}, physically supported by the real bed, seat, floor or furniture required by the selected pose.\nPhotographic style: ordinary candid smartphone selfie, not studio, CGI, commercial portrait or cinematic render; aspect ratio ${aspect} ${aspectLabel}.\nLighting / camera: ${lightingName}, captured with the Xiaomi 15 Ultra front camera from a physically reachable arm-length viewpoint.`;
  }

  identityLock() {
    return `IDENTITY LOCK — IMAGE A ONLY\n${this.identityEngine.buildPersonText()}\n${this.identityEngine.buildLockText()}\nPreserve face width/length, cheek fullness, jaw/chin, nose, lip volume, eye size/spacing, ears, hairline, beard pattern, skin tone, age cues and natural asymmetry. Do not beautify, symmetrize, slim, sharpen or redesign the face.`;
  }

  roomLock(c, roomMode = "GENERATE") {
    const textReference = this.isTextRoomReference(c);
    return `ROOM LOCK — ${textReference ? "FIXED TEXT REFERENCE" : "IMAGE B ONLY"}\n${this.roomLockEngine.buildAuthorityText(c.scene)}\n${this.roomLockEngine.buildLockText(roomMode, c.scene)}\nDo not move, clean, replace, mirror, resize or redesign room geometry, furniture, bedding, fixtures, materials or visible clutter.`;
  }

  furnitureAnchorText(c) {
    if (!c.pose) return "";
    const poseSections = this.poseEngine.engineer({
      pose:c.pose,
      expression:c.expression,
      hair:c.hair,
      clothing:c.clothing,
      autoEngineering:c.autoEngineering
    });
    const anchor = poseSections?.furnitureAnchor ?? "";
    if (!anchor) return "";
    const surface = this.poseEngine.supportSurfaceOf?.(c.pose);
    const authority = this.roomLockEngine.buildFurnitureAnchorAuthority?.(surface, c.scene) ?? "";
    return [anchor, authority].filter(Boolean).join("\n");
  }

  clutterText(c) {
    const t = c.clutter;
    if (!t) return "";
    return `CLUTTER (user-selected, movable props only): ${t.items}. Physics: ${t.physics}. Anti-AI: ${t.anti}.\n${CLUTTER_REALISM_LOCK}`;
  }

  posePhysics(c) {
    const poseSections = c.pose
      ? this.poseEngine.engineer({
          pose: c.pose,
          expression: c.expression,
          hair: c.hair,
          clothing: c.clothing,
          autoEngineering: c.autoEngineering
        })
      : null;
    const placement = c.autoEngineering?.orientation ? `\nDeterministic orientation: ${c.autoEngineering.orientation}` : "";
    return `${poseSections?.posePhysics ?? "POSE & PHYSICS: keep anatomy, gravity, support, pressure and contact mechanically possible."}${placement}`;
  }

  bedroomTemplateText(c) {
    const t = c.bedTemplate;
    if (!t) return "";
    return `BEDROOM TEMPLATE: ${t.en} — camera ${t.angle}; ${t.dist}; framing ${t.frame}; gaze ${t.gaze}. Anatomy: ${t.anatomy}. Light: ${t.light}. ANTI-AI: ${t.anti}.`;
  }

  nightTemplateText(c) {
    const t = c.nightTemplate;
    if (!t) return "";
    return `NIGHT BEDROOM TEMPLATE: ${t.en} — camera ${t.angle}; ${t.dist}; framing ${t.frame}; gaze ${t.gaze}. Anatomy: ${t.anatomy}. Light source / physics: ${t.light}. ANTI-AI: ${t.anti}.`;
  }

  sofaTemplateText(c) {
    const t = c.sofaTemplate;
    if (!t) return "";
    return `SOFA TEMPLATE: ${t.en} — camera ${t.angle}; ${t.dist}; framing ${t.frame}; gaze ${t.gaze}. Anatomy: ${t.anatomy}. Light source / physics: ${t.light}. ANTI-AI: ${t.anti}.`;
  }

  lightingText(c) {
    const l = c.lighting ?? {};
    const parts = [
      `Lighting: ${l.name_en ?? l.name_ar ?? l.id ?? "selected lighting"}.`,
      l.physics,
      l.shadows ? `Shadows: ${l.shadows}.` : "",
      l.catchlights ? `Catchlights: ${l.catchlights}.` : "",
      l.room_effect ? `Room: ${l.room_effect}.` : "",
      l.iso ? `Exposure: ${l.iso}.` : ""
    ].filter(Boolean);
    if (l.category === "isolation") {
      parts.push(`LOW-LIGHT SENSOR BEHAVIOR: ${l.iso ?? "high-ISO phone exposure"}; visible luminance noise and restrained chroma noise in shadow regions; black areas must not become clean, noise-free synthetic black.`);
    }
    if (l.id === "ac_led_micro") {
      parts.push("MICRO-SOURCE RULE: visible AC/charger indicators are emissive dots that cast NO light; they never illuminate skin, walls, bedding or furniture.");
    }
    return parts.join(" ");
  }

  clothingText(c) {
    const clothing = c.clothing ?? {};
    const fabric = clothing.fabric ?? {};
    return `Garment: ${clothing.pieces ?? clothing.name_en ?? clothing.name_ar ?? "the selected garment"}. Fabric: ${fabric.type ?? "material-correct"}, ${fabric.weight ?? "natural weight"}, sheen ${fabric.sheen ?? "material-correct"}; folds: ${fabric.folds ?? "gravity-, joint-, friction- and pressure-driven"}.`;
  }

  companionsText(c) {
    return buildCompanionsSection(c.companionSet, c.clothing, GROUP_SELFIE_REALISM_LOCK);
  }

  companionPosesText(c) {
    return buildCompanionPosesSection(c.companionSet, c.companionSeedExtra ?? 0, c.pose?.id ?? "", COMPANIONS);
  }

  finalCheckAndNegative(c = {}) {
    const companionCount = c.companionSet?.members?.length ?? 0;
    const peopleLine = companionCount
      ? `- The result is one coherent physical event with one main subject plus ${companionCount} selected companion${companionCount === 1 ? "" : "s"}, one room, one reachable selfie camera, one lighting event and one phone-processing pipeline.`
      : `- The result is one coherent physical event with one person, one room, one reachable selfie camera, one lighting event and one phone-processing pipeline.`;
    const roomAuthorityLine = this.isTextRoomReference(c)
      ? "- IMAGE A controls the main subject identity only; the fixed [ROOM DESCRIPTION] controls the room; IMAGE B is intentionally absent and is not required."
      : "- IMAGE A controls the main subject identity only; companion identities come only from their fixed persona specifications; IMAGE B controls room only.";
    const furnitureAuthorityLine = this.isTextRoomReference(c)
      ? "- Furniture materials, placement, scale and design must match [ROOM DESCRIPTION]; the body adapts to the fixed text room before the camera is derived."
      : "- Furniture position, orientation, scale and design remain exactly locked to IMAGE B; the body adapts to its verified support geometry before the camera is derived.";
    return `FINAL CHECK\n${peopleLine}\n${roomAuthorityLine}\n- Facial landmarks remain the same main subject after perspective and expression compensation; companion faces stay mutually distinct and never inherit IMAGE A.\n- Support surfaces carry weight; contact shadows attach to real contact points; no floating body, impossible limbs or decorative pressure marks.\n${furnitureAuthorityLine}\n- Lighting direction, shadows, catchlights, reflections, exposure, white balance and noise agree across every visible face, hair, clothing, bedding/furniture and room.\n- The phone viewpoint remains subject-held at arm's length. No third-person observer, room camera, tripod or photographer.\n\nNEGATIVE PROMPT\ncartoon, illustration, painting, CGI, 3D render, beauty filter, face smoothing, facial reshaping, thinner face, sharper jaw, narrower eyes, changed beard, same-face companions, twin effect, adult facial features on children, childlike skin on adults, immodest family framing, incomplete child clothing, evenly spaced group lineup, identical companion smiles, every person staring perfectly at lens, plastic skin, waxy skin, wire hair, helmet hair, extra fingers, extra arms, fused limbs, impossible joints, floating body, unsupported contact, backdrop-sitting in front of furniture, shifted furniture, resized furniture, rotated furniture, mirrored furniture, duplicated sofa, duplicated bed, duplicated chair, broken reflection, third-person view, observer camera, wide room shot, camera at foot of bed, doorway camera, tripod, another photographer, full-body distant selfie, fake DSLR bokeh, cinematic grading, studio softbox, hidden fill, extreme HDR, artificial glow, fake 8K detail, destructive noise, unrequested text or logos.`;
  }

  generateV2(c) {
    const s = [];
    s.push(`TASK: one ordinary, coherent, physically believable smartphone photograph. Use IMAGE A only for identity and ${this.isTextRoomReference(c) ? "the fixed text [ROOM DESCRIPTION] only for the room; IMAGE B is intentionally absent." : "IMAGE B only for the room."} Return only the final image.`);
    s.push(REALISTIC_IMAGE_GENERATOR_RULES);
    if (c.wikiPromptGuidance) s.push(c.wikiPromptGuidance);
    s.push(SELFIE_VIEWPOINT_LOCK);
    s.push(this.buildNaturalBrief(c));
    s.push(this.identityLock());
    s.push(this.roomDescription(c));
    s.push(this.roomLock(c, c.roomMode || "GENERATE"));
    s.push(this.furnitureAnchorText(c));
    s.push(this.clutterText(c));
    const bedroomPrompt = this.isBedroomPrompt(c);
    s.push(bedroomPrompt ? `[POSE]\n${this.posePhysics(c)}` : this.posePhysics(c));
    if (bedroomPrompt) s.push(PHYSICS_CONTRACT);
    s.push(this.bedroomTemplateText(c));
    s.push(this.nightTemplateText(c));
    s.push(this.sofaTemplateText(c));
    if (c.nightTemplate) s.push(NIGHT_REALISM_LOCK);
    if (c.sofaTemplate) s.push(SOFA_GROUNDING_LOCK);
    if (c.pose?.id?.startsWith("lying") || c.pose?.id === "semi_reclining") s.push(BEDDING_PHYSICS_LOCK);
    if (c.pose?.id?.startsWith("sitting")) s.push(GROUNDING.sitting);
    if (c.pose?.id?.startsWith("standing")) s.push(GROUNDING.standing);
    s.push(CAMERA_EMULATOR);
    s.push(`${EXPRESSION_LOCK}\nSelected expression muscles: ${c.expression?.muscle ?? "eyelids, brows, cheeks, jaw and lips remain in the selected natural muscle state"}.${c.expression?.forbidden ? " FORBIDDEN with it: " + c.expression.forbidden + "." : ""}`);
    s.push(`${HAIR_REALISM_LOCK}\nArrangement: ${c.hair?.name_en ?? c.hair?.name_ar ?? "preserve IMAGE A arrangement"}.`);
    s.push(`${CLOTHING_LOCK}\n${this.clothingText(c)}`);
    s.push(this.companionsText(c));
    s.push(this.companionPosesText(c));
    const lightingBlock = `${LIGHTING_PHYSICS_LOCK}\n${this.lightingText(c)}\n\n${LIGHTING_REALISM_BLOCK}`;
    s.push(bedroomPrompt ? `[LIGHTING]\n${lightingBlock}` : lightingBlock);
    if (["phone_screen_only", "phone_dark_closeup"].includes(c.lighting?.id) || c.nightTemplate?.cat === "dark") s.push(PHONE_SCREEN_ONLY_STRICT);
    s.push(SINGLE_PIPELINE);
    s.push(imperfectionManifest(c));
    s.push(this.finalCheckAndNegative(c));
    const prompt = s.filter(Boolean).join("\n\n");
    c.generatedPrompt = prompt;
    return prompt;
  }

  generate(config) {
    return this.generateV2(config);
  }
}
