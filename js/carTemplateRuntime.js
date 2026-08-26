import { PromptEngine } from "./engines/promptEngine.js";
import { Validator } from "./engines/validator.js";
import { MASTER_POLICY } from "./policies/masterPolicy.js";
import { XIAOMI_FRONT_CAPTURE_MODES } from "./xiaomiFrontCaptureModes.js";
import { CAR_REFERENCE, getActiveCarTemplate, getActiveCarTime } from "./carTemplates.js";

const promptPatchFlag = Symbol.for("promptStudio.carTemplates.promptPatched");
const validatorPatchFlag = Symbol.for("promptStudio.carTemplates.validatorPatched");

function activeCarTemplate() {
  return getActiveCarTemplate();
}

function captureMode() {
  if (typeof document === "undefined") return XIAOMI_FRONT_CAPTURE_MODES[0];
  const id = document.querySelector("#xiaomiCaptureModeSelect")?.value ?? "natural";
  return XIAOMI_FRONT_CAPTURE_MODES.find((item) => item.id === id) ?? XIAOMI_FRONT_CAPTURE_MODES[0];
}

function clothingText(clothing) {
  if (!clothing) return "Use the user-selected clothing with realistic fabric construction, seams, folds, thickness, pressure, gravity, and ordinary wear.";
  const fabric = clothing.fabric ?? {};
  return [
    `Selected outfit: ${clothing.name_en ?? clothing.name_ar ?? "the selected outfit"}.`,
    clothing.pieces ? `Garments: ${clothing.pieces}.` : "",
    fabric.type ? `Fabric: ${fabric.type}; weight ${fabric.weight ?? "physically appropriate"}; sheen ${fabric.sheen ?? "material-correct"}.` : "",
    fabric.drape ? `Drape: ${fabric.drape}.` : "",
    fabric.folds ? `Folds: ${fabric.folds}.` : "",
    fabric.texture ? `Texture: ${fabric.texture}.` : "",
    "Clothing must respond to the seated body, seatbelt/seat contact only if actually present, center console, gravity, and joint bending. No painted-on fabric, floating hems, or synthetic perfect folds."
  ].filter(Boolean).join("\n")
}

