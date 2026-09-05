import assert from "node:assert/strict";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";
import { buildOpenAIImagePrompt, describeGymRealism } from "../js/canonical/openai-image-adapter.js";

const wordCount = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const sentenceCount = (value) => String(value ?? "").match(/[^.!?]+[.!?]/gu)?.length ?? 0;
const EFFORT = /Localized sweat sheen|damp shirt patch|Flushed skin|Chalk dust/iu;
const MIRROR = /mirror carries fingerprints|reflection preserves the true background geometry/iu;
const FORBIDDEN = /\b(?:landmark|tower|monument|kingdom|faisaliah|ramadan|fanous|lantern|crescent|trainer|member)\b|mosque\s+minaret|legible Arabic/iu;
const STREET_LEAK = /sodium-orange|shawarma|storefront|parked SUVs|Arabic signage|yellow-and-black curb/iu;

const baseInput = {
  studioSection: "gym",
  intentType: "selfie",
  scene: "gym",
  hasReference: true,
  referenceId: "attached_reference_image",
  clothing: "training-set",
  fabric: "technical-poly",
  fabricWeight: "medium",
  wearState: "post-workout",
  clothingFit: "regular",
  expression: "neutral",
  pose: "seated-rest",
  lighting: "harsh overhead LED practical light",
  time: "night",
  composition: "close"
};

const gym = buildCanonicalV3UserOutput(baseInput);
const hardBefore = JSON.stringify(gym.canonical.hard_constraints);
const gymRealism = describeGymRealism(gym.canonical);
assert.ok(sentenceCount(gymRealism) >= 3 && sentenceCount(gymRealism) <= 4, "gym realism must emit 3-4 sentences");
assert.match(gymRealism, EFFORT, "gym realism must contain one EFFORT sentence");
assert.match(gymRealism, /blurred|soft focus|softens/iu, "gym background must remain blurred or soft");
assert.doesNotMatch(gymRealism, FORBIDDEN, "gym realism must avoid forbidden terms and named background roles");
assert.ok(wordCount(gym.prompt) <= 250, `gym prompt exceeds 250 words (${wordCount(gym.prompt)})`);
assert.match(gym.prompt, EFFORT, "gym prompt must include EFFORT realism");
assert.doesNotMatch(gym.prompt, STREET_LEAK, "gym prompt must not inherit Saudi street fallback details");

const mirror = buildCanonicalV3UserOutput({ ...baseInput, mirrorSelfie: true, mode: "mirror", pose: "mirror-standing" });
const mirrorRealism = describeGymRealism(mirror.canonical);
assert.equal(mirror.canonical.capture.type, "mirror_selfie", "mirror fixture must resolve as mirror selfie");
assert.match(mirrorRealism, MIRROR, "gym mirror selfie must include MIRROR realism");
assert.ok(sentenceCount(mirrorRealism) >= 3 && sentenceCount(mirrorRealism) <= 4, "gym mirror realism must emit 3-4 sentences");
assert.ok(wordCount(mirror.prompt) <= 250, `gym mirror prompt exceeds 250 words (${wordCount(mirror.prompt)})`);
assert.doesNotMatch(mirror.prompt, FORBIDDEN, "gym mirror prompt must avoid forbidden terms and named background roles");
assert.doesNotMatch(mirror.prompt, STREET_LEAK, "gym mirror prompt must not inherit Saudi street fallback details");

const repeats = Array.from({ length: 10 }, () => buildOpenAIImagePrompt(gym.canonical));
assert.equal(new Set(repeats).size, 1, "gym realism determinism must be 10/10");
const mirrorRepeats = Array.from({ length: 10 }, () => buildOpenAIImagePrompt(mirror.canonical));
assert.equal(new Set(mirrorRepeats).size, 1, "gym mirror realism determinism must be 10/10");
assert.equal(JSON.stringify(gym.canonical.hard_constraints), hardBefore, "hard constraints changed after adapter runs");
assert.equal(describeGymRealism(buildCanonicalV3UserOutput({ ...baseInput, scene: "street" }).canonical), "", "gym realism must stay scene-scoped");

console.log(`PHASE24_GYM_WORDS=${wordCount(gym.prompt)}`);
console.log(`PHASE24_GYM_PROMPT=${gym.prompt}`);
console.log(`PHASE24_GYM_MIRROR_WORDS=${wordCount(mirror.prompt)}`);
console.log(`PHASE24_GYM_MIRROR_PROMPT=${mirror.prompt}`);
console.log("✓ Phase 24 gym anti-AI realism signature passed");
