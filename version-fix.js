(function(){
  function mark(){
    var b=document.querySelector('.badge');
    if(b)b.textContent=(location.hash&&/^(#car|#bedroom|#places)$/.test(location.hash))?'v3.71':'Browser v3.71';
    var m=document.querySelector('.meta span:last-child');
    if(m)m.textContent='Prompt Studio Browser v3.71';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(mark,450)});else setTimeout(mark,450);
})();