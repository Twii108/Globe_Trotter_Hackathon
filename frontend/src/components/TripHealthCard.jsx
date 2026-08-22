import React from 'react';
import { Shield, AlertTriangle, CheckCircle, HelpCircle, DollarSign, Calendar, Clock, Activity } from 'lucide-react';

export default function TripHealthCard({ healthInfo }) {
  if (!healthInfo) {
    return (
      <div style={{
        padding: '1.5rem',
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        textAlign: 'center',
        color: 'var(--text-muted)'
      }}>
        Loading trip health data...
      </div>
    );
  }

  const { healthScore, status, categoryScores = {}, deductions = [], conflicts = [] } = healthInfo;

  // Color selection based on score
  let scoreColor = '#ef4444'; // Red (<50)
  let scoreBg = 'rgba(239, 68, 68, 0.1)';
  let scoreBorder = 'rgba(239, 68, 68, 0.3)';
  
  if (healthScore >= 80) {
    scoreColor = '#10b981'; // Green (80+)
    scoreBg = 'rgba(16, 185, 129, 0.1)';
    scoreBorder = 'rgba(16, 185, 129, 0.3)';
  } else if (healthScore >= 50) {
    scoreColor = '#f59e0b'; // Yellow (50-79)
    scoreBg = 'rgba(245, 158, 11, 0.1)';
    scoreBorder = 'rgba(245, 158, 11, 0.3)';
  }

  // Build a summary sentence
  const getSummarySentence = () => {
    if (healthScore === 100) {
      return "Your itinerary is in perfect shape! Dates are aligned, budget is balanced, and activities are fully set.";
    }
    if (conflicts.length > 0) {
      return `Attention required: ${conflicts[0]}`;
    }
    if (deductions.length > 0) {
      return `Suggestion: ${deductions[0]}`;
    }
    return "Your travel plan is in good shape. Consider adding a few more activities or a custom cover photo.";
  };

  const getCategoryColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
      marginBottom: '1.5rem'
    }}>
      {/* Top Color Band */}
      <div style={{ height: '6px', backgroundColor: scoreColor }} />

      <div style={{ padding: '1.5rem' }}>
        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={22} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Itinerary Health & Status
              </h3>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {status}
              </span>
            </div>
          </div>

          {/* Big Score Bubble */}
          <div style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: scoreBg,
            border: `1px solid ${scoreBorder}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Score:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: scoreColor }}>{healthScore}</span>
          </div>
        </div>

        {/* Plain Language Summary */}
        <p style={{
          margin: '0 0 1.25rem',
          fontSize: '0.9rem',
          color: 'var(--text-main)',
          padding: '0.85rem 1rem',
          backgroundColor: 'var(--neutral-bg)',
          borderRadius: 'var(--radius-md)',
          borderLeft: `4px solid ${scoreColor}`,
          lineHeight: '1.45'
        }}>
          <strong>Summary:</strong> {getSummarySentence()}
        </p>

        {/* Category Breakdown Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>Score</th>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, width: '45%' }}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {/* Budget Row */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                  <DollarSign size={16} color="var(--primary)" /> Budget Compliance
                </td>
                <td style={{ padding: '0.75rem', fontWeight: 700, color: getCategoryColor(categoryScores.budget || 100) }}>
                  {categoryScores.budget || 100}/100
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${categoryScores.budget || 100}%`, backgroundColor: getCategoryColor(categoryScores.budget || 100) }} />
                  </div>
                </td>
              </tr>
              {/* Schedule Row */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                  <Calendar size={16} color="var(--primary)" /> Schedule Integrity
                </td>
                <td style={{ padding: '0.75rem', fontWeight: 700, color: getCategoryColor(categoryScores.schedule || 100) }}>
                  {categoryScores.schedule || 100}/100
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${categoryScores.schedule || 100}%`, backgroundColor: getCategoryColor(categoryScores.schedule || 100) }} />
                  </div>
                </td>
              </tr>
              {/* Travel Time Row */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                  <Clock size={16} color="var(--primary)" /> Pacing & Gaps
                </td>
                <td style={{ padding: '0.75rem', fontWeight: 700, color: getCategoryColor(categoryScores.travelTime || 100) }}>
                  {categoryScores.travelTime || 100}/100
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${categoryScores.travelTime || 100}%`, backgroundColor: getCategoryColor(categoryScores.travelTime || 100) }} />
                  </div>
                </td>
              </tr>
              {/* Activities Row */}
              <tr>
                <td style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                  <Activity size={16} color="var(--primary)" /> Activities Completeness
                </td>
                <td style={{ padding: '0.75rem', fontWeight: 700, color: getCategoryColor(categoryScores.activities || 100) }}>
                  {categoryScores.activities || 100}/100
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${categoryScores.activities || 100}%`, backgroundColor: getCategoryColor(categoryScores.activities || 100) }} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
