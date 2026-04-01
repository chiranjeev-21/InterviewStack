// src/pages/ExperiencePage.tsx
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getExperience } from '@/services/api';
import { CategoryBadge, DifficultyBadge, OutcomeBadge, Spinner, EmptyState } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ChevronLeft, ShieldCheck, Calendar, Layers, Hash } from 'lucide-react';

export default function ExperiencePage() {
  const { id } = useParams<{ id: string }>();

  const { data: exp, isLoading } = useQuery({
    queryKey: ['experience', id],
    queryFn: () => getExperience(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
      <Spinner size={36} />
    </div>
  );

  if (!exp) return <EmptyState icon="📄" title="Experience not found" />;

  // Group questions by round
  const byRound = exp.questions.reduce<Record<string, typeof exp.questions>>((acc, q) => {
    const key = q.roundNumber ? `Round ${q.roundNumber}` : 'General';
    acc[key] = [...(acc[key] ?? []), q];
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>

      {/* Breadcrumb */}
      <div style={{ padding: '24px 0 0' }}>
        <Link to={`/companies/${exp.company.slug}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--text-muted)', fontSize: 14,
          transition: 'color 0.15s',
        }}
          onMouseEnter={e2 => (e2.currentTarget).style.color = 'var(--text-primary)'}
          onMouseLeave={e2 => (e2.currentTarget).style.color = 'var(--text-muted)'}
        >
          <ChevronLeft size={16} /> {exp.company.name}
        </Link>
      </div>

      {/* Header card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        marginTop: 20, marginBottom: 32,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative gradient */}
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 300, height: '100%',
          background: 'radial-gradient(circle at 100% 0%, rgba(99,102,241,0.07) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 20 }}>
          {/* Company logo */}
          {exp.company.logoUrl && (
            <img
              src={exp.company.logoUrl}
              alt={exp.company.name}
              style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'contain', background: '#fff', padding: 4 }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3vw, 30px)',
              fontWeight: 800, letterSpacing: '-0.5px',
              marginBottom: 4,
            }}>
              {exp.role}
              {exp.level && (
                <span style={{ marginLeft: 10, fontSize: 16, color: 'var(--indigo-light)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                  {exp.level}
                </span>
              )}
            </h1>
            <Link to={`/companies/${exp.company.slug}`} style={{ color: 'var(--indigo-light)', fontSize: 15, fontWeight: 500 }}>
              {exp.company.name}
            </Link>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
          <DifficultyBadge difficulty={exp.difficulty} />
          <OutcomeBadge outcome={exp.outcome} />

          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}>
            <Calendar size={13} />
            {exp.year}{exp.month ? `/${String(exp.month).padStart(2, '0')}` : ''}
          </span>

          {exp.rounds && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}>
              <Layers size={13} /> {exp.rounds} rounds
            </span>
          )}

          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}>
            <Hash size={13} /> {exp.questions.length} questions
          </span>
        </div>

        {/* Description */}
        {exp.description && (
          <p style={{
            fontSize: 15, color: 'var(--text-secondary)',
            lineHeight: 1.75,
            padding: '16px 0',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            {exp.description}
          </p>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 16, borderTop: '1px solid var(--border-subtle)', marginTop: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} color="var(--emerald)" />
            <span style={{ fontSize: 13, color: 'var(--emerald)', fontFamily: 'var(--font-mono)' }}>
              Verified: {exp.verifiedEmail}
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }}>
            {formatDistanceToNow(new Date(exp.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Questions by round */}
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
        marginBottom: 24,
      }}>
        Interview Questions
      </h2>

      {Object.entries(byRound).map(([round, questions]) => (
        <div key={round} style={{ marginBottom: 32 }}>
          <h3 style={{
            fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600,
            color: 'var(--indigo-light)', letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            {round}
            <span style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {questions.map((q, i) => (
              <div key={q.id} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                display: 'flex', gap: 16, alignItems: 'flex-start',
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: 'var(--bg-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: 'var(--text-muted)', flexShrink: 0,
                  fontFamily: 'var(--font-mono)',
                  marginTop: 2,
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.65, marginBottom: 10 }}>
                    {q.text}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <CategoryBadge category={q.category} />
                    {q.topic && (
                      <span style={{
                        fontSize: 12, padding: '3px 9px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 999,
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {q.topic}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
