import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { buildPositivePrompt, normalizeState as normalizeLegacyState } from "../js/physics-prompt-engine-v5.js";
import { buildCanonicalV3 } from "../js/canonical-v3-engine.js";
import { resolveCanonicalConflicts } from "../js/canonical/conflict-resolver.js";
import {
  buildOpenAIImagePrompt,
  describeCameraArtifacts,
  describeLightingPhysics,
  describeNaturalImperfections
} from "../js/canonical/openai-image-adapter.js";

const GOLDEN_URL = new URL("./golden/current-engine/legacy-v2-semantic-goldens.json", import.meta.url);
const REPORT_URL = new URL("../docs/canonical-v3-comparison-report.md", import.meta.url);
const golden = JSON.parse(fs.readFileSync(fileURLToPath(GOLDEN_URL), "utf8"));

const CASE_ORDER = [
  ["car_lhd_driver_selfie", "Car LHD driver selfie"],
  ["car_tight_crop", "Car tight crop"],
  ["bedroom_direct_selfie", "Bedroom direct selfie"],
  ["mirror_selfie", "Mirror selfie"],
  ["group_selfie", "Group selfie"],
  ["accidental_capture", "Accidental capture"],
  ["identity_and_eyewear", "Identity + eyewear"]
];

const WORD_CAP = 250;
const REALISM_SIGNAL_PHRASES = Object.freeze([
  "Subtle skin texture with natural pores.",
  "Natural hair flyaways and loose strands.",
  "Natural fabric wrinkles and folds.",
  "Natural body proportions consistent with the environment."
]);

const CAMERA_ARTIFACT_SIGNAL_PHRASES = Object.freeze([
  "Slight lens softness is visible toward the frame edges.",
  "Natural sensor noise is visible in shadow areas.",
  "Natural micro-blur is visible on moving elements."
]);

const FACT_CATEGORIES = Object.freeze([
  ["identity-reference", /identity reference|reference as identity|supplied identity reference|attached reference/iu],
  ["eyewear", /eyewear/iu],
  ["camera-device", /xiaomi 15 ultra|iphone 15 pro max/iu],
  ["camera-geometry", /camera geometry|geometry authority|subject distance|\byaw\b|\bpitch\b|\broll\b/iu],
  ["lighting", /\blighting\b|daylight|practical light/iu],
  ["physical-plausibility", /physically plausible|physically possible|physical contact|gravity|occlusion/iu],
  ["left-hand-drive", /left-hand-drive|vehicle-left driving position/iu],
  ["steering-wheel", /steering wheel/iu],
  ["center-console", /center console/iu],
  ["driver-door-window", /driver door|door\/window/iu],
  ["group-count", /exactly\s+\d+\s+people|\d+\s+people are present/iu],
  ["accidental-event", /accidental/iu],
  ["body-scale", /body scale consistent with the surrounding environment|natural body proportions consistent with the environment/iu]
]);

const PHASE5_BASELINE_SECTION = `## Phase 5 — Frozen old-vs-new baseline

This preserved baseline is the original Phase 5 result from commit \`ce00c39\`. It compares the legacy engine with Canonical V3 before the Phase 7 natural-imperfection layer. It is retained unchanged so the Phase 7 measurements below do not rewrite historical results.

| Case | Old words | New words | Word reduction | Old repeated facts | New repeated facts | New determinism |
|---|---:|---:|---:|---:|---:|:---:|
| Car LHD driver selfie | 368 | 190 | 48% | 6 | 1 | 10/10 |
| Car tight crop | 363 | 148 | 59% | 6 | 1 | 10/10 |
| Bedroom direct selfie | 230 | 138 | 40% | 3 | 1 | 10/10 |
| Mirror selfie | 235 | 99 | 58% | 3 | 1 | 10/10 |
| Group selfie | 259 | 112 | 57% | 3 | 1 | 10/10 |
| Accidental capture | 284 | 91 | 68% | 4 | 1 | 10/10 |
| Identity + eyewear | 215 | 142 | 34% | 3 | 1 | 10/10 |

### Phase 5 aggregate metrics

- Average prompt length: **279 words old** vs **131 words new** (53% reduction).
- Repeated semantic-fact signals: **28 old** vs **7 new** across the seven cases.
- Conflict records normalized per 100 cases: **142.9 old** vs **0 new**.
- Canonical V3 determinism: **10/10 identical outputs for every case**.
`;

