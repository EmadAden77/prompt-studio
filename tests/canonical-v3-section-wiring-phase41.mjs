import assert from "node:assert/strict";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-pipeline.js";
import {
  buildOpenAIImagePrompt,
  captureOpeningSentence,
  IDENTITY_STRICT_LOCK,
  SELFIE_ARM_LOCK
} from "../js/canonical/openai-image-adapter-phase36.js";
import { resolveClothingText } from "../js/clothing-authority.js";
import { SECTION_REGISTRY } from "../js/sections/index.js";
import {
  getCarExteriorLightingOptions,
  resolveCarExteriorSelection
} from "../js/car-exterior-authority.js";

const SECTION_IDS = Object.freeze(["solo","group","car","carExterior","bedroom","gym","street","accidental","custom"]);
const SELFIE_SECTIONS = new Set(["solo","group","car","carExterior","bedroom","gym","street","accidental","custom"]);
const FORBIDDEN_FALLBACKS = /wearing selected\s+[^.]+|casual cotton clothing|\ba user-defined scene\b|\b183\b|\b82\s*kg\b/iu;
const BODY_SCALE_EVIDENCE = /(?:His stature reads noticeably above average-height|Shoulders fill seatback|Shoulder and head height relative to roofline|Camera near eye level at 45–60 cm|Roofline, door and handle scale reads as a genuine 195 cm adult)/iu;

const words = (value) => String(value ?? "").trim().split(/\s+/u).filter(Boolean).length;
const firstSentence = (value) => String(value ?? "").match(/^[^.!?]+[.!?]/u)?.[0]?.trim() || "";
const normalizeSentence = (value) => String(value ?? "").replace(/\s+/gu, " ").trim();
const sentenceParts = (value) => String(value ?? "").match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map(normalizeSentence).filter(Boolean) || [];
const hasExactDuplicateSentence = (value) => {
  const seen = new Set();
  for (const sentence of sentenceParts(value)) {
    if (seen.has(sentence)) return true;
    seen.add(sentence);
  }
  return false;
};

const base = Object.freeze({
  hasReference:true,
  fabric:"cotton",
  fabricWeight:"light",
  clothingFit:"regular",
  wearState:"normal-day",
  ironState:"lightly-unpressed",
  selfieDistanceCm:50,
  selfieYawDeg:0,
  selfiePitchDeg:0,
  selfieRollDeg:2,
  streetHour:21
});

const sectionSpec = Object.freeze({
  solo:Object.freeze({
    scene:"street",
    catalogClothing:"casual-tee-black-jeans-blue",
    poses:Object.freeze(["relaxed standing selfie pose", "slow walking selfie pose"]),
    sceneEvidence:/street|parking/iu
  }),
  group:Object.freeze({
    scene:"street",
    catalogClothing:"casual-tee-black-jeans-blue",
    poses:Object.freeze(["tight natural group selfie pose", "loose staggered group selfie pose"]),
    sceneEvidence:/street|parking/iu
  }),
  car:Object.freeze({
    scene:"rangeRover",
    catalogClothing:"casual-tee-black-jeans-blue",
    poses:Object.freeze(["driver close selfie pose", "driver low selfie pose"]),
    sceneEvidence:/2017 Range Rover Sport Autobiography Dynamic|Ivory perforated leather/iu
  }),
  carExterior:Object.freeze({
    scene:"carExterior",
    catalogClothing:"thobe-redshemagh-iqal",
    poses:Object.freeze(["door-lean", "front-grille"]),
    sceneEvidence:/2017 Range Rover Sport Autobiography Dynamic.*Fuji White|Fuji White.*2017 Range Rover Sport Autobiography Dynamic/isu
  }),
  bedroom:Object.freeze({
    scene:"bedroom",
    catalogClothing:"home-flannel-red-black",
    poses:Object.freeze(["relaxed seated bed selfie pose", "standing beside bed selfie pose"]),
    sceneEvidence:/bedroom|bed|sofa/iu
  }),
  gym:Object.freeze({
    scene:"gym",
    catalogClothing:"sport-tracksuit-olive",
    poses:Object.freeze(["seated rest gym selfie pose", "standing post-workout gym selfie pose"]),
    sceneEvidence:/gym|bench|rack|bar/iu
  }),
  street:Object.freeze({
    scene:"street",
    catalogClothing:"thobe-redshemagh-iqal",
    poses:Object.freeze(["relaxed street standing selfie pose", "slow street walking selfie pose"]),
    sceneEvidence:/street|parking|alley|construction|bufia/iu
  }),
  accidental:Object.freeze({
    scene:"street",
    catalogClothing:"casual-tee-black-jeans-blue",
    poses:Object.freeze(["candid phone-rising motion", "candid off-center phone motion"]),
    sceneEvidence:/street|parking/iu
  }),
  custom:Object.freeze({
    scene:"custom",
    catalogClothing:"casual-tee-black-jeans-blue",
    poses:Object.freeze(["relaxed custom-scene selfie pose", "walking custom-scene selfie pose"]),
    sceneEvidence:/Phase 41 custom courtyard with a low stone wall and two potted plants/iu
  })
});

