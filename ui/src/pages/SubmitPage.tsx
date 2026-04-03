// src/pages/SubmitPage.tsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getCompanies, submitExperience } from '@/services/api';
import type { CreateExperiencePayload, QuestionCategory, Difficulty, Outcome } from '@/types/api';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, ShieldCheck, ChevronRight, ChevronLeft, ExternalLink, AlertCircle } from 'lucide-react';

const CATEGORIES: QuestionCategory[] = ['DSA', 'SYSTEM_DESIGN', 'LLD', 'BEHAVIORAL', 'DATABASE', 'OS_NETWORKING', 'LANGUAGE_SPECIFIC'];
const CAT_LABELS: Record<QuestionCategory, string> = {
  DSA: 'DSA', SYSTEM_DESIGN: 'System Design', LLD: 'LLD',
  BEHAVIORAL: 'Behavioral', DATABASE: 'Database',
  OS_NETWORKING: 'OS / Networking', LANGUAGE_SPECIFIC: 'Language Specific',
};

type Step = 'token' | 'details' | 'questions' | 'review';
const STEPS: Step[] = ['token', 'details', 'questions', 'review'];
const STEP_LABELS = ['Verify Token', 'Experience Details', 'Add Questions', 'Review & Submit'];
const tokenGeneratorUiUrl = (import.meta.env.VITE_TOKEN_GENERATOR_UI_URL ?? 'http://localhost:5174')
  .replace(/\/+$/, '');

interface QForm { text: string; category: QuestionCategory; topic: string; roundNumber: string; }

