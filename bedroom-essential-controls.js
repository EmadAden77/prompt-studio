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
  var DEFAULT_CLOTHING='ملابس منزلية قطنية بسيطة ومريحة';

  var HAND_OPTIONS=[
    [AUTO,'تلقائي حسب وضعية الشخص'],
    ['free hand relaxed naturally by the side','متدلية طبيعيًا بجانب الجسم'],
    ['free hand resting naturally on the thigh','على الفخذ'],
    ['free hand resting naturally on the knee while seated','على الركبة'],
    ['free hand resting naturally on the chest','على الصدر'],
    ['free hand resting naturally on the abdomen','على البطن'],
    ['free hand touching the hair naturally','تلامس الشعر بشكل عفوي'],
    ['free hand lightly touching the beard or chin','تلامس اللحية أو الذقن'],
    ['free hand resting behind the neck','خلف الرقبة'],
    ['free hand lightly holding the shirt fabric','تمسك القماش بخفة'],
    ['free hand resting naturally on the bed beside the body','على السرير بجانب الجسم'],
    ['free hand gently holding a pillow or blanket','تمسك وسادة أو بطانية بخفة'],
    ['free hand holding a half-empty plastic water bottle casually by the neck','ماسك قارورة موية نصف فاضية من الرقبة'],
    ['free hand holding a clear glass of water with ice cubes and natural condensation','ماسك كاسة موية زجاج فيها ثلج'],
    ['free hand holding a metal soda can with a casual natural grip','ماسك علبة مشروب غازي'],
    ['free hand gently rubbing one eye in a candid waking gesture','تفرك العين بعفوية كأنه توه صاحي'],
    ['free hand holding a TV remote control loosely','ماسك ريموت كنترول بارتخاء'],
    ['free hand holding a pair of eyeglasses or sunglasses by the frame','ماسك نظارة من الإطار'],
    ['free hand casually tucked into the front pants pocket','اليد داخل جيب البنطلون'],
    ['free hand resting loosely on the nearby bedside table or nightstand','مستندة على الكومدينة القريبة'],
    ['free hand casually adjusting the shirt collar or neckline','تعدل ياقة أو فتحة القميص بعفوية'],
    ['free hand lightly pulling or adjusting the shirt or sweater sleeve','تسحب أو تعدل كم القميص'],
    ['free thumb casually hooked into the front pants pocket with fingers outside','الإبهام داخل الجيب والأصابع خارجه'],
    ['free hand loosely gripping the edge of the bed blanket','تمسك طرف البطانية بخفة'],
    ['free fingers casually fiddling with a ring or wrist watch','تلعب بخاتم أو ساعة اليد'],
    ['free fingers lightly touching the lips without changing the selected expression','تلامس الشفاه بخفة'],
    ['free fingers naturally adjusting the frame of eyeglasses on the face','تعدل النظارة على الوجه'],
    ['free hand holding a loosely tangled phone charging cable','ماسك سلك شاحن جوال'],
    ['free hand holding one partially open book or folded magazine','ماسك كتاب أو مجلة بشكل عفوي'],
    ['free fingers holding a single wireless earbud','ماسك سماعة أذن واحدة'],
    ['free hand holding a small folded towel','ماسك منشفة صغيرة'],
    ['free hand loosely holding a small set of house or car keys','ماسك مفاتيح بشكل عفوي'],
    ['free hand resting naturally on the hip','اليد على الخصر'],
    ['free hand leaning with real weight on the bed headboard or frame','مستندة بوزن طبيعي على ظهر السرير'],
    ['free hand resting flat and fully relaxed on the thigh','مفرودة ومسترخية على الفخذ'],
    ['free hand resting on the knee with the free arm extended while leaning slightly forward','على الركبة والذراع مفرودة مع ميل خفيف للأمام']
  ];

  var CLOTHING_OPTIONS=[
    [DEFAULT_CLOTHING,'ملابس منزلية قطنية بسيطة ومريحة'],
    ['تيشرت قطني أسود وشورت منزلي رمادي','تيشرت أسود + شورت رمادي'],
    ['تيشرت قطني أبيض وشورت أسود','تيشرت أبيض + شورت أسود'],
    ['تيشرت قطني رمادي فاتح وشورت كحلي','تيشرت رمادي فاتح + شورت كحلي'],
    ['تيشرت قطني بيج وشورت أبيض','تيشرت بيج + شورت أبيض'],
    ['تيشرت قطني كحلي وشورت رمادي','تيشرت كحلي + شورت رمادي'],
    ['تيشرت قطني داكن واسع قليلًا وشورت منزلي','تيشرت داكن واسع قليلًا + شورت منزلي'],
    ['تيشرت أبيض وبنطلون رياضي رمادي','تيشرت أبيض + بنطلون رياضي رمادي'],
    ['تيشرت أسود وبنطلون رياضي أسود','تيشرت أسود + بنطلون رياضي أسود'],
    ['تيشرت بيج وبنطلون منزلي قطني','تيشرت بيج + بنطلون قطني منزلي'],
    ['تيشرت رياضي خفيف وشورت رياضي','تيشرت رياضي خفيف + شورت رياضي'],
    ['تيشرت نوم واسع وشورت قطني مريح','تيشرت نوم واسع + شورت قطني'],
    ['فانيلة قطنية بيضاء وشورت منزلي','فانيلة بيضاء + شورت منزلي'],
    ['بيجامة قطنية خفيفة رمادية','بيجامة قطنية رمادية'],
    ['بيجامة قطنية كحلية','بيجامة قطنية كحلية'],
    ['بيجامة قطنية سوداء بسيطة','بيجامة قطنية سوداء'],
    ['سويتشيرت خفيف وبنطلون رياضي مريح','سويتشيرت خفيف + بنطلون رياضي'],
    ['هودي خفيف وشورت منزلي','هودي خفيف + شورت منزلي'],
    ['ثوب منزلي قطني خفيف وبسيط','ثوب منزلي قطني خفيف']
  ];

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
  function allowed(list,v){return list.some(function(x){return x[0]===v})}

  function ensureEssentialStructure(){
    var body=q('.layout > section.card .body');
    if(!body)return null;
    var section=q('#bedroomEssentialSection');
    var grid=q('#bedroomEssentialGrid');
    if(!section){
      section=document.createElement('div');section.className='section';section.id='bedroomEssentialSection';section.textContent='اختيارات غرفة النوم';
      grid=document.createElement('div');grid.className='grid';grid.id='bedroomEssentialGrid';
      var notice=body.querySelector('.notice'),anchor=notice||body.querySelector('.platform');
      if(anchor){anchor.insertAdjacentElement('afterend',section);section.insertAdjacentElement('afterend',grid)}else{body.prepend(grid);body.prepend(section)}
    }
    if(!grid)grid=q('#bedroomEssentialGrid');
    return grid;
  }

  function ensureCustomFields(){
    var grid=ensureEssentialStructure();if(!grid)return;
    if(!q('#bedroomHandPoseField')){
      var h=document.createElement('div');h.className='field';h.id='bedroomHandPoseField';
      h.innerHTML='<label>وضعية اليد الأخرى</label><div class="picker" data-key="bedroomHandPose"></div><small class="historyHint" style="display:block;margin-top:6px;line-height:1.6">إذا تعارضت مع وضعية الجسم، يحافظ التطبيق على آخر اختيار ويصحح الخيار الآخر تلقائيًا.</small>';
      grid.appendChild(h);
    }
    if(!q('#bedroomClothingSuggestionField')){
      var c=document.createElement('div');c.className='field';c.id='bedroomClothingSuggestionField';
      c.innerHTML='<label>اقتراح الملابس</label><div class="picker" data-key="bedroomClothingSuggestion"></div><small class="historyHint" style="display:block;margin-top:6px;line-height:1.6">اختيار واحد واضح، مع طيات وملمس قماش واقعيين تلقائيًا.</small>';
      grid.appendChild(c);
    }
  }

  function extendOptions(){
    if(typeof OPTIONS!=='object'||!OPTIONS)return;
    OPTIONS.bedroomHandPose=HAND_OPTIONS.slice();
    OPTIONS.bedroomClothingSuggestion=CLOTHING_OPTIONS.slice();
  }

  function ensureVisibleDefaults(){
    var s=S();
    if(!s.bedroomLighting||s.bedroomLighting==='auto bedroom prompt')s.bedroomLighting=DEFAULT_LIGHT;
    if(!s.bedroomClutter||s.bedroomClutter==='auto bedroom clutter')s.bedroomClutter=DEFAULT_CLUTTER;
    if(!allowed(HAND_OPTIONS,String(s.bedroomHandPose||'')))s.bedroomHandPose=AUTO;
    if(!allowed(CLOTHING_OPTIONS,String(s.bedroomClothingSuggestion||'')))s.bedroomClothingSuggestion=DEFAULT_CLOTHING;
    if(!String(s.bedroomImageCondition||''))s.bedroomImageCondition=CANDID;
    s.time='';s.task='';s.realism='';s.size='auto';s.people='1';
    s.idea='سيلفي واقعي داخل غرفة النوم المرجعية';
    s.location='غرفة النوم';s.camera=CAMERA;
    s.lighting='';s.realisticLighting='';s.background='';s.condition='';s.distance='';s.selfieBodyPose=AUTO;
    s.identityLock=true;s.roomLock=true;s.vehicleLock=false;s.smartMode=false;
    setInput('idea',s.idea);setInput('location',s.location);setInput('time','');setInput('camera',CAMERA);
  }

  function derivedTime(){return DAY_LIGHTING[String(S().bedroomLighting||DEFAULT_LIGHT)]?'نهار':'ليل'}

  function derivedFrame(){
    var p=String(S().pose||'');
    if(/lying|reclining|leaning_headboard/.test(p))return 'casual head-and-shoulders selfie crop';
    if(/crosslegged|one_knee|sitting_floor/.test(p))return 'natural slightly off-center upper-body selfie crop';
    return 'casual face-and-upper-torso selfie crop';
  }

  function automaticFreeHand(){
    var p=String(S().pose||'');
    if(p==='bedroom_holding_pillow')return 'free hand gently holding a pillow or blanket';
    if(p==='bedroom_sitting_floor'||p==='bedroom_crosslegged_bed'||p==='bedroom_one_knee_bed')return 'free hand resting naturally on the knee while seated';
    if(p==='bedroom_sitting_edge'||p==='bedroom_leaning_headboard')return 'free hand resting naturally on the thigh';
    if(/lying|reclining/.test(p))return 'free hand resting naturally on the bed beside the body';
    return 'free hand relaxed naturally by the side';
  }

  function derivedFreeHand(){
    var v=String(S().bedroomHandPose||AUTO);
    return v===AUTO?automaticFreeHand():v;
  }

  function derivedArm(){
    var a=String(S().angle||'');
    if(a==='bedroom_angle_eye_34'||a==='bedroom_angle_high_34')return ARM_HIDDEN;
    return ARM_SUBTLE;
  }

  function applyInternalDefaults(){
    ensureVisibleDefaults();
    var s=S();
    s.time=derivedTime();
    s.clothing=String(s.bedroomClothingSuggestion||DEFAULT_CLOTHING);
    s.expression='neutral relaxed expression with closed mouth';
    s.gaze='looking naturally toward the front-camera lens';
    s.frame=derivedFrame();
    s.freeHandPose=derivedFreeHand();
    s.selfieArmVisibility=derivedArm();
    if(!String(s.bedroomImageCondition||''))s.bedroomImageCondition=CANDID;
    setInput('time',s.time);setInput('clothing',s.clothing);
  }

  function resetBuildOnlyTime(){var s=S();s.time='';setInput('time','')}

  function arrangeEssentialUI(){
    var body=q('.layout > section.card .body'),grid=ensureEssentialStructure();if(!body||!grid)return;
    ensureCustomFields();
    var notice=body.querySelector('.notice');
    if(notice)notice.textContent='اختر الزاوية، وضعية الشخص، اليد الأخرى، الملابس، الإضاءة، الفوضى، وواقعية حالة الصورة. التطبيق يبني بقية الـPrompt تلقائيًا بقواعد ثابتة ومتوافقة.';

    var order=['angle','pose','bedroomHandPose','bedroomClothingSuggestion','bedroomLighting','bedroomClutter','bedroomImageCondition'];
    order.forEach(function(key){
      var picker=q('.picker[data-key="'+key+'"]');var field=picker&&picker.closest('.field');
      if(field&&field.parentNode!==grid)grid.appendChild(field);
      if(field)field.style.display='';
    });

    var labels={angle:'زاوية التصوير',pose:'وضعية الشخص',bedroomHandPose:'وضعية اليد الأخرى',bedroomClothingSuggestion:'اقتراح الملابس',bedroomLighting:'الإضاءة',bedroomClutter:'الفوضى في الغرفة',bedroomImageCondition:'واقعية حالة الصورة'};
    Object.keys(labels).forEach(function(key){
      var picker=q('.picker[data-key="'+key+'"]'),field=picker&&picker.closest('.field'),label=field&&field.querySelector('label');
      if(label)label.textContent=labels[key];
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
    var ref=q('#reference');if(ref){var rf=ref.closest('.field');if(rf)rf.style.display=''}

    var status=q('#bedroomEssentialStatus');
    if(!status){status=document.createElement('small');status.id='bedroomEssentialStatus';status.className='historyHint';status.style.display='block';status.style.gridColumn='1/-1';status.style.lineHeight='1.7';status.style.color='var(--muted)';grid.appendChild(status)}
    status.textContent='تلقائي داخليًا: Xiaomi 15 Ultra، شخص واحد، قفل الهوية والغرفة، الكادر والمسافة وهندسة ذراع التصوير، تعبير ونظرة طبيعيان، ومعالجة فوتوغرافية متوافقة مع اختياراتك.';
  }

  function masterRule(){
    var s=S(),hand=derivedFreeHand(),clothing=String(s.bedroomClothingSuggestion||DEFAULT_CLOTHING),condition=String(s.bedroomImageCondition||CANDID);
    return [
      'BEDROOM SEVEN-CONTROL MASTER SYSTEM — ABSOLUTE HIGHEST PRIORITY. The user controls exactly seven bedroom variables: SELFIE ANGLE, PERSON POSE, FREE-HAND POSE, CLOTHING, BEDROOM LIGHTING, BEDROOM CLUTTER, and IMAGE CONDITION REALISM. Treat these seven final values as the complete user-facing scene specification. Do not resurrect hidden legacy selections.',
      'SEVEN ACTIVE USER CONTROLS — EXACT. SELFIE ANGLE: '+String(s.angle||'')+'. PERSON POSE: '+String(s.pose||'')+'. FREE HAND: '+hand+'. CLOTHING: '+clothing+'. BEDROOM LIGHTING: '+String(s.bedroomLighting||DEFAULT_LIGHT)+'. BEDROOM CLUTTER: '+String(s.bedroomClutter||DEFAULT_CLUTTER)+'. IMAGE CONDITION: '+condition+'.',
      'DETERMINISTIC INTERNAL RESOLUTION — NO RANDOMIZATION. Resolve omitted mechanics by fixed rules: one referenced person; Xiaomi 15 Ultra front camera; canonical locked bedroom; exact identity lock; fixed 193 cm / 83 kg Lean Athletic body; neutral relaxed closed-mouth expression; natural gaze toward the front-camera lens; framing derived from selected pose; camera-arm visibility and reach derived from selected angle; camera distance and phone position derived from pose/angle; and time of day derived from selected lighting. Do not randomly replace any of the seven selected values.',
      'PROMPT SYNTHESIS RULE — REQUIRED. Build one coherent photographic plan from the seven active controls. Remove or ignore lower-priority instructions that conflict with them. Never stack alternative angles, poses, hand gestures, outfits, lighting modes, clutter levels, or image-condition styles in one result.',
      'AUTOMATIC DETAILS ARE SUPPORTING ONLY. Camera distance, crop refinement, phone position, camera-arm biomechanics, gaze, expression, exposure response, material behavior, skin/hair realism, and smartphone processing may only support the seven selections and may never become competing creative choices.'
    ].join('\n\n');
  }

  if(typeof previousRender==='function'){
    window.renderPickers=function(){
      if(!building)ensureVisibleDefaults();
      extendOptions();ensureEssentialStructure();ensureCustomFields();
      var r=previousRender.apply(this,arguments);
      arrangeEssentialUI();
      return r;
    };
  }

  window.buildFinal=function(){
    building=true;applyInternalDefaults();
    var base=previousFinal?previousFinal():'',master=masterRule();
    resetBuildOnlyTime();building=false;
    return master+'\n\n'+base;
  };

  window.buildNegative=function(){
    building=true;applyInternalDefaults();
    var base=previousNegative?previousNegative():'';
    resetBuildOnlyTime();building=false;
    var x=['hidden legacy control affecting bedroom result','random optional setting','random outfit variation','random free-hand gesture','random camera distance','random framing','random arm behavior','random light source','random clutter objects','random image-condition style','multiple alternative selfie angles','multiple alternative poses','multiple alternative outfits','multiple lighting setups in one image','old saved control overriding one of the seven active bedroom controls'];
    return (base?base+', ':'')+x.join(', ');
  };

  function boot(){
    extendOptions();ensureEssentialStructure();ensureCustomFields();ensureVisibleDefaults();
    if(typeof window.renderPickers==='function')window.renderPickers();
    arrangeEssentialUI();
    var clear=q('#clearBtn');
    if(clear&&!clear.dataset.bedroomEssentialBound){clear.dataset.bedroomEssentialBound='2';clear.addEventListener('click',function(){setTimeout(function(){ensureVisibleDefaults();extendOptions();if(typeof window.renderPickers==='function')window.renderPickers();arrangeEssentialUI();saveNow()},60)})}
    setTimeout(function(){ensureVisibleDefaults();arrangeEssentialUI()},200);
    setTimeout(function(){ensureVisibleDefaults();arrangeEssentialUI()},700);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();