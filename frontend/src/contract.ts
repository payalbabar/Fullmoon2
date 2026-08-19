import { sha256, toUtf8Bytes } from 'ethers';

export function computeCommitment(salt: string | Uint8Array, domain: string): string {
  const saltBytes = typeof salt === 'string' ? toUtf8Bytes(salt) : salt;
  const domainBytes = toUtf8Bytes(domain);
  const paddedDomain = new Uint8Array(32);
  paddedDomain.set(domainBytes.subarray(0, 32));

  const combined = new Uint8Array(saltBytes.length + 32);
  combined.set(saltBytes, 0);
  combined.set(paddedDomain, saltBytes.length);

  const hash = sha256(combined);
  return hash.startsWith('0x') ? hash.slice(2) : hash;
}

export class LotteryContract {
  state: {
    round_id: number;
    pot_balance: bigint;
    ticket_count: number;
    ticket_price: bigint;
    winning_index: number;
    winning_commitment: string;
    is_completed: boolean;
  };
  _tickets: string[];

  constructor(ticketPrice: bigint) {
    this.state = {
      round_id: 1,
      pot_balance: 0n,
      ticket_count: 0,
      ticket_price: ticketPrice,
      winning_index: 0,
      winning_commitment: '',
      is_completed: false,
    };
    this._tickets = [];
  }

  deposit_entry(secretSalt: string | Uint8Array) {
    if (this.state.is_completed) {
      throw new Error('Lottery round is closed');
    }
    if (this.state.ticket_price <= 0n) {
      throw new Error('Invalid ticket price');
    }

    const commitment = computeCommitment(secretSalt, 'DEPOSIT_SALT');
    this._tickets.push(commitment);
    this.state.ticket_count += 1;
    this.state.pot_balance += this.state.ticket_price;

    return { commitment };
  }

  draw_winner(winningTicket: number, vrfReveal: string | Uint8Array) {
    if (this.state.is_completed) {
      throw new Error('Round already completed');
    }
    if (this.state.ticket_count === 0) {
      throw new Error('No tickets purchased');
    }
    if (winningTicket >= this.state.ticket_count) {
      throw new Error('Winning ticket index out of bounds');
    }

    this.state.winning_index = winningTicket;
    this.state.winning_commitment = this._tickets[winningTicket];
    this.state.is_completed = true;

    const winningCommitment = computeCommitment(vrfReveal, 'WINNING_SEED');
    return { winningCommitment };
  }

  claim_prize(secretSalt: string | Uint8Array) {
    if (!this.state.is_completed) {
      throw new Error('Lottery is not yet drawn');
    }

    const claimedCommitment = computeCommitment(secretSalt, 'DEPOSIT_SALT');
    if (claimedCommitment !== this.state.winning_commitment) {
      throw new Error('Invalid ticket secret for prize claim');
    }

    this.state.pot_balance = 0n;
    return { success: true };
  }
}
