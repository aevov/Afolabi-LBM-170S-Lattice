// Lattice-Boltzmann Distribution Function for 170T scale
// Maps consciousness flow through the N² connection volume

import { SCALE } from "../scale/constants";

export type D3Q19Velocity = [number, number, number];

// D3Q19 lattice velocities (3D, 19 directions)
export const D3Q19: D3Q19Velocity[] = [
  [0, 0, 0],
  [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];

export const D3Q19_WEIGHTS: number[] = [
  1/3,
  1/18, 1/18, 1/18, 1/18, 1/18, 1/18,
  1/36, 1/36, 1/36, 1/36,
  1/36, 1/36, 1/36, 1/36,
  1/36, 1/36, 1/36, 1/36,
];

export interface LBMConfig {
  nx: number;
  ny: number;
  nz: number;
  tau: number; // Relaxation time
  viscosity: number;
}

export class LatticeBoltzmann {
  private f: Float64Array;      // Distribution functions
  private feq: Float64Array;    // Equilibrium distributions
  private rho: Float64Array;    // Density field
  private ux: Float64Array;     // Velocity x
  private uy: Float64Array;     // Velocity y
  private uz: Float64Array;     // Velocity z

  readonly nx: number;
  readonly ny: number;
  readonly nz: number;
  readonly totalNodes: number;
  private tau: number;

  constructor(config: LBMConfig) {
    this.nx = config.nx;
    this.ny = config.ny;
    this.nz = config.nz;
    this.tau = config.tau;
    this.totalNodes = config.nx * config.ny * config.nz;

    const size = this.totalNodes;
    this.f = new Float64Array(size * 19);
    this.feq = new Float64Array(size * 19);
    this.rho = new Float64Array(size);
    this.ux = new Float64Array(size);
    this.uy = new Float64Array(size);
    this.uz = new Float64Array(size);

    this.initialize();
  }

  private initialize(): void {
    for (let i = 0; i < this.totalNodes; i++) {
      this.rho[i] = 1.0;
      for (let q = 0; q < 19; q++) {
        this.f[i * 19 + q] = D3Q19_WEIGHTS[q];
      }
    }
  }

  step(): void {
    this.collide();
    this.stream();
    this.computeMacroscopic();
  }

  private collide(): void {
    for (let i = 0; i < this.totalNodes; i++) {
      const rho = this.rho[i];
      const ux = this.ux[i];
      const uy = this.uy[i];
      const uz = this.uz[i];
      const uSq = ux * ux + uy * uy + uz * uz;

      for (let q = 0; q < 19; q++) {
        const [cx, cy, cz] = D3Q19[q];
        const cu = cx * ux + cy * uy + cz * uz;
        const feq = D3Q19_WEIGHTS[q] * rho * (1 + 3 * cu + 4.5 * cu * cu - 1.5 * uSq);
        const idx = i * 19 + q;
        this.f[idx] += -(this.f[idx] - feq) / this.tau;
      }
    }
  }

  private stream(): void {
    const newF = new Float64Array(this.f.length);
    for (let z = 0; z < this.nz; z++) {
      for (let y = 0; y < this.ny; y++) {
        for (let x = 0; x < this.nx; x++) {
          const i = z * this.ny * this.nx + y * this.nx + x;
          for (let q = 0; q < 19; q++) {
            const [cx, cy, cz] = D3Q19[q];
            const nx = (x + cx + this.nx) % this.nx;
            const ny = (y + cy + this.ny) % this.ny;
            const nz = (z + cz + this.nz) % this.nz;
            const ni = nz * this.ny * this.nx + ny * this.nx + nx;
            newF[ni * 19 + q] = this.f[i * 19 + q];
          }
        }
      }
    }
    this.f.set(newF);
  }

  private computeMacroscopic(): void {
    for (let i = 0; i < this.totalNodes; i++) {
      let rho = 0;
      let ux = 0;
      let uy = 0;
      let uz = 0;
      for (let q = 0; q < 19; q++) {
        const fq = this.f[i * 19 + q];
        const [cx, cy, cz] = D3Q19[q];
        rho += fq;
        ux += fq * cx;
        uy += fq * cy;
        uz += fq * cz;
      }
      this.rho[i] = rho;
      this.ux[i] = ux / (rho || 1);
      this.uy[i] = uy / (rho || 1);
      this.uz[i] = uz / (rho || 1);
    }
  }

  getDensity(x: number, y: number, z: number): number {
    return this.rho[z * this.ny * this.nx + y * this.nx + x];
  }

  getVelocity(x: number, y: number, z: number): [number, number, number] {
    const i = z * this.ny * this.nx + y * this.nx + x;
    return [this.ux[i], this.uy[i], this.uz[i]];
  }

  getTotalEnergy(): number {
    let energy = 0;
    for (let i = 0; i < this.totalNodes; i++) {
      energy += 0.5 * this.rho[i] * (
        this.ux[i] ** 2 + this.uy[i] ** 2 + this.uz[i] ** 2
      );
    }
    return energy;
  }
}
