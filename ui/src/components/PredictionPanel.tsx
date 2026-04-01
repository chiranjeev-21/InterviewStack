// src/components/PredictionPanel.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPrediction } from '@/services/api';
import type { QuestionCategory } from '@/types/api';
import { Spinner } from './ui';
import { Sparkles, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface Props {
  companySlug: string;
  availableRoles: string[];
}

const CAT_COLORS: Record<QuestionCategory, string> = {
  DSA:              '#6366f1',
  SYSTEM_DESIGN:    '#10b981',
  LLD:              '#8b5cf6',
  BEHAVIORAL:       '#f59e0b',
  DATABASE:         '#38bdf8',
  OS_NETWORKING:    '#f43f5e',
  LANGUAGE_SPECIFIC:'#fb923c',
};

const CAT_LABELS: Record<QuestionCategory, string> = {
  DSA:              'DSA',
  SYSTEM_DESIGN:    'System Design',
  LLD:              'Low Level Design',
  BEHAVIORAL:       'Behavioral',
  DATABASE:         'Database',
  OS_NETWORKING:    'OS / Networking',
  LANGUAGE_SPECIFIC:'Language Specific',
};

export default function PredictionPanel({ companySlug, availableRoles }: Props) {
  const [selectedRole, setSelectedRole] = useState(availableRoles[0] ?? '');
  const [expanded, setExpanded] = useState<QuestionCategory | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['prediction', companySlug, selectedRole],
    queryFn: () => getPrediction(companySlug, selectedRole),
    enabled: !!selectedRole,
    staleTime: 5 * 60_000,
  });

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-accent)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Sparkles size={18} color="var(--indigo-light)" />
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            Interview Predictor
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Bayesian predictions based on community data
          </p>
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {/* Role selector */}
        {availableRoles.length > 0 ? (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
              SELECT ROLE
            </label>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-muted)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                padding: '9px 12px',
                fontSize: 14,
                fontFamily: 'var(--font-body)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {availableRoles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            No interview reports yet. Be the first to contribute!
          </p>
        )}

        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <Spinner />
          </div>
        )}

        {/* Error */}
        {isError && (
          <p style={{ color: 'var(--rose)', fontSize: 13, textAlign: 'center' }}>
            Failed to load predictions.
          </p>
        )}

        {/* Results */}
        {data && (
          <>
            {/* Insight callout */}
            <div style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: 20,
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <Info size={14} color="var(--indigo-light)" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {data.insight}
              </p>
            </div>

            {/* Category probability bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.categoryPredictions.slice(0, 6).map(cp => {
                const color = CAT_COLORS[cp.category] ?? '#6366f1';
                const pct   = Math.round(cp.probability * 100);
                const isExp = expanded === cp.category;

                return (
                  <div key={cp.category}>
                    <button
                      onClick={() => setExpanded(isExp ? null : cp.category)}
                      style={{
                        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                        padding: 0, textAlign: 'left',
                      }}
                    >
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: 5,
                      }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {CAT_LABELS[cp.category]}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            fontSize: 13, fontWeight: 700, color,
                            fontFamily: 'var(--font-mono)',
                          }}>
                            {pct}%
                          </span>
                          {cp.topTopics.length > 0 && (
                            isExp
                              ? <ChevronUp size={12} color="var(--text-muted)" />
                              : <ChevronDown size={12} color="var(--text-muted)" />
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div style={{
                        height: 5, background: 'var(--bg-elevated)',
                        borderRadius: 999, overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          background: color,
                          borderRadius: 999,
                          transition: 'width 0.6s ease',
                          boxShadow: `0 0 8px ${color}66`,
                        }} />
                      </div>
                    </button>

                    {/* Expanded topics */}
                    {isExp && cp.topTopics.length > 0 && (
                      <div style={{
                        marginTop: 8, paddingLeft: 4,
                        display: 'flex', flexWrap: 'wrap', gap: 6,
                      }}>
                        {cp.topTopics.map(t => (
                          <span key={t.topic} style={{
                            fontSize: 11, padding: '3px 9px',
                            background: `${color}15`,
                            border: `1px solid ${color}33`,
                            borderRadius: 999,
                            color,
                            fontFamily: 'var(--font-mono)',
                          }}>
                            {t.topic} · {Math.round(t.frequency * 100)}%
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p style={{
              fontSize: 11, color: 'var(--text-disabled)',
              marginTop: 16, fontFamily: 'var(--font-mono)',
              textAlign: 'center',
            }}>
              Based on {data.dataPointsUsed} interview report{data.dataPointsUsed !== 1 ? 's' : ''}
              {' '}· Laplace-smoothed Bayesian model
            </p>
          </>
        )}
      </div>
    </div>
  );
}
