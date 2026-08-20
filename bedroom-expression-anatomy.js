(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var DEF='bedroom_expression_neutral';
  var OPT=[
    [DEF,'محايد مرتاح'],
    ['bedroom_expression_faint_smile','ابتسامة خفيفة جدًا بفم مغلق'],
    ['bedroom_expression_soft_smile','ابتسامة هادئة طبيعية'],
    ['bedroom_expression_half_smile','نصف ابتسامة غير متماثلة قليلًا'],
    ['bedroom_expression_small_teeth','ابتسامة صغيرة مع ظهور بسيط للأسنان'],
    ['bedroom_expression_amused','مستمتع قليلًا / ابتسامة مكبوتة'],
    ['bedroom_expression_serious','جاد وهادئ'],
    ['bedroom_expression_focused','مركز ومنتبه'],
    ['bedroom_expression_curious','فضولي مع رفع خفيف للحاجبين'],
    ['bedroom_expression_surprised','استغراب خفيف طبيعي'],
    ['bedroom_expression_skeptical','متشكك مع رفع بسيط لحاجب واحد'],
    ['bedroom_expression_squint','تضييق خفيف للعينين'],
    ['bedroom_expression_concerned','قلق خفيف'],
    ['bedroom_expression_tired','متعب قليلًا'],
    ['bedroom_expression_sleepy','نعسان ومرتاح'],
    ['bedroom_expression_pressed_lips','شفاه مضغوطة بخفة']
  ];

  var DESC={
    bedroom_expression_neutral:'neutral relaxed expression with mouth naturally closed and facial muscles near resting tone',
    bedroom_expression_faint_smile:'very faint closed-mouth smile with minimal mouth-corner lift and tiny cheek activation',
    bedroom_expression_soft_smile:'soft natural closed-mouth smile with gentle mouth-corner lift and mild cheek activation',
    bedroom_expression_half_smile:'subtle asymmetric half-smile with one mouth corner slightly higher than the other',
    bedroom_expression_small_teeth:'small natural smile with slight tooth visibility, modest cheek lift, and relaxed jaw',
    bedroom_expression_amused:'mild amused expression with restrained smile, slight cheek lift, and subtle lower-eyelid engagement',
    bedroom_expression_serious:'calm serious expression with relaxed closed lips, neutral brows, and no artificial jaw tension',
    bedroom_expression_focused:'focused attentive expression with mild brow engagement and slightly more attentive eyelid posture',
    bedroom_expression_curious:'mild curious expression with a small natural brow raise and slightly more open eyelids',
    bedroom_expression_surprised:'slight natural surprise with modest brow elevation and mildly widened eyelids, never cartoonish',
    bedroom_expression_skeptical:'subtle skeptical expression with one brow raised slightly and a restrained mouth',
    bedroom_expression_squint:'soft natural squint with mild lower-eyelid and upper-cheek engagement while eyes remain readable',
    bedroom_expression_concerned:'mild concern with slight inner-brow lift and draw, gentle forehead tension, and relaxed lips',
    bedroom_expression_tired:'mildly tired expression with slightly heavier upper eyelids and relaxed facial muscle tone',
    bedroom_expression_sleepy:'sleepy relaxed expression with partially lowered upper eyelids and minimal brow tension',
    bedroom_expression_pressed_lips:'lightly pressed lips with small natural mouth-muscle tension while jaw and cheeks stay relaxed'
  };

  var oldF=window.buildFinal,oldN=window.buildNegative,oldR=window.renderPickers;
  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function q(s){return document.querySelector(s)}
  function ok(v){return OPT.some(function(x){return x[0]===v})}
  function sel(){var v=String(S().bedroomExpression||'');return ok(v)?v:DEF}
  function text(){return DESC[sel()]||DESC[DEF]}
  function prep(){var s=S();if(!ok(String(s.bedroomExpression||'')))s.bedroomExpression=DEF;if(typeof OPTIONS==='object'&&OPTIONS)OPTIONS.bedroomExpression=OPT.slice()}

  function field(){
    var g=q('#bedroomEssentialGrid');if(!g)return;
    var f=q('#bedroomExpressionField');
    if(!f){
      f=document.createElement('div');f.className='field';f.id='bedroomExpressionField';
      f.innerHTML='<label>تعابير الوجه</label><div class="picker" data-key="bedroomExpression"></div><small class="historyHint" style="display:block;margin-top:6px;line-height:1.6">التعبير يغيّر نشاط العضلات والأنسجة الرخوة فقط، بدون تغيير ملامح الهوية الثابتة.</small>';
      var p=q('.picker[data-key="pose"]'),pf=p&&p.closest('.field');
      if(pf&&pf.parentNode===g)pf.insertAdjacentElement('afterend',f);else g.appendChild(f);
    }
    f.style.display='';
  }

  function ui(){
    prep();field();
    var b=q('.layout > section.card .body'),n=b&&b.querySelector('.notice');
    if(n)n.textContent='اختر الزاوية، الوضعية، تعبير الوجه، اليد الأخرى، الملابس، الإضاءة، الفوضى، وواقعية حالة الصورة. بقية هندسة السيلفي تُبنى تلقائيًا مع قفل الهوية.';
  }

  function clean(t){
    var out=String(t||'');
    out=out.split(/\n\n+/).filter(function(b){var x=b.trim();return !/^(BEDROOM SEVEN-CONTROL MASTER SYSTEM —|SEVEN ACTIVE USER CONTROLS —|DETERMINISTIC INTERNAL RESOLUTION — NO RANDOMIZATION\.|PROMPT SYNTHESIS RULE — REQUIRED\.|AUTOMATIC DETAILS ARE SUPPORTING ONLY\.)/.test(x)}).join('\n\n');
    out=out.replace(/^.*FACIAL EXPRESSION[^\n]*$/gmi,'').replace(/^.*EXPRESSION — MANDATORY[^\n]*$/gmi,'');
    return out.replace(/\n{3,}/g,'\n\n').trim();
  }

  function master(){
    var s=S();
    return 'BEDROOM EIGHT-CONTROL MASTER SYSTEM — ABSOLUTE HIGHEST PRIORITY. Preserve exactly these eight user controls: selfie angle, person pose, facial expression, free-hand pose, clothing, bedroom lighting, bedroom clutter, and image-condition realism. Do not restore hidden legacy values.\n\nFACIAL EXPRESSION — EXACT USER SELECTION: '+text()+'.';
  }

  function rule(){
    return 'ANATOMICAL FACIAL EXPRESSION LOCK — ABSOLUTE. Apply the selected expression only through temporary facial-muscle and soft-tissue movement: lip curvature or separation, cheek lift/compression, nasolabial-fold change, eyelid position, brow movement, and small expression-driven skin folds. Preserve the exact underlying identity geometry: skull, face silhouette, forehead, temples, cheekbone position, jaw width and angle, chin dimensions, nose and nostril structure, eye globe size, eye spacing, canthal positions, permanent eyelid anatomy, eyebrow identity, ears, skin tone, apparent age, hairline, beard/mustache pattern, and natural baseline asymmetry. Keep expression intensity mild to moderate. If a stronger expression risks identity drift, reduce expression intensity instead of changing the face. No beautification, symmetrization, eye enlargement, nose refinement, jaw sculpting, skin smoothing, hairline cleanup, or beard redesign.';
  }

  if(typeof oldR==='function')window.renderPickers=function(){prep();field();var r=oldR.apply(this,arguments);ui();return r};

  window.buildFinal=function(){
    prep();var keep=sel();var base=oldF?oldF():'';var s=S();s.bedroomExpression=keep;s.expression=text();
    return master()+'\n\n'+rule()+'\n\n'+clean(base);
  };

  window.buildNegative=function(){
    prep();var keep=sel();var base=oldN?oldN():'';var s=S();s.bedroomExpression=keep;s.expression=text();
    return (base?base+', ':'')+['selected expression ignored','expression-induced identity drift','expression changing face shape','expression changing jaw or chin geometry','expression changing nose structure','expression changing eye size or spacing','beautification during expression change','skin smoothing during expression change','cartoonishly exaggerated expression','different person after expression change'].join(', ');
  };

  function boot(){prep();field();if(typeof window.renderPickers==='function')window.renderPickers();ui();setTimeout(ui,200);setTimeout(ui,650)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
