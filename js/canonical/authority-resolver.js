export const CANONICAL_AUTHORITY_PRIORITY = Object.freeze([
  Object.freeze({ owner: "hard_constraint", priority: 100 }),
  Object.freeze({ owner: "identity_reference", priority: 90 }),
  Object.freeze({ owner: "explicit_user", priority: 80 }),
  Object.freeze({ owner: "scene_contract", priority: 70 }),
  Object.freeze({ owner: "capture_contract", priority: 60 }),
  Object.freeze({ owner: "camera_contract", priority: 50 }),
  Object.freeze({ owner: "lighting_contract", priority: 40 }),
  Object.freeze({ owner: "realism_resolver", priority: 30 }),
  Object.freeze({ owner: "generator_adapter", priority: 20 }),
  Object.freeze({ owner: "aesthetic_preference", priority: 10 })
]);

const PRIORITY_BY_OWNER = Object.freeze(Object.fromEntries(
  CANONICAL_AUTHORITY_PRIORITY.map(({ owner, priority }) => [owner, priority])
));

function cloneValue(value) {
  if (value === undefined) return undefined;
  if (typeof structuredClone === "function") {
    try { return structuredClone(value); } catch { /* fall through */ }
  }
  return JSON.parse(JSON.stringify(value));
}

function normalizeClaim(claim, index) {
  if (!claim || typeof claim !== "object") return null;
  const field = typeof claim.field === "string" ? claim.field.trim() : "";
  const owner = typeof claim.owner === "string" ? claim.owner.trim() : "";
  if (!field || !(owner in PRIORITY_BY_OWNER)) return null;
  return {
    field,
    owner,
    priority: PRIORITY_BY_OWNER[owner],
    value: cloneValue(claim.value),
    source: typeof claim.source === "string" && claim.source.trim() ? claim.source.trim() : owner,
    resolution: claim.resolution ?? null,
    index
  };
}

function collisionResolution(winner, loser) {
  if (winner.resolution) return winner.resolution;
  if (winner.owner === "hard_constraint") return "hard_constraint";
  return "higher_authority";
}

/**
 * Resolve multiple authority claims into exactly one owner per field.
 * Pure function: it never mutates the claims passed to it.
 */
export function resolveAuthorityClaims(claims = [], options = {}) {
  const normalized = [];
  const invalidClaims = [];

  for (let index = 0; index < claims.length; index += 1) {
    const claim = normalizeClaim(claims[index], index);
    if (claim) normalized.push(claim);
    else invalidClaims.push(cloneValue(claims[index]));
  }

  const grouped = new Map();
  for (const claim of normalized) {
    if (!grouped.has(claim.field)) grouped.set(claim.field, []);
    grouped.get(claim.field).push(claim);
  }

  const owners = {};
  const values = {};
  const conflicts = [];
  const rejectedClaims = [];

  const expectedOwners = options && typeof options.expectedOwners === "object" && options.expectedOwners ? options.expectedOwners : {};

  for (const [field, fieldClaims] of grouped.entries()) {
    const expectedOwner = expectedOwners[field];
    const ordered = [...fieldClaims].sort((a, b) => {
      if (expectedOwner) {
        const aExpected = a.owner === expectedOwner ? 1 : 0;
        const bExpected = b.owner === expectedOwner ? 1 : 0;
        if (aExpected !== bExpected) return bExpected - aExpected;
      }
      const priorityDelta = b.priority - a.priority;
      if (priorityDelta !== 0) return priorityDelta;
      return a.index - b.index;
    });

    const winner = ordered[0];
    owners[field] = winner.owner;
    values[field] = cloneValue(winner.value);

    for (const loser of ordered.slice(1)) {
      rejectedClaims.push({
        field,
        owner: loser.owner,
        source: loser.source,
        value: cloneValue(loser.value)
      });
      conflicts.push({
        property: field,
        winner: winner.owner,
        loser: loser.owner,
        resolution: collisionResolution(winner, loser)
      });
    }
  }

  return {
    owners,
    values,
    conflicts,
    rejected_claims: rejectedClaims,
    invalid_claims: invalidClaims,
    authority_collisions: conflicts.length
  };
}

export function hasSingleAuthorityPerField(result) {
  if (!result || typeof result !== "object" || !result.owners || typeof result.owners !== "object") return false;
  return Object.values(result.owners).every((owner) => typeof owner === "string" && owner in PRIORITY_BY_OWNER);
}

export function authorityPriority(owner) {
  return PRIORITY_BY_OWNER[owner] ?? null;
}

export default resolveAuthorityClaims;
