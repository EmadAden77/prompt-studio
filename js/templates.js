import { SCENES } from "./data/scenesData.js";
import { LIGHTING_OPTIONS } from "./data/lightingData.js";
import { CLOTHING_OPTIONS } from "./data/clothingData.js";
import { EXPRESSION_OPTIONS } from "./data/expressionsData.js";
import { HAIR_OPTIONS } from "./data/hairData.js";
import { POSES } from "./data/posesData.js";
import { showToast } from "./ui/dom.js";

export const TEMPLATE_GROUP_LABELS = Object.freeze({
  bed: "🛏️ قوالب السرير",
  sitting: "🛋️ قوالب الجلوس",
  standing: "🧍 قوالب الوقوف",
  mirror: "🪞 قوالب المرآة"
});

const preset = (id, group, name_ar, poseId, expressionId, hairId, clothingId, lightingIds, aspect = "9:16", extras = {}) =>
  Object.freeze({
    id,
    group,
    name_ar,
    poseId,
    expressionId,
    hairId,
    clothingId,
    lightingIds: Object.freeze(lightingIds),
    aspect,
    ...extras
  });

const standingBlock = (pose, grounding, arm, camera) => `STANDING TEMPLATE — SELECTED PRESET ONLY\nPOSE: ${pose}\nGROUNDING: ${grounding}\nARM: ${arm}\nCAMERA: ${camera}`;

