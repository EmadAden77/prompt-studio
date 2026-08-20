(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var POSES=[
    ['bedroom_reclining_pillows','مسترخي على السرير مستندًا للوسائد'],
    ['bedroom_sitting_edge','جالس على طرف السرير'],
    ['bedroom_standing_beside','واقف بجانب السرير'],
    ['bedroom_sitting_floor','جالس على الأرض بجانب السرير'],
    ['bedroom_lying_pillow','مستلقي على الوسادة'],
    ['bedroom_holding_pillow','جالس على السرير ممسك وسادة أو بطانية']
  ];

  var ANGLES={
    high:['bedroom_angle_high','زاوية مرتفعة قليلًا'],
    low:['bedroom_angle_low','زاوية منخفضة عفوية'],
    eye34:['bedroom_angle_eye_34','مستوى النظر 3/4'],
    eyeFront:['bedroom_angle_eye_front','مستوى النظر أمامية'],
    overhead:['bedroom_angle_overhead','من أعلى أثناء الاستلقاء'],
    sideBed:['bedroom_angle_side_bed','جانبية من مستوى السرير']
  };

  function q(s){return document.querySelector(s)}
  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function saveNow(){try{if(typeof save==='function')save()}catch(e){}}

  function normalizePose(v){
    var t=String(v||'').toLowerCase();
    if(/^bedroom_(reclining_pillows|sitting_edge|standing_beside|sitting_floor|lying_pillow|holding_pillow)$/.test(t))return t;
    if(/floor|الأرض|الارض/.test(t))return 'bedroom_sitting_floor';
    if(/holding|blanket|pillow.*hold|بطاني|وسادة.*مم/.test(t))return 'bedroom_holding_pillow';
    if(/lying|laying|مستلقي|استلقاء/.test(t))return 'bedroom_lying_pillow';
    if(/reclin|pillows|headboard|متكئ|مسترخي/.test(t))return 'bedroom_reclining_pillows';
    if(/seated|sitting|جالس/.test(t))return 'bedroom_sitting_edge';
    return 'bedroom_standing_beside';
  }

  function angleSet(p){
    if(p==='bedroom_lying_pillow')return [ANGLES.overhead,ANGLES.sideBed,ANGLES.high,ANGLES.eye34];
    if(p==='bedroom_reclining_pillows')return [ANGLES.eye34,ANGLES.high,ANGLES.eyeFront,ANGLES.sideBed,ANGLES.overhead];
    if(p==='bedroom_holding_pillow')return [ANGLES.eye34,ANGLES.eyeFront,ANGLES.high,ANGLES.sideBed];
    if(p==='bedroom_sitting_floor')return [ANGLES.high,ANGLES.low,ANGLES.eye34,ANGLES.eyeFront];
    if(p==='bedroom_sitting_edge')return [ANGLES.eyeFront,ANGLES.eye34,ANGLES.high,ANGLES.low];
    return [ANGLES.eyeFront,ANGLES.eye34,ANGLES.high,ANGLES.low];
  }

  function allowed(list){return list.map(function(x){return x[0]})}

  function syncOptions(){
    if(typeof OPTIONS!=='object'||!OPTIONS)return;
    var s=S();
    s.pose=normalizePose(s.pose);
    OPTIONS.pose=POSES.slice();
    var a=angleSet(s.pose);
    OPTIONS.angle=a.slice();
    if(allowed(a).indexOf(String(s.angle||''))===-1)s.angle=a[0][0];
    s.distance='';
    saveNow();
  }

  function poseRule(p){
    if(p==='bedroom_reclining_pillows')return 'POSE — RECLINING AGAINST PILLOWS. Recline casually against the real bedroom pillows with believable back and pelvis support, relaxed shoulders, natural spine curvature, realistic pillow compression, ordinary clothing bunching, and gravity-consistent hair displacement.';
    if(p==='bedroom_sitting_edge')return 'POSE — SITTING ON THE EDGE OF THE BED. Sit naturally on the bed edge with believable pelvis support, relaxed knees and legs, slight ordinary torso asymmetry, natural shoulder balance, and realistic mattress compression.';
    if(p==='bedroom_sitting_floor')return 'POSE — SITTING ON THE FLOOR BESIDE THE BED. Sit naturally on the floor beside the bed with believable hip and leg placement, realistic contact with the floor or bed frame, relaxed shoulders, and no impossible joint folding.';
    if(p==='bedroom_lying_pillow')return 'POSE — LYING NATURALLY ON A PILLOW. Keep the head and neck genuinely supported by the pillow, with realistic pillow compression, mild facial and hair displacement from contact, believable shoulder and torso support, and gravity-consistent bedding folds.';
    if(p==='bedroom_holding_pillow')return 'POSE — SEATED ON THE BED HOLDING A PILLOW OR BLANKET. Sit naturally on the bed while the free hand gently holds a pillow or blanket with believable weight, hand contact, fabric compression, folds, and relaxed non-staged posture.';
    return 'POSE — STANDING BESIDE THE BED. Stand naturally beside the bed with believable weight distribution, relaxed asymmetry, ordinary shoulder and pelvis alignment, and a slight casual body turn without fashion posing.';
  }

  function angleRule(a){
    if(a==='bedroom_angle_high')return 'CAMERA ANGLE — HIGH-ANGLE SELFIE. Hold the virtual phone slightly above forehead level and tilt it gently downward. Keep the downward pitch modest, the face perspective believable, the framing casually off-center, and the subject gaze physically consistent with looking toward a slightly elevated front camera. The hidden camera-holding arm must remain outside the captured frame.';
    if(a==='bedroom_angle_low')return 'CAMERA ANGLE — SLIGHTLY LOW-ANGLE CASUAL SELFIE. Place the virtual phone only modestly below eye level, never dramatically low. The subject looks slightly downward toward the lens. Preserve believable chin, neck, shoulder, and wide-angle perspective without exaggeration. The hidden camera-holding arm must remain outside the captured frame.';
    if(a==='bedroom_angle_eye_34')return 'CAMERA ANGLE — EYE-LEVEL THREE-QUARTER SELFIE. Keep the phone near eye level while the head turns naturally about three-quarters. Preserve realistic facial perspective and asymmetry without reshaping identity. Choose the physically plausible selfie side automatically so the selected head turn, hidden phone reach, and bedroom geometry remain coherent.';
    if(a==='bedroom_angle_overhead')return 'CAMERA ANGLE — OVERHEAD SELFIE WHILE LYING. Use only with a supported reclining or lying posture. Place the virtual phone above the face at a physically reachable selfie distance, with mild wide-angle perspective and a casual imperfect crop that includes believable pillow or bedding context. Do not turn it into a ceiling-mounted or third-person camera.';
    if(a==='bedroom_angle_side_bed')return 'CAMERA ANGLE — RELAXED SIDE SELFIE FROM BED LEVEL. Position the virtual phone at a plausible arm-length side offset near bed level, producing a natural three-quarter perspective with believable pillow, shoulder, blanket, or bed context. Keep the viewpoint clearly self-taken, not a separate photographer viewpoint.';
    return 'CAMERA ANGLE — EYE-LEVEL FRONT-FACING SELFIE. Keep the virtual phone near eye level at a natural arm-length distance, slightly off-center rather than perfectly symmetrical, with ordinary casual roll and framing imperfection. Preserve realistic front-camera perspective and keep the camera-holding limb outside the captured frame.';
  }

  function installUI(){
    syncOptions();
    var distance=q('.picker[data-key="distance"]');
    var df=distance&&distance.closest('.field');
    if(df)df.style.display='none';

    var pose=q('.picker[data-key="pose"]');
    var pf=pose&&pose.closest('.field');
    if(pf){
      var pl=pf.querySelector('label');if(pl)pl.textContent='وضعية سيلفي غرفة النوم';
      var old=q('#bedroomAutoCameraHint');if(old)old.remove();
      var h=q('#bedroomPoseAngleHint');
      if(!h){h=document.createElement('small');h.id='bedroomPoseAngleHint';h.className='historyHint';h.style.display='block';h.style.marginTop='6px';h.style.lineHeight='1.6';pf.appendChild(h)}
      h.textContent='اختر الوضعية أولًا. التطبيق يعرض بعدها زوايا السيلفي المتوافقة معها فقط.';
    }

    var angle=q('.picker[data-key="angle"]');
    var af=angle&&angle.closest('.field');
    if(af){
      af.style.display='';
      var al=af.querySelector('label');if(al)al.textContent='زاوية تصوير السيلفي';
      var ah=q('#bedroomAngleCompatibilityHint');
      if(!ah){ah=document.createElement('small');ah.id='bedroomAngleCompatibilityHint';ah.className='historyHint';ah.style.display='block';ah.style.marginTop='6px';ah.style.lineHeight='1.6';af.appendChild(ah)}
      ah.textContent='تظهر فقط الزوايا الممكنة تشريحيًا والمتوافقة مع الوضعية المختارة.';
    }
  }

  var previousRender=window.renderPickers;
  if(typeof previousRender==='function'){
    window.renderPickers=function(){syncOptions();previousRender();installUI()};
  }

  function stripLegacyAutoCamera(text){
    var blocked=['BEDROOM AUTO SELFIE DIRECTOR —','AUTOMATIC SELFIE ANGLE, POSE PRESENTATION, AND EXPRESSION DIRECTOR —'];
    return String(text||'').split(/\n\n+/).filter(function(block){var t=block.trim();return !blocked.some(function(h){return t.indexOf(h)===0})}).join('\n\n').replace(/\n{3,}/g,'\n\n').trim();
  }

  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;

  window.buildFinal=function(){
    syncOptions();
    var s=S();
    var base=oldFinal?oldFinal():'';
    base=stripLegacyAutoCamera(base);
    var rule='BEDROOM SELECTED SELFIE GEOMETRY — HARD CONSTRAINT. The user explicitly selects one bedroom pose and one compatible selfie camera angle. Preserve both exactly. Camera-to-face distance, tiny roll, crop, field coverage, and exact hidden phone position remain automatic and may adapt only to make the selected pose and selected angle physically possible without changing identity, body proportions, clothing, bedroom identity, or the hidden-arm rule.';
    return rule+'\n\n'+poseRule(s.pose)+'\n\n'+angleRule(s.angle)+'\n\n'+base;
  };

  window.buildNegative=function(){
    syncOptions();
    var base=oldNegative?oldNegative():'';
    var x=['two conflicting selfie angles in one bedroom image','camera angle incompatible with selected bedroom pose','automatic camera angle replacing the selected bedroom angle','selected bedroom pose replaced by another posture','mirror selfie in hidden-arm bedroom mode','visible phone caused by selected angle','visible camera-holding arm caused by selected angle','ceiling-mounted viewpoint mistaken for overhead selfie','third-person photographer viewpoint'];
    return (base?base+', ':'')+x.join(', ');
  };

  function boot(){syncOptions();if(typeof window.renderPickers==='function')window.renderPickers();else installUI();setTimeout(installUI,150);setTimeout(installUI,450)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();