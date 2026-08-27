import { CAR_TEMPLATES } from "./carPosesData.js";
import { HAIR_OPTIONS } from "./data/hairData.js";
import { EXPRESSION_OPTIONS } from "./data/expressionsData.js";
import { CLOTHING_OPTIONS } from "./data/clothingData.js";

const VERSION = "v1.21";
const OUTPUT_ID = "finalPrompt";
const patchFlag = Symbol.for("promptStudio.carCompactPromptRuntime.installed");

const LIGHTING = Object.freeze({
  N1: "N1 night lighting: mixed warm sodium spill and cool white parking LED entering through the real cabin glass, with directional color separation, realistic inverse-square falloff for nearby practicals, light-beige interior bounce, deep cabin shadows and natural low-light sensor noise.",
  N2: "N2 night lighting: irregular real storefront and sign spill through the windows, mixed with ordinary street practicals, with natural color contamination, glass reflections and cabin shadows.",
  N3: "N3 gas-station lighting: cool-white overhead canopy practicals entering through the glass, localized reflections on trim and windows, realistic cabin shadow falloff and modest highlight clipping.",
  N4: "N4 midday lighting: strong natural Saudi daylight through the windshield and side glass, brighter exterior exposure, deeper cabin shadows, physically plausible interior bounce and restrained smartphone HDR.",
  N5: "N5 dusk lighting: cool ambient sky mixed with sparse warm exterior practicals, natural mixed white balance, modest cabin underexposure and realistic glass reflections.",
  N6: "N6 underground-parking lighting: localized cool fluorescent/LED ceiling practicals, weak concrete bounce, darker gaps between fixtures, natural shadow noise and restrained clipping.",
  D2: "D2 shaded daylight: open-sky daylight entering indirectly while the parked vehicle remains under shade, with soft top-side illumination, brighter exterior slices and realistic cabin contrast."
});

function byId(list, id) {
  return list.find((item) => item.id === id) ?? list[0];
}

function activeTemplate() {
  const label = document.querySelector(".car-pose-card.is-active strong")?.textContent?.trim();
  return CAR_TEMPLATES.find((item) => item.name_ar === label) ?? CAR_TEMPLATES[0];
}

function selectedValue(id) {
  return document.querySelector(`#${id}`)?.value || "";
}

function cleanHair(hair) {
  if (!hair || hair.id === "same") return "the exact same dark wavy hair, hairline, density, baseline volume and natural texture as IMAGE A";
  return `${hair.name_en || hair.name_ar}, while preserving the exact hairline, density, baseline volume and identity from IMAGE A`;
}

function cleanExpression(expression) {
  return expression?.name_en ? expression.name_en.toLowerCase() : "relaxed candid expression";
}

function cleanClothing(clothing) {
  if (!clothing) return "ordinary natural clothing";
  return clothing.name_en || clothing.name_ar;
}

function cabinSentence(hasCabin) {
  return hasCabin
    ? "ENVIRONMENT LOCK (IMAGE B): use IMAGE B as the exact authority for every visible cabin detail. Preserve seat shape, stitching, headrest, dashboard, trim, glass, controls, colors, materials and geometry without redesigning, cleaning, mirroring, replacing or beautifying anything."
    : "ENVIRONMENT LOCK: use one coherent 2022 Range Rover Sport parked in Saudi Arabia with a realistic light-beige interior. Preserve internally consistent seat, headrest, dashboard, trim, glass and control geometry; show only what the selected crop naturally includes.";
}

function cropSentence(tpl) {
  return `Use the selected ${tpl.name_ar} composition: ${tpl.angle}, ${tpl.framing}, at ${tpl.distance}. ${tpl.gaze}. Camera distance, face scale and crop are strict; never widen the frame merely to show more cabin, clothing, steering wheel or anatomy.`;
}

