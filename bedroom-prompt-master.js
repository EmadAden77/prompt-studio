(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function V(){try{return typeof smartValues==='function'?smartValues():S()}catch(e){return S()}}
  function platform(){return String(S().platform||'chatgpt').toLowerCase()}
  function val(x){return String(x==null?'':x).trim()}
  function auto(x){var t=val(x).toLowerCase();return !t||t==='__auto_prompt__'||t==='auto'||/^auto\b/.test(t)||/تلقائي/.test(t)}
  function frontCamera(v){return /front camera|front-facing|front facing|xiaomi|smartphone|phone|كاميرا أمامية|كاميرا امامية|الكاميرا الأمامية|الكاميرا الامامية/i.test(val(v.camera))}

  function poseRule(v){
    var p=val(v.pose).toLowerCase();
    if(/seated|sitting|جالس/.test(p))return 'BODY POSTURE — SEATED. Keep the person naturally seated with believable pelvis support, spine alignment, shoulder balance, leg placement, and contact with the bed or chair. Let the automatic camera director choose the most natural front-camera angle for a seated selfie.';
    if(/lying|reclining|مستلقي|استلقاء/.test(p))return 'BODY POSTURE — LYING ON THE BED. Keep the person genuinely supported by the mattress and pillow with realistic gravity, body compression, neck support, shoulder and pelvis contact, clothing bunching, and no floating anatomy. Let the automatic camera director choose the most plausible front-camera angle for this supported position.';
    return 'BODY POSTURE — STANDING. Keep the person naturally standing with believable weight distribution, relaxed asymmetry, realistic shoulder and pelvis alignment, and ordinary posture. Let the automatic camera director choose the most natural front-camera angle for a standing selfie.';
  }

  function selectedRules(v){
    var out=[];
    if(val(v.clothing))out.push('SELECTED CLOTHING — HARD CONSTRAINT: '+val(v.clothing)+'. Preserve the selected garment type, colors, lengths, layers, and combination exactly. Do not substitute or recolor the clothing.');
    if(!auto(v.expression))out.push('SELECTED EXPRESSION — HARD CONSTRAINT: '+val(v.expression)+'.');
    if(!auto(v.gaze))out.push('SELECTED GAZE — HARD CONSTRAINT: '+val(v.gaze)+'.');
    if(!auto(v.bedroomLighting))out.push('SELECTED BEDROOM LIGHTING — HARD CONSTRAINT: '+val(v.bedroomLighting)+'.');
    if(!auto(v.bedroomClutter))out.push('SELECTED BEDROOM CLUTTER — HARD CONSTRAINT: '+val(v.bedroomClutter)+'.');
    if(val(v.time))out.push('SELECTED TIME — HARD CONSTRAINT: '+val(v.time)+'.');
    if(!auto(v.freeHandPose))out.push('SELECTED FREE-HAND GESTURE — HARD CONSTRAINT: '+val(v.freeHandPose)+'. This applies only to the free hand, never to the camera-holding hand.');
    return out;
  }

  function engine(v){
    var g=platform()==='gemini';
    var blocks=[];

    blocks.push((g?'GEMINI BEDROOM EXECUTION CONTRACT':'CHATGPT BEDROOM EXECUTION CONTRACT')+' — HIGHEST PRIORITY. Treat every explicit user selection and every rule marked HARD CONSTRAINT, ABSOLUTE, FIXED, LOCK, MANDATORY, or REQUIRED as a specification to execute, not as inspiration. Do not beautify, reinterpret, substitute, simplify, average, restyle, or silently ignore those constraints. Resolve only genuinely unspecified details.');

    blocks.push('REFERENCE IMAGE ROLE — ABSOLUTE. Use the person reference image as the one and only identity source for the person. It supplies identity only. Do not copy its pose, camera angle, crop, lighting, clothing, expression, or background unless separately selected by the user. The bedroom reference, when room lock is active, supplies room identity only and must not alter the person.');

    blocks.push('IDENTITY FREEZE — ABSOLUTE. Preserve exactly the same person: face shape, facial proportions, facial bones, forehead, jaw, chin, cheeks, nose, eyes, eyelids, eyebrows, lips, ears, skin tone, apparent age, natural asymmetry, hairstyle, hairline, hair density, natural hair direction, beard, mustache, and all distinctive facial details. Do not slim, widen, reshape, rejuvenate, age, symmetrize, beautify, retouch, replace, or reconstruct the face or head.');

    blocks.push('BODY CONSTANTS — FIXED. Height is 193 cm. Weight is 83 kg. Build is lean athletic with naturally low but realistic body fat, proportionate musculature, and anatomically correct balance. Preserve realistic limb lengths, shoulder width, torso proportions, pelvis scale, joint mechanics, and overall body silhouette. Never distort the body to satisfy framing.');

    blocks.push(poseRule(v));

    blocks.push('AUTOMATIC BEDROOM SELFIE CAMERA DIRECTOR — ABSOLUTE. The user chooses only the body posture. Automatically choose the most believable selfie shooting method, camera-to-face distance, camera height, yaw, pitch, roll, side offset, crop, horizon imperfection, and framing for that posture and the locked bedroom geometry. Prefer ordinary handheld smartphone composition over perfect symmetry, professional portrait composition, cinematic staging, or dramatic high/low angles.');

    blocks.push('CAMERA-HOLDING ARM EXCLUSION — ABSOLUTE. In every bedroom selfie, the camera-holding arm, forearm, elbow, wrist, hand, fingers, and phone must remain completely outside the captured image. Do not show even a partial camera-holding limb at any edge or corner. The virtual phone position must still be biomechanically plausible from the hidden shoulder geometry. If the requested framing would expose the camera-holding arm, adjust the virtual camera position, camera distance, crop, or amount of torso/background shown. Never lengthen, widen, telescope, straighten, inflate, detach, or distort the arm. Human anatomy has priority over composition.');

    if(frontCamera(v))blocks.push('SMARTPHONE FRONT-CAMERA CHARACTER — MANDATORY. Render this as a casual front-camera smartphone photo. When the selected/default device is Xiaomi 15 Ultra, emulate its 32 MP front camera, f/2.0 aperture, and approximately 90-degree field of view in a physically plausible way. Keep realistic wide-angle perspective, modest edge softness, mild optical distortion, natural autofocus on the face, phone-style sharpening, limited dynamic range, plausible HDR behavior, ordinary white balance, realistic compression, and scene-appropriate sensor noise. Do not convert the image into a DSLR portrait, studio shot, cinematic still, or professional beauty portrait.');

    blocks.push('RAW PHOTOGRAPHIC REALISM — MANDATORY. Realism must come from physical coherence and ordinary imperfection, not from exaggerated detail words. Allow slight nonuniform sharpness, subtle framing imperfection, small exposure imbalance, mild edge softness, natural phone autofocus behavior, realistic low-light noise when needed, subtle JPEG compression when plausible, tiny edge chromatic aberration when physically justified, and very slight handheld softness only when consistent with the scene. Avoid 8K language, exaggerated HDR, artificial micro-detail, aggressive denoise, over-sharpening, oversaturation, hard contrast, beauty filters, or commercial color grading.');

    blocks.push('FACE AND SKIN REALISM — MANDATORY. Preserve natural non-uniform pores only where optically plausible, realistic vellus hair, subtle oil sheen on the nose or forehead when appropriate, tiny color variation, ordinary under-eye tone, beard-density variation, and small natural imperfections. Skin texture must follow facial curvature, focus, lighting, and shadow rather than appearing as a repeated texture layer. No waxy skin, porcelain skin, plastic smoothing, fake pore overlays, face sharpening, or cosmetic retouching.');

    blocks.push('EYES, LIPS, AND TEETH — MANDATORY. Eye catchlights must come only from physically justified scene light sources and remain perspective-correct. Keep realistic sclera tone, eyelid shadows, tear-line detail, and natural focus. Preserve realistic lip texture and transition into the mouth. If teeth are visible, keep them naturally colored, imperfectly aligned, and realistically reflective; do not force visible teeth when the selected expression does not require them.');

    blocks.push('HAIR AND BEARD REALISM — MANDATORY. Preserve the reference hairstyle and hairline exactly while rendering natural irregular clumping, varied strand direction, believable density changes, occasional small flyaways when plausible, and physically correct light interaction. Beard and mustache density must vary naturally with soft realistic transitions around cheeks, jaw, and lips. Avoid repeated identical strands, over-curled synthetic hair, razor-sharp beard masks, or uniform beard density.');

    blocks.push('CLOTHING PHYSICS — MANDATORY. Fabric must follow gravity, posture, body contact, sleeve tension, mattress or chair contact, seam structure, and natural compression. Use realistic wrinkles and folds at shoulders, chest, waist, elbows, hips, and contact points. Avoid painted-on fabric, repeated cloth patterns, floating cloth, perfectly new showroom clothing, or invented fabric texture.');

    blocks.push('BEDROOM ENVIRONMENT REALISM — MANDATORY. Keep the locked bedroom recognizable and physically coherent. The room must feel lived-in rather than hotel-perfect: believable bedding folds, realistic furniture scale, natural object spacing, grounded small items, ordinary wear, logical cables or chargers only when appropriate, consistent perspective, correct shadows, and no duplicated or floating objects. Do not redesign the room unless the user explicitly requests a room change.');

    blocks.push('LIGHTING PHYSICS — ABSOLUTE. Obey the selected bedroom lighting exactly. Every visible light effect must have a physically justified source with believable falloff, direction, shadow softness, reflections, exposure, and white balance. No cinematic rim light, beauty fill, studio key light, unexplained glow, perfect face illumination, or impossible mixed-light behavior. At night, allow realistic mixed color temperature, darker regions, highlight clipping, and appropriate phone-camera noise.');

    selectedRules(v).forEach(function(x){blocks.push(x)});

    blocks.push((g?'GEMINI':'CHATGPT')+' PRE-RENDER COMPLIANCE CHECK — REQUIRED. Before rendering, verify identity, face and hair lock, 193 cm / 83 kg body constants, selected posture, selected clothing, selected expression and gaze, selected bedroom lighting and clutter, locked room identity, physically plausible smartphone camera behavior, and complete exclusion of the camera-holding arm/hand/phone from the frame. If any hard constraint would be violated, revise only unspecified camera or composition details before rendering.');

    return blocks.join('\n\n');
  }

  var NEG=[
    'AI-looking skin','waxy skin','plastic skin','porcelain skin','repeated pore texture','beauty filter','face retouching','changed face shape','changed facial proportions','changed hairstyle','changed hairline','synthetic beard','repeated hair strands','fake fabric texture','painted-on clothing','perfect teeth','over-smoothing','over-sharpening','excessive HDR','studio lighting','cinematic rim light','beauty fill light','CGI','3D render','illustration','duplicated people','repeated cars','distorted hands','extra fingers','fused fingers','visible phone','visible camera-holding hand','visible camera-holding wrist','visible camera-holding forearm','visible camera-holding elbow','visible camera-holding arm','giant foreground arm','stretched selfie arm','warped background','floating objects','duplicated bedroom clutter','unreadable foreground text','fake bokeh','DSLR-like shallow depth of field','unrealistic shadows','inconsistent perspective','perfectly centered synthetic composition','mannequin pose','impossible joint geometry'
  ];

  function stripOldNegativeSection(text){
    return String(text||'').replace(/\n\s*Negative constraints:\s*[\s\S]*$/i,'').trim();
  }

  window.buildFinal=function(){
    var base=previousFinal?previousFinal():'';
    var v=V();
    base=stripOldNegativeSection(base);
    return engine(v)+'\n\n'+base+'\n\nNegative constraints:\n'+NEG.join(', ')+'.';
  };

  window.buildNegative=function(){
    var base=previousNegative?previousNegative():'';
    return (base?base+', ':'')+NEG.join(', ');
  };
})();