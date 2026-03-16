import type { RunConfig, ContractModifier } from '@echo-party/shared';
import { CONTRACTS } from '@echo-party/content';

/** Resolved run configuration including active modifiers */
export interface ResolvedRunConfig extends RunConfig {
  modifiers: ContractModifier[];
  /** Effective room count after modifier adjustments */
  effectiveRoomCount: number;
}

/**
 * Look up a ContractDef by ID and build a RunConfig from it.
 * Throws an error if the contract ID is not found.
 */
export function buildRunConfig(contractId: string, seed: string): RunConfig {
  const contract = CONTRACTS.find((c) => c.id === contractId);
  if (!contract) {
    throw new Error(`Unknown contract: ${contractId}`);
  }

  return {
    seed,
    difficulty: contract.difficulty,
    contractId: contract.id,
  };
}

/**
 * Build a fully-resolved run config with modifier effects pre-calculated.
 */
export function buildResolvedRunConfig(contractId: string, seed: string): ResolvedRunConfig {
  const contract = CONTRACTS.find((c) => c.id === contractId);
  if (!contract) {
    throw new Error(`Unknown contract: ${contractId}`);
  }

  const modifiers = contract.modifiers ?? [];
  const extraRooms = modifiers.reduce((sum, m) => sum + (m.extraRooms ?? 0), 0);

  return {
    seed,
    difficulty: contract.difficulty,
    contractId: contract.id,
    modifiers,
    effectiveRoomCount: contract.roomCount + extraRooms,
  };
}
