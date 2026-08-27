const MARKER_START = "CLOTHING CHANGE — USER CONTROLLED / ABSOLUTE";
const MARKER_END = "END CLOTHING CHANGE AUTHORITY";

const CLOTHING = Object.freeze({
  preserve_reference: `PRESERVE REFERENCE CLOTHING
- Preserve the visible clothing from the reference image: garment category, color family, material family, seams, graphics, trims and accessories where actually visible.
- Re-drape the same garments for the new pose. Do not freeze the old folds or paste the source silhouette onto the new body mechanics.`,
  white_tee_jeans: `SELECTED CLOTHING — WHITE COTTON T-SHIRT + DARK JEANS
- Replace the source outfit with a plain white cotton crew-neck T-shirt and simple dark denim jeans.
- Use ordinary cotton jersey thickness, natural collar ribbing, sleeve hems and denim structure. No logos, luxury styling or invented accessories.`,
  black_tee_jeans: `SELECTED CLOTHING — BLACK COTTON T-SHIRT + DARK JEANS
- Replace the source outfit with a plain black cotton crew-neck T-shirt and simple dark denim jeans.
- Preserve realistic cotton knit response, modest fabric thickness, ordinary seams and denim weight. No logos or decorative fashion additions.`,
  heather_tee_jeans: `SELECTED CLOTHING — HEATHER GRAY T-SHIRT + JEANS
- Replace the source outfit with a heather-gray cotton T-shirt and ordinary jeans.
- Heather texture stays camera-resolvable rather than microscopically exaggerated; folds follow gravity and body curvature.`,
  white_shirt_trousers: `SELECTED CLOTHING — SIMPLE WHITE SHIRT + DARK TROUSERS
- Replace the source outfit with a simple white button-up shirt and plain dark trousers.
- Keep realistic woven-cloth thickness, collar/cuff structure, button spacing and gravity-led drape. No tie, jacket or accessories unless explicitly described elsewhere.`,
  black_shirt_trousers: `SELECTED CLOTHING — SIMPLE BLACK SHIRT + DARK TROUSERS
- Replace the source outfit with a simple black button-up shirt and plain dark trousers.
- Keep subdued woven texture, natural seams, ordinary collar behavior and physically plausible folds. No glossy synthetic fabric unless supported by the selected description.`,
  hoodie_joggers: `SELECTED CLOTHING — COTTON HOODIE + JOGGERS
- Replace the source outfit with a plain mid-weight cotton hoodie and simple jogger trousers.
- Hood, cuffs, waistband and drawcord obey gravity/contact; do not inflate the hoodie or make folds symmetrical. No brand graphics.`,
  sleep_tee_shorts: `SELECTED CLOTHING — SLEEP T-SHIRT + HOME SHORTS
- Replace the source outfit with a soft plain cotton sleep T-shirt and simple home shorts.
- Use relaxed domestic fit with believable fabric weight, compression and bunching where the pose contacts bedding or furniture.`,
  tank_shorts: `SELECTED CLOTHING — SIMPLE COTTON TANK + SHORTS
- Replace the source outfit with a plain cotton sleeveless tank top and simple shorts.
- Armholes, neckline, hem and shorts waistband follow real tension and body curvature. Keep the fit ordinary, not body-sculpting.`,
});

let writing = false;
let observer = null;
const $ = (id) => document.getElementById(id);

function stripBlock(text) {
  const start = text.indexOf(MARKER_START);
  if (start < 0) return text;
  const end = text.indexOf(MARKER_END, start);
  if (end < 0) return text.slice(0, start).trimEnd();
  return `${text.slice(0, start)}${text.slice(end + MARKER_END.length)}`.replace(/\n{3,}/g, "\n\n").trim();
}

function selectedInstruction() {
  const select = $("clothingSelect");
  const id = select?.value || "preserve_reference";
  if (id === "custom") {
    const custom = $("customClothingInput")?.value?.trim();
    return custom
      ? `SELECTED CLOTHING — CUSTOM USER DESCRIPTION\n- Replace the source outfit with exactly this user-selected clothing: ${custom}\n- Interpret only the garment description conservatively. Do not add logos, jewelry, layers or accessories that were not requested.`
      : `SELECTED CLOTHING — CUSTOM USER DESCRIPTION MISSING\n- The user selected custom clothing but has not described it yet. Do not invent an outfit.`;
  }
  return CLOTHING[id] || CLOTHING.preserve_reference;
}

