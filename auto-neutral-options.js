(function(){
  var oldBuildFinal=window.buildFinal;
  var oldBuildNegative=window.buildNegative;
  var AUTO='__auto_prompt__';
  var AUTO_LABEL='تلقائي / حسب الـPrompt (بدون فرض)';
  var TARGETS=['angle','pose','expression','gaze','distance','frame','lighting','realisticLighting','background','condition'];

  function addAutoOptions(){
    try{
      if(typeof OPTIONS!=='object'||!OPTIONS)return;
      TARGETS.forEach(function(key){
        if(!Array.isArray(OPTIONS[key]))return;
        if(!OPTIONS[key].some(function(x){return x&&x[0]===AUTO;})) OPTIONS[key].unshift([AUTO,AUTO_LABEL]);
      });
      if(typeof renderPickers==='function')renderPickers();
    }catch(e){}
  }

  function raw(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function roomScene(v){
    var t=((v.idea||'')+' '+(v.location||'')+' '+(v.background||'')).toLowerCase();
    return !!v.roomLock||/غرفة النوم|غرفه النوم|داخل غرفة النوم|داخل غرفه النوم|bedroom|my bedroom|the bedroom/.test(t);
  }
  function bedroomLightingSpecific(v){return !!v.bedroomLighting&&v.bedroomLighting!=='auto bedroom prompt';}
  function darkBedroomLighting(v){return /darkness|very dark|extremely dim|bedside lamp only|phone screen light only|streetlight spill|all lights off/.test(String(v.bedroomLighting||''));}
  function neutral(v,key){
    if(String(v[key]||'')===AUTO)return true;
    if(roomScene(v)&&['lighting','realisticLighting','background','condition'].indexOf(key)!==-1){
      if(key==='lighting'||key==='realisticLighting') return bedroomLightingSpecific(v);
      return true;
    }
    return false;
  }

  function stripLines(text,v){
    var lines=String(text||'').split('\n');
    var tests=[];
    if(neutral(v,'angle'))tests.push(/^SELFIE ANGLE\s*(?:—|:)/i);
    if(neutral(v,'pose'))tests.push(/^POSE \/ FRAMING\s*(?:—|:)/i);
    if(neutral(v,'expression'))tests.push(/^FACIAL EXPRESSION\s*(?:—|:)/i);
    if(neutral(v,'gaze'))tests.push(/^GAZE(?: DIRECTION)?\s*(?:—|:)/i);
    if(neutral(v,'distance'))tests.push(/^SELFIE DISTANCE\s*(?:—|:)/i);
    if(neutral(v,'frame'))tests.push(/^SUBJECT POSITION IN FRAME\s*(?:—|:)/i);
    if(neutral(v,'lighting'))tests.push(/^LIGHTING\s*(?:—|:)/i);
    if(neutral(v,'realisticLighting'))tests.push(/^REALISTIC PRACTICAL LIGHTING\s*(?:—|:)/i);
    if(neutral(v,'background'))tests.push(/^BACKGROUND\s*(?:—|:)/i,/^BACKGROUND DETAIL REALISM\s*(?:—|:)/i);
    if(neutral(v,'condition'))tests.push(/^IMAGE CONDITION\s*(?:—|:)/i);
    if(roomScene(v)&&bedroomLightingSpecific(v)&&!darkBedroomLighting(v))tests.push(/^LOW-LIGHT CAMERA REALISM\s*(?:—|:)/i,/^DARKNESS AND LOW-EXPOSURE REALISM\s*(?:—|:)/i);
    return lines.filter(function(line){
      var s=line.trim();
      if(!s)return true;
      return !tests.some(function(re){return re.test(s);});
    }).join('\n').replace(/\n{3,}/g,'\n\n').trim();
  }

  function stripNegative(text,v){
    var items=String(text||'').split(',').map(function(x){return x.trim();}).filter(Boolean);
    var remove=[];
    if(neutral(v,'lighting')||neutral(v,'realisticLighting')) remove=remove.concat(['wrong lighting','ignored lighting instruction']);
    if(neutral(v,'background')) remove=remove.concat(['empty background','overly simple background','generic filler background','background lacking real detail','sterile showroom background','excessive background blur hiding all detail','random nonsense background objects','repeating background textures','flat lifeless environment','fake CGI-like background']);
    if(neutral(v,'condition')) remove.push('wrong image condition');
    return items.filter(function(x){return remove.indexOf(x)===-1;}).join(', ');
  }

  window.buildFinal=function(){
    var base=oldBuildFinal?oldBuildFinal():'';
    var v=raw();
    base=stripLines(base,v);
    var active=TARGETS.filter(function(k){return String(v[k]||'')===AUTO;});
    var rule='NEUTRAL CONTROL RULE — IMPORTANT. Any control set to “Auto / follow prompt / no forcing” imposes no visual requirement. Resolve that property only from the explicit user prompt and scene context. Do not treat a neutral control as a mandatory default.';
    if(roomScene(v)) rule+=' In bedroom scenes, the canonical bedroom identity and dedicated bedroom controls take priority over generic lighting, realistic-lighting, background, and image-condition controls so those generic controls cannot redesign or visually fight the bedroom reference.';
    return rule+'\n\n'+base;
  };

  window.buildNegative=function(){var v=raw();return stripNegative(oldBuildNegative?oldBuildNegative():'',v);};

  function markVersion(){var b=document.querySelector('.badge');if(b)b.textContent='Browser v3.17';var m=document.querySelector('.meta span:last-child');if(m)m.textContent='Prompt Studio Browser v3.17';}
  function ready(){addAutoOptions();markVersion();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();