function carPrompt(engine, config, template, time) {
  const mode = captureMode();
  const personDescription = engine.identityEngine.fixedData?.person?.description
    ?? "Middle Eastern man, 35 years old, 183 cm tall, 82 kg, with a lightly athletic build";
  const aspect = ["9:16", "1:1", "16:9"].includes(config.aspect) ? config.aspect : "9:16";
  const expression = config.expression?.prompt ?? "Use a natural relaxed expression without reshaping identity.";
  const hair = config.hair?.prompt ?? "Preserve the identity-defined hair density, hairline, length, and growth pattern; alter arrangement only according to the selected hairstyle.";
  const identityLock = engine.identityEngine.buildLockText();
  const personText = engine.identityEngine.buildPersonText();

  return `CHATGPT IMAGE TASK — CAR INTERIOR
Generate one new, ordinary, photorealistic smartphone selfie inside the exact same vehicle interior represented by IMAGE B, using IMAGE A only for identity. The vehicle is fully stationary and parked in Saudi Arabia. Produce one camera view, one exposure, one lighting event, and one phone-processing pipeline. Return only the final image.

PHOTOGRAPHIC BRIEF — CAR SELFIE
The subject is the exact real man from IMAGE A: ${personDescription}. Preserve the same face, skin tone, facial proportions, hair density, hairline, beard pattern, age, and natural asymmetry. Photograph him again rather than recreating a look-alike.
IMAGE B is the built-in vehicle reference “${CAR_REFERENCE.image_filename}”. Use it as the sole authority for the vehicle interior. The car remains the same car with the exact seat shapes, upholstery, stitching, steering wheel, dashboard, displays, center console, gear selector, trim, doors, mirrors, roof, sunroof, pillars, window geometry, materials, colors, proportions, and visible small details.
The vehicle is parked and stationary in Saudi Arabia for the entire photographic event. Never imply driving, road travel, steering effort, acceleration, braking, or traffic motion.
Selected car template: ${template.name_ar}.
${template.pose}
${template.camera}
Selected time: ${time.name_ar}.
${time.prompt}
Exterior visible through glass or sunroof: ${time.parking}. Keep it secondary, plausible, and free of invented readable plates, brand signs, or location text.
Aspect ratio: ${aspect}.

REFERENCE AUTHORITY
IMAGE A — IDENTITY ONLY
${identityLock}
${personText}
IMAGE A does not control pose, clothing, expression, lighting, camera viewpoint, or vehicle geometry.

IMAGE B — VEHICLE INTERIOR ONLY
Use “${CAR_REFERENCE.image_filename}” as the immutable vehicle reference. Do not borrow the person, pose, facial identity, or clothing from IMAGE B. If IMAGE B contains a different person, replace only that person while preserving the complete vehicle interior and viewpoint logic required by this selfie template.

CAR INTERIOR LOCK — IMMUTABLE
${MASTER_POLICY.carInteriorSaudiParkingLock}

GLOBAL PHOTOGRAPHIC REALISM POLICY
${MASTER_POLICY.immutablePhotographicRealismLock}

SEATED BODY PHYSICS
- Pelvis and upper thighs are fully supported by the real driver seat. The seat may show only subtle physically plausible compression under body weight.
- Back contact, shoulder posture, knees, legs, and feet must fit the real driver-seat geometry and footwell without clipping through the console, door, steering column, or dashboard.
- Any free-hand contact with steering wheel, thigh, or center console must land on a real visible surface with plausible finger placement and small contact pressure.
- Do not move the steering wheel, seat, console, door, dashboard, mirror, sunroof, or any other vehicle component to make the pose easier.

EXPRESSION
${expression}
Preserve identity geometry. Do not beautify, symmetrize, whiten teeth excessively, or clean the face beyond ordinary phone-camera rendering.

HAIR
${hair}
Do not increase or decrease hair density, scalp coverage, temple shape, hairline, strand caliber, or base length. Keep believable clumping, flyaways, gravity, humidity, and contact effects.

CLOTHING
${clothingText(config.clothing)}

XIAOMI 15 ULTRA FRONT SELFIE CAMERA — FIXED
- Use the Xiaomi 15 Ultra FRONT-FACING camera only, with the app’s front-wide selfie optical model around 22–24 mm equivalent and approximately f/2.0.
- True subject-held selfie geometry only. No rear camera, no tripod, no third-person photographer, no observer camera from the passenger seat, dashboard, doorway, windshield, or outside the car.
- Phone remains at a physically reachable selfie distance with mild near-field wide-angle perspective and ordinary front-camera processing.
- The camera-holding arm, hand, fingertips, and phone are completely outside the finished crop. Hide them by physically reachable composition, never by erasing, shortening, amputating, deforming, or disconnecting anatomy.
Selected capture mode: ${mode.name_ar}.
${mode.prompt}

ONE LIGHTING EVENT
- Time-of-day changes exterior illumination and physically plausible light entering through windshield, side windows, and sunroof only.
- Interior and subject share one exposure, one white balance, one HDR response, one noise field, one sharpening level, and one compression pipeline.
- Do not selectively relight or beautify the face. Bright exterior glass may clip modestly while darker interior areas retain realistic front-camera noise.
- Reflections on glass, glossy trim, eyes, skin, displays, and metal must correspond to actual visible or physically plausible parking-area light sources.

REALISM & MICRO-DETAIL
Preserve ordinary smartphone imperfections: restrained shadow noise, mild compression, non-uniform edge sharpness, slight white-balance error, modest HDR, occasional tiny handheld softness, and realistic highlight roll-off. Steering-wheel fingers, upholstery seams, console controls, trim boundaries, seat edges, glass reflections, clothing seams, hair edges, and contact shadows must remain structurally coherent under close inspection. Do not add fake forensic artifacts or artificial defects.

FINAL CAR GATE
Reject and correct the result before output if any of these occur:
- the vehicle appears to be moving or traveling on a road;
- the exterior fails to read as a plausible Saudi parking context;
- any vehicle interior component changes identity, position, color, material, or geometry relative to IMAGE B;
- the camera reads as rear-camera, third-person, passenger-held, dashboard-mounted, or tripod capture;
- any part of the camera-holding arm, hand, fingertips, or phone appears in frame;
- the subject floats above the seat, intersects the steering wheel/console/door, or uses impossible anatomy;
- the face, hair, clothing, or skin looks cleaner, smoother, sharper, or more perfectly lit than the vehicle interior.

NEGATIVE PROMPT
moving car, driving selfie, active roadway, traffic motion, steering while driving, rear-camera photo, third-person photo, passenger photographer, tripod, dashboard camera, outside-car camera, visible selfie arm, visible selfie hand, visible phone, stretched arm, fisheye limb distortion, redesigned vehicle interior, different steering wheel, different dashboard, changed seats, changed upholstery color, invented controls, invented ambient-light strips, altered sunroof, open door not present in reference, fake readable license plate, fake brand signage, studio lighting, beauty filter, plastic skin, face smoothing, perfect teeth, artificial hair density, fake DSLR bokeh, CGI, 3D render, cinematic grading, extreme HDR, fake 8K detail, extra fingers, fused fingers, impossible joints, floating body, object penetration, broken reflections, unrequested text or logos.`;
}

function patchPromptEngine() {
  const proto = PromptEngine?.prototype;
  if (!proto || proto[promptPatchFlag] || typeof proto.generate !== "function") return;
  const originalGenerate = proto.generate;
  proto.generate = function generateWithCarTemplate(config = {}) {
    const template = activeCarTemplate();
    if (!template) return originalGenerate.call(this, config);
    return carPrompt(this, config, template, getActiveCarTime());
  };
  proto[promptPatchFlag] = true;
}

function patchValidator() {
  const proto = Validator?.prototype;
  if (!proto || proto[validatorPatchFlag] || typeof proto.validate !== "function") return;
  const originalValidate = proto.validate;
  proto.validate = function validateWithCarTemplate(config = {}) {
    if (!activeCarTemplate()) return originalValidate.call(this, config);
    const warnings = [];
    const notices = [this.createIssue("info", "car_reference_lock", "قالب السيارة يستخدم مرجع المقصورة الثابت والسيارة متوقفة داخل السعودية.")];
    if (!config.uploads?.imageA) {
      warnings.push(this.createIssue("warning", "image_a_missing", "صورة الهوية غير مرفوعة داخل المعاينة.", "ارفع IMAGE A قبل استخدام الأمر مع ChatGPT."));
    }
    const conflicts = [];
    const issues = [...warnings, ...notices];
    return { valid: true, conflicts, warnings, notices, issues, autoFixes: [] };
  };
  proto[validatorPatchFlag] = true;
}

patchPromptEngine();
patchValidator();
