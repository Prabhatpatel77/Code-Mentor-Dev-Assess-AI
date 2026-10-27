import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import './TestResults.css';

export default function TestResults({ loading, error, result }) {
  if (loading) {
    return (
      <div className="test-results-container">
        <div className="test-results-header">
          <span className="test-results-title">Test Execution Results</span>
        </div>
        <div className="test-results-loading">
          <Clock size={18} className="animate-spin" style={{ display: 'inline-block', marginRight: '0.5rem' }} />
          Running code against test cases...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-results-container">
        <div className="test-results-header">
          <span className="test-results-title">Test Execution Results</span>
        </div>
        <div className="test-results-error">
          <AlertCircle size={18} />
          <span>{error || 'Unable to execute the code. Please try again.'}</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="test-results-container">
        <div className="test-results-header">
          <span className="test-results-title">Test Execution Results</span>
        </div>
        <div className="test-results-empty">
          Run your code or submit a solution to see test results.
        </div>
      </div>
    );
  }

  const { status, passed, total, results = [], executionTimeMs } = result;
  const isAccepted = status === 'Accepted' || passed === total;

  return (
    <div className="test-results-container">
      <div className="test-results-header">
        <span className="test-results-title">Test Execution Results</span>
        <span className={`badge ${isAccepted ? 'badge-easy' : 'badge-hard'}`}>
          {isAccepted ? '✓ Accepted' : status || 'Wrong Answer'}
        </span>
      </div>

      <div className="test-results-summary-bar">
        <span>Passed: <strong style={{ color: 'var(--text-main)' }}>{passed} / {total}</strong></span>
        {executionTimeMs !== undefined && (
          <span>Execution Time: <strong style={{ color: 'var(--text-main)' }}>{executionTimeMs} ms</strong></span>
        )}
      </div>

      {results && results.length > 0 && (
        <div className="test-cases-list">
          {results.map((tr, idx) => {
            const isCasePassed = tr.passed;
            return (
              <div
                key={idx}
                className={`test-case-item ${isCasePassed ? 'passed' : 'failed'}`}
              >
                <div className={`test-case-header ${isCasePassed ? 'passed' : 'failed'}`}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {isCasePassed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span>Test Case #{idx + 1}</span>
                  </span>
                  <span>{isCasePassed ? 'Passed' : 'Wrong Answer'}</span>
                </div>

                <div className="test-case-details">
                  <div><span>Input:</span> {JSON.stringify(tr.input)}</div>
                  <div><span>Expected Output:</span> {JSON.stringify(tr.expected)}</div>
                  <div><span>Actual Output:</span> {JSON.stringify(tr.actual)}</div>
                  {tr.error && (
                    <div className="test-case-error">
                      <span>Error:</span> {tr.error}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
