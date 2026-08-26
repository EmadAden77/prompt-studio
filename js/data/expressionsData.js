export const EXPRESSION_GEOMETRY_FREEZE = `EXPRESSION = MUSCLE STATE ONLY — IDENTITY GEOMETRY FREEZE (HIGHEST PRIORITY)
The selected expression changes ONLY facial muscle state. It must NEVER change facial geometry.
Re-render with the EXACT face of IMAGE A: same face width and length, same cheek fullness, same jaw and chin shape, same nose, same lip volume, same eye size/spacing/eyelid shape, same ears, same hairline, same beard pattern and density, same skin tone.
Geometry freeze: face width/length, cheek fullness, jaw/chin shape, nose, lip volume, eye size/spacing/eyelid shape, ears, hairline, beard pattern/density, skin tone — ALL identical to IMAGE A.`;

function buildExpressionPrompt(exp) {
  return `EXPRESSION "${exp.name_en}" = MUSCLE STATE ONLY:
${exp.muscle}.
${exp.forbidden ? `FORBIDDEN with this expression: ${exp.forbidden}.` : ""}
${EXPRESSION_GEOMETRY_FREEZE}
SUPERIMPOSITION TEST: overlaying the result on IMAGE A must align ALL facial landmarks except mouth curvature and minor eyelid state. If the face reads as a different person, the render is INVALID — re-render.
NEGATIVE: expression altering face shape, thinner face, sharper jawline, hollow cheeks, narrower eyes, changed beard density, different identity.`;
}

const EXPRESSIONS = [
  {
    id: "neutral",
    name_ar: "محايد",
    name_en: "NEUTRAL",
    muscle: "eyelids at natural aperture; lips closed at rest; brows neutral; zero smile muscle"
  },
  {
    id: "smile",
    name_ar: "ابتسامة خفيفة",
    name_en: "SMILE",
    muscle: "zygomaticus raises mouth corners; cheeks lift naturally; lower eyelids raise slightly; teeth optional; jaw shape unchanged",
    forbidden: "face slimming, cheek hollowing, jaw sharpening, eye narrowing beyond the natural smile action, changed beard or identity"
  },
  {
    id: "serious",
    name_ar: "جاد",
    name_en: "SERIOUS",
    muscle: "lips gently pressed without thinning beyond natural volume; brows slightly lowered/adducted; no furrows beyond natural",
    forbidden: "sharper jaw, hollow cheeks, narrower eyes, added ruggedness, aged skin, changed beard or identity"
  },
  {
    id: "relaxed",
    name_ar: "هادئ ومرتخي",
    name_en: "RELAXED",
    muscle: "masseter relaxed; lips softly closed or slightly parted; eyelids soft at their natural resting aperture; gaze rested",
    forbidden: "drooping or reshaping eyelids, longer or thinner face, reduced cheek fullness, altered jaw, aged appearance, changed beard or identity"
  },
  {
    id: "confident",
    name_ar: "واثق",
    name_en: "CONFIDENT",
    muscle: "subtle asymmetric mouth-corner lift at 5–10% of a full smile; brows neutral, at most very slightly lowered; eyelids at NATURAL aperture with a steady gaze, not narrowed and not tired; chin level or tilted down 2–3°; masseter relaxed",
    forbidden: "thinner or longer face, hollowed cheeks, sharper or wider jaw, narrower eyes, added ruggedness, changed beard, different sharper-guy vibe"
  },
  {
    id: "tired",
    name_ar: "متعب قليلًا",
    name_en: "MILDLY TIRED",
    muscle: "upper eyelids sit slightly lower from fatigue while eye geometry remains unchanged; brows relaxed; mouth at rest; jaw relaxed; gaze still alert",
    forbidden: "aging the face, deepening eye sockets, hollow cheeks, narrowing eye geometry, changing jawline, beard, skin tone or identity"
  }
];

export const EXPRESSION_OPTIONS = Object.freeze(
  EXPRESSIONS.map((exp) => Object.freeze({ ...exp, prompt: buildExpressionPrompt(exp) }))
);

export const EXPRESSION_BY_ID = Object.freeze(Object.fromEntries(EXPRESSION_OPTIONS.map((item) => [item.id, item])));
