import assert from "node:assert/strict";
import fs from "node:fs";
import { LIGHTING_OPTIONS } from "../js/data/lightingData.js";
import { lightingAllowed, lightingCoherence, rankedLighting, autoLighting, altLighting } from "../js/engines/autoEngine.js";

const index = fs.readFileSync("index.html", "utf8");
const runtime = fs.readFileSync("js/autoRuntime.js", "utf8");

assert.match(index, /اختياران فقط — والباقي هندسة تلقائية واقعية/u);
assert.match(index, /<label for="clothingSelect">1\. الملابس<\/label>/u);
assert.match(index, /<label for="companionSelect">2\. المرافقون<\/label>/u);
assert.doesNotMatch(index, /<label for="lightingSelect">/u);
assert.match(index, /id="autoLighting"/u);
assert.match(index, /data-auto-r="lighting"/u);
assert.match(runtime, /autoLightingOffset/u);
assert.match(runtime, /this\.state\.lightingId = decision\.lightingId/u);
assert.match(runtime, /autoLighting\(/u);
assert.match(runtime, /altLighting\(/u);

const sofaScene = {
  id:"sofa_area",
  visible_features:["sofa","sofa_cushion","sofa_back","sofa_armrest","floor","coffee_table","daylight_access"],
  supported_poses:["sitting_sofa","standing_sofa"]
};
const allSpots = LIGHTING_OPTIONS.find((x) => x.id === "all_spots");
assert.equal(lightingAllowed(allSpots, sofaScene), false, "ceiling spots must not be selected when the scene has no ceiling_spots feature");

const auto = autoLighting({ selectedScene:sofaScene, poseId:"sitting_sofa", companionSet:{ members:[] }, templateMode:"sofa" }, LIGHTING_OPTIONS);
assert.ok(auto, "automatic lighting must resolve");
assert.equal(lightingAllowed(auto, sofaScene), true, "automatic lighting must satisfy scene source requirements");
assert.notEqual(auto.id, "all_spots");
assert.notEqual(auto.id, "ceiling_spots_dim");

const ranked = rankedLighting({ selectedScene:sofaScene, poseId:"sitting_sofa", companionSet:{ members:[] }, templateMode:"sofa" }, LIGHTING_OPTIONS);
assert.ok(ranked.length > 1);
assert.ok(lightingCoherence(ranked[0], { selectedScene:sofaScene, poseId:"sitting_sofa", templateMode:"sofa" }) >= lightingCoherence(ranked[1], { selectedScene:sofaScene, poseId:"sitting_sofa", templateMode:"sofa" }));
const alt = altLighting({ selectedScene:sofaScene, poseId:"sitting_sofa", templateMode:"sofa" }, 1, LIGHTING_OPTIONS);
assert.ok(lightingAllowed(alt, sofaScene));

const lampScene = { visible_features:["bed","lamp","pillow"], supported_poses:["lying_back"] };
const preferred = autoLighting({ selectedScene:lampScene, poseId:"lying_back", templateMode:"night", preferredLightingId:"lamp_only" }, LIGHTING_OPTIONS);
assert.equal(preferred.id, "lamp_only", "night template preferred lighting should remain authoritative when physically supported");

console.log("✓ v3.1 automatic lighting system passed");
