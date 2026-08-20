(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var CAMERA='Xiaomi 15 Ultra front camera';
  var DEFAULT_LIGHT='soft diffused overcast bedroom daylight';
  var DEFAULT_CLUTTER='natural realistic clutter';
  var CANDID='bedroom_condition_candid';
  var ARM_HIDDEN='bedroom_arm_hidden';
  var ARM_SUBTLE='bedroom_arm_subtle';
  var AUTO='__auto_prompt__';

  var ESSENTIAL_KEYS={angle:1,pose:1,bedroomLighting:1,bedroomClutter:1};
  var DAY_LIGHTING={
    'realistic side-window daylight through sheer curtain':1,
    'realistic front-window daylight':1,
    'soft diffused overcast bedroom daylight':1,
    'soft morning sunlight through curtains':1,
    'neutral-white room light plus faint cool window daylight':1
  };

  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;
  var previousRender=window.renderPickers;
  var building=false;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function q(s){return document.querySelector(s)}
  function saveNow(){try{if(typeof save==='function')save()}catch(e){}}
  function setInput(id,value){var el=q('#'+id);if(el&&el.value!==value)el.value=value}

  function ensureVisibleDefaults(){
    var s=S();
    if(!s.bedroomLighting||s.bedroomLighting==='auto bedroom prompt')s.bedroomLighting=DEFAULT_LIGHT;
    if(!s.bedroomClutter||s.bedroomClutter==='auto bedroom clutter')s.bedroomClutter=DEFAULT_CLUTTER;
    s.time='';
    s.task='';
    s.realism='';
    s.size='auto';
    s.people='1';
    s.idea='سيلفي واقعي داخل غرفة النوم المرجعية';
    s.location='غرفة النوم';
    s.camera=CAMERA;
    s.lighting='';
    s.realisticLighting='';
    s.background='';
    s.condition='';
    s.distance='';
    s.selfieBodyPose=AUTO;
    s.bedroomImageCondition=CANDID;
    s.identityLock=true;
    s.roomLock=true;
    s.vehicleLock=false;
    s.smartMode=false;
    setInput('idea',s.idea);
    setInput('location',s.location);
    setInput('time','');
    setInput('camera',CAMERA);
  }

  function derivedTime(){return DAY_LIGHTING[String(S().bedroomLighting||DEFAULT_LIGHT)]?'نهار':'ليل'}

  function derivedFrame(){
    var p=String(S().pose||'');
    if(/lying|reclining/.test(p))return 'casual head-and-shoulders selfie crop';
    return 'casual face-and-upper-torso selfie crop';
  }

  function derivedFreeHand(){
    var p=String(S().pose||'');
    if(p==='bedroom_holding_pillow')return 'free hand gently holding a pillow or blanket';
    if(p==='bedroom_sitting_floor')return 'free hand resting naturally on the knee while seated';
    if(p==='bedroom_sitting_edge')return 'free hand resting naturally on the thigh';
    if(p==='bedroom_reclining_pillows'||p==='bedroom_lying_pillow')return 'free hand resting naturally on the bed beside the body';
    return 'free hand relaxed naturally by the side';
  }

  function derivedArm(){
    var a=String(S().angle||'');
    if(a==='bedroom_angle_eye_34')return ARM_HIDDEN;
    return ARM_SUBTLE;
  }

  function applyInternalDefaults(){
    ensureVisibleDefaults();
    var s=S();
    s.time=derivedTime();
    s.clothing='ملابس منزلية قطنية بسيطة ومريحة';
    s.expression='neutral relaxed expression with closed mouth';
    s.gaze='looking naturally toward the front-camera lens';
    s.frame=derivedFrame();
    s.freeHandPose=derivedFreeHand();
    s.selfieArmVisibility=derivedArm();
    s.bedroomImageCondition=CANDID;
    setInput('time',s.time);
    setInput('clothing',s.clothing);
  }

  function resetBuildOnlyTime(){
    var s=S();
    s.time='';
    setInput('time','');
  }

  function hideLegacyUI(){
    var body=q('.layout > section.card .body');
    if(!body)return;

    var notice=body.querySelector('.notice');
    if(notice)notice.textContent='اختر فقط: زاوية التصوير، وضعية الشخص، الإضاءة، والفوضى. بقية هندسة السيلفي والهوية والكاميرا والكادر وحالة الصورة تُبنى تلقائيًا بقواعد ثابتة بدون اختيارات عشوائية.';

    var section=q('#bedroomEssentialSection');
    var grid=q('#bedroomEssentialGrid');
    if(!section){
      section=document.createElement('div');
      section.className='section';
      section.id='bedroomEssentialSection';
      section.textContent='اختيارات غرفة النوم الأساسية';
      grid=document.createElement('div');
      grid.className='grid';
      grid.id='bedroomEssentialGrid';
      var anchor=notice||body.querySelector('.platform');
      if(anchor){anchor.insertAdjacentElement('afterend',section);section.insertAdjacentElement('afterend',grid)}
      else{body.prepend(grid);body.prepend(section)}
    }

    ['angle','pose','bedroomLighting','bedroomClutter'].forEach(function(key){
      var picker=q('.picker[data-key="'+key+'"]');
      var field=picker&&picker.closest('.field');
      if(field&&field.parentNode!==grid){field.style.display='';grid.appendChild(field)}
    });

    var labels={angle:'زاوية التصوير',pose:'وضعية الشخص',bedroomLighting:'الإضاءة',bedroomClutter:'الفوضى في الغرفة'};
    Object.keys(labels).forEach(function(key){
      var picker=q('.picker[data-key="'+key+'"]');
      var field=picker&&picker.closest('.field');
      var label=field&&field.querySelector('label');
      if(label)label.textContent=labels[key];
      if(field)field.style.display='';
    });

    body.querySelectorAll('.field').forEach(function(field){
      if(field.closest('#bedroomEssentialGrid'))return;
      if(field.querySelector('#reference')){field.style.display='';return}
      field.style.display='none';
    });

    body.querySelectorAll('.grid').forEach(function(g){if(g.id!=='bedroomEssentialGrid')g.style.display='none'});
    body.querySelectorAll('.toggle').forEach(function(t){t.style.display='none'});
    body.querySelectorAll('.section').forEach(function(s){
      if(s.id==='bedroomEssentialSection')return;
      if(/الهوية والصورة المرجعية|الصورة المرجعية/.test(s.textContent||'')){s.style.display='';s.textContent='الصورة المرجعية';return}
      s.style.display='none';
    });

    var ref=q('#reference');
    if(ref){var rf=ref.closest('.field');if(rf)rf.style.display=''}

    var status=q('#bedroomEssentialStatus');
    if(!status){
      status=document.createElement('small');
      status.id='bedroomEssentialStatus';
      status.className='historyHint';
      status.style.display='block';
      status.style.gridColumn='1/-1';
      status.style.lineHeight='1.7';
      status.style.color='var(--muted)';
      grid.appendChild(status);
    }
    status.textContent='النظام يبني تلقائيًا: Xiaomi 15 Ultra، شخص واحد، تثبيت الهوية والغرفة، ملابس منزلية بسيطة، نظرة وتعبير طبيعيان، كادر ومسافة وذراع متوافقة مع الزاوية والوضعية، وحالة صورة عفوية واقعية.';
  }

  function masterRule(){
    var s=S();
    return [
      'BEDROOM FOUR-CONTROL MASTER SYSTEM — ABSOLUTE HIGHEST PRIORITY. The user controls only four scene variables: SELFIE ANGLE, PERSON POSE, BEDROOM LIGHTING, and BEDROOM CLUTTER. Treat those four values as the complete user-facing scene specification. Do not require, infer from old saved controls, or resurrect any hidden legacy selection.',
      'FOUR ACTIVE USER CONTROLS — EXACT. SELFIE ANGLE: '+String(s.angle||'')+'. PERSON POSE: '+String(s.pose||'')+'. BEDROOM LIGHTING: '+String(s.bedroomLighting||DEFAULT_LIGHT)+'. BEDROOM CLUTTER: '+String(s.bedroomClutter||DEFAULT_CLUTTER)+'.',
      'DETERMINISTIC INTERNAL RESOLUTION — NO RANDOMIZATION. Resolve every omitted setting by fixed rules, not by creative variation: one referenced person; Xiaomi 15 Ultra front camera; canonical locked bedroom; exact identity lock; fixed 193 cm / 83 kg Lean Athletic body; simple comfortable cotton homewear; neutral relaxed closed-mouth expression; natural gaze toward the front-camera lens; ordinary candid smartphone capture; framing derived from the selected pose; camera-arm visibility derived from the selected angle; free-hand placement derived from the selected pose; and time of day derived from the selected lighting. Do not randomly change outfit style, expression, gaze, framing, camera distance, arm behavior, room arrangement, light source, clutter objects, or capture style between otherwise identical selections.',
      'PROMPT SYNTHESIS RULE — REQUIRED. Build one coherent photographic plan from the four active controls. Remove or ignore any lower-priority instruction that conflicts with them. Do not stack alternative angles, alternative poses, alternative lighting modes, alternative clutter levels, optional props, or multiple stylistic outcomes. The final prompt must describe one physically possible selfie, one lighting setup, one posture, one angle, and one clutter state.',
      'AUTOMATIC DETAILS ARE SUPPORTING ONLY. Camera distance, crop refinement, phone position, arm biomechanics, free-hand placement, gaze, expression, clothing, image-condition artifacts, exposure response, material behavior, and smartphone processing may only support the selected four controls. They may never become competing creative choices.'
    ].join('\n\n');
  }

  if(typeof previousRender==='function'){
    window.renderPickers=function(){
      if(!building)ensureVisibleDefaults();
      var r=previousRender.apply(this,arguments);
      hideLegacyUI();
      return r;
    };
  }

  window.buildFinal=function(){
    building=true;
    applyInternalDefaults();
    var base=previousFinal?previousFinal():'';
    var master=masterRule();
    resetBuildOnlyTime();
    building=false;
    return master+'\n\n'+base;
  };

  window.buildNegative=function(){
    building=true;
    applyInternalDefaults();
    var base=previousNegative?previousNegative():'';
    resetBuildOnlyTime();
    building=false;
    var x=[
      'hidden legacy control affecting bedroom result',
      'random optional setting',
      'random outfit variation',
      'random expression variation',
      'random gaze variation',
      'random camera distance',
      'random framing',
      'random arm behavior',
      'random light source',
      'random clutter objects',
      'multiple alternative selfie angles',
      'multiple alternative poses',
      'multiple lighting setups in one image',
      'old saved control overriding one of the four active bedroom controls'
    ];
    return (base?base+', ':'')+x.join(', ');
  };

  function boot(){
    ensureVisibleDefaults();
    if(typeof window.renderPickers==='function')window.renderPickers();
    hideLegacyUI();
    var clear=q('#clearBtn');
    if(clear&&!clear.dataset.bedroomEssentialBound){
      clear.dataset.bedroomEssentialBound='1';
      clear.addEventListener('click',function(){setTimeout(function(){ensureVisibleDefaults();if(typeof window.renderPickers==='function')window.renderPickers();hideLegacyUI();saveNow()},60)});
    }
    setTimeout(function(){ensureVisibleDefaults();hideLegacyUI()},200);
    setTimeout(function(){ensureVisibleDefaults();hideLegacyUI()},700);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
