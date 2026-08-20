(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;

  function sanitize(text){
    var out=String(text||'');
    var blocked=[
      /the camera-holding arm[^\n]*must[^\n]*appear[^\n]*/gi,
      /the phone-holding arm[^\n]*must[^\n]*appear[^\n]*/gi,
      /show[^\n]*(?:camera-holding|phone-holding)[^\n]*(?:arm|forearm|hand)[^\n]*/gi,
      /hand slightly closer to the lens[^\n]*/gi,
      /visible foreshortening of the (?:camera-holding|phone-holding) arm[^\n]*/gi,
      /extended arm visible[^\n]*/gi
    ];
    blocked.forEach(function(re){out=out.replace(re,'')});
    return out.replace(/\n{3,}/g,'\n\n').trim();
  }

  var RULE='BEDROOM CAMERA-HOLDING ARM INTERPRETATION OVERRIDE — HIGHEST PRIORITY FOR CHATGPT AND GEMINI. Any instruction anywhere in this prompt that says or implies the person is holding the phone naturally, extending an arm to take the selfie, using realistic selfie biomechanics, or using natural foreshortening MUST be interpreted only as hidden off-frame biomechanics. It must NEVER be interpreted as permission or a request to show the camera-holding arm. In the final bedroom selfie, the camera-holding upper arm, forearm, elbow, wrist, hand, fingers, and phone must remain completely outside the captured frame, including every edge and corner. The virtual phone must still occupy a physically reachable position consistent with the selected standing, seated, or lying posture. If the intended selfie angle, distance, or composition would expose any part of the camera-holding limb or phone, change only the virtual camera position, camera-to-face distance, crop, field coverage, or amount of torso/background shown until the entire camera-holding limb and phone remain outside the image. Never solve the composition by stretching, shortening, enlarging, straightening, hiding through blur, detaching, or otherwise distorting human anatomy. This override supersedes every lower-priority phrase about arm extension, selfie reach, foreshortening, or visible phone-holding anatomy.';

  var CHECK='BEDROOM HIDDEN-ARM COMPLIANCE CHECK — REQUIRED IMMEDIATELY BEFORE RENDERING. Confirm that not a single pixel of the camera-holding upper arm, elbow, forearm, wrist, hand, fingers, or phone is visible. Confirm that the camera viewpoint is nevertheless anatomically reachable from the hidden shoulder position and appropriate to the chosen posture. If either condition fails, revise the camera placement or crop before rendering; do not alter identity, body proportions, clothing, or the selected posture.';

  window.buildFinal=function(){
    var base=previousFinal?previousFinal():'';
    base=sanitize(base);
    return RULE+'\n\n'+base+'\n\n'+CHECK;
  };

  window.buildNegative=function(){
    var base=previousNegative?previousNegative():'';
    var x=[
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