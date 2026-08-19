(function(){
  var PAGE=(new URLSearchParams(location.search).get('page')||'').toLowerCase();
  var MODES={
    car:{title:'إعدادات السيارة — Range Rover 2022',icon:'🚙',desc:'السيلفي داخل أو بجانب الرنج روفر، مع تثبيت السيارة واتجاه المقود وقواعد السيارة الواقعية.'},
    bedroom:{title:'إعدادات غرفة النوم',icon:'🛏️',desc:'الغرفة المرجعية الثابتة، إنارتها الخاصة، الفوضى الواقعية، والسيلفي داخل نفس الغرفة.'},
    places:{title:'إعدادات أماكن أخرى',icon:'📍',desc:'الشوارع والمقاهي والمكاتب والفلل والمواقف وبقية المواقع بدون فرض غرفة النوم أو السيارة.'}
  };

  function qs(s){return document.querySelector(s)}
  function qsa(s){return [].slice.call(document.querySelectorAll(s))}
  function closestFieldByKey(key){var p=qs('.picker[data-key="'+key+'"]');return p&&p.closest('.field')}
  function hide(el){if(el)el.style.display='none'}
  function show(el){if(el)el.style.display=''}
  function hideToggle(id){var b=qs('#'+id);if(b)hide(b.closest('.toggle'))}
  function showToggle(id){var b=qs('#'+id);if(b)show(b.closest('.toggle'))}

  function landing(){
    document.title='Prompt Studio — الرئيسية';
    var app=qs('.app');if(!app)return;
    app.innerHTML=''+
      '<header class="top"><div class="logo">PS</div><div class="brand"><h1>Prompt Studio</h1><p>اختر نوع المشهد أولًا حتى تظهر لك إعداداته فقط</p></div><div class="badge">Browser v3.21</div></header>'+
      '<section class="card" style="max-width:860px;margin:18px auto 0"><div class="head"><h2>اختر صفحة الإعدادات</h2><small>كل صفحة مستقلة عن الأخرى</small></div><div class="body">'+
      '<div id="sceneHomeCards" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px">'+
      card('car')+card('bedroom')+card('places')+
      '</div><div class="notice" style="margin-top:16px">الإعدادات المشتركة مثل الهوية والكاميرا والسيلفي تبقى محفوظة. إعدادات السيارة والغرفة لا تُفرض خارج صفحتها.</div></div></section>';
    var style=document.createElement('style');style.textContent='@media(max-width:760px){#sceneHomeCards{grid-template-columns:1fr!important}}.sceneHomeCard{display:block;text-decoration:none;color:inherit;border:1px solid var(--line);border-radius:18px;background:#0b1015;padding:20px;min-height:180px;transition:.15s}.sceneHomeCard:hover{border-color:#5b6778;transform:translateY(-1px)}.sceneHomeIcon{font-size:36px}.sceneHomeTitle{font-size:18px;font-weight:950;margin:13px 0 7px}.sceneHomeDesc{color:var(--muted);font-size:13px;line-height:1.7}';document.head.appendChild(style);
  }
  function card(key){var m=MODES[key];return '<a class="sceneHomeCard" href="?page='+key+'"><div class="sceneHomeIcon">'+m.icon+'</div><div class="sceneHomeTitle">'+m.title+'</div><div class="sceneHomeDesc">'+m.desc+'</div></a>'}

  function addPageHeader(mode){
    var m=MODES[mode];
    document.title='Prompt Studio — '+m.title;
    var top=qs('.top');if(!top)return;
    var brand=top.querySelector('.brand');if(brand){var h=brand.querySelector('h1');var p=brand.querySelector('p');if(h)h.textContent=m.title;if(p)p.textContent=m.desc}
    var badge=top.querySelector('.badge');if(badge)badge.textContent='v3.21';
    if(!qs('#sceneHomeBtn')){var a=document.createElement('a');a.id='sceneHomeBtn';a.href=location.pathname;a.textContent='الرئيسية';a.style='text-decoration:none;color:#fff;border:1px solid var(--line);background:#171d25;border-radius:12px;padding:9px 11px;font-size:12px;font-weight:900;margin-inline-start:6px';top.appendChild(a)}
    var head=qs('section.card .head h2');if(head)head.textContent=m.title;
  }

  function setContext(mode){
    try{
      if(typeof state!=='object'||!state)return;
      if(mode==='car'){
        state.vehicleLock=true;
        if(typeof state.roomLock==='boolean')state.roomLock=false;
      }else if(mode==='bedroom'){
        state.vehicleLock=false;
        state.roomLock=true;
        if(!String(state.location||'').trim()||/غرفة النوم|غرفه النوم|bedroom/i.test(String(state.location||'')))state.location='غرفة النوم';
      }else if(mode==='places'){
        state.vehicleLock=false;
        if(typeof state.roomLock==='boolean')state.roomLock=false;
      }
      if(typeof save==='function')save();
      if(typeof syncUI==='function')syncUI();
      if(typeof renderPickers==='function')renderPickers();
    }catch(e){}
  }

  function pageSpecificVisibility(mode){
    if(mode==='car'){
      hideToggle('roomLock');
      showToggle('vehicleLock');
      hide(closestFieldByKey('bedroomLighting'));
      hide(closestFieldByKey('bedroomClutter'));
    }
    if(mode==='bedroom'){
      hideToggle('vehicleLock');
      showToggle('roomLock');
      ['lighting','realisticLighting','background','condition'].forEach(function(k){hide(closestFieldByKey(k))});
      var loc=qs('#location');if(loc)hide(loc.closest('.field'));
    }
    if(mode==='places'){
      hideToggle('vehicleLock');
      hideToggle('roomLock');
      hide(closestFieldByKey('bedroomLighting'));
      hide(closestFieldByKey('bedroomClutter'));
    }
    cleanupSections();
  }

  function cleanupSections(){
    qsa('.grid').forEach(function(g){
      var visible=qsa.call?[]:[];
      var has=[].slice.call(g.children).some(function(c){return c.style.display!=='none'});
      if(!has){hide(g);var prev=g.previousElementSibling;if(prev&&prev.classList.contains('section'))hide(prev)}
    });
  }

  function addContextNotice(mode){
    var body=qs('section.card .body');if(!body||qs('#sceneModeNotice'))return;
    var m=MODES[mode];var n=document.createElement('div');n.id='sceneModeNotice';n.className='notice';
    n.textContent=mode==='car'?'هذه صفحة السيارة. تثبيت Range Rover 2022 مفعل لهذه الصفحة فقط، وإعدادات غرفة النوم لا تتدخل هنا.':mode==='bedroom'?'هذه صفحة غرفة النوم. الغرفة المرجعية مثبتة، وإعدادات إنارة وفوضى غرفة النوم هي صاحبة الأولوية، وإعدادات السيارة غير فعالة هنا.':'هذه صفحة الأماكن الأخرى. لا يتم فرض الرنج روفر أو غرفة النوم إلا إذا ذكرت ذلك صراحة في الوصف.';
    var platform=body.querySelector('.platform');if(platform)platform.insertAdjacentElement('afterend',n);else body.prepend(n);
  }

  var previousFinal=window.buildFinal;
  window.buildFinal=function(){
    var base=previousFinal?previousFinal():'';
    if(!MODES[PAGE])return base;
    var ctx=PAGE==='car'?'PAGE CONTEXT — RANGE ROVER SCENE. This page is dedicated to the fixed white 2022 Range Rover Sport context. Do not apply bedroom-specific scene assumptions.':PAGE==='bedroom'?'PAGE CONTEXT — CANONICAL BEDROOM SCENE. This page is dedicated to the fixed bedroom reference. Do not introduce Range Rover-specific scene assumptions unless the user explicitly asks for a vehicle.':'PAGE CONTEXT — GENERAL LOCATION SCENE. Do not force the canonical bedroom or fixed Range Rover unless the user explicitly requests them.';
    return ctx+'\n\n'+base;
  };

  function init(){
    if(!MODES[PAGE]){landing();return}
    setContext(PAGE);
    addPageHeader(PAGE);
    addContextNotice(PAGE);
    setTimeout(function(){pageSpecificVisibility(PAGE)},80);
    setTimeout(function(){pageSpecificVisibility(PAGE)},500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();