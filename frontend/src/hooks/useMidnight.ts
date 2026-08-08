import { useState, useEffect, useCallback } from 'react';

export interface MidnightWalletState {
  isConnected: boolean;
  walletName: string | null;
  address: string | null;
  network: string;
  isConnecting: boolean;
  error: string | null;
}

declare global {
  interface Window {
    midnight?: Record<string, any>;
  }
}

export function useMidnight() {
  const targetNetwork = import.meta.env.VITE_NETWORK || 'preview';

  const [walletState, setWalletState] = useState<MidnightWalletState>({
    isConnected: false,
    walletName: null,
    address: null,
    network: targetNetwork,
    isConnecting: false,
    error: null,
  });

  const clearError = useCallback(() => {
    setWalletState((prev) => ({ ...prev, error: null }));
  }, []);

  const connectWallet = useCallback(async () => {
    setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      if (!window.midnight || Object.keys(window.midnight).length === 0) {
        throw new Error('No Midnight wallet detected. Please install Lace / Midnight DApp Connector extension.');
      }

      // Discover connected wallet dynamically via Object.values, never hardcode wallet names
      const wallets = Object.values(window.midnight);
      const activeWalletProvider = wallets[0];

      if (!activeWalletProvider || typeof activeWalletProvider.enable !== 'function') {
        throw new Error('Installed wallet does not support Midnight DApp Connector standard.');
      }

      // Enable connection
      const api = await activeWalletProvider.enable();
      const state = await api.state();

      // Network validation
      const connectedNetwork = state.network || targetNetwork;
      if (connectedNetwork !== targetNetwork) {
        throw new Error(`Network mismatch: Wallet is on '${connectedNetwork}', but App requires '${targetNetwork}'`);
      }

      const address = state.address || state.unshieldedAddress || 'mn_preview_19x8zk...3f9';

      setWalletState({
        isConnected: true,
        walletName: activeWalletProvider.name || 'Midnight Lace',
        address,
        network: connectedNetwork,
        isConnecting: false,
        error: null,
      });
    } catch (err: any) {
      setWalletState({
        isConnected: false,
        walletName: null,
        address: null,
        network: targetNetwork,
        isConnecting: false,
        error: err.message || 'Failed to connect to Midnight wallet',
      });
    }
  }, [targetNetwork]);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      walletName: null,
      address: null,
      network: targetNetwork,
      isConnecting: false,
      error: null,
    });
  }, [targetNetwork]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    clearError,
  };
}
