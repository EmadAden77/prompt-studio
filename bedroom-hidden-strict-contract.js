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
      'USER PARAMETERS — FINAL RESOLVED VALUES — PRIORITY ORDER:',
      '',
      '1) CAPTURE AND SELFIE GEOMETRY — HIGHEST USER-PARAMETER PRIORITY',
      'SELFIE ANGLE: '+v(s.angle)+'.',
      'SELFIE CROP: '+v(s.bedroomSelfieCrop,'bedroom_crop_auto_hidden_arm')+'.',
      'CAMERA-HOLDING ARM: physically present outside the captured frame; no visible arm, forearm, wrist, hand, fingers, or phone.',
      '',
      '2) SUBJECT AND POSE',
      'PERSON POSE: '+v(s.pose)+'.',
      'FACIAL EXPRESSION: '+v(s.expression||s.bedroomExpression,'neutral relaxed expression')+'.',
      'FREE-HAND POSE: '+v(s.freeHandPose||s.bedroomHandPose)+'.',
      'CLOTHING: '+v(s.clothing||s.bedroomClothingSuggestion)+'.',
      '',
      '3) BEDROOM SCENE STATE',
      'ROOM: locked canonical bedroom identity and geometry.',
      'BEDROOM CLUTTER: '+v(s.bedroomClutter)+'.',
      'BED CONDITION: '+v(s.bedroomBedCondition)+'.',
      '',
      '4) LIGHTING, CAMERA, AND RECORDED IMAGE RESPONSE',
      'BEDROOM LIGHTING: '+v(s.bedroomLighting)+'.',
      'CAMERA: Xiaomi 15 Ultra front camera.',
      'IMAGE CONDITION: '+v(s.bedroomImageCondition)+'.',
      'COLOR RESPONSE: '+v(s.bedroomColorTone)+'.',
      '',
      '5) NON-NEGOTIABLE IDENTITY LOCK',
      'IDENTITY: exact supplied person-reference identity only; no reinterpretation or beautification.'
    ].join('\n');
  }

  var CONTRACT=[
    'CRITICAL EXECUTION CONTRACT — STRICT RAW PHOTOGRAPHY MODE — ABSOLUTE PRIORITY. Treat every final user parameter below as a binding photographic constraint, not as an aesthetic suggestion. Produce one coherent, ordinary, highly realistic, minimally processed smartphone selfie that obeys the resolved selections exactly.',
    'PROMPT PRIORITY STRUCTURE — REQUIRED. Resolve the prompt in this order: (1) capture geometry including selfie angle and selected selfie crop, (2) person pose/expression/free hand/clothing, (3) locked bedroom scene state including clutter and bed condition, (4) selected physical lighting plus Xiaomi front-camera behavior and recorded image response, then (5) invariant identity lock applied across all layers. Later explanatory blocks may refine physical execution but must never override an earlier resolved user parameter. Never combine two alternatives from the same category.',
    'NO IMPROVISATION. Do not invent or add people, props, accessories, gestures, clothing details, furniture, room changes, decorative objects, light sources, camera systems, scene elements, or stylistic effects that were not explicitly selected or physically required for basic coherence. Do not replace one selected option with a supposedly better alternative.',
    'NO STANDARD AI BEAUTIFICATION OR POLISH. No cinematic lighting, volumetric fog, artificial rim light, studio beauty light, glamour retouching, porcelain skin, excessive smoothing, perfect facial symmetry, perfect room symmetry, showroom staging, hyper-clean surfaces, oversaturation, fantasy contrast, or synthetic perfection. Preserve normal skin texture, natural asymmetry, ordinary material variation, realistic clutter according to its control, and physically plausible camera imperfections according to the selected image condition.',
    'CONFLICT RESOLUTION RULE. The UI compatibility engine has already reconciled pose, selfie angle, selfie crop availability, and free-hand pose before prompt construction. The final resolved values are authoritative. If any later instruction appears to conflict with them, discard or reinterpret only the lower-priority conflicting instruction. Never merge incompatible alternatives. The latest explicit user choice is preserved; only its dependent conflicting option may be corrected by the compatibility engine.',
    'PHYSICAL COHERENCE RULE. If an explicit selection creates a composition challenge, preserve the explicit selection and identity/body/room locks. Adjust only unspecified micro-details such as tiny phone position, camera distance, minute limb placement, or contact placement. Never solve a conflict by changing facial identity, body proportions, selected selfie angle, selected selfie crop, selected pose, selected expression, selected clothing, selected light source, selected clutter level, selected bed condition, or selected color response.',
    'RAW CAMERA DISCIPLINE. Keep Xiaomi 15 Ultra front-camera behavior and ordinary smartphone processing. Do not substitute DSLR, mirrorless, film, portrait-lens, editorial, magazine, architectural, cinematic, or synthetic-render aesthetics. Any noise, softness, JPEG character, exposure imperfection, chromatic aberration, flare, or other artifact must remain subtle, physically justified, and subordinate to the selected Image Condition.',
    'FINAL COMPLIANCE GATE. Before output, verify each USER PARAMETERS line independently and verify that no category contains two conflicting values. If any selected value is missing, contradicted, replaced, beautified, supplemented with an unrequested element, or duplicated by an incompatible alternative, correct only that failure before producing the final result.'
  ].join('\n\n');

  window.buildFinal=function(){
    var base=oldFinal?oldFinal():'';
    return CONTRACT+'\n\n'+parameters()+'\n\n'+base;
  };

  window.buildNegative=function(){
    var base=oldNegative?oldNegative():'';
    var x=[
      'cgi','3d render','plastic','perfectly smooth','overly symmetrical','unreal engine','octane render','oversaturated','unrequested artificial lighting','unrequested extra light source','midjourney style','painting','illustration','perfect setup','cinematic','studio lighting','volumetric fog','beauty retouching','glamour lighting','showroom staging','invented prop','invented accessory','invented person','invented furniture','unselected room change','unselected clothing detail','unselected gesture','unselected camera system','selected parameter ignored','selected parameter replaced by AI preference','two values from same control category','lower-priority instruction overriding resolved user parameter','conflicting angle duplicated later in prompt','conflicting crop duplicated later in prompt','selected selfie crop ignored','conflicting pose duplicated later in prompt','conflicting hand pose duplicated later in prompt'
    ];
    return (base?base+', ':'')+x.join(', ');
  };
})();