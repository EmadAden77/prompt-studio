export class PoseEngine {
  constructor(poses = []) {
    this.poses = [...poses];
  }

  getById(poseId) {
    return this.poses.find((pose) => pose.id === poseId) ?? this.poses[0] ?? null;
  }

  getDirections(poseId) {
    return this.getById(poseId)?.valid_directions ?? [];
  }

  getAngles(poseId) {
    return this.getById(poseId)?.valid_angles ?? [];
  }

  getDistances(poseId) {
    return this.getById(poseId)?.valid_distances ?? [];
  }

  normalizeSelection(state) {
    const pose = this.getById(state.poseId);
    if (!pose) return { ...state };

    return {
      ...state,
      bodyDirection: pose.valid_directions.includes(state.bodyDirection)
        ? state.bodyDirection
        : pose.preferred_direction,
      cameraAngle: pose.valid_angles.includes(state.cameraAngle)
        ? state.cameraAngle
        : pose.valid_angles[0],
      cameraDistance: pose.valid_distances.includes(state.cameraDistance)
        ? state.cameraDistance
        : pose.valid_distances[0]
    };
  }

  buildPhysicsText(pose) {
    return [
      pose.physics,
      `Contact points: ${pose.contact_points.join(", ")}.`,
      `Support surfaces: ${pose.surfaces.join(", ")}.`,
      pose.selfie_notes ? `Selfie geometry: ${pose.selfie_notes}` : ""
    ].filter(Boolean).join("\n");
  }
}
