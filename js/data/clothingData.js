export const CLOTHING_OPTIONS = Object.freeze([
  {
    id: "casual_tshirt",
    name_ar: "تيشيرت كاجوال",
    prompt: "A plain, matte cotton casual T-shirt with a natural relaxed fit and no visible logo or text."
  },
  {
    id: "button_shirt",
    name_ar: "قميص",
    prompt: "A plain long-sleeve button shirt in matte woven cotton, worn naturally with no branding or decorative insignia."
  },
  {
    id: "hoodie",
    name_ar: "هودي",
    prompt: "A simple mid-weight cotton hoodie with no logo, realistic ribbing, and a relaxed indoor fit."
  },
  {
    id: "tank_top",
    name_ar: "فانلة بدون أكمام",
    prompt: "A plain cotton sleeveless undershirt with ordinary home-wear fit and no branding."
  },
  {
    id: "pajamas",
    name_ar: "بيجاما",
    prompt: "A modest two-piece cotton pajama set with a subtle non-repeating weave and relaxed sleepwear fit."
  },
  {
    id: "white_thobe",
    name_ar: "ثوب أبيض",
    prompt: "A clean white Saudi-style thobe made of matte mid-weight fabric, without logos, with gravity-consistent drape and creasing."
  }
]);

export const CLOTHING_BY_ID = Object.freeze(Object.fromEntries(CLOTHING_OPTIONS.map((item) => [item.id, item])));
