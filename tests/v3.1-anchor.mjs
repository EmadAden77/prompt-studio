import assert from "node:assert/strict";
import fs from "node:fs";
import { POSES } from "../js/data/posesData.js";
import { PoseEngine } from "../js/engines/poseEngine.js";
import { Validator } from "../js/engines/validator.js";
import { FURNITURE_ANCHOR, SOFA_SPATIAL_MAP, CHAIR_SPATIAL_MAP } from "../js/engines/realismLocks.js";

const promptSource = fs.readFileSync("js/engines/promptEngine.js", "utf8");
const roomSource = fs.readFileSync("js/engines/roomLockEngine.js", "utf8");

assert.match(FURNITURE_ANCHOR.lock, /person adapts to the furniture/i);
assert.match(FURNITURE_ANCHOR.lock, /furniture → body → contact proof → camera/u);
assert.match(SOFA_SPATIAL_MAP, /seat cushion between armrests = SIT ZONE/u);
assert.match(CHAIR_SPATIAL_MAP, /knees ~90°/u);

const engine = new PoseEngine(POSES);
for (const id of ["sitting_sofa", "sitting_chair", "sitting_bed_edge", "lying_back"]) {
  const pose = engine.getById(id);
  assert.ok(pose, `missing pose ${id}`);
  const sections = engine.engineer({ pose });
  assert.match(sections.furnitureAnchor, /FURNITURE ANCHOR/u, `${id} must receive furniture anchor`);
  assert.match(sections.furnitureAnchor, /actual|REAL|locked/i);
}

const sofaAnchor = engine.engineer({ pose:engine.getById("sitting_sofa") }).furnitureAnchor;
assert.match(sofaAnchor, /between the armrests/u);
assert.match(sofaAnchor, /3–5cm/u);
const chairAnchor = engine.engineer({ pose:engine.getById("sitting_chair") }).furnitureAnchor;
assert.match(chairAnchor, /feet flat/u);

const roomIndex = promptSource.indexOf("s.push(this.roomLock");
const anchorIndex = promptSource.indexOf("s.push(this.furnitureAnchorText");
const poseIndex = promptSource.indexOf("s.push(this.posePhysics");
const cameraIndex = promptSource.indexOf("s.push(CAMERA_EMULATOR)");
assert.ok(roomIndex >= 0 && roomIndex < anchorIndex && anchorIndex < poseIndex && poseIndex < cameraIndex,
  "prompt order must be ROOM LOCK → FURNITURE ANCHOR → POSE → CAMERA");
assert.match(roomSource, /FIXED FURNITURE AUTHORITY/u);
assert.match(roomSource, /buildFurnitureAnchorAuthority/u);

const validator = new Validator({ lightingEngine:null, sceneEngine:{ } });
const sofaPose = engine.getById("sitting_sofa");
const missing = validator.validateGeneratedPrompt({ pose:sofaPose }, "ROOM LOCK\nPOSE & PHYSICS");
assert.equal(missing.valid, false);
assert.equal(missing.conflicts[0].type, "furniture_anchor");
assert.equal(missing.autoFixes[0].kind, "regenerate_prompt");
const present = validator.validateGeneratedPrompt(
  { pose:sofaPose },
  `ROOM LOCK\n${sofaAnchor}\nROOM/FURNITURE AUTHORITY (SOFA): locked\nPOSE & PHYSICS`
);
assert.equal(present.valid, true);

console.log("✓ v3.1-anchor furniture-first body placement passed");
