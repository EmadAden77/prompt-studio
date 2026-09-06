import assert from "node:assert/strict";
import fs from "node:fs";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-phase45.js";
import { resolveSelfieGeometry, SELFIE_FRAMING_LOCK, SELFIE_OPTICS_LOCK } from "../js/canonical/selfie-geometry-authority.js";
import { SECTION_REGISTRY } from "../js/sections/index.js";
import { SELFIE_ARM_LOCK, IDENTITY_STRICT_LOCK } from "../js/canonical/openai-image-adapter-phase36.js";

const words = (value) => String(value || "").trim().split(/\s+/u).filter(Boolean).length;
const auto = (extra = {}) => ({ hasReference:true, selfieAngle:"auto", selfiePose:"auto", expression:"neutral", clothing:"casual-tee-black-jeans-blue", ...extra });
const rows = [
  { id:"carExterior-night-villa", raw:auto({ studioSection:"carExterior", scene:"carExterior", time:"night", carExteriorLocation:"villa" }), expected:{ angle:"high", angleDegrees:8, pose:"door-lean", framing:/front quarter.*DRL.*awkward car crop/iu } },
  { id:"carExterior-day-parking", raw:auto({ studioSection:"carExterior", scene:"carExterior", time:"day", carExteriorLocation:"parking" }), expected:{ angle:"eye", angleDegrees:0, pose:"front-grille", framing:/hood edge/iu } },
  { id:"street-night", raw:auto({ studioSection:"street", scene:"street", time:"night", streetMood:"normal" }), expected:{ angle:"high", angleDegrees:10, pose:"walking", framing:/streetlights behind/iu } },
  { id:"street-day-alley", raw:auto({ studioSection:"street", scene:"street", time:"day", streetMood:"alley" }), expected:{ angle:"eye", angleDegrees:0, pose:"standing-relaxed", framing:/alley or bufia context/iu } },
  { id:"street-day-bufia", raw:auto({ studioSection:"street", scene:"street", time:"day", streetMood:"bufia" }), expected:{ angle:"eye", angleDegrees:0, pose:"standing-relaxed", framing:/alley or bufia context/iu } },
  { id:"gym-night", raw:auto({ studioSection:"gym", scene:"gym", time:"night", clothing:"sport-tracksuit-olive" }), expected:{ angle:"high", angleDegrees:12, pose:"seated-rest-elbows", framing:/elbows on knees/iu } },
  { id:"bedroom-night", raw:auto({ studioSection:"bedroom", scene:"bedroom", time:"night", clothing:"home-flannel-red-black" }), expected:{ angle:"high", angleDegrees:15, pose:"seated-bed", framing:/seated bed/iu } },
  { id:"group", raw:auto({ studioSection:"group", scene:"street", time:"night", groupCount:"4", cameraHolder:"B", groupArrangement:"natural-auto" }), expected:{ angle:"high", angleDegrees:10, pose:"staggered", framing:/wide staggered.*holder centered/iu } },
  { id:"accidental", raw:auto({ studioSection:"accidental", scene:"street", time:"night", accidentalTrigger:"pocket" }), expected:{ angle:"low", angleDegrees:-12, pose:"low-off-axis", framing:/low off-axis.*imperfect edge crop/iu } }
];

for (const section of Object.values(SECTION_REGISTRY)) {
  assert.ok(section.rules?.selfieGeometry, `${section.id}: selfieGeometry declaration missing`);
  assert.deepEqual(section.rules.selfieGeometry.angles, ["eye","high","low","three-quarter"], `${section.id}: allowed angle contract drifted`);
  assert.ok(section.rules.selfieGeometry.poses.length >= 2, `${section.id}: section-specific pose list missing`);
}

for (const row of rows) {
  const geometry = resolveSelfieGeometry(row.raw, SECTION_REGISTRY[row.raw.studioSection]);
  assert.equal(geometry.angle, row.expected.angle, `${row.id}: angle`);
  assert.equal(geometry.angleDegrees, row.expected.angleDegrees, `${row.id}: angleDegrees`);
  assert.equal(geometry.pose, row.expected.pose, `${row.id}: pose`);
  assert.match(geometry.framing, row.expected.framing, `${row.id}: framing`);
  assert.ok(Object.isFrozen(geometry), `${row.id}: geometry must be frozen`);
  assert.ok(Object.isFrozen(geometry.mode), `${row.id}: geometry mode must be frozen`);
  const ten = Array.from({ length:10 }, () => JSON.stringify(resolveSelfieGeometry(row.raw, SECTION_REGISTRY[row.raw.studioSection])));
  assert.ok(ten.every((value) => value === ten[0]), `${row.id}: geometry determinism must be 10/10`);
}

const manualRaw = auto({ studioSection:"street", scene:"street", time:"night", selfieAngle:"three-quarter", selfiePose:"standing-relaxed" });
const manual = resolveSelfieGeometry(manualRaw, SECTION_REGISTRY.street);
assert.equal(manual.angle, "three-quarter", "manual angle must pass through unchanged");
assert.equal(manual.pose, "standing-relaxed", "manual pose must pass through unchanged");
assert.equal(manual.mode.angle, "manual");
assert.equal(manual.mode.pose, "manual");

