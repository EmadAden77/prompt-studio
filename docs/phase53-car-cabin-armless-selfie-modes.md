# Phase 53 — Car Cabin Armless Selfie Modes

Status: implemented for the `car` interior section only.

## Scope

Phase 53 adds six tight in-cabin armless selfie modes while keeping `carExterior` vehicle-body fidelity separate. Car armless prompts contain cabin materials and LHD geometry only: Ivory perforated leather, dark wood veneer, transparent panoramic glass, Ivory headliner and cabin lighting. Exterior specification tokens such as grille, alloys, DRL and Fuji White exterior are rejected from the generated armless prompt.

## Added poses

- `driver-close-armless` — eye level; headrest, B-pillar, window edge, steering-wheel top arc at the bottom.
- `driver-low-armless` — slightly below eye level; headliner, sun visor and panoramic roof.
- `driver-side-armless` — three-quarter; door wood trim and one side-window edge.
- `driver-roof-armless` — roof tilt; transparent panoramic glass with physically visible real sky/stars.
- `passenger-close-armless` — eye level; center-console side, no steering wheel in frame.
- `rear-seat-armless` — eye level; softly blurred front headrests in the near foreground.

All six appear in the car pose dropdown with the Arabic suffix `(الذراع خارج الإطار)`.

## Capture contract

Armless modes use `ARMLESS_LOCK`, a tight head-and-shoulders crop, near-field selfie projection, mild wide-angle perspective and a small natural tilt. The phone-holding arm and hand remain fully outside the frame. The free hand may rest on the steering wheel when appropriate, center console, lap, or remain outside the frame.

The 195 cm scale cue is preserved by requiring the shoulders to fill the seatback naturally and the head to sit close to the headliner. Panoramic glass remains transparent and can never become an opaque black roof panel.

## Lighting

Armless prompts use car-only lighting:

- day: daylight through transparent cabin glass;
- night: dim cabin ambient plus restrained dash glow;
- night-flash: phone flash plus dim cabin ambient and restrained dash glow.

`driver-roof-armless` at night allows a physically plausible real night sky and stars through the transparent panoramic roof. Exterior street/building/vehicle lighting sentences are excluded from this mode family.

## Isolation and tests

`tests/canonical-v3-car-armless-phase53.mjs` checks all six modes for:

- `ARMLESS_LOCK` present and old visible-arm wording absent;
- LHD and cabin anchors present;
- exterior-spec tokens absent;
- car-only day/night/night-flash behavior;
- transparent glass behavior;
- identity lock and 195 cm cabin scale;
- `<=250` words;
- deterministic output across ten repeated builds;
- UI option labels and tight-crop AUTO selection.

The test is wired into `.github/workflows/test.yml`.
