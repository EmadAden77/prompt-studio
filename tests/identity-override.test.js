"use strict";

import("./canonical-v3-identity-override.mjs").catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
