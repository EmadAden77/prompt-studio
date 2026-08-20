(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function daytime(){
    var t=String(S().time||'').toLowerCase();
    return /صباح|صباحًا|صباحا|نهار|نهارًا|نهارا|ظهراً|ظهرا|ظهر|عصر|الفجر|morning|day|daytime|noon|afternoon|sunrise/.test(t) && !/ليل|ليلاً|ليلا|مساء|مساءً|night|evening|midnight|late night/.test(t);
  }

  var RULE='BEDROOM DAYTIME CURTAIN AND WINDOW RULE — ABSOLUTE HIGHEST PRIORITY WHEN THE SELECTED TIME IS DAYTIME. In the canonical bedroom, the large dark floor-to-ceiling curtain centered on the FAR wall is the curtain directly in front of the existing window. When the selected time is daytime, this exact curtain must be naturally opened laterally from its real track/attachment enough to reveal the real window behind it and to make visible natural daylight enter from that far-wall window. Preserve the window and curtain in their exact established locations; do not invent a new window, move the window, move the curtain to another wall, redesign the far wall, or alter the room geometry. The curtain may remain partly gathered at the sides with realistic fabric weight, folds, compression, and gravity. Daylight must visibly originate from the revealed far-wall window, producing believable directional illumination, gradual falloff into the room, brighter surfaces nearer the window, softer darker zones deeper in the room, and realistic shadows and reflected bounce on the bed, floor, walls, furniture, clothing, and subject. Do not keep the far-wall curtain fully closed in a daytime bedroom scene. Do not fake daylight from the ceiling, doorway, or another wall. This daytime-window rule is a consequence of the selected daytime state and therefore outranks generic wording that would otherwise suppress window daylight. If a Bedroom Lighting option specifies an artificial light as “only”, interpret “only” as the only ACTIVE ARTIFICIAL bedroom light; natural daylight from the revealed far-wall window must still remain present during daytime unless the user explicitly requests blackout conditions.';

  var CHECK='BEDROOM DAYTIME WINDOW COMPLIANCE CHECK — REQUIRED. For daytime scenes confirm that: (1) the same far-wall curtain from the canonical bedroom is visibly opened rather than replaced; (2) the existing window behind it is revealed in the same wall position; (3) daylight visibly comes from that window and affects the room physically; (4) room identity, furniture layout, curtain track, wall geometry and window location remain unchanged; and (5) no second invented window or false daylight direction is introduced.';

  window.buildFinal=function(){
    var base=previousFinal?previousFinal():'';
    if(!daytime())return base;
    return RULE+'\n\n'+base+'\n\n'+CHECK;
  };

  window.buildNegative=function(){
    var base=previousNegative?previousNegative():'';
    if(!daytime())return base;
    var x=[
      'fully closed far-wall curtain during daytime',
      'daytime bedroom with no visible window daylight',
      'daylight coming from wrong wall',
      'daylight coming from ceiling',
      'invented second window',
      'moved bedroom window',
      'moved far-wall curtain',
      'redesigned far wall to expose daylight',
      'curtain floating away from its track',
      'gravity-defying curtain folds',
      'window placement inconsistent with canonical bedroom'
    ];
    return (base?base+', ':'')+x.join(', ');
  };
})();