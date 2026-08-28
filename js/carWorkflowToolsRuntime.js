const VERSION = "v1.41";
const STATE_KEY = "prompt-studio:car-workflow-tools:v1";
const CONTEXT_START = "CAR SAUDI CONTEXT / WEATHER — USER SELECTED";
const CONTEXT_END = "END CAR SAUDI CONTEXT / WEATHER";

const CONTEXTS = Object.freeze({
  mall:{name:"مول / مجمع تجاري",prompt:"Saudi mall or commercial-complex parking context: moderate-to-high parked-car density, believable pedestrian activity only where naturally visible, real parking lanes/curbs/columns and practical lighting appropriate to the selected time. No invented readable brands or staged crowds."},
  work:{name:"دوام / مواقف أعمال",prompt:"Saudi workplace/business parking context: orderly but imperfect vehicle spacing, restrained pedestrian activity, office/parking geometry and shade structures where plausible. Keep the environment ordinary rather than showroom-clean."},
  mosque:{name:"مسجد / مواقف هادئة",prompt:"Saudi mosque parking context: calmer vehicle/pedestrian density, plausible shade canopy/curb/paving context only when supported by the selected scene, no invented religious text or decorative architecture solely for atmosphere."},
  commercial:{name:"شارع تجاري",prompt:"Saudi commercial-street context: irregular parked vehicles, curb/roadside depth, restrained storefront light or daylight according to selected time, sparse natural pedestrian presence, no readable invented shop names."},
  home_garage:{name:"كراج / موقف منزل",prompt:"Saudi residential garage/home-parking context: low vehicle density, ordinary residential surfaces and practicals, physically plausible wall/gate/driveway context only where the framing includes it; no luxury-showroom staging."}
});

const WEATHER = Object.freeze({
  clear:{name:"صحو عادي",prompt:"Ordinary clear conditions. Do not add weather artifacts merely for texture."},
  after_rain:{name:"بعد مطر · أسفلت رطب",prompt:"Recent-rain state only: wetness remains physically patchy, with darker asphalt, localized puddles only in plausible depressions, and view-dependent reflections of real lights/sky. No uniform mirror-road effect and no active rain unless explicitly selected elsewhere."},
  light_dust:{name:"غبار خفيف نهاري",prompt:"Light airborne/desert dust only when compatible with DAY: modest distance contrast loss and warm-neutral atmospheric attenuation. Do not create sandstorm haze or erase nearby detail."},
  ac_fog:{name:"تكثف خفيف من التكييف",prompt:"Localized mild window condensation/fogging only on glass zones physically affected by temperature/humidity difference; preserve clear patches, edge gradients and believable wiping/airflow patterns. Never fog the camera lens or face."},
  dusty_glass:{name:"فيلم غبار على الزجاج",prompt:"Subtle non-uniform dust film on relevant exterior glass only, visible mainly through grazing light/reflections. Do not add forensic fingerprints, decorative grime or uniform noise texture."}
});

const REPAIRS = Object.freeze([
  {id:"face",label:"الوجه تغيّر",text:`EMERGENCY REPAIR — FACIAL IDENTITY\nRebuild the same shot without changing anything except facial identity correction. Restore the exact stable craniofacial geometry and landmarks from IMAGE A after compensating only for perspective, head pose and expression. No face slimming, jaw/nose/eye/lip redesign, beautification, age drift or skin-tone identity drift. Keep camera, crop, pose, clothing, lighting, car and background unchanged.`},
  {id:"arm",label:"ذراع ظهرت",text:`EMERGENCY REPAIR — SELFIE ARM\nRebuild the same shot with the phone, hand, wrist, forearm, elbow and complete camera-holding arm fully outside the crop. Preserve a physically reachable hidden shoulder-to-hand chain and the same near-field front-camera optical center. Do not widen the frame, create a stump, empty grip, replacement phone or observer-camera perspective.`},
  {id:"light",label:"الإضاءة ما انطبقت",text:`EMERGENCY REPAIR — LIGHTING\nKeep identity, pose, camera, crop, clothing, car and location unchanged. Re-solve illumination strictly from the currently selected real lighting source(s), with correct direction, falloff, occlusion, reflections, white balance, exposure and sensor noise. Remove invisible studio fill, face-only relighting and any time-of-day conflict.`},
  {id:"seat",label:"الجلوس ملخبط",text:`EMERGENCY REPAIR — SEATED BIOMECHANICS\nKeep the same identity, camera angle, crop, clothing and lighting. Re-solve pelvis/seat support, torso, shoulders, neck and visible limb continuity as one mechanically possible seated body. Add only physically visible seat/clothing compression and contact shadows; no floating torso, impossible twist or widened crop to prove hidden anatomy.`},
  {id:"pipeline",label:"الخلفية أنظف من الوجه",text:`EMERGENCY REPAIR — SINGLE SENSOR PIPELINE\nRebuild the same composition using one smartphone processing event for face, hair, clothing, cabin, glass and background. Match exposure, white balance, noise, denoise, sharpening, HDR and compression coherently across the frame. Do not selectively smooth, brighten, sharpen or denoise the face or background.`}
]);

