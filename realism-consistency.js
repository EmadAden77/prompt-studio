(function(){
  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;
  var AUTO='__auto_prompt__';
  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function V(){try{return typeof smartValues==='function'?smartValues():S()}catch(e){return S()}}
  function isAuto(v){return !v||String(v)===AUTO||/^auto\b/i.test(String(v))}
  function bedroom(v){var t=((v.idea||'')+' '+(v.location||'')).toLowerCase();return location.hash==='#bedroom'||!!v.roomLock||/غرفة النوم|غرفه النوم|bedroom/.test(t)}
  function car(v){var t=((v.idea||'')+' '+(v.location||'')+' '+(v.pose||'')).toLowerCase();return location.hash==='#car'||!!v.vehicleLock||/سيارة|سياره|رنج|رانج|روفر|range rover|inside a car|داخل سيارة|داخل السياره/.test(t)}
  function selfie(v){var t=((v.idea||'')+' '+(v.camera||'')+' '+(v.angle||'')+' '+(v.pose||'')).toLowerCase();return /سيلفي|selfie|front camera|front-facing/.test(t)||!isAuto(v.selfieBodyPose)||!isAuto(v.freeHandPose)}
  function normalizeContext(){
    var s=S(),changed=false;
    if(bedroom(s)&&!car(s)&&/holding car keys|steering wheel/.test(String(s.freeHandPose||''))){s.freeHandPose=AUTO;changed=true;}
    if(changed){try{if(typeof save==='function')save()}catch(e){}try{if(typeof renderPickers==='function')renderPickers()}catch(e){}}
    try{
      if(typeof OPTIONS==='object'&&Array.isArray(OPTIONS.freeHandPose)&&bedroom(s)&&!car(s)){
        OPTIONS.freeHandPose=OPTIONS.freeHandPose.filter(function(x){return x&& !/holding car keys|steering wheel/.test(String(x[0]||''))});
      }
    }catch(e){}
  }
  function effectiveArm(v){
    var d=String(v.distance||'').toLowerCase(),a=String(v.angle||'').toLowerCase(),p=String(v.pose||'').toLowerCase(),f=String(v.frame||'').toLowerCase();
    var cm='38–46 cm',elbow='65–95°',reach='close, clearly bent selfie reach';
    if(/very close|قريب جدًا|قريب جدا/.test(d)){cm='30–40 cm';elbow='75–105°';reach='very close reach with the elbow clearly bent';}
    else if(/40 cm|40 سم/.test(d)){cm='38–44 cm';elbow='65–90°';reach='close reach with a clear elbow bend';}
    else if(/50 cm|50 سم/.test(d)){cm='46–54 cm';elbow='40–70°';reach='medium reach with a soft elbow bend';}
    else if(/60 cm|60 سم/.test(d)){cm='55–62 cm';elbow='15–35°';reach='longer reach with a small remaining bend';}
    else if(isAuto(v.distance)){
      if(/clearly above|مرتفعة بوضوح|very high|overhead/.test(a)){cm='42–48 cm';elbow='55–80°';reach='automatically limited elevated selfie reach';}
      else if(/slightly above|أعلى من العين قليل/.test(a)){cm='36–44 cm';elbow='70–95°';reach='automatically limited close selfie reach';}
      else if(/below|low|أسفل|منخفض/.test(a)){cm='40–48 cm';elbow='55–85°';reach='automatically limited low-angle selfie reach';}
      else {cm='36–44 cm';elbow='70–100°';reach='automatically limited natural selfie reach';}
      if(/standing|واقف/.test(p)&&/off-center|غير متمركز/.test(f)){cm='40–48 cm';elbow='60–85°';}
    }
    return 'AUTOMATIC SELFIE GEOMETRY CONTRACT — HIGHEST PRIORITY. The phone-holding arm is solved automatically from the selected camera angle, body pose, framing and selfie-distance control. CURRENT EFFECTIVE CAMERA-TO-FACE DISTANCE: '+cm+'. CURRENT ARM SOLUTION: '+reach+', with approximately '+elbow+' of elbow flexion. Never straighten the elbow merely to show more of the room. Keep the upper arm relatively close to the torso, let only the forearm project toward the phone, and allow only modest wide-angle enlargement. The visible forearm must enter from the lower SIDE edge on the phone-holding side and should be partially cropped; do not show it as a long central diagonal bar or a giant foreground slab. For vertical 9:16 selfies, crop the body tighter whenever necessary rather than lengthening the arm. If room context and close selfie geometry compete, preserve human anatomy first and show less body or less floor.';
  }
  function clutterContract(v){
    var level=String(v.bedroomClutter||'auto bedroom clutter');
    var selected=!!S().onlySelected;
    var levelText='keep the reference bedroom lived-in but controlled';
    if(level==='light realistic clutter')levelText='use only subtle lived-in disorder';
    if(level==='natural realistic clutter')levelText='use ordinary daily lived-in disorder';
    if(level==='clear realistic clutter')levelText='make the existing lived-in disorder clearly visible';
    if(level==='heavy realistic clutter')levelText='increase the degree of disorder noticeably, but do NOT increase object count indiscriminately';
    if(level==='very heavily used realistic bedroom')levelText='make the room look heavily used through rumpling, irregular placement and clustered use-zones, not through object multiplication';
    var add=selected?'Because SELECTED-ONLY MODE is on, do not invent new clutter categories or optional objects; work only with objects already established by the canonical room reference and explicitly selected scene elements.':'If an extra item is truly necessary, add at most a very small number of non-repeating ordinary items and keep them subordinate to the reference room.';
    return 'BEDROOM CLUTTER DISTRIBUTION CONTRACT — HIGHEST PRIORITY. '+levelText+'. '+add+' Preserve approximate reference object counts and categories. Create realism through uneven folds, partial occlusion, irregular spacing, small clusters near real use-zones (bedside table, bed edge, wardrobe area), and natural empty floor between clusters. Do not distribute clutter evenly across the rug or floor. Do not create rows or repeated pairs of shoes. Do not duplicate bottles, chargers, cables, garments, cups or footwear. Do not cover the room with props just because the clutter setting is high. High clutter means more disorder in the SAME lived-in room, not more generated objects.';
  }
  function stripBlocks(text,v){
    var kill=['AUTOMATIC SELFIE ARM SOLVER —','AUTOMATIC SELFIE GEOMETRY CONTRACT —','SELFIE ARM BIOMECHANICS —','SELFIE DISTANCE GEOMETRY —','SELFIE PHYSICAL CONSISTENCY CHECK —','BEDROOM REALISTIC CLUTTER —','REALISTIC BEDROOM CLUTTER QUALITY RULE —','BEDROOM CLUTTER DISTRIBUTION CONTRACT —'];
    if(bedroom(v))kill.push('SAUDI ARABIA LOCATION RULE —');
    return String(text||'').split(/\n\n+/).filter(function(p){var t=p.trim();return !kill.some(function(k){return t.indexOf(k)===0})}).join('\n\n').trim();
  }
  function critical(v){
    var parts=['CRITICAL RENDER CONTRACT — RESOLVE THESE BEFORE ALL LOWER-PRIORITY DETAIL.'];
    if(S().identityLock)parts.push('1) Preserve the exact referenced facial identity and stable face geometry.');
    if(bedroom(v))parts.push('2) Preserve the exact canonical bedroom architecture, furniture identity and spatial layout.');
    if(selfie(v))parts.push('3) Solve the selfie arm from real human biomechanics and crop the frame before ever stretching the limb.');
    if(bedroom(v)&&v.bedroomLighting)parts.push('4) Obey the dedicated bedroom-lighting mode exactly; do not add hidden fill sources.');
    if(bedroom(v)&&v.bedroomClutter)parts.push('5) Treat clutter as controlled disorder of the reference room, never as permission to multiply objects.');
    return parts.join(' ');
  }
  window.buildFinal=function(){
    normalizeContext();
    var v=V(),base=previousFinal?previousFinal():'';
    base=stripBlocks(base,v);
    var top=[critical(v)];
    if(selfie(v))top.push(effectiveArm(v));
    if(bedroom(v))top.push(clutterContract(v));
    return top.join('\n\n')+'\n\n'+base;
  };
  window.buildNegative=function(){
    normalizeContext();
    var v=V(),base=previousNegative?previousNegative():'';
    var x=[];
    if(selfie(v))x=x.concat(['full straight selfie arm when distance is automatic or close','giant foreground forearm','long diagonal forearm dominating the frame','center-bottom selfie arm','whole forearm shown unnecessarily','camera distance increased just to fit more body','arm stretched to reveal more room']);
    if(bedroom(v))x=x.concat(['object multiplication for clutter','duplicated shoes','rows of shoes','evenly spaced clutter','uniformly scattered objects','duplicated bottles','duplicated chargers','duplicated garments','clutter covering every empty floor area','Saudi exterior context added inside locked bedroom']);
    return (base?base+', ':'')+x.join(', ');
  };
  function badge(){var b=document.querySelector('.badge');if(b)b.textContent='Browser v3.25';var m=document.querySelector('.meta span:last-child');if(m)m.textContent='Prompt Studio Browser v3.25';}
  function init(){normalizeContext();badge();setTimeout(normalizeContext,300);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();