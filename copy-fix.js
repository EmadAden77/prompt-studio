(function(){
  function feedback(btn,msg){
    if(!btn)return;
    var old=btn.textContent;
    btn.textContent=msg||'✓ تم النسخ';
    btn.disabled=true;
    setTimeout(function(){btn.textContent=old;btn.disabled=false;},1200);
  }
  function legacyCopy(text){
    var ta=document.createElement('textarea');
    ta.value=text;
    ta.setAttribute('readonly','');
    ta.style.position='fixed';
    ta.style.top='0';
    ta.style.left='0';
    ta.style.width='2px';
    ta.style.height='2px';
    ta.style.opacity='0.01';
    ta.style.fontSize='16px';
    document.body.appendChild(ta);
    try{ta.focus({preventScroll:true});}catch(e){ta.focus();}
    ta.select();
    ta.setSelectionRange(0,ta.value.length);
    var ok=false;
    try{ok=document.execCommand('copy');}catch(e){}
    ta.remove();
    return ok;
  }
  window.doCopy=async function(text,btn){
    text=String(text||'');
    if(!text.trim())return false;
    if(window.isSecureContext&&navigator.clipboard&&navigator.clipboard.writeText){
      try{await navigator.clipboard.writeText(text);feedback(btn);return true;}catch(e){}
    }
    try{if(legacyCopy(text)){feedback(btn);return true;}}catch(e){}
    try{
      if(navigator.share){
        await navigator.share({text:text});
        feedback(btn,'✓ تمت المشاركة');
        return true;
      }
    }catch(e){if(e&&e.name==='AbortError')return false;}
    window.prompt('تعذّر النسخ التلقائي في هذا المتصفح. اضغط مطولاً على النص ثم اختر نسخ:',text);
    return false;
  };
})();
