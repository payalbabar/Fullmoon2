import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Wallet, ShieldCheck, AlertCircle, LogOut } from 'lucide-react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const MetaMaskWallet: React.FC = () => {
  const [account, setAccount] = useState<string>('');
  const [chainId, setChainId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask!');
      return;
    }

    try {
      setError('');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();

      setAccount(accounts[0]);
      setChainId(network.chainId.toString());
    } catch (err: any) {
      console.error('MetaMask connection failed:', err);
      setError(err.message || 'Wallet connection failed');
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setChainId('');
    setError('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {account && (
          <span className="badge badge-preview">
            <ShieldCheck size={14} />
            EVM CHAIN: {chainId}
          </span>
        )}

        {account ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              className="card"
              style={{
                padding: '0.4rem 0.9rem',
                fontSize: '0.875rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontWeight: 600, color: '#f59e0b' }}>MetaMask</span>
              <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                ({account.slice(0, 6)}...{account.slice(-4)})
              </span>
            </div>

            <button onClick={disconnectWallet} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Disconnect MetaMask">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={connectWallet} className="btn btn-secondary" style={{ gap: '0.6rem', border: '1px solid #f59e0b', color: '#f59e0b' }}>
            <Wallet size={16} />
            Connect MetaMask
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '0.5rem 0.75rem',
            color: '#ef4444',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
