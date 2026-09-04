import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { buildCanonicalV3 } from "../js/canonical-v3-engine.js";
import {
  buildOpenAIImagePrompt,
  describeCameraArtifacts
} from "../js/canonical/openai-image-adapter.js";

const GOLDEN_URL = new URL("./golden/current-engine/legacy-v2-semantic-goldens.json", import.meta.url);
const golden = JSON.parse(fs.readFileSync(fileURLToPath(GOLDEN_URL), "utf8"));

const GOLDEN_CASE_IDS = [
  "car_lhd_driver_selfie",
  "car_tight_crop",
  "bedroom_direct_selfie",
  "mirror_selfie",
  "group_selfie",
  "accidental_capture",
  "identity_and_eyewear"
];

const CAMERA_ARTIFACT_PHRASES = Object.freeze({
  edge_softness: "Slight lens softness is visible toward the frame edges.",
  sensor_noise: "Natural sensor noise is visible in shadow areas.",
  micro_blur: "Natural micro-blur is visible on moving elements."
});

const FORBIDDEN_NEGATIVE_PHRASES = [
  /\bDO NOT\b/iu,
  /\bMUST\b/iu,
  /\bIMPORTANT\b/iu,
  /\bNEVER\b/iu,
  /\bQA\b/iu,
  /\bdebug\b/iu
];

const FORBIDDEN_SCOPE_PHRASES = [
  /environment(?:al)?/iu,
  /background details?/iu,
  /weather/iu,
  /dust in light beams/iu,
  /post-processing/iu,
  /color grading/iu,
  /beauty filter/iu,
  /film grain/iu,
  /HDR/iu
];

function wordCount(value) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized.split(/\s+/u).length : 0;
}

function count(value, needle) {
  return String(value).split(needle).length - 1;
}

function artifactSignals(value) {
  return Object.values(CAMERA_ARTIFACT_PHRASES).filter((phrase) => String(value).includes(phrase));
}

function canonicalFor(input) {
  return buildCanonicalV3({
    intentType: "selfie",
    scene: "street",
    lighting: "daylight",
    time: "day",
    ...input
  });
}

for (const id of GOLDEN_CASE_IDS) {
  const input = golden.cases[id]?.input;
  assert.ok(input, `${id}: missing golden input`);

  const canonical = buildCanonicalV3(structuredClone(input));
  const beforeCanonical = JSON.stringify(canonical);
  const beforeHardConstraints = JSON.stringify(canonical.hard_constraints);
  const beforeAuthorities = JSON.stringify(canonical.authorities);
  const beforeCameraGeometry = JSON.stringify(canonical.camera.geometry);
  const helperOutput = describeCameraArtifacts(canonical);
  const prompt = buildOpenAIImagePrompt(canonical);
  const signals = artifactSignals(helperOutput);
  const expected = id === "accidental_capture"
    ? [CAMERA_ARTIFACT_PHRASES.edge_softness, CAMERA_ARTIFACT_PHRASES.micro_blur]
    : [CAMERA_ARTIFACT_PHRASES.edge_softness];

  assert.equal(JSON.stringify(canonical), beforeCanonical, `${id}: adapter must not mutate Canonical V3 state`);
  assert.equal(JSON.stringify(canonical.hard_constraints), beforeHardConstraints, `${id}: adapter must not mutate hard constraints`);
  assert.equal(JSON.stringify(canonical.authorities), beforeAuthorities, `${id}: adapter must not mutate authorities`);
  assert.equal(JSON.stringify(canonical.camera.geometry), beforeCameraGeometry, `${id}: adapter must not mutate camera geometry`);
  assert.equal(Object.isFrozen(canonical.hard_constraints), true, `${id}: hard constraints must remain frozen`);

  assert.ok(signals.length >= 1, `${id}: helper must emit at least one camera-artifact phrase`);
  assert.ok(signals.length <= 2, `${id}: helper must remain sparse`);
  assert.deepEqual(signals, expected, `${id}: helper must select only the applicable camera-artifact phrases`);
  for (const phrase of signals) {
    assert.equal(count(helperOutput, phrase), 1, `${id}: helper must emit each phrase once`);
    assert.equal(count(prompt, phrase), 1, `${id}: prompt must emit each phrase once`);
  }

  assert.ok(wordCount(prompt) <= 250, `${id}: prompt must stay at or below 250 words`);
  for (const forbidden of FORBIDDEN_NEGATIVE_PHRASES) {
    assert.equal(forbidden.test(helperOutput), false, `${id}: helper contains negative or debug text: ${forbidden}`);
    assert.equal(forbidden.test(prompt), false, `${id}: prompt contains negative or debug text: ${forbidden}`);
  }
  for (const forbidden of FORBIDDEN_SCOPE_PHRASES) {
    assert.equal(forbidden.test(helperOutput), false, `${id}: helper contains an out-of-scope phrase: ${forbidden}`);
  }

  const repeated = Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical));
  assert.equal(repeated.filter((value) => value === repeated[0]).length, 10, `${id}: adapter output must remain deterministic 10/10`);
}

const daylightCanonical = canonicalFor({});
assert.deepEqual(
  artifactSignals(describeCameraArtifacts(daylightCanonical)),
  [CAMERA_ARTIFACT_PHRASES.edge_softness],
  "daylight on a real device must use only the optical edge-softness phrase"
);
assert.equal(
  describeCameraArtifacts(daylightCanonical).includes(CAMERA_ARTIFACT_PHRASES.sensor_noise),
  false,
  "sensor noise must not appear in daylight"
);

const nightCanonical = canonicalFor({ lighting: "night bedside lamp", time: "night" });
assert.equal(
  describeCameraArtifacts(nightCanonical).includes(CAMERA_ARTIFACT_PHRASES.sensor_noise),
  true,
  "sensor noise must appear for a low-light night source"
);

const phoneScreenCanonical = canonicalFor({ lighting: "phone screen", time: "night" });
assert.equal(
  describeCameraArtifacts(phoneScreenCanonical).includes(CAMERA_ARTIFACT_PHRASES.sensor_noise),
  true,
  "sensor noise must appear for phone-screen lighting"
);

const accidentalCanonical = canonicalFor({ intentType: "accidental", lighting: "daylight", time: "day" });
assert.equal(
  accidentalCanonical.capture.type,
  "accidental_front_camera_capture",
  "fixture must resolve accidental capture"
);
assert.equal(
  describeCameraArtifacts(accidentalCanonical).includes(CAMERA_ARTIFACT_PHRASES.micro_blur),
  true,
  "micro-blur must appear only for accidental capture"
);
assert.equal(
  describeCameraArtifacts(daylightCanonical).includes(CAMERA_ARTIFACT_PHRASES.micro_blur),
  false,
  "micro-blur must not appear outside accidental capture"
);

const noDeviceCanonical = structuredClone(daylightCanonical);
noDeviceCanonical.camera.device_profile = "synthetic preview profile";
assert.equal(describeCameraArtifacts(noDeviceCanonical), "", "helper must omit itself without a real device profile");

const realCameraCanonical = structuredClone(daylightCanonical);
realCameraCanonical.camera.device_profile = "real camera";
assert.equal(
  describeCameraArtifacts(realCameraCanonical),
  CAMERA_ARTIFACT_PHRASES.edge_softness,
  "a real camera profile must qualify for the optical artifact phrase"
);

console.log("✓ canonical-v3 camera artifacts layer contract passed");
