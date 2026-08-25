import assert from "node:assert/strict";
import { CLOTHING_CATALOG, EXTRA_CLOTHING_OPTIONS } from "../js/data/clothingData.js";

const expectedExtraIds = [
  "white_shirt_charcoal_trousers",
  "lightblue_shirt_navy_trousers",
  "black_shirt_charcoal_trousers",
  "olive_shirt_beige_chinos",
  "navy_shirt_stone_chinos",
  "burgundy_shirt_black_trousers",
  "sage_shirt_offwhite_chinos",
  "cream_shirt_olive_trousers",
  "palegrey_shirt_navy_trousers",
  "denimshirt_tan_chinos",
  "white_tee_olive_chinos",
  "black_tee_beige_chinos",
  "navy_polo_grey_trousers",
  "sand_polo_navy_chinos"
];

assert.deepEqual(EXTRA_CLOTHING_OPTIONS.map((item) => item.id), expectedExtraIds);
assert.equal(new Set(CLOTHING_CATALOG.map((item) => item.id)).size, CLOTHING_CATALOG.length, "Expanded clothing IDs must be unique");
assert.ok(CLOTHING_CATALOG.length >= 30, "Expanded clothing catalog should contain at least 30 realistic outfits");

for (const outfit of EXTRA_CLOTHING_OPTIONS) {
  assert.equal(outfit.category, "casual");
  assert.ok(outfit.name_ar && outfit.name_en && outfit.pieces, `Expanded clothing metadata must be complete: ${outfit.id}`);
  for (const key of ["type", "weight", "sheen", "drape", "folds", "texture", "wear"]) {
    assert.ok(outfit.fabric?.[key], `Expanded clothing fabric field ${key} must exist: ${outfit.id}`);
  }
  assert.match(outfit.pieces, /(shirt|t-shirt|polo)/u, `Expanded outfit must include a shirt/top: ${outfit.id}`);
  assert.match(outfit.pieces, /(trousers|chinos)/u, `Expanded outfit must include trousers/chinos: ${outfit.id}`);
}

console.log("✓ expanded shirt + trouser color catalog passed");