const lightingSpec = Object.freeze({
  day:Object.freeze({ time:"day", text:"soft natural daylight from open shade with gentle facial contrast" }),
  night:Object.freeze({ time:"night", text:"warm practical night lighting with soft side falloff and visible background pools" })
});
const expressions = Object.freeze(["neutral", "focused"]);
const streetMoods = Object.freeze(["normal", "alley", "construction", "bufia"]);
const customClothingText = (section) => `Phase41 custom ${section} outfit: sand linen overshirt with charcoal trousers`;

function expectedStreetMoodEvidence(mood) {
  if (mood === "alley") return /service alley|air-conditioning units/iu;
  if (mood === "construction") return /street construction|paving blocks/iu;
  if (mood === "bufia") return /Saudi bufia cafe|bufia/iu;
  return /Saudi residential street|Saudi street|ordinary outdoor street|parking/iu;
}

function expectedOpener(section) {
  const type = SECTION_REGISTRY[section]?.captureType || "";
  if (type === "group_selfie") return "A candid group selfie.";
  if (type === "accidental_front_camera_capture") return "An accidental front-camera capture.";
  return "A candid direct selfie.";
}

function makeInput(section, clothingIndex, lightingIndex, poseIndex, expressionIndex) {
  const spec = sectionSpec[section];
  const period = lightingIndex === 0 ? lightingSpec.day : lightingSpec.night;
  const clothing = clothingIndex === 0 ? spec.catalogClothing : "custom";
  const raw = {
    ...base,
    studioSection:section,
    scene:spec.scene,
    time:period.time,
    lighting:period.text,
    clothing,
    pose:spec.poses[poseIndex],
    expression:expressions[expressionIndex]
  };
  if (clothing === "custom") raw.customClothing = customClothingText(section);
  if (section === "custom") raw.customScene = "Phase 41 custom courtyard with a low stone wall and two potted plants";
  if (section === "group") {
    raw.groupCount = String(2 + ((clothingIndex + lightingIndex + poseIndex + expressionIndex) % 5));
    raw.cameraHolder = expressionIndex === 0 ? "A" : "B";
    raw.groupArrangement = poseIndex === 0 ? "natural-auto" : "staggered";
    raw.groupInteraction = expressionIndex === 0 ? "casual" : "laughing";
  }
  if (section === "street") {
    raw.streetMood = streetMoods[(clothingIndex * 8 + lightingIndex * 4 + poseIndex * 2 + expressionIndex) % streetMoods.length];
    raw.streetHour = period.time === "day" ? 12 : 21;
  }
  if (section === "carExterior") {
    raw.carExteriorLocation = poseIndex === 0 ? "villa" : "grocery";
    raw.carExteriorPose = spec.poses[poseIndex];
    const options = getCarExteriorLightingOptions({ time:period.time, location:raw.carExteriorLocation, pose:raw.carExteriorPose });
    raw.carExteriorLighting = options[Math.min(lightingIndex, Math.max(0, options.length - 1))]?.value || options[0]?.value || "";
  }
  if (section === "accidental") {
    raw.accidentalTrigger = poseIndex === 0 ? "pocket" : "screen-wake";
    raw.accidentalPhonePosition = poseIndex === 0 ? "rising" : "low-off-axis";
    raw.accidentalMotion = poseIndex === 0 ? "subtle" : "noticeable";
    raw.accidentalTilt = poseIndex === 0 ? "auto" : "clockwise";
    raw.accidentalFocus = expressionIndex === 0 ? "transition-face" : "background-first";
    raw.accidentalExposure = lightingIndex === 0 ? "auto-imperfect" : "highlight-biased";
    raw.accidentalIntensity = expressionIndex === 0 ? "natural" : "mild";
  }
  return raw;
}

