(function(){
  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;

  function V(){try{return typeof smartValues==='function'?smartValues():(typeof state==='object'&&state?state:{})}catch(e){return {}}}
  function raw(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function page(){return (location.hash||'').replace(/^#/,'').toLowerCase()}
  function allText(v){return ((v.idea||'')+' '+(v.camera||'')+' '+(v.angle||'')+' '+(v.distance||'')+' '+(v.pose||'')+' '+(v.location||'')).toLowerCase()}
  function selfie(v){return /سيلفي|selfie|front camera|front-facing|front facing|الكاميرا الأمامية|الكاميرا الامامية|كاميرا أمامية|كاميرا امامية/.test(allText(v))||!!v.angle}
  function frontCamera(v){return /front camera|front-facing|front facing|الكاميرا الأمامية|الكاميرا الامامية|كاميرا أمامية|كاميرا امامية|iphone|xiaomi|smartphone|phone/.test(String(v.camera||'').toLowerCase())}
  function bedroom(v){return page()==='bedroom'||!!v.roomLock||/غرفة النوم|غرفه النوم|bedroom/.test(allText(v))}
  function cameraName(v){var c=String(v.camera||'').trim();return c||'the selected smartphone front camera'}
  function visibleHandRequested(v){var f=String((raw().freeHandPose||v.freeHandPose||'')).toLowerCase();return !!f&&!/__auto_prompt__|auto/.test(f)}

  function realismBlock(v){
    var blocks=[];
    blocks.push('AUTHENTIC SMARTPHONE SELFIE REALISM — ABSOLUTE PRIORITY. Render the image as an ordinary real photograph captured through '+cameraName(v)+', not as a digital artwork, beauty render, commercial portrait, cinematic still, or synthetic demonstration image. Preserve all explicit user selections. Realism must come from physically coherent camera behavior, anatomy, materials, lighting, and small capture imperfections rather than from adding decorative detail.');
    blocks.push('NATURAL RANDOMNESS WITHOUT IDENTITY DRIFT — MANDATORY. Use subtle real-world irregularity only in transient photographic details: tiny exposure imbalance, mild framing imperfection, slight nonuniform sharpness, natural fabric micro-folds, ordinary surface wear, small background variation, sensor noise, and believable shadow variation. Do NOT create randomness by changing the person\'s face, hair, hairline, beard pattern, age, body proportions, or locked room/vehicle identity.');
    blocks.push('FACE AND SKIN MICRO-REALISM — MANDATORY. Preserve visible non-uniform skin texture, natural pores, vellus hair where plausible, subtle dry/oily variation, beard-density variation, tiny ordinary imperfections, realistic subsurface color variation, and scene-appropriate skin sheen. Do not smooth, beautify, airbrush, wax, porcelainize, symmetrize, or cosmetically perfect the face. Preserve the reference person\'s existing natural asymmetry exactly; never invent new facial asymmetry as a realism trick.');
    blocks.push('EYES AND CATCHLIGHT PHYSICS — MANDATORY. Eye reflections and catchlights must come only from actual visible or physically justified light sources in the selected scene. Keep corneal reflections small, irregular, perspective-correct, and consistent between the two eyes without making them perfectly identical. Preserve realistic sclera tone, eyelid contact shadows, tear-line detail, and natural focus; no glowing eyes or studio catchlights without a source.');
    blocks.push('POSE AND EXPRESSION NATURALISM — MANDATORY. The selected pose and expression must feel unposed and mechanically possible: realistic center of gravity, ordinary shoulder asymmetry, natural neck tension, believable spine and pelvis alignment, plausible elbow and wrist ranges, and small human posture imperfections. Do not create mannequin stiffness, fashion-model posing, hyper-correct symmetry, or impossible joint geometry.');
    blocks.push('VISIBLE HAND ANATOMY — MANDATORY WHEN ANY HAND IS VISIBLE. Keep exactly five fingers per hand, anatomically correct palm and thumb placement, natural knuckles, believable finger-length hierarchy, relaxed tendon tension, realistic nail beds, ordinary cuticle detail, correct joint bends, and physically plausible contact with clothing or objects. Do not add extra fingers, fused fingers, duplicated fingertips, melted nails, rubber fingers, or pasted-looking hands.');
    blocks.push('CLOTHING AND CONTACT PHYSICS — MANDATORY. Clothing must respond to gravity, posture, body contact, mattress/chair contact when applicable, and arm/torso movement with realistic fabric weight, compression, sleeve tension, folds, wrinkles, seam behavior, and soft contact shadows. Do not use painted-on fabric, perfectly repeated folds, floating cloth, or wrinkle patterns unrelated to body mechanics.');
    blocks.push('PHYSICALLY MOTIVATED LIGHTING ONLY — ABSOLUTE PRIORITY. Use only the user-selected or scene-justified light sources. Preserve realistic inverse-square falloff, directional shadow logic, imperfect exposure, limited dynamic range, plausible white balance, local highlight clipping, naturally darker regions, and ordinary bounce light from real surfaces. Avoid studio lighting, cinematic rim light, beauty fill, unreal glow, perfectly even illumination, or dramatic light with no physical source.');
    if(frontCamera(v)){
      blocks.push('SMARTPHONE FRONT-CAMERA PIPELINE — ABSOLUTE PRIORITY. Simulate the selected phone front-camera look rather than a DSLR portrait look: realistic wide-angle perspective, modest edge softness, mild lens distortion, slight chromatic aberration only where plausible, phone-style sharpening, HDR that is helpful but imperfect, local highlight clipping, shadow noise, fine luminance noise, occasional mild chroma noise in low light, subtle compression, and imperfect auto white balance. Keep depth of field consistent with a real front-facing smartphone camera; do not force DSLR-like f/1.8 shallow depth of field or artificial portrait-mode blur unless the user explicitly asks for it and the device/scene plausibly supports it.');
      blocks.push('UNEDITED PHONE-CAPTURE CHARACTER — MANDATORY. The result should feel like an authentic unedited smartphone photograph: no beauty filter, no skin retouching, no artificial face sharpening, no overprocessed HDR, no perfect denoise, no fake film grain overlay, no fake RAW aesthetic, and no commercial color grading.');
    }
    if(bedroom(v)){
      blocks.push('BEDROOM SELFIE COMPATIBILITY — MANDATORY. Keep every realism rule compatible with the locked bedroom controls and the bedroom selfie framing lock. The phone-holding arm, forearm, wrist, hand, and phone remain outside the captured image when that bedroom rule is active. Do not reintroduce a visible selfie arm merely to demonstrate perspective or foreshortening. Any visible free hand must still follow the hand-anatomy rule above.');
    }
    if(visibleHandRequested(v)){
      blocks.push('FREE-HAND CONTACT REALISM — MANDATORY. Because a visible free-hand gesture is selected, preserve natural finger spacing, realistic skin compression at contact points, plausible knuckle orientation, correct contact shadows, and believable interaction with the chest, hair, clothing, cup, steering wheel, or other selected object.');
    }
    blocks.push('REALISM COMPLIANCE CHECK — REQUIRED BEFORE RENDERING. Inspect the final image for synthetic-looking perfection, cloned textures, repeated pores, identical catchlights, waxy skin, over-smooth fabric, impossible anatomy, floating objects, fake blur, unexplained light, perfect bilateral symmetry, uniform noise, and over-clean backgrounds. Correct those by improving physical coherence, not by altering locked identity or explicit user selections.');
    return blocks.join('\n\n');
  }

  window.buildFinal=function(){
    var base=previousFinal?previousFinal():'';
    var v=V();
    if(!selfie(v))return base;
    return realismBlock(v)+'\n\n'+base;
  };

  window.buildNegative=function(){
    var base=previousNegative?previousNegative():'';
    var v=V();
    if(!selfie(v))return base;
    var x=[
      'beauty filter','airbrushed skin','plastic skin','waxy skin','porcelain skin','uniform pores','repeating skin texture','invented facial asymmetry','changed identity for realism','perfect bilateral facial symmetry','identical artificial catchlights','glowing eyes','studio catchlight without source','cinematic rim light','beauty fill light','unmotivated light source','perfectly even exposure','fake HDR glow','DSLR-style fake shallow depth of field on front-camera selfie','artificial portrait-mode blur without request','perfectly clean low-light image','uniform fake grain','overprocessed sharpening','commercial color grading','mannequin pose','impossible joint bend','extra fingers','fused fingers','duplicated fingertips','melted fingernails','floating hand','painted-on clothing','repeating fabric folds','floating fabric','cloned texture','repeating background pattern','synthetic showroom cleanliness'
    ];
    return (base?base+', ':'')+x.join(', ');
  };
})();