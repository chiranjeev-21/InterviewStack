// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '40px 24px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 80, color: 'var(--indigo)', opacity: 0.3, lineHeight: 1, marginBottom: 20 }}>404</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Page not found</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32, textAlign: 'center' }}>The page you're looking for doesn't exist or was moved.</p>
      <Link to="/" style={{
        background: 'var(--indigo)', borderRadius: 'var(--radius-md)',
        padding: '10px 22px', color: '#fff', fontWeight: 600, fontSize: 15,
      }}>
        Go Home
      </Link>
    </div>
  );
}
