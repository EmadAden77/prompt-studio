import solo from "./solo.js";
import group from "./group.js";
import car from "./car.js";
import carExterior from "./carExterior.js";
import bedroom from "./bedroom.js";
import gym from "./gym.js";
import street from "./street.js";
import accidental from "./accidental.js";
import custom from "./custom.js";

export const SECTION_REGISTRY = Object.freeze({
  solo,
  group,
  car,
  carExterior,
  bedroom,
  gym,
  street,
  accidental,
  custom
});

export function getSection(id) {
  return SECTION_REGISTRY[String(id || "").trim()] || null;
}

export default SECTION_REGISTRY;
