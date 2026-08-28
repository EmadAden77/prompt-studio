const VERSION = "v1.40";
const STORAGE_KEY = "prompt-studio:car-selfie-architecture:v1";
const MARKER_START = "CAR SELFIE ARCHITECTURE — CONSTRAINT DRIVEN";
const MARKER_END = "END CAR SELFIE ARCHITECTURE";

const LOCATIONS = Object.freeze([
  { id:"inside_driver", name_ar:"داخل السيارة · مقعد السائق", zone:"inside", prompt:"Subject is physically seated in the driver seat. Preserve left-hand-drive geometry, real seat support, steering-wheel axis when visible, and driver-side cabin perspective." },
  { id:"inside_passenger", name_ar:"داخل السيارة · مقعد الراكب", zone:"inside", prompt:"Subject is physically seated in the front passenger seat. No steering-wheel-axis constraint; preserve passenger-seat support, door/console geometry and reachable front-camera selfie perspective." },
  { id:"beside_door", name_ar:"بجانب السيارة · الاستناد على الباب", zone:"outside", prompt:"Subject stands beside the vehicle and leans lightly against the real door surface. Contact must create localized clothing compression, body/garment flattening, attached contact shadow and a mechanically plausible load path." },
  { id:"beside_roof", name_ar:"بجانب السيارة · الاستناد على السقف", zone:"outside", prompt:"Subject stands beside the vehicle with a natural light forearm/hand or upper-body lean on the roof edge only if physically reachable. Contact pressure, muscle support and garment deformation must stay localized to the true contact zone." },
  { id:"beside_mirror", name_ar:"بجانب السيارة · قرب المرآة الجانبية", zone:"outside", prompt:"Subject stands beside the side mirror area without intersecting the mirror or door. Keep realistic subject-to-car scale, clean occlusion and physically plausible proximity." }
]);

const BODY_PROFILES = Object.freeze([
  { id:"reference", name_ar:"من IMAGE A · تلقائي", prompt:"Use IMAGE A as the body-proportion authority. Do not infer exact height or weight that the reference does not support." },
  { id:"athletic_183_82", name_ar:"رياضي · 183 سم / 82 كجم", prompt:"Body profile: athletic adult, approximately 183 cm tall and 82 kg. Preserve IMAGE A identity and natural build; use these values only for large-scale proportion logic against seats, doors, roofline and standing height, never to reshape the face." },
  { id:"custom", name_ar:"مخصص", prompt:"Use the user's custom body-profile text only for large-scale body/car proportion logic. Facial identity remains locked to IMAGE A." }
]);

const BY_LOCATION = Object.freeze(Object.fromEntries(LOCATIONS.map(x => [x.id,x])));
const BY_BODY = Object.freeze(Object.fromEntries(BODY_PROFILES.map(x => [x.id,x])));
let writing = false;
let timer = 0;

const $ = (id) => document.getElementById(id);

