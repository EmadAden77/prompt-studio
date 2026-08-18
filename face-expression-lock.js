(function(){
  var oldBuildFinal = window.buildFinal;
  var oldBuildNegative = window.buildNegative;

  function rawValues(){
    try { return typeof state === 'object' && state ? state : {}; }
    catch(e) { return {}; }
  }

  var FACE_EXPRESSION_IDENTITY_RULE = 'FACIAL EXPRESSION IDENTITY LOCK — ABSOLUTE MANDATORY WHEN IDENTITY LOCK IS ON. A requested facial expression may change only the temporary muscle and soft-tissue deformation required for that expression. Allow only physically natural expression effects such as mouth opening or curvature, lip compression or separation, cheek lift, nasolabial-fold prominence, eyelid narrowing, brow movement, and other small expression-driven soft-tissue changes. DO NOT change the underlying identity or stable facial geometry. Preserve exactly the same skull shape, overall face silhouette, facial length-to-width ratio, forehead, temples, hairline, cheekbone position, resting cheek volume, midface length, jaw width, jaw angle, chin width, chin height and projection, nose structure, eye size, eye spacing, eyelid anatomy, eyebrow identity, ears, skin tone, beard growth pattern, hairstyle identity, apparent age, and natural asymmetry. The expression must deform the SAME face, not generate a new face. A smile, laugh, serious look, tired look, raised brows, narrowed eyes, or any other expression must never make the person look like a different individual, a beautified version, a younger or older version, or a face with altered proportions.';

  var FACE_EXPRESSION_COMPLIANCE = 'FACIAL EXPRESSION COMPLIANCE CHECK — REQUIRED BEFORE RENDERING. Compare the expressed face mentally against the reference identity at rest. Confirm that only expression-related muscle movement changed. The underlying facial structure, proportions, identity markers, age, hairline, beard pattern, nose, eye spacing, jaw, chin, cheekbone placement, and face silhouette must remain the same. If the selected expression would otherwise alter identity, reduce the intensity of the expression rather than altering the face.';

  window.buildFinal = function(){
    var base = oldBuildFinal ? oldBuildFinal() : '';
    var v = rawValues();
    if(v.identityLock){
      return FACE_EXPRESSION_IDENTITY_RULE+'\n\n'+base+'\n\n'+FACE_EXPRESSION_COMPLIANCE;
    }
    return base;
  };

  window.buildNegative = function(){
    var base = oldBuildNegative ? oldBuildNegative() : '';
    var v = rawValues();
    if(v.identityLock){
      var extras = [
        'expression-induced identity drift',
        'face morphing caused by smile',
        'face morphing caused by laugh',
        'face shape changing with expression',
        'jaw width changing with expression',
        'jaw angle changing with expression',
        'chin shape changing with expression',
        'nose shape changing with expression',
        'eye size changing with expression',
        'eye spacing changing with expression',
        'cheekbone position changing with expression',
        'forehead proportion changing with expression',
        'age shift caused by expression',
        'beautification during expression change',
        'different person when smiling',
        'different person when serious',
        'different person when tired',
        'different person when laughing'
      ];
      return base+', '+extras.join(', ');
    }
    return base;
  };

  function markVersion(){
    var badge=document.querySelector('.badge');
    if(badge) badge.textContent='Browser v3.9';
    var meta=document.querySelector('.meta span:last-child');
    if(meta) meta.textContent='Prompt Studio Browser v3.9';
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',markVersion);
  else markVersion();
})();
