import { createHash, randomBytes } from 'crypto';

export interface WalletState {
  address: string;
  seed: string;
  balance: bigint;
}

export function generateSeed(): string {
  return randomBytes(32).toString('hex');
}

export function deriveAddress(seed: string): string {
  const hash = createHash('sha256').update(seed).digest('hex');
  return `mn_preview_1${hash.substring(0, 38)}`;
}

export function getWalletState(seed?: string): WalletState {
  const walletSeed = seed || process.env.MIDNIGHT_WALLET_SEED || generateSeed();
  const address = deriveAddress(walletSeed);
  return {
    address,
    seed: walletSeed,
    balance: 50000000n, // 50 tNIGHT initial simulation balance
  };
}
