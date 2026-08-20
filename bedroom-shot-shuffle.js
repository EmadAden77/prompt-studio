(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;
  var lastKey='';

  /*
    SAFE SHUFFLE ONLY.
    Deliberately excludes very-high, overhead, ground-low, side-bed,
    seated-down and Dutch-angle combinations from random selection.
    Those angles remain available manually elsewhere in the app.
  */
  var SHOTS=[
    {pose:'bedroom_standing_beside',angle:'bedroom_angle_eye_34',location:'beside the bed in the clear walking area'},
    {pose:'bedroom_standing_center',angle:'bedroom_angle_high',location:'in the middle of the bedroom with the bed naturally behind the subject'},
    {pose:'bedroom_standing_wall_back',angle:'bedroom_angle_eye_front',location:'against an existing clear bedroom wall'},
    {pose:'bedroom_standing_doorframe',angle:'bedroom_angle_eye_offset',location:'at the existing near-left bedroom doorway'},
    {pose:'bedroom_standing_dresser',angle:'bedroom_angle_high_34',location:'in front of the existing right-side dresser with believable clearance'},
    {pose:'bedroom_standing_corner',angle:'bedroom_angle_eye_offset',location:'in a real clear corner or edge zone of the canonical bedroom'},
    {pose:'bedroom_standing_foot_bed',angle:'bedroom_angle_high_34',location:'at the accessible foot/end of the bed'},
    {pose:'bedroom_standing_head_wall',angle:'bedroom_angle_eye_34',location:'close to an existing bedroom wall with gentle head contact'},
    {pose:'bedroom_standing_wardrobe_door',angle:'bedroom_angle_shoulder_side',location:'partly behind one real opened wardrobe door with believable clearance'},
    {pose:'bedroom_standing_curtain',angle:'bedroom_angle_high',location:'near the canonical far-wall curtain and window area'},
    {pose:'bedroom_standing_wardrobe',angle:'bedroom_angle_eye_34',location:'near the existing wardrobe and dressing area'},
    {pose:'bedroom_sitting_edge',angle:'bedroom_angle_eye_front',location:'seated at the edge of the canonical bed'},
    {pose:'bedroom_leaning_headboard',angle:'bedroom_angle_eye_34',location:'on the bed leaning against the existing headboard or supporting pillows'},
    {pose:'bedroom_holding_pillow',angle:'bedroom_angle_eye_front',location:'on the canonical bed while naturally holding the existing pillow or blanket'},
    {pose:'bedroom_laptop_book_bed',angle:'bedroom_angle_eye_34',location:'seated on the canonical bed with the selected single laptop or book context'},
    {pose:'bedroom_standing_beside',angle:'bedroom_angle_low',location:'beside the bed in the clear walking area',low:true},
    {pose:'bedroom_standing_wardrobe',angle:'bedroom_angle_low',location:'near the existing wardrobe and dressing area',low:true}
  ];

  var FORBIDDEN_RANDOM_ANGLES={
    bedroom_angle_very_high:1,
    bedroom_angle_overhead:1,
    bedroom_angle_ground_low:1,
    bedroom_angle_side_bed:1,
    bedroom_angle_seated_down:1,
    bedroom_angle_dutch:1
  };

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function saveNow(){try{if(typeof save==='function')save()}catch(e){}}
  function refreshNow(){try{if(typeof autoRefresh==='function')autoRefresh()}catch(e){}}
  function val(x){return String(x==null?'':x)}
  function currentHand(){var s=S();return val(s.bedroomHandPose||s.freeHandPose||'__auto_prompt__').toLowerCase()}
  function currentCrop(){return val(S().bedroomSelfieCrop||'bedroom_crop_auto_hidden_arm')}

  function handCompatible(pose){
    var t=currentHand();
    if(!t||t==='__auto_prompt__'||/^auto\b/.test(t)||/تلقائي/.test(t))return true;
    if(/pillow|blanket|وسادة|وساده|بطاني/.test(t))return /holding_pillow|leaning_headboard|sitting_edge/.test(pose);
    if(/thigh|knee|فخذ|ركبة|ركبه/.test(t))return /sitting_edge|laptop_book_bed|leaning_headboard/.test(pose);
    if(/by the side|relaxed.*side|متدلية|متدلي|pants pocket|front pants pocket|resting naturally on the hip|house or car keys/.test(t))return /^bedroom_standing_/.test(pose);
    if(/bed beside|resting.*bed|على السرير/.test(t))return /sitting_edge|holding_pillow|laptop_book_bed|leaning_headboard/.test(pose);
    if(/bedside table|nightstand/.test(t))return /standing_beside|sitting_edge/.test(pose);
    if(/bed headboard|bed frame/.test(t))return /leaning_headboard|sitting_edge/.test(pose);
    if(/partially open book|folded magazine/.test(t))return /sitting_edge|leaning_headboard|laptop_book_bed/.test(pose);
    if(/half-empty plastic water bottle|clear glass of water with ice|metal soda can/.test(t))return /^bedroom_standing_/.test(pose)||/sitting_edge|leaning_headboard|laptop_book_bed/.test(pose);
    return true;
  }

  function cropCompatible(x){
    var c=currentCrop();
    if(FORBIDDEN_RANDOM_ANGLES[x.angle])return false;
    if(c==='bedroom_crop_low_tight')return x.angle==='bedroom_angle_low';
    if(x.angle==='bedroom_angle_low')return c==='bedroom_crop_auto_hidden_arm'||c==='bedroom_crop_tight_candid'||c==='bedroom_crop_shoulders_up';
    return true;
  }

  function armSafe(x){
    if(FORBIDDEN_RANDOM_ANGLES[x.angle])return false;
    if(/lying_|reclining_|peeking_|crosslegged_|one_knee_/.test(x.pose))return false;
    if(x.angle==='bedroom_angle_low'&&!x.low)return false;
    return true;
  }

  function scoreShot(x){
    var s=S(),score=0;
    if(x.pose!==val(s.pose))score++;
    if(x.angle!==val(s.angle))score++;
    if(x.location!==val(s.bedroomShotLocation))score++;
    return score;
  }

  function candidates(){
    var a=SHOTS.filter(function(x){return armSafe(x)&&handCompatible(x.pose)&&cropCompatible(x)});
    return a;
  }

  function choose(){
    var a=candidates();
    if(!a.length)return null;
    var max=-1,best=[];
    a.forEach(function(x){var sc=scoreShot(x);if(sc>max){max=sc;best=[x]}else if(sc===max)best.push(x)});
    var different=best.filter(function(x){return (x.pose+'|'+x.angle+'|'+x.location)!==lastKey});
    if(different.length)best=different;
    return best[Math.floor(Math.random()*best.length)];
  }

  function preserveSnapshot(){
    var s=S(),o={};
    Object.keys(s).forEach(function(k){if(k!=='pose'&&k!=='angle'&&k!=='bedroomShotLocation')o[k]=s[k]});
    return o;
  }
  function restoreSnapshot(o){var s=S();Object.keys(o).forEach(function(k){s[k]=o[k]})}
  function setShot(x){var s=S();s.pose=x.pose;s.angle=x.angle;s.bedroomShotLocation=x.location}

  function applyShot(){
    var x=choose();
    if(!x){
      updateStatus(null,true);
      return;
    }
    var fixed=preserveSnapshot();
    setShot(x);
    lastKey=x.pose+'|'+x.angle+'|'+x.location;
    saveNow();

    try{if(typeof window.renderPickers==='function')window.renderPickers()}catch(e){}

    /* Restore every non-shuffle control after dependency/UI reconciliation. */
    restoreSnapshot(fixed);
    setShot(x);
    saveNow();

    try{if(typeof window.renderPickers==='function')window.renderPickers()}catch(e){}

    /* Final state guard: only these three values are allowed to differ. */
    restoreSnapshot(fixed);
    setShot(x);
    saveNow();
    refreshNow();
    updateStatus(x,false);
  }

  function updateStatus(x,blocked){
    var n=document.getElementById('bedroomShotShuffleStatus');if(!n)return;
    if(blocked){
      n.textContent='لا توجد لقطة عشوائية آمنة متوافقة مع الكادر ووضعية اليد الحاليين. لم يتم تغيير أي اختيار.';
      return;
    }
    var s=S();
    n.textContent='Safe Shuffle: تغيّرت فقط الوضعية + زاوية السيلفي + المكان. ذراع التصوير يجب أن تبقى خارج الإطار بالكامل، وكل باقي الاختيارات ثابتة. المكان الحالي: '+val((x&&x.location)||s.bedroomShotLocation||'حسب الوضعية الحالية')+'.';
  }

  function installButton(){
    var grid=document.getElementById('bedroomEssentialGrid');if(!grid)return;
    var wrap=document.getElementById('bedroomShotShuffleField');
    if(!wrap){
      wrap=document.createElement('div');wrap.id='bedroomShotShuffleField';wrap.className='field full';
      wrap.innerHTML='<button id="bedroomShotShuffleBtn" class="btn secondary" type="button" style="width:100%">🎲 غيّر اللقطة</button><small id="bedroomShotShuffleStatus" class="historyHint" style="display:block;margin-top:7px;line-height:1.6">Safe Shuffle: يغيّر فقط الوضعية والزاوية والمكان، ويستبعد أي تركيبة قد تُظهر ذراع التصوير. جميع الاختيارات الأخرى ثابتة.</small>';
      var pose=document.querySelector('.picker[data-key="pose"]');var pf=pose&&pose.closest('.field');
      if(pf&&pf.parentNode===grid)pf.insertAdjacentElement('afterend',wrap);else grid.appendChild(wrap);
      var b=document.getElementById('bedroomShotShuffleBtn');if(b)b.addEventListener('click',applyShot);
    }
    wrap.style.display='';
  }

  function locationRule(){
    var s=S(),loc=val(s.bedroomShotLocation);
    if(!loc)return '';
    return 'BEDROOM SHOT LOCATION — SAFE SHUFFLE LOCATION LOCK. Place the subject '+loc+'. Preserve the selected shuffled pose and selfie angle. ABSOLUTE CAMERA-ARM SAFETY: the entire camera-holding upper arm, elbow, forearm, wrist, hand, fingers, and phone must remain outside every image border. If the composition would expose any camera-side limb fragment, do NOT widen the frame and do NOT reveal the arm; instead make only a tiny physically plausible phone-position, lateral framing, or camera-distance adjustment within the current selected selfie-crop category. The selected selfie crop itself remains unchanged. If full camera-arm exclusion cannot be achieved without violating the selected crop, pose, or anatomy, reject that composition rather than rendering a visible arm. This location rule may not alter clothing, facial expression, free-hand pose, lighting, clutter, bed condition, image condition, color response, selfie crop, person identity, or room identity.';
  }

  window.buildFinal=function(){
    var base=oldFinal?oldFinal():'';
    var r=locationRule();
    return r?r+'\n\n'+base:base;
  };

  window.buildNegative=function(){
    var base=oldNegative?oldNegative():'';
    if(!val(S().bedroomShotLocation))return base;
    var x=['unsafe shuffled selfie composition','visible camera-holding upper arm','visible camera-holding elbow','visible camera-holding forearm','visible camera-holding wrist','visible camera-holding hand','visible camera-holding fingers','visible phone','extended selfie arm entering frame','wide framing introduced to show camera arm','very-high angle selected by shuffle','ground-low angle selected by shuffle','overhead angle selected by shuffle','side-bed angle selected by shuffle','seated-down angle selected by shuffle','Dutch angle selected by shuffle','shuffled shot location ignored','subject moved to a different bedroom zone','shot shuffle changing clothing','shot shuffle changing facial expression','shot shuffle changing free-hand pose','shot shuffle changing lighting','shot shuffle changing clutter','shot shuffle changing bed condition','shot shuffle changing image condition','shot shuffle changing color response','shot shuffle changing selfie crop'];
    return (base?base+', ':'')+x.join(', ');
  };

  function boot(){installButton();setTimeout(installButton,180);setTimeout(installButton,650)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();