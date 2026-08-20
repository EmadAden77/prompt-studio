(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var POSES=[
    ['bedroom_standing','واقف'],
    ['bedroom_seated','جالس'],
    ['bedroom_lying','مستلقي على السرير']
  ];

  function q(s){return document.querySelector(s)}
  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function saveNow(){try{if(typeof save==='function')save()}catch(e){}}
  function renderNow(){try{if(typeof renderPickers==='function')renderPickers()}catch(e){}}

  function normalizeLegacy(v){
    var t=String(v||'').toLowerCase();
    if(t==='bedroom_standing'||t==='bedroom_seated'||t==='bedroom_lying')return t;
    if(/seated|sitting|جالس|chair|headboard/.test(t))return 'bedroom_seated';
    if(/lying|reclining|laying|مستلقي|استلقاء|on the bed/.test(t))return 'bedroom_lying';
    return 'bedroom_standing';
  }

  function installOptions(){
    if(typeof OPTIONS!=='object'||!OPTIONS)return;
    OPTIONS.pose=POSES.slice();
    var s=S();
    s.pose=normalizeLegacy(s.pose);
    s.angle='';
    s.distance='__auto_prompt__';
    saveNow();
    renderNow();
  }

  function hideAutomaticFields(){
    var angle=q('.picker[data-key="angle"]');
    var af=angle&&angle.closest('.field');
    if(af)af.style.display='none';
    var distance=q('.picker[data-key="distance"]');
    var df=distance&&distance.closest('.field');
    if(df)df.style.display='none';
    var old=q('#bedroomAngleSuggestions');if(old)old.remove();
    var pose=q('.picker[data-key="pose"]');
    var pf=pose&&pose.closest('.field');
    if(!pf)return;
    var lab=pf.querySelector('label');if(lab)lab.textContent='وضعية الشخص';
    var h=q('#bedroomAutoCameraHint');
    if(!h){
      h=document.createElement('small');
      h.id='bedroomAutoCameraHint';
      h.className='historyHint';
      h.style.display='block';h.style.marginTop='6px';h.style.lineHeight='1.6';
      h.textContent='اختر فقط وضعية الشخص. زاوية السيلفي والمسافة وموضع الهاتف والقص يحددها التطبيق تلقائيًا حسب الوضعية.';
      pf.appendChild(h);
    }
  }

  function cameraRule(p){
    var common='BEDROOM AUTO SELFIE DIRECTOR — ABSOLUTE PRIORITY. The user controls only the body posture. Camera angle, camera height, yaw, pitch, roll, camera-to-face distance, virtual phone position, framing and crop must be chosen automatically for a believable real smartphone front-camera image. Keep the phone-holding arm and phone outside the captured frame. Never distort anatomy to satisfy composition.';
    if(p==='bedroom_seated')return common+' CURRENT POSTURE — SEATED. Choose a natural seated selfie viewpoint near eye level or modestly above, with believable torso and pelvis support and a small casual side offset.';
    if(p==='bedroom_lying')return common+' CURRENT POSTURE — LYING ON THE BED. Choose a physically plausible front-camera viewpoint derived from the supported head and shoulder position, usually modestly above or slightly lateral. Preserve gravity, pillow contact, mattress compression and natural neck support.';
    return common+' CURRENT POSTURE — STANDING. Choose a natural eye-level or slightly-above-eye-level selfie viewpoint with a mild casual side offset and ordinary imperfect framing.';
  }

  function stripManualCamera(text){
    return String(text||'').split('\n').filter(function(line){
      var t=line.trim();
      if(/^SELFIE ANGLE\s*(?:—|:)/i.test(t))return false;
      if(/^SELFIE DISTANCE\s*(?:—|:)/i.test(t))return false;
      if(/^زاوية السيلفي\s*(?:—|:)/i.test(t))return false;
      if(/^مسافة السيلفي\s*(?:—|:)/i.test(t))return false;
      return true;
    }).join('\n').replace(/\n{3,}/g,'\n\n').trim();
  }

  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;

  window.buildFinal=function(){
    var base=oldFinal?oldFinal():'';
    var p=normalizeLegacy(S().pose);
    base=stripManualCamera(base);
    return cameraRule(p)+'\n\n'+base;
  };

  window.buildNegative=function(){
    var base=oldNegative?oldNegative():'';
    var x=['manual bedroom selfie angle overriding automatic camera direction','manual bedroom selfie distance overriding automatic camera direction','camera angle unrelated to selected posture','camera placement requiring distorted anatomy'];
    return (base?base+', ':'')+x.join(', ');
  };

  function boot(){installOptions();hideAutomaticFields();setTimeout(hideAutomaticFields,150)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();