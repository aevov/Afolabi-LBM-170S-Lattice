export { TianMing } from "./tian-ming";
export type {
  VirtueAxis,
  VirtueScore,
  MandateState,
  MandateHolder,
  MandateEvent,
  MandateConfig,
  CelestialRank,
} from "./tian-ming";

export { computeVirtue, diagnoseVirtueDeficiency } from "./virtue-engine";
export type { VirtueInput, VirtueWeights } from "./virtue-engine";

export { HIERARCHY_SPEC, canPerform, getObligations, rankAbove } from "./celestial-hierarchy";
export type { CelestialNode } from "./celestial-hierarchy";
