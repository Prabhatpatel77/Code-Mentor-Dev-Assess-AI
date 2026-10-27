import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProblems } from '../../services/api';
import { BookOpen, Code2, Tag, ChevronRight, Search } from 'lucide-react';
import './Problems.css';

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await fetchProblems();
        setProblems(response.data || []);
      } catch (err) {
        console.error('Failed to load problems:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const topics = ['All', 'Arrays', 'Strings', 'HashMap', 'Two Pointers'];

  const filteredProblems = problems.filter((p) => {
    const matchesTopic = selectedTopic === 'All' || p.topic === selectedTopic;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  return (
    <div className="problems-container">
      {/* Header */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen size={24} style={{ color: 'var(--accent-indigo)' }} />
            <span>Coding Problems</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Select a JavaScript coding challenge to practice, run test cases, and receive AI hints.
          </p>
        </div>

        {/* Search bar */}
        <div className="problems-search-input-wrapper">
          <Search size={16} className="problems-search-icon" />
          <input
            type="text"
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.3rem' }}
          />
        </div>
      </div>

      {/* Filter Badges */}
      <div className="problems-filters">
        <span className="text-xs font-mono text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', marginRight: '0.5rem' }}>Topic:</span>
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTopic(t)}
            className="btn-secondary"
            style={{
              padding: '0.4rem 0.85rem',
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

      {/* Problems List */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
          Loading problem set...
        </div>
      ) : filteredProblems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No problems match your current criteria.
        </div>
      ) : (
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

                  <div className="text-xs font-mono text-dim" style={{ display: 'flex', gap: '1rem', color: 'var(--text-dim)' }}>
                    <span>{problem.testCases?.length || 0} Test Cases</span>
                    <span>JavaScript Only</span>
                  </div>
                </div>

                <div>
                  <Link
                    to={`/problems/${problem._id}`}
                    className="btn-primary"
                    style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}
                  >
                    <Code2 size={16} />
                    <span>Solve Challenge</span>
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
