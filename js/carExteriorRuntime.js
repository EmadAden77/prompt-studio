import { HAIR_OPTIONS } from "./data/hairData.js";
import { EXPRESSION_OPTIONS } from "./data/expressionsData.js";
import { CLOTHING_OPTIONS } from "./data/clothingData.js";

const VERSION = "v1.24";
const exteriorPoses = Object.freeze([
  { id:"driver_door_stand", name_ar:"واقف بجانب باب السائق", framing:"three-quarter body", distance:"1.2–1.8m", angle:"eye-level 3/4", gaze:"into lens", mechanics:"Weight mostly on the leg away from the car; near shoulder relaxed; keep a natural 15–25 cm clearance from the door unless a real contact point is specified." },
  { id:"shoulder_door_lean", name_ar:"اتكاء خفيف بالكتف على الباب", framing:"waist-up to three-quarter", distance:"1.0–1.6m", angle:"eye-level slight 3/4", gaze:"into lens", mechanics:"One shoulder contacts the door skin lightly; pelvis counter-shifts away; shirt compresses locally at the shoulder; the door panel must not dent unnaturally." },
  { id:"hip_fender_lean", name_ar:"اتكاء بالورك على الرفرف الأمامي", framing:"three-quarter body", distance:"1.4–2.0m", angle:"front 3/4", gaze:"into lens", mechanics:"Hip contact is light and localized; supporting leg bears most weight; free knee softens slightly; preserve plausible clearance from wheel arch and mirror." },
  { id:"hand_roof", name_ar:"يد على سقف السيارة", framing:"waist-up", distance:"1.1–1.7m", angle:"eye-level", gaze:"into lens", mechanics:"Free hand rests lightly on the roof edge with realistic wrist angle and finger contact; shoulder elevation follows reach; no stretched arm anatomy." },
  { id:"door_handle_pause", name_ar:"يد على مقبض الباب", framing:"waist-up to three-quarter", distance:"1.1–1.8m", angle:"side 3/4", gaze:"into lens", mechanics:"Hand wraps the real door handle with plausible finger occlusion; elbow hangs naturally; body remains close enough to reach without shoulder distortion." },
  { id:"open_door_pause", name_ar:"وقفة عند باب السائق المفتوح", framing:"three-quarter body", distance:"1.5–2.2m", angle:"front-side 3/4", gaze:"into lens", mechanics:"Driver door is genuinely open on its hinge; body occupies the door opening naturally; do not intersect the door edge, mirror, sill or seat." },
  { id:"front_quarter_stand", name_ar:"واقف قرب المقدمة 3/4", framing:"three-quarter to full body", distance:"1.8–2.8m", angle:"front 3/4", gaze:"into lens", mechanics:"Keep a believable person-to-bumper distance; feet remain on one ground plane; vehicle perspective and body perspective share the same camera." },
  { id:"rear_quarter_stand", name_ar:"واقف قرب المؤخرة", framing:"three-quarter to full body", distance:"1.8–2.8m", angle:"rear 3/4", gaze:"into lens", mechanics:"Maintain realistic clearance from tailgate and bumper; no body-car overlap unless an explicit hand contact is selected." },
  { id:"walk_alongside", name_ar:"يمشي بمحاذاة السيارة", framing:"three-quarter body", distance:"1.8–2.6m", angle:"side 3/4", gaze:"brief glance toward lens", mechanics:"Use a real walking gait: opposite arm/leg phase, one foot loaded and the other transitioning, slight vertical pelvis asymmetry; only mild motion softness if exposure justifies it." },
  { id:"close_car_selfie", name_ar:"سيلفي قريب والسيارة خلفه", framing:"face 65–75%", distance:"30–45cm", angle:"front camera eye-level", gaze:"into lens", mechanics:"Subject-held front-camera selfie. Phone and selfie arm stay outside frame; only a coherent slice of door/window/roof may appear behind the face. Never force the whole SUV into a close selfie." },
  { id:"low_car_selfie", name_ar:"سيلفي منخفض والسيارة خلفه", framing:"face 55–65%", distance:"35–55cm", angle:"10–20° low front camera", gaze:"down toward lens", mechanics:"Subject-held low selfie with reachable phone position; vehicle rises behind naturally due perspective; avoid exaggerated heroic advertising geometry." },
  { id:"side_reflection_selfie", name_ar:"سيلفي جانبي مع انعكاس الباب", framing:"face 60–70%", distance:"35–50cm", angle:"side/front 3/4 front camera", gaze:"into lens", mechanics:"Allow only a partial physically warped reflection of the subject on the clearcoat if angle supports it; never create a second full person in the door." }
]);

