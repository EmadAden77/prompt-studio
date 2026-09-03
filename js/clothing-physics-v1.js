import { CLOTHING_OPTIONS } from "./wiki-selfie-data-v1.js";

const HOME = Object.freeze(["my_bedroom_text","bedroom"]);
const CASUAL = Object.freeze(["my_bedroom_text","bedroom","rangeRover","street"]);
const TRADITIONAL = Object.freeze(["my_bedroom_text","bedroom","rangeRover","street"]);
const WORK = Object.freeze(["my_bedroom_text","bedroom","rangeRover","street"]);
const SPORT = Object.freeze(["gym","street"]);

export const EXTRA_CLOTHING_OPTIONS = Object.freeze([
  { value:"sleep-striped-pajama", label:"بيجاما قطن مخططة", scenes:HOME, profile:"sleep", text:"a simple striped pajama set with ordinary home proportions, soft seam construction and no luxury styling" },
  { value:"sleep-flannel-pajama", label:"بيجاما فلانيل شتوية", scenes:HOME, profile:"sleep-winter", text:"a winter pajama set with a relaxed home cut and physically plausible heavier drape" },
  { value:"sleep-long-shirt", label:"قميص نوم طويل بسيط", scenes:HOME, profile:"sleep", text:"a plain long sleep shirt with an easy home fit and natural hem movement" },
  { value:"lounge-henley-pants", label:"هنلي منزلي + بنطال مريح", scenes:HOME, profile:"home", text:"a casual henley top with relaxed home trousers, ordinary neckline structure and non-styled home fit" },
  { value:"bathrobe-cotton", label:"روب حمام قطني", scenes:HOME, profile:"robe", text:"a plain cotton bathrobe with realistic overlap, belt placement and modest towel-like bulk" },
  { value:"home-tee-pants", label:"تيشيرت منزلي + بنطال قطني", scenes:HOME, profile:"home", text:"a plain home T-shirt with soft casual trousers, chosen for ordinary daily wear rather than presentation" },

  { value:"tee-heavy-black", label:"تيشيرت أسود ثقيل", scenes:CASUAL, profile:"tee-heavy", text:"a plain heavyweight black crew-neck T-shirt with a structured collar and ordinary straight body cut" },
  { value:"tee-heavy-white", label:"تيشيرت أبيض ثقيل", scenes:CASUAL, profile:"tee-heavy", text:"a plain heavyweight white crew-neck T-shirt with a structured collar and no logos" },
  { value:"henley-short", label:"تيشيرت هنلي قصير الأكمام", scenes:CASUAL, profile:"tee", text:"a simple short-sleeve henley with a small button placket and understated everyday construction" },
  { value:"henley-long", label:"هنلي طويل الأكمام", scenes:CASUAL, profile:"tee", text:"a plain long-sleeve henley with ordinary cuff and placket construction" },
  { value:"shirt-oxford", label:"قميص أكسفورد كاجوال", scenes:CASUAL, profile:"shirt", text:"a casual Oxford button-down shirt with ordinary collar roll, placket and cuff construction" },
  { value:"shirt-poplin-formal", label:"قميص بوبلين مرتب", scenes:CASUAL, profile:"shirt-formal", text:"a clean plain button-down shirt with a neater collar and restrained business-casual cut" },
  { value:"shirt-linen", label:"قميص كتان كاجوال", scenes:CASUAL, profile:"linen-shirt", text:"a casual linen shirt with a relaxed collar, simple buttons and naturally informal construction" },
  { value:"shirt-short-sleeve", label:"قميص كاجوال قصير الأكمام", scenes:CASUAL, profile:"shirt", text:"a plain short-sleeve casual shirt with an everyday straight cut and no decorative branding" },
  { value:"polo-pique", label:"بولو بيكيه قطني", scenes:CASUAL, profile:"polo", text:"a plain polo shirt with a conventional collar, short placket and ordinary daily fit" },
  { value:"polo-knit", label:"بولو نسيج ناعم", scenes:CASUAL, profile:"polo-soft", text:"a simple soft-knit polo with restrained collar structure and no glossy fashion finish" },
  { value:"overshirt-cotton", label:"أوفرشيرت قطني خفيف", scenes:CASUAL, profile:"overshirt", text:"a lightweight cotton overshirt over a plain base layer, with practical pockets and everyday construction" },
  { value:"bomber-light", label:"جاكيت بومبر خفيف", scenes:["rangeRover","street"], profile:"light-jacket", text:"a lightweight casual bomber jacket with a simple zipper, modest rib trim and no logos" },
  { value:"cardigan-light", label:"كارديغان خفيف", scenes:CASUAL, profile:"knit", text:"a lightweight plain cardigan with an ordinary front opening and relaxed everyday proportions" },
  { value:"tee-jeans", label:"تيشيرت ساده + جينز", scenes:["rangeRover","street"], profile:"tee-jeans", text:"a plain crew-neck T-shirt paired with straightforward denim jeans, without fashion-editorial styling" },
  { value:"shirt-chinos", label:"قميص كاجوال + تشينو", scenes:["rangeRover","street","bedroom"], profile:"shirt-chinos", text:"a casual button-down shirt paired with plain chinos in an ordinary everyday fit" },

  { value:"thobe-summer-polycotton", label:"ثوب أبيض صيفي خفيف", scenes:TRADITIONAL, profile:"thobe-summer", text:"a plain white Saudi thobe cut for warm weather, with conventional collar, placket and cuff construction" },
  { value:"thobe-poplin-white", label:"ثوب أبيض بوبلين مرتب", scenes:TRADITIONAL, profile:"thobe", text:"a plain white Saudi thobe with a clean conventional cut and restrained formal neatness" },
  { value:"thobe-linen-offwhite", label:"ثوب أوف وايت بملمس كتاني", scenes:TRADITIONAL, profile:"thobe-linen", text:"an off-white Saudi thobe with an everyday straight cut and naturally informal surface character" },
  { value:"thobe-grey-winter", label:"ثوب رمادي شتوي", scenes:TRADITIONAL, profile:"thobe-winter", text:"a plain grey winter Saudi thobe with a conventional straight silhouette and heavier seasonal construction" },
  { value:"thobe-navy-winter", label:"ثوب كحلي شتوي", scenes:TRADITIONAL, profile:"thobe-winter", text:"a plain navy winter Saudi thobe with a conventional cut and no ceremonial decoration" },

  { value:"work-oxford-navy", label:"قميص أكسفورد أبيض + بنطال كحلي", scenes:WORK, profile:"work-shirt", text:"a plain white Oxford work shirt with deep navy trousers in a restrained office fit" },
  { value:"work-poplin-charcoal", label:"قميص بوبلين سماوي + بنطال فحمي", scenes:WORK, profile:"work-shirt", text:"a light-blue plain work shirt with charcoal trousers and ordinary office proportions" },
  { value:"work-polo-chino", label:"بولو عمل + تشينو", scenes:WORK, profile:"work-polo", text:"a plain work polo paired with simple chinos for practical business-casual wear" },

  { value:"sport-tech-tee-pants", label:"تيشيرت تقني + بنطال رياضي", scenes:SPORT, profile:"sport", text:"a plain technical training T-shirt with tapered athletic trousers, no team marks or sponsor logos" },
  { value:"sport-tech-tee-shorts", label:"تيشيرت تقني + شورت رياضي", scenes:SPORT, profile:"sport", text:"a plain technical training T-shirt with practical athletic shorts and no branding" },
  { value:"sport-light-jacket", label:"جاكيت رياضي خفيف + بنطال", scenes:SPORT, profile:"sport-jacket", text:"a lightweight training jacket with athletic trousers, simple zipper construction and no logos" }
]);