function expectedLighting(raw, section) {
  if (section === "carExterior") return resolveCarExteriorSelection(raw).lightingText;
  return raw.lighting;
}

function expectedPose(raw, section) {
  if (section === "carExterior") return resolveCarExteriorSelection(raw).poseText;
  return raw.pose;
}

function expectedClothing(raw) {
  return resolveClothingText(raw.clothing, raw);
}

function addFailure(failures, section, field, detail, caseId) {
  failures.push({ section, field, case:caseId, detail });
}

const failures = [];
const matrix = Object.fromEntries(SECTION_IDS.map((section) => [section, {
  clothing:true, lighting:true, pose:true, scene:true, expression:true, time:true,
  selfie:true, group:true, accidental:true, identity:true, body:true, dedupe:true,
  budget:true, determinism:true, readonly:true
}]));
const samples = {};
let totalCases = 0;

for (const section of SECTION_IDS) {
  for (let clothingIndex = 0; clothingIndex < 2; clothingIndex += 1) {
    for (let lightingIndex = 0; lightingIndex < 2; lightingIndex += 1) {
      for (let poseIndex = 0; poseIndex < 2; poseIndex += 1) {
        for (let expressionIndex = 0; expressionIndex < 2; expressionIndex += 1) {
          totalCases += 1;
          const caseId = `${section}:c${clothingIndex}:l${lightingIndex}:p${poseIndex}:e${expressionIndex}`;
          const raw = makeInput(section, clothingIndex, lightingIndex, poseIndex, expressionIndex);
          const runs = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(raw));
          const first = runs[0];
          const prompt = first.prompt;
          if (!samples[section] && clothingIndex === 0 && lightingIndex === 1 && poseIndex === 0 && expressionIndex === 1) samples[section] = prompt;

          const clothingText = expectedClothing(raw);
          if (!clothingText || !prompt.includes(clothingText)) {
            matrix[section].clothing = false;
            addFailure(failures, section, "clothing", `selected clothing missing: ${JSON.stringify(clothingText)}`, caseId);
          }
          if (raw.clothing === "custom" && !prompt.includes(raw.customClothing)) {
            matrix[section].clothing = false;
            addFailure(failures, section, "customClothing", "custom clothing not preserved character-for-character", caseId);
          }

          const lightingText = expectedLighting(raw, section);
          if (!lightingText || !prompt.includes(lightingText)) {
            matrix[section].lighting = false;
            addFailure(failures, section, "lighting", `selected lighting missing: ${JSON.stringify(lightingText)}`, caseId);
          }

          const poseText = expectedPose(raw, section);
          if (!poseText || !prompt.includes(poseText)) {
            matrix[section].pose = false;
            addFailure(failures, section, "pose", `selected pose missing: ${JSON.stringify(poseText)}`, caseId);
          }

          if (!prompt.includes(raw.expression)) {
            matrix[section].expression = false;
            addFailure(failures, section, "expression", `selected expression missing: ${raw.expression}`, caseId);
          }

          if (!sectionSpec[section].sceneEvidence.test(prompt)) {
            matrix[section].scene = false;
            addFailure(failures, section, "scene", "section scene/location evidence missing", caseId);
          }
          if (section === "street") {
            const moodEvidence = expectedStreetMoodEvidence(raw.streetMood);
            if (!moodEvidence.test(prompt)) {
              matrix[section].scene = false;
              addFailure(failures, section, "streetMood", `street mood ${raw.streetMood} missing`, caseId);
            }
          }
          if (section === "carExterior") {
            const selection = resolveCarExteriorSelection(raw);
            if (!prompt.includes("2017 Range Rover Sport Autobiography Dynamic") || !prompt.includes("Fuji White") || !prompt.includes(selection.locationText)) {
              matrix[section].scene = false;
              addFailure(failures, section, "carExteriorLocation", `location/spec missing for ${selection.location}`, caseId);
            }
          }
          if (section === "car" && (!prompt.includes("2017 Range Rover Sport Autobiography Dynamic") || !prompt.includes("Ivory perforated leather"))) {
            matrix[section].scene = false;
            addFailure(failures, section, "carInterior", "2017 interior or Ivory perforated leather missing", caseId);
          }

          if (raw.time === "night") {
            if (!/night/iu.test(prompt) || /Lighting follows the selected real-world night source\.(?!\s*[^])/u.test(prompt)) {
              matrix[section].time = false;
              addFailure(failures, section, "time", "night selection lacks specific night evidence", caseId);
            }
          } else if (/Lighting follows the selected real-world night source/iu.test(prompt)) {
            matrix[section].time = false;
            addFailure(failures, section, "time", "day selection leaked night lighting sentence", caseId);
          }

          if (firstSentence(prompt) !== expectedOpener(section)) {
            matrix[section].selfie = false;
            addFailure(failures, section, "opener", `wrong opener: ${firstSentence(prompt)}`, caseId);
          }
          if (SELFIE_SECTIONS.has(section) && !prompt.includes(SELFIE_ARM_LOCK)) {
            matrix[section].selfie = false;
            addFailure(failures, section, "selfieArmLock", "SELFIE_ARM_LOCK missing", caseId);
          }
          if (SELFIE_SECTIONS.has(section)) {
            const outsideLock = prompt.replace(SELFIE_ARM_LOCK, "");
            if (/both\s+hands?\s+(?:in\s+)?(?:the\s+)?pockets?|both\s+hands?\s+(?:are\s+)?occupied/iu.test(outsideLock)) {
              matrix[section].selfie = false;
              addFailure(failures, section, "selfiePoseConflict", "impossible two-hand pose leaked", caseId);
            }
          }

          if (!prompt.includes(IDENTITY_STRICT_LOCK)
            || !/face and head shape/iu.test(prompt)
            || !/feature spacing/iu.test(prompt)
            || !/skin tone/iu.test(prompt)
            || !/hairline/iu.test(prompt)
            || !/beard\/moustache pattern/iu.test(prompt)
            || !/no beautification/iu.test(prompt)
            || !/face slimming\/lengthening/iu.test(prompt)) {
            matrix[section].identity = false;
            addFailure(failures, section, "identity", "strict face identity preservation evidence incomplete", caseId);
          }

          if (!/195\s*cm/iu.test(prompt) || !/88\s*kg/iu.test(prompt) || !/lean-athletic/iu.test(prompt) || !BODY_SCALE_EVIDENCE.test(prompt) || /\b183\b|\b82\s*kg\b/iu.test(prompt)) {
            matrix[section].body = false;
            addFailure(failures, section, "body", "195cm/88kg/lean-athletic/body-scale authority incomplete", caseId);
          }

          if (FORBIDDEN_FALLBACKS.test(prompt)) {
            matrix[section].scene = false;
            addFailure(failures, section, "fallback", "forbidden generic fallback leaked", caseId);
          }

          if (hasExactDuplicateSentence(prompt)) {
            matrix[section].dedupe = false;
            addFailure(failures, section, "dedupe", "exact duplicate sentence present", caseId);
          }

          if (words(prompt) > 250) {
            matrix[section].budget = false;
            addFailure(failures, section, "budget", `${words(prompt)} words`, caseId);
          }

          if (!runs.every((item) => item.prompt === prompt)) {
            matrix[section].determinism = false;
            addFailure(failures, section, "determinism", "10/10 outputs differ", caseId);
          }

          const before = JSON.stringify(first.canonical);
          void buildOpenAIImagePrompt(first.canonical);
          if (JSON.stringify(first.canonical) !== before) {
            matrix[section].readonly = false;
            addFailure(failures, section, "readonly", "canonical state mutated by adapter", caseId);
          }

          if (section === "group") {
            const expectedCount = Number(raw.groupCount);
            if (!prompt.includes(`${expectedCount} people are present in the group composition.`)) {
              matrix[section].group = false;
              addFailure(failures, section, "groupCount", `requested ${expectedCount} people not present`, caseId);
            }
            if (!new RegExp(`phone holder[^.]{0,40}${raw.cameraHolder}|${raw.cameraHolder}[^.]{0,40}phone holder`, "iu").test(prompt)) {
              matrix[section].group = false;
              addFailure(failures, section, "cameraHolder", `phone holder ${raw.cameraHolder} missing`, caseId);
            }
            if (!prompt.includes(raw.groupArrangement)) {
              matrix[section].group = false;
              addFailure(failures, section, "groupArrangement", `distribution ${raw.groupArrangement} missing`, caseId);
            }
          }

          if (section === "accidental") {
            const accidentFields = [
              ["accidentalTrigger", raw.accidentalTrigger],
              ["accidentalPhonePosition", raw.accidentalPhonePosition],
              ["accidentalMotion", raw.accidentalMotion],
              ["accidentalFocus", raw.accidentalFocus],
              ["accidentalExposure", raw.accidentalExposure]
            ];
            for (const [field, value] of accidentFields) {
              if (!prompt.includes(value)) {
                matrix[section].accidental = false;
                addFailure(failures, section, field, `${value} missing`, caseId);
              }
            }
            if (!/candid|accidental|unintentional/iu.test(prompt)) {
              matrix[section].accidental = false;
              addFailure(failures, section, "candid", "candid accidental behavior missing", caseId);
            }
          }
        }
      }
    }
  }
}

