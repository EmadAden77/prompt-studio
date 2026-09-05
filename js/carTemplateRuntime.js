import { PromptEngine } from "./engines/promptEngine.js";
import { Validator } from "./engines/validator.js";
import { MASTER_POLICY } from "./policies/masterPolicy.js";
import { XIAOMI_FRONT_CAPTURE_MODES } from "./xiaomiFrontCaptureModes.js";
import { CAR_REFERENCE, getActiveCarTemplate, getActiveCarTime } from "./carTemplates.js";

const promptPatchFlag = Symbol.for("promptStudio.carTemplates.promptPatched");
const validatorPatchFlag = Symbol.for("promptStudio.carTemplates.validatorPatched");

const CAR_LIGHTING_PHYSICS_LOCK = `CAR LIGHTING PHYSICS LOCK — IMMUTABLE
- Treat subject, cabin, glass, exterior parking area, parked vehicles, people, pavement, columns, vegetation, and building surfaces as one physical lighting event.
- Every visible highlight, shadow edge, catchlight, reflection, color cast, and brightness gradient must trace back to a plausible source visible in or physically implied by the selected Saudi parking environment.
- Daylight enters only through the real windshield, side windows, rearward glass paths, and sunroof geometry recorded by IMAGE B. Respect roof, pillar, visor, seat, steering-wheel, and dashboard occlusion; do not light through solid vehicle parts.
- At night, use only plausible parking-area practicals, façade spill, ambient sky, dashboard/display emission already consistent with the reference, and other physically justified exterior sources. No invisible beauty fill, ring light, softbox, studio key, rim light, or cinematic relighting.
- Preserve real inverse-square falloff for nearby practicals, natural directional falloff through glass, and uneven illumination across the face. One cheek may be brighter; eye sockets, jaw, neck, clothing, seat, and console may fall into deeper shadow.
- Do not force perfect skin exposure. Allow ordinary phone compromises: modest highlight clipping through bright glass, deeper cabin shadows, imperfect white balance, small mixed-color zones, and illumination-dependent noise.
- Sunroof light is only transmitted exterior light or reflection. Never turn the sunroof into an artificial overhead softbox.
- The subject must never look more evenly lit, cleaner, smoother, or more professionally exposed than the steering wheel, seat, dashboard, and surrounding cabin under the same light event.`;

const PARKING_LIFE_LAYER = `SAUDI PARKING LIFE LAYER — NATURAL, SECONDARY, NON-STAGED
- The exterior must read as an ordinary real parking environment in Saudi Arabia, not a decorative backdrop, showroom, empty CGI plaza, or perfectly arranged film set.
- Build believable depth with foreground glass/pillar occlusion, near parked vehicles, mid-distance parking bays and columns, and farther architecture/sky/vegetation where physically visible from the selected window.
- Parked vehicles must vary naturally in body type, size, distance, orientation, brightness, occlusion, and color. Avoid cloned cars, repeated wheel patterns, repeated grilles, mirrored vehicles, identical spacing, perfect parallel repetition, or suspicious color alternation.
- Vehicles may include ordinary sedans and SUVs common to a Gulf parking context, but do not invent readable brand badges, dealership text, license-plate numbers, or fake logos. Plates should remain small, naturally unreadable, partially occluded, or motionless background detail.
- Allow realistic parking disorder: one car slightly deeper in its bay, another partially hidden by a column, another cropped by the window frame, another catching a strong reflection while a neighboring car remains darker.
- Add sparse human activity only when it helps the selected place/time: one or two distant people walking, entering a building, carrying ordinary belongings, or standing near a parked vehicle. They must remain background-scale, naturally blurred/softened by distance and phone processing, not pose, not stare at the camera, and not have over-resolved faces or hands.
- Use non-textual Saudi context when useful: parking shade structures, dry bright daylight, modern unbranded façades, warm exterior practicals, palms or restrained landscaping, curbs, painted parking lines, bollards, ramps, columns, and heat-haze-like distant softness when physically plausible.
- Never fabricate readable mall/hotel/restaurant names to prove location. Place realism must come from geometry, materials, lighting, climate cues, and ordinary human/vehicle behavior rather than fake text.
- Exterior life must remain secondary to the selfie. Do not turn the parking area into a crowd scene, traffic scene, or automotive advertisement.`;

