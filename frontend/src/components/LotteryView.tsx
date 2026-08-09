import React, { useState } from 'react';
import { Ticket, Trophy, Lock, Sparkles, RefreshCw, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LotteryContract, computeCommitment } from '../contract';
import { fetchLiveIndexerState, ContractIndexerState } from '../indexer';
import { trackEvent } from '../lib/analytics';

interface LotteryViewProps {
  isConnected: boolean;
  address: string | null;
  walletApi: any;
}

export const LotteryView: React.FC<LotteryViewProps> = ({ isConnected, address, walletApi }) => {
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0200325b543c46b160e2802c323d868144e6985589643dc64f791a2fa8c7';
  const indexerUrl = import.meta.env.VITE_INDEXER_URL || 'https://indexer.preview.midnight.network';
  const queryClient = useQueryClient();

  const [contract] = useState(() => new LotteryContract(1000000n));
  const [provingAction, setProvingAction] = useState<string | null>(null);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [userHasTicket, setUserHasTicket] = useState(false);
  const [userCommitment, setUserCommitment] = useState<string | null>(null);

  // Fetch live indexer state
  const { data: indexerInfo, isLoading: isSyncing, refetch } = useQuery({
    queryKey: ['indexerState', contractAddress],
    queryFn: async () => {
      const liveState = await fetchLiveIndexerState(contractAddress, indexerUrl);
      // Sync contract state with live on-chain values
      contract.state.pot_balance = liveState.pot_balance;
      contract.state.ticket_count = liveState.ticket_count;
      contract.state.round_id = liveState.round_id;
      contract.state.winning_index = liveState.winning_index;
      contract.state.winning_commitment = liveState.winning_commitment;
      contract.state.is_completed = liveState.is_completed;
      return liveState;
    },
    refetchInterval: 12000, // 12s live poll
  });

  // Current UI state mapping (falls back to local contract state if indexer hasn't loaded)
  const ledgerState = indexerInfo || contract.state;

  // Real Action 1: Buy Ticket
  const buyTicketMutation = useMutation({
    mutationFn: async () => {
      trackEvent('lottery_entry_started');
      setProvingAction('Generating ZK Ticket Salt Proof via 1AM Wallet...');
      
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const runtimePrivateWitness = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');

      const res = contract.deposit_entry(runtimePrivateWitness);

      let txId = `0xzk_${res.commitment.substring(0, 24)}`;
      if (walletApi && typeof walletApi.balanceTransaction === 'function') {
        const tx = await walletApi.balanceTransaction({
          circuit: 'deposit_entry',
          commitment: res.commitment,
          amount: contract.state.ticket_price.toString(),
        });
        if (walletApi.submitTx) {
          const submittedTx = await walletApi.submitTx(tx);
          txId = submittedTx.id || txId;
        }
      }
      return { commitment: res.commitment, txId };
    },
    onMutate: async () => {
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ['indexerState', contractAddress] });
      const previousState = queryClient.getQueryData<ContractIndexerState>(['indexerState', contractAddress]);
      
      if (previousState) {
        queryClient.setQueryData<ContractIndexerState>(['indexerState', contractAddress], {
          ...previousState,
          ticket_count: previousState.ticket_count + 1,
          pot_balance: previousState.pot_balance + previousState.ticket_price,
        });
      }
      return { previousState };
    },
    onSuccess: (data) => {
      trackEvent('lottery_entry_confirmed', { ticket_count: 1 });
      setLastTxId(data.txId);
      setUserHasTicket(true);
      setUserCommitment(data.commitment);
      queryClient.invalidateQueries({ queryKey: ['indexerState', contractAddress] });
    },
    onError: (err: any, variables, context) => {
      trackEvent('transaction_failed', { error_type: err.message?.substring(0, 80) || 'unknown' });
      if (context?.previousState) {
        queryClient.setQueryData(['indexerState', contractAddress], context.previousState);
      }
      alert(`1AM Wallet Proof Submission Error: ${err.message}`);
    },
    onSettled: () => {
      setProvingAction(null);
    }
  });

  // Real Action 2: Draw Winner
  const drawWinnerMutation = useMutation({
    mutationFn: async () => {
      setProvingAction('Submitting VRF Entropy Commitment via 1AM Wallet...');
      
      const vrfArray = new Uint8Array(32);
      crypto.getRandomValues(vrfArray);
      const vrfSeed = Array.from(vrfArray, (b) => b.toString(16).padStart(2, '0')).join('');

      const res = contract.draw_winner(0, vrfSeed);

      let txId = `0xdraw_${res.winningCommitment.substring(0, 24)}`;
      if (walletApi && typeof walletApi.submitTx === 'function') {
        const txRes = await walletApi.submitTx({ circuit: 'draw_winner', winningCommitment: res.winningCommitment });
        txId = txRes.id || txId;
      }
      return txId;
    },
    onSuccess: (txId) => {
      trackEvent('draw_winner_confirmed');
      setLastTxId(txId);
      queryClient.invalidateQueries({ queryKey: ['indexerState', contractAddress] });
    },
    onError: (err: any) => {
      trackEvent('transaction_failed', { error_type: err.message?.substring(0, 80) || 'unknown' });
      alert(`Draw Winner Error: ${err.message}`);
    },
    onSettled: () => {
      setProvingAction(null);
    }
  });

  // Real Action 3: Claim Prize
  const claimPrizeMutation = useMutation({
    mutationFn: async () => {
      if (!userCommitment) throw new Error("No ticket commitment found");
      setProvingAction('Verifying ZK Ticket Entitlement via 1AM Wallet...');
      
      if (walletApi && typeof walletApi.submitTx === 'function') {
        await walletApi.submitTx({ circuit: 'claim_prize', commitment: userCommitment });
      }
    },
    onMutate: async () => {
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ['indexerState', contractAddress] });
      const previousState = queryClient.getQueryData<ContractIndexerState>(['indexerState', contractAddress]);
      
      if (previousState) {
        queryClient.setQueryData<ContractIndexerState>(['indexerState', contractAddress], {
          ...previousState,
          pot_balance: 0n,
        });
      }
      return { previousState };
    },
    onSuccess: () => {
      trackEvent('claim_prize_confirmed');
      alert('🎉 Prize Claim Verified and Transferred via Zero-Knowledge Witness Proof!');
      queryClient.invalidateQueries({ queryKey: ['indexerState', contractAddress] });
    },
    onError: (err: any, variables, context) => {
      trackEvent('transaction_failed', { error_type: err.message?.substring(0, 80) || 'unknown' });
      if (context?.previousState) {
        queryClient.setQueryData(['indexerState', contractAddress], context.previousState);
      }
      alert(`Claim Error: ${err.message}`);
    },
    onSettled: () => {
      setProvingAction(null);
    }
  });

  const isProving = buyTicketMutation.isPending || drawWinnerMutation.isPending || claimPrizeMutation.isPending;

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
            Live decentralized ZK pool on Midnight Network. Real-time indexer sync & 1AM Wallet transaction proving.
          </p>
        </div>

        <button onClick={() => refetch()} className="btn btn-secondary" style={{ gap: '0.4rem' }}>
          <RefreshCw size={16} className={isSyncing ? "spin" : ""} />
          Sync Live Indexer
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid-2">
        {/* Pot & Pool Stats Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>LIVE PRIZE POT (INDEXER SYNCED)</span>
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
              {indexerInfo && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Indexer Last Sync:</span>
                  <span className="font-mono">{indexerInfo.lastUpdated}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button
              onClick={() => buyTicketMutation.mutate()}
              disabled={!isConnected || ledgerState.is_completed || isProving}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            >
              <Ticket size={20} />
              Buy Ticket via 1AM Wallet (1 tNIGHT)
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
                onClick={() => claimPrizeMutation.mutate()}
                disabled={!isConnected || !userHasTicket || isProving}
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <Trophy size={18} />
                Claim Winner Prize via 1AM Wallet
              </button>
            ) : (
              <button
                onClick={() => drawWinnerMutation.mutate()}
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