function loadState(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveState(){
  const state = { location: $("carSelfieLocationSelect")?.value || "inside_driver", body: $("carBodyProfileSelect")?.value || "reference", custom: $("carBodyProfileCustom")?.value || "" };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}
function stripBlock(text){
  const start = text.indexOf(MARKER_START);
  if(start < 0) return text;
  const end = text.indexOf(MARKER_END,start);
  if(end < 0) return text.slice(0,start).trimEnd();
  return `${text.slice(0,start)}${text.slice(end+MARKER_END.length)}`.replace(/\n{3,}/g,"\n\n").trim();
}
function currentLocation(){ return BY_LOCATION[$("carSelfieLocationSelect")?.value] || BY_LOCATION.inside_driver; }
function currentBody(){ return BY_BODY[$("carBodyProfileSelect")?.value] || BY_BODY.reference; }
function bodyPrompt(){
  const body = currentBody();
  if(body.id !== "custom") return body.prompt;
  const custom = $("carBodyProfileCustom")?.value?.trim();
  return custom ? `${body.prompt} USER BODY PROFILE: ${custom}` : `${body.prompt} No custom dimensions were supplied, so fall back conservatively to IMAGE A.`;
}
function seatbeltPhysics(location){
  if(location.zone !== "inside") return "SEATBELT PHYSICS: not applicable unless a real visible belt is actually worn in the selected scene; never invent a belt merely to demonstrate physics.";
  return `SEATBELT PHYSICS — CONDITIONAL\n- If a real visible seatbelt is worn, follow its actual anchor path across shoulder/chest/torso. It creates mild localized fabric indentation, tension lines and attached contact shadows proportional to belt tension.\n- Do not cut through the neck, float off the torso, merge into clothing, or create impossible anchor points.\n- If the chosen pose/template does not visibly include a worn belt, do NOT invent one.`;
}
function reflectionPhysics(location){
  return location.zone === "inside"
    ? `REFLECTION COHERENCE — INTERIOR\n- Side glass, windshield, mirrors, glossy trim and any sunglasses reflect only sources/objects that are geometrically visible from the selected optical path.\n- A faint phone/screen-shaped reflection may appear ONLY if physically supported by a real reflective surface and viewing angle; never add it as a realism token.\n- Steering-wheel or hand reflections likewise appear only where the actual ray path supports them.`
    : `REFLECTION COHERENCE — EXTERIOR\n- Vehicle paint, windows, mirror housing and chrome respond to the selected real environment lighting with view-dependent reflections.\n- Night street/practical colors may reflect on paint/glass only where sources actually exist; daytime reflections must follow sky/sun/shade geometry.\n- No decorative neon wash, fake studio strip lights or impossible mirrored duplicates.`;
}
function conflictRules(location){
  const zoneRule = location.zone === "inside"
    ? `- INSIDE-CAR DISTANCE CONFLICT: full-body framing is forbidden for a subject-held front-camera selfie inside the cabin. If any template requests full body or a remote viewpoint, keep the selfie at reachable arm length and crop to face/shoulders/upper torso as physically possible.`
    : `- OUTSIDE-CAR PROPORTION CONFLICT: preserve credible human-to-vehicle scale. Use the selected body profile only for coarse standing-height and reach logic against the door, mirror and roofline; never stretch limbs or resize the car to force a pose.`;
  return `SELFIE CONFLICT RULES — HARD GATES\n${zoneRule}\n- LIGHTING CONFLICT: perfect studio lighting, invisible beauty fill, face-only relight and shadowless commercial illumination are forbidden. Use uneven source-driven light with physically justified falloff, occlusion, reflections and mixed white balance where applicable.\n- CAMERA CONFLICT: subject-held front camera only. No external photographer, passenger-held substitute, dashboard camera, tripod, rear-camera portrait or floating observer viewpoint.\n- IDENTITY CONFLICT: IMAGE A facial identity lock outranks body profile, location, contact, camera angle, template and lighting.\n- If any lower-priority request cannot coexist physically, simplify framing/pose/context rather than changing identity or violating camera reach.`;
}
function architectureBlock(){
  const location = currentLocation();
  return `${MARKER_START}\nSELECTED SELFIE LOCATION — ${location.name_ar}\n${location.prompt}\n\nBODY / VEHICLE PROPORTION PROFILE\n${bodyPrompt()}\n\nCONTACT PHYSICS\n${location.zone === "outside" ? "At every visible body-to-car contact, solve load first, then localized skin/muscle/clothing compression, friction, occlusion and attached contact shadow. No floating lean, no body clipping through metal, and no exaggerated denting." : "Seat, backrest, headrest, belt and clothing contacts must be mechanically continuous wherever visible; hidden regions remain solved off-frame."}\n\n${seatbeltPhysics(location)}\n\n${reflectionPhysics(location)}\n\n${conflictRules(location)}\n\nPRIORITY ORDER\nIMAGE A facial identity → body proportion authority → selfie location → contact/support physics → selected selfie angle → angle template/framing → time & lighting → reflections → sensor/exposure → aesthetics.\n${MARKER_END}`;
}
function applyPrompt(){
  const output = $("finalPrompt");
  if(!output || writing) return;
  const clean = stripBlock(output.textContent || "");
  if(!clean.trim()) return;
  const angleMarker = "SELFIE ANGLE AUTHORITY — USER SELECTED";
  const block = architectureBlock();
  let next;
  const idx = clean.indexOf(angleMarker);
  if(idx >= 0) next = `${clean.slice(0,idx).trimEnd()}\n\n${block}\n\n${clean.slice(idx)}`.trim();
  else next = `${clean.trim()}\n\n${block}`;
  if(next === output.textContent) return;
  writing = true;
  output.textContent = next;
  const wc = $("promptWordCount");
  if(wc) wc.textContent = `${next.trim().split(/\s+/).filter(Boolean).length} كلمة`;
  queueMicrotask(() => { writing = false; });
}
function scheduleApply(){ clearTimeout(timer); timer = setTimeout(applyPrompt, 24); }
function updateUiState(){
  const location = currentLocation();
  document.documentElement.dataset.carSelfieLocation = location.id;
  document.documentElement.dataset.carSelfieZone = location.zone;
  const custom = $("carBodyProfileCustom");
  if(custom) custom.hidden = currentBody().id !== "custom";
  const summary = $("carArchitectureSummary");
  if(summary) summary.textContent = location.zone === "inside" ? "داخل السيارة: Full Body ممنوع، حزام الأمان مشروط بظهوره الحقيقي." : "خارج السيارة: تلامس وضغط حقيقي + نسب بشر/سيارة محفوظة.";
}
function installControls(){
  if($("carSelfieArchitectureControls")) return;
  const form = document.querySelector(".car-form-grid");
  if(!form) return;
  const saved = loadState();
  const wrap = document.createElement("div");
  wrap.id = "carSelfieArchitectureControls";
  wrap.className = "field field--wide";
  wrap.innerHTML = `<label for="carSelfieLocationSelect">📍 موقع السيلفي</label><select id="carSelfieLocationSelect"></select><small>الموقع يحدد قواعد التلامس، قابلية الكادر، ونسبة الجسم إلى السيارة.</small><label for="carBodyProfileSelect">📏 ملف بنية الجسم</label><select id="carBodyProfileSelect"></select><input id="carBodyProfileCustom" type="text" placeholder="مثال: 180 سم، 78 كجم، بنية رياضية" hidden><small id="carArchitectureSummary"></small>`;
  const locationSelect = wrap.querySelector("#carSelfieLocationSelect");
  LOCATIONS.forEach(x => { const o=document.createElement("option"); o.value=x.id; o.textContent=x.name_ar; locationSelect.appendChild(o); });
  locationSelect.value = BY_LOCATION[saved.location] ? saved.location : "inside_driver";
  const bodySelect = wrap.querySelector("#carBodyProfileSelect");
  BODY_PROFILES.forEach(x => { const o=document.createElement("option"); o.value=x.id; o.textContent=x.name_ar; bodySelect.appendChild(o); });
  bodySelect.value = BY_BODY[saved.body] ? saved.body : "reference";
  wrap.querySelector("#carBodyProfileCustom").value = saved.custom || "";
  form.prepend(wrap);
  const changed = () => { saveState(); updateUiState(); document.querySelector("#rebuildBtn")?.click(); scheduleApply(); };
  locationSelect.addEventListener("change", changed);
  bodySelect.addEventListener("change", changed);
  wrap.querySelector("#carBodyProfileCustom").addEventListener("input", () => { saveState(); scheduleApply(); });
  updateUiState();
}
function updateVersion(){
  document.querySelectorAll(".car-version").forEach(n => n.textContent = VERSION);
  const brand = document.querySelector(".brand small"); if(brand) brand.textContent = `Car Templates ${VERSION}`;
  const eyebrow = document.querySelector(".intro .eyebrow"); if(eyebrow) eyebrow.textContent = `CAR SELFIE ENGINE · ${VERSION}`;
  document.title = `قوالب السيارة ${VERSION} — AI Selfie Prompt Studio`;
}
function install(){
  installControls();
  updateVersion();
  ["lightingSelect","hairSelect","expressionSelect","clothingSelect","carSelfieAngleSelect","carSelfieAngleTemplateSelect"].forEach(id => $(id)?.addEventListener("change", scheduleApply));
  document.addEventListener("car-time-change", scheduleApply);
  document.addEventListener("click", e => { if(e.target.closest(".car-pose-card,.car-exterior-card,.car-chip,.car-mode-btn,#copyBtn,#downloadBtn")) scheduleApply(); }, true);
  setTimeout(scheduleApply, 0);
}

if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, {once:true}); else install();
