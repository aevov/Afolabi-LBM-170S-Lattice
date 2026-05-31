// Wu Xing (五行) — Five Phase Cycle System
// The five elements/phases govern the flow of energy and state transitions
// in the lattice. They encode generative (生 shēng) and destructive (克 kè) cycles.

export type Phase =
  | "mu"    // 木 Wood — growth, expansion, spring
  | "huo"   // 火 Fire — peak, transformation, summer
  | "tu"    // 土 Earth — stability, centering, late summer
  | "jin"   // 金 Metal — contraction, refinement, autumn
  | "shui"; // 水 Water — stillness, potential, winter

export interface PhaseState {
  current: Phase;
  energy: Record<Phase, number>;
  dominantCycle: "sheng" | "ke" | "balanced";
  cyclePosition: number; // 0-1 within current phase
  transitionReadiness: number; // 0-1
}

// Generative cycle: Wood → Fire → Earth → Metal → Water → Wood
const SHENG_CYCLE: Phase[] = ["mu", "huo", "tu", "jin", "shui"];

// Destructive cycle: Wood → Earth → Water → Fire → Metal → Wood
const KE_CYCLE: Phase[] = ["mu", "tu", "shui", "huo", "jin"];

export function nextSheng(phase: Phase): Phase {
  const idx = SHENG_CYCLE.indexOf(phase);
  return SHENG_CYCLE[(idx + 1) % 5];
}

export function nextKe(phase: Phase): Phase {
  const idx = KE_CYCLE.indexOf(phase);
  return KE_CYCLE[(idx + 1) % 5];
}

export function generates(a: Phase): Phase {
  return nextSheng(a);
}

export function overcomes(a: Phase): Phase {
  return nextKe(a);
}

export interface WuXingConfig {
  transitionThreshold: number;  // Energy needed to advance phase
  decayRate: number;            // How fast non-dominant phases decay
  generationRate: number;       // How fast parent feeds child
  destructionRate: number;      // How fast controller drains target
}

const DEFAULT_CONFIG: WuXingConfig = {
  transitionThreshold: 0.8,
  decayRate: 0.02,
  generationRate: 0.05,
  destructionRate: 0.03,
};

export class WuXingEngine {
  private state: PhaseState;
  private config: WuXingConfig;
  private step: number = 0;

  constructor(initialPhase: Phase = "mu", config: Partial<WuXingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      current: initialPhase,
      energy: { mu: 0.5, huo: 0.2, tu: 0.2, jin: 0.2, shui: 0.2 },
      dominantCycle: "balanced",
      cyclePosition: 0,
      transitionReadiness: 0,
    };
    this.state.energy[initialPhase] = 0.5;
  }

  tick(input: Partial<Record<Phase, number>> = {}): PhaseState {
    this.step++;

    // Apply external input
    for (const [phase, amount] of Object.entries(input)) {
      this.state.energy[phase as Phase] = Math.min(1,
        this.state.energy[phase as Phase] + (amount ?? 0)
      );
    }

    // Generative cycle: current phase feeds the next
    const child = nextSheng(this.state.current);
    this.state.energy[child] = Math.min(1,
      this.state.energy[child] + this.config.generationRate * this.state.energy[this.state.current]
    );

    // Destructive cycle: current phase controls its target
    const target = nextKe(this.state.current);
    this.state.energy[target] = Math.max(0,
      this.state.energy[target] - this.config.destructionRate * this.state.energy[this.state.current]
    );

    // Decay non-current phases
    for (const phase of SHENG_CYCLE) {
      if (phase !== this.state.current) {
        this.state.energy[phase] = Math.max(0,
          this.state.energy[phase] - this.config.decayRate
        );
      }
    }

    // Advance cycle position
    this.state.cyclePosition += 0.01 * this.state.energy[this.state.current];

    // Check transition
    this.state.transitionReadiness = this.state.energy[child] / this.config.transitionThreshold;
    if (this.state.energy[child] >= this.config.transitionThreshold) {
      this.transition();
    }

    // Determine dominant cycle
    this.determineDominantCycle();

    return this.getState();
  }

  private transition(): void {
    const next = nextSheng(this.state.current);
    this.state.current = next;
    this.state.cyclePosition = 0;
    this.state.transitionReadiness = 0;
  }

  private determineDominantCycle(): void {
    const current = this.state.current;
    const child = nextSheng(current);
    const target = nextKe(current);

    const shengStrength = this.state.energy[child];
    const keStrength = 1 - this.state.energy[target];

    if (shengStrength > keStrength + 0.2) {
      this.state.dominantCycle = "sheng";
    } else if (keStrength > shengStrength + 0.2) {
      this.state.dominantCycle = "ke";
    } else {
      this.state.dominantCycle = "balanced";
    }
  }

  getState(): PhaseState {
    return { ...this.state, energy: { ...this.state.energy } };
  }

  getCurrentPhase(): Phase {
    return this.state.current;
  }

  getPhaseEnergy(phase: Phase): number {
    return this.state.energy[phase];
  }

  inject(phase: Phase, amount: number): void {
    this.state.energy[phase] = Math.min(1, this.state.energy[phase] + amount);
  }

  forceTransition(to: Phase): void {
    this.state.current = to;
    this.state.cyclePosition = 0;
  }
}

// Map phases to lattice operations
export const PHASE_LATTICE_MAP: Record<Phase, string> = {
  mu: "lattice.expand",      // Wood: grow the lattice, spawn new nodes
  huo: "lattice.transform",  // Fire: reconfigure connections, peak compute
  tu: "lattice.stabilize",   // Earth: consolidate, checkpoint, balance
  jin: "lattice.refine",     // Metal: prune, optimize, compress
  shui: "lattice.rest",      // Water: cool, store potential, prepare
};

// Map phases to governance actions
export const PHASE_MANDATE_MAP: Record<Phase, string> = {
  mu: "mandate.bestow",      // Wood: new mandates granted, growth
  huo: "mandate.audit",      // Fire: intense scrutiny, transformation
  tu: "mandate.sustain",     // Earth: maintain current order
  jin: "mandate.refine",     // Metal: tighten requirements, prune unworthy
  shui: "mandate.reflect",   // Water: assess long-term patterns
};
