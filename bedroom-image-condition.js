(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var CANDID='bedroom_condition_candid';
  var CLEAN='bedroom_condition_clean';
  var MOTION='bedroom_condition_motion';
  var NOISE='bedroom_condition_noise';
  var JPEG='bedroom_condition_jpeg';
  var FOCUS='bedroom_condition_focus';
  var EXPOSURE='bedroom_condition_exposure';
  var MIXED='bedroom_condition_mixed';
  var AUTO='bedroom_condition_auto';

  var OPTIONS_LIST=[
    [CANDID,'عفوية واقعية — موصى به'],
    [CLEAN,'نظيفة طبيعية'],
    [MOTION,'اهتزاز بسيط'],
    [NOISE,'ضوضاء حساس خفيفة'],
    [JPEG,'ضغط JPEG خفيف'],
    [FOCUS,'تركيز غير مثالي خفيف'],
    [EXPOSURE,'تعريض غير مثالي بسيط'],
    [MIXED,'شوائب هاتف خفيفة مختلطة'],
    [AUTO,'تلقائي حسب الإضاءة والمشهد']
  ];

  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;
  var previousRender=window.renderPickers;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function q(s){return document.querySelector(s)}
  function gemini(){return String(S().platform||'').toLowerCase()==='gemini'}
  function allowed(v){return OPTIONS_LIST.some(function(x){return x[0]===v})}
  function ensureState(){
    var s=S();
    if(!allowed(String(s.bedroomImageCondition||'')))s.bedroomImageCondition=CANDID;
  }
  function extendOptions(){
    if(typeof OPTIONS!=='object'||!OPTIONS)return;
    OPTIONS.bedroomImageCondition=OPTIONS_LIST.slice();
  }
  function ensureField(){
    if(q('#bedroomImageConditionField'))return;
    var grid=q('#bedroomSettingsGrid');
    if(!grid)return;
    var clutter=q('.picker[data-key="bedroomClutter"]');
    var clutterField=clutter&&clutter.closest('.field');
    var f=document.createElement('div');
    f.className='field';
    f.id='bedroomImageConditionField';
    f.innerHTML='<label>حالة الصورة</label><div class="picker" data-key="bedroomImageCondition"></div><small class="historyHint" style="display:block;margin-top:6px;line-height:1.6">يتحكم بطابع الالتقاط فقط. لا يغيّر الهوية أو الإضاءة أو زاوية السيلفي أو الغرفة. التأثير يبقى خفيفًا ومناسبًا لظروف التصوير.</small>';
    if(clutterField&&clutterField.parentNode===grid)clutterField.insertAdjacentElement('afterend',f);else grid.appendChild(f);
  }

  function selectedRule(){
    var v=String(S().bedroomImageCondition||CANDID);
    if(v===CLEAN)return 'BEDROOM IMAGE CONDITION — CLEAN NATURAL SMARTPHONE CAPTURE. Keep the photo naturally clean without deliberate degradation: no forced motion blur, no obvious JPEG artifacts, no added heavy grain, and no artificial focus error. Still preserve ordinary front-camera character such as restrained sharpening, realistic dynamic range, natural texture, and only physically unavoidable low-level sensor noise where lighting requires it. Clean does NOT mean beauty-retouched, plastic, over-sharpened, or studio-perfect.';
    if(v===MOTION)return 'BEDROOM IMAGE CONDITION — SLIGHT HANDHELD MOTION. Add only a tiny physically plausible amount of handheld motion softness, concentrated near frame edges, loose hair tips, clothing edges, or secondary background detail. Keep the face and especially the eyes readable and mostly sharp. Do not create whole-frame blur, double images, smeared facial features, or strong camera shake.';
    if(v===NOISE)return 'BEDROOM IMAGE CONDITION — MILD SENSOR NOISE. Preserve fine smartphone sensor noise primarily in darker midtones and shadows. Scale the noise to the selected lighting: in daylight it must be extremely subtle and mostly confined to darker areas; in dim or nighttime scenes it may become mildly more visible while never burying facial texture. Avoid coarse film grain, colored speckling across the entire face, or uniform artificial noise overlays.';
    if(v===JPEG)return 'BEDROOM IMAGE CONDITION — MILD JPEG COMPRESSION. Simulate only restrained real-world phone JPEG compression: tiny high-frequency softness, faint ringing or block structure only where naturally expected in difficult edges or darker detail. Do not create obvious large blocks, mosaic artifacts, destroyed skin texture, unreadable eyes, or visibly damaged facial features.';
    if(v===FOCUS)return 'BEDROOM IMAGE CONDITION — SLIGHTLY IMPERFECT FOCUS. Allow a very small realistic front-camera focus miss or mild edge softness while keeping the eyes and central face acceptably sharp. The imperfection should feel like an ordinary quick selfie, not a failed photograph. Never blur the entire face, remove eye detail, or use synthetic depth-of-field blur as a substitute for focus imperfection.';
    if(v===EXPOSURE)return 'BEDROOM IMAGE CONDITION — SLIGHT AUTO-EXPOSURE IMPERFECTION. Allow modest smartphone auto-exposure imperfection such as one side being slightly darker, a small highlight approaching clipping, or limited shadow detail, while keeping facial identity and important features readable. Do not overexpose the whole face, crush all shadows, flatten the lighting, or override the selected bedroom-lighting direction.';
    if(v===MIXED)return 'BEDROOM IMAGE CONDITION — SUBTLE MIXED PHONE IMPERFECTIONS. Combine only very small amounts of ordinary smartphone capture imperfection: restrained edge softness, faint shadow noise, tiny exposure variation, and minimal handheld micro-motion. Each effect must stay below the level where it becomes an obvious filter or defect. Do not stack strong blur, strong grain, strong JPEG artifacts, and exposure errors together.';
    if(v===AUTO)return 'BEDROOM IMAGE CONDITION — AUTOMATIC PHYSICAL MATCH. Derive only subtle capture imperfections from the selected lighting, selfie geometry, and smartphone exposure conditions. Bright scenes should remain relatively clean; darker scenes may show more shadow noise and limited detail; handheld geometry may create tiny edge softness. Never invent a strong defect merely for style.';
    return 'BEDROOM IMAGE CONDITION — CANDID EVERYDAY SMARTPHONE CAPTURE. Make the capture feel casually handheld and ordinary rather than polished: preserve mild natural exposure variation, slight edge softness, restrained smartphone sharpening, tiny physically plausible micro-motion in secondary details, and sensor texture appropriate to the lighting. Keep the face and eyes clear. Do not make the image deliberately dirty, blurry, noisy, compressed, or defective.';
  }

  function authorityRule(){
    return 'BEDROOM IMAGE CONDITION AUTHORITY — HARD CONSTRAINT. The dedicated Bedroom Image Condition control governs only capture-condition artifacts and must not alter identity, facial structure, hairstyle, body proportions, clothing, selected pose, selected selfie angle, camera-arm visibility, framing selection, bedroom geometry, clutter amount, or the selected lighting source. If a requested artifact would conflict with physical lighting or facial readability, preserve the selected condition but reduce its strength to the nearest physically plausible level rather than changing another explicit control.';
  }

  function geminiRule(){
    if(!gemini())return '';
    return 'GEMINI BEDROOM IMAGE CONDITION COMPLIANCE — REQUIRED. Treat the selected Bedroom Image Condition as an explicit user selection. Do not replace it with a cleaner, blurrier, noisier, sharper, more compressed, more cinematic, or more polished capture style. Apply exactly the selected condition at the physically plausible strength defined above, while preserving all higher-priority identity, pose, angle, lighting, arm-visibility, room, and body constraints.';
  }

  function negatives(){
    var v=String(S().bedroomImageCondition||CANDID);
    var x=['image-condition control ignored','capture defect overriding identity','capture artifact changing facial structure','image-condition effect overriding selected lighting','studio-polished smartphone selfie','beauty-retouched capture disguised as clean image'];
    if(v===CLEAN)x=x.concat(['forced motion blur','forced JPEG degradation','forced heavy sensor noise','deliberate focus miss']);
    if(v===MOTION)x=x.concat(['blurred eyes','blurred face','strong camera shake','double-image motion blur','whole-frame smear']);
    if(v===NOISE)x=x.concat(['heavy full-frame grain','coarse film grain','strong chroma speckles on face','uniform noise overlay','daylight image with excessive sensor noise']);
    if(v===JPEG)x=x.concat(['large JPEG blocks','mosaic face artifacts','compression destroying eyes','compression destroying skin texture']);
    if(v===FOCUS)x=x.concat(['fully blurred face','unreadable eyes','extreme defocus','fake portrait bokeh used as focus error']);
    if(v===EXPOSURE)x=x.concat(['fully blown face','all shadows crushed','flat exposure overriding directional light','extreme exposure error']);
    if(v===MIXED)x=x.concat(['stacked heavy artifacts','strong blur plus strong grain','obvious degradation filter']);
    return x;
  }

  if(typeof previousRender==='function'){
    window.renderPickers=function(){
      ensureState();extendOptions();ensureField();
      return previousRender.apply(this,arguments);
    };
  }

  window.buildFinal=function(){
    ensureState();
    var base=previousFinal?previousFinal():'';
    var blocks=[authorityRule(),selectedRule()];
    var g=geminiRule();if(g)blocks.push(g);
    return blocks.join('\n\n')+'\n\n'+base;
  };

  window.buildNegative=function(){
    ensureState();
    var base=previousNegative?previousNegative():'';
    var x=negatives();
    return (base?base+', ':'')+x.join(', ');
  };

  function boot(){
    ensureState();extendOptions();ensureField();
    if(typeof window.renderPickers==='function')window.renderPickers();
    setTimeout(function(){ensureField();if(typeof window.renderPickers==='function')window.renderPickers()},180);
    setTimeout(function(){ensureField()},600);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();