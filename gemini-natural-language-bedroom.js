(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function isGemini(){return String(S().platform||'').toLowerCase()==='gemini'}
  function text(v,f){var s=String(v==null?'':v).trim();return s||f||'unspecified'}
  function humanize(v){return text(v).replace(/^bedroom_/,'').replace(/_/g,' ')}

  var ANGLE={
    bedroom_angle_high:'the phone is held slightly above forehead level and tilted gently downward',
    bedroom_angle_very_high:'the phone is held clearly above head level within a physically reachable one-handed selfie arc and angled downward',
    bedroom_angle_low:'the phone is held modestly below eye level for a casual low-angle selfie',
    bedroom_angle_eye_34:'the phone stays near eye level while the face is presented naturally in a three-quarter view',
    bedroom_angle_eye_front:'the phone stays near eye level for a straightforward front-facing selfie',
    bedroom_angle_overhead:'while lying down, the phone is held above the face within a realistic reachable arc for an overhead selfie',
    bedroom_angle_side_bed:'the phone is held at a relaxed side offset near bed level',
    bedroom_angle_high_34:'the phone is held modestly above eye level and slightly to one side for a high three-quarter selfie',
    bedroom_angle_eye_offset:'the phone remains around eye level but shifts slightly to one side so the face sits naturally off-center',
    bedroom_angle_seated_down:'while seated, the phone is held modestly above and diagonally forward for a believable downward selfie',
    bedroom_angle_shoulder_side:'the phone is held around shoulder-to-eye height with a modest lateral offset',
    bedroom_angle_dutch:'the phone remains at a normal reachable selfie distance with only a mild accidental-looking roll of roughly 3–7 degrees',
    bedroom_angle_ground_low:'the phone is held as low as the selected pose can physically reach, close to mattress or floor level, and angled gently upward'
  };

  var CROP={
    bedroom_crop_auto_hidden_arm:'use the least aggressive natural handheld crop needed to keep the entire camera-holding limb and phone outside the captured frame',
    bedroom_crop_extreme_closeup:'use an extreme close-up selfie crop focused mainly on the face, naturally ending around the neck or very upper shoulder line without digital-zoom softness',
    bedroom_crop_shoulders_up:'frame the selfie tightly from roughly the shoulders upward, cutting the entire camera-holding limb off at the image borders',
    bedroom_crop_tight_candid:'use a naturally tight candid selfie composition with the face occupying much of the frame while preserving believable bedroom context',
    bedroom_crop_low_tight:'with the selected low or very-low angle, use a tight composition whose lower border fully excludes the camera-holding limb and phone',
    bedroom_crop_half_face_side:'use an intentionally very tight lateral half-face crop while keeping central facial anatomy physically plausible and the camera-holding limb completely outside the image'
  };

  var POSE={
    bedroom_reclining_pillows:'The person is reclining naturally on the bed with the back and shoulders supported by the real pillows, keeping the pelvis supported by the mattress.',
    bedroom_sitting_edge:'The person is sitting naturally on the edge of the bed with the pelvis supported by the mattress edge and the legs arranged within ordinary human joint ranges.',
    bedroom_standing_beside:'The person is standing casually beside the bed with relaxed weight distribution and ordinary asymmetry.',
    bedroom_sitting_floor:'The person is sitting on the floor beside the bed with believable hip, knee, ankle, and floor contact.',
    bedroom_lying_pillow:'The person is lying naturally on the bed with the head and neck genuinely supported by the pillow.',
    bedroom_holding_pillow:'The person is sitting or reclining on the bed while naturally hugging one pillow or gathered blanket against the torso.',
    bedroom_peeking_blanket:'The person is lying or softly reclining in bed and peeking above the blanket so the eyes, eyebrows, and forehead remain clearly visible.',
    bedroom_laptop_book_bed:'The person is seated comfortably on the bed with exactly one ordinary open laptop or one open book resting plausibly on the lap or bedding as secondary context.',
    bedroom_crosslegged_bed:'The person is sitting casually cross-legged on the bed using ordinary comfortable hip and knee flexion rather than a staged yoga posture.',
    bedroom_leaning_headboard:'The person is leaning back naturally against the real headboard or supporting pillows with a clear physical support chain into the mattress.',
    bedroom_one_knee_bed:'The person is sitting on the bed with one knee raised naturally while the other leg remains comfortably supported.',
    bedroom_lying_side:'The person is lying naturally on one side with the lower shoulder, torso, hip, and leg supported by the mattress and the head supported by the pillow.',
    bedroom_standing_curtain:'The person is standing naturally near the existing far-wall curtain and the real window behind it without changing the room geometry.',
    bedroom_standing_wardrobe:'The person is standing casually near the existing wardrobe and dressing area with realistic clearance from doors, drawers, shelves, and hanging clothes.'
  };

  function angleSentence(s){return 'For the selfie geometry, '+(ANGLE[s.angle]||('use the selected selfie angle: '+humanize(s.angle)))+'. The result must still read unmistakably as a genuine Xiaomi 15 Ultra front-camera selfie, not as a third-person photograph.'}
  function cropSentence(s){return 'For framing, '+(CROP[s.bedroomSelfieCrop]||('use the selected selfie crop exactly: '+humanize(s.bedroomSelfieCrop)))+'. The crop is authoritative and may not be replaced by wider automatic framing.'}
  function poseSentence(s){return POSE[s.pose]||('Use the selected person pose exactly: '+humanize(s.pose)+'.')}

  function narrative(){
    var s=S();
    var expression=text(s.expression||s.bedroomExpression,'a neutral relaxed closed-mouth expression');
    var hand=text(s.freeHandPose||s.bedroomHandPose,'a naturally resolved free-hand position');
    var clothing=text(s.clothing||s.bedroomClothingSuggestion,'simple comfortable home clothing');
    var lighting=text(s.bedroomLighting,'physically coherent bedroom lighting');
    var clutter=text(s.bedroomClutter,'natural realistic clutter');
    var bed=text(s.bedroomBedCondition,'a partially made, naturally lived-in bed');
    var condition=text(s.bedroomImageCondition,'a candid minimally processed phone-photo condition');
    var color=text(s.bedroomColorTone,'raw natural smartphone color');

    return [
      'GEMINI NATURAL-LANGUAGE SCENE DESCRIPTION — READ THIS AS ONE COHERENT PHOTOGRAPHIC SCENE. Create an ordinary, highly realistic, minimally processed-looking smartphone selfie inside the locked reference bedroom. The photograph should feel like a real handheld Xiaomi 15 Ultra front-camera capture rather than a polished illustration, render, studio portrait, editorial photograph, or collection of disconnected prompt keywords.',
      angleSentence(s)+' '+cropSentence(s)+' '+poseSentence(s)+' The camera-holding arm and the phone physically exist outside the captured frame and no part of that arm, forearm, wrist, hand, fingers, or phone may appear in the image.',
      'Keep the referenced person exactly the same individual while applying '+expression+'. The free hand should follow this resolved position: '+hand+'. The selected clothing is '+clothing+'. Treat expression as temporary facial-muscle activity only, clothing as fabric draped over the fixed body, and camera perspective as optical geometry; none of these may reshape facial identity or body proportions.',
      'Preserve the same bedroom identity and geometry. The selected room-clutter state is '+clutter+', while the selected bed condition is '+bed+'. These are separate controls: bedding arrangement must not secretly change the clutter level elsewhere in the room. All contact with the mattress, pillow, blanket, floor, headboard, wardrobe, or other existing surfaces must show believable weight, pressure, folds, contact shadows, gravity, and spacing.',
      'Light the scene using '+lighting+'. Treat this as a real physical light source or real combination of selected sources with plausible direction, falloff, shadow placement, reflection, exposure limits, and interaction with skin, fabric, walls, mirrors, and furniture. Record the image with '+condition+' and '+color+'. Camera noise, softness, white-balance error, compression, chromatic aberration, flare, or motion softness may appear only when physically justified by the selected image condition and lighting.',
      'Crucial instruction: follow the resolved selections literally and do not fill the scene with decorative inventions. Avoid CGI or 3D-render appearance, overly smooth skin or materials, perfect symmetry, cinematic or studio lighting, glamour retouching, artificial depth-of-field styling, invented props, extra people, extra light sources, or any supposedly helpful enhancement that was not selected. Preserve natural imperfections and ordinary smartphone photographic behavior.'
    ].join('\n\n');
  }

  window.buildFinal=function(){
    var base=oldFinal?oldFinal():'';
    if(!isGemini())return base;
    return narrative()+'\n\n'+base;
  };

  window.buildNegative=function(){
    var base=oldNegative?oldNegative():'';
    if(!isGemini())return base;
    var x=['Gemini keyword-stuffing style','disconnected comma-only scene description','natural-language scene description ignored','spatial relationship ignored','selected selfie crop ignored','automatic wider framing replacing selected crop','third-person composition replacing selfie','decorative invention filling unspecified details'];
    return (base?base+', ':'')+x.join(', ');
  };
})();