(function(){
  var oldBuildFinal = window.buildFinal;
  var oldBuildNegative = window.buildNegative;

  function values(){
    try { return typeof smartValues === 'function' ? smartValues() : state; }
    catch(e) { return {}; }
  }

  function lowLight(v){
    var t=((v.idea||'')+' '+(v.location||'')+' '+(v.time||'')+' '+(v.lighting||'')).toLowerCase();
    return /ليل|ليلاً|ليلا|مساء|مساءً|الظلام|مظلم|إضاءة منخفضة|خافت|night|evening|dark|dim|low[- ]?light|street or parking lighting|screen light/.test(t);
  }

  function explicitNonSaudiLocation(v){
    var t=((v.idea||'')+' '+(v.location||'')).toLowerCase();
    return /اليمن|عدن|صنعاء|دبي|الإمارات|ابوظبي|أبوظبي|قطر|الدوحة|الكويت|البحرين|عمان|مسقط|مصر|القاهرة|تركيا|اسطنبول|لندن|باريس|أمريكا|الولايات المتحدة|اليابان|الصين|الهند|yemen|aden|sanaa|dubai|uae|qatar|doha|kuwait|bahrain|oman|muscat|egypt|cairo|turkey|istanbul|london|paris|usa|united states|japan|china|india/.test(t);
  }

  function vehicleRequested(v){
    var t=((v.idea||'')+' '+(v.location||'')+' '+(v.pose||'')+' '+(v.background||'')).toLowerCase();
    return !!v.vehicleLock || /سيارة|سياره|السيارة|السياره|داخل سيارة|داخل السياره|داخل السيارة|رنج|رانج|روفر|موقف|range rover|range-rover|sport suv|luxury suv|suv|car|vehicle|inside a car|parking/.test(t) || String(v.pose||'').toLowerCase()==='inside a car';
  }

  function roadOrVehicleScene(v){
    var t=((v.idea||'')+' '+(v.location||'')+' '+(v.pose||'')+' '+(v.background||'')).toLowerCase();
    return vehicleRequested(v) || /طريق|شارع|مواقف|موقف|قيادة|ازدحام|مرور|road|street|traffic|driving|parking/.test(t);
  }

  var SAUDI_LOCATION_RULE = 'SAUDI ARABIA LOCATION RULE — DEFAULT AND MANDATORY UNLESS THE USER EXPLICITLY NAMES ANOTHER COUNTRY OR CITY OUTSIDE SAUDI ARABIA. Treat the scene as taking place in Saudi Arabia. The environment must read as genuinely Saudi rather than generically Gulf: use physically plausible Saudi residential, commercial, office, street, parking, cafe, villa, shop, road, signage style, street furniture, vehicles, architecture, pavement, lighting, landscaping, climate cues, and public-space details appropriate to the specific scene. Do not exaggerate stereotypes or force landmarks. Keep the Saudi context natural, contemporary, and locally believable.';

  var SAUDI_TRAFFIC_RULE = 'SAUDI TRAFFIC AND VEHICLE ORIENTATION RULE — MANDATORY IN SAUDI ROAD, STREET, PARKING, DRIVING, OR CAR-INTERIOR SCENES. Vehicles in Saudi Arabia drive on the right-hand side of the road. Depict traffic flow, lane placement, turning geometry, parked-car orientation, road markings, and surrounding vehicle positions consistently with right-hand traffic. Passenger vehicles should be left-hand-drive, with the steering wheel, driver position, instrument cluster orientation, pedals, and primary driving controls on the left side of the cabin. For the Range Rover Sport, keep the steering wheel on the left and the driver seated on the left. Never mirror or flip the cabin into a right-hand-drive configuration, and do not place moving vehicles on the wrong side of a Saudi road.';

  var MULTI_PERSON_RULE = 'MULTI-PERSON RULE: Keep the main referenced person fixed to the reference identity only. Every additional person must have a clearly different and realistic facial identity, including a different face shape, naturally varied skin tone when appropriate, different hair and hairstyle, eyebrow pattern, age cues, and individual facial proportions. Never duplicate, clone, or closely echo the referenced face onto another person. Additional people must look like separate real individuals rather than variations of the same person. Their clothing must be realistic, physically plausible, appropriate to the scene and culture, with believable fabric weight, folds, fit, wear, and natural variation between people unless the scene logically requires similar dress.';

  var SAUDI_PEOPLE_RULE = 'MULTI-PERSON SAUDI DEMOGRAPHIC RULE — DEFAULT AND MANDATORY IN SAUDI SCENES. When more than one person is present, the visible group should be predominantly Saudi. Most people should read naturally as Saudi through realistic local context, styling, grooming, clothing choices, and scene-appropriate presentation. A very small number of non-Saudi foreigners may appear only when contextually natural, such as public, commercial, office, hospitality, transport, or service environments. Do not make the group broadly multinational, evenly mixed by nationality, or dominated by foreigners unless the user explicitly requests that. Preserve individual facial diversity and avoid stereotyped or cloned appearances. Clothing should remain realistic for contemporary Saudi Arabia and the exact setting: traditional Saudi clothing where appropriate, modern casual or workwear where appropriate, and limited foreign clothing variation only when context makes it natural.';

  var LOW_LIGHT_RULE = 'LOW-LIGHT CAMERA REALISM — MANDATORY WHEN THE SCENE IS NIGHT, EVENING, DARK, DIM, OR OTHERWISE LOW-LIGHT. Abandon idealized cinematic lighting, perfect studio fill, and unnaturally clean night exposure. Simulate the imperfect optical and sensor behavior of a real advanced smartphone camera in low light: visible high-ISO luminance noise with mild chroma noise where physically plausible, organic heavy grain rather than synthetic uniform grain, some underexposed regions with crushed blacks and lost shadow detail, uneven lighting across the face and environment, locally clipped highlights around bright practical lamps, and imperfect auto white balance. Use practical environmental light sources that actually exist in the scene, such as sodium-vapor street lamps, harsh fluorescent fixtures, LED shop or office lights, vehicle lights, phone-screen spill, or ambient city glow reflected from nearby buildings and sky. Allow subtle lens halation around intense point lights, slight lens flare only when a direct bright source plausibly reaches the lens, and tiny handheld slow-shutter artifacts or slight motion blur in darker areas while keeping the subject plausibly readable. Avoid tripod-clean sharpness. Simulate large-sensor smartphone low-light behavior, approximately 1-inch-class mobile-camera response where relevant, mobile photography characteristics around f/1.6 and 23 mm equivalent only as a visual-behavior reference, never as a reason to create DSLR-style depth of field. The result should resemble an unedited raw-like smartphone photo with realistic noise reduction, sharpening, compression, exposure limits, and sensor imperfections.';

  var RANGE_ROVER_RULE = 'VEHICLE IDENTITY RULE — MANDATORY WHEN THE SCENE INVOLVES THE USER\'S CAR OR ANY REQUEST TO BE INSIDE, NEXT TO, OR WITH THE CAR. Depict the vehicle specifically as a white 2022 Range Rover Sport with high-fidelity, consistent details. Preserve the recognizable sporty luxury-SUV proportions and design language: white exterior paint, Range Rover Sport front fascia, grille pattern, LED headlight signature, hood and bumper shapes, wheel style, door proportions, and premium sporty SUV stance. For interior views, keep a matching premium Range Rover Sport cabin with a beige or cream and black interior, the steering-wheel design, digital instrument cluster, center infotainment screens, center-console layout, wood trim, and an upscale cockpit feel consistent with the same vehicle. Keep the exterior and interior visually consistent as one exact vehicle, not a generic SUV or a different Range Rover generation. Do not substitute another brand, another model year, another body style, or a loosely similar luxury SUV.';

  window.buildFinal = function(){
    var base = oldBuildFinal ? oldBuildFinal() : '';
    var v = values();
    var add=[];
    if(!explicitNonSaudiLocation(v) && base.indexOf('SAUDI ARABIA LOCATION RULE')===-1) add.push(SAUDI_LOCATION_RULE);
    if(!explicitNonSaudiLocation(v) && roadOrVehicleScene(v) && base.indexOf('SAUDI TRAFFIC AND VEHICLE ORIENTATION RULE')===-1) add.push(SAUDI_TRAFFIC_RULE);
    if(String(v.people||'1')!=='1' && base.indexOf('MULTI-PERSON RULE:')===-1) add.push(MULTI_PERSON_RULE);
    if(String(v.people||'1')!=='1' && !explicitNonSaudiLocation(v) && base.indexOf('MULTI-PERSON SAUDI DEMOGRAPHIC RULE')===-1) add.push(SAUDI_PEOPLE_RULE);
    if(lowLight(v) && base.indexOf('LOW-LIGHT CAMERA REALISM')===-1) add.push(LOW_LIGHT_RULE);
    if(vehicleRequested(v) && base.indexOf('VEHICLE IDENTITY RULE')===-1) add.push(RANGE_ROVER_RULE);
    return add.length ? base+'\n\n'+add.join('\n\n') : base;
  };

  window.buildNegative = function(){
    var base = oldBuildNegative ? oldBuildNegative() : '';
    var v = values();
    var extras=[];
    if(!explicitNonSaudiLocation(v)) extras.push('generic Gulf setting','non-Saudi default location','foreign city cues without user request','stereotyped Saudi setting','fake Saudi landmarks');
    if(!explicitNonSaudiLocation(v) && roadOrVehicleScene(v)) extras.push('left-hand traffic in Saudi Arabia','right-hand-drive Saudi car','steering wheel on the right','driver seated on the right','mirrored car interior','wrong traffic direction','vehicles driving on the left side of a Saudi road','inconsistent lane direction');
    if(String(v.people||'1')!=='1') extras.push('same face on multiple people','cloned people','repeated identity','reference face copied to another person','unrealistic clothing','identical outfits without scene reason');
    if(String(v.people||'1')!=='1' && !explicitNonSaudiLocation(v)) extras.push('foreign-majority crowd','evenly multinational group','non-Saudi-dominated scene','random foreign clothing mix','stereotyped Saudi faces');
    if(lowLight(v)) extras.push('cinematic lighting','perfect studio fill','perfectly clean night exposure','noise-free shadows','fully recovered shadow detail','uniform night illumination','tripod-clean night sharpness','fake uniform grain','excessive lens flare','excessive halation');
    if(vehicleRequested(v)) extras.push('generic SUV','wrong car model','wrong Range Rover generation','wrong body style','wrong body color','wrong interior color','inconsistent exterior and interior vehicle details','incorrect grille design','incorrect headlight signature','different luxury SUV brand');
    return extras.length ? base+', '+extras.join(', ') : base;
  };
})();
