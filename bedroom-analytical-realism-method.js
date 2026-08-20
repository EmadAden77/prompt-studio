(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function val(x){return String(x==null?'':x).trim()}
  function platform(){return val(S().platform).toLowerCase()||'chatgpt'}

  function method(){
    var s=S();
    var label=platform()==='gemini'?'GEMINI':'CHATGPT';
    return [
      label+' BEDROOM ANALYTICAL REALISM METHOD — ABSOLUTE EXECUTION POLICY. Treat the image request as a layered photographic specification, not as a beauty brief and not as a loose visual suggestion. Solve the layers independently first, then recombine them without allowing one layer to rewrite another.',

      'LAYER 1 — REFERENCE IDENTITY GROUND TRUTH — HIGHEST PRIORITY. The supplied PERSON reference image is the authoritative source for identity only. Preserve the exact same facial identity across every requested lighting, angle, pose, crop, and camera condition. Keep the same facial bone structure, head shape, forehead, temples, jaw, chin, cheek structure, eye shape and spacing, eyelids, eyebrows, nose shape and nostrils, lips, ears, skin tone, apparent age, natural facial asymmetry, hairstyle, hairline, hair density, beard, mustache, and distinctive permanent facial details. Do not reinterpret, beautify, reconstruct, idealize, symmetrize, slim, widen, rejuvenate, or cosmetically improve the face. A change in lighting or camera angle may change only how the fixed face is projected and illuminated, never the underlying identity geometry.',

      'REFERENCE ROLE SEPARATION — REQUIRED. A person reference supplies identity ground truth. The locked bedroom reference supplies room identity, geometry, furniture/material relationships, and canonical environmental details. Neither reference may silently impose its original pose, clothing, lighting, expression, selfie angle, crop, or camera position when those properties are selected elsewhere in the application.',

      'LAYER 2 — ENVIRONMENT AND LIGHTING — PHYSICALLY INDEPENDENT FROM IDENTITY. Resolve the locked bedroom, selected bedroom clutter, time implied by the selected lighting, and the selected bedroom light sources as an environmental layer. Lighting must behave as real energy in the room: preserve source direction, inverse-distance falloff, occlusion, contact shadows, face-plane shading, bounce from walls/fabric, darker recesses, realistic highlight clipping, white-balance response, and low-light sensor behavior when applicable. Light may reveal or conceal facial detail through exposure and shadow only; it must never change eye size, nose shape, jaw shape, face width, age, hairstyle, or other identity geometry.',

      'LAYER 3 — SELFIE GEOMETRY AND POSE — PHYSICALLY INDEPENDENT FROM IDENTITY. Treat the selected PERSON POSE and SELFIE ANGLE as real three-dimensional camera/body geometry. Preserve anatomical joint limits, shoulder position, neck compensation, reachable phone placement, perspective, foreshortening, and physically credible arm-length capture. Changing the angle changes projection and visible planes only. Do not alter the fixed face or body proportions to make a selected angle easier.',

      'LAYER 4 — CLOTHING AND FREE HAND — INDEPENDENT SELECTED DETAILS. Apply exactly the selected bedroom clothing and selected free-hand pose after body geometry is established. Clothing must obey gravity, fabric tension, compression, wrinkles, contact, and occlusion without changing body proportions. The free hand must follow the selected gesture while remaining anatomically plausible and must not force a different face, camera angle, or body identity.',

      'LAYER 5 — PHOTOGRAPHIC CAPTURE CONDITION. Apply the selected Bedroom Image Condition only as a camera-capture layer: sensor noise, restrained sharpening, slight focus imperfection, JPEG softness, micro-motion, or exposure variation may affect recorded pixels but must never become a reason to smooth skin, redesign features, obscure identity, or create cinematic stylization.',

      'NO DEFAULT BEAUTIFICATION — ABSOLUTE. Do not enlarge eyes, refine the nose, sharpen the jaw, slim the cheeks, perfect facial symmetry, erase under-eye texture, remove normal skin irregularities, smooth pores, make skin porcelain-like, redesign teeth, clean the hairline, perfect the beard edge, or add glamour retouching. Preserve natural pores, small texture variation, fine facial hair, ordinary asymmetry, realistic oil sheen, subtle lines, minor blemishes, and normal human variation whenever visible under the selected lighting.',

      'TECHNICAL CAMERA COMMANDS ARE LITERAL PHOTOGRAPHIC CONSTRAINTS. Treat any explicit camera model, front-camera instruction, focal-length equivalent, field of view, camera angle, distance, crop, or perspective instruction as real imaging geometry. These values must affect framing, perspective convergence, foreshortening, edge behavior, subject-to-background scale, and depth rendering in a physically coherent way. Do not convert technical camera instructions into vague aesthetic language. Smartphone depth of field must remain physically plausible; do not invent strong DSLR-like bokeh or portrait-mode blur unless explicitly selected.',

      'CROSS-LAYER CONTAMINATION BAN — ABSOLUTE. Lighting cannot modify identity. Pose cannot modify identity. Camera perspective cannot reshape the underlying face or body. Clothing cannot modify anatomy. Capture noise cannot become skin texture replacement. The room reference cannot override the selected selfie geometry. The person reference cannot override the selected room, clothing, lighting, or pose. When two layers conflict, preserve the explicit user-facing selection and the identity/body/room locks, then adjust only unspecified micro-details.',

      'RECOMBINATION STEP — REQUIRED. After each layer is solved independently, combine them into one coherent photograph with these invariants intact: exact referenced identity; fixed 193 cm / 83 kg Lean Athletic body; locked canonical bedroom; selected pose; selected selfie angle; selected free-hand pose; selected clothing; selected bedroom lighting; selected clutter; selected image-condition realism; Xiaomi 15 Ultra front-camera behavior. The result must be one physically possible photograph, not a blend of alternatives.',

      'FINAL ANALYTICAL COMPLIANCE CHECK — REQUIRED BEFORE OUTPUT. Verify separately: (1) identity fidelity, (2) room identity, (3) pose and selfie geometry, (4) clothing and free-hand selection, (5) physical lighting direction and falloff, (6) literal camera behavior, (7) skin/hair/beard realism without beautification, and (8) selected capture-condition realism. If one layer fails, correct that layer only. Never repair a lighting, pose, clothing, or camera problem by changing the referenced face.'
    ].join('\n\n');
  }

  window.buildFinal=function(){
    var base=previousFinal?previousFinal():'';
    return method()+'\n\n'+base;
  };

  window.buildNegative=function(){
    var base=previousNegative?previousNegative():'';
    var x=[
      'lighting changing facial identity',
      'camera angle changing face structure',
      'pose changing facial features',
      'perspective used to redesign face',
      'reference pose overriding selected pose',
      'reference lighting overriding selected bedroom lighting',
      'reference clothing copied without selection',
      'beautified face',
      'beauty filter',
      'enlarged eyes',
      'slimmed jaw',
      'refined nose',
      'perfect facial symmetry',
      'porcelain skin',
      'skin smoothing',
      'erased pores',
      'airbrushed under-eye area',
      'perfect beard edge',
      'cleaned artificial hairline',
      'technical camera instruction treated as aesthetic suggestion',
      'DSLR bokeh from smartphone selfie without request',
      'capture artifact replacing real skin texture',
      'cross-layer instruction contamination',
      'one layer corrected by changing identity'
    ];
    return (base?base+', ':'')+x.join(', ');
  };
})();
