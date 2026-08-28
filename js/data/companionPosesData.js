export const SPONTANEITY_LOCK = `SPONTANEITY LOCK (group selfies must feel unposed):
- AT LEAST ONE per render: a blink or softly-closed eyes; a half-cropped person at the frame edge; micro-motion blur on a moving hand/head; a mid-gesture capture; a mouth half-open mid-speech/laugh.
- NEVER all eyes on lens; NEVER identical smiles; NEVER equal spacing or a straight lineup; heads at varied heights and tilts.
- One companion may be slightly out of focus (depth); one may be distracted.
- Contact is REAL: a held child shows cheek squish and supported weight; leaning heads show hair compression + contact shadow; an arm around a shoulder compresses fabric.
- Stray hair across a face allowed; a shayla edge slightly askew allowed.
- TIMING FEEL: the frame reads as captured a half-second too early or late — not a held pose.
- Children move: micro-blur on a squirming child's hands while faces stay acceptably sharp.`;

export const COMPANION_MICRO = Object.freeze({
  woman: Object.freeze([
    { id:"w_lean",    ar:"إمالة رأس دافئة", en:"warm head tilt", physics:"head tilted 10–15° toward subject; shoulder touching with fabric compression; soft closed-mouth smile; eyes at lens" },
    { id:"w_laugh",   ar:"ضحكة منتصف اللقطة", en:"caught mid-laugh", physics:"eyes softly closed; cheeks raised; mouth open in natural laugh; head back 5°; slight softness on head edge" },
    { id:"w_shayla",  ar:"تعدّل الشيلة لحظة اللقطة", en:"adjusting shayla mid-shot", physics:"one hand raised to shayla edge near temple, fingers mid-pinch; micro-blur on the raised hand; gaze at lens or slightly down" },
    { id:"w_kiss",    ar:"قبلة على خد طفل", en:"kissing child's cheek", physics:"lips pursed against child's cheek; eyes closed; child's cheek squished at contact with skin compression" },
    { id:"w_distract",ar:"تنظر لطفل خارج العدسة", en:"looking at child off-lens", physics:"head turned 30–40° away from lens; gentle smile; turned side receives less key light" }
  ]),
  child: Object.freeze([
    { id:"c_squirm",  ar:"يتلوى نصف ملتف", en:"squirming half-turned", physics:"torso half-turned away; one arm in motion with micro-blur; face three-quarter; not fully posed" },
    { id:"c_toy",     ar:"منشغل بلعبة/جوال", en:"absorbed in toy/phone", physics:"head down toward a held object; eyes on object not lens; object casts small shadow on chest; small glint" },
    { id:"c_gap",     ar:"ضحكة السن المفقود", en:"gap-tooth grin", physics:"big open grin showing missing upper front tooth; cheeks raised; eyes crinkled" },
    { id:"c_sleepy",  ar:"نعسان يفرك عينه", en:"sleepy rubbing eye", physics:"one fist rubbing an eye; heavy eyelids; mouth slightly open; toddler proportions" },
    { id:"c_reach",   ar:"يمد يده نحو الكاميرا", en:"reaching toward camera", physics:"small hand extended toward lens, near-field magnified and slightly soft; fingers spread; face partly occluded by hand" },
    { id:"c_squish",  ar:"محتضن وخده مضغوط", en:"held with squished cheek", physics:"held by adult arm; cheek compressed against adult chest with visible skin squish; weight supported, feet tucked/off-ground" }
  ])
});

export const GROUP_ARRANGEMENTS = Object.freeze([
  { id:"cluster_chaos", ar:"تكدس عفوي بعمق متفاوت", en:"spontaneous cluster", physics:"heads at three depths; one shoulder half-cropped at frame edge; no equal spacing; bodies overlap" },
  { id:"kid_front",     ar:"طفل معصور بالأمام", en:"child squeezed front", physics:"child lower front-center; adult heads above/behind; child partially occludes an adult's chest" },
  { id:"lean_chain",    ar:"سلسلة ميل دومينو", en:"domino lean chain", physics:"each person leans on the next; cumulative tilt toward the phone; contact shadow at each lean" },
  { id:"candid_interrupt", ar:"لقطة مقاطعة", en:"interrupted candid", physics:"one person mid-gesture, others at lens; feels taken 0.5s early" }
]);

