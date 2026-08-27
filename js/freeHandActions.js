import "./beddingPhysicsRuntime.js";
import "./expressionCatalogRuntime.js";
import { PromptEngine } from "./engines/promptEngine.js";

const patchFlag = Symbol.for("promptStudio.freeHandActions.patched");

function familyFromPoseId(id = "") {
  if (id.startsWith("standing")) return "standing";
  if (id.startsWith("sitting")) return "sitting";
  return "bed";
}

function sceneAwareCandidates(config = {}) {
  const pose = config.pose || {};
  const poseId = pose.id || config.poseId || "";
  const family = familyFromPoseId(poseId);
  const placement = pose.placement || config.scene?.region || config.scene?.id || "";

  if (family === "bed") {
    if (poseId === "lying_right_side" || poseId === "lying_left_side") {
      return [
        "rest the free hand softly on the blanket near the abdomen or hip",
        "rest the palm or ulnar edge on the mattress in front of the torso",
        "place the hand on the pillow beside the face without supporting or reshaping the cheek",
        "lightly hold a naturally reachable blanket edge with a simple relaxed grip",
        "leave the hand partly occluded by bedding when that produces the cleanest anatomy"
      ];
    }
    if (poseId === "lying_back") {
      return [
        "rest the palm on the upper abdomen or lower chest over clothing or bedding",
        "lay the forearm loosely across the abdomen",
        "rest the hand on the mattress beside the torso",
        "lightly hold or touch the blanket edge when it already crosses the body",
        "allow the hand to fall partly outside the crop if showing it would force awkward reach"
      ];
    }
    if (poseId === "lying_stomach") {
      return [
        "rest the free forearm naturally on the mattress beside or below the chest",
        "place the hand loosely near the pillow edge without propping the head unless the pose requires it",
        "let the hand remain partly hidden by the torso, pillow or crop when anatomically cleaner"
      ];
    }
    if (poseId === "semi_reclining") {
      return [
        "rest the free hand on the abdomen or thigh",
        "rest the palm lightly on the mattress beside the hip",
        "touch or loosely hold a blanket edge already pooled at the waist",
        "let the forearm rest naturally across the lap"
      ];
    }
    return [
      "rest the free hand on a real nearby bedding surface",
      "rest it on the abdomen or thigh when naturally reachable",
      "leave it partly outside the crop when that is anatomically cleaner"
    ];
  }

  if (family === "sitting") {
    if (/sofa/u.test(placement) || poseId === "sitting_sofa") {
      return [
        "rest the free hand on the thigh",
        "rest the palm lightly on the real sofa cushion or visible armrest",
        "place part of the hand casually in a real clothing pocket",
        "let the hand relax beside the hip if the seat geometry supports it"
      ];
    }
    if (poseId === "sitting_bed_edge") {
      return [
        "rest the free hand on the thigh",
        "place the palm lightly on the mattress beside the hip with local bedding compression",
        "let the forearm rest loosely across the lap",
        "use a half-pocket rest only when the selected clothing visibly has a reachable pocket"
      ];
    }
    if (poseId === "sitting_floor") {
      return [
        "rest the hand on the thigh or knee",
        "place fingertips or palm on the floor only if needed for believable support",
        "let the forearm rest across the lap",
        "keep the hand partly occluded when the leg arrangement makes that more natural"
      ];
    }
    return [
      "rest the hand naturally on the thigh",
      "rest it on a real nearby support surface",
      "use a casual half-pocket position only if the clothing supports it",
      "leave it partly outside the crop rather than force a gesture"
    ];
  }

  if (/wardrobe/u.test(placement) || poseId === "standing_wardrobe") {
    return [
      "let the free arm hang naturally beside the thigh",
      "place part of the hand casually in a real pocket",
      "make a tiny shirt-hem adjustment",
      "touch a visible wardrobe edge or handle only when that exact reachable feature is supported by the active room reference"
    ];
  }
  if (/vanity|dresser/u.test(placement)) {
    return [
      "let the hand relax beside the thigh",
      "use a casual half-pocket rest",
      "make a tiny shirt adjustment",
      "rest fingertips lightly on a real dresser edge only if it is visibly reachable without leaning or stretching"
    ];
  }
  if (/sofa/u.test(placement) || poseId === "standing_sofa") {
    return [
      "let the free hand hang naturally",
      "rest the hand or forearm lightly on the real sofa support surface when reachable",
      "use a casual half-pocket rest",
      "keep the free arm simple and close to the body"
    ];
  }
  if (/bed/u.test(placement) || poseId === "standing_bedside") {
    return [
      "let the free hand hang naturally beside the thigh",
      "rest the palm lightly on the real mattress edge if it is within comfortable reach",
      "use a casual half-pocket rest",
      "make a tiny shirt-hem adjustment"
    ];
  }
  return [
    "let the free hand hang naturally beside the thigh",
    "use a casual half-pocket rest when the clothing supports it",
    "make a tiny shirt or waistband adjustment",
    "keep the hand partly outside the crop if that produces the most natural anatomy"
  ];
}

