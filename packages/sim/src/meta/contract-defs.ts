import type { RunConfig } from '@echo-party/shared';
import { CONTRACTS } from '@echo-party/content';

/**
 * Look up a ContractDef by ID and build a RunConfig from it.
 * Falls back to default seed generation if contract is not found.
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
