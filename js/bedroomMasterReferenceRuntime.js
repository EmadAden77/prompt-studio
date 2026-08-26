import { PromptEngine } from "./engines/promptEngine.js";

const ROOM_REFERENCES = Object.freeze({
  master: Object.freeze({ id: "ROOM-R1", label: "MASTER ROOM OVERVIEW", filename: "1000204808.png", role: "global room topology, furniture positions, scale, walls, ceiling, floor, curtains, bed, sofa, wardrobe, dresser, rug and circulation space" }),
  bedSide: Object.freeze({ id: "ROOM-R2", label: "BED SIDE REFERENCE", filename: "1000206620.jpg", role: "side-of-bed geometry, mattress/pillow/headboard contact, nearby floor, curtains and wardrobe edge" }),
  bedFront: Object.freeze({ id: "ROOM-R3", label: "BED FRONT REFERENCE", filename: "1000206395.jpg", role: "front bed proportions, headboard, AC, both bedside zones, floor clearance and bed-centered landmark geometry" }),
  sofaBed: Object.freeze({ id: "ROOM-R4", label: "SOFA + BED SPATIAL REFERENCE", filename: "1000206404.jpg", role: "sofa-to-bed relationship, rug, bedside table, curtains, AC and floor depth" }),
  wardrobe: Object.freeze({ id: "ROOM-R5", label: "WARDROBE + DRESSER REFERENCE", filename: "1000206753.jpg", role: "wardrobe doors/panels/shelves, dresser, chair, rug and their exact spatial relationship to the bed" }),
  dresserClose: Object.freeze({ id: "ROOM-R6", label: "DRESSER / MIRROR CLOSE REFERENCE", filename: "1000206523.jpg", role: "dresser geometry, mirror frame, drawer layout, top clutter and physically correct reflected bed/lamp region" })
});

const TEMPLATE_REFERENCE_KEYS = Object.freeze({
  bed_v2_right_close: ["bedSide", "bedFront"],
  bed_v2_back_close: ["bedFront", "bedSide"],
  bed_v2_semi_headboard: ["bedSide", "bedFront"],
  bed_v2_edge_candid: ["bedFront", "master"],
  bed_v2_floor_rug: ["master", "sofaBed"],
  bed_v2_bedside_stand: ["master", "bedFront"],
  bed_v2_center_stand: ["master"],
  bed_v2_wardrobe_pause: ["wardrobe", "master"],
  bed_v2_dresser_pause: ["dresserClose", "wardrobe"]
});

function activeTemplateId() {
  if (typeof document === "undefined") return null;
  return document.documentElement.dataset.activeBedroomTemplate || document.documentElement.dataset.activeTemplateHub || null;
}

function referencesForTemplate(templateId) {
  const keys = TEMPLATE_REFERENCE_KEYS[templateId] ?? ["master"];
  return keys.map((key) => ROOM_REFERENCES[key]).filter(Boolean);
}

