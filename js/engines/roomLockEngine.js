import { SCENES } from "../data/scenesData.js";

export class RoomLockEngine {
  constructor(policies, imageBAuthority) {
    this.policies = policies;
    this.authority = imageBAuthority;
  }

  getPolicy(roomMode) {
    return this.policies[roomMode] ?? this.policies.EDIT;
  }

  getMasterScene() {
    return SCENES[0] ?? null;
  }

  roomLockV32() {
    const scene = this.getMasterScene();
    if (!scene) return "ROOM SPEC: single master reference is unavailable.";
    const spatial = Object.entries(scene.spatial_map ?? {})
      .map(([key, value]) => `- ${key}: ${value}`)
      .join("\n");
    const fingerprint = (scene.fingerprint ?? [])
      .map((item) => `- ${item}`)
      .join("\n");

    return `ROOM SPEC — SINGLE MASTER REFERENCE (${scene.canonical_image_path ?? scene.image_url})
The room is FIXED and identical in every render. IMAGE B is the sole bedroom geometry/material authority.
SPATIAL MAP:
${spatial}
DETAIL FINGERPRINT (never vary):
${fingerprint}
FURNITURE ANCHOR LOCK: furniture keeps EXACTLY this IMAGE B position, orientation, scale, size and design; solve furniture → body → contact → camera; the body occupies the REAL support surface; contact proof occurs at the furniture's locked position; never invent hidden furniture parts; NEVER move, resize, rotate, mirror, redesign or duplicate the sofa, bed or chair.`;
  }

  buildAuthorityText() {
    return `IMAGE B controls only: ${this.authority.controls.join("; ")}.
IMAGE B does not control: ${this.authority.doesNotControl.join("; ")}.
${this.roomLockV32()}
FIXED FURNITURE AUTHORITY: any sofa, bed or chair visible in IMAGE B keeps exactly its recorded position, orientation, scale, size and design. The person adapts to that locked furniture; furniture never adapts to the person.`;
  }

  buildFurnitureAnchorAuthority(surface) {
    if (!["sofa", "bed", "chair"].includes(surface)) return "";
    return `ROOM/FURNITURE AUTHORITY (${surface.toUpperCase()}): use only the verified ${surface} geometry visible in the single master IMAGE B. Do not move, resize, rotate, mirror, redesign, duplicate or invent hidden parts of that furniture. Body contact, compression and shadows must occur at the furniture's actual locked location.`;
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