function wordCount(value) {
  const text = String(value ?? "").trim();
  return text ? text.split(/\s+/u).length : 0;
}

function factUnits(prompt) {
  return String(prompt ?? "")
    .replace(/\[[^\]]+\]/gu, " ")
    .split(/\n+|(?<=[.!?])\s+|;\s*/u)
    .map((unit) => unit.replace(/\s+/gu, " ").trim())
    .filter(Boolean);
}

function duplicateFactCount(prompt) {
  const units = factUnits(prompt);
  let duplicates = 0;
  for (const [, pattern] of FACT_CATEGORIES) {
    const matchingUnits = units.filter((unit) => pattern.test(unit)).length;
    duplicates += Math.max(0, matchingUnits - 1);
  }
  return duplicates;
}

function countOccurrences(value, needle) {
  return String(value).split(needle).length - 1;
}

function realismSignalCount(prompt) {
  return REALISM_SIGNAL_PHRASES.reduce(
    (total, phrase) => total + countOccurrences(prompt, phrase),
    0
  );
}

function cameraArtifactSignalCount(prompt) {
  return CAMERA_ARTIFACT_SIGNAL_PHRASES.reduce(
    (total, phrase) => total + countOccurrences(prompt, phrase),
    0
  );
}

function emittedPhraseCount(prompt, phrase) {
  return phrase ? countOccurrences(prompt, phrase) : 0;
}

function withoutNaturalImperfections(phase7Prompt, imperfections) {
  if (!imperfections) return phase7Prompt;
  assert.equal(
    countOccurrences(phase7Prompt, imperfections),
    1,
    "Phase 7 prompt must contain its natural-imperfection description exactly once"
  );
  return phase7Prompt.replace(imperfections, "").replace(/\s{2,}/gu, " ").trim();
}

function withoutLightingPhysics(prompt, lightingPhysics) {
  if (!lightingPhysics) return prompt;
  assert.equal(
    countOccurrences(prompt, lightingPhysics),
    1,
    "Current prompt must contain its lighting-physics description exactly once"
  );
  return prompt.replace(lightingPhysics, "").replace(/\s{2,}/gu, " ").trim();
}

function withoutCameraArtifacts(prompt, cameraArtifacts) {
  if (!cameraArtifacts) return prompt;
  assert.equal(
    countOccurrences(prompt, cameraArtifacts),
    1,
    "Current prompt must contain its camera-artifact description exactly once"
  );
  return prompt.replace(cameraArtifacts, "").replace(/\s{2,}/gu, " ").trim();
}

function deterministicCount(factory) {
  const outputs = Array.from({ length: 10 }, factory);
  return outputs.filter((value) => value === outputs[0]).length;
}

