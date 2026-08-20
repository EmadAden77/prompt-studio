(function(){
  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function V(){try{return typeof smartValues==='function'?smartValues():S()}catch(e){return S()}}
  function gemini(){return String(S().platform||'').toLowerCase()==='gemini'}
  function page(){return (location.hash||'').replace(/^#/,'').toLowerCase()}
  function value(v){return String(v==null?'':v).trim()}
  function isAuto(v){var t=value(v).toLowerCase();return !t||t==='__auto_prompt__'||t==='auto'||/^auto\b/.test(t)||/تلقائي/.test(t)}

  function armVisibilityLabel(v){
    if(v==='bedroom_arm_hidden')return 'FULLY HIDDEN';
    if(v==='bedroom_arm_auto')return 'AUTOMATIC BY SELECTED ANGLE';
    if(v==='bedroom_arm_subtle')return 'SUBTLE NATURAL EDGE VISIBILITY';
    return value(v);
  }

  function exactSelections(){
    var s=S(),x=[];
    function add(label,val){if(!isAuto(val))x.push(label+': '+value(val))}
    if(value(s.idea))x.push('CORE SCENE: '+value(s.idea));
    if(value(s.location))x.push('LOCATION: '+value(s.location));
    if(value(s.time))x.push('TIME: '+value(s.time));
    if(value(s.clothing))x.push('CLOTHING: '+value(s.clothing));
    if(value(s.camera))x.push('CAMERA: '+value(s.camera));
    if(value(s.size)&&s.size!=='auto')x.push('IMAGE FORMAT: '+value(s.size));
    if(value(s.people))x.push('PEOPLE COUNT: '+(s.people==='more'?'more than four':value(s.people)));
    add('SELFIE ANGLE',s.angle);
    add('POSE',s.pose);
    add('FACIAL EXPRESSION',s.expression);
    add('GAZE',s.gaze);
    add('SUBJECT POSITION IN FRAME',s.frame);
    add('SELFIE DISTANCE',s.distance);
    add('LIGHTING',s.lighting);
    add('BACKGROUND',s.background);
    add('IMAGE CONDITION',s.condition);
    add('BEDROOM LIGHTING',s.bedroomLighting);
    add('BEDROOM CLUTTER',s.bedroomClutter);
    add('FREE-HAND POSE',s.freeHandPose);
    add('BODY POSE',s.selfieBodyPose);
    if(!isAuto(s.selfieArmVisibility))x.push('CAMERA-ARM VISIBILITY: '+armVisibilityLabel(s.selfieArmVisibility));
    if(s.identityLock)x.push('IDENTITY LOCK: ON — preserve the referenced person exactly.');
    if(s.roomLock)x.push('ROOM LOCK: ON — preserve the locked bedroom identity exactly.');
    if(s.vehicleLock)x.push('VEHICLE LOCK: ON — preserve the locked vehicle specification exactly.');
    return x;
  }

  function contract(){
    var selected=exactSelections();
    var p=[];

    p.push('GEMINI NON-NEGOTIABLE EXECUTION CONTRACT — ABSOLUTE HIGHEST PRIORITY. Execute this prompt literally as a technical specification. It is NOT a mood board, inspiration text, creative brief, suggestion list, or invitation to improve the scene. Every explicit user selection and every instruction marked MANDATORY, ABSOLUTE, LOCK, FIXED, EXACT, HARD CONSTRAINT, HIGHEST PRIORITY, REQUIRED, ONLY, MUST, MUST NOT, DO NOT, or NEVER is binding. Do not reinterpret, optimize, beautify, simplify, substitute, average, soften, harmonize, creatively restyle, summarize away, or silently ignore those constraints. Resolve only details that are genuinely unspecified.');

    if(selected.length)p.push('GEMINI EXACT USER SELECTIONS — THESE VALUES ARE LOCKED AND MUST BE VISIBLE IN THE RESULT:\n- '+selected.join('\n- '));

    p.push('GEMINI EXECUTION ORDER — REQUIRED. First lock every explicit user selection. Second lock identity/body/room/vehicle constants. Third apply the selected scene-specific controls such as bedroom pose, selfie angle, camera-arm visibility, bedroom lighting, bedroom clutter, clothing, expression and gaze. Fourth solve physically necessary camera, crop, lighting-response, material and realism details only inside the remaining unspecified space. Never reverse this order.');

    p.push('GEMINI COMPLETENESS RULE — ABSOLUTE. Process the entire prompt from beginning to end. Do not omit a constraint because the prompt is long, because a similar rule appeared earlier, because another instruction seems aesthetically preferable, or because a model default would normally choose something else. Repeated compatible constraints reinforce the same requirement; they are not permission to weaken or average it.');

    p.push('GEMINI NO SELF-AUTHORED OVERRIDES — ABSOLUTE. Do not introduce your own preferred pose, angle, crop, lighting source, expression, clothing, room arrangement, background treatment, beauty treatment, camera style, prop, accessory, or composition when that property is already selected or locked. Model defaults, aesthetic preferences, cinematic conventions, portrait conventions, and generic realism heuristics have lower priority than this specification.');

    p.push('GEMINI CONFLICT RESOLUTION — REQUIRED. If two instructions appear to conflict, preserve explicit user selections first, then identity/body/room/vehicle locks, then the most specific scene control for that property, then realism/camera rules, and only then optional aesthetic choices. A dedicated control overrides an older generic instruction for the same property. Never solve a conflict by changing the face, hair, body proportions, selected clothing, selected pose, selected selfie angle, selected camera-arm visibility, selected lighting, selected clutter, gaze, expression, people count, locked room, locked vehicle, or another explicit selection. Discard the lower-priority conflicting instruction instead of blending the two.');

    p.push('GEMINI REFERENCE-IMAGE DISCIPLINE — REQUIRED. Use each reference only for the role explicitly assigned to it. A person reference supplies identity only unless another role is explicitly stated. A locked bedroom reference supplies room identity, geometry, established furniture/material relationships, and canonical room details only. Do not copy reference pose, crop, lighting, clothing, expression, camera angle, or unrelated background behavior when those properties are controlled elsewhere in this prompt. Never let reference-image appearance override an explicit control.');

    p.push('GEMINI SELECTED-ONLY RULE — ABSOLUTE. Do not add optional props, accessories, people, decorative objects, lighting sources, clothing details, gestures, vehicles, room changes, luxury styling, cleanup, extra clutter, or environmental embellishments unless they are explicitly selected, already part of a locked reference identity, or strictly required for basic physical coherence. Realism does not authorize invention.');

    p.push('GEMINI PHYSICAL-COHERENCE RULE — REQUIRED. When a selected composition creates a physical challenge, preserve the selected controls and fixed anatomy first. Adjust only unspecified camera distance, tiny roll, crop, field coverage, natural contact, material response, or other unspecified micro-details. Never distort anatomy, identity, room geometry, furniture, or a selected control merely to make the composition easier.');

    if(page()==='bedroom')p.push('GEMINI BEDROOM CONTROL AUTHORITY — ABSOLUTE. In the bedroom page, the dedicated Bedroom Lighting control is the authority for active light sources and the dedicated Bedroom Clutter control is the authority for any extra disorder. The selected bedroom pose, selected compatible selfie angle, selected camera-arm visibility, Xiaomi front-camera behavior, room identity lock, person identity lock, and fixed 193 cm / 83 kg Lean Athletic body constants must all coexist exactly. Do not import reference-photo lighting, generic hidden controls, or unselected scene details to override them.');

    p.push('GEMINI PRE-RENDER VERIFICATION — REQUIRED. Before rendering, internally compare the planned image against every locked value and every hard constraint. Check them one by one rather than approximately. If any selected value would not be visibly or physically satisfied, correct the planned composition before rendering while preserving higher-priority constraints. Do not knowingly render an image that violates a hard constraint.');

    return p.join('\n\n');
  }

  function finalCheck(){
    return 'GEMINI FINAL COMPLIANCE GATE — REQUIRED IMMEDIATELY BEFORE OUTPUT. Do not finalize until all hard constraints pass. Confirm the exact requested scene, person count, identity, unchanged face and hair, fixed body proportions, clothing, pose, selfie angle, camera-arm visibility, gaze, expression, camera behavior, framing, selected lighting source(s), selected clutter level, locked room/vehicle identity, material/contact physics, and all scene-specific controls. Confirm that no lower-priority rule, model default, aesthetic preference, reference-image property, or unrequested creative change has replaced an explicit selection. Physical realism may refine only unspecified micro-details. If even one hard constraint fails, revise the unspecified composition details and check again before output.';
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
      'partial compliance only',
      'prompt constraint omitted because prompt is long',
      'repeated constraint weakened or averaged',
      'model default overriding user selection',
      'aesthetic preference overriding hard constraint',
      'creative reinterpretation of user selection',
      'silent substitution of selected value',
      'substituted clothing',
      'substituted pose',
      'substituted selfie angle',
      'substituted camera-arm visibility',
      'substituted lighting',
      'extra unselected light source',
      'substituted clutter level',
      'substituted camera framing',
      'changed identity',
      'changed face shape',
      'changed hairstyle or hairline',
      'wrong body proportions',
      'wrong people count',
      'reference pose copied without request',
      'reference lighting copied without request',
      'reference image overriding explicit control',
      'generic hidden control overriding dedicated bedroom control',
      'unrequested props',
      'unrequested accessories',
      'unrequested extra people',
      'unrequested scene redesign',
      'unrequested room cleanup',
      'unrequested luxury styling',
      'unrequested extra clutter',
      'beautification overriding identity',
      'optional aesthetics overriding mandatory controls',
      'physical realism used as excuse to alter explicit selection'
    ];
    return (base?base+', ':'')+x.join(', ');
  };
})();