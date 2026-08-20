(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var AUTO='__auto_prompt__';
  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;
  var pending=null;
  var busy=false;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function saveNow(){try{if(typeof save==='function')save()}catch(e){}}
  function refreshNow(){try{if(typeof autoRefresh==='function')autoRefresh()}catch(e){}}
  function val(x){return String(x==null?'':x)}

  function kind(v){
    var t=val(v).toLowerCase();
    if(/half-empty plastic water bottle|clear glass of water with ice|metal soda can/.test(t))return 'drink';
    if(/tucked into the front pants pocket|thumb casually hooked into the front pants pocket|resting naturally on the hip/.test(t))return 'standing';
    if(/bedside table|nightstand/.test(t))return 'bedside';
    if(/bed headboard|bed frame/.test(t))return 'headboard';
    if(/resting flat and fully relaxed on the thigh|resting on the knee with the free arm extended/.test(t))return 'seated';
    if(/edge of the bed blanket/.test(t))return 'blanket';
    if(/partially open book|folded magazine/.test(t))return 'reading';
    if(/house or car keys/.test(t))return 'standing';
    if(/rubbing one eye|tv remote|eyeglasses|sunglasses|shirt collar|neckline|shirt or sweater sleeve|ring or wrist watch|touching the lips|charging cable|wireless earbud|small folded towel/.test(t))return 'universal';
    return '';
  }

  function compatible(p,k){
    if(!k||k==='universal')return true;
    if(k==='drink')return /standing_|sitting_edge|reclining_pillows|leaning_headboard|crosslegged_bed|one_knee_bed|laptop_book_bed/.test(p);
    if(k==='standing')return /standing_/.test(p);
    if(k==='bedside')return /standing_beside|sitting_edge|reclining_pillows/.test(p);
    if(k==='headboard')return /leaning_headboard|reclining_pillows|sitting_edge|crosslegged_bed|one_knee_bed/.test(p);
    if(k==='seated')return /sitting_edge|sitting_floor|crosslegged_bed|one_knee_bed|leaning_headboard|laptop_book_bed/.test(p);
    if(k==='blanket')return /reclining_pillows|lying_pillow|lying_side|holding_pillow|peeking_blanket|crosslegged_bed|one_knee_bed|leaning_headboard|sitting_edge/.test(p);
    if(k==='reading')return /sitting_edge|reclining_pillows|leaning_headboard|crosslegged_bed|one_knee_bed|laptop_book_bed/.test(p);
    return true;
  }

  function fallback(k){
    if(k==='standing')return 'bedroom_standing_beside';
    if(k==='bedside'||k==='drink'||k==='seated'||k==='reading')return 'bedroom_sitting_edge';
    if(k==='headboard')return 'bedroom_leaning_headboard';
    if(k==='blanket')return 'bedroom_reclining_pillows';
    return 'bedroom_standing_beside';
  }

  function optionValue(key,label){
    try{
      var arr=(typeof OPTIONS==='object'&&OPTIONS&&OPTIONS[key])||[];
      for(var i=0;i<arr.length;i++)if(String(arr[i][1])===String(label))return arr[i][0];
    }catch(e){}
    return '';
  }

  function renderAndRefresh(){
    try{if(typeof window.renderPickers==='function')window.renderPickers()}catch(e){}
    saveNow();refreshNow();installHint();
  }

  function applyPending(){
    if(!pending||busy)return;
    busy=true;
    var x=pending;pending=null;
    var s=S();
    if(x.key==='bedroomHandPose'&&kind(x.value)){
      s.bedroomHandPose=x.value;s.freeHandPose=x.value;
      var k=kind(x.value),p=val(s.pose);
      if(!compatible(p,k))s.pose=fallback(k);
      renderAndRefresh();
    }else if(x.key==='pose'){
      s.pose=x.value||s.pose;
      var previous=val(x.priorHand),k2=kind(previous);
      if(k2){
        if(compatible(val(s.pose),k2)){s.bedroomHandPose=previous;s.freeHandPose=previous;}
        else{s.bedroomHandPose=AUTO;s.freeHandPose=AUTO;}
        renderAndRefresh();
      }
    }
    busy=false;
  }

  document.addEventListener('click',function(e){
    var opt=e.target&&e.target.closest?e.target.closest('.pickerOpt'):null;
    if(!opt)return;
    var picker=opt.closest('.picker[data-key]');if(!picker)return;
    var key=picker.getAttribute('data-key');
    if(key!=='bedroomHandPose'&&key!=='pose')return;
    var value=optionValue(key,opt.textContent);
    if(key==='bedroomHandPose'&&!kind(value))return;
    pending={key:key,value:value,priorHand:val(S().bedroomHandPose)};
    setTimeout(applyPending,0);
  },true);

  function preflight(){
    var s=S(),h=val(s.bedroomHandPose),k=kind(h);
    if(!k)return;
    if(!compatible(val(s.pose),k)){
      s.bedroomHandPose=AUTO;s.freeHandPose=AUTO;saveNow();
    }else s.freeHandPose=h;
  }

  function physicalRule(){
    var h=val(S().bedroomHandPose),t=h.toLowerCase();
    if(!kind(h))return '';
    var blocks=[
      'EXPANDED FREE-HAND ACTION — MANDATORY. Execute exactly this selected free-hand action with the one non-camera hand only: '+h+'. The camera-holding arm remains physically outside the captured frame and cannot assist the free hand. Keep shoulder, elbow, wrist, palm, fingers, grip force, joint limits, skin folds, contact pressure, and object support anatomically credible. The selected facial expression, clothing, body proportions, bedroom geometry, lighting, and camera angle remain authoritative.',
      'FREE-HAND OBJECT DISCIPLINE — SELECTED-ONLY. If this hand action includes an object, show exactly the object required by the selected action and no duplicate. Keep it correctly scaled, gravity-supported, physically contacted by the fingers and palm, and consistent with the existing bedroom. Do not invent a second matching object, extra accessories, extra drinks, decorative props, or furniture merely to justify the gesture.'
    ];
    if(/water bottle/.test(t))blocks.push('WATER BOTTLE PHYSICS. Use one ordinary half-empty plastic bottle. The remaining water must settle horizontally under gravity, the thin plastic may deform subtly under the grip, and reflections must match the selected bedroom lighting. Do not add another bottle or readable invented branding.');
    if(/clear glass of water/.test(t))blocks.push('GLASS-AND-ICE PHYSICS. Use one clear glass with believable water level, ice displacement, refraction, highlights, and irregular condensation droplets. The grip must support the real weight of the glass without impossible finger placement or spilling.');
    if(/soda can/.test(t))blocks.push('SODA-CAN PHYSICS. Use one ordinary metal can with believable cylindrical geometry, small specular highlights, realistic finger contact, and no duplicated can or invented promotional styling.');
    if(/rubbing one eye/.test(t))blocks.push('EYE-CONTACT PHYSICS. The free fingers may create only small local eyelid and surrounding-skin compression. Preserve eye anatomy and the selected facial expression everywhere else; do not reshape the eye, eyebrow, cheekbone, or face.');
    if(/tv remote/.test(t))blocks.push('REMOTE RULE. Show one ordinary handheld remote only. Do not invent a television, entertainment setup, or extra electronics merely because the remote is selected.');
    if(/eyeglasses or sunglasses by the frame/.test(t))blocks.push('HELD-GLASSES RULE. Show one pair held naturally by the frame. The glasses are a hand-held object, not automatically worn, and must not duplicate or obscure facial identity.');
    if(/adjusting the frame of eyeglasses on the face/.test(t))blocks.push('GLASSES-ADJUSTMENT RULE. Show one physically plausible pair of eyeglasses being adjusted with light finger contact. Keep the eyes and facial identity readable and do not add a second pair.');
    if(/pants pocket/.test(t))blocks.push('POCKET CONTACT. The selected clothing must react naturally around the pocket opening with believable fabric tension, folds, hand depth, and wrist angle. Never clip the hand through fabric or alter body anatomy to reach the pocket.');
    if(/bedside table|nightstand/.test(t))blocks.push('NIGHTSTAND CONTACT. Use the existing nearby bedside table only. The hand must genuinely reach and transfer light weight into its real surface without moving the furniture, stretching the arm, or inventing another table.');
    if(/shirt collar|neckline/.test(t))blocks.push('COLLAR CONTACT. The fingers create small local fabric displacement at the selected shirt collar or neckline only; preserve the selected clothing design and do not redesign the garment.');
    if(/shirt or sweater sleeve/.test(t))blocks.push('SLEEVE CONTACT. The free fingers lightly pull or adjust the existing sleeve, producing believable local fabric tension and folds without changing the selected clothing item.');
    if(/edge of the bed blanket/.test(t))blocks.push('BLANKET-EDGE CONTACT. Grip the existing bed blanket edge only. Show small local tension, compression, fold propagation, and gravity-driven drape; do not add a second blanket.');
    if(/ring or wrist watch/.test(t))blocks.push('SMALL-ACCESSORY INTERACTION. Use only one small ring or one wrist watch as required to make the selected habitual gesture coherent, never both at once and never extra jewelry. Finger contact and wrist mechanics must remain natural.');
    if(/touching the lips/.test(t))blocks.push('LIP-CONTACT PHYSICS. Fingers may create only tiny local contact deformation. The selected expression remains authoritative; do not force a thoughtful, surprised, seductive, or other new expression.');
    if(/charging cable/.test(t))blocks.push('CHARGING-CABLE PHYSICS. Use one ordinary loose charging cable with gravity-driven bends and non-repeating tangles. Do not add a visible second phone, charger brick, or extra cable unless separately selected elsewhere.');
    if(/book|magazine/.test(t))blocks.push('BOOK/MAGAZINE RULE. Use exactly one partially open book or folded magazine as the selected hand object. If the selected body pose already includes a book, treat this as the same object rather than adding another. Preserve realistic page thickness, gravity, finger support, and no readable invented text.');
    if(/wireless earbud/.test(t))blocks.push('EARBUD RULE. Hold exactly one small wireless earbud between believable fingertips. Do not automatically add a case, second earbud, headphones, or phone.');
    if(/small folded towel/.test(t))blocks.push('TOWEL RULE. Use one small folded towel with soft fabric thickness, compression, and gravity. Do not imply or add a bathroom scene change.');
    if(/house or car keys/.test(t))blocks.push('KEYS RULE. Show one small everyday key set with realistic metal/plastic scale and gravity. Do not add a vehicle, door action, or extra key set merely because keys are selected.');
    if(/resting naturally on the hip/.test(t))blocks.push('HIP CONTACT. Keep the standing balance relaxed. The palm rests on the real hip with a natural elbow angle and no fashion-model exaggeration or torso reshaping.');
    if(/bed headboard|bed frame/.test(t))blocks.push('HEADBOARD/FRAME SUPPORT. The free hand transfers believable body weight into the existing bed headboard or frame. Preserve realistic shoulder loading, elbow angle, palm pressure, contact shadow, and unchanged room geometry.');
    if(/resting flat and fully relaxed on the thigh/.test(t))blocks.push('FLAT-THIGH REST. Let the whole free hand settle naturally on the thigh with relaxed fingers, light palm contact, correct wrist alignment, and small clothing compression.');
    if(/knee with the free arm extended/.test(t))blocks.push('KNEE-SUPPORT LEAN. The free hand rests on the knee while the torso leans only slightly forward. Keep elbow extension within a comfortable human range, preserve seated balance, and show real clothing/contact compression at the knee.');
    return blocks.join('\n\n');
  }

  function installHint(){
    var p=document.querySelector('.picker[data-key="bedroomHandPose"]');
    var f=p&&p.closest('.field');if(!f)return;
    var h=document.getElementById('bedroomExpandedHandHint');
    if(!h){h=document.createElement('small');h.id='bedroomExpandedHandHint';h.className='historyHint';h.style.display='block';h.style.marginTop='6px';h.style.lineHeight='1.6';f.appendChild(h)}
    h.textContent='الخيارات الموسعة تستخدم اليد الحرة فقط، وتتحقق تلقائيًا من توافقها مع وضعية الجسم ومن واقعية التلامس والقبضة والأغراض.';
  }

  window.buildFinal=function(){
    preflight();
    var base=oldFinal?oldFinal():'';
    var r=physicalRule();
    return r?r+'\n\n'+base:base;
  };

  window.buildNegative=function(){
    preflight();
    var base=oldNegative?oldNegative():'';
    if(!kind(val(S().bedroomHandPose)))return base;
    var x=['two visible free hands','camera-holding hand assisting free-hand action','duplicate selected hand prop','floating hand-held object','object fused into fingers','impossible grip','impossible wrist angle','hand clipping through clothing','hand clipping through furniture','extra prop invented to justify hand gesture','hand gesture changing facial identity','hand gesture overriding selected facial expression'];
    return (base?base+', ':'')+x.join(', ');
  };

  function boot(){preflight();installHint();setTimeout(installHint,220);setTimeout(installHint,700)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();