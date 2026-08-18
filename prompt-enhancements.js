(function(){
  var oldBuildFinal = window.buildFinal;
  var oldBuildNegative = window.buildNegative;

  function values(){
    try { return typeof smartValues === 'function' ? smartValues() : state; }
    catch(e) { return {}; }
  }

  function lowLight(v){
    var t=((v.idea||'')+' '+(v.location||'')+' '+(v.time||'')+' '+(v.lighting||'')).toLowerCase();
    return /ليل|ليلاً|ليلا|مساء|مساءً|الظلام|مظلم|إضاءة منخفضة|خافت|night|evening|dark|dim|low[- ]?light|street or parking lighting|screen light/.test(t);
  }

  var MULTI_PERSON_RULE = 'MULTI-PERSON RULE: Keep the main referenced person fixed to the reference identity only. Every additional person must have a clearly different and realistic facial identity, including a different face shape, naturally varied skin tone when appropriate, different hair and hairstyle, eyebrow pattern, age cues, and individual facial proportions. Never duplicate, clone, or closely echo the referenced face onto another person. Additional people must look like separate real individuals rather than variations of the same person. Their clothing must be realistic, physically plausible, appropriate to the scene and culture, with believable fabric weight, folds, fit, wear, and natural variation between people unless the scene logically requires similar dress.';

  var LOW_LIGHT_RULE = 'LOW-LIGHT CAMERA REALISM — MANDATORY WHEN THE SCENE IS NIGHT, EVENING, DARK, DIM, OR OTHERWISE LOW-LIGHT. Abandon idealized cinematic lighting, perfect studio fill, and unnaturally clean night exposure. Simulate the imperfect optical and sensor behavior of a real advanced smartphone camera in low light: visible high-ISO luminance noise with mild chroma noise where physically plausible, organic heavy grain rather than synthetic uniform grain, some underexposed regions with crushed blacks and lost shadow detail, uneven lighting across the face and environment, locally clipped highlights around bright practical lamps, and imperfect auto white balance. Use practical environmental light sources that actually exist in the scene, such as sodium-vapor street lamps, harsh fluorescent fixtures, LED shop or office lights, vehicle lights, phone-screen spill, or ambient city glow reflected from nearby buildings and sky. Allow subtle lens halation around intense point lights, slight lens flare only when a direct bright source plausibly reaches the lens, and tiny handheld slow-shutter artifacts or slight motion blur in darker areas while keeping the subject plausibly readable. Avoid tripod-clean sharpness. Simulate large-sensor smartphone low-light behavior, approximately 1-inch-class mobile-camera response where relevant, mobile photography characteristics around f/1.6 and 23 mm equivalent only as a visual-behavior reference, never as a reason to create DSLR-style depth of field. The result should resemble an unedited raw-like smartphone photo with realistic noise reduction, sharpening, compression, exposure limits, and sensor imperfections.';

  window.buildFinal = function(){
    var base = oldBuildFinal ? oldBuildFinal() : '';
    var v = values();
    var add=[];
    if(String(v.people||'1')!=='1' && base.indexOf('MULTI-PERSON RULE:')===-1) add.push(MULTI_PERSON_RULE);
    if(lowLight(v) && base.indexOf('LOW-LIGHT CAMERA REALISM')===-1) add.push(LOW_LIGHT_RULE);
    return add.length ? base+'\n\n'+add.join('\n\n') : base;
  };

  window.buildNegative = function(){
    var base = oldBuildNegative ? oldBuildNegative() : '';
    var v = values();
    var extras=[];
    if(String(v.people||'1')!=='1') extras.push('same face on multiple people','cloned people','repeated identity','reference face copied to another person','unrealistic clothing','identical outfits without scene reason');
    if(lowLight(v)) extras.push('cinematic lighting','perfect studio fill','perfectly clean night exposure','noise-free shadows','fully recovered shadow detail','uniform night illumination','tripod-clean night sharpness','fake uniform grain','excessive lens flare','excessive halation');
    return extras.length ? base+', '+extras.join(', ') : base;
  };
})();