const ALL_CLOTHING_OPTIONS = Object.freeze([...CLOTHING_OPTIONS, ...EXTRA_CLOTHING_OPTIONS]);

export const FABRIC_OPTIONS = Object.freeze([
  { value:"cotton-jersey", label:"جيرسي قطني", weights:["light","medium"], text:"cotton jersey with soft knit stretch, matte low sheen, rounded folds and small tension lines around seams rather than sharp paper-like creases" },
  { value:"heavy-cotton-jersey", label:"جيرسي قطني ثقيل", weights:["medium","heavy"], text:"heavy cotton jersey with a denser matte knit, slower drape, broader folds and a collar that holds more structure" },
  { value:"cotton-poplin", label:"بوبلين قطني", weights:["light","medium"], text:"cotton poplin with a smooth tight weave, low sheen, relatively crisp fold edges and fine wrinkles that increase with wear" },
  { value:"cotton-oxford", label:"أكسفورد قطني", weights:["medium"], text:"Oxford cotton with a visible basket weave, modest body, soft collar structure and medium-scale wrinkles instead of glossy smoothness" },
  { value:"pique-cotton", label:"بيكيه قطني", weights:["medium"], text:"cotton pique with a small textured knit, breathable matte surface, moderate body and characteristic soft polo folds" },
  { value:"cotton-twill", label:"تويل قطني", weights:["medium","heavy"], text:"cotton twill with subtle diagonal structure, moderate body, low sheen and directional creasing at joints and compression zones" },
  { value:"cotton-linen", label:"قطن وكتان", weights:["light","medium"], text:"a cotton-linen blend with dry natural texture, low sheen and irregular wrinkles that remain visible even when the garment was previously ironed" },
  { value:"linen", label:"كتان", weights:["light","medium"], text:"linen with visible natural slub texture, dry matte reflectance and easy irregular wrinkling at elbows, waist and contact points" },
  { value:"polycotton", label:"بولي قطن", weights:["light","medium"], text:"a practical polyester-cotton blend with smoother weave, restrained low sheen, moderate wrinkle resistance and clean but not synthetic-looking drape" },
  { value:"flannel", label:"فلانيل", weights:["medium","heavy"], text:"soft flannel with a slightly brushed matte surface, warmer visual weight, broad soft folds and little specular shine" },
  { value:"denim", label:"دنيم", weights:["medium","heavy"], text:"denim with visible twill grain, structured seams, heavier fold memory and pronounced creasing at elbows, hips or knees where physically visible" },
  { value:"cotton-fleece", label:"قطن فليس", weights:["medium","heavy"], text:"cotton fleece with a soft matte outer face, thicker body, rounded compression folds and realistic cuff or rib behavior" },
  { value:"tropical-wool", label:"صوف استوائي خفيف", weights:["light","medium"], text:"light tropical wool with a fine matte weave, controlled drape, soft crease recovery and restrained professional appearance" },
  { value:"wool-blend", label:"خليط صوف", weights:["medium","heavy"], text:"a wool blend with dense matte texture, slower heavier drape and broad folds that resist tiny cotton-like wrinkling" },
  { value:"viscose-blend", label:"فيسكوز ممزوج", weights:["light","medium"], text:"a viscose blend with fluid drape, soft surface, slightly smoother highlights and longer gravity-led folds without plastic shine" },
  { value:"technical-poly", label:"بوليستر رياضي تقني", weights:["light","medium"], text:"technical athletic polyester with fine knit structure, controlled stretch, restrained synthetic sheen and tension lines that follow body movement" },
  { value:"nylon-stretch", label:"نايلون تقني مرن", weights:["light","medium"], text:"stretch nylon with a compact technical weave, subtle low-to-moderate sheen, elastic recovery and sharper tension changes at moving joints" },
  { value:"microfiber", label:"مايكروفايبر", weights:["light","medium"], text:"microfiber with a smooth dense surface, restrained sheen, lightweight drape and small practical wrinkles rather than luxury gloss" }
]);

