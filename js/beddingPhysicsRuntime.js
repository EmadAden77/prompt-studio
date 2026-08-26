import { PromptEngine } from "./engines/promptEngine.js";

const patchFlag = Symbol.for("promptStudio.beddingPhysicsRuntime.patched");

const BED_POSE_IDS = new Set([
  "lying_back",
  "lying_right_side",
  "lying_left_side",
  "lying_stomach",
  "semi_reclining"
]);

const BEDDING_VARIANTS = Object.freeze({
  lying_back: "SUPINE VARIANT: back of head sinks into the pillow; hair spreads radially across the pillowcase; both ears remain naturally free unless the head rotates; chin stays neutral; blanket edge may sit around waist or chest; bent knees may tent the blanket with straight load-driven tension lines.",
  lying_right_side: "RIGHT-SIDE VARIANT: right ear and lower cheek press into the pillow; the lower ear may fold softly; upper cheek falls subtly toward the nose; blanket follows the right hip curve and may settle between the knees; mattress compression is strongest around the loaded right shoulder/ribcage/hip chain.",
  lying_left_side: "LEFT-SIDE VARIANT: mirror the right-side mechanics anatomically; left ear and lower cheek press into the pillow; upper cheek falls subtly toward the nose; blanket follows the left hip curve and may settle between the knees; mattress compression follows the loaded left shoulder/ribcage/hip chain.",
  lying_stomach: "PRONE VARIANT: head is either supported by forearms or turned with one cheek in real pillow contact; never hover above the pillow. Blanket covers mainly the legs, with lower back exposed or only lightly covered according to the active crop and clothing.",
  semi_reclining: "SEMI-RECLINING VARIANT: stacked pillows compress behind the upper back; pelvis remains loaded on the mattress; head rests on the top pillow with slight forward neck flexion; blanket naturally pools around the waist and forms stacked folds over the thighs."
});

const BEDDING_PHYSICS_LOCK = `BEDDING PHYSICS LOCK — HEAD · PILLOW · BLANKET REALISM

A) HEAD–PILLOW CONTACT — THE HEAD SINKS, NEVER FLOATS ON TOP
- Show an actual compressed contact zone under the head. A typical soft-pillow depression may read roughly like several centimeters of sink, but the exact amount must follow the visible pillow thickness, fill and head orientation rather than a rigid numeric target.
- Pillow fill displaces outward around the loaded region, creating a low irregular rim/bulge and non-repeating wrinkles that radiate away from the head.
- Keep a soft attached contact-shadow band between head/neck/hair and pillow. No bright floating gap.
- Contact-side hair is flattened and spread across the pillowcase; only the spread edge, flyaways and highlight glints may resolve into individual strands. The free side follows gravity.
- Contact-side ear and cheek show mild soft-tissue pressure only: ear may fold/flatten and cheek may displace a few millimeters. Skull structure and identity geometry do not change.
- Supine: back of head sinks; cheek soft tissue settles slightly backward/outward; chin remains neutral unless the selected pose explicitly rotates the head.
- Side-lying: side of head sinks more deeply; lower ear/cheek compress into fabric; upper shoulder may meet the pillow edge when physically reachable.
- INVALID: a flat untouched pillow directly under/behind the head, a spherical head resting on top of fabric, or missing pillow deformation.

B) LYING FACE = SAME IDENTITY WITH GRAVITY/CONTACT SOFT-TISSUE RESPONSE
- Preserve bone structure, stable facial landmarks, eye spacing, nose geometry, lip-volume baseline, ears, hairline and beard pattern exactly.
- Supine: soft cheek tissue may settle slightly backward/outward, making the face read subtly wider/flatter than standing without changing the skull; jaw contour may look mildly softer from gravity and contact; faint skin gathering near temples/ears is permitted.
- Side-lying: lower cheek compresses slightly upward against the pillow while upper cheek falls subtly toward the nose. This natural asymmetry is contact physics, not identity drift.
- Expression remains a muscle-state change only. Gravity/contact may deform soft tissue locally but must never redesign the face.

C) BLANKET PHYSICS — WEIGHT + STIFFNESS + FRICTION
- The blanket drapes OVER the lower body and follows real hip/thigh/knee/shin/foot volume. It must not look painted onto the legs or shrink-wrapped to the body.
- Where knees, shins or feet push upward, the blanket may tent with straighter tension lines radiating from those load points. Between supports it sags into softer slack folds.
- A hand or forearm resting on the blanket creates a local depression, attached contact shadow and radiating micro-wrinkles proportional to pressure.
- Blanket position follows gravity, friction and body contact. A corner may slip naturally over the mattress edge; it never floats or clings like plastic.
- Folds remain irregular, load-driven and non-repeating. Fold shadow depth must communicate fabric weight and the selected light direction.

D) SHEET & MATTRESS RESPONSE
- Sheet areas immediately beside compressed zones become relatively taut with fine radiating wrinkles; unloaded areas keep random sleep wrinkles rather than decorative repeated patterns.
- Mattress visibly depresses beneath torso/hips/shoulders according to the pose. Soft side bulge is allowed around loaded regions, with a broad low-contrast deformation edge and attached shadow.
- Do not deform the entire mattress uniformly. Compression is local and load-driven.

FORBIDDEN
flat untouched pillow; head resting on top like a ball; standing-face geometry pasted onto a lying body with no soft-tissue gravity response; blanket painted onto legs; repeated blanket texture; floating blanket; plastic cling; missing contact shadows; decorative folds with no load source.`;

