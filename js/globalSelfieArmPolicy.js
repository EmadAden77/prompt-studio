import { CameraEngine } from "./engines/cameraEngine.js";

const GLOBAL_SELFIE_ARM_EXCLUSION = `GLOBAL SELFIE ARM EXCLUSION — IMMUTABLE, ALWAYS ACTIVE OUTSIDE CAR TEMPLATES
HIGHEST PRIORITY WITHIN CAMERA-HOLDING ARM VISIBILITY AND FRAMING.
This rule applies to every non-car template, pose, room scenario, and future non-car template in the application.
- The camera-holding arm is physically solved in full but remains COMPLETELY OUTSIDE the finished image crop.
- No camera-holding upper arm, elbow, forearm, wrist, hand, fingertips, or phone may enter any edge of the final image.
- Never use a visible arm, arm extension, 0.5x foreground-arm stretch, fisheye limb magnification, forced-perspective limb elongation, or an oversized near-lens hand as a selfie cue.
- Preserve a true subject-held selfie through reachable phone distance, near-field facial perspective, gaze toward the actual phone position, natural shoulder asymmetry, and room perspective from the subject's real location.
- Solve the hidden arm anatomically outside the crop. Never erase, shorten, amputate, detach, deform, merge, or bend it impossibly to make it disappear.
- The opposite non-camera-holding arm may remain visible only when the selected pose naturally requires it and it must obey ordinary anatomy, support, gravity, and contact shadows.
- For mirror/rear-camera paths, preserve one physically valid mirror ray path and never use foreground arm stretch as a cue.
- Any lower-priority non-car instruction that asks for a visible selfie arm, longer-looking arm, enhanced arm perspective, extreme arm perspective, foreground arm dominance, or visible phone hand is VOID and must be ignored.`;

const CAR_SELFIE_ARM_EXCEPTION = `CAR FRONT-CAMERA ARM VISIBILITY EXCEPTION — CAR TEMPLATES ONLY
- The vehicle remains parked and the image remains a genuine subject-held Xiaomi 15 Ultra FRONT-camera selfie.
- A physically continuous portion of the camera-side shoulder and/or forearm MAY enter an extreme frame edge when required by the selected car pose and reachable cabin geometry.
- Near-field enlargement is modest and optical: the edge-near forearm/shoulder can appear slightly larger than the face-side torso because it is closer to the front wide lens. Never lengthen bones, duplicate shoulders, add elbows, or use 0.5x/fisheye limb stretching.
- The phone itself remains behind the front-camera optical center and is not directly visible. A hand may be partially visible only when physically connected to the forearm and consistent with the real phone position.
- The full shoulder→upper-arm→elbow→forearm→wrist→hand path must be anatomically solvable inside the confined cabin even when part of it is cropped.
- If the requested crop cannot fit a normal 35–50cm cabin reach, loosen the crop or reduce the angle. Never lengthen the arm or move the shoulder.
- This exception overrides the non-car arm-exclusion rule ONLY while an active car template is selected.`;

const patchFlag = Symbol.for("promptStudio.globalSelfieArmPolicy.patched");

function carTemplateActive() {
  if (typeof document === "undefined") return false;
  return Boolean(document.documentElement.dataset.activeCarTemplate);
}

function activeArmPolicy() {
  return carTemplateActive() ? CAR_SELFIE_ARM_EXCEPTION : GLOBAL_SELFIE_ARM_EXCLUSION;
}

function patchCameraEngine() {
  const proto = CameraEngine?.prototype;
  if (!proto || proto[patchFlag]) return;

  const originalBuildPrompt = proto.buildPrompt;
  if (typeof originalBuildPrompt === "function") {
    proto.buildPrompt = function globalArmBuildPrompt(...args) {
      const base = originalBuildPrompt.apply(this, args);
      return `${base ?? ""}\n\n${activeArmPolicy()}`.trim();
    };
  }

  const originalSelfieViewpointLock = proto.selfieViewpointLock;
  if (typeof originalSelfieViewpointLock === "function") {
    proto.selfieViewpointLock = function globalArmSelfieViewpointLock(...args) {
      const base = originalSelfieViewpointLock.apply(this, args);
      const policy = activeArmPolicy();
      const finalGate = carTemplateActive()
        ? "FINAL CAR ARM GATE: visible camera-side shoulder/forearm is allowed only at a physically reachable frame edge; the phone itself stays invisible and the limb path must remain anatomically continuous."
        : "FINAL ARM VISIBILITY GATE: if any part of the camera-holding arm, hand, fingertips, or phone is visible anywhere in the finished frame, the render is INVALID and must be reframed before output.";
      return `${policy}\n\n${base ?? ""}\n\n${finalGate}`.trim();
    };
  }

  const originalBuildArmPerspectiveLock = proto.buildArmPerspectiveLock;
  proto.buildArmPerspectiveLock = function globalArmPerspectiveLock(...args) {
    if (carTemplateActive()) return CAR_SELFIE_ARM_EXCEPTION;
    if (typeof originalBuildArmPerspectiveLock === "function") {
      originalBuildArmPerspectiveLock.apply(this, args);
    }
    return GLOBAL_SELFIE_ARM_EXCLUSION;
  };

  proto[patchFlag] = true;
}

function hideLegacyArmControlsOnce() {
  const armField = document.querySelector("#armPerspectiveSelect")?.closest(".field")
    ?? document.querySelector('[data-arm-perspective-control="true"]');
  if (armField) {
    armField.hidden = true;
    armField.setAttribute("hidden", "");
  }

  const hiddenHubCard = document.querySelector("#hubHiddenTemplate")?.closest(".template-hub__card");
  if (hiddenHubCard) {
    hiddenHubCard.hidden = true;
    hiddenHubCard.setAttribute("hidden", "");
  }

  const modeHint = document.querySelector("#modeHint");
  if (modeHint) modeHint.textContent = carTemplateActive() ? "منظور ذراع السيارة فيزيائي ومحدود" : "ذراع التصوير خارج الإطار دائمًا";

  document.documentElement.dataset.globalSelfieArmVisibility = carTemplateActive() ? "car-edge-allowed" : "hidden";
  document.documentElement.dataset.armPerspective = "disabled";
}

function installPoseTransformerNav() {
  if (document.body?.dataset.page !== "home") return;
  const actions = document.querySelector(".topbar__actions");
  if (!actions || actions.querySelector('[data-pose-transformer-link="true"]')) return;
  const link = document.createElement("a");
  link.className = "ghost-button";
  link.href = "pose-change.html";
  link.dataset.poseTransformerLink = "true";
  link.style.textDecoration = "none";
  link.style.whiteSpace = "nowrap";
  link.textContent = "🔄 تغيير الوضعية من صورة";
  actions.prepend(link);
}

function installUiPolicy() {
  try {
    localStorage.removeItem("ai-selfie-prompt-studio:arm-perspective");
  } catch {
    // Storage is optional and must never block the app.
  }

  hideLegacyArmControlsOnce();
  installPoseTransformerNav();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    hideLegacyArmControlsOnce();
    installPoseTransformerNav();
  }));
  document.addEventListener("change", () => requestAnimationFrame(hideLegacyArmControlsOnce), true);
}

patchCameraEngine();

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installUiPolicy, { once: true });
  } else {
    installUiPolicy();
  }

  if (document.body?.dataset.page === "home") {
    import("./roomScenarioPersistenceRuntime.js");
  }
}

export { GLOBAL_SELFIE_ARM_EXCLUSION, CAR_SELFIE_ARM_EXCEPTION };
