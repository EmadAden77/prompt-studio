import assert from "node:assert/strict";
import {
  REALISM_CORE_NEGATIVE_RULES,
  buildRealismCoreSections,
  getPeopleDensityOptions,
  getPlaceStateOptions,
  getSmartphoneCaptureProfile,
  getSubjectMomentOptions,
  realismCoreQaItems,
  resolveRealismCoreState
} from "../js/realism-core-v1.js";
import { DEFAULT_STATE, normalizeState } from "../js/physics-prompt-engine-v5.js";

assert.ok(getPlaceStateOptions().length >= 5, "Place-state realism choices must stay compact but useful");
assert.ok(getPeopleDensityOptions().some((item) => item.value === "auto"));
assert.ok(getSubjectMomentOptions().some((item) => item.value === "post-workout"));

const nearCapture = getSmartphoneCaptureProfile({ selfieDistanceCm:40, composition:"tight" });
assert.equal(nearCapture.zone, "near");
assert.equal(nearCapture.distance, 40);
assert.match(nearCapture.perspective, /bulbous nose/u);
const standardCapture = getSmartphoneCaptureProfile({ selfieDistanceCm:50, composition:"close" });
assert.equal(standardCapture.zone, "standard");
const extendedCapture = getSmartphoneCaptureProfile({ selfieDistanceCm:70, composition:"upper" });
assert.equal(extendedCapture.zone, "extended");

const tightCrowd = resolveRealismCoreState(normalizeState({
  ...DEFAULT_STATE,
  scene:"street",
  poseFamily:"street",
  pose:"street-standing",
  composition:"close",
  peopleDensity:"busy",
  placeState:"daily",
  subjectMoment:"waiting"
}));
assert.equal(tightCrowd.state.peopleDensity, "sparse", "Tight selfie must auto-reduce a forced crowd");
assert.ok(tightCrowd.conflicts.some((item) => item.code === "tight-crowd"));
const tightSections = buildRealismCoreSections(tightCrowd.state, tightCrowd.conflicts).join("\n\n");
assert.match(tightSections, /\[REALISM CONFLICT CHECK\]/u);
assert.match(tightSections, /\[CONTACT PHYSICS\]/u);
assert.match(tightSections, /\[CAMERA AUTO BEHAVIOR\]/u);
assert.match(tightSections, /\[REFLECTION AND GLASS\]/u);
assert.match(tightSections, /A tight selfie crop cannot support a dense crowd/u);
assert.match(tightSections, /real front-camera auto behavior/u);
assert.match(tightSections, /DISTANCE-AWARE SMARTPHONE CAPTURE/u);
assert.match(tightSections, /phone-to-face distance 48 cm/u);
assert.match(tightSections, /portrait-mode cutout/u);

const windowless = resolveRealismCoreState(normalizeState({
  ...DEFAULT_STATE,
  scene:"custom",
  customScene:"داخل محل بصريات طبي بدون نوافذ",
  customSceneDetails:"مرايا ورفوف نظارات",
  time:"day",
  poseFamily:"standing",
  pose:"custom-standing",
  lighting:"custom-day-open-frontage",
  composition:"upper",
  selfieAngle:"three-quarter",
  peopleDensity:"natural",
  placeState:"clean-used",
  subjectMoment:"just-arrived",
  interactionObject:"يمسك نظارة باليد الحرة"
}));
assert.equal(windowless.state.lighting, "custom-day-led-only", "Windowless custom scene must reject frontage daylight");
assert.ok(windowless.conflicts.some((item) => item.code === "windowless-daylight"));
const opticalSections = buildRealismCoreSections(windowless.state, windowless.conflicts).join("\n\n");
assert.match(opticalSections, /optical-store glass/u);
assert.match(opticalSections, /Requested interaction:/u);
assert.match(opticalSections, /free hand/u);
assert.match(opticalSections, /exactly five fingers/u);
assert.match(opticalSections, /visible indoor practical lighting becomes authoritative/u);

const wokeStreet = resolveRealismCoreState(normalizeState({
  ...DEFAULT_STATE,
  scene:"street",
  poseFamily:"street",
  pose:"street-standing",
  subjectMoment:"just-woke",
  peopleDensity:"auto",
  placeState:"auto"
}));
assert.equal(wokeStreet.state.subjectMoment, "relaxed");
assert.ok(wokeStreet.conflicts.some((item) => item.code === "woke-location"));

const nightCar = resolveRealismCoreState(normalizeState({
  ...DEFAULT_STATE,
  studioSection:"car",
  scene:"rangeRover",
  time:"night",
  poseFamily:"car",
  pose:"car-driver-close",
  composition:"close",
  selfieDistanceCm:40,
  lighting:"car-night-parking-led",
  peopleDensity:"auto",
  placeState:"daily",
  subjectMoment:"waiting"
}));
const nightCarSections = buildRealismCoreSections(nightCar.state, nightCar.conflicts).join("\n\n");
assert.match(nightCarSections, /luminance and chroma noise increase/u);
assert.match(nightCarSections, /use the exact distance and vector declared in \[CAR DRIVER SELFIE GEOMETRY — SOLE AUTHORITY\]/u);
assert.doesNotMatch(nightCarSections, /phone-to-face distance 40 cm/u, "Driver camera distance must be declared only by the driver geometry lock");
assert.match(nightCarSections, /modern front-camera lens correction/u);
assert.match(nightCarSections, /selected practical highlights may clip/u);
assert.match(nightCarSections, /Vehicle glass, glossy trim and mirrors/u);
assert.match(nightCarSections, /seat cushion and backrest/u);
assert.match(nightCarSections, /outside the stationary car/u);

const qa = realismCoreQaItems(windowless.state, windowless.conflicts);
assert.ok(qa.some((item) => item.label === "فحص التعارض" && /LED/u.test(item.value)));
assert.ok(qa.some((item) => item.label === "التفاعل"));
assert.ok(qa.some((item) => item.label === "كاميرا الهاتف" && /56 سم/u.test(item.value)));

for (const forbidden of [
  "unsupported body contact",
  "mirror reflection from impossible camera angle",
  "noise-free night smartphone image",
  "crowd forced into tight selfie crop",
  "telephoto compression in a close front-camera selfie",
  "portrait-mode cutout around hair or shoulders",
  "background blur inconsistent with smartphone front-camera focus"
]) {
  assert.ok(REALISM_CORE_NEGATIVE_RULES.includes(forbidden), `Missing realism negative guard: ${forbidden}`);
}

console.log("✓ Realism Core conflict, contact, camera, reflection, people and interaction rules passed");
