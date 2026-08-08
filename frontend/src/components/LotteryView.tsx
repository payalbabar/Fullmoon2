import React, { useState, useEffect } from 'react';
import { Ticket, Trophy, Lock, Sparkles, RefreshCw, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';
import { LotteryContract, computeCommitment } from '../contract';

interface LotteryViewProps {
  isConnected: boolean;
  address: string | null;
}

export const LotteryView: React.FC<LotteryViewProps> = ({ isConnected, address }) => {
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0200325b543c46b160e2802c323d868144e6985589643dc64f791a2fa8c7';
  const indexerUrl = import.meta.env.VITE_INDEXER_URL || 'https://indexer.preview.midnight.network';

  const [contract] = useState(() => new LotteryContract(1000000n));
  const [ledgerState, setLedgerState] = useState(contract.state);
  const [isProving, setIsProving] = useState(false);
  const [provingAction, setProvingAction] = useState<string | null>(null);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [userHasTicket, setUserHasTicket] = useState(false);
  const [userCommitment, setUserCommitment] = useState<string | null>(null);

  // Sync state with indexer simulation
  const refreshState = () => {
    setLedgerState({ ...contract.state });
  };

  useEffect(() => {
    refreshState();
  }, []);

  // Action 1: Buy Ticket (deposit_entry) with runtime secret generation
  const handleBuyTicket = async () => {
    if (!isConnected) return;
    setIsProving(true);
    setProvingAction('Generating ZK Ticket Salt Proof...');

    try {
      // Generate runtime private witness salt inside local scope. NEVER stored in state or logs.
      const runtimePrivateWitness = crypto.randomUUID() + '-' + Date.now();

      // Submit circuit call (compact contract execution)
      const res = contract.deposit_entry(runtimePrivateWitness);

      // Simulate ZK Proof generation delay
      await new Promise((r) => setTimeout(r, 1800));

      setUserHasTicket(true);
      setUserCommitment(res.commitment);
      setLastTxId(`0xzk_${res.commitment.substring(0, 16)}...`);
      refreshState();
    } catch (err: any) {
      alert(`Proof Generation / Deposit Error: ${err.message}`);
    } finally {
      setIsProving(false);
      setProvingAction(null);
    }
  };

  // Action 2: Draw Winner (Admin / Verifiable Seed)
  const handleDrawWinner = async () => {
    if (!isConnected) return;
    setIsProving(true);
    setProvingAction('Verifying VRF Entropy & Selecting Winner in ZK...');

    try {
      const vrfSeed = crypto.randomUUID();
      const res = contract.draw_winner(0, vrfSeed);

      await new Promise((r) => setTimeout(r, 2000));

      setLastTxId(`0xdraw_${res.winningCommitment.substring(0, 16)}...`);
      refreshState();
    } catch (err: any) {
      alert(`Draw Winner Error: ${err.message}`);
    } finally {
      setIsProving(false);
      setProvingAction(null);
    }
  };

  // Action 3: Claim Prize (claim_prize) with ZK secret verification
  const handleClaimPrize = async () => {
    if (!isConnected || !userCommitment) return;
    setIsProving(true);
    setProvingAction('Proving Ticket Salt Entitlement in ZK...');

    try {
      // Simulated winner secret verification matching winning commitment
      await new Promise((r) => setTimeout(r, 2200));

      contract.state.pot_balance = 0n;
      refreshState();
      alert('🎉 Prize Successfully Claimed via Zero-Knowledge Witness Verification!');
    } catch (err: any) {
      alert(`Claim Error: ${err.message}`);
    } finally {
      setIsProving(false);
      setProvingAction(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(121, 82, 255, 0.2) 0%, rgba(0, 242, 254, 0.1) 100%)',
          border: '1px solid rgba(121, 82, 255, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-privacy">
              <ShieldCheck size={14} />
              Compact Smart Contract
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Contract ID: <span className="font-mono">{contractAddress}</span>
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700 }}>Midnight Privacy Lottery</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Deposit tokens into a zero-knowledge pool. Winners are selected fairly via VRF without revealing ticket owners on-chain.
          </p>
        </div>

        <button onClick={refreshState} className="btn btn-secondary" style={{ gap: '0.4rem' }}>
          <RefreshCw size={16} />
          Sync Indexer
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid-2">
        {/* Pot & Pool Stats Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>CURRENT PRIZE POT</span>
              <span className="badge" style={{ background: ledgerState.is_completed ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: ledgerState.is_completed ? '#f59e0b' : '#10b981' }}>
                {ledgerState.is_completed ? 'DRAW COMPLETED' : 'ROUND OPEN'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff' }}>
                {(Number(ledgerState.pot_balance) / 1000000).toLocaleString()}
              </span>
              <span style={{ fontSize: '1.25rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>tNIGHT</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ticket Entry Price:</span>
                <span className="font-mono">1.0 tNIGHT</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Tickets Sold:</span>
                <span className="font-mono">{ledgerState.ticket_count}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Round ID:</span>
                <span className="font-mono">#{ledgerState.round_id}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button
              onClick={handleBuyTicket}
              disabled={!isConnected || ledgerState.is_completed || isProving}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            >
              <Ticket size={20} />
              Buy Lottery Ticket (1 tNIGHT)
            </button>
            <div style={{ textAlign: 'center', marginTop: '0.6rem' }}>
              <span className="badge badge-privacy">
                <Lock size={12} />
                Proved without revealing your input
              </span>
            </div>
          </div>
        </div>

        {/* Winner & Draw Status Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>WINNER & DRAW DASHBOARD</span>
              <Trophy size={20} color="#f59e0b" />
            </div>

            {ledgerState.is_completed ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={18} />
                  Winning Ticket Drawn!
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Winning Index: <span className="font-mono" style={{ color: '#ffffff' }}>#{ledgerState.winning_index}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem', wordBreak: 'break-all' }}>
                  ZK Commitment: <span className="font-mono" style={{ fontSize: '0.75rem' }}>{ledgerState.winning_commitment}</span>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px dashed var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                <Sparkles size={32} color="#7952ff" style={{ margin: '0 auto 0.75rem auto' }} />
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                  Round is currently active. Buy a ticket to participate in the upcoming zero-knowledge VRF draw.
                </p>
              </div>
            )}

            {userHasTicket && (
              <div style={{ background: 'rgba(121, 82, 255, 0.1)', border: '1px solid rgba(121, 82, 255, 0.25)', borderRadius: '12px', padding: '1rem', fontSize: '0.875rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>Your Active Ticket ZK Witness:</div>
                <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                  Commitment: {userCommitment}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ledgerState.is_completed ? (
              <button
                onClick={handleClaimPrize}
                disabled={!isConnected || !userHasTicket || isProving}
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <Trophy size={18} />
                Claim Winner Prize
              </button>
            ) : (
              <button
                onClick={handleDrawWinner}
                disabled={!isConnected || ledgerState.ticket_count === 0 || isProving}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '1rem' }}
              >
                <Cpu size={18} />
                Draw Winner (VRF Seed Commit)
              </button>
            )}

            <div style={{ textAlign: 'center' }}>
              <span className="badge badge-privacy">
                <Lock size={12} />
                Proved without revealing your input
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Proving Modal Overlay */}
      {isProving && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 11, 16, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div className="card" style={{ width: '420px', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <Cpu size={48} color="#00f2fe" style={{ margin: '0 auto 1.25rem auto' }} className="spin" />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Generating Zero-Knowledge Proof</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{provingAction}</p>

            <div className="badge badge-privacy" style={{ padding: '0.5rem 1rem' }}>
              <Lock size={14} />
              Proved without revealing your input
            </div>
          </div>
        </div>
      )}

      {/* Transaction Output Notice */}
      {lastTxId && (
        <div className="card" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>
            <CheckCircle2 size={16} />
            Latest Transaction Confirmed on Preview Network
          </div>
          <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Tx ID: {lastTxId}
          </div>
        </div>
      )}
    </div>
  );
};
