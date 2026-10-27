import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import './ReviewCategory.css';

export default function ReviewCategory({ title, status, score, feedback, timeComplexity, spaceComplexity }) {
  const isPass = status === 'pass' || status === 'success' || (score !== undefined && score >= 70);
  
  return (
    <div className="review-category-card">
      <div className="review-category-header">
        <div className="review-category-title-wrap">
          {isPass ? (
            <CheckCircle2 size={18} className="icon-pass" />
          ) : (
            <AlertTriangle size={18} className="icon-warn" />
          )}
          <span className="review-category-title">{title}</span>
        </div>
        {score !== undefined && (
          <span className="review-category-score">{score}/100</span>
        )}
      </div>

      {(timeComplexity || spaceComplexity) && (
        <div className="complexity-row font-mono text-xs">
          {timeComplexity && <span>Time: <strong>{timeComplexity}</strong></span>}
          {spaceComplexity && <span>Space: <strong>{spaceComplexity}</strong></span>}
        </div>
      )}

      <div className="review-category-body">
        {typeof feedback === 'string' ? (
          <p>{feedback}</p>
        ) : Array.isArray(feedback) ? (
          <ul>
            {feedback.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
