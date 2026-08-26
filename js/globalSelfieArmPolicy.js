import { CameraEngine } from "./engines/cameraEngine.js";

const GLOBAL_SELFIE_ARM_EXCLUSION = `GLOBAL SELFIE ARM EXCLUSION — IMMUTABLE, ALWAYS ACTIVE
HIGHEST PRIORITY WITHIN CAMERA-HOLDING ARM VISIBILITY AND FRAMING.
This rule applies to EVERY template, EVERY pose, EVERY camera path, EVERY room scenario, and every future template in the application.
- The camera-holding arm is physically solved in full but remains COMPLETELY OUTSIDE the finished image crop.
- No camera-holding upper arm, elbow, forearm, wrist, hand, fingertips, or phone may enter any edge of the final image.
- Never use a visible arm, arm extension, 0.5x foreground-arm stretch, fisheye limb magnification, forced-perspective limb elongation, or an oversized near-lens hand as a selfie cue.
- Preserve a true subject-held selfie through reachable phone distance, near-field facial perspective, gaze toward the actual phone position, natural shoulder asymmetry, and room perspective from the subject's real location.
- Solve the hidden arm anatomically outside the crop. Never erase, shorten, amputate, detach, deform, merge, or bend it impossibly to make it disappear.
- The opposite non-camera-holding arm may remain visible only when the selected pose naturally requires it and it must obey ordinary anatomy, support, gravity, and contact shadows.
- For mirror/rear-camera paths, preserve one physically valid mirror ray path and never use foreground arm stretch as a cue.
- Any lower-priority instruction that asks for a visible selfie arm, longer-looking arm, enhanced arm perspective, extreme arm perspective, foreground arm dominance, or visible phone hand is VOID and must be ignored.`;

const patchFlag = Symbol.for("promptStudio.globalSelfieArmPolicy.patched");

function patchCameraEngine() {
  const proto = CameraEngine?.prototype;
  if (!proto || proto[patchFlag]) return;

  const originalBuildPrompt = proto.buildPrompt;
  if (typeof originalBuildPrompt === "function") {
    proto.buildPrompt = function globalNoArmBuildPrompt(...args) {
      const base = originalBuildPrompt.apply(this, args);
      return `${base ?? ""}\n\n${GLOBAL_SELFIE_ARM_EXCLUSION}`.trim();
    };
  }

  const originalSelfieViewpointLock = proto.selfieViewpointLock;
  if (typeof originalSelfieViewpointLock === "function") {
    proto.selfieViewpointLock = function globalNoArmSelfieViewpointLock(...args) {
      const base = originalSelfieViewpointLock.apply(this, args);
      return `${GLOBAL_SELFIE_ARM_EXCLUSION}\n\n${base ?? ""}\n\nFINAL ARM VISIBILITY GATE: if any part of the camera-holding arm, hand, fingertips, or phone is visible anywhere in the finished frame, the render is INVALID and must be reframed before output.`.trim();
    };
  }

  proto.buildArmPerspectiveLock = function globalNoArmPerspectiveLock() {
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
  if (modeHint) modeHint.textContent = "ذراع التصوير خارج الإطار دائمًا";

  document.documentElement.dataset.globalSelfieArmVisibility = "hidden";
  document.documentElement.dataset.armPerspective = "disabled";
}

function installUiPolicy() {
  try {
    localStorage.removeItem("ai-selfie-prompt-studio:arm-perspective");
  } catch {
    // Storage is optional and must never block the app.
  }

  hideLegacyArmControlsOnce();
  requestAnimationFrame(() => requestAnimationFrame(hideLegacyArmControlsOnce));
}

patchCameraEngine();

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installUiPolicy, { once: true });
  } else {
    installUiPolicy();
  }
}

export { GLOBAL_SELFIE_ARM_EXCLUSION };
