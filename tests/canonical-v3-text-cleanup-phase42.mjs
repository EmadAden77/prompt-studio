import assert from "node:assert/strict";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";
import { buildOpenAIImagePrompt, IDENTITY_STRICT_LOCK, SELFIE_ARM_LOCK } from "../js/canonical/openai-image-adapter-phase36.js";
import { resolveClothingText } from "../js/clothing-authority.js";
import { SECTION_REGISTRY } from "../js/sections/index.js";
import { getCarExteriorLightingOptions, resolveCarExteriorSelection } from "../js/car-exterior-authority.js";

const SECTION_IDS = Object.freeze(["solo","group","car","carExterior","bedroom","gym","street","accidental","custom"]);
const FORBIDDEN = /wearing selected\s+[^.]+|casual cotton clothing|\ba user-defined scene\b|\b183\b|\b82\s*kg\b/iu;
const BAD_TRIPLE_HYPHENS = /[a-z]+-[a-z]+-[a-z]+/giu;
const BAD_SLASH_SPEC = /[a-z]+\/[a-z]+/giu;
const BAD_BODY_COMPACTION = /broad-shouldered;\s*proportional-limbed/iu;
const NATURAL_BODY = /broad-shouldered with proportional limbs|broad-shouldered, proportional limbs|broad-shouldered; proportional limbs|medium-to-moderately-broad shoulders/iu;
const BODY_SCALE = /His stature reads noticeably above average-height|Shoulders fill seatback|Shoulder and head height relative to roofline|Camera near eye level at 45–60 cm|Roofline, door and handle scale reads as a genuine 195 cm adult/iu;
const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const firstSentence = (value) => String(value ?? "").match(/^[^.!?]+[.!?]/u)?.[0]?.trim() || "";
const sentences = (value) => String(value ?? "").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map((part) => part.replace(/\s+/gu, " ").trim()).filter(Boolean) || [];
const countMatches = (value, pattern) => [...String(value ?? "").matchAll(pattern)].length;
const hasDuplicateSentence = (value) => { const seen = new Set(); for (const sentence of sentences(value)) { if (seen.has(sentence)) return true; seen.add(sentence); } return false; };

const specs = Object.freeze({
  solo:{ scene:"street", clothing:"casual-tee-black-jeans-blue", poses:["standing selfie pose","walking selfie pose"], sceneEvidence:/street|parking/iu },
  group:{ scene:"street", clothing:"casual-tee-black-jeans-blue", poses:["tight group selfie pose","staggered group selfie pose"], sceneEvidence:/street|parking/iu },
  car:{ scene:"rangeRover", clothing:"casual-tee-black-jeans-blue", poses:["driver close selfie pose","driver low selfie pose"], sceneEvidence:/2017 Range Rover Sport Autobiography Dynamic|Ivory perforated leather/iu },
  carExterior:{ scene:"carExterior", clothing:"casual-tee-black-jeans-blue", poses:["door-lean","door-open"], sceneEvidence:/2017 Range Rover Sport Autobiography Dynamic.*Fuji White|Fuji White.*2017 Range Rover Sport Autobiography Dynamic/isu },
  bedroom:{ scene:"bedroom", clothing:"home-flannel-red-black", poses:["seated bed selfie pose","standing bedroom selfie pose"], sceneEvidence:/bedroom|bed|sofa/iu },
  gym:{ scene:"gym", clothing:"sport-tracksuit-olive", poses:["seated gym selfie pose","standing gym selfie pose"], sceneEvidence:/gym|bench|rack|bar/iu },
  street:{ scene:"street", clothing:"thobe-redshemagh-iqal", poses:["street standing selfie pose","street walking selfie pose"], sceneEvidence:/street|parking|alley|construction|bufia/iu },
  accidental:{ scene:"street", clothing:"casual-tee-black-jeans-blue", poses:["phone-rising","off-center-motion"], sceneEvidence:/street|parking/iu },
  custom:{ scene:"custom", clothing:"casual-tee-black-jeans-blue", poses:["custom scene selfie pose","custom walking selfie pose"], sceneEvidence:/Phase 42 courtyard with a low stone wall and two potted plants/iu }
});