const LOCKS = Object.freeze([
  ["ABSOLUTE FACIAL IDENTITY LOCK — IMAGE A HIGHEST PRIORITY","قفل هوية الوجه"],
  ["CAR SELFIE ARCHITECTURE — CONSTRAINT DRIVEN","هندسة الموقع والتلامس"],
  ["SELFIE ANGLE AUTHORITY — USER SELECTED","زاوية السيلفي"],
  ["CAR TIME AUTHORITY — ABSOLUTE","وقت التصوير"],
  ["GLOBAL FABRIC PHYSICS","فيزياء الملابس"],
  ["SINGLE PIPELINE","معالجة هاتف موحدة"],
  [CONTEXT_START,"السياق والطقس"]
]);

let contextTimer = 0;
const $ = id => document.getElementById(id);

function loadState(){ try{return JSON.parse(localStorage.getItem(STATE_KEY)||"{}");}catch{return{};} }
function saveState(){
  const state={context:$("carSaudiContext")?.value||"mall",weather:$("carWeatherState")?.value||"clear"};
  try{localStorage.setItem(STATE_KEY,JSON.stringify(state));}catch{}
}
function stripContext(text){
  const start=text.indexOf(CONTEXT_START); if(start<0)return text;
  const end=text.indexOf(CONTEXT_END,start); if(end<0)return text.slice(0,start).trimEnd();
  return `${text.slice(0,start)}${text.slice(end+CONTEXT_END.length)}`.replace(/\n{3,}/g,"\n\n").trim();
}
function contextBlock(){
  const c=CONTEXTS[$("carSaudiContext")?.value]||CONTEXTS.mall;
  const w=WEATHER[$("carWeatherState")?.value]||WEATHER.clear;
  const time=document.documentElement.dataset.carTime||"night";
  const dustGate=$("carWeatherState")?.value==="light_dust"&&time!=="day" ? "CONFLICT: light daytime dust is incompatible with NIGHT; omit airborne dust and keep ordinary clear night atmosphere." : "";
  return `${CONTEXT_START}\nSELECTED SAUDI CONTEXT — ${c.name}\n${c.prompt}\n\nSELECTED ATMOSPHERE — ${w.name}\n${w.prompt}\n${dustGate}\n\nCONTEXT PHYSICS GATE\n- Context and weather may alter only environment state, surface wetness/dust/condensation, pedestrian/parking density and physically motivated reflections.\n- They must not alter IMAGE A identity, body proportions, selected selfie location, camera reach, car geometry, clothing, expression or selected time/lighting authority.\n- Never add a weather artifact or Saudi-context prop merely as a realism token when it would not be visible from the selected crop.\n${CONTEXT_END}`;
}
function applyContext(){
  const out=$("finalPrompt"); if(!out)return;
  const clean=stripContext(out.textContent||""); if(!clean.trim())return;
  const arch="CAR SELFIE ARCHITECTURE — CONSTRAINT DRIVEN";
  const idx=clean.indexOf(arch);
  const block=contextBlock();
  const next=idx>=0?`${clean.slice(0,idx).trimEnd()}\n\n${block}\n\n${clean.slice(idx)}`:`${clean.trim()}\n\n${block}`;
  if(next===out.textContent)return;
  out.textContent=next;
  const wc=$("promptWordCount"); if(wc)wc.textContent=`${next.trim().split(/\s+/).filter(Boolean).length} كلمة`;
  refreshLocks();
}
function scheduleContext(){ clearTimeout(contextTimer); contextTimer=setTimeout(applyContext,80); }

