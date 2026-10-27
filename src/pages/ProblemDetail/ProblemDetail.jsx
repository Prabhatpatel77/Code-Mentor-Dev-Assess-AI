import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProblemById } from '../../services/problemService';
import { runCode, submitSolution } from '../../services/submissionService';
import { getAdaptiveHint } from '../../services/hintService';
import CodeEditor from '../../components/CodeEditor/CodeEditor';
import TestResults from '../../components/TestResults/TestResults';
import HintSection from '../../components/HintSection/HintSection';
import HintHistory from '../../components/HintHistory/HintHistory';
import { ArrowLeft, Play, Send, Tag, AlertCircle } from 'lucide-react';
import './ProblemDetail.css';

export default function ProblemDetail() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Code editor state
  const [code, setCode] = useState('');

  // Submission / Execution state
  const [executing, setExecuting] = useState(false);
  const [executionError, setExecutionError] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Adaptive Hint state
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState(null);
  const [hintHistory, setHintHistory] = useState([]);
  const [nextHintLevel, setNextHintLevel] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await getProblemById(id);
        if (response.data) {
          setProblem(response.data);
          setCode(response.data.starterCode || 'function solution(input) {\n  // Write your solution here\n}');
        } else {
          setError(`Problem '${id}' not found.`);
        }
      } catch (err) {
        console.error('Failed to fetch problem:', err);
        setError(err.response?.data?.message || `Problem with ID '${id}' not found.`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setExecuting(true);
    setExecutionError(null);
    setTestResult(null);

    try {
      const res = await runCode(problem._id, code);
      setTestResult(res);
    } catch (err) {
      console.error('Run code error:', err);
      setExecutionError(err.response?.data?.message || 'Unable to execute the code. Please try again.');
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmitSolution = async () => {
    if (!code.trim()) return;
    setExecuting(true);
    setExecutionError(null);
    setTestResult(null);

    try {
      const res = await submitSolution(problem._id, code);
      setTestResult(res);
    } catch (err) {
      console.error('Submit solution error:', err);
      setExecutionError(err.response?.data?.message || 'Unable to submit the solution. Please try again.');
    } finally {
      setExecuting(false);
    }
  };

  const handleRequestHint = async () => {
    if (nextHintLevel > 4) return;
    setHintLoading(true);
    setHintError(null);

    try {
      const activeTestResults = testResult ? testResult.results : [];
      const res = await getAdaptiveHint(problem._id, code, activeTestResults);

      if (res && res.success) {
        const receivedLevel = res.hintLevel || nextHintLevel;
        const newHintObj = {
          level: receivedLevel,
          hint: res.hint
        };

        setHintHistory((prev) => [...prev, newHintObj]);
        setNextHintLevel(Math.min(receivedLevel + 1, 5));
      } else {
        setHintError('Could not retrieve hint. Please try again.');
      }
    } catch (err) {
      console.error('Adaptive Hint error:', err);
      setHintError(err.response?.data?.message || 'Failed to request AI hint. Please check your connection.');
    } finally {
      setHintLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', fontFamily: 'monospace' }}>
        Loading problem details from database...
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <div className="card" style={{ borderColor: 'var(--accent-rose)', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#fda4af', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <AlertCircle size={22} />
          <span>{error || 'Problem not found'}</span>
        </div>
        <Link to="/problems" className="btn-secondary">
          <ArrowLeft size={16} /> Back to Problems Catalog
        </Link>
      </div>
    );
  }

  const diffClass = problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard';

  return (
    <div className="problem-detail-layout">
      {/* Top Navigation & Action Header */}
      <div className="problem-detail-topbar">
        <div className="flex items-center gap-4">
          <Link to="/problems" className="btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{problem.title}</h1>
            <span className={`badge ${diffClass}`}>{problem.difficulty}</span>
            <span className="badge badge-topic">
              <Tag size={12} style={{ color: 'var(--accent-indigo)' }} />
              {problem.topic}
            </span>
          </div>
        </div>

        <div className="problem-detail-actions">
          <button
            onClick={handleRunCode}
            disabled={executing || !code.trim()}
            className="btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Play size={15} className={executing ? 'animate-spin' : ''} />
            <span>{executing ? 'Running...' : 'Run Code'}</span>
          </button>

          <button
            onClick={handleSubmitSolution}
            disabled={executing || !code.trim()}
            className="btn-success"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Send size={15} className={executing ? 'animate-spin' : ''} />
            <span>{executing ? 'Submitting...' : 'Submit Solution'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="problem-workspace-grid">
        
        {/* Left Column: Problem Statement, Examples, & Adaptive Hint Agent */}
        <div className="problem-left-panel">
          <div className="card">
            <h2 className="text-xs font-mono text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Problem Description
            </h2>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-line', color: 'var(--text-main)' }}>
              {problem.description}
            </div>
          </div>

          {problem.examples && problem.examples.length > 0 && (
            <div className="card">
              <h2 className="text-xs font-mono text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.85rem' }}>
                Examples
              </h2>
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

          {/* Adaptive Hint Agent UI */}
          <HintSection
            onRequestHint={handleRequestHint}
            loading={hintLoading}
            error={hintError}
            currentNextLevel={nextHintLevel}
          />

          <HintHistory hints={hintHistory} />
        </div>

        {/* Right Column: Code Editor & Execution Results */}
        <div className="problem-right-panel">
          <CodeEditor
            code={code}
            onChange={setCode}
            disabled={executing}
          />

          <TestResults
            loading={executing}
            error={executionError}
            result={testResult}
          />
        </div>

      </div>
    </div>
  );
}
