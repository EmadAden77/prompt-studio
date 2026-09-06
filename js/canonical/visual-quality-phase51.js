const text = (v) => String(v ?? "").trim();

function criterion(id, label, expected, { required = true, severity = "high", source = "canonical" } = {}) {
  return Object.freeze({ id, label, expected:text(expected), required, severity, source });
}

function manifestExpected(output, key) {
  return text(output?.phase50?.selectionManifest?.[key]?.resolved || output?.phase50?.selectionManifest?.[key]?.requested);
}

export function buildVisualQualityContract(raw = {}, output = {}) {
  const section = text(output?.section?.id || raw?.studioSection || "solo");
  const criteria = [];

  criteria.push(criterion("identity", "Reference identity preserved", "Face, age impression, skin tone, hairline, beard/moustache pattern, eyewear, and natural asymmetry remain faithful to the supplied reference.", { severity:"critical" }));
  criteria.push(criterion("selfie_geometry", "Selfie capture remains physically plausible", "One coherent phone-held selfie event with reachable arm geometry, believable perspective, and no impossible limb ownership.", { severity:"critical" }));
  criteria.push(criterion("body_scale", "Body scale and proportions remain plausible", "Tall 195 cm, 88 kg lean-athletic adult proportions remain consistent with nearby objects and scene scale.", { severity:"high" }));

  const clothing = manifestExpected(output, "clothing");
  if (clothing) criteria.push(criterion("clothing", "Selected clothing is visually matched", clothing, { severity:"critical", source:"user-authority" }));
  const expression = manifestExpected(output, "expression");
  if (expression) criteria.push(criterion("expression", "Selected expression is visually matched", expression, { severity:"high", source:"user-authority" }));
  const pose = manifestExpected(output, "pose");
  if (pose) criteria.push(criterion("pose", "Selected pose is visually matched", pose, { severity:"high", source:"user-authority" }));
  const location = manifestExpected(output, "location");
  if (location) criteria.push(criterion("location", "Selected location is visually matched", location, { severity:"high", source:"user-authority" }));
  const time = manifestExpected(output, "time");
  if (time) criteria.push(criterion("time", "Selected time of day is visually matched", time, { severity:"critical", source:"user-authority" }));

  if (text(raw?.time).toLowerCase() === "night") {
    criteria.push(criterion("night_lighting", "Night lighting follows visible-source physics", "A named visible source explains face and scene illumination, with matching color cast, realistic shadow integrity, low-light texture, and nighttime exposure that never looks like daylight.", { severity:"critical", source:"phase49" }));
  }

  if (["carExterior","car"].includes(section)) {
    criteria.push(criterion("vehicle", "Range Rover identity and geometry are correct", "2017 Range Rover Sport Autobiography Dynamic L494 details, proportions, glass, wheel/door geometry, and visible cabin cues remain coherent with the selected view.", { severity:"critical" }));
  }

  if (section === "carExterior") {
    criteria.push(criterion("background_context", "Exterior background remains context-appropriate", "Background vehicles and people remain secondary, naturally spaced, and consistent with the selected location and time; no crowd gathers around the selfie.", { severity:"medium", source:"phase48" }));
  } else if (section === "gym") {
    criteria.push(criterion("background_people", "Gym people behave independently", "Any background people remain distributed across equipment and continue their own activity without posing for or staring at the selfie camera.", { severity:"medium", source:"phase48" }));
  } else if (["bedroom","mirror"].includes(section)) {
    criteria.push(criterion("privacy", "Private-room privacy is preserved", "Only the subject and ordinary lived-in room details are present; no unrelated people or vehicles are introduced.", { severity:"critical", source:"phase48" }));
  } else {
    criteria.push(criterion("background_context", "Background life remains context-appropriate", "Background activity is plausible for the selected scene, remains secondary, and does not create staged reactions toward the selfie camera.", { severity:"medium", source:"phase48" }));
  }

  criteria.push(criterion("anatomy", "Hands, limbs, contact, and occlusion are coherent", "Hands have plausible finger structure, limbs belong to the correct person, physical contacts carry believable weight, and occlusion follows scene geometry.", { severity:"critical" }));

  return Object.freeze({
    version:"phase51-v1",
    section,
    criteria:Object.freeze(criteria),
    scoring:Object.freeze({ pass:1, fail:0, unknown:null }),
    policy:"Evaluate visual adherence and physical plausibility only; do not score or optimize for AI-detector evasion."
  });
}

const REPAIR_HINTS = Object.freeze({
  identity:"Restore the supplied reference identity without beautification or facial reshaping.",
  selfie_geometry:"Correct the phone-held selfie geometry and limb ownership while preserving the selected composition.",
  body_scale:"Restore believable 195 cm / 88 kg proportions relative to scene objects.",
  clothing:"Replace the visible outfit with the exact selected clothing while preserving pose, identity, lighting, and scene.",
  expression:"Correct only the facial expression to the selected expression while preserving identity.",
  pose:"Correct the body pose to the selected pose with believable weight transfer and contact.",
  location:"Restore the selected location context without changing the subject or vehicle.",
  time:"Restore the selected time-of-day appearance and exposure.",
  night_lighting:"Restore named-source night lighting, matching color cast, shadow integrity, low-light texture, and unmistakable darkness.",
  vehicle:"Correct the Range Rover model details, geometry, glass, wheels, and visible cabin cues without altering the subject.",
  background_context:"Simplify and correct background activity so it remains plausible, secondary, and context-appropriate.",
  background_people:"Keep gym background people naturally occupied with equipment and not reacting to the selfie.",
  privacy:"Remove unrelated people or vehicles and restore private-room continuity.",
  anatomy:"Repair hands, fingers, limb ownership, contact, and occlusion while preserving identity and selected pose."
});

export function evaluateVisualQuality(contract, observations = {}) {
  const results = contract.criteria.map((item) => {
    const raw = observations?.[item.id];
    const status = raw === true ? "pass" : raw === false ? "fail" : "unknown";
    return Object.freeze({ ...item, status, repairHint:status === "fail" ? (REPAIR_HINTS[item.id] || "Correct this visual mismatch while preserving all passing constraints.") : "" });
  });
  const observed = results.filter(r => r.status !== "unknown");
  const failed = results.filter(r => r.status === "fail");
  const requiredUnknown = results.filter(r => r.required && r.status === "unknown");
  const score = observed.length ? Math.round((observed.filter(r=>r.status === "pass").length / observed.length) * 100) : null;
  const status = failed.some(r=>r.required) ? "fail" : requiredUnknown.length ? "pending" : "pass";
  return Object.freeze({
    status,
    score,
    observed:observed.length,
    total:results.length,
    failures:Object.freeze(failed),
    results:Object.freeze(results)
  });
}

export default buildVisualQualityContract;
