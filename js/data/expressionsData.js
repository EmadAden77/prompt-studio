export const EXPRESSIONS = Object.freeze([
  { id:"neutral",  name_ar:"محايد",   name_en:"neutral",  muscle:"eyelids at natural aperture; lips closed at rest; brows neutral; zero smile muscle" },
  { id:"smile",    name_ar:"ابتسامة", name_en:"smile",    muscle:"zygomaticus raises mouth corners; cheeks lift; lower eyelids raise slightly; teeth optional" },
  { id:"serious",  name_ar:"جاد",     name_en:"serious",  muscle:"lips gently pressed; brows slightly lowered and adducted; no extra furrows" },
  { id:"relaxed",  name_ar:"هادئ ومرتاح", name_en:"calm and rested", muscle:"masseter relaxed; lips softly closed or slightly parted; eyelids soft; rested gaze" },
  { id:"confident",name_ar:"واثق",    name_en:"confident",muscle:"mouth corners lifted slightly and asymmetrically (5–10% of a full smile); brows neutral; eyelids at NATURAL aperture; chin level or 2–3° down; masseter relaxed",
    forbidden:"thinner/longer face, hollow cheeks, sharper jaw, narrower eyes, added ruggedness, changed beard" }
]);

// Compatibility export for existing consumers. The v2 source of truth is EXPRESSIONS.
export const EXPRESSION_OPTIONS = EXPRESSIONS;

if (typeof window !== "undefined") {
  window.EXPRESSIONS = EXPRESSIONS;
  window.EXPRESSION_OPTIONS = EXPRESSIONS;
}
