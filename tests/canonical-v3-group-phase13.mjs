import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { buildCanonicalV3 } from "../js/canonical-v3-engine.js";
import { resolveCanonicalConflicts } from "../js/canonical/conflict-resolver.js";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";
import { ANTI_SIMILARITY, GROUP_PHASE13_POOLS } from "../js/canonical/group-phase13.js";

const uiSource = fs.readFileSync(fileURLToPath(new URL("../js/canonical/engine-gate.js", import.meta.url)), "utf8");
const wordCount = (value) => String(value || "").trim().split(/\s+/u).filter(Boolean).length;
const unique = (values) => new Set(values).size === values.length;
const softBackgroundSignal = /soft-focus|blurred|out-of-focus|ambient/iu;

assert.match(uiSource, /name = "groupKind"|"groupKind"/u, "groupKind control must exist");
assert.match(uiSource, /name = "groupVibe"|"groupVibe"/u, "groupVibe control must exist");
for (const label of ["أصدقاء", "أقارب", "زملاء عمل", "فريق رياضي", "كشتة بر", "لقطة عادية", "ضحك", "احتفال فوز", "تهنئة عيد", "بعد عزومة"]) {
  assert.ok(uiSource.includes(label), `UI must include ${label}`);
}

const baseInput = {
  intentType: "group",
  studioSection: "group",
  groupMode: "group",
  groupCount: 4,
  groupKind: "friends",
  groupVibe: "casual",
  scene: "street",
  streetMood: "latenight",
  streetHour: 23,
  lighting: "street-night",
  time: "night",
  hasReference: true,
  referenceId: "attached_reference_image",
  clothing: "street-casual",
  expression: "neutral",
  pose: "group-natural",
  fabric: "cotton",
  composition: "close"
};

const resolution = resolveCanonicalConflicts(baseInput);
const baseCanonical = buildCanonicalV3(resolution.cleanInput);
const output = buildCanonicalV3UserOutput(baseInput);
const canonical = output.canonical;
const prompt = output.prompt;
const additional = canonical.subjects.additional;

assert.equal(canonical.intent.type, "group");
assert.equal(canonical.capture.type, "group_selfie");
assert.equal(canonical.subjects.count, 4);
assert.equal(canonical.subjects.primary.reference_id, "attached_reference_image", "primary alone keeps reference identity");
assert.ok(additional.every((person) => person.reference_id === null), "additional people must never inherit reference identity");
assert.equal(additional.length, 3);

const outfits = additional.map((person) => person.clothing.garment);
const expressions = additional.map((person) => person.expression);
const poses = additional.map((person) => person.pose);
const faces = additional.map((person) => person.clothing.custom_modifier.split(", apparent age")[0]);
const ages = additional.map((person) => person.clothing.custom_modifier.match(/apparent age\s+(~?\d+)/u)?.[1]);
assert.ok(unique(outfits), "additional outfits must be unique");
assert.ok(unique(expressions), "additional expressions must be unique");
assert.ok(unique(poses), "additional poses must be unique");
assert.ok(unique(faces), "additional faces must be unique");
assert.ok(unique(ages), "additional apparent ages must be unique");
assert.ok(outfits.every((outfit) => GROUP_PHASE13_POOLS.OUTFITS.friends.includes(outfit)), "seeded outfits must remain inside the selected kind pool");

