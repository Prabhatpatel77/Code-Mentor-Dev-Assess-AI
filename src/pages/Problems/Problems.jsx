import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProblems } from '../../services/problemService';
import { BookOpen, Code2, Tag, ChevronRight, Search, AlertCircle } from 'lucide-react';
import './Problems.css';

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProblems({
        topic: selectedTopic,
        difficulty: selectedDifficulty
      });
      setProblems(response.data || []);
    } catch (err) {
      console.error('Failed to load problems:', err);
      setError(err.message || 'Failed to connect to Express server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, [selectedTopic, selectedDifficulty]);

  const topics = ['All', 'Arrays', 'Strings', 'HashMap', 'Two Pointers'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredProblems = problems.filter((p) => {
    return p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           p.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="problems-container">
      {/* Header */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen size={24} style={{ color: 'var(--accent-indigo)' }} />
            <span>Coding Problems Catalog</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Browse coding challenges stored in MongoDB database with difficulty and topic filters.
          </p>
        </div>

        {/* Search bar */}
        <div className="problems-search-input-wrapper">
          <Search size={16} className="problems-search-icon" />
          <input
            type="text"
            placeholder="Search problem title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.3rem' }}
          />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', padding: '1rem 1.25rem' }}>
        {/* Difficulty filter */}
        <div className="problems-filters">
          <span className="text-xs font-mono text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', marginRight: '0.25rem' }}>Difficulty:</span>
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d)}
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                backgroundColor: selectedDifficulty === d ? 'var(--accent-indigo)' : 'var(--bg-card)',
                color: selectedDifficulty === d ? 'white' : 'var(--text-muted)',
                borderColor: selectedDifficulty === d ? 'var(--accent-indigo)' : 'var(--border-color)'
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Topic filter */}
        <div className="problems-filters">
          <span className="text-xs font-mono text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', marginRight: '0.25rem' }}>Topic:</span>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                backgroundColor: selectedTopic === t ? 'var(--accent-indigo)' : 'var(--bg-card)',
                color: selectedTopic === t ? 'white' : 'var(--text-muted)',
                borderColor: selectedTopic === t ? 'var(--accent-indigo)' : 'var(--border-color)'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="card" style={{ borderColor: 'var(--accent-rose)', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#fda4af', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <div>
            <strong>Error loading problems:</strong> {error}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
          Loading problem set from MongoDB...
        </div>
      ) : filteredProblems.length === 0 ? (
        /* Empty state */
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
          No coding problems found for the selected filters.
        </div>
      ) : (
        /* Problems list */
        <div className="problems-list">
          {filteredProblems.map((problem) => {
            const diffClass = problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard';
            return (
              <div
                key={problem._id}
                className="card problem-item-card"
              >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div className="flex items-center gap-2">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{problem.title}</h3>
                    <span className={`badge ${diffClass}`}>
                      {problem.difficulty}
                    </span>
                    <span className="badge badge-topic">
                      <Tag size={12} style={{ color: 'var(--accent-indigo)' }} />
                      {problem.topic}
                    </span>
                  </div>

                  <p className="text-muted text-sm" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {problem.description}
                  </p>

                  <div className="text-xs font-mono" style={{ display: 'flex', gap: '1rem', color: 'var(--text-dim)' }}>
                    <span>{problem.examples?.length || 0} Examples</span>
                    <span>{problem.testCases?.length || 0} Test Cases</span>
                  </div>
                </div>

                <div>
                  <Link
                    to={`/problems/${problem._id}`}
                    className="btn-primary"
                    style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}
                  >
                    <Code2 size={16} />
                    <span>View Details</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
