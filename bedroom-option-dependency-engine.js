(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var AUTO='__auto_prompt__';

  var ANGLES={
    high:'bedroom_angle_high',
    veryHigh:'bedroom_angle_very_high',
    low:'bedroom_angle_low',
    eye34:'bedroom_angle_eye_34',
    eyeFront:'bedroom_angle_eye_front',
    overhead:'bedroom_angle_overhead',
    sideBed:'bedroom_angle_side_bed',
    high34:'bedroom_angle_high_34',
    eyeOffset:'bedroom_angle_eye_offset',
    seatedDown:'bedroom_angle_seated_down',
    shoulderSide:'bedroom_angle_shoulder_side',
    dutch:'bedroom_angle_dutch',
    groundLow:'bedroom_angle_ground_low'
  };

  var POSE_ANGLES={
    bedroom_peeking_blanket:[ANGLES.veryHigh,ANGLES.high,ANGLES.eyeFront,ANGLES.eye34,ANGLES.dutch,ANGLES.overhead],
    bedroom_laptop_book_bed:[ANGLES.eyeFront,ANGLES.eye34,ANGLES.high,ANGLES.veryHigh,ANGLES.seatedDown,ANGLES.eyeOffset,ANGLES.dutch],
    bedroom_lying_pillow:[ANGLES.overhead,ANGLES.sideBed,ANGLES.dutch,ANGLES.groundLow,ANGLES.high,ANGLES.eye34,ANGLES.high34],
    bedroom_lying_side:[ANGLES.sideBed,ANGLES.dutch,ANGLES.groundLow,ANGLES.eye34,ANGLES.high34,ANGLES.overhead,ANGLES.shoulderSide],
    bedroom_reclining_pillows:[ANGLES.eye34,ANGLES.high,ANGLES.veryHigh,ANGLES.eyeFront,ANGLES.sideBed,ANGLES.overhead,ANGLES.high34,ANGLES.eyeOffset,ANGLES.dutch],
    bedroom_leaning_headboard:[ANGLES.eye34,ANGLES.eyeFront,ANGLES.high,ANGLES.high34,ANGLES.eyeOffset,ANGLES.seatedDown,ANGLES.dutch],
    bedroom_holding_pillow:[ANGLES.eye34,ANGLES.eyeFront,ANGLES.high,ANGLES.veryHigh,ANGLES.sideBed,ANGLES.eyeOffset,ANGLES.seatedDown,ANGLES.dutch],
    bedroom_crosslegged_bed:[ANGLES.eyeFront,ANGLES.eye34,ANGLES.high,ANGLES.veryHigh,ANGLES.seatedDown,ANGLES.eyeOffset,ANGLES.high34,ANGLES.dutch],
    bedroom_one_knee_bed:[ANGLES.eye34,ANGLES.eyeFront,ANGLES.high,ANGLES.veryHigh,ANGLES.low,ANGLES.eyeOffset,ANGLES.seatedDown,ANGLES.dutch],
    bedroom_sitting_floor:[ANGLES.high,ANGLES.low,ANGLES.groundLow,ANGLES.eye34,ANGLES.eyeFront,ANGLES.high34,ANGLES.eyeOffset,ANGLES.shoulderSide,ANGLES.dutch],
    bedroom_sitting_edge:[ANGLES.eyeFront,ANGLES.eye34,ANGLES.high,ANGLES.veryHigh,ANGLES.low,ANGLES.groundLow,ANGLES.eyeOffset,ANGLES.seatedDown,ANGLES.shoulderSide,ANGLES.dutch],
    bedroom_standing_curtain:[ANGLES.eyeFront,ANGLES.eye34,ANGLES.high,ANGLES.low,ANGLES.high34,ANGLES.eyeOffset,ANGLES.shoulderSide,ANGLES.dutch],
    bedroom_standing_wardrobe:[ANGLES.eyeFront,ANGLES.eye34,ANGLES.high,ANGLES.low,ANGLES.high34,ANGLES.eyeOffset,ANGLES.shoulderSide,ANGLES.dutch],
    bedroom_standing_beside:[ANGLES.eyeFront,ANGLES.eye34,ANGLES.high,ANGLES.low,ANGLES.high34,ANGLES.eyeOffset,ANGLES.shoulderSide,ANGLES.dutch]
  };

  var ANGLE_POSE_FALLBACK={
    bedroom_angle_overhead:'bedroom_lying_pillow',
    bedroom_angle_side_bed:'bedroom_reclining_pillows',
    bedroom_angle_seated_down:'bedroom_sitting_edge',
    bedroom_angle_ground_low:'bedroom_sitting_floor',
    bedroom_angle_very_high:'bedroom_sitting_edge',
    bedroom_angle_dutch:'bedroom_standing_beside',
    bedroom_angle_low:'bedroom_standing_beside',
    bedroom_angle_high:'bedroom_standing_beside',
    bedroom_angle_high_34:'bedroom_standing_beside',
    bedroom_angle_eye_34:'bedroom_standing_beside',
    bedroom_angle_eye_front:'bedroom_standing_beside',
    bedroom_angle_eye_offset:'bedroom_standing_beside',
    bedroom_angle_shoulder_side:'bedroom_standing_beside'
  };

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

  function handValue(){
    var s=S();
    return val(s.bedroomHandPose||s.freeHandPose||AUTO)||AUTO;
  }

  function handClass(v){
    var t=val(v).toLowerCase();
    if(!t||t===AUTO||/^auto\b/.test(t)||/تلقائي/.test(t))return 'auto';
    if(/pillow|blanket|وسادة|وساده|بطاني/.test(t))return 'pillow';
    if(/floor|الأرض|الارض/.test(t))return 'floor';
    if(/thigh|knee|فخذ|ركبة|ركبه/.test(t))return 'seated';
    if(/bed beside|resting.*bed|على السرير/.test(t))return 'bed';
    if(/by the side|relaxed.*side|متدلية|متدلي/.test(t))return 'standing';
    return 'universal';
  }

  function handCompatible(p,v){
    var c=handClass(v);
    if(c==='auto'||c==='universal')return true;
    if(c==='pillow')return /holding_pillow|peeking_blanket|reclining_pillows|crosslegged_bed|one_knee_bed/.test(p);
    if(c==='floor')return p==='bedroom_sitting_floor';
    if(c==='seated')return /sitting_edge|sitting_floor|holding_pillow|laptop_book_bed|crosslegged_bed|one_knee_bed|leaning_headboard/.test(p);
    if(c==='standing')return /standing_/.test(p);
    if(c==='bed')return /sitting_edge|reclining_pillows|lying_pillow|lying_side|holding_pillow|peeking_blanket|laptop_book_bed|crosslegged_bed|one_knee_bed|leaning_headboard/.test(p);
    return true;
  }

  function poseForHand(v){
    var c=handClass(v);
    if(c==='pillow')return 'bedroom_holding_pillow';
    if(c==='floor')return 'bedroom_sitting_floor';
    if(c==='seated'||c==='bed')return 'bedroom_sitting_edge';
    if(c==='standing')return 'bedroom_standing_beside';
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
    if(s.pose!==p){pushCorrection(fixes,'pose',s.pose,p,'تصحيح وضعية غرفة النوم');s.pose=p;}

    var a=val(s.angle),allowed=allowedAngles(p);
    if(changedKey==='angle'&&a&&!includes(allowed,a)){
      var np=ANGLE_POSE_FALLBACK[a]||p;
      pushCorrection(fixes,'pose',p,np,'الزاوية الأخيرة تتطلب وضعية متوافقة');
      s.pose=np;p=np;allowed=allowedAngles(p);
      if(!includes(allowed,a)){
        pushCorrection(fixes,'angle',a,allowed[0],'تصحيح الزاوية إلى أقرب خيار ممكن');
        s.angle=allowed[0];a=allowed[0];
      }
    }else if(a&&!includes(allowed,a)){
      pushCorrection(fixes,'angle',a,allowed[0],'الوضعية الأخيرة غيّرت الزاوية إلى خيار متوافق');
      s.angle=allowed[0];a=allowed[0];
    }else if(!a){s.angle=allowed[0];a=s.angle;}

    p=currentPose();
    var hv=handValue();
    if(changedKey==='bedroomHandPose'||changedKey==='freeHandPose'){
      if(!handCompatible(p,hv)){
        var hp=poseForHand(hv);
        pushCorrection(fixes,'pose',p,hp,'وضعية اليد الأخيرة تتطلب وضعية جسم متوافقة');
        s.pose=hp;p=hp;
        var pa=allowedAngles(p);
        if(!includes(pa,val(s.angle))){
          pushCorrection(fixes,'angle',s.angle,pa[0],'تصحيح الزاوية بعد تغيير وضعية الجسم');
          s.angle=pa[0];
        }
      }
    }else if(!handCompatible(p,hv)){
      pushCorrection(fixes,'bedroomHandPose',hv,AUTO,'وضعية الجسم الأخيرة لا تناسب وضع اليد السابق');
      s.bedroomHandPose=AUTO;hv=AUTO;
    }
    s.freeHandPose=hv;

    if(fixes.length){
      lastCorrection=fixes.map(function(f){return f.reason}).join(' • ');
      saveNow();
    }
    busy=false;
    return fixes;
  }

  function statusText(){
    return lastCorrection?'آخر تصحيح تلقائي: '+lastCorrection:'منع التعارض فعال: آخر اختيار يبقى، والخيار المتعارض فقط يتغير إلى قيمة ممكنة.';
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
      n.style.display='block';n.style.marginTop='6px';n.style.lineHeight='1.6';
      field.appendChild(n);
    }
    n.textContent=statusText();
  }

  function resolveUserChoice(key){
    setTimeout(function(){
      var fixes=reconcile(key);
      if(fixes.length){try{if(typeof window.renderPickers==='function')window.renderPickers()}catch(e){};autoRefreshNow();}
      updateStatus();
    },0);
  }

  function bindUserChanges(){
    if(document.documentElement.dataset.bedroomDependencyBound==='2')return;
    document.documentElement.dataset.bedroomDependencyBound='2';
    document.addEventListener('click',function(e){
      var p=e.target&&e.target.closest?e.target.closest('.picker[data-key]'):null;
      if(!p)return;
      var key=p.getAttribute('data-key');
      if(/^(pose|angle|bedroomHandPose|freeHandPose)$/.test(key||''))resolveUserChoice(key);
    });
  }

  if(typeof previousRender==='function'){
    window.renderPickers=function(){
      var r=previousRender.apply(this,arguments);
      if(!busy){var fixes=reconcile(null);if(fixes.length)previousRender.apply(this,arguments)}
      updateStatus();
      return r;
    };
  }

  window.buildFinal=function(){
    reconcile(null);
    var base=previousFinal?previousFinal():'';
    var s=S();
    return 'BEDROOM OPTION DEPENDENCY LOCK — REQUIRED. The selected pose, selected selfie angle, and selected free-hand pose have already been reconciled into one physically compatible combination before prompt generation. Preserve these final corrected values exactly: POSE: '+val(s.pose)+'. ANGLE: '+val(s.angle)+'. FREE HAND: '+handValue()+'. Do not resurrect an older incompatible selection or combine alternatives.\n\n'+base;
  };

  window.buildNegative=function(){
    reconcile(null);
    var base=previousNegative?previousNegative():'';
    var x=['old incompatible bedroom option restored','free-hand pose incompatible with body pose','selected selfie angle incompatible with body pose','multiple conflicting pose alternatives','multiple conflicting angle alternatives','very-low selfie used with unreachable body pose','very-high selfie used with unreachable body pose','Dutch-angle selection replaced by a different angle','peeking pose replaced by ordinary lying pose','laptop/book pose replaced by unrelated seated pose'];
    return (base?base+', ':'')+x.join(', ');
  };

  function boot(){reconcile(null);bindUserChanges();updateStatus();setTimeout(updateStatus,250);setTimeout(updateStatus,700)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();