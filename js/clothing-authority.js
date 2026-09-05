export const CLOTHING_SECTION_ORDER = Object.freeze(["home", "casual", "formal", "sport", "traditional", "outdoor"]);

export const CLOTHING_SECTION_LABELS = Object.freeze({
  home: "منزل",
  casual: "كاجوال",
  formal: "رسمي",
  sport: "رياضي",
  traditional: "تقليدي",
  outdoor: "خارجي"
});

export const CUSTOM_CLOTHING_OPTION = Object.freeze({ value:"custom", label:"✍️ مخصص — اكتب ملابسك", text:"" });
export const CLOTHING_TOP_OPTIONS = Object.freeze([CUSTOM_CLOTHING_OPTION]);

export const TRADITIONAL = Object.freeze([
  Object.freeze({ value:"thobe-white", label:"ثوب أبيض سادة", text:"crisp white Saudi thobe with natural standing folds" }),
  Object.freeze({ value:"thobe-redshemagh-iqal", label:"ثوب أبيض + شماغ أحمر + عقال", text:"crisp white thobe with a red-and-white checkered shemagh and black iqal, youthful style with one end casually thrown over the shoulder" }),
  Object.freeze({ value:"thobe-whiteghutra-iqal", label:"ثوب أبيض + غترة بيضاء + عقال", text:"white thobe with white ghutra and black iqal, neat drape" }),
  Object.freeze({ value:"thobe-bisht", label:"ثوب أبيض + بشت بني", text:"white thobe with brown bisht draped over the shoulders" })
]);

