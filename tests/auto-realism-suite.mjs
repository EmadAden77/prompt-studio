import assert from "node:assert/strict";
import {
  AUTO_REALISM_DEFAULTS,
  applyAutoRealismSuite,
  getExternalGeneratorSetup,
  normalizeAutoRealismState
} from "../js/auto-realism-suite-v1.js";

const normalized = normalizeAutoRealismState({});
assert.equal(normalized.autoRealism, "on");
assert.equal(normalized.realismPreset, "raw-smartphone");
assert.equal(normalized.generatorProfile, "chatgpt");
assert.equal(normalized.promptCompression, "full");
assert.equal(normalized.lockIdentity, "on");
assert.equal(normalized.lockScene, "on");

const fluxSetup = getExternalGeneratorSetup("flux");
assert.equal(fluxSetup?.label, "FLUX — إعدادات خارج البرومبت");
assert.match(fluxSetup?.copyText ?? "", /Guidance/u);
assert.equal(getExternalGeneratorSetup("chatgpt"), null, "ChatGPT Image should not receive external workflow settings");
const stableSetup = getExternalGeneratorSetup("stable-diffusion");
assert.match(stableSetup?.copyText ?? "", /ADetailer/u);

const suite = applyAutoRealismSuite({
  positive:`[IDENTITY LOCK]\nPreserve IMAGE A.\n\n[REALISM RISK CHECK] temporary diagnostic line\n\n[PHONE REALISM]\nSubject-held front camera only.`,
  negative:"third-person portrait",
  state:{
    scene:"car_interior",
    pose:"driver_relaxed",
    selfieAngle:"eye_level",
    composition:"close",
    clothing:"white_thobe",
    lighting:"day_window",
    time:"day",
    autoRealism:"on",
    realismPreset:"reference-critical",
    generatorProfile:"gemini",
    promptCompression:"compact",
    continuityMode:"on",
    variationMode:"three_quarter",
    lockIdentity:"on",
    lockScene:"on",
    lockClothing:"on",
    lockLighting:"on",
    lockExpression:"off"
  },
  risk:{ score:97, level:"LOW" },
  conflicts:["camera-normalized"]
});

assert.match(suite.positive, /\[REFERENCE AUTHORITY MAP\]/u);
assert.match(suite.positive, /IMAGE A = identity only/u);
assert.match(suite.positive, /\[AUTO REALISM\]/u);
assert.match(suite.positive, /CONTEXT RESOLUTION/u);
assert.match(suite.positive, /VISIBILITY GATE/u);
assert.match(suite.positive, /ACCESSORY GATE/u);
assert.match(suite.positive, /IMPERFECTION BUDGET/u);
assert.match(suite.positive, /MIRROR \/ TEXT SAFETY/u);
assert.match(suite.positive, /Do not force clothing text to be readable/u);
assert.match(suite.positive, /\[REALISM PRESET\]/u);
assert.match(suite.positive, /REFERENCE-CRITICAL/u);
assert.match(suite.positive, /\[LOCKED FIELDS\]/u);
assert.match(suite.positive, /\[SCENE CONTINUITY\]/u);
assert.match(suite.positive, /\[ONE-CLICK VARIATION\]/u);
assert.match(suite.positive, /three-quarter selfie relationship/u);
assert.match(suite.positive, /GEMINI IMAGE ADAPTER/u);
assert.doesNotMatch(suite.positive, /temporary diagnostic line/u, "compact mode should remove the optional realism-risk diagnostic line");
assert.match(suite.negative, /reference-role mixing/u);
assert.match(suite.negative, /locked-field drift/u);
assert.match(suite.negative, /background context forced outside the selfie field of view/u);
assert.match(suite.negative, /invented generic accessory or product prop/u);
assert.equal(suite.meta.generator, "gemini");
assert.equal(suite.meta.generatorSetup, "", "Gemini settings must remain outside the prompt and hidden when unsupported");
assert.equal(suite.meta.compression, "compact");
assert.equal(suite.qa.find((item) => item.label === "Realism Score")?.value, "97/100 · LOW");
assert.equal(suite.qa.find((item) => item.label === "Auto Fix")?.value, "تم تمرير 1 تعارض مصحح من المحركات الأساسية");
assert.ok(suite.qa.some((item) => item.label === "Context Resolver"));
assert.ok(suite.qa.some((item) => item.label === "Visibility Gate"));
assert.ok(suite.qa.some((item) => item.label === "Accessory Gate"));
assert.ok(suite.qa.some((item) => item.label === "Imperfection Budget"));

const driverSuite = applyAutoRealismSuite({
  positive:"BASE",
  state:{
    studioSection:"car", scene:"rangeRover", carSeat:"driver-left", pose:"car-driver-close",
    selfieAngle:"eye", composition:"tight", clothing:"work-blue-navy", lighting:"car-night-parking-led", time:"night",
    accessoryProfile:"none", objectProfile:"none"
  }
});
assert.match(driverSuite.positive, /dedicated driver geometry/u);
assert.match(driverSuite.positive, /unmirrored left-hand-drive mapping/u);
assert.match(driverSuite.positive, /steering-wheel anchor without exception/u);
assert.match(driverSuite.positive, /Do not invent accessories, jewelry, fitness trackers/u);

const fluxSuite = applyAutoRealismSuite({ positive:"BASE", state:{ generatorProfile:"flux" } });
assert.match(fluxSuite.positive, /FLUX ADAPTER/u);
assert.doesNotMatch(fluxSuite.positive, /Steps: 28–36/u, "External FLUX settings must not be appended to the image prompt");
assert.match(fluxSuite.meta.generatorSetup, /FLUX — إعدادات خارج البرومبت/u);
assert.ok(fluxSuite.qa.some((item) => item.label === "Generator Setup"));

const stableSuite = applyAutoRealismSuite({ positive:"BASE", state:{ generatorProfile:"stable-diffusion" } });
assert.match(stableSuite.positive, /STABLE DIFFUSION ADAPTER/u);
assert.match(stableSuite.meta.generatorSetup, /Stable Diffusion — إعدادات خارج البرومبت/u);

const off = applyAutoRealismSuite({ positive:"BASE", state:{ autoRealism:"off", continuityMode:"off" } });
assert.doesNotMatch(off.positive, /\[AUTO REALISM\]/u);
assert.doesNotMatch(off.positive, /CONTEXT RESOLUTION/u);
assert.doesNotMatch(off.positive, /\[SCENE CONTINUITY\]/u);

console.log("AUTO REALISM suite tests passed");
