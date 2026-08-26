export const HAIR_REALISM_LOCK = `HAIR REALISM LOCK — DENSITY & TEXTURE FROM IMAGE A
- Hair density, total volume, scalp coverage, wave/curl pattern, base length, temple shape, strand caliber, natural growth pattern, and hairline are LOCKED to IMAGE A. Never invent extra fullness, longer fringe, denser crown, altered recession, new taper geometry, or a different haircut.
- Render hair primarily as soft natural clumps, wave groups, and overlapping masses. Resolve individual strands ONLY where a real phone sensor would plausibly separate them: hairline edge, a few flyaways against contrasting background, contact-displaced strands, and small highlight glints. NEVER render uniformly separated wire-like strands across the whole head.
- Flyaway budget is finite and style-dependent. Use roughly 5–12 fine stray strands for ordinary styles and at most about 10–15 for a deliberately messy morning state. They must follow root direction, gravity, humidity, and the declared light source. Never create a fuzzy halo.
- Highlights/lowlights are produced by geometry and illumination: slightly warmer or brighter wave crests facing the key light, deeper brown values in valleys, sides, and occluded clumps. No painted streaks, zebra highlights, repeated bright lines, or uniform two-tone bands.
- Sheen is naturally matte to low-satin. Permit only small specular glints on wave crests where the real key light strikes. No lacquer, gel helmet, plastic shine, chrome-like edges, or sculpted CGI surface.
- Hair responds to gravity, pose, contact, water, fabric, headwear, and the SAME lighting/camera pipeline as the face. Pillow contact can locally flatten clumps; a hand can displace clumps along root direction; dampness can darken and tighten grouping; headwear can compress only real contact zones.
- Preserve natural micro-visibility of scalp only where IMAGE A and clump separation physically allow it. Never create bald patches merely to add detail.
- FORBIDDEN: wire strands, repeated texture stamps, identical curl copies, invented density/length/volume, hairline reshaping, painted highlights, fuzzy halo, lacquered helmet look, perfectly uniform color, strand-by-strand hyper-detail across the whole head.`;

const HAIR_IDENTITY_LOCK = `HAIR IDENTITY LOCK: preserve the exact identity-defined hair density, total volume, scalp coverage, hairline, temple shape, strand caliber, natural growth pattern, base length, and original wave/curl character from IMAGE A. Never add density, remove density, fill sparse areas, invent new recession, thicken the hair mass, change the haircut, or create a different hairline. The selected option may change arrangement, direction, grouping, lift, contact compression, or dampness only. ${HAIR_REALISM_LOCK}`;

function hairPrompt(instruction) {
  return `${HAIR_IDENTITY_LOCK}\nSELECTED HAIR ARRANGEMENT: ${instruction}`;
}