function seatedBiomechanics(tpl) {
  const passenger = tpl.cat === "passenger";
  return passenger
    ? "SEATED BIOMECHANICS: subject weight is carried naturally by the passenger seat with believable pelvis/thigh support, subtle seat compression where visible, relaxed torso asymmetry, anatomically plausible neck rotation and no floating body contact."
    : "SEATED BIOMECHANICS: subject weight is carried naturally by the driver seat with believable pelvis/thigh support, subtle seat compression where visible, shoulders and neck mechanically consistent with the selected camera angle, and no floating or twisted anatomy. Hidden lower-body geometry remains solved off-frame and never forces a wider crop.";
}

function hairPhysics() {
  return "HAIR PHYSICS: preserve IMAGE A hairline, density, color and baseline volume. Hair may show small gravity-driven clumps, natural directional root flow, minor friction displacement where it touches a real headrest, and a few flyaways where lighting resolves them. Do not over-resolve every strand, invent extra volume, paint uniform glossy highlights or alter the haircut.";
}

function expressionPhysics(expression, tpl) {
  return `ANATOMICAL EXPRESSION: ${cleanExpression(expression)}, with the exact identity geometry from IMAGE A unchanged. Expression changes facial muscle state only; preserve eye size/spacing, jaw/chin bones, nose, lip volume, beard pattern and stable asymmetry. Eyelid aperture, cheek response and mouth-corner motion remain subtle and anatomically plausible. Follow the selected gaze exactly: ${tpl.gaze}. Corneal and tear-line reflections must correspond to the actual cabin/exterior light sources.`;
}

function glassMirrorParallax(tpl) {
  const mirrorSpecific = tpl.cat === "mirror"
    ? "Because this is a mirror-oriented template, the reflected view must be derived from the actual camera-to-mirror ray path and preserve correct handedness, occlusion and reflected viewing angle."
    : "Mirrors may appear only where naturally included by the selected crop; never enlarge or reposition them to showcase a reflection.";
  return `GLASS / MIRROR PARALLAX LOCK
- Windshield, side windows, mirrors and glossy trim are view-dependent optical surfaces, not decorative overlays. Reflections must shift with the selected camera angle and near-field phone position instead of staying pasted to the glass.
- Near glass may carry faint cabin/source reflections while still transmitting the exterior. Reflection strength, blur and contrast depend on real incidence angle, ambient brightness and glass orientation.
- A-pillar, door frame, mirror housing and window edges must occlude both transmitted and reflected content consistently. Exterior objects cannot pass through pillars, duplicate across panes or jump discontinuously between surfaces.
- Distant lights reflected in glass may stretch or soften only as physically supported by focus, motion and surface curvature. No giant flare, repeated light dots, mirrored duplicate vehicles, duplicated face, or impossible second cabin.
- ${mirrorSpecific}`;
}

function cabinMaterialResponse() {
  return `CABIN MATERIAL RESPONSE LOCK
- Different cabin materials must remain optically distinct under the SAME selected lighting and exposure. Do not render the interior as one uniformly glossy synthetic material.
- Light-beige leather or leather-like upholstery: broad soft highlights, visible grain only at supported distance, gentle compression and crease response at loaded seat/contact zones; never plastic shine or perfectly uniform pores.
- Matte dashboard and soft-touch plastics: low specular response with broad weak reflections and restrained texture; no wet gloss unless the actual reference material is glossy.
- Piano-black or other high-gloss trim, when actually present: sharper view-dependent reflections with rapid falloff away from the reflection angle, but never mirror-perfect unless the real surface behaves that way.
- Metal/chrome details: localized brighter specular highlights tied to source position, without glowing edges or painted white streaks.
- Glass: transparent/transmissive with view-dependent reflections and realistic tint; it must not behave like opaque black plastic.
- Material roughness, texture scale and highlight width must stay consistent across perspective and distance. Lighting changes illumination only, never material identity.`;
}

