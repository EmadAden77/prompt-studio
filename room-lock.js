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

  var ROOM_PROFILE = 'BEDROOM REFERENCE IDENTITY LOCK — ABSOLUTE MANDATORY WHEN ROOM LOCK IS ON OR THE USER REFERS TO THE BEDROOM. Treat the uploaded bedroom photograph as the canonical fixed bedroom reference. Reproduce THIS SAME BEDROOM, not a similar bedroom, not a generic hotel room, and not a redesigned version. Preserve the visible architecture, room dimensions and proportions, furniture identity, furniture placement, materials, colors, clutter pattern, and spatial relationships as one stable room identity. FIXED VISIBLE BEDROOM PROFILE: a long rectangular bedroom viewed from the doorway; polished beige ceramic or stone-look floor tiles with visible grout lines; a large rectangular beige/tan area rug extending from the bed area toward the foreground; the bed positioned along the LEFT side of the room with a tall dark charcoal-to-black upholstered headboard formed by broad horizontal padded sections; gray bedding, pillows, sheets, and blanket visibly rumpled and naturally unmade; a dark wooden bedside/foreground table at the left front of the bed crowded with ordinary personal items including multiple clear plastic water bottles, white charging adapters, charging cables, a phone or small electronic device, cups or small containers, and other lived-in objects; a bedside lamp physically present on the left-side table; a white split air-conditioner mounted high on the upper LEFT wall; a large floor-to-ceiling dark curtain centered on the FAR wall; in front of or near the curtain, a chair or laundry/luggage zone containing mixed clothing and bags; the RIGHT wall occupied by a long dark-wood wardrobe and dressing system with tall mirrored vertical doors plus open wardrobe sections showing hanging clothes, shelves, and drawers; a long dark wooden dresser/drawer unit continuing along the right wall with ordinary toiletries, cups, bottles, and small personal objects on top; several pairs of shoes and sandals scattered naturally on the rug and nearby tile, including lighter sneakers nearer the middle foreground and darker footwear nearer the bed and right side; warm beige walls; a large layered recessed tray/coffered ceiling with multiple rectangular stepped borders and many small recessed downlights; the partially visible dark door and door hardware at the near-left foreground establishing the doorway viewpoint. PRESERVE OBJECT IDENTITY AND PLACEMENT: bed, headboard, bedside table, lamp object, air-conditioner, curtain, wardrobe, mirrored panels, open wardrobe sections, dresser, rug, shoes, water bottles, chargers, cables, toiletries, clothing clutter, bags, ceiling geometry, wall positions, and visible floor layout must remain consistent with this exact room. Do not modernize, beautify, simplify, enlarge, shrink, clean up, reorder, restyle, replace furniture, change the wardrobe system, move the bed, remove the clutter, change the rug, invent extra windows or doors, or transform it into another bedroom. CAMERA FLEXIBILITY: camera angle, height, crop, portrait/landscape framing, and distance may change when requested, but the room geometry and object relationships must remain physically consistent with the same room. LIGHTING FLEXIBILITY — IMPORTANT: lighting is NOT locked to the reference photograph. The room identity must remain fixed while lighting may change according to the user-selected time, lighting mode, darkness setting, practical-light source, or shooting condition. The bedside lamp may be on, dim, or off if the requested lighting requires it; ceiling lights may be on or off; daylight, darkness, phone-screen spill, streetlight spill, or other physically plausible light may change the exposure and shadow pattern. Never use a lighting change as an excuse to alter the room architecture, furniture, colors, materials, or object placement. Do not invent unseen room details with false certainty; extend occluded areas conservatively from the established room geometry.';

  var ROOM_COMPLIANCE = 'BEDROOM COMPLIANCE CHECK — REQUIRED BEFORE RENDERING. Confirm that the scene still depicts the SAME canonical bedroom: bed remains on the left with the same dark horizontally padded headboard and rumpled gray bedding; split AC remains high on the left wall; dark curtain remains centered on the far wall; long dark wardrobe/dressing system with mirrored doors and visible open clothing sections remains along the right wall; long dark dresser remains on the right; beige/tan rug remains in the same floor zone; tiled floor remains beige with grout lines; bedside/foreground table remains cluttered with water bottles, chargers, cables, and small personal objects; shoes, clothing, luggage/bags, toiletries, and ordinary clutter remain naturally distributed; layered recessed ceiling geometry remains the same. Lighting may differ from the reference according to the selected shooting mode, but the underlying room must not change.';

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
      txt.textContent=v.roomLock?'مفعّل: حافظ على نفس غرفة النوم المرجعية بكل تفاصيلها وتوزيعها، مع السماح بتغير الإضاءة حسب وضع التصوير.':'متوقف: عند ذكر غرفة النوم يستخدم التطبيق نفس الغرفة المرجعية، مع السماح بتغير الإضاءة.';
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
    if(roomRequested(v)) return ROOM_PROFILE+'\n\n'+base+'\n\n'+ROOM_COMPLIANCE;
    return base;
  };

  window.buildNegative=function(){
    var base=oldBuildNegative ? oldBuildNegative() : '';
    var v=rawState();
    if(roomRequested(v)){
      return base+', generic bedroom, similar-but-different bedroom, redesigned bedroom, luxury hotel bedroom, showroom bedroom, changed room proportions, moved bed, changed headboard, wrong bedding color, perfectly made bed, missing split air conditioner, moved air conditioner, missing dark far-wall curtain, changed curtain position, changed wardrobe system, missing mirrored wardrobe doors, missing open wardrobe clothing sections, changed dresser, missing beige area rug, changed rug shape, changed rug location, changed floor material, missing water bottles, missing chargers, missing cables, missing bedside clutter, removed shoes, removed clothing clutter, removed luggage or bags, changed ceiling geometry, invented windows, invented doors, arbitrary room rearrangement, lighting change causing room redesign';
    }
    return base;
  };

  function markVersion(){
    var badge=document.querySelector('.badge');
    if(badge) badge.textContent='Browser v3.12';
    var meta=document.querySelector('.meta span:last-child');
    if(meta) meta.textContent='Prompt Studio Browser v3.12';
  }

  ensureState();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){installToggle();markVersion();});
  } else {
    installToggle();markVersion();
  }
})();