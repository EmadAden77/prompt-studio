function text(value) { return String(value ?? "").trim(); }

function isNight(raw, canonical) {
  const time = text(raw?.time || canonical?.scene?.time).toLowerCase();
  const source = text(canonical?.lighting?.source_type).toLowerCase();
  return time === "night" || /night|streetlight|practical|mixed|dim|porch/iu.test(`${time} ${source} ${text(canonical?.lighting?.description)}`);
}

function locationKey(raw, sectionId) {
  if (sectionId === "carExterior") return text(raw?.carExteriorLocation || "parking").toLowerCase();
  return text(raw?.scene || raw?.scenario || sectionId).toLowerCase();
}

const PROFILES = Object.freeze({
  bedroom:Object.freeze({ level:"private", sentence:"The bedroom remains private and naturally lived-in, with small everyday placement irregularities and no unrelated background people or vehicles." }),
  mirror:Object.freeze({ level:"private", sentence:"The reflected room remains private and coherent, with ordinary lived-in details and no unrelated people or vehicles introduced into the reflection." }),
  car:Object.freeze({ level:"contained", sentence:"Outside the cabin, only sparse context-appropriate activity is visible through the glass; distant people and vehicles remain secondary and follow the same scene lighting." }),
  gym:Object.freeze({ level:"moderate", sentence:"The gym has restrained everyday activity: a few people use separate equipment at varied distances, some stations remain empty, and nobody poses for or stares at the selfie camera." }),
  street:Object.freeze({ level:"active", sentence:"Street life is distributed naturally across depth: a few pedestrians continue their own activities while parked and passing vehicles appear at irregular spacing; background people do not pose for or stare at the selfie camera." }),
  group:Object.freeze({ level:"contextual", sentence:"Unrelated background activity stays secondary to the group, with only context-appropriate distant people or vehicles continuing their own actions rather than reacting to the selfie." }),
  accidental:Object.freeze({ level:"contextual", sentence:"Background life continues independently of the accidental capture, with sparse scene-appropriate people or vehicles at varied distances and no staged reactions toward the camera." }),
  solo:Object.freeze({ level:"contextual", sentence:"Background activity stays restrained and scene-appropriate, with any distant people or vehicles continuing independent actions rather than posing for the selfie." }),
  custom:Object.freeze({ level:"contextual", sentence:"Background life matches the user-defined place and activity, remains secondary to the subject, and avoids unrelated crowds, duplicated vehicles, or staged reactions toward the camera." })
});

function carExteriorProfile(raw, night) {
  const location = locationKey(raw, "carExterior");
  if (/villa|home|driveway|garage/iu.test(location)) {
    return Object.freeze({ level:"low", sentence:`The residential background stays quiet${night ? " at night" : ""}: only a few naturally parked household vehicles or a distant passerby may appear, with empty space preserved and no crowd gathering around the subject.` });
  }
  if (/rest|stop|grocery|shop|store|mall/iu.test(location)) {
    return Object.freeze({ level:"moderate", sentence:`The public roadside setting has modest ${night ? "nighttime " : ""}activity: a few irregularly spaced parked vehicles and one or two distant people continue ordinary errands without looking toward the selfie camera.` });
  }
  return Object.freeze({ level:"low", sentence:`The parking area has restrained ${night ? "nighttime " : ""}life: a few irregularly spaced parked cars and at most one or two distant pedestrians continue their own activity, leaving believable empty bays and never gathering around the selfie.` });
}

export function resolveEnvironmentLife(raw = {}, canonical = {}, sectionId = "") {
  const id = text(sectionId || raw?.studioSection || canonical?.scene?.id || "custom");
  const night = isNight(raw, canonical);
  const profile = id === "carExterior" ? carExteriorProfile(raw, night) : (PROFILES[id] || PROFILES.custom);
  const lightingSentence = night && !["bedroom","mirror"].includes(id)
    ? "Background people, vehicles, pavement, and nearby surfaces respond to the same practical night light sources with consistent shadow direction and exposure."
    : "Background elements share the same scene lighting, perspective, and depth cues as the primary subject.";
  return Object.freeze({ section:id, time:night ? "night" : "day", activityLevel:profile.level, lifeSentence:profile.sentence, lightingSentence });
}

export function environmentLifeSentences(raw = {}, canonical = {}, sectionId = "") {
  const resolved = resolveEnvironmentLife(raw, canonical, sectionId);
  return Object.freeze([resolved.lifeSentence, resolved.lightingSentence]);
}

export default resolveEnvironmentLife;
