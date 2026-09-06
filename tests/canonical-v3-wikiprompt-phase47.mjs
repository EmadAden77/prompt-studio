import assert from "node:assert/strict";
import { buildCanonicalV3UserOutput, resolvePhase47Context } from "../js/canonical/canonical-v3-phase47.js";
import { SECTION_REGISTRY } from "../js/sections/index.js";
import { MIRROR_RULES_SENTENCE } from "../js/sections/wikiprompt-phase47-profiles.js";

const wc = s => String(s||"").trim().split(/\s+/u).filter(Boolean).length;

for (const section of Object.values(SECTION_REGISTRY)) {
  assert.ok(section.actionDescription && /\b(?:holds|extends|settles|leans|pauses|continues|catches|interacts|remains)\b/iu.test(section.actionDescription), `${section.id}: action description`);
  assert.ok(section.imperfections && /skin|pores|hair|sweat|texture/iu.test(section.imperfections), `${section.id}: positive imperfections`);
  assert.ok(section.rules?.contextualRules, `${section.id}: contextual rules`);
}

const car = buildCanonicalV3UserOutput({studioSection:"carExterior",hasReference:true,time:"night",carExteriorLocation:"villa",carExteriorPose:"door-lean",clothing:"thobe-white",expression:"neutral"});
assert.ok(car.prompt.includes(car.section.actionDescription));
assert.ok(car.prompt.includes(car.section.imperfections));
assert.match(car.prompt,/Identity strictly preserved/iu);
assert.match(car.prompt,/195 cm, 88 kg/iu);
assert.ok(wc(car.prompt)<=280,`carExterior budget ${wc(car.prompt)}`);
assert.equal(car.phase47.determinism,"10/10");

const mirror = buildCanonicalV3UserOutput({studioSection:"mirror",hasReference:true,scene:"bedroom",clothing:"plain white T-shirt",expression:"neutral"});
assert.ok(mirror.prompt.includes(MIRROR_RULES_SENTENCE));
assert.match(mirror.prompt,/camera is pointed at the mirror/iu);
assert.match(mirror.prompt,/reflections follow correct geometry/iu);
assert.ok(wc(mirror.prompt)<=250,`mirror budget ${wc(mirror.prompt)}`);

const explicitFormal = resolvePhase47Context({studioSection:"gym",clothing:"formal navy suit with tie"});
assert.equal(explicitFormal.input.clothing,"formal navy suit with tie");
assert.equal(explicitFormal.conflicts[0].resolution,"preserve_explicit_user");
const autoGym = resolvePhase47Context({studioSection:"gym"});
assert.match(autoGym.input.clothing,/athletic T-shirt/iu);
assert.equal(autoGym.conflicts[0].resolution,"auto_resolved_default");
const gym = buildCanonicalV3UserOutput({studioSection:"gym",hasReference:true,expression:"focused"});
assert.ok(gym.prompt.includes(gym.section.actionDescription));
assert.ok(gym.prompt.includes(gym.section.imperfections));
assert.match(gym.prompt,/195 cm, 88 kg/iu);
assert.ok(wc(gym.prompt)<=250,`gym budget ${wc(gym.prompt)}`);

console.log("Phase 47 WikiPrompt philosophy merge: PASS");
