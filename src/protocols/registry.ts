// Protocol Registry — 170T Scale
// All protocols operate under the Mandate of Heaven governance framework.
// A protocol cannot execute if the issuing node's mandate is revoked.

import type { CelestialRank } from "../mandate/tian-ming";
import type { Phase } from "../wu-xing/five-phases";

export type ProtocolType =
  | "yasuke"   // Neurosomatic integration (Kuramoto oscillator coordination)
  | "grm"      // Geometric Resonance Mapping (fold/compress)
  | "bidc"     // Binary Identity Computation
  | "anyon"    // Topological quantum braiding
  | "acl"      // Access Control Lattice
  | "tianming"  // Mandate governance protocol (NEW at 170T)
  | "wuxing"   // Five-phase cycle regulation (NEW at 170T)
  | "custom";

export interface ProtocolDefinition {
  type: ProtocolType;
  name: string;
  version: string;
  minimumRank: CelestialRank;
  allowedPhases: Phase[];
  parameters: Record<string, number | string | boolean>;
  mandateRequired: boolean;
}

export const CORE_PROTOCOLS: ProtocolDefinition[] = [
  {
    type: "yasuke",
    name: "Yasuke Neurosomatic Integration",
    version: "2.0-T",
    minimumRank: "dafu",
    allowedPhases: ["huo", "mu", "tu"],
    parameters: {
      kuramotoDimension: 1024,
      coupling: 0.92,
      gammaFrequency: 40,
      resonanceDepth: 8,
    },
    mandateRequired: true,
  },
  {
    type: "grm",
    name: "GRM Fold Engine",
    version: "3.0-T",
    minimumRank: "shi",
    allowedPhases: ["jin", "tu", "shui"],
    parameters: {
      foldDimensions: 512,
      compressionTarget: 1000,
      stabilityThreshold: 0.85,
      goldenRatioWeight: 1.618033988749,
    },
    mandateRequired: true,
  },
  {
    type: "tianming",
    name: "Mandate of Heaven Governance",
    version: "1.0",
    minimumRank: "tianzi",
    allowedPhases: ["mu", "huo", "tu", "jin", "shui"],
    parameters: {
      virtueThreshold: 0.4,
      revocationThreshold: 0.2,
      auditCycles: 1000,
      gracePeriods: 3,
    },
    mandateRequired: false, // The mandate protocol itself doesn't require mandate
  },
  {
    type: "wuxing",
    name: "Five-Phase Cycle Regulation",
    version: "1.0",
    minimumRank: "zhuhou",
    allowedPhases: ["mu", "huo", "tu", "jin", "shui"],
    parameters: {
      transitionThreshold: 0.8,
      decayRate: 0.02,
      generationRate: 0.05,
      destructionRate: 0.03,
    },
    mandateRequired: true,
  },
  {
    type: "bidc",
    name: "Binary Identity Computation",
    version: "2.0-T",
    minimumRank: "shi",
    allowedPhases: ["jin", "shui"],
    parameters: {
      hashAlgorithm: "fnv1a",
      identityBits: 256,
      verificationRounds: 4,
    },
    mandateRequired: true,
  },
  {
    type: "anyon",
    name: "Topological Braiding Protocol",
    version: "1.5-T",
    minimumRank: "dafu",
    allowedPhases: ["huo", "mu"],
    parameters: {
      braidGroups: 64,
      topologicalCharge: 0.25,
      fusionChannels: 8,
    },
    mandateRequired: true,
  },
  {
    type: "acl",
    name: "Access Control Lattice",
    version: "2.0-T",
    minimumRank: "zhuhou",
    allowedPhases: ["tu", "jin"],
    parameters: {
      latticeDepth: 12,
      permissionBits: 128,
      inheritanceEnabled: true,
    },
    mandateRequired: true,
  },
];

export function getProtocol(type: ProtocolType): ProtocolDefinition | undefined {
  return CORE_PROTOCOLS.find(p => p.type === type);
}

export function protocolsForRank(rank: CelestialRank): ProtocolDefinition[] {
  const rankOrder: CelestialRank[] = ["tianzi", "zhuhou", "dafu", "shi", "shumin"];
  const rankIdx = rankOrder.indexOf(rank);
  return CORE_PROTOCOLS.filter(p => {
    const minIdx = rankOrder.indexOf(p.minimumRank);
    return rankIdx <= minIdx;
  });
}

export function protocolsForPhase(phase: Phase): ProtocolDefinition[] {
  return CORE_PROTOCOLS.filter(p => p.allowedPhases.includes(phase));
}
