import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"group",
  label:"Group",
  description:"Two-to-six-person phone-held group selfie",
  captureType:"group_selfie",
  scenes:["street"],
  clothingSource:"authority",
  poses:["phone-holder","distributed-group"],
  lighting:["group-natural"],
  realismLayers:["group-diversity","soft-life"],
  rules:{
    hard:["2-6 people","one phone-holder"],
    composition:["natural subject distribution","scene picker"],
    interaction:["distinct group identities"],
    exclusions:[]
  }
});

export default SECTION;
