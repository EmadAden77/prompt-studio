(function(){
  function mark(){
    var b=document.querySelector('.badge');
    if(b)b.textContent=(location.hash&&/^(#car|#bedroom|#places)$/.test(location.hash))?'v3.24':'Browser v3.24';
    var m=document.querySelector('.meta span:last-child');
    if(m)m.textContent='Prompt Studio Browser v3.24';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(mark,350)});else setTimeout(mark,350);
})();
