(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var AUTO='__auto_prompt__';
  var LIGHT_AUTO='auto bedroom prompt';
  var ARM_SUBTLE='bedroom_arm_subtle';
  var ARM_HIDDEN='bedroom_arm_hidden';
  var ARM_AUTO='bedroom_arm_auto';
  var FRAME_AUTO='';
  var FRAME_HEAD='casual head-and-shoulders selfie crop';
  var FRAME_TORSO='casual face-and-upper-torso selfie crop';
  var FRAME_UPPER='natural slightly off-center upper-body selfie crop';
  var HOLD_PILLOW='free hand gently holding a pillow or blanket';

  var ANGLES={
    high:'bedroom_angle_high',
    low:'bedroom_angle_low',
    eye34:'bedroom_angle_eye_34',
    eyeFront:'bedroom_angle_eye_front',
    overhead:'bedroom_angle_overhead',
    sideBed:'bedroom_angle_side_bed'
  };

  var POSE_ANGLES={
    bedroom_lying_pillow:[ANGLES.overhead,ANGLES.sideBed,ANGLES.high,ANGLES.eye34],
    bedroom_reclining_pillows:[ANGLES.eye34,ANGLES.high,ANGLES.eyeFront,ANGLES.sideBed,ANGLES.overhead],
    bedroom_holding_pillow:[ANGLES.eye34,ANGLES.eyeFront,ANGLES.high,ANGLES.sideBed],
    bedroom_sitting_floor:[ANGLES.high,ANGLES.low,ANGLES.eye34,ANGLES.eyeFront],
    bedroom_sitting_edge:[ANGLES.eyeFront,ANGLES.eye34,ANGLES.high,ANGLES.low],
    bedroom_standing_beside:[ANGLES.eyeFront,ANGLES.eye34,ANGLES.high,ANGLES.low]
  };

  var ANGLE_POSE_FALLBACK={
    bedroom_angle_overhead:'bedroom_lying_pillow',
    bedroom_angle_side_bed:'bedroom_reclining_pillows',
    bedroom_angle_low:'bedroom_standing_beside',
    bedroom_angle_high:'bedroom_standing_beside',
    bedroom_angle_eye_34:'bedroom_standing_beside',
    bedroom_angle_eye_front:'bedroom_standing_beside'
  };

  var DAY_LIGHTING=[
    'realistic side-window daylight through sheer curtain',
    'realistic front-window daylight',
    'soft diffused overcast bedroom daylight',
    'soft morning sunlight through curtains',
    'neutral-white room light plus faint cool window daylight'
  ];

  var NIGHT_LIGHTING=[
    'soft low-intensity neutral-white nighttime lighting',
    'warm bedside lamp only',
    'neutral-white ceiling plus warm bedside lamp',
    'phone screen weak face light only',
    'dim hallway spill through half-open door',
    'streetlight spill through curtain',
    'near-total darkness bedroom'
  ];

  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;
  var previousRender=window.renderPickers;
  var busy=false;
  var lastCorrection='';

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function q(s){return document.querySelector(s)}
  function saveNow(){try{if(typeof save==='function')save()}catch(e){}}
  function autoRefreshNow(){try{if(typeof autoRefresh==='function')autoRefresh()}catch(e){}}
  function val(x){return String(x==null?'':x)}
  function includes(a,v){return a.indexOf(v)!==-1}
  function currentPose(){var p=val(S().pose);return POSE_ANGLES[p]?p:'bedroom_standing_beside'}
  function allowedAngles(p){return POSE_ANGLES[p]||POSE_ANGLES.bedroom_standing_beside}

  function timeMode(){
    var t=val(S().time).toLowerCase();
    if(/ليل|ليلاً|ليلا|مساء|مساءً|منتصف الليل|بعد منتصف الليل|night|evening|midnight|late night/.test(t))return 'night';
    if(/صباح|صباحًا|صباحا|نهار|نهارًا|نهارا|ظهراً|ظهرا|ظهر|عصر|الفجر|morning|day|daytime|noon|afternoon|sunrise/.test(t))return 'day';
    return 'any';
  }

  function freeHandClass(v){
    var t=val(v).toLowerCase();
    if(!t||t===AUTO||/^auto\b/.test(t)||/تلقائي/.test(t))return 'auto';
    if(/pillow|blanket|وسادة|بطاني/.test(t))return 'pillow';
    if(/floor|الأرض|الارض/.test(t))return 'floor';
    if(/thigh|knee|فخذ|ركبة/.test(t))return 'seated';
    if(/by the side|متدلية|متدلي/.test(t))return 'standing';
    if(/bed beside|على السرير بجانب/.test(t))return 'bed';
    return 'universal';
  }

  function freeHandCompatible(p,v){
    var c=freeHandClass(v);
    if(c==='auto'||c==='universal')return true;
    if(p==='bedroom_holding_pillow')return c==='pillow';
    if(c==='pillow')return p==='bedroom_holding_pillow';
    if(c==='floor')return p==='bedroom_sitting_floor';
    if(c==='seated')return p==='bedroom_sitting_edge'||p==='bedroom_sitting_floor'||p==='bedroom_holding_pillow';
    if(c==='standing')return p==='bedroom_standing_beside';
    if(c==='bed')return p==='bedroom_sitting_edge'||p==='bedroom_reclining_pillows'||p==='bedroom_lying_pillow'||p==='bedroom_holding_pillow';
    return true;
  }

  function poseForFreeHand(v){
    var c=freeHandClass(v);
    if(c==='pillow')return 'bedroom_holding_pillow';
    if(c==='floor')return 'bedroom_sitting_floor';
    if(c==='seated')return 'bedroom_sitting_edge';
    if(c==='standing')return 'bedroom_standing_beside';
    if(c==='bed')return 'bedroom_sitting_edge';
    return currentPose();
  }

  function pushCorrection(list,key,from,to,reason){
    if(val(from)===val(to))return;
    list.push({key:key,from:val(from),to:val(to),reason:reason});
  }

  function reconcile(changedKey){
    if(busy)return [];
    busy=true;
    var s=S(),fixes=[];
    var p=currentPose();
    if(s.pose!==p){pushCorrection(fixes,'pose',s.pose,p,'تطبيع وضعية غرفة النوم');s.pose=p;}

    var a=val(s.angle);
    var allowed=allowedAngles(p);

    if(changedKey==='angle'){
      if(a&&!includes(allowed,a)){
        var newPose=ANGLE_POSE_FALLBACK[a]||p;
        pushCorrection(fixes,'pose',p,newPose,'الزاوية الأخيرة تتطلب وضعية متوافقة');
        s.pose=newPose;p=newPose;allowed=allowedAngles(p);
        if(a&&!includes(allowed,a)){
          var correctedAngle=allowed[0];
          pushCorrection(fixes,'angle',a,correctedAngle,'تعذر الحفاظ على الزاوية مع أي وضعية صالحة');
          s.angle=correctedAngle;a=correctedAngle;
        }
      }
    }else if(a&&!includes(allowed,a)){
      var firstAngle=allowed[0];
      pushCorrection(fixes,'angle',a,firstAngle,'الوضعية الأخيرة لها زوايا محددة');
      s.angle=firstAngle;a=firstAngle;
    }else if(!a){
      s.angle=allowed[0];a=s.angle;
    }

    var fh=val(s.freeHandPose||AUTO);
    p=currentPose();
    if(changedKey==='freeHandPose'){
      if(!freeHandCompatible(p,fh)){
        var handPose=poseForFreeHand(fh);
        pushCorrection(fixes,'pose',p,handPose,'وضعية اليد الحرة الأخيرة تتطلب وضعية جسم متوافقة');
        s.pose=handPose;p=handPose;
        var pa=allowedAngles(p);
        if(!includes(pa,val(s.angle))){
          pushCorrection(fixes,'angle',s.angle,pa[0],'تصحيح الزاوية بعد تغيير الوضعية');
          s.angle=pa[0];
        }
      }
    }else{
      if(p==='bedroom_holding_pillow'&&freeHandClass(fh)!=='pillow'){
        pushCorrection(fixes,'freeHandPose',fh,HOLD_PILLOW,'وضعية حمل الوسادة تتطلب اليد الحرة على الوسادة أو البطانية');
        s.freeHandPose=HOLD_PILLOW;fh=HOLD_PILLOW;
      }else if(!freeHandCompatible(p,fh)){
        pushCorrection(fixes,'freeHandPose',fh,AUTO,'الوضعية الأخيرة لا تسمح بإيماءة اليد الحالية');
        s.freeHandPose=AUTO;fh=AUTO;
      }
    }

    var arm=val(s.selfieArmVisibility||ARM_SUBTLE);
    if(arm!==ARM_SUBTLE&&arm!==ARM_HIDDEN&&arm!==ARM_AUTO){arm=ARM_SUBTLE;s.selfieArmVisibility=arm;}
    var frame=val(s.frame);

    if(changedKey==='selfieArmVisibility'){
      if(arm===ARM_HIDDEN&&frame===FRAME_UPPER){
        pushCorrection(fixes,'frame',frame,FRAME_TORSO,'إخفاء ذراع التصوير يحتاج كادرًا أكثر أمانًا');
        s.frame=FRAME_TORSO;frame=FRAME_TORSO;
      }
    }else if(changedKey==='frame'){
      if(arm===ARM_HIDDEN&&frame===FRAME_UPPER){
        pushCorrection(fixes,'selfieArmVisibility',arm,ARM_SUBTLE,'الكادر الأخير واسع ويحتاج ظهورًا خفيفًا طبيعيًا للذراع');
        s.selfieArmVisibility=ARM_SUBTLE;arm=ARM_SUBTLE;
      }
    }else if(arm===ARM_HIDDEN&&frame===FRAME_UPPER){
      pushCorrection(fixes,'frame',frame,FRAME_TORSO,'إزالة تعارض محفوظ بين الكادر وإخفاء الذراع');
      s.frame=FRAME_TORSO;frame=FRAME_TORSO;
    }

    var tm=timeMode();
    var light=val(s.bedroomLighting||LIGHT_AUTO);
    if(changedKey==='time'){
      if(tm==='day'&&includes(NIGHT_LIGHTING,light)){
        pushCorrection(fixes,'bedroomLighting',light,LIGHT_AUTO,'الوقت النهاري لا يقبل وضع إنارة ليلي صريح');
        s.bedroomLighting=LIGHT_AUTO;
      }else if(tm==='night'&&includes(DAY_LIGHTING,light)){
        pushCorrection(fixes,'bedroomLighting',light,LIGHT_AUTO,'الوقت الليلي لا يقبل ضوء نهار صريح');
        s.bedroomLighting=LIGHT_AUTO;
      }
    }else if(changedKey==='bedroomLighting'){
      if(includes(DAY_LIGHTING,light)&&tm==='night'){
        pushCorrection(fixes,'time',s.time,'نهار','خيار الإنارة الأخير نهاري');
        s.time='نهار';
      }else if(includes(NIGHT_LIGHTING,light)&&tm==='day'){
        pushCorrection(fixes,'time',s.time,'ليل','خيار الإنارة الأخير ليلي');
        s.time='ليل';
      }
    }else{
      if(tm==='day'&&includes(NIGHT_LIGHTING,light)){
        pushCorrection(fixes,'bedroomLighting',light,LIGHT_AUTO,'إزالة تعارض محفوظ بين الوقت والإنارة');
        s.bedroomLighting=LIGHT_AUTO;
      }else if(tm==='night'&&includes(DAY_LIGHTING,light)){
        pushCorrection(fixes,'bedroomLighting',light,LIGHT_AUTO,'إزالة تعارض محفوظ بين الوقت والإنارة');
        s.bedroomLighting=LIGHT_AUTO;
      }
    }

    if(fixes.length){
      lastCorrection=fixes.map(function(f){return f.reason}).join(' • ');
      saveNow();
    }
    busy=false;
    return fixes;
  }

  function statusText(){
    return lastCorrection?'آخر تصحيح تلقائي: '+lastCorrection:'النظام مترابط: آخر اختيار صريح يبقى، وأي خيار آخر متعارض يتغير تلقائيًا إلى قيمة متوافقة.';
  }

  function updateStatus(){
    var pose=q('.picker[data-key="pose"]');
    var field=pose&&pose.closest('.field');
    if(!field)return;
    var n=q('#bedroomDependencyStatus');
    if(!n){
      n=document.createElement('small');
      n.id='bedroomDependencyStatus';
      n.className='historyHint';
      n.style.display='block';
      n.style.marginTop='6px';
      n.style.lineHeight='1.6';
      field.appendChild(n);
    }
    n.textContent=statusText();
  }

  function rerenderAfterFix(fixes){
    if(!fixes||!fixes.length){updateStatus();return;}
    try{if(typeof window.renderPickers==='function')window.renderPickers()}catch(e){}
    updateStatus();
    autoRefreshNow();
  }

  function resolveUserChoice(key){
    setTimeout(function(){
      var fixes=reconcile(key);
      rerenderAfterFix(fixes);
    },0);
  }

  function bindUserChanges(){
    if(document.documentElement.dataset.bedroomDependencyBound==='1')return;
    document.documentElement.dataset.bedroomDependencyBound='1';

    document.addEventListener('click',function(e){
      var p=e.target&&e.target.closest?e.target.closest('.picker[data-key]'):null;
      if(!p)return;
      var key=p.getAttribute('data-key');
      if(/^(pose|angle|frame|selfieArmVisibility|freeHandPose|bedroomLighting)$/.test(key||''))resolveUserChoice(key);
    });

    document.addEventListener('change',function(e){
      var t=e.target;if(!t)return;
      if(t.id==='time'||t.getAttribute&&t.getAttribute('data-key')==='time')resolveUserChoice('time');
    });
    document.addEventListener('input',function(e){
      var t=e.target;if(!t)return;
      if(t.id==='time'||t.getAttribute&&t.getAttribute('data-key')==='time')resolveUserChoice('time');
    });
  }

  if(typeof previousRender==='function'){
    window.renderPickers=function(){
      var r=previousRender.apply(this,arguments);
      if(!busy){var fixes=reconcile(null);if(fixes.length){previousRender.apply(this,arguments)}}
      updateStatus();
      return r;
    };
  }

  function dependencyRule(){
    return 'BEDROOM LIVE OPTION DEPENDENCY RULE — ABSOLUTE. The application has already normalized the current bedroom controls into one mutually compatible state before this prompt was built. Treat the CURRENT values as authoritative. Never resurrect a stale earlier option that the dependency engine replaced. If a remembered, generic, reference-derived, or lower-priority instruction conflicts with a current control, discard that older conflicting instruction. The most recent explicit user choice is preserved by the application and dependent conflicting controls are automatically corrected before generation.';
  }

  window.buildFinal=function(){
    var fixes=reconcile(null);
    if(fixes.length)saveNow();
    var base=previousFinal?previousFinal():'';
    return dependencyRule()+'\n\n'+base;
  };

  window.buildNegative=function(){
    reconcile(null);
    var base=previousNegative?previousNegative():'';
    var x=['stale bedroom option restored after automatic correction','old conflicting option overriding current control','two mutually incompatible bedroom control values','Gemini reviving a replaced pose angle frame arm lighting or free-hand value'];
    return (base?base+', ':'')+x.join(', ');
  };

  function boot(){
    reconcile(null);
    bindUserChanges();
    updateStatus();
    setTimeout(updateStatus,250);
    setTimeout(updateStatus,700);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();