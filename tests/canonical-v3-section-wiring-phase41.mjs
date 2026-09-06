import assert from "node:assert/strict";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";
import { buildOpenAIImagePrompt, IDENTITY_STRICT_LOCK, SELFIE_ARM_LOCK } from "../js/canonical/openai-image-adapter-phase36.js";
import { resolveClothingText } from "../js/clothing-authority.js";
import { SECTION_REGISTRY } from "../js/sections/index.js";
import { getCarExteriorLightingOptions, resolveCarExteriorSelection } from "../js/car-exterior-authority.js";

const SECTION_IDS = Object.freeze(["solo","group","car","carExterior","bedroom","gym","street","accidental","custom"]);
const SELFIE_SECTIONS = new Set(SECTION_IDS);
const FORBIDDEN = /wearing selected\s+[^.]+|casual cotton clothing|\ba user-defined scene\b|\b183\b|\b82\s*kg\b/iu;
const BODY_SCALE = /His stature reads noticeably above average-height|Shoulders fill seatback|Shoulder and head height relative to roofline|Camera near eye level at 45–60 cm|Roofline, door and handle scale reads as a genuine 195 cm adult/iu;
const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const firstSentence = (value) => String(value ?? "").match(/^[^.!?]+[.!?]/u)?.[0]?.trim() || "";
const sentences = (value) => String(value ?? "").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map((part) => part.replace(/\s+/gu, " ").trim()).filter(Boolean) || [];
const hasDuplicateSentence = (value) => { const seen = new Set(); for (const sentence of sentences(value)) { if (seen.has(sentence)) return true; seen.add(sentence); } return false; };

const base = Object.freeze({
  hasReference:true,
  selfieDistanceCm:50,
  selfieYawDeg:0,
  selfiePitchDeg:0,
  selfieRollDeg:2
});

const specs = Object.freeze({
  solo:{ scene:"street", clothing:"casual-tee-black-jeans-blue", poses:["standing selfie pose","walking selfie pose"], sceneEvidence:/street|parking/iu },
  group:{ scene:"street", clothing:"casual-tee-black-jeans-blue", poses:["tight group selfie pose","staggered group selfie pose"], sceneEvidence:/street|parking/iu },
  car:{ scene:"rangeRover", clothing:"casual-tee-black-jeans-blue", poses:["driver close selfie pose","driver low selfie pose"], sceneEvidence:/2017 Range Rover Sport Autobiography Dynamic|Ivory perforated leather/iu },
  carExterior:{ scene:"carExterior", clothing:"casual-tee-black-jeans-blue", poses:["door-lean","front-grille"], sceneEvidence:/2017 Range Rover Sport Autobiography Dynamic.*Fuji White|Fuji White.*2017 Range Rover Sport Autobiography Dynamic/isu },
  bedroom:{ scene:"bedroom", clothing:"home-flannel-red-black", poses:["seated bed selfie pose","standing bedroom selfie pose"], sceneEvidence:/bedroom|bed|sofa/iu },
  gym:{ scene:"gym", clothing:"sport-tracksuit-olive", poses:["seated gym selfie pose","standing gym selfie pose"], sceneEvidence:/gym|bench|rack|bar/iu },
  street:{ scene:"street", clothing:"thobe-redshemagh-iqal", poses:["street standing selfie pose","street walking selfie pose"], sceneEvidence:/street|parking|alley|construction|bufia/iu },
  accidental:{ scene:"street", clothing:"casual-tee-black-jeans-blue", poses:["phone rising motion","off-center phone motion"], sceneEvidence:/street|parking/iu },
  custom:{ scene:"custom", clothing:"casual-tee-black-jeans-blue", poses:["custom scene selfie pose","custom walking selfie pose"], sceneEvidence:/Phase 41 courtyard with a low stone wall and two potted plants/iu }
});

const lights = Object.freeze({
  day:{ time:"day", text:"soft daylight from open shade" },
  night:{ time:"night", text:"warm practical night light with soft falloff" }
});
const expressions = Object.freeze(["neutral","focused"]);
const streetMoods = Object.freeze(["normal","alley","construction","bufia"]);
const customClothing = (section) => `sand overshirt with charcoal trousers ${section}`;

function opener(section) {
  const type = SECTION_REGISTRY[section].captureType;
  if (type === "group_selfie") return "A candid group selfie.";
  if (type === "accidental_front_camera_capture") return "An accidental front-camera capture.";
  return "A candid direct selfie.";
}

function moodEvidence(mood) {
  if (mood === "alley") return /service alley|air-conditioning units/iu;
  if (mood === "construction") return /street construction|paving blocks/iu;
  if (mood === "bufia") return /Saudi bufia cafe|bufia/iu;
  return /Saudi residential street|Saudi street|ordinary outdoor street|parking/iu;
}

function carExteriorLocationEvidence(location) {
  if (location === "villa") return /Saudi villa|villa driveway|beige stone/iu;
  if (location === "grocery") return /small grocery|grocery curb|beverage cooler/iu;
  if (location === "parking") return /marked outdoor (?:parking )?lot/iu;
  if (location === "street") return /yellow-and-black|street curb/iu;
  if (location === "reststop") return /sandy|rest-stop/iu;
  return /mall parking/iu;
}

