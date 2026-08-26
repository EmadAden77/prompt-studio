export const EXPRESSION_GEOMETRY_FREEZE = `EXPRESSION = MUSCLE STATE ONLY — IDENTITY GEOMETRY FREEZE (HIGHEST PRIORITY)
The selected expression changes ONLY facial muscle state. It must NEVER change facial geometry.
Re-render with the EXACT face of IMAGE A: same face width and length, same cheek fullness, same jaw and chin shape, same nose, same lip volume, same eye size/spacing/eyelid shape, same ears, same hairline, same beard pattern and density, same skin tone.
Geometry freeze: face width/length, cheek fullness, jaw/chin shape, nose, lip volume, eye size/spacing/eyelid shape, ears, hairline, beard pattern/density, skin tone — ALL identical to IMAGE A.`;

function buildExpressionPrompt(exp) {
  return `EXPRESSION "${exp.name_en}" = MUSCLE STATE ONLY:
${exp.muscle}.
${exp.forbidden ? `FORBIDDEN with this expression: ${exp.forbidden}.` : ""}
${EXPRESSION_GEOMETRY_FREEZE}
SUPERIMPOSITION TEST: overlaying the result on IMAGE A must align ALL facial landmarks except mouth curvature and minor eyelid/brow muscle state. If the face reads as a different person, the render is INVALID — re-render.
NEGATIVE: expression altering face shape, thinner face, sharper jawline, hollow cheeks, narrower eyes, changed beard density, different identity, meme face, cartoon acting, exaggerated brow lift, exaggerated cheek inflation.`;
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
    name_en: "SOFT SMILE",
    muscle: "zygomaticus raises mouth corners gently; cheeks lift naturally; lower eyelids respond slightly; teeth optional; jaw shape unchanged",
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
  },
  {
    id: "amused",
    name_ar: "مستمتع بخفة",
    name_en: "MILDLY AMUSED",
    muscle: "one or both mouth corners lift subtly; cheeks engage mildly; lower eyelids respond only a little; brows remain near neutral; gaze reads lightly entertained",
    forbidden: "broad grin, cheek inflation, squinting, eyebrow acting, face widening, jaw sharpening"
  },
  {
    id: "playful",
    name_ar: "مرح خفيف",
    name_en: "SUBTLY PLAYFUL",
    muscle: "small asymmetric smile; one mouth corner sits slightly higher; minimal cheek lift; one brow may respond by only a few millimeters while the other stays near neutral",
    forbidden: "meme expression, exaggerated eyebrow arch, puckering, cartoon smirk, eye reshaping, cheek hollowing"
  },
  {
    id: "teasing",
    name_ar: "مزحة خفيفة",
    name_en: "GENTLY TEASING",
    muscle: "crooked smirk around 8–12% of a full smile; one mouth corner rises modestly; lips keep their baseline volume; gaze steady and lightly playful; brows minimally responsive",
    forbidden: "duck face, exaggerated lip curl, asymmetric jaw, narrowed eye geometry, enlarged cheek on one side"
  },
  {
    id: "dry_humor",
    name_ar: "دعابة باردة",
    name_en: "DRY HUMOR",
    muscle: "restrained half-smile; one brow may rise very slightly; lips remain controlled; eyelids at natural aperture; masseter relaxed",
    forbidden: "sarcastic caricature, large brow lift, exaggerated smirk, face tilt used to reshape jaw, pursed lips"
  },
  {
    id: "amused_disbelief",
    name_ar: "استغراب ممتع",
    name_en: "AMUSED DISBELIEF",
    muscle: "one brow rises slightly while the other stays near baseline; mouth forms a tiny crooked smile; eyes remain naturally open and alert; forehead movement stays modest",
    forbidden: "wide shocked eyes, deep forehead furrows, open-mouth surprise, enlarged eye geometry, cartoon disbelief"
  },
  {
    id: "sleepy_amused",
    name_ar: "نعسان مبتسم",
    name_en: "SLEEPY AMUSED",
    muscle: "eyelids soften slightly from fatigue; jaw stays relaxed; mouth corners lift only a little; cheeks respond minimally; gaze remains coherent",
    forbidden: "drooping eyelid geometry, aged face, hollow eye sockets, face lengthening, slack-jaw distortion"
  },
  {
    id: "restrained_grin",
    name_ar: "ابتسامة أوضح طبيعية",
    name_en: "RESTRAINED GRIN",
    muscle: "moderate zygomatic lift; cheeks rise naturally; lower eyelids engage slightly; lips part naturally if needed; teeth may show imperfectly and briefly",
    forbidden: "advertisement smile, porcelain teeth, extreme cheek lift, eye squeezing, face widening, beauty-retouched grin"
  }
];

export const EXPRESSION_OPTIONS = Object.freeze(
  EXPRESSIONS.map((exp) => Object.freeze({ ...exp, prompt: buildExpressionPrompt(exp) }))
);

export const EXPRESSION_BY_ID = Object.freeze(Object.fromEntries(EXPRESSION_OPTIONS.map((item) => [item.id, item])));
