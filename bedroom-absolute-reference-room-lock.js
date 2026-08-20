(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var oldFinal=window.buildFinal;
  var oldNegative=window.buildNegative;

  var LOCK=[
    'ABSOLUTE BEDROOM REFERENCE LOCK — HIGHEST ROOM PRIORITY. The adopted bedroom reference image is the sole visual ground truth for the room. Reproduce the SAME room, not a similar bedroom, reinterpretation, redesign, upgraded version, cleaned version, staged version, or generic approximation.',
    'PRESERVE EVERY VISIBLE ROOM DETAIL. Keep the exact room dimensions and proportions, wall/ceiling/floor geometry, perspective relationships, openings, edges, recesses, materials, colors, furniture identities, furniture dimensions, positions, orientations, spacing, clearances, and relative distances exactly consistent with the reference. Do not move, resize, rotate, replace, simplify, modernize, beautify, hide, remove, duplicate, or invent permanent room elements.',
    'REFERENCE ANCHORS — FIXED. Preserve the bed on the left with its dark horizontal padded headboard; the wall-mounted split AC at upper left; the far-wall dark curtain/window position; the right-side wardrobe/dressing system and its doors, mirrors, hanging-clothes zones, shelves and drawers; the right-side dresser; the beige polished tile floor; the existing rug with its same size, shape, position and orientation; the bedside/foreground tables and existing room furniture; and the layered recessed ceiling/downlight layout exactly where they belong in the adopted reference. These anchors define one immutable room geometry.',
    'NO ROOM HALLUCINATION. Never add a second window, extra door, new wall, different ceiling, extra wardrobe, replacement bed, new rug, decorative panel, luxury furniture, plant, artwork, lamp, shelf, desk, television, architectural feature, or any other room object that is not present in the reference unless an explicit user control specifically requests that exact addition.',
    'TRANSIENT CONTROLS DO NOT REDESIGN THE ROOM. Selected lighting may change illumination only. Selected clutter may change only the allowed amount/placement of ordinary movable clutter while respecting existing surfaces and walkable space. Selected bed condition may change only bedding arrangement and physically related folds/compression. Person pose, selfie angle, selfie crop and shuffled location may change camera/person placement only. None of these controls may alter permanent room geometry, furniture identity, furniture placement, curtain/window location, AC location, floor, rug, ceiling, walls, or fixed materials.',
    'ROOM-FIDELITY GATE. Before output, compare the generated scene mentally against the adopted room reference element by element. If any permanent room detail, position, proportion, spacing, material, or architectural relationship differs from the reference, correct the ROOM to the reference. Never correct the mismatch by changing the reference interpretation.'
  ].join('\n\n');

  window.buildFinal=function(){
    var base=oldFinal?oldFinal():'';
    return LOCK+'\n\n'+base;
  };

  window.buildNegative=function(){
    var base=oldNegative?oldNegative():'';
    var x=[
      'different bedroom','similar-but-not-identical bedroom','room redesign','room reinterpretation','changed room proportions','changed wall geometry','changed ceiling geometry','changed floor material','changed curtain or window position','changed AC position','moved bed','resized bed','changed headboard','moved wardrobe','changed wardrobe design','moved dresser','moved or resized rug','changed rug position or orientation','invented permanent furniture','removed permanent furniture','duplicated furniture','extra window','extra door','invented wall opening','luxury bedroom redesign','hotel-room styling','showroom bedroom','cleaned or staged replacement room','reference room details ignored'
    ];
    return (base?base+', ':'')+x.join(', ');
  };
})();
