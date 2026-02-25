'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
        </div>

        {/* ── Right actions ── */}
        <div className="hv-nav-actions">
          <Link href="/login" className="hv-btn-signin">
            Sign In
          </Link>
          <Link href="/register" className="hv-btn-register">
            Register
          </Link>
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
