(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;

  function sanitize(text){
    var out=String(text||'');
    var blockedHeaders=[
      'FRONT-CAMERA VIEWPOINT INDEPENDENCE —',
      'FRONT-FACING PHONE CAMERA LENS SIMULATION —'
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
      /treat the selected phone front-facing camera as a virtual optical viewpoint only[^\n]*/gi
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

  var RULE='TRUE SELF-TAKEN BEDROOM SELFIE — HIGHEST PRIORITY FOR CHATGPT AND GEMINI. The final image MUST be an actual self-taken front-camera selfie: the person is physically photographing himself with the smartphone that he personally holds in the camera-holding hand. The camera viewpoint must originate from a physically reachable phone position created by a naturally extended camera-holding arm, exactly as in a real handheld selfie. This must never read as a third-person portrait, another person taking the photo, a tripod shot, a remotely positioned camera, or a professional photographer composition unless the user explicitly requests such a different capture method. Engineer the hidden selfie biomechanics realistically from the selected standing, seated, or lying posture: preserve natural shoulder socket position, clavicle alignment, upper-arm length, elbow mechanics, forearm length, wrist orientation, and believable phone reach. Arm extension must be appropriate to the automatically chosen camera-to-face distance; it may retain a natural elbow bend rather than becoming rigidly straight. Perspective and framing must clearly feel like a real person holding a phone at selfie distance. CAMERA-HOLDING ARM VISIBILITY OVERRIDE — ABSOLUTE. Although the camera-holding arm is physically extended to take the selfie, the camera-holding upper arm, forearm, elbow, wrist, hand, fingers, and phone must remain completely outside the captured image, including every edge and corner. Any instruction anywhere in this prompt that mentions natural arm extension, selfie reach, foreshortening, or the person holding the phone must be interpreted as real hidden off-frame biomechanics only, never as permission to show the camera-holding limb or phone. If the chosen selfie angle, distance, or composition would expose any part of that limb or phone, adjust only the virtual phone position, camera-to-face distance, crop, field coverage, or amount of torso/background shown until the entire camera-holding limb and phone remain outside the image. Never solve composition by stretching, shortening, enlarging, telescoping, rigidly straightening, detaching, blurring away, or otherwise distorting human anatomy. The result must unmistakably feel like a genuine self-taken smartphone selfie while keeping the entire camera-holding limb and phone outside the frame.';

  var CHECK='TRUE SELFIE MECHANICS COMPLIANCE CHECK — REQUIRED IMMEDIATELY BEFORE RENDERING. Confirm all of the following simultaneously: (1) the person is clearly photographing himself rather than being photographed by someone else or by a remote/tripod camera; (2) the virtual phone position is physically reachable through a naturally extended camera-holding arm with realistic shoulder, elbow, forearm, and wrist biomechanics appropriate to the selected posture and camera distance; (3) not a single visible portion of the camera-holding upper arm, elbow, forearm, wrist, hand, fingers, or phone enters the final image; and (4) the camera perspective still reads naturally as a handheld front-camera selfie. If any condition fails, revise only the virtual camera placement, distance, crop, or unspecified composition details before rendering. Do not alter identity, body proportions, clothing, or the selected posture.';

  window.buildFinal=function(){
    var base=previousFinal?previousFinal():'';
    base=sanitize(base);
    return RULE+'\n\n'+base+'\n\n'+CHECK;
  };

  window.buildNegative=function(){
    var base=previousNegative?previousNegative():'';
    base=sanitizeNegative(base);
    var x=[
      'third-person portrait instead of selfie',
      'another person holding the camera',
      'tripod-like selfie perspective',
      'remote camera perspective',
      'professional photographer viewpoint',
      'selfie perspective without believable arm reach',
      'rigid fully straight selfie arm biomechanics',
      'visible camera-holding upper arm',
      'visible camera-holding elbow',
      'visible camera-holding forearm',
      'visible camera-holding wrist',
      'visible camera-holding hand',
      'visible camera-holding fingers',
      'visible phone in bedroom selfie',
      'partial selfie arm entering from frame edge',
      'partial selfie hand entering from frame corner',
      'foreground selfie forearm',
      'stretched selfie arm',
      'telescoped selfie arm',
      'anatomically impossible hidden-arm camera position'
    ];
    return (base?base+', ':'')+x.join(', ');
  };
})();