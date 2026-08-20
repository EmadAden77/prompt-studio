(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function v(x){return String(x==null?'':x)}

  function conditionRule(){
    var c=v(S().bedroomImageCondition);
    if(c==='bedroom_condition_clean')return 'OPTICAL IMPERFECTIONS — CLEAN MODE. Keep Xiaomi front-camera rendering naturally clean. Do not force chromatic aberration, flare, visible dust, grain, blur, or JPEG damage. Preserve only physically unavoidable edge softness, tiny sensor texture in darker areas, and restrained smartphone processing.';
    if(c==='bedroom_condition_noise')return 'OPTICAL IMPERFECTIONS — SENSOR-NOISE MODE. Allow fine Xiaomi-style sensor noise mainly in darker midtones and shadows. Keep daylight noise extremely subtle. Preserve pores and facial detail; noise must never replace real skin texture.';
    if(c==='bedroom_condition_motion')return 'OPTICAL IMPERFECTIONS — HANDHELD-MOTION MODE. Allow only tiny handheld softness on frame edges, loose hair tips, fabric edges, or secondary background detail. Keep the face and eyes readable and mostly sharp.';
    if(c==='bedroom_condition_jpeg')return 'OPTICAL IMPERFECTIONS — JPEG MODE. Allow restrained real-world smartphone JPEG softness or faint ringing only on difficult high-contrast edges. Never create obvious blocks, mosaic skin, or damaged facial detail.';
    if(c==='bedroom_condition_focus')return 'OPTICAL IMPERFECTIONS — FOCUS MODE. Allow a tiny realistic front-camera focus miss or corner softness while keeping the eyes and identity-bearing facial detail readable.';
    if(c==='bedroom_condition_exposure')return 'OPTICAL IMPERFECTIONS — EXPOSURE MODE. Allow small realistic auto-exposure variation, limited highlight clipping, or slightly darker shadow regions without flattening the selected lighting direction.';
    return 'OPTICAL IMPERFECTIONS — ORDINARY SMARTPHONE MODE. Preserve restrained edge softness, fine sensor texture appropriate to light level, tiny exposure variation, and very subtle lens/sensor imperfections only when physically justified.';
  }

  var BASE='BEDROOM PHOTOGRAPHIC REALISM REFINEMENT — MANDATORY. Preserve an ordinary amateur Xiaomi 15 Ultra front-camera photograph rather than a studio, editorial, catalog, DSLR, film-camera, or interior-design image. Keep the capture raw and naturally processed: restrained sharpening, realistic dynamic range, imperfect but believable white balance, natural smartphone perspective, and scene-appropriate sensor texture. Do not replace the existing Xiaomi camera model with Sony, Canon, Leica, Hasselblad, 35mm/50mm/85mm interchangeable-lens photography, film stock, or artificial portrait optics.';

  var ROOM='LIVED-IN REALISM — CONTROLLED BY THE SELECTED BEDROOM CLUTTER LEVEL. Preserve realistic fabric wrinkles, pillow compression, blanket drape, curtain weight, small material wear, subtle surface variation, and ordinary contact marks as physically plausible signs of use. Do not add random trash, duplicate objects, decorative styling, luxury props, or extra clutter beyond the selected clutter control. Existing small objects must remain logically placed, grounded, scaled, and affected by gravity.';

  var LIGHT='PRACTICAL-LIGHT REALISM — REQUIRED. Keep the dedicated Bedroom Lighting control as the only authority for active light sources. Favor real window daylight or practical household lights when selected. Avoid cinematic, volumetric, neon, artificial rim, studio beauty, or ring-light behavior. Preserve directional shadows, natural falloff, darker recesses, bounce from walls and bedding, and realistic low-light noise when applicable.';

  var CONDITIONAL='CONDITIONAL MICRO-IMPERFECTIONS — DO NOT FORCE. A tiny amount of lateral chromatic aberration may appear only at extreme high-contrast frame edges if consistent with the smartphone lens and selected image condition. Lens flare may appear only when a real bright source lies close to the lens axis; otherwise there is no flare. Visible airborne dust is not a default effect and may appear only when a directional light beam physically reveals it. Never add these effects merely to make the image look more photographic.';

  var STYLE='PHOTOGRAPHY STYLE LOCK — ORDINARY CANDID SMARTPHONE. Keep the visual language casual, handheld, and unpolished rather than fashion-editorial or architectural-magazine photography. Preserve natural composition imperfection and ordinary room depth without converting the scene into an interior-design showcase.';

  window.buildFinal=function(){
    var base=oldFinal?oldFinal():'';
    return BASE+'\n\n'+ROOM+'\n\n'+LIGHT+'\n\n'+conditionRule()+'\n\n'+CONDITIONAL+'\n\n'+STYLE+'\n\n'+base;
  };

  window.buildNegative=function(){
    var base=oldNegative?oldNegative():'';
    var x=[
      '3d render','cgi','unreal engine look','octane render look','interior design visualization','architectural editorial styling','luxury showroom bedroom','catalog photography','studio beauty lighting','ring light','cinematic volumetric lighting','neon rim light','perfectly tidy staged room','perfectly smooth surfaces','perfect symmetry','plastic materials','oversaturated color','external DSLR camera look','Sony camera look overriding Xiaomi selfie','Canon camera look overriding Xiaomi selfie','Leica camera body look overriding Xiaomi selfie','Hasselblad camera look overriding Xiaomi selfie','35mm interchangeable lens look','50mm interchangeable lens look','85mm portrait lens look','film stock simulation overriding smartphone color','forced lens flare','forced dust motes','strong chromatic aberration','obvious artificial grain','random clutter added for realism'
    ];
    return (base?base+', ':'')+x.join(', ');
  };
})();