export const FABRIC_WEIGHT_OPTIONS = Object.freeze([
  { value:"light", label:"خفيف", text:"light fabric weight: quicker gravity response, smaller folds, more edge movement and less structural stiffness" },
  { value:"medium", label:"متوسط", text:"medium fabric weight: balanced drape with ordinary fold depth and enough body to preserve seams and garment shape" },
  { value:"heavy", label:"ثقيل", text:"heavy fabric weight: slower drape, broader deeper folds, stronger compression memory and less flutter at free edges" }
]);

export const IRON_STATE_OPTIONS = Object.freeze([
  { value:"fresh-pressed", label:"مكوي بعناية", text:"freshly pressed before wear, with cleaner panels and seams but still acquiring new pose creases wherever the body bends, sits or compresses the garment" },
  { value:"normal-pressed", label:"مكوي عادي", text:"normally pressed with mild everyday neatness, a few residual wrinkles and fresh creases forming naturally from the current pose" },
  { value:"lightly-unpressed", label:"غير مكوي قليلًا", text:"lightly unpressed with irregular shallow wrinkles distributed by storage and wear, not uniformly crumpled" },
  { value:"unpressed", label:"غير مكوي", text:"unpressed with visible irregular wrinkle networks, softened seams and no artificial crispness, while still respecting the selected fabric's real wrinkle behavior" }
]);

