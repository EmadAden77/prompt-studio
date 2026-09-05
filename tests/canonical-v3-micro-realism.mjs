import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { buildCanonicalV3 } from "../js/canonical-v3-engine.js";
import { buildOpenAIImagePrompt, describeMicroRealism } from "../js/canonical/openai-image-adapter.js";

const GOLDEN_URL = new URL("./golden/current-engine/legacy-v2-semantic-goldens.json", import.meta.url);
const golden = JSON.parse(fs.readFileSync(fileURLToPath(GOLDEN_URL), "utf8"));
const IDS = ["car_lhd_driver_selfie","car_tight_crop","bedroom_direct_selfie","mirror_selfie","group_selfie","accidental_capture","identity_and_eyewear"];
const forbidden = /\b(?:landmark|tower|monument|kingdom|faisaliah|ramadan|fanous|lantern|crescent)\b|mosque\s+minaret/iu;
const wordCount = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;

for (const id of IDS) {
  const canonical = buildCanonicalV3(structuredClone(golden.cases[id].input));
  const before = JSON.stringify(canonical);
  const hardBefore = JSON.stringify(canonical.hard_constraints);
  const micro = describeMicroRealism(canonical);
  const prompt = buildOpenAIImagePrompt(canonical);
  const microSentences = micro.match(/[^.!?]+[.!?]/gu) ?? [];

  assert.ok(microSentences.length >= 1 && microSentences.length <= 3, `${id}: micro-detail count must be 1..3`);
  assert.equal(JSON.stringify(canonical), before, `${id}: canonical mutated`);
  assert.equal(JSON.stringify(canonical.hard_constraints), hardBefore, `${id}: hard constraints mutated`);
  assert.equal(forbidden.test(prompt), false, `${id}: forbidden landmark/Ramadan wording present`);
  assert.ok(wordCount(prompt) <= 250, `${id}: prompt exceeds 250 words (${wordCount(prompt)})`);
  assert.ok(microSentences.some((part) => prompt.includes(part.trim())), `${id}: prompt must contain at least one micro detail`);
  assert.ok(Array.from({ length: 10 }, () => buildOpenAIImagePrompt(canonical)).every((value) => value === prompt), `${id}: determinism must be 10/10`);
}

console.log("✓ canonical-v3 Phase 18 micro-realism contracts passed");