const parkingOptions = Object.freeze([
  { id:"open_asphalt_day", name:"موقف إسفلتي نهاري مفتوح", prompt:"ordinary open-air Saudi parking lot with sun-aged asphalt, slightly worn parking lines, concrete curbs, sparse practical landscaping, irregular parked cars and unbranded low-rise/commercial context" },
  { id:"shade_canopy_day", name:"موقف تحت مظلات نهارية", prompt:"real Saudi shade-canopy parking with steel posts, fabric/metal shade structure, alternating sun and shade zones, heat-bright exterior edges, ordinary asphalt and irregular parked vehicles" },
  { id:"mall_night", name:"موقف مركز تجاري ليلي", prompt:"ordinary Saudi mall parking at night with cool-white pole/parking LEDs, mixed warm spill from distant entrances, asphalt, curbs, scattered parked cars and no invented readable storefront text" },
  { id:"underground", name:"موقف تحت الأرض", prompt:"real concrete underground parking with columns, numbered/painted zones only if not readable in detail, cool fluorescent/LED pools, darker gaps, tire marks and ordinary parked cars" },
  { id:"office_shade", name:"موقف مبنى نهاري مظلل", prompt:"parking beside a Saudi office/residential building in open shade, realistic façade bounce, curb edges, concrete wheel stops, sparse vehicles and bright sun beyond the shaded area" },
  { id:"dusk_open", name:"موقف مفتوح وقت الغسق", prompt:"open Saudi parking at dusk with cool sky ambient, first warm/cool practical lights turning on, modest underexposure in deep areas and believable parked-car reflections" }
]);

function byId(list, id) { return list.find((x) => x.id === id) ?? list[0]; }
function selected(id) { return document.querySelector(`#${id}`)?.value || ""; }
function hairText() { const h = byId(HAIR_OPTIONS, selected("hairSelect")); return h?.id === "same" ? "exact hairline, density, volume, color and natural texture from IMAGE A" : `${h?.name_en || h?.name_ar}, while preserving identity-locked hairline and density from IMAGE A`; }
function expressionText() { const x = byId(EXPRESSION_OPTIONS, selected("expressionSelect")); return x?.name_en || x?.name_ar || "relaxed candid expression"; }
function clothingText() { const x = byId(CLOTHING_OPTIONS, selected("clothingSelect")); return x?.name_en || x?.name_ar || "ordinary casual clothing"; }

