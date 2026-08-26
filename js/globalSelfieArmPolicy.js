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
- For mirror/rear-camera paths, crop the reflected camera-holding arm and phone outside the final image while preserving one physically valid mirror ray path.
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

function resetLegacyArmState() {
  try {
    localStorage.removeItem("ai-selfie-prompt-studio:arm-perspective");
  } catch {
    // Storage is optional.
  }

  const hiddenSelect = document.querySelector("#hiddenArmTemplateSelect");
  if (hiddenSelect && [...hiddenSelect.options].some((option) => option.value === "custom")) {
    hiddenSelect.value = "custom";
    hiddenSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function removeLegacyArmControls() {
  document.querySelectorAll('[data-arm-perspective-control="true"]').forEach((field) => field.remove());

  const directArmSelect = document.querySelector("#armPerspectiveSelect");
  directArmSelect?.closest(".field")?.remove();

  const hiddenHubSelect = document.querySelector("#hubHiddenTemplate");
  hiddenHubSelect?.closest(".template-hub__card")?.remove();

  document.querySelectorAll('[data-hidden-arm-templates="true"]').forEach((field) => field.remove());

  const hubHeaderNote = document.querySelector("#templateHub .template-hub__header p:last-child");
  if (hubHeaderNote) {
    hubHeaderNote.textContent = "كل القوالب تخفي ذراع التصوير والهاتف خارج الإطار تلقائيًا. القالب يضبط المرجع والوضعية والإضاءة والكاميرا، ويبقى لك الشعر وتعبير الوجه والملابس.";
  }

  const modeHint = document.querySelector("#modeHint");
  if (modeHint) modeHint.textContent = "القالب هو الأساس · الذراع خارج الإطار دائمًا";
}

function installUiPolicy() {
  resetLegacyArmState();
  removeLegacyArmControls();

  const observer = new MutationObserver(() => removeLegacyArmControls());
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.documentElement.dataset.globalSelfieArmVisibility = "hidden";
  document.documentElement.dataset.armPerspective = "disabled";
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
