export class PoseEngine {
  constructor(poses = []) {
    this.poses = [...poses];
    this.trueLateralEnabled = true;
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
    if (!pose) return "Keep anatomy, support, gravity, and pressure physically possible.";
    return [
      pose.physics,
      `Contact points: ${(pose.contact_points ?? []).join(", ")}.`,
      `Support surfaces: ${(pose.surfaces ?? []).join(", ")}.`,
      pose.selfie_notes ? `Selfie geometry: ${pose.selfie_notes}` : ""
    ].filter(Boolean).join("\n");
  }

  isSideLying(poseId) {
    return poseId === "lying_right_side" || poseId === "lying_left_side";
  }

  setTrueLateral(enabled) {
    this.trueLateralEnabled = Boolean(enabled);
  }

  engineer({ pose, expression, hair, clothing, autoEngineering = null } = {}) {
    if (!pose) return null;

    const sections = {
      subject: this.buildSubjectLock(pose),
      posePhysics: this.buildPosePhysics(pose, autoEngineering),
      armStrategy: this.buildArmStrategy(pose, autoEngineering),
      expression: this.buildExpressionLock(expression),
      hair: this.buildHairLock(hair),
      clothing: this.buildClothingLock(clothing)
    };

    if (this.trueLateralEnabled && this.isSideLying(pose.id)) {
      sections.trueLateral = this.buildTrueLateralEnforcement(pose);
    }

    return sections;
  }

  buildSubjectLock(pose) {
    return `[Absolute Identity Lock: use IMAGE A. 100% reference fidelity. NO modification to facial geometry. Same real person photographed again, not a look-alike.]\n\nSUBJECT: The exact man from IMAGE A, identity locked, performing the pose “${pose.name_en}” on the bed represented by IMAGE B. IMAGE A contributes identity only, never pose, expression, clothing, lighting, background, or camera viewpoint.`;
  }

  buildPosePhysics(pose, autoEngineering = null) {
    return `POSE & PHYSICS\n${this.buildPhysicsText(pose)}\n${autoEngineering?.physicsFine ?? ""}\nBody placement must be solved before camera placement. Preserve natural spinal alignment, gravity, local pressure, mattress/pillow deformation, fabric displacement, and contact shadows. No body part may intersect the torso, mattress, pillow, headboard, or nearby furniture.`.trim();
  }

  buildArmStrategy(pose, autoEngineering = null) {
    const deterministic = autoEngineering?.armFine
      ?? pose.selfie_notes
      ?? "Keep the holding shoulder, elbow, wrist, and hand within natural reach.";

    const rearRule = autoEngineering?.cameraType === "rear"
      ? "Rear-camera capture is not a front-camera selfie. Do not extend an arm toward the lens; both arms must remain naturally supported unless a mirror-selfie grip is explicitly mapped."
      : "For a true front-camera selfie, derive the phone position from the mapped shoulder, elbow, wrist, and hand only after the body is anchored to its support surfaces.";

    return `ARM STRATEGY\n${deterministic}\n${rearRule}\nUniversal arm rules: no overlong arm, no extra shoulder, no duplicated hand, no wrist from an impossible direction, no hand arriving from the wrong side of the subject's body, and no limb penetrating the torso. If showing the phone, hand, or forearm would force anatomical distortion, keep the phone, hand, and most of that forearm outside frame while preserving a physically logical shoulder and elbow path.`;
  }

  buildExpressionLock(expression) {
    const selected = expression?.prompt ?? "Use a neutral, naturally relaxed facial-muscle state.";
    return `EXPRESSION LOCK\nThe selected expression overrides the expression visible in IMAGE A.\n${selected}\nIMAGE A remains authoritative for identity geometry only. Facial muscles may change state, but skull shape, facial proportions, eye spacing, nose, lips, jaw, chin, ears, apparent age, and natural asymmetry must not change. This is a muscle-state override, never a facial-geometry rewrite.`;
  }

  buildHairLock(hair) {
    const selected = hair?.prompt ?? "Keep the reference hairstyle arrangement as closely as pose physics allows.";
    return `HAIR LOCK\n${selected}\nHair changes arrangement only within the original length, density, wave pattern, and hairline defined by IMAGE A. Where hair touches the pillow, flatten and spread only the contact side according to pressure and friction; the free side follows gravity naturally. Never invent new length, density, hairline, or a different haircut.`;
  }

  buildClothingLock(clothing) {
    const selected = clothing?.prompt ?? "Use the selected modest home clothing.";
    return `CLOTHING LOCK\n${selected}\nThe selected clothing overrides every garment visible in IMAGE A. Never copy IMAGE A's shirt, collar, sleeves, fabric, or colors merely because they appear in the identity reference. Adapt only fold geometry, drape, pressure, and friction to the pose. Fabric follows gravity and body contact, with irregular load-driven folds and no repeated synthetic texture stamps.`;
  }

  buildTrueLateralEnforcement(pose) {
    const downSide = pose.id === "lying_right_side" ? "RIGHT" : "LEFT";
    const upperSide = downSide === "RIGHT" ? "LEFT" : "RIGHT";

    return `TRUE LATERAL ENFORCEMENT — NON-NEGOTIABLE\nThis must be a genuine full side-lying posture, not a semi-reclined, three-quarter, or face-up hybrid.\n\nBody alignment:\n- He lies fully on his ${downSide} side. His ${downSide} shoulder is the loaded lower shoulder beneath the upper shoulder; the shoulder line is stacked rather than flattened onto the back.\n- His torso is rotated onto the ${downSide} side and reads clearly as a side view through ribcage, waist, and pelvis alignment.\n- His ${downSide} ear/cheek presses into the pillow while the ${upperSide} ear remains the free visible ear when the camera geometry allows it.\n- Compress the pillow approximately 4–6 cm under the head where the real pillow compliance permits; do not sink the skull unrealistically.\n- Flatten ${downSide}-side hair only at the pillow contact zone; ${upperSide}-side hair remains freer and follows gravity.\n- Create local mattress compression beneath the ${downSide} shoulder, ribcage, and hip, with contact shadows where the body meets bedding.\n- The ${downSide} leg may remain extended or slightly bent; the ${upperSide} leg may bend naturally above it without impossible hip rotation or fused knees.\n\nArm enforcement:\n- The UPPER ${upperSide} hand is the ONLY selfie hand for this side-lying pose. Its elbow remains supported on the mattress in front of the chest within normal shoulder reach.\n- The LOWER ${downSide} arm rests forward on the mattress near the torso or partly beneath the pillow. It must NEVER cross through, merge into, disappear inside, or penetrate the ribcage.\n- No overlong arm, extra shoulder, duplicated hand, impossible wrist direction, or hand entering from the wrong side of the body.\n\nHandedness and side-reference rule:\n- Never switch the selfie hand without switching the entire body-side pose definition.\n- All LEFT/RIGHT descriptions refer to the SUBJECT'S own body, never the left/right side of the rendered image or camera view.`;
  }
}
