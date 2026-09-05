import { SCENES } from "./data.js";

export const UNIFIED_CLOTHING_SECTION_ORDER = Object.freeze([
  "home",
  "casual",
  "formal",
  "sport",
  "traditional",
  "outdoor"
]);

const SECTION_LABELS = Object.freeze({
  home: "منزل",
  casual: "كاجوال",
  formal: "رسمي",
  sport: "رياضي",
  traditional: "تقليدي",
  outdoor: "خارجي"
});

export const PHASE32_NEUTRAL_CUSTOM_OUTFIT = "تيشيرت أبيض بسيط + بنطلون قماش رمادي";

const OUTFIT_GROUPS = Object.freeze({
  home: Object.freeze([
    { value:"custom", label:"✍️ مخصص — اكتب ملابسك", text:"" },
    { value:"home-flannel-red-black", label:"بيجاما فلانيل شتوية حمراء-سوداء + بنطلون بيجاما مطابق", text:"بيجاما فلانيل شتوية حمراء-سوداء + بنطلون بيجاما مطابق" },
    { value:"home-sleep-white-gray", label:"قميص نوم طويل بسيط أبيض + شورت قطني رمادي", text:"قميص نوم طويل بسيط أبيض + شورت قطني رمادي" },
    { value:"home-robe-brown-white", label:"روب حمام قطني بني + تيشيرت أبيض + بنطلون قطني رمادي", text:"روب حمام قطني بني + تيشيرت أبيض + بنطلون قطني رمادي" },
    { value:"home-henley-gray-navy", label:"هنلي منزلي رمادي قصير الأكمام + بنطلون قطني كحلي", text:"هنلي منزلي رمادي قصير الأكمام + بنطلون قطني كحلي" },
    { value:"home-tee-white-navy", label:"تيشيرت منزلي أبيض + بنطلون بيجاما كحلي", text:"تيشيرت منزلي أبيض + بنطلون بيجاما كحلي" },
    { value:"home-sweatshirt-gray-black", label:"سويتشيرت منزلي رمادي + بنطلون قطني أسود", text:"سويتشيرت منزلي رمادي + بنطلون قطني أسود" },
    { value:"home-polo-navy-beige", label:"بولو منزلي كحلي + شورت قطني بيج", text:"بولو منزلي كحلي + شورت قطني بيج" },
    { value:"home-tee-black-gray-shorts", label:"تيشيرت منزلي أسود خفيف + شورت قطني رمادي", text:"تيشيرت منزلي أسود خفيف + شورت قطني رمادي" },
    { value:"home-tank-white-navy-shorts", label:"فانيلة داخلية بيضاء + شورت منزلي كحلي", text:"فانيلة داخلية بيضاء + شورت منزلي كحلي" },
    { value:"home-longtee-gray-black", label:"تيشيرت منزلي رمادي طويل الأكمام + بنطلون بيجاما أسود", text:"تيشيرت منزلي رمادي طويل الأكمام + بنطلون بيجاما أسود" },
    { value:"home-hoodie-navy-gray", label:"هودي منزلي كحلي + بنطلون قطني رمادي", text:"هودي منزلي كحلي + بنطلون قطني رمادي" },
    { value:"home-cardigan-brown-white", label:"كارديغان منزلي بني + تيشيرت أبيض + بنطلون قطني كحلي", text:"كارديغان منزلي بني + تيشيرت أبيض + بنطلون قطني كحلي" },
    { value:"home-thermal-black-gray", label:"بلوزة حرارية سوداء + بنطلون منزلي رمادي", text:"بلوزة حرارية سوداء + بنطلون منزلي رمادي" },
    { value:"home-pajama-blue-gray", label:"قميص بيجاما أزرق فاتح + بنطلون بيجاما رمادي", text:"قميص بيجاما أزرق فاتح + بنطلون بيجاما رمادي" },
    { value:"home-linen-white-beige", label:"قميص منزلي كتان أبيض + شورت قطني بيج", text:"قميص منزلي كتان أبيض + شورت قطني بيج" }
  ]),
  casual: Object.freeze([
    { value:"casual-tee-black-jeans-blue", label:"تيشيرت أسود ثقيل + جينز أزرق داكن", text:"تيشيرت أسود ثقيل + جينز أزرق داكن" },
    { value:"casual-tee-white-chino-beige", label:"تيشيرت أبيض ثقيل + بنطلون تشينو بيج", text:"تيشيرت أبيض ثقيل + بنطلون تشينو بيج" },
    { value:"casual-henley-gray-jeans-black", label:"هنلي رمادي طويل الأكمام + جينز أسود", text:"هنلي رمادي طويل الأكمام + جينز أسود" },
    { value:"casual-oxford-blue-trouser-gray", label:"قميص أكسفورد كاجوال أزرق فاتح + بنطلون قماش رمادي", text:"قميص أكسفورد كاجوال أزرق فاتح + بنطلون قماش رمادي" },
    { value:"casual-linen-white-shorts-beige", label:"قميص كتان كاجوال أبيض + شورت بيج", text:"قميص كتان كاجوال أبيض + شورت بيج" },
    { value:"casual-polo-navy-chino-gray", label:"بولو كحلي + بنطلون تشينو رمادي", text:"بولو كحلي + بنطلون تشينو رمادي" },
    { value:"casual-shirt-brown-jeans-blue", label:"قميص كاجوال بني + جينز أزرق", text:"قميص كاجوال بني + جينز أزرق" },
    { value:"casual-tee-red-cargo-black", label:"تيشيرت أحمر داكن + بنطلون كارغو أسود", text:"تيشيرت أحمر داكن + بنطلون كارغو أسود" },
    { value:"casual-denim-blue-tee-white-black", label:"جاكيت دنيم أزرق + تيشيرت أبيض + جينز أسود", text:"جاكيت دنيم أزرق + تيشيرت أبيض + جينز أسود" },
    { value:"casual-overshirt-olive-tee-white-beige", label:"أوفرشيرت زيتي + تيشيرت أبيض + بنطلون تشينو بيج", text:"أوفرشيرت زيتي + تيشيرت أبيض + بنطلون تشينو بيج" },
    { value:"casual-polo-black-jeans-gray", label:"بولو أسود + جينز رمادي داكن", text:"بولو أسود + جينز رمادي داكن" },
    { value:"casual-sweater-navy-chino-beige", label:"كنزة كحلية خفيفة + بنطلون تشينو بيج", text:"كنزة كحلية خفيفة + بنطلون تشينو بيج" },
    { value:"casual-shirt-white-jeans-blue", label:"قميص كاجوال أبيض بأكمام مطوية + جينز أزرق داكن", text:"قميص كاجوال أبيض بأكمام مطوية + جينز أزرق داكن" },
    { value:"casual-henley-black-cargo-gray", label:"هنلي أسود قصير الأكمام + بنطلون كارغو رمادي", text:"هنلي أسود قصير الأكمام + بنطلون كارغو رمادي" },
    { value:"casual-knit-brown-trouser-black", label:"بولو محبوك بني + بنطلون قماش أسود", text:"بولو محبوك بني + بنطلون قماش أسود" }
  ]),
  formal: Object.freeze([
    { value:"formal-poplin-white-suit-black", label:"قميص بوبلين مرتب أبيض + بنطلون بدلة أسود", text:"قميص بوبلين مرتب أبيض + بنطلون بدلة أسود" },
    { value:"formal-shirt-blue-trouser-gray-belt-brown", label:"قميص رسمي أزرق + بنطلون رمادي داكن + حزام بني", text:"قميص رسمي أزرق + بنطلون رمادي داكن + حزام بني" },
    { value:"formal-shirt-white-trouser-navy", label:"قميص رسمي أبيض + بنطلون بدلة كحلي", text:"قميص رسمي أبيض + بنطلون بدلة كحلي" },
    { value:"formal-shirt-gray-trouser-black", label:"قميص رسمي رمادي فاتح + بنطلون بدلة أسود", text:"قميص رسمي رمادي فاتح + بنطلون بدلة أسود" },
    { value:"formal-oxford-blue-chino-beige", label:"قميص أكسفورد أزرق فاتح + بنطلون تشينو بيج", text:"قميص أكسفورد أزرق فاتح + بنطلون تشينو بيج" },
    { value:"formal-shirt-black-trouser-gray", label:"قميص رسمي أسود + بنطلون قماش رمادي", text:"قميص رسمي أسود + بنطلون قماش رمادي" },
    { value:"formal-shirt-white-trouser-brown", label:"قميص رسمي أبيض + بنطلون قماش بني", text:"قميص رسمي أبيض + بنطلون قماش بني" },
    { value:"formal-suit-navy-white", label:"جاكيت بدلة كحلي + قميص أبيض + بنطلون بدلة كحلي", text:"جاكيت بدلة كحلي + قميص أبيض + بنطلون بدلة كحلي" },
    { value:"formal-suit-gray-blue", label:"جاكيت بدلة رمادي داكن + قميص أزرق فاتح + بنطلون بدلة رمادي", text:"جاكيت بدلة رمادي داكن + قميص أزرق فاتح + بنطلون بدلة رمادي" },
    { value:"formal-blazer-brown-white-black", label:"بليزر بني + قميص أبيض + بنطلون رسمي أسود", text:"بليزر بني + قميص أبيض + بنطلون رسمي أسود" },
    { value:"formal-blazer-navy-white-beige", label:"بليزر كحلي + قميص أبيض + بنطلون تشينو بيج", text:"بليزر كحلي + قميص أبيض + بنطلون تشينو بيج" },
    { value:"formal-vest-gray-white-black", label:"فيست بدلة رمادي + قميص أبيض + بنطلون أسود", text:"فيست بدلة رمادي + قميص أبيض + بنطلون أسود" },
    { value:"formal-turtleneck-black-gray", label:"ياقة عالية سوداء + بنطلون رسمي رمادي داكن", text:"ياقة عالية سوداء + بنطلون رسمي رمادي داكن" },
    { value:"formal-shirt-navy-gray", label:"قميص رسمي كحلي + بنطلون قماش رمادي فاتح", text:"قميص رسمي كحلي + بنطلون قماش رمادي فاتح" },
    { value:"formal-shirt-white-beige", label:"قميص رسمي أبيض + بنطلون قماش بيج + حزام بني", text:"قميص رسمي أبيض + بنطلون قماش بيج + حزام بني" }
  ]),
  sport: Object.freeze([
    { value:"sport-tee-black-shorts-gray", label:"تيشيرت رياضي أسود + شورت تدريب رمادي", text:"تيشيرت رياضي أسود + شورت تدريب رمادي" },
    { value:"sport-tracksuit-olive", label:"طقم تدريب زيتي كامل — هودي زيتي + بنطلون jogger زيتي", text:"هودي رياضي زيتي + بنطلون jogger زيتي" },
    { value:"sport-tee-white-jogger-black", label:"تيشيرت رياضي أبيض + بنطلون jogger أسود", text:"تيشيرت رياضي أبيض + بنطلون jogger أسود" },
    { value:"sport-top-navy-shorts-black", label:"قميص تدريب كحلي + شورت رياضي أسود", text:"قميص تدريب كحلي + شورت رياضي أسود" },
    { value:"sport-hoodie-gray-jogger-black", label:"هودي رياضي رمادي + بنطلون jogger أسود", text:"هودي رياضي رمادي + بنطلون jogger أسود" },
    { value:"sport-tee-red-shorts-black", label:"تيشيرت رياضي أحمر + شورت تدريب أسود", text:"تيشيرت رياضي أحمر + شورت تدريب أسود" },
    { value:"sport-zip-black-jogger-gray", label:"جاكيت تدريب بسحاب أسود + بنطلون jogger رمادي", text:"جاكيت تدريب بسحاب أسود + بنطلون jogger رمادي" },
    { value:"sport-tank-black-shorts-gray", label:"تانك رياضي أسود + شورت تدريب رمادي", text:"تانك رياضي أسود + شورت تدريب رمادي" },
    { value:"sport-compression-black-shorts-red", label:"تيشيرت ضغط رياضي أسود + شورت رياضي أحمر داكن", text:"تيشيرت ضغط رياضي أسود + شورت رياضي أحمر داكن" },
    { value:"sport-longtop-gray-jogger-navy", label:"قميص تدريب رمادي طويل الأكمام + بنطلون jogger كحلي", text:"قميص تدريب رمادي طويل الأكمام + بنطلون jogger كحلي" },
    { value:"sport-polo-white-shorts-navy", label:"بولو رياضي أبيض + شورت رياضي كحلي", text:"بولو رياضي أبيض + شورت رياضي كحلي" },
    { value:"sport-windbreaker-navy-black", label:"جاكيت رياضي خفيف كحلي + بنطلون تدريب أسود", text:"جاكيت رياضي خفيف كحلي + بنطلون تدريب أسود" },
    { value:"sport-sweatshirt-gray-jogger-gray", label:"سويتشيرت رياضي رمادي + بنطلون jogger رمادي داكن", text:"سويتشيرت رياضي رمادي + بنطلون jogger رمادي داكن" },
    { value:"sport-tee-blue-shorts-black", label:"تيشيرت رياضي أزرق + شورت تدريب أسود", text:"تيشيرت رياضي أزرق + شورت تدريب أسود" },
    { value:"sport-hoodie-black-shorts-gray", label:"هودي رياضي أسود خفيف + شورت تدريب رمادي", text:"هودي رياضي أسود خفيف + شورت تدريب رمادي" }
  ]),
  traditional: Object.freeze([
    { value:"traditional-thobe-white-shemagh-red-iqal-black", label:"ثوب أبيض + شماغ أحمر + عقال أسود", text:"ثوب أبيض + شماغ أحمر + عقال أسود" },
    { value:"traditional-thobe-white-bisht-brown", label:"ثوب أبيض + بشت بني", text:"ثوب أبيض + بشت بني" },
    { value:"traditional-thobe-beige-ghutra-white-iqal-black", label:"ثوب بيج + غترة بيضاء + عقال أسود", text:"ثوب بيج + غترة بيضاء + عقال أسود" },
    { value:"traditional-thobe-white-ghutra-white-iqal-black", label:"ثوب أبيض + غترة بيضاء + عقال أسود", text:"ثوب أبيض + غترة بيضاء + عقال أسود" },
    { value:"traditional-thobe-gray-shemagh-red-iqal-black", label:"ثوب رمادي + شماغ أحمر + عقال أسود", text:"ثوب رمادي + شماغ أحمر + عقال أسود" },
    { value:"traditional-thobe-white-bisht-black", label:"ثوب أبيض + بشت أسود", text:"ثوب أبيض + بشت أسود" },
    { value:"traditional-thobe-beige-shemagh-red-iqal-black", label:"ثوب بيج + شماغ أحمر + عقال أسود", text:"ثوب بيج + شماغ أحمر + عقال أسود" },
    { value:"traditional-thobe-white-shemagh-red-no-iqal", label:"ثوب أبيض + شماغ أحمر بدون عقال", text:"ثوب أبيض + شماغ أحمر بدون عقال" },
    { value:"traditional-thobe-gray-ghutra-white", label:"ثوب رمادي فاتح + غترة بيضاء + عقال أسود", text:"ثوب رمادي فاتح + غترة بيضاء + عقال أسود" },
    { value:"traditional-thobe-brown-ghutra-white", label:"ثوب بني فاتح + غترة بيضاء + عقال أسود", text:"ثوب بني فاتح + غترة بيضاء + عقال أسود" },
    { value:"traditional-thobe-navy-ghutra-white", label:"ثوب كحلي + غترة بيضاء + عقال أسود", text:"ثوب كحلي + غترة بيضاء + عقال أسود" },
    { value:"traditional-thobe-white-bisht-beige", label:"ثوب أبيض + بشت بيج فاتح + عقال أسود", text:"ثوب أبيض + بشت بيج فاتح + عقال أسود" },
    { value:"traditional-thobe-beige-bisht-brown", label:"ثوب بيج + بشت بني + غترة بيضاء", text:"ثوب بيج + بشت بني + غترة بيضاء" },
    { value:"traditional-thobe-white-jacket-brown", label:"ثوب أبيض + جاكيت شتوي بني", text:"ثوب أبيض + جاكيت شتوي بني" },
    { value:"traditional-thobe-gray-jacket-black", label:"ثوب رمادي + جاكيت شتوي أسود + شماغ أحمر", text:"ثوب رمادي + جاكيت شتوي أسود + شماغ أحمر" }
  ]),
  outdoor: Object.freeze([
    { value:"outdoor-leather-brown-tee-white-jeans-blue", label:"جاكيت جلدي بني + تيشيرت أبيض + جينز أزرق", text:"جاكيت جلدي بني + تيشيرت أبيض + جينز أزرق" },
    { value:"outdoor-hoodie-black-jogger-gray", label:"هودي أسود + بنطلون jogger رمادي", text:"هودي أسود + بنطلون jogger رمادي" },
    { value:"outdoor-bomber-black-tee-white-chino-beige", label:"جاكيت بومبر أسود + تيشيرت أبيض + بنطلون تشينو بيج", text:"جاكيت بومبر أسود + تيشيرت أبيض + بنطلون تشينو بيج" },
    { value:"outdoor-overshirt-olive-tee-white-jeans-black", label:"أوفرشيرت زيتي + تيشيرت أبيض + جينز أسود", text:"أوفرشيرت زيتي + تيشيرت أبيض + جينز أسود" },
    { value:"outdoor-jacket-navy-henley-gray-jeans-blue", label:"جاكيت كحلي + هنلي رمادي + جينز أزرق", text:"جاكيت كحلي + هنلي رمادي + جينز أزرق" },
    { value:"outdoor-cardigan-brown-shirt-white-trouser-gray", label:"كارديغان بني + قميص أبيض + بنطلون قماش رمادي", text:"كارديغان بني + قميص أبيض + بنطلون قماش رمادي" },
    { value:"outdoor-windbreaker-gray-tee-black-cargo-black", label:"جاكيت خفيف رمادي + تيشيرت أسود + بنطلون كارغو أسود", text:"جاكيت خفيف رمادي + تيشيرت أسود + بنطلون كارغو أسود" },
    { value:"outdoor-field-olive-white-beige", label:"جاكيت ميداني زيتي + تيشيرت أبيض + بنطلون كارغو بيج", text:"جاكيت ميداني زيتي + تيشيرت أبيض + بنطلون كارغو بيج" },
    { value:"outdoor-puffer-black-gray", label:"جاكيت مبطن أسود + كنزة رمادية + جينز أزرق داكن", text:"جاكيت مبطن أسود + كنزة رمادية + جينز أزرق داكن" },
    { value:"outdoor-denim-blue-black", label:"جاكيت دنيم أزرق + تيشيرت أسود + بنطلون جينز أسود", text:"جاكيت دنيم أزرق + تيشيرت أسود + بنطلون جينز أسود" },
    { value:"outdoor-coat-brown-black-gray", label:"معطف بني متوسط الطول + ياقة عالية سوداء + بنطلون رمادي", text:"معطف بني متوسط الطول + ياقة عالية سوداء + بنطلون رمادي" },
    { value:"outdoor-rain-navy-gray", label:"جاكيت مطر كحلي + تيشيرت رمادي + بنطلون أسود", text:"جاكيت مطر كحلي + تيشيرت رمادي + بنطلون أسود" },
    { value:"outdoor-travel-black-white-gray", label:"جاكيت سفر أسود خفيف + تيشيرت أبيض + بنطلون jogger رمادي", text:"جاكيت سفر أسود خفيف + تيشيرت أبيض + بنطلون jogger رمادي" },
    { value:"outdoor-work-brown-blue-black", label:"جاكيت عمل بني + قميص أزرق + بنطلون كارغو أسود", text:"جاكيت عمل بني + قميص أزرق + بنطلون كارغو أسود" },
    { value:"outdoor-summer-white-beige", label:"قميص كتان أبيض قصير الأكمام + شورت بيج", text:"قميص كتان أبيض قصير الأكمام + شورت بيج" }
  ])
});

