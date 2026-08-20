(function(){
  function mark(){
    var b=document.querySelector('.badge');
    if(b)b.textContent=(location.hash&&/^(#car|#bedroom|#places)$/.test(location.hash))?'v3.61':'Browser v3.61';
    var m=document.querySelector('.meta span:last-child');
    if(m)m.textContent='Prompt Studio Browser v3.61';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(mark,450)});else setTimeout(mark,450);
})();