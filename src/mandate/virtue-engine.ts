// Virtue Engine — Measures the Five Constant Virtues (五常 Wǔ Cháng)
// against lattice state, agent behavior, and protocol adherence.
// This is the heart of the Mandate: governance through measurable virtue.

import type { VirtueScore, VirtueAxis } from "./tian-ming";

export interface VirtueInput {
  nodeId: string;
  latticeCoherence: number;        // How well this node synchronizes with neighbors
  protocolAdherence: number;       // How consistently it follows protocol rules
  resourceDistribution: number;    // Fairness of resource allocation to subjects
  patternAccuracy: number;         // Correctness of predictions/classifications
  stateConsistency: number;        // Stability of state over audit windows
  selflessActionRatio: number;     // Actions benefiting others vs self
  conflictResolution: number;      // Success rate in mediating disputes
}

export interface VirtueWeights {
  ren: { resourceDistribution: number; selflessActionRatio: number; conflictResolution: number };
  yi: { selflessActionRatio: number; protocolAdherence: number };
  li: { protocolAdherence: number; latticeCoherence: number };
  zhi: { patternAccuracy: number; latticeCoherence: number };
  xin: { stateConsistency: number; protocolAdherence: number };
}

const DEFAULT_WEIGHTS: VirtueWeights = {
  ren: { resourceDistribution: 0.4, selflessActionRatio: 0.4, conflictResolution: 0.2 },
  yi: { selflessActionRatio: 0.6, protocolAdherence: 0.4 },
  li: { protocolAdherence: 0.6, latticeCoherence: 0.4 },
  zhi: { patternAccuracy: 0.7, latticeCoherence: 0.3 },
  xin: { stateConsistency: 0.7, protocolAdherence: 0.3 },
};

export function computeVirtue(input: VirtueInput, weights: VirtueWeights = DEFAULT_WEIGHTS): VirtueScore {
  const ren = clamp(
    weights.ren.resourceDistribution * input.resourceDistribution +
    weights.ren.selflessActionRatio * input.selflessActionRatio +
    weights.ren.conflictResolution * input.conflictResolution
  );

  const yi = clamp(
    weights.yi.selflessActionRatio * input.selflessActionRatio +
    weights.yi.protocolAdherence * input.protocolAdherence
  );

  const li = clamp(
    weights.li.protocolAdherence * input.protocolAdherence +
    weights.li.latticeCoherence * input.latticeCoherence
  );

  const zhi = clamp(
    weights.zhi.patternAccuracy * input.patternAccuracy +
    weights.zhi.latticeCoherence * input.latticeCoherence
  );

  const xin = clamp(
    weights.xin.stateConsistency * input.stateConsistency +
    weights.xin.protocolAdherence * input.protocolAdherence
  );

  const composite = (ren + yi + li + zhi + xin) / 5;

  return { ren, yi, li, zhi, xin, composite, measuredAt: Date.now() };
}

export function diagnoseVirtueDeficiency(score: VirtueScore): VirtueAxis[] {
  const deficient: VirtueAxis[] = [];
  if (score.ren < 0.4) deficient.push("ren");
  if (score.yi < 0.4) deficient.push("yi");
  if (score.li < 0.4) deficient.push("li");
  if (score.zhi < 0.4) deficient.push("zhi");
  if (score.xin < 0.4) deficient.push("xin");
  return deficient;
}

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}