function roomReferenceBlock(templateId) {
  const selected = referencesForTemplate(templateId);
  const lines = selected.map((ref, index) => `${index + 1}. ${ref.id} — ${ref.label} — file: ${ref.filename}\n   Authority: ${ref.role}.`).join("\n");
  const labels = selected.map((ref) => ref.id).join(" + ");
  return `BEDROOM REFERENCE SET — HIGHEST ROOM AUTHORITY\n- IMAGE A is the SOLE PERSON IDENTITY reference. It controls face/head identity only and must never control bedroom geometry, lighting, pose, clothing or camera viewpoint.\n- The bedroom is controlled ONLY by the selected ROOM REFERENCES listed below. They depict the SAME physical bedroom from complementary real viewpoints.\n- Internal scene/zone metadata is planning metadata only. It contributes ZERO visual appearance and is never an additional room reference.\n\nSELECTED ROOM REFERENCES FOR THIS TEMPLATE\n${lines}\n\nMULTI-VIEW CONSISTENCY LOCK\n- Treat ${labels} as calibrated observations of ONE immutable room, not alternative room designs.\n- Reconcile them through shared landmarks: bed, black padded headboard, bedside table/lamp, sofa, rug, wardrobe, dresser, chair, curtains, AC, ceiling geometry, tile direction and visible clutter.\n- Never average, blend, redesign, mirror, clean, simplify or restyle the room.\n- A room element visible in one selected room reference and occluded in another remains the same physical element. Occlusion never authorizes replacement.\n- If selected references disagree because of viewpoint, perspective, exposure or temporary occlusion, preserve physical geometry and use the viewpoint that directly observes the relevant surface.\n- For every requested pose, use the MINIMUM selected room references needed by the visible crop. Do not import geometry from non-selected bedroom images.\n- Unsupported hidden geometry must remain cropped, occluded, dark or out of frame. Cropping beats hallucination.\n\nROOM LANDMARK FREEZE\n- Bed location/orientation, headboard dimensions, mattress scale, sofa location, rug bounds, wardrobe panel spacing, dresser position, chair position, curtain walls, AC placement, ceiling recesses and tile grid remain fixed.\n- Lighting may change illumination only. It never changes furniture, architecture, materials, clutter or scale.\n- Reflection changes are view-dependent only; mirror frame and dresser remain fixed.\n\nIDENTITY / ROOM SEPARATION\n- IMAGE A = identity authority only.\n- ROOM-R1..ROOM-R6 = room authority only.\n- Never transfer the room-reference person's absence/presence, camera holder, exposure or capture pose into identity.\n- Never transfer IMAGE A background or lighting into the room.\n\nFINAL ROOM GATE\nReject the result if it merely resembles the room rather than matching it: changed wardrobe, changed dresser, changed headboard, moved sofa, different rug, invented furniture, altered wall lengths, changed curtain placement, different AC location, reordered clutter, impossible mirror reflection, or generic hotel-bedroom reconstruction.`;
}

const originalGenerate = PromptEngine.prototype.generate;

PromptEngine.prototype.generate = function generateBedroomReferenceSet(config) {
  let prompt = originalGenerate.call(this, config);
  const templateId = activeTemplateId();
  const selectedRefs = referencesForTemplate(templateId);
  const roomSetLabel = selectedRefs.map((ref) => `${ref.id} (${ref.filename})`).join(", ");

  prompt = prompt
    .replaceAll("MASTER REFERENCE", "IMAGE A")
    .replaceAll("IMAGE B", "SELECTED ROOM REFERENCE SET")
    .replaceAll("the user-selected built-in room reference", "the internally selected spatial-zone metadata")
    .replaceAll("IMAGE A controls stable identity geometry and the immutable bedroom.", "IMAGE A controls stable identity geometry only; the selected ROOM REFERENCES control the immutable bedroom.")
    .replaceAll("IMAGE A controls the exact same room", "The selected ROOM REFERENCES control the exact same room")
    .replaceAll("IMAGE A controls the same room", "The selected ROOM REFERENCES control the same room")
    .replaceAll("The setting is exactly the bedroom visible in IMAGE A", "The setting is exactly the bedroom jointly observed by the selected ROOM REFERENCES")
    .replaceAll("ROOM GEOMETRY AUTHORITY: Use the attached IMAGE A as the sole visual room authority.", `ROOM GEOMETRY AUTHORITY: Use only ${roomSetLabel} as the visual room authority.`)
    .replaceAll("Exactly ONE attached image is used", "Use IMAGE A for identity plus only the template-selected ROOM REFERENCES")
    .replaceAll("IMAGE A is simultaneously the sole visual authority for the real subject identity AND the exact bedroom geometry/environment.", "IMAGE A is the sole identity authority. Bedroom geometry/environment comes only from the selected ROOM REFERENCES.")
    .replaceAll("FACE IDENTITY ZONE of IMAGE A", "face/head identity region of IMAGE A")
    .replaceAll("bedroom from the same IMAGE A", "bedroom from the selected ROOM REFERENCES")
    .replaceAll("same IMAGE A", "selected ROOM REFERENCES")
    .replaceAll("in IMAGE A", "in the selected ROOM REFERENCES");

  prompt = prompt.replace(
    /NEGATIVE PROMPT\n/,
    "NEGATIVE PROMPT\ndifferent room, similar-but-not-identical bedroom, semantic room reconstruction, generic hotel bedroom, averaged multi-reference room, blended furniture, changed wardrobe, changed dresser, changed headboard, moved sofa, changed rug, invented furniture, altered wall geometry, changed curtain placement, changed AC position, reordered clutter, unsupported hidden geometry, impossible mirror reflection, "
  );

  return `${roomReferenceBlock(templateId)}\n\n${prompt}`;
};