export const WEAR_STATE_OPTIONS = Object.freeze([
  { value:"fresh", label:"جديد أو لبس قصير", text:"freshly worn with clean structure and only the current pose's first compression and bend marks" },
  { value:"normal-day", label:"استعمال يومي طبيعي", text:"ordinary daily wear with subtle collar, elbow, waist and seat-area relaxation appropriate to how long the garment has been on" },
  { value:"hours-worn", label:"بعد عدة ساعات من اللبس", text:"worn for several hours, adding localized body-shaped creases, slight softening at high-contact zones and no theatrical distressing" },
  { value:"washed-soft", label:"مغسول عدة مرات وناعم", text:"washed repeatedly and naturally softened, with gentler seam stiffness, slightly relaxed drape and normal lived-in texture" },
  { value:"home-used", label:"منزلي مستعمل ومريح", text:"comfortable home wear with soft irregular wrinkles from sitting or reclining and no presentation-level neatness" },
  { value:"post-workout", label:"بعد تمرين", text:"post-workout use with physically limited stretch recovery, localized creasing and only modest sweat darkening where heat and body contact support it" }
]);

export const CLOTHING_FIT_OPTIONS = Object.freeze([
  { value:"slim", label:"مقاس قريب من الجسم", text:"a slightly close fit that creates believable seam tension and smaller folds without compressing or reshaping the body" },
  { value:"regular", label:"مقاس عادي", text:"a regular everyday fit with ordinary ease around chest, waist, sleeves and hips" },
  { value:"relaxed", label:"مريح وواسع قليلًا", text:"a relaxed fit with extra ease, longer gravity folds and softer bunching at compression points" },
  { value:"oversized", label:"أوفرسايز", text:"an intentionally oversized fit with dropped or relaxed structure, larger hanging folds and no fashion-pose exaggeration" },
  { value:"traditional-straight", label:"قصة ثوب مستقيمة", text:"a conventional straight thobe fit with vertical body fall, natural sleeve ease and pose-driven folds without tailoring the garment to the torso" },
  { value:"athletic", label:"رياضي عملي", text:"an athletic practical fit with controlled ease and stretch where needed, never painted onto the body" }
]);

