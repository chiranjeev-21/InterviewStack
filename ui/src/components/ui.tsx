// src/components/ui.tsx
import type { QuestionCategory, Difficulty, Outcome } from '@/types/api';

// ── Category Badge ────────────────────────────────────────────────────────────

const CATEGORY_META: Record<QuestionCategory, { label: string; color: string; bg: string }> = {
  DSA:             { label: 'DSA',           color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  SYSTEM_DESIGN:   { label: 'System Design', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  LLD:             { label: 'LLD',           color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  BEHAVIORAL:      { label: 'Behavioral',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  DATABASE:        { label: 'Database',      color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  OS_NETWORKING:   { label: 'OS / Network',  color: '#f43f5e', bg: 'rgba(244,63,94,0.12)'  },
  LANGUAGE_SPECIFIC:{ label: 'Language',     color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
};

export function CategoryBadge({ category }: { category: QuestionCategory }) {
  const meta = CATEGORY_META[category] ?? { label: category, color: '#9898b8', bg: 'rgba(152,152,184,0.12)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: '999px',
      fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em',
      fontFamily: 'var(--font-mono)',
      color: meta.color, background: meta.bg,
      border: `1px solid ${meta.color}22`,
    }}>
      {meta.label}
    </span>
  );
}

// ── Difficulty Badge ──────────────────────────────────────────────────────────

const DIFF_META: Record<Difficulty, { color: string; bg: string }> = {
  EASY:   { color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
  MEDIUM: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  HARD:   { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)'   },
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const meta = DIFF_META[difficulty];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '999px',
      fontSize: '12px', fontWeight: 600,
      color: meta.color, background: meta.bg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color }} />
      {difficulty}
    </span>
  );
}

// ── Outcome Badge ─────────────────────────────────────────────────────────────

const OUTCOME_META: Record<string, { label: string; color: string }> = {
  OFFER:    { label: '✓ Offer',   color: '#10b981' },
  REJECTED: { label: '✗ Rejected', color: '#f43f5e' },
  GHOSTED:  { label: '⊘ Ghosted', color: '#9898b8' },
  PENDING:  { label: '⌛ Pending', color: '#f59e0b' },
};

export function OutcomeBadge({ outcome }: { outcome?: Outcome }) {
  if (!outcome) return null;
  const meta = OUTCOME_META[outcome] ?? { label: outcome, color: '#9898b8' };
  return (
    <span style={{
      fontSize: '12px', fontWeight: 600,
      color: meta.color,
      fontFamily: 'var(--font-mono)',
    }}>
      {meta.label}
    </span>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size, height: size,
      border: `2px solid var(--border-subtle)`,
      borderTopColor: 'var(--indigo)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

export function EmptyState({ icon = '◈', title, body }: { icon?: string; title: string; body?: string }) {
  return (
    <div style={{
      textAlign: 'center', padding: '64px 24px',
      color: 'var(--text-muted)',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-secondary)', marginBottom: 8 }}>
        {title}
      </h3>
      {body && <p style={{ fontSize: 14, maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>{body}</p>}
    </div>
  );
}

// ── Inject keyframe globally ──────────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);
