(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var POSES=[
    ['standing naturally in the bedroom','واقف'],
    ['seated naturally in the bedroom','جالس'],
    ['lying naturally on the bed','مستلقي على السرير']
  ];

  function q(s){return document.querySelector(s)}
  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function saveNow(){try{if(typeof save==='function')save()}catch(e){}}
  function renderNow(){try{if(typeof renderPickers==='function')renderPickers()}catch(e){}}

  function classifyPose(v){
    var t=String(v||'').toLowerCase();
    if(/lying|reclining|مستلقي|استلقاء|bed/.test(t))return 'lying naturally on the bed';
    if(/seated|sitting|جالس|chair|edge of the bed|headboard/.test(t))return 'seated naturally in the bedroom';
    return 'standing naturally in the bedroom';
  }

  function normalize(){
    try{
      if(typeof OPTIONS==='object'&&OPTIONS){
        OPTIONS.pose=POSES.slice();
      }
      var s=S();
      s.pose=classifyPose(s.pose);
      s.angle='';
      saveNow();
      renderNow();
    }catch(e){}
  }

  function installUI(){
    var angle=q('.picker[data-key="angle"]');
    var angleField=angle&&angle.closest('.field');
    if(angleField)angleField.style.display='none';
    var oldHint=q('#bedroomAngleSuggestions');
    if(oldHint)oldHint.remove();

    var pose=q('.picker[data-key="pose"]');
    var poseField=pose&&pose.closest('.field');
    if(!poseField)return;
    var label=poseField.querySelector('label');
    if(label)label.textContent='وضعية الشخص';
    var hint=q('#bedroomAutoAngleHint');
    if(!hint){
      hint=document.createElement('small');
      hint.id='bedroomAutoAngleHint';
      hint.className='historyHint';
      hint.style.display='block';
      hint.style.marginTop='6px';
      hint.style.lineHeight='1.6';
      hint.textContent='اختر فقط: واقف، جالس، أو مستلقي على السرير. زاوية السيلفي وطريقة التصوير والمسافة والقص يحددها التطبيق تلقائيًا حسب الوضعية.';
      poseField.appendChild(hint);
    }
  }

  function autoAngleRule(v){
    var p=classifyPose(v.pose);
    var common='BEDROOM SELFIE CAMERA DIRECTOR — ABSOLUTE PRIORITY. The user specifies only the body posture. The exact selfie shooting method, virtual phone position, camera height, yaw, pitch, roll, camera-to-face distance, framing, and crop are NOT user controls and must be chosen automatically for the most believable real smartphone selfie. Choose a casual, physically plausible front-camera viewpoint that suits the selected posture and the locked bedroom geometry. Avoid perfect symmetry, fashion-style posing, dramatic cinematic camera placement, exaggerated high or low angles, and composition that requires distorted anatomy. Preserve the selected posture exactly. The phone-holding arm and phone remain outside the captured image under the bedroom selfie framing lock.';
    if(p==='standing naturally in the bedroom'){
      return common+' CURRENT POSTURE — STANDING. Prefer a natural eye-level or slightly-above-eye-level handheld viewpoint with a small believable side offset and mild imperfect horizon variation. Let the framing include a realistic amount of upper torso and bedroom context without forcing the body to center perfectly.';
    }
    if(p==='seated naturally in the bedroom'){
      return common+' CURRENT POSTURE — SEATED. Choose a natural seated selfie viewpoint, usually around eye level or modestly above it, with enough side offset to keep the pelvis and torso support believable. Preserve realistic chair or bed contact and avoid camera placement that would require the torso, neck, or shoulder to twist unnaturally.';
    }
    return common+' CURRENT POSTURE — LYING ON THE BED. Choose a physically plausible front-camera viewpoint derived from the supported head and shoulder position, typically modestly above the face or slightly lateral rather than an impossible overhead shot. Preserve gravity, pillow and mattress contact, natural neck support, and believable body compression. If the desired framing conflicts with anatomy, change crop or virtual camera placement, never the body.';
  }

  function stripManualAngle(text){
    return String(text||'')
      .split('\n')
      .filter(function(line){
        var t=line.trim();
        if(/^SELFIE ANGLE\s*(?:—|:)/i.test(t))return false;
        if(/^زاوية السيلفي\s*(?:—|:)/i.test(t))return false;
        return true;
      })
      .join('\n')
      .replace(/\n{3,}/g,'\n\n')
      .trim();
  }

  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;

  window.buildFinal=function(){
    var base=oldFinal?oldFinal():'';
    var v=S();
    base=stripManualAngle(base);
    return autoAngleRule(v)+'\n\n'+base;
  };

  window.buildNegative=function(){
    var base=oldNegative?oldNegative():'';
    var x=[
      'manual selfie-angle instruction overriding bedroom auto camera director',
      'fixed selfie angle unrelated to body posture',
      'dramatic cinematic selfie angle',
      'impossible overhead lying selfie',
      'unnatural low-angle selfie',
      'perfectly centered synthetic selfie composition',
      'camera placement requiring distorted neck or shoulders'
    ];
    return (base?base+', ':'')+x.join(', ');
  };

  function enforce(){
    var s=S();
    var wanted=classifyPose(s.pose);
    var changed=false;
    if(s.pose!==wanted){s.pose=wanted;changed=true}
    if(s.angle!==''){s.angle='';changed=true}
    if(changed)saveNow();
    installUI();
  }

  document.addEventListener('click',function(e){
    if(e.target.closest('.picker[data-key="pose"] .pickerOpt'))setTimeout(function(){enforce();renderNow()},60);
  },true);

  function boot(){normalize();installUI();setInterval(enforce,700)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();