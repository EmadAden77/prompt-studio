(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var AUTO='__auto_prompt__';
  var CAMERA='Xiaomi 15 Ultra front camera';

  var FRAME_OPTIONS=[
    ['','تلقائي حسب الوضعية'],
    ['casual head-and-shoulders selfie crop','رأس وكتفان بشكل عفوي'],
    ['casual face-and-upper-torso selfie crop','الوجه وأعلى الجذع'],
    ['natural slightly off-center upper-body selfie crop','أعلى الجسم خارج المركز قليلًا']
  ];

  var GAZE_OPTIONS=[
    ['','تلقائي حسب المشهد'],
    ['looking directly into the front camera lens','ينظر إلى عدسة الكاميرا'],
    ['looking naturally at the phone screen','ينظر طبيعيًا إلى شاشة الهاتف']
  ];

  var FREE_COMMON=[
    [AUTO,'تلقائي حسب الوضعية'],
    ['free hand resting naturally on the chest','اليد الحرة على الصدر'],
    ['free hand resting naturally on the abdomen','اليد الحرة على البطن'],
    ['free hand touching the hair naturally','اليد الحرة تلامس الشعر'],
    ['free hand lightly touching the beard or chin','اليد الحرة تلامس اللحية أو الذقن'],
    ['free hand resting behind the neck','اليد الحرة خلف الرقبة'],
    ['free hand lightly holding the shirt fabric','اليد الحرة تمسك القماش بخفة']
  ];

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function q(s){return document.querySelector(s)}
  function saveNow(){try{if(typeof save==='function')save()}catch(e){}}
  function pose(){var p=String(S().pose||'').toLowerCase();if(/lying|مستلقي/.test(p))return 'lying';if(/seated|sitting|جالس/.test(p))return 'seated';return 'standing'}
  function allowedValues(list){return list.map(function(x){return x[0]})}

  function freeOptions(){
    var p=pose(),x=FREE_COMMON.slice();
    if(p==='standing'){
      x.push(['free hand relaxed naturally by the side','اليد الحرة متدلية طبيعيًا']);
    }else if(p==='seated'){
      x.push(['free hand resting naturally on the thigh','اليد الحرة على الفخذ']);
      x.push(['free hand resting naturally on the knee while seated','اليد الحرة على الركبة']);
      x.push(['free hand resting naturally on the bed beside the body','اليد الحرة على السرير بجانب الجسم']);
    }else{
      x.push(['free hand resting naturally on the bed beside the body','اليد الحرة على السرير بجانب الجسم']);
      x.push(['free hand resting loosely over the torso','اليد الحرة مسترخية فوق الجذع']);
    }
    return x;
  }

  function syncState(){
    var s=S();
    s.camera=CAMERA;
    s.angle='';
    s.distance='';
    s.selfieBodyPose=AUTO;
    s.lighting='';
    s.realisticLighting='';
    s.background='';
    s.condition='';
    s.vehicleLock=false;
    s.roomLock=true;
    if(!String(s.location||'').trim()||/bedroom|غرفة النوم|غرفه النوم/i.test(String(s.location||'')))s.location='غرفة النوم';

    var fv=allowedValues(FRAME_OPTIONS);
    if(fv.indexOf(String(s.frame||''))===-1)s.frame='';
    var gv=allowedValues(GAZE_OPTIONS);
    if(gv.indexOf(String(s.gaze||''))===-1)s.gaze='';
    var fh=allowedValues(freeOptions());
    if(fh.indexOf(String(s.freeHandPose||AUTO))===-1)s.freeHandPose=AUTO;
  }

  function syncOptions(){
    if(typeof OPTIONS!=='object'||!OPTIONS)return;
    OPTIONS.frame=FRAME_OPTIONS.slice();
    OPTIONS.gaze=GAZE_OPTIONS.slice();
    OPTIONS.freeHandPose=freeOptions();
    OPTIONS.selfieBodyPose=[[AUTO,'تلقائي حسب وضعية الشخص']];
    syncState();
  }

  function hideField(key){var p=q('.picker[data-key="'+key+'"]');var f=p&&p.closest('.field');if(f)f.style.display='none'}

  function installUI(){
    syncState();
    var camera=q('#camera');
    if(camera){
      camera.value=CAMERA;
      camera.readOnly=true;
      camera.setAttribute('aria-readonly','true');
      var cf=camera.closest('.field');
      if(cf){
        var lab=cf.querySelector('label');if(lab)lab.textContent='الكاميرا الأساسية';
        if(!q('#bedroomFixedCameraHint')){
          var h=document.createElement('small');h.id='bedroomFixedCameraHint';h.className='historyHint';h.style.display='block';h.style.marginTop='6px';h.style.lineHeight='1.6';
          h.textContent='ثابت في غرفة النوم: Xiaomi 15 Ultra بالكاميرا الأمامية.';
          cf.appendChild(h);
        }
      }
    }

    hideField('angle');
    hideField('distance');
    hideField('selfieBodyPose');
    hideField('lighting');
    hideField('realisticLighting');
    hideField('background');
    hideField('condition');

    var posePicker=q('.picker[data-key="pose"]');
    var pf=posePicker&&posePicker.closest('.field');
    if(pf&&!q('#bedroomConflictStatus')){
      var n=document.createElement('small');n.id='bedroomConflictStatus';n.className='historyHint';n.style.display='block';n.style.marginTop='6px';n.style.lineHeight='1.6';
      n.textContent='منع التعارض فعال: الزاوية والمسافة والكادر وهندسة السيلفي تُحل تلقائيًا حسب الوضعية.';
      pf.appendChild(n);
    }

    var fh=q('.picker[data-key="freeHandPose"]');
    var ff=fh&&fh.closest('.field');
    if(ff){var fl=ff.querySelector('label');if(fl)fl.textContent='وضعية اليد الحرة المتوافقة';}
    saveNow();
  }

  var previousRender=window.renderPickers;
  if(typeof previousRender==='function'){
    window.renderPickers=function(){
      syncOptions();
      previousRender();
      installUI();
    };
  }

  function stripHiddenControlLines(text){
    return String(text||'').split('\n').filter(function(line){
      var t=line.trim();
      if(/^SELFIE ANGLE\s*(?:—|:)/i.test(t))return false;
      if(/^SELFIE DISTANCE\s*(?:—|:)/i.test(t))return false;
      if(/^LIGHTING\s*(?:—|:)/i.test(t))return false;
      if(/^BACKGROUND\s*(?:—|:)/i.test(t))return false;
      if(/^IMAGE CONDITION\s*(?:—|:)/i.test(t))return false;
      if(/^BODY POSE\s*(?:—|:)/i.test(t))return false;
      return true;
    }).join('\n').replace(/\n{3,}/g,'\n\n').trim();
  }

  function conflictPolicy(){
    var s=S(),p=pose();
    var fh=String(s.freeHandPose||AUTO);
    var free=fh===AUTO?'automatic and posture-compatible':fh;
    return 'BEDROOM CONTROL CONFLICT POLICY — MANDATORY. Resolve the bedroom controls as one coherent system. Priority order: explicit user selections; identity and 193 cm / 83 kg body lock; selected main posture; true self-taken selfie mechanics; selected clothing; dedicated bedroom lighting; dedicated bedroom clutter; Xiaomi 15 Ultra front-camera behavior; then realism details. Hidden or disabled generic controls must contribute no instruction. MAIN POSTURE: '+p+'. CAMERA: '+CAMERA+'. FREE HAND: '+free+'. The camera angle and distance are automatic. The camera-holding arm is physically extended to take the selfie but remains outside the captured frame. The dedicated bedroom-lighting selection is the only lighting-control authority; time of day may alter exposure, ambient spill, white balance and noise but must not invent a conflicting light source. If any lower-priority instruction conflicts with a higher-priority control, discard the lower-priority instruction rather than averaging the two.';
  }

  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;

  window.buildFinal=function(){
    syncOptions();
    var base=oldFinal?oldFinal():'';
    base=stripHiddenControlLines(base);
    return conflictPolicy()+'\n\n'+base;
  };

  window.buildNegative=function(){
    syncOptions();
    var base=oldNegative?oldNegative():'';
    var x=[
      'conflicting bedroom controls','hidden generic lighting overriding bedroom lighting','hidden background control overriding locked bedroom','hidden image-condition control overriding bedroom scene','manual selfie angle overriding automatic bedroom camera','manual selfie distance overriding automatic bedroom camera','secondary body-pose control overriding main posture','free-hand gesture incompatible with selected posture','non-Xiaomi camera substitution in bedroom','camera field changing away from Xiaomi 15 Ultra front camera','time of day inventing a conflicting light source','lower-priority realism rule overriding explicit user selection'
    ];
    return (base?base+', ':'')+x.join(', ');
  };

  function boot(){syncOptions();if(typeof window.renderPickers==='function')window.renderPickers();else installUI();setTimeout(installUI,120);setTimeout(installUI,500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();