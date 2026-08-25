export const CLOTHING_OPTIONS = Object.freeze([
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

export const CLOTHING_BY_ID = Object.freeze(Object.fromEntries(CLOTHING_OPTIONS.map((item) => [item.id, item])));
