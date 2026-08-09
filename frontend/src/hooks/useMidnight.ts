import { useState, useEffect, useCallback } from 'react';
import { trackEvent } from '../lib/analytics';

export interface WalletInfo {
  id: string;
  name: string;
  icon?: string;
}

export interface MidnightWalletState {
  isConnected: boolean;
  walletName: string | null;
  address: string | null;
  balance: bigint;
  network: string;
  isConnecting: boolean;
  error: string | null;
  availableWallets: WalletInfo[];
  api: any | null;
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
    balance: 0n,
    network: targetNetwork,
    isConnecting: false,
    error: null,
    availableWallets: [],
    api: null,
  });

  // Detect installed Midnight DApp Connector wallets (e.g., 1AM Wallet, Midnight Lace)
  const detectWallets = useCallback(() => {
    if (!window.midnight) return [];
    const entries = Object.entries(window.midnight);
    return entries.map(([key, provider]) => {
      let displayName = provider.name || key;
      if (key.toLowerCase().includes('1am') || displayName.toLowerCase().includes('1am')) {
        displayName = '1AM Wallet';
      } else if (key.toLowerCase().includes('lace') || displayName.toLowerCase().includes('lace')) {
        displayName = 'Midnight Lace Wallet';
      }
      return { id: key, name: displayName };
    });
  }, []);

  useEffect(() => {
    const wallets = detectWallets();
    setWalletState((prev) => ({ ...prev, availableWallets: wallets }));
  }, [detectWallets]);

  const clearError = useCallback(() => {
    setWalletState((prev) => ({ ...prev, error: null }));
  }, []);

  const connectWallet = useCallback(async (preferredWalletId?: string) => {
    setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));
    trackEvent('wallet_connect_started');

    try {
      if (!window.midnight || Object.keys(window.midnight).length === 0) {
        throw new Error('No Midnight wallet detected. Please install 1AM Wallet extension in your browser to interact with live transactions.');
      }

      // Discover connected wallet provider
      const keys = Object.keys(window.midnight);
      const targetKey = preferredWalletId || keys.find((k) => k.toLowerCase().includes('1am')) || keys[0];
      const activeWalletProvider = window.midnight[targetKey];

      if (!activeWalletProvider) {
        throw new Error('Selected wallet provider is not available.');
      }

      const selectedName = activeWalletProvider.name || (targetKey.toLowerCase().includes('1am') ? '1AM Wallet' : 'Midnight Wallet');

      let api: any;
      let address = '';
      let balance = 0n;
      let connectedNetwork = targetNetwork;

      // Handle Official DApp Connector Spec connect() or legacy enable()
      if (typeof activeWalletProvider.connect === 'function') {
        api = await activeWalletProvider.connect(targetNetwork);
      } else if (typeof activeWalletProvider.enable === 'function') {
        api = await activeWalletProvider.enable();
      } else {
        throw new Error('Installed wallet provider does not support Midnight DApp Connector API standard (connect or enable).');
      }

      // Fetch network configuration
      if (typeof api.getConfiguration === 'function') {
        const config = await api.getConfiguration();
        connectedNetwork = config.networkId || targetNetwork;
      } else if (typeof api.state === 'function') {
        const state = await api.state();
        connectedNetwork = state.network || targetNetwork;
      }

      if (connectedNetwork !== targetNetwork) {
        throw new Error(`Network mismatch: Wallet is on '${connectedNetwork}', but App requires '${targetNetwork}'`);
      }

      // Fetch unshielded address
      if (typeof api.getUnshieldedAddress === 'function') {
        const addrObj = await api.getUnshieldedAddress();
        address = addrObj.unshieldedAddress;
      } else if (typeof api.state === 'function') {
        const state = await api.state();
        address = state.address || state.unshieldedAddress || state.coinPublicKey;
      }

      // Fetch balances
      if (typeof api.getUnshieldedBalances === 'function') {
        const balances = await api.getUnshieldedBalances();
        // Extract balance for native token (night/tNIGHT/etc)
        const nativeKey = Object.keys(balances).find(k => k.toLowerCase().includes('night')) || Object.keys(balances)[0];
        balance = nativeKey ? BigInt(balances[nativeKey]) : 0n;
      } else if (typeof api.state === 'function') {
        const state = await api.state();
        balance = BigInt(state.balance || state.unshieldedBalance || 0);
      }

      trackEvent('wallet_connected', { wallet_name: selectedName, network: connectedNetwork });

      setWalletState((prev) => ({
        ...prev,
        isConnected: true,
        walletName: selectedName,
        address: address || null,
        balance: balance,
        network: connectedNetwork,
        isConnecting: false,
        error: null,
        api,
      }));
    } catch (err: any) {
      trackEvent('wallet_connection_failed', { error_type: err.message?.substring(0, 80) || 'unknown' });
      setWalletState((prev) => ({
        ...prev,
        isConnected: false,
        walletName: null,
        address: null,
        balance: 0n,
        isConnecting: false,
        error: err.message || 'Failed to connect to 1AM Wallet',
        api: null,
      }));
    }
  }, [targetNetwork]);

  const disconnectWallet = useCallback(() => {
    trackEvent('wallet_disconnected');
    setWalletState((prev) => ({
      ...prev,
      isConnected: false,
      walletName: null,
      address: null,
      balance: 0n,
      isConnecting: false,
      error: null,
      api: null,
    }));
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    clearError,
  };
}