function cropAwareDetailBudget(tpl) {
  const match = String(tpl.framing || "").match(/(\d{2})%/u);
  const facePercent = match ? Number(match[1]) : 65;
  if (facePercent >= 80) {
    return `CROP-AWARE DETAIL BUDGET — FACE-DOMINANT
- Selected face scale is about ${facePercent}%. Spend the camera's resolving budget primarily on identity-critical facial structure, eyes, skin, beard and nearby hair.
- Cabin detail is subordinate and may be softer, darker, partially occluded or outside frame. Do not over-resolve stitching, controls, dashboard microtexture, exterior cars or distant signage simply because they exist conceptually.
- Only immediately adjacent shoulder, seat/headrest or glass details need coherent local texture. Hidden anatomy and cabin geometry stay solved off-frame without demanding visibility.`;
  }
  if (facePercent >= 65) {
    return `CROP-AWARE DETAIL BUDGET — BALANCED CLOSE SELFIE
- Selected face scale is about ${facePercent}%. Keep identity and facial texture as the primary detail target while allowing moderate readable cabin structure around the subject.
- Seat, glass, trim and nearby controls may resolve to ordinary phone-camera detail, but must remain less micro-detailed than the near face unless physically closer to the lens.
- Distant exterior elements remain lower-detail and must not compete with the subject.`;
  }
  return `CROP-AWARE DETAIL BUDGET — WIDER CABIN CONTEXT
- Selected face scale is about ${facePercent}%. Preserve facial identity while allocating more detail to visible seat, dashboard, wheel, glass and cabin geometry because the framing naturally includes more environment.
- Detail still falls with distance and illumination: near cabin surfaces may be readable, medium-distance surfaces softer, and exterior background lower-detail. Never make every plane equally sharp or equally textured.
- Do not compensate for the wider crop by sharpening the face or cabin beyond ordinary front-camera resolution.`;
}

function opticsAndSensor() {
  return `OPTICAL & SENSOR SIMULATION — XIAOMI 15 ULTRA FRONT CAMERA
- Use an ordinary near-field front-camera perspective around 22–24mm full-frame equivalent and approximately f/2.0, with mild physically plausible edge barrel tendency and natural handheld framing. Do not replace it with a rear camera, telephoto portrait lens, DSLR perspective or observer viewpoint.
- Selfie arm, hand and device remain completely outside the frame. Only natural deltoid/pectoral and shoulder tension may imply the physically reachable phone position; never create a stump, detached sleeve or visible phone edge.
- Keep small-sensor front-camera depth behavior: the cabin should remain structurally readable rather than receiving artificial DSLR bokeh or a portrait-mask cutout.
- Sensor response stays ordinary: authentic micro-contrast, finite dynamic range, restrained computational sharpening, mild edge softness, realistic compression, shadow luminance noise with restrained chroma noise in low-light zones, and modest highlight clipping where physically justified.
- No fixed ISO or shutter is imposed across all presets. Exposure behavior follows the selected lighting level and remains physically plausible for a handheld selfie.
- Zero beauty filter, zero skin smoothing, zero face-only denoise, zero local face relighting, zero waxy CGI skin.`;
}

function onePipeline() {
  return `ONE PIPELINE SENSOR CONSISTENCY
Face, eyes, skin, beard, hair, clothing, seat, headrest, dashboard, glass, reflections and exterior background belong to one single smartphone capture event with one lens model, one focus state, one exposure decision, one white balance, one HDR/computational merge behavior, one denoise pass, one sharpening behavior and one compression path. Darker areas may be noisier and softer; brighter areas cleaner. Never make the face cleaner, sharper, brighter or less noisy than the cabin without a physical lighting reason.`;
}

function lightingSentence(lightingId) {
  const base = LIGHTING[lightingId] || LIGHTING.N1;
  const phoneBounce = ["N1", "N2", "N3", "N5", "N6"].includes(lightingId)
    ? " A weak near-axis phone-screen contribution is allowed only if physically plausible at the selected distance; it must remain subordinate to the declared cabin/exterior sources and must not become a hidden beauty fill."
    : " Do not invent phone-screen fill in daylight unless the selected scene geometry would make a visible contribution plausible.";
  return `LIGHTING PHYSICS: ${base}${phoneBounce} Every shadow, catchlight, skin highlight and glass reflection must trace back to those real sources and real cabin surfaces. No invisible softbox, cinematic rim light or face-only exposure correction.`;
}