function cloneOption(option) {
  return {
    value: String(option?.value ?? ""),
    label: String(option?.label ?? option?.value ?? ""),
    text: String(option?.text ?? "")
  };
}

export const PHASE30_ORIGINAL_CLOTHING_VALUES = Object.freeze([]);

export const UNIFIED_CLOTHING_CATALOG = Object.freeze(
  UNIFIED_CLOTHING_SECTION_ORDER.map((id) => Object.freeze({
    id,
    label: SECTION_LABELS[id],
    options: OUTFIT_GROUPS[id]
  }))
);

export const UNIFIED_CLOTHING_OPTIONS = Object.freeze(
  UNIFIED_CLOTHING_CATALOG.flatMap((section) => section.options)
);

const UNIFIED_BY_VALUE = new Map(UNIFIED_CLOTHING_OPTIONS.map((option) => [option.value, option]));

export function getUnifiedClothingCatalog() {
  return UNIFIED_CLOTHING_CATALOG.map((section) => ({
    id: section.id,
    label: section.label,
    options: section.options.map(cloneOption)
  }));
}

export function getUnifiedClothingOptions() {
  return UNIFIED_CLOTHING_OPTIONS.map(cloneOption);
}

export function resolveUnifiedClothingOption(value) {
  const key = String(value ?? "");
  if (!key) return null;
  const unified = UNIFIED_BY_VALUE.get(key);
  return unified ? cloneOption(unified) : null;
}

