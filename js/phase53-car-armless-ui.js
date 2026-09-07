export const CAR_ARMLESS_POSE_OPTIONS = Object.freeze([
  Object.freeze({ value:"driver-close-armless", label:"قريب من مقعد السائق — مستوى العين (الذراع خارج الإطار)" }),
  Object.freeze({ value:"driver-low-armless", label:"منخفض من مقعد السائق — أسفل العين قليلًا (الذراع خارج الإطار)" }),
  Object.freeze({ value:"driver-side-armless", label:"جانبي من مقعد السائق — ثلاثة أرباع (الذراع خارج الإطار)" }),
  Object.freeze({ value:"driver-roof-armless", label:"ميل نحو السقف البانورامي (الذراع خارج الإطار)" }),
  Object.freeze({ value:"passenger-close-armless", label:"قريب من مقعد الراكب — مستوى العين (الذراع خارج الإطار)" }),
  Object.freeze({ value:"rear-seat-armless", label:"من المقعد الخلفي — مستوى العين (الذراع خارج الإطار)" })
]);

const ARMLESS_VALUES=new Set(CAR_ARMLESS_POSE_OPTIONS.map(item=>item.value));
let rememberedArmlessPose="";

function activeSection(){ return document.querySelector("#studio-section")?.value||""; }
function isArmlessPose(value){ return ARMLESS_VALUES.has(String(value||"")); }

export function rememberPhase53CarArmlessPose(value=""){
  rememberedArmlessPose=isArmlessPose(value)?String(value):"";
  return rememberedArmlessPose;
}

export function getRememberedPhase53CarArmlessPose(){ return rememberedArmlessPose; }

export function syncPhase53CarArmlessPoseOptions(){
  if(typeof document==="undefined") return;
  const select=document.querySelector("#pose");
  if(!select) return;

  const current=select.value;
  if(isArmlessPose(current)) rememberedArmlessPose=current;

  for(const option of [...select.querySelectorAll("option[data-phase53-car-armless]")]) option.remove();
  if(activeSection()!=="car"){
    rememberedArmlessPose="";
    return;
  }

  const existingValues=new Set([...select.options].map(option=>option.value));
  for(const item of CAR_ARMLESS_POSE_OPTIONS){
    if(existingValues.has(item.value)) continue;
    const option=document.createElement("option");
    option.value=item.value;
    option.textContent=item.label;
    option.dataset.phase53CarArmless="true";
    select.append(option);
  }

  const target=isArmlessPose(rememberedArmlessPose)?rememberedArmlessPose:current;
  if([...select.options].some(option=>option.value===target)) select.value=target;
}

function scheduleSync(){ queueMicrotask(syncPhase53CarArmlessPoseOptions); }

export function installPhase53CarArmlessUI(){
  if(typeof document==="undefined") return;
  scheduleSync();
  document.addEventListener("change",event=>{
    const id=event.target?.id;
    if(id==="pose"){
      const selected=event.target?.value||"";
      if(activeSection()==="car") rememberPhase53CarArmlessPose(selected);
      else rememberedArmlessPose="";
    }
    if(["studio-section","pose","pose-family","selfie-angle","composition","scene","time"].includes(id)) scheduleSync();
  },true);
  document.addEventListener("click",event=>{
    if(event.target?.closest?.("#studio-section-grid .studio-section-card")) setTimeout(syncPhase53CarArmlessPoseOptions,0);
  },true);
}

if(typeof document!=="undefined") installPhase53CarArmlessUI();
