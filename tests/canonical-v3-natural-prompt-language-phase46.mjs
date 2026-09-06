import assert from "node:assert/strict";
import fs from "node:fs";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-phase46.js";
import { NATURAL_HEIGHT_SCALE_SENTENCE } from "../js/canonical/canonical-v3-pipeline.js";
import {
  IDENTITY_STRICT_LOCK,
  SELFIE_ARM_LOCK,
  POSITIVE_SKIN_SENTENCE,
  POSITIVE_CAR_GLASS_SENTENCE
} from "../js/canonical/openai-image-adapter-phase36.js";

const words = (value) => String(value || "").trim().split(/\s+/u).filter(Boolean).length;
const FABRICS = ["poplin","jersey","cotton","linen","viscose","polyester","technical poly","wool","denim","flannel"];
const base = (extra = {}) => ({ hasReference:true, selfieAngle:"auto", selfiePose:"auto", expression:"neutral", clothing:"casual-tee-black-jeans-blue", ...extra });
function uniqueFabricsInClothing(prompt) { const sentence = String(prompt).match(/Subject wearing [^.]+\./iu)?.[0] || ""; const lower = sentence.toLowerCase(); return FABRICS.filter((fabric) => lower.includes(fabric)); }
function assertNaturalCore(output, raw, label) {
  assert.ok(output.prompt.includes(IDENTITY_STRICT_LOCK), `${label}: identity lock missing`);
  if (raw.studioSection !== "accidental") assert.ok(output.prompt.includes(SELFIE_ARM_LOCK), `${label}: selfie arm lock missing`);
  assert.ok(output.prompt.includes(POSITIVE_SKIN_SENTENCE), `${label}: positive skin sentence missing`);
  assert.doesNotMatch(output.prompt, /Vehicle scale confirms/iu, `${label}: proof-style scale wording returned`);
  assert.doesNotMatch(output.prompt, /manual[^.]*composition/iu, `${label}: internal manual composition tag returned`);
  assert.doesNotMatch(output.prompt, /camera about\s*-?\d+°\s+above eye level/iu, `${label}: numeric engine-style angle wording returned`);
  assert.doesNotMatch(output.prompt, /Selfie optics lock:|Selfie framing:/iu, `${label}: internal geometry labels leaked`);
  assert.match(output.prompt, /Camera held (?:close to|slightly above|slightly below) eye level|Camera held close to eye level with a natural three-quarter turn/iu, `${label}: natural selfie optics missing`);
  assert.doesNotMatch(output.prompt, /pressed[^.]*unpressed|unpressed[^.]*pressed/iu, `${label}: pressed/unpressed contradiction`);
  assert.ok(uniqueFabricsInClothing(output.prompt).length <= 1, `${label}: clothing sentence contains multiple fabric names: ${uniqueFabricsInClothing(output.prompt).join(", ")}`);
  const max = raw.studioSection === "carExterior" ? 280 : 250; assert.ok(words(output.prompt) <= max, `${label}: prompt exceeds ${max} words (${words(output.prompt)})`);
  const ten = Array.from({ length:10 }, () => buildCanonicalV3UserOutput(raw).prompt); assert.ok(ten.every((prompt) => prompt === ten[0]), `${label}: determinism must be 10/10`);
}
const carVillaRaw = base({ studioSection:"carExterior", scene:"carExterior", time:"night", carExteriorLocation:"villa", fabric:"jersey", fabricWeight:"light", clothingFit:"relaxed", wearState:"normal-day", ironState:"unpressed" });
const carVilla = buildCanonicalV3UserOutput(carVillaRaw); assertNaturalCore(carVilla, carVillaRaw, "carExterior night villa");
assert.ok(carVilla.prompt.includes(NATURAL_HEIGHT_SCALE_SENTENCE), "carExterior: natural height sentence missing");
assert.match(carVilla.prompt, /Naturally imperfect framing where the Range Rover is slightly awkwardly cropped in the way a real one-handed selfie captures it\./iu, "carExterior: natural one-handed framing missing");
assert.match(carVilla.prompt, /Camera held slightly above eye level\./iu, "carExterior: 8-degree auto angle was not naturalized");
assert.doesNotMatch(carVilla.prompt, /quad exhausts|quad rectangular exhaust/iu, "carExterior door-lean: rear exhaust details must be scoped out");
assert.match(carVilla.prompt, /Fuji White/iu); assert.match(carVilla.prompt, /gloss-black grille and vent trim/iu); assert.match(carVilla.prompt, /dark 22-inch alloys/iu); assert.match(carVilla.prompt, /LED DRLs/iu); assert.match(carVilla.prompt, /panoramic roof/iu); assert.match(carVilla.prompt, /Dynamic badging/iu);
assert.match(carVilla.prompt, /transparent glass with natural reflections and a faint Ivory-cabin view where lighting allows/iu); assert.doesNotMatch(carVilla.prompt, /never opaque black|not a black panel/iu);
assert.match(carVilla.prompt, /Warm villa porch light mixes with cooler ambient night light, with the DRL as a secondary source only\./iu); assert.doesNotMatch(carVilla.prompt, /selected real-world night source/iu);
assert.ok((carVilla.prompt.match(/leaning naturally against the closed driver door/giu) || []).length <= 1); assert.doesNotMatch(carVilla.prompt, /subject leaning on closed driver door/iu);
const parkingRaw=base({studioSection:"carExterior",scene:"carExterior",time:"night",carExteriorLocation:"parking"}); const parking=buildCanonicalV3UserOutput(parkingRaw); assertNaturalCore(parking,parkingRaw,"carExterior night parking"); assert.match(parking.prompt,/Real parking-lot practical lighting is the dominant source, with the DRL secondary\./iu); assert.doesNotMatch(parking.prompt,/selected real-world night source/iu);
const streetRaw=base({studioSection:"street",scene:"street",time:"night",streetMood:"normal"}); const street=buildCanonicalV3UserOutput(streetRaw); assertNaturalCore(street,streetRaw,"street night"); assert.match(street.prompt,/Mixed sodium streetlights and cool LED storefront spill shape the scene, with DRL secondary\./iu); assert.doesNotMatch(street.prompt,/selected real-world night source/iu);
const manualRaw=base({studioSection:"street",scene:"street",time:"day",selfieAngle:"three-quarter",selfiePose:"standing-relaxed"}); const manual=buildCanonicalV3UserOutput(manualRaw); assertNaturalCore(manual,manualRaw,"manual street override"); assert.equal(manual.geometry.angle,"three-quarter"); assert.equal(manual.geometry.pose,"standing-relaxed"); assert.match(manual.prompt,/Camera held close to eye level with a natural three-quarter turn\./iu);
const traditionalRaw=base({studioSection:"carExterior",scene:"carExterior",time:"night",carExteriorLocation:"villa",clothing:"thobe-redshemagh-iqal"}); const traditional=buildCanonicalV3UserOutput(traditionalRaw); assertNaturalCore(traditional,traditionalRaw,"traditional carExterior"); assert.match(traditional.prompt,/red-and-white fine checkered shemagh/iu); assert.match(traditional.prompt,/black doubled-cord iqal/iu);
const carInteriorRaw=base({studioSection:"car",scene:"rangeRover",time:"night"}); const carInterior=buildCanonicalV3UserOutput(carInteriorRaw); assertNaturalCore(carInterior,carInteriorRaw,"car interior night"); assert.match(carInterior.prompt,/transparent.*natural reflections/iu); assert.doesNotMatch(carInterior.prompt,/never opaque black|not a black panel/iu);
const clothingSentence=carVilla.prompt.match(/Subject wearing [^.]+\./iu)?.[0]||""; assert.ok(clothingSentence); assert.doesNotMatch(clothingSentence,/fabric weight|ordinary daily wear|relaxed fit|unpressed/iu); assert.ok(uniqueFabricsInClothing(carVilla.prompt).length<=1);
const engineGate=fs.readFileSync(new URL("../js/canonical/engine-gate.js",import.meta.url),"utf8"); assert.match(engineGate,/from\s+["']\.\/canonical-v3-phase51\.js["']/u,"live engine gate must use the current Phase 51 output while Phase 46 remains a historical behavior contract");
console.log(`PHASE46_CAREXTERIOR_NIGHT_WORDS=${words(carVilla.prompt)}`); console.log(`PHASE46_CAREXTERIOR_NIGHT_SAMPLE=${carVilla.prompt}`); console.log("PHASE46_DETERMINISM=10/10"); console.log("✓ Phase 46 natural prompt language passed under Phase 51 live gate");