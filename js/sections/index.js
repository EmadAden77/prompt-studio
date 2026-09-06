import soloBase from "./solo.js";
import groupBase from "./group.js";
import carBase from "./car.js";
import carExteriorBase from "./carExterior.js";
import bedroomBase from "./bedroom.js";
import gymBase from "./gym.js";
import streetBase from "./street.js";
import accidentalBase from "./accidental.js";
import customBase from "./custom.js";
import mirror from "./mirror.js";
import { deepFreeze } from "./_freeze.js";
import { profileForSection } from "./wikiprompt-phase47-profiles.js";

function phase47(section) {
  const profile = profileForSection(section.id);
  return deepFreeze({
    ...section,
    actionDescription:section.actionDescription || profile.actionDescription,
    imperfections:section.imperfections || profile.imperfections,
    rules:{
      ...section.rules,
      contextualRules:section.rules?.contextualRules || { clothing:"scene-appropriate", accessories:"activity-appropriate", lighting:"time-and-place coherent", expression:"action-coherent" }
    }
  });
}

const solo = phase47(soloBase);
const group = phase47(groupBase);
const car = phase47(carBase);
const carExterior = phase47(carExteriorBase);
const bedroom = phase47(bedroomBase);
const gym = phase47(gymBase);
const street = phase47(streetBase);
const accidental = phase47(accidentalBase);
const custom = phase47(customBase);

export const SECTION_REGISTRY = Object.freeze({ solo, group, car, carExterior, bedroom, gym, street, accidental, custom, mirror });

export function getSection(id) { return SECTION_REGISTRY[String(id || "").trim()] || null; }

export default SECTION_REGISTRY;
