'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?search_term=${encodeURIComponent(searchTerm)}`);
    }
  };

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('dark_mode', JSON.stringify(newTheme === 'dark'));
  };

  return (
    <nav className="mb-2 navbar navbar-expand-lg bg-body-tertiary d-print-none">
      <div className="container d-flex" style={{ flexWrap: 'nowrap' }}>
        <Link className="navbar-brand" href="/">
          Freetar
        </Link>
        <form className="d-flex w-50" onSubmit={handleSearch}>
          <input
            required
            className="form-control me-2"
            name="search_term"
            type="search"
            placeholder="Search for chords"
            aria-label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-outline-success d-none d-md-block" type="submit">
            🔎
          </button>
        </form>
        <ul className="navbar-nav ms-2" style={{ flexDirection: 'row' }}>
          <li className="nav-item">
            <Link className="nav-link" href="/about">
              <span className="d-none d-md-inline">About</span>
            </Link>
          </li>
          <li className="nav-item ms-4">
            <a className="nav-link">
              <span
                role="button"
                title="enable/disable dark mode"
                id="dark_mode"
                onClick={toggleDarkMode}
              >
                🌓︎
              </span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
