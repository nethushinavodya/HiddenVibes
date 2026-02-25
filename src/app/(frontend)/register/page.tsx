import Link from 'next/link'
import RegisterForm from '@/components/auth/RegisterForm'

const RegisterPage = () => {
  return (
    <div className="hv-auth-page">
      {/* ── Left panel — branding ── */}
      <div className="hv-auth-panel hv-auth-panel--left hv-auth-panel--signup">
        <div className="hv-auth-panel-overlay" aria-hidden="true" />
        <div className="hv-auth-panel-content">
          <Link href="/" className="hv-logo">
            <span className="hv-logo-icon">
              <span className="hv-logo-emoji">🌿</span>
            </span>
            <span className="hv-logo-text">
              Hidden<span>Vibes</span>
            </span>
          </Link>
          <div className="hv-auth-panel-body">
            <h2 className="hv-auth-panel-title">
              Join the community of
              <br />
              <em>hidden explorers</em>
            </h2>
            <p className="hv-auth-panel-sub">
              Discover and share Sri Lanka&apos;s most breathtaking hidden gems — from secret
              waterfalls to forgotten temples tucked deep in the jungle.
            </p>
            <div className="hv-auth-panel-stats">
              <div className="hv-auth-panel-stat">
                <span className="hv-auth-panel-stat-val">500+</span>
                <span className="hv-auth-panel-stat-label">Hidden Places</span>
              </div>
              <div className="hv-auth-panel-stat">
                <span className="hv-auth-panel-stat-val">25</span>
                <span className="hv-auth-panel-stat-label">Districts</span>
              </div>
              <div className="hv-auth-panel-stat">
                <span className="hv-auth-panel-stat-val">10K+</span>
                <span className="hv-auth-panel-stat-label">Members</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="hv-auth-panel hv-auth-panel--right">
        <div className="hv-auth-form-wrap">
          <Link href="/" className="hv-auth-back">
            <span className="hv-auth-back-arrow">←</span>
            Back to Home
          </Link>
          <div className="hv-auth-form-header">
            <h1 className="hv-auth-title">Create your account</h1>
            <p className="hv-auth-subtitle">Start exploring Sri Lanka&apos;s hidden beauty</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