function freeHandBlock(config = {}) {
  const candidates = sceneAwareCandidates(config);
  return `AUTO SCENE-AWARE FREE HAND — NON-CAMERA HAND ONLY
The application does NOT force one decorative hand pose. Choose the single most natural free-hand solution for the actual pose, room zone, support surfaces, crop and camera reach in this render.

SAFE CANDIDATES FOR THIS SCENE:
${candidates.map((item, index) => `${index + 1}) ${item}.`).join("\n")}

DECISION ORDER — HIGHEST PRIORITY FIRST
1) Preserve identity and clean facial visibility.
2) Preserve full-body support physics and the selected pose.
3) Preserve one continuous shoulder → elbow → wrist → palm → fingers anatomy chain.
4) Prefer resting/contact behavior over deliberate gesturing.
5) Use only surfaces and objects visibly supported by the active room reference and physically reachable from the selected body position.
6) If two actions are equally plausible, choose the simpler one with fewer visible fingers and less joint rotation.
7) The free hand is OPTIONAL in frame. Crop or naturally occlude it when visibility would require awkward reach, duplicate anatomy, extreme perspective or a staged pose.

FREE-HAND ANATOMY & CONTACT LOCK
- This controls ONLY the arm/hand that is NOT holding the phone. The selfie arm remains governed by the camera/arm policy.
- Shoulder rotation, elbow flexion, forearm pronation/supination and wrist deviation stay within ordinary comfortable human ranges for the selected pose.
- Fingers are not evenly spaced, mirrored, perfectly fanned or identically curved. Keep small natural asymmetry and simple overlaps.
- A hand touching mattress, pillow, blanket, clothing, sofa, thigh, floor or furniture creates attached contact shadow plus physically appropriate pressure response. Soft surfaces compress locally; rigid furniture does not visibly deform under light touch.
- Bedding contact must agree with BEDDING PHYSICS LOCK: hand/forearm pressure produces a local depression and load-driven micro-wrinkles instead of floating above the fabric.
- Never add a prop merely to occupy the hand. Never reach toward an object outside comfortable arm length.
- Never let the hand penetrate the torso or bedding, merge with fabric, detach from the forearm, grow extra digits, duplicate a wrist, or emerge from the wrong side of the body.
- Avoid fashion-model posing, symmetrical hand placement, rigid finger posing, dramatic beard-touch poses or any gesture that competes with the scene.
- Final test: the hand action should look incidental, mechanically necessary or casually comfortable, as if the subject was not consciously arranging it for the photograph.`;
}

function xiaomiNightBlock() {
  if (typeof document === "undefined") return "";
  const mode = document.querySelector("#xiaomiCaptureModeSelect")?.value;
  if (mode !== "night" && mode !== "low_light") return "";
  return `XIAOMI 15 ULTRA FRONT-CAMERA LOW-LIGHT EXECUTION
- Preserve the existing front-camera optical lock around 22–24 mm full-frame equivalent and approximately f/2.0. Do not substitute rear-camera optics, telephoto compression, DSLR depth rendering or a remote observer viewpoint.
- Low-light computational processing may combine a small number of temporally adjacent frames only in a way consistent with a handheld selfie. It may improve exposure stability but must NOT erase natural skin texture, beard gaps, hair clumping, fabric texture or dark-room noise.
- Keep realistic front-camera limitations: elevated gain, luminance noise in shadows, restrained chroma noise in the deepest tones, slight edge softness, modest sharpening halos, finite dynamic range and small handheld micro-motion where physically justified.
- Bright practical sources may clip modestly. Dark room regions remain dark. Do not lift black furniture or curtains into clean HDR detail merely to show the room.
- Face and room use the SAME denoise, sharpening, white-balance and tone-mapping event. No face-only night enhancement, beauty mode, skin cleanup or local relighting.
- Perspective, facial scale and edge distortion must remain consistent with the same close front wide selfie lens.`;
}

function patchPromptEngine() {
  const proto = PromptEngine?.prototype;
  if (!proto || proto[patchFlag] || typeof proto.generate !== "function") return;
  const originalGenerate = proto.generate;
  proto.generate = function generateWithSceneAwareFreeHand(config = {}) {
    const raw = originalGenerate.call(this, config);
    if (typeof raw !== "string") return raw;
    const night = xiaomiNightBlock();
    return `${raw}\n\n${freeHandBlock(config)}${night ? `\n\n${night}` : ""}`.trim();
  };
  proto[patchFlag] = true;
}

function removeLegacyManualControl() {
  if (typeof document === "undefined") return;
  try { localStorage.removeItem("ai-selfie-prompt-studio:free-hand-action"); } catch {}
  document.querySelector("#freeHandActionSelect")?.closest("[data-free-hand-actions], .field")?.remove();
}

patchPromptEngine();

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", removeLegacyManualControl, { once:true });
  else removeLegacyManualControl();
}
