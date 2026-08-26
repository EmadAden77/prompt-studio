import { CameraEngine } from "./engines/cameraEngine.js";
import { AutoEngineeringEngine } from "./engines/autoEngineeringEngine.js";

const STORAGE_KEY = "ai-selfie-prompt-studio:xiaomi-front-capture-mode";

export const XIAOMI_FRONT_CAPTURE_MODES = Object.freeze([
  { id:"natural", name_ar:"طبيعي — سيلفي أمامي عادي", prompt:"NATURAL SELFIE: ordinary Xiaomi 15 Ultra front-camera capture; 22–24 mm equivalent, approximately f/2.0, normal phone auto-exposure, restrained HDR, natural phone depth of field, mild edge softness and ordinary handheld micro-imperfection." },
  { id:"night", name_ar:"ليلي — سيلفي Night", prompt:"NIGHT SELFIE: keep the same Xiaomi 15 Ultra front camera and lens. Use exposure appropriate to low light, higher sensor gain, visible but restrained luminance/chroma noise in shadows, modest highlight clipping, imperfect white balance, and slight handheld micro-motion where physically justified. Do not turn it into a rear-camera night photo." },
  { id:"low_light", name_ar:"إضاءة ضعيفة جدًا", prompt:"VERY LOW LIGHT SELFIE: same front camera only. Preserve limited shadow detail, stronger but realistic small-sensor noise, restrained denoising, slight color uncertainty in deep shadows, and ordinary phone exposure compromises. Never invent a studio fill on the face." },
  { id:"micro_shake", name_ar:"اهتزاز يد خفيف", prompt:"LIGHT HANDHELD SHAKE: preserve a coherent single exposure with very mild micro-motion softness caused by actual handheld movement. Keep facial identity readable; motion softness may affect loose hair or moving edges slightly more than stable facial features. No decorative global blur." },
  { id:"portrait", name_ar:"بورتريه سيلفي", prompt:"FRONT PORTRAIT MODE: use only the Xiaomi 15 Ultra front camera. Apply restrained computational subject separation with natural phone-like depth behavior and small edge-detection imperfections around fine hair when physically plausible. No DSLR bokeh, no telephoto compression, no perfect cutout mask." },
  { id:"hdr", name_ar:"HDR تلقائي", prompt:"AUTO HDR SELFIE: front camera only. Use modest smartphone multi-frame dynamic-range balancing while keeping highlight roll-off, shadow noise, skin texture, and room contrast believable. Never locally relight or beautify the subject separately from the room." },
  { id:"auto_exposure", name_ar:"تعريض تلقائي واقعي", prompt:"REALISTIC AUTO EXPOSURE: allow ordinary phone metering tradeoffs. Depending on the room brightness, the face may be slightly under- or over-exposed rather than perfectly balanced. Keep one exposure logic and one white-balance solution across subject and room." },
  { id:"mixed_light", name_ar:"إضاءة داخلية مختلطة", prompt:"MIXED-LIGHT SELFIE: front camera only. Preserve physically plausible imperfect white balance between warm and cool room sources, with coherent shadow directions and reflections. Do not neutralize every surface or make the face cleaner than the room." },
  { id:"close", name_ar:"سيلفي قريب — وجه وكتفان", prompt:"CLOSE SELFIE FRAMING: phone remains at a physically reachable front-camera distance. Frame mainly face and shoulders with mild near-field wide-angle perspective. The camera-holding arm and phone remain completely outside crop." },
  { id:"medium", name_ar:"سيلفي متوسط — من الصدر للأعلى", prompt:"MEDIUM SELFIE FRAMING: front camera at natural reach, framing from roughly chest upward with enough room context to preserve place continuity. No observer-camera distance and no visible camera-holding arm." },
  { id:"high_angle", name_ar:"زاوية سيلفي عالية", prompt:"HIGH-ANGLE SELFIE: Xiaomi 15 Ultra front camera held slightly above eye level within natural reach, optical axis angled down modestly. Keep anatomy and room perspective physically reachable; camera-holding arm stays outside crop." },
  { id:"low_angle", name_ar:"زاوية سيلفي منخفضة", prompt:"LOW-ANGLE SELFIE: Xiaomi 15 Ultra front camera held modestly below eye level within natural reach, optical axis angled up slightly. Avoid extreme distortion; camera-holding arm stays outside crop." },
  { id:"warm_indoor", name_ar:"داخلي دافئ", prompt:"WARM INDOOR SELFIE: same front camera and lens. Preserve warm practical-light white balance with realistic sensor response, shadow noise, and highlight behavior. No cinematic orange grading and no separate face relighting." },
  { id:"daylight", name_ar:"نهاري طبيعي", prompt:"DAYLIGHT SELFIE: same Xiaomi 15 Ultra front camera. Use lower sensor gain, cleaner but still ordinary phone detail, restrained HDR, realistic window/highlight roll-off, and natural skin micro-contrast without beauty smoothing." }
]);

const MODE_BY_ID = Object.freeze(Object.fromEntries(XIAOMI_FRONT_CAPTURE_MODES.map((item) => [item.id, item])));

function readModeId() {
  if (typeof document !== "undefined") {
    const value = document.querySelector("#xiaomiCaptureModeSelect")?.value;
    if (MODE_BY_ID[value]) return value;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (MODE_BY_ID[stored]) return stored;
  } catch {}
  return "natural";
}