export default function SubmitPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>('token');

  // Form state
  const [token, setToken] = useState('');
  const [companySlug, setCompanySlug] = useState(searchParams.get('company') ?? '');
  const [companyInput, setCompanyInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [outcome, setOutcome] = useState<Outcome | ''>('');
  const [rounds, setRounds] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QForm[]>([
    { text: '', category: 'DSA', topic: '', roundNumber: '' }
  ]);

  const { data: companies } = useQuery({
    queryKey: ['companies', ''],
    queryFn: () => getCompanies('', 0, 100),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: { data: CreateExperiencePayload; token: string }) =>
      submitExperience(payload.data, payload.token),
    onSuccess: (data) => {
      toast.success('Experience submitted! Thank you for contributing.');
      navigate(`/experiences/${data.id}`);
    },
    onError: (err: any) => {
      const fieldErrors = err?.response?.data?.fieldErrors as Record<string, string> | undefined;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        const msg = Object.values(fieldErrors)[0];
        toast.error(msg);
        return;
      }
      const msg = err?.response?.data?.detail ?? 'Submission failed. Please check your input and try again.';
      toast.error(msg);
    },
  });

  // ── Step navigation ──────────────────────────────────────────────────────

  const goNext = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const goPrev = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  // ── Question helpers ─────────────────────────────────────────────────────

  const addQuestion = () =>
    setQuestions(qs => [...qs, { text: '', category: 'DSA', topic: '', roundNumber: '' }]);

  const removeQuestion = (i: number) =>
    setQuestions(qs => qs.filter((_, j) => j !== i));

  const updateQuestion = (i: number, field: keyof QForm, value: string) =>
    setQuestions(qs => qs.map((q, j) => j === i ? { ...q, [field]: value } : q));

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!companySlug) { toast.error('Please select a company from the suggestions'); return; }
    if (role.trim().length < 2) { toast.error('Role must be at least 2 characters'); return; }

    const validQuestions = questions.filter(q => q.text.trim());
    if (validQuestions.length === 0) { toast.error('Add at least one question'); return; }

    const tooShortQuestion = validQuestions.find(q => q.text.trim().length < 5);
    if (tooShortQuestion) {
      toast.error('Each question must be at least 5 characters long');
      return;
    }

    const payload: CreateExperiencePayload = {
      companySlug,
      role,
      level: level || undefined,
      year: parseInt(year),
      month: month ? parseInt(month) : undefined,
      difficulty,
      outcome: outcome as Outcome || undefined,
      rounds: rounds ? parseInt(rounds) : undefined,
      description: description || undefined,
      questions: validQuestions
        .map(q => ({
          text: q.text.trim(),
          category: q.category,
          topic: q.topic || undefined,
          roundNumber: q.roundNumber ? parseInt(q.roundNumber) : undefined,
        })),
    };
    submitMutation.mutate({ data: payload, token });
  };

  // ── Company autocomplete helpers ─────────────────────────────────────────

  const filteredCompanies = (companies?.content ?? []).filter(c =>
    c.name.toLowerCase().includes(companyInput.toLowerCase())
  );

  const stepIdx = STEPS.indexOf(step);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* Page title */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>
          Share Your Experience
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Help the community prepare smarter. Your submission is verified and anonymous.
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 40 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 32, height: 32,
                borderRadius: '50%',
                background: i <= stepIdx ? 'var(--indigo)' : 'var(--bg-elevated)',
                border: `2px solid ${i <= stepIdx ? 'var(--indigo)' : 'var(--border-subtle)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: i <= stepIdx ? '#fff' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)', flexShrink: 0,
              }}>
                {i < stepIdx ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: 11, fontFamily: 'var(--font-mono)',
                color: i === stepIdx ? 'var(--indigo-light)' : 'var(--text-muted)',
                textAlign: 'center', whiteSpace: 'nowrap',
              }}>
                {STEP_LABELS[i]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 1, marginBottom: 22,
                background: i < stepIdx ? 'var(--indigo)' : 'var(--border-subtle)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1: Token ──────────────────────────────────────── */}
      {step === 'token' && (
        <div>
          <div style={{
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: 28,
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <ShieldCheck size={18} color="var(--indigo-light)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                To ensure data quality, only verified contributors can submit experiences.
                Get your free one-time token from our{' '}
                <a
                  href={`${tokenGeneratorUiUrl}/?app=interview-bank`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--indigo-light)', display: 'inline-flex', alignItems: 'center', gap: 3, textDecoration: 'underline' }}
                >
                  Token Generator <ExternalLink size={12} />
                </a>
                {' '}and paste it below.
              </p>
            </div>
          </div>

          <label style={labelStyle}>Contributor Token</label>
          <textarea
            value={token}
            onChange={e => setToken(e.target.value)}
            rows={4}
            placeholder="Paste your JWT contributor token here…"
            style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: 12, resize: 'vertical' }}
          />

          {token.trim().length > 20 && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--emerald)' }}>
              <ShieldCheck size={13} /> Token looks valid. It will be verified on submission.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
            <button
              onClick={() => {
                if (token.trim().length > 20) goNext();
                else toast.error('Please paste a valid token');
              }}
              style={primaryBtn}
            >
              Continue <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Details ────────────────────────────────────── */}
      {step === 'details' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Company autocomplete */}
            <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
              <label style={labelStyle}>Company *</label>
              <input
                type="text"
                value={companyInput}
                onChange={e => {
                  setCompanyInput(e.target.value);
                  setCompanySlug('');
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Type a company name e.g. Google, Razorpay, Swiggy…"
                style={{
                  ...inputStyle,
                  borderColor: companySlug ? 'var(--emerald)' : 'var(--border-subtle)',
                }}
              />

              {/* Selected indicator */}
              {companySlug && (
                <div style={{
                  marginTop: -12, marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12, color: 'var(--emerald)',
                }}>
                  ✓ Company selected
                </div>
              )}

              {/* Suggestions dropdown */}
              {showSuggestions && companyInput.length > 0 && (
                <div style={{
                  position: 'absolute', top: 'calc(100% - 14px)', left: 0, right: 0, zIndex: 50,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  maxHeight: 240, overflowY: 'auto',
                }}>
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.slice(0, 8).map(c => (
                      <div
                        key={c.slug}
                        onMouseDown={() => {
                          setCompanyInput(c.name);
                          setCompanySlug(c.slug);
                          setShowSuggestions(false);
                        }}
                        style={{
                          padding: '10px 14px', cursor: 'pointer', fontSize: 14,
                          color: 'var(--text-primary)',
                          display: 'flex', alignItems: 'center', gap: 10,
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        {c.logoUrl && (
                          <img
                            src={c.logoUrl} alt={c.name}
                            style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'contain', background: '#fff', padding: 2 }}
                            onError={(e: any) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <span style={{ fontWeight: 500 }}>{c.name}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {c.industry}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                      No match found. The company may not be in the database yet.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Role / Position *</label>
              <input type="text" value={role} onChange={e => setRole(e.target.value)}
                placeholder="e.g. Software Engineer II" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Level</label>
              <input type="text" value={level} onChange={e => setLevel(e.target.value)}
                placeholder="SDE-1, L4, E4…" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Year *</label>
              <input type="number" value={year} onChange={e => setYear(e.target.value)}
                min="2010" max="2099" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Month</label>
              <select value={month} onChange={e => setMonth(e.target.value)} style={inputStyle}>
                <option value="">— Optional —</option>
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                  <option key={m} value={String(i + 1)}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Rounds</label>
              <input type="number" value={rounds} onChange={e => setRounds(e.target.value)}
                min="1" max="20" placeholder="e.g. 4" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)} style={inputStyle}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Outcome</label>
              <select value={outcome} onChange={e => setOutcome(e.target.value as Outcome)} style={inputStyle}>
                <option value="">— Optional —</option>
                <option value="OFFER">Got Offer</option>
                <option value="REJECTED">Rejected</option>
                <option value="GHOSTED">Ghosted</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Overall Experience (optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the overall interview process, tips, culture, timeline…"
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>

          <NavButtons onBack={goPrev} onNext={() => {
            if (!companySlug) { toast.error('Please select a company from the suggestions'); return; }
            if (role.trim().length < 2) { toast.error('Role must be at least 2 characters'); return; }
            if (!year) { toast.error('Year is required'); return; }
            goNext();
          }} />
        </div>
      )}

      {/* ── Step 3: Questions ──────────────────────────────────── */}
      {step === 'questions' && (
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            Add the questions you were asked. Category is auto-detected but you can override it.
          </p>

          {questions.map((q, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', padding: '20px',
              marginBottom: 16, position: 'relative',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--indigo-light)', fontWeight: 600 }}>
                  Q{i + 1}
                </span>
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(i)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 4, borderRadius: 6, transition: 'color 0.15s',
                  }}
                    onMouseEnter={e2 => (e2.currentTarget).style.color = 'var(--rose)'}
                    onMouseLeave={e2 => (e2.currentTarget).style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <textarea
                value={q.text}
                onChange={e => updateQuestion(i, 'text', e.target.value)}
                rows={2}
                placeholder="What was the question asked?"
                style={{ ...inputStyle, resize: 'vertical', marginBottom: 12 }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 12 }}>
                <div>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Category</label>
                  <select value={q.category} onChange={e => updateQuestion(i, 'category', e.target.value)} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Topic</label>
                  <input type="text" value={q.topic} onChange={e => updateQuestion(i, 'topic', e.target.value)}
                    placeholder="e.g. Dynamic Programming" style={inputStyle} />
                </div>
                <div>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Round</label>
                  <input type="number" value={q.roundNumber} onChange={e => updateQuestion(i, 'roundNumber', e.target.value)}
                    min="1" max="20" placeholder="#" style={inputStyle} />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addQuestion}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: '1px dashed var(--border-muted)',
              borderRadius: 'var(--radius-md)', padding: '12px 20px', width: '100%',
              color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer',
              transition: 'all 0.15s', justifyContent: 'center',
            }}
            onMouseEnter={e2 => { (e2.currentTarget).style.color = 'var(--text-primary)'; (e2.currentTarget).style.borderColor = 'var(--indigo)'; }}
            onMouseLeave={e2 => { (e2.currentTarget).style.color = 'var(--text-muted)'; (e2.currentTarget).style.borderColor = 'var(--border-muted)'; }}
          >
            <Plus size={16} /> Add another question
          </button>

          <NavButtons onBack={goPrev} onNext={() => {
            const validQuestions = questions.filter(q => q.text.trim());
            if (validQuestions.length === 0) { toast.error('Add at least one question'); return; }
            if (validQuestions.some(q => q.text.trim().length < 5)) {
              toast.error('Each question must be at least 5 characters long');
              return;
            }
            goNext();
          }} />
        </div>
      )}

      {/* ── Step 4: Review ─────────────────────────────────────── */}
      {step === 'review' && (
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Review Submission</h3>
            <Row label="Company" value={companyInput} />
            <Row label="Role" value={`${role}${level ? ` (${level})` : ''}`} />
            <Row label="Period" value={`${year}${month ? `/${month.padStart(2, '0')}` : ''}`} />
            <Row label="Difficulty" value={difficulty} />
            {outcome && <Row label="Outcome" value={outcome} />}
            {rounds && <Row label="Rounds" value={`${rounds} rounds`} />}
            <Row label="Questions" value={`${questions.filter(q => q.text.trim()).length} questions`} />
          </div>

          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 28,
          }}>
            <AlertCircle size={16} color="var(--amber)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your token will be consumed on submission. Each token allows exactly <strong>one</strong> submission.
              Your email will be displayed as <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald)' }}>j***@domain.com</code>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
            <button onClick={goPrev} style={secondaryBtn}>
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              style={{ ...primaryBtn, opacity: submitMutation.isPending ? 0.7 : 1 }}
            >
              {submitMutation.isPending ? 'Submitting…' : 'Submit Experience →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function NavButtons({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
      <button onClick={onBack} style={secondaryBtn}><ChevronLeft size={16} /> Back</button>
      <button onClick={onNext} style={primaryBtn}>Continue <ChevronRight size={16} /></button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12,
  color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
  marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase',
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  padding: '10px 14px',
  color: 'var(--text-primary)', fontSize: 14,
  fontFamily: 'var(--font-body)', outline: 'none',
  transition: 'border-color 0.15s',
  marginBottom: 16,
};

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'var(--indigo)', borderRadius: 'var(--radius-md)',
  padding: '11px 22px', color: '#fff',
  fontSize: 15, fontWeight: 600, cursor: 'pointer',
  border: 'none', transition: 'background 0.15s',
};

const secondaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  padding: '11px 22px', color: 'var(--text-secondary)',
  fontSize: 15, fontWeight: 500, cursor: 'pointer',
  transition: 'border-color 0.15s',
};
