import assert from "node:assert/strict";
import { buildCanonicalV3UserOutput, SECTION_CAPTURE_ROUTING } from "../js/canonical/canonical-v3-pipeline.js";
import { buildOpenAIImagePrompt, SELFIE_ARM_LOCK } from "../js/canonical/openai-image-adapter-phase36.js";

const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const firstSentence = (value) => String(value ?? "").match(/^[^.!?]+[.!?]/u)?.[0]?.trim() || "";
const withoutSelfieLock = (value) => String(value ?? "").replace(SELFIE_ARM_LOCK, "");
const INTENTIONAL_SELFIE_TYPES = new Set(["direct_front_camera_selfie", "subject_held_driver_selfie", "group_selfie"]);

const expectedOpening = Object.freeze({
  direct_front_camera_selfie:"A candid direct selfie.",
  subject_held_driver_selfie:"A candid direct selfie.",
  group_selfie:"A candid group selfie.",
  accidental_front_camera_capture:"An accidental front-camera capture."
});

const base = {
  scene:"custom",
  customScene:"a user-defined scene",
  time:"night",
  hasReference:true,
  expression:"neutral",
  pose:"both hands in pockets",
  clothing:"casual-tee-black-jeans-blue",
  fabric:"cotton",
  fabricWeight:"light",
  ironState:"lightly-unpressed",
  wearState:"normal-day",
  clothingFit:"regular",
  lighting:"ordinary practical light"
};

for (const [studioSection, route] of Object.entries(SECTION_CAPTURE_ROUTING)) {
  const input = { ...base, studioSection };
  if (studioSection === "carExterior") {
    Object.assign(input, {
      carExteriorClothing:"thobe-redshemagh-iqal",
      carExteriorLocation:"reststop",
      carExteriorPose:"both hands in pockets",
      carExteriorLighting:"streetlight-reflection"
    });
  }
  const outputs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(input));
  const first = outputs[0];
  assert.ok(first.prompt.trim(), `Phase 36: ${studioSection} prompt must be non-empty`);
  assert.equal(first.canonical.capture.type, route.captureType, `Phase 36: ${studioSection} capture routing mismatch`);
  assert.equal(firstSentence(first.prompt), expectedOpening[route.captureType], `Phase 36: ${studioSection} opening sentence mismatch`);
  assert.ok(outputs.every((item) => item.prompt === first.prompt), `Phase 36: ${studioSection} determinism must be 10/10`);
  if (INTENTIONAL_SELFIE_TYPES.has(route.captureType)) {
    assert.doesNotMatch(withoutSelfieLock(first.prompt), /both hands in pockets/iu, `Phase 36: ${studioSection} leaked impossible selfie pose outside the lock`);
    assert.match(first.prompt, new RegExp(SELFIE_ARM_LOCK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "u"), `Phase 36: ${studioSection} selfie arm lock missing`);
  }
  assert.ok(words(first.prompt) <= 250, `Phase 36: ${studioSection} exceeds 250 words (${words(first.prompt)})`);
  assert.doesNotMatch(first.prompt, /a user-defined scene/iu, `Phase 36: ${studioSection} leaked custom scene`);
}

const carInput = {
  ...base,
  studioSection:"carExterior",
  scene:"custom",
  customScene:"a user-defined scene",
  pose:"both hands in pockets",
  carExteriorPose:"front-grille",
  carExteriorLocation:"reststop",
  carExteriorLighting:"streetlight-reflection",
  carExteriorClothing:"thobe-redshemagh-iqal"
};
const carOutputs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(carInput));
const car = carOutputs[0];
assert.equal(firstSentence(car.prompt), "A candid direct selfie.");
assert.equal(car.canonical.scene.id, "carExterior");
assert.match(car.prompt, /2017 Range Rover Sport Autobiography Dynamic/iu);
assert.match(car.prompt, /Fuji White/iu);
assert.match(car.prompt, /sandy shoulder with sparse shrubs and an open horizon/iu);
assert.match(car.prompt, /white thobe/iu);
assert.match(car.prompt, /red-and-white fine checkered shemagh/iu);
assert.match(car.prompt, /black doubled-cord iqal/iu);
assert.match(car.prompt, /One arm extends toward the camera holding the phone/iu);
assert.doesNotMatch(withoutSelfieLock(car.prompt), /a user-defined scene|both hands in pockets|sleep/iu);
assert.ok(words(car.prompt) <= 250, `Phase 36: carExterior exceeds 250 words (${words(car.prompt)})`);
assert.ok(carOutputs.every((item) => item.prompt === car.prompt), "Phase 36: carExterior determinism must be 10/10");

const canonicalBefore = JSON.stringify(car.canonical.hard_constraints);
void buildOpenAIImagePrompt(car.canonical);
assert.equal(JSON.stringify(car.canonical.hard_constraints), canonicalBefore, "Phase 36: adapter must not mutate hard constraints");

console.log(`PHASE36_SECTIONS=${Object.keys(SECTION_CAPTURE_ROUTING).length}`);
console.log(`PHASE36_CAR_EXTERIOR_WORDS=${words(car.prompt)}`);
console.log("PHASE36_DETERMINISM=10/10");
console.log(`PHASE36_CAR_EXTERIOR_PROMPT=${car.prompt}`);
console.log("✓ Phase 36 selfie lock and full section routing de-conflict passed");
