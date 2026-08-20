(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function pose(){return String(S().pose||'bedroom_standing_beside')}

  var UNIVERSAL='BEDROOM POSE PHYSICAL REALISM — MAXIMUM AND MANDATORY. Treat the selected pose as a real human body under gravity, not as a decorative pose label. Preserve the fixed 193 cm / 83 kg Lean Athletic body and solve the pose with anatomically correct joint ranges, believable center of mass, real weight distribution, natural spinal curvature, pelvis orientation, shoulder balance, neck compensation, limb length, muscle relaxation or activation, and realistic soft-tissue behavior. Every visible body part must have a mechanically plausible reason to be where it is. Do not force symmetry. Preserve small natural asymmetries in shoulder height, hip loading, knee angle, torso rotation, and head alignment. The selfie camera, crop, and field coverage must adapt to the body. Never stretch, shorten, widen, compress, bend, detach, or reshape the body to fit the frame.';

  var CONTACT='BODY–ENVIRONMENT CONTACT REALISM — MANDATORY. Any body contact with the mattress, pillow, headboard, floor, blanket, or furniture must produce physically believable pressure and response. Mattresses compress under pelvis, thighs, knees, elbows, shoulders, or torso according to load. Pillows compress and bulge around the head, neck, back, or arm. Bedding wrinkles radiate from contact points, folds bunch where fabric is trapped, and loose cloth follows gravity. Feet must meet the floor or bed naturally; seated hips must have real support; leaning torsos must actually transfer weight into the supporting surface. Never allow hovering, missing contact shadows, impossible gaps, clipped limbs, floating fabric, or body parts sinking through furniture.';

  var CLOTHING='POSE-DEPENDENT CLOTHING PHYSICS — MANDATORY. Keep the selected clothing exactly unchanged, but let it respond to the pose. Fabric must stretch over convex areas, compress at bends, bunch at the waist or hips when seated, crease at elbows and knees, drape downward under gravity, and form contact folds where the body meets the bed or floor. Do not use clothing to hide anatomical errors. Do not make fabric rigid, painted-on, weightless, or perfectly arranged.';

  var MAP={
    bedroom_standing_beside:'POSE REALISM — STANDING BESIDE BED. Use a real relaxed standing balance with most weight carried by one leg and a smaller load on the other, slight natural pelvis shift, unlocked knees, relaxed shoulders, and a modest torso turn. Keep both feet grounded with believable spacing and orientation. Avoid military stiffness, fashion-model contrapposto exaggeration, perfectly level shoulders, or impossible ankle balance.',
    bedroom_standing_curtain:'POSE REALISM — STANDING NEAR CURTAIN/WINDOW. Preserve the real distance to the far-wall curtain/window area and room geometry. Use natural weight transfer through the feet, mild torso rotation toward the selfie camera, relaxed shoulders, and enough clearance that the body does not intersect the curtain. If the curtain is touched by the free hand, fabric displacement must follow the contact point and gravity; otherwise it remains undisturbed.',
    bedroom_standing_wardrobe:'POSE REALISM — STANDING NEAR WARDROBE. Keep a believable standing footprint beside the existing wardrobe/dressing area with real floor contact, ordinary asymmetry, relaxed knees and hips, and enough clearance from doors, drawers, shelves, and hanging clothes. Do not merge the body into furniture or use impossible narrow spacing.',
    bedroom_sitting_edge:'POSE REALISM — SITTING ON BED EDGE. The pelvis must be supported by the mattress edge with visible local compression. Hips flex naturally, thighs angle away from the pelvis, knees and feet settle into a mechanically plausible arrangement, and the torso carries a small relaxed forward or backward bias rather than remaining perfectly vertical. Clothing must bunch naturally at the hips and waist.',
    bedroom_sitting_floor:'POSE REALISM — SITTING ON FLOOR BESIDE BED. The pelvis must contact the floor with believable leg placement and joint angles. Knees, ankles, and hips remain within ordinary human ranges. If the back or shoulder touches the bed, show actual load transfer and contact. Preserve floor contact shadows and avoid folded-limb geometry that would require impossible flexibility.',
    bedroom_reclining_pillows:'POSE REALISM — RECLINING AGAINST PILLOWS. The pelvis remains supported by the mattress while the back and shoulders transfer part of their weight into pillows or headboard support. Use a naturally curved spine, mild torso slump, relaxed neck, and realistic shoulder settling. Pillows must compress locally and bedding must gather around the pelvis, back, and legs.',
    bedroom_leaning_headboard:'POSE REALISM — LEANING AGAINST HEADBOARD. Establish a clear support chain from pelvis to mattress and back/shoulders to the headboard or intervening pillows. The torso should not hover in front of the support. Preserve relaxed lumbar and thoracic curvature, mild shoulder asymmetry, natural neck position, and realistic pressure folds in clothing and bedding.',
    bedroom_crosslegged_bed:'POSE REALISM — CROSS-LEGGED ON BED. Use ordinary comfortable hip external rotation and knee flexion, not an extreme yoga posture. Ankles and lower legs must overlap or rest in a believable way without interpenetration. The mattress must compress under the pelvis and legs, and the torso should make small balance adjustments over the seated base.',
    bedroom_one_knee_bed:'POSE REALISM — ONE KNEE RAISED ON BED. Keep one hip and knee flexed naturally with the raised leg supported by the mattress while the other leg rests in a comfortable position. Preserve realistic pelvis rotation, torso counterbalance, ankle orientation, and mattress deformation beneath the supporting leg and pelvis. Never enlarge or shorten the raised leg to fit the crop.',
    bedroom_holding_pillow:'POSE REALISM — SEATED HOLDING PILLOW/BLANKET. The seated base must remain physically credible first. The free hand and forearm then support the real weight of the pillow or blanket with believable finger contact, elbow angle, wrist position, fabric compression, and gravity-driven sag. The prop must not float or remain perfectly undeformed.',
    bedroom_lying_pillow:'POSE REALISM — LYING ON PILLOW. The head and neck must be supported by the pillow with believable local compression and slight soft-tissue contact effects. Shoulders, back, pelvis, and legs must settle into the mattress according to gravity. Hair spreads or compresses only where it contacts the pillow. Avoid a rigid straight neck, hovering head, or body floating above bedding.',
    bedroom_lying_side:'POSE REALISM — LYING ON SIDE. The lower shoulder, side of torso, hip, and leg must bear realistic load against the mattress. The pillow supports the head so the cervical spine remains plausible rather than sharply bent. Allow mild body curvature, natural leg offset, compressed lower-side clothing, and bedding folds that respond to the side-lying body mass.'
  };

  function selected(){return MAP[pose()]||MAP.bedroom_standing_beside}

  function compliance(){
    return 'POSE REALISM COMPLIANCE CHECK — REQUIRED BEFORE OUTPUT. Verify the selected posture by tracing the physical support chain from body to environment. Confirm center of mass, joint limits, foot/hip/back/head support, gravity direction, mattress or pillow compression, contact shadows, clothing folds, and camera perspective. Confirm that the exact identity and fixed body proportions were not altered to make the pose easier. If anything is mechanically impossible, revise only camera distance, crop, unspecified limb micro-position, or contact placement while preserving the selected pose itself.';
  }

  function installHint(){
    var p=document.querySelector('.picker[data-key="pose"]');
    var f=p&&p.closest('.field');
    if(!f)return;
    var h=document.getElementById('bedroomPosePhysicalRealismHint');
    if(!h){
      h=document.createElement('small');h.id='bedroomPosePhysicalRealismHint';h.className='historyHint';
      h.style.display='block';h.style.marginTop='6px';h.style.lineHeight='1.6';
      f.appendChild(h);
    }
    h.textContent='واقعية قصوى فعالة: توزيع الوزن، المفاصل، التلامس، ضغط السرير والوسائد، الجاذبية وطيات الملابس تُحل تشريحيًا لكل وضعية.';
  }

  window.buildFinal=function(){
    var base=oldFinal?oldFinal():'';
    return UNIVERSAL+'\n\n'+selected()+'\n\n'+CONTACT+'\n\n'+CLOTHING+'\n\n'+base+'\n\n'+compliance();
  };

  window.buildNegative=function(){
    var base=oldNegative?oldNegative():'';
    var x=['physically impossible body pose','floating body above bed or floor','missing body support','impossible center of mass','locked mannequin posture','perfectly symmetrical body pose','hyperextended knee','impossible hip rotation','impossible ankle rotation','disconnected limb','shortened limb to fit frame','stretched limb to fit frame','body clipping through mattress','body clipping through furniture','missing mattress compression','missing pillow compression','rigid bedding under body weight','floating pillow or blanket','weightless clothing folds','clothing hiding anatomy error','camera perspective distorting body proportions','pose changing identity or body build'];
    return (base?base+', ':'')+x.join(', ');
  };

  function boot(){installHint();setTimeout(installHint,200);setTimeout(installHint,650)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
