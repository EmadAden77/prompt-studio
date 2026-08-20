(function(){
  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;
  var AUTO='__auto_prompt__';
  var ARM_SUBTLE='bedroom_arm_subtle';
  var ARM_HIDDEN='bedroom_arm_hidden';
  var ARM_AUTO='bedroom_arm_auto';

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function V(){try{return typeof smartValues==='function'?smartValues():S()}catch(e){return S()}}
  function page(){return (location.hash||'').replace(/^#/,'').toLowerCase()}
  function bedroom(v){
    var t=((v.idea||'')+' '+(v.location||'')+' '+(v.background||'')).toLowerCase();
    return page()==='bedroom'||!!v.roomLock||/غرفة النوم|غرفه النوم|bedroom/.test(t);
  }
  function selfie(v){
    var t=((v.idea||'')+' '+(v.camera||'')+' '+(v.angle||'')+' '+(v.pose||'')).toLowerCase();
    return /سيلفي|selfie|front camera|front-facing/.test(t)||!!v.angle;
  }
  function armVisibility(){
    var v=String(S().selfieArmVisibility||'');
    if(v===ARM_HIDDEN||v===ARM_AUTO||v===ARM_SUBTLE)return v;
    return ARM_SUBTLE;
  }
  function visibilityArabic(v){
    if(v===ARM_HIDDEN)return 'مخفي بالكامل';
    if(v===ARM_AUTO)return 'تلقائي حسب الزاوية';
    return 'ظهور طبيعي خفيف';
  }

  function hideManualDistance(){
    var v=S();
    if(!bedroom(v))return;
    try{
      v.distance=AUTO;
      if(typeof save==='function')save();
    }catch(e){}
    var p=document.querySelector('.picker[data-key="distance"]');
    var f=p&&p.closest('.field');
    if(f)f.style.display='none';
    var arm=document.getElementById('autoArmStatus');
    if(arm){
      arm.style.display='';
      var strong=arm.querySelector('strong');if(strong)strong.textContent='هندسة الذراع تلقائية';
      var txt=document.getElementById('autoArmStatusText');if(txt)txt.textContent='الذراع تُهندس تلقائيًا من الزاوية والوضعية، وظهورها يتبع خانة ظهور ذراع السيلفي: '+visibilityArabic(armVisibility())+'.';
      var hint=arm.querySelector('.historyHint');if(hint)hint.textContent='لا تختار مسافة أو مد الذراع يدويًا في غرفة النوم. التطبيق يحل موضع الهاتف والكتف والكوع والمعصم تلقائيًا حسب الزاوية والوضعية.';
    }
  }

  function stripConflictingArmRules(text){
    var kill=[
      'SELFIE ARM BIOMECHANICS —',
      'SELFIE DISTANCE GEOMETRY —',
      'SELFIE PHYSICAL CONSISTENCY CHECK —',
      'AUTOMATIC SELFIE ARM SOLVER —',
      'SELFIE ARM AUTO-ENGINEERING —',
      'SELFIE ARM COMPLIANCE CHECK —',
      'SELFIE ARM EXTENSION —'
    ];
    var blocks=String(text||'').split(/\n\n+/).filter(function(p){
      var t=p.trim();
      return !kill.some(function(k){return t.indexOf(k)===0});
    });
    return blocks.join('\n\n')
      .split('\n')
      .filter(function(line){return !/^SELFIE DISTANCE\s*(?:—|:)/i.test(line.trim())})
      .join('\n')
      .replace(/\n{3,}/g,'\n\n')
      .trim();
  }

  function angleText(v){
    var a=String(v.angle||'').toLowerCase();
    if(/bedroom_angle_high|slightly above|أعلى من العين قليل/.test(a))return 'For the selected high-angle selfie, raise the phone only modestly above forehead level through a relaxed shoulder and soft elbow bend. If arm visibility permits, a small shoulder or forearm segment may enter naturally from a lower corner, but the elbow must never sit in the middle of the image.';
    if(/bedroom_angle_low|below|low|أسفل|منخفض/.test(a))return 'For the selected slightly low-angle selfie, extend the arm forward and slightly upward with a relaxed low shoulder and natural neck position. Avoid a foreshortened short-arm look, giant hand perspective, or exaggerated facial distortion.';
    if(/bedroom_angle_eye_34/.test(a))return 'For the selected eye-level three-quarter selfie, automatically use the camera-holding side that best balances the head turn, normally the hand opposite the direction of the face turn, while preserving relaxed shoulder and wrist mechanics.';
    if(/bedroom_angle_overhead/.test(a))return 'For the selected overhead lying selfie, place the phone above or slightly beside the face at a physically reachable arm-length position. Keep the elbow softly bent and prevent any near-lens hand or forearm from becoming oversized.';
    if(/bedroom_angle_side_bed/.test(a))return 'For the selected side selfie from bed level, use a natural lateral arm reach. A small shoulder or upper-arm segment may be more visible at the side edge when the visibility setting permits it.';
    return 'For the selected eye-level selfie, extend the arm diagonally forward at a comfortable reach with a relaxed shoulder, soft elbow bend, and neutral or slightly tilted wrist.';
  }

  function visibilityRule(){
    var v=armVisibility();
    if(v===ARM_HIDDEN)return 'CAMERA-ARM VISIBILITY — FULLY HIDDEN. Keep the entire camera-holding shoulder continuation, upper arm, elbow, forearm, wrist, hand, fingers, and phone outside the captured image. Preserve believable hidden biomechanics and adapt only crop, phone position, or framing if necessary.';
    if(v===ARM_AUTO)return 'CAMERA-ARM VISIBILITY — AUTOMATIC BY ANGLE. Decide from the selected selfie angle whether the camera-holding limb should be fully hidden or whether only a small naturally cropped shoulder, upper-arm, forearm, or elbow-edge fragment improves handheld authenticity. Never show the full arm. Never let the arm cross the face. The phone must always remain outside the image.';
    return 'CAMERA-ARM VISIBILITY — SUBTLE NATURAL EDGE VISIBILITY. Allow only a small naturally cropped portion of the camera-side shoulder, upper arm, forearm, or edge of the elbow when the selected angle would realistically bring it into the frame. Keep it near an edge or corner rather than across the center. Do not show the full arm. Do not let the wrist, palm, or fingers cover the cheek, mouth, nose, or eyes. The phone itself must remain outside the captured image.';
  }

  function rule(v){
    return 'BEDROOM SELFIE FRAMING LOCK — ABSOLUTE PRIORITY. In bedroom selfies, the user chooses the selfie angle, body pose, and camera-arm visibility. Exact camera-to-face distance, phone reach, shoulder movement, elbow bend, forearm path, wrist rotation, and crop remain automatic engineering variables. '+angleText(v)+' '+visibilityRule()+' The camera-holding arm must be extended comfortably rather than locked into a rigid straight line. Keep the shoulder relaxed and generally low, allowing only the modest forward or upward movement physically required by the selected angle. Keep the wrist neutral or only slightly tilted as if it is really gripping the unseen phone. Wide-angle perspective may enlarge a near limb segment mildly, but never turn the hand or forearm into a giant foreground mass. A natural crop may cut the arm or elbow at the frame boundary. Do not force the whole arm into view merely to prove that the photo is a selfie. Never lengthen, widen, telescope, inflate, detach, or distort anatomy to satisfy composition.';
  }

  window.buildFinal=function(){
    var base=previousFinal?previousFinal():'';
    var v=V();
    if(!bedroom(v)||!selfie(v))return base;
    base=stripConflictingArmRules(base);
    return rule(v)+'\n\n'+base;
  };

  window.buildNegative=function(){
    var base=previousNegative?previousNegative():'';
    var v=V();
    if(!bedroom(v)||!selfie(v))return base;
    var x=[
      'visible phone in ordinary front-camera bedroom selfie',
      'camera arm covering the face',
      'wrist covering cheek mouth nose or eye',
      'rigid perfectly straight selfie arm',
      'shoulder hiked unnaturally toward the ear',
      'broken wrist angle',
      'giant foreground hand',
      'giant foreground forearm',
      'elbow centered in the composition',
      'full camera-holding arm unnecessarily displayed',
      'rubbery arm',
      'telescoped arm',
      'stretched arm',
      'impossible selfie camera placement'
    ];
    if(armVisibility()===ARM_HIDDEN)x=x.concat(['visible camera-side shoulder continuation','visible selfie upper arm','visible selfie elbow','visible selfie forearm','visible selfie wrist','visible selfie hand','partial camera-holding limb entering from frame edge']);
    return (base?base+', ':'')+x.join(', ');
  };

  function init(){hideManualDistance();setTimeout(hideManualDistance,250);setTimeout(hideManualDistance,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();