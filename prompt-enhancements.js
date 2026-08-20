(function(){
  var oldBuildFinal = window.buildFinal;
  var oldBuildNegative = window.buildNegative;

  function values(){
    try { return typeof smartValues === 'function' ? smartValues() : state; }
    catch(e) { return {}; }
  }
  function rawValues(){
    try { return typeof state === 'object' && state ? state : {}; }
    catch(e) { return {}; }
  }
  function text(v){
    return ((v.idea||'')+' '+(v.location||'')+' '+(v.pose||'')+' '+(v.background||'')+' '+(v.time||'')+' '+(v.lighting||'')).toLowerCase();
  }
  function lowLight(v){
    return /ليل|ليلاً|ليلا|مساء|مساءً|الظلام|مظلم|إضاءة منخفضة|خافت|night|evening|dark|dim|low[- ]?light|street or parking lighting|screen light/.test(text(v));
  }
  function explicitNonSaudiLocation(v){
    return /اليمن|عدن|صنعاء|دبي|الإمارات|ابوظبي|أبوظبي|قطر|الدوحة|الكويت|البحرين|عمان|مسقط|مصر|القاهرة|تركيا|اسطنبول|لندن|باريس|أمريكا|الولايات المتحدة|اليابان|الصين|الهند|yemen|aden|sanaa|dubai|uae|qatar|doha|kuwait|bahrain|oman|muscat|egypt|cairo|turkey|istanbul|london|paris|usa|united states|japan|china|india/.test(text(v));
  }
  function vehicleScene(v){
    return /سيارة|سياره|السيارة|السياره|داخل سيارة|داخل السياره|داخل السيارة|رنج|رانج|روفر|موقف|مواقف|range rover|range-rover|sport suv|luxury suv|suv|car|vehicle|inside a car|parking/.test(text(v)) || String(v.pose||'').toLowerCase()==='inside a car';
  }
  function fixedRangeRoverRequested(v){
    return !!v.vehicleLock || /رنج|رانج|روفر|range rover|range-rover/.test(text(v));
  }
  function roadOrVehicleScene(v){
    return vehicleScene(v) || /طريق|شارع|قيادة|ازدحام|مرور|road|street|traffic|driving/.test(text(v));
  }
  function peopleLabel(v){
    return String(v.people||'1')==='more' ? 'more than four' : String(v.people||'1');
  }
  function selfieScene(v){
    return /سيلفي|selfie/.test(text(v)) || /front camera|selfie/.test(String(v.camera||'').toLowerCase()) || !!v.angle || !!v.distance;
  }

  function mandatorySelections(v){
    var lines=[];
    lines.push('MANDATORY USER SELECTIONS — HIGHEST PRIORITY. These values come directly from the user-facing controls. Follow every listed value exactly. Do not reinterpret, optimize, replace, soften, approximate, or override them because of scene assumptions, realism rules, reference-image composition, model defaults, aesthetic preferences, or later instructions. If any later instruction conflicts with a value below, the value below wins.');
    lines.push('AUTOMATIC OVERRIDES: '+(v.smartMode ? 'SMART MODE IS ON, but it may only resolve genuinely unspecified details. It must never override an explicit user selection listed below.' : 'DISABLED. Do not auto-correct or auto-optimize any explicit selection below.'));
    if(String(v.idea||'').trim()) lines.push('CORE SCENE — EXACT USER INTENT: '+String(v.idea).trim());
    if(String(v.location||'').trim()) lines.push('LOCATION — MANDATORY: '+String(v.location).trim());
    if(String(v.time||'').trim()) lines.push('TIME — MANDATORY: '+String(v.time).trim());
    if(String(v.clothing||'').trim()) lines.push('CLOTHING — MANDATORY: '+String(v.clothing).trim());
    if(String(v.camera||'').trim()) lines.push('CAMERA / PHONE — MANDATORY: '+String(v.camera).trim());
    if(String(v.size||'auto')!=='auto') lines.push('IMAGE FORMAT — MANDATORY: '+String(v.size)+'.');
    lines.push('PEOPLE COUNT — MANDATORY: '+peopleLabel(v)+'.');
    if(v.angle) lines.push('SELFIE ANGLE — MANDATORY: '+v.angle+'.');
    if(v.pose) lines.push('POSE / FRAMING — MANDATORY: '+v.pose+'.');
    if(v.expression) lines.push('FACIAL EXPRESSION — MANDATORY: '+v.expression+'.');
    if(v.gaze) lines.push('GAZE DIRECTION — MANDATORY: '+v.gaze+'.');
    if(v.distance) lines.push('SELFIE DISTANCE — MANDATORY: '+v.distance+'.');
    if(v.frame) lines.push('SUBJECT POSITION IN FRAME — MANDATORY: '+v.frame+'.');
    if(v.lighting) lines.push('LIGHTING — MANDATORY: '+v.lighting+'.');
    if(v.background) lines.push('BACKGROUND — MANDATORY: '+v.background+'.');
    if(v.condition) lines.push('IMAGE CONDITION — MANDATORY: '+v.condition+'.');
    lines.push('IDENTITY LOCK — MANDATORY STATE: '+(v.identityLock ? 'ON. Preserve the referenced identity exactly.' : 'OFF. Do not invent an identity-lock requirement beyond the scene request.'));
    lines.push('VEHICLE LOCK — MANDATORY STATE: '+(v.vehicleLock ? 'ON. When a car is part of the scene, use the fixed white 2022 Range Rover Sport vehicle specification.' : 'OFF. Do not force the fixed Range Rover specification unless the scene itself explicitly names a Range Rover.'));
    if(!explicitNonSaudiLocation(v) && roadOrVehicleScene(v)) lines.push('STEERING WHEEL POSITION — ABSOLUTE MANDATORY: LEFT-HAND-DRIVE VEHICLE. The steering wheel and driver seat must be on the PHYSICAL LEFT SIDE of the vehicle when facing forward. This is about the actual vehicle layout, not which side of the final image frame the wheel happens to appear on. Never mirror, flip, reverse, or reinterpret the cabin into right-hand-drive.');
    if(selfieScene(v)) lines.push('SELFIE ARM EXTENSION — USER-UNSPECIFIED AND AUTOMATIC. The user controls the selfie angle, selfie distance, posture, and framing; the exact arm reach, elbow bend, forearm path, shoulder lift, wrist rotation, and crop adaptation must be solved automatically by realistic biomechanics. Do not treat arm extension as a separate aesthetic target. Engineer the arm only as much as required by the selected angle and distance while keeping believable human anatomy.');
    return lines.join('\n');
  }

  var SAUDI_LOCATION_RULE = 'SAUDI ARABIA LOCATION RULE — DEFAULT AND MANDATORY UNLESS THE USER EXPLICITLY NAMES ANOTHER COUNTRY OR CITY OUTSIDE SAUDI ARABIA. Treat the scene as taking place in Saudi Arabia. The environment must read as genuinely Saudi rather than generically Gulf: use physically plausible Saudi residential, commercial, office, street, parking, cafe, villa, shop, road, signage style, street furniture, vehicles, architecture, pavement, lighting, landscaping, climate cues, and public-space details appropriate to the specific scene. Do not exaggerate stereotypes or force landmarks. Keep the Saudi context natural, contemporary, and locally believable.';
  var SAUDI_TRAFFIC_RULE = 'SAUDI TRAFFIC AND VEHICLE ORIENTATION RULE — ABSOLUTE MANDATORY IN SAUDI ROAD, STREET, PARKING, DRIVING, OR CAR-INTERIOR SCENES. Saudi Arabia uses right-hand traffic and left-hand-drive passenger vehicles. The steering wheel must be mounted on the PHYSICAL LEFT SIDE of the vehicle when facing forward, and the driver must sit in the front-left seat. This must remain true even in selfies, mirrored-looking compositions, oblique camera angles, cropped framing, or images where the wheel visually falls on the right side of the picture. Do not confuse image-frame position with real vehicle-side position. Preserve a true left-hand-drive dashboard architecture: steering column, instrument cluster, driver controls and pedals on the left; passenger seat on the front-right. Never mirror, flip, reverse, or rebuild the cabin as right-hand-drive. Vehicles on Saudi roads must travel on the right-hand side with correct lane direction, road geometry, turning logic, and parked-car orientation.';
  var MULTI_PERSON_RULE = 'MULTI-PERSON RULE: Keep the main referenced person fixed to the reference identity only. Every additional person must have a clearly different and realistic facial identity, including a different face shape, naturally varied skin tone when appropriate, different hair and hairstyle, eyebrow pattern, age cues, and individual facial proportions. Never duplicate, clone, or closely echo the referenced face onto another person. Additional people must look like separate real individuals rather than variations of the same person. Their clothing must be realistic, physically plausible, appropriate to the scene and culture, with believable fabric weight, folds, fit, wear, and natural variation between people unless the scene logically requires similar dress.';
  var SAUDI_PEOPLE_RULE = 'MULTI-PERSON SAUDI DEMOGRAPHIC RULE — DEFAULT AND MANDATORY IN SAUDI SCENES. When more than one person is present, the visible group should be predominantly Saudi. Most people should read naturally as Saudi through realistic local context, styling, grooming, clothing choices, and scene-appropriate presentation. A very small number of non-Saudi foreigners may appear only when contextually natural. Do not make the group broadly multinational, evenly mixed by nationality, or dominated by foreigners unless the user explicitly requests that. Preserve individual facial diversity and avoid stereotyped or cloned appearances.';
  var LOW_LIGHT_RULE = 'LOW-LIGHT CAMERA REALISM — MANDATORY WHEN THE SCENE IS NIGHT, EVENING, DARK, DIM, OR OTHERWISE LOW-LIGHT. Abandon idealized cinematic lighting, perfect studio fill, and unnaturally clean night exposure. Simulate imperfect real smartphone behavior with visible high-ISO luminance noise, mild chroma noise where plausible, some crushed shadows, uneven practical lighting, locally clipped highlights, imperfect auto white balance, subtle halation around intense point lights, slight lens flare only when physically plausible, and tiny handheld slow-shutter artifacts. Avoid tripod-clean sharpness and DSLR-style depth of field.';
  var RANGE_ROVER_RULE = 'VEHICLE IDENTITY RULE — MANDATORY ONLY WHEN VEHICLE LOCK IS ON OR THE USER EXPLICITLY REQUESTS A RANGE ROVER. Depict the vehicle specifically as a white 2022 Range Rover Sport with high-fidelity, consistent details. Preserve white exterior paint, Range Rover Sport front fascia, grille pattern, LED headlight signature, hood and bumper shapes, wheel style, door proportions, premium sporty SUV stance, and a matching beige-or-cream-and-black premium interior. ABSOLUTE CABIN ORIENTATION: this Saudi-market vehicle is LEFT-HAND DRIVE. The steering wheel, driver seat, steering column, instrument cluster and primary driver controls must be on the PHYSICAL LEFT SIDE of the vehicle when facing forward; the front passenger seat must be on the right. Do not mirror or flip the cabin into right-hand-drive. Keep exterior and interior consistent as one exact vehicle. Do not substitute another brand, generation, model year, body style, or loosely similar SUV.';
  var SELFIE_ARM_AUTOPILOT_RULE = 'SELFIE ARM AUTO-ENGINEERING — ABSOLUTE PRIORITY FOR SELFIE SCENES. The user specifies the selfie angle, distance, posture, and framing; the model must automatically engineer the phone-holding arm around those choices. Solve a believable human reach with fixed anatomical segment lengths: real shoulder attachment, natural clavicle response, believable upper-arm length, elbow position, forearm path, wrist rotation, palm scale, finger anatomy, and phone grip. The arm must remain continuously attached and mechanically possible. If the chosen selfie distance is very close, keep the elbow clearly bent and the upper arm relatively near the torso; if the distance is moderately farther, increase reach only as much as needed. If the chosen angle is above eye level, use only a modest upward forearm path and small shoulder lift; if eye level, keep the arm more neutral; if slightly lower, adapt with realistic shoulder and wrist mechanics. The nearer forearm or hand may look somewhat larger because of real smartphone wide-angle perspective, but it must never become rubbery, telescoped, overlong, abnormally thick, or the dominant visual mass. If framing conflicts with anatomy, adjust crop, camera placement, or minor unspecified composition details instead of distorting the arm.';
  var SELFIE_ARM_COMPLIANCE_RULE = 'SELFIE ARM COMPLIANCE CHECK — REQUIRED BEFORE RENDERING. Confirm that the arm reach is not an independent guess but a realistic consequence of the selected selfie angle, selected selfie distance, and selected body posture. Verify that elbow bend, shoulder height, forearm direction, wrist rotation, phone position, and torso compensation all remain physically plausible. Never force a dramatic arm extension when the angle and distance do not require it. Never shorten, lengthen, paste, mirror, inflate, or beautify the arm to make the composition fit.';
  var FINAL_COMPLIANCE_RULE = 'FINAL COMPLIANCE CHECK — REQUIRED BEFORE RENDERING. Verify that every item in MANDATORY USER SELECTIONS is satisfied exactly in the image. Do not silently substitute a different selfie angle, pose, facial expression, gaze direction, camera distance, subject position, people count, image format, clothing, location, time, camera, lighting, background, or image condition. In every Saudi road, parking, driving, or car-interior scene, verify the vehicle is genuinely LEFT-HAND DRIVE: steering wheel and driver seat on the PHYSICAL LEFT SIDE when facing forward, never right-hand-drive, never mirrored or flipped. Do not let realism rules, identity rules, vehicle rules, Saudi-context rules, camera framing, selfie mirroring, or aesthetic choices override a direct user selection or the physical left-hand-drive requirement.';

  window.buildFinal = function(){
    var base = oldBuildFinal ? oldBuildFinal() : '';
    var v = values();
    var raw = rawValues();
    var add=[];
    if(selfieScene(v) && base.indexOf('SELFIE ARM AUTO-ENGINEERING')===-1) add.push(SELFIE_ARM_AUTOPILOT_RULE);
    if(!explicitNonSaudiLocation(v) && base.indexOf('SAUDI ARABIA LOCATION RULE')===-1) add.push(SAUDI_LOCATION_RULE);
    if(!explicitNonSaudiLocation(v) && roadOrVehicleScene(v) && base.indexOf('SAUDI TRAFFIC AND VEHICLE ORIENTATION RULE')===-1) add.push(SAUDI_TRAFFIC_RULE);
    if(String(v.people||'1')!=='1' && base.indexOf('MULTI-PERSON RULE:')===-1) add.push(MULTI_PERSON_RULE);
    if(String(v.people||'1')!=='1' && !explicitNonSaudiLocation(v) && base.indexOf('MULTI-PERSON SAUDI DEMOGRAPHIC RULE')===-1) add.push(SAUDI_PEOPLE_RULE);
    if(lowLight(v) && base.indexOf('LOW-LIGHT CAMERA REALISM')===-1) add.push(LOW_LIGHT_RULE);
    if(fixedRangeRoverRequested(raw) && base.indexOf('VEHICLE IDENTITY RULE')===-1) add.push(RANGE_ROVER_RULE);
    if(selfieScene(v) && base.indexOf('SELFIE ARM COMPLIANCE CHECK')===-1) add.push(SELFIE_ARM_COMPLIANCE_RULE);
    var middle = add.length ? base+'\n\n'+add.join('\n\n') : base;
    return mandatorySelections(raw)+'\n\n'+middle+'\n\n'+FINAL_COMPLIANCE_RULE;
  };

  window.buildNegative = function(){
    var base = oldBuildNegative ? oldBuildNegative() : '';
    var v = values();
    var raw = rawValues();
    var extras=['ignored user-selected setting','overridden manual control','substituted selfie angle','substituted pose','wrong gaze direction','wrong selfie distance','wrong subject position','wrong people count','wrong image format','wrong clothing','wrong location','wrong time','wrong camera','wrong lighting','wrong background','wrong image condition','automatic reinterpretation of explicit selection'];
    if(selfieScene(v)) extras.push('telecoped selfie arm','rubbery selfie arm','abnormally long forearm','abnormally thick forearm','dominant giant foreground arm','pasted selfie arm','detached shoulder','wrong elbow bend for selfie distance','impossible wrist rotation','camera held from an impossible arm path','unnecessary dramatic arm extension','mirrored selfie arm anatomy');
    if(!explicitNonSaudiLocation(v)) extras.push('generic Gulf setting','non-Saudi default location','foreign city cues without user request','stereotyped Saudi setting','fake Saudi landmarks');
    if(!explicitNonSaudiLocation(v) && roadOrVehicleScene(v)) extras.push('left-hand traffic in Saudi Arabia','right-hand-drive vehicle','right-hand-drive Saudi car','steering wheel physically mounted on the right side','driver seated in front-right seat','passenger seated in front-left seat','mirrored dashboard','mirrored car interior','horizontally flipped cabin','reversed dashboard architecture','wrong steering-column side','wrong instrument-cluster side','wrong pedal position','wrong traffic direction','vehicles driving on the left side of a Saudi road','inconsistent lane direction');
    if(String(v.people||'1')!=='1') extras.push('same face on multiple people','cloned people','repeated identity','reference face copied to another person','unrealistic clothing','identical outfits without scene reason');
    if(String(v.people||'1')!=='1' && !explicitNonSaudiLocation(v)) extras.push('foreign-majority crowd','evenly multinational group','non-Saudi-dominated scene','random foreign clothing mix','stereotyped Saudi faces');
    if(lowLight(v)) extras.push('cinematic lighting','perfect studio fill','perfectly clean night exposure','noise-free shadows','fully recovered shadow detail','uniform night illumination','tripod-clean night sharpness','fake uniform grain','excessive lens flare','excessive halation');
    if(fixedRangeRoverRequested(raw)) extras.push('generic SUV','wrong car model','wrong Range Rover generation','wrong body style','wrong body color','wrong interior color','inconsistent exterior and interior vehicle details','incorrect grille design','incorrect headlight signature','different luxury SUV brand');
    return base+', '+extras.join(', ');
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
