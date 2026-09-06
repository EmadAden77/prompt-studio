import { getSection } from "./sections/index.js";

const qs=selector=>document.querySelector(selector);
const controls=node=>node?[...(node.matches?.("input,select,textarea")?[node]:node.querySelectorAll?.("input,select,textarea")||[])]:[];

function setNodeState(selector,{hidden=false,disabled=false}={}){
  const node=qs(selector);
  if(!node) return;
  node.hidden=hidden;
  for(const control of controls(node)) control.disabled=disabled;
}

function setControlState(selector,{hidden=false,disabled=false}={}){
  const control=qs(selector);
  if(!control) return;
  const field=control.closest("label");
  if(field) field.hidden=hidden;
  control.disabled=disabled;
}

function activeSection(){ return qs("#studio-section")?.value||"solo"; }

function syncCommonFields(){
  const id=activeSection();
  const section=getSection(id)||getSection("solo");
  const ui=section?.rules?.ui||{};
  const carExterior=ui.dedicatedControls==="carExterior";
  const carInterior=ui.dedicatedControls==="carInterior";

  // Car interior is deliberately narrow: fixed cabin/seat authority plus
  // driver pose and car lighting. Generic context/detail controls are hidden
  // so stale city, crowd, fabric-state or background selections cannot leak.
  setNodeState("#post-processing-panel",{hidden:carInterior,disabled:carInterior});
  setNodeState('[aria-labelledby="realism-core-title"]',{hidden:carInterior,disabled:carInterior});
  setNodeState('[aria-labelledby="advanced-realism-title"]',{hidden:carInterior,disabled:carInterior});
  setNodeState(".context-secondary-panel",{hidden:carInterior,disabled:carInterior});
  setControlState("#hair",{hidden:carInterior,disabled:carInterior});
  setControlState("#skin",{hidden:carInterior,disabled:carInterior});

  // Core user authorities remain available: outfit, expression and time.
  setControlState("#clothing",{hidden:false,disabled:false});
  setControlState("#clothing-custom",{hidden:false,disabled:false});
  setControlState("#expression",{hidden:false,disabled:false});
  setControlState("#time",{hidden:false,disabled:false});

  for(const selector of ["#fabric","#fabric-weight","#iron-state","#wear-state","#clothing-fit","#composition","#selfie-angle"]){
    setControlState(selector,{hidden:carInterior,disabled:carInterior});
  }

  // carExterior owns pose and lighting through its dedicated controls.
  // carInterior intentionally keeps the generic pose/lighting selectors active.
  setControlState("#pose",{hidden:carExterior,disabled:carExterior});
  setControlState("#pose-family",{hidden:carExterior||carInterior,disabled:carExterior||carInterior});
  setControlState("#lighting",{hidden:carExterior,disabled:carExterior});
  setNodeState("#car-exterior-fields",{hidden:!carExterior,disabled:!carExterior});

  const showScene=Boolean(ui.showScenePicker)&&!carInterior;
  setNodeState("#scene-field",{hidden:!showScene,disabled:!showScene});

  const custom=id==="custom";
  setNodeState("#custom-scene-field",{hidden:!custom,disabled:!custom});
  setNodeState("#custom-scene-details-field",{hidden:!custom,disabled:!custom});
  setNodeState("#scene-profile-field",{hidden:!custom,disabled:!custom});

  const bedroom=id==="bedroom"||id==="mirror";
  setNodeState("#bedroom-window-field",{hidden:!bedroom,disabled:!bedroom});

  const group=id==="group";
  setNodeState("#group-selfie-fields",{hidden:!group,disabled:!group});
  for(const selector of ["#group-kind-field","#group-vibe-field"]) setNodeState(selector,{hidden:!group,disabled:!group});

  const accidental=id==="accidental";
  setNodeState("#accidental-capture-fields",{hidden:!accidental,disabled:!accidental});

  const street=id==="street";
  setNodeState("#street-mood-field",{hidden:!street,disabled:!street});
  const streetHour=qs("#street-hour-field");
  if(streetHour){
    const auto=qs("#street-mood")?.value==="auto";
    setNodeState("#street-hour-field",{hidden:!street||!auto,disabled:!street||!auto});
  }
}

function scheduleLateSync(){
  queueMicrotask(syncCommonFields);
  setTimeout(()=>setTimeout(syncCommonFields,0),0);
}

export function installPhase54SectionFieldUI(){
  if(typeof document==="undefined") return;
  scheduleLateSync();
  document.addEventListener("change",scheduleLateSync,true);
  document.addEventListener("input",scheduleLateSync,true);
  document.addEventListener("click",event=>{
    if(event.target?.closest?.("#studio-section-grid .studio-section-card")) scheduleLateSync();
  },true);
  window.addEventListener("popstate",scheduleLateSync);

  const form=qs("#prompt-form");
  if(form&&typeof MutationObserver!=="undefined"){
    const observer=new MutationObserver(()=>scheduleLateSync());
    observer.observe(form,{childList:true,subtree:true});
  }
}

if(typeof document!=="undefined") installPhase54SectionFieldUI();