const lights = Object.freeze({ day:{ time:"day", text:"soft daylight" }, night:{ time:"night", text:"warm night practical light" } });
const expressions = Object.freeze(["neutral","focused"]);
const carExteriorLocations = Object.freeze(["parking","villa","grocery","street"]);

function opener(section) {
  const type = SECTION_REGISTRY[section].captureType;
  if (type === "group_selfie") return "A candid group selfie.";
  if (type === "accidental_front_camera_capture") return "An accidental front-camera capture.";
  return "A candid direct selfie.";
}

function inputFor(section, ci, li, pi, ei) {
  const spec = specs[section];
  const light = li === 0 ? lights.day : lights.night;
  const raw = {
    hasReference:true,
    studioSection:section,
    scene:spec.scene,
    time:light.time,
    lighting:light.text,
    clothing:ci === 0 ? spec.clothing : "custom",
    customClothing:ci === 1 ? "sand overshirt charcoal trousers" : "",
    pose:spec.poses[pi],
    expression:expressions[ei]
  };
  if (section === "custom") raw.customScene = "Phase 42 courtyard with a low stone wall and two potted plants";
  if (section === "group") { raw.groupCount = String(2 + ((ci + li + pi + ei) % 5)); raw.cameraHolder = ei === 0 ? "A" : "B"; raw.groupArrangement = pi === 0 ? "natural-auto" : "staggered"; }
  if (section === "street") { raw.streetMood = ["normal","alley","construction","bufia"][(ci * 8 + li * 4 + pi * 2 + ei) % 4]; raw.streetHour = light.time === "day" ? 12 : 21; }
  if (section === "carExterior") {
    raw.carExteriorLocation = carExteriorLocations[(ci * 8 + li * 4 + pi * 2 + ei) % carExteriorLocations.length];
    raw.carExteriorPose = spec.poses[pi];
    const options = getCarExteriorLightingOptions({ time:light.time, location:raw.carExteriorLocation, pose:raw.carExteriorPose });
    raw.carExteriorLighting = options[Math.min(li, Math.max(0, options.length - 1))]?.value || options[0]?.value || "";
  }
  if (section === "accidental") {
    raw.accidentalTrigger = pi === 0 ? "pocket" : "screen-wake";
    raw.accidentalPhonePosition = pi === 0 ? "rising" : "low-off-axis";
    raw.accidentalMotion = pi === 0 ? "subtle" : "noticeable";
    raw.accidentalTilt = pi === 0 ? "auto" : "clockwise";
    raw.accidentalFocus = ei === 0 ? "transition-face" : "background-first";
    raw.accidentalExposure = li === 0 ? "auto-imperfect" : "highlight-biased";
    raw.accidentalIntensity = ei === 0 ? "natural" : "mild";
  }
  return raw;
}

function expectedLighting(raw, section) { return section === "carExterior" ? resolveCarExteriorSelection(raw).lightingText : raw.lighting; }
function expectedPose(raw, section) { return section === "carExterior" ? resolveCarExteriorSelection(raw).poseText : raw.pose; }

const failures = [];
const samples = {};
let totalCases = 0;

function record(condition, detail) { if (!condition) failures.push(detail); }

