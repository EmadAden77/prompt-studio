import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ADVANCED_REALISM_NEGATIVE_RULES,
  advancedRealismQaItems,
  buildAdvancedRealismSections,
  evaluateRealismRisk,
  getAccessoryProfileOptions,
  getObjectProfileOptions,
  getSceneProfileOptions,
  inferSceneProfile,
  optimizePrompt,
  resolveAdvancedRealismState
} from "../js/advanced-realism-v1.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

assert.ok(getSceneProfileOptions().length >= 10, "Scene Profiles catalog should be broad");
assert.ok(getAccessoryProfileOptions().some((item) => item.value === "eyeglasses"));
assert.ok(getObjectProfileOptions().some((item) => item.value === "laptop"));

assert.equal(inferSceneProfile({ scene:"custom", customScene:"داخل محل نظارات طبي في السعودية", customSceneDetails:"رفوف ومرايا" }), "optical-store");
assert.equal(inferSceneProfile({ scene:"custom", customScene:"داخل بقالة صغيرة في حي سكني", customSceneDetails:"" }), "grocery");
assert.equal(inferSceneProfile({ scene:"custom", customScene:"داخل صيدلية حديثة", customSceneDetails:"" }), "pharmacy");

const mismatch = resolveAdvancedRealismState({
  scene:"custom", customScene:"داخل بقالة صغيرة", customSceneDetails:"رفوف منتجات", sceneProfile:"optical-store",
  accessoryProfile:"none", objectProfile:"none", accessoryDetail:"", interactionObject:"", composition:"upper"
});
assert.equal(mismatch.state.sceneProfile, "grocery", "Written custom location must override a conflicting scene profile");
assert.ok(mismatch.conflicts.some((item) => item.code === "scene-profile-mismatch"));

const autoAccessory = resolveAdvancedRealismState({
  scene:"custom", customScene:"محل نظارات", sceneProfile:"auto", accessoryProfile:"auto",
  accessoryDetail:"نظارة بإطار أسود رفيع", objectProfile:"auto", interactionObject:"", composition:"close"
});
assert.equal(autoAccessory.state.accessoryProfile, "eyeglasses");

const largeObject = resolveAdvancedRealismState({
  scene:"custom", customScene:"كوفي", sceneProfile:"auto", accessoryProfile:"none", accessoryDetail:"",
  objectProfile:"auto", interactionObject:"يمسك لابتوب", composition:"close"
});
assert.equal(largeObject.state.objectProfile, "laptop");
assert.ok(largeObject.conflicts.some((item) => item.code === "large-object-tight-crop"));

const advancedState = {
  scene:"custom", customScene:"داخل محل نظارات طبي", customSceneDetails:"رفوف نظارات ومرآة",
  sceneProfile:"optical-store", accessoryProfile:"eyeglasses", accessoryDetail:"إطار أسود رفيع",
  objectProfile:"held-eyeglasses", interactionObject:"يمسك نظارة باليد الحرة", composition:"upper",
  selfieAngle:"three-quarter", peopleDensity:"sparse", hasReference:true, time:"night"
};
const sections = buildAdvancedRealismSections(advancedState, []);
const joined = sections.join("\n\n");
assert.match(joined, /\[SCENE PROFILE\]/u);
assert.match(joined, /\[OCCLUSION ENGINE\]/u);
assert.match(joined, /\[ACCESSORY PHYSICS\]/u);
assert.match(joined, /\[OBJECT PROFILE\]/u);
assert.match(joined, /\[ENVIRONMENT MICROPHYSICS\]/u);
assert.match(joined, /\[REALISM RISK CHECK\]/u);
assert.match(joined, /at most two subtle cues/u);
assert.match(joined, /nasal bridge/u);
assert.match(joined, /fingers occlude the frame according to depth/u);

const risk = evaluateRealismRisk(advancedState, []);
assert.equal(risk.score, 100);
assert.equal(risk.level, "ممتاز");

const risky = evaluateRealismRisk({
  ...advancedState,
  hasReference:false,
  customScene:"",
  sceneProfile:"auto",
  objectProfile:"laptop",
  composition:"close"
}, [{ code:"x", qa:"x", prompt:"x" }]);
assert.ok(risky.score < risk.score);
assert.ok(risky.issues.length >= 3);

