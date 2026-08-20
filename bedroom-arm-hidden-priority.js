(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var ARM_SUBTLE='bedroom_arm_subtle';
  var ARM_HIDDEN='bedroom_arm_hidden';
  var ARM_AUTO='bedroom_arm_auto';
  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function armVisibility(){
    var v=String(S().selfieArmVisibility||'');
    if(v===ARM_HIDDEN||v===ARM_AUTO||v===ARM_SUBTLE)return v;
    return ARM_SUBTLE;
  }

  function sanitize(text){
    var out=String(text||'');
    var blockedHeaders=[
      'FRONT-CAMERA VIEWPOINT INDEPENDENCE —',
      'FRONT-FACING PHONE CAMERA LENS SIMULATION —',
      'REFERENCE IMAGE ROLE —',
      'IDENTITY FREEZE —',
      'ABSOLUTE IDENTITY FREEZE —',
      'BODY CONSTANTS —',
      'PRIMARY SUBJECT BODY LOCK —',
      'BEDROOM REFERENCE IDENTITY LOCK —',
      'BEDROOM BODY LOCK —',
      'AUTOMATIC SELFIE ANGLE, POSE PRESENTATION, AND EXPRESSION DIRECTOR —',
      'BODY POSTURE —',
      'CAMERA-HOLDING ARM EXCLUSION —',
      'BEDROOM SELFIE FRAMING LOCK —',
      'BEDROOM SELFIE COMPATIBILITY —',
      'TRUE SELF-TAKEN BEDROOM SELFIE —',
      'TRUE SELFIE MECHANICS COMPLIANCE CHECK —'
    ];
    out=out.split(/\n\n+/).filter(function(block){
      var t=block.trim();
      return !blockedHeaders.some(function(h){return t.indexOf(h)===0});
    }).join('\n\n');

    var blocked=[
      /the camera-holding arm[^\n]*must[^\n]*appear[^\n]*/gi,
      /the phone-holding arm[^\n]*must[^\n]*appear[^\n]*/gi,
      /show[^\n]*(?:camera-holding|phone-holding)[^\n]*(?:arm|forearm|hand)[^\n]*/gi,
      /hand slightly closer to the lens[^\n]*/gi,
      /visible foreshortening of the (?:camera-holding|phone-holding) arm[^\n]*/gi,
      /extended arm visible[^\n]*/gi,
      /the camera viewpoint exists independently in front of the subject[^\n]*/gi,
      /treat the selected phone front-facing camera as a virtual optical viewpoint only[^\n]*/gi,
      /the hidden camera-holding arm must remain outside the captured frame\./gi,
      /keep the camera-holding limb outside the captured frame\./gi,
      /while keeping the camera-holding arm fully outside the image\./gi,
      /\bHeight is 193 cm\.\s*Weight is (?:83|88) kg\.[^\n]*/gi,
      /\b193 cm\s*\/\s*(?:83|88) kg\b/gi
    ];
    blocked.forEach(function(re){out=out.replace(re,'')});
    return out.replace(/\n{3,}/g,'\n\n').trim();
  }

  function sanitizeNegative(text){
    var remove=[
      'forced phone-holding arm',
      'visible arm inferred only from camera selection',
      'extended forearm toward camera without explicit request',
      'manual bedroom selfie angle overriding automatic camera direction',
      'manual selfie angle overriding automatic bedroom camera',
      'visible phone-holding arm in bedroom selfie',
      'visible selfie forearm',
      'visible selfie wrist',
      'visible selfie hand',
      'partial camera-holding arm entering from a corner',
      'visible camera-holding upper arm',
      'visible camera-holding elbow',
      'visible camera-holding forearm',
      'visible camera-holding wrist',
      'visible camera-holding hand',
      'visible camera-holding fingers',
      'partial selfie arm entering from frame edge',
      'partial selfie hand entering from frame corner',
      'foreground selfie forearm'
    ];
    return String(text||'')
      .split(',')
      .map(function(x){return x.trim()})
      .filter(function(x){return x&&remove.indexOf(x)===-1})
      .join(', ');
  }

  var IDENTITY='BEDROOM REFERENCE IDENTITY LOCK — HIGHEST PRIORITY FOR CHATGPT AND GEMINI. Use the supplied person reference image as the identity source only. Preserve the exact same person with complete identity stability. It is strictly forbidden to change, reinterpret, enhance, beautify, optimize, reconstruct, or reshape any facial or head detail. Preserve exactly the same face shape, facial proportions, facial bone structure, forehead, temples, jaw, chin, cheeks, cheekbones, nose, nostrils, eyes, eyelids, eyebrows, lips, ears, skin tone, apparent age, natural facial asymmetry, hairstyle, hairline, hair density, natural hair direction, beard, mustache, and every distinctive facial detail visible in the reference. Do not slim or widen the face, alter the jaw or nose, enlarge or reduce the eyes, change the hairline, restyle the hair, redesign the beard, rejuvenate the person, symmetrize the face, smooth away defining features, or invent permanent marks that do not exist in the reference. The identity reference must NOT control pose, selfie angle, crop, lighting, clothing, expression, body posture, or bedroom environment unless the user explicitly selects those separately.';

  var BODY='BEDROOM BODY LOCK — ABSOLUTE FIXED CONSTANTS. Height is exactly 193 cm. Weight is exactly 83 kg. Build is Lean Athletic with naturally low but realistic body fat, proportionate athletic musculature, correct anatomical balance, realistic shoulder width, torso length, pelvis scale, limb lengths, joint placement, and overall silhouette. Preserve these proportions consistently while standing, seated, reclining, sitting on the floor, or lying on the bed. Do not make the person shorter, taller, thinner, heavier, broader, bulkier, more muscular, more shredded, compressed, stretched, widened, shortened, or anatomically exaggerated to satisfy framing. Camera perspective, crop, pose, mattress contact, and clothing must adapt to the fixed body, never the reverse.';

  var GEOMETRY='BEDROOM SELECTED POSE AND ANGLE LOCK — HIGHEST PRIORITY. The bedroom pose and selfie camera angle selected in the user-facing controls are explicit hard constraints. Preserve exactly one selected pose and exactly one compatible selected angle. Do not replace the selected angle with an automatically preferred angle and do not combine high-angle, low-angle, eye-level, overhead, or side-bed-level viewpoints in one image. Camera-to-face distance, tiny roll, exact crop, and exact phone position may adapt automatically only to make the selected pose and selected angle physically possible. Mirror-selfie behavior is excluded from this ordinary front-camera bedroom mode.';

  function angleArmRule(){
    var a=String(S().angle||'').toLowerCase();
    if(/bedroom_angle_high/.test(a))return 'ANGLE-SPECIFIC ARM GEOMETRY — HIGH ANGLE. Raise the camera arm only modestly. Keep the shoulder relaxed rather than shrugged toward the ear, retain a soft elbow bend, and allow a small shoulder or forearm fragment at a lower corner only when the visibility setting permits it. Never place the elbow in the middle of the image.';
    if(/bedroom_angle_low/.test(a))return 'ANGLE-SPECIFIC ARM GEOMETRY — LOW ANGLE. Extend the camera arm forward and slightly upward with a relaxed shoulder and natural neck position. Preserve a soft elbow bend and avoid the short-arm illusion, oversized hand, or exaggerated near-lens forearm.';
    if(/bedroom_angle_eye_34/.test(a))return 'ANGLE-SPECIFIC ARM GEOMETRY — EYE-LEVEL THREE-QUARTER. Automatically use the camera-holding side that is most mechanically natural for the selected head turn, normally the hand opposite the face-turn direction. Keep the shoulder and wrist relaxed and prevent the camera-side limb from crossing the face.';
    if(/bedroom_angle_overhead/.test(a))return 'ANGLE-SPECIFIC ARM GEOMETRY — OVERHEAD WHILE LYING. Raise the arm above or slightly beside the face at a comfortable reachable distance, keeping a soft elbow bend and preventing the hand or forearm from becoming a huge foreground object. Any visible limb fragment must stay near an edge.';
    if(/bedroom_angle_side_bed/.test(a))return 'ANGLE-SPECIFIC ARM GEOMETRY — SIDE BED LEVEL. Use a comfortable lateral reach. When visibility permits, a little more of the camera-side shoulder or upper arm may naturally appear along the side edge, but it must not dominate the composition.';
    return 'ANGLE-SPECIFIC ARM GEOMETRY — EYE LEVEL. Extend the camera arm diagonally forward at a comfortable arm-length distance with a low relaxed shoulder, soft elbow bend, and neutral or slightly tilted wrist. When visibility permits, only a small shoulder or forearm fragment may enter near an edge.';
  }

  function visibilityRule(){
    var v=armVisibility();
    if(v===ARM_HIDDEN)return 'CAMERA-HOLDING ARM VISIBILITY — FULLY HIDDEN. The person still physically holds the phone at arm length, but the complete camera-side shoulder continuation, upper arm, elbow, forearm, wrist, hand, fingers, and phone must remain outside the captured image. Solve this only through reachable phone placement, crop, and field coverage. Do not distort anatomy to hide the limb.';
    if(v===ARM_AUTO)return 'CAMERA-HOLDING ARM VISIBILITY — AUTOMATIC BY SELECTED ANGLE. Decide whether the camera-side limb should be fully hidden or whether a small naturally cropped shoulder, upper-arm, forearm, or elbow-edge fragment should appear to strengthen handheld-selfie realism. Never show the entire arm. Never let it enter the central face area. The phone itself must always remain outside the captured image.';
    return 'CAMERA-HOLDING ARM VISIBILITY — SUBTLE NATURAL EDGE VISIBILITY. A small naturally cropped part of the camera-side shoulder, upper arm, forearm, or elbow edge should be allowed when physically consistent with the selected angle. Keep it near a frame edge or corner. Do not show the entire arm. Do not let the wrist, palm, fingers, or forearm cover the cheek, mouth, nose, or eyes. The phone itself must always remain outside the captured image.';
  }

  function selfieRule(){
    return 'TRUE SELF-TAKEN BEDROOM SELFIE — HIGHEST PRIORITY FOR CHATGPT AND GEMINI. The final image MUST be an actual self-taken front-camera selfie: the person is physically photographing himself with the smartphone that he personally holds in the camera-holding hand. The camera viewpoint must originate from a physically reachable phone position at real arm length, never from another person, tripod, remote camera, ceiling-mounted camera, or professional photographer viewpoint. Engineer the camera arm as a normal relaxed human limb with fixed anatomical segment lengths. Preserve shoulder socket position, clavicle alignment, upper-arm length, elbow position, forearm length, wrist orientation, palm scale, and a believable unseen phone grip. Extend the arm comfortably with a soft natural elbow bend rather than a rigid straight line. Keep the camera-side shoulder relaxed and generally low, allowing only the small forward or upward movement required by the selected angle. Keep the wrist neutral or slightly tilted within a normal range. Wide-angle perspective may enlarge a near limb segment slightly, but never create a giant hand or dominant foreground forearm. The arm must never cover the face. A natural frame-edge crop through the arm or elbow is acceptable when the visibility setting permits it. Do not display the whole arm merely to prove the image is a selfie. Never stretch, shorten, telescope, inflate, detach, or reshape anatomy to satisfy framing. '+visibilityRule()+' '+angleArmRule();
  }

  function complianceCheck(){
    var v=armVisibility();
    var vis=v===ARM_HIDDEN?'the camera-holding limb is completely outside the frame':v===ARM_AUTO?'arm visibility is naturally resolved from the selected angle without ever showing the full limb':'only a small natural camera-side limb fragment appears near an edge when physically justified';
    return 'TRUE SELFIE MECHANICS COMPLIANCE CHECK — REQUIRED IMMEDIATELY BEFORE RENDERING. Confirm simultaneously that: (1) the person is clearly photographing himself with a physically reachable front-camera phone position; (2) the camera arm uses normal shoulder, elbow, forearm, and wrist biomechanics with a relaxed shoulder and soft elbow bend; (3) '+vis+'; (4) the phone itself is completely outside the captured image; (5) no camera-side wrist, palm, fingers, or forearm covers the face; (6) no visible limb segment is enlarged into an unnatural foreground mass; and (7) the exact selected bedroom pose and compatible selected selfie angle are preserved. If any condition fails, revise only camera distance, crop, phone placement, or unspecified composition details. Do not alter identity, body proportions, clothing, selected pose, or selected angle.';
  }

  var IDCHECK='BEDROOM IDENTITY AND BODY COMPLIANCE CHECK — REQUIRED IMMEDIATELY BEFORE RENDERING. Confirm that the generated person is the exact same identity as the reference with unchanged facial structure, hairstyle, hairline, beard, apparent age, skin tone, natural asymmetry, and distinctive details. Confirm that the fixed body constants are exactly 193 cm and 83 kg with a Lean Athletic build and naturally low but realistic body fat. Confirm that no camera, lighting, realism, pose, expression, clothing, or composition rule has altered identity or body proportions. If any conflict exists, preserve identity and the 193 cm / 83 kg body lock and revise only unspecified scene or camera details.';

  window.buildFinal=function(){
    var base=previousFinal?previousFinal():'';
    base=sanitize(base);
    return IDENTITY+'\n\n'+BODY+'\n\n'+GEOMETRY+'\n\n'+selfieRule()+'\n\n'+base+'\n\n'+complianceCheck()+'\n\n'+IDCHECK;
  };

  window.buildNegative=function(){
    var base=previousNegative?previousNegative():'';
    base=sanitizeNegative(base);
    var x=[
      'third-person portrait instead of selfie','another person holding the camera','tripod-like selfie perspective','remote camera perspective','professional photographer viewpoint','selfie perspective without believable arm reach','rigid perfectly straight selfie arm','shoulder shrugged unnaturally toward the ear','camera arm covering the face','wrist covering cheek mouth nose or eye','broken wrist angle','giant foreground hand','giant foreground forearm','elbow centered in the composition','full camera-holding arm unnecessarily displayed','visible phone in ordinary front-camera bedroom selfie','stretched selfie arm','telescoped selfie arm','rubbery selfie arm','anatomically impossible camera position','selected selfie angle ignored','selected bedroom pose ignored','two conflicting selfie angles','angle incompatible with selected pose','mirror selfie in ordinary front-camera bedroom mode','changed identity','different person','face replacement','face reinterpretation','beautified face','smoothed identity','changed face shape','changed facial proportions','changed jaw','changed chin','changed cheekbones','changed nose','changed eyes','changed eyebrows','changed lips','changed ears','changed skin tone','changed apparent age','changed hairstyle','changed hairline','changed hair density','changed beard pattern','changed mustache','invented permanent facial marks','identity drift','wrong height','wrong weight','88 kg body','body proportion drift','shortened body','stretched body','widened torso','bulkier body','exaggerated muscles','unnatural body proportions','distorted limb length','camera perspective changing body proportions'
    ];
    if(armVisibility()===ARM_HIDDEN)x=x.concat(['visible camera-side shoulder continuation','visible camera-holding upper arm','visible camera-holding elbow','visible camera-holding forearm','visible camera-holding wrist','visible camera-holding hand','partial camera-holding limb entering from a frame edge']);
    return (base?base+', ':'')+x.join(', ');
  };
})();