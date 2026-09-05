import assert from "node:assert/strict";
import { SCENES } from "../js/data.js";
import { buildOpenAIImagePrompt, describeHeadwear, HEADWEAR_LOCK } from "../js/canonical/openai-image-adapter.js";

const OPTION_VALUE = "thobe-redshemagh-iqal";
const SCENE_IDS = ["street", "rangeRover", "majlis", "carExterior", "rooftop", "grocery", "gasStation"];
const wordCount = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;

function selected(sceneId) {
  return SCENES[sceneId].clothing.find((option) => option.value === OPTION_VALUE);
}

function canonicalFor(sceneId) {
  const option = selected(sceneId);
  const isVehicle = sceneId === "rangeRover";
  const isRoom = sceneId === "majlis" || sceneId === "grocery";
  const facts = sceneId === "carExterior"
    ? { carExteriorLocation: "villa", carExteriorPose: "door-lean" }
    : sceneId === "rooftop"
      ? { mood: "sunset" }
      : sceneId === "gasStation"
        ? { mood: "night-stop" }
        : {};
  return {
    schema_version: "realistic-image-generator/canonical-v3",
    identity: { reference_mode: "none", preserve: [] },
    capture: { type: "direct_front_camera_selfie", operator: "subject", intentional: true, single_capture_event: true },
    subjects: {
      count: 1,
      primary: {
        pose: "relaxed standing pose",
        expression: "neutral expression",
        clothing: { garment: option.text, fabric: "cotton", custom_modifier: null },
        body_scale: { preserve_environment_scale: true }
      }
    },
    scene: {
      id: sceneId,
      type: isVehicle ? "vehicle" : isRoom ? "room" : "outdoor",
      description: SCENES[sceneId].environment,
      facts,
      vehicle: isVehicle ? { make: "Land Rover", model: "Range Rover Sport Autobiography Dynamic", year: 2017, state: "stationary" } : null,
      room: isRoom ? { description: SCENES[sceneId].environment } : null
    },
    camera: {
      device_profile: "Xiaomi 15 Ultra front camera",
      camera_type: "front_camera",
      geometry: { distance_cm: 50, yaw_deg: 0, pitch_deg: 0, roll_deg: 2, focal_length_equivalent_mm: 21, crop: "close" }
    },
    lighting: { source_type: "practical", description: "ordinary practical light", direction: "front-side", intensity: "moderate" },
    hard_constraints: {
      identity: { preserve_reference_identity: false },
      anatomy: { physically_possible: true, limb_ownership_integrity: true, contact_consistency: true, gravity_consistency: true, occlusion_consistency: true },
      capture_physics: { physically_possible_camera_position: true, physically_possible_operator: true, single_capture_event: true }
    },
    preferences: { realism: "documentary", imperfection_level: "natural" }
  };
}

for (const sceneId of SCENE_IDS) {
  const option = selected(sceneId);
  assert.ok(option, `${sceneId}: youthful red shemagh + iqal option missing`);
  assert.equal(option.label, "ثوب + شماغ أحمر + عقال", `${sceneId}: option label drifted`);
  assert.equal(option.text, "crisp white thobe with a red-and-white checkered shemagh and black iqal, youthful style", `${sceneId}: option text drifted`);

  const canonical = canonicalFor(sceneId);
  const before = JSON.stringify(canonical);
  const hardBefore = JSON.stringify(canonical.hard_constraints);
  assert.equal(describeHeadwear(canonical), HEADWEAR_LOCK, `${sceneId}: headwear lock detection failed`);

  const prompt = buildOpenAIImagePrompt(canonical);
  assert.match(prompt, /checkered shemagh/iu, `${sceneId}: shemagh missing from prompt`);
  assert.match(prompt, /iqal/iu, `${sceneId}: iqal missing from prompt`);
  assert.match(prompt, /thrown over the shoulder/iu, `${sceneId}: validated Variant B drape missing`);
  assert.ok(prompt.includes(`${HEADWEAR_LOCK}.`), `${sceneId}: exact headwear sentence missing`);

  const wearingIndex = prompt.indexOf("wearing ");
  const clothingSentenceEnd = wearingIndex >= 0 ? prompt.indexOf(".", wearingIndex) : -1;
  assert.ok(wearingIndex >= 0 && clothingSentenceEnd >= 0, `${sceneId}: clothing sentence not found`);
  assert.equal(prompt.slice(clothingSentenceEnd + 1).trimStart().startsWith(`${HEADWEAR_LOCK}.`), true, `${sceneId}: headwear lock must follow clothing sentence immediately`);

  assert.ok(wordCount(prompt) <= 250, `${sceneId}: prompt exceeds 250 words (${wordCount(prompt)})`);
  assert.ok(Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical)).every((value) => value === prompt), `${sceneId}: determinism failed`);
  assert.equal(JSON.stringify(canonical), before, `${sceneId}: canonical mutated`);
  assert.equal(JSON.stringify(canonical.hard_constraints), hardBefore, `${sceneId}: hard constraints changed`);
}

const customOnly = canonicalFor("street");
customOnly.subjects.primary.clothing.garment = "crisp white thobe";
customOnly.subjects.primary.clothing.custom_modifier = "red shemagh with black iqal";
assert.equal(describeHeadwear(customOnly), HEADWEAR_LOCK, "custom_modifier headwear detection failed");

const sample = buildOpenAIImagePrompt(canonicalFor("street"));
console.log(`PHASE25_SAMPLE_WORDS=${wordCount(sample)}`);
console.log(`PHASE25_SAMPLE_PROMPT=${sample}`);
console.log("✓ Phase 25 youthful red shemagh + iqal headwear lock passed");
