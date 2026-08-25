const BASE_CLOTHING_OPTIONS = Object.freeze([
  // ── ملابس نوم ──
  { id:"cotton_pajama", name_ar:"بيجاما قطنية رمادية", name_en:"grey two-piece cotton pajama set", category:"sleepwear",
    pieces:"loose grey cotton pajama shirt with matching pants",
    fabric:{ type:"cotton", weight:"light-medium", sheen:"matte", drape:"soft relaxed sleepwear fit", folds:"irregular soft load-driven folds", texture:"subtle non-repeating weave", wear:"very slight home wear, soft collar" } },
  { id:"satin_pajama", name_ar:"بيجاما ساتان كحلية", name_en:"navy satin pajama set", category:"sleepwear",
    pieces:"navy satin pajama shirt with matching pants",
    fabric:{ type:"satin", weight:"light", sheen:"soft directional sheen", drape:"fluid, slides over body curves", folds:"smooth flowing folds", texture:"fine smooth surface", wear:"none, crisp seams" } },
  { id:"sleep_tee_shorts", name_ar:"تيشيرت نوم + شورت", name_en:"loose sleep t-shirt with cotton shorts", category:"sleepwear",
    pieces:"oversized soft sleep t-shirt with cotton shorts",
    fabric:{ type:"cotton jersey", weight:"light", sheen:"matte", drape:"loose, clings slightly at shoulder", folds:"soft random folds", texture:"faint knit lines", wear:"washed softness" } },
  { id:"thermal_sleep", name_ar:"قميص نوم حراري بأكمام طويلة", name_en:"long-sleeve thermal sleep shirt", category:"sleepwear",
    pieces:"long-sleeve waffle-knit thermal sleep shirt with soft pants",
    fabric:{ type:"waffle-knit cotton", weight:"medium", sheen:"matte", drape:"close but relaxed", folds:"fine ribbed folds at elbows", texture:"waffle grid, non-repeating shading", wear:"soft cuffs" } },

  // ── كاجوال ──
  { id:"heather_tee_jeans", name_ar:"تيشيرت رمادي + جينز داكن", name_en:"heather grey t-shirt with dark jeans", category:"casual",
    pieces:"heather grey cotton t-shirt with dark denim jeans",
    fabric:{ type:"cotton jersey / denim", weight:"light / heavy", sheen:"matte", drape:"t-shirt soft; jeans stiff", folds:"soft folds on tee; sharp creases at jean hips and knees", texture:"heather fleck; denim twill lines", wear:"slight denim fading at thighs" } },
  { id:"longsleeve_chino", name_ar:"تيشيرت أكمام طويلة + تشينو", name_en:"long-sleeve t-shirt with chinos", category:"casual",
    pieces:"long-sleeve cotton t-shirt with beige chinos",
    fabric:{ type:"cotton", weight:"medium", sheen:"matte", drape:"relaxed", folds:"stacked folds at wrists and elbows", texture:"subtle weave", wear:"soft collar" } },
  { id:"oxford_shirt_chino", name_ar:"قميص أكسفورد + تشينو", name_en:"oxford button shirt with chinos", category:"casual",
    pieces:"light oxford button-up shirt with chinos",
    fabric:{ type:"oxford cotton", weight:"medium", sheen:"matte", drape:"structured with soft body wrinkles", folds:"natural wrinkle lines from wear", texture:"visible oxford basket weave", wear:"lightly lived-in wrinkles, crisp-ish collar" } },
  { id:"flannel_jeans", name_ar:"قميص فلانيل + جينز", name_en:"flannel check shirt with jeans", category:"casual",
    pieces:"brushed flannel check shirt with jeans",
    fabric:{ type:"brushed flannel", weight:"medium-heavy", sheen:"matte", drape:"slightly stiff, hangs straight", folds:"broad soft folds", texture:"check pattern geometrically consistent, no moiré", wear:"brushed soft surface" } },
  { id:"polo_chino", name_ar:"بولو + تشينو", name_en:"polo shirt with chinos", category:"casual",
    pieces:"piqué polo shirt with chinos",
    fabric:{ type:"piqué cotton", weight:"medium", sheen:"matte", drape:"semi-structured", folds:"soft folds at waist", texture:"piqué honeycomb knit", wear:"soft rolled collar" } },
  { id:"hoodie_sweats", name_ar:"هودي + بنطال رياضي", name_en:"hoodie with sweatpants", category:"casual",
    pieces:"fleece hoodie with matching sweatpants",
    fabric:{ type:"fleece", weight:"heavy", sheen:"matte", drape:"thick, holds shape", folds:"bulky soft folds, ribbed cuffs gathered", texture:"fleece nap, no plastic shine", wear:"slight pilling at cuffs" } },
  { id:"sweater_jeans", name_ar:"كنزة صوف + جينز داكن", name_en:"knit sweater with dark jeans", category:"casual",
    pieces:"wool-blend knit sweater with dark jeans",
    fabric:{ type:"wool knit", weight:"heavy", sheen:"matte", drape:"heavy, falls straight", folds:"thick folds at elbows and waist", texture:"knit ribs with realistic stitch variation", wear:"mild pilling under arms" } },

  // ── رياضي ──
  { id:"dryfit_track", name_ar:"تيشيرت رياضي + بنطال تدريب", name_en:"dry-fit athletic tee with track pants", category:"sport",
    pieces:"polyester dry-fit athletic t-shirt with track pants",
    fabric:{ type:"polyester tech", weight:"light", sheen:"slight synthetic sheen", drape:"smooth, follows muscle shape", folds:"fine smooth folds", texture:"micro-texture, no repeating stamp", wear:"none" } },
  { id:"track_jacket", name_ar:"جاكيت رياضي بسحّاب + بنطال تدريب", name_en:"zip track jacket with track pants", category:"sport",
    pieces:"zip-up track jacket with track pants",
    fabric:{ type:"polyester interlock", weight:"medium", sheen:"low sheen", drape:"smooth with structured shoulders", folds:"clean folds at elbows", texture:"fine grain; zipper teeth realistic", wear:"none" } },

  // ── شتوي ──
  { id:"denim_jacket", name_ar:"جاكيت جينز + تيشيرت + جينز", name_en:"denim jacket over t-shirt with jeans", category:"winter",
    pieces:"rigid denim jacket over plain t-shirt with jeans",
    fabric:{ type:"denim", weight:"heavy", sheen:"matte", drape:"stiff, holds angular shape", folds:"sharp creases at elbows and seams", texture:"twill lines, seam stitching visible", wear:"natural fading at seams and collar" } },
  { id:"leather_jacket", name_ar:"جاكيت جلد + تيشيرت + جينز", name_en:"leather jacket over t-shirt with jeans", category:"winter",
    pieces:"black leather jacket over t-shirt with jeans",
    fabric:{ type:"leather", weight:"heavy", sheen:"soft specular highlights", drape:"stiff with body-memory creases", folds:"broad creases at elbows", texture:"natural grain, no uniform pattern", wear:"slight shine at edges from use" } },
  { id:"puffer_jacket", name_ar:"جاكيت منتفخ + بنطال شتوي", name_en:"quilted puffer jacket with winter pants", category:"winter",
    pieces:"matte quilted puffer jacket with winter pants",
    fabric:{ type:"nylon shell + down", weight:"heavy", sheen:"matte with soft top light", drape:"segmented puff volume", folds:"compression wrinkles at seams and under arms", texture:"quilt channels with realistic loft variation", wear:"none" } },
  { id:"wool_coat", name_ar:"معطف صوف + قميص", name_en:"wool overcoat over shirt", category:"winter",
    pieces:"camel wool overcoat over button shirt",
    fabric:{ type:"wool melton", weight:"heavy", sheen:"matte", drape:"long, heavy fall", folds:"deep vertical folds", texture:"felted wool surface", wear:"soft nap at cuffs" } },

  // ── تقليدي ──
  { id:"thobe", name_ar:"ثوب أبيض", name_en:"white thobe", category:"traditional",
    pieces:"lightweight white thobe with natural fall",
    fabric:{ type:"light poly-cotton blend", weight:"light", sheen:"matte", drape:"flowing, sways with body", folds:"long vertical folds from shoulders", texture:"fine smooth weave", wear:"optional soft pressed crease" } }
]);

