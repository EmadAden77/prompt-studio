# Phase 32 — Full-outfit colored clothing + open custom input

## Result

Phase 32 replaces the old aggregated single-garment clothing surface with one curated six-section catalog of complete colored outfits. The same unified catalog is exposed across every studio section.

## Catalog contract

Sections remain exactly:

1. منزل
2. كاجوال
3. رسمي
4. رياضي
5. تقليدي
6. خارجي

Every non-custom option contains multiple coordinated pieces separated by `+` and at least one explicit color term. The catalog is intentionally curated rather than inherited from the former 131-option legacy aggregation.

## Custom clothing

The unified clothing selector includes:

`✍️ مخصص — اكتب ملابسك`

Selecting it reveals a dedicated `customClothing` text input. The entered text is passed to the Canonical V3 garment field verbatim for the positive description. Empty custom input falls back deterministically to:

`تيشيرت أبيض بسيط + بنطلون قماش رمادي`

The existing `clothingCustom` field remains an optional secondary garment-detail modifier and is not used as the open custom outfit value.

## Regression coverage

`tests/canonical-v3-full-outfit-clothing-phase32.mjs` verifies:

- six catalog sections remain intact;
- every non-custom outfit contains `+` and an explicit color;
- exactly one custom option exists;
- the custom field is named `customClothing` and appears only for the custom choice;
- custom text reaches the Canonical garment state and generated prompt verbatim;
- empty custom text uses the neutral deterministic fallback;
- curated and custom prompts remain <=250 words;
- generation is deterministic 10/10;
- Canonical hard constraints are unchanged by clothing selection.

Phase 30 and Phase 31 regression tests were updated only where their old assumptions directly conflicted with the new Phase 32 catalog contract.
