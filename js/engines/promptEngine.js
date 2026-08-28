import {
  SELFIE_VIEWPOINT_LOCK,
  CAMERA_EMULATOR,
  LIGHTING_PHYSICS_LOCK,
  PHONE_SCREEN_ONLY_STRICT,
  SINGLE_PIPELINE,
  HAIR_REALISM_LOCK,
  CLOTHING_LOCK,
  EXPRESSION_LOCK,
  BEDDING_PHYSICS_LOCK,
  GROUNDING,
  imperfectionManifest
} from "./realismLocks.js";

export class PromptEngine {
  constructor({ identityEngine, roomLockEngine, poseEngine, cameraEngine, lightingEngine }) {
    this.identityEngine = identityEngine;
    this.roomLockEngine = roomLockEngine;
    this.poseEngine = poseEngine;
    this.cameraEngine = cameraEngine;
    this.lightingEngine = lightingEngine;
  }

  buildNaturalBrief(c) {
    const personDescription = this.identityEngine.fixedData?.person?.description
      ?? "Middle Eastern man, 35 years old, 183 cm tall, 82 kg, with a lightly athletic build";
    const sceneName = c.scene?.name_en ?? "the selected bedroom reference";
    const poseName = c.pose?.name_en?.toLowerCase() ?? "positioned naturally in the selected scene";
    const lightingName = c.lighting?.name_en?.toLowerCase() ?? "the selected physically motivated lighting";
    const aspect = ["9:16", "1:1", "16:9"].includes(c.aspect) ? c.aspect : "9:16";
    const aspectLabel = aspect === "9:16" ? "vertical phone selfie" : aspect === "1:1" ? "square phone selfie" : "horizontal phone selfie";

    return `PHOTOGRAPHIC BRIEF — NATURAL FIVE-PART BRIEF
Subject: the exact real man from IMAGE A, ${personDescription}, with unchanged identity geometry, skin tone, hairline and beard pattern.
Setting: ${sceneName}, using IMAGE B only as room geometry/material authority.
Action / pose: ${poseName}, physically supported by the real bed, seat, floor or furniture required by the selected pose.
Photographic style: ordinary candid smartphone selfie, not studio, CGI, commercial portrait or cinematic render; aspect ratio ${aspect} ${aspectLabel}.
Lighting / camera: ${lightingName}, captured with the Xiaomi 15 Ultra front camera from a physically reachable arm-length viewpoint.`;
  }

  identityLock() {
    return `IDENTITY LOCK — IMAGE A ONLY
${this.identityEngine.buildPersonText()}
${this.identityEngine.buildLockText()}
Preserve face width/length, cheek fullness, jaw/chin, nose, lip volume, eye size/spacing, ears, hairline, beard pattern, skin tone, age cues and natural asymmetry. Do not beautify, symmetrize, slim, sharpen or redesign the face.`;
  }

  roomLock(roomMode = "GENERATE") {
    return `ROOM LOCK — IMAGE B ONLY
${this.roomLockEngine.buildAuthorityText()}
${this.roomLockEngine.buildLockText(roomMode)}
Do not move, clean, replace, mirror, resize or redesign room geometry, furniture, bedding, fixtures, materials or visible clutter.`;
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
    if (parts.length === 1 && this.lightingEngine?.buildPrompt) parts.push(this.lightingEngine.buildPrompt(l));
    return parts.join(" ");
  }

  clothingText(c) {
    const clothing = c.clothing ?? {};
    const fabric = clothing.fabric ?? {};
    return `Garment: ${clothing.pieces ?? clothing.name_en ?? clothing.name_ar ?? "the selected garment"}. Fabric: ${fabric.type ?? "material-correct"}, ${fabric.weight ?? "natural weight"}, sheen ${fabric.sheen ?? "material-correct"}; folds: ${fabric.folds ?? "gravity-, joint-, friction- and pressure-driven"}.`;
  }

  finalCheckAndNegative() {
    return `FINAL CHECK
- The result is one coherent physical event with one person, one room, one reachable selfie camera, one lighting event and one phone-processing pipeline.
- IMAGE A controls identity only; IMAGE B controls room only.
- Facial landmarks remain the same person after perspective and expression compensation.
- Support surfaces carry weight; contact shadows attach to real contact points; no floating body, impossible limbs or decorative pressure marks.
- Lighting direction, shadows, catchlights, reflections, exposure, white balance and noise agree across face, hair, clothing, bedding/furniture and room.
- The phone viewpoint remains subject-held at arm's length. No third-person observer, room camera, tripod or photographer.

NEGATIVE PROMPT
cartoon, illustration, painting, CGI, 3D render, beauty filter, face smoothing, facial reshaping, thinner face, sharper jaw, narrower eyes, changed beard, plastic skin, waxy skin, wire hair, helmet hair, extra fingers, extra arms, fused limbs, impossible joints, floating body, unsupported contact, broken reflection, third-person view, observer camera, wide room shot, camera at foot of bed, doorway camera, tripod, another photographer, full-body distant selfie, fake DSLR bokeh, cinematic grading, studio softbox, hidden fill, extreme HDR, artificial glow, fake 8K detail, destructive noise, unrequested text or logos.`;
  }

  generateV2(c) {
    const s = [];
    s.push(`TASK: one ordinary, coherent, physically believable smartphone photograph. Use IMAGE A only for identity and IMAGE B only for the room. Return only the final image.`);
    s.push(SELFIE_VIEWPOINT_LOCK);
    s.push(this.buildNaturalBrief(c));
    s.push(this.identityLock());
    s.push(this.roomLock(c.roomMode || "GENERATE"));
    s.push(this.posePhysics(c));
    s.push(this.bedroomTemplateText(c));
    if (c.pose?.id?.startsWith("lying") || c.pose?.id === "semi_reclining") s.push(BEDDING_PHYSICS_LOCK);
    if (c.pose?.id?.startsWith("sitting")) s.push(GROUNDING.sitting);
    if (c.pose?.id?.startsWith("standing")) s.push(GROUNDING.standing);
    s.push(CAMERA_EMULATOR);
    s.push(`${EXPRESSION_LOCK}\nSelected expression muscles: ${c.expression?.muscle ?? "eyelids, brows, cheeks, jaw and lips remain in the selected natural muscle state"}.${c.expression?.forbidden ? " FORBIDDEN with it: " + c.expression.forbidden + "." : ""}`);
    s.push(`${HAIR_REALISM_LOCK}\nArrangement: ${c.hair?.name_en ?? c.hair?.name_ar ?? "preserve IMAGE A arrangement"}.`);
    s.push(`${CLOTHING_LOCK}\n${this.clothingText(c)}`);
    s.push(`${LIGHTING_PHYSICS_LOCK}\n${this.lightingText(c)}`);
    if (c.lighting?.id === "phone_screen_only") s.push(PHONE_SCREEN_ONLY_STRICT);
    s.push(SINGLE_PIPELINE);
    s.push(imperfectionManifest(c));
    s.push(this.finalCheckAndNegative());
    return s.filter(Boolean).join("\n\n");
  }

  generate(config) {
    return this.generateV2(config);
  }
}
