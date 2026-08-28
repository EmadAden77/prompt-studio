export const COMPANIONS = Object.freeze({
  W40: { type:"woman", age:40, name_ar:"امرأة ٤٠",
    face:"oval face, warm olive skin, subtle nasolabial + faint forehead lines, dark brown almond eyes, thin natural brows, small mole near left chin",
    cover:"dark charcoal shayla loosely wrapped; black abaya with subtle sleeve embroidery",
    color:"charcoal/black" },
  W42: { type:"woman", age:42, name_ar:"امرأة ٤٢",
    face:"rounder face, lighter wheat skin, deeper laugh lines, hooded eyelids, fuller lips, thin rectangular glasses",
    cover:"navy shayla; black abaya with navy trim",
    color:"navy/black" },
  C2:  { type:"child", age:2, name_ar:"طفل رضيع ~٢",
    face:"round baby cheeks, large forehead, short neck, sparse light brows, big dark eyes",
    cover:"mustard-yellow soft cotton toddler two-piece", color:"mustard" },
  C5:  { type:"child", age:5, name_ar:"بنت ~٥",
    face:"round child face, rosy cheeks, small nose, hair with two side clips",
    cover:"dusty-pink dress with white cardigan", color:"pink/white" },
  C7:  { type:"child", age:7, name_ar:"ولد ~٧",
    face:"lean child face, MISSING upper front tooth (gap when smiling), short dark hair",
    cover:"red t-shirt with gray shorts", color:"red/gray" },
  C10: { type:"child", age:10, name_ar:"ولد ~١٠",
    face:"lanky pre-teen, longer face, early subtle skin texture, short fade haircut",
    cover:"heather-gray hoodie", color:"gray" }
});

export const COMPANION_SETS = Object.freeze([
  { id:"none",        name_ar:"بدون مرافقين",        members:[] },
  { id:"w40",         name_ar:"امرأة ٤٠",            members:["W40"] },
  { id:"w42",         name_ar:"امرأة ٤٢",            members:["W42"] },
  { id:"both_women",  name_ar:"المرأتان ٤٠+٤٢",      members:["W40","W42"] },
  { id:"toddler",     name_ar:"رضيع ~٢",             members:["C2"] },
  { id:"girl5",       name_ar:"بنت ~٥",              members:["C5"] },
  { id:"boy7",        name_ar:"ولد ~٧",              members:["C7"] },
  { id:"boy10",       name_ar:"ولد ~١٠",             members:["C10"] },
  { id:"two_kids",    name_ar:"طفلان ٥+٧",           members:["C5","C7"] },
  { id:"mom_toddler", name_ar:"امرأة ٤٠ + رضيع",     members:["W40","C2"] },
  { id:"family_small",name_ar:"عائلة ٤٠+٤٢+٥",       members:["W40","W42","C5"] },
  { id:"family_full", name_ar:"عائلة كاملة ٤ أفراد",  members:["W40","W42","C2","C7"] }
]);

export const SET_ARRANGEMENT = Object.freeze({
  both_women:"W40 and W42 lean in from either side, heads tilted slightly toward the subject, shoulders overlapping.",
  two_kids:"C5 squeezed at one side, C7 in front-center lower, heads at two depths.",
  mom_toddler:"W40 holds C2 on her lap at one side; child's head rests against her chest; her arm wraps the child with fabric compression.",
  family_small:"W40 holds C5 at one side, W42 leans from the other; three head heights.",
  family_full:"W40 holds C2 on her lap, W42 leans from the other side, C7 squeezes in front-center; heads cluster at three depths with overlap."
});

const COLOR_WORDS = ["mustard", "yellow", "red", "gray", "grey", "pink", "navy", "black", "charcoal", "white", "olive"];

function mainClothingText(mainClothing = {}) {
  return [mainClothing.color, mainClothing.name_en, mainClothing.name_ar, mainClothing.pieces]
    .filter(Boolean).join(" ").toLowerCase();
}

function resolveAttire(person, usedText) {
  const colors = person.color.toLowerCase().split("/");
  const collides = colors.some((color) => usedText.includes(color));
  if (!collides) return { ...person };
  const cover = person.cover.replace(/mustard(?:-yellow)?|yellow|red|gray|grey|pink|navy|charcoal|black/gi, "olive");
  return { ...person, cover, color:"olive" };
}

export function buildCompanionsSection(set, mainClothing, groupSelfieRealismLock = "") {
  if (!set?.members?.length) return "";
  let used = mainClothingText(mainClothing);
  const people = set.members.map((id) => {
    const source = COMPANIONS[id];
    if (!source) return null;
    const resolved = resolveAttire(source, used);
    used += ` ${resolved.color.toLowerCase()}`;
    return resolved;
  }).filter(Boolean);

  const specs = people.map((p) =>
    `${p.name_ar} (${p.age}): FACE ${p.face}. ATTIRE ${p.cover}.`).join("\n");

  return `COMPANIONS (fixed distinct personas — NO resemblance to IMAGE A or each other):\n${specs}\nARRANGEMENT: ${SET_ARRANGEMENT[set.id] || "cluster naturally toward the phone with overlap."}\nMODESTY: every companion is fully clothed; family framing remains modest, respectful and non-sexual; children remain fully clothed in age-appropriate outfits.\n${groupSelfieRealismLock}`;
}

if (typeof window !== "undefined") Object.assign(window, { COMPANIONS, COMPANION_SETS, SET_ARRANGEMENT, buildCompanionsSection });
