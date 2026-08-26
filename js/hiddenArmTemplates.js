import { SCENES } from "./data/scenesData.js";
import { showToast } from "./ui/dom.js";

const hiddenPreset = (id, group, name_ar, poseId, promptBlock, extras = {}) => Object.freeze({
  id,
  group,
  name_ar,
  poseId,
  aspect: "9:16",
  promptBlock,
  ...extras
});

const block = (title, composition, grounding, camera) => `HIDDEN-ARM SELFIE TEMPLATE — ${title}\nCOMPOSITION: ${composition}\nGROUNDING: ${grounding}\nCAMERA: ${camera}\nARM-HIDDEN REQUIREMENT: This remains a true subject-held front-camera selfie, but the entire phone-holding arm, wrist, hand, fingertips, and phone stay outside the finished image area. The crop hides them naturally; do not erase a visible limb or convert the shot into a third-person portrait.`;

export const HIDDEN_ARM_GROUP_LABELS = Object.freeze({
  standing: "🧍 وقوف بدون ظهور الذراع",
  sitting: "🛋️ جلوس بدون ظهور الذراع",
  bed: "🛏️ السرير بدون ظهور الذراع"
});

export const HIDDEN_ARM_TEMPLATE_PRESETS = Object.freeze([
  hiddenPreset("hidden_center_close", "standing", "وسط الغرفة — لقطة قريبة", "standing_center", block("CENTER CLOSE", "Head and upper torso, slightly off-center, close personal framing; room remains readable behind without becoming a wide room shot.", "Both feet are solved on the real floor before cropping; natural contrapposto and asymmetric shoulders remain visible in the torso.", "Reachable standing eye-level selfie, about 45–60 cm from the face; crop begins inside the selfie-side shoulder/upper-arm boundary so the holding arm never enters frame.")),
  hiddenPreset("hidden_center_chest", "standing", "وسط الغرفة — من الصدر للأعلى", "standing_center", block("CHEST-UP CENTER", "Chest-up portrait-like selfie with ordinary phone perspective, slight shoulder asymmetry, and modest negative space showing the real room.", "Full standing body remains physically solved even though only chest-up framing is visible.", "Eye level, 45–60 cm, mild handheld roll; phone and selfie arm stay just beyond one side of the crop.")),
  hiddenPreset("hidden_bedside_close", "standing", "بجانب السرير — قريب بدون ذراع", "standing_bedside", block("BEDSIDE CLOSE", "Head, shoulders, upper torso, and a readable strip of bed/pillow behind one side; no arm in frame.", "Feet remain grounded on the floor beside the bed; do not fake mattress support for the standing body.", "Eye-level arm-length selfie, 45–60 cm; crop excludes the phone-side arm entirely while keeping the bed context."), { requiresAll: ["bed", "mattress_edge"] }),
  hiddenPreset("hidden_bedside_half", "standing", "بجانب السرير — نصف جسم", "standing_bedside", block("BEDSIDE HALF BODY", "Waist-up framing beside the bed, torso angled mildly toward the mattress, background remains room-authentic.", "Weight stays on the floor with one leg carrying slightly more load; bed remains nearby geometry, not body support.", "Reachable eye-level selfie with a slightly wider crop than close mode; holding shoulder may be partially visible but no upper arm, elbow, forearm, wrist, hand, or phone enters frame."), { requiresAll: ["bed"] }),
  hiddenPreset("hidden_sofa_close", "standing", "عند الأريكة — لقطة قريبة", "standing_sofa", block("SOFA CLOSE", "Head and upper torso beside the sofa; cushions/backrest frame the lower-side background while the selfie arm stays completely outside crop.", "Both feet remain grounded; torso can lean subtly toward the sofa without floating or unsupported contact.", "Eye level, 45–60 cm, close phone perspective; crop away from the selfie arm while retaining sofa depth."), { requiresAll: ["sofa"] }),
  hiddenPreset("hidden_sofa_shoulder", "standing", "عند الأريكة — كتف أمامي", "standing_sofa", block("SOFA SHOULDER-LED", "One non-selfie shoulder sits slightly nearer the camera, creating candid depth; sofa remains readable behind.", "Standing balance remains on the real floor with natural shoulder/pelvis counter-rotation.", "Eye-level arm-length phone selfie; framing uses shoulder-led perspective to imply self-capture while the holding side stays beyond the frame edge."), { requiresAll: ["sofa"] }),
  hiddenPreset("hidden_wardrobe_close", "standing", "عند الدولاب — لقطة قريبة", "standing_wardrobe", block("WARDROBE CLOSE", "Head and upper torso with wardrobe material filling one background side; no hand or arm interaction is required.", "Feet remain flat and body stays slightly side-on so wardrobe geometry remains readable.", "Eye level, 45–60 cm; crop hides the selfie arm and phone completely; do not invent a photographer reflected in wardrobe surfaces."), { requiresAll: ["wardrobe"] }),
  hiddenPreset("hidden_wardrobe_half", "standing", "عند الدولاب — نصف جسم", "standing_wardrobe", block("WARDROBE HALF BODY", "Waist-up framing with wardrobe doors/sections behind; relaxed head turn toward lens.", "Full standing support solved on floor, mild weight shift, clothing hangs naturally.", "Eye-level subject-held selfie, modest wide-phone perspective, holding arm outside crop."), { requiresAll: ["wardrobe"] }),
  hiddenPreset("hidden_wall_lean_close", "standing", "اتكاء على الجدار — قريب", "standing_center", block("WALL LEAN CLOSE", "Close head-and-torso framing while shoulder/upper back lightly meets a real visible wall plane.", "Wall contact produces a soft contact shadow and localized garment compression; feet remain real floor supports.", "Eye level or only slightly below, 45–60 cm; selfie-side arm remains completely outside the image."), { requiresAll: ["full_room_overview"] }),
  hiddenPreset("hidden_low_angle_close", "standing", "زاوية منخفضة — بدون ذراع", "standing_center", block("LOW ANGLE HIDDEN ARM", "Upper torso and face from a low but reachable phone position; shoulders gain mild perspective emphasis, not fisheye deformation.", "Standing body remains fully grounded before crop; clothing follows gravity.", "Phone held below face/chest line, pitched upward about 20–30 degrees from reachable arm length; crop excludes the holding arm and phone.")),
  hiddenPreset("hidden_high_angle_close", "standing", "زاوية مرتفعة — بدون ذراع", "standing_center", block("HIGH ANGLE HIDDEN ARM", "Face and upper torso from a slightly raised phone viewpoint, with some floor/room context below.", "Feet and full body remain solved on floor before cropping; no floating body.", "Phone slightly above eye level, pitched down about 15–25 degrees at reachable arm length; arm remains beyond crop.")),
  hiddenPreset("hidden_walk_pause", "standing", "وقفة عفوية — بدون ذراع", "standing_center", block("WALK-PAUSE HIDDEN ARM", "Close candid framing during a tiny paused step; face sharp, slight body asymmetry, room readable behind.", "Front foot flat; rear heel may lift slightly with a real shadow gap; no large stride.", "Eye-level self-held phone at arm length; crop intentionally excludes the holding arm while preserving candid motion logic.")),

  hiddenPreset("hidden_sofa_seated_close", "sitting", "الأريكة — جلوس قريب", "sitting_sofa", block("SOFA SEATED CLOSE", "Head and torso with part of sofa seat/backrest visible enough to prove sitting; holding arm absent from frame.", "Seat cushion compresses under hips/back according to pose; feet remain supported on floor when visible.", "Real seated eye height, roughly 45–65 cm from face; crop excludes selfie-side arm, hand, and phone."), { requiresAll: ["sofa"] }),
  hiddenPreset("hidden_sofa_relaxed", "sitting", "الأريكة — استناد مريح", "sitting_sofa", block("SOFA RELAXED BACKREST", "Relaxed chest-up selfie with backrest and one cushion framing the body, slight natural slouch.", "Backrest/seat visibly carry weight with localized compression and contact shadows.", "Seated eye-height selfie, close personal perspective; selfie arm remains outside crop."), { requiresAll: ["sofa"] }),
  hiddenPreset("hidden_chair_close", "sitting", "الكرسي — جلوس قريب", "sitting_chair", block("CHAIR SEATED CLOSE", "Head and torso with chair back/frame visible; no visible selfie arm.", "Pelvis loads the chair seat; feet/knees remain physically supported according to the selected pose.", "Camera at seated eye height, 45–65 cm, crop hides holding arm and phone."), { requiresAll: ["chair"] }),
  hiddenPreset("hidden_chair_forward", "sitting", "الكرسي — ميل خفيف للأمام", "sitting_chair", block("CHAIR FORWARD LEAN", "Slight forward torso lean for candid intimacy; chair remains visible enough to prove support.", "Seat still carries pelvis; elbows are not invented as support unless visible and physically placed.", "Close seated selfie, eye height to slightly below, holding arm entirely outside frame."), { requiresAll: ["chair"] }),
  hiddenPreset("hidden_floor_close", "sitting", "الأرض — جلوس قريب", "sitting_floor", block("FLOOR SEATED CLOSE", "Head, torso, and enough leg/floor context to prove floor sitting; arm absent from image.", "Pelvis/legs contact the real floor with natural contact shadows and clothing pressure folds.", "Camera at true low seated height, not standing observer height; 45–65 cm from face with crop hiding the phone arm."), { requiresAll: ["floor"] }),
  hiddenPreset("hidden_bed_edge_close", "sitting", "حافة السرير — بدون ذراع", "sitting_bed_edge", block("BED EDGE SEATED CLOSE", "Head and upper torso with mattress edge visible enough to prove edge sitting; no selfie arm in crop.", "Upper thighs/seat load mattress edge with localized depression; feet remain on floor if pose requires them.", "Seated arm-length selfie, about 45–65 cm, crop excludes holding arm and phone."), { requiresAll: ["bed", "mattress_edge"] }),

  hiddenPreset("hidden_back_close", "bed", "استلقاء على الظهر — قريب بدون ذراع", "lying_back", block("LYING BACK CLOSE", "Face, head, shoulders, upper chest, pillow and nearby bedding only; no whole-bed composition.", "Head/pillow and back/mattress contacts remain visible and physically loaded.", "Phone above/near face at the mapped reachable supine distance; crop is arranged so the raised holding arm, hand, fingertips, and phone remain completely outside frame."), { requiresAll: ["bed", "pillow"] }),
  hiddenPreset("hidden_back_pillow", "bed", "الظهر — تركيز الوجه والمخدة", "lying_back", block("PILLOW CLOSE BACK", "Intimate face-and-pillow composition with only a small amount of upper torso and bedding.", "Pillow visibly deforms under the head; hair reacts to contact and gravity.", "Reachable overhead/front-camera selfie; no arm enters any edge of the image."), { requiresAll: ["pillow"] }),
  hiddenPreset("hidden_right_side_close", "bed", "الجانب الأيمن — قريب بدون ذراع", "lying_right_side", block("RIGHT SIDE CLOSE", "True right-side-lying close selfie with head, pillow, one shoulder, and nearby bedding; holding arm hidden outside crop.", "Right-side shoulder/hip and cheek/pillow contacts remain physically consistent with true lateral anatomy.", "Reachable side-lying phone position close to face; crop hides the upper selfie arm entirely rather than shortening or deleting anatomy."), { requiresAll: ["bed", "pillow"] }),
  hiddenPreset("hidden_left_side_close", "bed", "الجانب الأيسر — قريب بدون ذراع", "lying_left_side", block("LEFT SIDE CLOSE", "True left-side-lying close selfie with head, pillow, one shoulder, and nearby bedding; no visible selfie arm.", "Left-side shoulder/hip and cheek/pillow contacts remain consistent with true lateral anatomy.", "Reachable side-lying phone position; crop stays just inside the holding-side arm boundary so the arm never enters frame."), { requiresAll: ["bed", "pillow"] }),
  hiddenPreset("hidden_semi_recline_close", "bed", "نصف استلقاء — قريب بدون ذراع", "semi_reclining", block("SEMI-RECLINING CLOSE", "Chest-up relaxed selfie with headboard/pillows behind; phone arm absent from image.", "Pillows and mattress visibly carry upper-back/pelvis load with local compression.", "Reachable close selfie at the mapped reclined angle; frame excludes the holding arm and phone."), { requiresAll: ["bed", "pillow"] }),
  hiddenPreset("hidden_stomach_close", "bed", "على البطن — قريب بدون ذراع", "lying_stomach", block("STOMACH CLOSE", "Close face-and-upper-torso selfie while lying on the stomach; bedding fills near background; no phone arm visible.", "Chest/abdomen/pelvis and support elbow logic remain physically solved before framing.", "Reachable low/near-face phone viewpoint according to the pose map; holding arm remains fully beyond crop and is never confused with the support arm."), { requiresAll: ["bed"] })
]);

