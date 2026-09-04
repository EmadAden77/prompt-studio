# Canonical V3 Comparison Reports

Generated from the seven frozen Phase 1 golden inputs.

## Phase 5 — Frozen old-vs-new baseline

This preserved baseline is the original Phase 5 result from commit `ce00c39`.

| Case | Old words | Canonical V3 words | Word reduction | Old repeated facts | New repeated facts | Determinism |
|---|---:|---:|---:|---:|---:|:---:|
| Car LHD driver selfie | 368 | 190 | 48% | 6 | 1 | 10/10 |
| Car tight crop | 363 | 148 | 59% | 6 | 1 | 10/10 |
| Bedroom direct selfie | 230 | 138 | 40% | 3 | 1 | 10/10 |
| Mirror selfie | 235 | 99 | 58% | 3 | 1 | 10/10 |
| Group selfie | 259 | 112 | 57% | 3 | 1 | 10/10 |
| Accidental capture | 284 | 91 | 68% | 4 | 1 | 10/10 |
| Identity + eyewear | 215 | 142 | 34% | 3 | 1 | 10/10 |

### Phase 5 aggregate metrics

- Average prompt length: **279 words legacy** vs **131 words Canonical V3**.
- Repeated semantic-fact signals: **28 legacy** vs **7 Canonical V3**.
- Canonical V3 determinism: **10/10** for every case.

## Phase 7 — Complete realism stack

Phase 7 adds five read-only adapter realism layers over the same frozen Canonical V3 state:

1. `describeNaturalImperfections()`
2. `describeLightingPhysics()`
3. `describeCameraArtifacts()`
4. `describeEnvironmentalDetails()`
5. `describePostProcessing()`

Each layer is deterministic, positive-description-only, sparse, and adapter-owned. None modifies canonical authorities, hard constraints, identity, camera geometry, or scene state.

### Step-by-step prompt length

| Case | Step 2 imperfections | Step 3 lighting | Step 4 camera artifacts | Step 5 environment | Step 6 post-processing | Final ≤250 |
|---|---:|---:|---:|---:|---:|:---:|
| Car LHD driver selfie | 209 | 219 | 228 | 235 | **242** | yes |
| Car tight crop | 155 | 165 | 174 | 181 | **188** | yes |
| Bedroom direct selfie | 157 | 167 | 176 | 183 | **199** | yes |
| Mirror selfie | 106 | 116 | 125 | 132 | **148** | yes |
| Group selfie | 119 | 129 | 138 | 138 | **154** | yes |
| Accidental capture | 98 | 108 | 124 | 131 | **147** | yes |
| Identity + eyewear | 161 | 171 | 180 | 180 | **196** | yes |

### Final Step 6 deltas

| Case | Step 5 words | Step 6 words | Post-processing phrases | Step 6 delta | Determinism |
|---|---:|---:|---:|---:|:---:|
| Car LHD driver selfie | 235 | **242** | 1 | +7 | 10/10 |
| Car tight crop | 181 | **188** | 1 | +7 | 10/10 |
| Bedroom direct selfie | 183 | **199** | 2 | +16 | 10/10 |
| Mirror selfie | 132 | **148** | 2 | +16 | 10/10 |
| Group selfie | 138 | **154** | 2 | +16 | 10/10 |
| Accidental capture | 131 | **147** | 2 | +16 | 10/10 |
| Identity + eyewear | 180 | **196** | 2 | +16 | 10/10 |

### Complete realism stack summary

- Final average prompt length: **182 words** across the seven golden cases.
- Final range: **147–242 words**.
- Prompt-length cap: **7/7** final prompts are at or below **250 words**.
- Car LHD final prompt: **242 words**, leaving an **8-word margin**.
- Natural-imperfection signals: **13** total.
- Lighting-physics signals: **7** total.
- Camera-artifact signals: **8** total.
- Environmental-detail signals: **5** total.
- Post-processing signals: **12** total.
- Complete realism stack signals: **45** total across all five layers.
- Determinism: **10/10 identical outputs for all seven final cases**.
- Repeated semantic-fact signals remain unchanged by Step 6.
- Vehicle scenes receive at most one post-processing phrase; room scenes receive at most two.
- Final post-processing text contains no HDR, beauty-filter, or smoothing wording.

### Step 6 phrase priority

1. `Realistic dynamic range with natural highlight rolloff.` when a real device profile is present.
2. `Authentic white balance matched to the dominant light source.` when `lighting.source_type` is resolved.
3. `Minimal retouching preserves natural skin and fabric texture.` when reference identity is preserved.

Vehicle scenes stop after the first applicable phrase. Room scenes stop after the first two applicable phrases. Other supported scenes remain capped at two phrases.