const PROFILE_RULES = Object.freeze({
  sleep:{ fabrics:["cotton-jersey","cotton-poplin","viscose-blend"], weights:["light","medium"], irons:["normal-pressed","lightly-unpressed","unpressed"], wear:["fresh","normal-day","washed-soft","home-used"], fits:["regular","relaxed"], defaults:{fabric:"cotton-jersey",weight:"light",iron:"lightly-unpressed",wear:"home-used",fit:"relaxed"} },
  "sleep-winter":{ fabrics:["flannel","cotton-jersey","cotton-fleece"], weights:["medium","heavy"], irons:["normal-pressed","lightly-unpressed","unpressed"], wear:["normal-day","washed-soft","home-used"], fits:["regular","relaxed"], defaults:{fabric:"flannel",weight:"medium",iron:"lightly-unpressed",wear:"home-used",fit:"relaxed"} },
  home:{ fabrics:["cotton-jersey","cotton-poplin","viscose-blend"], weights:["light","medium"], irons:["normal-pressed","lightly-unpressed","unpressed"], wear:["normal-day","hours-worn","washed-soft","home-used"], fits:["regular","relaxed","oversized"], defaults:{fabric:"cotton-jersey",weight:"light",iron:"lightly-unpressed",wear:"home-used",fit:"relaxed"} },
  robe:{ fabrics:["cotton-fleece","cotton-twill","microfiber"], weights:["medium","heavy"], irons:["lightly-unpressed","unpressed"], wear:["fresh","normal-day","washed-soft","home-used"], fits:["regular","relaxed"], defaults:{fabric:"cotton-fleece",weight:"heavy",iron:"unpressed",wear:"washed-soft",fit:"relaxed"} },
  tee:{ fabrics:["cotton-jersey","viscose-blend"], weights:["light","medium"], irons:["normal-pressed","lightly-unpressed","unpressed"], wear:["fresh","normal-day","hours-worn","washed-soft"], fits:["slim","regular","relaxed","oversized"], defaults:{fabric:"cotton-jersey",weight:"light",iron:"normal-pressed",wear:"normal-day",fit:"regular"} },
  "tee-heavy":{ fabrics:["heavy-cotton-jersey"], weights:["medium","heavy"], irons:["normal-pressed","lightly-unpressed"], wear:["fresh","normal-day","hours-worn","washed-soft"], fits:["regular","relaxed","oversized"], defaults:{fabric:"heavy-cotton-jersey",weight:"heavy",iron:"normal-pressed",wear:"normal-day",fit:"regular"} },
  shirt:{ fabrics:["cotton-poplin","cotton-oxford","cotton-linen"], weights:["light","medium"], irons:["fresh-pressed","normal-pressed","lightly-unpressed","unpressed"], wear:["fresh","normal-day","hours-worn","washed-soft"], fits:["slim","regular","relaxed"], defaults:{fabric:"cotton-oxford",weight:"medium",iron:"normal-pressed",wear:"normal-day",fit:"regular"} },
  "shirt-formal":{ fabrics:["cotton-poplin","polycotton","cotton-oxford"], weights:["light","medium"], irons:["fresh-pressed","normal-pressed","lightly-unpressed"], wear:["fresh","normal-day","hours-worn"], fits:["slim","regular"], defaults:{fabric:"cotton-poplin",weight:"light",iron:"fresh-pressed",wear:"normal-day",fit:"regular"} },
  "linen-shirt":{ fabrics:["linen","cotton-linen"], weights:["light","medium"], irons:["fresh-pressed","normal-pressed","lightly-unpressed","unpressed"], wear:["fresh","normal-day","hours-worn","washed-soft"], fits:["regular","relaxed"], defaults:{fabric:"linen",weight:"light",iron:"normal-pressed",wear:"normal-day",fit:"relaxed"} },
  polo:{ fabrics:["pique-cotton","cotton-jersey","polycotton"], weights:["light","medium"], irons:["normal-pressed","lightly-unpressed"], wear:["fresh","normal-day","hours-worn","washed-soft"], fits:["slim","regular","relaxed"], defaults:{fabric:"pique-cotton",weight:"medium",iron:"normal-pressed",wear:"normal-day",fit:"regular"} },
  "polo-soft":{ fabrics:["cotton-jersey","viscose-blend"], weights:["light","medium"], irons:["normal-pressed","lightly-unpressed"], wear:["fresh","normal-day","hours-worn"], fits:["regular","relaxed"], defaults:{fabric:"viscose-blend",weight:"light",iron:"normal-pressed",wear:"normal-day",fit:"regular"} },
  overshirt:{ fabrics:["cotton-twill","cotton-oxford","denim"], weights:["medium","heavy"], irons:["normal-pressed","lightly-unpressed","unpressed"], wear:["fresh","normal-day","hours-worn","washed-soft"], fits:["regular","relaxed","oversized"], defaults:{fabric:"cotton-twill",weight:"medium",iron:"lightly-unpressed",wear:"normal-day",fit:"relaxed"} },
  "light-jacket":{ fabrics:["cotton-twill","nylon-stretch","microfiber"], weights:["light","medium"], irons:["normal-pressed","lightly-unpressed"], wear:["fresh","normal-day","hours-worn"], fits:["regular","relaxed"], defaults:{fabric:"nylon-stretch",weight:"light",iron:"normal-pressed",wear:"normal-day",fit:"regular"} },
  knit:{ fabrics:["cotton-jersey","wool-blend","viscose-blend"], weights:["light","medium"], irons:["normal-pressed","lightly-unpressed"], wear:["fresh","normal-day","hours-worn","washed-soft"], fits:["regular","relaxed"], defaults:{fabric:"viscose-blend",weight:"light",iron:"lightly-unpressed",wear:"normal-day",fit:"relaxed"} },
  "tee-jeans":{ fabrics:["cotton-jersey","heavy-cotton-jersey"], weights:["light","medium"], irons:["normal-pressed","lightly-unpressed"], wear:["fresh","normal-day","hours-worn","washed-soft"], fits:["regular","relaxed"], defaults:{fabric:"cotton-jersey",weight:"light",iron:"normal-pressed",wear:"normal-day",fit:"regular"} },
  "shirt-chinos":{ fabrics:["cotton-poplin","cotton-oxford","cotton-linen"], weights:["light","medium"], irons:["fresh-pressed","normal-pressed","lightly-unpressed"], wear:["fresh","normal-day","hours-worn"], fits:["regular","relaxed"], defaults:{fabric:"cotton-oxford",weight:"medium",iron:"normal-pressed",wear:"normal-day",fit:"regular"} },
  thobe:{ fabrics:["cotton-poplin","polycotton"], weights:["light","medium"], irons:["fresh-pressed","normal-pressed","lightly-unpressed"], wear:["fresh","normal-day","hours-worn"], fits:["traditional-straight"], defaults:{fabric:"polycotton",weight:"light",iron:"fresh-pressed",wear:"normal-day",fit:"traditional-straight"} },
  "thobe-summer":{ fabrics:["polycotton","cotton-poplin"], weights:["light"], irons:["fresh-pressed","normal-pressed","lightly-unpressed"], wear:["fresh","normal-day","hours-worn"], fits:["traditional-straight"], defaults:{fabric:"polycotton",weight:"light",iron:"normal-pressed",wear:"normal-day",fit:"traditional-straight"} },
  "thobe-linen":{ fabrics:["cotton-linen","linen"], weights:["light","medium"], irons:["fresh-pressed","normal-pressed","lightly-unpressed","unpressed"], wear:["fresh","normal-day","hours-worn"], fits:["traditional-straight"], defaults:{fabric:"cotton-linen",weight:"light",iron:"normal-pressed",wear:"normal-day",fit:"traditional-straight"} },
  "thobe-winter":{ fabrics:["wool-blend","polycotton","cotton-twill"], weights:["medium","heavy"], irons:["fresh-pressed","normal-pressed","lightly-unpressed"], wear:["fresh","normal-day","hours-worn"], fits:["traditional-straight"], defaults:{fabric:"wool-blend",weight:"medium",iron:"normal-pressed",wear:"normal-day",fit:"traditional-straight"} },
  "work-shirt":{ fabrics:["cotton-poplin","cotton-oxford","polycotton"], weights:["light","medium"], irons:["fresh-pressed","normal-pressed","lightly-unpressed"], wear:["fresh","normal-day","hours-worn"], fits:["slim","regular"], defaults:{fabric:"cotton-poplin",weight:"light",iron:"normal-pressed",wear:"hours-worn",fit:"regular"} },
  "work-polo":{ fabrics:["pique-cotton","polycotton"], weights:["light","medium"], irons:["normal-pressed","lightly-unpressed"], wear:["fresh","normal-day","hours-worn"], fits:["regular","athletic"], defaults:{fabric:"pique-cotton",weight:"medium",iron:"normal-pressed",wear:"hours-worn",fit:"regular"} },
  sport:{ fabrics:["technical-poly","nylon-stretch"], weights:["light","medium"], irons:["normal-pressed","lightly-unpressed"], wear:["fresh","normal-day","post-workout"], fits:["regular","athletic"], defaults:{fabric:"technical-poly",weight:"light",iron:"normal-pressed",wear:"normal-day",fit:"athletic"} },
  "sport-jacket":{ fabrics:["technical-poly","nylon-stretch","microfiber"], weights:["light","medium"], irons:["normal-pressed","lightly-unpressed"], wear:["fresh","normal-day","post-workout"], fits:["regular","athletic"], defaults:{fabric:"nylon-stretch",weight:"light",iron:"normal-pressed",wear:"normal-day",fit:"athletic"} },
  denim:{ fabrics:["denim"], weights:["medium","heavy"], irons:["normal-pressed","lightly-unpressed","unpressed"], wear:["fresh","normal-day","hours-worn","washed-soft"], fits:["regular","relaxed"], defaults:{fabric:"denim",weight:"heavy",iron:"lightly-unpressed",wear:"normal-day",fit:"regular"} },
  fleece:{ fabrics:["cotton-fleece"], weights:["medium","heavy"], irons:["lightly-unpressed","unpressed"], wear:["fresh","normal-day","hours-worn","washed-soft","home-used"], fits:["regular","relaxed","oversized"], defaults:{fabric:"cotton-fleece",weight:"medium",iron:"lightly-unpressed",wear:"normal-day",fit:"relaxed"} },
  admin:{ fabrics:["cotton-twill","polycotton","tropical-wool"], weights:["medium"], irons:["fresh-pressed","normal-pressed","lightly-unpressed"], wear:["fresh","normal-day","hours-worn"], fits:["regular"], defaults:{fabric:"cotton-twill",weight:"medium",iron:"normal-pressed",wear:"hours-worn",fit:"regular"} }
});

