export class RoomLockEngine {
  constructor(policies, imageBAuthority) {
    this.policies = policies;
    this.authority = imageBAuthority;
  }

  isTextReference(scene = null) {
    return Boolean(scene?.text_reference && scene?.description_en);
  }

  getPolicy(roomMode, scene = null) {
    if (this.isTextReference(scene)) return this.policies.TEXT_REFERENCE;
    return this.policies[roomMode] ?? this.policies.EDIT;
  }

  buildAuthorityText(scene = null) {
    if (this.isTextReference(scene)) {
      return `TEXT ROOM REFERENCE controls only: the fixed [ROOM DESCRIPTION] from scene.description_en, including its furniture, fixtures, materials, surfaces and realistic daily clutter.
IMAGE B is intentionally absent and is not required. IMAGE A continues to control the person identity only.
FIXED FURNITURE AUTHORITY: the furniture described in [ROOM DESCRIPTION] keeps its stated material, design, location and scale; the person adapts to that fixed room description.`;
    }
    return `IMAGE B controls only: ${this.authority.controls.join("; ")}.
IMAGE B does not control: ${this.authority.doesNotControl.join("; ")}.
FIXED FURNITURE AUTHORITY: any sofa, bed or chair visible in IMAGE B keeps exactly its recorded position, orientation, scale, size and design. The person adapts to that locked furniture; furniture never adapts to the person.`;
  }

  buildFurnitureAnchorAuthority(surface, scene = null) {
    if (!["sofa", "bed", "chair"].includes(surface)) return "";
    if (this.isTextReference(scene)) {
      return `ROOM/FURNITURE AUTHORITY (${surface.toUpperCase()}): use the matching fixed support geometry described in [ROOM DESCRIPTION]. IMAGE B is intentionally absent. Do not add, remove, resize, rotate, mirror, redesign or duplicate that support furniture; body contact, compression and shadows must remain physically consistent with the permanent text room.`;
    }
    return `ROOM/FURNITURE AUTHORITY (${surface.toUpperCase()}): use only the verified ${surface} geometry visible in IMAGE B. Do not move, resize, rotate, mirror, redesign, duplicate or invent hidden parts of that furniture. Body contact, compression and shadows must occur at the furniture's actual locked location.`;
  }

  buildLockText(roomMode, scene = null) {
    const policy = this.getPolicy(roomMode, scene);
    return `${policy.name}: ${policy.principle}

Allowed:
${policy.allowed.map((item) => `- ${item}`).join("\n")}

Forbidden:
${policy.forbidden.map((item) => `- ${item}`).join("\n")}`;
  }
}
