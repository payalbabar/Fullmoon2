import React, { useState, useEffect } from 'react';
import { Shield, Ticket, Trophy, Wallet, ArrowRight, X, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

const STORAGE_KEY = 'midnight_lottery_onboarding_complete';

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
}

const steps: OnboardingStep[] = [
  {
    icon: <Shield size={40} color="#7952ff" />,
    title: 'Welcome to Midnight Privacy Lottery',
    description:
      'A fully decentralized, privacy-preserving lottery built on Midnight Network. Your identity stays hidden — only a cryptographic commitment is stored on-chain.',
    highlight: 'Zero-Knowledge. Fully On-Chain.',
  },
  {
    icon: <Ticket size={40} color="#00f2fe" />,
    title: 'How the Lottery Works',
    description:
      'Buy a ticket by depositing 1 tNIGHT. A private random salt is generated for you and hashed into a ZK commitment. When the round closes, a VRF seed selects the winning ticket fairly.',
    highlight: 'Your secret salt is never revealed on-chain.',
  },
  {
    icon: <Lock size={40} color="#10b981" />,
    title: 'Why Zero-Knowledge?',
    description:
      'Traditional lotteries expose all participants publicly. Midnight uses Compact smart contracts so you can prove you own a winning ticket without revealing which ticket is yours or linking it to your identity.',
    highlight: 'Privacy-first. Trustless. Verifiable.',
  },
  {
    icon: <Wallet size={40} color="#f59e0b" />,
    title: 'Connect Your Wallet',
    description:
      'You need the 1AM Wallet browser extension to interact with Midnight Network. Install it from the official Midnight Network website, switch to Preview network, and connect using the button in the top right.',
    highlight: 'Only 1AM Wallet supports Midnight DApp Connector.',
  },
  {
    icon: <Trophy size={40} color="#7952ff" />,
    title: "You're Ready to Play",
    description:
      "Once your wallet is connected: click 'Buy Ticket' to enter the lottery, wait for the draw, and if you win — click 'Claim Prize' to verify your ZK ticket proof and receive the pot.",
    highlight: 'All transactions happen live on Midnight Preview Network.',
  },
];

export const OnboardingModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      setVisible(true);
      trackEvent('onboarding_started');
    }
  }, []);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
    trackEvent('onboarding_completed', { step: step + 1 });
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
    trackEvent('onboarding_skipped', { step: step + 1 });
  };

  if (!visible) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 11, 16, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '1rem',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '2.5rem',
          position: 'relative',
          animation: 'none',
        }}
      >
        {/* Close / Skip */}
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Skip onboarding"
        >
          <X size={20} />
        </button>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem' }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                height: '3px',
                flex: 1,
                borderRadius: '2px',
                background: i <= step ? 'var(--accent-purple)' : 'var(--border-color)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: 'rgba(121, 82, 255, 0.1)',
            border: '1px solid rgba(121, 82, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}
        >
          {current.icon}
        </div>

        {/* Content */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.3 }}>
          {current.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
          {current.description}
        </p>

        {current.highlight && (
          <div
            style={{
              background: 'rgba(121, 82, 255, 0.1)',
              border: '1px solid rgba(121, 82, 255, 0.25)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              marginBottom: '2rem',
              fontSize: '0.875rem',
              color: '#b096ff',
              fontWeight: 500,
            }}
          >
            {current.highlight}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {step > 0 && (
            <button
              onClick={handleBack}
              className="btn btn-secondary"
              style={{ gap: '0.4rem', flex: '0 0 auto' }}
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}

          <button
            onClick={handleNext}
            className="btn btn-primary"
            style={{ gap: '0.5rem', flex: 1 }}
          >
            {isLast ? (
              <>
                Start Playing
                <Trophy size={16} />
              </>
            ) : (
              <>
                Next
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Step counter */}
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Step {step + 1} of {steps.length}
          {step < steps.length - 1 && (
            <button
              onClick={handleSkip}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                marginLeft: '1rem',
                fontSize: '0.8rem',
                textDecoration: 'underline',
              }}
            >
              Skip tour
            </button>
          )}
        </p>
      </div>
    </div>
  );
};
