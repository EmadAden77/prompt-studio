export const POST_PROCESSING_OPTIONS = Object.freeze([
  { value:"film-burn", label:"حرق الفيلم", text:"a restrained film-burn light leak confined mostly to one outer edge, never covering or recoloring the identity-defining face" },
  { value:"film-grain", label:"حبيبات الفيلم", text:"fine irregular film-like grain at a subtle strength, with natural variation rather than a uniform digital noise overlay" },
  { value:"digital-clean", label:"كلين ديجيتال", text:"clean contemporary digital smartphone processing with restrained noise and sharpening, while preserving pores, local skin tone and ordinary sensor limitations" },
  { value:"chromatic-aberration", label:"الانحراف اللوني", text:"very slight lens-edge chromatic aberration visible only near high-contrast outer-frame edges, never splitting facial features" },
  { value:"bloom", label:"بلوم", text:"subtle optical bloom only around genuinely bright practical highlights, without dreamy haze across the whole image" },
  { value:"vhs", label:"VHS", text:"a deliberate mild VHS-style texture with restrained analog softness and sparse scan variation, while keeping the subject recognizable" },
  { value:"miniature", label:"صورة مصغّرة", text:"a controlled miniature-style depth impression applied as an explicit stylized effect, without changing real scene geometry or object scale" },
  { value:"motion-blur", label:"ضبابية الحركة", text:"small directional motion softness caused only by real phone or subject movement during exposure, never a uniform artificial blur filter" }
]);

const VALUES = new Set(POST_PROCESSING_OPTIONS.map((item) => item.value));

export function normalizePostProcessingState(raw = {}) {
  const incoming = Array.isArray(raw.postProcessing) ? raw.postProcessing : [];
  let postProcessing = [...new Set(incoming.filter((value) => VALUES.has(value)))];
  if (postProcessing.includes("digital-clean")) postProcessing = ["digital-clean"];
  else postProcessing = postProcessing.slice(0, 2);
  return { ...raw, postProcessing };
}

export function buildPostProcessingEnhancement(raw = {}) {
  const state = normalizePostProcessingState(raw);
  const selected = state.postProcessing.map((value) => POST_PROCESSING_OPTIONS.find((item) => item.value === value)).filter(Boolean);
  if (!selected.length) return {
    state,
    positive:"",
    negative:[],
    qa:[{ label:"المعالجة اللاحقة", value:"بدون معالجة إضافية" }]
  };
  const physicalMotionRule = state.postProcessing.includes("motion-blur")
    ? "Motion blur must follow the actual movement vector and exposure conditions of this exact capture. If no physical movement exists, reduce it to nearly imperceptible handheld softness."
    : "";
  return {
    state,
    positive:`[OPTIONAL POST-PROCESSING]\nSelected effects only: ${selected.map((item) => item.label).join(" + ")}. ${selected.map((item) => item.text).join(" ")} ${physicalMotionRule} Apply no unselected effect. Post-processing is subordinate to identity, anatomy, selfie geometry, fixed room/vehicle topology and practical lighting. It must never move objects, reshape the face, clean away real skin texture or repair exposure into studio perfection.`,
    negative:[
      "unselected post-processing effect",
      "more than two post-processing effects",
      "post-processing changing facial identity",
      "effect overlay covering the face",
      "filter moving or redesigning scene geometry",
      "uniform fake blur without physical movement",
      "excessive bloom haze",
      "heavy chromatic split across facial features"
    ],
    qa:[{ label:"المعالجة اللاحقة", value:selected.map((item) => item.label).join(" + ") }]
  };
}
