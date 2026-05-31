// Kuramoto Lattice Engine — 170T Scale
// 1024-dimensional oscillator network for synaptic-scale synchronization
// Implements phase coupling, order parameter tracking, and coherence measurement

import { SCALE } from "../scale/constants";

const TAU = Math.PI * 2;

export interface OscillatorState {
  phases: Float64Array;
  frequencies: Float64Array;
  orderParameter: number;
  coherence: number;
  step: number;
}

export interface LatticeConfig {
  dimension: number;
  coupling: number;
  baseFrequency: number;
  dt: number;
  noiseAmplitude: number;
}

const DEFAULT_LATTICE_CONFIG: LatticeConfig = {
  dimension: SCALE.kuramoto.dimension,
  coupling: SCALE.kuramoto.coupling,
  baseFrequency: SCALE.kuramoto.baseFrequency,
  dt: 0.001,
  noiseAmplitude: 0.01,
};

export class KuramotoLattice {
  private phases: Float64Array;
  private frequencies: Float64Array;
  private coupling: number;
  private dt: number;
  private noiseAmplitude: number;
  private step: number = 0;
  private _orderParameter: number = 0;
  private _coherence: number = 0;

  readonly dimension: number;

  constructor(config: Partial<LatticeConfig> = {}) {
    const c = { ...DEFAULT_LATTICE_CONFIG, ...config };
    this.dimension = c.dimension;
    this.coupling = c.coupling;
    this.dt = c.dt;
    this.noiseAmplitude = c.noiseAmplitude;

    this.phases = new Float64Array(c.dimension);
    this.frequencies = new Float64Array(c.dimension);

    for (let i = 0; i < c.dimension; i++) {
      this.phases[i] = Math.random() * TAU;
      this.frequencies[i] = c.baseFrequency + (Math.random() - 0.5) * 10;
    }
  }

  tick(steps: number = 1): void {
    for (let s = 0; s < steps; s++) {
      this.stepOnce();
      this.step++;
    }
    this.computeOrderParameter();
  }

  private stepOnce(): void {
    const N = this.dimension;
    const sinSum = new Float64Array(N);
    const cosSum = new Float64Array(N);

    // Compute mean field
    let globalSin = 0;
    let globalCos = 0;
    for (let i = 0; i < N; i++) {
      globalSin += Math.sin(this.phases[i]);
      globalCos += Math.cos(this.phases[i]);
    }
    globalSin /= N;
    globalCos /= N;

    // Update phases using mean-field coupling
    for (let i = 0; i < N; i++) {
      const meanFieldForce = this.coupling * (
        globalCos * Math.sin(this.phases[i]) -
        globalSin * Math.cos(this.phases[i])
      );

      const noise = this.noiseAmplitude * (Math.random() - 0.5) * 2;

      this.phases[i] += this.dt * (
        this.frequencies[i] * TAU - meanFieldForce + noise
      );

      // Wrap to [0, TAU)
      this.phases[i] = ((this.phases[i] % TAU) + TAU) % TAU;
    }
  }

  private computeOrderParameter(): void {
    const N = this.dimension;
    let sinSum = 0;
    let cosSum = 0;
    for (let i = 0; i < N; i++) {
      sinSum += Math.sin(this.phases[i]);
      cosSum += Math.cos(this.phases[i]);
    }
    sinSum /= N;
    cosSum /= N;
    this._orderParameter = Math.sqrt(sinSum * sinSum + cosSum * cosSum);
    this._coherence = this._orderParameter;
  }

  get orderParameter(): number {
    return this._orderParameter;
  }

  get coherence(): number {
    return this._coherence;
  }

  get state(): OscillatorState {
    return {
      phases: new Float64Array(this.phases),
      frequencies: new Float64Array(this.frequencies),
      orderParameter: this._orderParameter,
      coherence: this._coherence,
      step: this.step,
    };
  }

  injectPhase(index: number, phase: number): void {
    if (index >= 0 && index < this.dimension) {
      this.phases[index] = ((phase % TAU) + TAU) % TAU;
    }
  }

  setCoupling(k: number): void {
    this.coupling = Math.max(0, Math.min(2, k));
  }

  perturb(amplitude: number = 0.1): void {
    for (let i = 0; i < this.dimension; i++) {
      this.phases[i] += (Math.random() - 0.5) * amplitude * TAU;
      this.phases[i] = ((this.phases[i] % TAU) + TAU) % TAU;
    }
  }

  measureSLOPS(wallTimeMs: number, ticks: number): number {
    return (ticks * this.dimension) / (wallTimeMs / 1000);
  }
}