const EXISTING_PROFILE_MAP = Object.freeze({
  "sleep-cotton-short":"sleep", "sleep-cotton-long":"sleep", "sleep-tee-shorts":"sleep", "sleep-tank-shorts":"sleep", "lounge-tee-trousers":"home", "lounge-set":"home", "robe-light":"robe", "robe-winter":"robe", "hoodie-home":"fleece",
  "tee-black":"tee", "tee-white":"tee", "tee-oversized":"tee", "shirt-casual":"shirt", "shirt-rolled":"shirt", "polo-matte":"polo", "sweatshirt":"fleece", "hoodie-casual":"fleece", "denim-jacket":"denim",
  "thobe-white":"thobe", "thobe-offwhite":"thobe", "thobe-casual":"thobe", "thobe-winter":"thobe-winter",
  "work-blue-navy":"work-shirt", "work-white-charcoal":"work-shirt", "work-dark-stone":"work-shirt", "work-admin-dark":"admin",
  "sport-dryfit":"sport", "sport-tee-shorts":"sport", "sport-tracksuit":"sport-jacket"
});

function clothingById(id) {
  return ALL_CLOTHING_OPTIONS.find((item) => item.value === id) ?? ALL_CLOTHING_OPTIONS[0];
}

function profileNameFor(id) {
  return clothingById(id)?.profile ?? EXISTING_PROFILE_MAP[id] ?? "tee";
}

