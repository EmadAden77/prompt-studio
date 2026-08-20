(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function v(x,f){var t=String(x==null?'':x).trim();return t||f||'not specified'}

  function parameters(){
    var s=S();
    return [
      'USER PARAMETERS — FINAL RESOLVED VALUES:',
      'SELFIE ANGLE: '+v(s.angle)+'.',
      'PERSON POSE: '+v(s.pose)+'.',
      'FACIAL EXPRESSION: '+v(s.expression||s.bedroomExpression,'neutral relaxed expression')+'.',
      'FREE-HAND POSE: '+v(s.freeHandPose||s.bedroomHandPose)+'.',
      'CLOTHING: '+v(s.clothing||s.bedroomClothingSuggestion)+'.',
      'BEDROOM LIGHTING: '+v(s.bedroomLighting)+'.',
      'BEDROOM CLUTTER: '+v(s.bedroomClutter)+'.',
      'BED CONDITION: '+v(s.bedroomBedCondition)+'.',
      'IMAGE CONDITION: '+v(s.bedroomImageCondition)+'.',
      'COLOR RESPONSE: '+v(s.bedroomColorTone)+'.',
      'CAMERA: Xiaomi 15 Ultra front camera.',
      'IDENTITY: exact supplied person-reference identity only; no reinterpretation or beautification.',
      'ROOM: locked canonical bedroom identity and geometry.',
      'CAMERA-HOLDING ARM: physically present outside the captured frame; no visible arm, forearm, wrist, hand, fingers, or phone.'
    ].join('\n');
  }

  var CONTRACT=[
    'CRITICAL EXECUTION CONTRACT — STRICT RAW PHOTOGRAPHY MODE — ABSOLUTE PRIORITY. Treat every final user parameter below as a binding photographic constraint, not as an aesthetic suggestion. Produce one coherent, ordinary, highly realistic, minimally processed smartphone selfie that obeys the resolved selections exactly.',
    'NO IMPROVISATION. Do not invent or add people, props, accessories, gestures, clothing details, furniture, room changes, decorative objects, light sources, camera systems, scene elements, or stylistic effects that were not explicitly selected or physically required for basic coherence. Do not replace one selected option with a supposedly better alternative.',
    'NO STANDARD AI BEAUTIFICATION OR POLISH. No cinematic lighting, volumetric fog, artificial rim light, studio beauty light, glamour retouching, porcelain skin, excessive smoothing, perfect facial symmetry, perfect room symmetry, showroom staging, hyper-clean surfaces, oversaturation, fantasy contrast, or synthetic perfection. Preserve normal skin texture, natural asymmetry, ordinary material variation, realistic clutter according to its control, and physically plausible camera imperfections according to the selected image condition.',
    'PHYSICAL COHERENCE RULE. If an explicit selection creates a composition challenge, preserve the explicit selection and identity/body/room locks. Adjust only unspecified micro-details such as tiny phone position, crop, camera distance, minute limb placement, or contact placement. Never solve a conflict by changing facial identity, body proportions, selected pose, selected expression, selected clothing, selected light source, selected clutter level, selected bed condition, or selected color response.',
    'RAW CAMERA DISCIPLINE. Keep Xiaomi 15 Ultra front-camera behavior and ordinary smartphone processing. Do not substitute DSLR, mirrorless, film, portrait-lens, editorial, magazine, architectural, cinematic, or synthetic-render aesthetics. Any noise, softness, JPEG character, exposure imperfection, chromatic aberration, flare, or other artifact must remain subtle, physically justified, and subordinate to the selected Image Condition.',
    'FINAL COMPLIANCE GATE. Before output, verify each USER PARAMETERS line independently. If any selected value is missing, contradicted, replaced, beautified, or supplemented with an unrequested element, correct only that failure before producing the final result.'
  ].join('\n\n');

  window.buildFinal=function(){
    var base=oldFinal?oldFinal():'';
    return CONTRACT+'\n\n'+parameters()+'\n\n'+base;
  };

  window.buildNegative=function(){
    var base=oldNegative?oldNegative():'';
    var x=[
      'cgi','3d render','plastic','perfectly smooth','overly symmetrical','unreal engine','octane render','oversaturated','unrequested artificial lighting','unrequested extra light source','midjourney style','painting','illustration','perfect setup','cinematic','studio lighting','volumetric fog','beauty retouching','glamour lighting','showroom staging','invented prop','invented accessory','invented person','invented furniture','unselected room change','unselected clothing detail','unselected gesture','unselected camera system','selected parameter ignored','selected parameter replaced by AI preference'
    ];
    return (base?base+', ':'')+x.join(', ');
  };
})();
