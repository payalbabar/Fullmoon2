import React from 'react';
import { useMidnight } from './hooks/useMidnight';
import { WalletConnect } from './components/WalletConnect';
import { LotteryView } from './components/LotteryView';
import { Shield } from 'lucide-react';

export function App() {
  const midnight = useMidnight();

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header-nav">
        <div className="brand">
          <div className="brand-icon">
            <Shield size={24} color="#ffffff" />
          </div>
          <div>
            <div className="brand-title">Decentralized Lottery</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>1AM WALLET + MIDNIGHT NETWORK ZK DAPP</div>
          </div>
        </div>

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
      </header>

      {/* Main Content */}
      <main>
        <LotteryView isConnected={midnight.isConnected} address={midnight.address} />
      </main>

      {/* Footer */}
      <footer style={{ marginTop: '4rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>Built for <strong style={{ color: '#ffffff' }}>INTO the Midnight — SPPU Bootcamp</strong> (Rise In)</p>
        <p style={{ marginTop: '0.4rem', fontSize: '0.8rem' }}>Connected via 1AM Wallet DApp Connector to Midnight Preview Network</p>
      </footer>
    </div>
  );
}

export default App;
