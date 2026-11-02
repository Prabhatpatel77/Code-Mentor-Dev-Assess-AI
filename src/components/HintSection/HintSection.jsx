import React, { useState } from 'react';
import { Lightbulb, Sparkles, AlertCircle, BookOpen, Copy, Check } from 'lucide-react';
import './HintSection.css';

const LEVEL_LABELS = {
  1: 'Level 1 — Conceptual',
  2: 'Level 2 — Approach',
  3: 'Level 3 — Code Structure',
  4: 'Level 4 — Debugging'
};

export default function HintSection({ 
  onRequestHint, 
  loading, 
  error, 
  currentNextLevel, 
  hintHistory = [],
  onRevealSolutionClick,
  onConfirmReveal,
  onCancelReveal,
  showConfirmation,
  solutionLoading,
  solutionData,
  solutionError,
  solutionValidation
}) {
  const level = Math.min(Math.max(currentNextLevel || 1, 1), 4);
  const isLevel4 = level === 4;
  const hasReachedLevel4 = hintHistory.some(h => h.level === 4) || currentNextLevel > 4;
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="hint-section-card">
      <div className="hint-section-header">
        <div className="hint-section-title">
          <Lightbulb size={20} style={{ color: 'var(--accent-amber)' }} />
          <span>Adaptive Hint Agent</span>
        </div>
        <span className="hint-level-badge">
          {isLevel4 ? 'Level 4: Debugging' : `Next: Level ${level}`}
        </span>
      </div>

      <div className="hint-description">
        {isLevel4 ? (
          <p>
            You are currently at <strong>Level 4 — Debugging</strong>.
            Hints analyze your code and test results to identify errors without revealing the full solution.
          </p>
        ) : (
          <p>
            You are currently requesting <strong>{LEVEL_LABELS[level] || 'Level 1'}</strong>.
            Hints provide progressive guidance without spoiling the solution.
          </p>
        )}
      </div>

      {error && (
        <div className="hint-error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={onRequestHint}
        disabled={loading || solutionLoading}
        className="btn-hint"
      >
        <Sparkles size={16} className={loading ? 'animate-spin' : ''} />
        <span>
          {loading 
            ? 'Generating hint...' 
            : `Get Hint (${LEVEL_LABELS[level] || 'Level 1'})`
          }
        </span>
      </button>

      {/* Complete Solution Reveal Section (Visible after Level 4 reached) */}
      {hasReachedLevel4 && !solutionData && (
        <div className="solution-reveal-section">
          <div className="solution-reveal-divider" />
          <div className="solution-reveal-prompt">
            <BookOpen size={18} style={{ color: 'var(--accent-purple)' }} />
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Still stuck? Learn the complete solution.</h4>
              <p className="text-muted text-xs mt-0.5">Unlock step-by-step guidance and optimal code.</p>
            </div>
          </div>

          {showConfirmation ? (
            <div className="solution-confirm-box">
              <p className="solution-confirm-text">
                Still unable to solve this problem? You can now view a complete solution with a step-by-step explanation. Try to understand the approach rather than simply copying the code.
              </p>
              <div className="solution-confirm-actions">
                <button
                  onClick={onConfirmReveal}
                  disabled={solutionLoading}
                  className="btn-primary"
                  style={{ backgroundColor: 'var(--accent-purple)', fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                >
                  {solutionLoading ? 'Generating Solution...' : 'View Complete Solution'}
                </button>
                <button
                  onClick={onCancelReveal}
                  disabled={solutionLoading}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                >
                  Continue Practicing
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onRevealSolutionClick}
              disabled={solutionLoading}
              className="btn-reveal-solution"
            >
              <BookOpen size={16} />
              <span>Reveal Complete Solution</span>
            </button>
          )}

          {solutionError && (
            <div className="hint-error-message mt-2">
              <AlertCircle size={16} />
              <span>{solutionError}</span>
            </div>
          )}
        </div>
      )}

      {/* Render Revealed Complete Solution */}
      {solutionData && (
        <div className="revealed-solution-container">
          <div className="solution-header-row">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc' }}>
              <BookOpen size={18} />
              <span>Complete Solution & Explanation</span>
            </h3>
            {solutionValidation && (
              <span className={`badge ${solutionValidation.validationPassed ? 'badge-easy' : 'badge-medium'}`}>
                {solutionValidation.validationPassed ? '✓ Validated (All Tests Passed)' : `Validated (${solutionValidation.passed}/${solutionValidation.total} Passed)`}
              </span>
            )}
          </div>

          <div className="solution-block">
            <h4 className="solution-section-title">Problem Understanding</h4>
            <p className="solution-text">{solutionData.problemUnderstanding}</p>
          </div>

          <div className="solution-block">
            <h4 className="solution-section-title">Approach</h4>
            <p className="solution-text">{solutionData.approach}</p>
          </div>

          <div className="solution-block">
            <div className="flex justify-between items-center mb-1">
              <h4 className="solution-section-title" style={{ margin: 0 }}>Complete JavaScript Code</h4>
              <button
                onClick={() => handleCopyCode(solutionData.code)}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                {copied ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="solution-code-pre">
              <code>{solutionData.code}</code>
            </pre>
          </div>

          {solutionData.codeExplanation && solutionData.codeExplanation.length > 0 && (
            <div className="solution-block">
              <h4 className="solution-section-title">Code Explanation</h4>
              <ul className="solution-list">
                {solutionData.codeExplanation.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.section}:</strong> {item.explanation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {solutionData.dryRun && solutionData.dryRun.length > 0 && (
            <div className="solution-block">
              <h4 className="solution-section-title">Dry Run & Step-by-Step Trace</h4>
              <ul className="solution-list">
                {solutionData.dryRun.map((step, idx) => (
                  <li key={idx}>
                    <strong>Step {step.step || idx + 1}:</strong> {step.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="solution-meta-grid">
            <div className="solution-meta-card">
              <span className="text-xs text-muted font-mono">Time Complexity</span>
              <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{solutionData.timeComplexity}</strong>
            </div>
            <div className="solution-meta-card">
              <span className="text-xs text-muted font-mono">Space Complexity</span>
              <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{solutionData.spaceComplexity}</strong>
            </div>
          </div>

          {solutionData.commonMistakes && solutionData.commonMistakes.length > 0 && (
            <div className="solution-block">
              <h4 className="solution-section-title" style={{ color: 'var(--accent-rose)' }}>Common Mistakes & Pitfalls</h4>
              <ul className="solution-list">
                {solutionData.commonMistakes.map((mistake, idx) => (
                  <li key={idx} style={{ color: 'var(--text-muted)' }}>{mistake}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
