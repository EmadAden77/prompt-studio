(function(){
  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;
  var AUTO='__auto_prompt__';

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function V(){try{return typeof smartValues==='function'?smartValues():S()}catch(e){return S()}}
  function isAuto(v){return !v||String(v)===AUTO||/^auto\b/i.test(String(v))}

  function normalizeOptions(){
    try{
      if(typeof OPTIONS!=='object'||!OPTIONS)return;
      if(Array.isArray(OPTIONS.distance)){
        OPTIONS.distance=OPTIONS.distance.filter(function(x){return x&&x[0]!=='full arm extension'});
      }
      if(Array.isArray(OPTIONS.selfieBodyPose)){
        OPTIONS.selfieBodyPose=OPTIONS.selfieBodyPose.filter(function(x){return x&&x[0]!=='selfie-arm shoulder slightly raised and forward'});
      }
      var s=S();
      if(s.distance==='full arm extension')s.distance='about 60 cm';
      if(s.selfieBodyPose==='selfie-arm shoulder slightly raised and forward')s.selfieBodyPose=AUTO;
      if(typeof save==='function')save();
      if(typeof renderPickers==='function')renderPickers();
    }catch(e){}
  }

  function selfieScene(v){
    var t=((v.idea||'')+' '+(v.camera||'')+' '+(v.angle||'')+' '+(v.distance||'')+' '+(v.pose||'')).toLowerCase();
    return /سيلفي|selfie|front camera|front-facing/.test(t)||!isAuto(v.selfieBodyPose)||!isAuto(v.freeHandPose);
  }

  function solveArm(v){
    var d=String(v.distance||'').toLowerCase();
    var a=String(v.angle||'').toLowerCase();
    var p=String(v.pose||'').toLowerCase();
    var body=String(v.selfieBodyPose||'').toLowerCase();
    var frame=String(v.frame||'').toLowerCase();
    var label='AUTO';
    var distance='Use a moderate natural selfie reach with a soft elbow bend.';
    var elbow='Keep the elbow comfortably bent rather than locked.';
    var scale='Allow only mild wide-angle enlargement of the near forearm.';

    if(/very close|قريب جدًا|قريب جدا/.test(d)){
      label='VERY CLOSE / 30–40 CM';
      distance='Treat the camera as roughly 30–40 cm from the face. The upper arm stays relatively near the torso and the forearm reaches forward toward the phone.';
      elbow='Use a clearly bent elbow, roughly in the 70–105 degree flexion range depending on the exact shoulder and camera height. Full extension is forbidden.';
      scale='The visible forearm may enlarge modestly from perspective, but it must not become a long diagonal slab or dominate the image. If needed, crop more of the forearm out at the frame edge instead of enlarging it.';
    }else if(/about 40 cm|40 cm|40 سم/.test(d)){
      label='ABOUT 40 CM';
      distance='Use a close selfie reach with the upper arm still fairly near the torso and the forearm projecting forward.';
      elbow='Use a clear but slightly more open elbow bend, roughly 55–90 degrees. Never straighten the arm.';
      scale='Keep near-arm enlargement moderate and physically plausible.';
    }else if(/about 50 cm|50 cm|50 سم/.test(d)){
      label='ABOUT 50 CM';
      distance='Use a medium selfie reach with moderate shoulder protraction and a naturally extended forearm.';
      elbow='Use a soft elbow bend, roughly 30–65 degrees, not a locked straight arm.';
      scale='Allow mild perspective enlargement only.';
    }else if(/about 60 cm|60 cm|60 سم/.test(d)){
      label='ABOUT 60 CM';
      distance='Use a longer but still human selfie reach. The shoulder may protract more, but anatomical segment lengths remain fixed.';
      elbow='Use a small remaining bend, roughly 10–35 degrees. Do not hyperextend the elbow.';
      scale='The arm can appear longer from perspective, but never stretched or telescoped.';
    }

    var angle='Keep the phone near eye level with only the shoulder and forearm adjustments required by the chosen angle.';
    if(/slightly above eye level|أعلى من العين قليل/.test(a))angle='Place the phone only slightly above the eye line. Let the forearm travel a little upward as well as forward, with mild shoulder elevation and no overhead reach.';
    else if(/clearly above|very high|overhead|near forehead|مرتفعة|فوق الرأس|الجبهة/.test(a))angle='Raise the phone through a believable combination of elbow position and shoulder elevation. Increase elevation, not arm length.';
    else if(/below|low-angle|chest-level|أسفل|منخفض/.test(a))angle='Lower the phone path naturally. The shoulder should not rise to fake a low angle.';

    var posture='Let the torso and neck make only small natural compensations for the camera-holding arm.';
    if(/seated|جالس/.test(p))posture='While seated, keep the pelvis supported and let only the upper torso rotate or lean slightly as needed for the selfie reach.';
    if(/lying|reclining|مستلق|استلقاء/.test(p+' '+body))posture='While reclining, derive the phone reach from the supported shoulder position and gravity. Do not use a standing-style arm path.';
    if(/mid-walk|يمشي|movement/.test(p+' '+body))posture='During movement, keep the phone arm stable enough for a real selfie while allowing small natural body asymmetry and motion.';

    var framing='The camera-holding hand and phone are the camera itself and should remain outside the captured image. The forearm should enter from the lower side/corner on the phone-holding side, not shoot up from the center-bottom of the frame.';
    if(/center/.test(frame)&&!/off-center/.test(frame))framing+=' Keep subject centering without dragging the arm toward the center of the image.';

    return 'AUTOMATIC SELFIE ARM SOLVER — HIGHEST PRIORITY. Arm extension is NOT a manually posed element. Derive it automatically from the selected selfie distance, camera angle, body pose, body orientation, and framing. CURRENT SOLUTION: '+label+'. '+distance+' '+elbow+' '+angle+' '+posture+' '+scale+' '+framing+' Human arm segment lengths are fixed. If the requested composition does not fit this solved reach, change crop or camera placement, not anatomy.';
  }

  function stripOldArmBlocks(text){
    var kill=[
      'SELFIE ARM BIOMECHANICS —',
      'SELFIE DISTANCE GEOMETRY —',
      'SELFIE PHYSICAL CONSISTENCY CHECK —'
    ];
    return String(text||'').split(/\n\n+/).filter(function(p){
      var t=p.trim();
      return !kill.some(function(k){return t.indexOf(k)===0});
    }).join('\n\n').trim();
  }

  function statusText(v){
    var d=String(v.distance||'');
    if(/very close/i.test(d))return 'قريب جدًا → الكوع مثني بوضوح، ممنوع المد الكامل';
    if(/40 cm/i.test(d))return '40 سم → ثني واضح ومتوسط للكوع';
    if(/50 cm/i.test(d))return '50 سم → مد متوسط مع ثني طبيعي';
    if(/60 cm/i.test(d))return '60 سم → مد أكبر مع بقاء ثني بسيط';
    return 'يتحدد تلقائيًا من المسافة والزاوية والوضعية';
  }

  function installStatus(){
    if(document.getElementById('autoArmStatus'))return;
    var grid=document.getElementById('selfieBodyControlsGrid');
    if(!grid)return;
    var f=document.createElement('div');f.className='field full';f.id='autoArmStatus';
    f.innerHTML='<label>مد ذراع السيلفي</label><div class="input" style="background:#101720;border-color:#2d3947;cursor:default"><strong>تلقائي</strong><div id="autoArmStatusText" style="font-size:12px;color:#98a2b1;margin-top:5px"></div></div><small class="historyHint">يتغير تلقائيًا حسب مسافة السيلفي والزاوية ووضعية الجسم والإطار. لا يوجد مد يدوي للذراع.</small>';
    grid.insertBefore(f,grid.firstChild);
  }

  function refreshStatus(){
    var el=document.getElementById('autoArmStatusText');if(el)el.textContent=statusText(V());
  }

  window.buildFinal=function(){
    var base=previousFinal?previousFinal():'';
    var v=V();
    if(!selfieScene(v))return base;
    base=stripOldArmBlocks(base);
    return solveArm(v)+'\n\n'+base;
  };

  window.buildNegative=function(){
    var base=previousNegative?previousNegative():'';
    var v=V();
    if(!selfieScene(v))return base;
    var x=['manual arm extension contradicting selected selfie distance','full-arm extension at close distance','phone-holding arm centered like a pole from the bottom of frame','foreground forearm wider than physically plausible','camera-holding hand visible as a separate extra hand','arm length changed to satisfy framing','straight locked elbow when the selected distance requires flexion'];
    return (base?base+', ':'')+x.join(', ');
  };

  function mark(){var b=document.querySelector('.badge');if(b)b.textContent='Browser v3.24';var m=document.querySelector('.meta span:last-child');if(m)m.textContent='Prompt Studio Browser v3.24';}
  function init(){normalizeOptions();installStatus();refreshStatus();mark();setInterval(refreshStatus,500);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();