for (const section of SECTION_IDS) {
  for (let ci = 0; ci < 2; ci += 1) for (let li = 0; li < 2; li += 1) for (let pi = 0; pi < 2; pi += 1) for (let ei = 0; ei < 2; ei += 1) {
    totalCases += 1;
    const caseId = `${section}:c${ci}:l${li}:p${pi}:e${ei}`;
    const raw = inputFor(section, ci, li, pi, ei);
    const runs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(raw));
    const output = runs[0];
    const prompt = output.prompt;
    if (!samples[section] && ci === 0 && li === 1 && pi === 0 && ei === 1) samples[section] = prompt;

    record(prompt.includes(resolveClothingText(raw.clothing, raw)), `${caseId}: clothing missing`);
    record(prompt.includes(expectedLighting(raw, section)), `${caseId}: lighting missing`);
    record(prompt.includes(expectedPose(raw, section)), `${caseId}: pose missing`);
    record(prompt.includes(raw.expression), `${caseId}: expression missing`);
    record(specs[section].sceneEvidence.test(prompt), `${caseId}: scene evidence missing`);
    record(firstSentence(prompt) === opener(section), `${caseId}: opener mismatch`);
    record(prompt.includes(SELFIE_ARM_LOCK), `${caseId}: SELFIE_ARM_LOCK missing`);
    record(!/both\s+hands?\s+(?:in\s+)?(?:the\s+)?pockets?|both\s+hands?\s+(?:are\s+)?occupied/iu.test(prompt.replace(SELFIE_ARM_LOCK, "")), `${caseId}: two-hand conflict leaked`);
    record(prompt.includes(IDENTITY_STRICT_LOCK) && /face and head shape/iu.test(prompt) && /feature spacing/iu.test(prompt) && /no beautification/iu.test(prompt) && /face slimming\/lengthening/iu.test(prompt), `${caseId}: identity guard incomplete`);
    record(/195\s*cm/iu.test(prompt) && /88\s*kg/iu.test(prompt) && /lean-athletic/iu.test(prompt) && BODY_SCALE.test(prompt) && !BAD_BODY_COMPACTION.test(prompt) && NATURAL_BODY.test(prompt), `${caseId}: body text not natural or incomplete`);
    record(!FORBIDDEN.test(prompt), `${caseId}: forbidden fallback leaked`);
    record(!hasDuplicateSentence(prompt), `${caseId}: duplicate exact sentence`);
    record(words(prompt) <= 250, `${caseId}: ${words(prompt)} words`);
    record(runs.every((item) => item.prompt === prompt), `${caseId}: determinism mismatch`);
    const before = JSON.stringify(output.canonical); void buildOpenAIImagePrompt(output.canonical); record(JSON.stringify(output.canonical) === before, `${caseId}: canonical mutated`);
    if (raw.time === "night") record(/Lighting follows the selected real-world night source/iu.test(prompt) || /night/iu.test(prompt), `${caseId}: night lighting dropped`);

    if (section === "carExterior") {
      record(countMatches(prompt, BAD_TRIPLE_HYPHENS) === 0, `${caseId}: hyphenated keyword artifact ${String(prompt.match(BAD_TRIPLE_HYPHENS) || [])}`);
      record(countMatches(prompt, BAD_SLASH_SPEC) === 0, `${caseId}: slash separator artifact ${String(prompt.match(BAD_SLASH_SPEC) || [])}`);
      record(!(prompt.includes("Marked parking lot") && prompt.includes("marked outdoor lot")), `${caseId}: duplicate parking location text`);
      record(countMatches(prompt, /tire contact shadow/giu) <= 1, `${caseId}: tire contact shadow repeated`);
      record(!/gloss-black-grille|dark-alloys|quad-exhausts|LED-DRLs|panoramic-glass|Dynamic-badge|Saudi-plate/iu.test(prompt), `${caseId}: compacted car spec leaked`);
    }
  }
}

const beforePhase42 = buildCanonicalV3UserOutput({ ...inputFor("carExterior", 0, 1, 0, 1), carExteriorLocation:"parking", carExteriorPose:"door-lean" }).prompt;
console.log(`PHASE42_CASES=${totalCases}`);
console.log(`PHASE42_FAILURE_COUNT=${failures.length}`);
console.log(`PHASE42_FAILURES=${JSON.stringify(failures)}`);
for (const section of SECTION_IDS) console.log(`PHASE42_${section.toUpperCase()}_SAMPLE=${samples[section]}`);
console.log(`PHASE42_BEFORE_SAMPLE=${beforePhase42}`);
console.log("PHASE42_DETERMINISM=10/10");
assert.deepEqual(Object.keys(SECTION_REGISTRY), SECTION_IDS);
assert.equal(totalCases, 144);
assert.equal(failures.length, 0, `Phase 42 prompt text cleanup failed with ${failures.length} failures`);
console.log("✓ Phase 42 prompt text cleanup passed");
