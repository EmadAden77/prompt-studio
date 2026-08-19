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

  function distanceRule(distance){
    var d=String(distance||'').toLowerCase();
    if(/very close|قريب جدًا|قريب جدا/.test(d)) return 'SELFIE DISTANCE GEOMETRY — VERY CLOSE. Treat the camera as roughly 30–40 cm from the face. The phone-holding elbow must remain clearly bent; do NOT use full-arm extension. Keep the upper arm relatively near the torso, with the forearm projecting forward and slightly upward toward the phone. The shoulder may protract and rise only modestly. The visible forearm may be somewhat larger because of wide-angle perspective, but it must not dominate the frame, become extremely thick, or appear abnormally long. If the requested composition cannot fit at this distance, crop differently or bring the camera slightly closer; never lengthen the limb.';
    if(/about 40 cm|40 cm|40 سم/.test(d)) return 'SELFIE DISTANCE GEOMETRY — ABOUT 40 CM. Use a clearly bent elbow and moderate shoulder protraction. The forearm reaches toward the phone while the upper arm remains naturally connected to the torso. No full extension and no oversized foreground forearm.';
    if(/about 50 cm|50 cm|50 سم/.test(d)) return 'SELFIE DISTANCE GEOMETRY — ABOUT 50 CM. Use moderate arm extension with a still-natural soft elbow bend. Allow mild wide-angle forearm enlargement only, never exaggerated lengthening.';
    if(/about 60 cm|60 cm|60 سم/.test(d)) return 'SELFIE DISTANCE GEOMETRY — ABOUT 60 CM. Use greater arm extension while keeping a small natural elbow bend and realistic shoulder mechanics. The arm may appear longer in perspective, but the anatomical segment lengths remain unchanged.';
    if(/full arm extension|ذراع كاملة|ذراع كامله/.test(d)) return 'SELFIE DISTANCE GEOMETRY — FULL ARM EXTENSION. Full reach is allowed here only. Keep the elbow near extension but not hyperextended, the shoulder naturally elevated/protracted, and the wrist within a believable range. Even at full extension, never telescope or stretch the arm beyond human proportions.';
    return 'SELFIE DISTANCE GEOMETRY — FOLLOW THE SELECTED DISTANCE. Couple camera distance, elbow bend, shoulder protraction, forearm angle, and wide-angle foreshortening as one physical system. Never achieve framing by lengthening the arm.';
  }

  function angleRule(angle){
    var a=String(angle||'').toLowerCase();
    if(/slightly above eye level|أعلى من العين قليل/.test(a)) return 'SELFIE ANGLE COUPLING — SLIGHTLY ABOVE EYE LEVEL. The phone must sit only modestly above the eye line. Reach the forearm slightly upward as well as forward, with a small natural shoulder lift. Do not create an extreme overhead arm path or an exaggerated downward-looking camera.';
    if(/above|high|مرتفعة|أعلى/.test(a)) return 'SELFIE ANGLE COUPLING — ABOVE EYE LEVEL. Raise the phone through believable shoulder and elbow mechanics. Increase shoulder elevation only as much as necessary for the selected angle; do not invent extra arm length.';
    if(/below|low|أسفل|منخفض/.test(a)) return 'SELFIE ANGLE COUPLING — BELOW EYE LEVEL. Lower the phone with believable shoulder depression and elbow position while preserving the real segment lengths of the arm.';
    return 'SELFIE ANGLE COUPLING. The selected camera angle must be produced by real shoulder, elbow, wrist, neck, and torso mechanics rather than by warping the arm.';
  }

  function freeHandSpecific(action){
    var a=String(action||'').toLowerCase();
    if(/holding a cup|تمسك كوب/.test(a)) return 'FREE-HAND CUP GEOMETRY. Hold the cup casually around waist-to-lower-chest height unless the prompt specifies otherwise. Keep the free-side shoulder relaxed, the elbow softly bent and fairly close to the torso, the wrist close to neutral, and the fingers naturally wrapped around the cup. The cup must have believable weight, scale, contact, and gravity. Do not let the cup-holding arm hang stiffly straight or pull the shoulder downward unnaturally.';
    if(/inside a pocket|half inside a pocket|داخل الجيب/.test(a)) return 'FREE-HAND POCKET GEOMETRY. Let the hand enter the real garment pocket naturally with a soft elbow bend, slight fabric tension and bunching, and no hidden extra fingers or impossible pocket placement.';
    if(/touching the hair|adjusting the hair|على الشعر|تعديل الشعر/.test(a)) return 'FREE-HAND HAIR GEOMETRY. Raise the free arm with a believable elbow bend and shoulder rotation. Fingers should contact the hair lightly with natural separation and no fused hair-hand geometry.';
    if(/chest|على الصدر/.test(a)) return 'FREE-HAND CHEST GEOMETRY. Rest the palm or fingers lightly on the chest with realistic contact pressure, wrist angle, elbow position, and fabric compression.';
    return '';
  }

  var ARM_RULE='SELFIE ARM BIOMECHANICS — ABSOLUTE PRIORITY. The phone-holding arm must be constructed as a normal human limb with fixed anatomical segment lengths. Preserve shoulder socket position, clavicle alignment, upper-arm length, elbow position, forearm length, wrist rotation, palm scale, finger anatomy, and a believable phone grip. The arm must remain continuously attached from shoulder to hand. Never stretch, telescope, inflate, shorten, detach, or reshape the arm to make the composition fit. The phone-holding shoulder should react naturally to the reach: slight forward movement and mild elevation when needed, plus a small corresponding torso and neck compensation. Wide-angle perspective may enlarge the nearer forearm or hand modestly, but perspective must not turn the forearm into the dominant visual mass or make it look abnormally long. Preserve natural skin folds, muscle transitions, bone landmarks, and occlusion at the shoulder, elbow, and wrist. If composition conflicts with anatomy, change crop, camera position, or unspecified framing details — never human anatomy.';
  var BODY_RULE='SELFIE BODY POSTURE — MANDATORY WHEN SPECIFIED. Apply the selected body posture exactly while keeping believable balance, gravity, spine alignment, shoulder asymmetry, pelvis orientation, and weight distribution. The body posture must visibly respond to the raised phone-holding arm instead of looking like a studio pose with a selfie arm pasted onto it.';
  var FREE_HAND_RULE='FREE-HAND POSE — MANDATORY WHEN SPECIFIED. Apply the selected free-hand action naturally with correct shoulder, elbow, wrist, palm, finger, clothing-contact, and object-contact geometry. The free hand must remain clearly separate from the phone-holding arm. Show believable contact pressure, occlusion, fabric response, and finger placement. Never invent extra fingers, duplicate a hand, or merge the hand into clothing or objects.';
  var CHECK='SELFIE PHYSICAL CONSISTENCY CHECK — REQUIRED BEFORE RENDERING. Mentally solve the pose as a real person taking the photo: camera distance determines elbow bend; camera height determines the forearm path and shoulder elevation; shoulder reach produces small natural torso and neck compensation; the body keeps believable balance; and the free hand performs its selected action without stiffness or distortion. The final image must look physically possible at the selected camera distance. If the framing would require an impossible arm length or giant foreground forearm, change crop or camera placement instead of changing anatomy.';

  window.buildFinal=function(){
    ensureState();
    var base=oldBuildFinal?oldBuildFinal():'';
    var v=vals(),extra=[];
    if(selfieScene(v)){
      extra.push(ARM_RULE);
      extra.push(distanceRule(v.distance));
      extra.push(angleRule(v.angle));
    }
    if(!isAuto(v.selfieBodyPose))extra.push(BODY_RULE+' SELECTED BODY POSTURE: '+v.selfieBodyPose+'.');
    if(!isAuto(v.freeHandPose)){
      extra.push(FREE_HAND_RULE+' SELECTED FREE-HAND ACTION: '+v.freeHandPose+'.');
      var fh=freeHandSpecific(v.freeHandPose);if(fh)extra.push(fh);
    }
    if(extra.length)extra.push(CHECK);
    return extra.length?extra.join('\n\n')+'\n\n'+base:base;
  };

  window.buildNegative=function(){
    ensureState();
    var base=oldBuildNegative?oldBuildNegative():'';
    var v=vals(),x=[];
    if(selfieScene(v))x=x.concat(['impossible selfie reach','arm stretched to fit framing','rubber arm','telescoped arm','inflated forearm','oversized foreground forearm','forearm dominating the frame','abnormally long forearm','abnormally long upper arm','shortened upper arm','detached shoulder','broken shoulder geometry','wrong clavicle position','broken elbow geometry','impossible elbow bend','hyperextended elbow','unnatural wrist bend','wrong wrist rotation','incorrect selfie foreshortening','excessive wide-angle arm distortion','giant hand caused by bad perspective','tiny hand caused by bad perspective','floating phone hand','unrealistic phone grip','selfie arm pasted onto a studio pose','extra arm','extra hand','extra fingers','fused fingers','warped fingers','hand disconnected from forearm']);
    if(/very close|قريب جدًا|قريب جدا/.test(String(v.distance||'').toLowerCase()))x=x.concat(['full-arm extension at very-close selfie distance','straight elbow at very-close selfie distance','extreme foreground-arm enlargement at very-close distance']);
    if(!isAuto(v.selfieBodyPose))x=x.concat(['ignored selfie body posture','studio-stiff body pose','impossible balance','wrong gravity','broken spine alignment','unnatural shoulder symmetry']);
    if(!isAuto(v.freeHandPose))x=x.concat(['ignored free-hand pose','wrong free hand position','extra free hand','free hand fused into body','free hand fused into clothing','fake hand contact','impossible finger contact','pasted-looking free hand','stiff free arm']);
    if(/holding a cup|تمسك كوب/.test(String(v.freeHandPose||'').toLowerCase()))x=x.concat(['cup floating in hand','stiff straight cup-holding arm','oversized cup','tiny cup','impossible cup grip','cup fused into fingers']);
    return x.length?(base?base+', ':'')+x.join(', '):base;
  };

  function markVersion(){var b=document.querySelector('.badge');if(b)b.textContent='Browser v3.19';var m=document.querySelector('.meta span:last-child');if(m)m.textContent='Prompt Studio Browser v3.19';}
  ensureState();ensureOptions();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){installUI();if(typeof renderPickers==='function')renderPickers();markVersion();});
  else{installUI();if(typeof renderPickers==='function')renderPickers();markVersion();}
})();