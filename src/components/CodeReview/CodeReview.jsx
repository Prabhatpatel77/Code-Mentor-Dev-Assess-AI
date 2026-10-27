import React from 'react';
import ReviewCategory from '../ReviewCategory/ReviewCategory';
import { ShieldCheck, Sparkles, AlertCircle, Clock } from 'lucide-react';
import './CodeReview.css';

export default function CodeReview({ onReviewRequest, loading, error, review }) {
  return (
    <div className="code-review-container">
      <div className="code-review-top-bar">
        <div className="code-review-title">
          <ShieldCheck size={20} style={{ color: 'var(--accent-indigo)' }} />
          <span>AI Code Review</span>
        </div>
        <button
          onClick={onReviewRequest}
          disabled={loading}
          className="btn-primary"
          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
        >
          <Sparkles size={16} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Analyzing your code...' : 'Review My Code'}</span>
        </button>
      </div>

      {loading && (
        <div className="code-review-loading">
          <Clock size={18} className="animate-spin" style={{ display: 'inline-block', marginRight: '0.5rem' }} />
          Analyzing your code against correctness, style, performance, and security...
        </div>
      )}

      {error && (
        <div className="code-review-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && !review && (
        <div className="code-review-empty">
          Click <strong>Review My Code</strong> to receive AI mentor feedback on your solution.
        </div>
      )}

      {!loading && review && (
        <div className="code-review-results-card">
          <div className="review-summary-header">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Review Summary</h3>
              <p className="text-muted text-sm mt-1">{review.summary}</p>
            </div>
            {review.overallScore !== undefined && (
              <div className="overall-score-badge">
                <span>Score: <strong>{review.overallScore}</strong>/100</span>
              </div>
            )}
          </div>

          <div className="review-categories-grid">
            <ReviewCategory
              title="Correctness"
              status={review.correctness?.status}
              feedback={review.correctness?.feedback}
            />
            <ReviewCategory
              title="Code Quality & Style"
              score={review.codeQuality?.score}
              feedback={review.codeQuality?.feedback}
            />
            <ReviewCategory
              title="Performance"
              timeComplexity={review.performance?.timeComplexity}
              spaceComplexity={review.performance?.spaceComplexity}
              feedback={review.performance?.feedback}
            />
            <ReviewCategory
              title="Security Concerns"
              status={review.security?.status}
              feedback={review.security?.feedback}
            />
          </div>
        </div>
      )}
    </div>
  );
}
