export const MASTER_POLICY = Object.freeze({
  eventRule: "Interpret every selected value as one physically coherent photographic event.",
  conflictDomains: [
    "identity",
    "place and room continuity",
    "anatomy and support surfaces",
    "arm reach and phone position",
    "camera and lens geometry",
    "perspective and reflections",
    "lighting and exposure",
    "materials, scale, and depth of field"
  ],
  realismRule: "Realism must come from optics, light, anatomy, pressure, gravity, friction, and ordinary phone processing—not artificial detail injection.",
  forbiddenTechniques: [
    "EXIF spoofing",
    "C2PA removal",
    "PRNU simulation",
    "forensic countermeasures",
    "fake 8K detail",
    "unmotivated cinematic grading"
  ]
});
