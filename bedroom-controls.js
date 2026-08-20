(function(){
  var oldBuildFinal = window.buildFinal;
  var oldBuildNegative = window.buildNegative;

  var BEDROOM_LIGHTING_MAP = {
    'auto bedroom prompt':'Follow the bedroom lighting exactly from the user prompt first. If the user prompt is not specific, infer the lighting from the selected bedroom context while keeping the same bedroom.',
    'near-total darkness bedroom':'Make the bedroom near-total darkness. Keep all room lights effectively off unless the prompt explicitly says otherwise. Let large areas fall into deep shadow with crushed blacks and limited visible detail.',
    'very dark bedroom':'Make the bedroom very dark, with only faint practical spill and limited readability in the shadows.',
    'extremely dim bedroom':'Use extremely dim bedroom lighting with weak practical illumination and visibly low exposure.',
    'ceiling spotlights only':'Illuminate the bedroom using only the white recessed ceiling spotlights. No bedside lamp, no extra hidden fill light, and no warm yellow ceiling bulbs.',
    'single white ceiling spotlight only':'Use exactly one white recessed ceiling spotlight only. All other ceiling spotlights and room lights must be off. Keep strong localized falloff and realistic uneven illumination.',
    'single white ceiling bulb only':'Use exactly one white ceiling light source only. All other ceiling lights and spotlights must be off. The active ceiling light must be white, not yellow, and must create realistic directional falloff.',
    'bedside lamp only':'Use only the bedside table lamp as the practical light source. Keep the rest of the bedroom lights off, with natural local glow and darker surrounding zones.',
    'phone screen light only':'Light the bedroom only with phone-screen spill. Keep the environment mostly dark, with weak localized illumination on the face or nearby area.',
    'streetlight spill through the curtain':'Use streetlight spill entering through or around the curtain as the main practical light source, keeping the room dim and unevenly lit.',
    'full ceiling lighting with all ceiling lamps white':'Turn on the full bedroom ceiling lighting. All ceiling lamps and spotlights must be white, not yellow, and the room should be illuminated by the ceiling only unless the prompt adds another source.',
    'warm lighting from a non-ceiling source':'Use warm lighting from a non-ceiling source such as a bedside lamp or another practical household source. Keep ceiling lamps from becoming warm yellow sources.',
    'cool lighting':'Use cool-toned practical lighting with believable white-to-cool color temperature and realistic falloff.',
    'mixed realistic bedroom lighting':'Use mixed realistic practical bedroom lighting from believable sources with natural unevenness and physically plausible color-temperature variation.',
    'all lights off':'Turn all bedroom lights off. Only incidental ambient spill explicitly justified by the prompt may remain.'
  };

  var BEDROOM_CLUTTER_MAP = {
    'auto bedroom clutter':'Follow the bedroom clutter level from the user prompt first. If the prompt is not specific, keep the clutter level scene-appropriate and realistic.',
    'no extra clutter':'Do not add extra clutter beyond what is already inherent to the locked bedroom reference and requested scene.',
    'light realistic clutter':'Add only a small amount of realistic lived-in clutter, such as one or two clothing items, a charger, a bottle, or a minor sign of use.',
    'natural realistic clutter':'Add natural everyday lived-in clutter distributed logically: a few clothing items, one or two pairs of footwear, water bottles, chargers, cables, and mildly rumpled bedding.',
    'clear realistic clutter':'Show clearly visible lived-in clutter in a realistic way: multiple ordinary personal items, more obvious bedding disorder, several practical objects, and a bedroom that feels actively used.',
    'heavy realistic clutter':'Show a heavier amount of realistic lived-in clutter while keeping it believable and physically coherent: more clothing, more small personal items, more visible shoes, bottles, chargers, and natural disorder.',
    'very heavily used realistic bedroom':'Show a strongly lived-in bedroom with abundant but believable realistic clutter. The room should feel very actively used, yet all items must remain logical, non-repetitive, and naturally distributed.'
  };

  function ensureState(){
    try{
      if(typeof state==='object' && state){
        if(typeof state.bedroomLighting!=='string') state.bedroomLighting='auto bedroom prompt';
        if(typeof state.bedroomClutter!=='string') state.bedroomClutter='auto bedroom clutter';
      }
    }catch(e){}
  }

  function extendOptions(){
    try{
      if(typeof OPTIONS!=='object' || !OPTIONS) return;
      OPTIONS.bedroomLighting = [
        ['auto bedroom prompt','تلقائي حسب الـPrompt'],
        ['near-total darkness bedroom','ظلام شديد جدًا'],
        ['very dark bedroom','شبه ظلام'],
        ['extremely dim bedroom','إضاءة خافتة جدًا'],
        ['ceiling spotlights only','السبوتات فقط'],
        ['single white ceiling spotlight only','سبوت واحد فقط'],
        ['single white ceiling bulb only','إنارة لمبة سقف بيضاء واحدة'],
        ['bedside lamp only','لمبة الطاولة فقط'],
        ['phone screen light only','ضوء شاشة الجوال فقط'],
        ['streetlight spill through the curtain','ضوء شارع داخل من الستارة'],
        ['full ceiling lighting with all ceiling lamps white','إنارة سقف كاملة'],
        ['warm lighting from a non-ceiling source','إضاءة دافئة'],
        ['cool lighting','إضاءة باردة'],
        ['mixed realistic bedroom lighting','إضاءة مختلطة واقعية'],
        ['all lights off','جميع الأنوار مطفأة']
      ];
      OPTIONS.bedroomClutter = [
        ['auto bedroom clutter','تلقائي حسب الـPrompt'],
        ['no extra clutter','بدون فوضى إضافية'],
        ['light realistic clutter','فوضى خفيفة'],
        ['natural realistic clutter','فوضى طبيعية'],
        ['clear realistic clutter','فوضى واضحة'],
        ['heavy realistic clutter','فوضى واقعية كثيرة'],
        ['very heavily used realistic bedroom','غرفة مستخدمة جدًا']
      ];
    }catch(e){}
  }

  function roomScene(v){
    var t=((v.idea||'')+' '+(v.location||'')+' '+(v.background||'')).toLowerCase();
    return !!v.roomLock || /غرفة النوم|غرفه النوم|داخل غرفة النوم|داخل غرفه النوم|bedroom|my bedroom|the bedroom/.test(t);
  }

  function selfieScene(v){
    var t=((v.idea||'')+' '+(v.location||'')+' '+(v.pose||'')+' '+(v.camera||'')).toLowerCase();
    return /سيلفي|selfie|front camera/.test(t) || !!v.angle || !!v.distance || !!v.frame;
  }

  function installUI(){
    if(document.getElementById('bedroomSettingsGrid')) return;
    var sections=[].slice.call(document.querySelectorAll('.section'));
    var anchor=sections.find(function(el){return /الهوية والصورة المرجعية/.test(el.textContent||'')});
    if(!anchor || !anchor.parentNode) return;
    var shell=document.createElement('div');
    shell.innerHTML='<div class="section">إعدادات غرفة النوم</div><div id="bedroomSettingsGrid" class="grid"><div class="field"><label>إنارة غرفة النوم</label><div class="picker" data-key="bedroomLighting"></div><small style="display:block;margin-top:5px;color:var(--muted);font-size:11px">تتحكم بإنارة غرفة النوم نفسها ولا تثبت إضاءة الصورة المرجعية.</small></div><div class="field"><label>الفوضى الواقعية داخل الغرفة</label><div class="picker" data-key="bedroomClutter"></div><small style="display:block;margin-top:5px;color:var(--muted);font-size:11px">فوضى منطقية وغير مكررة ومندمجة بصريًا.</small></div></div>';
    anchor.parentNode.insertBefore(shell,anchor);
  }

  ensureState();
  extendOptions();
  function ready(){installUI();ensureState();if(typeof renderPickers==='function')renderPickers();try{if(typeof save==='function')save()}catch(e){}}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ready); else ready();

  window.buildFinal=function(){
    ensureState();
    var base=oldBuildFinal?oldBuildFinal():'';
    var v=(typeof smartValues==='function')?smartValues():(typeof state==='object'?state:{});
    if(!roomScene(v)) return base;
    var extras=[];
    extras.push('BEDROOM-SPECIFIC USER CONTROLS — HIGHEST PRIORITY FOR BEDROOM SCENES. Keep the same bedroom identity, but obey the dedicated bedroom lighting and bedroom clutter controls exactly.');
    extras.push('BEDROOM REALISM MASTER RULE — ABSOLUTE MANDATORY. In every bedroom scene, every visible detail must read as a genuine real-world smartphone photo and must not look AI-generated. Preserve believable materials, true object scale, natural wear, non-perfect symmetry, ordinary lived-in imperfection, and realistic household randomness. Avoid cinematic beautification, decorative perfection, repeated patterns, cloned clutter, unreal cleanliness, fake texture, or suspiciously polished surfaces.');
    extras.push('BEDROOM LIGHTING — MANDATORY: '+(BEDROOM_LIGHTING_MAP[String(v.bedroomLighting||'auto bedroom prompt')]||BEDROOM_LIGHTING_MAP['auto bedroom prompt']));
    extras.push('BEDROOM LIGHTING REALISM — ABSOLUTE MANDATORY. The bedroom lighting must obey the user-selected lighting exactly and also look physically real and undetectable as AI: only believable practical sources, realistic falloff, natural brightness distribution, limited dynamic range, scene-appropriate white balance, plausible shadow direction, localized highlight behavior, and no unexplained fill light, fake rim light, studio polish, or unrealistically even exposure.');
    extras.push('BEDROOM CEILING LIGHT COLOR RULE — MANDATORY. Any active ceiling lamps or recessed ceiling spotlights in the bedroom must be white, not yellow. If warm lighting is requested, create the warmth from a non-ceiling source such as the bedside lamp or another practical non-ceiling source.');
    extras.push('BEDROOM REALISTIC CLUTTER — MANDATORY: '+(BEDROOM_CLUTTER_MAP[String(v.bedroomClutter||'auto bedroom clutter')]||BEDROOM_CLUTTER_MAP['auto bedroom clutter']));
    extras.push('REALISTIC BEDROOM CLUTTER QUALITY RULE — ABSOLUTE MANDATORY. Any added clutter must look genuinely real and not AI-generated: logically placed, naturally varied, non-repetitive, physically grounded, correctly lit and shadowed, appropriately scaled, and consistent with a real lived-in bedroom. Do not use cloned objects, repeated shoes, repeated bottles, pasted-looking items, floating objects, or chaotic nonsense.');
    if(selfieScene(v)){
      extras.push('BEDROOM SELFIE REALISM — ABSOLUTE MANDATORY. When the bedroom scene is a selfie or front-camera shot, the result must read as a true handheld smartphone selfie, not a synthetic render. Preserve believable front-camera perspective, slight wide-angle behavior, mild edge softness, modest phone-camera sharpening, realistic noise/compression, and physically plausible phone placement.');
      extras.push('BEDROOM POSE AND ANGLE REALISM — ABSOLUTE MANDATORY. Any selected bedroom pose, body position, lying pose, seated pose, standing pose, and any selected selfie angle must remain anatomically and spatially believable in the locked bedroom. Solve weight distribution, spine alignment, neck angle, shoulder reaction, elbow bend, hand placement, and contact with the bed, pillow, wall, chair, curtain, or floor realistically. Never fake a dramatic angle by distorting anatomy or room geometry.');
    }
    extras.push('REFERENCE IMAGE ROLE — ABSOLUTE MANDATORY. In identity-locked bedroom scenes, treat the reference image as an identity source only for the person. If room lock is active, the bedroom reference locks the room only. Do not let the identity reference redesign the room, and do not let the room reference alter the person. Neither reference may override explicit user-selected lighting, pose, clothing, camera, or composition.');
    extras.push('ABSOLUTE IDENTITY FREEZE — ABSOLUTE MANDATORY. It is strictly forbidden to change the person\'s facial identity in any way. Preserve exactly the same face shape, facial proportions, face silhouette, jaw, chin, cheekbones, forehead, temples, eyes, eyelids, eyebrows, nose structure, lips, ears, skin tone, beard pattern, hairstyle, hairline, and all distinctive facial details. Do not improve, beautify, reshape, re-age, symmetrize, restyle, reinterpret, or reconstruct the face or hair. Full identity stability is mandatory.');
    extras.push('PRIMARY SUBJECT BODY LOCK — ABSOLUTE MANDATORY. The subject\'s physical constants are fixed: height 193 cm, weight 83 kg, lean athletic build, naturally low but realistic body fat, proportionate athletic musculature, and correct anatomical balance. Preserve realistic body proportions without exaggeration, distortion, shortening, widening, artificial muscular enhancement, or anatomical inconsistency.');
    return extras.join('\n\n')+'\n\n'+base;
  };

  window.buildNegative=function(){
    ensureState();
    var base=oldBuildNegative?oldBuildNegative():'';
    var v=(typeof smartValues==='function')?smartValues():(typeof state==='object'?state:{});
    if(!roomScene(v)) return base;
    var x=[
      'ignored bedroom-lighting selection',
      'ignored bedroom-clutter selection',
      'reference-photo lighting overriding selected bedroom lighting',
      'yellow ceiling bulbs in the bedroom',
      'AI-looking bedroom lighting',
      'studio-like bedroom lighting',
      'unexplained fill light',
      'fake rim light',
      'unrealistically even exposure',
      'AI-looking clutter',
      'duplicated clutter objects',
      'repeated shoes',
      'repeated bottles',
      'floating clutter objects',
      'pasted-looking objects',
      'chaotic nonsense mess',
      'wrong clutter intensity',
      'wrong bedroom lighting mode',
      'AI-looking selfie',
      'mechanically impossible bedroom pose',
      'impossible selfie angle',
      'reference image affecting the room incorrectly',
      'reference image affecting the face incorrectly',
      'changed face shape',
      'changed facial proportions',
      'changed hairstyle',
      'changed hairline',
      'beautified face',
      'reshaped jaw',
      'reshaped nose',
      'altered beard pattern',
      'wrong body proportions',
      'wrong body build',
      'height or weight drift'
    ];
    return base?base+', '+x.join(', '):x.join(', ');
  };
})();