# Phase 49 — Night Physics Engine

Phase 49 extends the live Phase 48 context-aware environment pipeline with deterministic physical rules for smartphone night captures. The production gate uses `canonical-v3-phase49.js`.

## Night-only physical contract

1. **Visible source** — every night capture names a dominant visible light source such as a streetlamp, shopfront, phone screen, car interior light, neon sign, villa porch light, or phone flash.
2. **Color cast** — the named source creates a matching local cast on skin, clothing, hair, or nearby surfaces. Warm sodium/porch light is yellow-orange; cool LED is neutral-cool; neon/sign light creates localized colored reflections.
3. **ISO grain** — raised phone ISO introduces subtle grain, shadow noise, and mild loss of fine detail while preserving natural skin texture.
4. **Motion blur** — moving captures can show slight hand/hair blur and passing-car light streaks; stationary captures do not receive forced subject blur.
5. **Shadow integrity** — a clearly lit face cannot float against unexplained pitch-blackness. Shadows must remain attributable to the named source.
6. **Flash mode** — available at night for `solo`, `street`, and `carExterior`; direct phone flash makes the close face brighter, the background darker, shadows shorter/harder, and adds slight realistic skin/eye sheen.
7. **Exposure balance** — the prompt favors either a clearer face with a darker background or visible background lights with a naturally dimmer face. It never requests both to be perfectly bright.
8. **Night stays night** — computational shadow lifting is allowed, but darkness remains visibly nocturnal and cannot become daylight.

## Routing and protection

- Phase 49 appends the night-physics contract after the existing lighting sentence.
- Explicit `time=day|morning|afternoon|sunset|dawn|noon` has authority over generic practical-light metadata, preventing night leakage into day prompts.
- Night-physics sentences are protected from budget trimming.
- Identity lock, selfie arm lock, 195 cm / 88 kg body authority, Range Rover authority, and selected shemagh/iqal or ghutra/iqal remain protected.
- Word budgets remain `<=280` for `carExterior` and `<=250` for other sections.
- Output remains deterministic at 10/10.

## UI

The lighting selector exposes `فلاش الهاتف المباشر` only when the selected time is `night` and the active section is `solo`, `street`, or `carExterior`. The temporary Phase 49 option is removed when switching to day or to another section.

## Tests

`tests/canonical-v3-night-physics-phase49.mjs` verifies named sources, matching color casts, ISO behavior, motion behavior, shadow integrity, exposure balance, flash physics, night preservation, zero day leakage, budget limits, determinism, and protection of identity/selfie/traditional headwear constraints.

The full GitHub Actions workflow includes Phase 49 after Phase 48, while the Phase 46 historical behavior suite recognizes Phase 49 as the current live production gate.
