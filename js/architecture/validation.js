export const VALIDATION_CATEGORIES = Object.freeze([
  "identity-conflict",
  "anatomy-conflict",
  "hand-limb-conflict",
  "topology-conflict",
  "contact-support-conflict",
  "camera-feasibility-conflict",
  "lighting-conflict",
  "material-conflict",
  "mirror-reflection-conflict",
  "imperfection-excess",
  "word-budget-risk"
]);

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const item of Object.values(value)) deepFreeze(item);
  return value;
}

export function createValidationIssue({ category, code, message = "", severity = "info", path = null, meta = null }) {
  if (!VALIDATION_CATEGORIES.includes(category)) {
    throw new TypeError(`Unknown validation category: ${category}`);
  }
  if (!code || typeof code !== "string") throw new TypeError("Validation issue code is required");
  return deepFreeze({ category, code, message, severity, path, meta });
}

export function validateSceneState(_state, checks = []) {
  const issues = [];
  for (const check of checks) {
    if (typeof check !== "function") throw new TypeError("Validation checks must be functions");
    const result = check(_state);
    if (!result) continue;
    const items = Array.isArray(result) ? result : [result];
    for (const issue of items) {
      issues.push(createValidationIssue(issue));
    }
  }
  return deepFreeze({ valid: issues.length === 0, issues });
}

export const FUTURE_IMPERFECTION_POLICY =
  "small context-dependent imperfection budget, normally 1–3 physically justified artifacts";
