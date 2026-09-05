# Phase 27 — Glass realism lock

Phase 27 preserves the complete 2017 Range Rover Sport authority while replacing the ambiguous `tinted rear glass` wording with transparent, lightly factory-tinted glass. Exterior daylight, exterior night, and cabin views now receive deterministic scene-specific glass behavior.

- Day exterior: sky/environment reflections plus faint Ivory cabin visibility; never solid black.
- Night exterior: reflected streetlights plus a dim cabin view; never opaque panels.
- Interior: panoramic roof reveals the actual sky or stars; side windows retain the exterior and natural reflections.
- Negative prompt: blocks opaque black windows, solid black glass, blacked-out windows, and black panel roofs.
- Validation: ≤250 words, 10/10 deterministic output, immutable hard constraints, and zero `tinted rear glass` occurrences in JavaScript source.
