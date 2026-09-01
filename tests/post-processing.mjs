import assert from "node:assert/strict";
import { buildPostProcessingEnhancement, normalizePostProcessingState } from "../js/post-processing-engine-v1.js";

assert.deepEqual(normalizePostProcessingState({}).postProcessing, []);
assert.deepEqual(normalizePostProcessingState({ postProcessing:["film-grain", "bloom", "vhs"] }).postProcessing, ["film-grain", "bloom"]);
assert.deepEqual(normalizePostProcessingState({ postProcessing:["film-grain", "digital-clean"] }).postProcessing, ["digital-clean"]);

const none = buildPostProcessingEnhancement({ postProcessing:[] });
assert.equal(none.positive, "");
assert.match(none.qa[0].value, /بدون معالجة/u);

const selected = buildPostProcessingEnhancement({ postProcessing:["chromatic-aberration", "motion-blur"] });
assert.match(selected.positive, /Selected effects only/u);
assert.match(selected.positive, /actual movement vector/u);
assert.match(selected.positive, /subordinate to identity/u);
assert.ok(selected.negative.includes("more than two post-processing effects"));

console.log("post-processing engine tests passed");
