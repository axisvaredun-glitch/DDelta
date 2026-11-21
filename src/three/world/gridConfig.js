/** Satu sumber skala: mesh lantai, shader garis, spawn holo, partikel. */
export const GRID = {
  floorSize: 60,
  segments: 90,
  majorEvery: 5,
  claimRadiusFactor: 1.35,
  horizonFadeEnd: 2,
  particleSpreadFactor: 0.92,
};

Object.defineProperty(GRID, 'cell', {
  get() {
    return this.floorSize / this.segments;
  },
});

Object.defineProperty(GRID, 'majorCell', {
  get() {
    return this.cell * this.majorEvery;
  },
});

Object.defineProperty(GRID, 'minorLineScale', {
  get() {
    return 1 / this.cell;
  },
});

Object.defineProperty(GRID, 'majorLineScale', {
  get() {
    return 1 / this.majorCell;
  },
});

Object.defineProperty(GRID, 'claimRadius', {
  get() {
    return this.cell * this.claimRadiusFactor;
  },
});

Object.defineProperty(GRID, 'horizonFadeStart', {
  get() {
    return this.floorSize * 0.47;
  },
});

Object.defineProperty(GRID, 'particleSpread', {
  get() {
    return this.floorSize * this.particleSpreadFactor;
  },
});

export const SUBJECT_ANCHOR_Y = 0.55;