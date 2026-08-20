(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var AUTO='__auto_prompt__';
  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function pose(){return String(S().pose||'')}

  function autoHandForPose(p){
    if(p==='bedroom_peeking_blanket')return 'free hand gently holding a pillow or blanket';
    if(p==='bedroom_laptop_book_bed')return 'free hand resting naturally on the thigh';
    return '';
  }

  function withPoseHand(fn){
    var s=S(),p=pose(),desired=autoHandForPose(p);
    if(!desired)return fn();
    var current=String(s.bedroomHandPose||AUTO);
    if(current!==AUTO)return fn();
    var oldBedroom=s.bedroomHandPose,oldFree=s.freeHandPose;
    s.bedroomHandPose=desired;s.freeHandPose=desired;
    try{return fn()}finally{s.bedroomHandPose=oldBedroom;s.freeHandPose=oldFree}
  }

  function stripWrongFallback(text,p){
    var out=String(text||'');
    if(p!=='bedroom_peeking_blanket'&&p!=='bedroom_laptop_book_bed')return out;
    return out.split(/\n\n+/).filter(function(block){
      return !/^POSE REALISM — STANDING BESIDE BED\./.test(block.trim());
    }).join('\n\n').replace(/\n{3,}/g,'\n\n').trim();
  }

  function realismRule(p){
    if(p==='bedroom_peeking_blanket')return 'EXPANDED POSE REALISM — PEEKING ABOVE BLANKET. Keep the body genuinely lying or softly reclining under the blanket with head and neck supported by the real pillow. The blanket rises naturally from the chest toward the lower face so the eyes, eyebrows, and forehead remain visible without covering the eyes. Fabric must show believable thickness, gravity, compression, tension, and irregular folds around the shoulders and torso. If the automatically resolved free hand holds the blanket, fingers create small local compression only; do not invent a second visible hand or expose the hidden camera-holding arm. The crop may become tighter to preserve the intended peeking composition, but facial identity and eye anatomy remain exact.';
    if(p==='bedroom_laptop_book_bed')return 'EXPANDED POSE REALISM — LAPTOP/BOOK ON BED. Keep the subject genuinely seated or comfortably supported on the mattress. Include exactly one ordinary open laptop OR one open book as part of this selected pose, resting naturally on the lap or bedding with believable weight, contact shadow, page/screen angle, hinge or spine geometry, and mattress response. The free hand may rest naturally on the thigh unless the user explicitly selected another compatible hand pose. Do not add notebooks, pens, cups, extra devices, chargers, or decorative work props unless separately selected. The laptop/book must never float, intersect the body, duplicate, or become the visual subject instead of the selfie.';
    if(p==='bedroom_holding_pillow')return 'EXPANDED POSE REALISM — PILLOW/BLANKET HUG. Treat the selected pillow or blanket as a soft object with real volume and weight. It compresses against the torso where held, bulges away from pressure points, and forms gravity-driven folds. Shoulders, elbows, wrist, and the visible free hand stay relaxed and anatomically plausible. Keep the gesture comfortable and ordinary rather than staged, cute, or exaggerated.';
    return '';
  }

  function framingRule(p){
    if(p==='bedroom_peeking_blanket')return 'POSE-SPECIFIC SELFIE FRAMING — PEEKING. Use a naturally tight front-camera crop dominated by the visible eyes, eyebrows, forehead, pillow edge, and upper blanket. Preserve enough bedroom context to read as the same room without widening the crop merely to show the body.';
    if(p==='bedroom_laptop_book_bed')return 'POSE-SPECIFIC SELFIE FRAMING — LAPTOP/BOOK. Use a casual upper-body selfie crop that allows a believable portion of the open laptop or book to appear lower in frame as secondary context. Do not turn the composition into a product shot or third-person work-from-bed photograph.';
    return '';
  }

  window.buildFinal=function(){
    var p=pose();
    var base=withPoseHand(function(){return oldFinal?oldFinal():''});
    base=stripWrongFallback(base,p);
    var blocks=[];
    var r=realismRule(p),f=framingRule(p);
    if(r)blocks.push(r);if(f)blocks.push(f);
    return blocks.length?blocks.join('\n\n')+'\n\n'+base:base;
  };

  window.buildNegative=function(){
    var p=pose();
    var base=withPoseHand(function(){return oldNegative?oldNegative():''});
    var x=[];
    if(p==='bedroom_peeking_blanket')x=x.concat(['blanket covering the eyes','blanket floating above body','blanket fused into face','standing body in peeking pose','camera-holding arm visible above blanket']);
    if(p==='bedroom_laptop_book_bed')x=x.concat(['floating laptop','floating book','duplicate laptop','duplicate book','extra work props','laptop intersecting torso','impossible laptop hinge','product-shot composition']);
    if(p==='bedroom_holding_pillow')x=x.concat(['rigid pillow while hugged','pillow intersecting torso','floating pillow','exaggerated staged pillow hug']);
    return x.length?(base?base+', ':'')+x.join(', '):base;
  };
})();