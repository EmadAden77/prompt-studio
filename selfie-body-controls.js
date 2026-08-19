(function(){
  var oldBuildFinal=window.buildFinal;
  var oldBuildNegative=window.buildNegative;
  var AUTO='__auto_prompt__';
  var AUTO_LABEL='تلقائي / حسب الـPrompt (بدون فرض)';

  var BODY_OPTIONS=[
    [AUTO,AUTO_LABEL],
    ['natural relaxed selfie posture','وقفة سيلفي طبيعية ومسترخية'],
    ['torso rotated slightly to the left','الجذع ملتف قليلًا لليسار'],
    ['torso rotated slightly to the right','الجذع ملتف قليلًا لليمين'],
    ['left three-quarter body orientation','الجسم 3/4 لليسار'],
    ['right three-quarter body orientation','الجسم 3/4 لليمين'],
    ['natural asymmetrical shoulders','الكتفان غير متساويين بشكل طبيعي'],
    ['selfie-arm shoulder slightly raised and forward','كتف ذراع السيلفي مرفوع ومتقدم قليلًا'],
    ['slight natural forward lean','ميل خفيف للأمام'],
    ['slight natural backward lean','ميل خفيف للخلف'],
    ['weight resting mainly on one leg','الوزن على ساق واحدة'],
    ['subtle natural hip shift','ميل خفيف للحوض'],
    ['chest angled slightly away from the phone','الصدر بزاوية خفيفة بعيدًا عن الجوال'],
    ['seated with a slight natural torso turn','جالس مع التفاف خفيف للجذع'],
    ['natural reclining selfie posture','وضعية استلقاء طبيعية للسيلفي'],
    ['candid body posture during slight movement','وضعية جسم عفوية أثناء حركة بسيطة']
  ];

  var FREE_HAND_OPTIONS=[
    [AUTO,AUTO_LABEL],
    ['free hand relaxed naturally by the side','اليد الحرة متدلية طبيعيًا'],
    ['free hand naturally inside a pocket','اليد الحرة داخل الجيب'],
    ['free hand half inside a pocket','نصف اليد الحرة داخل الجيب'],
    ['free hand resting naturally on the chest','اليد الحرة على الصدر'],
    ['free hand resting naturally on the abdomen','اليد الحرة على البطن'],
    ['free hand touching the hair naturally','اليد الحرة على الشعر'],
    ['free hand casually adjusting the hair','تعديل الشعر باليد الحرة'],
    ['free hand lightly touching the beard or chin','اليد الحرة تلامس اللحية أو الذقن'],
    ['free hand resting behind the neck','اليد الحرة خلف الرقبة'],
    ['free hand lightly adjusting the collar','تعديل الياقة باليد الحرة'],
    ['free hand naturally adjusting the shemagh or ghutra','تعديل الشماغ أو الغترة'],
    ['free hand naturally touching or adjusting the wristwatch','لمس أو تعديل الساعة'],
    ['free hand holding car keys naturally','اليد الحرة تمسك مفاتيح السيارة'],
    ['free hand holding a cup naturally','اليد الحرة تمسك كوبًا'],
    ['free hand resting naturally on the steering wheel','اليد الحرة على المقود'],
    ['free hand resting naturally on a table','اليد الحرة على الطاولة'],
    ['free hand resting naturally on a door or door frame','اليد الحرة مستندة على الباب'],
    ['free hand resting naturally on the thigh','اليد الحرة على الفخذ'],
    ['free hand resting naturally on the knee while seated','اليد الحرة على الركبة أثناء الجلوس'],
    ['free hand lightly holding the shirt or thobe fabric','اليد الحرة تمسك طرف الملابس بخفة'],
    ['free hand holding a bag or shoulder strap naturally','اليد الحرة تمسك حزام حقيبة'],
    ['free hand resting behind the back','اليد الحرة خلف الظهر'],
    ['small casual natural free-hand gesture','إيماءة بسيطة وعفوية باليد الحرة']
  ];

  function ensureState(){
    try{
      if(typeof state==='object'&&state){
        if(typeof state.selfieBodyPose!=='string')state.selfieBodyPose=AUTO;
        if(typeof state.freeHandPose!=='string')state.freeHandPose=AUTO;
      }
    }catch(e){}
  }

  function ensureOptions(){
    try{
      if(typeof OPTIONS!=='object'||!OPTIONS)return;
      OPTIONS.selfieBodyPose=BODY_OPTIONS;
      OPTIONS.freeHandPose=FREE_HAND_OPTIONS;
    }catch(e){}
  }

  function installUI(){
    if(document.getElementById('selfieBodyControlsGrid'))return;
    var sections=[].slice.call(document.querySelectorAll('.section'));
    var anchor=sections.find(function(el){return /الهوية والصورة المرجعية/.test(el.textContent||'')});
    if(!anchor||!anchor.parentNode)return;
    var wrap=document.createElement('div');
    wrap.innerHTML=''+
      '<div class="section">واقعية وضعية السيلفي</div>'+
      '<div id="selfieBodyControlsGrid" class="grid">'+
      '  <div class="field"><label>وضعية الجسم أثناء السيلفي</label><div class="picker" data-key="selfieBodyPose"></div><small class="historyHint">تتحكم في التفاف الجذع والكتفين وميل الجسم أثناء السيلفي.</small></div>'+
      '  <div class="field"><label>وضعية اليد الحرة</label><div class="picker" data-key="freeHandPose"></div><small class="historyHint">اليد الأخرى غير الماسكة للجوال، مثل الجيب أو الصدر أو الشعر أو المقود.</small></div>'+
      '</div>';
    anchor.parentNode.insertBefore(wrap,anchor);
  }

  function vals(){try{return typeof smartValues==='function'?smartValues():state}catch(e){return {}}}
  function isAuto(v){return !v||String(v)===AUTO;}
  function selfieScene(v){
    var t=((v.idea||'')+' '+(v.camera||'')+' '+(v.angle||'')+' '+(v.distance||'')).toLowerCase();
    return /سيلفي|selfie|front camera|front-facing|ذراع|arm-length/.test(t)||!isAuto(v.selfieBodyPose)||!isAuto(v.freeHandPose);
  }

  var ARM_RULE='SELFIE ARM BIOMECHANICS AND PERSPECTIVE — ABSOLUTE MANDATORY FOR SELFIE SCENES. The phone-holding arm must look like a real human arm physically reaching the camera. Preserve anatomically correct shoulder attachment, clavicle position, upper-arm length, elbow location, forearm length, wrist rotation, hand scale, finger anatomy, and grip. The shoulder on the phone-holding side may sit slightly higher and slightly forward because of the arm extension, with a small natural torso and neck compensation. Match arm extension to the selected selfie distance and camera angle. Use physically plausible wide-angle foreshortening: the near hand or forearm may appear somewhat larger than the upper arm, but never stretched, rubbery, shortened, detached, or telescoped. Keep the elbow bend or extension mechanically possible, the wrist rotated only within a natural range, and the phone grip believable. The visible arm must connect continuously from shoulder to hand with correct muscle and bone landmarks, natural skin folds at the elbow and wrist, and realistic occlusion against the torso. Do not hide anatomical errors with blur, cropping, darkness, clothing, or impossible perspective. The entire composition must convincingly read as a real self-taken handheld smartphone selfie.';
  var BODY_RULE='SELFIE BODY POSTURE — MANDATORY WHEN SPECIFIED. Apply the selected body posture exactly while keeping believable balance, gravity, spine alignment, shoulder asymmetry, pelvis orientation, and weight distribution. The body posture must cooperate with the raised phone-holding arm instead of looking like a separately posed studio portrait.';
  var FREE_HAND_RULE='FREE-HAND POSE — MANDATORY WHEN SPECIFIED. Apply the selected free-hand action naturally with correct shoulder, elbow, wrist, palm, finger, clothing-contact, and object-contact geometry. The free hand must remain clearly separate from the phone-holding arm. If it touches hair, beard, chest, clothing, pocket, steering wheel, table, door, thigh, or another surface, show believable contact pressure, occlusion, fabric response, and finger placement. Never invent extra fingers or an extra arm.';
  var CHECK='SELFIE POSE COMPLIANCE CHECK — REQUIRED BEFORE RENDERING. Verify that one arm can physically hold the camera at the chosen distance and angle, the shoulder and torso react naturally to that reach, the selected body posture remains anatomically balanced, and the free hand performs the selected action without distortion. If framing or another instruction conflicts with real human biomechanics, preserve realistic biomechanics and adjust only unspecified composition details.';

  window.buildFinal=function(){
    ensureState();
    var base=oldBuildFinal?oldBuildFinal():'';
    var v=vals(),extra=[];
    if(selfieScene(v))extra.push(ARM_RULE);
    if(!isAuto(v.selfieBodyPose))extra.push(BODY_RULE+' SELECTED BODY POSTURE: '+v.selfieBodyPose+'.');
    if(!isAuto(v.freeHandPose))extra.push(FREE_HAND_RULE+' SELECTED FREE-HAND ACTION: '+v.freeHandPose+'.');
    if(extra.length)extra.push(CHECK);
    return extra.length?extra.join('\n\n')+'\n\n'+base:base;
  };

  window.buildNegative=function(){
    ensureState();
    var base=oldBuildNegative?oldBuildNegative():'';
    var v=vals(),x=[];
    if(selfieScene(v))x=x.concat(['impossible selfie reach','rubber arm','stretched arm','telescoped arm','shortened selfie arm','detached shoulder','broken shoulder geometry','wrong clavicle position','broken elbow geometry','impossible elbow bend','unnatural wrist bend','wrong wrist rotation','incorrect selfie foreshortening','giant hand caused by bad perspective','tiny hand caused by bad perspective','floating phone hand','unrealistic phone grip','extra arm','extra hand','extra fingers','fused fingers','warped fingers','hand disconnected from forearm']);
    if(!isAuto(v.selfieBodyPose))x=x.concat(['ignored selfie body posture','studio-stiff body pose','impossible balance','wrong gravity','broken spine alignment','unnatural shoulder symmetry']);
    if(!isAuto(v.freeHandPose))x=x.concat(['ignored free-hand pose','wrong free hand position','extra free hand','free hand fused into body','free hand fused into clothing','fake hand contact','impossible finger contact','pasted-looking free hand']);
    return x.length?(base?base+', ':'')+x.join(', '):base;
  };

  function markVersion(){var b=document.querySelector('.badge');if(b)b.textContent='Browser v3.18';var m=document.querySelector('.meta span:last-child');if(m)m.textContent='Prompt Studio Browser v3.18';}
  ensureState();ensureOptions();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){installUI();if(typeof renderPickers==='function')renderPickers();markVersion();});
  else{installUI();if(typeof renderPickers==='function')renderPickers();markVersion();}
})();