export const FULL_OUTFITS = Object.freeze({
  home: Object.freeze([
    Object.freeze({ value:"home-flannel-red-black", label:"بيجاما فلانيل شتوية حمراء-سوداء + بنطلون بيجاما مطابق", text:"winter red-and-black flannel pajama shirt with matching red-and-black pajama pants" }),
    Object.freeze({ value:"home-sleep-white-gray", label:"قميص نوم طويل بسيط أبيض + شورت قطني رمادي", text:"simple long white sleep shirt with gray cotton shorts" }),
    Object.freeze({ value:"home-robe-brown-white", label:"روب حمام قطني بني + تيشيرت أبيض + بنطلون قطني رمادي", text:"brown cotton bathrobe over a white T-shirt with gray cotton pants" }),
    Object.freeze({ value:"home-henley-gray-navy", label:"هنلي منزلي رمادي قصير الأكمام + بنطلون قطني كحلي", text:"gray short-sleeve home Henley shirt with navy cotton pants" }),
    Object.freeze({ value:"home-tee-white-navy", label:"تيشيرت منزلي أبيض + بنطلون بيجاما كحلي", text:"white home T-shirt with navy pajama pants" }),
    Object.freeze({ value:"home-sweatshirt-gray-black", label:"سويتشيرت منزلي رمادي + بنطلون قطني أسود", text:"gray home sweatshirt with black cotton pants" }),
    Object.freeze({ value:"home-polo-navy-beige", label:"بولو منزلي كحلي + شورت قطني بيج", text:"navy home polo shirt with beige cotton shorts" }),
    Object.freeze({ value:"home-tee-black-gray-shorts", label:"تيشيرت منزلي أسود خفيف + شورت قطني رمادي", text:"lightweight black home T-shirt with gray cotton shorts" }),
    Object.freeze({ value:"home-tank-white-navy-shorts", label:"فانيلة داخلية بيضاء + شورت منزلي كحلي", text:"white sleeveless undershirt with navy home shorts" }),
    Object.freeze({ value:"home-longtee-gray-black", label:"تيشيرت منزلي رمادي طويل الأكمام + بنطلون بيجاما أسود", text:"gray long-sleeve home T-shirt with black pajama pants" }),
    Object.freeze({ value:"home-hoodie-navy-gray", label:"هودي منزلي كحلي + بنطلون قطني رمادي", text:"navy home hoodie with gray cotton pants" }),
    Object.freeze({ value:"home-cardigan-brown-white", label:"كارديغان منزلي بني + تيشيرت أبيض + بنطلون قطني كحلي", text:"brown home cardigan over a white T-shirt with navy cotton pants" }),
    Object.freeze({ value:"home-thermal-black-gray", label:"بلوزة حرارية سوداء + بنطلون منزلي رمادي", text:"black thermal top with gray home pants" }),
    Object.freeze({ value:"home-pajama-blue-gray", label:"قميص بيجاما أزرق فاتح + بنطلون بيجاما رمادي", text:"light blue pajama shirt with gray pajama pants" }),
    Object.freeze({ value:"home-linen-white-beige", label:"قميص منزلي كتان أبيض + شورت قطني بيج", text:"white linen home shirt with beige cotton shorts" })
  ]),
  casual: Object.freeze([
    Object.freeze({ value:"casual-tee-black-jeans-blue", label:"تيشيرت أسود ثقيل + جينز أزرق داكن", text:"heavy black cotton T-shirt with dark blue jeans" }),
    Object.freeze({ value:"casual-tee-white-chino-beige", label:"تيشيرت أبيض ثقيل + بنطلون تشينو بيج", text:"heavy white cotton T-shirt with beige chino pants" }),
    Object.freeze({ value:"casual-henley-gray-jeans-black", label:"هنلي رمادي طويل الأكمام + جينز أسود", text:"gray long-sleeve Henley shirt with black jeans" }),
    Object.freeze({ value:"casual-oxford-blue-trouser-gray", label:"قميص أكسفورد كاجوال أزرق فاتح + بنطلون قماش رمادي", text:"light blue casual Oxford shirt with gray trousers" }),
    Object.freeze({ value:"casual-linen-white-shorts-beige", label:"قميص كتان كاجوال أبيض + شورت بيج", text:"white casual linen shirt with beige shorts" }),
    Object.freeze({ value:"casual-polo-navy-chino-gray", label:"بولو كحلي + بنطلون تشينو رمادي", text:"navy polo shirt with gray chino pants" }),
    Object.freeze({ value:"casual-shirt-brown-jeans-blue", label:"قميص كاجوال بني + جينز أزرق", text:"brown casual shirt with blue jeans" }),
    Object.freeze({ value:"casual-tee-red-cargo-black", label:"تيشيرت أحمر داكن + بنطلون كارغو أسود", text:"dark red T-shirt with black cargo pants" }),
    Object.freeze({ value:"casual-denim-blue-tee-white-black", label:"جاكيت دنيم أزرق + تيشيرت أبيض + جينز أسود", text:"blue denim jacket over a white T-shirt with black jeans" }),
    Object.freeze({ value:"casual-overshirt-olive-tee-white-beige", label:"أوفرشيرت زيتي + تيشيرت أبيض + بنطلون تشينو بيج", text:"olive overshirt over a white T-shirt with beige chino pants" }),
    Object.freeze({ value:"casual-polo-black-jeans-gray", label:"بولو أسود + جينز رمادي داكن", text:"black polo shirt with dark gray jeans" }),
    Object.freeze({ value:"casual-sweater-navy-chino-beige", label:"كنزة كحلية خفيفة + بنطلون تشينو بيج", text:"lightweight navy sweater with beige chino pants" }),
    Object.freeze({ value:"casual-shirt-white-jeans-blue", label:"قميص كاجوال أبيض بأكمام مطوية + جينز أزرق داكن", text:"white casual shirt with rolled sleeves and dark blue jeans" }),
    Object.freeze({ value:"casual-henley-black-cargo-gray", label:"هنلي أسود قصير الأكمام + بنطلون كارغو رمادي", text:"black short-sleeve Henley shirt with gray cargo pants" }),
    Object.freeze({ value:"casual-knit-brown-trouser-black", label:"بولو محبوك بني + بنطلون قماش أسود", text:"brown knit polo shirt with black trousers" })
  ]),
  formal: Object.freeze([
    Object.freeze({ value:"formal-poplin-white-suit-black", label:"قميص بوبلين مرتب أبيض + بنطلون بدلة أسود", text:"pressed white poplin shirt with black suit trousers" }),
    Object.freeze({ value:"formal-shirt-blue-trouser-gray-belt-brown", label:"قميص رسمي أزرق + بنطلون رمادي داكن + حزام بني", text:"blue formal shirt with dark gray trousers and a brown belt" }),
    Object.freeze({ value:"formal-shirt-white-trouser-navy", label:"قميص رسمي أبيض + بنطلون بدلة كحلي", text:"white formal shirt with navy suit trousers" }),
    Object.freeze({ value:"formal-shirt-gray-trouser-black", label:"قميص رسمي رمادي فاتح + بنطلون بدلة أسود", text:"light gray formal shirt with black suit trousers" }),
    Object.freeze({ value:"formal-oxford-blue-chino-beige", label:"قميص أكسفورد أزرق فاتح + بنطلون تشينو بيج", text:"light blue Oxford shirt with beige chino pants" }),
    Object.freeze({ value:"formal-shirt-black-trouser-gray", label:"قميص رسمي أسود + بنطلون قماش رمادي", text:"black formal shirt with gray trousers" }),
    Object.freeze({ value:"formal-shirt-white-trouser-brown", label:"قميص رسمي أبيض + بنطلون قماش بني", text:"white formal shirt with brown trousers" }),
    Object.freeze({ value:"formal-suit-navy-white", label:"جاكيت بدلة كحلي + قميص أبيض + بنطلون بدلة كحلي", text:"navy suit jacket over a white shirt with navy suit trousers" }),
    Object.freeze({ value:"formal-suit-gray-blue", label:"جاكيت بدلة رمادي داكن + قميص أزرق فاتح + بنطلون بدلة رمادي", text:"dark gray suit jacket over a light blue shirt with gray suit trousers" }),
    Object.freeze({ value:"formal-blazer-brown-white-black", label:"بليزر بني + قميص أبيض + بنطلون رسمي أسود", text:"brown blazer over a white shirt with black formal trousers" }),
    Object.freeze({ value:"formal-blazer-navy-white-beige", label:"بليزر كحلي + قميص أبيض + بنطلون تشينو بيج", text:"navy blazer over a white shirt with beige chino pants" }),
    Object.freeze({ value:"formal-vest-gray-white-black", label:"فيست بدلة رمادي + قميص أبيض + بنطلون أسود", text:"gray suit vest over a white shirt with black trousers" }),
    Object.freeze({ value:"formal-turtleneck-black-gray", label:"ياقة عالية سوداء + بنطلون رسمي رمادي داكن", text:"black turtleneck with dark gray formal trousers" }),
    Object.freeze({ value:"formal-shirt-navy-gray", label:"قميص رسمي كحلي + بنطلون قماش رمادي فاتح", text:"navy formal shirt with light gray trousers" }),
    Object.freeze({ value:"formal-shirt-white-beige", label:"قميص رسمي أبيض + بنطلون قماش بيج + حزام بني", text:"white formal shirt with beige trousers and a brown belt" })
  ]),
  sport: Object.freeze([
    Object.freeze({ value:"sport-tee-black-shorts-gray", label:"تيشيرت رياضي أسود + شورت تدريب رمادي", text:"black training T-shirt with gray training shorts" }),
    Object.freeze({ value:"sport-tracksuit-olive", label:"طقم تدريب زيتي كامل — هودي زيتي + بنطلون jogger زيتي", text:"olive training hoodie with matching olive jogger pants" }),
    Object.freeze({ value:"sport-tee-white-jogger-black", label:"تيشيرت رياضي أبيض + بنطلون jogger أسود", text:"white training T-shirt with black jogger pants" }),
    Object.freeze({ value:"sport-top-navy-shorts-black", label:"قميص تدريب كحلي + شورت رياضي أسود", text:"navy training top with black athletic shorts" }),
    Object.freeze({ value:"sport-hoodie-gray-jogger-black", label:"هودي رياضي رمادي + بنطلون jogger أسود", text:"gray training hoodie with black jogger pants" }),
    Object.freeze({ value:"sport-tee-red-shorts-black", label:"تيشيرت رياضي أحمر + شورت تدريب أسود", text:"red training T-shirt with black training shorts" }),
    Object.freeze({ value:"sport-zip-black-jogger-gray", label:"جاكيت تدريب بسحاب أسود + بنطلون jogger رمادي", text:"black zip-up training jacket with gray jogger pants" }),
    Object.freeze({ value:"sport-tank-black-shorts-gray", label:"تانك رياضي أسود + شورت تدريب رمادي", text:"black athletic tank top with gray training shorts" }),
    Object.freeze({ value:"sport-compression-black-shorts-red", label:"تيشيرت ضغط رياضي أسود + شورت رياضي أحمر داكن", text:"black compression training shirt with dark red athletic shorts" }),
    Object.freeze({ value:"sport-longtop-gray-jogger-navy", label:"قميص تدريب رمادي طويل الأكمام + بنطلون jogger كحلي", text:"gray long-sleeve training top with navy jogger pants" }),
    Object.freeze({ value:"sport-polo-white-shorts-navy", label:"بولو رياضي أبيض + شورت رياضي كحلي", text:"white athletic polo shirt with navy athletic shorts" }),
    Object.freeze({ value:"sport-windbreaker-navy-black", label:"جاكيت رياضي خفيف كحلي + بنطلون تدريب أسود", text:"navy lightweight training windbreaker with black training pants" }),
    Object.freeze({ value:"sport-sweatshirt-gray-jogger-gray", label:"سويتشيرت رياضي رمادي + بنطلون jogger رمادي داكن", text:"gray training sweatshirt with dark gray jogger pants" }),
    Object.freeze({ value:"sport-tee-blue-shorts-black", label:"تيشيرت رياضي أزرق + شورت تدريب أسود", text:"blue training T-shirt with black training shorts" }),
    Object.freeze({ value:"sport-hoodie-black-shorts-gray", label:"هودي رياضي أسود خفيف + شورت تدريب رمادي", text:"lightweight black training hoodie with gray training shorts" })
  ]),
  traditional: Object.freeze([
    Object.freeze({ value:"traditional-thobe-white-shemagh-red-iqal-black", label:"ثوب أبيض + شماغ أحمر + عقال أسود", text:"white thobe with red-and-white shemagh and black iqal" }),
    Object.freeze({ value:"traditional-thobe-white-bisht-brown", label:"ثوب أبيض + بشت بني", text:"white thobe with a brown bisht" }),
    Object.freeze({ value:"traditional-thobe-beige-ghutra-white-iqal-black", label:"ثوب بيج + غترة بيضاء + عقال أسود", text:"beige thobe with white ghutra and black iqal" }),
    Object.freeze({ value:"traditional-thobe-white-ghutra-white-iqal-black", label:"ثوب أبيض + غترة بيضاء + عقال أسود", text:"white thobe with white ghutra and black iqal" }),
    Object.freeze({ value:"traditional-thobe-gray-shemagh-red-iqal-black", label:"ثوب رمادي + شماغ أحمر + عقال أسود", text:"gray thobe with red-and-white shemagh and black iqal" }),
    Object.freeze({ value:"traditional-thobe-white-bisht-black", label:"ثوب أبيض + بشت أسود", text:"white thobe with a black bisht" }),
    Object.freeze({ value:"traditional-thobe-beige-shemagh-red-iqal-black", label:"ثوب بيج + شماغ أحمر + عقال أسود", text:"beige thobe with red-and-white shemagh and black iqal" }),
    Object.freeze({ value:"traditional-thobe-white-shemagh-red-no-iqal", label:"ثوب أبيض + شماغ أحمر بدون عقال", text:"white thobe with red-and-white shemagh and no black iqal" }),
    Object.freeze({ value:"traditional-thobe-gray-ghutra-white", label:"ثوب رمادي فاتح + غترة بيضاء + عقال أسود", text:"light gray thobe with white ghutra and black iqal" }),
    Object.freeze({ value:"traditional-thobe-brown-ghutra-white", label:"ثوب بني فاتح + غترة بيضاء + عقال أسود", text:"light brown thobe with white ghutra and black iqal" }),
    Object.freeze({ value:"traditional-thobe-navy-ghutra-white", label:"ثوب كحلي + غترة بيضاء + عقال أسود", text:"navy thobe with white ghutra and black iqal" }),
    Object.freeze({ value:"traditional-thobe-white-bisht-beige", label:"ثوب أبيض + بشت بيج فاتح + عقال أسود", text:"white thobe with light beige bisht and black iqal" }),
    Object.freeze({ value:"traditional-thobe-beige-bisht-brown", label:"ثوب بيج + بشت بني + غترة بيضاء", text:"beige thobe with brown bisht and white ghutra" }),
    Object.freeze({ value:"traditional-thobe-white-jacket-brown", label:"ثوب أبيض + جاكيت شتوي بني", text:"white thobe with a brown winter jacket" }),
    Object.freeze({ value:"traditional-thobe-gray-jacket-black", label:"ثوب رمادي + جاكيت شتوي أسود + شماغ أحمر", text:"gray thobe with a black winter jacket and red-and-white shemagh" })
  ]),
  outdoor: Object.freeze([
    Object.freeze({ value:"outdoor-leather-brown-tee-white-jeans-blue", label:"جاكيت جلدي بني + تيشيرت أبيض + جينز أزرق", text:"brown leather jacket over a white T-shirt with blue jeans" }),
    Object.freeze({ value:"outdoor-hoodie-black-jogger-gray", label:"هودي أسود + بنطلون jogger رمادي", text:"black hoodie with gray jogger pants" }),
    Object.freeze({ value:"outdoor-bomber-black-tee-white-chino-beige", label:"جاكيت بومبر أسود + تيشيرت أبيض + بنطلون تشينو بيج", text:"black bomber jacket over a white T-shirt with beige chino pants" }),
    Object.freeze({ value:"outdoor-overshirt-olive-tee-white-jeans-black", label:"أوفرشيرت زيتي + تيشيرت أبيض + جينز أسود", text:"olive overshirt over a white T-shirt with black jeans" }),
    Object.freeze({ value:"outdoor-jacket-navy-henley-gray-jeans-blue", label:"جاكيت كحلي + هنلي رمادي + جينز أزرق", text:"navy jacket over a gray Henley shirt with blue jeans" }),
    Object.freeze({ value:"outdoor-cardigan-brown-shirt-white-trouser-gray", label:"كارديغان بني + قميص أبيض + بنطلون قماش رمادي", text:"brown cardigan over a white shirt with gray trousers" }),
    Object.freeze({ value:"outdoor-windbreaker-gray-tee-black-cargo-black", label:"جاكيت خفيف رمادي + تيشيرت أسود + بنطلون كارغو أسود", text:"gray lightweight windbreaker over a black T-shirt with black cargo pants" }),
    Object.freeze({ value:"outdoor-field-olive-white-beige", label:"جاكيت ميداني زيتي + تيشيرت أبيض + بنطلون كارغو بيج", text:"olive field jacket over a white T-shirt with beige cargo pants" }),
    Object.freeze({ value:"outdoor-puffer-black-gray", label:"جاكيت مبطن أسود + كنزة رمادية + جينز أزرق داكن", text:"black puffer jacket over a gray sweater with dark blue jeans" }),
    Object.freeze({ value:"outdoor-denim-blue-black", label:"جاكيت دنيم أزرق + تيشيرت أسود + بنطلون جينز أسود", text:"blue denim jacket over a black T-shirt with black jeans" }),
    Object.freeze({ value:"outdoor-coat-brown-black-gray", label:"معطف بني متوسط الطول + ياقة عالية سوداء + بنطلون رمادي", text:"mid-length brown coat over a black turtleneck with gray trousers" }),
    Object.freeze({ value:"outdoor-rain-navy-gray", label:"جاكيت مطر كحلي + تيشيرت رمادي + بنطلون أسود", text:"navy rain jacket over a gray T-shirt with black pants" }),
    Object.freeze({ value:"outdoor-travel-black-white-gray", label:"جاكيت سفر أسود خفيف + تيشيرت أبيض + بنطلون jogger رمادي", text:"lightweight black travel jacket over a white T-shirt with gray jogger pants" }),
    Object.freeze({ value:"outdoor-work-brown-blue-black", label:"جاكيت عمل بني + قميص أزرق + بنطلون كارغو أسود", text:"brown work jacket over a blue shirt with black cargo pants" }),
    Object.freeze({ value:"outdoor-summer-white-beige", label:"قميص كتان أبيض قصير الأكمام + شورت بيج", text:"white short-sleeve linen shirt with beige shorts" })
  ])
});

