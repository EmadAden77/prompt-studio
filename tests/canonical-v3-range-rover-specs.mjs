import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { buildCanonicalV3 } from "../js/canonical-v3-engine.js";
import { buildOpenAIImagePrompt } from "../js/canonical/openai-image-adapter.js";

const GOLDEN_URL = new URL("./golden/current-engine/legacy-v2-semantic-goldens.json", import.meta.url);
const golden = JSON.parse(fs.readFileSync(fileURLToPath(GOLDEN_URL), "utf8"));
const IDS = ["car_lhd_driver_selfie","car_tight_crop","bedroom_direct_selfie","mirror_selfie","group_selfie","accidental_capture","identity_and_eyewear"];
const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;

for (const id of IDS) {
  const canonical = buildCanonicalV3(structuredClone(golden.cases[id].input));
  const beforeHard = JSON.stringify(canonical.hard_constraints);
  const beforeAuthorities = JSON.stringify(canonical.authorities);
  const prompt = buildOpenAIImagePrompt(canonical);
  assert.ok(words(prompt) <= 250, `${id}: prompt exceeds 250 words (${words(prompt)})`);
  assert.equal(JSON.stringify(canonical.hard_constraints), beforeHard, `${id}: hard constraints changed`);
  assert.equal(JSON.stringify(canonical.authorities), beforeAuthorities, `${id}: authorities changed`);
  const repeated = Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical));
  assert.equal(repeated.every((value) => value === repeated[0]), true, `${id}: determinism failed`);
}

for (const id of ["car_lhd_driver_selfie", "car_tight_crop"]) {
  const canonical = buildCanonicalV3(structuredClone(golden.cases[id].input));
  const prompt = buildOpenAIImagePrompt(canonical);
  assert.match(prompt, /Ivory cream leather/iu, `${id}: Ivory cream leather missing`);
  assert.match(prompt, /dark walnut|walnut/iu, `${id}: walnut missing`);
  assert.match(prompt, /silver metallic/iu, `${id}: silver metallic missing`);
  assert.match(prompt, /panoramic/iu, `${id}: panoramic roof missing`);
  assert.equal(canonical.scene.facts.interior_palette, "ivory cream leather + dark walnut + black + silver");
  assert.equal(canonical.scene.facts.seat_finish, "perforated center panels with smooth outer bolsters");
  assert.equal(canonical.scene.facts.steering_wheel, "multi-spoke, black upper rim, Ivory inner/lower, silver trim, multifunction controls on both spokes");
  assert.equal(canonical.scene.facts.instrument_cluster, "wide digital display with circular-style gauges");
  assert.equal(canonical.scene.facts.center_console, "dark walnut, electronic gear selector, rotary dial");
  assert.equal(canonical.scene.facts.roof, "panoramic dark-tinted glass with black inner frame");
  assert.equal(canonical.scene.facts.door_panels, "layered Ivory/black/dark-wood/silver");
  assert.equal(Object.isFrozen(canonical.scene.facts), true, `${id}: scene facts must remain frozen`);
}

console.log("✓ canonical-v3 Range Rover 2022 Sport interior spec contract passed");