export const TEMPLATE_PRESETS = Object.freeze([
  preset("back_relaxed", "bed", "استلقاء على الظهر — طبيعي هادئ", "lying_back", "relaxed", "messy", "cotton_pajama", ["window_daylight", "ceiling_white", "lamp_and_phone", "phone_screen_only"]),
  preset("stomach_relaxed", "bed", "استلقاء على البطن — سيلفي طبيعي", "lying_stomach", "relaxed", "messy", "sleep_tee_shorts", ["window_daylight", "ceiling_white", "lamp_and_phone", "phone_screen_only"]),
  preset("right_side_warm", "bed", "الجانب الأيمن — إضاءة دافئة واقعية", "lying_right_side", "relaxed", "messy", "cotton_pajama", ["lamp_only", "lamp_and_phone", "phone_screen_only"]),
  preset("left_side_lowlight", "bed", "الجانب الأيسر — إضاءة هاتف خافتة", "lying_left_side", "relaxed", "messy", "cotton_pajama", ["phone_screen_only"]),
  preset("semi_reclining_home", "bed", "نصف استلقاء — منزلي عفوي", "semi_reclining", "serious", "same", "thermal_sleep", ["lamp_and_phone", "ceiling_warm", "ceiling_white", "phone_screen_only"]),
  preset("bed_edge_casual", "bed", "حافة السرير — كاجوال طبيعي", "sitting_bed_edge", "serious", "neat", "heather_tee_jeans", ["window_daylight", "ceiling_white", "lamp_and_phone", "phone_screen_only"]),
  preset("sofa_casual", "sitting", "الأريكة — كاجوال نهاري", "sitting_sofa", "relaxed", "same", "heather_tee_jeans", ["window_daylight", "overcast_flat", "phone_screen_only"]),
  preset("chair_neat", "sitting", "الكرسي — مرتب داخلي", "sitting_chair", "serious", "neat", "oxford_shirt_chino", ["ceiling_white", "phone_screen_only"]),
  preset("floor_relaxed", "sitting", "الأرض — جلسة عفوية", "sitting_floor", "relaxed", "messy", "hoodie_sweats", ["window_daylight", "ceiling_white", "phone_screen_only"]),

  preset("standing_center_relaxed", "standing", "وسط الغرفة — وقوف طبيعي هادئ", "standing_center", "relaxed", "same", "longsleeve_chino", ["ceiling_white", "overcast_flat", "phone_screen_only"], "9:16", {
    promptBlock: standingBlock(
      "standing in the center of the room, torso generally facing the camera with relaxed natural asymmetry rather than a rigid squared stance.",
      "Both feet are flat with contact shadows hugging the sole lines; weight shifts slightly toward one leg in a natural contrapposto; shoulders remain relaxed and mildly uneven; garments hang vertically with gravity-driven drape.",
      "The selfie hand holds the phone at face level 45–60 cm away with a softly bent elbow; the free hand hangs naturally or rests in a pocket.",
      "Eye level around 1.5 m; upper body with the room readable behind; vertical room lines remain nearly vertical with only mild wide-angle convergence."
    )
  }),
  preset("standing_bedside_hand_rest", "standing", "بجانب السرير — يد على المرتبة", "standing_bedside", "relaxed", "same", "heather_tee_jeans", ["lamp_and_phone", "ceiling_white", "phone_screen_only"], "9:16", {
    requiresAll: ["bed", "mattress_edge"],
    promptBlock: standingBlock(
      "standing beside the bed with the torso angled slightly toward it.",
      "Both feet remain flat with floor contact shadows. The non-selfie palm rests on the real mattress edge with natural finger spread and slight skin pressure; the mattress dips only minimally under the hand, with no interpenetration. Most body weight remains on the farther leg rather than being transferred into the bed.",
      "The selfie hand holds the phone at 45–60 cm; the opposite hand is the real mattress-support hand.",
      "Eye level; the bed, pillow, and bedside area frame one side of the body while room depth remains readable."
    )
  }),
  preset("standing_sofa_rest", "standing", "عند الأريكة — ارتكاز مريح", "standing_sofa", "relaxed", "same", "heather_tee_jeans", ["window_daylight", "overcast_flat", "phone_screen_only"], "9:16", {
    requiresAll: ["sofa"],
    requiresAny: ["sofa_armrest", "sofa_back"],
    promptBlock: standingBlock(
      "standing beside the sofa with a small relaxed lean toward it.",
      "The support forearm rests on one real visible sofa support surface, either the armrest or the top of the backrest, never both at once. Contact causes only slight local cushion compression and a soft contact shadow. Ankles may cross lightly or one foot may stand slightly forward; the opposite shoulder sits a little lower in relaxed asymmetry.",
      "The RIGHT hand holds the phone at 45–60 cm; the LEFT forearm is the support arm.",
      "Eye level; the sofa and cushions frame one side with natural room depth behind."
    )
  }),
  preset("standing_wardrobe_choose", "standing", "عند الدولاب — اختيار ملابس", "standing_wardrobe", "serious", "neat", "thobe", ["ceiling_white", "phone_screen_only"], "9:16", {
    requiresAll: ["wardrobe", "wardrobe_doors"],
    cameraOverride: Object.freeze({
      holdingHand: "LEFT",
      otherHand: "RIGHT",
      distance: "45–60 cm",
      angle: "eye level around 1.5 m with the wardrobe remaining readable behind or beside the subject",
      tilt: "small natural handheld roll only",
      armVisual: "The LEFT selfie arm reaches face level with a relaxed elbow while the RIGHT hand interacts with a visible wardrobe door edge or real handle only if one is actually visible."
    }),
    promptBlock: standingBlock(
      "standing at the wardrobe as if choosing clothes, head turned toward the phone.",
      "Both feet stay flat with sole-hugging contact shadows. The RIGHT hand reaches a visible wardrobe door edge, or an actual handle only when IMAGE B visibly contains one; fingers curl naturally with mild grip tension and the raised shoulder lifts slightly. Never invent a handle or change the door state.",
      "The LEFT hand is the selfie hand at 45–60 cm; the RIGHT hand is the wardrobe-interaction hand.",
      "Eye level; the wardrobe doors and their real material fill one side of the background while vertical edges remain physically straight."
    )
  }),
  preset("standing_wall_lean", "standing", "اتكاء على الجدار — ليلي هادئ", "standing_center", "serious", "neat", "hoodie_sweats", ["phone_screen_only", "ceiling_white"], "9:16", {
    requiresAll: ["full_room_overview"],
    promptBlock: standingBlock(
      "standing with the shoulder and upper back leaning lightly against a visible wall plane.",
      "A soft contact shadow sits directly behind the loaded shoulder and upper back. The main standing foot carries body weight with a firm floor shadow; the other leg may cross lightly or bend with only the toe touching nearby. Clothing compresses subtly at the leaning shoulder. Do not force a shoe sole flat against the wall.",
      "The phone remains 45–60 cm away; the free arm hangs low, rests in a pocket, or crosses loosely.",
      "Eye level or only slightly below; a real wall plane occupies one side and room depth stays readable behind."
    )
  }),
  preset("standing_low_angle_power", "standing", "وقوف منخفض الزاوية — حضور قوي", "standing_center", "confident", "neat", "oxford_shirt_chino", ["ceiling_white", "phone_screen_only"], "9:16", {
    requiresCameraAngle: "low_angle",
    cameraOverride: Object.freeze({
      holdingHand: "RIGHT",
      otherHand: "LEFT",
      distance: "45–60 cm",
      angle: "a reachable chest-to-waist-level front-camera position pointing upward about 30–40 degrees toward the face",
      tilt: "small natural handheld roll only",
      armVisual: "The RIGHT selfie arm holds the phone below face level within normal reach; the LEFT arm rests naturally at the side or on the hip."
    }),
    promptBlock: standingBlock(
      "standing tall with the chin tipped slightly down toward the lens.",
      "Both feet are planted in a natural stance; the body casts a floor shadow consistent with the selected light; hems hang straight with realistic gravity-driven drape.",
      "The RIGHT hand holds the phone at chest or waist level 45–60 cm away, pointing upward about 30–40 degrees; the free arm hangs naturally or rests on the hip.",
      "Low-angle selfie looking upward. Natural perspective may broaden the shoulders slightly; a ceiling edge may enter the top of frame; vertical lines converge mildly upward from the wide lens only, without architectural bending."
    )
  }),
  preset("standing_phone_above_head", "standing", "الهاتف فوق الرأس — منظور علوي", "standing_center", "relaxed", "same", "longsleeve_chino", ["ceiling_white", "overcast_flat"], "9:16", {
    requiresCameraAngle: "high_angle",
    cameraOverride: Object.freeze({
      holdingHand: "RIGHT",
      otherHand: "LEFT",
      distance: "55–75 cm",
      angle: "a physically reachable front-camera position raised above the head and pitched downward about 30–45 degrees",
      tilt: "small natural handheld roll only",
      armVisual: "The RIGHT selfie arm extends upward with the elbow near-straight but not locked; the LEFT hand stays in a pocket or by the thigh."
    }),
    promptBlock: standingBlock(
      "standing naturally while raising the phone above the head.",
      "Both feet remain grounded and readable near the lower frame with individual floor contact shadows. The body tapers downward through natural foreshortening and clothing falls close to the legs.",
      "The RIGHT selfie arm extends upward with the elbow near-straight but unlocked; the free LEFT hand rests in a pocket or by the thigh.",
      "Camera looks downward about 30–45 degrees. Face sits near the upper third; floor, feet, and lower room remain readable below. Distortion is mild and restricted to outer frame regions; face and phone hand stay sharp."
    )
  }),
  preset("standing_window_sidelight", "standing", "بجانب النافذة — ضوء جانبي", "standing_center", "serious", "same", "oxford_shirt_chino", ["window_daylight", "golden_hour"], "9:16", {
    requiresAll: ["daylight_access"],
    promptBlock: standingBlock(
      "standing roughly 1–1.5 m from the real daylight access, torso angled and face turned toward the camera.",
      "Directional daylight models the face into a brighter plane and a naturally darker plane according to the real source direction; the floor shadow extends opposite the source. A mild natural squint is allowed. Light rakes across fabric texture without changing the garment.",
      "Use the physically reachable selfie hand that keeps the phone clear of the window-side body contour; the free arm hangs naturally or rests in a pocket.",
      "Eye level; only show a window frame or curtain edge if it is actually visible in IMAGE B. Never invent a new window to justify the lighting."
    )
  }),
  preset("standing_walk_pause", "standing", "خطوة متوقفة — لقطة عفوية", "standing_center", "relaxed", "same", "heather_tee_jeans", ["overcast_flat", "window_daylight", "ceiling_white"], "9:16", {
    promptBlock: standingBlock(
      "paused during a very small step as if he has just noticed the phone camera, not performing a large walking stride.",
      "The front foot is flat with a full contact shadow; the rear heel lifts slightly with a small real shadow gap underneath. The interrupted step creates mild natural shoulder asymmetry while balance remains stable.",
      "The selfie hand remains raised at face level within 45–60 cm; the free arm pauses naturally near the thigh as if interrupted mid-swing.",
      "Eye level with a candid snapshot feel and room depth behind. Face and phone hand remain sharp; only minimal motion softness may affect genuinely loose hair or a moving clothing edge."
    )
  }),

  preset("mirror_classic", "mirror", "مرآة التسريحة — كلاسيكي واقعي", "mirror_selfie", "confident", "neat", "thobe", ["ceiling_white"])
]);

