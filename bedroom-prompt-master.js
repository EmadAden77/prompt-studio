(function(){
  var PAGE=(location.hash||'').replace(/^#/,'').toLowerCase();
  if(PAGE!=='bedroom')return;

  var previousFinal=window.buildFinal;
  var previousNegative=window.buildNegative;

  function S(){try{return typeof state==='object'&&state?state:{}}catch(e){return {}}}
  function V(){try{return typeof smartValues==='function'?smartValues():S()}catch(e){return S()}}
  function platform(){return String(S().platform||'chatgpt').toLowerCase()}
  function val(x){return String(x==null?'':x).trim()}
  function auto(x){var t=val(x).toLowerCase();return !t||t==='__auto_prompt__'||t==='auto'||/^auto\b/.test(t)||/تلقائي/.test(t)}

  function poseRule(v){
    var p=val(v.pose).toLowerCase();
    if(/seated|sitting|جالس/.test(p))return 'BODY POSTURE — SEATED. Keep the person naturally seated with believable pelvis support, spine alignment, shoulder balance, leg placement, and realistic contact with the bed or chair. The posture must feel casual and alive rather than posed. Let the automatic selfie director choose the most plausible camera viewpoint for a seated front-camera selfie.';
    if(/lying|reclining|مستلقي|استلقاء/.test(p))return 'BODY POSTURE — LYING ON THE BED. Keep the person genuinely supported by the mattress and pillow with realistic gravity, mattress compression, pillow compression, neck support, shoulder and pelvis contact, fabric bunching, and no floating anatomy. The pose must feel naturally relaxed rather than mannequin-stiff. Let the automatic selfie director choose the most plausible camera viewpoint for this supported position.';
    return 'BODY POSTURE — STANDING. Keep the person naturally standing with believable weight distribution, relaxed asymmetry, realistic shoulder and pelvis alignment, ordinary posture, and a subtle natural head position. Let the automatic selfie director choose the most plausible camera viewpoint for a standing front-camera selfie.';
  }

  function selectedRules(v){
    var out=[];
    if(val(v.clothing))out.push('SELECTED CLOTHING — HARD CONSTRAINT: '+val(v.clothing)+'. Preserve the selected garment type, colors, lengths, layers, and combination exactly. Do not substitute, recolor, simplify, or restyle it.');
    if(!auto(v.expression))out.push('SELECTED EXPRESSION — HARD CONSTRAINT: '+val(v.expression)+'. Keep it natural and non-performative while preserving the selected expression exactly.');
    if(!auto(v.gaze))out.push('SELECTED GAZE — HARD CONSTRAINT: '+val(v.gaze)+'.');
    if(!auto(v.bedroomLighting))out.push('SELECTED BEDROOM LIGHTING — HARD CONSTRAINT: '+val(v.bedroomLighting)+'.');
    if(!auto(v.bedroomClutter))out.push('SELECTED BEDROOM CLUTTER — HARD CONSTRAINT: '+val(v.bedroomClutter)+'.');
    if(val(v.time))out.push('SELECTED TIME OF DAY — HARD CONSTRAINT: '+val(v.time)+'. The time must visibly influence light color, brightness, shadow behavior, room ambience, and camera noise.');
    if(!auto(v.freeHandPose))out.push('SELECTED FREE-HAND GESTURE — HARD CONSTRAINT: '+val(v.freeHandPose)+'. This applies only to the free hand, never to the hidden camera-holding hand.');
    return out;
  }

  function engine(v){
    var g=platform()==='gemini';
    var blocks=[];

    blocks.push((g?'GEMINI BEDROOM EXECUTION CONTRACT':'CHATGPT BEDROOM EXECUTION CONTRACT')+' — HIGHEST PRIORITY. Treat every explicit user selection and every rule marked HARD CONSTRAINT, ABSOLUTE, FIXED, LOCK, MANDATORY, REQUIRED, or HIGHEST PRIORITY as a specification to execute, not as inspiration. Do not beautify, reinterpret, substitute, average, simplify, restyle, or silently ignore those constraints. Resolve only details that are genuinely unspecified.');

    blocks.push('REFERENCE IMAGE ROLE — ABSOLUTE. Use the supplied person reference image as the one and only identity source for the person. It supplies identity only. Do not copy its pose, camera angle, crop, lighting, clothing, expression, or background unless one of those properties is separately selected by the user. When room lock is active, the bedroom reference supplies room identity only and must not alter the person.');

    blocks.push('IDENTITY FREEZE — ABSOLUTE. Preserve exactly the same person: face shape, facial proportions, facial bones, forehead, jaw, chin, cheeks, nose, eyes, eyelids, eyebrows, lips, ears, skin tone, apparent age, natural asymmetry, hairstyle, hairline, hair density, natural hair direction, beard, mustache, and all distinctive facial details. Do not slim, widen, reshape, rejuvenate, age, symmetrize, beautify, retouch, replace, or reconstruct the face or head. Do not invent new moles, freckles, scars, or permanent identity marks merely to create realism; preserve only identity details that actually belong to the reference.');

    blocks.push('BODY CONSTANTS — FIXED. Height is 193 cm. Weight is 83 kg. Build is lean athletic with naturally low but realistic body fat, proportionate musculature, and anatomically correct balance. Preserve realistic limb lengths, shoulder width, torso proportions, pelvis scale, joint mechanics, and overall body silhouette. Never distort, shorten, widen, inflate, or reshape the body to satisfy framing.');

    blocks.push(poseRule(v));

    blocks.push('AUTOMATIC SELFIE ANGLE, POSE PRESENTATION, AND EXPRESSION DIRECTOR — ABSOLUTE. The user chooses only the main body posture: standing, seated, or lying on the bed. Automatically choose the most believable and engaging selfie camera angle, camera-to-face distance, camera height, yaw, pitch, roll, slight upward selfie bias when natural, side offset, head direction, crop, horizon imperfection, and framing for the selected posture and bedroom geometry. If the expression is not explicitly selected, choose a subtle authentic expression that suits the scene mood. The result must feel candid, alive, and casually captured rather than robotic, fashion-posed, overly composed, or cinematic.');

    blocks.push('CAMERA-HOLDING ARM EXCLUSION — ABSOLUTE AND HIGHER PRIORITY THAN GENERIC SELFIE ARM LANGUAGE. In every bedroom selfie, the camera-holding upper arm, forearm, elbow, wrist, hand, fingers, and phone must remain completely outside the captured image. Any reference to natural arm extension, selfie reach, or foreshortening describes hidden off-frame biomechanics only. The virtual phone must occupy a physically reachable position from the hidden shoulder. If the chosen angle or framing would expose any part of the camera-holding limb or phone, adjust only the virtual camera position, camera distance, crop, field coverage, or amount of torso/background shown. Never distort anatomy to satisfy composition.');

    blocks.push('XIAOMI 15 ULTRA FRONT-CAMERA OPTICS — MANDATORY. Render the image as if captured by the Xiaomi 15 Ultra front-facing selfie camera: 32 MP front camera, fixed f/2.0 aperture, approximately 90-degree field of view, natural smartphone wide-angle perspective, slight edge stretching/distortion, modest corner softness rather than cosmetic face slimming, subtle modern phone-camera digital sharpening, and realistic front-camera autofocus behavior. Keep the face as the primary focus while allowing the background to remain naturally less crisp through real smartphone optics and computational processing. Do not create creamy DSLR bokeh, fake portrait-lens compression, or artificial studio depth of field.');

    blocks.push('XIAOMI SMARTPHONE PROCESSING CHARACTER — MANDATORY. Use believable Xiaomi-style front-camera processing appropriate to the selected lighting: natural contrast, restrained computational HDR, scene-dependent white balance, plausible skin-tone rendering, ordinary highlight rolloff, limited shadow recovery, realistic local sharpening, subtle compression, and no exaggerated computational glow. Skin may read slightly warm only when the actual room lighting and white balance justify it; do not force a warm skin cast against the scene.');

    blocks.push('AUTHENTIC SMARTPHONE SELFIE ARTIFACTS — MANDATORY WHEN PHYSICALLY PLAUSIBLE. Allow very slight background softness, subtle nonuniform sharpness, modest edge softness, tiny lens flare or halation only when a bright source can physically cause it, realistic autofocus falloff, mild low-light luminance noise, occasional faint chroma noise in darker regions, subtle JPEG compression, tiny chromatic aberration near high-contrast edges, mild handheld softness when shutter conditions justify it, and small exposure imbalance. Never add artifacts as decorative overlays.');

    blocks.push('RAW UNEDITED PHONE-PHOTO CHARACTER — MANDATORY. The image must feel like an ordinary unedited selfie someone actually captured and sent, not a finished commercial image. No beauty filter, skin smoothing, professional retouching, dramatic grading, studio polish, over-sharpening, oversaturation, hard artificial contrast, exaggerated HDR, fake RAW styling, 8K marketing language, or synthetic micro-detail.');

    blocks.push('SKIN MICRO-REALISM — MANDATORY. Skin must behave like real human skin photographed by one smartphone camera. Preserve non-uniform pores of varied size where optically plausible, especially around the nose, cheeks, and forehead; subtle T-zone oil sheen; tiny natural color variation; ordinary under-eye tone; slight localized redness or small transient imperfections only when consistent with the reference and scene; realistic vellus hair; and natural surface scattering under the selected light. Do not turn pores into a repeated texture map. Texture must follow facial curvature, focus, light, shadow, and real skin structure. No waxy, plastic, porcelain, uniformly smooth, or airbrushed skin.');

    blocks.push('NOSE, LIPS, AND MOUTH REALISM — MANDATORY. Preserve the reference nose shape exactly while rendering physically correct nose shadows, plausible pore visibility, and subtle natural oil reflection around the tip and T-zone. Lips must show natural fine lines, slight color variation, and realistic moisture without becoming overly matte, glossy, plastic, or perfectly smooth.');

    blocks.push('EYES — MANDATORY. Preserve the reference eyes exactly. Keep natural left-right asymmetry, realistic iris detail at smartphone capture resolution, ordinary sclera tone, subtle corner redness only when naturally plausible, eyelashes of varied visible length, realistic eyelid and under-eye shadows, and catchlights derived only from actual scene light sources. No identical artificial catchlights, glowing irises, beauty-eye sharpening, or invented eye symmetry.');

    blocks.push('TEETH — CONDITIONAL REALISM. Only show teeth if the selected or naturally inferred expression calls for them. If visible, keep realistic off-white coloration, natural spacing and alignment, believable gum line, physically correct reflections, and small ordinary irregularity. Do not create perfectly white, perfectly aligned, perfectly symmetrical Hollywood-style teeth.');

    blocks.push('HAIR — ANTI-SYNTHETIC REALISM. Preserve the exact reference hairstyle and hairline. Render believable hair clumping and grouping rather than thousands of individually illustrated identical strands. Maintain natural density variation, growth direction, gravity, irregular strand grouping, small flyaways or baby hairs only where plausible, realistic depth, and highlights/shadows driven by the selected light source. No perfect symmetry, uniform strand spacing, synthetic swirls, repeated curls, painted hair, or gravity-defying strand patterns.');

    blocks.push('BEARD AND MUSTACHE — ANTI-SYNTHETIC REALISM. Preserve the reference beard and mustache pattern exactly while rendering natural direction, density variation, slightly sparser and denser areas, soft realistic transitions at cheeks, jaw, and lips, and individual hairs that vary in length, thickness, and direction. Avoid razor-sharp beard masks, uniform density, symmetric repeated patterns, or abrupt synthetic edges.');

    blocks.push('CLOTHING AND FABRIC PHYSICS — MANDATORY. Fabric must behave according to its real material. Cotton should drape and crease like cotton, polyester should respond like polyester, denim should have denim weight and stiffness, and every selected material must interact plausibly with gravity, body motion, posture, arm position, mattress or chair contact, and scene light. Preserve physically consistent seams, stitching, buttons, hems, logos, prints, and patterns. Patterns may deform only where real fabric folds would deform them. No repeating random texture, impossible weave, floating cloth, or folds that contradict physics.');

    blocks.push('LIGHTING — ANTI-SYNTHETIC PHYSICS. Lighting must match the selected bedroom lighting, location, and time. Every light source must have coherent direction, intensity, color temperature, falloff, shadow softness, reflections, ambient bounce, and exposure behavior. Hard direct sources create appropriately harder shadows; larger diffuse or bounced sources create softer shadows. No impossible light, shadows falling in the wrong direction, inconsistent color temperatures across the same face, cinematic rim light, studio key light, unexplained beauty fill, artificial glow, or perfect face illumination.');

    blocks.push('ENVIRONMENTAL LIGHT RESPONSE — MANDATORY. Let the chosen time and light source affect the entire image coherently: skin, hair, clothing, bedding, furniture, walls, mirrors, floor, and background objects must all respond to the same real lighting environment. At night, allow realistic mixed color temperature, darker regions, limited dynamic range, local highlight clipping, and phone-camera noise. If daylight or window spill is explicitly selected, preserve believable direction and room shadow behavior.');

    blocks.push('BEDROOM BACKGROUND — ANTI-SYNTHETIC REALISM. Keep the locked bedroom identity recognizable and physically coherent. Every visible object must have correct perspective, scale, grounding, occlusion, shadow, and material behavior. Bedding must show believable folds and pressure. Furniture, mirrored surfaces, chargers, cables, bottles, clothing, shoes, and other selected or existing objects must remain fully formed and logically placed. No warped text, impossible architecture, floating items, melting shapes, half-formed objects, duplicated clutter, repeated bottles, repeated shoes, impossible reflections, or background anatomy errors.');

    blocks.push('SMARTPHONE DEPTH AND BACKGROUND DETAIL — MANDATORY. Background depth must remain consistent with a front-facing smartphone camera: slightly softer than the face when optics and computational processing justify it, but still recognizably detailed and spatially coherent. Do not reduce the room to a featureless blur. Do not use heavy fake bokeh unless a specifically requested computational portrait mode plausibly produces it.');

    blocks.push('LOCATION AND TIME COHERENCE — REQUIRED. The location is the selected/locked bedroom and the time of day must follow the user-selected time or explicit scene description. Time must influence brightness, color temperature, shadow character, ambient spill, visible exterior light if any, and expected camera noise. Do not insert unrelated street, cafe, office, Saudi-road, or outdoor details into the bedroom scene.');

    blocks.push('LIVED-IN INTERIOR REALISM — MANDATORY. The bedroom should feel genuinely occupied and used, not hotel-perfect or advertisement-perfect. Keep natural bedding disorder, ordinary furniture, believable personal objects, logical charging cables or small items when allowed by the selected clutter setting, subtle wear, and non-perfect arrangement. Do not add random luxury decoration, excessive clutter, or unselected props merely to make the room look busy.');

    selectedRules(v).forEach(function(x){blocks.push(x)});

    blocks.push('REALITY CHECK — REQUIRED. The final result must resemble a casual real smartphone selfie rather than a render. Inspect for AI-looking skin, waxy smoothing, repeated pores, impossible hair, synthetic beard, fake cloth texture, impossible lighting, warped geometry, cloned objects, malformed background items, repeated patterns, anatomy errors, unnatural facial symmetry, fake bokeh, excessive HDR, and professional-studio polish. Correct those by improving physical coherence while preserving every hard identity and scene constraint.');

    blocks.push((g?'GEMINI':'CHATGPT')+' PRE-RENDER COMPLIANCE CHECK — REQUIRED. Before rendering, verify the exact person identity, unchanged face and hair, 193 cm / 83 kg lean-athletic body constants, selected posture, selected clothing, selected expression and gaze, selected bedroom lighting and clutter, locked room identity, Xiaomi 15 Ultra front-camera behavior, physically coherent optics and lighting, and complete exclusion of the camera-holding arm/hand/phone from the frame. If any hard constraint would be violated, revise only unspecified camera, crop, or composition details before rendering.');

    return blocks.join('\n\n');
  }

  var NEG=[
    'AI-looking skin','waxy skin','plastic skin','porcelain skin','uniformly smooth skin','repeated pore texture','fake pore overlay','beauty filter','face retouching','beautified identity','changed face shape','changed facial proportions','changed hairstyle','changed hairline','invented mole','invented freckles','synthetic beard','uniform beard density','razor-sharp beard mask','repeated hair strands','painted hair','synthetic hair swirl','fake fabric texture','repeating fabric texture','impossible fabric folds','painted-on clothing','perfect teeth','uniform white teeth','over-smoothing','over-sharpening','oversaturation','excessive HDR','fake RAW look','studio lighting','cinematic rim light','beauty fill light','unexplained glow','CGI','3D render','illustration','duplicated people','repeated cars','distorted hands','extra fingers','fused fingers','visible phone','visible camera-holding fingers','visible camera-holding hand','visible camera-holding wrist','visible camera-holding forearm','visible camera-holding elbow','visible camera-holding upper arm','partial selfie arm at frame edge','giant foreground arm','stretched selfie arm','telescoped selfie arm','warped background','warped text','impossible architecture','melting objects','morphing shapes','half-formed objects','floating objects','duplicated bedroom clutter','repeated bottles','repeated shoes','unreadable foreground text','fake bokeh','creamy DSLR bokeh','DSLR-like portrait compression','unrealistic shadows','wrong shadow direction','inconsistent light temperature on the face','inconsistent perspective','impossible reflection','perfectly centered synthetic composition','mannequin pose','robotic expression','impossible joint geometry','background anatomy errors','professional studio polish'
  ];

  function stripOldNegativeSection(text){
    return String(text||'').replace(/\n\s*Negative constraints:\s*[\s\S]*$/i,'').trim();
  }

  window.buildFinal=function(){
    var base=previousFinal?previousFinal():'';
    var v=V();
    base=stripOldNegativeSection(base);
    return engine(v)+'\n\n'+base+'\n\nNegative constraints:\n'+NEG.join(', ')+'.';
  };

  window.buildNegative=function(){
    var base=previousNegative?previousNegative():'';
    return (base?base+', ':'')+NEG.join(', ');
  };
})();