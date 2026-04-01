// src/pages/CompanyPage.tsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCompany, getExperiences } from '@/services/api';
import { Spinner, EmptyState } from '@/components/ui';
import ExperienceCard from '@/components/ExperienceCard';
import PredictionPanel from '@/components/PredictionPanel';
import { ChevronLeft, ExternalLink, Filter } from 'lucide-react';

export default function CompanyPage() {
  const { slug } = useParams<{ slug: string }>();
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);

  const { data: company, isLoading: loadingCompany } = useQuery({
    queryKey: ['company', slug],
    queryFn: () => getCompany(slug!),
    enabled: !!slug,
  });

  const { data: experiences, isLoading: loadingExp } = useQuery({
    queryKey: ['experiences', slug, roleFilter, page],
    queryFn: () => getExperiences(slug!, roleFilter || undefined, page, 10),
    enabled: !!slug,
    keepPreviousData: true,
  } as any);

  if (loadingCompany) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
      <Spinner size={36} />
    </div>
  );

  if (!company) return (
    <EmptyState icon="🏢" title="Company not found" body="This company doesn't exist in our database." />
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 80px' }}>

      {/* Breadcrumb */}
      <div style={{ padding: '24px 0 0' }}>
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--text-muted)', fontSize: 14,
          transition: 'color 0.15s',
        }}
          onMouseEnter={e2 => (e2.currentTarget).style.color = 'var(--text-primary)'}
          onMouseLeave={e2 => (e2.currentTarget).style.color = 'var(--text-muted)'}
        >
          <ChevronLeft size={16} /> Back to companies
        </Link>
      </div>

      {/* Company header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 24,
        padding: '32px 0 40px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: 40,
      }}>
        {company.logoUrl ? (
          <img
            src={company.logoUrl}
            alt={company.name}
            style={{
              width: 72, height: 72, borderRadius: 16,
              objectFit: 'contain', background: '#fff',
              padding: 6, flexShrink: 0,
              boxShadow: 'var(--shadow-card)',
            }}
            onError={(e2: any) => { e2.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{
            width: 72, height: 72, borderRadius: 16,
            background: 'var(--bg-card)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, color: 'var(--indigo-light)',
            fontFamily: 'var(--font-display)', fontWeight: 800,
            flexShrink: 0,
          }}>
            {company.name[0]}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-1px' }}>
              {company.name}
            </h1>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, marginTop: 4 }}>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 8, flexWrap: 'wrap' }}>
            {company.industry && (
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {company.industry}
              </span>
            )}
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {company.totalExperiences} experience{company.totalExperiences !== 1 ? 's' : ''} shared
            </span>
          </div>
        </div>

        {/* Share experience CTA */}
        <Link to={`/submit?company=${slug}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--indigo)', borderRadius: 'var(--radius-md)',
          padding: '10px 18px', color: '#fff',
          fontSize: 14, fontWeight: 600,
          transition: 'background 0.15s',
          flexShrink: 0,
        }}
          onMouseEnter={e2 => (e2.currentTarget).style.background = 'var(--indigo-light)'}
          onMouseLeave={e2 => (e2.currentTarget).style.background = 'var(--indigo)'}
        >
          + Share Experience
        </Link>
      </div>

      {/* Main 2-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>

        {/* Left: experiences list */}
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, alignItems: 'center' }}>
            <Filter size={16} color="var(--text-muted)" />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => { setRoleFilter(''); setPage(0); }}
                style={filterBtnStyle(roleFilter === '')}
              >
                All Roles
              </button>
              {company.availableRoles.slice(0, 8).map(r => (
                <button
                  key={r}
                  onClick={() => { setRoleFilter(r); setPage(0); }}
                  style={filterBtnStyle(roleFilter === r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Experience cards */}
          {loadingExp ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
          ) : (experiences as any)?.content?.length === 0 ? (
            <EmptyState icon="📝" title="No experiences yet" body="Be the first to share your interview experience for this role." />
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(experiences as any)?.content?.map((exp: any) => (
                  <ExperienceCard key={exp.id} experience={exp} />
                ))}
              </div>

              {/* Pagination */}
              {(experiences as any)?.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    style={paginationBtnStyle(page === 0)}
                  >
                    ← Prev
                  </button>
                  <span style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-mono)' }}>
                    {page + 1} / {(experiences as any)?.totalPages}
                  </span>
                  <button
                    disabled={(experiences as any)?.last}
                    onClick={() => setPage(p => p + 1)}
                    style={paginationBtnStyle(!!(experiences as any)?.last)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: prediction panel */}
        <div style={{ position: 'sticky', top: 80 }}>
          <PredictionPanel
            companySlug={slug!}
            availableRoles={company.availableRoles}
          />
        </div>
      </div>
    </div>
  );
}

function filterBtnStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? 'rgba(99,102,241,0.15)' : 'var(--bg-elevated)',
    border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'var(--border-subtle)'}`,
    borderRadius: 'var(--radius-md)',
    padding: '6px 14px',
    fontSize: 13, fontWeight: 500,
    color: active ? 'var(--indigo-light)' : 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  };
}

function paginationBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '8px 16px',
    fontSize: 14, color: disabled ? 'var(--text-disabled)' : 'var(--text-secondary)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };
}
