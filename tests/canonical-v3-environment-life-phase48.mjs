import assert from "node:assert/strict";
import { buildCanonicalV3UserOutput } from "../js/canonical/canonical-v3-phase48.js";
import { resolveEnvironmentLife } from "../js/canonical/environment-life-phase48.js";

const wc = value => String(value || "").trim().split(/\s+/u).filter(Boolean).length;
const base = extra => ({ hasReference:true, expression:"neutral", clothing:"casual-tee-black-jeans-blue", ...extra });

const parkingRaw = base({ studioSection:"carExterior", scene:"carExterior", time:"night", carExteriorLocation:"parking", carExteriorPose:"door-lean" });
const parking = buildCanonicalV3UserOutput(parkingRaw);
assert.equal(parking.phase48.environmentLife.time,"night");
assert.equal(parking.phase48.environmentLife.activityLevel,"low");
assert.match(parking.prompt,/parking area has restrained nighttime life/iu);
assert.match(parking.prompt,/irregularly spaced parked cars/iu);
assert.match(parking.prompt,/at most one or two distant pedestrians/iu);
assert.match(parking.prompt,/same practical night light sources with consistent shadow direction and exposure/iu);
assert.match(parking.prompt,/Real parking-lot practical lighting is the dominant source/iu);
assert.match(parking.prompt,/Identity strictly preserved/iu);
assert.match(parking.prompt,/195 cm, 88 kg/iu);
assert.ok(wc(parking.prompt)<=280,`parking budget ${wc(parking.prompt)}`);

const villa = buildCanonicalV3UserOutput(base({ studioSection:"carExterior", scene:"carExterior", time:"night", carExteriorLocation:"villa", carExteriorPose:"door-lean" }));
assert.match(villa.prompt,/residential background stays quiet at night/iu);
assert.match(villa.prompt,/empty space preserved/iu);
assert.match(villa.prompt,/no crowd gathering around the subject/iu);

const grocery = buildCanonicalV3UserOutput(base({ studioSection:"carExterior", scene:"carExterior", time:"night", carExteriorLocation:"grocery", carExteriorPose:"front-grille" }));
assert.equal(grocery.phase48.environmentLife.activityLevel,"moderate");
assert.match(grocery.prompt,/ordinary errands without looking toward the selfie camera/iu);

const street = buildCanonicalV3UserOutput(base({ studioSection:"street", scene:"street", time:"night", streetMood:"normal" }));
assert.equal(street.phase48.environmentLife.activityLevel,"active");
assert.match(street.prompt,/Street life is distributed naturally across depth/iu);
assert.match(street.prompt,/parked and passing vehicles appear at irregular spacing/iu);
assert.match(street.prompt,/do not pose for or stare at the selfie camera/iu);
assert.ok(wc(street.prompt)<=250,`street budget ${wc(street.prompt)}`);

const gym = buildCanonicalV3UserOutput(base({ studioSection:"gym", scene:"gym", time:"day" }));
assert.equal(gym.phase48.environmentLife.activityLevel,"moderate");
assert.match(gym.prompt,/few people use separate equipment at varied distances/iu);
assert.match(gym.prompt,/some stations remain empty/iu);
assert.match(gym.prompt,/nobody poses for or stares at the selfie camera/iu);
assert.ok(wc(gym.prompt)<=250,`gym budget ${wc(gym.prompt)}`);

const bedroom = buildCanonicalV3UserOutput(base({ studioSection:"bedroom", scene:"bedroom", time:"night" }));
assert.equal(bedroom.phase48.environmentLife.activityLevel,"private");
assert.match(bedroom.prompt,/no unrelated background people or vehicles/iu);
assert.doesNotMatch(bedroom.prompt,/few people use|distant pedestrians|passing vehicles/iu);

const mirror = buildCanonicalV3UserOutput(base({ studioSection:"mirror", scene:"bedroom", time:"night" }));
assert.equal(mirror.phase48.environmentLife.activityLevel,"private");
assert.match(mirror.prompt,/no unrelated people or vehicles introduced into the reflection/iu);

const dayProfile = resolveEnvironmentLife({ studioSection:"carExterior", time:"day", carExteriorLocation:"parking" }, { lighting:{ source_type:"daylight", description:"soft daylight" } }, "carExterior");
assert.equal(dayProfile.time,"day");
assert.doesNotMatch(dayProfile.lifeSentence,/nighttime/iu);

const ten = Array.from({length:10},()=>buildCanonicalV3UserOutput(parkingRaw).prompt);
assert.ok(ten.every(prompt=>prompt===ten[0]),"Phase 48 determinism must remain 10/10");
assert.equal(parking.phase48.determinism,"10/10");

console.log(`PHASE48_PARKING_WORDS=${wc(parking.prompt)}`);
console.log(`PHASE48_PARKING_SAMPLE=${parking.prompt}`);
console.log("Phase 48 context-aware environment life: PASS");
