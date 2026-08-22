/* Selfie Prompt Studio v49 — Guided Workflow & Unified Reference Viewer */
(function(){
  const RAW='https://raw.githubusercontent.com/EmadAden77/prompt-studio/main/';
  const BEDROOM_MAIN=RAW+'bedroom-main-reference.png';
  const LOCATION_AR={bedroom:'غرفة النوم',office:'مكتب',car:'داخل سيارة',street:'شارع',gym:'نادي رياضي',cafe:'مقهى',villa:'فيلا',parking:'موقف سيارات'};
  const customRefs={};
  const css=`.v49-stepper{display:flex;gap:6px;overflow:auto;margin:0 0 14px;padding:6px 2px;scrollbar-width:none}.v49-stepper button{flex:0 0 auto;border:1px solid #32323a;background:#15151a;color:#c9c9d2;border-radius:999px;padding:7px 10px;font:inherit;font-size:11px}.v49-ref{background:#141419;border:1px solid #2c2c38;border-radius:14px;margin:12px 0;overflow:hidden}.v49-ref-head,.v49-ref-foot{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;font-size:12px}.v49-ref-head{color:#cbb8ff;background:#1b1626}.v49-ref-head button{background:none;border:1px solid #443a66;color:#cbb8ff;border-radius:8px;padding:3px 9px}.v49-ref-body{height:220px;background:#0d0d11;position:relative}.v49-ref-body img{width:100%;height:100%;object-fit:cover}.v49-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;color:#777;padding:16px;line-height:1.8}.v49-upload{border:1px dashed #3a3a4a;border-radius:8px;padding:5px 9px;color:#9ab}.v49-upload input{display:none}.v49-full{position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;display:flex;align-items:center;justify-content:center;padding:12px}.v49-full[hidden]{display:none}.v49-full img{max-width:100%;max-height:100%;border-radius:10px}.v49-version{font-size:12px;color:#d7ff4a;margin-top:6px}`;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

  function sectionFor(text){return [...document.querySelectorAll('.section-block')].find(x=>x.textContent.includes(text));}
  function setupStepper(){
    const host=document.querySelector('.controls-panel'); if(!host||document.querySelector('.v49-stepper'))return;
    const nav=document.createElement('nav'); nav.className='v49-stepper';
    const items=[['الهوية','الصورة المرجعية'],['المكان','المكان'],['التصوير','زاوية السيلفي'],['الشخص','التعبير'],['المرافقون','المرافقون'],['البيئة','الإضاءة'],['الإخراج','الـPrompt النهائي']];
    items.forEach(([label,target])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>{const el=target==='الـPrompt النهائي'?document.querySelector('.output-panel'):sectionFor(target);el?.scrollIntoView({behavior:'smooth',block:'start'});};nav.appendChild(b);});
    host.prepend(nav);
  }

  function villaRef(){
    const reg=window.VILLA_REFERENCE_REGISTRY_V47||{}; const key=(window.state&&state.villaScene)||'stair_hall'; const sc=reg[key];
    if(!sc)return {url:window.VILLA_REFERENCE_BOARD_URL||RAW+'villa-reference-board.jpg',title:'فيلا',meta:'لوحة المراجع'};
    const hall=key==='stair_hall'&&window.VILLA_CONNECTED_REFERENCE_URLS?.hallA;
    return {url:hall||window.VILLA_REFERENCE_BOARD_URL||RAW+'villa-reference-board.jpg',title:'فيلا · '+sc.name,meta:(sc.angles?.length||0)+' زاوية موثقة'};
  }
  function currentRef(){
    const loc=window.state?.location||'bedroom';
    if(loc==='bedroom')return {url:BEDROOM_MAIN,title:'غرفة النوم',meta:'المرجع الرئيسي'};
    if(loc==='villa')return villaRef();
    return {url:customRefs[loc]||null,title:LOCATION_AR[loc]||loc,meta:customRefs[loc]?'مرجع محلي مؤقت':'بدون مرجع'};
  }
  function updateRef(){
    const box=document.getElementById('v49RefViewer'); if(!box)return; const r=currentRef();
    box.querySelector('[data-title]').textContent='📷 مرجع: '+r.title; box.querySelector('[data-meta]').textContent=r.meta||'';
    const img=box.querySelector('img'); const empty=box.querySelector('.v49-empty');
    if(r.url){img.src=r.url;img.hidden=false;empty.hidden=true;}else{img.removeAttribute('src');img.hidden=true;empty.hidden=false;}
  }
  function setupRefViewer(){
    const locSec=sectionFor('المكان'); if(!locSec||document.getElementById('v49RefViewer'))return;
    const box=document.createElement('div');box.id='v49RefViewer';box.className='v49-ref';box.innerHTML=`<div class="v49-ref-head"><span data-title>📷 مرجع المكان الحالي</span><button type="button" data-open>تكبير ⤢</button></div><div class="v49-ref-body"><img alt="مرجع المكان" hidden><div class="v49-empty">لا يوجد مرجع لهذا المكان بعد.<br>ارفع صورة حقيقية لهذا المكان.</div></div><div class="v49-ref-foot"><label class="v49-upload">＋ رفع مرجع<input type="file" accept="image/*"></label><span data-meta></span></div>`;
    locSec.appendChild(box);
    box.querySelector('input').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;if(state.location==='villa'){alert('مراجع الفيلا مرتبطة بسجل مشاهد الفيلا ولا تُستبدل من هنا.');return;}customRefs[state.location]=URL.createObjectURL(f);updateRef();});
    box.querySelector('[data-open]').onclick=()=>{const r=currentRef();if(!r.url)return;let full=document.getElementById('v49Full');if(!full){full=document.createElement('div');full.id='v49Full';full.className='v49-full';full.hidden=true;full.innerHTML='<img>';full.onclick=()=>full.hidden=true;full.querySelector('img').onclick=e=>e.stopPropagation();document.body.appendChild(full);}full.querySelector('img').src=r.url;full.hidden=false;};
    document.addEventListener('click',()=>setTimeout(updateRef,0)); document.addEventListener('change',()=>setTimeout(updateRef,0)); updateRef();
  }
  function markVersion(){
    document.title='Selfie Prompt Studio v49';
    const top=document.querySelector('.topbar h1');if(top){top.textContent='SELFIE PROMPT STUDIO v49 — MOBILE';const p=document.createElement('div');p.className='v49-version';p.textContent='Guided Workflow · Unified Reference Viewer';top.after(p);}
  }
  function init(){markVersion();setupStepper();setupRefViewer();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();