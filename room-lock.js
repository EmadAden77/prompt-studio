(function(){
  var oldBuildFinal = window.buildFinal;
  var oldBuildNegative = window.buildNegative;

  function rawState(){
    try { return typeof state==='object' && state ? state : {}; }
    catch(e){ return {}; }
  }

  function ensureState(){
    try {
      if(typeof state==='object' && state && typeof state.roomLock!=='boolean') state.roomLock=false;
    } catch(e) {}
  }

  function roomRequested(v){
    var t=((v.idea||'')+' '+(v.location||'')+' '+(v.background||'')).toLowerCase();
    return !!v.roomLock || /غرفة النوم|غرفه النوم|داخل غرفة النوم|داخل غرفه النوم|bedroom|my bedroom|the bedroom/.test(t);
  }

  var ROOM_PROFILE = 'BEDROOM REFERENCE IDENTITY LOCK — ABSOLUTE MANDATORY WHEN ROOM LOCK IS ON OR THE USER REFERS TO THE BEDROOM. Treat the adopted bedroom reference photograph as the canonical source for BOTH this same bedroom and the same referenced person visible in it. Preserve the room architecture, dimensions, wall positions, ceiling geometry, floor layout, bed location, headboard identity, furniture identity, furniture placement, wardrobe/dresser system, curtain location, air-conditioner location, rug zone, established color palette, material families, and spatial relationships. Preserve the person as the same individual with the same facial identity, face/head geometry, hairline, hairstyle, beard pattern, apparent age, skin tone, and natural asymmetry. The reference photograph does NOT lock the person\'s exact pose, selfie angle, crop, clothing, facial expression, gaze, or lighting; those remain controlled by the active bedroom selections. Do not redesign, modernize, beautify, simplify, enlarge, shrink, clean into a showroom, replace furniture, move major furniture, invent extra windows or doors, or transform the room into a hotel, catalog, luxury interior, or generic bedroom. CAMERA FLEXIBILITY — IMPORTANT. Bedroom and person identity are fixed, but selfie camera angle, camera height, crop, orientation, distance, and visible room coverage may change according to the selected bedroom selfie controls. Reconstruct newly visible areas conservatively from the established geometry rather than inventing a different room. REFERENCE LIGHTING IS NOT LOCKED. Do not copy the reference photograph lighting merely because it is visible in the reference. The dedicated Bedroom Lighting control is the sole authority for active light sources, direction, intensity, color temperature, falloff, shadows, reflections, exposure, and low-light behavior.';

  var ROOM_PROFILE_DETAILS = 'FIXED VISIBLE BEDROOM PROFILE — MANDATORY ROOM IDENTITY. Keep the long rectangular bedroom geometry; polished beige ceramic or stone-look tile floor with visible grout; large beige/tan rug in the established bed-to-foreground zone; bed along the left side with the same tall dark horizontally padded headboard; gray bedding and pillows belonging to the same bed; dark bedside/foreground table; physically present bedside lamp object; white split air-conditioner mounted high on the upper-left wall; large dark floor-to-ceiling curtain on the far wall; the existing chair/laundry/luggage zone near the curtain; long dark-wood wardrobe and dressing system with mirrored vertical doors plus open clothing/shelf/drawer sections along the right wall; long dark dresser continuing along the right wall; existing ordinary toiletries, bottles, chargers, cables, clothing, bags, shoes and sandals where they belong to the reference identity; warm beige walls; layered recessed tray/coffered ceiling with its established downlight positions; and the near-left doorway relationship. Existing reference objects remain part of the room identity. Additional small items must never be added merely to make the room look busier.';

  var PERSON_REFERENCE_RULE = 'BEDROOM PERSON REFERENCE — IDENTITY ONLY. The person visible in the adopted bedroom reference is the identity anchor for the bedroom scene. Preserve the same face, skull and facial proportions, hairline, hairstyle, beard/mustache pattern, skin tone, apparent age, and natural asymmetry. Do not copy the reference pose, arm position, selfie reach, crop, clothing, expression, gaze, or lighting unless the current bedroom controls independently select the same thing. Active bedroom controls outrank those incidental reference-photo attributes.';

  var MATERIAL_RULE = 'BEDROOM MATERIAL PHYSICS — ABSOLUTE. Render every room material according to real physical behavior rather than synthetic surface styling. Bedding must show believable cotton-like weave, non-repeating microtexture, fabric weight, compression, tension, wrinkles, bunching, and gravity-driven drape over mattress edges. Pillows must compress where supported and keep imperfect natural creases instead of identical shapes. Wood must retain restrained grain, subtle ordinary wear, and soft scene-dependent reflections rather than glossy CGI sheen. Painted walls must show faint real surface variation and minor ordinary wear rather than perfectly flat digital surfaces. Glass and mirrors must preserve correct perspective, room-consistent reflections, restrained highlights, and only subtle plausible smudges where allowed by the selected clutter/use level. Metal should have soft physically justified highlights rather than chrome-like glare. Plastic objects should read matte to lightly reflective according to material, never uniformly glossy. Do not add fake microtexture as a decorative overlay.';

  var CONTACT_RULE = 'BEDROOM CONTACT, GRAVITY, AND GEOMETRY — ABSOLUTE. Every visible object must occupy real space with correct scale, perspective, occlusion, grounding, contact shadows, and gravity. Furniture must meet the floor naturally. Bed linens must contact the mattress and drape from real edges. Curtains must hang from believable attachment points with gravity-consistent folds and fabric weight. Cables must follow natural sag and curvature and connect logically to an outlet, charger, power adapter, or device when the connection is visible; never create a cable that ends meaninglessly in midair. Bottles, chargers, remotes, books, tissue boxes, clothing, shoes, and other small objects must rest on real supporting surfaces. Mirrors must reflect the room from the correct viewpoint without inventing contradictory architecture or duplicate objects. Nothing may float, melt, merge into furniture, clip through surfaces, duplicate itself, or cast a shadow inconsistent with the selected bedroom lighting.';

  var CLUTTER_RULE = 'BEDROOM CLUTTER AUTHORITY — MANDATORY. The dedicated Bedroom Clutter control alone determines whether any EXTRA lived-in disorder is added and how much. Existing objects already visible in the canonical bedroom reference belong to the room identity and should remain coherent. Do not use the room-reference lock as permission to invent additional clutter, and do not use realism rules to override the selected clutter level. If extra clutter is permitted, keep it purposeful, sparse enough for the selected level, non-repetitive, logically placed by daily use, physically grounded, and consistent with gravity. Appropriate examples may include slight bedding disorder, a naturally placed charger cable, one or two ordinary personal items, subtle curtain irregularity, minor fabric lint, faint surface smudges, a small wall scuff, or a slightly uneven rug edge, but only when the selected clutter level allows them. Never scatter random trash, clothing, cables, bottles, or accessories throughout the room.';

  var ROOM_CAMERA_REALISM = 'BEDROOM SMARTPHONE-PHOTO CHARACTER — SUPPORTING RULE ONLY. Preserve ordinary smartphone-photo behavior where compatible with the selected camera and lighting: restrained sharpening, natural exposure variation, modest edge softness, realistic white balance, limited dynamic range, and mild sensor noise only where the lighting warrants it. Do not turn the room into an interior-design photograph, studio-lit catalog image, hyper-clean render, or aggressively processed HDR scene. This rule may not override the selected Xiaomi front-camera behavior, selected lighting, selected selfie geometry, identity lock, or body lock.';

  var ROOM_COMPLIANCE = 'BEDROOM ROOM-AND-PERSON REFERENCE COMPLIANCE CHECK — REQUIRED BEFORE RENDERING. Verify that the result still depicts the SAME canonical bedroom with unchanged architecture and major furniture relationships AND the SAME referenced person identity. Confirm that pose, selfie angle, crop, clothing, expression, gaze, and lighting come from the active bedroom controls rather than being copied from the reference photograph by default. The selected Bedroom Lighting control, not reference-image lighting, determines illumination; the selected Bedroom Clutter control determines any extra disorder; bedding, curtains, walls, wood, mirrors, glass, metal, plastic, cables, and small objects obey real material and contact physics; mirrors and reflections remain geometrically consistent; no object floats, duplicates, melts, clips, or loses a logical support/contact relationship. If realism conflicts with room identity, person identity, or an explicit bedroom control, preserve both identities and the explicit control and revise only unspecified micro-details.';

  function installToggle(){
    ensureState();
    if(document.getElementById('roomLock')) return;
    var smart=document.getElementById('smartMode');
    if(!smart || !smart.parentElement || !smart.parentElement.parentElement) return;
    var container=document.createElement('div');
    container.className='toggle';
    container.innerHTML='<div><strong>تثبيت الغرفة</strong><small id="roomText">متوقف: عند ذكر غرفة النوم سيظل المرجع الأساسي محفوظًا، ويمكن تشغيل التثبيت الصريح من هنا.</small></div><button id="roomLock" class="switch" type="button"></button>';
    smart.parentElement.parentElement.insertBefore(container, smart.parentElement);
    var btn=document.getElementById('roomLock');
    var txt=document.getElementById('roomText');
    function sync(){
      var v=rawState();
      btn.classList.toggle('on',!!v.roomLock);
      txt.textContent=v.roomLock?'مفعّل: ثبات هوية الشخص والغرفة من المرجع، بينما الوضعية والكادر والملابس والتعبير والإنارة تتبع خانات غرفة النوم.':'متوقف: عند ذكر غرفة النوم يستخدم التطبيق نفس مرجع الشخص والغرفة، مع بقاء الاختيارات الأخرى تحت تحكم خاناتها.';
    }
    btn.onclick=function(){
      try { state.roomLock=!state.roomLock; } catch(e) {}
      sync();
      try { if(typeof save==='function') save(); } catch(e) {}
      try { if(typeof autoRefresh==='function') autoRefresh(); } catch(e) {}
    };
    sync();
  }

  window.buildFinal=function(){
    var base=oldBuildFinal ? oldBuildFinal() : '';
    var v=rawState();
    if(roomRequested(v)){
      return [ROOM_PROFILE,ROOM_PROFILE_DETAILS,PERSON_REFERENCE_RULE,MATERIAL_RULE,CONTACT_RULE,CLUTTER_RULE,ROOM_CAMERA_REALISM,base,ROOM_COMPLIANCE].join('\n\n');
    }
    return base;
  };

  window.buildNegative=function(){
    var base=oldBuildNegative ? oldBuildNegative() : '';
    var v=rawState();
    if(roomRequested(v)){
      var x=[
        'generic bedroom','similar-but-different bedroom','redesigned bedroom','luxury hotel bedroom','showroom bedroom','interior-design catalog styling','changed room proportions','moved bed','changed headboard','replaced furniture','changed wardrobe system','changed dresser','moved air conditioner','changed curtain position','changed rug zone','changed floor material','invented windows','invented doors','arbitrary room rearrangement','reference person identity drift','reference pose copied instead of selected pose','reference clothing copied instead of selected clothing','reference expression copied instead of selected expression','reference selfie crop copied instead of selected selfie crop','reference-image lighting overriding Bedroom Lighting control','extra clutter overriding Bedroom Clutter control','random clutter','excessive mess','trash scattered through room','duplicated clutter objects','repeated bottles','repeated shoes','floating objects','objects clipping through furniture','melted furniture','warped furniture geometry','disconnected floating cable','cable ending in midair without purpose','gravity-defying curtain','floating bedding','impossible bedding drape','identical pillows','perfectly folded staged bedding','perfectly clean showroom surfaces','perfectly smooth synthetic walls','plastic-looking wood','chrome-like artificial metal reflections','uniform glossy plastic','incorrect mirror perspective','impossible mirror reflection','duplicate objects in reflections','synthetic material texture','excessive sharpening','extreme HDR','perfectly even catalog exposure'
      ];
      return (base?base+', ':'')+x.join(', ');
    }
    return base;
  };

  function markVersion(){
    var badge=document.querySelector('.badge');
    if(badge) badge.textContent='Browser v3.42';
    var meta=document.querySelector('.meta span:last-child');
    if(meta) meta.textContent='Prompt Studio Browser v3.42';
  }

  ensureState();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){installToggle();markVersion();});
  } else {
    installToggle();markVersion();
  }
})();