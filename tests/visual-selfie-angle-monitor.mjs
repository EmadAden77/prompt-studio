import assert from "node:assert/strict";
import {
  VISUAL_SELFIE_DEFAULTS,
  buildLiveGeometryPreviewModel,
  buildVisualSelfieGeometrySection,
  evaluateSelfieGeometry,
  normalizeVisualSelfieState,
  resolveMonitorComposition,
  selfieAnglePreset,
  visualSelfieQa
} from "../js/visual-selfie-angle-monitor-v1.js";
import { applyAutoRealismSuite } from "../js/auto-realism-suite-v1.js";

const defaults = normalizeVisualSelfieState({});
assert.equal(defaults.visualSelfieMonitor,"on");
assert.equal(defaults.selfieDistanceCm,VISUAL_SELFIE_DEFAULTS.selfieDistanceCm);
assert.equal(defaults.selfieYawDeg,0);
assert.equal(defaults.selfiePitchDeg,0);
assert.equal(defaults.selfieRollDeg,2);

const clamped = normalizeVisualSelfieState({ selfieDistanceCm:999, selfieYawDeg:-90, selfiePitchDeg:70, selfieRollDeg:-44, faceYawDeg:88 });
assert.equal(clamped.selfieDistanceCm,80);
assert.equal(clamped.selfieYawDeg,-45);
assert.equal(clamped.selfiePitchDeg,25);
assert.equal(clamped.selfieRollDeg,-10);
assert.equal(clamped.faceYawDeg,40);

const eye = selfieAnglePreset("eye");
assert.equal(eye.yaw,0);
assert.equal(eye.pitch,0);
const threeQuarter = selfieAnglePreset("three-quarter");
assert.equal(threeQuarter.yaw,24);
assert.equal(threeQuarter.faceYaw,10);
const high = selfieAnglePreset("slight-high");
assert.ok(high.pitch < 0);
const low = selfieAnglePreset("slight-low");
assert.ok(low.pitch > 0);

const natural = evaluateSelfieGeometry({ selfieDistanceCm:50, selfieYawDeg:20, selfiePitchDeg:-6, selfieRollDeg:2, faceYawDeg:10 });
assert.ok(natural.score >= 88);
assert.equal(natural.reachable,true);

const strained = evaluateSelfieGeometry({ selfieDistanceCm:80, selfieYawDeg:45, selfiePitchDeg:25, selfieRollDeg:10, faceYawDeg:-40 });
assert.ok(strained.score < 68);
assert.equal(strained.reachable,false);
assert.ok(strained.issues.length >= 4);

const section = buildVisualSelfieGeometrySection({
  visualSelfieMonitor:"on",
  selfieDistanceCm:52,
  selfieYawDeg:18,
  selfiePitchDeg:-7,
  selfieRollDeg:2,
  faceYawDeg:8,
  composition:"upper",
  monitorComposition:"auto"
});
assert.match(section,/\[VISUAL SELFIE ANGLE MONITOR\]/u);
assert.match(section,/Xiaomi 15 Ultra FRONT camera/u);
assert.match(section,/52 cm/u);
assert.match(section,/Phone yaw: \+18°/u);
assert.match(section,/Phone pitch: -7°/u);
assert.match(section,/Framing target: upper/u);
assert.match(section,/not a third-person camera plan/u);
assert.equal(resolveMonitorComposition({ monitorComposition:"auto", composition:"tight" }),"tight");
assert.equal(resolveMonitorComposition({ monitorComposition:"upper", composition:"tight" }),"upper");

const qa = visualSelfieQa({ selfieDistanceCm:50, selfieYawDeg:0, selfiePitchDeg:0, selfieRollDeg:2, faceYawDeg:0 });
assert.ok(qa.some((item) => item.label === "Visual Selfie Monitor"));
assert.ok(qa.some((item) => item.label === "Selfie Geometry"));
assert.ok(qa.some((item) => item.label === "Arm-Reach Check"));

const driverLocked = normalizeVisualSelfieState({
  studioSection:"car", scene:"rangeRover", carSeat:"driver-left", selfieAngle:"eye", composition:"tight",
  selfieDistanceCm:76, selfieYawDeg:0, selfiePitchDeg:18, selfieRollDeg:2, faceYawDeg:0, monitorComposition:"tight"
});
assert.equal(driverLocked.driverCarGeometryLocked,true, "Driver selfies must resolve through the car-driver geometry lock");
assert.equal(driverLocked.selfieDistanceCm,40, "A tight driver selfie must reject a long 76cm arm vector");
assert.equal(driverLocked.selfiePitchDeg,-3, "Eye-level driver capture must use one resolved, slightly high camera vector");
assert.equal(driverLocked.monitorComposition,"auto", "Driver monitor crop must follow the selected composition only");