function selectedFreeHandBeddingContact() {
  if (typeof document === "undefined") return "";
  const id = document.querySelector("#freeHandActionSelect")?.value;
  if (id === "blanket_hold") {
    return `FREE-HAND / BLANKET COUPLING
- The selected free hand lightly pinches the real blanket edge. Gather fabric locally toward the pinch point; create small asymmetric tension wrinkles and an attached finger/fabric contact shadow. No clenched fist and no floating cloth.`;
  }
  if (id === "forearm_abdomen" || id === "abdomen_rest") {
    return `FREE-HAND / BLANKET COUPLING
- If the selected hand or forearm rests over the blanket, its weight creates a shallow local depression with short radiating wrinkles and a continuous contact shadow. If it rests directly on clothing instead, do not invent blanket underneath it.`;
  }
  if (id === "mattress_rest") {
    return `FREE-HAND / MATTRESS COUPLING
- The free hand loads the bedding only lightly: local surface compression and a small attached contact shadow are enough. Do not create an exaggerated crater or global mattress deformation.`;
  }
  if (id === "pillow_edge" || id === "beside_face_pillow") {
    return `FREE-HAND / PILLOW COUPLING
- The free hand touches only the pillow edge/nearby pillow surface. Show small local fill displacement and wrinkles at the hand contact without changing the primary head-compression zone.`;
  }
  return "";
}

function beddingBlock(pose = {}) {
  const variant = BEDDING_VARIANTS[pose?.id] || "";
  return `${BEDDING_PHYSICS_LOCK}\n\nTHIS POSE VARIANT\n${variant}${selectedFreeHandBeddingContact() ? `\n\n${selectedFreeHandBeddingContact()}` : ""}\n\nFINAL BEDDING GATE
- Head visibly loads and deforms the pillow.
- Hair, cheek/ear soft tissue, pillow, sheet, mattress and blanket all agree on the same gravity direction and support contacts.
- Blanket tension/sag is caused by the body or selected free-hand contact, never decorative styling.
- If exact bedding continuity conflicts with a wider composition, keep the physics correct and show less bedding/background.
- One real body, one real bed, one coherent load solution. CAPTURED, NOT RENDERED.`;
}

function patchPromptEngine() {
  const proto = PromptEngine?.prototype;
  if (!proto || proto[patchFlag] || typeof proto.generate !== "function") return;
  const originalGenerate = proto.generate;

  proto.generate = function generateWithBeddingPhysics(config = {}) {
    const raw = originalGenerate.call(this, config);
    if (typeof raw !== "string" || !BED_POSE_IDS.has(config?.pose?.id)) return raw;
    return `${raw}\n\n${beddingBlock(config.pose)}`.trim();
  };

  proto[patchFlag] = true;
}

patchPromptEngine();
