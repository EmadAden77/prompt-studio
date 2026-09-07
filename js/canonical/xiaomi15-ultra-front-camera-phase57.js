/**
 * Phase 57 — Xiaomi 15 Ultra front-camera realism contract.
 * Camera facts are kept separate from aesthetic claims so prompts describe
 * plausible smartphone behaviour rather than inventing DSLR optics.
 */
const text=value=>String(value??"").trim().toLowerCase();

export const XIAOMI_15_ULTRA_FRONT_CAMERA=Object.freeze({
  device:"Xiaomi 15 Ultra front camera",
  focalLengthEquivalentMm:21,
  aperture:"f/2.0",
  fieldOfViewDegrees:90,
  resolution:"32 MP",
  sensor:"1/3.6-inch-class",
  captureLanguage:"smartphone front camera"
});

export function resolveXiaomi15UltraCaptureMode(raw={}){
  const lighting=text(raw.lighting);
  const time=text(raw.time);
  if(/mixed|screen.*led|led.*screen|window.*lamp|lamp.*window/u.test(lighting)) return "mixed";
  if(time==="day"||/day|sun|window|overcast|shade|morning|afternoon/u.test(lighting)) return "day";
  return "night";
}

export function describeXiaomi15UltraFrontCamera(raw={}){
  if(text(raw.accidentalDevice)==="iphone") return "";
  return "Xiaomi 15 Ultra front camera with a natural wide arm-length perspective: the near face is subtly larger, edges stay slightly softer, and no artificial portrait blur is applied.";
}

export function describeXiaomi15UltraProcessing(raw={}){
  const mode=resolveXiaomi15UltraCaptureMode(raw);
  if(mode==="day") return "Phone rendering: restrained HDR protects bright sky and sunlit skin without flattening directional shadows; natural color and local contrast stay believable.";
  if(mode==="mixed") return "Phone rendering: mixed practical sources keep their local warm/cool casts; restrained HDR avoids lifting every shadow, and the face/background exposure tradeoff remains visible.";
  return "Phone rendering: low-light denoising softens only fine distant detail; mild luminance/chroma noise, modest dark-color desaturation, and source-matched white balance remain visible.";
}

export function buildXiaomi15UltraRealismContract(raw={}){
  const mode=resolveXiaomi15UltraCaptureMode(raw);
  return Object.freeze({
    active:text(raw.accidentalDevice)!=="iphone",
    device:XIAOMI_15_ULTRA_FRONT_CAMERA.device,
    focalLengthEquivalentMm:XIAOMI_15_ULTRA_FRONT_CAMERA.focalLengthEquivalentMm,
    aperture:XIAOMI_15_ULTRA_FRONT_CAMERA.aperture,
    fieldOfViewDegrees:XIAOMI_15_ULTRA_FRONT_CAMERA.fieldOfViewDegrees,
    sensor:XIAOMI_15_ULTRA_FRONT_CAMERA.sensor,
    mode,
    noArtificialBokeh:true,
    noStudioHDR:true,
    deterministic:"10/10"
  });
}
