export const CAR_ARMLESS_POSE_OPTIONS = Object.freeze([
  Object.freeze({ value:"driver-close-armless", label:"قريب من مقعد السائق — مستوى العين (الذراع خارج الإطار)" }),
  Object.freeze({ value:"driver-low-armless", label:"منخفض من مقعد السائق — أسفل العين قليلًا (الذراع خارج الإطار)" }),
  Object.freeze({ value:"driver-side-armless", label:"جانبي من مقعد السائق — ثلاثة أرباع (الذراع خارج الإطار)" }),
  Object.freeze({ value:"driver-roof-armless", label:"ميل نحو السقف البانورامي (الذراع خارج الإطار)" }),
  Object.freeze({ value:"passenger-close-armless", label:"قريب من مقعد الراكب — مستوى العين (الذراع خارج الإطار)" }),
  Object.freeze({ value:"rear-seat-armless", label:"من المقعد الخلفي — مستوى العين (الذراع خارج الإطار)" })
]);

function activeSection(){ return document.querySelector("#studio-section")?.value||""; }

export function syncPhase53CarArmlessPoseOptions(){
  if(typeof document==="undefined") return;
  const select=document.querySelector("#pose");
  if(!select) return;

  for(const option of [...select.querySelectorAll("option[data-phase53-car-armless]")]) option.remove();
  if(activeSection()!=="car") return;

  const current=select.value;
  for(const item of CAR_ARMLESS_POSE_OPTIONS){
    const option=document.createElement("option");
    option.value=item.value;
    option.textContent=item.label;
    option.dataset.phase53CarArmless="true";
    select.append(option);
  }
  if([...select.options].some(option=>option.value===current)) select.value=current;
}

function scheduleSync(){ queueMicrotask(syncPhase53CarArmlessPoseOptions); }

export function installPhase53CarArmlessUI(){
  if(typeof document==="undefined") return;
  scheduleSync();
  document.addEventListener("change",event=>{
    if(["studio-section","pose","composition"].includes(event.target?.id)) scheduleSync();
  },true);
  document.addEventListener("click",event=>{
    if(event.target?.closest?.("#studio-section-grid .studio-section-card")) setTimeout(syncPhase53CarArmlessPoseOptions,0);
  },true);
}

if(typeof document!=="undefined") installPhase53CarArmlessUI();
