(function(){
  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;

  function vals(){
    try{return typeof smartValues==='function'?smartValues():state}
    catch(e){return {}}
  }
  function bedroom(v){
    var t=((v.idea||'')+' '+(v.location||'')).toLowerCase();
    return location.hash==='#bedroom'||!!v.roomLock||/غرفة النوم|غرفه النوم|bedroom/.test(t);
  }
  function clothing(v){return String((v&&v.clothing)||'').trim()}

  window.buildFinal=function(){
    var base=oldFinal?oldFinal():'';
    var v=vals(),c=clothing(v);
    if(!bedroom(v)||!c)return base;
    var lock='BEDROOM CLOTHING LOCK — ABSOLUTE MANDATORY. Dress the referenced person in EXACTLY the user-selected bedroom clothing: "'+c+'". Preserve the selected garment types, colors, sleeve lengths, leg lengths, fit, layering, and overall clothing combination exactly as written. Do not substitute a different T-shirt color, do not replace shorts with trousers, do not replace trousers with shorts, do not add or remove layers, and do not reinterpret the selected outfit into a generic home outfit. The clothing must remain visibly consistent across the entire image. Natural fabric folds, wrinkles, stretch, compression, and shadowing are allowed and required for realism, but they must not change the actual selected garments or colors. If any other instruction conflicts with this clothing selection, this clothing lock wins.';
    var check='CLOTHING COMPLIANCE CHECK — REQUIRED BEFORE RENDERING. Verify that the visible top and bottom garments exactly match the selected bedroom clothing text before rendering. Confirm garment category, color, sleeve length, leg length, fit, and layering. If the generated outfit differs, correct the outfit rather than changing the user selection.';
    return lock+'\n\n'+check+'\n\n'+base;
  };

  window.buildNegative=function(){
    var base=oldNegative?oldNegative():'';
    var v=vals(),c=clothing(v);
    if(!bedroom(v)||!c)return base;
    var extra=['wrong clothing','different outfit','wrong shirt color','wrong T-shirt color','wrong shorts color','wrong trouser color','shorts replaced by trousers','trousers replaced by shorts','added jacket','added robe','removed clothing layer','generic home outfit replacing selected outfit','ignored clothing selection','clothing color drift'];
    return (base?base+', ':'')+extra.join(', ');
  };
})();
