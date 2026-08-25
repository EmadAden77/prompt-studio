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
IMAGE B does not control: ${this.authority.doesNotControl.join("; ")}.`;
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