function installReferenceSetUI() {
  if (typeof document === "undefined") return;

  const eyebrow = document.querySelector(".intro .eyebrow");
  const title = document.querySelector("#pageTitle");
  const intro = title?.nextElementSibling;
  const badge = document.querySelector("#modeHint");
  if (eyebrow) eyebrow.textContent = "SMART QUAD MODE · IDENTITY + MULTI-VIEW ROOM SET";
  if (title) title.textContent = "هوية مستقلة + مراجع غرفة متخصصة لكل وضعية";
  if (intro) intro.textContent = "ارفع صورة الهوية في IMAGE A. كل قالب يحدد تلقائيًا أي مراجع من مجموعة الغرفة الجديدة يجب إرفاقها، ولا يستخدم بقية الصور.";
  if (badge) badge.textContent = "مراجع انتقائية";

  const heading = document.querySelector('[data-upload="imageA"] .upload-card__heading strong');
  const sub = document.querySelector('[data-upload="imageA"] .upload-card__heading span');
  const emptyStrong = document.querySelector('#imageADropzone .dropzone__empty strong');
  const hint = document.querySelector('[data-upload="imageA"] .upload-card__hint');
  if (heading) heading.textContent = "IMAGE A — IDENTITY";
  if (sub) sub.textContent = "هوية الشخص فقط";
  if (emptyStrong) emptyStrong.textContent = "ارفع صورة الهوية الواضحة";
  if (hint) hint.textContent = "IMAGE A تحفظ الوجه، الشعر، اللحية، البشرة والعمر الظاهري فقط. الغرفة لا تؤخذ منها إطلاقًا.";

  const send = document.querySelector("#sendInstruction");
  if (send) {
    const templateId = activeTemplateId();
    const refs = referencesForTemplate(templateId);
    send.innerHTML = `أرفق <strong>IMAGE A</strong> للهوية، ثم أرفق فقط مراجع الغرفة المطلوبة للقالب: <strong>${refs.map((ref) => `${ref.id} — ${ref.filename}`).join(" + ")}</strong>.<br>لا ترفق أي صورة غرفة أخرى.`;
  }

  const sceneNote = document.querySelector(".scene-card__automatic-note");
  if (sceneNote) sceneNote.textContent = "هذه البطاقة خريطة تفاعل داخلية فقط. السلطة المرئية للغرفة تأتي من مجموعة المراجع الجديدة التي يحددها القالب.";

  const refresh = () => {
    if (!send) return;
    const refs = referencesForTemplate(activeTemplateId());
    send.innerHTML = `أرفق <strong>IMAGE A</strong> للهوية، ثم أرفق فقط مراجع الغرفة المطلوبة للقالب: <strong>${refs.map((ref) => `${ref.id} — ${ref.filename}`).join(" + ")}</strong>.<br>لا ترفق أي صورة غرفة أخرى.`;
  };
  document.addEventListener("change", (event) => {
    if (event.target?.matches?.("[data-bedroom-template-select], #templateSelect")) requestAnimationFrame(refresh);
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installReferenceSetUI, { once: true });
  else installReferenceSetUI();
}
