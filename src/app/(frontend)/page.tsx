import React from 'react'
import Link from 'next/link'

const SRI_LANKA_DISTRICTS = [
  'Colombo',
  'Kandy',
  'Galle',
  'Matara',
  'Nuwara Eliya',
  'Ella',
  'Trincomalee',
  'Jaffna',
  'Anuradhapura',
  'Polonnaruwa',
  'Sigiriya',
  'Batticaloa',
  'Hambantota',
  'Ratnapura',
  'Badulla',
  'Kalutara',
  'Ampara',
  'Kurunegala',
]

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Discover Hidden Gems',
    desc: 'Explore secret waterfalls, untouched beaches, ancient ruins, and mystical forests that most tourists never find.',
    color: '#d8f3dc',
  },
  {
    icon: '📸',
    title: 'Share Your Finds',
    desc: 'Submit your own discoveries with photos and descriptions. Help others experience the real, unfiltered Sri Lanka.',
    color: '#fff3e0',
  },
  {
    icon: '🌿',
    title: 'Community Curated',
    desc: 'Every submission is reviewed by our team to ensure quality and authenticity. Only the best hidden spots make the cut.',
    color: '#e8f5e9',
  },
  {
    icon: '📍',
    title: 'District Filtering',
    desc: 'Browse places by all 25 Sri Lankan districts. Find hidden spots near you or plan your next adventure.',
    color: '#e3f2fd',
  },
]

const STEPS = [
  {
    num: '01',
    icon: '👤',
    title: 'Create Account',
    desc: 'Sign up for free and join our growing community of Sri Lankan explorers in seconds.',
  },
  {
    num: '02',
    icon: '📝',
    title: 'Submit a Place',
    desc: 'Share a hidden spot with title, description, photos, and your district. Every detail matters.',
  },
  {
    num: '03',
    icon: '✅',
    title: 'Get Approved & Shine',
    desc: 'Our admins review your submission. Once approved, your discovery is live for the world to explore.',
  },
]

const CATEGORIES = [
  { icon: '💧', label: 'Waterfalls' },
  { icon: '🏖️', label: 'Secret Beaches' },
  { icon: '🏛️', label: 'Ancient Ruins' },
  { icon: '🌲', label: 'Forest Trails' },
  { icon: '🦜', label: 'Wildlife Spots' },
  { icon: '🏔️', label: 'Hilltops' },
  { icon: '🌊', label: 'Lagoons' },
  { icon: '🕌', label: 'Sacred Sites' },
]

