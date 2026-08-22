/* Villa Reference Registry v47 — connected visual references */
(function(){
  const RAW_BASE='https://raw.githubusercontent.com/EmadAden77/prompt-studio/main/';
  const BOARD=RAW_BASE+'villa-reference-board.jpg';
  const REGISTRY={
    stair_hall:{name:'الصالة والدرج',anchor:'درج رخامي بدرابزين خشبي + كونسول + إنارة سقفية',boardCell:'hall-a / hall-b',angles:['زاوية المدخل الداخلي المستقيم باتجاه الباب الأمامي مع الكونسول والمرآة','زاوية 3/4 من أسفل الدرج مع ظهور الدرج والطاولة الجانبية والكرسي']},
    majlis:{name:'المجلس الرئيسي',anchor:'جلسة عربية U + سجادة حمراء + دلة',boardCell:'majlis-a',angles:['زاوية الدخول من الباب باتجاه الجلسة العربية U والسجادة والطاولات الوسطية']},
    kitchen:{name:'المطبخ الحديث',anchor:'جزيرة وسطية + 3 كراسي بار فقط',boardCell:'kitchen-a',angles:['زاوية أمامية واسعة على الجزيرة مع الثلاجة والفرن والخزائن']},
    dining:{name:'ركن الطعام',anchor:'طاولة خشبية + 8 كراسي ثابتة',boardCell:'dining-a',angles:['زاوية محورية من رأس الطاولة باتجاه الطاولة والكراسي الثمانية']},
    living:{name:'غرفة المعيشة',anchor:'أريكة L رمادية + وحدة TV',boardCell:'living-a',angles:['زاوية واسعة من جهة المدخل نحو الأريكة ووحدة التلفزيون والطاولة الوسطية']},
    corridor:{name:'الممر العلوي',anchor:'4 أبواب يمين + 3 يسار',boardCell:'corridor-a',angles:['زاوية طولية مركزية مستقيمة على امتداد الممر']},
    courtyard:{name:'الحوش الخارجي',anchor:'واجهة الفيلا + المظلة + نفس السيارة',boardCell:'hosh-a / hosh-b',angles:['زاوية مركزية من البوابة باتجاه واجهة الفيلا','زاوية مائلة من الجهة اليسرى تظهر المظلة والزراعة والسيارة والواجهة']}
  };
  window.VILLA_REFERENCE_REGISTRY_V47=REGISTRY;
  window.VILLA_REFERENCE_BOARD_URL=BOARD;
  window.VILLA_CONNECTED_REFERENCE_URLS={
    board:BOARD,
    hallA:RAW_BASE+'villa-hall-a.png'
  };

  function activeScene(){
    const key=(window.state&&state.villaScene)||'stair_hall';
    return REGISTRY[key]||REGISTRY.stair_hall;
  }
  function referenceBlock(){
    if(!window.state||state.location!=='villa')return '';
    const s=activeScene();
    return `\n\nVILLA VISUAL REFERENCE REGISTRY v47 — CONNECTED\nScene: ${s.name}.\nFixed anchor: ${s.anchor}.\nConnected visual contact sheet: ${BOARD}\nBoard cell(s): ${s.boardCell}.\nDocumented angle(s):\n- ${s.angles.join('\n- ')}\nTreat these as views of the same physical villa. Keep architecture, permanent furniture, materials, room proportions, door positions, and courtyard vehicle identity continuous. A repository URL is an identifier; for image generation, attach the relevant visual reference image when the model must inspect it directly.`;
  }

  const previous=window.buildPrompt;
  if(typeof previous==='function'){
    window.buildPrompt=function(){
      const base=previous.apply(this,arguments)||document.getElementById('promptOutput')?.value||'';
      const extra=referenceBlock();
      const out=extra?base+extra:base;
      const el=document.getElementById('promptOutput');if(el)el.value=out;
      return out;
    };
  }

  function panel(){
    if(document.getElementById('villaReferenceStatusV47'))return;
    const chips=document.getElementById('locationChips');if(!chips)return;
    const box=document.createElement('div');
    box.id='villaReferenceStatusV47';
    box.style.cssText='display:none;margin-top:10px;padding:10px 12px;border:1px solid #365143;border-radius:12px;background:#101b16;color:#dce8e1;font-size:12px;line-height:1.7';
    box.innerHTML='🟢 <b>مراجع الفيلا متصلة</b><br>تم ربط لوحة المراجع البصرية بالمشاهد. عند اختيار الفيلا سيضيف التطبيق المرجع والزاوية المناسبة إلى الـPrompt.';
    chips.parentElement.appendChild(box);
    const sync=()=>{box.style.display=(window.state&&state.location==='villa')?'block':'none';};
    document.addEventListener('click',()=>setTimeout(sync,0));sync();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',panel);else panel();
})();
