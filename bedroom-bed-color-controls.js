(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var BED_DEFAULT='bedroom_bed_partially_made';
  var COLOR_DEFAULT='bedroom_color_raw_natural';
  var CROP_DEFAULT='bedroom_crop_auto_hidden_arm';

  var BED_OPTIONS=[
    ['bedroom_bed_neatly_made','مرتب ونظيف طبيعيًا'],
    [BED_DEFAULT,'مرتب جزئيًا — واقعي'],
    ['bedroom_bed_unmade','غير مرتب'],
    ['bedroom_bed_very_messy','فوضوي جدًا']
  ];

  var COLOR_OPTIONS=[
    [COLOR_DEFAULT,'ألوان طبيعية خام — موصى به'],
    ['bedroom_color_warm_natural','دافئة قليلًا بشكل طبيعي'],
    ['bedroom_color_cool_natural','باردة قليلًا بشكل طبيعي']
  ];

  var CROP_OPTIONS=[
    [CROP_DEFAULT,'تلقائي مع إخفاء الذراع — موصى به'],
    ['bedroom_crop_extreme_closeup','قريب جدًا للوجه'],
    ['bedroom_crop_shoulders_up','من الكتفين للأعلى'],
    ['bedroom_crop_tight_candid','كادر قريب عفوي'],
    ['bedroom_crop_low_tight','منخفض مقصوص'],
    ['bedroom_crop_half_face_side','نصف الوجه جانبي']
  ];

  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;
  var oldRender=window.renderPickers;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function q(s){return document.querySelector(s)}
  function allowed(list,v){return list.some(function(x){return x[0]===v})}

  function cropOptionsForState(){
    var s=S(),a=String(s.angle||'');
    return CROP_OPTIONS.filter(function(x){
      if(x[0]==='bedroom_crop_low_tight')return a==='bedroom_angle_low'||a==='bedroom_angle_ground_low';
      return true;
    });
  }

  function ensureState(){
    var s=S();
    if(!allowed(BED_OPTIONS,String(s.bedroomBedCondition||'')))s.bedroomBedCondition=BED_DEFAULT;
    if(!allowed(COLOR_OPTIONS,String(s.bedroomColorTone||'')))s.bedroomColorTone=COLOR_DEFAULT;
    if(!allowed(cropOptionsForState(),String(s.bedroomSelfieCrop||'')))s.bedroomSelfieCrop=CROP_DEFAULT;
  }

  function extendOptions(){
    if(typeof OPTIONS!=='object'||!OPTIONS)return;
    OPTIONS.bedroomBedCondition=BED_OPTIONS.slice();
    OPTIONS.bedroomColorTone=COLOR_OPTIONS.slice();
    OPTIONS.bedroomSelfieCrop=cropOptionsForState().slice();
  }

  function makeField(id,label,key,hint){
    var g=q('#bedroomEssentialGrid');if(!g)return null;
    var f=q('#'+id);
    if(!f){
      f=document.createElement('div');f.className='field';f.id=id;
      f.innerHTML='<label>'+label+'</label><div class="picker" data-key="'+key+'"></div><small class="historyHint" style="display:block;margin-top:6px;line-height:1.6">'+hint+'</small>';
      g.appendChild(f);
    }
    f.style.display='';
    return f;
  }

  function arrangeUI(){
    ensureState();extendOptions();
    var g=q('#bedroomEssentialGrid');if(!g)return;
    var crop=makeField('bedroomSelfieCropField','كادر السيلفي','bedroomSelfieCrop','الكادر المختار أعلى أولوية من القص التلقائي، ويُبقي ذراع التصوير والهاتف خارج الصورة بالكامل. خيار «منخفض مقصوص» يظهر فقط مع الزوايا المنخفضة المتوافقة.');
    var bed=makeField('bedroomBedConditionField','حالة السرير','bedroomBedCondition','تتحكم بالسرير والوسائد والبطانية فقط؛ لا تغيّر مستوى الفوضى في بقية الغرفة.');
    var color=makeField('bedroomColorToneField','ألوان الصورة','bedroomColorTone','تدرج لوني فوتوغرافي خفيف فقط، ولا يغيّر مصدر الإضاءة أو اتجاهها أو شدتها.');

    var angle=q('.picker[data-key="angle"]');
    var af=angle&&angle.closest('.field');
    if(crop&&af&&af.parentNode===g)af.insertAdjacentElement('afterend',crop);

    var clutter=q('.picker[data-key="bedroomClutter"]');
    var cf=clutter&&clutter.closest('.field');
    if(bed&&cf&&cf.parentNode===g)cf.insertAdjacentElement('afterend',bed);

    var condition=q('.picker[data-key="bedroomImageCondition"]');
    var imf=condition&&condition.closest('.field');
    if(color&&imf&&imf.parentNode===g)imf.insertAdjacentElement('afterend',color);

    var n=q('.layout > section.card .body .notice');
    if(n)n.textContent='اختر الزاوية، كادر السيلفي، الوضعية، تعبير الوجه، اليد الأخرى، الملابس، الإضاءة، الفوضى، حالة السرير، واقعية حالة الصورة، وألوان الصورة. بقية هندسة السيلفي تُبنى تلقائيًا مع قفل الهوية.';
  }

  function bedRule(){
    var v=String(S().bedroomBedCondition||BED_DEFAULT);
    if(v==='bedroom_bed_neatly_made')return 'BED CONDITION — NEATLY MADE, NATURAL. Keep the bed visibly tidy and intentionally arranged, but still physically real: natural linen texture, tiny nonuniform folds, realistic pillow volume, ordinary fabric tension, and no hotel-showroom perfection. If the body touches the bed, allow only the local compression and wrinkles physically required by that contact.';
    if(v==='bedroom_bed_unmade')return 'BED CONDITION — UNMADE. Keep the bed clearly unmade with naturally displaced sheets, irregular blanket folds, casually shifted pillows, and gravity-driven fabric overlap. The disorder must look like ordinary use, not staged chaos, duplicated bedding, or impossible fabric geometry.';
    if(v==='bedroom_bed_very_messy')return 'BED CONDITION — VERY MESSY. Keep the bed substantially unmade with strongly rumpled sheets, irregularly gathered blankets, and pillows displaced in plausible positions. Preserve realistic weight, contact, scale, gravity, and room geometry; do not create duplicated pillows, floating bedding, random trash, or theatrical disorder.';
    return 'BED CONDITION — PARTIALLY MADE, LIVED-IN REALISM. Keep the bed partly arranged but naturally used: moderate fabric wrinkles, slightly displaced pillows, imperfect blanket alignment, realistic compression, and ordinary lived-in asymmetry. Avoid both hotel-perfect smoothness and exaggerated mess.';
  }

  function colorRule(){
    var v=String(S().bedroomColorTone||COLOR_DEFAULT);
    if(v==='bedroom_color_warm_natural')return 'COLOR RESPONSE — SLIGHTLY WARM NATURAL. Apply only a restrained warm bias consistent with a real smartphone white-balance response. Preserve neutral reference colors, skin identity, highlight behavior, and the selected physical light sources. Do not invent golden-hour light, orange skin, sepia, or cinematic grading.';
    if(v==='bedroom_color_cool_natural')return 'COLOR RESPONSE — SLIGHTLY COOL NATURAL. Apply only a restrained cool bias consistent with realistic smartphone white balance. Preserve skin identity and the selected physical lighting. Do not invent blue-hour light, cyan shadows, teal-orange grading, or a stylized cold filter.';
    return 'COLOR RESPONSE — RAW NATURAL. Keep true-to-life restrained smartphone color with realistic automatic white balance, natural skin color, moderate saturation, and no decorative filter or cinematic grade. Small physically plausible white-balance imperfection is allowed.';
  }

  function cropRule(){
    var v=String(S().bedroomSelfieCrop||CROP_DEFAULT);
    if(v==='bedroom_crop_extreme_closeup')return 'SELFIE CROP — EXTREME CLOSE-UP, ARM FULLY EXCLUDED. Use a very tight genuine front-camera selfie crop centered primarily on the face, naturally ending around the neck or very upper shoulder line as anatomy and the selected pose permit. Keep enough edge context to remain a photograph rather than a face cutout. The entire camera-holding upper arm, elbow, forearm, wrist, hand, fingers, and phone must remain outside all frame borders. Do not simulate this crop with digital-zoom blur or facial reshaping.';
    if(v==='bedroom_crop_shoulders_up')return 'SELFIE CROP — SHOULDERS-UP. Frame the selfie tightly from roughly the shoulders upward with natural asymmetry and ordinary smartphone edge behavior. The camera-holding limb must be completely cut off by the image borders before any upper arm, elbow, forearm, wrist, hand, fingers, or phone becomes visible. Preserve the selected pose through believable shoulder, neck, head, pillow, blanket, or nearby-room context where relevant.';
    if(v==='bedroom_crop_tight_candid')return 'SELFIE CROP — TIGHT CANDID. Use a naturally close handheld composition in which the face occupies much of the frame without looking digitally zoomed or artificially enlarged. Preserve slight off-center framing, realistic front-camera perspective, and enough scene context for the selected bedroom pose. No hand, arm, phone, or foreground limb from the camera-holding side may enter the image.';
    if(v==='bedroom_crop_low_tight')return 'SELFIE CROP — TIGHT LOW-ANGLE COMPATIBLE FRAMING. This option is valid only with the selected low or very-low selfie angle. Keep the composition tight while the lower frame border fully excludes the camera-holding hand, wrist, forearm, elbow, upper arm, and phone. Preserve a real upward perspective without stretching the neck, chin, torso, or face and without placing the phone on the floor or mattress.';
    if(v==='bedroom_crop_half_face_side')return 'SELFIE CROP — SIDE HALF-FACE, ARM FULLY EXCLUDED. Use an intentionally very tight lateral crop so only part of the face remains inside one side of the frame, while preserving exact facial identity and physically plausible lens perspective. The crop may cut through the outer cheek, temple, hair, or shoulder region as composition requires, but must not cut through or distort central facial anatomy unnaturally. The camera-holding limb and phone remain completely outside the captured image.';
    return 'SELFIE CROP — AUTOMATIC FOR HIDDEN CAMERA ARM. Derive the least aggressive natural crop required by the selected selfie angle and body pose while keeping the entire camera-holding limb and phone outside the captured frame. Prefer ordinary casual front-camera framing over dramatic zoom, excessive face filling, or unnecessary body cropping.';
  }

  function cleanMaster(text){
    return String(text||'').split(/\n\n+/).filter(function(block){
      return !/^BEDROOM EIGHT-CONTROL MASTER SYSTEM —/.test(block.trim());
    }).join('\n\n').replace(/\n{3,}/g,'\n\n').trim();
  }

  function master(){
    var s=S();
    return 'BEDROOM ELEVEN-CONTROL MASTER SYSTEM — ABSOLUTE HIGHEST PRIORITY. Preserve exactly these eleven user-facing bedroom controls: selfie angle, selfie crop, person pose, facial expression, free-hand pose, clothing, bedroom lighting, bedroom clutter, bed condition, image-condition realism, and color response. SELFIE CROP is an explicit user control and overrides any older automatically derived framing or crop instruction. The crop may adapt only tiny phone position and camera distance as needed to keep the camera-holding limb outside the frame; it may never change the selected selfie angle, pose, identity, body proportions, expression, clothing, lighting, or room identity. BED CONDITION controls only bedding arrangement and must not add or remove room clutter. COLOR RESPONSE controls recorded color only and must not change the selected physical light source, time logic, identity, or room materials.\n\nACTIVE SELFIE CROP: '+String(s.bedroomSelfieCrop||CROP_DEFAULT)+'. ACTIVE BED CONDITION: '+String(s.bedroomBedCondition||BED_DEFAULT)+'. ACTIVE COLOR RESPONSE: '+String(s.bedroomColorTone||COLOR_DEFAULT)+'.';
  }

  if(typeof oldRender==='function'){
    window.renderPickers=function(){
      ensureState();extendOptions();
      var r=oldRender.apply(this,arguments);
      arrangeUI();
      return r;
    };
  }

  window.buildFinal=function(){
    ensureState();
    var base=oldFinal?oldFinal():'';
    return master()+'\n\n'+cropRule()+'\n\n'+bedRule()+'\n\n'+colorRule()+'\n\n'+cleanMaster(base);
  };

  window.buildNegative=function(){
    ensureState();
    var base=oldNegative?oldNegative():'';
    var x=['selected selfie crop ignored','automatic framing overriding selected selfie crop','conflicting crop instruction','visible arm','visible selfie upper arm','visible selfie elbow','visible selfie forearm','visible selfie wrist','visible selfie hand','visible fingers in foreground','holding phone','holding camera','extended arm','reaching arm into frame','stretched hand','distorted foreground hand','out-of-focus hand in foreground','digital zoom look replacing physical crop','face reshaped to satisfy tight crop','bed condition ignored','bed condition changing room clutter level','room clutter overriding selected bed condition','hotel-perfect synthetic bedding','duplicated pillows','floating blanket','impossible bedding folds','color grade changing physical light source','color grade changing skin identity','oversaturated smartphone color','cinematic teal-orange grade','forced golden-hour color','forced blue-hour color'];
    return (base?base+', ':'')+x.join(', ');
  };

  function boot(){ensureState();extendOptions();arrangeUI();if(typeof window.renderPickers==='function')window.renderPickers();setTimeout(arrangeUI,200);setTimeout(arrangeUI,650)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
