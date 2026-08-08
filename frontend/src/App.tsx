import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMidnight } from './hooks/useMidnight';
import { WalletConnect } from './components/WalletConnect';
import { MetaMaskWallet } from './components/MetaMaskWallet';
import { LotteryView } from './components/LotteryView';
import { Shield } from 'lucide-react';

const queryClient = new QueryClient();

export function App() {
  const midnight = useMidnight();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        {/* Header */}
        <header className="header-nav">
          <div className="brand">
            <div className="brand-icon">
              <Shield size={24} color="#ffffff" />
            </div>
            <div>
              <div className="brand-title">Decentralized Lottery</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>1AM WALLET + LIVE MIDNIGHT INDEXER</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <MetaMaskWallet />
            <WalletConnect
              isConnected={midnight.isConnected}
              walletName={midnight.walletName}
              address={midnight.address}
              network={midnight.network}
              isConnecting={midnight.isConnecting}
              error={midnight.error}
              availableWallets={midnight.availableWallets}
              onConnect={midnight.connectWallet}
              onDisconnect={midnight.disconnectWallet}
              onClearError={midnight.clearError}
            />
          </div>
        </header>

        {/* Main Content */}
        <main>
          <LotteryView isConnected={midnight.isConnected} address={midnight.address} walletApi={midnight.api} />
        </main>

        {/* Footer */}
        <footer style={{ marginTop: '4rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>Built for <strong style={{ color: '#ffffff' }}>INTO the Midnight — SPPU Bootcamp</strong> (Rise In)</p>
          <p style={{ marginTop: '0.4rem', fontSize: '0.8rem' }}>Connected via 1AM Wallet DApp Connector & Live Midnight Preview Indexer</p>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;
