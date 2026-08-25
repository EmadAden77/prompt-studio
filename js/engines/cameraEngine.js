export class CameraEngine {
  constructor(cameraSpecs, lenses, armStrategies) {
    this.cameraSpecs = cameraSpecs;
    this.lenses = [...lenses];
    this.armStrategies = armStrategies;
  }

  getCamera(cameraType) {
    return this.cameraSpecs[cameraType] ?? this.cameraSpecs.front;
  }

  getLens(lensType) {
    return this.lenses.find((lens) => lens.id === lensType) ?? this.lenses[0];
  }

  getLensesForCamera(cameraType) {
    return this.lenses.filter((lens) => lens.camera === cameraType);
  }

  normalizeLens(cameraType, lensType) {
    const available = this.getLensesForCamera(cameraType);
    return available.some((lens) => lens.id === lensType) ? lensType : available[0]?.id;
  }

  getArmRule(pose, cameraType) {
    if (cameraType === "rear") return this.armStrategies.rear_camera;
    return this.armStrategies[pose.arm_strategy] ?? this.armStrategies.standing;
  }

  buildPrompt({ camera, lens, pose, cameraAngle, cameraDistance }) {
    const captureLabel = camera.selfie
      ? "This is a real handheld front-camera selfie."
      : "This is not a selfie; another person or a stable tripod operates the rear camera.";

    return `${captureLabel}
- Camera: ${camera.name_en}.
- Lens: ${lens.name_en}, ${lens.focal_length}.
- Aperture behavior: ${camera.aperture}.
- Camera position: ${cameraAngle.replaceAll("_", " ")}; framing distance: ${cameraDistance}.
- Subject distance: ${camera.distance}.
- Perspective: ${camera.distortion}.
- Depth of field: ${camera.dof}.
- Arm geometry: ${this.getArmRule(pose, camera.type)}`;
  }
}
