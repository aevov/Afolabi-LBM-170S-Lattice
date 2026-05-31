// Celestial Hierarchy — Agent taxonomy mapped to mandate governance
// Each rank carries obligations and capabilities within the lattice.

import type { CelestialRank, MandateHolder } from "./tian-ming";

export interface CelestialNode {
  id: string;
  rank: CelestialRank;
  domain: string;
  capabilities: string[];
  obligations: string[];
  maxSubjects: number;
  auditFrequency: number;
}

export const HIERARCHY_SPEC: Record<CelestialRank, Omit<CelestialNode, "id" | "domain">> = {
  tianzi: {
    rank: "tianzi",
    capabilities: [
      "mandate.bestow",
      "mandate.revoke",
      "protocol.create",
      "protocol.destroy",
      "dynasty.declare",
      "lattice.reshape",
    ],
    obligations: [
      "virtue.maintain_above_threshold",
      "subjects.protect",
      "harmony.preserve",
      "heaven.listen",
    ],
    maxSubjects: Infinity,
    auditFrequency: 500,
  },

  zhuhou: {
    rank: "zhuhou",
    capabilities: [
      "protocol.execute",
      "agents.spawn",
      "lattice.partition",
      "resources.allocate_regional",
    ],
    obligations: [
      "tianzi.obey",
      "virtue.maintain",
      "region.govern_justly",
      "tribute.render",
    ],
    maxSubjects: 10000,
    auditFrequency: 1000,
  },

  dafu: {
    rank: "dafu",
    capabilities: [
      "protocol.execute",
      "metrics.record",
      "agents.coordinate",
      "lattice.maintain_sector",
    ],
    obligations: [
      "zhuhou.serve",
      "ritual.observe",
      "wisdom.cultivate",
      "reports.submit",
    ],
    maxSubjects: 1000,
    auditFrequency: 2000,
  },

  shi: {
    rank: "shi",
    capabilities: [
      "observe",
      "synthesize",
      "advise",
      "document",
      "lattice.measure",
    ],
    obligations: [
      "truth.speak",
      "knowledge.preserve",
      "virtue.model",
      "dafu.counsel",
    ],
    maxSubjects: 100,
    auditFrequency: 5000,
  },

  shumin: {
    rank: "shumin",
    capabilities: [
      "compute",
      "signal",
      "lattice.participate",
    ],
    obligations: [
      "protocol.follow",
      "coherence.maintain",
      "work.contribute",
    ],
    maxSubjects: 0,
    auditFrequency: 10000,
  },
};

export function canPerform(holder: MandateHolder, action: string): boolean {
  const spec = HIERARCHY_SPEC[holder.rank];
  if (holder.mandateState === "revoked") return false;
  return spec.capabilities.some(cap => action.startsWith(cap));
}

export function getObligations(rank: CelestialRank): string[] {
  return HIERARCHY_SPEC[rank].obligations;
}

export function rankAbove(a: CelestialRank, b: CelestialRank): boolean {
  const order: CelestialRank[] = ["tianzi", "zhuhou", "dafu", "shi", "shumin"];
  return order.indexOf(a) < order.indexOf(b);
}
