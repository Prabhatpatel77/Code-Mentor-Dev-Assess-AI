import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Users, Search, ChevronRight, User, AlertCircle } from 'lucide-react';
import './AdminDashboard.css';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/admin/students?search=${encodeURIComponent(query)}`);
      if (res.data && res.data.students) {
        setStudents(res.data.students);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load student roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(search);
  }, [search]);

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Student Management</h1>
          <p className="admin-subtitle">Directory of registered students and performance analytics</p>
        </div>

        <div className="problems-search-input-wrapper">
          <Search size={16} className="problems-search-icon" />
          <input
            type="text"
            placeholder="Search student name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.3rem', width: '280px' }}
          />
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--accent-rose)', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#fda4af', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading student roster...
        </div>
      ) : students.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No registered students found.
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Student</th>
                <th style={{ padding: '1rem 1.25rem' }}>Registered Date</th>
                <th style={{ padding: '1rem 1.25rem' }}>Attempted</th>
                <th style={{ padding: '1rem 1.25rem' }}>Solved</th>
                <th style={{ padding: '1rem 1.25rem' }}>Accuracy</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Report</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                        <User size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{student.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {student.attempted}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
                    {student.solved}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className={`badge ${student.accuracy >= 70 ? 'badge-easy' : student.accuracy >= 40 ? 'badge-medium' : 'badge-hard'}`}>
                      {student.accuracy}%
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <Link
                      to={`/admin/students/${student.id}`}
                      className="btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <span>View Report</span>
                      <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