function profileFor(id) {
  return PROFILE_RULES[profileNameFor(id)] ?? PROFILE_RULES.tee;
}

function filteredOptions(all, ids) {
  return all.filter((item) => ids.includes(item.value));
}

export function getExpandedClothingOptions(sceneId, custom = false) {
  if (custom) return ALL_CLOTHING_OPTIONS.map((item) => ({ ...item }));
  const filtered = ALL_CLOTHING_OPTIONS.filter((item) => item.scenes?.includes(sceneId));
  return (filtered.length ? filtered : ALL_CLOTHING_OPTIONS).map((item) => ({ ...item }));
}

export function getFabricOptions(clothingId) {
  return filteredOptions(FABRIC_OPTIONS, profileFor(clothingId).fabrics);
}

export function getFabricWeightOptions(clothingId, fabricId) {
  const profile = profileFor(clothingId);
  const fabric = FABRIC_OPTIONS.find((item) => item.value === fabricId);
  const allowed = profile.weights.filter((id) => fabric?.weights?.includes(id));
  return filteredOptions(FABRIC_WEIGHT_OPTIONS, allowed.length ? allowed : profile.weights);
}

export function getIronStateOptions(clothingId) {
  return filteredOptions(IRON_STATE_OPTIONS, profileFor(clothingId).irons);
}

export function getWearStateOptions(clothingId) {
  return filteredOptions(WEAR_STATE_OPTIONS, profileFor(clothingId).wear);
}

export function getClothingFitOptions(clothingId) {
  return filteredOptions(CLOTHING_FIT_OPTIONS, profileFor(clothingId).fits);
}

export function normalizeClothingPhysicsState(state) {
  const profile = profileFor(state.clothing);
  const fabrics = getFabricOptions(state.clothing);
  const fabric = fabrics.some((item) => item.value === state.fabric) ? state.fabric : profile.defaults.fabric;
  const weights = getFabricWeightOptions(state.clothing, fabric);
  const fabricWeight = weights.some((item) => item.value === state.fabricWeight) ? state.fabricWeight : profile.defaults.weight;
  const irons = getIronStateOptions(state.clothing);
  const ironState = irons.some((item) => item.value === state.ironState) ? state.ironState : profile.defaults.iron;
  const wears = getWearStateOptions(state.clothing);
  const wearState = wears.some((item) => item.value === state.wearState) ? state.wearState : profile.defaults.wear;
  const fits = getClothingFitOptions(state.clothing);
  const clothingFit = fits.some((item) => item.value === state.clothingFit) ? state.clothingFit : profile.defaults.fit;
  return { fabric, fabricWeight, ironState, wearState, clothingFit };
}

function textOf(options, value) {
  return options.find((item) => item.value === value)?.text ?? "";
}

