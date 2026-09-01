import assert from "node:assert/strict";
import { normalizeAutoRealismState } from "../js/auto-realism-suite-v1.js";
import { resolveAdvancedRealismState, buildAdvancedRealismSections } from "../js/advanced-realism-v1.js";
const variation = normalizeAutoRealismState({ variationMode:"slight_high", visualMonitorSync:"on", selfiePitchDeg:0 });
assert.equal(variation.selfiePitchDeg, -11);
const advanced = resolveAdvancedRealismState({ scene:"my_bedroom_text", objectProfile:"auto", interactionObject:"" });
assert.equal(advanced.state.objectProfile, "none");
assert.doesNotMatch(buildAdvancedRealismSections(advanced.state, []).join("\n"), /A coffee cup/u);
console.log("conflict regression tests passed");