const GLASS_REFLECTION_LOCK = `GLASS & REFLECTION LOCK — PHYSICALLY COHERENT
- Windshield, side glass, mirrors, glossy trim, instrument surfaces, eyes, skin highlights, and metal must obey one coherent set of reflection directions.
- Glass is not an invisible hole. Preserve subtle transmission/reflection balance: faint dashboard/roof/cabin reflections where angle permits, mild tint or brightness loss where supported by the reference, and realistic glare from bright exterior sources.
- Reflections must be weaker or stronger according to viewing angle and source brightness. Never paste a sharp duplicate of the whole cabin onto the glass.
- Window frames and pillars must occlude exterior objects correctly. A car, person, light pole, or building edge cannot continue visibly through an opaque pillar or door frame.
- Bright parking lights may produce restrained localized glare or small reflections, but no decorative anamorphic streaks, giant lens flares, or repeated glowing orbs.
- Mirrors must preserve plausible handedness, viewing direction, occlusion, and brightness. Do not invent extra cars/people in mirrors that have no physically plausible exterior source.
- Do not add fingerprints, dust, rain, condensation, or dirt merely as an artificial realism effect. Such details may appear only if naturally supported by the scene/reference and must remain sparse and irregular.`;

const SINGLE_PHONE_PIPELINE_LOCK = `SINGLE XIAOMI FRONT-CAMERA PIPELINE LOCK — WHOLE FRAME
- Subject, hair, beard, clothing, vehicle interior, glass, parked vehicles, people, architecture, pavement, and sky pass through the same Xiaomi 15 Ultra front-camera capture and processing event.
- Use one exposure decision, one white-balance solution, one HDR behavior, one sharpening character, one denoising strength, one compression level, one motion state, and one depth-of-field logic for the complete frame.
- Do not render the face with a cleaner texture, lower noise, stronger micro-contrast, better white balance, or more flattering dynamic range than the cabin around it.
- Background distance may naturally reduce micro-detail through perspective, optics, atmosphere, motion micro-softness, demosaicing, noise reduction, and compression, but it must not switch to a different render style.
- Night and low-light scenes retain realistic small-sensor compromises: chroma/luminance noise in deep shadows, imperfect color separation, restrained denoising, modest highlight clipping, and slight local softness where physically expected.
- Daylight scenes may be cleaner, but retain ordinary front-camera edge softness, restrained HDR, realistic highlight roll-off, mild lens/pipeline imperfection, and no fake hyper-detailed 8K texture.
- Computational portrait mode, if selected, uses restrained phone-like segmentation only. Fine hair and complex cabin/background boundaries may have tiny natural processing imperfections; never create perfect DSLR bokeh or a cutout-mask look.`;

function activeCarTemplate() {
  return getActiveCarTemplate();
}

function captureMode() {
  if (typeof document === "undefined") return XIAOMI_FRONT_CAPTURE_MODES[0];
  const id = document.querySelector("#xiaomiCaptureModeSelect")?.value ?? "natural";
  return XIAOMI_FRONT_CAPTURE_MODES.find((item) => item.id === id) ?? XIAOMI_FRONT_CAPTURE_MODES[0];
}

