import React from 'react';
import { captureError } from '../lib/sentry';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Top-level React error boundary.
 * Catches unexpected runtime errors and shows a styled recovery UI.
 * Reports to Sentry when configured.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    captureError(error, {
      component_stack: info.componentStack?.substring(0, 500) || '',
    });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          padding: '2rem',
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            padding: '2.5rem',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
            }}
          >
            <AlertTriangle size={32} color="#ef4444" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Something went wrong
          </h2>

          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            An unexpected error occurred in the application. Your wallet and funds are not affected.
            Please reload the page to continue.
          </p>

          {this.state.error && (
            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '0.75rem',
                marginBottom: '1.5rem',
                textAlign: 'left',
              }}
            >
              <p
                className="font-mono"
                style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-word' }}
              >
                {this.state.error.message}
              </p>
            </div>
          )}

          <button
            onClick={this.handleReset}
            className="btn btn-primary"
            style={{ gap: '0.5rem', width: '100%' }}
          >
            <RefreshCw size={16} />
            Reload Application
          </button>
        </div>
      </div>
    );
  }
}