function exteriorPrompt(pose, parking) {
  const selfie = pose.id.includes("selfie");
  return `ROLE & TASK\nCreate one physically coherent, raw-looking smartphone photograph of the exact man from IMAGE A beside a stationary white 2022 Range Rover Sport in a real Saudi parking environment. This must feel like an ordinary captured moment, not an automotive advertisement, CGI render or fashion shoot.\n\nIDENTITY LOCK (IMAGE A)\nPreserve exact facial geometry, bone structure, skin undertones, natural regional pore variation, beard growth pattern, age, natural asymmetry, and ${hairText()}. No beautification, face slimming, symmetry correction, waxy skin or selective cleanup.\n\nOUTDOOR PARKING ENVIRONMENT AUTHORITY\nUse ${parking.prompt}. Keep the environment ordinary and geographically plausible without invented logos, readable fake plates, cloned cars, staged crowds or perfect showroom cleanliness. Parking geometry, curbs, columns, shade structures, wheel stops and surrounding vehicles must occupy one consistent perspective and ground plane.\n\nPOSE & CAMERA AUTHORITY\nSelected pose: ${pose.name_ar}. Camera: ${pose.angle}; framing: ${pose.framing}; distance: ${pose.distance}; gaze: ${pose.gaze}. ${pose.mechanics}\n${selfie ? "This is a subject-held front-camera selfie using an ordinary 22–24mm-equivalent near-field perspective. The phone, hand and entire selfie arm remain outside frame. Camera reach and crop outrank vehicle visibility." : "Use an ordinary smartphone photograph viewpoint at the declared distance. Do not use telephoto advertising compression, drone-like height or a floating impossible camera position."}\n\nGROUND / FOOT CONTACT LOCK\nFeet, shoes and body weight belong to the same ground plane as the vehicle tires. Loaded foot has attached contact shadow and believable sole contact; pelvis, knee and ankle alignment must follow the stance. No floating feet, duplicated shoes, impossible ankle bend or body pasted over asphalt.\n\nBODY–CAR CONTACT PHYSICS\nAny hand, shoulder or hip contact must occur at one exact reachable point with correct occlusion, clothing compression, joint angle and local contact shadow. If no contact is declared, preserve a visible air gap. Never merge skin or clothing into paint, glass, mirror or door edges.\n\nCAR PAINT / CLEARCOAT RESPONSE\nWhite paint retains a real basecoat/clearcoat response: broad environment reflections on flatter panels, stretched/curved reflections across fenders and doors, source-shaped specular highlights, realistic panel gaps and no uniform mirror finish. Reflections of the subject, parking lights, cars or canopy must follow surface curvature and viewing angle and may be partial or weak.\n\nBODY–CAR REFLECTION PARALLAX\nAny visible reflection of the subject in paint or side glass must derive from the real camera-person-car geometry. It shifts across curved panels, changes scale with distance, and may be occluded by handles, pillars or panel edges. Never duplicate the full subject, face, limbs or vehicle as a second clean copy.\n\nEXTERIOR GLASS LOCK\nWindshield and side glass simultaneously transmit and reflect according to incidence angle and relative brightness. Sky/canopy/building reflections may dominate in bright conditions; cabin visibility remains limited accordingly. Do not show a perfectly exposed interior through strongly reflective glass while also preserving a strong exterior reflection.\n\nSUN / SHADOW COHERENCE\nAll shadows and highlights share the same physical sources. Person, vehicle, tires, mirrors, posts and nearby cars must agree on sun/LED direction, shadow softness, color and length. Building/canopy shade changes illumination but not geometry. No hidden beauty fill or face-only relighting.\n\nTIRE / GROUND / VEHICLE LOAD LOCK\nAll four visible tires sit on the same ground plane with believable contact patches, attached underbody/tire shadows and subtle ambient occlusion. The SUV has real mass. No floating wheels, mismatched wheel perspective, duplicated rims, impossible suspension height or tires penetrating asphalt/curbs.\n\nCAR VISIBILITY BUDGET\nFraming determines how much vehicle can exist in frame. A close selfie may show only door, window, roofline or fender fragments; a three-quarter/full-body view may reveal much more of the SUV. Never widen a close shot merely to show the whole vehicle, and never shrink the person unnaturally to advertise the car.\n\nLIGHT / COLOR / MATERIAL CONSISTENCY\nSkin, hair, clothing, white paint, black trim, tires, glass, asphalt and background vehicles belong to one exposure, white balance, HDR/denoise/sharpening and compression pipeline. Material roughness remains distinct: skin is not paint, tires are not plastic trim, glass is not opaque black, and asphalt does not share the car's gloss. Mixed light contaminates every reached surface coherently.\n\nCLOTHING & EXPRESSION\nExpression: ${expressionText()}, natural and identity-preserving. Wearing ${clothingText()}; fabric thickness, seams, folds and contact response follow gravity, stance and any body-car contact.\n\nFINAL CAPTURE GATE\nReject floating feet, impossible body-car contact, inconsistent shadows, fake full-body reflections, cloned cars, flat parking-lot depth, glossy-plastic asphalt, showroom-perfect paint, warped wheels, impossible glass, excessive bokeh, face-only cleanup, cinematic grading or equal hyper-detail at every distance. Keep ordinary phone imperfections when justified: slight framing imbalance, finite dynamic range, modest clipping, shadow noise, restrained sharpening and mild edge softness. CAPTURED, NOT RENDERED.`;
}

