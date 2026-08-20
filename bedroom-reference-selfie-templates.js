(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var PRESETS=[
    {
      id:'reference_center_high',
      label:'مثل المرجع',
      desc:'واقف بمنتصف الغرفة، زاوية مرتفعة خفيفة، كادر قريب عفوي',
      pose:'bedroom_standing_center',
      angle:'bedroom_angle_high',
      crop:'bedroom_crop_tight_candid',
      location:'in the central clear walking area of the exact reference bedroom, with the bed naturally on the left side and the wardrobe/dressing system naturally on the right side'
    },
    {
      id:'bedside_34',
      label:'قرب السرير',
      desc:'واقف بجانب السرير، مستوى النظر 3/4، من الكتفين للأعلى',
      pose:'bedroom_standing_beside',
      angle:'bedroom_angle_eye_34',
      crop:'bedroom_crop_shoulders_up',
      location:'beside the left-side bed in the exact reference bedroom, keeping the original bed, headboard, bedside area, room depth and furniture positions unchanged'
    },
    {
      id:'footbed_high34',
      label:'نهاية السرير',
      desc:'واقف عند نهاية السرير، مرتفعة 3/4، كادر قريب عفوي',
      pose:'bedroom_standing_foot_bed',
      angle:'bedroom_angle_high_34',
      crop:'bedroom_crop_tight_candid',
      location:'at the accessible foot/end of the exact reference bed, preserving the original rug, floor clearances, wardrobe position and bedroom depth'
    },
    {
      id:'wardrobe_offset',
      label:'قرب الخزانة',
      desc:'واقف قرب الخزانة، مستوى العين خارج المركز، من الكتفين للأعلى',
      pose:'bedroom_standing_wardrobe',
      angle:'bedroom_angle_eye_offset',
      crop:'bedroom_crop_shoulders_up',
      location:'near the existing right-side wardrobe and dressing system in the exact reference bedroom with believable clearance from the real doors, drawers, shelves and hanging clothes'
    },
    {
      id:'curtain_high',
      label:'قرب الستارة',
      desc:'واقف قرب الستارة، زاوية مرتفعة خفيفة، كادر قريب عفوي',
      pose:'bedroom_standing_curtain',
      angle:'bedroom_angle_high',
      crop:'bedroom_crop_tight_candid',
      location:'near the exact far-wall dark curtain and existing window position of the reference bedroom without moving the curtain, window, wardrobe or other room elements'
    },
    {
      id:'dresser_34',
      label:'أمام التسريحة',
      desc:'واقف أمام التسريحة، مستوى النظر 3/4، من الكتفين للأعلى',
      pose:'bedroom_standing_dresser',
      angle:'bedroom_angle_eye_34',
      crop:'bedroom_crop_shoulders_up',
      location:'in front of the existing right-side dresser in the exact reference bedroom with its real position, scale, surface objects and surrounding clearances preserved'
    },
    {
      id:'doorway_offset',
      label:'عند الباب',
      desc:'واقف عند إطار الباب، مستوى العين خارج المركز، من الكتفين للأعلى',
      pose:'bedroom_standing_doorframe',
      angle:'bedroom_angle_eye_offset',
      crop:'bedroom_crop_shoulders_up',
      location:'at the existing near-left bedroom doorway and real door frame of the exact reference room, without inventing or moving any opening'
    },
    {
      id:'wall_front',
      label:'على الجدار',
      desc:'واقف ساند ظهره على الجدار، أمامية بمستوى النظر، من الكتفين للأعلى',
      pose:'bedroom_standing_wall_back',
      angle:'bedroom_angle_eye_front',
      crop:'bedroom_crop_shoulders_up',
      location:'against an existing clear wall area in the exact reference bedroom while preserving all permanent furniture, room geometry and circulation space'
    }
  ];

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function saveNow(){try{if(typeof save==='function')save()}catch(e){}}
  function refreshNow(){try{if(typeof autoRefresh==='function')autoRefresh()}catch(e){}}
  function val(x){return String(x==null?'':x)}

  function currentHand(){
    var s=S();
    return val(s.bedroomHandPose||s.freeHandPose||'__auto_prompt__').toLowerCase();
  }

  function standingHandCompatible(){
    var t=currentHand();
    if(!t||t==='__auto_prompt__'||/^auto\b/.test(t)||/تلقائي/.test(t))return true;
    if(/thigh|knee|فخذ|ركبة|ركبه|bed beside|resting.*bed|على السرير|bed headboard|bed frame|pillow|blanket|وسادة|وساده|بطاني|partially open book|folded magazine/.test(t))return false;
    return true;
  }

  function snapshot(){
    var s=S(),o={};
    Object.keys(s).forEach(function(k){
      if(k!=='pose'&&k!=='angle'&&k!=='bedroomSelfieCrop'&&k!=='bedroomShotLocation'&&k!=='bedroomReferenceTemplate')o[k]=s[k];
    });
    return o;
  }

  function restore(o){
    var s=S();
    Object.keys(o).forEach(function(k){s[k]=o[k]});
  }

  function setPreset(p){
    var s=S();
    s.pose=p.pose;
    s.angle=p.angle;
    s.bedroomSelfieCrop=p.crop;
    s.bedroomShotLocation=p.location;
    s.bedroomReferenceTemplate=p.id;
  }

  function applyPreset(p){
    if(!standingHandCompatible()){
      status('القالب لم يُطبق لأن وضعية اليد الحالية مخصصة لوضعية جلوس/سرير. غيّر وضعية اليد أو اجعلها تلقائيًا، ولن أغيّرها من وراءك.');
      return;
    }

    var fixed=snapshot();
    setPreset(p);
    saveNow();
    try{if(typeof window.renderPickers==='function')window.renderPickers()}catch(e){}

    restore(fixed);
    setPreset(p);
    saveNow();
    try{if(typeof window.renderPickers==='function')window.renderPickers()}catch(e){}

    restore(fixed);
    setPreset(p);
    saveNow();
    refreshNow();
    syncActive();
    status('تم تطبيق قالب «'+p.label+'». تغيّرت فقط الوضعية + الزاوية + المكان + كادر السيلفي، وباقي اختياراتك ثابتة.');
  }

  function status(msg){
    var n=document.getElementById('bedroomReferenceTemplateStatus');
    if(n)n.textContent=msg;
  }

  function syncActive(){
    var id=val(S().bedroomReferenceTemplate);
    var box=document.getElementById('bedroomReferenceTemplateButtons');
    if(!box)return;
    Array.prototype.forEach.call(box.querySelectorAll('[data-template]'),function(b){
      var on=b.getAttribute('data-template')===id;
      b.style.borderColor=on?'#6b7685':'var(--line)';
      b.style.background=on?'#242b34':'#121820';
    });
  }

  function install(){
    var grid=document.getElementById('bedroomEssentialGrid');
    if(!grid)return;
    var wrap=document.getElementById('bedroomReferenceTemplates');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.id='bedroomReferenceTemplates';
      wrap.className='field full';
      var html='<label style="margin-bottom:8px">قوالب جاهزة من الصورة المرجعية</label>'+
        '<small style="display:block;color:var(--muted);line-height:1.65;margin-bottom:9px">قوالب واقفة مبنية على نفس الغرفة المرجعية. تغيّر اللقطة فقط، ولا تغيّر الملابس أو التعبير أو الإضاءة أو اليد الأخرى أو الفوضى أو حالة السرير.</small>'+
        '<div id="bedroomReferenceTemplateButtons" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px"></div>'+
        '<small id="bedroomReferenceTemplateStatus" class="historyHint" style="display:block;margin-top:8px;line-height:1.6">اختر قالبًا جاهزًا، أو استخدم زر «غيّر اللقطة» للعشوائية الآمنة.</small>';
      wrap.innerHTML=html;
      var shuffle=document.getElementById('bedroomShotShuffleField');
      if(shuffle&&shuffle.parentNode===grid)shuffle.insertAdjacentElement('afterend',wrap);else grid.appendChild(wrap);

      var box=wrap.querySelector('#bedroomReferenceTemplateButtons');
      PRESETS.forEach(function(p){
        var b=document.createElement('button');
        b.type='button';
        b.className='btn ghost';
        b.setAttribute('data-template',p.id);
        b.style.textAlign='right';
        b.style.padding='11px 12px';
        b.innerHTML='<strong style="display:block;font-size:13px">'+p.label+'</strong><span style="display:block;font-size:10px;color:var(--muted);margin-top:4px;line-height:1.45">'+p.desc+'</span>';
        b.addEventListener('click',function(){applyPreset(p)});
        box.appendChild(b);
      });
    }
    wrap.style.display='';
    syncActive();
  }

  function boot(){install();setTimeout(install,220);setTimeout(install,700)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