function cloneOption(option) {
  return { value:String(option?.value ?? ""), label:String(option?.label ?? option?.value ?? ""), text:String(option?.text ?? "") };
}

const FULL_BY_VALUE = new Map(Object.values(FULL_OUTFITS).flat().map((option) => [option.value, option]));
const TRADITIONAL_BY_VALUE = new Map(TRADITIONAL.map((option) => [option.value, option]));
let SCENE_CLOTHING = Object.freeze([]);

export function registerSceneClothing(scenes = {}) {
  try {
    SCENE_CLOTHING = Object.freeze(Object.values(scenes || {}).flatMap((scene) => Array.isArray(scene?.clothing) ? scene.clothing.map(cloneOption) : []));
  } catch {
    SCENE_CLOTHING = Object.freeze([]);
  }
  return SCENE_CLOTHING.length;
}

export function resolveClothingText(value, raw = {}) {
  try {
    const key = typeof value === "string" ? value.trim() : String(value ?? "").trim();
    if (key === "custom") return typeof raw?.customClothing === "string" ? raw.customClothing : "";
    if (!key) return "";
    const found = FULL_BY_VALUE.get(key)
      || TRADITIONAL_BY_VALUE.get(key)
      || SCENE_CLOTHING.find((item) => item?.value === key);
    return typeof found?.text === "string" ? found.text : "";
  } catch {
    return "";
  }
}

export function getClothingCatalog() {
  return CLOTHING_SECTION_ORDER.map((id) => ({
    id,
    label:CLOTHING_SECTION_LABELS[id],
    options:[
      ...(id === "traditional" ? TRADITIONAL : []),
      ...(FULL_OUTFITS[id] || [])
    ].map(cloneOption)
  }));
}

export function getClothingOptions() {
  return [
    ...CLOTHING_TOP_OPTIONS.map(cloneOption),
    ...getClothingCatalog().flatMap((section) => section.options)
  ];
}

export const CLOTHING_CATALOG = Object.freeze(getClothingCatalog().map((section) => Object.freeze({ ...section, options:Object.freeze(section.options.map((option) => Object.freeze(option))) })));
export const CLOTHING_OPTIONS = Object.freeze(getClothingOptions().map((option) => Object.freeze(option)));