function install() {
  const categoryShell = document.querySelector(".car-category-shell");
  const templatePanel = document.querySelector("#templatesTitle")?.closest(".panel");
  const outputColumn = document.querySelector(".output-column");
  if (!categoryShell || !templatePanel || !outputColumn || document.querySelector("#carModeBar")) return;

  const style = document.createElement("style");
  style.textContent = `.car-mode-bar{display:flex;gap:8px;margin:12px 0}.car-mode-btn{flex:1;border:1px solid var(--border-color,rgba(127,127,127,.22));border-radius:14px;padding:12px;font:inherit;font-weight:800;background:var(--surface-raised,rgba(127,127,127,.05));color:inherit;cursor:pointer}.car-mode-btn.is-active{outline:2px solid currentColor;outline-offset:1px}.car-exterior-controls{display:grid;gap:12px;margin-bottom:14px}.car-exterior-pose-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.car-exterior-card{text-align:right;border:1px solid var(--border-color,rgba(127,127,127,.18));border-radius:14px;padding:12px;background:var(--surface-raised,rgba(127,127,127,.04));color:inherit;font:inherit;cursor:pointer}.car-exterior-card.is-active{outline:2px solid currentColor}.car-exterior-card small{display:block;opacity:.75;margin-top:5px}.car-exterior-output{display:none}.car-page[data-car-mode="exterior"] .car-category-shell,.car-page[data-car-mode="exterior"] #templatesTitle{display:none}.car-page[data-car-mode="exterior"] #templatesTitle+*{display:none}@media(max-width:760px){.car-exterior-pose-grid{grid-template-columns:1fr}}`;
  document.head.append(style);

  const modeBar = document.createElement("div");
  modeBar.id = "carModeBar";
  modeBar.className = "car-mode-bar";
  modeBar.innerHTML = `<button type="button" class="car-mode-btn is-active" data-mode="interior">🚗 داخل السيارة</button><button type="button" class="car-mode-btn" data-mode="exterior">🅿️ خارج السيارة</button>`;
  categoryShell.before(modeBar);

  const exteriorPanel = document.createElement("section");
  exteriorPanel.className = "panel car-exterior-controls";
  exteriorPanel.hidden = true;
  exteriorPanel.innerHTML = `<div class="panel__header"><div><span class="step-number">01</span><h2>خارج السيارة</h2></div><span class="context-badge">مواقف سعودية واقعية</span></div><div class="field"><label for="exteriorParkingSelect">نوع الموقف</label><select id="exteriorParkingSelect"></select></div><div id="exteriorPoseGrid" class="car-exterior-pose-grid"></div>`;
  templatePanel.after(exteriorPanel);

  const oldPromptPanel = outputColumn.querySelector(".prompt-panel");
  const exteriorOutput = document.createElement("section");
  exteriorOutput.className = "prompt-panel car-exterior-output";
  exteriorOutput.innerHTML = `<div class="prompt-panel__header"><div><p class="eyebrow">READY FOR CHATGPT</p><h2>FINAL EXTERIOR CAR PROMPT</h2></div><span id="exteriorWordCount" class="word-count">0 كلمة</span></div><div id="exteriorSummary" class="selection-summary"></div><div class="car-status-row"><span id="exteriorStatus" class="validation-status">IMAGE A إلزامي قبل النسخ</span><span class="car-version">${VERSION}</span></div><div class="prompt-editor"><pre id="exteriorPrompt" tabindex="0"></pre></div><div class="validation-summary">Identity → Stance → Ground → Car Geometry → Contact → Camera → Light → Paint/Glass → Parking Environment → Sensor</div><div class="car-output-actions"><button id="exteriorCopyBtn" class="primary-button" type="button" disabled>📋 نسخ</button></div>`;
  outputColumn.append(exteriorOutput);

  const parkingSelect = exteriorPanel.querySelector("#exteriorParkingSelect");
  parkingOptions.forEach((p) => { const o=document.createElement("option"); o.value=p.id; o.textContent=p.name; parkingSelect.append(o); });
  let activePose = exteriorPoses[0];
  const poseGrid = exteriorPanel.querySelector("#exteriorPoseGrid");
  const renderPoses = () => {
    poseGrid.replaceChildren(...exteriorPoses.map((p) => { const b=document.createElement("button"); b.type="button"; b.className=`car-exterior-card${p.id===activePose.id?" is-active":""}`; b.innerHTML=`<strong>${p.name_ar}</strong><small>${p.angle} · ${p.distance} · ${p.framing}</small>`; b.addEventListener("click",()=>{activePose=p; renderPoses(); sync();}); return b; }));
  };
  const sync = () => {
    const parking = byId(parkingOptions, parkingSelect.value);
    const prompt = exteriorPrompt(activePose, parking);
    exteriorOutput.querySelector("#exteriorPrompt").textContent = prompt;
    exteriorOutput.querySelector("#exteriorWordCount").textContent = `${prompt.trim().split(/\s+/u).length} كلمة`;
    exteriorOutput.querySelector("#exteriorSummary").textContent = `🅿️ ${activePose.name_ar} · ${parking.name}`;
    const ready = !document.querySelector("#imageAPreview")?.hidden;
    exteriorOutput.querySelector("#exteriorCopyBtn").disabled = !ready;
    const status = exteriorOutput.querySelector("#exteriorStatus");
    status.textContent = ready ? `جاهز · ${VERSION} · خارج السيارة` : "IMAGE A إلزامي قبل النسخ";
    status.className = `validation-status${ready?" is-valid":""}`;
  };
  renderPoses(); sync();
  parkingSelect.addEventListener("change", sync);
  document.addEventListener("change", (e) => { if (["hairSelect","expressionSelect","clothingSelect","imageAInput"].includes(e.target?.id)) queueMicrotask(sync); });
  document.querySelector("#imageARemove")?.addEventListener("click",()=>setTimeout(sync,0));
  exteriorOutput.querySelector("#exteriorCopyBtn").addEventListener("click", async()=>{ const text=exteriorOutput.querySelector("#exteriorPrompt").textContent; await navigator.clipboard.writeText(text); exteriorOutput.querySelector("#exteriorStatus").textContent="تم نسخ أمر خارج السيارة ✓"; });

  const setMode = (mode) => {
    document.body.dataset.carMode = mode;
    modeBar.querySelectorAll(".car-mode-btn").forEach((b)=>b.classList.toggle("is-active", b.dataset.mode===mode));
    const exterior = mode === "exterior";
    categoryShell.hidden = exterior;
    templatePanel.hidden = exterior;
    exteriorPanel.hidden = !exterior;
    oldPromptPanel.style.display = exterior ? "none" : "";
    exteriorOutput.style.display = exterior ? "block" : "none";
    sync();
  };
  modeBar.addEventListener("click",(e)=>{ const b=e.target.closest("[data-mode]"); if(b) setMode(b.dataset.mode); });
  setMode("interior");
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once:true }); else install();