function inputFor(section, ci, li, pi, ei) {
  const spec = specs[section];
  const light = li === 0 ? lights.day : lights.night;
  const raw = {
    ...base,
    studioSection:section,
    scene:spec.scene,
    time:light.time,
    lighting:light.text,
    clothing:ci === 0 ? spec.clothing : "custom",
    pose:spec.poses[pi],
    expression:expressions[ei]
  };
  if (ci === 1) raw.customClothing = customClothing(section);
  if (section === "custom") raw.customScene = "Phase 41 courtyard with a low stone wall and two potted plants";
  if (section === "group") {
    raw.groupCount = String(2 + ((ci + li + pi + ei) % 5));
    raw.cameraHolder = ei === 0 ? "A" : "B";
    raw.groupArrangement = pi === 0 ? "natural-auto" : "staggered";
    raw.groupInteraction = ei === 0 ? "casual" : "laughing";
  }
  if (section === "street") {
    raw.streetMood = streetMoods[(ci * 8 + li * 4 + pi * 2 + ei) % streetMoods.length];
    raw.streetHour = light.time === "day" ? 12 : 21;
  }
  if (section === "carExterior") {
    raw.carExteriorLocation = pi === 0 ? "villa" : "grocery";
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
function fail(list, matrix, section, field, caseId, detail) { matrix[section][field] = false; list.push({ section, field, case:caseId, detail }); }

const failures = [];
const matrix = Object.fromEntries(SECTION_IDS.map((section) => [section, {
  clothing:true, lighting:true, pose:true, scene:true, expression:true, time:true,
  selfie:true, group:true, accidental:true, identity:true, body:true, dedupe:true,
  budget:true, determinism:true, readonly:true
}]));
const samples = {};
let totalCases = 0;

for (const section of SECTION_IDS) {
  for (let ci = 0; ci < 2; ci += 1) for (let li = 0; li < 2; li += 1) for (let pi = 0; pi < 2; pi += 1) for (let ei = 0; ei < 2; ei += 1) {
    totalCases += 1;
    const caseId = `${section}:c${ci}:l${li}:p${pi}:e${ei}`;
    const raw = inputFor(section, ci, li, pi, ei);
    const runs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(raw));
    const output = runs[0];
    const prompt = output.prompt;
    if (!samples[section] && ci === 0 && li === 1 && pi === 0 && ei === 1) samples[section] = prompt;

    const clothing = resolveClothingText(raw.clothing, raw);
    if (!clothing || !prompt.includes(clothing)) fail(failures, matrix, section, "clothing", caseId, `missing ${JSON.stringify(clothing)}`);
    if (raw.clothing === "custom" && !prompt.includes(raw.customClothing)) fail(failures, matrix, section, "clothing", caseId, "custom clothing changed");

    const lighting = expectedLighting(raw, section);
    if (!lighting || !prompt.includes(lighting)) fail(failures, matrix, section, "lighting", caseId, `missing ${JSON.stringify(lighting)}`);
    const pose = expectedPose(raw, section);
    if (!pose || !prompt.includes(pose)) fail(failures, matrix, section, "pose", caseId, `missing ${JSON.stringify(pose)}`);
    if (!prompt.includes(raw.expression)) fail(failures, matrix, section, "expression", caseId, `missing ${raw.expression}`);

    if (!specs[section].sceneEvidence.test(prompt)) fail(failures, matrix, section, "scene", caseId, "section scene evidence missing");
    if (section === "street" && !moodEvidence(raw.streetMood).test(prompt)) fail(failures, matrix, section, "scene", caseId, `street mood ${raw.streetMood} missing`);
    if (section === "carExterior") {
      const selection = resolveCarExteriorSelection(raw);
      if (!prompt.includes("2017 Range Rover Sport Autobiography Dynamic") || !prompt.includes("Fuji White") || !carExteriorLocationEvidence(selection.location).test(prompt)) {
        fail(failures, matrix, section, "scene", caseId, `carExterior ${selection.location} evidence missing`);
      }
    }
    if (section === "car" && (!prompt.includes("2017 Range Rover Sport Autobiography Dynamic") || !prompt.includes("Ivory perforated leather"))) fail(failures, matrix, section, "scene", caseId, "car interior evidence missing");

    if (raw.time === "night" && (!/night/iu.test(prompt) || !lighting.toLowerCase().includes("night") && !/night/iu.test(lighting))) fail(failures, matrix, section, "time", caseId, "night evidence missing");
    if (raw.time === "day" && /Lighting follows the selected real-world night source/iu.test(prompt)) fail(failures, matrix, section, "time", caseId, "night leaked into day");

    if (firstSentence(prompt) !== opener(section)) fail(failures, matrix, section, "selfie", caseId, `wrong opener ${firstSentence(prompt)}`);
    if (SELFIE_SECTIONS.has(section) && !prompt.includes(SELFIE_ARM_LOCK)) fail(failures, matrix, section, "selfie", caseId, "SELFIE_ARM_LOCK missing");
    if (/both\s+hands?\s+(?:in\s+)?(?:the\s+)?pockets?|both\s+hands?\s+(?:are\s+)?occupied/iu.test(prompt.replace(SELFIE_ARM_LOCK, ""))) fail(failures, matrix, section, "selfie", caseId, "two-hand conflict leaked");

    if (!prompt.includes(IDENTITY_STRICT_LOCK) || !/face and head shape/iu.test(prompt) || !/feature spacing/iu.test(prompt) || !/skin tone/iu.test(prompt) || !/hairline/iu.test(prompt) || !/beard\/moustache pattern/iu.test(prompt) || !/no beautification/iu.test(prompt) || !/face slimming\/lengthening/iu.test(prompt)) fail(failures, matrix, section, "identity", caseId, "identity lock incomplete");
    if (!/195\s*cm/iu.test(prompt) || !/88\s*kg/iu.test(prompt) || !/lean-athletic/iu.test(prompt) || !BODY_SCALE.test(prompt) || /\b183\b|\b82\s*kg\b/iu.test(prompt)) fail(failures, matrix, section, "body", caseId, "body authority incomplete");
    if (FORBIDDEN.test(prompt)) fail(failures, matrix, section, "scene", caseId, "forbidden fallback leaked");
    if (hasDuplicateSentence(prompt)) fail(failures, matrix, section, "dedupe", caseId, "duplicate sentence");
    if (words(prompt) > 250) fail(failures, matrix, section, "budget", caseId, `${words(prompt)} words`);
    if (!runs.every((item) => item.prompt === prompt)) fail(failures, matrix, section, "determinism", caseId, "10/10 mismatch");

    const before = JSON.stringify(output.canonical);
    void buildOpenAIImagePrompt(output.canonical);
    if (JSON.stringify(output.canonical) !== before) fail(failures, matrix, section, "readonly", caseId, "canonical mutated");

    if (section === "group") {
      const count = Number(raw.groupCount);
      if (!prompt.includes(`${count} people are present in the group composition.`)) fail(failures, matrix, section, "group", caseId, `count ${count} missing`);
      if (!new RegExp(`phone holder[^.]{0,40}${raw.cameraHolder}|${raw.cameraHolder}[^.]{0,40}phone holder`, "iu").test(prompt)) fail(failures, matrix, section, "group", caseId, `holder ${raw.cameraHolder} missing`);
      if (!prompt.includes(raw.groupArrangement)) fail(failures, matrix, section, "group", caseId, `distribution ${raw.groupArrangement} missing`);
    }

    if (section === "accidental") {
      for (const field of ["accidentalTrigger","accidentalPhonePosition","accidentalMotion","accidentalTilt","accidentalFocus","accidentalExposure","accidentalIntensity"]) {
        if (!prompt.includes(raw[field])) fail(failures, matrix, section, "accidental", caseId, `${field}=${raw[field]} missing`);
      }
      if (!/candid|accidental|unintentional/iu.test(prompt)) fail(failures, matrix, section, "accidental", caseId, "candid behavior missing");
    }
  }
}

for (let count = 2; count <= 6; count += 1) {
  const raw = { ...inputFor("group", 0, 1, 0, 0), groupCount:String(count), cameraHolder:"A", groupArrangement:"natural-auto" };
  const prompt = buildCanonicalV3UserOutput(raw).prompt;
  assert.ok(prompt.includes(`${count} people are present in the group composition.`), `group boundary ${count} missing`);
}

const exteriorBefore = buildCanonicalV3UserOutput(inputFor("carExterior", 0, 1, 0, 0)).prompt;
try { SECTION_REGISTRY.solo.poses.push("illegal Phase41 mutation"); } catch {}
assert.equal(buildCanonicalV3UserOutput(inputFor("carExterior", 0, 1, 0, 0)).prompt, exteriorBefore, "solo mutation changed carExterior");
const bedroomBefore = buildCanonicalV3UserOutput(inputFor("bedroom", 0, 1, 0, 0)).prompt;
try { SECTION_REGISTRY.gym.lighting.push("illegal Phase41 mutation"); } catch {}
assert.equal(buildCanonicalV3UserOutput(inputFor("bedroom", 0, 1, 0, 0)).prompt, bedroomBefore, "gym mutation changed bedroom");

console.log(`PHASE41_CASES=${totalCases}`);
console.log(`PHASE41_FAILURE_COUNT=${failures.length}`);
console.log(`PHASE41_MATRIX=${JSON.stringify(matrix)}`);
console.log(`PHASE41_FAILURES=${JSON.stringify(failures.slice(0, 200))}`);
for (const section of SECTION_IDS) console.log(`PHASE41_${section.toUpperCase()}_SAMPLE=${samples[section] || ""}`);
assert.equal(totalCases, 144);
assert.deepEqual(Object.keys(matrix), SECTION_IDS);
assert.equal(failures.length, 0, `Phase 41 field-wiring audit failed with ${failures.length} failures`);
console.log("PHASE41_DETERMINISM=10/10");
console.log("✓ Phase 41 full section field-wiring audit passed");
