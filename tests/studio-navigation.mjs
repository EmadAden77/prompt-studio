import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const html = readFileSync(resolve(root, "index.html"), "utf8");
const app = readFileSync(resolve(root, "js/physics-app-v7.js"), "utf8");
assert.match(html, /id="studio-hub"/u);
assert.match(html, /id="studio-workspace" hidden/u);
assert.match(html, /id="back-to-sections"/u);
assert.match(html, /id="result-panel"[^>]*hidden/u);
assert.match(app, /function openStudioSection/u);
assert.match(app, /function closeStudioSection/u);
assert.match(app, /renderStudioSectionCards/u);
assert.match(app, /studioHub\.hidden = true/u);
assert.match(app, /studioWorkspace\.hidden = true/u);
console.log("studio navigation tests passed");
