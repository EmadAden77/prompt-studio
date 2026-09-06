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

  // Common user controls stay interactive in every section. Section-specific
  // alternatives may replace only the conflicting generic control itself.
  setNodeState("#post-processing-panel",{hidden:false,disabled:false});
  setNodeState('[aria-labelledby="realism-core-title"]',{hidden:false,disabled:false});
  setNodeState('[aria-labelledby="advanced-realism-title"]',{hidden:false,disabled:false});
  setNodeState(".context-secondary-panel",{hidden:false,disabled:false});
  setControlState("#hair",{hidden:false,disabled:false});
  setControlState("#skin",{hidden:false,disabled:false});
  setControlState("#clothing",{hidden:false,disabled:false});
  for(const selector of ["#fabric","#fabric-weight","#iron-state","#wear-state","#clothing-fit","#clothing-custom","#expression","#composition","#selfie-angle","#time"]){
    setControlState(selector,{hidden:false,disabled:false});
  }

  // Dedicated carExterior controls replace generic pose/lighting only.
  setControlState("#pose",{hidden:carExterior,disabled:carExterior});
  setControlState("#pose-family",{hidden:carExterior,disabled:carExterior});
  setControlState("#lighting",{hidden:carExterior,disabled:carExterior});
  setNodeState("#car-exterior-fields",{hidden:!carExterior,disabled:!carExterior});

  const showScene=Boolean(ui.showScenePicker);
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

export function installPhase54SectionFieldUI(){
  if(typeof document==="undefined") return;
  const sync=()=>queueMicrotask(syncCommonFields);
  sync();
  document.addEventListener("change",sync,true);
  document.addEventListener("click",event=>{
    if(event.target?.closest?.("#studio-section-grid .studio-section-card")) setTimeout(syncCommonFields,0);
  },true);
  window.addEventListener("popstate",()=>setTimeout(syncCommonFields,0));
}

if(typeof document!=="undefined") installPhase54SectionFieldUI();
