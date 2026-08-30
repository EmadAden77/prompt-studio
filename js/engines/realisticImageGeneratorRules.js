// REALISTIC IMAGE GENERATOR — global photographic realism layer
// Applied as a base reasoning contract before the app's stricter identity,
// anatomy, contact, camera, lighting and sensor rules.

export const REALISTIC_IMAGE_GENERATOR_RULES = `REALISTIC IMAGE GENERATOR — GLOBAL REALISM CONTRACT

GOAL
Create an ordinary, physically believable real-world photograph rather than an idealized AI image. The scene must read as a single photographic event captured by a real camera in a real place at one moment in time.

REAL-WORLD CAUSALITY
Every visible result must have a plausible physical cause. Pose, gravity, body support, pressure, fabric deformation, object placement, light, shadows, reflections, depth, motion and camera perspective must agree with one another. Never improve composition at the expense of physical possibility.

NATURAL HUMAN ACTIVITY
Depict the person as genuinely performing the selected activity rather than posing for a synthetic portrait. Body orientation, gaze, hands, shoulders and nearby objects must follow the activity. Preserve small asymmetries and ordinary imperfections that naturally occur during real human movement.

ANATOMY AND SUPPORT
Maintain continuous human anatomy and mechanically possible joints. Any seated, standing, leaning or lying body must be supported by the appropriate real surface. Weight-bearing surfaces must react with plausible compression, folds, displacement and contact shadows. No floating bodies, disconnected limbs, decorative pressure marks or impossible balance.

OBJECT INTERACTION
Props must have plausible scale, mass, support and contact. Hands interact with objects using possible grip geometry. Objects resting on the body or furniture must visibly obey gravity, friction and pressure. Nothing may float, intersect incorrectly or remain balanced without support.

CAMERA CAUSALITY
The requested camera type, lens, distance, height and angle define the perspective. Do not silently substitute a cinematic or portrait-camera viewpoint. For selfies, the camera must remain inside physically reachable arm geometry and the shoulder/arm posture must support the inferred phone position. Perspective distortion must follow camera distance and field of view.

LIGHTING CAUSALITY
Use only light sources that physically exist in the selected scene. Light direction, intensity, color temperature, falloff, shadows, catchlights, specular reflections and illuminated surfaces must all trace back to those sources. Never add invisible studio fill, beauty lighting, rim lighting or independently relight the face.

MATERIAL REALISM
Fabric, skin, hair, painted surfaces, wood, metal, plastic and glass must respond differently according to their physical properties. Reflections must obey scene geometry. Clothing folds must arise from gravity, joints, tension, compression and friction rather than decorative wrinkle patterns.

ENVIRONMENTAL COHERENCE
The environment must feel inhabited and contextually appropriate, not generically decorated. Preserve plausible scale, wear, irregularity, clutter and spatial relationships. Do not clean, beautify or redesign the environment merely to make the image more attractive.

PHOTOGRAPHIC IMPERFECTION
Real photographs are not perfectly optimized. Allow physically justified imperfect framing, slight camera roll, exposure compromise, clipped practical highlights, shadow loss, imperfect automatic white balance, motion softness, lens limitations, sensor noise, denoising loss, restrained sharpening and compression artifacts according to the selected camera and lighting conditions.

ANTI-AI AESTHETIC
Do not default to cinematic grading, commercial polish, studio portrait lighting, excessive HDR, artificial clarity, fake 8K microdetail, waxy skin, procedural pores, perfectly separated hair strands, synthetic bokeh, impossible depth of field, immaculate surfaces or hyper-clean shadows. Do not make reality more visually perfect than the capture conditions permit.

SINGLE CAPTURE PIPELINE
One scene, one camera, one lens, one viewpoint, one exposure event, one lighting environment and one coherent image-processing pipeline. Face, body, clothing, props and background must not appear to have been captured or processed independently.

REALISM PRIORITY
When requirements conflict, resolve them in this order:
1. identity preservation
2. anatomy and human continuity
3. reference/scene authority
4. support, gravity and contact physics
5. camera reach, distance and perspective
6. practical lighting causality
7. material and reflection physics
8. exposure, sensor and processing behavior
9. aesthetic preference
Physical plausibility always wins over prettiness.

FINAL REALISM QA
Before output, verify: identity is unchanged; anatomy is continuous; weight has support; contacts have physical reactions; camera geometry is possible; every important light has a source; shadows/catchlights/reflections agree; exposure and sensor behavior match the environment; materials respond plausibly; no CGI, studio or AI-polished cues have been introduced. Correct the physical cause of any failure rather than hiding it cosmetically.

CAPTURED, NOT RENDERED.
PHYSICALLY COHERENT, NOT VISUALLY PERFECT.`;
