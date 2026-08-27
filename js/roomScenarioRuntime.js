import { PoseEngine } from "./engines/poseEngine.js";
import { getActiveRoomScenario, IMMUTABLE_ROOM_SCENARIO_LOCK } from "./roomScenarioTemplates.js";

const originalEngineer = PoseEngine.prototype.engineer;

function towelClothingLock() {
  return `CLOTHING LOCK — POST-SHOWER TEMPLATE OVERRIDE
This scenario overrides the normal clothing selector while it is active.
The adult male subject wears ONLY one opaque white medium-weight cotton bath towel securely wrapped around the waist. No shirt, undershirt, trousers, shorts, underwear, robe, or second towel is visible.
The towel fully covers pelvis and buttocks. Its support is mechanical, not decorative: real overlap/tuck at the waist, localized compression where secured, material thickness, edge weight, gravity-led folds from hip/waist loading, and restrained friction against damp skin.
If waffle texture is used, keep the cell scale irregular and camera-resolvable only; never stamp a perfectly repeated oversized grid. The towel must remain real cloth, not painted onto the body, vacuum-wrapped, paper-thin, rubbery, glossy, or CGI-smooth.
Do not copy any clothing from IMAGE A and do not use the clothing currently shown in the manual clothing selector for this post-shower scenario.`;
}

PoseEngine.prototype.engineer = function engineerWithRoomScenario(args = {}) {
  const sections = originalEngineer.call(this, args);
  if (!sections) return sections;

  const scenario = getActiveRoomScenario(args.pose);
  if (!scenario) return sections;

  sections.posePhysics = `${IMMUTABLE_ROOM_SCENARIO_LOCK}\n\n${scenario.promptBlock}\n\n${sections.posePhysics}`;
  if (scenario.forcedClothingId === "bath_towel_only") {
    sections.clothing = towelClothingLock();
  }
  return sections;
};
