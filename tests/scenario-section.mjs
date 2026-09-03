import assert from "node:assert/strict";
import { buildScenarioLock, getScenarioSceneOptions, normalizeScenarioState } from "../js/scenario-section-engine-v1.js";

assert.deepEqual(getScenarioSceneOptions("car").map((item) => item.value), ["rangeRover"]);
assert.deepEqual(getScenarioSceneOptions("gym").map((item) => item.value), ["gym"]);

const car = normalizeScenarioState({ scenarioMode:"car", scene:"my_bedroom_text", bedroomWindow:"night-charcoal-closed" });
assert.equal(car.scene, "rangeRover");
assert.equal(car.bedroomWindow, "");

const bedroom = normalizeScenarioState({ scenarioMode:"bedroom", scene:"street", customScene:"wrong" });
assert.equal(bedroom.scene, "my_bedroom_text");
assert.equal(bedroom.customScene, "");

const lock = buildScenarioLock({ scenarioMode:"gym", scene:"rangeRover" });
assert.equal(lock.state.scene, "gym");
assert.match(lock.positive, /Active section: الجيم/u);
assert.ok(lock.negative.some((item) => /السيارة/u.test(item)));

console.log("scenario section engine tests passed");
