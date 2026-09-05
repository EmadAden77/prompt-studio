import {
  CLOTHING_CATALOG,
  CLOTHING_OPTIONS,
  TRADITIONAL,
  getClothingCatalog,
  getClothingOptions
} from "./clothing-authority.js";

export const CAR_EXTERIOR_TRADITIONAL_OPTIONS = TRADITIONAL;
export const CAR_EXTERIOR_CLOTHING_CATALOG = CLOTHING_CATALOG;
export const CAR_EXTERIOR_CLOTHING_OPTIONS = CLOTHING_OPTIONS;

export function getCarExteriorClothingCatalog() { return getClothingCatalog(); }
export function getCarExteriorClothingOptions() { return getClothingOptions(); }