function fixedCameraLock() {
  const mode = MODE_BY_ID[readModeId()] ?? MODE_BY_ID.natural;
  return `XIAOMI 15 ULTRA FRONT SELFIE CAMERA LOCK — IMMUTABLE, ALWAYS ACTIVE
- Every template, pose, room scenario, lighting preset, and capture mode uses the Xiaomi 15 Ultra FRONT-FACING camera only.
- Use the built-in front wide selfie lens at approximately 22–24 mm full-frame equivalent and approximately f/2.0.
- This must read as a genuine subject-held smartphone selfie from a physically reachable phone position, never a rear-camera photograph, third-person photograph, tripod view, doorway observer view, or camera placed across the room.
- Preserve mild near-field wide-angle perspective, ordinary small-front-sensor limits, natural phone depth of field, realistic auto exposure/white balance, restrained sharpening, compression, and illumination-dependent noise.
- The selected capture mode may change exposure behavior, computational processing, motion softness, framing, or reachable angle, but it MUST NOT change the camera identity to a rear camera, DSLR, telephoto camera, or external photographer.
- CAMERA-HOLDING ARM EXCLUSION: physically solve the complete holding arm outside the crop. No holding-side upper arm, elbow, forearm, wrist, hand, fingertips, or phone may appear anywhere inside the finished frame. Never erase or deform the arm; hide it by reachable composition only.
- A selfie must still be evident through gaze toward the real phone position, subtle shoulder asymmetry, near-field face perspective, and room perspective from the subject's actual location.

SELECTED FRONT-CAMERA CAPTURE MODE — ${mode.name_ar}
${mode.prompt}`;
}

const cameraPatchFlag = Symbol.for("promptStudio.xiaomiFrontModes.cameraPatched");
const autoPatchFlag = Symbol.for("promptStudio.xiaomiFrontModes.autoPatched");

function patchEngines() {
  const cameraProto = CameraEngine?.prototype;
  if (cameraProto && !cameraProto[cameraPatchFlag]) {
    const originalGetCamera = cameraProto.getCamera;
    const originalGetLens = cameraProto.getLens;
    const originalBuildPrompt = cameraProto.buildPrompt;
    const originalViewpoint = cameraProto.selfieViewpointLock;

    cameraProto.getCamera = function fixedFrontCamera() {
      return originalGetCamera.call(this, "front");
    };
    cameraProto.getLens = function fixedFrontLens() {
      return originalGetLens.call(this, "front_wide");
    };
    if (typeof originalBuildPrompt === "function") {
      cameraProto.buildPrompt = function fixedFrontPrompt(...args) {
        return `${originalBuildPrompt.apply(this, args)}\n\n${fixedCameraLock()}`.trim();
      };
    }
    if (typeof originalViewpoint === "function") {
      cameraProto.selfieViewpointLock = function fixedFrontViewpoint(args = {}) {
        const forced = { ...args, camera: this.getCamera("front") };
        return `${fixedCameraLock()}\n\n${originalViewpoint.call(this, forced)}\n\nFINAL CAMERA GATE: if the result reads as rear-camera, third-person, tripod, distant observer, or shows any part of the camera-holding arm/hand/phone, reframe it as a reachable Xiaomi 15 Ultra front-camera selfie before output.`.trim();
      };
    }
    cameraProto[cameraPatchFlag] = true;
  }

  const autoProto = AutoEngineeringEngine?.prototype;
  if (autoProto && !autoProto[autoPatchFlag] && typeof autoProto.engineer === "function") {
    const originalEngineer = autoProto.engineer;
    autoProto.engineer = function fixedFrontEngineering(...args) {
      const result = originalEngineer.apply(this, args);
      if (!result) return result;
      return { ...result, cameraType:"front", lensType:"front_wide" };
    };
    autoProto[autoPatchFlag] = true;
  }
}

function installControl() {
  if (typeof document === "undefined" || document.querySelector("#xiaomiCaptureModeSelect")) return;
  const form = document.querySelector("#optionsForm");
  if (!form) return;

  const field = document.createElement("div");
  field.className = "field field--wide";
  field.dataset.xiaomiCaptureModes = "true";

  const label = document.createElement("label");
  label.htmlFor = "xiaomiCaptureModeSelect";
  label.textContent = "📱 نمط كاميرا السيلفي — Xiaomi 15 Ultra";

  const fixed = document.createElement("small");
  fixed.textContent = "الكاميرا ثابتة دائمًا: أمامية · 22–24mm تقريبًا · f/2.0 · ذراع التصوير والهاتف خارج الإطار.";

  const select = document.createElement("select");
  select.id = "xiaomiCaptureModeSelect";
  select.name = "xiaomiCaptureMode";
  XIAOMI_FRONT_CAPTURE_MODES.forEach((mode) => {
    const option = document.createElement("option");
    option.value = mode.id;
    option.textContent = mode.name_ar;
    select.appendChild(option);
  });
  select.value = readModeId();

  const help = document.createElement("small");
  help.textContent = "هذه الخانة تغيّر حالة الالتقاط والمعالجة فقط؛ لا تغيّر الكاميرا أو هوية العدسة الأساسية.";

  field.append(label, fixed, select, help);
  form.appendChild(field);

  select.addEventListener("change", () => {
    try { localStorage.setItem(STORAGE_KEY, select.value); } catch {}
    document.documentElement.dataset.xiaomiFrontCaptureMode = select.value;
    document.querySelector("#rebuildBtn")?.click();
  });

  document.documentElement.dataset.xiaomiFrontCamera = "locked";
  document.documentElement.dataset.xiaomiFrontCaptureMode = select.value;
  requestAnimationFrame(() => document.querySelector("#rebuildBtn")?.click());
}

patchEngines();

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", installControl, { once:true });
  else installControl();
  import("./carTemplateHub.js");
  import("./hairRealismRuntime.js");
}
