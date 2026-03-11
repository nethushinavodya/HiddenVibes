const AboutHero = () => {
  return (
    <section
      className="hv-about-hero"
      style={{ backgroundImage: "url('/images/about.jpg')" }}
    >
      <div className="hv-about-hero-overlay" aria-hidden="true" />
      <div className="hv-about-hero-inner">
        <div className="hv-about-hero-tag">🌿 Our Story</div>
        <h1 className="hv-about-hero-title">
          Unveiling Sri Lanka&apos;s
          <br />
          Best Kept Secrets
        </h1>
        <p className="hv-about-hero-sub">
          HiddenVibes was born from a simple idea — that the most magical places in Sri Lanka
          aren&apos;t in any guidebook. They&apos;re whispered about by locals, stumbled upon by the
          curious, and cherished by those who find them.
        </p>
      </div>
    </section>
  )
}

export default AboutHero
