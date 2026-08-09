import React, { useState } from 'react';
import { MessageSquare, X, Star, Send, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

type FeedbackCategory = 'Bug' | 'UX' | 'Feature Request' | 'General';

const CATEGORIES: FeedbackCategory[] = ['Bug', 'UX', 'Feature Request', 'General'];

/**
 * Feedback submission endpoint.
 *
 * Configure via environment variable:
 *   VITE_FEEDBACK_ENDPOINT=https://your-api.com/feedback
 *
 * If not set, falls back to a mailto: link with pre-filled subject/body.
 *
 * Expected POST body (JSON):
 *   { rating: number, category: string, comment: string, timestamp: string }
 *
 * Expected response: { ok: true } or HTTP 2xx
 */
const FEEDBACK_ENDPOINT = import.meta.env.VITE_FEEDBACK_ENDPOINT || '';
const FEEDBACK_EMAIL = import.meta.env.VITE_FEEDBACK_EMAIL || 'feedback@example.com';

export const FeedbackWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState<FeedbackCategory>('General');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleOpen = () => {
    setOpen(true);
    trackEvent('feedback_opened');
  };

  const handleClose = () => {
    setOpen(false);
    // Reset after close
    setTimeout(() => {
      setRating(0);
      setHoveredRating(0);
      setCategory('General');
      setComment('');
      setSubmitted(false);
      setError('');
    }, 300);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      rating,
      category,
      comment: comment.trim(),
      timestamp: new Date().toISOString(),
      page: window.location.href,
    };

    try {
      if (FEEDBACK_ENDPOINT) {
        // POST to configured endpoint
        const res = await fetch(FEEDBACK_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }
      } else {
        // Fallback: open mailto
        const subject = encodeURIComponent(`[Midnight Lottery Feedback] ${category} — ${rating}/5 stars`);
        const body = encodeURIComponent(
          `Rating: ${rating}/5\nCategory: ${category}\n\nComment:\n${comment || '(no comment)'}\n\nTimestamp: ${payload.timestamp}`
        );
        window.open(`mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`, '_blank');
      }

      trackEvent('feedback_submitted', { category });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={handleOpen}
        title="Share feedback"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7952ff 0%, #4f46e5 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(121, 82, 255, 0.4)',
          zIndex: 150,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 28px rgba(121, 82, 255, 0.6)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(121, 82, 255, 0.4)';
        }}
      >
        <MessageSquare size={20} color="#ffffff" />
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 11, 16, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            padding: '1.5rem',
            zIndex: 160,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div
            className="card"
            style={{
              width: '340px',
              maxWidth: '100%',
              padding: '1.75rem',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18} color="var(--accent-purple)" />
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>Share Feedback</span>
              </div>
              <button
                onClick={handleClose}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {submitted ? (
              /* Success state */
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Thank you!
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  Your feedback helps improve the Midnight Privacy Lottery for everyone.
                </p>
                <button
                  onClick={handleClose}
                  className="btn btn-secondary"
                  style={{ marginTop: '1.25rem', width: '100%' }}
                >
                  Close
                </button>
              </div>
            ) : (
              /* Form */
              <>
                {/* Star rating */}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  How would you rate your experience?
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.2rem',
                        transition: 'transform 0.15s ease',
                        transform: hoveredRating >= star ? 'scale(1.2)' : 'scale(1)',
                      }}
                    >
                      <Star
                        size={24}
                        fill={(hoveredRating || rating) >= star ? '#f59e0b' : 'transparent'}
                        color={(hoveredRating || rating) >= star ? '#f59e0b' : 'var(--border-color)'}
                      />
                    </button>
                  ))}
                </div>

                {/* Category */}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Category
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '9999px',
                        border: `1px solid ${category === cat ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                        background: category === cat ? 'rgba(121, 82, 255, 0.15)' : 'transparent',
                        color: category === cat ? '#b096ff' : 'var(--text-muted)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Comment */}
                <textarea
                  placeholder="Optional comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="input-field"
                  style={{ resize: 'none', marginBottom: '0.5rem', fontSize: '0.875rem' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginBottom: '1rem' }}>
                  {comment.length}/500
                </p>

                {error && (
                  <p style={{ color: 'var(--error-red)', fontSize: '0.825rem', marginBottom: '0.75rem' }}>
                    {error}
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ width: '100%', gap: '0.5rem' }}
                >
                  {submitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send size={15} />
                      Submit Feedback
                    </>
                  )}
                </button>

                {!FEEDBACK_ENDPOINT && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
                    Opens your email client (no backend configured)
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
