import { CAR_TEMPLATES } from "./carPosesData.js";
import { HAIR_OPTIONS } from "./data/hairData.js";
import { EXPRESSION_OPTIONS } from "./data/expressionsData.js";
import { CLOTHING_OPTIONS } from "./data/clothingData.js";
import { buildCarUniversalPhysicalReality } from "./carPhysicalRealityShared.js";

const VERSION = "v1.33";
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

function sceneSentence(tpl) {
  return tpl.scene ? `TEMPLATE SCENE AUTHORITY\
${tpl.scene}. Keep this scene ordinary, parked and physically consistent with the selected crop; do not expand framing merely to prove the location. TIME / LIGHTING AUTHORITY: the user's current lighting selection overrides any historical template lighting metadata.` : "";
}

function cropSentence(tpl) {
  return `Use the selected ${tpl.name_ar} composition: ${tpl.angle}, ${tpl.framing}, at ${tpl.distance}. ${tpl.gaze}. Camera distance, face scale and crop are strict; never widen the frame merely to show more cabin, clothing, steering wheel or anatomy.`;
}

function seatedBiomechanics(tpl) {
  if (tpl.id === "rear_seat_selfie") {
    return "SEATED BIOMECHANICS: subject is physically seated in the rear row, with body weight supported by the rear seat cushion/backrest, natural shoulder asymmetry and no steering-wheel axis constraint. Front seatbacks and center tunnel are depth cues only when the selected crop naturally includes them.";
  }
  const passenger = tpl.cat === "passenger";
  return passenger
    ? "SEATED BIOMECHANICS: subject weight is carried naturally by the passenger seat with believable pelvis/thigh support, subtle seat compression where visible, relaxed torso asymmetry, anatomically plausible neck rotation and no floating body contact."
    : "SEATED BIOMECHANICS: subject weight is carried naturally by the driver seat with believable pelvis/thigh support, subtle seat compression where visible, shoulders and neck mechanically consistent with the selected camera angle, and no floating or twisted anatomy. Hidden lower-body geometry remains solved off-frame and never forces a wider crop.";
}

function poseSpecificMechanics(tpl) {
  const rules = {
    headrest_relaxed: "POSE CONTACT: the upper back and head may rest lightly into the seat/headrest. Show only subtle hair flattening or silhouette compression where actual contact is visible; keep the neck relaxed and do not push the headrest sideways to frame the face.",
    seatbelt_pause: "POSE CONTACT: the free hand may meet the real seatbelt near the upper chest only if that hand lies inside the selected crop. Belt tension must follow its anchor path and create small clothing indentation/contact shadows; never invent a floating belt segment or widen the frame to show the hand.",
    door_armrest_rest: "POSE CONTACT: the free forearm may rest on the real door armrest if visible. The supported shoulder lowers naturally, elbow/wrist alignment stays mechanically possible, and contact pressure subtly affects sleeve folds and armrest shadowing.",
    console_lean: "POSE BALANCE: torso leans about 10–15° toward the center console from pelvis/seat support, creating naturally unequal shoulders. Do not fake the lean by bending only the neck or shifting the head independently of the torso.",
    night_window_sidekey: "POSE GEOMETRY: head remains only 20–30° toward the side window while gaze returns to the lens. Lighting must come from the user's current selection; do not force a window-side key merely because this pose historically used one.",
    rear_seat_selfie: "POSE DEPTH: camera remains physically reachable from the rear-seat subject. Front seatbacks, B/C pillars and center tunnel may appear only as perspective-consistent depth cues; do not place the camera in the front row or outside the vehicle.",
    ac_steering_breeze: "POSE/CONTACT: one free hand may rest lightly on the upper steering-wheel rim with realistic finger wrap and knuckle flex while the other arm holds the phone. Shoulder elevation and clavicle tension must match the selfie hold; AC airflow affects only light hair strands, not the head or heavy hair mass.",
    food_wait_night: "POSE/WAITING STATE: relaxed driver posture with small natural asymmetry and a patient micro-expression. Keep steering wheel/seat support ordinary and avoid staged restaurant-ad posing. Lighting remains user-selected.",
    golden_window_breeze: "OPEN-WINDOW COUPLING: the driver window is genuinely open. Breeze enters from that side only, moving a limited set of side strands while the torso, clothing and heavier hair remain gravity-dominant. Lighting remains user-selected.",
    tree_dappled_driver: "SCENE COUPLING: preserve the leafy-tree location context without forcing dappled sunlight. If the user selects a lighting mode that does not support leaf-shadow patterns, omit them.",
    streetlight_cockpit: "SCENE COUPLING: preserve the street-light location context without forcing top-light behavior. The user's selected lighting preset is the sole lighting authority."
  };
  return rules[tpl.id] ? `POSE-SPECIFIC MECHANICS\
${rules[tpl.id]}` : "";
}

