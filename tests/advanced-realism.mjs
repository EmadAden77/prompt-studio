import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ADVANCED_REALISM_NEGATIVE_RULES,
  advancedRealismQaItems,
  buildAdvancedRealismSections,
  evaluateRealismRisk,
  optimizePrompt,
  resolveAdvancedRealismState
} from "../js/advanced-realism-v1.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const base = {
  scene:"custom", customScene:"inside a modern medical optical store", customSceneDetails:"eyeglass display racks and one small mirror",
  city:"riyadh", time:"night", poseFamily:"relaxed", pose:"custom-relaxed-close", composition:"close", selfieAngle:"three-quarter",
  lighting:"custom-night-led", peopleDensity:"low", placeState:"used", subjectMoment:"browsing", interactionObject:"eyeglasses",
  sceneProfile:"optical-store", accessoryProfile:"eyeglasses", accessoryDetail:"black full-rim rectangular optical frame", objectProfile:"eyeglasses",
  clothing:"thobe-white", identityNotes:"preserve identity"
};

const resolved = resolveAdvancedRealismState(base);
assert.equal(resolved.state.sceneProfile, "optical-store");
assert.equal(resolved.state.accessoryProfile, "eyeglasses");
assert.equal(resolved.state.objectProfile, "eyeglasses");
assert.equal(resolved.state.sceneProfileSource, "explicit");
assert.equal(resolved.state.advancedProfileSource, "explicit");

const sections = buildAdvancedRealismSections(resolved.state, resolved.conflicts).join("\n\n");
assert.match(sections, /\[SCENE PROFILE\]/u);
assert.match(sections, /medical optical store/u);
assert.match(sections, /\[OCCLUSION ENGINE\]/u);
assert.match(sections, /\[ACCESSORY PHYSICS\]/u);
assert.match(sections, /black full-rim rectangular optical frame/u);
assert.match(sections, /\[OBJECT PROFILE\]/u);
assert.match(sections, /eyeglasses/u);
assert.match(sections, /\[ENVIRONMENT MICROPHYSICS\]/u);
assert.match(sections, /\[REALISM RISK CHECK\]/u);

const inferred = resolveAdvancedRealismState({
  ...base,
  sceneProfile:"auto", accessoryProfile:"auto", objectProfile:"auto", customScene:"inside an optical store with wall-mounted frame displays"
});
assert.equal(inferred.state.sceneProfile, "optical-store");
assert.equal(inferred.state.accessoryProfile, "eyeglasses");
assert.equal(inferred.state.objectProfile, "eyeglasses");
assert.equal(inferred.state.advancedProfileSource, "inferred");

const car = resolveAdvancedRealismState({
  ...base,
  studioSection:"car", scene:"rangeRover", customScene:"", customSceneDetails:"", sceneProfile:"auto", accessoryProfile:"auto", objectProfile:"none"
});
assert.equal(car.state.sceneProfile, "car");
const carSections = buildAdvancedRealismSections(car.state, car.conflicts).join("\n\n");
assert.match(carSections, /vehicle-relative/u);
assert.match(carSections, /left-hand-drive/u);
assert.doesNotMatch(carSections, /optical store/u);

const risk = evaluateRealismRisk({ ...base, peopleDensity:"busy", interactionObject:"large unsupported object" }, ["camera mismatch", "light mismatch"]);
assert.ok(risk.score < 100);
assert.ok(["LOW","MEDIUM","HIGH"].includes(risk.level));

const optimized = optimizePrompt([
  "[IDENTITY] Keep the exact identity. Keep the exact identity.",
  "[CONTEXT] Keep context secondary. Keep context secondary.",
  "[CAMERA] Keep front-camera geometry. Keep front-camera geometry.",
  "[CAR ORIENTATION LOCK] Keep physical left-right mapping. Keep physical left-right mapping.",
].join("\n\n"));
assert.match(optimized.prompt, /\[IDENTITY\] Keep the exact identity\. Keep the exact identity\./u, "Protected identity text must not be shortened");
assert.match(optimized.prompt, /\[CAMERA\] Keep front-camera geometry\. Keep front-camera geometry\./u, "Protected camera text must not be shortened");
assert.match(optimized.prompt, /\[CAR ORIENTATION LOCK\] Keep physical left-right mapping\. Keep physical left-right mapping\./u, "Car orientation lock must be protected from optimizer shortening");
assert.equal((optimized.prompt.match(/Keep context secondary\./gu) || []).length, 1, "Non-protected exact sentence duplication should be removed");
assert.equal(optimized.stats.removedSentences, 1);

const qa = advancedRealismQaItems(resolved.state, [], optimized.stats);
assert.ok(qa.some((item) => item.label === "مؤشر الواقعية"));
assert.ok(qa.some((item) => item.label === "Prompt Optimizer"));
assert.ok(ADVANCED_REALISM_NEGATIVE_RULES.includes("impossible occlusion order"));
assert.ok(ADVANCED_REALISM_NEGATIVE_RULES.includes("unsupported laptop"));
assert.ok(ADVANCED_REALISM_NEGATIVE_RULES.includes("horizontally mirrored left-hand-drive cabin"));
assert.ok(ADVANCED_REALISM_NEGATIVE_RULES.includes("driver rendered on the wrong side of a left-hand-drive cabin"));
assert.ok(ADVANCED_REALISM_NEGATIVE_RULES.includes("center console on driver's left"));

const index = readFileSync(resolve(root, "index.html"), "utf8");
assert.match(index, /id="scene-profile"/u);
assert.match(index, /id="accessory-profile"/u);
assert.match(index, /id="object-profile"/u);
assert.match(index, /id="accessory-detail"/u);
assert.match(index, /id="realism-score-preview"/u);
assert.match(index, /Prompt Optimizer · Occlusion · Microphysics/u);
const directLegacyEntry = /physics-app-v7\.js/u.test(index);
const canonicalGateEntry = /js\/canonical\/engine-gate\.js/u.test(index);
assert.equal(directLegacyEntry || canonicalGateEntry, true, "live page must reach physics-app-v7 directly or through the Phase 6 engine gate");
if (canonicalGateEntry) {
  const gate = readFileSync(resolve(root, "js/canonical/engine-gate.js"), "utf8");
  assert.match(gate, /physics-app-v7\.js/u, "Phase 6 gate must keep the legacy v7 application reachable");
}

const app = readFileSync(resolve(root, "js/physics-app-v7.js"), "utf8");
assert.match(app, /advanced-realism-v1\.js/u);
assert.match(app, /resolveAdvancedRealismState/u);
assert.match(app, /buildAdvancedRealismSections/u);
assert.match(app, /optimizePrompt/u);
assert.match(app, /evaluateRealismRisk/u);
assert.match(app, /ADVANCED_REALISM_NEGATIVE_RULES/u);

console.log("✓ Scene Profiles, Occlusion, Accessories, Object Profiles, Microphysics, Risk Score, Prompt Optimizer and driver-seat verification passed");