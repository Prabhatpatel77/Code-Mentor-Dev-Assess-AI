import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProblemById } from '../../services/problemService';
import { ArrowLeft, Code2, Tag, BookOpen, AlertCircle } from 'lucide-react';
import './ProblemDetail.css';

export default function ProblemDetail() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await getProblemById(id);
        if (response.data) {
          setProblem(response.data);
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

  if (loading) {
    return (
      <div className="problem-detail-container" style={{ textAlign: 'center', padding: '5rem', fontFamily: 'monospace' }}>
        Loading problem details from database...
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="problem-detail-container" style={{ textAlign: 'center', padding: '5rem' }}>
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
    <div className="problem-detail-container">
      {/* Top navigation */}
      <div>
        <Link to="/problems" className="btn-secondary" style={{ padding: '0.5rem 0.85rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Problems</span>
        </Link>
      </div>

      {/* Problem Header */}
      <div className="card problem-header-card">
        <div className="problem-meta-row">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{problem.title}</h1>
          <span className={`badge ${diffClass}`}>{problem.difficulty}</span>
          <span className="badge badge-topic">
            <Tag size={12} style={{ color: 'var(--accent-indigo)' }} />
            {problem.topic}
          </span>
        </div>

        <div>
          <h2 className="text-xs font-mono text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Problem Statement
          </h2>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-line', color: 'var(--text-main)' }}>
            {problem.description}
          </p>
        </div>
      </div>

      {/* Examples */}
      {problem.examples && problem.examples.length > 0 && (
        <div className="card">
          <h2 className="text-xs font-mono text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', marginBottom: '1rem' }}>
            Examples
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {problem.examples.map((ex, idx) => (
              <div key={idx} className="problem-example-card">
                <div><span style={{ color: 'var(--accent-indigo)', fontWeight: 'bold' }}>Input:</span> {ex.input}</div>
                <div><span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>Output:</span> {ex.output}</div>
                {ex.explanation && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.35rem', fontFamily: 'sans-serif', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.35rem' }}>
                    {ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placeholder for Next Phase Code Editor */}
      <div className="placeholder-editor-box">
        <Code2 size={36} style={{ color: 'var(--accent-indigo)' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Interactive Code Editor</h3>
        <p style={{ fontSize: '0.9rem', maxWidth: '500px' }}>
          Code editor, JavaScript execution sandbox, and AI assessment tools will be implemented in the next phase.
        </p>
      </div>
    </div>
  );
}
