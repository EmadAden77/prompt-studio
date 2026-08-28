import { FURNITURE_ANCHOR, SOFA_SPATIAL_MAP, CHAIR_SPATIAL_MAP } from "./realismLocks.js";

const STANDING_GROUNDING = `STANDING GROUNDING — FULL WEIGHT ON THE FLOOR
1) FOOT CONTACT: both feet flat (or one slightly forward), soles fully meeting the floor; contact shadow hugs the sole line; on reflective floors a faint correct reflection appears.
2) NATURAL STANCE: weight shifted slightly to one leg (contrapposto): pelvis mildly tilted, shoulders relaxed and uneven, one knee softly unlocked — no symmetrical mannequin pose.
3) CLOTHING GRAVITY: garments hang vertically from shoulders and waist with natural drape folds; hems fall straight; no floating fabric indoors.
4) HAND CONTACT (optional): if a hand rests on bed edge, sofa armrest or wardrobe door, fingers spread naturally with slight skin pressure and no interpenetration; the surface does not deform under a light hand contact.
5) CAST SHADOW: the body casts a floor shadow consistent with the selected light source direction and height; shadow length matches light angle.
6) CAMERA CONSISTENCY: arm's-length selfie at ~1.5 m eye height; vertical room lines stay nearly vertical with only mild wide-angle convergence at frame edges; upper-body framing with the room readable behind.
7) FORBIDDEN: floating feet, missing foot contact shadow, hovering heels, perfectly mirrored stance, room lines bending without lens reason.

ANTI-MANNEQUIN TRIAD: contact shadows + real weight support + gravity-driven clothing folds + natural left/right asymmetry must all agree in one body solution.`;

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

  familyOf(poseOrId) {
    const poseId = typeof poseOrId === "string" ? poseOrId : poseOrId?.id;
    if (!poseId) return "other";
    if (poseId.startsWith("sitting")) return "sitting";
    if (poseId.startsWith("standing")) return "standing";
    if (poseId.startsWith("lying")) return "lying";
    return "other";
  }

  supportSurfaceOf(pose) {
    if (!pose) return null;
    const surfaces = pose.surfaces ?? [];
    if (pose.placement === "sofa" || surfaces.some((surface) => surface.startsWith("sofa"))) return "sofa";
    if (pose.placement === "chair" || surfaces.some((surface) => surface.startsWith("chair"))) return "chair";
    if (pose.placement === "bed" || surfaces.some((surface) => ["bed", "mattress", "mattress_edge", "pillow", "headboard"].includes(surface))) return "bed";
    return surfaces.find((surface) => ["sofa", "bed", "chair"].includes(surface)) ?? null;
  }

  buildFurnitureAnchor(pose) {
    const surface = this.supportSurfaceOf(pose);
    if (!surface) return "";
    const map = surface === "sofa" ? SOFA_SPATIAL_MAP : surface === "chair" ? CHAIR_SPATIAL_MAP : "BED SPATIAL MAP: use the locked mattress, headboard/pillow zone and subject-relative lamp/vanity sides already defined for IMAGE B.";
    return `FURNITURE ANCHOR\n${FURNITURE_ANCHOR.lock}\n${FURNITURE_ANCHOR[surface]}\n${map}`;
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
      furnitureAnchor: this.buildFurnitureAnchor(pose),
      posePhysics: this.buildPosePhysics(pose, autoEngineering),
      armStrategy: this.buildArmStrategy(pose, autoEngineering),
      expression: this.buildExpressionLock(expression),
      hair: this.buildHairLock(hair),
      clothing: this.buildClothingLock(clothing),
      familyNegative: this.getFamilyNegativePrompt(pose)
    };

    const grounding = this._buildFamilyGrounding(pose);
    if (grounding) {
      sections.grounding = grounding;
      sections.posePhysics = `${sections.posePhysics}\n\n${grounding}`;
    }

    if (this.trueLateralEnabled && this.isSideLying(pose.id)) {
      sections.trueLateral = this.buildTrueLateralEnforcement(pose);
    }

    return sections;
  }

  buildSubjectLock(pose) {
    let placementText = "inside the same room represented by IMAGE B";
    if (pose.id.startsWith("lying") || pose.id === "semi_reclining") {
      placementText = "on the bed represented by IMAGE B";
    } else if (pose.id === "sitting_bed_edge") {
      placementText = "on the real mattress edge represented by IMAGE B";
    } else if (pose.id === "standing_bedside") {
      placementText = "on the floor beside the real bed represented by IMAGE B";
    } else if (pose.placement === "sofa") {
      placementText = pose.id.startsWith("sitting")
        ? "on the real sofa represented by IMAGE B"
        : "on the floor in the real sofa zone represented by IMAGE B";
    } else if (pose.placement === "chair") {
      placementText = "on the real chair represented by IMAGE B";
    } else if (pose.placement === "floor" || pose.placement === "center") {
      placementText = "on the real room floor represented by IMAGE B";
    } else if (pose.placement === "vanity") {
      placementText = "in the real vanity zone represented by IMAGE B";
    } else if (pose.placement === "wardrobe") {
      placementText = "in the real wardrobe zone represented by IMAGE B";
    }

    return `[Absolute Identity Lock: use IMAGE A. 100% reference fidelity. NO modification to facial geometry. Same real person photographed again, not a look-alike.]\n\nSUBJECT: The exact man from IMAGE A, identity locked, performing the pose “${pose.name_en}” ${placementText}. IMAGE A contributes identity only, never pose, expression, clothing, lighting, background, or camera viewpoint.`;
  }

  buildPosePhysics(pose, autoEngineering = null) {
    const family = this.familyOf(pose);
    const universal = family === "sitting" || family === "standing"
      ? "Body placement must be solved before camera placement. Preserve natural spinal alignment, gravity, real support/load response, fabric displacement, contact shadows, and natural asymmetry. No body part may intersect the torso, floor, seat, armrest, backrest, or nearby furniture."
      : "Body placement must be solved before camera placement. Preserve natural spinal alignment, gravity, local pressure, mattress/pillow deformation, fabric displacement, and contact shadows. No body part may intersect the torso, mattress, pillow, headboard, or nearby furniture.";
    return `POSE & PHYSICS\n${this.buildPhysicsText(pose)}\n${autoEngineering?.physicsFine ?? ""}\n${universal}`.trim();
  }

  _buildFamilyGrounding(pose) {
    const family = this.familyOf(pose);
    if (family === "lying") return this._buildGroundingSection(pose);
    if (family === "sitting") return this._buildSittingGrounding(pose);
    if (family === "standing") return STANDING_GROUNDING;
    return null;
  }

  _buildGroundingSection(pose) {
    const side = pose.id === "lying_right_side" ? "right" :
      pose.id === "lying_left_side" ? "left" : null;

    return `LYING GROUNDING (mandatory):
HIGHEST PRIORITY FOR THIS RENDER — OVERRIDES COMPOSITION.
- The subject is LYING on the mattress, never sitting, leaning, or upright in front of the bed.
- Body plane lies ON the mattress, torso foreshortened away from the camera; upright torso with bed as backdrop is FORBIDDEN.
- Head sinks 4–6 cm into the pillow; pillow fabric bulges and wrinkles around the ${side ? side + " side of the" : ""} head; soft contact shadow between head and pillow.
- Shoulders/back/hips depress the mattress; sheets and blanket conform to the body with load-driven wrinkles radiating from contact lines.
- Soft occlusion shadows at every support point; no floating gap under the body.
- Gravity: hair falls toward the bedding; support-side cheek and jaw show slight compression; clothing folds fall toward the bed surface; blanket drapes over the lower body.
- Camera above the lying face: pillow/headboard surround the head, bed surface extends along the torso; the bed SURROUNDS the body, never stands behind an upright torso. Wall, AC, or room may appear only at the extreme top edge and remain heavily foreshortened.
- FORBIDDEN: upright torso with bed as backdrop; head hovering in front of an untouched pillow; missing compression; missing contact shadows; floating body; sitting-on-edge look; third-person room viewpoint.

FINAL GROUNDING CHECK (must pass before output):
- Head sinks into a deformed pillow ✔
- Body plane parallel to mattress, torso foreshortened ✔
- Contact shadows at every support point ✔
- Bed surrounds the body in the background ✔
If any fails → re-render from scratch.`;
  }

  _buildSittingGrounding(pose) {
    const supportRule = pose.id === "sitting_sofa"
      ? "SOFA LOAD: weight on sit bones and upper thighs; the soft sofa cushion visibly compresses about 3–5 cm and bulges slightly beside the hips."
      : pose.id === "sitting_chair"
        ? "CHAIR LOAD: weight stays fully inside the hard chair-seat boundary; show a clear seat contact shadow and only slight garment/seat indentation where physically possible."
        : pose.id === "sitting_floor"
          ? "FLOOR LOAD: pelvis and selected leg surfaces directly load the rigid floor. The floor itself does not compress; grounding is proven by continuous contact shadows and believable body-pressure flattening in clothing/soft tissue."
          : "BED-EDGE LOAD: pelvis and upper thighs load the real mattress edge with local downward compression and radiating bedding tension.";
    const legRule = pose.id === "sitting_floor"
      ? "LEG LOGIC: crossed, folded, or gently extended legs must remain anatomically plausible and visibly supported by the floor; no floating knee, ankle, heel, or lower leg."
      : "LEG LOGIC: knees bend naturally near 90° where anatomy and furniture height allow; feet are physically supported on the floor when visible, each with its own contact shadow; no dangling unsupported legs.";
    const framingRule = pose.id === "sitting_floor"
      ? "CAMERA CONSISTENCY: camera is at the subject's actual seated eye height, lower than chair/sofa eye height; frame head, torso, pelvis support, and enough floor/legs to prove the seated geometry."
      : "CAMERA CONSISTENCY: seat surface plus armrest or backrest remains visible around the lower torso; background is seen from seated eye height, about 1.1–1.2 m for a normal chair/sofa, never from standing height.";

    return `SITTING GROUNDING — THE BODY MUST PHYSICALLY LOAD THE SUPPORT
1) ${supportRule}
2) ${legRule}
3) BACK CONTACT: leaning back → the real backrest/cushion compresses or carries a broad contact shadow behind the shoulder blades; leaning forward → forearms/elbows may rest on knees with visible pressure folds. Floor sitting uses only physically present support.
4) CONTACT SHADOWS: under thighs and pelvis on the seat/support, under feet or supporting lower legs on the floor, and under forearms on real armrests/knees — no floating gap and no bright line under the body.
5) GRAVITY FOLDS: shirt gathers naturally at the waist/lower belly when seated; trousers show tension at bent knees and relax at hips; folds must follow gravity and pressure rather than decorative symmetry.
6) POSTURE: natural slight slouch or lean; shoulders relaxed and mildly asymmetric — no mannequin stiffness.
7) ${framingRule}
8) FORBIDDEN: floating above the support, uncompressed soft sofa cushion, feet/lower legs without support, rigid symmetrical posture, or a crop that hides the only visual evidence of sitting geometry.

ANTI-MANNEQUIN TRIAD: contact shadows + real support/compression + gravity-driven folds + natural asymmetry must all agree in one body solution.`;
  }

  _buildFamilyCameraArm(pose) {
    const family = this.familyOf(pose);
    if (family === "sitting") {
      const height = pose.id === "sitting_floor"
        ? "the subject's true floor-seated eye height (lower than chair/sofa height)"
        : "seated eye height around 1.1–1.2 m";
      return `SITTING SELFIE CAMERA & ARM — FAMILY OVERRIDE
- Front-camera distance: 50–70 cm from the face.
- Camera height/angle: eye level from ${height}; never a standing-height observer view.
- Framing: head + torso + enough seat/support geometry to prove sitting. For sofa/chair, keep part of the seat and armrest/backrest visible; for floor sitting, keep enough pelvis/leg/floor support visible.
- Holding arm: extended toward face level with a naturally relaxed elbow and one continuous shoulder → elbow → wrist chain.
- Other arm: rests on a real armrest, thigh, knee, or other actual support. No floating arm and no extra shoulder.`;
    }
    if (family === "standing") {
      return `STANDING SELFIE CAMERA & ARM — FAMILY OVERRIDE
- Front-camera distance: 45–60 cm from the face.
- Camera height/angle: approximately eye level around 1.5 m, derived from the subject's real standing anatomy.
- Framing: upper body with the room readable behind; solve full-body floor grounding before crop. Vertical doors, wardrobe edges, wall corners, and mirror frames remain nearly vertical, with only mild wide-angle convergence near frame edges.
- Holding arm: extended toward face level with a naturally relaxed elbow and one continuous shoulder → elbow → wrist chain.
- Other arm: rests naturally by the thigh, in a pocket, on the hip, or on a real nearby support surface when selected. No floating arm and no extra shoulder.`;
    }
    return "";
  }

  getFamilyNegativePrompt(pose) {
    const family = this.familyOf(pose);
    if (family === "sitting") {
      return [
        "floating above cushion",
        "uncompressed sofa cushion",
        "feet without floor contact",
        "mannequin sitting posture",
        "seat hidden by impossible crop"
      ];
    }
    if (family === "standing") {
      return [
        "floating feet",
        "missing foot contact shadow",
        "hovering heels",
        "symmetrical mannequin stance",
        "bent room lines without lens reason"
      ];
    }
    return [];
  }

  buildArmStrategy(pose, autoEngineering = null) {
    const deterministic = autoEngineering?.armFine
      ?? pose.selfie_notes
      ?? "Keep the holding shoulder, elbow, wrist, and hand within natural reach.";

    const rearRule = autoEngineering?.cameraType === "rear"
      ? "Rear-camera capture is not a front-camera selfie. Do not extend an arm toward the lens; both arms must remain naturally supported unless a mirror-selfie grip is explicitly mapped."
      : "For a true front-camera selfie, derive the phone position from the mapped shoulder, elbow, wrist, and hand only after the body is anchored to its support surfaces.";
    const familyCameraArm = this._buildFamilyCameraArm(pose);

    return `ARM STRATEGY\n${deterministic}\n${rearRule}\nUniversal arm rules: no overlong arm, no extra shoulder, no duplicated hand, no wrist from an impossible direction, no hand arriving from the wrong side of the subject's body, and no limb penetrating the torso. If showing the phone, hand, or forearm would force anatomical distortion, keep the phone, hand, and most of that forearm outside frame while preserving a physically logical shoulder and elbow path.${familyCameraArm ? `\n\n${familyCameraArm}` : ""}`;
  }

  buildExpressionLock(expression) {
    const selected = expression?.prompt ?? "Use a neutral, naturally relaxed facial-muscle state.";
    return `EXPRESSION LOCK\nThe selected expression overrides the expression visible in IMAGE A.\n${selected}\nIMAGE A remains authoritative for identity geometry only. Facial muscles may change state, but skull shape, facial proportions, eye spacing, nose, lips, jaw, chin, ears, apparent age, and natural asymmetry must not change. This is a muscle-state override, never a facial-geometry rewrite.`;
  }

  buildHairLock(hair) {
    const selected = hair?.prompt ?? "Keep the reference hairstyle arrangement as closely as pose physics allows.";
    return `HAIR LOCK\n${selected}\nHair changes arrangement only within the original length, density, wave pattern, and hairline defined by IMAGE A. Where hair touches a pillow, flatten and spread only the contact side according to pressure and friction; the free side follows gravity naturally. Never invent new length, density, hairline, or a different haircut.`;
  }

  buildClothingLock(clothing) {
    const outfit = clothing ?? {};
    const fabric = outfit.fabric ?? {};
    return `CLOTHING LOCK\nCLOTHING (user-selected — OVERRIDES IMAGE A):\nGarment: ${outfit.pieces ?? "the selected garment"}.\nFabric: ${fabric.type ?? "physically plausible fabric"}; weight ${fabric.weight ?? "appropriate to the garment"}; sheen: ${fabric.sheen ?? "material-appropriate"}.\nDrape: ${fabric.drape ?? "natural for the material"}. Folds: ${fabric.folds ?? "load-driven only"}.\nTexture: ${fabric.texture ?? "subtle and non-repeating"}. Wear: ${fabric.wear ?? "natural and restrained"}.\nNever copy any garment from IMAGE A; the selected clothing overrides every shirt, collar, sleeve, fabric, color, or garment visible in IMAGE A. Adapt only fold geometry, drape, pressure, friction, and contact response to the selected pose.\n\nFABRIC REALISM\n- Weave or knit must remain subtle and NON-REPEATING: no tiled texture stamps, no fractal micro-patterns, no mirrored repetition of folds.\n- Folds are load-driven only by gravity, body curvature, bedding or mattress pressure, and friction at real contact points; every fold is unique.\n- Sheen must match the actual material and selected physical light sources only. Matte cotton stays matte. Satin and leather may show soft directional highlights only from the lamp, phone screen, ceiling source, or daylight actually selected; never plastic shine.\n- Seams, collars, buttons, cuffs, and closures carry slight real-world imperfection such as a mildly rolled collar or a subtly imperfect button angle; never CGI-sharp geometry.\n- Wear remains restrained and material-specific: soft fading may occur at collars or elbows where the selected garment data supports it; pilling appears only on wool or fleece where physically expected.\n- Where the body, blanket, pillow, or mattress presses the garment, create localized compression wrinkles and displaced-weave shading consistent with pressure direction.\n- Clothing passes through the exact same phone-camera pipeline as face, neck, bedding, and room: same exposure logic, sensor noise, sharpness, compression, white balance, and resolution. The clothing region must never appear cleaner, sharper, smoother, or more synthetic than the rest of the frame.`;
  }

  buildTrueLateralEnforcement(pose) {
    const downSide = pose.id === "lying_right_side" ? "RIGHT" : "LEFT";
    const upperSide = downSide === "RIGHT" ? "LEFT" : "RIGHT";

    return `TRUE LATERAL ENFORCEMENT — NON-NEGOTIABLE\nThis must be a genuine full side-lying posture, not a semi-reclined, three-quarter, or face-up hybrid.\n\nBody alignment:\n- He lies fully on his ${downSide} side. His ${downSide} shoulder is the loaded lower shoulder beneath the upper shoulder; the shoulder line is stacked rather than flattened onto the back.\n- His torso is rotated onto the ${downSide} side and reads clearly as a side view through ribcage, waist, and pelvis alignment.\n- His ${downSide} ear/cheek presses into the pillow while the ${upperSide} ear remains the free visible ear when the camera geometry allows it.\n- Compress the pillow approximately 4–6 cm under the head where the real pillow compliance permits; do not sink the skull unrealistically.\n- Flatten ${downSide}-side hair only at the pillow contact zone; ${upperSide}-side hair remains freer and follows gravity.\n- Create local mattress compression beneath the ${downSide} shoulder, ribcage, and hip, with contact shadows where the body meets bedding.\n- The ${downSide} leg may remain extended or slightly bent; the ${upperSide} leg may bend naturally above it without impossible hip rotation or fused knees.\n\nArm enforcement:\n- The UPPER ${upperSide} hand is the ONLY selfie hand for this side-lying pose. Its elbow remains supported on the mattress in front of the chest within normal shoulder reach.\n- The LOWER ${downSide} arm rests forward on the mattress near the torso or partly beneath the pillow. It must NEVER cross through, merge into, disappear inside, or penetrate the ribcage.\n- No overlong arm, extra shoulder, duplicated hand, impossible wrist direction, or hand entering from the wrong side of the body.\n\nHandedness and side-reference rule:\n- Never switch the selfie hand without switching the entire body-side pose definition.\n- All LEFT/RIGHT descriptions refer to the SUBJECT'S own body, never the left/right side of the rendered image or camera view.`;
  }
}
