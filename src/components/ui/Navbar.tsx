'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await logout()
    setDropdownOpen(false)
    router.push('/')
  }

  const navLink = (href: string, label: string) => (
    <Link href={href} className={`hv-nav-link${pathname === href ? ' hv-nav-link--active' : ''}`}>
      {label}
    </Link>
  )

  return (
    <nav className={`hv-nav${scrolled ? ' hv-nav--scrolled' : ''}`}>
      <div className="hv-nav-container">
        {/* ── Logo ── */}
        <Link href="/" className="hv-logo">
          <span className="hv-logo-icon">
            <span className="hv-logo-emoji">🌿</span>
          </span>
          <span className="hv-logo-text">
            Hidden<span>Vibes</span>
          </span>
        </Link>

        {/* ── Centered nav links ── */}
        <div className="hv-nav-links">
          {navLink('/', 'Home')}
          {navLink('/about', 'About')}
          {navLink('/explore', 'Explore Places')}
          {navLink('/add-place', '+ Add Place')}
        </div>

        {/* ── Right actions ── */}
        <div className="hv-nav-actions">
          {user ? (
            <div className="hv-nav-user" ref={dropdownRef}>
              <button
                className="hv-nav-user-btn"
                onClick={() => setDropdownOpen((o) => !o)}
                aria-label="User menu"
              >
                <span className="hv-nav-user-avatar">
                  {(user.firstName ?? user.email).charAt(0).toUpperCase()}
                </span>
                <span className="hv-nav-user-name">{user.firstName ?? user.email}</span>
                <svg
                  className={`hv-nav-user-chevron${dropdownOpen ? ' open' : ''}`}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="hv-nav-dropdown">
                  <Link
                    href="/profile"
                    className="hv-nav-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/my-submissions"
                    className="hv-nav-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Submissions
                  </Link>
                  <Link
                    href="/add-place"
                    className="hv-nav-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    + Add a Place
                  </Link>
                  <button
                    className="hv-nav-dropdown-item hv-nav-dropdown-item--danger"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="hv-btn-signin">
                Sign In
              </Link>
              <Link href="/register" className="hv-btn-register">
                Register
              </Link>
            </>
          )}
          <button className="hv-nav-hamburger" aria-label="Open menu">
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  )
}
