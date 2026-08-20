(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;
  var AUTO='auto bedroom prompt';

  var DEFINITIONS=[
    {v:AUTO,l:'تلقائي حسب الـPrompt',scope:'any',rule:'Follow the explicit bedroom-lighting request if one exists. If no lighting source is specified, infer one physically plausible bedroom source from the scene and time. Never combine unrelated sources merely to make the image brighter.'},
    {v:'realistic side-window daylight through sheer curtain',l:'نهاري — نافذة جانبية + ستارة شفافة',scope:'day',rule:'Use realistic natural daylight entering from a side window through a thin sheer curtain. The window is the primary light source. One side of the face and nearby room surfaces should be brighter while the opposite side remains in gentle readable shadow. Preserve soft shadows under the nose, chin, cheekbones, around the neck, and near the hairline. Let the bedroom become gradually darker away from the window, with subtle reflected light from pale walls, curtains, and bedding. Use neutral to slightly cool daylight white balance and realistic smartphone exposure.'},
    {v:'realistic front-window daylight',l:'نهاري — نافذة أمامية ناعمة',scope:'day',rule:'Use soft natural daylight from a front-facing bedroom window as the primary source. Illuminate the face broadly but not perfectly evenly. Preserve a light shadow under the chin and nose, slight side-to-side brightness variation, realistic room falloff, and subtle bounce from walls and bedding. Keep exposure natural rather than beauty-lit.'},
    {v:'soft diffused overcast bedroom daylight',l:'نهاري — ضوء غائم منتشر',scope:'day',rule:'Use soft diffused overcast daylight entering through the bedroom window. Keep low-contrast natural illumination, broad soft shadows, neutral-to-slightly-cool color temperature, realistic indoor exposure, and gentle falloff toward the far corners. Preserve skin texture, bedding texture, and small facial shadows rather than flattening them.'},
    {v:'soft morning sunlight through curtains',l:'نهاري — شمس صباحية عبر الستائر',scope:'day',rule:'Use soft early-morning sunlight entering through the curtains. Create mild warm highlights and believable curtain or window-edge shadow patterns where physically justified. Keep facial highlights controlled, preserve skin detail, and let the room depth fall gradually into softer shadow away from the window.'},
    {v:'neutral-white ceiling fixture lighting',l:'سقفي — أبيض محايد واقعي',scope:'any',rule:'Use a soft neutral-white ceiling fixture as the only active artificial light source. The overhead direction must create natural shadows beneath the nose, chin, eyebrows, jawline, and neck. Keep the room moderately illuminated rather than perfectly bright, with slightly darker corners and realistic shadow depth behind furniture and around the bed.'},
    {v:'slightly cool white ceiling lighting',l:'سقفي — أبيض بارد خفيف',scope:'any',rule:'Use a slightly cool white ceiling light with a restrained cool cast, not a strong blue tint. Preserve neutral realistic skin color, overhead facial shadows, gradual room falloff, and darker zones away from the fixture.'},
    {v:'soft warm-neutral white ceiling lighting',l:'سقفي — أبيض دافئ خفيف',scope:'any',rule:'Use soft warm-neutral white ceiling lighting that still reads as white rather than yellow. Preserve natural skin tone, gentle overhead shadows, moderate brightness, realistic falloff, and no strong amber cast.'},
    {v:'soft low-intensity neutral-white nighttime lighting',l:'ليلي — أبيض منخفض الشدة',scope:'night',rule:'Use soft low-intensity neutral-white indoor lighting at night. Keep clear shadow depth, modest illumination near the source, darker room corners, mild smartphone sensor noise in darker areas, and slight detail loss in the deepest shadows. Do not brighten the room to daytime levels.'},
    {v:'warm bedside lamp only',l:'ليلي — أباجورة جانبية دافئة فقط',scope:'night',rule:'Use only a warm bedside lamp placed slightly to one side of the subject. It creates soft directional warm light on one side of the face and nearby bedding, with gradual shadow falloff across the opposite cheek, neck, shoulder, and background. Keep far corners noticeably darker and preserve realistic low-light smartphone noise and warm reflections on nearby surfaces.'},
    {v:'neutral-white ceiling plus warm bedside lamp',l:'ليلي — سقف أبيض + أباجورة دافئة',scope:'night',rule:'Use exactly two practical sources: a soft neutral-white ceiling fixture for low-level general illumination and a subtle warm bedside lamp for directional side light. Preserve realistic mixed color temperature, imperfect indoor white balance, gentle shadows, gradual falloff into darker corners, and natural smartphone exposure. Do not add any third fill source.'},
    {v:'neutral-white room light plus faint cool window daylight',l:'نهاري — أبيض داخلي + ضوء نافذة بارد خفيف',scope:'day',rule:'Use exactly two sources: neutral-white room light and faint cool daylight from the bedroom window. Preserve realistic mixed color temperature and imperfect white balance. Keep source directions distinct and physically coherent, with soft natural shadow transitions and no extra fill light.'},
    {v:'phone screen weak face light only',l:'ليلي — ضوء شاشة الجوال للوجه فقط',scope:'night',rule:'Use the phone screen only as a weak localized face light. It may softly lift the nearest facial area but must not illuminate the whole bedroom. Keep the room substantially darker, preserve strong natural falloff, realistic shadow depth, and low-light sensor noise.'},
    {v:'dim hallway spill through half-open door',l:'ليلي — ضوء ممر من باب نصف مفتوح',scope:'night',rule:'Use dim practical hallway light entering through a half-open bedroom door as the primary source. Keep the bedroom darker than the hallway spill, with elongated soft-edged shadows, believable directional falloff, and low-light smartphone exposure.'},
    {v:'streetlight spill through curtain',l:'ليلي — ضوء شارع عبر الستارة',scope:'night',rule:'Use dim streetlight spill entering through or around the curtain as the primary ambient source. Keep illumination uneven and localized, with realistic curtain interaction, darker room depth, plausible color cast, and mild sensor noise in shadowed areas.'},
    {v:'single white ceiling spotlight only',l:'سقفي — سبوت أبيض واحد فقط',scope:'any',rule:'Use exactly one white recessed ceiling spotlight only. All other ceiling lights, bedside lamps, and room lights are off. Preserve strong localized falloff, uneven room brightness, realistic overhead shadows, darker corners, and natural reflected bounce from nearby pale surfaces.'},
    {v:'single white ceiling bulb only',l:'سقفي — لمبة بيضاء واحدة فقط',scope:'any',rule:'Use exactly one white ceiling light source only. All other ceiling lights, spotlights, lamps, and practical sources are off. Keep the active light neutral-white rather than yellow, with realistic directional falloff, moderate exposure, and naturally darker room zones.'},
    {v:'white recessed ceiling spotlights only',l:'سقفي — السبوتات البيضاء فقط',scope:'any',rule:'Use only the bedroom recessed ceiling spotlights, all white rather than yellow. No bedside lamp, window fill, ring light, or hidden source. Preserve overhead shadow structure, non-uniform brightness, realistic falloff, and darker zones between or far from fixtures.'},
    {v:'full white ceiling lighting only',l:'سقفي — إنارة السقف البيضاء كاملة',scope:'any',rule:'Use the full bedroom ceiling lighting only, with all active ceiling fixtures white rather than yellow. Even with multiple ceiling fixtures, preserve natural directional overlap, facial shadows, slightly darker corners, moderate exposure, and real room depth. Do not flatten the room into perfectly even brightness.'},
    {v:'all bedroom lights off',l:'جميع أنوار الغرفة مطفأة',scope:'any',rule:'Turn all bedroom artificial lights off. Keep only ambient spill that is physically justified by the selected time and scene, such as faint daylight, moonless exterior ambience, or distant environmental spill. Do not invent a hidden fill light.'},
    {v:'near-total darkness bedroom',l:'ليلي — ظلام شبه كامل',scope:'night',rule:'Keep the bedroom in near-total darkness with all practical room lights off. Allow only minimal physically justified ambient spill. Large areas should fall into deep shadow with limited visible detail, realistic crushed blacks, and stronger low-light smartphone noise.'}
  ];

  var LEGACY={
    'near-total darkness bedroom':'near-total darkness bedroom',
    'very dark bedroom':'near-total darkness bedroom',
    'extremely dim bedroom':'soft low-intensity neutral-white nighttime lighting',
    'ceiling spotlights only':'white recessed ceiling spotlights only',
    'single white ceiling spotlight only':'single white ceiling spotlight only',
    'single white ceiling bulb only':'single white ceiling bulb only',
    'bedside lamp only':'warm bedside lamp only',
    'phone screen light only':'phone screen weak face light only',
    'streetlight spill through the curtain':'streetlight spill through curtain',
    'full ceiling lighting with all ceiling lamps white':'full white ceiling lighting only',
    'warm lighting from a non-ceiling source':'warm bedside lamp only',
    'cool lighting':'slightly cool white ceiling lighting',
    'mixed realistic bedroom lighting':'neutral-white ceiling plus warm bedside lamp',
    'all lights off':'all bedroom lights off'
  };

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function q(s){return document.querySelector(s)}
  function saveNow(){try{if(typeof save==='function')save()}catch(e){}}
  function timeMode(){
    var t=String(S().time||'').toLowerCase();
    if(/ليل|ليلاً|ليلا|مساء|مساءً|منتصف الليل|بعد منتصف الليل|night|evening|midnight|late night/.test(t))return 'night';
    if(/صباح|صباحًا|صباحا|نهار|ظهراً|ظهرا|ظهر|عصر|الفجر|morning|day|daytime|noon|afternoon|sunrise/.test(t))return 'day';
    return 'any';
  }
  function normalize(v){return LEGACY[v]||v||AUTO}
  function available(){
    var m=timeMode();
    return DEFINITIONS.filter(function(d){return d.scope==='any'||m==='any'||d.scope===m});
  }
  function findDef(v){
    var n=normalize(v);
    for(var i=0;i<DEFINITIONS.length;i++)if(DEFINITIONS[i].v===n)return DEFINITIONS[i];
    return DEFINITIONS[0];
  }
  function syncOptions(){
    if(typeof OPTIONS!=='object'||!OPTIONS)return;
    var s=S();
    var defs=available();
    var current=normalize(String(s.bedroomLighting||AUTO));
    if(!defs.some(function(d){return d.v===current}))current=AUTO;
    s.bedroomLighting=current;
    OPTIONS.bedroomLighting=defs.map(function(d){return [d.v,d.l]});
    saveNow();
  }
  function updateUI(){
    var p=q('.picker[data-key="bedroomLighting"]');
    var f=p&&p.closest('.field');
    if(!f)return;
    var lab=f.querySelector('label');if(lab)lab.textContent='إنارة غرفة النوم الواقعية';
    var small=f.querySelector('small');
    if(small)small.textContent='اختر نظام إنارة واحدًا فقط. الخيارات النهارية والليلية تتصفّى تلقائيًا حسب خانة الوقت، ومصدر الضوء المختار هو المرجع الوحيد للإنارة.';
  }

  function stripOldLighting(text){
    var headers=[
      'BEDROOM LIGHTING —',
      'BEDROOM LIGHTING REALISM —',
      'BEDROOM CEILING LIGHT COLOR RULE —',
      'SELECTED BEDROOM LIGHTING —',
      'BEDROOM PHYSICAL LIGHTING SYSTEM —',
      'BEDROOM SELECTED LIGHTING —'
    ];
    return String(text||'').split(/\n\n+/).filter(function(block){
      var t=block.trim();
      return !headers.some(function(h){return t.indexOf(h)===0});
    }).join('\n\n').replace(/\n{3,}/g,'\n\n').trim();
  }

  function physicsRule(){
    return 'BEDROOM PHYSICAL LIGHTING SYSTEM — ABSOLUTE. The selected bedroom-lighting option is the sole authority for active light sources. Do not invent, enable, or combine any additional window light, ceiling light, bedside lamp, hallway spill, phone glow, ring light, studio fill, rim light, or hidden source unless the selected option explicitly contains it. Lighting must be spatially uneven and physically understandable: one side or region is naturally brighter than another; soft but visible shadows remain under the nose, chin, around the neck and hairline; brightness transitions gradually from light into shadow; intensity decreases with distance from the source; room corners, areas behind furniture, under the bed, and zones farther from the source remain somewhat darker. Allow subtle reflected bounce from pale walls, curtains, bedding, clothing, and furniture without erasing the original shadows. Preserve visible material texture in skin, fabric, walls, curtains, and bedding. Keep white lighting neutral, slightly cool, or warm-neutral as selected, never pure blue-white and never strongly yellow unless a warm bedside lamp is explicitly selected. At night, keep exposure limited and allow mild sensor noise and modest loss of detail in the deepest shadows. Never make a nighttime room look like daylight. Never use perfectly even exposure, shadowless face lighting, beauty lighting, ring-light reflections, excessive HDR, glowing skin, artificial rim light, or perfectly illuminated dark corners.';
  }

  function selectedRule(){
    var d=findDef(S().bedroomLighting);
    return 'BEDROOM SELECTED LIGHTING — HARD CONSTRAINT. '+d.rule;
  }

  function timeGuard(){
    var d=findDef(S().bedroomLighting),m=timeMode();
    if(m==='any'||d.scope==='any'||d.scope===m)return '';
    return 'BEDROOM LIGHTING/TIME CONFLICT GUARD — REQUIRED. The current time field conflicts with the selected lighting mode. Do not combine contradictory day and night sources. Keep the bedroom-lighting selector authoritative and do not invent a second source to reconcile the conflict.';
  }

  window.buildFinal=function(){
    syncOptions();
    var base=previousFinal?previousFinal():'';
    base=stripOldLighting(base);
    var blocks=[physicsRule(),selectedRule()];
    var g=timeGuard();if(g)blocks.push(g);
    return blocks.join('\n\n')+'\n\n'+base;
  };

  window.buildNegative=function(){
    syncOptions();
    var base=previousNegative?previousNegative():'';
    var x=[
      'ignored selected bedroom lighting','extra unselected light source','perfectly even lighting','flat face lighting','studio beauty lighting','ring light reflection','shadowless face','no shadows','pure white walls with no color cast','glowing skin','overexposed face','excessive HDR','overly bright nighttime room','perfectly lit dark corners','blue-white overexposure','strong blue tint','strong yellow tint','cinematic neon lighting','artificial rim light','floating light source','unrealistic light direction','perfectly exposed room','uniform brightness across the bedroom','window light added when not selected','ceiling light added when not selected','bedside lamp added when not selected','phone glow lighting the whole room','hidden fill light','night scene lit like daylight','daylight source used at an explicit nighttime setting'
    ];
    return (base?base+', ':'')+x.join(', ');
  };

  function refresh(){
    syncOptions();
    if(typeof renderPickers==='function')renderPickers();
    updateUI();
  }
  function bindTime(){
    var t=q('#time');if(!t||t.dataset.bedroomLightingBound==='1')return;
    t.dataset.bedroomLightingBound='1';
    t.addEventListener('input',function(){clearTimeout(t._bedroomLightTimer);t._bedroomLightTimer=setTimeout(refresh,120)});
    t.addEventListener('change',refresh);
  }
  function boot(){refresh();bindTime();setTimeout(function(){updateUI();bindTime()},250);setTimeout(function(){updateUI();bindTime()},700)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();