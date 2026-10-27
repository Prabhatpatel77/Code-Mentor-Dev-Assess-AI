import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProblemById, submitCodeSolution, requestAdaptiveHint, requestCodeReview } from '../../services/api';
import { ArrowLeft, Play, Lightbulb, ShieldCheck, CheckCircle2, XCircle, Terminal, Bot, Sparkles } from 'lucide-react';
import './ProblemDetail.css';

export default function ProblemDetail() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  
  // Execution & AI state
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  
  const [hintLevel, setHintLevel] = useState(1);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintHistory, setHintHistory] = useState([]);

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetchProblemById(id);
        if (response.data) {
          setProblem(response.data);
          setCode(response.data.starterCode || '');
        }
      } catch (err) {
        console.error('Failed to fetch problem:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    setSubmissionResult(null);
    try {
      const res = await submitCodeSolution(problem._id, code);
      setSubmissionResult(res.data);
    } catch (err) {
      setSubmissionResult({
        status: 'Runtime Error',
        error: err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestHint = async () => {
    if (hintLevel > 4) return;
    setHintLoading(true);
    try {
      const currentLevel = hintLevel;
      const newHintsCount = hintsUsed + 1;
      const res = await requestAdaptiveHint(problem._id, currentLevel, newHintsCount, code);
      
      const newHintItem = {
        level: currentLevel,
        text: res.data?.response || res.hintText || `Level ${currentLevel} hint loaded.`
      };

      setHintHistory((prev) => [...prev, newHintItem]);
      setHintsUsed(newHintsCount);
      setHintLevel((prev) => Math.min(prev + 1, 5));
    } catch (err) {
      console.error('Hint error:', err);
    } finally {
      setHintLoading(false);
    }
  };

  const handleRequestReview = async () => {
    setReviewLoading(true);
    try {
      const res = await requestCodeReview(problem._id, code, submissionResult);
      setReviewResult(res.data?.response || res.data?.review_result || 'Code review completed.');
    } catch (err) {
      setReviewResult(`Code review request failed: ${err.message}`);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', fontFamily: 'monospace' }}>
        Loading problem detail...
      </div>
    );
  }

  if (!problem) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--accent-rose)', marginBottom: '1rem' }}>Problem not found</h2>
        <Link to="/problems" className="btn-secondary">
          <ArrowLeft size={16} /> Back to problems
        </Link>
      </div>
    );
  }

  const diffClass = problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard';

  return (
    <div className="problem-detail-layout">
      {/* Top Bar */}
      <div className="problem-detail-topbar">
        <div className="flex items-center gap-4">
          <Link to="/problems" className="btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{problem.title}</h1>
            <span className={`badge ${diffClass}`}>{problem.difficulty}</span>
            <span className="badge badge-topic">{problem.topic}</span>
          </div>
        </div>

        <div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-success"
          >
            <Play size={16} className={submitting ? 'animate-spin' : ''} />
            <span>{submitting ? 'Executing...' : 'Run & Submit'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="problem-workspace-grid">
        
        {/* Left Column: Problem Details & AI Adaptive Features */}
        <div className="problem-left-panel">
          {/* Problem Statement */}
          <div className="card">
            <h2 className="text-xs font-mono text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Problem Description</h2>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-line', color: 'var(--text-main)' }}>
              {problem.description}
            </div>
          </div>

          {/* Examples */}
          {problem.examples && problem.examples.length > 0 && (
            <div className="card">
              <h2 className="text-xs font-mono text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Examples</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {problem.examples.map((ex, idx) => (
                  <div key={idx} style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    <div><span style={{ color: 'var(--accent-indigo)', fontWeight: 'bold' }}>Input:</span> {ex.input}</div>
                    <div><span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>Output:</span> {ex.output}</div>
                    {ex.explanation && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.35rem', fontFamily: 'sans-serif', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.35rem' }}>
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adaptive Hint Agent */}
          <div className="card" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Lightbulb size={20} style={{ color: 'var(--accent-amber)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 750 }}>Adaptive Hint Agent</h3>
              </div>
              <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                {hintLevel <= 4 ? `Next: Level ${hintLevel}` : 'All Hints Revealed'}
              </span>
            </div>

            <p className="text-muted text-xs" style={{ marginBottom: '1rem', lineHeight: 1.5 }}>
              Progressive guidance without spoiling solutions early.
              <br />
              <span style={{ color: '#818cf8' }}>Level 1: Conceptual | Level 2: Approach | Level 3: Code Structure | Level 4: Debugging</span>
            </p>

            <button
              onClick={handleRequestHint}
              disabled={hintLoading || hintLevel > 4}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
            >
              <Sparkles size={16} className={hintLoading ? 'animate-spin' : ''} />
              <span>
                {hintLevel <= 4 ? `Request Level ${hintLevel} Hint (${['Conceptual', 'Approach', 'Code Structure', 'Debugging'][hintLevel - 1]})` : 'Max Hints Reached'}
              </span>
            </button>

            {hintHistory.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {hintHistory.map((h, i) => (
                  <div key={i} style={{ backgroundColor: 'var(--bg-input)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '0.25rem' }}>Hint Level {h.level}</div>
                    <p style={{ color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: 1.5 }}>{h.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Code Review Agent Section */}
          <div className="card" style={{ borderColor: 'rgba(99, 102, 241, 0.3)' }}>
            <div className="card-header">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} style={{ color: 'var(--accent-indigo)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 750 }}>Code Review Agent</h3>
              </div>
              <button
                onClick={handleRequestReview}
                disabled={reviewLoading || !code.trim()}
                className="btn-primary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                <Bot size={14} className={reviewLoading ? 'animate-spin' : ''} />
                <span>{reviewLoading ? 'Reviewing...' : 'Request AI Review'}</span>
              </button>
            </div>

            {reviewResult ? (
              <div style={{ backgroundColor: 'var(--bg-input)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '0.5rem', padding: '1rem', fontSize: '0.85rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {typeof reviewResult === 'string' ? reviewResult : JSON.stringify(reviewResult, null, 2)}
              </div>
            ) : (
              <p className="text-muted text-xs">
                Submit code to enable AI automated review for correctness, style, performance, and security.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Output */}
        <div className="problem-right-panel">
          {/* Editor Header */}
          <div className="editor-header">
            <div className="text-xs font-mono text-muted flex items-center gap-2">
              <Terminal size={16} style={{ color: 'var(--accent-indigo)' }} />
              <span>solution.js (JavaScript Node.js ES2022)</span>
            </div>
            <span className="text-xs font-mono text-dim">MVP JS Sandbox</span>
          </div>

          {/* Code Editor Area */}
          <div className="editor-body">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="code-textarea"
              placeholder="// Write your JavaScript function here..."
              spellCheck="false"
            />
          </div>

          {/* Test Case Execution Output Window */}
          <div className="test-output-panel">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono text-muted" style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Test Execution Results
              </h3>
              {submissionResult && (
                <span className={`badge ${submissionResult.status === 'Accepted' ? 'badge-easy' : 'badge-hard'}`}>
                  {submissionResult.status}
                </span>
              )}
            </div>

            {submitting ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Running tests against Node.js VM sandbox...
              </div>
            ) : submissionResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="text-xs font-mono text-muted" style={{ backgroundColor: 'var(--bg-input)', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tests Passed: <strong className="text-main">{submissionResult.testsPassed} / {submissionResult.totalTests}</strong></span>
                  <span>Execution Time: <strong className="text-main">{submissionResult.executionTimeMs} ms</strong></span>
                </div>

                {submissionResult.testResults && submissionResult.testResults.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {submissionResult.testResults.map((tr, idx) => (
                      <div key={idx} style={{ backgroundColor: tr.passed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)', border: `1px solid ${tr.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`, borderRadius: '0.5rem', padding: '0.65rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        <div className="flex justify-between items-center" style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: tr.passed ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                          <span className="flex items-center gap-1">
                            {tr.passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                            <span>Test Case #{idx + 1}</span>
                          </span>
                          <span>{tr.passed ? 'PASSED' : 'FAILED'}</span>
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <div><span>Input:</span> {JSON.stringify(tr.input)}</div>
                          <div><span>Expected:</span> {JSON.stringify(tr.expectedOutput)}</div>
                          <div><span>Actual:</span> {JSON.stringify(tr.actualOutput)}</div>
                          {tr.error && <div style={{ color: 'var(--accent-rose)', marginTop: '0.2rem' }}><span>Error:</span> {tr.error}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.8rem', fontFamily: 'monospace', border: '1px dashed var(--border-color)', borderRadius: '0.5rem' }}>
                Click "Run & Submit" to test your solution against predefined test cases.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