function seatBodyContactPressure(tpl) {
  const match = String(tpl.framing || "").match(/(\d{2})%/u);
  const close = match ? Number(match[1]) >= 68 : false;
  return `SEAT / BODY CONTACT PRESSURE LOCK
- The subject must read as physically seated, not composited in front of the seat. Wherever the selected crop reveals contact, body weight creates local seat/cushion compression, small leather/fabric tension changes, attached contact shadows and clothing bunching consistent with pressure and friction.
- Back/shoulder contact may flatten the shirt locally and slightly compress the seatback; pelvis/thigh load may depress the seat cushion only when those regions are actually visible.
- Contact response fades progressively away from the load zone. Do not create deep dents, vacuum-sealed clothing, rubbery upholstery or identical wrinkle patterns on both sides.
- The headrest affects hair or head silhouette only if real contact or near-contact is visible. No headrest may intersect the skull, disappear through hair or shift sideways to frame the face.
- ${close ? "This is a close selfie: prove seating only through visible shoulder/upper-back/headrest or adjacent seat response. Do not widen the crop to show pelvis, thighs or seat cushion." : "Use the additional visible torso/seat area to show a coherent load path, but never exaggerate pressure marks merely to demonstrate physics."}`;
}

function hairPhysics(tpl) {
  if (tpl.hairDynamics) {
    return `HAIR PHYSICS — TEMPLATE COUPLED: preserve IMAGE A hairline, density, color, haircut and baseline volume. ${tpl.hairDynamics}. Hair motion must follow real airflow direction, strand mass, friction and gravity; do not animate every strand equally or alter identity.`;
  }
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

function exteriorDepthThroughGlass() {
  return `EXTERIOR DEPTH THROUGH GLASS LOCK
- Any exterior visible through windshield or side glass must occupy real depth layers rather than one flat backdrop: near glass/reflection layer, middle-distance parked cars/columns/curbs, and farther lights/buildings/sky when the crop actually includes them.
- Apparent size, overlap, contrast, detail and sharpness must decrease with distance and atmospheric/light conditions. A distant lamp cannot have the same edge acuity and texture scale as a nearby pillar.
- Glass reflections remain on the glass plane while transmitted exterior objects remain behind it; do not merge both into one painted surface or blur them with one uniform digital mask.
- Near cabin frames and pillars occlude middle/far exterior geometry consistently. Moving the camera angle changes relative parallax between near frames, middle objects and distant lights.
- Tight close-ups may show only small abstract exterior slices. Do not expand the framing to showcase scenery, readable signage or parked vehicles.`;
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

function colorContamination(lightingId) {
  const mixed = ["N1", "N2", "N3", "N5", "N6"].includes(lightingId);
  if (!mixed) {
    return `COLOR CONTAMINATION LOCK
- Daylight or shaded-daylight color must still propagate through real surfaces consistently: skin, clothing, seat, trim and glass receive the same global white-balance solution and any weak material-colored bounce. Do not neutralize the face separately from the cabin.`;
  }
  return `COLOR CONTAMINATION LOCK — MIXED LIGHT
- Mixed sources must produce spatially different color contributions according to source direction and visibility. Warm sodium/storefront/practical spill and cooler LED/sky/canopy light may coexist on the same subject and cabin without being averaged into one clean studio white.
- The same directional color contamination must continue coherently across skin, beard, hair, clothing, seat, dashboard, pillars and glass wherever those surfaces are reached by the source. It must not stop at the facial boundary.
- Shadow-side color is governed by the actual weaker source and real cabin bounce, not by selective neutral fill. White balance is one camera decision for the full frame, so mixed light may remain imperfect.
- Reflections inherit the color of the source being reflected. Do not tint unrelated surfaces for decoration or create symmetric orange/blue grading unrelated to geometry.`;
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
  return `USER-SELECTED LIGHTING AUTHORITY — NON-NEGOTIABLE: ${base}${phoneBounce} The selected lighting control is the sole authority for time-of-day lighting and source behavior. Ignore tpl.preferredLighting, tpl.lightingOverride and any historical template-specific light suggestion. Every shadow, catchlight, skin highlight and glass reflection must trace back to the user's selected lighting preset and real scene surfaces.`;
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
  const poseMechanics = poseSpecificMechanics(tpl);
  const scene = sceneSentence(tpl);

  return `ROLE & TASK
Create one physically coherent, raw-looking candid smartphone selfie of the exact man from IMAGE A inside a stationary 2022 Range Rover Sport parked in Saudi Arabia. The result should behave like an ordinary Xiaomi 15 Ultra front-camera capture, not a polished studio portrait or CGI render.

${skinSentence()} Preserve ${cleanHair(hair)}.

${cabinSentence(hasCabin)}${scene ? `\
\
${scene}` : ""}

FRAMING & CAMERA AUTHORITY
${cropSentence(tpl)}

${cropAwareDetailBudget(tpl)}

${seatedBiomechanics(tpl)}${poseMechanics ? `\
\
${poseMechanics}` : ""}

${seatBodyContactPressure(tpl)}

${hairPhysics(tpl)}

${expressionPhysics(expression, tpl)}

${lightingSentence(lightingId)}

${colorContamination(lightingId)}

${glassMirrorParallax(tpl)}

${exteriorDepthThroughGlass()}

${cabinMaterialResponse()}

CLOTHING
Wearing ${cleanClothing(clothing)}. Fabric must show ordinary real thickness, seams, material-correct sheen, gravity-driven folds and seat/contact response only where visible. Clothing never expands the selected crop.

${opticsAndSensor()}

${buildCarUniversalPhysicalReality({ mode:"interior", poseId:tpl.id, stateId:lightingId })}

${onePipeline()}

FINAL CAPTURE GATE
Reject any result with altered identity geometry, warped facial proportions, over-smoothed skin, perfectly uniform pores, over-resolved hair, impossible arm mechanics, floating body/seat contact, impossible headrest intersection, floating or broken seatbelt geometry, unsupported armrest contact, torso/head pose mismatch, conflicting shadow directions, inconsistent mixed-light color propagation, decorative or pasted reflections, broken mirror parallax, flat exterior depth, uniform synthetic cabin materials, equal hyper-detail across all depths, artificial DSLR bokeh, selective face cleanup, synthetic cabin geometry or a medium portrait substituted for a selected close-up. Reject any result whose lighting does not match the user's currently selected lighting preset. Keep ordinary imperfections when physically justified. CAPTURED, NOT RENDERED.`;
}

function syncPrompt() {
  const output = document.querySelector(`#${OUTPUT_ID}`);
  if (!output) return false;
  const prompt = buildPrompt();
  if (output.textContent !== prompt) output.textContent = prompt;

  const count = document.querySelector("#promptWordCount");
  if (count) count.textContent = `${prompt.trim().split(/\s+/u).length} كلمة`;
  document.querySelectorAll(".car-version").forEach((node) => { node.textContent = VERSION; });
  return true;
}

function install() {
  if (document.documentElement[patchFlag]) return;
  document.documentElement[patchFlag] = true;

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