export function assignCompanionPoses(set, seedExtra = 0) {
  const seed = set.members.join("").split("")
    .reduce((a,c)=>a+c.charCodeAt(0),0) + seedExtra;
  const out = set.members.map((id, i) => {
    const isChild = id.startsWith("C");
    const pool = COMPANION_MICRO[isChild ? "child" : "woman"];
    return { id, micro: pool[(seed + i * 2) % pool.length] };
  });
  const arrangement = GROUP_ARRANGEMENTS[(seed + seedExtra) % GROUP_ARRANGEMENTS.length];
  return { out, arrangement };
}

function safeFallback(id, set) {
  const hasAdult = set.members.some((member) => member.startsWith("W"));
  if (id === "C2" && hasAdult) return COMPANION_MICRO.child.find((m) => m.id === "c_squish");
  if (id.startsWith("C")) return COMPANION_MICRO.child.find((m) => m.id === "c_squirm");
  return COMPANION_MICRO.woman.find((m) => m.id === "w_lean");
}

function microConflict(id, micro, set, poseId = "") {
  const hasChild = set.members.some((member) => member.startsWith("C"));
  const hasAdult = set.members.some((member) => member.startsWith("W"));
  const tightLying = ["lying_right_side", "lying_left_side", "lying_stomach"].includes(poseId);
  if (micro.id === "w_kiss" && !hasChild) return "تتطلب طفلًا داخل المجموعة";
  if (micro.id === "w_distract" && !hasChild) return "تتطلب طفلًا للنظر إليه";
  if (micro.id === "c_gap" && id !== "C7") return "بصمة السن المفقود خاصة بالولد ٧";
  if (micro.id === "c_sleepy" && id !== "C2") return "نسب الطفل الدارج في هذه الحركة خاصة بعمر ~٢";
  if (micro.id === "c_squish" && !hasAdult) return "تتطلب بالغًا يحمل الطفل";
  if (micro.id === "c_reach" && tightLying) return "مد اليد نحو العدسة لا يناسب الاستلقاء الضيق";
  return "";
}

export function resolveCompanionPoses(set, seedExtra = 0, poseId = "") {
  if (!set?.members?.length) return { out:[], arrangement:null, replacements:[] };
  const assigned = assignCompanionPoses(set, seedExtra);
  const replacements = [];
  const out = assigned.out.map((entry) => {
    const reason = microConflict(entry.id, entry.micro, set, poseId);
    if (!reason) return entry;
    const fallback = safeFallback(entry.id, set);
    replacements.push({ id:entry.id, from:entry.micro, to:fallback, reason });
    return { ...entry, micro:fallback };
  });
  return { out, arrangement:assigned.arrangement, replacements };
}

export function buildCompanionPosesSection(set, seedExtra = 0, poseId = "", companions = {}) {
  if (!set?.members?.length) return "";
  const { out, arrangement } = resolveCompanionPoses(set, seedExtra, poseId);
  const lines = out.map((p) => {
    const name = companions[p.id]?.name_ar || p.id;
    return `${name}: MICRO-POSE "${p.micro.en}" — ${p.micro.physics}.`;
  }).join("\n");
  return `COMPANION SPONTANEOUS POSES:\n${lines}\nGROUP ARRANGEMENT: ${arrangement.en} — ${arrangement.physics}.\n${SPONTANEITY_LOCK}`;
}

if (typeof window !== "undefined") Object.assign(window, { SPONTANEITY_LOCK, COMPANION_MICRO, GROUP_ARRANGEMENTS, assignCompanionPoses, resolveCompanionPoses, buildCompanionPosesSection });