export const TEMPLATE_BY_ID = Object.freeze(Object.fromEntries(TEMPLATE_PRESETS.map((item) => [item.id, item])));

const LIGHTING_BY_ID = Object.freeze(Object.fromEntries(LIGHTING_OPTIONS.map((item) => [item.id, item])));
const POSE_IDS = new Set(POSES.map((item) => item.id));
const EXPRESSION_IDS = new Set(EXPRESSION_OPTIONS.map((item) => item.id));
const HAIR_IDS = new Set(HAIR_OPTIONS.map((item) => item.id));
const CLOTHING_IDS = new Set(CLOTHING_OPTIONS.map((item) => [item.id, item]).map(([id]) => id));

export function isLightingSupportedByScene(lightingId, scene) {
  const lighting = LIGHTING_BY_ID[lightingId];
  return Boolean(lighting && scene && (lighting.required_features ?? []).every((feature) => scene.visible_features.includes(feature)));
}

export function resolveTemplateLighting(template, scene) {
  if (!template || !scene) return null;
  return template.lightingIds.find((lightingId) => isLightingSupportedByScene(lightingId, scene)) ?? null;
}

export function sceneSupportsTemplateRequirements(template, scene) {
  if (!template || !scene) return false;
  const features = new Set(scene.visible_features ?? []);
  if ((template.requiresAll ?? []).some((feature) => !features.has(feature))) return false;
  if ((template.requiresAny ?? []).length && !(template.requiresAny ?? []).some((feature) => features.has(feature))) return false;
  if (template.requiresCameraAngle && !(scene.camera_angles ?? []).includes(template.requiresCameraAngle)) return false;
  return true;
}