const driverSection = buildVisualSelfieGeometrySection(driverLocked);
assert.match(driverSection,/\[CAR DRIVER SELFIE GEOMETRY — SOLE AUTHORITY\]/u);
assert.doesNotMatch(driverSection,/\[VISUAL SELFIE ANGLE MONITOR\]/u);
assert.match(driverSection,/40 cm/u);
assert.match(driverSection,/thin, physically attached upper steering-wheel arc/u);
assert.match(driverSection,/Never introduce a second camera distance/u);
assert.match(driverSection,/torso and head aligned with the steering-wheel axis/u);
assert.doesNotMatch(driverSection,/only the head and eyes make the small camera correction/u);

const driverQa = visualSelfieQa(driverLocked);
assert.ok(driverQa.some((item) => item.label === "Car Driver Geometry"));
assert.ok(driverQa.some((item) => item.label === "Driver Anchor"));
assert.ok(driverQa.some((item) => item.label === "Live Context"));

const driverLivePreview = buildLiveGeometryPreviewModel({ ...driverLocked, lighting:"car-night-parking-led", time:"night" });
assert.equal(driverLivePreview.context,"driver-cabin");
assert.equal(driverLivePreview.lighting.id,"practical-night");
assert.match(driverLivePreview.driverAnchor,/Unmirrored LHD/u);

const daylightLivePreview = buildLiveGeometryPreviewModel({ lighting:"daylight", time:"day", composition:"close" });
assert.equal(daylightLivePreview.context,"selfie-space");
assert.equal(daylightLivePreview.lighting.id,"natural-day");
assert.equal(daylightLivePreview.composition,"close");

const suite = applyAutoRealismSuite({
  positive:"[PHONE REALISM]\nSubject-held front camera only.",
  state:{
    scene:"custom", pose:"standing", selfieAngle:"three-quarter", composition:"close", clothing:"casual", lighting:"daylight", time:"day",
    selfieDistanceCm:50, selfieYawDeg:24, selfiePitchDeg:-2, selfieRollDeg:2, faceYawDeg:10, monitorComposition:"close"
  }
});
assert.match(suite.positive,/\[VISUAL SELFIE ANGLE MONITOR\]/u);
assert.match(suite.negative,/camera outside natural arm reach/u);
assert.doesNotMatch(suite.negative,/visual selfie monitor geometry ignored/u);
assert.match(suite.meta.selfieGeometry,/50cm\/Y24\/P-2\/R2/u);

const driverSuite = applyAutoRealismSuite({
  positive:"[PHONE REALISM]\nSubject-held front camera only.",
  state:{
    studioSection:"car", scene:"rangeRover", carSeat:"driver-left", pose:"car-driver-close", selfieAngle:"eye", composition:"tight", clothing:"work-blue-navy", lighting:"car-night-parking-led", time:"night",
    selfieDistanceCm:76, selfieYawDeg:0, selfiePitchDeg:18, selfieRollDeg:2, faceYawDeg:0, monitorComposition:"tight", variationMode:"slight_high"
  }
});
assert.match(driverSuite.positive,/\[CAR DRIVER SELFIE GEOMETRY — SOLE AUTHORITY\]/u);
assert.doesNotMatch(driverSuite.positive,/\[VISUAL SELFIE ANGLE MONITOR\]/u);
assert.match(driverSuite.positive,/40 cm/u);
assert.match(driverSuite.positive,/mandatory steering-wheel anchor/u);
assert.match(driverSuite.meta.selfieGeometry,/40cm\/Y0\/P-3\/R2/u);
assert.equal(driverSuite.state.variationMode,"none", "Driver geometry must suppress a competing One-Click Variation");
assert.doesNotMatch(driverSuite.positive,/\[ONE-CLICK VARIATION\]/u);
assert.equal(driverSuite.qa.find((item) => item.label === "Variation")?.value,"مقفل على هندسة السائق");

console.log("Visual Selfie Angle Monitor tests passed");
