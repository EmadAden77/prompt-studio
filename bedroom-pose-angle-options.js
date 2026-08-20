(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var POSES=[
    ['standing naturally','واقف'],
    ['standing beside the bed naturally','واقف بجانب السرير'],
    ['standing in front of the mirror naturally','واقف أمام المرآة'],
    ['seated naturally','جالس'],
    ['seated on the edge of the bed naturally','جالس على طرف السرير'],
    ['seated on the bed with one knee raised naturally','جالس على السرير مع رفع ركبة واحدة'],
    ['seated on the bed leaning lightly on one hand','جالس على السرير ومتكي على يد'],
    ['leaning against the headboard while seated on the bed','متكي على ظهر السرير'],
    ['reclining naturally on the bed','مستلقي نصف استلقاء على السرير'],
    ['reclining on one elbow on the bed','متكي على كوعه على السرير'],
    ['lying on a bed with the head resting naturally on a pillow','مستلقي على السرير ورأسه على الوسادة'],
    ['lying on the back on the bed naturally','مستلقي على الظهر على السرير'],
    ['lying on the side on the bed naturally','مستلقي على الجنب على السرير'],
    ['lying on the stomach on the bed with the head turned toward the camera','مستلقي على البطن على السرير ورأسه للكاميرا'],
    ['resting naturally after waking up on the bed','وضعية بعد الاستيقاظ على السرير'],
    ['resting naturally before sleep on the bed','وضعية قبل النوم على السرير']
  ];

  function q(s){return document.querySelector(s)}
  function isLying(v){return /lying|reclining|head resting naturally on a pillow|lying on the back|lying on the side|lying on the stomach|after waking up|before sleep/.test(String(v||'').toLowerCase())}
  function isBedSeat(v){return /seated on the edge of the bed|seated on the bed|headboard/.test(String(v||'').toLowerCase())}
  function recommendations(v){
    if(isLying(v))return ['near forehead height angled down','slightly above eye level','eye-level with slight casual offset','10 degrees from the left','10 degrees from the right','spontaneous imperfect handheld angle'];
    if(isBedSeat(v))return ['slightly above eye level','eye-level with slight casual offset','10 degrees from the left','10 degrees from the right','casual 2-4 degree horizon tilt'];
    return ['eye-level with slight casual offset','slightly above eye level','30 degrees from the left','30 degrees from the right','spontaneous imperfect handheld angle'];
  }
  function label(v){try{return typeof labelFor==='function'?labelFor('angle',v):v}catch(e){return v}}
  function extend(){
    try{
      if(typeof OPTIONS!=='object'||!OPTIONS)return;
      var base=Array.isArray(OPTIONS.pose)?OPTIONS.pose:[];
      POSES.forEach(function(item){if(!base.some(function(x){return x&&x[0]===item[0]}))base.push(item)});
      OPTIONS.pose=base;
      if(typeof renderPickers==='function')renderPickers();
    }catch(e){}
  }
  function installHint(){
    var p=q('.picker[data-key="angle"]');if(!p)return;
    var f=p.closest('.field');if(!f)return;
    var h=q('#bedroomAngleSuggestions');if(!h){h=document.createElement('small');h.id='bedroomAngleSuggestions';h.className='historyHint';h.style.display='block';h.style.marginTop='6px';h.style.lineHeight='1.6';f.appendChild(h)}
    var v=(typeof state==='object'&&state)?state.pose:'';
    h.textContent='زوايا مقترحة لهذه الوضعية: '+recommendations(v).map(label).join('، ');
  }
  var oldFinal=window.buildFinal,oldNegative=window.buildNegative;
  window.buildFinal=function(){
    var base=oldFinal?oldFinal():'';
    var v=(typeof state==='object'&&state)?state:{};
    if(!isLying(v.pose))return base;
    var rule='BED RECLINING PHYSICS — MANDATORY FOR BEDROOM SELFIES. Preserve believable gravity, mattress compression, pillow compression under the head where applicable, natural shoulder and pelvis support, realistic neck angle, physically plausible elbow placement, and fabric bunching caused by body contact with the bed. The torso, hips and legs must rest on the mattress convincingly and must never appear floating, twisted unnaturally, or mannequin-stiff. Solve the selfie arm from the actual supported shoulder position; if framing conflicts with anatomy, change crop or camera placement instead of distorting the body.';
    return rule+'\n\n'+base;
  };
  window.buildNegative=function(){
    var base=oldNegative?oldNegative():'';
    var v=(typeof state==='object'&&state)?state:{};
    if(!isLying(v.pose))return base;
    var x='floating body on bed, missing mattress compression, missing pillow compression, twisted reclining anatomy, mannequin-stiff lying pose, impossible lying selfie angle, detached head from pillow support';
    return base?base+', '+x:x;
  };
  document.addEventListener('click',function(e){if(e.target.closest('.picker[data-key="pose"] .pickerOpt'))setTimeout(installHint,80)},true);
  function boot(){extend();setTimeout(installHint,120)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
