import assert from "node:assert/strict";
import { buildStudioSectionLock, normalizeStudioSectionState } from "../js/studio-section-engine-v1.js";

const group = normalizeStudioSectionState({ studioSection:"group", scene:"rangeRover", groupMode:"single" });
assert.equal(group.groupMode, "group"); assert.equal(group.scene, "custom"); assert.equal(group.captureMode, "normal");

const car = normalizeStudioSectionState({ studioSection:"car", scene:"my_bedroom_text", groupMode:"group", captureMode:"accidental" });
assert.equal(car.scene, "rangeRover"); assert.equal(car.scenarioMode, "car"); assert.equal(car.groupMode, "single"); assert.equal(car.captureMode, "normal");

const accidental = normalizeStudioSectionState({ studioSection:"accidental", groupMode:"group" });
assert.equal(accidental.captureMode, "accidental"); assert.equal(accidental.groupMode, "single");

const lock = buildStudioSectionLock({ studioSection:"bedroom" });
assert.match(lock.positive, /Active photography section: 🏠 التصوير في غرفة النوم/u);
assert.ok(lock.negative.some((item) => /التصوير داخل السيارة/u.test(item)));

console.log("studio section engine tests passed");
