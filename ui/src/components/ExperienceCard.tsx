// src/components/ExperienceCard.tsx
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, MessageSquare, ShieldCheck } from 'lucide-react';
import type { Experience } from '@/types/api';
import { CategoryBadge, DifficultyBadge, OutcomeBadge } from './ui';

interface Props {
  experience: Experience;
}

export default function ExperienceCard({ experience: e }: Props) {
  return (
    <Link to={`/experiences/${e.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <article style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
      }}
        onMouseEnter={e2 => {
          (e2.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
          (e2.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
          (e2.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-glow)';
        }}
        onMouseLeave={e2 => {
          (e2.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
          (e2.currentTarget as HTMLElement).style.transform = 'none';
          (e2.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17, fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 4,
            }}>
              {e.role}
              {e.level && (
                <span style={{
                  marginLeft: 8, fontSize: 12,
                  color: 'var(--indigo-light)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500,
                }}>
                  {e.level}
                </span>
              )}
            </h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {e.year}{e.month ? `/${String(e.month).padStart(2, '0')}` : ''}
              </span>
              {e.rounds && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  · {e.rounds} round{e.rounds > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <OutcomeBadge outcome={e.outcome} />
            <DifficultyBadge difficulty={e.difficulty} />
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
        </div>

        {/* Description preview */}
        {e.description && (
          <p style={{
            fontSize: 14, color: 'var(--text-secondary)',
            lineHeight: 1.6, marginBottom: 14,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {e.description}
          </p>
        )}

        {/* Question category chips */}
        {e.questions.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {/* deduplicated categories */}
            {[...new Set(e.questions.map(q => q.category))].slice(0, 4).map(cat => (
              <CategoryBadge key={cat} category={cat} />
            ))}
            {e.questions.length > 4 && (
              <span style={{
                fontSize: 12, color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)', alignSelf: 'center',
              }}>
                +{e.questions.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 12, borderTop: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
            <ShieldCheck size={13} color="var(--emerald)" />
            <span style={{ color: 'var(--emerald)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              {e.verifiedEmail}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--text-muted)', fontSize: 13 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MessageSquare size={13} />
              {e.questions.length} question{e.questions.length !== 1 ? 's' : ''}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              {formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
