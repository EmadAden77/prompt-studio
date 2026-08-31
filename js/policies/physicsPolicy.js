/**
 * Master bedroom-physics rule. A primitive string is immutable by design;
 * Object.freeze documents that this contract is never user-configurable.
 *
 * Important: this contract is deliberately conditional. It must never invent
 * contacts, reflections, camera angles or light sources that are not part of
 * the selected pose / framing / lighting state.
 */
export const PHYSICS_CONTRACT = Object.freeze(`
[BEDROOM PHYSICS]
- Gravity: every visible body part and object must contact only the supporting
  surface required by the selected pose. Do not add floor, rug, chair, shoe or
  furniture contact rules when those contacts are not part of the shot. NO floating.
- Compression: show compression only at real contact zones required by the
  selected pose, such as pillow, mattress, sofa or chair contact. Do not invent
  unrelated mattress, rug or seat compression.
- Light: obey only the currently selected bedroom-lighting setup. Any other
  lamp, ceiling fixture, phone screen, laptop screen or window source stays off
  or visually negligible unless that selected setup explicitly includes it.
  Highlights, cast shadows, eye catchlights and material speculars must agree
  with those selected sources.
- Mirrors: only if a mirror is actually visible in the final frame, its
  reflection follows one consistent ray path and contains only objects within
  its real field of view. Never force the phone or subject to appear in a mirror.
- Materials: visible leather, porcelain, wood, cotton, glass and plastic retain
  physically plausible texture, sheen and reflection without exaggerated gloss.
- Anatomy: joints remain within natural range; visible hands have exactly five
  fingers; any selfie-arm position must be physically possible even when the
  arm or phone is outside the crop.
- Camera: obey only the selected camera height, angle and distance. Do not add
  overhead-camera behavior, phone shadows or observer-camera geometry unless
  the selected pose and lighting explicitly require them.
- Clutter: existing shoes, clothes, bag and furniture remain grounded and
  unduplicated only when visible in the frame; do not pull off-frame clutter
  into the composition merely to satisfy this contract.
`);
