export const EXPRESSION_OPTIONS = Object.freeze([
  { id: "neutral", name_ar: "محايد", prompt: "A neutral, attentive expression with relaxed facial muscles and a naturally closed mouth." },
  { id: "smile", name_ar: "ابتسامة خفيفة", prompt: "A small natural smile produced by facial muscle movement only, without changing facial proportions or identity." },
  { id: "serious", name_ar: "جاد", prompt: "A calm serious expression with relaxed brows and no exaggerated tension." },
  { id: "relaxed", name_ar: "هادئ ومرتخي", prompt: "A calm, rested expression with soft eyelids and relaxed jaw muscles." },
  { id: "confident", name_ar: "واثق", prompt: "A composed, confident expression with steady gaze and subtle posture support, not a stylized fashion pose." },
  { id: "tired", name_ar: "متعب قليلًا", prompt: "A mildly tired but alert expression with naturally heavier eyelids, without aging or reshaping the face." }
]);

export const EXPRESSION_BY_ID = Object.freeze(Object.fromEntries(EXPRESSION_OPTIONS.map((item) => [item.id, item])));