const driverCloseState = {
  scene:"rangeRover", carSeat:"driver-left", composition:"close", selfieAngle:"slight-low",
  sceneProfile:"auto", accessoryProfile:"none", accessoryDetail:"", objectProfile:"none", interactionObject:"",
  peopleDensity:"sparse", hasReference:true, time:"day"
};
const driverSections = buildAdvancedRealismSections(driverCloseState, []).join("\n\n");
assert.match(driverSections, /\[CAR ORIENTATION LOCK\]/u, "Car scene must lock final physical orientation");
assert.match(driverSections, /unmirrored physical camera geometry/u);
assert.match(driverSections, /Do not horizontally flip, selfie-mirror, swap or reinterpret the cabin/u);
assert.match(driverSections, /\[DRIVER SEAT VISUAL VERIFICATION\]/u, "Driver seat must receive visual verification rules");
assert.match(driverSections, /preserve at least one unmistakable driver-side anchor/u);
assert.match(driverSections, /center-console edge on the subject's right/u);
assert.match(driverSections, /driver-door \/ A-pillar \/ side-window geometry on the subject's left/u);

const driverCloseRisk = evaluateRealismRisk(driverCloseState, []);
assert.ok(driverCloseRisk.score < 100, "Close driver selfie must not receive a perfect score because seat verification is visually ambiguous");
assert.ok(driverCloseRisk.issues.some((item) => /مقعد راكب|دليل بصري/u.test(item)), "Driver risk must explain the missing visual anchor risk");

const driverWideRisk = evaluateRealismRisk({ ...driverCloseState, composition:"upper" }, []);
assert.ok(driverWideRisk.score > driverCloseRisk.score, "A wider driver crop should have lower seat-verification risk");

const passengerSections = buildAdvancedRealismSections({ ...driverCloseState, carSeat:"passenger-front-right" }, []).join("\n\n");
assert.match(passengerSections, /\[CAR ORIENTATION LOCK\]/u);
assert.doesNotMatch(passengerSections, /\[DRIVER SEAT VISUAL VERIFICATION\]/u, "Driver-only verification must not be forced on the passenger seat");

const driverQa = advancedRealismQaItems(driverCloseState, [], {});
assert.ok(driverQa.some((item) => item.label === "اتجاه المقصورة"));
assert.ok(driverQa.some((item) => item.label === "تحقق مقعد السائق"));

const optimized = optimizePrompt([
  "[IDENTITY] Keep the exact identity. Keep the exact identity.",
  "[OPTIONAL CONTEXT] Keep context secondary. Keep context secondary.",
  "[CAMERA] Keep front-camera geometry. Keep front-camera geometry.",
  "[CAR ORIENTATION LOCK] Keep physical left-right mapping. Keep physical left-right mapping.",
  "[DRIVER SEAT VISUAL VERIFICATION] Keep one driver anchor. Keep one driver anchor."
].join("\n\n"));
assert.match(optimized.prompt, /\[IDENTITY\] Keep the exact identity\. Keep the exact identity\./u, "Protected identity text must not be shortened");
assert.match(optimized.prompt, /\[CAMERA\] Keep front-camera geometry\. Keep front-camera geometry\./u, "Protected camera text must not be shortened");
assert.match(optimized.prompt, /\[CAR ORIENTATION LOCK\] Keep physical left-right mapping\. Keep physical left-right mapping\./u, "Car orientation lock must be protected from optimizer shortening");
assert.match(optimized.prompt, /\[DRIVER SEAT VISUAL VERIFICATION\] Keep one driver anchor\. Keep one driver anchor\./u, "Driver seat verification must be protected from optimizer shortening");
assert.equal((optimized.prompt.match(/Keep context secondary\./gu) || []).length, 1, "Non-protected exact sentence duplication should be removed");
assert.equal(optimized.stats.removedSentences, 1);

const qa = advancedRealismQaItems(advancedState, [], optimized.stats);
assert.ok(qa.some((item) => item.label === "مؤشر الواقعية"));
assert.ok(qa.some((item) => item.label === "Prompt Optimizer"));
assert.ok(ADVANCED_REALISM_NEGATIVE_RULES.includes("impossible occlusion order"));
assert.ok(ADVANCED_REALISM_NEGATIVE_RULES.includes("unsupported laptop"));
assert.ok(ADVANCED_REALISM_NEGATIVE_RULES.includes("horizontally mirrored cabin after seat mapping"));
assert.ok(ADVANCED_REALISM_NEGATIVE_RULES.includes("driver rendered in front passenger seat"));
assert.ok(ADVANCED_REALISM_NEGATIVE_RULES.includes("center console on driver's left"));

const index = readFileSync(resolve(root, "index.html"), "utf8");
assert.match(index, /id="scene-profile"/u);
assert.match(index, /id="accessory-profile"/u);
assert.match(index, /id="object-profile"/u);
assert.match(index, /id="accessory-detail"/u);
assert.match(index, /id="realism-score-preview"/u);
assert.match(index, /Prompt Optimizer · Occlusion · Microphysics/u);
assert.match(index, /physics-app-v7\.js/u);

const app = readFileSync(resolve(root, "js/physics-app-v7.js"), "utf8");
assert.match(app, /advanced-realism-v1\.js/u);
assert.match(app, /resolveAdvancedRealismState/u);
assert.match(app, /buildAdvancedRealismSections/u);
assert.match(app, /optimizePrompt/u);
assert.match(app, /evaluateRealismRisk/u);
assert.match(app, /ADVANCED_REALISM_NEGATIVE_RULES/u);

console.log("✓ Scene Profiles, Occlusion, Accessories, Object Profiles, Microphysics, Risk Score, Prompt Optimizer and driver-seat verification passed");