export const HAIR_OPTIONS = Object.freeze([
  {
    id: "same",
    name_ar: "كما في صورة الهوية",
    prompt: hairPrompt("NATURAL TOUSLED / AS IMAGE A: keep the reference arrangement as closely as the new pose, gravity, contact, and humidity allow. Preserve the same silhouette and wave grouping. A textured fringe may fall naturally only where IMAGE A supports it. Zero invented length, density, or crown volume.")
  },
  {
    id: "messy",
    name_ar: "فوضوي قليلًا",
    prompt: hairPrompt("MORNING MESSY — LIGHT: mildly tousled everyday state, irregular wave crests, one side permitted to sit slightly flatter if there was recent pillow contact, and roughly 8–12 plausible flyaways. No product look and no extra volume.")
  },
  {
    id: "neat",
    name_ar: "مرتب",
    prompt: hairPrompt("NEAT FOR AN EVENT — LIGHT: controlled soft part or combed direction while keeping minor edge strands, small asymmetry, original density, wave pattern, length, and hairline. Controlled, never helmet-like.")
  },
  {
    id: "wet",
    name_ar: "مبلل",
    prompt: hairPrompt("DAMP POST-SHOWER: existing clumps become tighter and approximately 15–20% darker from moisture; apparent volume reduces from water weight; a few strands may cling to the forehead if length permits. Match a slight physically plausible skin moisture sheen from the same event. No wet-gel helmet.")
  },
  {
    id: "natural_tousled",
    name_ar: "مبعثر طبيعي خفيف",
    prompt: hairPrompt("NATURAL TOUSLED: preserve the IMAGE A silhouette and wave structure while allowing mildly uneven clumps, a textured natural fringe, and roughly 5–10 fine flyaways. No invented lift or density.")
  },
  {
    id: "loose_swept_back",
    name_ar: "للخلف بشكل طبيعي",
    prompt: hairPrompt("PUSHED BACK: sweep the existing top backward as if by hand; preserve crown volume from IMAGE A, use matte root lift only, and allow 2–3 strands to fall back toward the temple. No gel shine and no new height.")
  },
  {
    id: "swept_back_soft_part",
    name_ar: "للخلف مع فرق خفيف",
    prompt: hairPrompt("PUSHED BACK WITH SOFT PART: sweep backward while allowing a subtle irregular part to emerge from the real growth pattern. Preserve crown volume and scalp visibility exactly as supported by IMAGE A; 2–3 imperfect temple strands may escape the main flow.")
  },
  {
    id: "side_part_right",
    name_ar: "فرق جانبي لليمين",
    prompt: hairPrompt("NEAT SIDE PART RIGHT: soft right-side part, combed but not ruler-straight. Keep edge strands individually visible only where the phone sensor resolves them; density, hairline, temple shape, and volume unchanged.")
  },
  {
    id: "side_part_left",
    name_ar: "فرق جانبي لليسار",
    prompt: hairPrompt("NEAT SIDE PART LEFT: soft left-side part, combed but not ruler-straight. Keep edge strands individually visible only where the phone sensor resolves them; density, hairline, temple shape, and volume unchanged.")
  },
  {
    id: "soft_middle_part",
    name_ar: "فرق وسطي خفيف",
    prompt: hairPrompt("SOFT MIDDLE PART: create only a mild irregular center division where existing length and growth permit. Never increase scalp exposure or draw a razor-straight part line.")
  },
  {
    id: "side_sweep_right",
    name_ar: "مائل طبيعي لليمين",
    prompt: hairPrompt("SIDE-SWEPT FRINGE RIGHT: guide the existing fringe/top toward the subject's right, exposing only the amount of forehead that the real length allows. Keep the part slightly irregular and preserve original crown volume.")
  },
  {
    id: "side_sweep_left",
    name_ar: "مائل طبيعي لليسار",
    prompt: hairPrompt("SIDE-SWEPT FRINGE LEFT: guide the existing fringe/top toward the subject's left, exposing only the amount of forehead that the real length allows. Keep the part slightly irregular and preserve original crown volume.")
  },
  {
    id: "light_front_lift",
    name_ar: "رفع خفيف من المقدمة",
    prompt: hairPrompt("LIGHT FRONT LIFT: lift only the existing front section by finger-like root displacement. Keep matte texture, imperfect wave grouping, and IMAGE A volume ceiling. No pompadour unless IMAGE A already contains that volume.")
  },
  {
    id: "loose_forehead_strands",
    name_ar: "خصل قليلة على الجبهة",
    prompt: hairPrompt("LOOSE FOREHEAD STRANDS: allow a few irregular strands or compact strand groups onto the forehead. Individual strands resolve mostly at their edges and highlight glints; never place evenly spaced decorative lines.")
  },
  {
    id: "forward_relaxed",
    name_ar: "للأمام بشكل عفوي",
    prompt: hairPrompt("RELAXED FORWARD: let the existing front/top settle slightly forward with non-uniform clumps, wave depth, and subtle asymmetry. Do not lengthen the fringe or manufacture extra fullness.")
  },
  {
    id: "sleep_compressed_right",
    name_ar: "مضغوط من النوم — الجهة اليمنى",
    prompt: hairPrompt("MORNING / PILLOW COMPRESSION RIGHT: right contact zones flatten locally with friction displacement and irregular clump separation; wave volume recovers away from contact. Keep actual density unchanged and use no more than about 10–15 flyaways overall.")
  },
  {
    id: "sleep_compressed_left",
    name_ar: "مضغوط من النوم — الجهة اليسرى",
    prompt: hairPrompt("MORNING / PILLOW COMPRESSION LEFT: left contact zones flatten locally with friction displacement and irregular clump separation; wave volume recovers away from contact. Keep actual density unchanged and use no more than about 10–15 flyaways overall.")
  },
  {
    id: "damp_post_shower",
    name_ar: "رطب بعد الاستحمام",
    prompt: hairPrompt("DAMP POST-SHOWER: clumps tighten and darken approximately 15–20% from moisture, apparent volume decreases from water weight, and a few real-length strands may cling to forehead/temples. Same-event skin sheen may rise slightly. No gel, no plastic gloss.")
  },
  {
    id: "towel_dried",
    name_ar: "مجفف بالمنشفة بشكل عفوي",
    prompt: hairPrompt("TOWEL-DRIED: mostly dry with residual dampness, soft friction displacement, modest random root lift, uneven clumping, and restrained sheen. Preserve the IMAGE A density/volume ceiling and avoid salon structure.")
  },
  {
    id: "neat_natural",
    name_ar: "مرتب طبيعي بدون مبالغة",
    prompt: hairPrompt("NEAT FOR AN EVENT: soft side part or controlled combed direction while leaving minor flyaways and edge strands. Density and hairline remain unchanged; controlled but never helmet-like.")
  },
  {
    id: "morning_messy",
    name_ar: "فوضى الصباح الطبيعية",
    prompt: hairPrompt("MORNING MESSY: irregular wave crests, about 10–15 flyaways maximum, one contact side allowed to remain slightly flatter from a pillow, and no styling-product look. Preserve exact density and length.")
  },
  {
    id: "shemagh_compression",
    name_ar: "ضغط الشماغ — سعودي",
    prompt: hairPrompt("SHEMAGH COMPRESSION: if a red-white shemagh is worn, show hair only where naturally visible at forehead/temples and compress actual contact zones. If shown just after removal, allow a subtle compression-band line and temporarily flatter crown with delayed volume recovery. Never invent a new hairline or density.")
  },
  {
    id: "hand_through_hair",
    name_ar: "اليد تمر عبر الشعر",
    prompt: hairPrompt("HAND RUNNING THROUGH HAIR: the FREE non-camera hand may lift real crown clumps only if the pose physically supports the contact. Fingers displace hair along root direction, with tiny contact shadows and natural micro-visibility between separated clumps, never bald patches. Camera-holding arm rules remain unchanged.")
  }
]);

