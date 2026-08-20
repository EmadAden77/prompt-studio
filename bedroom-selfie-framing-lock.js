(function(){
  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;
  var AUTO='__auto_prompt__';

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
      var strong=arm.querySelector('strong');if(strong)strong.textContent='تلقائي بالكامل';
      var txt=document.getElementById('autoArmStatusText');if(txt)txt.textContent='يُهندس تلقائيًا من زاوية السيلفي والوضعية، مع إبقاء ذراع التصوير خارج الإطار.';
      var hint=arm.querySelector('.historyHint');if(hint)hint.textContent='لا تختار مسافة أو مد الذراع يدويًا في غرفة النوم. التطبيق يحل موضع الهاتف والكتف والكوع تلقائيًا حسب الزاوية والوضعية.';
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
    if(/slightly above|أعلى من العين قليل/.test(a))return 'For the selected slightly-above-eye-level angle, place the phone only modestly above the eye line and solve the unseen arm with a natural shoulder lift and elbow bend.';
    if(/above|high|forehead|مرتفعة|أعلى|الجبهة/.test(a))return 'For the selected elevated selfie angle, raise the phone through realistic shoulder and elbow mechanics while keeping the entire phone-holding arm outside the captured frame.';
    if(/below|low|أسفل|منخفض/.test(a))return 'For the selected lower selfie angle, lower the phone naturally and solve the unseen arm without shoulder distortion.';
    if(/left|right|يسار|يمين/.test(a))return 'For the selected side-offset selfie angle, solve the phone position with a small natural torso/shoulder response while keeping the camera-holding arm fully outside the image.';
    return 'Derive the phone position and unseen arm geometry directly from the selected selfie angle and body posture.';
  }

  function rule(v){
    return 'BEDROOM SELFIE FRAMING LOCK — ABSOLUTE PRIORITY. In bedroom selfies, the user chooses the selfie angle and body pose only; exact camera-to-face distance, phone reach, shoulder lift, elbow bend, forearm path, wrist rotation, and crop are automatic engineering variables. '+angleText(v)+' The phone-holding arm, forearm, wrist, hand, and phone must remain completely outside the captured image. Do not show a partial forearm, hand, wrist, elbow, or phone at any edge or corner. Preserve the visual logic of a real front-camera selfie by placing the virtual phone just outside the image boundary and solving the unseen arm from anatomically correct shoulder geometry. Never lengthen, widen, telescope, straighten, inflate, detach, or distort the arm to satisfy composition. If the requested angle or pose would normally bring the arm into frame, move the virtual camera slightly, tighten the crop, show less torso/background, or adjust only unspecified framing details until the arm remains outside the image. Human anatomy always wins over composition.';
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
      'visible phone-holding arm in bedroom selfie',
      'visible selfie forearm',
      'visible selfie wrist',
      'visible selfie hand',
      'visible phone at frame edge',
      'partial camera-holding arm entering from a corner',
      'giant foreground forearm',
      'long diagonal selfie arm',
      'rubbery arm',
      'telescoped arm',
      'stretched arm',
      'distorted shoulder to hide the arm',
      'impossible selfie camera placement'
    ];
    return (base?base+', ':'')+x.join(', ');
  };

  function init(){hideManualDistance();setTimeout(hideManualDistance,250);setTimeout(hideManualDistance,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();