import assert from "node:assert/strict";
import {
  CAR_ARMLESS_POSE_OPTIONS,
  rememberPhase53CarArmlessPose,
  getRememberedPhase53CarArmlessPose,
  syncPhase53CarArmlessPoseOptions
} from "../js/phase53-car-armless-ui.js";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-phase53.js";

function option(value,label=value,phase53=false){
  return { value, textContent:label, dataset:phase53?{phase53CarArmless:"true"}:{}, remove(){ this.__removed=true; } };
}

function makeSelect(values=[]){
  const select={
    _options:values.map(value=>option(value)),
    value:values[0]||"",
    get options(){ return this._options.filter(item=>!item.__removed); },
    querySelectorAll(selector){
      if(selector!=="option[data-phase53-car-armless]") return [];
      return this.options.filter(item=>item.dataset?.phase53CarArmless);
    },
    append(item){ this._options.push(item); },
    replaceWithValues(next){ this._options=next.map(value=>option(value)); this.value=next[0]||""; }
  };
  return select;
}

const section={value:"car"};
const pose=makeSelect(["car-driver-close","car-driver-relaxed","car-driver-side","car-driver-low","car-roof-context"]);
globalThis.document={
  querySelector(selector){
    if(selector==="#studio-section") return section;
    if(selector==="#pose") return pose;
    return null;
  },
  createElement(tag){ assert.equal(tag,"option"); return option(""); }
};

syncPhase53CarArmlessPoseOptions();
for(const item of CAR_ARMLESS_POSE_OPTIONS){
  assert.ok(pose.options.some(entry=>entry.value===item.value),`missing live option ${item.value}`);
}

const chosen="passenger-close-armless";
pose.value=chosen;
rememberPhase53CarArmlessPose(chosen);
assert.equal(getRememberedPhase53CarArmlessPose(),chosen);

// Simulate physics-app-v7 refreshDynamicFields rebuilding #pose from the legacy pose catalog.
pose.replaceWithValues(["car-driver-close","car-driver-relaxed","car-driver-side","car-driver-low","car-roof-context"]);
assert.equal(pose.value,"car-driver-close","fixture must reproduce the live UI reset");
syncPhase53CarArmlessPoseOptions();
assert.equal(pose.value,chosen,"Phase 57 must restore the user's armless pose after the legacy UI rebuild");

// A future native catalog entry must not produce duplicate options.
pose.replaceWithValues(["car-driver-close",chosen]);
syncPhase53CarArmlessPoseOptions();
assert.equal(pose.options.filter(entry=>entry.value===chosen).length,1,"native armless option must not be duplicated");
assert.equal(pose.value,chosen,"remembered armless pose must remain selected when it becomes native");

const out=buildCanonicalV3UserOutput({
  hasReference:true,studioSection:"car",scene:"rangeRover",pose:chosen,
  time:"night",lighting:"car-night",clothing:"formal-shirt-gray-trouser-black",expression:"neutral",hair:"same"
});
assert.equal(out.phase53.active,true,"restored live selection must reach the canonical Phase 53 path");
assert.equal(out.phase53.pose,chosen);
assert.equal(out.phase56.active,true);
assert.match(out.prompt,/front passenger seat/iu);
assert.match(out.prompt,/no steering wheel in frame/iu);
assert.doesNotMatch(out.prompt,/holding the phone at arm reach/iu);

section.value="bedroom";
syncPhase53CarArmlessPoseOptions();
assert.equal(getRememberedPhase53CarArmlessPose(),"","remembered car pose must clear outside the car section");

delete globalThis.document;
console.log("PHASE57_LIVE_UI_RESET_REPRODUCED=true");
console.log("PHASE57_ARMLESS_SELECTION_PRESERVED=true");
console.log("PHASE57_CANONICAL_ROUTE=phase53+phase56");
console.log("Phase 57 car armless live UI routing: PASS");