function uniqueConflicts(conflicts) {
  const seen = new Set();
  return conflicts.filter((item) => {
    const key = [item.property ?? item.field, item.winner ?? item.from, item.loser ?? item.to, item.resolution ?? item.reason].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function runLegacy(input) {
  const state = normalizeLegacyState(structuredClone(input));
  const prompt = buildPositivePrompt(structuredClone(input));
  return {
    prompt,
    conflicts: Array.isArray(state.__canonicalConflicts) ? state.__canonicalConflicts : []
  };
}

function runCanonicalVariants(input) {
  const resolved = resolveCanonicalConflicts(structuredClone(input), input?.sceneFacts);
  const canonical = buildCanonicalV3(resolved.cleanInput);
  const phase7Step4Prompt = buildOpenAIImagePrompt(canonical);
  const cameraArtifacts = describeCameraArtifacts(canonical);
  const phase7Step3Prompt = withoutCameraArtifacts(phase7Step4Prompt, cameraArtifacts);
  const imperfections = describeNaturalImperfections(canonical);
  const lightingPhysics = describeLightingPhysics(canonical);
  const phase7Prompt = withoutLightingPhysics(phase7Step3Prompt, lightingPhysics);
  const phase6Prompt = withoutNaturalImperfections(phase7Prompt, imperfections);
  return {
    canonical,
    phase6Prompt,
    phase7Prompt,
    phase7Step3Prompt,
    phase7Step4Prompt,
    lightingPhysics,
    cameraArtifacts,
    conflicts: uniqueConflicts([
      ...(Array.isArray(resolved.conflicts) ? resolved.conflicts : []),
      ...(Array.isArray(canonical.resolution?.conflicts) ? canonical.resolution.conflicts : [])
    ])
  };
}

function signed(value) {
  return value > 0 ? `+${value}` : String(value);
}

function markdownTable(rows) {
  const header = "| Case | Legacy words | Phase 6 words | Phase 7 words | P7 Δ vs P6 | Legacy repeat | P6 repeat | P7 repeat | Legacy realism | P6 realism | P7 realism | Legacy det. | P6 det. | P7 det. | P7 ≤250 |";
  const divider = "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|:---:|:---:|:---:|:---:|";
  const body = rows.map((row) => `| ${row.label} | ${row.legacyWords} | ${row.phase6Words} | ${row.phase7Words} | ${signed(row.phase7Words - row.phase6Words)} | ${row.legacyDuplicates} | ${row.phase6Duplicates} | ${row.phase7Duplicates} | ${row.legacyRealism} | ${row.phase6Realism} | ${row.phase7Realism} | ${row.legacyDeterminism}/10 | ${row.phase6Determinism}/10 | ${row.phase7Determinism}/10 | ${row.phase7Words <= WORD_CAP ? "yes" : "no"} |`);
  return [header, divider, ...body].join("\n");
}

function markdownStep4Table(rows) {
  const header = "| Case | P7.2 words | P7.3 words | P7.4 words | P7.4 Δ vs P7.3 | P7.2 repeat | P7.3 repeat | P7.4 repeat | Imperfections | Lighting | Artifacts | P7.2 det. | P7.3 det. | P7.4 det. | P7.4 ≤250 |";
  const divider = "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|:---:|:---:|:---:|:---:|";
  const body = rows.map((row) => `| ${row.label} | ${row.phase7Step2Words} | ${row.phase7Step3Words} | ${row.phase7Step4Words} | ${signed(row.phase7Step4Words - row.phase7Step3Words)} | ${row.phase7Step2Duplicates} | ${row.phase7Step3Duplicates} | ${row.phase7Step4Duplicates} | ${row.phase7Step2Imperfections} | ${row.phase7Step3Lighting} | ${row.phase7Step4Artifacts} | ${row.phase7Step2Determinism}/10 | ${row.phase7Step3Determinism}/10 | ${row.phase7Step4Determinism}/10 | ${row.phase7Step4Words <= WORD_CAP ? "yes" : "no"} |`);
  return [header, divider, ...body].join("\n");
}

assert.equal(Object.keys(golden.cases).length >= 7, true, "legacy golden file must contain the seven comparison cases");

const rows = [];
let legacyConflictTotal = 0;
let canonicalConflictTotal = 0;

for (const [id, label] of CASE_ORDER) {
  const entry = golden.cases[id];
  assert.ok(entry?.input, `missing golden input for ${id}`);

  const input = structuredClone(entry.input);
  const legacy = runLegacy(input);
  const canonical = runCanonicalVariants(input);

  assert.ok(legacy.prompt.length > 0, `${id}: legacy prompt must not be empty`);
  assert.ok(canonical.phase6Prompt.length > 0, `${id}: Phase 6 prompt must not be empty`);
  assert.ok(canonical.phase7Prompt.length > 0, `${id}: Phase 7 prompt must not be empty`);
  assert.ok(canonical.phase7Step3Prompt.length > 0, `${id}: Phase 7 Step 3 prompt must not be empty`);
  assert.ok(canonical.phase7Step4Prompt.length > 0, `${id}: Phase 7 Step 4 prompt must not be empty`);
  assert.equal(realismSignalCount(canonical.phase6Prompt), 0, `${id}: Phase 6 prompt must not contain Phase 7 realism signals`);
  assert.ok(realismSignalCount(canonical.phase7Prompt) >= 1, `${id}: Phase 7 prompt must contain a realism signal`);
  assert.ok(realismSignalCount(canonical.phase7Prompt) <= 3, `${id}: Phase 7 realism layer must stay sparse`);
  assert.equal(cameraArtifactSignalCount(canonical.phase7Step3Prompt), 0, `${id}: Step 3 baseline must not contain Step 4 artifact signals`);
  assert.ok(cameraArtifactSignalCount(canonical.phase7Step4Prompt) >= 1, `${id}: Step 4 prompt must contain a camera-artifact signal`);
  assert.ok(cameraArtifactSignalCount(canonical.phase7Step4Prompt) <= 2, `${id}: Step 4 camera artifacts must stay sparse`);
  assert.ok(wordCount(canonical.phase6Prompt) <= WORD_CAP, `${id}: Phase 6 prompt must stay at or below ${WORD_CAP} words`);
  assert.ok(wordCount(canonical.phase7Prompt) <= WORD_CAP, `${id}: Phase 7 prompt must stay at or below ${WORD_CAP} words`);
  assert.ok(wordCount(canonical.phase7Step3Prompt) <= WORD_CAP, `${id}: Phase 7 Step 3 prompt must stay at or below ${WORD_CAP} words`);
  assert.ok(wordCount(canonical.phase7Step4Prompt) <= WORD_CAP, `${id}: Phase 7 Step 4 prompt must stay at or below ${WORD_CAP} words`);

  const legacyDeterminism = deterministicCount(() => runLegacy(input).prompt);
  const phase6Determinism = deterministicCount(() => runCanonicalVariants(input).phase6Prompt);
  const phase7Determinism = deterministicCount(() => runCanonicalVariants(input).phase7Prompt);
  const phase7Step3Determinism = deterministicCount(() => runCanonicalVariants(input).phase7Step3Prompt);
  const phase7Step4Determinism = deterministicCount(() => runCanonicalVariants(input).phase7Step4Prompt);
  assert.equal(legacyDeterminism, 10, `${id}: legacy output must be identical across 10 runs`);
  assert.equal(phase6Determinism, 10, `${id}: Phase 6 output must be identical across 10 runs`);
  assert.equal(phase7Determinism, 10, `${id}: Phase 7 output must be identical across 10 runs`);
  assert.equal(phase7Step3Determinism, 10, `${id}: Phase 7 Step 3 output must be identical across 10 runs`);
  assert.equal(phase7Step4Determinism, 10, `${id}: Phase 7 Step 4 output must be identical across 10 runs`);

  rows.push({
    id,
    label,
    legacyWords: wordCount(legacy.prompt),
    phase6Words: wordCount(canonical.phase6Prompt),
    phase7Words: wordCount(canonical.phase7Prompt),
    legacyDuplicates: duplicateFactCount(legacy.prompt),
    phase6Duplicates: duplicateFactCount(canonical.phase6Prompt),
    phase7Duplicates: duplicateFactCount(canonical.phase7Prompt),
    legacyRealism: realismSignalCount(legacy.prompt),
    phase6Realism: realismSignalCount(canonical.phase6Prompt),
    phase7Realism: realismSignalCount(canonical.phase7Prompt),
    legacyDeterminism,
    phase6Determinism,
    phase7Determinism,
    phase7Step2Words: wordCount(canonical.phase7Prompt),
    phase7Step3Words: wordCount(canonical.phase7Step3Prompt),
    phase7Step4Words: wordCount(canonical.phase7Step4Prompt),
    phase7Step2Duplicates: duplicateFactCount(canonical.phase7Prompt),
    phase7Step3Duplicates: duplicateFactCount(canonical.phase7Step3Prompt),
    phase7Step4Duplicates: duplicateFactCount(canonical.phase7Step4Prompt),
    phase7Step2Imperfections: realismSignalCount(canonical.phase7Prompt),
    phase7Step3Lighting: emittedPhraseCount(canonical.phase7Step3Prompt, canonical.lightingPhysics),
    phase7Step4Artifacts: cameraArtifactSignalCount(canonical.phase7Step4Prompt),
    phase7Step2Determinism: phase7Determinism,
    phase7Step3Determinism,
    phase7Step4Determinism
  });

  legacyConflictTotal += legacy.conflicts.length;
  canonicalConflictTotal += canonical.conflicts.length;
}

const caseCount = rows.length;
const average = (field) => Math.round(rows.reduce((sum, row) => sum + row[field], 0) / caseCount);
const total = (field) => rows.reduce((sum, row) => sum + row[field], 0);
const phase6ConflictPer100 = Number(((canonicalConflictTotal / caseCount) * 100).toFixed(1));
const legacyConflictPer100 = Number(((legacyConflictTotal / caseCount) * 100).toFixed(1));
const phase6UnderCap = rows.filter((row) => row.phase6Words <= WORD_CAP).length;
const phase7UnderCap = rows.filter((row) => row.phase7Words <= WORD_CAP).length;
const phase7Step3UnderCap = rows.filter((row) => row.phase7Step3Words <= WORD_CAP).length;
const phase7Step4UnderCap = rows.filter((row) => row.phase7Step4Words <= WORD_CAP).length;
const table = markdownTable(rows);
const step4Table = markdownStep4Table(rows);

const report = `# Canonical V3 Comparison Reports

Generated by \`tests/canonical-v3-comparison.mjs\` from the seven frozen Phase 1 golden inputs.

${PHASE5_BASELINE_SECTION}

## Phase 7 Step 2 — Three-way natural-imperfection comparison

Phase 6 is the Canonical V3 adapter output before \`describeNaturalImperfections()\`. Phase 7 is the same resolved frozen Canonical V3 state with that read-only helper included. After the approved lighting-physics layer, the comparison removes its exact adapter-only sentence first, then removes only the natural-imperfection text to reconstruct the frozen Step 2 columns; no canonical field is modified.

${table}

### Phase 7 aggregate metrics

- Average prompt length: **${average("legacyWords")} words legacy**, **${average("phase6Words")} words Phase 6**, and **${average("phase7Words")} words Phase 7** (Phase 7 is **+${average("phase7Words") - average("phase6Words")} words** versus Phase 6).
- Repeated semantic-fact signals: **${total("legacyDuplicates")} legacy**, **${total("phase6Duplicates")} Phase 6**, and **${total("phase7Duplicates")} Phase 7** across the seven cases.
- Natural-imperfection signals: **${total("legacyRealism")} legacy**, **${total("phase6Realism")} Phase 6**, and **${total("phase7Realism")} Phase 7** across the seven cases.
- Prompt-length cap: **${phase6UnderCap}/${caseCount} Phase 6** and **${phase7UnderCap}/${caseCount} Phase 7** prompts are at or below **${WORD_CAP} words**.
- Determinism: **10/10 identical outputs for every legacy, Phase 6, and Phase 7 case**.
- Conflict records normalized per 100 cases: **${legacyConflictPer100} legacy** vs **${phase6ConflictPer100} Canonical V3**; the Phase 6 and Phase 7 variants resolve the same canonical state.
- The Phase 7 column has one additional body-scale/proportion repeat in **${rows.filter((row) => row.phase7Duplicates > row.phase6Duplicates).length}/${caseCount} cases**. This is a measurement finding only; Step 2 does not alter the Imperfection Engine wording.

### Measurement notes

- Legacy output is \`buildPositivePrompt()\`. Phase 6 and Phase 7 output both use the Phase 3 resolver → \`buildCanonicalV3()\` → OpenAI image adapter pipeline.
- Word counts use whitespace-delimited tokens. The 250-word cap applies to Canonical V3 adapter prompts; legacy prompt length is reported as a baseline, not gated by this cap.
- “Repeated facts” is a deterministic semantic-signal metric. It counts category appearances beyond the first across identity reference, eyewear, camera device/geometry, lighting, physical plausibility, LHD geometry, steering wheel, center console, driver door/window, group count, accidental event, and body scale/proportions.
- “Realism signals” counts only the four exact Phase 7 Step 1 helper phrases. This keeps the metric separate from existing canonical identity, lighting, and anatomy facts.
- The Phase 7 metric uses token boundaries for the camera terms \`yaw\`, \`pitch\`, and \`roll\`, so incidental text such as \`flyaways\` is not counted as camera geometry. The frozen Phase 5 baseline retains its original broad-match tally by design; therefore its legacy repeated-fact total is historical rather than recalculated here.

## Phase 7 Step 4 — Incremental camera-artifacts comparison

Step 2 is the frozen natural-imperfection variant. Step 3 adds the lighting-physics helper. Step 4 adds \`describeCameraArtifacts()\` after the camera description. The test reconstructs prior layers by removing exact adapter-only helper text; no canonical field is modified.

${step4Table}

### Phase 7 Step 4 aggregate metrics

- Average prompt length: **${average("phase7Step2Words")} words Step 2**, **${average("phase7Step3Words")} words Step 3**, and **${average("phase7Step4Words")} words Step 4** (Step 4 is **+${average("phase7Step4Words") - average("phase7Step3Words")} words** versus Step 3).
- Repeated semantic-fact signals: **${total("phase7Step2Duplicates")} Step 2**, **${total("phase7Step3Duplicates")} Step 3**, and **${total("phase7Step4Duplicates")} Step 4** across the seven cases.
- Natural-imperfection signals: **${total("phase7Step2Imperfections")} Step 2**; lighting-physics signals: **${total("phase7Step3Lighting")} Step 3**; camera-artifact signals: **${total("phase7Step4Artifacts")} Step 4**.
- Prompt-length cap: **${phase7UnderCap}/${caseCount} Step 2**, **${phase7Step3UnderCap}/${caseCount} Step 3**, and **${phase7Step4UnderCap}/${caseCount} Step 4** prompts are at or below **${WORD_CAP} words**.
- Determinism: **10/10 identical outputs for every Step 2, Step 3, and Step 4 case**.
- The Step 4 helper adds device-, light-, or motion-causal camera behavior only; it does not add environmental details or post-processing instructions.
`;

assert.match(report, /## Phase 5 — Frozen old-vs-new baseline/u, "report must retain the Phase 5 baseline");
assert.match(report, /## Phase 7 Step 2 — Three-way natural-imperfection comparison/u, "report must include the Phase 7 section");
assert.match(report, /Legacy realism \| P6 realism \| P7 realism/u, "report must include per-case realism signal counts");
assert.match(report, /## Phase 7 Step 4 — Incremental camera-artifacts comparison/u, "report must include the Step 4 section");
assert.match(report, /P7\.4 words/u, "report must include per-case Step 4 comparison values");

fs.writeFileSync(fileURLToPath(REPORT_URL), report, "utf8");

console.log("\nBEGIN_CANONICAL_V3_COMPARISON_REPORT");
console.log(report.trimEnd());
console.log("END_CANONICAL_V3_COMPARISON_REPORT\n");
console.log("✓ canonical-v3 Phase 7 Step 4 incremental comparison passed");
