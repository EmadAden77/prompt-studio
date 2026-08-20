(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var HIDDEN='bedroom_arm_hidden';
  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}

  function forceHidden(){
    var s=S();
    s.selfieArmVisibility=HIDDEN;
  }

  function sanitize(text){
    var out=String(text||'');
    out=out.split(/\n\n+/).filter(function(block){
      var t=block.trim();
      return !/^(CAMERA-HOLDING ARM VISIBILITY — SUBTLE NATURAL EDGE VISIBILITY\.|CAMERA-HOLDING ARM VISIBILITY — AUTOMATIC BY SELECTED ANGLE\.)/.test(t);
    }).join('\n\n');
    out=out
      .replace(/allow a small shoulder or forearm fragment[^.]*\./gi,'')
      .replace(/a small naturally cropped part of the camera-side shoulder[^.]*\./gi,'')
      .replace(/a little more of the camera-side shoulder or upper arm may naturally appear[^.]*\./gi,'')
      .replace(/only a small natural camera-side limb fragment appears[^;,.]*[;,.]?/gi,'');
    return out.replace(/\n{3,}/g,'\n\n').trim();
  }

  var RULE='BEDROOM SELFIE CAMERA-ARM EXCLUSION — ABSOLUTE HIGHEST PRIORITY. The photograph must still be a genuine self-taken front-camera selfie: the subject physically holds the phone at a reachable arm-length position with normal shoulder, elbow, forearm, wrist, and grip biomechanics. However, the entire camera-holding limb must remain outside the captured frame in every bedroom selfie angle and pose. Do not show the camera-side upper arm, elbow, forearm, wrist, hand, fingers, or phone. Do not show an extended arm entering from the bottom, side, or corner of the image. Preserve the feeling of a real handheld selfie through camera position, perspective, slight off-center framing, natural phone distance, and body orientation only. If the selected pose or angle would normally reveal the camera arm, adjust only phone position, camera-to-face distance, crop, field coverage, or tiny composition details. Never stretch, shorten, distort, detach, or reshape anatomy to hide the arm.';

  var CHECK='CAMERA-ARM HIDDEN COMPLIANCE CHECK — REQUIRED BEFORE OUTPUT. Confirm that the image still reads unmistakably as a self-taken front-camera selfie while zero visible portion of the camera-holding arm, elbow, forearm, wrist, hand, fingers, or phone enters the frame. If any camera-side limb fragment is visible, correct the framing or reachable phone placement before output without changing identity, selected pose, selected selfie angle, clothing, lighting, or body proportions.';

  window.buildFinal=function(){
    forceHidden();
    var base=oldFinal?oldFinal():'';
    return RULE+'\n\n'+sanitize(base)+'\n\n'+CHECK;
  };

  window.buildNegative=function(){
    forceHidden();
    var base=oldNegative?oldNegative():'';
    var x=['visible extended selfie arm','camera-holding arm visible in frame','camera-side upper arm visible','camera-holding elbow visible','camera-holding forearm visible','camera-holding wrist visible','camera-holding hand visible','camera-holding fingers visible','phone visible in ordinary front-camera selfie','selfie arm entering from lower frame edge','selfie arm entering from side edge','selfie arm entering from frame corner','giant foreground forearm','arm stretched or distorted to hide it'];
    return (base?base+', ':'')+x.join(', ');
  };

  function hint(){
    forceHidden();
    var p=document.querySelector('.picker[data-key="angle"]');
    var f=p&&p.closest('.field');
    if(!f)return;
    var h=document.getElementById('bedroomCameraArmHiddenHint');
    if(!h){
      h=document.createElement('small');h.id='bedroomCameraArmHiddenHint';h.className='historyHint';
      h.style.display='block';h.style.marginTop='6px';h.style.lineHeight='1.6';
      f.appendChild(h);
    }
    h.textContent='ذراع التصوير والهاتف خارج الكادر بالكامل في جميع زوايا السيلفي؛ الكادر والمسافة يتكيفان تلقائيًا دون تشويه الجسم.';
  }

  function boot(){forceHidden();hint();setTimeout(hint,200);setTimeout(hint,650)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