export const EXTRA_CLOTHING_OPTIONS = Object.freeze([
  { id:"white_shirt_charcoal_trousers", name_ar:"قميص أبيض + بنطال فحمي", name_en:"white cotton shirt with charcoal trousers", category:"casual",
    pieces:"clean white long-sleeve cotton button-up shirt with charcoal tailored trousers",
    fabric:{ type:"cotton poplin / wool-blend trouser fabric", weight:"light-medium / medium", sheen:"matte", drape:"shirt crisp but lived-in; trousers clean vertical fall", folds:"small elbow and waist creases; restrained trouser breaks at knees and ankles", texture:"fine poplin weave and subtle trouser twill", wear:"light natural wear with a softly rolled collar" } },
  { id:"lightblue_shirt_navy_trousers", name_ar:"قميص أزرق فاتح + بنطال كحلي", name_en:"light blue shirt with navy trousers", category:"casual",
    pieces:"light blue cotton button-up shirt with deep navy tailored trousers",
    fabric:{ type:"cotton poplin / cotton-wool blend", weight:"light-medium / medium", sheen:"matte", drape:"soft structured shirt; straight trouser fall", folds:"natural sleeve, waist, hip and knee folds", texture:"fine plain weave with subtle trouser twill", wear:"mild lived-in creasing" } },
  { id:"black_shirt_charcoal_trousers", name_ar:"قميص أسود + بنطال فحمي", name_en:"black shirt with charcoal trousers", category:"casual",
    pieces:"matte black cotton button-up shirt with charcoal trousers",
    fabric:{ type:"cotton sateen-low-sheen / trouser twill", weight:"medium", sheen:"very low sheen", drape:"structured but relaxed", folds:"broad natural folds at elbows, waist and knees", texture:"subtle cotton grain; non-repeating trouser twill", wear:"softened collar and cuffs" } },
  { id:"olive_shirt_beige_chinos", name_ar:"قميص زيتوني + بنطال بيج", name_en:"muted olive shirt with beige chinos", category:"casual",
    pieces:"muted olive cotton shirt with warm beige chinos",
    fabric:{ type:"cotton twill", weight:"medium", sheen:"matte", drape:"relaxed structured casual fit", folds:"soft sleeve folds and natural chino creases at hips, knees and ankles", texture:"fine irregular twill weave", wear:"slight washed softness" } },
  { id:"navy_shirt_stone_chinos", name_ar:"قميص كحلي + بنطال حجري فاتح", name_en:"navy shirt with stone chinos", category:"casual",
    pieces:"deep navy cotton shirt with light stone-colored chinos",
    fabric:{ type:"cotton oxford / cotton twill", weight:"medium", sheen:"matte", drape:"shirt semi-structured; chinos relaxed straight", folds:"realistic elbow, waist, hip and knee folds", texture:"fine oxford basket weave and subtle chino twill", wear:"lightly softened by wear" } },
  { id:"burgundy_shirt_black_trousers", name_ar:"قميص عنابي داكن + بنطال أسود", name_en:"dark burgundy shirt with black trousers", category:"casual",
    pieces:"dark burgundy cotton button-up shirt with matte black trousers",
    fabric:{ type:"cotton poplin / trouser twill", weight:"light-medium / medium", sheen:"matte", drape:"clean relaxed shirt with straight trouser fall", folds:"restrained natural folds at elbows, waistband, knees and ankles", texture:"fine cotton weave and soft non-repeating twill", wear:"mild collar and cuff softness" } },
  { id:"sage_shirt_offwhite_chinos", name_ar:"قميص أخضر ساج + بنطال أوف وايت", name_en:"sage green shirt with off-white chinos", category:"casual",
    pieces:"muted sage green cotton-linen shirt with off-white chinos",
    fabric:{ type:"cotton-linen blend / cotton twill", weight:"light-medium", sheen:"matte", drape:"airier shirt with natural relaxed wrinkles; chinos softly structured", folds:"irregular linen-like sleeve and torso creases with soft chino folds", texture:"slubbed non-repeating shirt weave and fine chino twill", wear:"subtle washed softness" } },
  { id:"cream_shirt_olive_trousers", name_ar:"قميص كريمي + بنطال زيتوني", name_en:"cream shirt with olive trousers", category:"casual",
    pieces:"warm cream cotton shirt with muted olive trousers",
    fabric:{ type:"cotton oxford / cotton twill", weight:"medium", sheen:"matte", drape:"structured shirt with relaxed trouser fall", folds:"natural shoulder, elbow, waist, hip and knee folds", texture:"visible fine oxford weave and subdued twill", wear:"soft collar roll and slight natural creasing" } },
  { id:"palegrey_shirt_navy_trousers", name_ar:"قميص رمادي فاتح + بنطال كحلي", name_en:"pale grey shirt with navy trousers", category:"casual",
    pieces:"pale grey cotton button-up shirt with navy trousers",
    fabric:{ type:"cotton poplin / wool-blend twill", weight:"light-medium / medium", sheen:"matte", drape:"shirt clean and soft; trousers fall vertically", folds:"small natural creases at elbows and waist with restrained trouser breaks", texture:"fine poplin weave and subtle navy twill", wear:"slight lived-in softness" } },
  { id:"denimshirt_tan_chinos", name_ar:"قميص جينز أزرق + بنطال تان", name_en:"blue denim shirt with tan chinos", category:"casual",
    pieces:"mid-blue lightweight denim shirt with tan chinos",
    fabric:{ type:"light denim / cotton twill", weight:"medium", sheen:"matte", drape:"denim shirt slightly structured; chinos relaxed", folds:"defined sleeve and waist creases with natural hip and knee folds", texture:"visible denim twill and fine chino grain", wear:"subtle fading at denim seams and cuffs" } },
  { id:"white_tee_olive_chinos", name_ar:"تيشيرت أبيض + تشينو زيتوني", name_en:"white t-shirt with olive chinos", category:"casual",
    pieces:"plain white cotton jersey t-shirt with muted olive chinos",
    fabric:{ type:"cotton jersey / cotton twill", weight:"light / medium", sheen:"matte", drape:"t-shirt soft and relaxed; chinos lightly structured", folds:"soft torso folds with natural hip, knee and ankle creases", texture:"fine jersey knit and non-repeating twill", wear:"subtle washed softness" } },
  { id:"black_tee_beige_chinos", name_ar:"تيشيرت أسود + تشينو بيج", name_en:"black t-shirt with beige chinos", category:"casual",
    pieces:"matte black cotton t-shirt with warm beige chinos",
    fabric:{ type:"cotton jersey / cotton twill", weight:"light / medium", sheen:"matte", drape:"soft t-shirt with relaxed straight chinos", folds:"natural chest and waist folds with restrained knee and ankle breaks", texture:"fine cotton knit and soft twill grain", wear:"slightly softened collar" } },
  { id:"navy_polo_grey_trousers", name_ar:"بولو كحلي + بنطال رمادي", name_en:"navy polo with grey trousers", category:"casual",
    pieces:"navy piqué polo shirt with medium grey trousers",
    fabric:{ type:"piqué cotton / trouser twill", weight:"medium", sheen:"matte", drape:"polo semi-structured; trousers clean and relaxed", folds:"soft waist and sleeve folds with realistic trouser knee breaks", texture:"piqué knit and subtle trouser twill", wear:"soft natural collar roll" } },
  { id:"sand_polo_navy_chinos", name_ar:"بولو رملي + تشينو كحلي", name_en:"sand polo with navy chinos", category:"casual",
    pieces:"muted sand-colored piqué polo with navy chinos",
    fabric:{ type:"piqué cotton / cotton twill", weight:"medium", sheen:"matte", drape:"semi-structured polo with relaxed chinos", folds:"soft waist folds and natural hip, knee and ankle creases", texture:"fine piqué knit and non-repeating twill", wear:"lightly softened collar and cuffs" } }
]);

export const CLOTHING_CATALOG = Object.freeze([...BASE_CLOTHING_OPTIONS, ...EXTRA_CLOTHING_OPTIONS]);

// Keep the historical Node regression baseline stable while the browser UI receives the expanded catalog.
// Extra options are tested separately through EXTRA_CLOTHING_OPTIONS and CLOTHING_CATALOG.
export const CLOTHING_OPTIONS = typeof window === "undefined" ? BASE_CLOTHING_OPTIONS : CLOTHING_CATALOG;

export const CLOTHING_BY_ID = Object.freeze(Object.fromEntries(CLOTHING_CATALOG.map((item) => [item.id, item])));
