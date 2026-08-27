import { PromptEngine } from "./engines/promptEngine.js";
import { BEDROOM_TEMPLATE_BY_ID } from "./bedroomTemplatesV2.js";
import { BEDROOM_CANDID_TEMPLATE_BY_ID } from "./bedroomCandidTemplates.js";
import { BEDROOM_NIGHT_STANDING_TEMPLATE_BY_ID } from "./bedroomNightStandingTemplates.js";

const previousGenerate = PromptEngine.prototype.generate;
const ALL_BEDROOM_TEMPLATE_BY_ID = Object.freeze({
  ...BEDROOM_TEMPLATE_BY_ID,
  ...BEDROOM_CANDID_TEMPLATE_BY_ID,
  ...BEDROOM_NIGHT_STANDING_TEMPLATE_BY_ID
});

const V2_GLOBAL_LOCK = `BEDROOM V2 — DETERMINISTIC TEMPLATE AUTHORITY
- Only the selected Bedroom V2 template below may define pose intent, interaction zone, framing target, and permitted background window.
- Ignore every legacy bedroom template, hidden-arm preset, day/night bedroom preset, room scenario preset, or old standard template that conflicts with this V2 template.
- The selected V2 template is deliberately conservative. Never widen or rotate the camera merely to show more of the room.
- Room continuity beats composition. Identity continuity beats room continuity. Anatomy/contact beats aesthetic preference.
- Use the minimum reference-supported background needed for the selected template. Crop, occlude, darken, or omit uncertain geometry instead of completing it.
- Do not make the image unusually polished. Keep ordinary phone-camera compromises: slight framing imbalance, mild handheld roll, natural asymmetry, restrained HDR, illumination-dependent noise, modest sharpening/compression, and non-uniform edge detail.
- Do not add stereotypical AI-photography cues: cinematic rim light, perfect skin, perfect teeth, impossible depth blur, hyper-detailed hair, showroom-clean room, repeated clutter, excessive symmetry, decorative glow, or invented props.
- The result should read as an ordinary personal phone photograph because its geometry, light, materials, identity, and capture limitations are coherent, not because of artificial "imperfection" effects.`;

PromptEngine.prototype.generate = function generateBedroomV2(config) {
  let prompt = previousGenerate.call(this, config);
  const templateId = typeof document !== "undefined" ? document.documentElement.dataset.activeBedroomTemplate : null;
  const template = ALL_BEDROOM_TEMPLATE_BY_ID[templateId];
  if (!template) return prompt;

  const selected = `SELECTED BEDROOM V2 TEMPLATE — HIGH PRIORITY
NAME: ${template.name_ar}
POSE ID: ${template.poseId}
INTERNAL INTERACTION MAP: ${template.sceneId} — planning metadata only, never a visual reference.

${template.promptBlock}`;

  prompt = prompt
    .replace(/SELECTED STANDING TEMPLATE CAMERA OVERRIDE:[\s\S]*?(?=\n\n|$)/g, "")
    .replace(/STANDING TEMPLATE — SELECTED PRESET ONLY[\s\S]*?(?=\n\n|$)/g, "")
    .replaceAll("Use noticeable but coherent near-field forced perspective on the selfie arm so it reads longer and more foreground-dominant than normal", "Use only ordinary near-field phone perspective; never elongate or emphasize any arm")
    .replaceAll("The upper LEFT selfie arm visibly originates from the LEFT shoulder and extends toward the camera with only mild near-field wide-angle stretch.", "The camera-holding arm is solved outside the crop; do not show or stretch it.")
    .replaceAll("at most, a few fingertips or a tiny edge-contact cue may appear at the extreme frame boundary if physically unavoidable.", "no fingertips, hand edge, phone, or holding arm may appear in frame.");

  return `${V2_GLOBAL_LOCK}\n\n${selected}\n\n${prompt}`;
};
