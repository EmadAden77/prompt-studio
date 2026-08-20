(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var POSES=[
    ['bedroom_reclining_pillows','مسترخي على السرير مستندًا للوسائد'],
    ['bedroom_sitting_edge','جالس على طرف السرير'],
    ['bedroom_standing_beside','واقف بجانب السرير'],
    ['bedroom_sitting_floor','جالس على الأرض بجانب السرير'],
    ['bedroom_lying_pillow','مستلقي على الوسادة'],
    ['bedroom_holding_pillow','يحتضن وسادة أو بطانية على السرير'],
    ['bedroom_peeking_blanket','ينظر من فوق البطانية'],
    ['bedroom_laptop_book_bed','جالس على السرير مع لابتوب أو كتاب مفتوح'],
    ['bedroom_crosslegged_bed','جالس متربع على السرير'],
    ['bedroom_leaning_headboard','متكئ للخلف على ظهر السرير'],
    ['bedroom_one_knee_bed','جالس على السرير وركبة واحدة مرفوعة'],
    ['bedroom_lying_side','مستلقي على الجانب'],
    ['bedroom_standing_curtain','واقف قرب الستارة والنافذة'],
    ['bedroom_standing_wardrobe','واقف قرب خزانة الملابس'],
    ['bedroom_standing_wall_back','واقف ساند ظهره على الجدار'],
    ['bedroom_standing_doorframe','واقف ساند كتفه على إطار الباب'],
    ['bedroom_standing_center','واقف بمنتصف الغرفة والسرير خلفه'],
    ['bedroom_standing_dresser','واقف أمام التسريحة'],
    ['bedroom_standing_corner','واقف في زاوية الغرفة'],
    ['bedroom_standing_foot_bed','واقف عند نهاية السرير والسرير أمامه'],
    ['bedroom_standing_head_wall','واقف مسند رأسه على الجدار'],
    ['bedroom_standing_wardrobe_door','واقف جزئيًا خلف باب الخزانة المفتوح']
  ];

  var ANGLES={
    high:['bedroom_angle_high','زاوية مرتفعة قليلًا'],
    veryHigh:['bedroom_angle_very_high','مرتفعة جدًا فوق الرأس'],
    low:['bedroom_angle_low','زاوية منخفضة عفوية'],
    eye34:['bedroom_angle_eye_34','مستوى النظر 3/4'],
    eyeFront:['bedroom_angle_eye_front','مستوى النظر أمامية'],
    overhead:['bedroom_angle_overhead','من أعلى أثناء الاستلقاء'],
    sideBed:['bedroom_angle_side_bed','جانبية من مستوى السرير'],
    high34:['bedroom_angle_high_34','مرتفعة 3/4 مائلة'],
    eyeOffset:['bedroom_angle_eye_offset','مستوى العين خارج المركز قليلًا'],
    seatedDown:['bedroom_angle_seated_down','قطرية من أعلى أثناء الجلوس'],
    shoulderSide:['bedroom_angle_shoulder_side','جانبية عند مستوى الكتف'],
    dutch:['bedroom_angle_dutch','زاوية مائلة عفوية'],
    groundLow:['bedroom_angle_ground_low','منخفضة جدًا قرب مستوى المرتبة/الأرض']
  };

  function q(s){return document.querySelector(s)}
  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function saveNow(){try{if(typeof save==='function')save()}catch(e){}}

  function normalizePose(v){
    var t=String(v||'').toLowerCase();
    if(/^bedroom_(reclining_pillows|sitting_edge|standing_beside|sitting_floor|lying_pillow|holding_pillow|peeking_blanket|laptop_book_bed|crosslegged_bed|leaning_headboard|one_knee_bed|lying_side|standing_curtain|standing_wardrobe|standing_wall_back|standing_doorframe|standing_center|standing_dresser|standing_corner|standing_foot_bed|standing_head_wall|standing_wardrobe_door)$/.test(t))return t;
    if(/peek|above.*blanket|فوق البطاني|فوق البطانيه/.test(t))return 'bedroom_peeking_blanket';
    if(/laptop|book|لابتوب|كتاب/.test(t))return 'bedroom_laptop_book_bed';
    if(/cross.?leg|متربع/.test(t))return 'bedroom_crosslegged_bed';
    if(/headboard|ظهر السرير|متكئ للخلف/.test(t))return 'bedroom_leaning_headboard';
    if(/one.?knee|ركبة واحدة|ركبه واحده/.test(t))return 'bedroom_one_knee_bed';
    if(/lying.*side|على الجانب/.test(t))return 'bedroom_lying_side';
    if(/curtain|window|ستارة|ستاره|نافذة|نافذه/.test(t))return 'bedroom_standing_curtain';
    if(/wardrobe.*door|closet.*door|باب.*خزان|خلف.*خزان/.test(t))return 'bedroom_standing_wardrobe_door';
    if(/wardrobe|closet|خزانة|خزانه/.test(t))return 'bedroom_standing_wardrobe';
    if(/door.?frame|إطار الباب|اطار الباب/.test(t))return 'bedroom_standing_doorframe';
    if(/dresser|vanity|تسريحة|تسريحه/.test(t))return 'bedroom_standing_dresser';
    if(/room.*corner|corner.*room|زاوية الغرفة|زاويه الغرفه/.test(t))return 'bedroom_standing_corner';
    if(/foot.*bed|end.*bed|نهاية السرير|نهايه السرير|ورا السرير/.test(t))return 'bedroom_standing_foot_bed';
    if(/head.*wall|رأسه.*الجدار|راسه.*الجدار/.test(t))return 'bedroom_standing_head_wall';
    if(/back.*wall|lean.*wall|ساند.*ظهر.*جدار/.test(t))return 'bedroom_standing_wall_back';
    if(/middle.*room|center.*room|منتصف الغرفة|منتصف الغرفه|نص الغرفة|نص الغرفه/.test(t))return 'bedroom_standing_center';
    if(/floor|الأرض|الارض/.test(t))return 'bedroom_sitting_floor';
    if(/holding|hug|blanket|pillow.*hold|بطاني|وسادة.*مم|وساده.*مم|احتضان|يحتضن/.test(t))return 'bedroom_holding_pillow';
    if(/lying|laying|مستلقي|استلقاء/.test(t))return 'bedroom_lying_pillow';
    if(/reclin|pillows|متكئ|مسترخي/.test(t))return 'bedroom_reclining_pillows';
    if(/seated|sitting|جالس/.test(t))return 'bedroom_sitting_edge';
    return 'bedroom_standing_beside';
  }

  function angleSet(p){
    if(p==='bedroom_peeking_blanket')return [ANGLES.veryHigh,ANGLES.high,ANGLES.eyeFront,ANGLES.eye34,ANGLES.dutch,ANGLES.overhead];
    if(p==='bedroom_laptop_book_bed')return [ANGLES.eyeFront,ANGLES.eye34,ANGLES.high,ANGLES.veryHigh,ANGLES.seatedDown,ANGLES.eyeOffset,ANGLES.dutch];
    if(p==='bedroom_lying_pillow')return [ANGLES.overhead,ANGLES.sideBed,ANGLES.dutch,ANGLES.groundLow,ANGLES.high,ANGLES.eye34,ANGLES.high34];
    if(p==='bedroom_lying_side')return [ANGLES.sideBed,ANGLES.dutch,ANGLES.groundLow,ANGLES.eye34,ANGLES.high34,ANGLES.overhead,ANGLES.shoulderSide];
    if(p==='bedroom_reclining_pillows')return [ANGLES.eye34,ANGLES.high,ANGLES.veryHigh,ANGLES.eyeFront,ANGLES.sideBed,ANGLES.overhead,ANGLES.high34,ANGLES.eyeOffset,ANGLES.dutch];
    if(p==='bedroom_leaning_headboard')return [ANGLES.eye34,ANGLES.eyeFront,ANGLES.high,ANGLES.high34,ANGLES.eyeOffset,ANGLES.seatedDown,ANGLES.dutch];
    if(p==='bedroom_holding_pillow')return [ANGLES.eye34,ANGLES.eyeFront,ANGLES.high,ANGLES.veryHigh,ANGLES.sideBed,ANGLES.eyeOffset,ANGLES.seatedDown,ANGLES.dutch];
    if(p==='bedroom_crosslegged_bed')return [ANGLES.eyeFront,ANGLES.eye34,ANGLES.high,ANGLES.veryHigh,ANGLES.seatedDown,ANGLES.eyeOffset,ANGLES.high34,ANGLES.dutch];
    if(p==='bedroom_one_knee_bed')return [ANGLES.eye34,ANGLES.eyeFront,ANGLES.high,ANGLES.veryHigh,ANGLES.low,ANGLES.eyeOffset,ANGLES.seatedDown,ANGLES.dutch];
    if(p==='bedroom_sitting_floor')return [ANGLES.high,ANGLES.low,ANGLES.groundLow,ANGLES.eye34,ANGLES.eyeFront,ANGLES.high34,ANGLES.eyeOffset,ANGLES.shoulderSide,ANGLES.dutch];
    if(p==='bedroom_sitting_edge')return [ANGLES.eyeFront,ANGLES.eye34,ANGLES.high,ANGLES.veryHigh,ANGLES.low,ANGLES.groundLow,ANGLES.eyeOffset,ANGLES.seatedDown,ANGLES.shoulderSide,ANGLES.dutch];
    if(p==='bedroom_standing_foot_bed')return [ANGLES.eyeFront,ANGLES.eye34,ANGLES.high,ANGLES.veryHigh,ANGLES.low,ANGLES.high34,ANGLES.eyeOffset,ANGLES.shoulderSide,ANGLES.dutch];
    if(/^bedroom_standing_/.test(p))return [ANGLES.eyeFront,ANGLES.eye34,ANGLES.high,ANGLES.low,ANGLES.high34,ANGLES.eyeOffset,ANGLES.shoulderSide,ANGLES.dutch];
    return [ANGLES.eyeFront,ANGLES.eye34,ANGLES.high,ANGLES.low,ANGLES.high34,ANGLES.eyeOffset,ANGLES.shoulderSide,ANGLES.dutch];
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
    if(p==='bedroom_peeking_blanket')return 'POSE — PEEKING ABOVE THE BLANKET. Rest naturally in bed with the blanket raised high enough that mainly the eyes, eyebrows, and forehead remain visible. The head, neck, shoulders, and torso must still have believable mattress and pillow support. The blanket must drape and compress naturally against the body without covering the eyes or changing facial identity.';
    if(p==='bedroom_laptop_book_bed')return 'POSE — SEATED ON THE BED WITH AN OPEN LAPTOP OR BOOK. Sit naturally on the bed with one ordinary open laptop or one open book resting plausibly on the lap or bedding as part of the selected pose. Preserve realistic device/book weight, support, screen or page angle, mattress compression, relaxed torso balance, and casual non-staged posture. Do not add a second device or unrelated work props.';
    if(p==='bedroom_reclining_pillows')return 'POSE — RECLINING AGAINST PILLOWS. Recline casually against the real bedroom pillows with believable back and pelvis support, relaxed shoulders, natural spine curvature, realistic pillow compression, ordinary clothing bunching, and gravity-consistent hair displacement.';
    if(p==='bedroom_sitting_edge')return 'POSE — SITTING ON THE EDGE OF THE BED. Sit naturally on the bed edge with believable pelvis support, relaxed knees and legs, slight ordinary torso asymmetry, natural shoulder balance, and realistic mattress compression.';
    if(p==='bedroom_sitting_floor')return 'POSE — SITTING ON THE FLOOR BESIDE THE BED. Sit naturally on the floor beside the bed with believable hip and leg placement, realistic contact with the floor or bed frame, relaxed shoulders, and no impossible joint folding.';
    if(p==='bedroom_lying_pillow')return 'POSE — LYING NATURALLY ON A PILLOW. Keep the head and neck genuinely supported by the pillow, with realistic pillow compression, mild facial and hair displacement from contact, believable shoulder and torso support, and gravity-consistent bedding folds.';
    if(p==='bedroom_holding_pillow')return 'POSE — HUGGING A PILLOW OR BLANKET ON THE BED. Sit or recline naturally while holding the pillow or gathered blanket close to the torso with believable arm pressure, fabric compression, gravity-driven folds, relaxed shoulders, and an ordinary comfortable posture. The object must deform where it is held and must never float or intersect the body.';
    if(p==='bedroom_crosslegged_bed')return 'POSE — SITTING CROSS-LEGGED ON THE BED. Sit casually cross-legged with realistic hip and knee flexion, natural ankle placement, visible mattress compression beneath the pelvis and legs, relaxed shoulders, and ordinary asymmetry rather than a yoga-like staged pose.';
    if(p==='bedroom_leaning_headboard')return 'POSE — LEANING BACK AGAINST THE HEADBOARD. Let the back and shoulders rest naturally against the real headboard or pillows with realistic contact, mild torso slouch, relaxed neck position, fabric bunching at the waist, and physically plausible bed compression.';
    if(p==='bedroom_one_knee_bed')return 'POSE — SITTING ON THE BED WITH ONE KNEE RAISED. Keep one leg naturally bent with the knee raised while the other leg rests comfortably. Preserve realistic hip rotation, pelvis support, clothing folds, mattress compression, and relaxed shoulder asymmetry.';
    if(p==='bedroom_lying_side')return 'POSE — LYING ON THE SIDE. Lie naturally on one side with the head supported by a pillow, mild shoulder compression, believable torso and hip contact with the mattress, realistic hair displacement, and bedding folds responding to body weight.';
    if(p==='bedroom_standing_curtain')return 'POSE — STANDING NEAR THE CURTAIN AND WINDOW. Stand naturally near the canonical far-wall curtain/window area without moving furniture or changing room geometry. Keep relaxed weight distribution, a small body turn, and believable distance from the curtain. Do not force curtain contact or a lighting effect; the free-hand and Bedroom Lighting controls remain authoritative.';
    if(p==='bedroom_standing_wardrobe')return 'POSE — STANDING NEAR THE WARDROBE. Stand casually near the existing wardrobe/dressing area while preserving the room layout, with relaxed weight distribution, ordinary asymmetry, and no fashion-model posing.';
    if(p==='bedroom_standing_wall_back')return 'POSE — STANDING WITH BACK AGAINST THE WALL. Stand casually with the upper back or shoulder-blade area making believable light contact with an existing bedroom wall. Keep both feet grounded, knees unlocked, pelvis and spine naturally settled, and shoulders relaxed. Show real contact and tiny clothing compression without flattening the body into the wall.';
    if(p==='bedroom_standing_doorframe')return 'POSE — SHOULDER LEAN AGAINST THE DOOR FRAME. Stand at the existing near-left doorway with one shoulder making light believable contact with the real door frame. Transfer only a modest amount of weight into the frame while keeping both feet naturally grounded and the torso relaxed. Do not invent a new doorway or force a free-hand gesture.';
    if(p==='bedroom_standing_center')return 'POSE — STANDING IN THE MIDDLE OF THE BEDROOM WITH THE BED BEHIND. Stand in a physically clear central floor area so the canonical bed remains naturally visible behind the subject according to the selected selfie angle and crop. Keep relaxed weight distribution, realistic room depth, and enough clearance from the rug, shoes, furniture, and wardrobe.';
    if(p==='bedroom_standing_dresser')return 'POSE — STANDING AT THE EXISTING DRESSER. Stand naturally in front of the canonical right-side dresser with believable clearance and relaxed weight distribution. If the free-hand control is Auto, the free hand may rest lightly on the dresser; if the user explicitly selected another free-hand action, that selection wins. Do not invent a new vanity or move the dresser.';
    if(p==='bedroom_standing_corner')return 'POSE — STANDING IN A BEDROOM CORNER. Stand naturally in a real clear corner or edge zone of the canonical room with believable wall and furniture clearance. The selected angle and selfie crop alone determine how much room depth or clutter is visible; do not force a wide-angle composition or add extra mess.';
    if(p==='bedroom_standing_foot_bed')return 'POSE — STANDING AT THE FOOT/END OF THE BED WITH THE BED IN FRONT. Stand in the accessible floor area near the end of the canonical bed so the bed can appear below or behind the subject according to the selected high, very-high, or other compatible selfie angle. Preserve real room geometry and never place the body behind the wall-mounted headboard or stretch the camera arm.';
    if(p==='bedroom_standing_head_wall')return 'POSE — STANDING WITH HEAD RESTING LIGHTLY AGAINST THE WALL. Stand close to an existing bedroom wall and let the back or side of the head make only gentle believable contact while the neck stays within a comfortable range. Keep the selected facial expression authoritative; do not automatically make the person look tired, sad, or sleepy.';
    if(p==='bedroom_standing_wardrobe_door')return 'POSE — STANDING PARTLY BEHIND AN EXISTING WARDROBE DOOR. Use only a real door belonging to the canonical wardrobe, opened by a modest physically plausible amount, with part of the standing body naturally occluded by it. Preserve clearance, reflections, hinges, room geometry, and the selected free-hand action. Do not invent an extra door or hide facial-identity errors behind the occlusion.';
    return 'POSE — STANDING BESIDE THE BED. Stand naturally beside the bed with believable weight distribution, relaxed asymmetry, ordinary shoulder and pelvis alignment, and a slight casual body turn without fashion posing.';
  }

  function angleRule(a){
    if(a==='bedroom_angle_high')return 'CAMERA ANGLE — HIGH-ANGLE SELFIE. Hold the virtual phone slightly above forehead level and tilt it gently downward. Keep the downward pitch modest, facial perspective believable, and framing casually off-center.';
    if(a==='bedroom_angle_very_high')return 'CAMERA ANGLE — VERY HIGH ABOVE-HEAD SELFIE. Hold the phone clearly above head level within a real one-handed reachable arc and angle it down toward the face and upper body. Keep the elevation noticeably higher than the normal high-angle option but still mechanically possible. Preserve realistic shoulder and neck compensation, front-camera perspective, and casual composition. Never turn this into a ceiling-mounted, drone-like, or third-person top-down view.';
    if(a==='bedroom_angle_low')return 'CAMERA ANGLE — SLIGHTLY LOW-ANGLE CASUAL SELFIE. Place the virtual phone only modestly below eye level, never dramatically low. Preserve believable chin, neck, shoulder, and wide-angle perspective without exaggeration.';
    if(a==='bedroom_angle_eye_34')return 'CAMERA ANGLE — EYE-LEVEL THREE-QUARTER SELFIE. Keep the phone near eye level while the head turns naturally about three-quarters. Preserve realistic facial perspective and asymmetry without reshaping identity.';
    if(a==='bedroom_angle_overhead')return 'CAMERA ANGLE — OVERHEAD SELFIE WHILE LYING. Use a physically reachable phone position above the face with mild wide-angle perspective and a casual crop that includes believable pillow or bedding context. Never turn it into a ceiling-mounted viewpoint.';
    if(a==='bedroom_angle_side_bed')return 'CAMERA ANGLE — RELAXED SIDE SELFIE FROM BED LEVEL. Use a plausible arm-length side offset near bed level, producing a natural three-quarter perspective with believable bed, pillow, shoulder, or blanket context.';
    if(a==='bedroom_angle_high_34')return 'CAMERA ANGLE — HIGH THREE-QUARTER SELFIE. Place the phone modestly above eye level and slightly to one side, combining a gentle downward pitch with a natural three-quarter facial presentation. Keep the effect subtle and handheld, not dramatic.';
    if(a==='bedroom_angle_eye_offset')return 'CAMERA ANGLE — EYE-LEVEL OFF-CENTER SELFIE. Keep the lens around eye level but shift the phone slightly to one side so the face sits naturally off-center. Preserve a direct handheld feel without turning the image into a side portrait.';
    if(a==='bedroom_angle_seated_down')return 'CAMERA ANGLE — SEATED DIAGONAL DOWNWARD SELFIE. While seated, place the phone modestly above and diagonally forward, creating a natural downward view that still reads as arm-length and self-taken. Avoid steep top-down distortion.';
    if(a==='bedroom_angle_shoulder_side')return 'CAMERA ANGLE — SHOULDER-LEVEL SIDE-OFFSET SELFIE. Hold the phone at roughly shoulder-to-eye height with a modest lateral offset. Keep facial proportions natural and preserve the unmistakable geometry of a one-handed front-camera selfie.';
    if(a==='bedroom_angle_dutch')return 'CAMERA ANGLE — SLIGHT DUTCH-ANGLE SELFIE. Keep the phone physically handheld at a normal reachable selfie distance and apply only a mild natural roll of roughly 3–7 degrees. The tilt must feel like an accidental casual snapshot, not a dramatic cinematic Dutch angle. Preserve realistic horizon behavior, facial proportions, and selected pose geometry.';
    if(a==='bedroom_angle_ground_low')return 'CAMERA ANGLE — VERY LOW SELFIE NEAR MATTRESS/FLOOR LEVEL. Place the phone only as low as the selected pose can physically reach, close to mattress or floor level, and angle it gently upward toward the face. It must remain a genuine handheld front-camera selfie, never a phone resting on the floor or an external photographer viewpoint. Keep chin, neck, torso perspective, pitch, and foreshortening believable; adapt crop and distance rather than anatomy.';
    return 'CAMERA ANGLE — EYE-LEVEL FRONT-FACING SELFIE. Keep the virtual phone near eye level at a natural arm-length distance, slightly off-center rather than perfectly symmetrical, with ordinary casual roll and framing imperfection.';
  }

  function installUI(){
    syncOptions();
    var distance=q('.picker[data-key="distance"]');
    var df=distance&&distance.closest('.field');
    if(df)df.style.display='none';

    var pose=q('.picker[data-key="pose"]');
    var pf=pose&&pose.closest('.field');
    if(pf){
      var pl=pf.querySelector('label');if(pl)pl.textContent='وضعية الشخص';
      var h=q('#bedroomPoseAngleHint');
      if(!h){h=document.createElement('small');h.id='bedroomPoseAngleHint';h.className='historyHint';h.style.display='block';h.style.marginTop='6px';h.style.lineHeight='1.6';pf.appendChild(h)}
      h.textContent='كل وضعية تعرض فقط زوايا السيلفي الممكنة والمتوافقة معها.';
    }

    var angle=q('.picker[data-key="angle"]');
    var af=angle&&angle.closest('.field');
    if(af){
      af.style.display='';
      var al=af.querySelector('label');if(al)al.textContent='زاوية التصوير';
      var ah=q('#bedroomAngleCompatibilityHint');
      if(!ah){ah=document.createElement('small');ah.id='bedroomAngleCompatibilityHint';ah.className='historyHint';ah.style.display='block';ah.style.marginTop='6px';ah.style.lineHeight='1.6';af.appendChild(ah)}
      ah.textContent='الزوايا كلها سيلفي كاميرا أمامية حقيقية، ومنها الميل العفوي والمنخفض جدًا والمرتفعة جدًا فقط عندما تسمح بها الوضعية.';
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
    var rule='BEDROOM SELECTED SELFIE GEOMETRY — HARD CONSTRAINT. Preserve exactly the selected bedroom pose and one compatible selected selfie angle. Camera-to-face distance, tiny roll, crop, field coverage, exact phone position, and camera-arm biomechanics remain automatic and may adapt only to make those selections physically possible without changing identity, body proportions, clothing, lighting, or bedroom identity.';
    return rule+'\n\n'+poseRule(s.pose)+'\n\n'+angleRule(s.angle)+'\n\n'+base;
  };

  window.buildNegative=function(){
    syncOptions();
    var base=oldNegative?oldNegative():'';
    var x=['two conflicting selfie angles in one bedroom image','camera angle incompatible with selected bedroom pose','automatic camera angle replacing selected bedroom angle','selected bedroom pose replaced by another posture','third-person photographer viewpoint','ceiling-mounted viewpoint mistaken for overhead selfie','dramatic camera angle replacing selected subtle selfie angle','extreme Dutch tilt','floor-mounted camera mistaken for very-low selfie','camera placed on mattress instead of handheld','very-high selfie converted into ceiling camera','duplicate laptop or book','floating laptop or book','blanket covering the eyes in peeking pose','standing pose forcing an unselected hand gesture','standing pose forcing an unselected lighting effect','standing pose inventing a new room object'];
    return (base?base+', ':'')+x.join(', ');
  };

  function boot(){syncOptions();if(typeof window.renderPickers==='function')window.renderPickers();else installUI();setTimeout(installUI,150);setTimeout(installUI,450)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();