function skinSentence() {
  return "IDENTITY & SKIN LOCK (IMAGE A): preserve exact facial geometry and bone structure, skin undertones, natural regional pore variation, small skin irregularities and tonal variation, beard growth pattern, hairline, age and natural asymmetry. Do not force an exact copied blemish map under changed lighting; preserve the same real skin character without beautification, pore stamping or forensic over-detail.";
}

function buildPrompt() {
  const tpl = activeTemplate();
  const lightingId = selectedValue("lightingSelect") || "N1";
  const hair = byId(HAIR_OPTIONS, selectedValue("hairSelect"));
  const expression = byId(EXPRESSION_OPTIONS, selectedValue("expressionSelect"));
  const clothing = byId(CLOTHING_OPTIONS, selectedValue("clothingSelect"));
  const hasCabin = !document.querySelector("#cabinPreview")?.hidden;

  return `ROLE & TASK
Create one physically coherent, raw-looking candid smartphone selfie of the exact man from IMAGE A inside a stationary 2022 Range Rover Sport parked in Saudi Arabia. The result should behave like an ordinary Xiaomi 15 Ultra front-camera capture, not a polished studio portrait or CGI render.

${skinSentence()} Preserve ${cleanHair(hair)}.

${cabinSentence(hasCabin)}

FRAMING & CAMERA AUTHORITY
${cropSentence(tpl)}

${cropAwareDetailBudget(tpl)}

${seatedBiomechanics(tpl)}

${hairPhysics()}

${expressionPhysics(expression, tpl)}

${lightingSentence(lightingId)}

${glassMirrorParallax(tpl)}

${cabinMaterialResponse()}

CLOTHING
Wearing ${cleanClothing(clothing)}. Fabric must show ordinary real thickness, seams, material-correct sheen, gravity-driven folds and seat/contact response only where visible. Clothing never expands the selected crop.

${opticsAndSensor()}

${onePipeline()}

FINAL CAPTURE GATE
Reject any result with altered identity geometry, warped facial proportions, over-smoothed skin, perfectly uniform pores, over-resolved hair, impossible arm mechanics, conflicting shadow directions, decorative or pasted reflections, broken mirror parallax, uniform synthetic cabin materials, equal hyper-detail across all depths, artificial DSLR bokeh, selective face cleanup, synthetic cabin geometry or a medium portrait substituted for a selected close-up. Keep ordinary imperfections when physically justified. CAPTURED, NOT RENDERED.`;
}

function syncPrompt() {
  const output = document.querySelector(`#${OUTPUT_ID}`);
  if (!output) return false;
  const prompt = buildPrompt();
  if (output.textContent !== prompt) output.textContent = prompt;

  const count = document.querySelector("#promptWordCount");
  if (count) count.textContent = `${prompt.trim().split(/\s+/u).length} كلمة`;
  const version = document.querySelector(".car-version");
  if (version) version.textContent = VERSION;
  return true;
}

function install() {
  if (document.documentElement[patchFlag]) return;
  document.documentElement[patchFlag] = true;

  let writing = false;
  const output = document.querySelector(`#${OUTPUT_ID}`);
  const observer = output ? new MutationObserver(() => {
    if (writing) return;
    writing = true;
    queueMicrotask(() => {
      syncPrompt();
      writing = false;
    });
  }) : null;
  observer?.observe(output, { childList:true, characterData:true, subtree:true });

  document.addEventListener("change", () => queueMicrotask(syncPrompt));
  document.addEventListener("click", (event) => {
    if (event.target.closest(".car-pose-card, .car-chip, #cabinRemove")) queueMicrotask(syncPrompt);
  });
  document.querySelector("#cabinInput")?.addEventListener("change", () => setTimeout(syncPrompt, 0));

  syncPrompt();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once:true });
  else install();
}
