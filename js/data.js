import { SCENES, LIGHTING_OPTIONS } from "./data-phase20.js";

export * from "./data-phase20.js";

export const CAR_EXTERIOR_SPEC = "2017 Range Rover Sport Autobiography Dynamic L494 in Fuji White, gloss black grille and side-vent surrounds, 22-inch dark alloy wheels, quad rectangular exhaust tips, LED headlights with DRL signature, panoramic glass roof, lightly tinted TRANSPARENT glass, never opaque black, showing natural reflections and faint glimpses of the Ivory interior, small Autobiography Dynamic badging and Saudi plate present, both soft-focus and never legible.";

export const CAR_EXTERIOR_LOCATIONS = Object.freeze([
  { value: "villa", label: "أمام فيلا", text: "parked on a driveway before a Saudi villa with beige stone cladding, high wall, metal gate, and a palm tree" },
  { value: "grocery", label: "أمام بقالة", text: "at the curb before a small grocery with shelves and a glowing beverage cooler behind glass" },
  { value: "parking", label: "مواقف سيارات", text: "in a marked outdoor lot with white lines, concrete wheel stops, and a few other parked cars" },
  { value: "street", label: "رصيف شارع", text: "parallel parked along a yellow-and-black curb on weathered asphalt" },
  { value: "reststop", label: "استراحة بر", text: "on a sandy shoulder with sparse shrubs and an open horizon" },
  { value: "mall", label: "مواقف مول", text: "in outdoor mall parking with shaded walkways" }
]);

export const CAR_EXTERIOR_POSES = Object.freeze([
  { value: "door-lean", label: "ميل على الباب", text: "leaning naturally against the closed driver door" },
  { value: "door-open", label: "باب مفتوح", text: "standing beside the open driver door" },
  { value: "front-grille", label: "أمام الشبك", text: "standing beside the front grille" },
  { value: "rear-tailgate", label: "خلف الصندوق", text: "standing near the rear tailgate" },
  { value: "front-fender", label: "يد على الرفرف", text: "standing at the front fender with one hand resting on the body" },
  { value: "rear-quarter", label: "ثلاثة أرباع خلفي", text: "standing at the rear three-quarter corner" },
  { value: "key-fob", label: "مفتاح باليد", text: "standing beside the parked vehicle with the key fob relaxed in one hand" },
  { value: "hood-sit", label: "جلوس على الكبوت", text: "sitting lightly on the front edge of the hood with natural body weight" }
]);

Object.assign(SCENES, {
  carExterior: {
    label: "سيلفي بجانب السيارة",
    environment: "a parked-car exterior selfie setting with realistic ground contact, generic Saudi surroundings, and natural environmental reflections",
    clothing: [
      { value: "white-thobe", label: "ثوب أبيض", text: "clean white cotton thobe with visible weave and natural standing folds" },
      { value: "black-tee", label: "تيشيرت أسود", text: "plain black cotton T-shirt with natural shoulder drape and soft daily creasing" },
      { value: "white-tee", label: "تيشيرت أبيض", text: "plain white cotton T-shirt with visible knit and natural torso folds" },
      { value: "polo", label: "بولو", text: "cotton piqué polo with subtle texture and relaxed waist creasing" },
      { value: "overshirt", label: "أوفرشيرت", text: "light cotton overshirt with visible weave and natural sleeve creasing" },
      { value: "hoodie", label: "هودي", text: "midweight cotton hoodie with softened cuffs and natural pocket folds" }
    ]
  }
});

export const YOUTHFUL_RED_SHEMAGH_IQAL = Object.freeze({
  value: "thobe-redshemagh-iqal",
  label: "ثوب + شماغ أحمر + عقال",
  text: "crisp white thobe with a red-and-white checkered shemagh and black iqal, youthful style"
});

for (const sceneId of ["street", "rangeRover", "majlis", "carExterior", "rooftop", "grocery", "gasStation"]) {
  const clothing = SCENES[sceneId]?.clothing;
  if (Array.isArray(clothing) && !clothing.some((option) => option.value === YOUTHFUL_RED_SHEMAGH_IQAL.value)) {
    clothing.push({ ...YOUTHFUL_RED_SHEMAGH_IQAL });
  }
}

Object.assign(LIGHTING_OPTIONS, {
  carExterior: {
    day: [
      { value: "harsh-noon", label: "شمس ظهر قوية", text: "harsh noon sunlight creates crisp reflections across Fuji White paint, dark wheels, and glass with short grounded shadows" },
      { value: "golden-low", label: "شمس ذهبية منخفضة", text: "low golden sunlight stretches warm reflections along the body panels and creates long soft-edged ground shadows" },
      { value: "overcast-soft", label: "غائم ناعم", text: "soft overcast daylight reveals paint curvature, wheel detail, glass reflections, and fine dust with restrained contrast" }
    ],
    night: [
      { value: "streetlight-reflection", label: "انعكاس إنارة شارع", text: "streetlights create elongated reflections along the hood, roof, and side panels with natural dark gaps between light pools" },
      { value: "villa-porch", label: "إضاءة مدخل الفيلا", text: "warm villa porch light mixes with cooler ambient night light across the parked vehicle and driveway" },
      { value: "interior-spill", label: "تسرب إضاءة المقصورة", text: "soft interior light spills from the open driver door into the night while exterior surfaces retain surrounding reflections" },
      { value: "drl-on", label: "إضاءة DRL", text: "the DRL signature glows cleanly while surrounding practical lights reflect across the Fuji White paint and tinted glass" }
    ]
  }
});
