(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;

  var LOCK=[
    'ABSOLUTE REFERENCE FACE IDENTITY LOCK — HIGHEST FACE PRIORITY. The person identified by the user in the adopted reference image, including the person identified there as wearing a thobe, is the sole facial-identity ground truth. Render the exact same individual. Do not reinterpret, redesign, average, beautify, idealize, reconstruct, or replace the face with a similar-looking person.',
    'FACE SHAPE AND STABLE GEOMETRY — IMMUTABLE. Preserve exactly the same skull and head shape, overall face silhouette, facial length-to-width ratio, forehead height and width, temples, cheekbone position, cheek volume, midface length, jaw width, jaw angle, chin width, chin height and projection, nose bridge and tip, nostril shape, eye size, eye spacing, canthal positions, eyelid anatomy, eyebrow identity and placement, lip shape and proportions, ears, skin tone, apparent age, natural asymmetry, hairline, hairstyle, hair density, beard and mustache pattern, and all identity-bearing proportions visible in the reference.',
    'ZERO FACE RESHAPING. Never slim, widen, lengthen, shorten, sharpen, soften, lift, enlarge, reduce, symmetrize, masculinize, feminize, rejuvenate, age, beautify, retouch, or cosmetically improve any stable facial feature. No jaw sharpening, chin reshaping, cheek hollowing, nose correction, eye enlargement, eye-spacing change, eyebrow redesign, lip enhancement, forehead change, skin-tone correction, face slimming, or face widening.',
    'EXPRESSION IS TEMPORARY MUSCLE MOTION ONLY. The selected expression may change only physically necessary temporary muscle and soft-tissue behavior such as lip curvature/separation, cheek lift/compression, eyelid narrowing, brow movement, nasolabial folds, and small skin folds. It must deform the SAME fixed face. If an expression risks identity drift, reduce expression intensity rather than changing facial geometry.',
    'REFERENCE CLOTHING SCOPE. The thobe in the reference identifies which person is the identity source; it does not lock the output clothing unless the current clothing control explicitly selects a thobe. Pose, selfie angle, crop, lighting, expression, posture, and clothing remain controlled by the app, but none of them may alter facial identity.',
    'FACE-FIDELITY GATE. Before output, compare the generated face against the reference person feature by feature. If the face shape, proportions, hairline, hair, beard, nose, eyes, jaw, chin, cheeks, lips, forehead, age, skin tone, or natural asymmetry differs, correct the generated face back to the reference. Never solve a pose, crop, lighting, or expression challenge by changing the face.'
  ].join('\n\n');

  var NEG=[
    'different person','similar-but-not-identical face','identity drift','face morphing','changed face shape','face slimming','face widening','changed facial proportions','changed skull shape','changed face silhouette','changed forehead','changed temples','changed cheekbones','changed cheek volume','changed midface length','changed jaw width','changed jaw angle','reshaped chin','changed nose or nostrils','enlarged eyes','changed eye spacing','changed eyelid anatomy','redesigned eyebrows','changed lips','changed ears','changed skin tone','age shift','changed hairline','changed hairstyle','changed hair density','changed beard pattern','changed mustache pattern','beautified face','cosmetic face correction','perfected facial symmetry','expression-induced identity drift'
  ];

  var REQUIRED_SUFFIX='Negative Prompt: procedural textures, individual wire hair strands, repetitive fabric patterns, pore texture maps, painted beard, sharp hair transitions, glowing teeth, blended lips and teeth, plastic skin, waxy features, beauty filters, CGI, 3D render, over-sharpened, hyper-detailed micro-textures, unreal engine, digital painting.';

  window.buildFinal=function(){
    var base=oldFinal?oldFinal():'';
    return LOCK+'\n\n'+base;
  };

  window.buildNegative=function(){
    var base=oldNegative?String(oldNegative()||'').trim():'';
    var suffix='';
    if(base.slice(-REQUIRED_SUFFIX.length)===REQUIRED_SUFFIX){
      suffix=REQUIRED_SUFFIX;
      base=base.slice(0,-REQUIRED_SUFFIX.length).trim();
    }
    var out=(base?base+', ':'')+NEG.join(', ');
    return suffix?out+'\n\n'+suffix:out;
  };
})();
