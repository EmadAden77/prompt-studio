import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { buildPositivePrompt, normalizeState as normalizeLegacyState } from "../js/physics-prompt-engine-v5.js";
import { buildCanonicalV3 } from "../js/canonical-v3-engine.js";
import { resolveCanonicalConflicts } from "../js/canonical/conflict-resolver.js";
import { buildOpenAIImagePrompt } from "../js/canonical/openai-image-adapter.js";

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

const FACT_CATEGORIES = Object.freeze([
  ["identity-reference", /identity reference|reference as identity|supplied identity reference|attached reference/iu],
  ["eyewear", /eyewear/iu],
  ["camera-device", /xiaomi 15 ultra|iphone 15 pro max/iu],
  ["camera-geometry", /camera geometry|geometry authority|subject distance|yaw|pitch|roll/iu],
  ["lighting", /\blighting\b|daylight|practical light/iu],
  ["physical-plausibility", /physically plausible|physically possible|physical contact|gravity|occlusion/iu],
  ["left-hand-drive", /left-hand-drive|vehicle-left driving position/iu],
  ["steering-wheel", /steering wheel/iu],
  ["center-console", /center console/iu],
  ["driver-door-window", /driver door|door\/window/iu],
  ["group-count", /exactly\s+\d+\s+people|\d+\s+people are present/iu],
  ["accidental-event", /accidental/iu]
]);

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

function runCanonical(input) {
  const resolved = resolveCanonicalConflicts(structuredClone(input), input?.sceneFacts);
  const canonical = buildCanonicalV3(resolved.cleanInput);
  const prompt = buildOpenAIImagePrompt(canonical);
  return {
    prompt,
    canonical,
    conflicts: uniqueConflicts([
      ...(Array.isArray(resolved.conflicts) ? resolved.conflicts : []),
      ...(Array.isArray(canonical.resolution?.conflicts) ? canonical.resolution.conflicts : [])
    ])
  };
}

function markdownTable(rows) {
  const header = "| Case | Old words | New words | Word reduction | Old repeated facts | New repeated facts | New determinism |";
  const divider = "|---|---:|---:|---:|---:|---:|:---:|";
  const body = rows.map((row) => `| ${row.label} | ${row.oldWords} | ${row.newWords} | ${row.wordReduction}% | ${row.oldDuplicates} | ${row.newDuplicates} | ${row.determinism}/10 |`);
  return [header, divider, ...body].join("\n");
}

assert.equal(Object.keys(golden.cases).length >= 7, true, "legacy golden file must contain the seven comparison cases");

const rows = [];
let oldConflictTotal = 0;
let newConflictTotal = 0;

for (const [id, label] of CASE_ORDER) {
  const entry = golden.cases[id];
  assert.ok(entry?.input, `missing golden input for ${id}`);

  const input = structuredClone(entry.input);
  const legacy = runLegacy(input);
  const canonical = runCanonical(input);

  assert.ok(legacy.prompt.length > 0, `${id}: legacy prompt must not be empty`);
  assert.ok(canonical.prompt.length > 0, `${id}: canonical prompt must not be empty`);

  const repeatedRuns = Array.from({ length: 10 }, () => runCanonical(input).prompt);
  const deterministicCount = repeatedRuns.filter((value) => value === repeatedRuns[0]).length;
  assert.equal(deterministicCount, 10, `${id}: Canonical V3 output must be identical across 10 runs`);

  const oldWords = wordCount(legacy.prompt);
  const newWords = wordCount(canonical.prompt);
  const wordReduction = oldWords === 0 ? 0 : Math.round(((oldWords - newWords) / oldWords) * 100);

  rows.push({
    id,
    label,
    oldWords,
    newWords,
    wordReduction,
    oldDuplicates: duplicateFactCount(legacy.prompt),
    newDuplicates: duplicateFactCount(canonical.prompt),
    determinism: deterministicCount
  });

  oldConflictTotal += legacy.conflicts.length;
  newConflictTotal += canonical.conflicts.length;
}

const caseCount = rows.length;
const oldConflictsPer100 = Number(((oldConflictTotal / caseCount) * 100).toFixed(1));
const newConflictsPer100 = Number(((newConflictTotal / caseCount) * 100).toFixed(1));
const avgOldWords = Math.round(rows.reduce((sum, row) => sum + row.oldWords, 0) / caseCount);
const avgNewWords = Math.round(rows.reduce((sum, row) => sum + row.newWords, 0) / caseCount);
const avgReduction = avgOldWords === 0 ? 0 : Math.round(((avgOldWords - avgNewWords) / avgOldWords) * 100);
const oldDuplicateTotal = rows.reduce((sum, row) => sum + row.oldDuplicates, 0);
const newDuplicateTotal = rows.reduce((sum, row) => sum + row.newDuplicates, 0);

const table = markdownTable(rows);
const report = `# Canonical V3 Old-vs-New Engine Comparison\n\n` +
  `Generated by \`tests/canonical-v3-comparison.mjs\` from the seven frozen Phase 1 golden inputs.\n\n` +
  `${table}\n\n` +
  `## Aggregate metrics\n\n` +
  `- Average prompt length: **${avgOldWords} words old** vs **${avgNewWords} words new** (${avgReduction}% reduction).\n` +
  `- Repeated semantic-fact signals: **${oldDuplicateTotal} old** vs **${newDuplicateTotal} new** across the seven cases.\n` +
  `- Conflict records normalized per 100 cases: **${oldConflictsPer100} old** vs **${newConflictsPer100} new**.\n` +
  `- Canonical V3 determinism: **10/10 identical outputs for every case**.\n\n` +
  `## Measurement notes\n\n` +
  `- Old output is \`buildPositivePrompt()\` from the current legacy engine. New output is the Phase 3 resolver → \`buildCanonicalV3()\` → Phase 4 OpenAI image adapter pipeline.\n` +
  `- Word counts use whitespace-delimited tokens.\n` +
  `- “Repeated facts” is a deterministic semantic-signal metric. The test splits prompts into factual units, checks stable categories such as identity reference, eyewear, camera device/geometry, lighting, physical plausibility, LHD geometry, steering wheel, center console, driver door/window, group count and accidental event, then counts category appearances beyond the first. It is deliberately stricter than exact-string duplicate detection.\n` +
  `- Conflict rate is the number of recorded conflict/correction events divided by seven cases and normalized to 100 cases. It is not a generator-quality score; it measures how much input normalization/resolution work each pipeline records for this corpus.\n`;

fs.writeFileSync(fileURLToPath(REPORT_URL), report, "utf8");

console.log("\nBEGIN_CANONICAL_V3_COMPARISON_REPORT");
console.log(report.trimEnd());
console.log("END_CANONICAL_V3_COMPARISON_REPORT\n");
console.log("✓ canonical-v3 old-vs-new comparison passed");
