export class RoomLockEngine {
  constructor(policies, imageBAuthority) {
    this.policies = policies;
    this.authority = imageBAuthority;
  }

  getPolicy(roomMode) {
    return this.policies[roomMode] ?? this.policies.EDIT;
  }

  buildAuthorityText() {
    return `IMAGE B controls only: ${this.authority.controls.join("; ")}.
IMAGE B does not control: ${this.authority.doesNotControl.join("; ")}.
FIXED FURNITURE AUTHORITY: any sofa, bed or chair visible in IMAGE B keeps exactly its recorded position, orientation, scale, size and design. The person adapts to that locked furniture; furniture never adapts to the person.`;
  }

  buildFurnitureAnchorAuthority(surface) {
    if (!["sofa", "bed", "chair"].includes(surface)) return "";
    return `ROOM/FURNITURE AUTHORITY (${surface.toUpperCase()}): use only the verified ${surface} geometry visible in IMAGE B. Do not move, resize, rotate, mirror, redesign, duplicate or invent hidden parts of that furniture. Body contact, compression and shadows must occur at the furniture's actual locked location.`;
  }

  buildLockText(roomMode) {
    const policy = this.getPolicy(roomMode);
    return `${policy.name}: ${policy.principle}

Allowed:
${policy.allowed.map((item) => `- ${item}`).join("\n")}

Forbidden:
${policy.forbidden.map((item) => `- ${item}`).join("\n")}`;
  }
}
