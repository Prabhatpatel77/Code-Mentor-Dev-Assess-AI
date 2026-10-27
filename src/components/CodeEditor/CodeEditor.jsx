import React from 'react';
import { Terminal, Code2 } from 'lucide-react';
import './CodeEditor.css';

export default function CodeEditor({ code, onChange, disabled }) {
  return (
    <div className="code-editor-container">
      <div className="code-editor-header">
        <div className="code-editor-title">
          <Terminal size={16} style={{ color: 'var(--accent-indigo)' }} />
          <span>Solution Workspace</span>
        </div>
        <div className="code-editor-badge">
          <span>JavaScript (ES2022)</span>
        </div>
      </div>

      <div className="code-editor-body">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="code-editor-textarea"
          placeholder="// Write your JavaScript function here..."
          spellCheck="false"
        />
      </div>
    </div>
  );
}
