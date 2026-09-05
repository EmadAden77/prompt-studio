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

export const TRADITIONAL = Object.freeze([
  Object.freeze({ value:"thobe-white", label:"ثوب أبيض سادة", text:"crisp white Saudi thobe with natural standing folds" }),
  Object.freeze({ value:"thobe-redshemagh-iqal", label:"ثوب أبيض + شماغ أحمر + عقال", text:"crisp white thobe with a red-and-white checkered shemagh and black iqal, youthful style with one end casually thrown over the shoulder" }),
  Object.freeze({ value:"thobe-whiteghutra-iqal", label:"ثوب أبيض + غترة بيضاء + عقال", text:"white thobe with white ghutra and black iqal, neat drape" }),
  Object.freeze({ value:"thobe-bisht", label:"ثوب أبيض + بشت بني", text:"white thobe with brown bisht draped over the shoulders" })
]);

export const FULL_OUTFITS = Object.freeze({
  home: Object.freeze([
    Object.freeze({ value:"home-flannel-red-black", label:"بيجاما فلانيل شتوية حمراء-سوداء + بنطلون بيجاما مطابق", text:"بيجاما فلانيل شتوية حمراء-سوداء + بنطلون بيجاما مطابق" }),
    Object.freeze({ value:"home-sleep-white-gray", label:"قميص نوم طويل بسيط أبيض + شورت قطني رمادي", text:"قميص نوم طويل بسيط أبيض + شورت قطني رمادي" }),
    Object.freeze({ value:"home-robe-brown-white", label:"روب حمام قطني بني + تيشيرت أبيض + بنطلون قطني رمادي", text:"روب حمام قطني بني + تيشيرت أبيض + بنطلون قطني رمادي" }),
    Object.freeze({ value:"home-henley-gray-navy", label:"هنلي منزلي رمادي قصير الأكمام + بنطلون قطني كحلي", text:"هنلي منزلي رمادي قصير الأكمام + بنطلون قطني كحلي" }),
    Object.freeze({ value:"home-tee-white-navy", label:"تيشيرت منزلي أبيض + بنطلون بيجاما كحلي", text:"تيشيرت منزلي أبيض + بنطلون بيجاما كحلي" }),
    Object.freeze({ value:"home-sweatshirt-gray-black", label:"سويتشيرت منزلي رمادي + بنطلون قطني أسود", text:"سويتشيرت منزلي رمادي + بنطلون قطني أسود" }),
    Object.freeze({ value:"home-polo-navy-beige", label:"بولو منزلي كحلي + شورت قطني بيج", text:"بولو منزلي كحلي + شورت قطني بيج" }),
    Object.freeze({ value:"home-tee-black-gray-shorts", label:"تيشيرت منزلي أسود خفيف + شورت قطني رمادي", text:"تيشيرت منزلي أسود خفيف + شورت قطني رمادي" }),
    Object.freeze({ value:"home-tank-white-navy-shorts", label:"فانيلة داخلية بيضاء + شورت منزلي كحلي", text:"فانيلة داخلية بيضاء + شورت منزلي كحلي" }),
    Object.freeze({ value:"home-longtee-gray-black", label:"تيشيرت منزلي رمادي طويل الأكمام + بنطلون بيجاما أسود", text:"تيشيرت منزلي رمادي طويل الأكمام + بنطلون بيجاما أسود" }),
    Object.freeze({ value:"home-hoodie-navy-gray", label:"هودي منزلي كحلي + بنطلون قطني رمادي", text:"هودي منزلي كحلي + بنطلون قطني رمادي" }),
    Object.freeze({ value:"home-cardigan-brown-white", label:"كارديغان منزلي بني + تيشيرت أبيض + بنطلون قطني كحلي", text:"كارديغان منزلي بني + تيشيرت أبيض + بنطلون قطني كحلي" }),
    Object.freeze({ value:"home-thermal-black-gray", label:"بلوزة حرارية سوداء + بنطلون منزلي رمادي", text:"بلوزة حرارية سوداء + بنطلون منزلي رمادي" }),
    Object.freeze({ value:"home-pajama-blue-gray", label:"قميص بيجاما أزرق فاتح + بنطلون بيجاما رمادي", text:"قميص بيجاما أزرق فاتح + بنطلون بيجاما رمادي" }),
    Object.freeze({ value:"home-linen-white-beige", label:"قميص منزلي كتان أبيض + شورت قطني بيج", text:"قميص منزلي كتان أبيض + شورت قطني بيج" })
  ]),
  casual: Object.freeze([
    Object.freeze({ value:"casual-tee-black-jeans-blue", label:"تيشيرت أسود ثقيل + جينز أزرق داكن", text:"تيشيرت أسود ثقيل + جينز أزرق داكن" }),
    Object.freeze({ value:"casual-tee-white-chino-beige", label:"تيشيرت أبيض ثقيل + بنطلون تشينو بيج", text:"تيشيرت أبيض ثقيل + بنطلون تشينو بيج" }),
    Object.freeze({ value:"casual-henley-gray-jeans-black", label:"هنلي رمادي طويل الأكمام + جينز أسود", text:"هنلي رمادي طويل الأكمام + جينز أسود" }),
    Object.freeze({ value:"casual-oxford-blue-trouser-gray", label:"قميص أكسفورد كاجوال أزرق فاتح + بنطلون قماش رمادي", text:"قميص أكسفورد كاجوال أزرق فاتح + بنطلون قماش رمادي" }),
    Object.freeze({ value:"casual-linen-white-shorts-beige", label:"قميص كتان كاجوال أبيض + شورت بيج", text:"قميص كتان كاجوال أبيض + شورت بيج" }),
    Object.freeze({ value:"casual-polo-navy-chino-gray", label:"بولو كحلي + بنطلون تشينو رمادي", text:"بولو كحلي + بنطلون تشينو رمادي" }),
    Object.freeze({ value:"casual-shirt-brown-jeans-blue", label:"قميص كاجوال بني + جينز أزرق", text:"قميص كاجوال بني + جينز أزرق" }),
    Object.freeze({ value:"casual-tee-red-cargo-black", label:"تيشيرت أحمر داكن + بنطلون كارغو أسود", text:"تيشيرت أحمر داكن + بنطلون كارغو أسود" }),
    Object.freeze({ value:"casual-denim-blue-tee-white-black", label:"جاكيت دنيم أزرق + تيشيرت أبيض + جينز أسود", text:"جاكيت دنيم أزرق + تيشيرت أبيض + جينز أسود" }),
    Object.freeze({ value:"casual-overshirt-olive-tee-white-beige", label:"أوفرشيرت زيتي + تيشيرت أبيض + بنطلون تشينو بيج", text:"أوفرشيرت زيتي + تيشيرت أبيض + بنطلون تشينو بيج" }),
    Object.freeze({ value:"casual-polo-black-jeans-gray", label:"بولو أسود + جينز رمادي داكن", text:"بولو أسود + جينز رمادي داكن" }),
    Object.freeze({ value:"casual-sweater-navy-chino-beige", label:"كنزة كحلية خفيفة + بنطلون تشينو بيج", text:"كنزة كحلية خفيفة + بنطلون تشينو بيج" }),
    Object.freeze({ value:"casual-shirt-white-jeans-blue", label:"قميص كاجوال أبيض بأكمام مطوية + جينز أزرق داكن", text:"قميص كاجوال أبيض بأكمام مطوية + جينز أزرق داكن" }),
    Object.freeze({ value:"casual-henley-black-cargo-gray", label:"هنلي أسود قصير الأكمام + بنطلون كارغو رمادي", text:"هنلي أسود قصير الأكمام + بنطلون كارغو رمادي" }),
    Object.freeze({ value:"casual-knit-brown-trouser-black", label:"بولو محبوك بني + بنطلون قماش أسود", text:"بولو محبوك بني + بنطلون قماش أسود" })
  ]),
  formal: Object.freeze([
    Object.freeze({ value:"formal-poplin-white-suit-black", label:"قميص بوبلين مرتب أبيض + بنطلون بدلة أسود", text:"قميص بوبلين مرتب أبيض + بنطلون بدلة أسود" }),
    Object.freeze({ value:"formal-shirt-blue-trouser-gray-belt-brown", label:"قميص رسمي أزرق + بنطلون رمادي داكن + حزام بني", text:"قميص رسمي أزرق + بنطلون رمادي داكن + حزام بني" }),
    Object.freeze({ value:"formal-shirt-white-trouser-navy", label:"قميص رسمي أبيض + بنطلون بدلة كحلي", text:"قميص رسمي أبيض + بنطلون بدلة كحلي" }),
    Object.freeze({ value:"formal-shirt-gray-trouser-black", label:"قميص رسمي رمادي فاتح + بنطلون بدلة أسود", text:"قميص رسمي رمادي فاتح + بنطلون بدلة أسود" }),
    Object.freeze({ value:"formal-oxford-blue-chino-beige", label:"قميص أكسفورد أزرق فاتح + بنطلون تشينو بيج", text:"قميص أكسفورد أزرق فاتح + بنطلون تشينو بيج" }),
    Object.freeze({ value:"formal-shirt-black-trouser-gray", label:"قميص رسمي أسود + بنطلون قماش رمادي", text:"قميص رسمي أسود + بنطلون قماش رمادي" }),
    Object.freeze({ value:"formal-shirt-white-trouser-brown", label:"قميص رسمي أبيض + بنطلون قماش بني", text:"قميص رسمي أبيض + بنطلون قماش بني" }),
    Object.freeze({ value:"formal-suit-navy-white", label:"جاكيت بدلة كحلي + قميص أبيض + بنطلون بدلة كحلي", text:"جاكيت بدلة كحلي + قميص أبيض + بنطلون بدلة كحلي" }),
    Object.freeze({ value:"formal-suit-gray-blue", label:"جاكيت بدلة رمادي داكن + قميص أزرق فاتح + بنطلون بدلة رمادي", text:"جاكيت بدلة رمادي داكن + قميص أزرق فاتح + بنطلون بدلة رمادي" }),
    Object.freeze({ value:"formal-blazer-brown-white-black", label:"بليزر بني + قميص أبيض + بنطلون رسمي أسود", text:"بليزر بني + قميص أبيض + بنطلون رسمي أسود" }),
    Object.freeze({ value:"formal-blazer-navy-white-beige", label:"بليزر كحلي + قميص أبيض + بنطلون تشينو بيج", text:"بليزر كحلي + قميص أبيض + بنطلون تشينو بيج" }),
    Object.freeze({ value:"formal-vest-gray-white-black", label:"فيست بدلة رمادي + قميص أبيض + بنطلون أسود", text:"فيست بدلة رمادي + قميص أبيض + بنطلون أسود" }),
    Object.freeze({ value:"formal-turtleneck-black-gray", label:"ياقة عالية سوداء + بنطلون رسمي رمادي داكن", text:"ياقة عالية سوداء + بنطلون رسمي رمادي داكن" }),
    Object.freeze({ value:"formal-shirt-navy-gray", label:"قميص رسمي كحلي + بنطلون قماش رمادي فاتح", text:"قميص رسمي كحلي + بنطلون قماش رمادي فاتح" }),
    Object.freeze({ value:"formal-shirt-white-beige", label:"قميص رسمي أبيض + بنطلون قماش بيج + حزام بني", text:"قميص رسمي أبيض + بنطلون قماش بيج + حزام بني" })
  ]),
  sport: Object.freeze([
    Object.freeze({ value:"sport-tee-black-shorts-gray", label:"تيشيرت رياضي أسود + شورت تدريب رمادي", text:"تيشيرت رياضي أسود + شورت تدريب رمادي" }),
    Object.freeze({ value:"sport-tracksuit-olive", label:"طقم تدريب زيتي كامل — هودي زيتي + بنطلون jogger زيتي", text:"هودي رياضي زيتي + بنطلون jogger زيتي" }),
    Object.freeze({ value:"sport-tee-white-jogger-black", label:"تيشيرت رياضي أبيض + بنطلون jogger أسود", text:"تيشيرت رياضي أبيض + بنطلون jogger أسود" }),
    Object.freeze({ value:"sport-top-navy-shorts-black", label:"قميص تدريب كحلي + شورت رياضي أسود", text:"قميص تدريب كحلي + شورت رياضي أسود" }),
    Object.freeze({ value:"sport-hoodie-gray-jogger-black", label:"هودي رياضي رمادي + بنطلون jogger أسود", text:"هودي رياضي رمادي + بنطلون jogger أسود" }),
    Object.freeze({ value:"sport-tee-red-shorts-black", label:"تيشيرت رياضي أحمر + شورت تدريب أسود", text:"تيشيرت رياضي أحمر + شورت تدريب أسود" }),
    Object.freeze({ value:"sport-zip-black-jogger-gray", label:"جاكيت تدريب بسحاب أسود + بنطلون jogger رمادي", text:"جاكيت تدريب بسحاب أسود + بنطلون jogger رمادي" }),
    Object.freeze({ value:"sport-tank-black-shorts-gray", label:"تانك رياضي أسود + شورت تدريب رمادي", text:"تانك رياضي أسود + شورت تدريب رمادي" }),
    Object.freeze({ value:"sport-compression-black-shorts-red", label:"تيشيرت ضغط رياضي أسود + شورت رياضي أحمر داكن", text:"تيشيرت ضغط رياضي أسود + شورت رياضي أحمر داكن" }),
    Object.freeze({ value:"sport-longtop-gray-jogger-navy", label:"قميص تدريب رمادي طويل الأكمام + بنطلون jogger كحلي", text:"قميص تدريب رمادي طويل الأكمام + بنطلون jogger كحلي" }),
    Object.freeze({ value:"sport-polo-white-shorts-navy", label:"بولو رياضي أبيض + شورت رياضي كحلي", text:"بولو رياضي أبيض + شورت رياضي كحلي" }),
    Object.freeze({ value:"sport-windbreaker-navy-black", label:"جاكيت رياضي خفيف كحلي + بنطلون تدريب أسود", text:"جاكيت رياضي خفيف كحلي + بنطلون تدريب أسود" }),
    Object.freeze({ value:"sport-sweatshirt-gray-jogger-gray", label:"سويتشيرت رياضي رمادي + بنطلون jogger رمادي داكن", text:"سويتشيرت رياضي رمادي + بنطلون jogger رمادي داكن" }),
    Object.freeze({ value:"sport-tee-blue-shorts-black", label:"تيشيرت رياضي أزرق + شورت تدريب أسود", text:"تيشيرت رياضي أزرق + شورت تدريب أسود" }),
    Object.freeze({ value:"sport-hoodie-black-shorts-gray", label:"هودي رياضي أسود خفيف + شورت تدريب رمادي", text:"هودي رياضي أسود خفيف + شورت تدريب رمادي" })
  ]),
  traditional: Object.freeze([
    Object.freeze({ value:"traditional-thobe-white-shemagh-red-iqal-black", label:"ثوب أبيض + شماغ أحمر + عقال أسود", text:"ثوب أبيض + شماغ أحمر + عقال أسود" }),
    Object.freeze({ value:"traditional-thobe-white-bisht-brown", label:"ثوب أبيض + بشت بني", text:"ثوب أبيض + بشت بني" }),
    Object.freeze({ value:"traditional-thobe-beige-ghutra-white-iqal-black", label:"ثوب بيج + غترة بيضاء + عقال أسود", text:"ثوب بيج + غترة بيضاء + عقال أسود" }),
    Object.freeze({ value:"traditional-thobe-white-ghutra-white-iqal-black", label:"ثوب أبيض + غترة بيضاء + عقال أسود", text:"ثوب أبيض + غترة بيضاء + عقال أسود" }),
    Object.freeze({ value:"traditional-thobe-gray-shemagh-red-iqal-black", label:"ثوب رمادي + شماغ أحمر + عقال أسود", text:"ثوب رمادي + شماغ أحمر + عقال أسود" }),
    Object.freeze({ value:"traditional-thobe-white-bisht-black", label:"ثوب أبيض + بشت أسود", text:"ثوب أبيض + بشت أسود" }),
    Object.freeze({ value:"traditional-thobe-beige-shemagh-red-iqal-black", label:"ثوب بيج + شماغ أحمر + عقال أسود", text:"ثوب بيج + شماغ أحمر + عقال أسود" }),
    Object.freeze({ value:"traditional-thobe-white-shemagh-red-no-iqal", label:"ثوب أبيض + شماغ أحمر بدون عقال", text:"ثوب أبيض + شماغ أحمر بدون عقال" }),
    Object.freeze({ value:"traditional-thobe-gray-ghutra-white", label:"ثوب رمادي فاتح + غترة بيضاء + عقال أسود", text:"ثوب رمادي فاتح + غترة بيضاء + عقال أسود" }),
    Object.freeze({ value:"traditional-thobe-brown-ghutra-white", label:"ثوب بني فاتح + غترة بيضاء + عقال أسود", text:"ثوب بني فاتح + غترة بيضاء + عقال أسود" }),
    Object.freeze({ value:"traditional-thobe-navy-ghutra-white", label:"ثوب كحلي + غترة بيضاء + عقال أسود", text:"ثوب كحلي + غترة بيضاء + عقال أسود" }),
    Object.freeze({ value:"traditional-thobe-white-bisht-beige", label:"ثوب أبيض + بشت بيج فاتح + عقال أسود", text:"ثوب أبيض + بشت بيج فاتح + عقال أسود" }),
    Object.freeze({ value:"traditional-thobe-beige-bisht-brown", label:"ثوب بيج + بشت بني + غترة بيضاء", text:"ثوب بيج + بشت بني + غترة بيضاء" }),
    Object.freeze({ value:"traditional-thobe-white-jacket-brown", label:"ثوب أبيض + جاكيت شتوي بني", text:"ثوب أبيض + جاكيت شتوي بني" }),
    Object.freeze({ value:"traditional-thobe-gray-jacket-black", label:"ثوب رمادي + جاكيت شتوي أسود + شماغ أحمر", text:"ثوب رمادي + جاكيت شتوي أسود + شماغ أحمر" })
  ]),
  outdoor: Object.freeze([
    Object.freeze({ value:"outdoor-leather-brown-tee-white-jeans-blue", label:"جاكيت جلدي بني + تيشيرت أبيض + جينز أزرق", text:"جاكيت جلدي بني + تيشيرت أبيض + جينز أزرق" }),
    Object.freeze({ value:"outdoor-hoodie-black-jogger-gray", label:"هودي أسود + بنطلون jogger رمادي", text:"هودي أسود + بنطلون jogger رمادي" }),
    Object.freeze({ value:"outdoor-bomber-black-tee-white-chino-beige", label:"جاكيت بومبر أسود + تيشيرت أبيض + بنطلون تشينو بيج", text:"جاكيت بومبر أسود + تيشيرت أبيض + بنطلون تشينو بيج" }),
    Object.freeze({ value:"outdoor-overshirt-olive-tee-white-jeans-black", label:"أوفرشيرت زيتي + تيشيرت أبيض + جينز أسود", text:"أوفرشيرت زيتي + تيشيرت أبيض + جينز أسود" }),
    Object.freeze({ value:"outdoor-jacket-navy-henley-gray-jeans-blue", label:"جاكيت كحلي + هنلي رمادي + جينز أزرق", text:"جاكيت كحلي + هنلي رمادي + جينز أزرق" }),
    Object.freeze({ value:"outdoor-cardigan-brown-shirt-white-trouser-gray", label:"كارديغان بني + قميص أبيض + بنطلون قماش رمادي", text:"كارديغان بني + قميص أبيض + بنطلون قماش رمادي" }),
    Object.freeze({ value:"outdoor-windbreaker-gray-tee-black-cargo-black", label:"جاكيت خفيف رمادي + تيشيرت أسود + بنطلون كارغو أسود", text:"جاكيت خفيف رمادي + تيشيرت أسود + بنطلون كارغو أسود" }),
    Object.freeze({ value:"outdoor-field-olive-white-beige", label:"جاكيت ميداني زيتي + تيشيرت أبيض + بنطلون كارغو بيج", text:"جاكيت ميداني زيتي + تيشيرت أبيض + بنطلون كارغو بيج" }),
    Object.freeze({ value:"outdoor-puffer-black-gray", label:"جاكيت مبطن أسود + كنزة رمادية + جينز أزرق داكن", text:"جاكيت مبطن أسود + كنزة رمادية + جينز أزرق داكن" }),
    Object.freeze({ value:"outdoor-denim-blue-black", label:"جاكيت دنيم أزرق + تيشيرت أسود + بنطلون جينز أسود", text:"جاكيت دنيم أزرق + تيشيرت أسود + بنطلون جينز أسود" }),
    Object.freeze({ value:"outdoor-coat-brown-black-gray", label:"معطف بني متوسط الطول + ياقة عالية سوداء + بنطلون رمادي", text:"معطف بني متوسط الطول + ياقة عالية سوداء + بنطلون رمادي" }),
    Object.freeze({ value:"outdoor-rain-navy-gray", label:"جاكيت مطر كحلي + تيشيرت رمادي + بنطلون أسود", text:"جاكيت مطر كحلي + تيشيرت رمادي + بنطلون أسود" }),
    Object.freeze({ value:"outdoor-travel-black-white-gray", label:"جاكيت سفر أسود خفيف + تيشيرت أبيض + بنطلون jogger رمادي", text:"جاكيت سفر أسود خفيف + تيشيرت أبيض + بنطلون jogger رمادي" }),
    Object.freeze({ value:"outdoor-work-brown-blue-black", label:"جاكيت عمل بني + قميص أزرق + بنطلون كارغو أسود", text:"جاكيت عمل بني + قميص أزرق + بنطلون كارغو أسود" }),
    Object.freeze({ value:"outdoor-summer-white-beige", label:"قميص كتان أبيض قصير الأكمام + شورت بيج", text:"قميص كتان أبيض قصير الأكمام + شورت بيج" })
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
      ...(id === "home" ? [CUSTOM_CLOTHING_OPTION] : []),
      ...(id === "traditional" ? TRADITIONAL : []),
      ...(FULL_OUTFITS[id] || [])
    ].map(cloneOption)
  }));
}

export function getClothingOptions() {
  return getClothingCatalog().flatMap((section) => section.options);
}

export const CLOTHING_CATALOG = Object.freeze(getClothingCatalog().map((section) => Object.freeze({ ...section, options:Object.freeze(section.options.map((option) => Object.freeze(option))) })));
export const CLOTHING_OPTIONS = Object.freeze(CLOTHING_CATALOG.flatMap((section) => section.options));
