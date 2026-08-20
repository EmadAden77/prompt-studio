(function(){
  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function V(){try{return typeof smartValues==='function'?smartValues():S()}catch(e){return S()}}
  function gemini(){return String(S().platform||'').toLowerCase()==='gemini'}
  function value(v){return String(v==null?'':v).trim()}
  function isAuto(v){var t=value(v).toLowerCase();return !t||t==='__auto_prompt__'||t==='auto'||/^auto\b/.test(t)||/تلقائي/.test(t)}

  function exactSelections(){
    var s=S(),v=V(),x=[];
    function add(label,val){if(!isAuto(val))x.push(label+': '+value(val))}
    if(value(s.idea))x.push('CORE SCENE: '+value(s.idea));
    if(value(s.location))x.push('LOCATION: '+value(s.location));
    if(value(s.time))x.push('TIME: '+value(s.time));
    if(value(s.clothing))x.push('CLOTHING: '+value(s.clothing));
    if(value(s.camera))x.push('CAMERA: '+value(s.camera));
    if(value(s.size)&&s.size!=='auto')x.push('IMAGE FORMAT: '+value(s.size));
    if(value(s.people))x.push('PEOPLE COUNT: '+(s.people==='more'?'more than four':value(s.people)));
    add('POSE',s.pose);
    add('FACIAL EXPRESSION',s.expression);
    add('GAZE',s.gaze);
    add('SUBJECT POSITION IN FRAME',s.frame);
    add('LIGHTING',s.lighting);
    add('BACKGROUND',s.background);
    add('IMAGE CONDITION',s.condition);
    add('BEDROOM LIGHTING',s.bedroomLighting);
    add('BEDROOM CLUTTER',s.bedroomClutter);
    add('FREE-HAND POSE',s.freeHandPose);
    add('BODY POSE',s.selfieBodyPose);
    if(s.identityLock)x.push('IDENTITY LOCK: ON — preserve the referenced person exactly.');
    if(s.roomLock)x.push('ROOM LOCK: ON — preserve the locked bedroom identity exactly.');
    if(s.vehicleLock)x.push('VEHICLE LOCK: ON — preserve the locked vehicle specification exactly.');
    return x;
  }

  function contract(){
    var selected=exactSelections();
    var p=[];
    p.push('GEMINI STRICT EXECUTION CONTRACT — HIGHEST PRIORITY. Treat this prompt as a specification to execute, not as inspiration. Every explicit user selection and every rule marked MANDATORY, ABSOLUTE, LOCK, FIXED, EXACT, HIGHEST PRIORITY, or REQUIRED is a hard constraint. Do not reinterpret, optimize, beautify, simplify, substitute, average, soften, creatively restyle, or silently ignore any such instruction. Resolve only details that are genuinely unspecified.');
    if(selected.length)p.push('GEMINI EXACT USER SELECTIONS — MUST MATCH THE GENERATED IMAGE:\n- '+selected.join('\n- '));
    p.push('GEMINI CONFLICT RESOLUTION — REQUIRED. If two instructions appear to conflict, preserve explicit user selections first, then identity/body/room/vehicle locks, then scene-specific controls, then realism/camera rules, and only then optional aesthetic choices. Never solve a conflict by changing the face, hair, body proportions, selected clothing, selected pose, selected lighting, people count, locked room, or other explicit selection.');
    p.push('GEMINI REFERENCE-IMAGE DISCIPLINE — REQUIRED. Use each reference only for the role explicitly assigned to it. A person reference supplies identity only unless another role is explicitly stated. A locked bedroom reference supplies room identity only. Do not copy reference pose, crop, lighting, clothing, expression, camera angle, or background into the result when those properties are controlled elsewhere in this prompt.');
    p.push('GEMINI NO-UNREQUESTED-CHANGES RULE — ABSOLUTE. Do not add, remove, replace, recolor, redesign, clean up, beautify, modernize, or rearrange visible elements unless the prompt explicitly permits or requires that change. Do not invent accessories, props, gestures, extra people, extra light sources, extra clothing layers, or decorative scene changes.');
    p.push('GEMINI PRE-RENDER VERIFICATION — REQUIRED. Before rendering, internally verify every explicit selection against the planned image. If any selected value would not be visibly satisfied, revise the planned composition before rendering. Do not knowingly render an image that violates a hard constraint.');
    return p.join('\n\n');
  }

  function finalCheck(){
    return 'GEMINI FINAL COMPLIANCE CHECK — REQUIRED IMMEDIATELY BEFORE OUTPUT. Confirm that the image matches the requested scene, person count, identity, face and hair, body proportions, clothing, pose, gaze, expression, camera behavior, framing, lighting, environment, room/vehicle locks, and all scene-specific controls. Confirm that no forbidden substitution or unrequested creative change has been introduced. Physical realism may adjust only unspecified micro-details; it must never override explicit instructions.';
  }

  window.buildFinal=function(){
    var base=previousFinal?previousFinal():'';
    if(!gemini())return base;
    return contract()+'\n\n'+base+'\n\n'+finalCheck();
  };

  window.buildNegative=function(){
    var base=previousNegative?previousNegative():'';
    if(!gemini())return base;
    var x=[
      'ignored explicit instruction',
      'creative reinterpretation of user selection',
      'substituted clothing',
      'substituted pose',
      'substituted lighting',
      'substituted camera framing',
      'changed identity',
      'changed face shape',
      'changed hairstyle or hairline',
      'wrong body proportions',
      'wrong people count',
      'reference pose copied without request',
      'reference lighting copied without request',
      'unrequested props',
      'unrequested accessories',
      'unrequested scene redesign',
      'beautification overriding identity',
      'optional aesthetics overriding mandatory controls'
    ];
    return (base?base+', ':'')+x.join(', ');
  };
})();