// src/components/Navbar.tsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, BookOpen, PlusCircle, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>◈</span>
          <span className={styles.logoText}>
            Interview<span className={styles.logoAccent}>Bank</span>
          </span>
        </Link>

        {/* Desktop search */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search companies, roles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <kbd className={styles.searchKbd}>⏎</kbd>
        </form>

        {/* Desktop nav links */}
        <div className={styles.links}>
          <Link
            to="/"
            className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}
          >
            <BookOpen size={15} />
            Explore
          </Link>
          <Link to="/submit" className={styles.submitBtn}>
            <PlusCircle size={15} />
            Share Experience
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <Search size={15} />
            <input
              type="text"
              placeholder="Search companies…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>
          <Link to="/" onClick={() => setMenuOpen(false)} className={styles.mobileLink}>Explore</Link>
          <Link to="/submit" onClick={() => setMenuOpen(false)} className={styles.mobileLink}>Share Experience</Link>
        </div>
      )}
    </header>
  );
}
