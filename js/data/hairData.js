const HAIR_IDENTITY_LOCK = "HAIR IDENTITY LOCK: preserve the exact identity-defined hair density, scalp coverage, hairline, temple shape, strand caliber, natural growth pattern, base length, and original wave/curl character from IMAGE A. Never add density, remove density, fill sparse areas, invent new recession, thicken the hair mass, change the haircut, or create a different hairline. The selected option may change arrangement, direction, grouping, lift, compression, or dampness only. Keep small asymmetry, irregular strand grouping, a few believable flyaways, and non-uniform spacing so the result reads as ordinary real hair rather than procedurally groomed or strand-perfect.";

function hairPrompt(instruction) {
  return `${HAIR_IDENTITY_LOCK} ${instruction}`;
}

export const HAIR_OPTIONS = Object.freeze([
  {
    id: "same",
    name_ar: "كما في صورة الهوية",
    prompt: hairPrompt("Keep the reference hairstyle arrangement as closely as the new pose, gravity, contact, and humidity allow. Do not over-groom or regularize individual strands.")
  },
  {
    id: "natural_tousled",
    name_ar: "مبعثر طبيعي خفيف",
    prompt: hairPrompt("Rearrange the existing hair into a mildly tousled everyday state with uneven small clumps and a few plausible stray strands. Keep the overall silhouette close to the original hairstyle.")
  },
  {
    id: "loose_swept_back",
    name_ar: "للخلف بشكل طبيعي",
    prompt: hairPrompt("Sweep the existing hair loosely backward with imperfect finger-combed direction, slight asymmetry, and a few strands that do not follow the main flow. Do not create extra height or density.")
  },
  {
    id: "swept_back_soft_part",
    name_ar: "للخلف مع فرق خفيف",
    prompt: hairPrompt("Sweep the hair backward while allowing a subtle natural part to emerge from the existing growth pattern. The part must not expose more or less scalp than IMAGE A naturally supports.")
  },
  {
    id: "side_part_right",
    name_ar: "فرق جانبي لليمين",
    prompt: hairPrompt("Arrange the existing hair with a soft right-side part using only the available original length and growth direction. Keep the part slightly imperfect and preserve the exact density and temple shape.")
  },
  {
    id: "side_part_left",
    name_ar: "فرق جانبي لليسار",
    prompt: hairPrompt("Arrange the existing hair with a soft left-side part using only the available original length and growth direction. Keep the part slightly imperfect and preserve the exact density and temple shape.")
  },
  {
    id: "soft_middle_part",
    name_ar: "فرق وسطي خفيف",
    prompt: hairPrompt("Create only a mild, natural center division where the existing length permits it. Keep the division irregular rather than ruler-straight and do not alter scalp visibility, density, or hairline geometry.")
  },
  {
    id: "side_sweep_right",
    name_ar: "مائل طبيعي لليمين",
    prompt: hairPrompt("Guide the top hair naturally toward the subject's right side with relaxed, uneven grouping and modest lift. Preserve the original cut and do not manufacture extra fullness.")
  },
  {
    id: "side_sweep_left",
    name_ar: "مائل طبيعي لليسار",
    prompt: hairPrompt("Guide the top hair naturally toward the subject's left side with relaxed, uneven grouping and modest lift. Preserve the original cut and do not manufacture extra fullness.")
  },
  {
    id: "light_front_lift",
    name_ar: "رفع خفيف من المقدمة",
    prompt: hairPrompt("Lift the existing front section only slightly, as if shaped casually by the fingers. Keep realistic gravity, imperfect separation, and the original density; no pompadour-like extra volume unless it already exists in IMAGE A.")
  },
  {
    id: "loose_forehead_strands",
    name_ar: "خصل قليلة على الجبهة",
    prompt: hairPrompt("Allow a small number of irregular strands or compact strand groups to fall naturally onto the forehead while the rest follows the original hairstyle. Avoid evenly spaced decorative strands.")
  },
  {
    id: "forward_relaxed",
    name_ar: "للأمام بشكل عفوي",
    prompt: hairPrompt("Let the existing front/top hair settle slightly forward in a relaxed everyday arrangement with non-uniform grouping and subtle asymmetry. Do not lengthen the fringe or change density.")
  },
  {
    id: "sleep_compressed_right",
    name_ar: "مضغوط من النوم — الجهة اليمنى",
    prompt: hairPrompt("Show believable sleep compression on the subject's right-side contact zones only: locally flatter direction, slightly separated clumps, and mild friction displacement. Density is unchanged; only arrangement and apparent volume at the contact zone change.")
  },
  {
    id: "sleep_compressed_left",
    name_ar: "مضغوط من النوم — الجهة اليسرى",
    prompt: hairPrompt("Show believable sleep compression on the subject's left-side contact zones only: locally flatter direction, slightly separated clumps, and mild friction displacement. Density is unchanged; only arrangement and apparent volume at the contact zone change.")
  },
  {
    id: "damp_post_shower",
    name_ar: "رطب بعد الاستحمام",
    prompt: hairPrompt("Make the existing hair naturally damp after a shower: slightly darker tone, irregular grouped clumps, restrained wet sheen, and locally reduced apparent volume from water weight. Hair density, hairline, and base length remain exactly unchanged.")
  },
  {
    id: "towel_dried",
    name_ar: "مجفف بالمنشفة بشكل عفوي",
    prompt: hairPrompt("Arrange the hair as if recently towel-dried: mostly dry with a little residual dampness, mild random lift, soft friction displacement, and uneven clumping. Preserve density and avoid salon-perfect structure.")
  },
  {
    id: "neat_natural",
    name_ar: "مرتب طبيعي بدون مبالغة",
    prompt: hairPrompt("Arrange the existing hair neatly but not perfectly: maintain a few minor flyaways, slight directional inconsistency, and natural asymmetry. Do not make the silhouette denser, sharper, or more sculpted than IMAGE A.")
  }
]);

export const HAIR_BY_ID = Object.freeze(Object.fromEntries(HAIR_OPTIONS.map((item) => [item.id, item])));
export { HAIR_IDENTITY_LOCK };
