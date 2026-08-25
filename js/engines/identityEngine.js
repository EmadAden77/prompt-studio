export class IdentityEngine {
  constructor(fixedData, imageAAuthority) {
    this.fixedData = fixedData;
    this.authority = imageAAuthority;
  }

  buildPersonText() {
    return `${this.fixedData.person.description}. Identity is controlled strictly and exclusively by IMAGE A.`;
  }

  buildLockText() {
    return `Depict the exact same real person photographed again, not a reconstructed, idealized, averaged, or merely similar face.
- Preserve ${this.authority.controls.join("; ")}.
- Do not transfer from IMAGE A: ${this.authority.doesNotControl.join("; ")}.
- A selected expression may move facial muscles naturally but must not alter skull shape, facial proportions, identity, or apparent age.
- Do not beautify, symmetrize, reshape, smooth, or make the face cleaner than the neck, body, clothing, or room.
- Preserve natural skin color variation and camera-captured texture without waxiness, artificial pore maps, invented blemishes, or excessive sharpening.
- Preserve the real hairline, density, wave pattern, and beard-growth gaps. Hair forms soft clumps with a restrained number of stray strands; beard edges remain natural rather than painted.`;
  }
}
