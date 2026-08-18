(function(){
  var HISTORY_KEY='prompt_studio_field_history_v1';
  var FIELDS=['idea','location','time','clothing','camera'];
  var MAX_ITEMS=12;
  var store={};

  function injectStyles(){
    if(document.getElementById('prompt-history-styles')) return;
    var style=document.createElement('style');
    style.id='prompt-history-styles';
    style.textContent='.field{position:relative}.historyMenu{display:none;position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:120;background:#171d25;border:1px solid var(--line2);border-radius:14px;box-shadow:0 18px 48px #000b;max-height:230px;overflow:auto;padding:6px}.historyMenu.show{display:block}.historyItem{display:flex;align-items:flex-start;gap:8px;width:100%;padding:9px 10px;border-radius:10px;color:var(--text);background:transparent;cursor:pointer}.historyItem:hover{background:#2a3340}.historyValue{flex:1;text-align:right;line-height:1.45;word-break:break-word}.historyRemove{border:0;background:transparent;color:#9aa6b4;cursor:pointer;font-size:16px;line-height:1;padding:2px 4px;border-radius:8px}.historyRemove:hover{background:#334050;color:#fff}.historyEmpty{padding:9px 10px;color:var(--muted);font-size:12px}.historyClear{display:block;width:100%;margin-top:6px;border:1px solid var(--line);background:#10161d;color:#cfd7e0;border-radius:10px;padding:9px 10px;cursor:pointer;font-weight:700}.historyHint{display:block;margin-top:5px;color:var(--muted);font-size:11px}';
    document.head.appendChild(style);
  }

  function loadHistory(){
    try{store=JSON.parse(localStorage.getItem(HISTORY_KEY)||'{}')||{}}catch(e){store={}}
    FIELDS.forEach(function(id){if(!Array.isArray(store[id]))store[id]=[]});
  }

  function saveHistoryStore(){localStorage.setItem(HISTORY_KEY,JSON.stringify(store));}

  function saveEntry(id,val){
    val=String(val||'').trim();
    if(!val)return;
    var arr=Array.isArray(store[id])?store[id]:[];
    arr=arr.filter(function(x){return x!==val});
    arr.unshift(val);
    if(arr.length>MAX_ITEMS)arr=arr.slice(0,MAX_ITEMS);
    store[id]=arr;
    saveHistoryStore();
  }

  function removeEntry(id,val){
    var arr=Array.isArray(store[id])?store[id]:[];
    store[id]=arr.filter(function(x){return x!==val});
    saveHistoryStore();
  }

  function getEntries(id,q){
    var arr=Array.isArray(store[id])?store[id]:[];
    q=String(q||'').trim().toLowerCase();
    if(!q)return arr;
    return arr.filter(function(x){return x.toLowerCase().indexOf(q)!==-1});
  }

  function hideAll(){
    FIELDS.forEach(function(id){
      var input=document.getElementById(id);
      if(input&&input._historyMenu) input._historyMenu.classList.remove('show');
    });
  }

  function renderMenu(id){
    var input=document.getElementById(id);
    var menu=input&&input._historyMenu;
    if(!input||!menu)return;
    var entries=getEntries(id,input.value);
    menu.innerHTML='';
    if(!entries.length){
      var empty=document.createElement('div');
      empty.className='historyEmpty';
      empty.textContent='لا يوجد سجل محفوظ لهذه الخانة بعد';
      menu.appendChild(empty);
    }else{
      entries.forEach(function(val){
        var item=document.createElement('div');
        item.className='historyItem';
        var value=document.createElement('div');
        value.className='historyValue';
        value.textContent=val;
        value.addEventListener('mousedown',function(e){
          e.preventDefault();
          input.value=val;
          input.dispatchEvent(new Event('input',{bubbles:true}));
          hideAll();
          input.focus();
        });
        var remove=document.createElement('button');
        remove.type='button';
        remove.className='historyRemove';
        remove.setAttribute('aria-label','حذف من السجل');
        remove.textContent='×';
        remove.addEventListener('mousedown',function(e){
          e.preventDefault();
          e.stopPropagation();
          removeEntry(id,val);
          renderMenu(id);
        });
        item.appendChild(value);
        item.appendChild(remove);
        menu.appendChild(item);
      });
      var clearBtn=document.createElement('button');
      clearBtn.type='button';
      clearBtn.className='historyClear';
      clearBtn.textContent='مسح سجل هذه الخانة';
      clearBtn.addEventListener('mousedown',function(e){
        e.preventDefault();
        store[id]=[];
        saveHistoryStore();
        renderMenu(id);
      });
      menu.appendChild(clearBtn);
    }
    menu.classList.add('show');
  }

  function enhanceField(id){
    var input=document.getElementById(id);
    if(!input||input._historyEnhanced)return;
    input._historyEnhanced=true;
    var field=input.closest('.field')||input.parentElement;
    var hint=document.createElement('small');
    hint.className='historyHint';
    hint.textContent='اضغط على الخانة لعرض ما كتبته سابقًا';
    field.appendChild(hint);
    var menu=document.createElement('div');
    menu.className='historyMenu';
    field.appendChild(menu);
    input._historyMenu=menu;
    ['focus','click'].forEach(function(ev){
      input.addEventListener(ev,function(e){e.stopPropagation();renderMenu(id);});
    });
    input.addEventListener('input',function(){renderMenu(id);});
    input.addEventListener('blur',function(){saveEntry(id,input.value);setTimeout(hideAll,180);});
    input.addEventListener('keydown',function(e){if(e.key==='Escape')hideAll();});
  }

  function init(){
    injectStyles();
    loadHistory();
    FIELDS.forEach(enhanceField);
    document.addEventListener('click',function(e){
      if(!e.target.closest('.historyMenu')&&!FIELDS.some(function(id){return e.target===document.getElementById(id);})){hideAll();}
    });
    var originalGenerate=window.generate;
    if(typeof originalGenerate==='function'){
      window.generate=function(scroll){
        FIELDS.forEach(function(id){var el=document.getElementById(id);if(el)saveEntry(id,el.value);});
        return originalGenerate(scroll);
      };
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
