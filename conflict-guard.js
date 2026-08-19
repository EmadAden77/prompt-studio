(function(){
  var AUTO='__auto_prompt__';
  var NOTICE_ID='conflictNotice';

  function getState(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function getOptions(){try{return typeof OPTIONS==='object'&&OPTIONS?OPTIONS:{}}catch(e){return {}}}
  function saveAndRefresh(){try{if(typeof save==='function')save()}catch(e){}try{if(typeof autoRefresh==='function')autoRefresh()}catch(e){}}

  function ensureNotice(){
    if(document.getElementById(NOTICE_ID))return document.getElementById(NOTICE_ID);
    var body=document.querySelector('.body'); if(!body)return null;
    var n=document.createElement('div');
    n.id=NOTICE_ID;
    n.style.display='none';
    n.style.margin='10px 0';
    n.style.padding='10px 12px';
    n.style.border='1px solid #6b4f20';
    n.style.background='#1e170b';
    n.style.color='#ffd993';
    n.style.borderRadius='12px';
    n.style.fontSize='12px';
    n.style.lineHeight='1.6';
    body.insertBefore(n,body.children[2]||body.firstChild);
    return n;
  }

  function notify(msg){
    var n=ensureNotice(); if(!n)return;
    n.textContent=msg; n.style.display='block';
    clearTimeout(n._timer); n._timer=setTimeout(function(){n.style.display='none'},3200);
  }

  function isVeryClose(v){return /very close|قريب جدًا|قريب جدا/.test(String(v.distance||'').toLowerCase())}
  function isLying(v){return /lying|reclining|semi-reclined|مستلق|استلقاء/.test(String(v.pose||'').toLowerCase())||/reclining/.test(String(v.selfieBodyPose||'').toLowerCase())}
  function carScene(v){var t=((v.idea||'')+' '+(v.location||'')+' '+(v.pose||'')).toLowerCase();return /سيارة|سياره|داخل سيارة|داخل السياره|داخل السيارة|car|vehicle|range rover|رنج|رانج|روفر/.test(t)||String(v.pose||'')==='inside a car'}
  function bedroomScene(v){var t=((v.idea||'')+' '+(v.location||'')).toLowerCase();return !!v.roomLock||/غرفة النوم|غرفه النوم|bedroom/.test(t)}

  function disabledReason(key,value,v){
    value=String(value||'');
    if(value===AUTO)return '';

    if(key==='distance' && isVeryClose(v) && /full arm extension/.test(value)) return 'قريب جدًا لا يتوافق مع مد الذراع بالكامل.';
    if(key==='selfieBodyPose' && isLying(v) && /weight resting mainly on one leg|subtle natural hip shift/.test(value)) return 'وضعية الاستلقاء لا تتوافق مع الوقوف على ساق واحدة أو ميل الحوض أثناء الوقوف.';
    if(key==='selfieBodyPose' && /inside a car/.test(String(v.pose||'')) && /weight resting mainly on one leg|candid body posture during slight movement/.test(value)) return 'هذه وضعية جسم غير مناسبة أثناء الجلوس داخل السيارة.';
    if(key==='freeHandPose' && !carScene(v) && /steering wheel/.test(value)) return 'اليد على المقود تتطلب مشهدًا داخل سيارة.';
    if(key==='freeHandPose' && /lying|reclining/.test(String(v.pose||'').toLowerCase()) && /resting behind the back/.test(value)) return 'هذه الحركة غير مناسبة لوضعية الاستلقاء الحالية.';

    if(key==='bedroomLighting'){
      var current=String(v.bedroomLighting||'');
      if(current==='all lights off' && value!=='all lights off') return 'جميع الأنوار مطفأة يتعارض مع أي مصدر إضاءة آخر.';
      if(current==='single white ceiling spotlight only' && /ceiling spotlights only|single white ceiling bulb only|bedside lamp only|full ceiling lighting|warm lighting|cool lighting|mixed realistic bedroom lighting/.test(value)) return 'سبوت واحد فقط يمنع تشغيل مصادر إضاءة غرفة أخرى.';
      if(current==='single white ceiling bulb only' && /ceiling spotlights only|single white ceiling spotlight only|bedside lamp only|full ceiling lighting|warm lighting|cool lighting|mixed realistic bedroom lighting/.test(value)) return 'لمبة سقف بيضاء واحدة فقط تمنع باقي مصادر الإنارة.';
      if(current==='bedside lamp only' && /ceiling spotlights only|single white ceiling spotlight only|single white ceiling bulb only|full ceiling lighting/.test(value)) return 'لمبة الطاولة فقط تتعارض مع إنارة السقف.';
    }

    if(bedroomScene(v) && (key==='lighting'||key==='realisticLighting') && v.bedroomLighting && v.bedroomLighting!=='auto bedroom prompt') return 'إنارة غرفة النوم الخاصة مفعّلة، لذلك هذه الخانة العامة غير مستخدمة في غرفة النوم.';

    return '';
  }

  function resetInvalidSelections(){
    var v=getState(), changed=[];
    var checks=[['distance',v.distance],['selfieBodyPose',v.selfieBodyPose],['freeHandPose',v.freeHandPose]];
    checks.forEach(function(pair){var reason=disabledReason(pair[0],pair[1],v);if(reason){v[pair[0]]=AUTO;changed.push(reason)}});
    if(changed.length){saveAndRefresh();notify('تم إرجاع خيار متعارض إلى تلقائي: '+changed[0]);return true}
    return false;
  }

  function renderDisabledOptions(){
    var v=getState();
    document.querySelectorAll('.picker').forEach(function(picker){
      var key=picker.dataset.key; if(!key)return;
      var opts=(getOptions()[key]||[]);
      var buttons=picker.querySelectorAll('.pickerOpt');
      buttons.forEach(function(btn,i){
        var item=opts[i]; if(!item)return;
        var reason=disabledReason(key,item[0],v);
        btn.disabled=!!reason;
        btn.style.opacity=reason?'0.38':'1';
        btn.style.cursor=reason?'not-allowed':'pointer';
        btn.title=reason||'';
        if(reason)btn.setAttribute('aria-disabled','true');else btn.removeAttribute('aria-disabled');
      });
    });
  }

  function install(){
    ensureNotice();
    var originalRender=window.renderPickers;
    if(typeof originalRender==='function'&&!originalRender._conflictWrapped){
      var wrapped=function(){
        originalRender();
        setTimeout(renderDisabledOptions,0);
      };
      wrapped._conflictWrapped=true;
      window.renderPickers=wrapped;
    }

    document.addEventListener('click',function(e){
      var btn=e.target.closest('.pickerOpt'); if(!btn)return;
      var picker=btn.closest('.picker'); if(!picker)return;
      var key=picker.dataset.key; var opts=(getOptions()[key]||[]);
      var buttons=[].slice.call(picker.querySelectorAll('.pickerOpt'));
      var idx=buttons.indexOf(btn); var item=opts[idx]; if(!item)return;
      var reason=disabledReason(key,item[0],getState());
      if(reason){e.preventDefault();e.stopImmediatePropagation();notify('هذا الخيار مقفل: '+reason)}
    },true);

    document.addEventListener('click',function(){setTimeout(function(){resetInvalidSelections();renderDisabledOptions()},0)},false);
    resetInvalidSelections();renderDisabledOptions();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();

  var b=document.querySelector('.badge');if(b)b.textContent='Browser v3.20';
  var m=document.querySelector('.meta span:last-child');if(m)m.textContent='Prompt Studio Browser v3.20';
})();