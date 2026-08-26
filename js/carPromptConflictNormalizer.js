import "./carCloseupRuntime.js";
import { PromptEngine } from "./engines/promptEngine.js";
import { getActiveCarTemplate } from "./carTemplates.js";

const patchFlag = Symbol.for("promptStudio.carPromptConflictNormalizer.patched");

const LEGACY_CAR_NO_ARM_BLOCK = `- The camera-holding arm, hand, fingertips, and phone are completely outside the finished crop. Hide them by physically reachable composition, never by erasing, shortening, amputating, deforming, or disconnecting anatomy.`;

const CAR_ARM_REPLACEMENT = `- CAR CABIN ARM VISIBILITY: a physically continuous camera-side shoulder/forearm/hand segment MAY enter an extreme frame edge when required by the selected car pose and true 22–24mm near-field geometry. The phone itself remains directly invisible behind the front-camera optical center. Never lengthen bones or add joints.`;

function normalizeCarPrompt(text) {
  if (typeof text !== "string") return text;

  return text
    .replaceAll(LEGACY_CAR_NO_ARM_BLOCK, CAR_ARM_REPLACEMENT)
    .replaceAll("- any part of the camera-holding arm, hand, fingertips, or phone appears in frame;", "- the phone appears directly in frame, or any visible camera-side arm/hand segment is anatomically disconnected, overextended, duplicated, or inconsistent with the cabin reach lock;")
    .replaceAll("The camera-holding arm and phone remain completely outside crop.", "Arm visibility follows the CAR CABIN SELFIE LOCK: a small camera-side forearm/shoulder segment may enter an extreme edge when physically required; the phone remains directly invisible.")
    .replaceAll("No observer-camera distance and no visible camera-holding arm.", "No observer-camera distance. Any visible camera-side arm segment must remain a small, continuous, physically reachable edge foreground under the CAR CABIN SELFIE LOCK.")
    .replaceAll("camera-holding arm stays outside crop.", "camera-side arm visibility follows the CAR CABIN SELFIE LOCK; the phone stays directly invisible.")
    .replaceAll("with the camera-holding arm fully outside crop.", "with camera-side arm visibility governed by the CAR CABIN SELFIE LOCK.")
    .replaceAll("no visible camera arm or phone.", "no directly visible phone; any visible arm segment must obey the CAR CABIN SELFIE LOCK.")
    .replaceAll("The camera-holding side remains completely outside crop.", "The camera-side arm may enter only as a small physically continuous extreme-edge foreground segment under the CAR CABIN SELFIE LOCK; the phone remains directly invisible.")
    .replaceAll("the holding arm remains outside crop", "camera-side arm visibility follows the CAR CABIN SELFIE LOCK")
    .replaceAll("visible camera-holding arm", "anatomically impossible or disconnected camera-side arm")
    .replaceAll("no visible holding arm", "no anatomically impossible or disconnected holding arm")
    .concat(`\n\nCAR CABIN ARM VISIBILITY PRIORITY — FINAL OVERRIDE\nFor an active car template only, any earlier generic instruction requiring the entire camera-holding arm to remain outside crop is superseded by the XIAOMI 15 ULTRA FRONT-CAMERA CABIN SELFIE LOCK. A small physically continuous camera-side shoulder/forearm/hand segment may appear at an extreme edge when the selected pose requires it. The phone itself remains directly invisible. This override does NOT apply to non-car templates.`);
}

function patchPromptEngine() {
  const proto = PromptEngine?.prototype;
  if (!proto || proto[patchFlag] || typeof proto.generate !== "function") return;

  const originalGenerate = proto.generate;
  proto.generate = function generateWithCarConflictNormalization(config = {}) {
    const result = originalGenerate.call(this, config);
    const pose = getActiveCarTemplate();
    if (!pose || pose.category !== "car") return result;
    return normalizeCarPrompt(result);
  };

  proto[patchFlag] = true;
}

patchPromptEngine();

export { normalizeCarPrompt };
