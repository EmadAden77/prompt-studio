(function(){
  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;
  var KEY='promptStudioGhalyoonMode';
  var AUTO='auto', BASIC='basic', DETAIL='detail';

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function page(){return (location.hash||'').replace(/^#/,'').toLowerCase()}
  function val(x){return String(x==null?'':x).trim()}
  function mode(){
    try{var m=localStorage.getItem(KEY);if(m===BASIC||m===DETAIL||m===AUTO)return m}catch(e){}
    return AUTO;
  }
  function setMode(m){
    if(m!==BASIC&&m!==DETAIL)m=AUTO;
    try{localStorage.setItem(KEY,m)}catch(e){}
    syncUI();
    try{if(typeof autoRefresh==='function')autoRefresh()}catch(e){}
  }
  function platform(){
    var s=S(),p=val(s.platform).toLowerCase();
    if(p==='gemini'||p==='chatgpt')return p;
    var g=document.getElementById('geminiBtn');
    return g&&g.classList.contains('active')?'gemini':'chatgpt';
  }
  function explicitCount(){
    var s=S(),keys=['idea','location','time','clothing','camera','angle','pose','expression','gaze','distance','frame','lighting','background','condition','bedroomLighting','bedroomClutter','bedroomBedCondition','bedroomImageCondition','bedroomColorTone','bedroomSelfieCrop','bedroomHandPose'];
    var n=0;keys.forEach(function(k){var x=val(s[k]);if(x&&x!=='auto'&&x!=='__auto_prompt__')n++});return n;
  }
  function missingCore(){
    var s=S(),p=page();
    if(p==='bedroom'||p==='car'||p==='places')return false;
    return !val(s.idea);
  }
  function complexRequest(){
    var s=S(),p=page(),idea=val(s.idea);
    if(p==='bedroom'||p==='car'||p==='places')return true;
    if(idea.length>140||explicitCount()>=7)return true;
    return /multi|multiple|technical|workflow|step|complex|تفصي|متعدد|تقني|خطوات|معقد/.test(idea.toLowerCase());
  }
  function resolvedMode(){
    var m=mode();
    if(m===BASIC||m===DETAIL)return m;
    return (missingCore()||complexRequest())?DETAIL:BASIC;
  }
  function modeLabel(m){return m===DETAIL?'DETAIL':'BASIC'}

  function optimizerRule(){
    var s=S(),m=resolvedMode(),p=platform();
    var head='GHALYOON PROMPT OPTIMIZATION ENGINE — '+modeLabel(m)+' MODE — HIGH PRIORITY. Act as a strategic prompt-optimization layer, not a paraphraser. Preserve the user’s real intent, explicit selections, reference-image scopes, and all higher-priority identity/room/physical constraints. Improve structure, clarity, execution order, and model fit without changing the requested result.';
    var common='INTENT AND AMBIGUITY DISCIPLINE. Do not assume facts, objects, people, styling, scene changes, camera systems, lighting sources, identity details, or permanent attributes that are not supplied by the user or by an explicit application rule. Diagnose ambiguity before execution. When a value is genuinely unspecified and no application rule derives it, keep it neutral or unspecified instead of inventing a decorative answer. Remove redundancy and reconcile duplicated instructions by priority rather than combining contradictions.';
    var direct='DIRECT-USABILITY RULE. The generated prompt must remain ready to use immediately. Do not add theory, meta-explanations, apologies, brainstorming, or commentary inside the executable image prompt. Optimize the intent and constraint hierarchy, not merely the wording.';
    var modeRule=m===BASIC
      ?'BASIC MODE. The request is sufficiently clear. Apply fast, restrained optimization: clarify the objective, keep only useful context and constraints, eliminate repetition, and avoid adding complexity or asking follow-up questions.'
      :'DETAIL MODE. Treat the request as complex, technical, multi-constraint, or incomplete. Internally audit the target result, model, references, constraints, dependencies, spatial relationships, camera/lighting logic, and conflict hierarchy before execution. The original Ghalyoon workflow allows up to three high-value clarifying questions in an interactive conversation; Prompt Studio is a direct generator, so unresolved optional details must remain unspecified rather than being guessed. Do not expose private reasoning or chain-of-thought.';
    var modelRule=p==='gemini'
      ?'GEMINI OPTIMIZATION. Use coherent natural-language scene construction and multimodal consistency. Treat uploaded reference images only according to their declared scope, preserve spatial relationships, and balance descriptive clarity with strict user-selected constraints. Avoid disconnected keyword stuffing.'
      :'CHATGPT OPTIMIZATION. Use structured instructions and context layering. Read the prompt in this hierarchy: explicit user controls and final resolved values first; identity/reference scope and scene context second; physical/camera/material execution rules third; negative constraints as failure prevention. Never let a lower layer override a higher one.';
    var quality='QUALITY GATE. Before execution, verify silently that the objective is clear, all explicit user selections remain present, no unsupported assumption was introduced, no duplicated category contains conflicting alternatives, the model-specific structure is coherent, and the final prompt contains only instructions useful to the requested image. If a conflict exists, preserve the explicit user choice and revise only the lower-priority or unspecified detail.';
    return [head,common,direct,modeRule,modelRule,quality].join('\n\n');
  }

  function installUI(){
    if(document.getElementById('ghalyoonPanel')){syncUI();return}
    var platformBox=document.querySelector('.platform');
    if(!platformBox||!platformBox.parentNode)return;
    var box=document.createElement('div');
    box.id='ghalyoonPanel';
    box.style.marginTop='10px';
    box.innerHTML='<div style="font-size:12px;font-weight:900;margin:0 2px 7px">غَليون — وضع تحسين الأمر</div>'+
      '<div id="ghalyoonModeControl" class="platform" style="grid-template-columns:repeat(3,1fr)">'+
      '<button type="button" data-ghalyoon="auto">تلقائي</button><button type="button" data-ghalyoon="basic">BASIC</button><button type="button" data-ghalyoon="detail">DETAIL</button></div>'+
      '<small id="ghalyoonModeStatus" style="display:block;color:var(--muted);line-height:1.65;margin:7px 2px 0">غَليون يختار مستوى التحسين المناسب تلقائيًا.</small>'+
      '<small style="display:block;color:var(--muted);line-height:1.65;margin:5px 2px 0">مرحباً، أنا غَليون — مهندس تحسين الأوامر. أرسل فكرتك أو البرومبت الخام وحدد النموذج المستهدف وBASIC أو DETAIL وسأحوّله إلى Prompt احترافي جاهز للاستخدام.</small>';
    platformBox.insertAdjacentElement('afterend',box);
    box.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('[data-ghalyoon]'):null;if(b)setMode(b.getAttribute('data-ghalyoon'))});
    syncUI();
  }
  function syncUI(){
    var box=document.getElementById('ghalyoonModeControl');if(!box)return;
    var selected=mode(),resolved=resolvedMode();
    Array.prototype.forEach.call(box.querySelectorAll('[data-ghalyoon]'),function(b){b.classList.toggle('active',b.getAttribute('data-ghalyoon')===selected)});
    var n=document.getElementById('ghalyoonModeStatus');
    if(n)n.textContent=selected===AUTO?'الوضع التلقائي اختار '+modeLabel(resolved)+' حسب اكتمال وتعقيد المدخلات. لا يغيّر اختيارات المستخدم.':'الوضع المثبت: '+modeLabel(resolved)+'. لا يغيّر اختيارات المستخدم.';
  }

  window.buildFinal=function(){
    var base=oldFinal?oldFinal():'';
    return optimizerRule()+'\n\n'+base;
  };
  window.buildNegative=function(){
    return oldNegative?oldNegative():'';
  };

  function boot(){installUI();syncUI();setTimeout(installUI,220);setTimeout(installUI,700)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
