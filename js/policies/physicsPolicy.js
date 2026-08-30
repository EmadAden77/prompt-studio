/**
 * Master bedroom-physics rule. A primitive string is immutable by design;
 * Object.freeze documents that this contract is never user-configurable.
 */
export const PHYSICS_CONTRACT = Object.freeze(`
[BEDROOM PHYSICS]
- Gravity: every body and object contacts a supporting
  surface; continuous contact shadows under pelvis, feet,
  shoes, bag, chair legs; NO floating.
- Compression: mattress depression under pelvis/back/head;
  pillow compressed under head; rug pile compressed where
  seated; bedding folds respond to body weight.
- Light: single dominant source per shot (ceiling downlights
  OR warm bedside lamp OR curtained daylight); ALL shadows
  share one direction; eye catchlights and leather/mirror
  speculars match the same source.
- Mirrors: wardrobe mirrored doors follow one consistent ray
  path; phone and person visible in reflection; only furniture
  actually inside the mirror's field of view appears.
- Materials: tufted leather headboard shows stitching and soft
  sheen; porcelain floor shows faint specular reflection;
  fabrics matte with gravity folds; plastic bottles reflect
  room light.
- Anatomy: joints within natural range; raised selfie arm shows
  shoulder elevation; gestures have exactly five fingers with
  possible wrist angles.
- Camera: front smartphone camera at 40-70 cm with mild
  wide-angle distortion; overhead shots cast the phone's shadow
  on the chest under downlights.
- Clutter: scattered shoes, chair with clothes, and bag remain
  fixed, grounded, never duplicated or floating.
`);
