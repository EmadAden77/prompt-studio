(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;

  function sanitize(text){
    var out=String(text||'');
    var blockedHeaders=[
      'FRONT-CAMERA VIEWPOINT INDEPENDENCE —',
      'FRONT-FACING PHONE CAMERA LENS SIMULATION —',
      'REFERENCE IMAGE ROLE —',
      'IDENTITY FREEZE —',
      'ABSOLUTE IDENTITY FREEZE —',
      'BODY CONSTANTS —',
      'PRIMARY SUBJECT BODY LOCK —',
      'BEDROOM REFERENCE IDENTITY LOCK —',
      'BEDROOM BODY LOCK —'
    ];
    out=out.split(/\n\n+/).filter(function(block){
      var t=block.trim();
      return !blockedHeaders.some(function(h){return t.indexOf(h)===0});
    }).join('\n\n');

    var blocked=[
      /the camera-holding arm[^\n]*must[^\n]*appear[^\n]*/gi,
      /the phone-holding arm[^\n]*must[^\n]*appear[^\n]*/gi,
      /show[^\n]*(?:camera-holding|phone-holding)[^\n]*(?:arm|forearm|hand)[^\n]*/gi,
      /hand slightly closer to the lens[^\n]*/gi,
      /visible foreshortening of the (?:camera-holding|phone-holding) arm[^\n]*/gi,
      /extended arm visible[^\n]*/gi,
      /the camera viewpoint exists independently in front of the subject[^\n]*/gi,
      /treat the selected phone front-facing camera as a virtual optical viewpoint only[^\n]*/gi,
      /\bHeight is 193 cm\.\s*Weight is (?:83|88) kg\.[^\n]*/gi,
      /\b193 cm\s*\/\s*(?:83|88) kg\b/gi
    ];
    blocked.forEach(function(re){out=out.replace(re,'')});
    return out.replace(/\n{3,}/g,'\n\n').trim();
  }

  function sanitizeNegative(text){
    var remove=[
      'forced phone-holding arm',
      'visible arm inferred only from camera selection',
      'extended forearm toward camera without explicit request'
    ];
    return String(text||'')
      .split(',')
      .map(function(x){return x.trim()})
      .filter(function(x){return x&&remove.indexOf(x)===-1})
      .join(', ');
  }

  var IDENTITY='BEDROOM REFERENCE IDENTITY LOCK — HIGHEST PRIORITY FOR CHATGPT AND GEMINI. Use the supplied person reference image as the identity source only. Preserve the exact same person with complete identity stability. It is strictly forbidden to change, reinterpret, enhance, beautify, optimize, reconstruct, or reshape any facial or head detail. Preserve exactly the same face shape, facial proportions, facial bone structure, forehead, temples, jaw, chin, cheeks, cheekbones, nose, nostrils, eyes, eyelids, eyebrows, lips, ears, skin tone, apparent age, natural facial asymmetry, hairstyle, hairline, hair density, natural hair direction, beard, mustache, and every distinctive facial detail visible in the reference. Do not slim or widen the face, alter the jaw or nose, enlarge or reduce the eyes, change the hairline, restyle the hair, redesign the beard, rejuvenate the person, symmetrize the face, smooth away defining features, or invent permanent marks that do not exist in the reference. The identity reference must NOT control pose, selfie angle, crop, lighting, clothing, expression, body posture, or bedroom environment unless the user explicitly selects those separately.';

  var BODY='BEDROOM BODY LOCK — ABSOLUTE FIXED CONSTANTS. Height is exactly 193 cm. Weight is exactly 83 kg. Build is Lean Athletic with naturally low but realistic body fat, proportionate athletic musculature, correct anatomical balance, realistic shoulder width, torso length, pelvis scale, limb lengths, joint placement, and overall silhouette. Preserve these proportions consistently while standing, seated, or lying on the bed. Do not make the person shorter, taller, thinner, heavier, broader, bulkier, more muscular, more shredded, compressed, stretched, widened, shortened, or anatomically exaggerated to satisfy framing. Camera perspective, crop, pose, mattress contact, and clothing must adapt to the fixed body, never the reverse.';

  var RULE='TRUE SELF-TAKEN BEDROOM SELFIE — HIGHEST PRIORITY FOR CHATGPT AND GEMINI. The final image MUST be an actual self-taken front-camera selfie: the person is physically photographing himself with the smartphone that he personally holds in the camera-holding hand. The camera viewpoint must originate from a physically reachable phone position created by a naturally extended camera-holding arm, exactly as in a real handheld selfie. This must never read as a third-person portrait, another person taking the photo, a tripod shot, a remotely positioned camera, or a professional photographer composition unless the user explicitly requests such a different capture method. Engineer the hidden selfie biomechanics realistically from the selected standing, seated, or lying posture: preserve natural shoulder socket position, clavicle alignment, upper-arm length, elbow mechanics, forearm length, wrist orientation, and believable phone reach. Arm extension must be appropriate to the automatically chosen camera-to-face distance; it may retain a natural elbow bend rather than becoming rigidly straight. Perspective and framing must clearly feel like a real person holding a phone at selfie distance. CAMERA-HOLDING ARM VISIBILITY OVERRIDE — ABSOLUTE. Although the camera-holding arm is physically extended to take the selfie, the camera-holding upper arm, forearm, elbow, wrist, hand, fingers, and phone must remain completely outside the captured image, including every edge and corner. Any instruction anywhere in this prompt that mentions natural arm extension, selfie reach, foreshortening, or the person holding the phone must be interpreted as real hidden off-frame biomechanics only, never as permission to show the camera-holding limb or phone. If the chosen selfie angle, distance, or composition would expose any part of that limb or phone, adjust only the virtual phone position, camera-to-face distance, crop, field coverage, or amount of torso/background shown until the entire camera-holding limb and phone remain outside the image. Never solve composition by stretching, shortening, enlarging, telescoping, rigidly straightening, detaching, blurring away, or otherwise distorting human anatomy. The result must unmistakably feel like a genuine self-taken smartphone selfie while keeping the entire camera-holding limb and phone outside the frame.';

  var CHECK='TRUE SELFIE MECHANICS COMPLIANCE CHECK — REQUIRED IMMEDIATELY BEFORE RENDERING. Confirm all of the following simultaneously: (1) the person is clearly photographing himself rather than being photographed by someone else or by a remote/tripod camera; (2) the virtual phone position is physically reachable through a naturally extended camera-holding arm with realistic shoulder, elbow, forearm, and wrist biomechanics appropriate to the selected posture and camera distance; (3) not a single visible portion of the camera-holding upper arm, elbow, forearm, wrist, hand, fingers, or phone enters the final image; and (4) the camera perspective still reads naturally as a handheld front-camera selfie. If any condition fails, revise only the virtual camera placement, distance, crop, or unspecified composition details before rendering. Do not alter identity, body proportions, clothing, or the selected posture.';

  var IDCHECK='BEDROOM IDENTITY AND BODY COMPLIANCE CHECK — REQUIRED IMMEDIATELY BEFORE RENDERING. Confirm that the generated person is the exact same identity as the reference with unchanged facial structure, hairstyle, hairline, beard, apparent age, skin tone, natural asymmetry, and distinctive details. Confirm that the fixed body constants are exactly 193 cm and 83 kg with a Lean Athletic build and naturally low but realistic body fat. Confirm that no camera, lighting, realism, pose, expression, clothing, or composition rule has altered identity or body proportions. If any conflict exists, preserve identity and the 193 cm / 83 kg body lock and revise only unspecified scene or camera details.';

  window.buildFinal=function(){
    var base=previousFinal?previousFinal():'';
    base=sanitize(base);
    return IDENTITY+'\n\n'+BODY+'\n\n'+RULE+'\n\n'+base+'\n\n'+CHECK+'\n\n'+IDCHECK;
  };

  window.buildNegative=function(){
    var base=previousNegative?previousNegative():'';
    base=sanitizeNegative(base);
    var x=[
      'third-person portrait instead of selfie','another person holding the camera','tripod-like selfie perspective','remote camera perspective','professional photographer viewpoint','selfie perspective without believable arm reach','rigid fully straight selfie arm biomechanics','visible camera-holding upper arm','visible camera-holding elbow','visible camera-holding forearm','visible camera-holding wrist','visible camera-holding hand','visible camera-holding fingers','visible phone in bedroom selfie','partial selfie arm entering from frame edge','partial selfie hand entering from frame corner','foreground selfie forearm','stretched selfie arm','telescoped selfie arm','anatomically impossible hidden-arm camera position','changed identity','different person','face replacement','face reinterpretation','beautified face','smoothed identity','changed face shape','changed facial proportions','changed jaw','changed chin','changed cheekbones','changed nose','changed eyes','changed eyebrows','changed lips','changed ears','changed skin tone','changed apparent age','changed hairstyle','changed hairline','changed hair density','changed beard pattern','changed mustache','invented permanent facial marks','identity drift','wrong height','wrong weight','88 kg body','body proportion drift','shortened body','stretched body','widened torso','bulkier body','exaggerated muscles','unnatural body proportions','distorted limb length','camera perspective changing body proportions'
    ];
    return (base?base+', ':'')+x.join(', ');
  };
})();