// Explicit group boundary audit: all selectable counts 2-6 must survive end-to-end.
for (let count = 2; count <= 6; count += 1) {
  const raw = { ...makeInput("group", 0, 1, 0, 0), groupCount:String(count), cameraHolder:"A", groupArrangement:"natural-auto" };
  const prompt = buildCanonicalV3UserOutput(raw).prompt;
  if (!prompt.includes(`${count} people are present in the group composition.`)) {
    matrix.group.group = false;
    addFailure(failures, "group", "groupCount", `boundary count ${count} did not survive`, `group-boundary-${count}`);
  }
}

// Mutation isolation: a rejected mutation in one section must not alter another section's prompt.
const carExteriorBefore = buildCanonicalV3UserOutput(makeInput("carExterior", 0, 1, 0, 0)).prompt;
try { SECTION_REGISTRY.solo.poses.push("Phase41 illegal solo mutation"); } catch { /* expected deep freeze */ }
const carExteriorAfter = buildCanonicalV3UserOutput(makeInput("carExterior", 0, 1, 0, 0)).prompt;
assert.equal(carExteriorAfter, carExteriorBefore, "Phase 41: solo mutation attempt changed carExterior prompt");

const bedroomBefore = buildCanonicalV3UserOutput(makeInput("bedroom", 0, 1, 0, 0)).prompt;
try { SECTION_REGISTRY.gym.lighting.push("Phase41 illegal gym mutation"); } catch { /* expected deep freeze */ }
const bedroomAfter = buildCanonicalV3UserOutput(makeInput("bedroom", 0, 1, 0, 0)).prompt;
assert.equal(bedroomAfter, bedroomBefore, "Phase 41: gym mutation attempt changed bedroom prompt");

console.log(`PHASE41_CASES=${totalCases}`);
console.log(`PHASE41_FAILURE_COUNT=${failures.length}`);
console.log(`PHASE41_MATRIX=${JSON.stringify(matrix)}`);
console.log(`PHASE41_FAILURES=${JSON.stringify(failures.slice(0, 200))}`);
for (const section of SECTION_IDS) console.log(`PHASE41_${section.toUpperCase()}_SAMPLE=${samples[section] || ""}`);

assert.equal(totalCases, 144, `Phase 41: expected 144 matrix cases, got ${totalCases}`);
assert.deepEqual(Object.keys(matrix), SECTION_IDS, "Phase 41: matrix section order drifted");
assert.equal(failures.length, 0, `Phase 41 field-wiring audit failed with ${failures.length} field failures. See PHASE41_FAILURES output.`);
console.log("PHASE41_DETERMINISM=10/10");
console.log("✓ Phase 41 full section field-wiring audit passed");