function poseFabricRule(poseFamily, poseId, sceneId, composition) {
  if (poseFamily === "lying" || /lying|bed/i.test(poseId)) {
    return "Because the body is lying or reclining, cloth shifts toward gravity, bunches asymmetrically away from supported surfaces, and compresses under the shoulder, side, back or hip only where those areas actually contact bedding or furniture.";
  }
  if (poseFamily === "seated" || /seat|seated|driver|waiting/i.test(poseId) || sceneId === "rangeRover") {
    if (["tight","close"].includes(composition)) {
      return "Because the body is seated, any visible collar, shoulders, upper chest and sleeves respond to real posture and arm position. Seat, lap and waist compression remain physically present but implicit outside this crop; do not force them into view.";
    }
    return "Because the body is seated, fabric develops localized compression and radial folds at the lap, waist and seat contact, with elbow or sleeve creases from arm position; do not invent knee or trouser folds when those areas are outside the crop.";
  }
  if (poseFamily === "standing" || poseFamily === "street") {
    return "Because the body is standing, most unsupported cloth falls vertically under gravity, while elbows, waist rotation and shoulder asymmetry create only localized natural creases.";
  }
  if (poseFamily === "gym" || poseFamily === "activity") {
    return "Match fabric tension and wrinkles to the exact current movement or pause, keeping stretch localized to joints and contact points rather than covering the garment in generic folds.";
  }
  return "Let gravity, body curvature, seams and real contact determine the fold map; avoid decorative or uniformly distributed wrinkles.";
}

export function buildClothingPhysicsText(state) {
  const garment = clothingById(state.clothing);
  const fabric = textOf(FABRIC_OPTIONS, state.fabric);
  const weight = textOf(FABRIC_WEIGHT_OPTIONS, state.fabricWeight);
  const iron = textOf(IRON_STATE_OPTIONS, state.ironState);
  const wear = textOf(WEAR_STATE_OPTIONS, state.wearState);
  const fit = textOf(CLOTHING_FIT_OPTIONS, state.clothingFit);
  const crop = ["tight","close"].includes(state.composition)
    ? "For this tight or close selfie, describe fabric weave, collar, shoulders, upper chest and sleeves only where visible. Do not force trousers, knees, waistbands or lower-body folds into frame."
    : "Describe only garment regions that actually enter the selected framing; off-frame fabric physics remains implicit rather than being forced into view.";
  return [
    `[CLOTHING PHYSICS] Selected garment: ${garment?.label ?? state.clothing}.`,
    `Selected fabric: ${fabric}. The selected fabric is authoritative and overrides any generic material wording in the garment preset.`,
    `Selected weight: ${weight}.`,
    `Iron state: ${iron}.`,
    `Wear state: ${wear}.`,
    `Fit: ${fit}.`,
    poseFabricRule(state.poseFamily, state.pose, state.scene, state.composition),
    crop,
    "Keep weave scale, edge thickness, seam tension, wrinkle size, compression, stretch and specular response consistent with this exact fabric and weight. Pressing may reduce old wrinkles but never prevents fresh pose creases. Wear may soften structure but never changes the garment into a different material. Do not make matte cotton glossy, linen perfectly smooth, heavy fabric float, or technical sports fabric behave like paper."
  ].join(" ");
}

export function clothingQaText(state) {
  const garment = clothingById(state.clothing)?.label ?? state.clothing;
  const fabric = FABRIC_OPTIONS.find((item) => item.value === state.fabric)?.label ?? state.fabric;
  const iron = IRON_STATE_OPTIONS.find((item) => item.value === state.ironState)?.label ?? state.ironState;
  const wear = WEAR_STATE_OPTIONS.find((item) => item.value === state.wearState)?.label ?? state.wearState;
  return `${garment} · ${fabric} · ${iron} · ${wear} · الطيات مرتبطة بالوضعية والكادر`;
}

export const CLOTHING_NEGATIVE_RULES = Object.freeze([
  "impossible fabric behavior",
  "wrong fabric texture for selected material",
  "silk-like gloss on matte cotton",
  "plastic-looking cloth",
  "paper-like fabric folds",
  "perfectly wrinkle-free worn clothing",
  "uniform decorative wrinkle pattern",
  "fabric floating away from body without support",
  "fabric clipping through body",
  "lower-body clothing forced into tight close-up"
]);