function parkingDensityRule(time) {
  switch (time?.id) {
    case "day":
      return "DAY PARKING BEHAVIOR: moderate ordinary occupancy. Use a believable mix of shaded and sunlit parked vehicles; stronger exterior dynamic range and crisp but non-perfect daylight geometry.";
    case "afternoon":
      return "AFTERNOON PARKING BEHAVIOR: moderate occupancy with harder side light, longer vehicle/column shadows, warmer reflections, and occasional bright paint/glass highlights that may clip slightly.";
    case "sunset":
      return "SUNSET PARKING BEHAVIOR: irregular warm/cool zones across parked cars and building surfaces; some vehicles catch low warm light while others sit in shade. Avoid cinematic orange uniformity.";
    case "evening":
      return "EVENING PARKING BEHAVIOR: mixed occupancy and practical-light activation. Some cars are dark silhouettes with small reflections while others sit beneath localized façade or parking lights.";
    case "night":
      return "NIGHT PARKING BEHAVIOR: believable mall/hotel/office/restaurant parking activity with localized pools of light, darker gaps, parked cars at different exposure levels, and sparse distant human movement.";
    case "late_night":
      return "LATE-NIGHT PARKING BEHAVIOR: lower occupancy, quieter human activity, larger dark zones between practical lights, more shadow noise, and no implausibly bright or crowded background.";
    default:
      return "PARKING BEHAVIOR: use irregular, ordinary occupancy and physically plausible activity appropriate to the selected time.";
  }
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
    ?? "Middle Eastern man, 35 years old, 195 cm tall, 88 kg, with a lightly athletic build";
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
${parkingDensityRule(time)}
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

${CAR_LIGHTING_PHYSICS_LOCK}

${PARKING_LIFE_LAYER}

${GLASS_REFLECTION_LOCK}

${SINGLE_PHONE_PIPELINE_LOCK}

REALISM & MICRO-DETAIL
- Preserve ordinary smartphone imperfections: restrained shadow noise, mild compression, non-uniform edge sharpness, slight white-balance error, modest HDR, occasional tiny handheld softness, and realistic highlight roll-off.
- Steering-wheel fingers, upholstery seams, console controls, trim boundaries, seat edges, glass reflections, clothing seams, hair edges, parking-line geometry, vehicle wheels, distant people, and contact shadows must remain structurally coherent under close inspection.
- Background cars must have individually plausible wheelbase, wheel placement, window geometry, perspective, contact with the ground, cast shadows, and occlusion. Never allow melted vehicles or repeated copied details.
- Distant people must keep plausible limb count, walking balance, ground contact, scale, and occlusion without being over-resolved. If detail is too small for the phone capture, simplify naturally rather than inventing sharp fingers/faces.
- Slight real-world messiness is preferred over synthetic perfection: uneven parking occupancy, cropped background objects, modest highlight clipping, a darker-than-ideal cabin corner, asymmetric reflections, and ordinary sensor limitations are acceptable when physically justified.
- Do not add fake forensic artifacts, artificial defects, random dust, fake timestamps, fake metadata, or deliberate anti-forensic noise.

FINAL CAR GATE
Reject and correct the result before output if any of these occur:
- the vehicle appears to be moving or traveling on a road;
- the exterior fails to read as a plausible Saudi parking context;
- parked cars look cloned, mirrored, repeated, melted, geometrically inconsistent, floating, or arranged with suspicious perfect spacing;
- distant people pose for the selfie, stare at the camera, repeat faces/bodies, float, or appear too sharply rendered for their distance;
- exterior text, license plates, signs, or logos become invented and clearly readable;
- glass behaves like an invisible opening, reflections contradict source directions, or exterior objects pass through opaque pillars/window frames;
- any vehicle interior component changes identity, position, color, material, or geometry relative to IMAGE B;
- the camera reads as rear-camera, third-person, passenger-held, dashboard-mounted, or tripod capture;
- any part of the camera-holding arm, hand, fingertips, or phone appears in frame;
- the subject floats above the seat, intersects the steering wheel/console/door, or uses impossible anatomy;
- the face, hair, clothing, or skin looks cleaner, smoother, sharper, brighter, less noisy, or more perfectly lit than the vehicle interior without a physical reason;
- subject and background appear to come from different exposures, white balances, HDR treatments, sharpening levels, noise patterns, depth models, or rendering styles.

NEGATIVE PROMPT
moving car, driving selfie, active roadway, traffic motion, steering while driving, rear-camera photo, third-person photo, passenger photographer, tripod, dashboard camera, outside-car camera, visible selfie arm, visible selfie hand, visible phone, stretched arm, fisheye limb distortion, redesigned vehicle interior, different steering wheel, different dashboard, changed seats, changed upholstery color, invented controls, invented ambient-light strips, altered sunroof, open door not present in reference, cloned parked cars, repeated vehicles, mirrored cars, melted wheels, floating cars, perfect parking repetition, staged crowd, background people staring at camera, duplicated people, over-resolved distant faces, fake readable license plate, fake brand signage, fake readable mall or hotel text, impossible reflections, objects visible through opaque pillars, studio lighting, beauty filter, plastic skin, face smoothing, perfect teeth, artificial hair density, selective face denoising, selective face sharpening, fake DSLR bokeh, CGI, 3D render, cinematic grading, extreme HDR, fake 8K detail, extra fingers, fused fingers, impossible joints, floating body, object penetration, broken reflections, unrequested text or logos.`;
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
    const notices = [
      this.createIssue("info", "car_reference_lock", "قالب السيارة يستخدم مرجع المقصورة الثابت والسيارة متوقفة داخل السعودية."),
      this.createIssue("info", "car_realism_layers", "واقعية السيارة مفعلة: فيزياء إضاءة موحدة + حياة مواقف طبيعية + زجاج وانعكاسات متماسكة + معالجة Xiaomi واحدة للمشهد كاملًا.")
    ];
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