export const HAIR_ANGLE_OPTIONS = Object.freeze([
  {
    id: "auto",
    name_ar: "تلقائي حسب الوضعية",
    prompt: "HAIR VIEW ANGLE: use the selected pose/camera naturally. Do not force a hair-showcase angle that breaks anatomy, selfie reach, or the scene reference."
  },
  {
    id: "top_down_crown",
    name_ar: "من أعلى — التاج",
    prompt: "HAIR VIEW ANGLE — TOP-DOWN CROWN: only when physically reachable, place the front phone about 60–80cm above and angle downward enough to reveal crown wave grouping and natural parting. Preserve exact front hairline and density. Flyaways may catch only the declared key light. Do not expose fake scalp or distort the face to show the crown."
  },
  {
    id: "dutch_volume",
    name_ar: "ميل خفيف لإظهار الحجم",
    prompt: "HAIR VIEW ANGLE — DUTCH VOLUME: use a restrained 25–35 degree camera roll only if compatible with the active pose. Let top volume silhouette against a darker real background when available. Resolve individual strands only at the crown edge/rim-light boundary, never across the whole head."
  },
  {
    id: "three_quarter_wave",
    name_ar: "ثلاثة أرباع — تموج الشعر",
    prompt: "HAIR VIEW ANGLE — THREE-QUARTER WAVE: turn the face/head about 30–45 degrees only within the active pose's anatomy limits, revealing side taper and wave depth. Highlights appear on wave crests strictly from the declared key light; no painted streaks."
  },
  {
    id: "back_texture",
    name_ar: "خلف الرأس — خلفية/مرآة فقط",
    prompt: "HAIR VIEW ANGLE — BACK TEXTURE: NEVER use this with a front-camera selfie. Permit only a rear-camera or physically coherent mirror view. Show back-of-head wave pattern and neckline taper with natural arm/body geometry. If the active capture is front-camera selfie, reject this angle and fall back to AUTO."
  }
]);

export const HAIR_BY_ID = Object.freeze(Object.fromEntries(HAIR_OPTIONS.map((item) => [item.id, item])));
export const HAIR_ANGLE_BY_ID = Object.freeze(Object.fromEntries(HAIR_ANGLE_OPTIONS.map((item) => [item.id, item])));
export { HAIR_IDENTITY_LOCK };
