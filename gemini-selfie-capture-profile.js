(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function gemini(){return String(S().platform||'').toLowerCase()==='gemini'}
  function val(x){return String(x==null?'':x).trim()}
  function isAuto(x){var t=val(x).toLowerCase();return !t||t==='__auto_prompt__'||t==='auto'||/^auto\b/.test(t)||/تلقائي/.test(t)}

  function armRule(){
    var v=val(S().selfieArmVisibility);
    if(v==='bedroom_arm_hidden')return 'CAMERA-ARM VISIBILITY: FULLY HIDDEN. Keep the complete camera-holding upper arm, elbow, forearm, wrist, hand, fingers, and phone outside the captured frame. Preserve the handheld-selfie perspective through reachable phone placement and crop, never by showing a long foreground arm.';
    if(v==='bedroom_arm_subtle')return 'CAMERA-ARM VISIBILITY: SUBTLE NATURAL EDGE VISIBILITY. If physically useful, allow only a small naturally cropped shoulder or upper-arm/forearm fragment at a lower or side edge. Never show a long diagonal arm, giant foreground forearm, wrist, hand, fingers, or phone.';
    return 'CAMERA-ARM VISIBILITY: FOLLOW THE CURRENT BEDROOM ARM CONTROL. Keep the phone outside the image and resolve arm visibility exactly from that control.';
  }

  function selectedAngleRule(){
    var a=val(S().angle);
    if(a==='bedroom_angle_high')return 'Keep the reference-like close handheld feel, but place the phone only modestly above the eye line and pitch it gently downward. Do not turn it into a steep overhead angle.';
    if(a==='bedroom_angle_low')return 'Keep the same close handheld selfie distance, but place the phone only modestly below eye level. Avoid exaggerated chin/nostril perspective or a dramatically low camera.';
    if(a==='bedroom_angle_eye_34')return 'Keep the phone near eye level with the same close arm-length distance while allowing the selected natural three-quarter head turn.';
    if(a==='bedroom_angle_overhead')return 'Preserve the close arm-length handheld character while moving the phone above the face only as much as the selected lying pose requires. It must still read as self-held, never ceiling-mounted.';
    if(a==='bedroom_angle_side_bed')return 'Preserve the close arm-length handheld character with a modest lateral offset near bed level, not a distant side-camera viewpoint.';
    return 'Use an eye-level to very slightly-above-eye-level front-camera position with only a mild casual side offset, matching an ordinary one-handed selfie rather than a centered portrait-camera setup.';
  }

  function frameRule(){
    var f=val(S().frame);
    if(!isAuto(f))return 'FRAMING: preserve the explicit selected framing control exactly, while keeping the same natural close handheld selfie character and avoiding a long visible camera arm.';
    return 'FRAMING DEFAULT: use a casual vertical smartphone selfie crop showing the complete head, both shoulders, upper chest, and a modest amount of upper torso. Keep the face clearly readable but not filling the entire frame. Place the head slightly off-center with ordinary handheld asymmetry; allow a small natural shoulder/body crop at an edge. Do not frame it like a studio portrait or a distant full-body photo.';
  }

  function profile(){
    return [
      'GEMINI BEDROOM SELFIE CAPTURE PROFILE — MANDATORY DEFAULT GEOMETRY. Match the CAPTURE METHOD of the supplied example selfie, not the person, clothing, lighting, expression, or background shown in that example. The result must feel like a normal one-handed front-camera smartphone selfie taken by the subject himself at a comfortable arm-length distance.',
      'SELFIE DISTANCE AND PHONE POSITION — MANDATORY DEFAULT. Place the front camera at a physically reachable one-handed selfie distance, approximately 45–55 cm from the face unless an explicit higher-priority selection requires a small adjustment. Keep the phone close enough for genuine smartphone wide-angle perspective but far enough to avoid an oversized nose, giant hand, or extreme facial distortion. The virtual phone sits just outside the captured frame and is not visible.',
      'HANDHELD VIEWPOINT — MANDATORY. Use a natural eye-level to slightly-above-eye-level lens height as the baseline, with a very small casual horizontal offset and only mild phone roll. The camera should not sit perfectly centered on a rigid portrait axis. Preserve ordinary handheld imperfection without making the horizon obviously crooked.',
      selectedAngleRule(),
      frameRule(),
      armRule(),
      'PERSPECTIVE CHARACTER — MANDATORY. Keep mild front-camera wide-angle foreshortening, restrained edge distortion, natural shoulder perspective, and a believable camera-to-face relationship. Do not stretch the torso or limbs to fill the frame. Do not use a distant photographer viewpoint, tripod perspective, mirror-selfie viewpoint, telephoto portrait compression, or an exaggerated ultra-wide action-camera look.',
      'SUBJECT RELATION TO CAMERA — MANDATORY. Keep the face generally oriented toward the front camera with a natural small head/neck asymmetry appropriate to the selected pose and angle. The gaze and expression must follow their explicit controls. Do not force a fashion pose, perfectly squared shoulders, or a symmetrical passport-photo stance.',
      'PRIORITY RULE — ABSOLUTE. This capture profile controls only unspecified selfie mechanics: camera-to-face distance, exact phone position, mild roll, crop refinement, and handheld perspective. Any explicit user-selected pose, selfie angle, framing, gaze, expression, camera-arm visibility, lighting, clothing, room state, identity lock, or body lock outranks this profile and must remain unchanged.'
    ].join('\n\n');
  }

  window.buildFinal=function(){
    var base=previousFinal?previousFinal():'';
    if(!gemini())return base;
    return profile()+'\n\n'+base;
  };

  window.buildNegative=function(){
    var base=previousNegative?previousNegative():'';
    if(!gemini())return base;
    var x=[
      'distant third-person portrait viewpoint','tripod selfie perspective','mirror-selfie viewpoint unless explicitly selected','phone visible in ordinary front-camera selfie','long diagonal camera arm dominating frame','giant foreground forearm','giant foreground hand','extreme arm-length distortion','oversized nose from excessively close camera','telephoto portrait compression','DSLR portrait framing','perfectly centered studio composition','rigid squared shoulders','steep overhead angle replacing selected mild angle','dramatic low angle replacing selected mild angle','selected selfie control overridden by Gemini capture profile'
    ];
    return (base?base+', ':'')+x.join(', ');
  };
})();