export function isTemplateCompatibleWithScene(template, scene) {
  return Boolean(
    template
    && scene
    && scene.supported_poses.includes(template.poseId)
    && sceneSupportsTemplateRequirements(template, scene)
    && resolveTemplateLighting(template, scene)
  );
}

export function validateTemplatePreset(template) {
  return Boolean(
    template
    && TEMPLATE_GROUP_LABELS[template.group]
    && POSE_IDS.has(template.poseId)
    && EXPRESSION_IDS.has(template.expressionId)
    && HAIR_IDS.has(template.hairId)
    && CLOTHING_IDS.has(template.clothingId)
    && Array.isArray(template.lightingIds)
    && template.lightingIds.length
    && template.lightingIds.every((id) => Boolean(LIGHTING_BY_ID[id]))
    && ["9:16", "1:1", "16:9"].includes(template.aspect)
    && (!template.cameraOverride || (template.cameraOverride.holdingHand && template.cameraOverride.otherHand && template.cameraOverride.distance && template.cameraOverride.angle))
  );
}

function setActiveTemplate(id = "custom") {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.activeTemplate = id;
}

function setSelectValue(id, value) {
  const select = document.querySelector(`#${id}`);
  if (!select || ![...select.options].some((option) => option.value === value)) return false;
  select.value = value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function currentSceneFromUI() {
  const filename = document.querySelector("#sceneFilename")?.textContent?.trim();
  if (!filename || filename === "—") return null;
  return SCENES.find((scene) => scene.image_filename === filename) ?? null;
}

function initTemplateControl() {
  const templateSelect = document.querySelector("#templateSelect");
  const sceneFilename = document.querySelector("#sceneFilename");
  if (!templateSelect || !sceneFilename) return;

  let applyingTemplate = false;
  let lastSceneFilename = null;

  const populate = () => {
    const scene = currentSceneFromUI();
    lastSceneFilename = sceneFilename.textContent?.trim() ?? "";
    const fragment = document.createDocumentFragment();
    const customOption = document.createElement("option");
    customOption.value = "custom";
    customOption.textContent = scene ? "تخصيص يدوي" : "اختر مرجع الغرفة أولًا";
    fragment.appendChild(customOption);

    if (scene) {
      Object.entries(TEMPLATE_GROUP_LABELS).forEach(([groupId, label]) => {
        const presets = TEMPLATE_PRESETS.filter((template) => template.group === groupId && isTemplateCompatibleWithScene(template, scene));
        if (!presets.length) return;
        const group = document.createElement("optgroup");
        group.label = label;
        presets.forEach((template) => {
          const option = document.createElement("option");
          option.value = template.id;
          option.textContent = template.name_ar;
          group.appendChild(option);
        });
        fragment.appendChild(group);
      });
    }

    templateSelect.replaceChildren(fragment);
    templateSelect.value = "custom";
    templateSelect.disabled = !scene;
    setActiveTemplate("custom");
  };

  templateSelect.addEventListener("change", () => {
    if (templateSelect.value === "custom") {
      setActiveTemplate("custom");
      return;
    }
    const template = TEMPLATE_BY_ID[templateSelect.value];
    const scene = currentSceneFromUI();
    if (!template || !scene || !isTemplateCompatibleWithScene(template, scene)) {
      templateSelect.value = "custom";
      setActiveTemplate("custom");
      showToast("القالب غير متوافق مع مرجع الغرفة الحالي", "warning", 3600);
      return;
    }

    const lightingId = resolveTemplateLighting(template, scene);
    applyingTemplate = true;
    setActiveTemplate(template.id);
    const applied = [
      setSelectValue("poseSelect", template.poseId),
      setSelectValue("hairSelect", template.hairId),
      setSelectValue("lightingSelect", lightingId),
      setSelectValue("expressionSelect", template.expressionId),
      setSelectValue("clothingSelect", template.clothingId),
      setSelectValue("aspectSelect", template.aspect)
    ];
    applyingTemplate = false;

    if (!applied.every(Boolean)) {
      templateSelect.value = "custom";
      setActiveTemplate("custom");
      showToast("تعذر تطبيق القالب كاملًا على هذا المرجع", "error", 4200);
      return;
    }

    templateSelect.value = template.id;
    setActiveTemplate(template.id);
    document.querySelector("#rebuildBtn")?.click();
    showToast(`تم تطبيق القالب: ${template.name_ar}`, "success", 3600);
  });

  ["poseSelect", "hairSelect", "lightingSelect", "expressionSelect", "clothingSelect", "aspectSelect"].forEach((id) => {
    document.querySelector(`#${id}`)?.addEventListener("change", () => {
      if (!applyingTemplate) {
        templateSelect.value = "custom";
        setActiveTemplate("custom");
      }
    });
  });

  new MutationObserver(() => {
    const currentFilename = sceneFilename.textContent?.trim() ?? "";
    if (currentFilename !== lastSceneFilename) populate();
  }).observe(sceneFilename, { childList: true, characterData: true, subtree: true });

  populate();
}

if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", initTemplateControl);
