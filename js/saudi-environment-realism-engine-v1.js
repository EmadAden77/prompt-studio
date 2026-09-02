// SAUDI ENVIRONMENT REALISM ENGINE v1
// Geographic/context realism for Saudi outdoor selfies and views through vehicle glazing.
// Camera geometry remains the authority for what can actually enter the frame.

export const SAUDI_ENVIRONMENT_REALISM_VERSION = "1.0.0";

const CITY_PROFILES = Object.freeze({
  riyadh:"Riyadh: inland dry urban character; ordinary boundary walls, villas/apartments/commercial strips, broad-to-local road hierarchy, restrained vegetation, dry atmospheric behavior and locally plausible practical street lighting.",
  jeddah:"Jeddah: Red Sea coastal urban character; denser mixed façades where appropriate, warmer/humid coastal atmosphere when conditions support it, locally plausible roads, curbs, palms/vegetation and ordinary street lighting without resort-style exaggeration.",
  dammam:"Dammam/Eastern Province: Gulf-coast urban character; locally plausible low/mid-rise development, roads, compounds, commercial frontage, vegetation and atmospheric behavior appropriate to the eastern coastal climate.",
  khobar:"Al Khobar: Eastern Province coastal city character; coherent local streets, residential/commercial frontage and Gulf-coast atmosphere without turning every scene into a waterfront landmark.",
  madinah:"Madinah: dry western inland urban character; locally plausible residential/commercial streets, walls, road furniture and restrained vegetation. Do not introduce religious landmarks unless explicitly requested.",
  makkah:"Makkah: western Saudi urban character shaped by denser development and terrain where contextually appropriate. Never force sacred landmarks, crowds or pilgrimage cues unless explicitly requested.",
  abha:"Abha/Asir: higher-elevation southwestern character; terrain, vegetation, cloud/fog or cooler conditions only when selected time/weather supports them; avoid generic desert substitution.",
  tabuk:"Tabuk: northwestern inland character; dry climate, locally plausible streets and development, with terrain/seasonal cues only when context supports them.",
  yanbu:"Yanbu: western coastal/industrial-residential Saudi character; Red Sea atmospheric cues, locally plausible roads and development without forcing refinery, port or waterfront elements.",
  generic:"Saudi Arabia: use an ordinary geographically plausible Saudi urban environment. Avoid generic Gulf luxury styling and avoid landmarks unless explicitly selected."
});

const ENVIRONMENT_PROFILES = Object.freeze({
  residential:"ordinary residential street with locally plausible road width, asphalt wear, curb/sidewalk behavior, boundary walls, gates, residential façades, parked vehicles and practical utilities",
  commercial:"ordinary commercial street with locally plausible shop frontage, parking behavior, road furniture, service access and restrained incidental signage",
  parking:"ordinary Saudi parking area with plausible asphalt, curbs, wheel stops where appropriate, parked Saudi-market vehicles and practical pole/building lighting",
  side_street:"ordinary local side street with modest road width, realistic surface condition, walls/façades, parked vehicles and sparse context-appropriate activity",
  promenade:"ordinary public promenade or pedestrian-oriented street appropriate to the selected city; do not invent waterfront, skyline or landmark context unless geographically and explicitly requested",
  service_station:"ordinary Saudi service-station context with plausible forecourt geometry and practical lighting; no brand/logo invention unless supplied by the user",
  road:"ordinary urban Saudi road appropriate to the selected city and district; prioritize road hierarchy, lane/curb behavior and believable adjacent development over spectacle"
});

function text(v,fallback="") { return String(v ?? fallback).trim(); }
function lower(v) { return text(v).toLowerCase(); }

function resolveCity(state={}) {
  const raw = lower(state.saudiCity || state.city || state.location);
  if (/riyadh|الرياض/.test(raw)) return "riyadh";
  if (/jeddah|جدة/.test(raw)) return "jeddah";
  if (/dammam|الدمام/.test(raw)) return "dammam";
  if (/khobar|الخبر/.test(raw)) return "khobar";
  if (/madinah|medina|المدينة/.test(raw)) return "madinah";
  if (/makkah|mecca|مكة/.test(raw)) return "makkah";
  if (/abha|أبها/.test(raw)) return "abha";
  if (/tabuk|تبوك/.test(raw)) return "tabuk";
  if (/yanbu|ينبع/.test(raw)) return "yanbu";
  return "generic";
}

