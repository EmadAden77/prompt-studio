import { deepFreeze } from "./_freeze.js";

export const SECTION = deepFreeze({
  id:"group",
  label:"👥 السيلفي الجماعي",
  description:"قسم مستقل لعدد الأشخاص وصاحب الهاتف وتوزيع المجموعة، مع اختيار المشهد",
  captureType:"group_selfie",
  scenes:["street","bedroom","gym"],
  clothingSource:"authority",
  poses:["phone-holder","distributed-group"],
  lighting:["group-natural","scene"],
  realismLayers:["group-diversity","soft-life"],
  rules:{
    hard:["2-6 people","one phone-holder"],
    composition:["natural subject distribution","scene picker"],
    interaction:["distinct group identities"],
    exclusions:[],
    routing:{ intentType:"group", sceneMode:"fallback", defaultScene:"street" },
    wiring:{ enabled:true, clothing:true, lighting:true, pose:true, expression:true, body:true, selfieArmLock:true, groupFields:true, groupMaxPeople:6 },
    ui:{ scenarioMode:"group", scene:"street", groupMode:"group", captureMode:"normal", showScenePicker:true }
  }
});

export default SECTION;
