export const AUTHORITY_HIERARCHY = Object.freeze([
  { priority: 1, id: "identity", name: "Person Identity (IMAGE A)" },
  { priority: 2, id: "room", name: "Room Reference (IMAGE B or fixed text reference)" },
  { priority: 3, id: "pose", name: "Pose & Body Physics" },
  { priority: 4, id: "placement", name: "Person Position & Support Surface" },
  { priority: 5, id: "camera", name: "Camera Geometry" },
  { priority: 6, id: "expression", name: "Facial Expression" },
  { priority: 7, id: "hair", name: "Hairstyle" },
  { priority: 8, id: "clothing", name: "Clothing" },
  { priority: 9, id: "lighting", name: "Lighting" },
  { priority: 10, id: "processing", name: "Post-processing" },
  { priority: 11, id: "aesthetics", name: "Aesthetics" }
]);

export const TEXT_ROOM_REFERENCE_AUTHORITY = Object.freeze({
  source: "scene.description_en",
  requiresImageB: false,
  controls: [
    "the selected fixed room description, furniture, fixtures, surfaces, materials and realistic clutter"
  ],
  doesNotControl: [
    "IMAGE A identity, anatomy, pose, expression, clothing, camera or lighting physics"
  ]
});

export function resolveRoomAuthority(scene = null) {
  return scene?.text_reference
    ? TEXT_ROOM_REFERENCE_AUTHORITY
    : Object.freeze({ source: "IMAGE B", requiresImageB: true });
}

export function resolveConflict(conflictingRules = []) {
  if (!Array.isArray(conflictingRules) || conflictingRules.length === 0) return null;
  return [...conflictingRules].sort((a, b) => a.priority - b.priority)[0];
}

export function hierarchyAsPromptText() {
  return AUTHORITY_HIERARCHY
    .map(({ priority, name }) => `${priority}. ${name}`)
    .join("\n");
}