function resolveEnvironmentType(state={}) {
  const raw = lower(state.saudiEnvironmentType || state.environmentType || state.scene);
  if (/residen|سكن/.test(raw)) return "residential";
  if (/commercial|shop|تجار/.test(raw)) return "commercial";
  if (/parking|موقف/.test(raw)) return "parking";
  if (/side.?street|فرعي/.test(raw)) return "side_street";
  if (/promenade|ممشى|كورنيش/.test(raw)) return "promenade";
  if (/station|محطة/.test(raw)) return "service_station";
  return "road";
}

function isCarState(state={}) {
  const section = lower(state.studioSection);
  const scene = lower(state.scene);
  return section === "car" || /range.?rover|(?:^|[-_])car(?:[-_]|$)/u.test(scene);
}

function isSaudiContext(state={}) {
  const location = lower(state.saudiCountry || state.country || state.location || state.customScene);
  return state.saudiEnvironment === "on" || /saudi|ksa|السعود/.test(location) || Boolean(state.saudiCity);
}

function buildTimeAtmosphere(state={}) {
  const time = lower(state.time || state.timeOfDay || "day");
  const weather = text(state.weather || state.atmosphere || "ordinary conditions");
  const night = /night|ليل/.test(time);
  return `${night ? "Night: exterior visibility must be supported by real street/building/vehicle practical lights; preserve dark areas, limited dynamic range and plausible mixed color temperature." : "Daylight: use sun/sky exposure appropriate to the selected time; preserve realistic hard/soft shadow behavior and smartphone dynamic-range limits."}\nWeather/atmosphere: ${weather}. Apply only physically caused atmospheric effects; do not add decorative haze, dust or dramatic clouds.`;
}

export function buildSaudiEnvironmentRealism(state={}) {
  if (!isSaudiContext(state)) return "";
  const city = resolveCity(state);
  const env = resolveEnvironmentType(state);
  const car = isCarState(state);
  return `[SAUDI ENVIRONMENT REALISM — PHYSICAL CONTEXT AUTHORITY]
City profile: ${CITY_PROFILES[city]}
Environment: ${ENVIRONMENT_PROFILES[env]}.
${buildTimeAtmosphere(state)}

LOCAL COHERENCE:
Use locally plausible asphalt, curbs/sidewalks, boundary walls/façades, utility/streetlight placement, ordinary Saudi-market parked vehicles and context-appropriate vegetation. Saudi-format license plates may appear only when naturally visible; never force readable plate text. Incidental Arabic/English signage may be soft, partial or unreadable rather than fabricated as perfect typography.

GEOGRAPHIC SAFETY:
Do not substitute a generic Dubai/Gulf luxury environment. Do not add towers, mosques, waterfronts, mountains, palms, desert dunes, famous landmarks, crowds or prestige vehicles merely to signal Saudi Arabia. Such elements require geographic/contextual support or explicit user selection.

ENVIRONMENT LIFE ENGINE:
The place should look normally used, not staged: allow subtle physically caused road wear, parking irregularity, ordinary façade variation, practical light imbalance and sparse human/vehicle activity when appropriate to location and time. Never stack clutter, dust, haze, litter, damage or traffic as realism decoration.

CAMERA-VISIBILITY LAW — HARD:
The resolved selfie camera geometry determines the visible environment. Never move, widen, raise or externalize the camera merely to display more Saudi context. The face/selfie intent remains primary; omit environmental proof when the crop cannot naturally reveal it.

${car ? `VEHICLE GLASS VISIBILITY:
The Saudi exterior may enter the image only through physically visible windshield, side-window, panoramic-roof or mirror paths permitted by the resolved in-cabin selfie viewpoint. Preserve correct occlusion, glazing/reflection behavior, exposure difference and cabin-to-exterior depth. Never paste a complete street behind the subject or expose scenery through opaque pillars, seats or body panels.` : `OUTDOOR SELFIE VISIBILITY:
Background scale, perspective, occlusion and detail must follow the subject-held front-camera position. Nearby façades/vehicles may show natural wide-angle perspective; distant context must remain less detailed. Do not turn an ordinary personal selfie into an architectural establishing shot.`}`;
}

export function validateSaudiEnvironment(state={}, checks={}) {
  if (!isSaudiContext(state)) return { active:false, valid:true, failures:[] };
  const failures=[];
  if (checks.cameraDrivenVisibility === false) failures.push("camera-driven visibility");
  if (checks.geographicCoherence === false) failures.push("Saudi geographic coherence");
  if (checks.environmentContinuity === false) failures.push("environment continuity");
  if (isCarState(state) && checks.glassVisibilityPhysics === false) failures.push("vehicle glass visibility physics");
  return { active:true, valid:failures.length===0, failures };
}