async function copyText(text,status){
  try{await navigator.clipboard.writeText(text); status.textContent="تم النسخ ✓";}
  catch{status.textContent="تعذر النسخ من المتصفح";}
}
function installRepairCenter(){
  const actions=document.querySelector(".car-output-actions"); if(!actions||$("carRepairCenter"))return;
  const panel=document.createElement("section"); panel.id="carRepairCenter"; panel.hidden=true;
  panel.style.cssText="margin-top:12px;padding:12px;border:1px solid var(--border-color,rgba(127,127,127,.18));border-radius:14px;display:grid;gap:8px";
  panel.innerHTML=`<strong>🧯 مركز الإصلاح السريع</strong><small>انسخ رقعة واحدة وأرسلها بعد النتيجة التي تحتاج تصحيحًا.</small><div id="carRepairButtons" style="display:flex;gap:7px;flex-wrap:wrap"></div><small id="carRepairStatus"></small>`;
  actions.after(panel); panel.hidden=true;
  const holder=panel.querySelector("#carRepairButtons"), status=panel.querySelector("#carRepairStatus");
  REPAIRS.forEach(r=>{const b=document.createElement("button");b.type="button";b.className="ghost-button";b.textContent=r.label;b.addEventListener("click",()=>copyText(r.text,status));holder.appendChild(b);});
  $("copyBtn")?.addEventListener("click",()=>setTimeout(()=>{panel.hidden=false;},0));
}
function refreshLocks(){
  const box=$("carLocksList"); if(!box)return;
  const text=$("finalPrompt")?.textContent||"";
  box.innerHTML="";
  LOCKS.forEach(([marker,label])=>{const row=document.createElement("label");const ok=text.includes(marker);row.style.cssText="display:flex;gap:7px;align-items:center";row.innerHTML=`<input type="checkbox" ${ok?"checked":""} disabled><span>${label}</span>`;box.appendChild(row);});
}
function installLocks(){
  const summary=$("promptSummary"); if(!summary||$("carLocksInspector"))return;
  const details=document.createElement("details");details.id="carLocksInspector";details.style.cssText="margin:10px 0;padding:10px;border:1px solid var(--border-color,rgba(127,127,127,.18));border-radius:12px";details.innerHTML=`<summary style="cursor:pointer;font-weight:800">🔒 الأقفال المحقونة فعليًا</summary><div id="carLocksList" style="display:grid;gap:6px;margin-top:8px"></div>`;summary.after(details);refreshLocks();
}
function sessionPrompts(base){
  const clean=base.trim();
  const shared=`SESSION CONTINUITY LOCK — ALL THREE SHOTS\nTreat these as three photographs from one continuous real session. Keep the exact same IMAGE A identity, hair, beard, clothing, expression baseline, selected car/cabin, Saudi context, weather state, time, lighting sources, white balance family and smartphone processing character. Do not copy identical noise, folds, reflections or micro-details between frames; continuity is physical state, not pixel duplication.`;
  return [
    ["1 · كلوز أب",`${clean}\n\n${shared}\nSHOT 1 — CLOSE-UP: face-dominant reachable front-camera selfie, natural eye-level or currently selected angle, minimal cabin context, identity first.`],
    ["2 · ميلان عفوي",`${clean}\n\n${shared}\nSHOT 2 — CANDID LEAN: preserve the same session state but introduce one mechanically plausible small torso/shoulder lean and 2–4° frame roll or small lateral phone offset, not both aggressively.`],
    ["3 · تفقد مرآة",`${clean}\n\n${shared}\nSHOT 3 — MIRROR-CHECK MOMENT: preserve the same session state while the head/gaze briefly relates to a real vehicle mirror. Keep the actual capture as a subject-held front-camera selfie; the mirror is scene geometry, not a replacement camera path.`]
  ];
}
function installSession(){
  const actions=document.querySelector(".car-output-actions"); if(!actions||$("carSessionBtn"))return;
  const btn=document.createElement("button");btn.id="carSessionBtn";btn.type="button";btn.className="secondary-button";btn.textContent="🎞️ جلسة واحدة · 3 لقطات";actions.prepend(btn);
  const panel=document.createElement("section");panel.id="carSessionPanel";panel.hidden=true;panel.style.cssText="margin-top:12px;display:grid;gap:10px";actions.after(panel);
  btn.addEventListener("click",()=>{
    applyContext(); const base=$("finalPrompt")?.textContent||""; if(!base.trim())return;
    panel.innerHTML=""; sessionPrompts(base).forEach(([title,text])=>{const card=document.createElement("div");card.style.cssText="padding:10px;border:1px solid var(--border-color,rgba(127,127,127,.18));border-radius:12px;display:grid;gap:7px";const h=document.createElement("strong");h.textContent=title;const copy=document.createElement("button");copy.type="button";copy.className="ghost-button";copy.textContent="نسخ هذا الـPrompt";const s=document.createElement("small");copy.addEventListener("click",()=>copyText(text,s));card.append(h,copy,s);panel.appendChild(card);}); panel.hidden=false;
  });
}
function installContext(){
  const form=document.querySelector(".car-form-grid"); if(!form||$("carSaudiContext"))return;
  const saved=loadState(); const wrap=document.createElement("div");wrap.className="field field--wide";wrap.id="carSaudiContextControls";wrap.style.cssText="display:grid;gap:7px";
  wrap.innerHTML=`<label for="carSaudiContext">🇸🇦 سياق المكان</label><select id="carSaudiContext"></select><label for="carWeatherState">🌦️ الطقس / حالة الجو</label><select id="carWeatherState"></select><small>السياق والطقس يغيّران البيئة والانعكاسات فقط، ولا يغيران الهوية أو هندسة السيلفي.</small>`;
  const cs=wrap.querySelector("#carSaudiContext"),ws=wrap.querySelector("#carWeatherState");
  Object.entries(CONTEXTS).forEach(([id,x])=>cs.add(new Option(x.name,id))); Object.entries(WEATHER).forEach(([id,x])=>ws.add(new Option(x.name,id)));
  cs.value=CONTEXTS[saved.context]?saved.context:"mall"; ws.value=WEATHER[saved.weather]?saved.weather:"clear"; form.appendChild(wrap);
  [cs,ws].forEach(el=>el.addEventListener("change",()=>{saveState();scheduleContext();}));
}
function updateVersion(){
  document.querySelectorAll(".car-version").forEach(n=>n.textContent=VERSION);
  const brand=document.querySelector(".brand small");if(brand)brand.textContent=`Car Templates ${VERSION}`;
  const eyebrow=document.querySelector(".intro .eyebrow");if(eyebrow)eyebrow.textContent=`CAR SELFIE ENGINE · ${VERSION}`;
  document.title=`قوالب السيارة ${VERSION} — AI Selfie Prompt Studio`;
}
function install(){
  installContext(); installLocks(); installRepairCenter(); installSession(); updateVersion();
  ["lightingSelect","hairSelect","expressionSelect","clothingSelect","carSelfieLocationSelect","carBodyProfileSelect","carSelfieAngleSelect","carSelfieAngleTemplateSelect"].forEach(id=>$(id)?.addEventListener("change",scheduleContext));
  document.addEventListener("car-time-change",scheduleContext);
  document.addEventListener("click",e=>{if(e.target.closest(".car-pose-card,.car-exterior-card,.car-chip,.car-mode-btn"))scheduleContext();},true);
  setTimeout(()=>{scheduleContext();refreshLocks();},120);
  setInterval(refreshLocks,1500);
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
