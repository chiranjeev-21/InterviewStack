// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import HomePage from '@/pages/HomePage';
import CompanyPage from '@/pages/CompanyPage';
import ExperiencePage from '@/pages/ExperiencePage';
import SubmitPage from '@/pages/SubmitPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"                         element={<HomePage />} />
          <Route path="/companies/:slug"          element={<CompanyPage />} />
          <Route path="/experiences/:id"          element={<ExperiencePage />} />
          <Route path="/submit"                   element={<SubmitPage />} />
          <Route path="*"                         element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--text-muted)',
        fontSize: '13px',
        fontFamily: 'var(--font-mono)',
      }}>
        <span>© {new Date().getFullYear()} Interview Memory Bank</span>
        <span style={{ color: 'var(--text-disabled)' }}>
          community-powered · ml-predicted · verified-only submissions
        </span>
      </footer>
    </div>
  );
}
