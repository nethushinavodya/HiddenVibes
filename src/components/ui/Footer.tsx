import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="hv-footer">
      <div className="hv-footer-inner">
        {/* Brand */}
        <div>
          <Link href="/" className="hv-logo">
            <span className="hv-logo-icon">
              <span className="hv-logo-emoji">🌿</span>
            </span>
            <span className="hv-logo-text">
              Hidden<span>Vibes</span>
            </span>
          </Link>
          <p className="hv-footer-tagline">
            Discover Sri Lanka's best-kept secrets — hidden waterfalls, forgotten temples, and
            untouched beaches waiting for the curious traveller.
          </p>
          <span className="hv-footer-badge">🇱🇰 Made for Sri Lanka</span>
        </div>

        {/* Link columns */}
        <div className="hv-footer-cols">
          <div className="hv-footer-col">
            <h4>Explore</h4>
            <Link href="/explore">All Places</Link>
            <Link href="/explore?category=waterfalls">Waterfalls</Link>
            <Link href="/explore?category=beaches">Beaches</Link>
            <Link href="/explore?category=forests">Forests</Link>
            <Link href="/explore?category=temples">Temples</Link>
          </div>

          <div className="hv-footer-col">
            <h4>Community</h4>
            <Link href="/submit">Submit a Place</Link>
            <Link href="/register">Join Us</Link>
            <Link href="/login">Sign In</Link>
            <Link href="/guidelines">Guidelines</Link>
          </div>

          <div className="hv-footer-col">
            <h4>Company</h4>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
          </div>
        </div>
      </div>

      <div className="hv-footer-bottom">
        <p>© {new Date().getFullYear()} HiddenVibes · Built with 🌿 for Sri Lanka</p>
      </div>
    </footer>
  )
}
