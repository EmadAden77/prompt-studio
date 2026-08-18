(function(){
  var oldBuildFinal = window.buildFinal;
  var oldBuildNegative = window.buildNegative;

  var recliningPoses = [
    ['lying naturally on the back','مستلقٍ على الظهر'],
    ['lying naturally on the right side','مستلقٍ على الجانب الأيمن'],
    ['lying naturally on the left side','مستلقٍ على الجانب الأيسر'],
    ['lying naturally on the stomach','مستلقٍ على البطن'],
    ['semi-reclined with the upper body naturally raised','نصف استلقاء مع رفع الجزء العلوي'],
    ['lying on a bed with the head resting naturally on a pillow','مستلقٍ على السرير والرأس على الوسادة'],
    ['reclining naturally on a sofa','مستلقٍ على الأريكة'],
    ['lying down naturally with one knee bent','مستلقٍ مع ثني ركبة واحدة'],
    ['casual imperfect reclining pose','استلقاء عفوي غير مثالي'],
    ['reclining close to the phone for a handheld selfie','استلقاء قريب من الكاميرا / سيلفي']
  ];

  var darknessLighting = [
    ['near-total darkness','ظلام شديد جدًا'],
    ['very dark low-light environment','شبه ظلام'],
    ['extremely dim practical lighting','إضاءة خافتة جدًا'],
    ['dark room with one weak practical light source','غرفة مظلمة مع ضوء ضعيف من مصدر واحد'],
    ['dark room lit only by weak phone-screen spill','ظلام مع ضوء شاشة الجوال'],
    ['dark room with weak streetlight entering through a window','ظلام مع ضوء شارع داخل من النافذة'],
    ['darkness with weak vehicle-light spill','ظلام مع إنارة سيارة'],
    ['dark room with one weak side lamp','ظلام مع مصباح جانبي ضعيف'],
    ['underexposed darkness with crushed blacks and lost shadow detail','ظلام مع تفاصيل مفقودة في الظلال'],
    ['realistic low exposure with partial shadow-detail loss','تعريض منخفض واقعي مع أجزاء سوداء فعلًا']
  ];

  function addUnique(target, additions){
    if(!Array.isArray(target)) return;
    additions.forEach(function(item){
      if(!target.some(function(x){return x && x[0]===item[0];})) target.push(item);
    });
  }

  try {
    if(typeof OPTIONS==='object' && OPTIONS){
      addUnique(OPTIONS.pose,recliningPoses);
      addUnique(OPTIONS.lighting,darknessLighting);
    }
    if(typeof renderPickers==='function') renderPickers();
  } catch(e) {}

  function values(){
    try { return typeof smartValues==='function' ? smartValues() : state; }
    catch(e) { return {}; }
  }

  function isDarknessSelection(v){
    var s=String(v.lighting||'').toLowerCase();
    return /near-total darkness|very dark low-light|extremely dim practical|dark room|weak phone-screen|weak streetlight|weak vehicle-light|weak side lamp|underexposed darkness|realistic low exposure/.test(s);
  }

  var DARKNESS_RULE = 'DARKNESS AND LOW-EXPOSURE REALISM — ABSOLUTE MANDATORY WHEN A DARKNESS OPTION IS SELECTED. Preserve genuine darkness instead of beautifying or lifting the exposure. Use only light sources that physically exist in the selected scene. Allow clearly underexposed areas, deep shadow falloff, crushed blacks, partial or complete loss of detail in the darkest regions, uneven illumination, limited dynamic range, imperfect auto white balance, realistic high-ISO noise, mild chroma noise, subtle handheld softness, and localized highlight clipping around any real practical light source. Do not add invisible fill light, studio fill, cinematic key light, rim light, face-brightening light, or artificial shadow recovery. The face may remain visible only to the physically plausible degree allowed by the actual selected light source. If the selected condition is near-total darkness, large parts of the environment may be genuinely unreadable.';

  var RECLINING_RULE = 'RECLINING POSE PHYSICS — MANDATORY WHEN A LYING OR RECLINING POSE IS SELECTED. Preserve believable gravity, body support, mattress or sofa compression where relevant, natural spine and pelvis alignment, realistic shoulder and neck contact, plausible limb placement, fabric bunching and folds caused by contact surfaces, and physically coherent selfie-arm geometry. Do not reinterpret a selected lying pose as sitting, standing, kneeling, or merely leaning.';

  window.buildFinal = function(){
    var base = oldBuildFinal ? oldBuildFinal() : '';
    var v=values();
    var extras=[];
    if(isDarknessSelection(v)) extras.push(DARKNESS_RULE);
    if(/lying|reclining|semi-reclined/.test(String(v.pose||'').toLowerCase())) extras.push(RECLINING_RULE);
    return extras.length ? extras.join('\n\n')+'\n\n'+base : base;
  };

  window.buildNegative = function(){
    var base = oldBuildNegative ? oldBuildNegative() : '';
    var v=values();
    var extras=[];
    if(isDarknessSelection(v)) extras.push('brightened dark scene','fake fill light','cinematic key light in darkness','rim light in darkness','studio fill in darkness','fully recovered shadows','clean noise-free darkness','uniform dark-scene illumination','overexposed face in a dark scene','unmotivated face light','artificial shadow recovery');
    if(/lying|reclining|semi-reclined/.test(String(v.pose||'').toLowerCase())) extras.push('standing instead of lying','sitting instead of lying','kneeling instead of lying','floating body','unsupported torso','impossible reclining anatomy','wrong gravity direction','unrealistic mattress compression','broken shoulder or neck contact');
    return extras.length ? base+', '+extras.join(', ') : base;
  };

  function markVersion(){
    var badge=document.querySelector('.badge');
    if(badge) badge.textContent='Browser v3.10';
    var meta=document.querySelector('.meta span:last-child');
    if(meta) meta.textContent='Prompt Studio Browser v3.10';
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',markVersion);
  else markVersion();
})();
