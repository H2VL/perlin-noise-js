export const randomUnitVector = () => {
  let theta = Math.random() * 2 * Math.PI;
  return { x: Math.cos(theta), y: Math.sin(theta) };
};

// Function to transition smoothly from 0.0 to 1.0 in the range [0.0, 1.0]
const smoothstep = (w) => {
  if (w <= 0.0) return 0.0;
  if (w >= 1.0) return 1.0;
  return w * w * (3.0 - 2.0 * w);
};

// Function to interpolate smoothly between a0 and a1
// Weight w should be in the range [0.0, 1.0]
const interpolate = (a0, a1, w) => {
  return a0 + (a1 - a0) * smoothstep(w);
};

export class PerlinNoise {
  constructor() {
    this.gradients = {};
    this.memory = {};
  }

  // Computes the dot product of the distance and gradient vectors.
  dotGridGradient(ix, iy, x, y) {
    let gradientVector;
    const distanceVector = { x: x - ix, y: y - iy };

    if (this.gradients[[ix, iy]]) {
      gradientVector = this.gradients[[ix, iy]];
    } else {
      gradientVector = randomUnitVector();
      this.gradients[[ix, iy]] = gradientVector;
    }
    // Compute the dot-product
    return distanceVector.x * gradientVector.x + distanceVector.y * gradientVector.y;
  }

  // Compute Perlin noise at coordinates x, y
  perlin(x, y) {
    if (this.memory.hasOwnProperty([x, y])) {
      return this.memory[[x, y]];
    }

    // Determine grid cell coordinates
    const x0 = Math.floor(x);
    const x1 = x0 + 1;
    const y0 = Math.floor(y);
    const y1 = y0 + 1;

    // Determine interpolation weights
    // Could also use higher order polynomial/s-curve here
    const sx = x - x0;
    const sy = y - y0;

    // Interpolate between grid point gradients
    let n0, n1, ix0, ix1, intensity;
    n0 = this.dotGridGradient(x0, y0, x, y);
    n1 = this.dotGridGradient(x1, y0, x, y);
    ix0 = interpolate(n0, n1, sx);
    n0 = this.dotGridGradient(x0, y1, x, y);
    n1 = this.dotGridGradient(x1, y1, x, y);
    ix1 = interpolate(n0, n1, sx);
    intensity = interpolate(ix0, ix1, sy);

    this.memory[[x, y]] = intensity;

    return intensity;
  }
}
