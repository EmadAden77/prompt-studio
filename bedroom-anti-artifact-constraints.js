(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;

  var RULES=[
    'BEDROOM ANTI-ARTIFACT PHOTOGRAPHY CONSTRAINTS — MANDATORY FOR CHATGPT AND GEMINI. Preserve the existing identity, bedroom, pose, selfie angle, selfie crop, free-hand, clothing, lighting, clutter, bed-condition, image-condition, and color selections exactly. These rules refine only material and camera rendering; they may never override a selected user control.',
    'HAIR RENDERING — SMARTPHONE REALISM. Render the referenced hairstyle with natural clumping and soft realistic edges as captured by an ordinary smartphone front camera. Preserve the exact hairline, density, direction, hairstyle, and identity from the reference. Avoid individual wire-like strands, hyper-detailed drawn hair, unnatural curling intersections, painted strand separation, or digitally illustrated hair detail.',
    'CLOTHING AND FABRIC — ORDINARY MATERIAL RESPONSE. Preserve the selected garment exactly and render it as normal cloth with natural gravity-following folds and basic smooth materials appropriate to the actual fabric. Allow realistic compression, bunching, tension, and contact folds from the selected pose. Forbid procedural repeating textures, random fractal micro-details, invented over-enthusiastic fabric patterns, synthetic texture-map appearance, or 3D-simulation-map styling.',
    'BEARD AND FACIAL HAIR — NATURAL FADING. Preserve the exact referenced beard and mustache pattern, density variation, boundaries, and natural asymmetry. Use natural fading and consistent lens depth of field across facial hair. Forbid sharp painted edges, sudden unnatural blending into skin, hyper-sharp patchy stubble, uniformly outlined beard borders, or facial hair rendered at a different sharpness level from adjacent skin.',
    'SKIN — CAMERA-SENSOR RENDERING, NOT PROCEDURAL TEXTURE. Preserve natural skin tones and ordinary unedited smartphone rendering with soft camera-sensor response, real tonal variation, subtle natural texture, and identity-consistent imperfections. Do not fabricate artificial micro-pore texture mapping, exaggerated rough-skin filters, procedural pores on cheeks or nose, repeating pore patterns, waxy smoothing, plastic skin, or beauty-filter cleanup. Real skin texture must arise naturally from the reference, lighting, focus, and sensor response rather than from a visible synthetic texture overlay.',
    'TEETH AND INNER MOUTH — NATURAL DENTAL STRUCTURE. When teeth are visible because of the selected expression, preserve ordinary natural dental structure, realistic tooth-to-tooth variation, harsh but physically plausible inner-mouth shadows, and distinct boundaries between lips and teeth. Forbid perfectly straight glowing teeth, commercial dental-smile styling, uniformly whitened teeth, soft waxy transitions between teeth and lips, or teeth fused into the mouth. If the selected expression keeps the mouth closed, do not reveal teeth merely to satisfy this rule.',
    'OVERALL ANTI-ARTIFACT TARGET — RAW MUNDANE SMARTPHONE PHOTO. The final appearance must remain an unedited, raw, mundane Xiaomi 15 Ultra front-camera photograph with ordinary camera behavior. No plastic features, waxy skin, beauty filters, CGI enhancement, 3D-render material treatment, over-sharpened micro-detail, digital-painting texture, or synthetic perfection. Natural photographic softness and scene-appropriate detail are preferable to artificial hyper-detail.'
  ].join('\n\n');

  var EXACT_NEGATIVE='Negative Prompt: procedural textures, individual wire hair strands, repetitive fabric patterns, pore texture maps, painted beard, sharp hair transitions, glowing teeth, blended lips and teeth, plastic skin, waxy features, beauty filters, CGI, 3D render, over-sharpened, hyper-detailed micro-textures, unreal engine, digital painting.';

  window.buildFinal=function(){
    var base=oldFinal?oldFinal():'';
    return RULES+'\n\n'+base;
  };

  window.buildNegative=function(){
    var base=oldNegative?String(oldNegative()||'').trim():'';
    base=base.replace(/(?:\n\n)?Negative Prompt:\s*procedural textures, individual wire hair strands, repetitive fabric patterns, pore texture maps, painted beard, sharp hair transitions, glowing teeth, blended lips and teeth, plastic skin, waxy features, beauty filters, CGI, 3D render, over-sharpened, hyper-detailed micro-textures, unreal engine, digital painting\.?\s*$/i,'').trim();
    return (base?base+'\n\n':'')+EXACT_NEGATIVE;
  };
})();
