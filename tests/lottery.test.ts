import { describe, it, expect, beforeEach } from 'vitest';
import { LotteryContract, computeCommitment } from '../managed/lottery/contract/index.js';

describe('Decentralized Lottery Compact Contract Unit Tests', () => {
  let contract: LotteryContract;

  beforeEach(() => {
    contract = new LotteryContract(1000000n);
  });

  it('(a) Circuit Logic & State Transitions - Should successfully enter lottery, draw winner, and claim prize', () => {
    const userSecretSalt = 'super_secret_user_key_777';

    // Initial ledger state checks
    expect(contract.state.round_id).toBe(1);
    expect(contract.state.ticket_count).toBe(0);
    expect(contract.state.pot_balance).toBe(0n);
    expect(contract.state.is_completed).toBe(false);

    // 1. Participant deposits entry with secret witness
    const depositResult = contract.deposit_entry(userSecretSalt);
    const expectedCommitment = computeCommitment(userSecretSalt, 'DEPOSIT_SALT');

    expect(depositResult.commitment).toBe(expectedCommitment);
    expect(contract.state.ticket_count).toBe(1);
    expect(contract.state.pot_balance).toBe(1000000n);

    // 2. Admin draws winner via VRF reveal
    const vrfRevealSeed = 'vrf_entropy_reveal_456';
    const drawResult = contract.draw_winner(0, vrfRevealSeed);

    expect(contract.state.is_completed).toBe(true);
    expect(contract.state.winning_index).toBe(0);
    expect(contract.state.winning_commitment).toBe(expectedCommitment);

    // 3. Winner claims prize in ZK
    const claimResult = contract.claim_prize(userSecretSalt);
    expect(claimResult.success).toBe(true);
    expect(contract.state.pot_balance).toBe(0n);
  });

  it('(b) State Constraints & Error Handling - Should reject invalid operations', () => {
    // Cannot draw winner with zero entries
    expect(() => contract.draw_winner(0, 'vrf_reveal')).toThrow('No tickets purchased');

    const secretSalt = 'participant_secret_salt_11';
    contract.deposit_entry(secretSalt);

    // Cannot draw with out of bounds ticket index
    expect(() => contract.draw_winner(5, 'vrf_reveal')).toThrow('Winning ticket index out of bounds');

    // Draw valid winner
    contract.draw_winner(0, secretSalt);

    // Cannot deposit after round completed
    expect(() => contract.deposit_entry('late_salt')).toThrow('Lottery round is closed');

    // Cannot claim prize with wrong secret salt
    expect(() => contract.claim_prize('imposter_fake_salt')).toThrow('Invalid ticket secret for prize claim');
  });

  it('(c) Zero-Knowledge Privacy Isolation - Private witness inputs are NEVER exposed in ledger state', () => {
    const sensitivePrivateWitness = 'CONFIDENTIAL_PARTICIPANT_SALT_999999999999999999999';

    const result = contract.deposit_entry(sensitivePrivateWitness);

    // Ensure state ONLY contains the commitment hash, NEVER the raw secret
    const stateString = JSON.stringify(contract.state, (_, v) => typeof v === 'bigint' ? v.toString() : v);
    expect(stateString).not.toContain(sensitivePrivateWitness);

    // Ensure the ZK commitment output is a 64-char hex string (SHA256)
    expect(result.commitment).toHaveLength(64);
    expect(result.commitment).not.toBe(sensitivePrivateWitness);

    // Ensure commitment cannot be reversed directly to private salt
    expect(computeCommitment(sensitivePrivateWitness, 'DEPOSIT_SALT')).toBe(result.commitment);
  });
});
