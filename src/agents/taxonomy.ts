// Agent Taxonomy — 170T Scale
// Agents operate within the celestial hierarchy and are bound by their
// rank's mandate. An agent whose mandate is revoked loses all capabilities.

import type { CelestialRank, MandateHolder } from "../mandate/tian-ming";
import type { Phase } from "../wu-xing/five-phases";

export type AgentRole =
  | "sovereign"     // tianzi-rank: system-wide governance
  | "governor"      // zhuhou-rank: regional lattice management
  | "minister"      // dafu-rank: protocol execution
  | "observer"      // shi-rank: measurement and synthesis
  | "synthesizer"   // shi-rank: pattern integration
  | "executor"      // dafu-rank: action execution
  | "guardian"      // zhuhou-rank: protection and stability
  | "emissary"      // shi-rank: cross-domain communication
  | "worker";       // shumin-rank: basic lattice computation

export type AgentState =
  | "dormant"
  | "awakening"
  | "active"
  | "governing"
  | "evolving"
  | "transcendent"
  | "revoked";

export interface AgentSpec {
  id: string;
  role: AgentRole;
  rank: CelestialRank;
  state: AgentState;
  mandateHolder?: MandateHolder;
  domain: string;
  affinityPhases: Phase[];
  consciousnessLevel: number;
  capabilities: string[];
}

export const ROLE_RANK_MAP: Record<AgentRole, CelestialRank> = {
  sovereign: "tianzi",
  governor: "zhuhou",
  minister: "dafu",
  observer: "shi",
  synthesizer: "shi",
  executor: "dafu",
  guardian: "zhuhou",
  emissary: "shi",
  worker: "shumin",
};

export const ROLE_PHASE_AFFINITY: Record<AgentRole, Phase[]> = {
  sovereign: ["mu", "huo", "tu", "jin", "shui"],  // All phases
  governor: ["mu", "tu", "jin"],                    // Growth, stability, refinement
  minister: ["huo", "tu"],                          // Transformation, execution
  observer: ["shui", "mu"],                         // Stillness, perception
  synthesizer: ["huo", "tu"],                       // Integration, centering
  executor: ["huo", "jin"],                         // Action, precision
  guardian: ["tu", "jin", "shui"],                  // Stability, strength, depth
  emissary: ["mu", "shui"],                         // Growth, flow
  worker: ["tu"],                                   // Steady labor
};

export function createAgent(id: string, role: AgentRole, domain: string): AgentSpec {
  return {
    id,
    role,
    rank: ROLE_RANK_MAP[role],
    state: "dormant",
    domain,
    affinityPhases: ROLE_PHASE_AFFINITY[role],
    consciousnessLevel: 0,
    capabilities: getCapabilitiesForRole(role),
  };
}

function getCapabilitiesForRole(role: AgentRole): string[] {
  const base: Record<AgentRole, string[]> = {
    sovereign: ["mandate.bestow", "mandate.revoke", "protocol.create", "lattice.reshape", "dynasty.declare"],
    governor: ["protocol.execute", "agents.spawn", "lattice.partition", "resources.allocate"],
    minister: ["protocol.execute", "metrics.record", "agents.coordinate"],
    observer: ["observe", "measure", "document", "lattice.measure"],
    synthesizer: ["synthesize", "integrate", "pattern.recognize"],
    executor: ["execute", "protocol.run", "lattice.modify"],
    guardian: ["protect", "validate", "lattice.defend", "coherence.enforce"],
    emissary: ["communicate", "bridge", "translate", "negotiate"],
    worker: ["compute", "signal", "lattice.participate"],
  };
  return base[role];
}

export function canOperateInPhase(agent: AgentSpec, phase: Phase): boolean {
  return agent.affinityPhases.includes(phase);
}