export const HIDDEN_ARM_TEMPLATE_BY_ID = Object.freeze(Object.fromEntries(HIDDEN_ARM_TEMPLATE_PRESETS.map((item) => [item.id, item])));

export function getActiveHiddenArmTemplate(pose = null) {
  if (typeof document === "undefined") return null;
  const id = document.documentElement.dataset.activeHiddenArmTemplate;
  const template = HIDDEN_ARM_TEMPLATE_BY_ID[id];
  if (!template) return null;
  if (pose && template.poseId !== pose.id) return null;
  return template;
}

function currentSceneFromUI() {
  if (typeof document === "undefined") return null;
  const filename = document.querySelector("#sceneFilename")?.textContent?.trim();
  return SCENES.find((scene) => scene.image_filename === filename) ?? null;
}

function compatible(template, scene) {
  if (!template || !scene || !scene.supported_poses.includes(template.poseId)) return false;
  const features = new Set(scene.visible_features ?? []);
  return !(template.requiresAll ?? []).some((feature) => !features.has(feature));
}

function setSelectValue(id, value) {
  const select = document.querySelector(`#${id}`);
  if (!select || ![...select.options].some((option) => option.value === value)) return false;
  select.value = value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function setHiddenMode(template = null) {
  document.documentElement.dataset.activeHiddenArmTemplate = template?.id ?? "custom";
  const armPerspective = document.querySelector("#armPerspectiveSelect");
  if (armPerspective) {
    armPerspective.disabled = Boolean(template);
    armPerspective.title = template ? "قالب بدون ظهور الذراع يتحكم بالقص تلقائيًا" : "";
  }
}

function installHiddenArmControl() {
  const form = document.querySelector("#optionsForm");
  const regularTemplate = document.querySelector("#templateSelect");
  const sceneFilename = document.querySelector("#sceneFilename");
  if (!form || !sceneFilename || document.querySelector("#hiddenArmTemplateSelect")) return;

  const field = document.createElement("div");
  field.className = "field field--wide";
  field.dataset.hiddenArmTemplates = "true";
  const label = document.createElement("label");
  label.htmlFor = "hiddenArmTemplateSelect";
  label.textContent = "قوالب سيلفي بدون ظهور الذراع";
  const select = document.createElement("select");
  select.id = "hiddenArmTemplateSelect";
  select.name = "hiddenArmTemplate";
  const help = document.createElement("small");
  help.textContent = "خانة مستقلة للتكوين فقط. القالب يخفي الذراع والهاتف خارج الإطار مع الحفاظ على منظور سيلفي حقيقي؛ الملابس والتعبير والإضاءة والشعر تبقى من اختيارك.";
  field.append(label, select, help);

  const regularField = regularTemplate?.closest(".field");
  if (regularField?.nextSibling) regularField.parentNode.insertBefore(field, regularField.nextSibling);
  else form.prepend(field);

  let applying = false;
  let lastScene = "";

  const populate = () => {
    const scene = currentSceneFromUI();
    lastScene = sceneFilename.textContent?.trim() ?? "";
    const fragment = document.createDocumentFragment();
    const off = document.createElement("option");
    off.value = "custom";
    off.textContent = scene ? "غير مفعّل — استخدم القوالب العادية" : "اختر مرجع الغرفة أولًا";
    fragment.appendChild(off);
    if (scene) {
      Object.entries(HIDDEN_ARM_GROUP_LABELS).forEach(([groupId, groupLabel]) => {
        const items = HIDDEN_ARM_TEMPLATE_PRESETS.filter((item) => item.group === groupId && compatible(item, scene));
        if (!items.length) return;
        const group = document.createElement("optgroup");
        group.label = groupLabel;
        items.forEach((item) => {
          const option = document.createElement("option");
          option.value = item.id;
          option.textContent = item.name_ar;
          group.appendChild(option);
        });
        fragment.appendChild(group);
      });
    }
    select.replaceChildren(fragment);
    select.value = "custom";
    select.disabled = !scene;
    setHiddenMode(null);
  };

  select.addEventListener("change", () => {
    if (select.value === "custom") {
      setHiddenMode(null);
      document.querySelector("#rebuildBtn")?.click();
      return;
    }
    const template = HIDDEN_ARM_TEMPLATE_BY_ID[select.value];
    const scene = currentSceneFromUI();
    if (!template || !compatible(template, scene)) {
      select.value = "custom";
      setHiddenMode(null);
      showToast("قالب السيلفي بدون ذراع غير متوافق مع مرجع الغرفة الحالي", "warning", 3600);
      return;
    }
    applying = true;
    if (regularTemplate) {
      regularTemplate.value = "custom";
      regularTemplate.dispatchEvent(new Event("change", { bubbles: true }));
    }
    const poseApplied = setSelectValue("poseSelect", template.poseId);
    const aspectApplied = setSelectValue("aspectSelect", template.aspect);
    applying = false;
    if (!poseApplied || !aspectApplied) {
      select.value = "custom";
      setHiddenMode(null);
      showToast("تعذر تطبيق قالب السيلفي بدون ذراع على هذا المرجع", "error", 4200);
      return;
    }
    select.value = template.id;
    setHiddenMode(template);
    document.querySelector("#rebuildBtn")?.click();
    showToast(`تم تطبيق: ${template.name_ar} — الملابس والتعبير والإضاءة والشعر لم تتغير`, "success", 4200);
  });

  ["poseSelect", "aspectSelect"].forEach((id) => {
    document.querySelector(`#${id}`)?.addEventListener("change", () => {
      if (!applying && select.value !== "custom") {
        select.value = "custom";
        setHiddenMode(null);
      }
    });
  });

  new MutationObserver(() => {
    const current = sceneFilename.textContent?.trim() ?? "";
    if (current !== lastScene) populate();
  }).observe(sceneFilename, { childList: true, characterData: true, subtree: true });

  populate();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installHiddenArmControl, { once: true });
  else installHiddenArmControl();
}
