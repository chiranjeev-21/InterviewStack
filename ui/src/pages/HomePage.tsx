// src/pages/HomePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCompanies, getTrendingCompanies } from '@/services/api';
import { Spinner, EmptyState } from '@/components/ui';
import { TrendingUp, Search, Building2, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Sync query with URL — this is what was broken before.
  // useState only runs once on mount; useEffect keeps it in sync
  // when the Navbar updates the URL from any page.
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Keep local state in sync when URL changes (e.g. navbar search)
  useEffect(() => {
    const urlQuery = searchParams.get('q') ?? '';
    setQuery(urlQuery);
    setDebouncedQuery(urlQuery);
  }, [searchParams]);

  // Debounce local typing
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      // Also keep the URL in sync when typing in the hero search bar
      if (query.trim()) {
        setSearchParams({ q: query.trim() }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data: trending, isLoading: loadingTrending } = useQuery({
    queryKey: ['trending'],
    queryFn: getTrendingCompanies,
    staleTime: 5 * 60_000,
  });

  const { data: searchResults, isLoading: loadingSearch } = useQuery({
    queryKey: ['companies', debouncedQuery],
    queryFn: () => getCompanies(debouncedQuery, 0, 30),
    enabled: debouncedQuery.trim().length > 0,
  });

  const showSearch = debouncedQuery.trim().length > 0;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0 60px', textAlign: 'center', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px',
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 999, marginBottom: 28,
          fontSize: 12, fontFamily: 'var(--font-mono)',
          color: 'var(--indigo-light)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--indigo-light)', animation: 'pulse 2s infinite' }} />
          Community-powered · ML-predicted interview prep
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: '-2px',
          color: 'var(--text-primary)',
          marginBottom: 20,
        }}>
          Know what's coming<br />
          <span style={{
            background: 'linear-gradient(135deg, var(--indigo-light) 0%, var(--violet) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            before you walk in.
          </span>
        </h1>

        <p style={{
          fontSize: 18, color: 'var(--text-secondary)',
          maxWidth: 540, margin: '0 auto 40px',
          lineHeight: 1.7, fontWeight: 300,
        }}>
          Real interview questions from verified engineers.
          ML predictions on what to expect — by company, role, and round.
        </p>

        {/* Search bar */}
        <div style={{ maxWidth: 540, margin: '0 auto', position: 'relative' }}>
          <Search size={18} style={{
            position: 'absolute', left: 18, top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Amazon, Google, Razorpay, SDE-2…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-muted)',
              borderRadius: 'var(--radius-xl)',
              padding: '16px 20px 16px 50px',
              fontSize: 16,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              boxShadow: 'var(--shadow-card)',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--indigo)';
              e.target.style.boxShadow = 'var(--shadow-glow)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--border-muted)';
              e.target.style.boxShadow = 'var(--shadow-card)';
            }}
          />
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 40,
          marginTop: 48, flexWrap: 'wrap',
        }}>
          {[
            { n: '15+', label: 'Companies' },
            { n: '100%', label: 'Verified' },
            { n: 'ML', label: 'Predictions' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28, fontWeight: 800,
                color: 'var(--indigo-light)',
                lineHeight: 1,
              }}>{s.n}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Search Results ─────────────────────────────────────── */}
      {showSearch && (
        <section style={{ marginBottom: 60 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
            marginBottom: 20, color: 'var(--text-secondary)',
          }}>
            Results for "{debouncedQuery}"
          </h2>
          {loadingSearch
            ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
            : searchResults?.content.length === 0
            ? <EmptyState icon="🔍" title="No companies found" body="Try a different search term." />
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {searchResults?.content.map(c => (
                  <CompanyCard key={c.id} company={c} onClick={() => navigate(`/companies/${c.slug}`)} />
                ))}
              </div>
            )
          }
        </section>
      )}

      {/* ── Trending Companies ─────────────────────────────────── */}
      {!showSearch && (
        <section style={{ marginBottom: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <TrendingUp size={20} color="var(--indigo-light)" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>
              Most Active Companies
            </h2>
          </div>

          {loadingTrending ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {(trending ?? []).map(c => (
                <CompanyCard key={c.id} company={c} onClick={() => navigate(`/companies/${c.slug}`)} />
              ))}
            </div>
          )}

          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <button
              onClick={() => setQuery('a')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 20px',
                color: 'var(--text-secondary)',
                fontSize: 14, fontWeight: 500, cursor: 'pointer',
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--indigo)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-muted)';
              }}
            >
              <Building2 size={15} />
              Browse all companies
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function CompanyCard({ company: c, onClick }: { company: any; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
        display: 'flex', alignItems: 'center', gap: 14,
        width: '100%',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-glow)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
        (e.currentTarget as HTMLElement).style.transform = 'none';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {c.logoUrl ? (
        <img
          src={c.logoUrl} alt={c.name}
          style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'contain', background: '#fff', padding: 3 }}
          onError={(e: any) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'var(--bg-elevated)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, color: 'var(--text-muted)',
        }}>
          {c.name[0]}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
          {c.name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
          {c.industry ?? '—'}
        </div>
      </div>
      <ArrowRight size={16} color="var(--text-muted)" />
    </button>
  );
}