const flatSceneCatalog = getUnifiedClothingOptions();
for (const scene of Object.values(SCENES)) {
  if (scene && Array.isArray(scene.clothing)) scene.clothing = flatSceneCatalog.map(cloneOption);
}

function ensureCustomClothingField(select) {
  if (typeof document === "undefined" || !select) return null;
  let field = document.querySelector("#custom-clothing-field");
  if (!field) {
    field = document.createElement("label");
    field.className = "field field-span-2";
    field.id = "custom-clothing-field";
    field.htmlFor = "custom-clothing";
    const title = document.createElement("span");
    title.textContent = "وصف الملابس المخصص";
    const input = document.createElement("input");
    input.id = "custom-clothing";
    input.name = "customClothing";
    input.type = "text";
    input.placeholder = "مثال: قميص كتان أبيض + بنطلون كحلي";
    const help = document.createElement("small");
    help.textContent = "يُستخدم النص كما كتبته عند اختيار مخصص.";
    field.append(title, input, help);
    select.closest("label")?.after(field);
  }
  field.hidden = select.value !== "custom";
  return field;
}

function renderUnifiedClothingSelect(preferredValue = "") {
  if (typeof document === "undefined") return;
  const select = document.querySelector("#clothing");
  if (!select) return;
  const current = preferredValue || select.value;
  select.replaceChildren();
  for (const section of UNIFIED_CLOTHING_CATALOG) {
    const group = document.createElement("optgroup");
    group.label = section.label;
    group.dataset.clothingSection = section.id;
    for (const option of section.options) {
      const node = document.createElement("option");
      node.value = option.value;
      node.textContent = option.label;
      group.append(node);
    }
    select.append(group);
  }
  const available = new Set(UNIFIED_CLOTHING_OPTIONS.map((option) => option.value));
  select.value = available.has(current) ? current : UNIFIED_CLOTHING_OPTIONS[0]?.value || "custom";
  const field = select.closest("label");
  if (field) field.hidden = false;
  ensureCustomClothingField(select);
}

function installUiCompatibility() {
  if (typeof document === "undefined") return;
  let remembered = "";
  document.addEventListener("change", (event) => {
    if (event.target?.id === "clothing") {
      remembered = event.target.value;
      ensureCustomClothingField(event.target);
    }
  }, true);
  document.addEventListener("change", (event) => {
    if (["scene", "studio-section"].includes(event.target?.id)) {
      const preserve = remembered || document.querySelector("#clothing")?.value || "";
      setTimeout(() => renderUnifiedClothingSelect(preserve), 0);
    }
  });
  setTimeout(() => renderUnifiedClothingSelect(remembered), 0);
}

installUiCompatibility();