function clothingBlock() {
  const id = $("clothingSelect")?.value || "preserve_reference";
  const changing = id !== "preserve_reference";
  return `${MARKER_START}\n${selectedInstruction()}\n\nCLOTHING PHYSICS / IDENTITY SEPARATION\n- Clothing is an editable surface layer only. It MUST NOT alter facial identity, skull/face geometry, apparent age, skin tone, visible body type, shoulder width, torso proportions, limb lengths or musculature.\n- Solve the body and pose first, then drape the selected garments over that body. Fabric follows gravity, suspension points, bending, stretch, compression, friction, overlap, occlusion and contact with skin, bedding, furniture or other real supports.\n- Folds must originate from actual load paths and joints. Do not copy fold patterns from the source outfit onto a different garment or new pose.\n- Preserve camera-resolvable textile structure only. No uniformly sharp fibers, plastic cloth, painted-on seams or impossible wrinkle density.\n- Clothing receives the exact same user-selected lighting, white balance, exposure, HDR, denoise, sharpening and compression as skin and environment. No separate garment relighting.\n${changing ? "- USER CLOTHING OVERRIDE: if an earlier preservation-scope clause says to preserve the reference clothing, this selected clothing choice overrides ONLY those clothing-preservation clauses. Identity and any selected environment preservation remain fully active." : "- Because reference clothing preservation is selected, do not redesign garment categories, colors or visible construction; only re-drape them for the new pose."}\n${MARKER_END}`;
}

function transform(text) {
  let clean = stripBlock(text || "");
  clean = clean.replace("REFERENCE POSE TRANSFORMER v1.5", "REFERENCE POSE TRANSFORMER v1.6");
  const block = clothingBlock();
  const anchor = "\n\nLIGHTING / ILLUMINATION — USER CONTROLLED";
  if (clean.includes(anchor)) return clean.replace(anchor, `\n\n${block}${anchor}`);
  return `${clean}\n\n${block}`.trim();
}

function apply() {
  const output = $("posePromptOutput");
  if (!output || writing) return;
  const next = transform(output.textContent || "");
  if (next === output.textContent) return;
  writing = true;
  output.textContent = next;
  const count = next.trim().split(/\s+/).filter(Boolean).length;
  const wc = $("posePromptWordCount");
  if (wc) wc.textContent = `${count} كلمة`;
  queueMicrotask(() => { writing = false; });
}

function updateCustomVisibility() {
  const field = $("customClothingField");
  if (field) field.hidden = $("clothingSelect")?.value !== "custom";
}

async function copyWithClothing(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  apply();
  const text = $("posePromptOutput")?.textContent || "";
  try {
    await navigator.clipboard.writeText(text);
    const status = $("posePromptStatus");
    if (status) status.textContent = "تم نسخ الـPrompt مع الملابس التي اخترتها وقفل سيلفي Xiaomi 15 Ultra الأمامي.";
  } catch {
    const status = $("posePromptStatus");
    if (status) status.textContent = "تعذر النسخ التلقائي. حدّد النص وانسخه يدويًا.";
  }
}

function install() {
  const select = $("clothingSelect");
  const custom = $("customClothingInput");
  const output = $("posePromptOutput");
  if (!select || !output) return;

  select.addEventListener("change", () => {
    updateCustomVisibility();
    apply();
  });
  custom?.addEventListener("input", apply);
  $("buildPosePromptBtn")?.addEventListener("click", () => queueMicrotask(apply));
  $("resetPoseTransformerBtn")?.addEventListener("click", () => {
    queueMicrotask(() => {
      select.value = "preserve_reference";
      if (custom) custom.value = "";
      updateCustomVisibility();
      apply();
    });
  });
  $("copyPosePromptBtn")?.addEventListener("click", copyWithClothing, true);

  observer = new MutationObserver(() => queueMicrotask(apply));
  observer.observe(output, { childList:true, characterData:true, subtree:true });
  updateCustomVisibility();
  apply();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once:true });
else install();