assert.equal(canonical.hard_constraints.vehicle_geometry.applicable, false, "street group must not activate vehicle geometry");
assert.deepEqual(canonical.hard_constraints.anatomy, baseCanonical.hard_constraints.anatomy, "anatomy hard constraints must stay unchanged");
assert.deepEqual(canonical.hard_constraints.camera_geometry, baseCanonical.hard_constraints.camera_geometry, "camera hard constraints must stay unchanged");
assert.deepEqual(canonical.hard_constraints.capture_physics, baseCanonical.hard_constraints.capture_physics, "capture hard constraints must stay unchanged");
assert.ok(prompt.includes(ANTI_SIMILARITY), "anti-similarity sentence must be present");
assert.match(prompt, softBackgroundSignal, "outdoor group background must use soft depth-of-field wording");
assert.doesNotMatch(prompt, /cafeteria worker|delivery rider|commuters/iu, "group background must avoid named roles");
assert.doesNotMatch(prompt, /Range Rover|LHD|driver-left|steering directly ahead|driver's door|center console/iu, "group prompt must contain no vehicle or driver facts");
assert.ok(wordCount(prompt) <= 250, `group prompt must stay <=250 words, got ${wordCount(prompt)}`);
for (const person of additional) {
  assert.equal((prompt.match(new RegExp(person.clothing.garment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gu")) || []).length, 1, `outfit should appear once: ${person.clothing.garment}`);
}
const repeats = Array.from({ length: 10 }, () => buildCanonicalV3UserOutput(baseInput).prompt);
assert.equal(new Set(repeats).size, 1, "group output must remain deterministic 10/10 for identical input");

for (const kind of ["friends", "family", "work", "team", "kashta"]) {
  const variant = buildCanonicalV3UserOutput({ ...baseInput, groupKind: kind }).canonical.subjects.additional;
  assert.ok(unique(variant.map((person) => person.clothing.garment)), `${kind}: outfits must remain unique`);
}

const vehicleLeakInput = { ...baseInput, scene: "rangeRover", streetMood: "", groupKind: "work" };
const vehicleLeak = buildCanonicalV3UserOutput(vehicleLeakInput);
assert.equal(vehicleLeak.canonical.scene.type, "outdoor", "group scene must de-conflict away from vehicle type");
assert.equal(vehicleLeak.canonical.scene.vehicle, null, "group scene must remove vehicle object");
assert.equal(vehicleLeak.canonical.hard_constraints.vehicle_geometry.applicable, false, "group scene must disable vehicle geometry");
assert.doesNotMatch(vehicleLeak.prompt, /Range Rover|Autobiography|LHD|driver-left|steering wheel|center console/iu, "de-conflicted group prompt must not emit car facts");
assert.match(vehicleLeak.prompt, softBackgroundSignal, "de-conflicted outdoor group must keep soft background wording");
assert.ok(wordCount(vehicleLeak.prompt) <= 250);

const five = buildCanonicalV3UserOutput({ ...baseInput, groupCount: 5, groupKind: "family", groupVibe: "eid" });
assert.equal(five.canonical.subjects.additional.length, 4);
assert.ok(unique(five.canonical.subjects.additional.map((person) => person.expression)), "4 added people must all have unique expressions");
assert.ok(wordCount(five.prompt) <= 250, `five-person prompt must stay <=250 words, got ${wordCount(five.prompt)}`);

const seededBase = { ...baseInput, groupVibe: "laughing" };
const hour20a = buildCanonicalV3UserOutput({ ...seededBase, streetHour: 20 });
const hour20b = buildCanonicalV3UserOutput({ ...seededBase, streetHour: 20 });
const hour21 = buildCanonicalV3UserOutput({ ...seededBase, streetHour: 21 });
const outfits20 = hour20a.canonical.subjects.additional.map((person) => person.clothing.garment);
const outfits21 = hour21.canonical.subjects.additional.map((person) => person.clothing.garment);
assert.deepEqual(hour20a.canonical, hour20b.canonical, "same input plus same hour must resolve identically");
assert.equal(hour20a.prompt, hour20b.prompt, "same input plus same hour must emit identical prompt");
assert.notDeepEqual(outfits20, outfits21, "different streetHour must rotate to different outfits");
assert.notEqual(hour20a.prompt, hour21.prompt, "different streetHour must produce perceptually different group prompt");
assert.ok(wordCount(hour20a.prompt) <= 250);
assert.ok(wordCount(hour21.prompt) <= 250);

const daySample = buildCanonicalV3UserOutput({ ...baseInput, streetMood: "normal", streetHour: 10, lighting: "daylight", time: "day" });
const nightSample = buildCanonicalV3UserOutput({ ...baseInput, streetMood: "latenight", streetHour: 23, lighting: "street-night", time: "night" });
assert.match(daySample.prompt, /Soft-focus, distant pedestrians move in the ambient street background\./u, "day group must use Phase 15 soft background sentence");
assert.match(nightSample.prompt, /Blurred distant streetlights and a single soft pedestrian figure\./u, "night group must use Phase 15 soft background sentence");
assert.ok(wordCount(daySample.prompt) <= 250);
assert.ok(wordCount(nightSample.prompt) <= 250);

console.log(`PHASE15_DAY_WORDS=${wordCount(daySample.prompt)}`);
console.log(`PHASE15_DAY_PROMPT=${daySample.prompt}`);
console.log(`PHASE15_NIGHT_WORDS=${wordCount(nightSample.prompt)}`);
console.log(`PHASE15_NIGHT_PROMPT=${nightSample.prompt}`);
console.log("✓ Phase 15 soft group backgrounds preserve Phase 13/14 contracts and per-input determinism");