for (const time of ["day","night"]) for (const location of ["villa","parking","grocery","street","reststop","mall"]) {
  const traditional = resolveSelfieGeometry(auto({ studioSection:"carExterior", time, carExteriorLocation:location, clothing:"thobe-redshemagh-iqal" }), SECTION_REGISTRY.carExterior);
  assert.notEqual(traditional.pose, "hood-sit", `traditional clothing must never auto-resolve hood-sit (${time}/${location})`);
}
const manualTraditional = resolveSelfieGeometry(auto({ studioSection:"carExterior", time:"day", carExteriorLocation:"villa", clothing:"thobe-redshemagh-iqal", selfiePose:"hood-sit" }), SECTION_REGISTRY.carExterior);
assert.notEqual(manualTraditional.pose, "hood-sit", "traditional clothing safety must reject manual hood-sit");

const promptCases = [rows[0], rows[2], rows[5], rows[6], rows[7], rows[8]];
for (const row of promptCases) {
  const runs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(row.raw));
  const output = runs[0];
  assert.ok(runs.every((item) => item.prompt === output.prompt), `${row.id}: prompt determinism must be 10/10`);
  assert.ok(output.prompt.includes(IDENTITY_STRICT_LOCK), `${row.id}: identity lock missing`);
  if (row.raw.studioSection !== "accidental") assert.ok(output.prompt.includes(SELFIE_ARM_LOCK), `${row.id}: selfie arm lock missing`);
  assert.ok(output.prompt.includes(`${SELFIE_OPTICS_LOCK} camera about ${row.expected.angleDegrees}° above eye level`), `${row.id}: concrete angle sentence missing`);
  assert.ok(output.prompt.includes(SELFIE_FRAMING_LOCK), `${row.id}: framing sentence missing`);
  assert.match(output.prompt, row.expected.framing, `${row.id}: chosen framing missing from prompt`);
  assert.ok(words(output.prompt) <= 250, `${row.id}: prompt exceeds 250 words (${words(output.prompt)})`);
}

const traditionalRaw = auto({ studioSection:"carExterior", scene:"carExterior", time:"night", carExteriorLocation:"villa", clothing:"thobe-redshemagh-iqal" });
const traditionalOutput = buildCanonicalV3UserOutput(traditionalRaw);
assert.match(traditionalOutput.prompt, /red-and-white fine checkered shemagh/iu, "shemagh lock missing after Phase 45 compaction");
assert.match(traditionalOutput.prompt, /black doubled-cord iqal/iu, "iqal lock missing after Phase 45 compaction");
assert.ok(words(traditionalOutput.prompt) <= 250, `traditional carExterior prompt exceeds 250 words (${words(traditionalOutput.prompt)})`);

const manualOutput = buildCanonicalV3UserOutput(manualRaw);
assert.equal(manualOutput.geometry.angle, "three-quarter");
assert.equal(manualOutput.geometry.pose, "standing-relaxed");
assert.match(manualOutput.prompt, /three-quarter yaw/iu, "manual three-quarter optics missing");
assert.match(manualOutput.prompt, /standing relaxed/iu, "manual pose must be visible in prompt framing");
assert.ok(words(manualOutput.prompt) <= 250, `manual prompt exceeds 250 words (${words(manualOutput.prompt)})`);

const authoritySource = fs.readFileSync(new URL("../js/canonical/selfie-geometry-authority.js", import.meta.url), "utf8");
assert.doesNotMatch(authoritySource, /car-exterior-authority|from\s+["'][^"']*sections\/(?:car|street|gym|bedroom|group|accidental)/iu, "geometry authority must not import cross-section modules");
const uiSource = fs.readFileSync(new URL("../js/phase45-selfie-geometry-ui.js", import.meta.url), "utf8");
assert.match(uiSource, /name = "selfiePose"|name="selfiePose"/u, "selfiePose UI control missing");
assert.match(uiSource, /#selfie-angle|selfie-angle/u, "selfieAngle UI control missing");
assert.match(uiSource, /تلقائي \(ذكي\)/u, "smart auto default label missing");

const carAuto = buildCanonicalV3UserOutput(rows[0].raw);
const streetAuto = buildCanonicalV3UserOutput(rows[2].raw);
console.log(`PHASE45_CAREXTERIOR_NIGHT_VILLA_GEOMETRY=${JSON.stringify(carAuto.geometry)}`);
console.log(`PHASE45_CAREXTERIOR_NIGHT_VILLA_AUTO=${carAuto.prompt}`);
console.log(`PHASE45_STREET_NIGHT_GEOMETRY=${JSON.stringify(streetAuto.geometry)}`);
console.log(`PHASE45_STREET_NIGHT_AUTO=${streetAuto.prompt}`);
console.log(`PHASE45_MANUAL_GEOMETRY=${JSON.stringify(manualOutput.geometry)}`);
console.log(`PHASE45_MANUAL_OVERRIDE=${manualOutput.prompt}`);
console.log(`PHASE45_TRADITIONAL_WORDS=${words(traditionalOutput.prompt)}`);
console.log("PHASE45_DETERMINISM=10/10");
console.log("✓ Phase 45 smart auto selfie geometry passed");
