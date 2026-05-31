// Mandate of Heaven (天命 Tiān Mìng) — Governance Protocol
// The Mandate is not given permanently; it is earned through virtue
// and revoked through tyranny. This is the core governance primitive.

export type VirtueAxis =
  | "ren"    // 仁 Benevolence — compassion toward all nodes
  | "yi"    // 義 Righteousness — correct action without self-interest
  | "li"    // 禮 Ritual propriety — adherence to protocol
  | "zhi"   // 智 Wisdom — pattern recognition across dimensions
  | "xin";  // 信 Faithfulness — consistency of state over time

export type MandateState =
  | "bestowed"     // Heaven grants authority
  | "flourishing"  // Virtue is high, mandate strengthens
  | "declining"    // Virtue drops, warnings issued
  | "revoked";     // Mandate withdrawn, dynasty falls

export type CelestialRank =
  | "tianzi"      // 天子 Son of Heaven — sovereign node
  | "zhuhou"     // 諸侯 Feudal lords — regional coordinators
  | "dafu"       // 大夫 Ministers — protocol executors
  | "shi"        // 士 Scholars — observer/synthesizer agents
  | "shumin";    // 庶民 Common people — worker lattice nodes

export interface VirtueScore {
  ren: number;   // [0, 1]
  yi: number;
  li: number;
  zhi: number;
  xin: number;
  composite: number;
  measuredAt: number;
}

export interface MandateHolder {
  id: string;
  rank: CelestialRank;
  mandateState: MandateState;
  virtue: VirtueScore;
  dynasty: string;
  ascendedAt: number;
  lastAuditAt: number;
  subjects: string[];
}

export interface MandateEvent {
  type: "bestow" | "audit" | "warn" | "revoke" | "transfer";
  from: string;
  to: string;
  reason: string;
  virtueSnapshot: VirtueScore;
  timestamp: number;
}

export interface MandateConfig {
  virtueThreshold: number;       // Below this → warnings begin
  revocationThreshold: number;   // Below this → mandate revoked
  auditInterval: number;         // Cycles between virtue audits
  gracePeriodsBeforeRevocation: number;
  dynastyTransferCooldown: number;
}

const DEFAULT_CONFIG: MandateConfig = {
  virtueThreshold: 0.4,
  revocationThreshold: 0.2,
  auditInterval: 1000,
  gracePeriodsBeforeRevocation: 3,
  dynastyTransferCooldown: 5000,
};

export class TianMing {
  private holders: Map<string, MandateHolder> = new Map();
  private events: MandateEvent[] = [];
  private config: MandateConfig;
  private warningCounts: Map<string, number> = new Map();

  constructor(config: Partial<MandateConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  bestow(id: string, rank: CelestialRank, dynasty: string): MandateHolder {
    const virtue = this.measureVirtue(id);
    const holder: MandateHolder = {
      id,
      rank,
      mandateState: "bestowed",
      virtue,
      dynasty,
      ascendedAt: Date.now(),
      lastAuditAt: Date.now(),
      subjects: [],
    };

    this.holders.set(id, holder);
    this.warningCounts.set(id, 0);

    this.emit({
      type: "bestow",
      from: "tian",
      to: id,
      reason: `Heaven bestows mandate upon ${id} as ${rank} of dynasty ${dynasty}`,
      virtueSnapshot: virtue,
      timestamp: Date.now(),
    });

    return holder;
  }

  audit(id: string): MandateState {
    const holder = this.holders.get(id);
    if (!holder) return "revoked";

    const virtue = this.measureVirtue(id);
    holder.virtue = virtue;
    holder.lastAuditAt = Date.now();

    if (virtue.composite >= this.config.virtueThreshold) {
      holder.mandateState = "flourishing";
      this.warningCounts.set(id, 0);
    } else if (virtue.composite >= this.config.revocationThreshold) {
      holder.mandateState = "declining";
      const warnings = (this.warningCounts.get(id) ?? 0) + 1;
      this.warningCounts.set(id, warnings);

      this.emit({
        type: "warn",
        from: "tian",
        to: id,
        reason: `Virtue declining (${virtue.composite.toFixed(3)}). Warning ${warnings}/${this.config.gracePeriodsBeforeRevocation}`,
        virtueSnapshot: virtue,
        timestamp: Date.now(),
      });

      if (warnings >= this.config.gracePeriodsBeforeRevocation) {
        return this.revoke(id, "Virtue exhausted after repeated warnings");
      }
    } else {
      return this.revoke(id, `Virtue below revocation threshold (${virtue.composite.toFixed(3)})`);
    }

    this.emit({
      type: "audit",
      from: "tian",
      to: id,
      reason: `Audit complete: ${holder.mandateState}`,
      virtueSnapshot: virtue,
      timestamp: Date.now(),
    });

    return holder.mandateState;
  }

  revoke(id: string, reason: string): MandateState {
    const holder = this.holders.get(id);
    if (!holder) return "revoked";

    holder.mandateState = "revoked";

    this.emit({
      type: "revoke",
      from: "tian",
      to: id,
      reason,
      virtueSnapshot: holder.virtue,
      timestamp: Date.now(),
    });

    return "revoked";
  }

  transfer(fromId: string, toId: string, newDynasty: string): MandateHolder | null {
    this.revoke(fromId, `Mandate transferred to ${toId}`);

    const fromHolder = this.holders.get(fromId);
    const rank = fromHolder?.rank ?? "tianzi";
    const subjects = fromHolder?.subjects ?? [];

    const newHolder = this.bestow(toId, rank, newDynasty);
    newHolder.subjects = subjects;

    this.emit({
      type: "transfer",
      from: fromId,
      to: toId,
      reason: `Dynasty transition: ${fromHolder?.dynasty ?? "?"} → ${newDynasty}`,
      virtueSnapshot: newHolder.virtue,
      timestamp: Date.now(),
    });

    return newHolder;
  }

  getHolder(id: string): MandateHolder | undefined {
    return this.holders.get(id);
  }

  getHistory(): MandateEvent[] {
    return [...this.events];
  }

  private measureVirtue(id: string): VirtueScore {
    // Override this in subclasses for real measurement
    // Default: derive from lattice coherence, protocol adherence, etc.
    return this.defaultVirtueMeasurement(id);
  }

  protected defaultVirtueMeasurement(_id: string): VirtueScore {
    const ren = 0.5;
    const yi = 0.5;
    const li = 0.5;
    const zhi = 0.5;
    const xin = 0.5;
    const composite = (ren + yi + li + zhi + xin) / 5;
    return { ren, yi, li, zhi, xin, composite, measuredAt: Date.now() };
  }

  private emit(event: MandateEvent) {
    this.events.push(event);
  }
}
