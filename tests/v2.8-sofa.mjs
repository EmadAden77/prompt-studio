import assert from "node:assert/strict";
import fs from "node:fs";

const sofaSource = fs.readFileSync("js/data/sofaTemplatesData.js", "utf8");
const locksSource = fs.readFileSync("js/engines/realismLocks.js", "utf8");
const promptSource = fs.readFileSync("js/engines/promptEngine.js", "utf8");
const runtimeSource = fs.readFileSync("js/bedTemplatesRuntime.js", "utf8");
const indexSource = fs.readFileSync("index.html", "utf8");

assert.match(sofaSource, /SOFA_CATEGORIES/);
assert.match(sofaSource, /SOFA_TEMPLATES/);
assert.match(sofaSource, /id:"sc_classic"/);
assert.match(sofaSource, /id:"cu_pillow"/);
assert.equal((sofaSource.match(/\{ id:"(?:sc|sr|sl|ss|sa|cu)_[a-z0-9_]+"/g) || []).length, 13, "expected 13 sofa templates");
assert.match(locksSource, /SOFA_GROUNDING_LOCK/);
assert.match(locksSource, /3–5cm compression/);
assert.match(locksSource, /Seated eye height ~1\.1–1\.2m/);
assert.match(promptSource, /SOFA_GROUNDING_LOCK/);
assert.match(promptSource, /SOFA TEMPLATE:/);
assert.ok(promptSource.indexOf("this.sofaTemplateText(c)") < promptSource.indexOf("if (c.sofaTemplate) s.push(SOFA_GROUNDING_LOCK)"), "sofa template must precede sofa grounding lock in prompt assembly");
assert.ok(promptSource.indexOf("if (c.sofaTemplate) s.push(SOFA_GROUNDING_LOCK)") < promptSource.indexOf("if (c.pose?.id?.startsWith(\"sitting\")) s.push(GROUNDING.sitting)"), "sofa grounding must precede generic sitting grounding");
assert.match(runtimeSource, /data-template-mode="sofa"/);
assert.match(runtimeSource, /أريكة 🛋️/);
assert.match(runtimeSource, /this\.state\.poseId = "sitting_sofa"/);
assert.match(runtimeSource, /المرجع لا يحتوي أريكة/);
assert.match(runtimeSource, /visible_features\?\.includes\("sofa"\)/);
assert.match(runtimeSource, /severity:"error"/);
assert.match(indexSource, /js\/data\/sofaTemplatesData\.js/);

console.log("v2.8 sofa tests passed");
