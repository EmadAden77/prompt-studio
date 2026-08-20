(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;

  function stripOldLocks(text){
    var headers=[
      'REFERENCE IMAGE ROLE —',
      'IDENTITY FREEZE —',
      'ABSOLUTE IDENTITY FREEZE —',
      'BODY CONSTANTS —',
      'PRIMARY SUBJECT BODY LOCK —'
    ];
    return String(text||'').split(/\n\n+/).filter(function(block){
      var t=block.trim();
      return !headers.some(function(h){return t.indexOf(h)===0});
    }).join('\n\n')
      .replace(/\bHeight is 193 cm\.\s*Weight is (?:83|88) kg\.[^\n]*/gi,'')
      .replace(/\b193 cm\s*\/\s*(?:83|88) kg\b/gi,'')
      .replace(/\n{3,}/g,'\n\n')
      .trim();
  }

  var IDENTITY='BEDROOM REFERENCE IDENTITY LOCK — HIGHEST PRIORITY FOR CHATGPT AND GEMINI. Use the supplied person reference image as the identity source only. Preserve the exact same person with complete identity stability. It is strictly forbidden to change, reinterpret, enhance, beautify, optimize, reconstruct, or reshape any facial or head detail. Preserve exactly the same face shape, facial proportions, facial bone structure, forehead, temples, jaw, chin, cheeks, cheekbones, nose, nostrils, eyes, eyelids, eyebrows, lips, ears, skin tone, apparent age, natural facial asymmetry, hairstyle, hairline, hair density, natural hair direction, beard, mustache, and every distinctive facial detail visible in the reference. Do not slim or widen the face, alter the jaw or nose, enlarge or reduce the eyes, change the hairline, restyle the hair, redesign the beard, rejuvenate the person, symmetrize the face, smooth away defining features, or invent permanent marks that do not exist in the reference. The identity reference must NOT control pose, selfie angle, crop, lighting, clothing, expression, body posture, or bedroom environment unless the user explicitly selects those separately.';

  var BODY='BEDROOM BODY LOCK — ABSOLUTE FIXED CONSTANTS. Height is exactly 193 cm. Weight is exactly 83 kg. Build is Lean Athletic with naturally low but realistic body fat, proportionate athletic musculature, correct anatomical balance, realistic shoulder width, torso length, pelvis scale, limb lengths, joint placement, and overall silhouette. Preserve these proportions consistently while standing, seated, or lying on the bed. Do not make the person shorter, taller, thinner, heavier, broader, bulkier, more muscular, more shredded, compressed, stretched, widened, shortened, or anatomically exaggerated to satisfy framing. Camera perspective, crop, pose, mattress contact, and clothing must adapt to the fixed body, never the reverse.';

  var CHECK='BEDROOM IDENTITY AND BODY COMPLIANCE CHECK — REQUIRED IMMEDIATELY BEFORE RENDERING. Confirm that the generated person is the exact same identity as the reference with unchanged facial structure, hairstyle, hairline, beard, apparent age, skin tone, and distinctive details. Confirm the fixed body constants are 193 cm and 83 kg with a Lean Athletic build and natural low body fat. Confirm no camera, lighting, realism, pose, expression, clothing, or composition rule has altered identity or body proportions. If any conflict exists, preserve identity and the 193 cm / 83 kg body lock and revise only unspecified scene or camera details.';

  window.buildFinal=function(){
    var base=previousFinal?previousFinal():'';
    base=stripOldLocks(base);
    return IDENTITY+'\n\n'+BODY+'\n\n'+base+'\n\n'+CHECK;
  };

  window.buildNegative=function(){
    var base=previousNegative?previousNegative():'';
    var x=[
      'changed identity','different person','face replacement','face reinterpretation','beautified face','smoothed identity','changed face shape','changed facial proportions','changed jaw','changed chin','changed cheekbones','changed nose','changed eyes','changed eyebrows','changed lips','changed ears','changed skin tone','changed apparent age','changed hairstyle','changed hairline','changed hair density','changed beard pattern','changed mustache','invented permanent facial marks','identity drift','wrong height','wrong weight','88 kg body','body proportion drift','shortened body','stretched body','widened torso','bulkier body','exaggerated muscles','unnatural low body fat','distorted limb length','camera perspective changing body proportions'
    ];
    return (base?base+', ':'')+x.join(', ');
  };
})();