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

  var ROOM_PROFILE = 'ROOM IDENTITY LOCK — ABSOLUTE MANDATORY WHEN ROOM LOCK IS ON. Preserve the same bedroom as the room reference represented by this fixed profile, keeping its visible architecture, furniture placement, clutter pattern, materials, colors, and spatial relationships consistent instead of generating a generic or redesigned bedroom. VISIBLE ROOM PROFILE: a compact lived-in bedroom with a bed occupying most of the left and center background; a tall dark charcoal or black upholstered headboard on the left; rumpled gray bedding with naturally wrinkled sheets, pillows, and a gray blanket; a small dark bedside table beside the headboard with ordinary personal items and a water bottle; a small wooden table or nightstand in the near-left foreground holding multiple clear plastic water bottles, charging cables, a white power adapter, a dark phone or small electronic device, and other small everyday objects; dark curtains covering the large window or wall opening on the right-rear side; a recessed tray-style ceiling with layered rectangular borders and small recessed spotlights; neutral beige-to-gray walls; dark floor around the bed with a small light-colored rug visible near the foot area; on the right side, natural lived-in clutter including dark clothing, light-colored clothing, and luggage or a bag near the bed. Keep the room imperfectly tidy and realistically occupied. Preserve the relative positions of the bed, headboard, curtains, tables, bottles, cables, clutter, ceiling geometry, and visible floor area. Do not replace the furniture, change the architectural style, add luxury decor, enlarge the room, remove the ordinary clutter, invent windows or doors not visible in the reference, or turn it into a hotel-showroom bedroom. When camera angle or framing changes, maintain the same room geometry and object relationships as far as they would physically remain visible from the new viewpoint. Do not invent unseen room details with false certainty; preserve only the established visible room identity and extend occluded areas conservatively.';

  var ROOM_COMPLIANCE = 'ROOM COMPLIANCE CHECK — REQUIRED BEFORE RENDERING WHEN ROOM LOCK IS ON. Verify that the generated scene still reads as the same specific bedroom: same bed position and dark upholstered headboard, same rumpled gray bedding, same dark rear curtains, same tray ceiling and recessed lights, same bedside and foreground table zones, same ordinary water bottles and charging-cable clutter, same right-side clothing or luggage clutter, same neutral wall palette, and same lived-in non-showroom character. Do not beautify, simplify, rearrange, replace, or redesign the room merely for aesthetics.';

  function installToggle(){
    ensureState();
    if(document.getElementById('roomLock')) return;
    var smart=document.getElementById('smartMode');
    if(!smart || !smart.parentElement || !smart.parentElement.parentElement) return;
    var container=document.createElement('div');
    container.className='toggle';
    container.innerHTML='<div><strong>تثبيت الغرفة</strong><small id="roomText">متوقف: لا تُفرض الغرفة المرجعية الثابتة.</small></div><button id="roomLock" class="switch" type="button"></button>';
    smart.parentElement.parentElement.insertBefore(container, smart.parentElement);
    var btn=document.getElementById('roomLock');
    var txt=document.getElementById('roomText');
    function sync(){
      var v=rawState();
      btn.classList.toggle('on',!!v.roomLock);
      txt.textContent=v.roomLock?'مفعّل: حافظ على نفس الغرفة وتفاصيلها المرئية وتوزيع الأثاث والفوضى الطبيعية بدقة.':'متوقف: لا تُفرض الغرفة المرجعية الثابتة.';
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
    if(v.roomLock) return ROOM_PROFILE+'\n\n'+base+'\n\n'+ROOM_COMPLIANCE;
    return base;
  };

  window.buildNegative=function(){
    var base=oldBuildNegative ? oldBuildNegative() : '';
    var v=rawState();
    if(v.roomLock){
      return base+', generic bedroom, redesigned bedroom, luxury hotel bedroom, showroom bedroom, changed bed position, changed headboard, wrong bedding color, clean perfectly made bed, missing dark curtains, changed ceiling design, missing bedside table, missing water bottles, missing charging cables, missing everyday clutter, removed right-side clothing clutter, invented luxury furniture, enlarged room, changed wall palette, arbitrary room rearrangement, invented visible architecture not supported by the room reference';
    }
    return base;
  };

  function markVersion(){
    var badge=document.querySelector('.badge');
    if(badge) badge.textContent='Browser v3.11';
    var meta=document.querySelector('.meta span:last-child');
    if(meta) meta.textContent='Prompt Studio Browser v3.11';
  }

  ensureState();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){installToggle();markVersion();});
  } else {
    installToggle();markVersion();
  }
})();
