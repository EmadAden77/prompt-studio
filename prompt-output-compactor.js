(function(){
  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;

  function page(){return (location.hash||'').replace(/^#/,'').toLowerCase()}
  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function isGemini(){
    var p=String(S().platform||'').toLowerCase();
    if(p==='gemini')return true;
    var b=document.getElementById('geminiBtn');
    return !!(b&&b.classList.contains('active'));
  }
  function norm(s){return String(s||'').replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/\n[ \t]+/g,'\n').trim()}
  function starts(t,arr){for(var i=0;i<arr.length;i++)if(t.indexOf(arr[i])===0)return true;return false}

  var GROUPS={
    ghalyoon:[
      'GHALYOON PROMPT OPTIMIZATION ENGINE','INTENT AND AMBIGUITY DISCIPLINE','DIRECT-USABILITY RULE','BASIC MODE.','DETAIL MODE.','GEMINI OPTIMIZATION.','CHATGPT OPTIMIZATION.','QUALITY GATE.'
    ],
    anti:[
      'BEDROOM ANTI-ARTIFACT PHOTOGRAPHY CONSTRAINTS','HAIR RENDERING —','CLOTHING AND FABRIC —','BEARD AND FACIAL HAIR —','SKIN —','TEETH AND INNER MOUTH —','OVERALL ANTI-ARTIFACT TARGET —'
    ],
    photo:[
      'BEDROOM PHOTOGRAPHIC REALISM REFINEMENT','LIVED-IN REALISM —','PRACTICAL-LIGHT REALISM —','OPTICAL IMPERFECTIONS —','CONDITIONAL MICRO-IMPERFECTIONS —','PHOTOGRAPHY STYLE LOCK —'
    ],
    strict:[
      'CRITICAL EXECUTION CONTRACT —','PROMPT PRIORITY STRUCTURE —','NO IMPROVISATION.','NO STANDARD AI BEAUTIFICATION','CONFLICT RESOLUTION RULE.','PHYSICAL COHERENCE RULE.','RAW CAMERA DISCIPLINE.','FINAL COMPLIANCE GATE.'
    ],
    physics:[
      'BEDROOM POSE PHYSICAL REALISM —','BODY–ENVIRONMENT CONTACT REALISM —','POSE-DEPENDENT CLOTHING PHYSICS —','POSE REALISM COMPLIANCE CHECK —'
    ],
    room:[
      'BEDROOM REFERENCE IDENTITY LOCK —','FIXED VISIBLE BEDROOM PROFILE —','BEDROOM PERSON REFERENCE —','BEDROOM MATERIAL PHYSICS —','BEDROOM CONTACT, GRAVITY, AND GEOMETRY —','BEDROOM CLUTTER AUTHORITY —','BEDROOM SMARTPHONE-PHOTO CHARACTER —','BEDROOM ROOM-AND-PERSON REFERENCE COMPLIANCE CHECK —','BEDROOM ROOM-REALISM COMPLIANCE CHECK —'
    ]
  };

  var COMPACT={
    ghalyoon:'GHALYOON OPTIMIZATION — Keep the exact user intent and resolved controls, remove redundancy, never invent missing facts, and structure the prompt for the selected model. Explicit user choices always outrank optimization.',
    anti:'ANTI-ARTIFACT REALISM — Smartphone-natural hair clumping and soft edges; natural beard fading; sensor-rendered skin without procedural pore maps; ordinary fabric with gravity folds and no repeating synthetic texture; natural teeth/mouth shadows when visible. No beauty filtering, waxy/plastic features, CGI, digital-painting detail, or artificial hyper-sharp microtexture.',
    photo:'SMARTPHONE PHOTO REALISM — Ordinary minimally processed Xiaomi 15 Ultra front-camera capture with natural perspective, restrained sharpening, believable white balance/dynamic range, and only scene-justified noise/softness/compression. Selected lighting and image-condition controls are authoritative; no studio, cinematic, DSLR, film, editorial, or showroom look.',
    strict:'STRICT EXECUTION — Treat every final UI value as binding. No improvisation, beautification, extra people/props/furniture/lights, or alternative values from the same category. If composition is difficult, change only unspecified micro-position/camera-distance details; never identity, body, room, pose, angle, crop, clothing, expression, lighting, clutter, bed state, image condition, or color response.',
    physics:'PHYSICAL REALISM — Preserve the fixed body and selected pose with plausible joints, center of mass, weight distribution, gravity, contact pressure, mattress/pillow compression, contact shadows, and clothing folds. Never distort anatomy or make bodies/objects float, clip, merge, or lose support.',
    room:'REFERENCE LOCK — Use the adopted reference as the same person and the same canonical bedroom. Preserve facial identity, hair/beard, room architecture, furniture identities/positions, curtain, wardrobe, bed, AC, floor and spatial relationships. Reference pose/clothes/expression/lighting are not locked; active controls decide them. Do not redesign, beautify, move major furniture, or invent room elements.'
  };

  function compactBedroom(text){
    var parts=norm(text).split(/\n\n+/).map(function(x){return x.trim()}).filter(Boolean);
    var seen={},out=[],used={};
    parts.forEach(function(p){
      var key=norm(p).toLowerCase();
      if(seen[key])return;
      seen[key]=1;

      var g=null;
      Object.keys(GROUPS).some(function(name){if(starts(p,GROUPS[name])){g=name;return true}return false});
      if(g){if(!used[g]){out.push(COMPACT[g]);used[g]=1}return}

      /* Keep the selected pose-specific physical rule, resolved values, selfie geometry,
         shuffled location, expression, lighting, hand, crop and Gemini narrative. */
      out.push(p);
    });

    /* Remove repeated generic compliance paragraphs after their compact group exists. */
    out=out.filter(function(p,i){
      if(i===0)return true;
      if(/^FINAL COMPLIANCE CHECK — REQUIRED BEFORE RENDERING\./.test(p)&&used.strict)return false;
      if(/^BEDROOM PREFLIGHT VALIDATION — PASSED\./.test(p))return true;
      return true;
    });

    return out.join('\n\n').replace(/\n{3,}/g,'\n\n').trim();
  }

  function compactGeneric(text){
    var parts=norm(text).split(/\n\n+/).filter(Boolean),seen={},out=[];
    parts.forEach(function(p){var k=norm(p).toLowerCase();if(!seen[k]){seen[k]=1;out.push(p)}});
    return out.join('\n\n').trim();
  }

  var REQUIRED_SUFFIX='Negative Prompt: procedural textures, individual wire hair strands, repetitive fabric patterns, pore texture maps, painted beard, sharp hair transitions, glowing teeth, blended lips and teeth, plastic skin, waxy features, beauty filters, CGI, 3D render, over-sharpened, hyper-detailed micro-textures, unreal engine, digital painting.';

  function compactBedroomNegative(text){
    var raw=String(text||'');
    var hasRequired=raw.toLowerCase().indexOf('negative prompt: procedural textures')!==-1;
    raw=raw.replace(/(?:\n\n)?Negative Prompt:\s*procedural textures, individual wire hair strands, repetitive fabric patterns, pore texture maps, painted beard, sharp hair transitions, glowing teeth, blended lips and teeth, plastic skin, waxy features, beauty filters, CGI, 3D render, over-sharpened, hyper-detailed micro-textures, unreal engine, digital painting\.?\s*$/i,'');

    var critical=[
      'wrong identity or identity drift','changed face or hairstyle','changed canonical bedroom geometry','moved or replaced major furniture','invented people props furniture or light sources','selected pose ignored','selected selfie angle ignored','selected selfie crop ignored','selected free-hand pose ignored','selected clothing expression lighting clutter bed condition image condition or color ignored','visible camera-holding upper arm elbow forearm wrist hand fingers or phone','extended selfie arm entering frame','impossible anatomy or center of mass','floating clipping merged or unsupported body/object','missing realistic contact or mattress/pillow compression','cgi','3d render','plastic or waxy skin','beauty filter','cinematic studio volumetric or ring lighting','perfect symmetry or showroom staging','over-sharpened synthetic micro-detail','procedural textures','wire-like hair','painted beard','pore texture maps','repetitive fabric patterns','glowing teeth','unreal engine','digital painting'
    ];
    var body='NEGATIVE PROMPT: '+critical.join(', ')+'.';
    return hasRequired?body+'\n\n'+REQUIRED_SUFFIX:body;
  }

  function compactGenericNegative(text){
    var s=norm(text);
    if(!s)return s;
    var items=s.replace(/^NEGATIVE PROMPT:\s*/i,'').split(/[,\n]+/),seen={},out=[];
    items.forEach(function(x){x=x.trim();if(!x)return;var k=x.toLowerCase().replace(/[.]+$/,'');if(!seen[k]){seen[k]=1;out.push(x.replace(/[.]+$/,''))}});
    return 'NEGATIVE PROMPT: '+out.join(', ')+'.';
  }

  window.buildFinal=function(){
    var base=oldFinal?oldFinal():'';
    return page()==='bedroom'?compactBedroom(base):compactGeneric(base);
  };

  window.buildNegative=function(){
    var base=oldNegative?oldNegative():'';
    return page()==='bedroom'?compactBedroomNegative(base):compactGenericNegative(base);
  };
})();