export default function HomePage() {
  return (
    <div className="hv-root">
      {/* ── NAVBAR ── */}
      <nav className="hv-nav">
        <div className="hv-nav-container">
          <Link href="/" className="hv-logo">
            <span className="hv-logo-leaf">🌿</span>
            <span className="hv-logo-text">
              Hidden<span>Vibes</span>
            </span>
          </Link>

          <div className="hv-nav-links">
            <a href="#explore" className="hv-nav-link">
              Explore
            </a>
            <a href="#how-it-works" className="hv-nav-link">
              How It Works
            </a>
            <a href="#districts" className="hv-nav-link">
              Districts
            </a>
          </div>

          <div className="hv-nav-actions">
            <Link href="/login" className="hv-btn-ghost">
              Login
            </Link>
            <Link href="/register" className="hv-btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hv-hero">
        {/* decorative blobs */}
        <div className="hv-blob hv-blob-1" />
        <div className="hv-blob hv-blob-2" />
        <div className="hv-blob hv-blob-3" />

        {/* Floating leaf particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className={`hv-leaf hv-leaf-${i + 1}`}>
            🍃
          </span>
        ))}

        <div className="hv-hero-content">
          <div className="hv-hero-badge">
            <span>🇱🇰</span>
            <span>Sri Lanka Exclusive</span>
          </div>

          <h1 className="hv-hero-title">
            Discover the
            <br />
            <em className="hv-hero-em">Hidden Side</em>
            <br />
            of Sri Lanka
          </h1>

          <p className="hv-hero-desc">
            A community-driven platform where adventurers share secret waterfalls, untouched
            beaches, ancient trails, and mystical landscapes hidden in plain sight — places the
            guidebooks forgot.
          </p>

          <div className="hv-hero-actions">
            <Link href="/explore" className="hv-btn-hero-primary">
              Start Exploring
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/submit" className="hv-btn-hero-outline">
              <span>📸</span> Share a Place
            </Link>
          </div>

          {/* Trust bar */}
          <div className="hv-hero-trust">
            <span className="hv-trust-dot" />
            <span>500+ hidden places</span>
            <span className="hv-trust-sep">·</span>
            <span>25 districts covered</span>
            <span className="hv-trust-sep">·</span>
            <span>2,000+ explorers</span>
          </div>
        </div>

        {/* Hero illustration — nature SVG wave */}
        <div className="hv-hero-wave">
          <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path
              d="M0,60 C240,110 480,10 720,60 C960,110 1200,10 1440,60 L1440,120 L0,120 Z"
              fill="#f0faf4"
            />
          </svg>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="hv-stats" id="explore">
        <div className="hv-stats-inner">
          <div className="hv-stat">
            <span className="hv-stat-num">500+</span>
            <span className="hv-stat-label">Hidden Places</span>
          </div>
          <div className="hv-stat-sep" />
          <div className="hv-stat">
            <span className="hv-stat-num">25</span>
            <span className="hv-stat-label">Districts Covered</span>
          </div>
          <div className="hv-stat-sep" />
          <div className="hv-stat">
            <span className="hv-stat-num">2K+</span>
            <span className="hv-stat-label">Active Explorers</span>
          </div>
          <div className="hv-stat-sep" />
          <div className="hv-stat">
            <span className="hv-stat-num">100%</span>
            <span className="hv-stat-label">Sri Lanka Only</span>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="hv-categories">
        <div className="hv-categories-inner">
          {CATEGORIES.map((c) => (
            <Link href={`/explore?category=${c.label}`} key={c.label} className="hv-category-pill">
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="hv-features">
        <div className="hv-section-wrap">
          <div className="hv-section-header">
            <span className="hv-tag">Why HiddenVibes?</span>
            <h2 className="hv-section-title">More Than Just Travel</h2>
            <p className="hv-section-sub">
              We connect adventurers with Sri Lanka&apos;s best-kept secrets — places that never
              make it into tourist brochures.
            </p>
          </div>

          <div className="hv-features-grid">
            {FEATURES.map((f) => (
              <div
                className="hv-feature-card"
                key={f.title}
                style={{ '--card-bg': f.color } as React.CSSProperties}
              >
                <div className="hv-feature-icon-wrap">
                  <span className="hv-feature-icon">{f.icon}</span>
                </div>
                <h3 className="hv-feature-title">{f.title}</h3>
                <p className="hv-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="hv-how" id="how-it-works">
        <div className="hv-how-bg-pattern" />
        <div className="hv-section-wrap">
          <div className="hv-section-header">
            <span className="hv-tag hv-tag-light">Simple & Easy</span>
            <h2 className="hv-section-title hv-title-light">How It Works</h2>
            <p className="hv-section-sub hv-sub-light">
              From sign-up to discovery in three simple steps.
            </p>
          </div>

          <div className="hv-steps">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="hv-step">
                  <div className="hv-step-circle">
                    <span className="hv-step-icon">{s.icon}</span>
                  </div>
                  <div className="hv-step-line-top" />
                  <span className="hv-step-num-badge">{s.num}</span>
                  <h3 className="hv-step-title">{s.title}</h3>
                  <p className="hv-step-desc">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hv-step-connector">
                    <svg viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M0 12 Q15 2 30 12 Q45 22 60 12"
                        stroke="rgba(82,183,136,0.5)"
                        strokeWidth="2"
                        strokeDasharray="6 3"
                        fill="none"
                      />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── DISTRICTS ── */}
      <section className="hv-districts" id="districts">
        <div className="hv-section-wrap">
          <div className="hv-section-header">
            <span className="hv-tag">Browse By Location</span>
            <h2 className="hv-section-title">Explore All Districts</h2>
            <p className="hv-section-sub">
              From misty highlands to golden coastlines — every corner of Sri Lanka has a secret
              waiting for you.
            </p>
          </div>

          <div className="hv-districts-grid">
            {SRI_LANKA_DISTRICTS.map((d) => (
              <Link href={`/explore?district=${d}`} key={d} className="hv-district-card">
                <span className="hv-district-pin">📍</span>
                <span className="hv-district-name">{d}</span>
                <span className="hv-district-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="hv-cta">
        <div className="hv-cta-blob-1" />
        <div className="hv-cta-blob-2" />
        <div className="hv-cta-inner">
          <span className="hv-cta-emoji">🌴</span>
          <h2 className="hv-cta-title">Ready to Uncover Hidden Sri Lanka?</h2>
          <p className="hv-cta-desc">
            Join thousands of explorers discovering places you won&apos;t find anywhere else.
            It&apos;s free.
          </p>
          <div className="hv-cta-actions">
            <Link href="/register" className="hv-btn-cta-primary">
              Create Free Account
            </Link>
            <Link href="/explore" className="hv-btn-cta-outline">
              Browse Places
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="hv-footer">
        <div className="hv-footer-inner">
          <div className="hv-footer-brand">
            <div className="hv-logo">
              <span className="hv-logo-leaf">🌿</span>
              <span className="hv-logo-text">
                Hidden<span>Vibes</span>
              </span>
            </div>
            <p className="hv-footer-tagline">
              Discovering Sri Lanka&apos;s best-kept secrets,
              <br />
              one hidden place at a time.
            </p>
            <div className="hv-footer-badge">🇱🇰 Made for Sri Lanka</div>
          </div>

          <div className="hv-footer-cols">
            <div className="hv-footer-col">
              <h4>Explore</h4>
              <Link href="/explore">All Places</Link>
              <Link href="/explore?district=Kandy">Kandy</Link>
              <Link href="/explore?district=Galle">Galle</Link>
              <Link href="/explore?district=Ella">Ella</Link>
              <Link href="/explore?district=Nuwara+Eliya">Nuwara Eliya</Link>
            </div>
            <div className="hv-footer-col">
              <h4>Community</h4>
              <Link href="/submit">Submit a Place</Link>
              <Link href="/register">Register</Link>
              <Link href="/login">Login</Link>
              <Link href="/dashboard">My Dashboard</Link>
            </div>
            <div className="hv-footer-col">
              <h4>Platform</h4>
              <Link href="/admin">Admin Panel</Link>
              <Link href="#">About</Link>
              <Link href="#">Guidelines</Link>
            </div>
          </div>
        </div>

        <div className="hv-footer-bottom">
          <p>© 2025 HiddenVibes. Crafted with ❤️ for Sri Lanka&apos;s explorers.</p>
        </div>
      </footer>
    </div>
  )
}
