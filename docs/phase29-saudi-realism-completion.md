# Phase 29 — Saudi realism completion

Phase 29 completes the previously approved Saudi-realism merge without adding a parallel prompt system.

- Adds three deterministic Saudi place details inside the existing `SAUDI_REALISM_MODIFIERS`: neighborhood bufia cafe, older service alley with utility wires/AC units, and ordinary street construction.
- Maps existing street moods to those details (`cafe`, `normal`, `rush`) while preserving the Phase 28 generic day/night behavior for the other automatic moods.
- Adds one daylight-only camera-imperfection sentence for slight edge chromatic aberration, a small natural sun flare, grainy shadows, and slightly blown direct-light highlights.
- Adds a candid mid-speech helper only when the selected pose/expression already requests speaking; eyes stay naturally open and identity-preserving.
- Explicitly avoids the rejected identity-breaking or over-processing wording: squinting eyes, extreme, chaotic, and zero beauty filters.
- Keeps output deterministic, canonical state read-only, and the final prompt budget at 250 words or fewer in the Phase 29 regression cases.
