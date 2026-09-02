// SMARTPHONE REALISM HUMANIZER v1
// Realism comes from capture behavior and physical coherence, not exaggerated detail.
// This layer is subordinate to MASTER REALISM POLICY, identity/reference authority,
// explicit user instructions, capture type and physical/anatomical plausibility.

export const SMARTPHONE_REALISM_HUMANIZER_VERSION = "1.1.0";

export function buildIdentityBoundAccessoryPolicy() {
  return `[IDENTITY-BOUND ACCESSORIES]
Accessories explicitly established as part of the subject's persistent reference appearance are identity-bound and must survive scene changes unless the user explicitly requests removal or replacement.

Prescription eyeglasses or another consistently worn identity-defining accessory may be preserved from the identity reference. Do not redesign, replace, recolor or restyle an identity-bound accessory without explicit instruction.

SCENE ACCESSORIES: Do not invent NEW styling accessories, jewelry, watches, hats, earbuds, headphones, bags, products or handheld props unless explicitly selected or physically required by the requested scene.

Identity-bound accessories outrank the generic accessory gate. The generic accessory gate applies only to new scene accessories.`;
}

export function buildSmartphoneRealismHumanizer() {
  return `[SMARTPHONE REALISM HUMANIZER]
AUTHORITY SCOPE: This layer may control camera rendering, physically caused capture artifacts, composition naturalness and photographic coherence only. It has NO authority to change identity, identity-bound accessories, expression, clothing, pose, scene selection or user-selected styling.

REALISM MUST COME FROM CAPTURE BEHAVIOR AND PHYSICAL COHERENCE, NOT FROM EXAGGERATED DETAIL.

Preserve natural human appearance without deliberately amplifying skin, hair, beard, fabric, noise, grain or optical defects.

SKIN: Maintain naturally visible skin texture at the actual viewing distance. Do not explicitly exaggerate pores or microtexture. Allow subtle tonal variation, ordinary asymmetry and localized imperfections only where naturally visible.

HAIR & BEARD: Preserve natural density, grouping and irregularity. Allow occasional loose strands and realistic boundaries. Do not render every individual strand with artificial clarity.

SMARTPHONE CAMERA: Use ordinary front-camera rendering, realistic near-field perspective, restrained computational sharpening, realistic dynamic-range limitations, mild exposure and white-balance variation only when justified, and normal smartphone edge behavior. Do not simulate professional optics.

CAUSAL IMPERFECTIONS: Imperfections must be caused, not decorative. Low light may produce noise. Subject or phone movement may produce slight motion softness. Wide-angle proximity may produce physically correct perspective distortion. Strong backlight may reduce local contrast or clip highlights. Do not randomly add grain, noise, blur, chromatic aberration, dust, skin defects or optical artifacts merely to signal realism.

COMPOSITION: Prefer ordinary human-operated framing. Slightly imperfect centering, natural headroom and minor handheld roll are acceptable when physically plausible. Do not intentionally make every photograph badly composed.

LIGHTING: Use physically identifiable available or practical light sources. All highlights, shadows and reflections must agree with those sources. Avoid unexplained beauty fill.

ANTI-AI: No plastic skin, poreless beauty-filter skin, exaggerated pores, hyper-detailed facial microtexture, individually over-rendered hair, excessive sharpening, excessive HDR, cinematic grading by default, artificial eye enhancement, professional portrait-lens behavior in smartphone selfies, or manufactured imperfections.

FINAL RULE: DO NOT MAKE THE IMAGE LOOK \"MORE REALISTIC.\" MAKE IT BEHAVE LIKE A REAL PHOTOGRAPH.`;
}

export function causalImperfectionPolicy({ lowLight = false, movement = false, closeWideAngle = true, strongBacklight = false } = {}) {
  const allowed = [];
  if (lowLight) allowed.push("mild sensor/shadow noise and restrained detail loss");
  if (movement) allowed.push("slight physically plausible motion softness");
  if (closeWideAngle) allowed.push("natural near-field wide-angle perspective and edge behavior");
  if (strongBacklight) allowed.push("reduced local contrast and limited highlight clipping where physically expected");
  return {
    policy: "generate-only-physically-caused-imperfections",
    allowed,
    forbidden: ["decorative grain", "random blur", "fake dust", "exaggerated pores", "hyper-detailed hair", "manufactured optical defects"]
  };
}
